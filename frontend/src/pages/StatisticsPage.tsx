"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, Award, Code2, Target, Calendar } from "lucide-react"

const BASE_URL = import.meta.env.VITE_BACKEND_URL

interface Submission {
  _id: string
  problemId: {
    _id: string
    title: string
    difficulty: string
  }
  language: string
  verdict: string
  executionTime: number
  submittedAt: string
}

export const StatisticsPage = () => {
  const { token } = useAuth()
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
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [token])

  // Calculate statistics
  const stats = {
    totalSubmissions: submissions.length,
    acceptedSubmissions: submissions.filter((s) => s.verdict === "Accepted").length,
    solvedProblems: new Set(submissions.filter((s) => s.verdict === "Accepted").map((s) => s.problemId._id)).size,
    languages: [...new Set(submissions.map((s) => s.language))],
    averageTime:
      submissions.length > 0
        ? Math.round(submissions.reduce((acc, s) => acc + s.executionTime, 0) / submissions.length)
        : 0,
  }

  const difficultyStats = {
    Easy: submissions.filter((s) => s.problemId.difficulty === "Easy" && s.verdict === "Accepted").length,
    Medium: submissions.filter((s) => s.problemId.difficulty === "Medium" && s.verdict === "Accepted").length,
    Hard: submissions.filter((s) => s.problemId.difficulty === "Hard" && s.verdict === "Accepted").length,
  }

  const languageStats = stats.languages.map((lang) => ({
    language: lang,
    count: submissions.filter((s) => s.language === lang).length,
    accepted: submissions.filter((s) => s.language === lang && s.verdict === "Accepted").length,
  }))

  const verdictStats = {
    Accepted: submissions.filter((s) => s.verdict === "Accepted").length,
    "Wrong Answer": submissions.filter((s) => s.verdict === "Wrong Answer").length,
    "Compilation Error": submissions.filter((s) => s.verdict === "Compilation Error").length,
    "Runtime Error": submissions.filter((s) => s.verdict === "Runtime Error").length,
  }

  const recentActivity = submissions
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5)

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

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 min-h-screen bg-card border-r border-border">
        <Sidebar />
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
              <p className="text-muted-foreground">Track your coding progress and performance</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No statistics available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Statistics will be available once you start solving problems!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Problems Solved
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.solvedProblems}</div>
                      <p className="text-xs text-muted-foreground">Unique problems</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Total Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                      <p className="text-xs text-muted-foreground">{stats.acceptedSubmissions} accepted</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Success Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalSubmissions > 0
                          ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
                          : 0}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">Acceptance rate</p>
                    </CardContent>
                  </Card>

                  {/* <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Avg. Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">{stats.averageTime}ms</div>
                      <p className="text-xs text-muted-foreground">Execution time</p>
                    </CardContent>
                  </Card> */}
                </div>

                {/* Difficulty Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Difficulty Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(difficultyStats).map(([difficulty, count]) => (
                        <div key={difficulty} className="text-center">
                          <Badge className={getDifficultyColor(difficulty)} variant="outline">
                            {difficulty}
                          </Badge>
                          <div className="text-2xl font-bold mt-2">{count}</div>
                          <p className="text-sm text-muted-foreground">solved</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Language Usage & Verdict Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Language Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {languageStats.map(({ language, count, accepted }) => (
                          <div key={language} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{language.toUpperCase()}</Badge>
                              <span className="text-sm">{count} submissions</span>
                            </div>
                            <span className="text-sm text-green-600">{accepted} accepted</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Submission Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(verdictStats).map(([verdict, count]) => (
                          <div key={verdict} className="flex items-center justify-between">
                            <Badge className={getVerdictColor(verdict)} variant="outline">
                              {verdict}
                            </Badge>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((submission) => (
                        <div key={submission._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge className={getVerdictColor(submission.verdict)} variant="outline">
                              {submission.verdict}
                            </Badge>
                            <span className="font-medium">{submission.problemId.title}</span>
                            <Badge variant="outline">{submission.language.toUpperCase()}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
