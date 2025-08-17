"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code2, Clock, Calendar, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const BASE_URL = import.meta.env.VITE_BACKEND_URL

interface Submission {
  _id: string
  problemId: {
    _id: string
    title: string
    difficulty: string
  }
  code: string
  language: string
  verdict: "Accepted" | "Wrong Answer" | "Compilation Error" | "Runtime Error"
  executionTime: number
  memoryUsed: number
  submittedAt: string
}

export const SubmissionsPage = () => {
  const { token } = useAuth()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${BASE_URL}/api/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setSubmissions(data)
        } else {
          throw new Error("Failed to fetch submissions")
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error)
        toast({
          title: "Error",
          description: "Failed to load submissions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [token, toast])

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "Wrong Answer":
        return "bg-red-100 text-red-800 border-red-200"
      case "Compilation Error":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Runtime Error":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 min-h-screen bg-card border-r border-border">
        <Sidebar />
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
              <p className="text-muted-foreground">View your code submissions and results</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No submissions yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start solving problems to see your submissions here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{submission.problemId.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getDifficultyColor(submission.problemId.difficulty)} variant="outline">
                              {submission.problemId.difficulty}
                            </Badge>
                            <Badge variant="outline">{submission.language.toUpperCase()}</Badge>
                          </div>
                        </div>
                        <Badge className={getVerdictColor(submission.verdict)} variant="outline">
                          {submission.verdict}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(submission.submittedAt)}
                          </div>
                          {/* {submission.executionTime > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {submission.executionTime}ms
                            </div>
                          )}
                          {submission.memoryUsed > 0 && (
                            <div className="flex items-center gap-1">
                              <Code2 className="w-4 h-4" />
                              {submission.memoryUsed}KB
                            </div>
                          )} */}
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {submission.problemId.title} - {submission.language.toUpperCase()}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Badge className={getVerdictColor(submission.verdict)} variant="outline">
                                  {submission.verdict}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Submitted on {formatDate(submission.submittedAt)}
                                </span>
                              </div>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                <code>{submission.code}</code>
                              </pre>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
