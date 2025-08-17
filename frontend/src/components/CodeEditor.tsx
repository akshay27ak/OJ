"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Send, Sparkles, Copy, Download, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeEditorProps {
  initialCode?: string
  language?: string
  onLanguageChange?: (language: string) => void
  onCodeChange?: (code: string) => void
  onRun?: (code: string, language: string, input: string) => Promise<void>
  onSubmit?: (code: string, language: string) => Promise<void>
  onAIReview?: (code: string, language: string) => Promise<void>
  customInput?: string
  onCustomInputChange?: (input: string) => void
  output?: string
  aiReview?: string
  isRunning?: boolean
  isSubmitting?: boolean
  isReviewing?: boolean
  showSubmit?: boolean
  showAIReview?: boolean
  className?: string
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

const languageInfo = {
  cpp: { name: "C++", extension: ".cpp", color: "bg-blue-100 text-blue-800" },
  java: { name: "Java", extension: ".java", color: "bg-orange-100 text-orange-800" },
  py: { name: "Python", extension: ".py", color: "bg-green-100 text-green-800" },
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = "",
  language = "cpp",
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  onAIReview,
  customInput = "",
  onCustomInputChange,
  output = "",
  aiReview = "",
  isRunning = false,
  isSubmitting = false,
  isReviewing = false,
  showSubmit = true,
  showAIReview = true,
  className = "",
}) => {
  const [code, setCode] = useState(initialCode || languageTemplates[language as keyof typeof languageTemplates])
  const [input, setInput] = useState(customInput)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState("14")
  const [theme, setTheme] = useState("light")
  const codeRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode)
    }
  }, [initialCode])

  useEffect(() => {
    setInput(customInput)
  }, [customInput])

  const handleLanguageChange = (newLanguage: string) => {
    const template = languageTemplates[newLanguage as keyof typeof languageTemplates]
    setCode(template)
    onLanguageChange?.(newLanguage)
    onCodeChange?.(template)
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleInputChange = (newInput: string) => {
    setInput(newInput)
    onCustomInputChange?.(newInput)
  }

  const handleRun = async () => {
    if (onRun) {
      await onRun(code, language, input)
    }
  }

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(code, language)
    }
  }

  const handleAIReview = async () => {
    if (onAIReview) {
      await onAIReview(code, language)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast({ title: "Code copied to clipboard" })
  }

  const downloadCode = () => {
    const langInfo = languageInfo[language as keyof typeof languageInfo]
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `solution${langInfo.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Code downloaded" })
  }

  const insertTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.substring(0, start) + "    " + code.substring(end)
      setCode(newCode)
      onCodeChange?.(newCode)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      }, 0)
    }
  }

  const currentLangInfo = languageInfo[language as keyof typeof languageInfo]

  return (
    <div className={`${className} ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Code Editor</CardTitle>
              <Badge className={currentLangInfo.color} variant="outline">
                {currentLangInfo.name}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={copyCode}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadCode}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <div className="flex gap-2">
              <Button onClick={handleRun} disabled={isRunning} variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? "Running..." : "Run"}
              </Button>
              {showSubmit && (
                <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              )}
              {showAIReview && (
                <Button onClick={handleAIReview} disabled={isReviewing} variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isReviewing ? "Reviewing..." : "AI Review"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 relative">
            <Textarea
              ref={codeRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={insertTab}
              className={`font-mono resize-none h-full min-h-[400px] ${
                theme === "dark" ? "bg-gray-900 text-green-400" : "bg-gray-50"
              }`}
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.5" }}
              placeholder="Write your code here..."
            />
            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              Lines: {code.split("\n").length} | Chars: {code.length}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Custom Input (Optional)</label>
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="font-mono text-sm h-24 resize-none"
                placeholder="Enter custom input for testing..."
              />
            </div>

            <Tabs defaultValue="output" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="review">AI Review</TabsTrigger>
              </TabsList>
              <TabsContent value="output" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Execution Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded min-h-[120px] max-h-[300px] overflow-y-auto">
                      {output || "Run your code to see output here..."}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="review" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">AI Code Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none min-h-[120px] max-h-[300px] overflow-y-auto">
                      {aiReview ? (
                        <div className="whitespace-pre-wrap text-sm">{aiReview}</div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Click "AI Review" to get intelligent feedback on your code...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
