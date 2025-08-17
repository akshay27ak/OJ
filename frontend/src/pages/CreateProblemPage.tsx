"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Layout } from "@/components/Layout"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"

const BASE_URL = import.meta.env.VITE_BACKEND_URL

interface TestCase {
  input: string
  expectedOutput: string
}

export const CreateProblemPage = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [statement, setStatement] = useState("")
  const [difficulty, setDifficulty] = useState("Easy")
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expectedOutput: "" }])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/api/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, statement, difficulty, testCases }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to create problem")
      }

      toast({
        title: "Problem Created",
        description: "Your coding problem has been successfully created.",
      })
      navigate("/problems")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...testCases]
    updated[index][field] = value
    setTestCases(updated)
  }

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }])
  }

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      const updated = testCases.filter((_, i) => i !== index)
      setTestCases(updated)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/problems" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Problems
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">Problem Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Enter problem title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statement">Problem Statement</Label>
                  <Textarea
                    id="statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    required
                    className="min-h-[200px] resize-none"
                    placeholder="Describe the problem, input format, output format, constraints, etc."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Test Cases</Label>
                      <p className="text-sm text-muted-foreground">
                        The first test case will be visible to users as a sample
                      </p>
                    </div>
                    <Button type="button" onClick={addTestCase} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Test Case
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {testCases.map((testCase, index) => (
                      <Card key={index} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Test Case {index + 1}
                              {index === 0 && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Sample (Visible)
                                </span>
                              )}
                            </CardTitle>
                            {testCases.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeTestCase(index)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Input</Label>
                            <Textarea
                              value={testCase.input}
                              onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                              placeholder="Enter test input"
                              className="font-mono text-sm h-24 resize-none"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                              placeholder="Enter expected output"
                              className="font-mono text-sm h-24 resize-none"
                              required
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating Problem..." : "Create Problem"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/problems")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
