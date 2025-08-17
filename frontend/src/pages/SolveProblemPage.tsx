"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Play, Send, Sparkles, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout } from "@/components/Layout"
import ReactMarkdown from "react-markdown"

const BASE_URL = import.meta.env.VITE_BACKEND_URL
const COMPILER_URL = import.meta.env.VITE_COMPILER_URL

type TestCase = { input: string; expectedOutput: string }
type Problem = {
  _id: string
  title: string
  statement: string
  difficulty: string
  testCases?: TestCase[]
}

const languageTemplates = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  py: `# Your code here
print("Hello, Python!")`,
}

export const SolveProblemPage = () => {
  const { id } = useParams()
  const { toast } = useToast()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [language, setLanguage] = useState("cpp")
  const [code, setCode] = useState(languageTemplates.cpp)
  const [customInput, setCustomInput] = useState("")
  const [output, setOutput] = useState("")
  const [review, setReview] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/problems/${id}`)
        const data = await res.json()
        setProblem(data)
      } catch {
        toast({ title: "Problem not found", variant: "destructive" })
      }
    }
    fetchProblem()
  }, [id, toast])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(languageTemplates[lang as keyof typeof languageTemplates])
  }

  const handleRun = async () => {
    setRunning(true)
    setOutput("Running your code...")

    const inputToSend = customInput.trim() || problem?.testCases?.[0]?.input || ""

    try {
      const res = await fetch(`${COMPILER_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          input: inputToSend,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setOutput(data.output || "No output")
      } else {
        setOutput(`Error: ${data.output || data.stderr || "Runtime error"}`)
      }
    } catch {
      setOutput("Network error occurred")
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!problem?.testCases || problem.testCases.length === 0) {
      toast({ title: "No test cases found", variant: "destructive" })
      return
    }

    setSubmitting(true)
    let allPassed = true
    let failedCase = null

    for (const testCase of problem.testCases) {
      try {
        const res = await fetch(`${COMPILER_URL}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
          }),
        })

        const data = await res.json()

        if (!data.success || !data.isCorrect) {
          allPassed = false
          failedCase = {
            ...testCase,
            actual: data.actualOutput || "",
            error: data.error || data.stderr,
          }
          break
        }
      } catch {
        toast({ title: "Submission failed", variant: "destructive" })
        setSubmitting(false)
        return
      }
    }

    if (allPassed) {
      toast({ title: "Accepted!", description: "All test cases passed!" })
      setOutput("✅ All test cases passed! Solution accepted.")
    } else {
      toast({ title: "Wrong Answer", variant: "destructive" })
      if (failedCase?.error) {
        setOutput(`❌ Compilation/Runtime Error:\n${failedCase.error}`)
      } else if (failedCase) {
        setOutput(
          `❌ Wrong Answer\n\nInput:\n${failedCase.input}\n\nExpected Output:\n${failedCase.expectedOutput}\n\nYour Output:\n${failedCase.actual}`,
        )
      }
    }

    setSubmitting(false)
  }

  const handleAIReview = async () => {
    setReviewLoading(true)
    setReview("Generating AI review...")

    try {
      const res = await fetch(`${COMPILER_URL}/ai-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })

      const data = await res.json()
      if (data.success) {
        setReview(data.aiFeedback)
      } else {
        setReview("Failed to get AI review.")
      }
    } catch {
      setReview("AI review request failed.")
    } finally {
      setReviewLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!problem) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading problem...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const sampleTestCase = problem.testCases?.[0]

  return (
    <Layout showSidebar={false}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/problems" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Problems
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{problem.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(problem.difficulty)} variant="outline">
                  {problem.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{problem.statement}</p>
              </div>

              {sampleTestCase && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Sample Test Case</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Input:</h4>
                      <pre className="bg-background p-3 rounded border text-sm overflow-x-auto">
                        {sampleTestCase.input}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Expected Output:</h4>
                      <pre className="bg-background p-3 rounded border text-sm overflow-x-auto">
                        {sampleTestCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Solution
                </CardTitle>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="py">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                className="font-mono text-sm min-h-[300px] resize-none"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
              />

              <Textarea
                className="font-mono text-sm h-24 resize-none"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Custom input (optional)"
              />

              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleRun} disabled={running} variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  {running ? "Running..." : "Run"}
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
                <Button onClick={handleAIReview} disabled={reviewLoading} variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {reviewLoading ? "Reviewing..." : "AI Review"}
                </Button>
              </div>

              <Tabs defaultValue="output" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="review">AI Review</TabsTrigger>
                </TabsList>
                <TabsContent value="output" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted p-3 rounded min-h-[100px]">
                        {output || "Run your code to see output here..."}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="review" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Code Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {review ? (
                          <ReactMarkdown>{review}</ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground">Click "AI Review" to get feedback on your code...</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
