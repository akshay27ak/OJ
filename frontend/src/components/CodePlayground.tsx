"use client"

import { useState } from "react"
import { CodeEditor } from "./CodeEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, Share, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const COMPILER_URL = import.meta.env.VITE_COMPILER_URL

export const CodePlayground = () => {
  const [language, setLanguage] = useState("cpp")
  const [code, setCode] = useState("")
  const [customInput, setCustomInput] = useState("")
  const [output, setOutput] = useState("")
  const [aiReview, setAiReview] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const { toast } = useToast()

  const handleRun = async (code: string, language: string, input: string) => {
    setIsRunning(true)
    setOutput("Running your code...")

    try {
      const res = await fetch(`${COMPILER_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          input,
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
      toast({
        title: "Error",
        description: "Failed to run code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleAIReview = async (code: string, language: string) => {
    setIsReviewing(true)
    setAiReview("Generating AI review...")

    try {
      const res = await fetch(`${COMPILER_URL}/ai-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })

      const data = await res.json()
      if (data.success) {
        setAiReview(data.aiFeedback)
      } else {
        setAiReview("Failed to get AI review.")
      }
    } catch {
      setAiReview("AI review request failed.")
      toast({
        title: "Error",
        description: "Failed to get AI review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReviewing(false)
    }
  }

  const saveCode = () => {
    const savedCode = {
      code,
      language,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(`playground_${Date.now()}`, JSON.stringify(savedCode))
    toast({ title: "Code saved locally" })
  }

  const shareCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast({ title: "Code copied to clipboard for sharing" })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Code Playground</h1>
          <p className="text-muted-foreground">Write, test, and experiment with your code</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveCode} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={shareCode} variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CodeEditor
            language={language}
            onLanguageChange={setLanguage}
            onCodeChange={setCode}
            onRun={handleRun}
            onAIReview={handleAIReview}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            output={output}
            aiReview={aiReview}
            isRunning={isRunning}
            isReviewing={isReviewing}
            showSubmit={false}
            className="h-[800px]"
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                New File
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                Load Template
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                Format Code
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                Clear Output
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Language Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge variant="outline">{language === "cpp" ? "C++" : language === "py" ? "Python" : "Java"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Extension:</span>
                <span className="text-sm font-mono">
                  {language === "cpp" ? ".cpp" : language === "py" ? ".py" : ".java"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lines:</span>
                <span className="text-sm">{code.split("\n").length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use Tab for indentation</li>
                <li>• Ctrl+A to select all</li>
                <li>• Test with custom input</li>
                <li>• Use AI Review for feedback</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
