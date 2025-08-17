"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/Sidebar"
import { Edit, Trash2, Play, Plus, Search, TrendingUp, Clock, Award, Code2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Problem {
  _id: string
  title: string
  statement: string
  difficulty: "Easy" | "Medium" | "Hard"
  createdBy: {
    _id: string
    firstname: string
    lastname: string
  }
  createdAt: string
}

export const Dashboard = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [problems, setProblems] = useState<Problem[]>([])
  const [tab, setTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems`)
      const data = await res.json()
      setProblems(Array.isArray(data) ? data : data.problems || [])
    } catch (err) {
      console.error("Failed to fetch problems:", err)
      toast({
        title: "Error",
        description: "Failed to load problems",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteProblem = async (id: string) => {
    if (!token) return
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setProblems((prev) => prev.filter((p) => p._id !== id))
      toast({ title: "Problem deleted successfully" })
    } catch (error) {
      console.error("Failed to delete problem:", error)
      toast({
        title: "Error",
        description: "Failed to delete problem",
        variant: "destructive",
      })
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

  const filteredProblems = problems
    .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => {
      if (tab === "myproblems") return p.createdBy._id === user?._id
      if (tab === "all") return true
      return p.difficulty.toLowerCase() === tab
    })

  const stats = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
    myProblems: problems.filter((p) => p.createdBy._id === user?._id).length,
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 min-h-screen bg-card border-r border-border">
        <Sidebar />
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.firstname}! Ready to solve some problems?</p>
              </div>
              <Button onClick={() => navigate("/create-problem")} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Problem
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mx-auto mb-2">
                    <Code2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Problems</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.easy}</div>
                  <div className="text-sm text-muted-foreground">Easy</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
                  <div className="text-sm text-muted-foreground">Medium</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-2">
                    <Award className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
                  <div className="text-sm text-muted-foreground">Hard</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTab("myproblems")}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mx-auto mb-2">
                    <Edit className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.myProblems}</div>
                  <div className="text-sm text-muted-foreground">My Problems</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="easy">Easy</TabsTrigger>
                  <TabsTrigger value="medium">Medium</TabsTrigger>
                  <TabsTrigger value="hard">Hard</TabsTrigger>
                  <TabsTrigger value="myproblems">My Problems</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Problems Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-10 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProblems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground text-lg">No problems found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchTerm ? "Try adjusting your search term." : "Create your first problem to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProblems.map((problem) => (
                  <Card key={problem._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{problem.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">{problem.statement}</CardDescription>
                          <p className="text-xs text-muted-foreground mt-2">
                            by {problem.createdBy.firstname} {problem.createdBy.lastname}
                          </p>
                        </div>
                        <Badge className={getDifficultyColor(problem.difficulty)} variant="outline">
                          {problem.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button asChild className="w-full">
                        <div onClick={() => navigate(`/solve/${problem._id}`)}>
                          <Play className="w-4 h-4 mr-2" />
                          Solve Problem
                        </div>
                      </Button>

                      {user?._id === problem.createdBy._id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => navigate(`/update/${problem._id}`)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-destructive hover:text-destructive bg-transparent"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the problem "
                                  {problem.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProblem(problem._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
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
