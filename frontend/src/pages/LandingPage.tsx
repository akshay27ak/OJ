"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code2, Zap, Trophy, ArrowRight, BookOpen, BarChart3, Star } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export const LandingPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (user) navigate("/dashboard")
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to Verdiq.",
      })
      navigate("/dashboard")
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToAbout = () => {
    const section = document.getElementById("about")
    if (section) section.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-foreground">Ver</span>
              <span className="text-primary">diq</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={scrollToAbout}
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              About
            </button>
            <Link to="/problems">
              <Button variant="ghost">Problems</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Every expert was once
              <span className="text-primary block">a beginner</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Start solving, keep learning, and become the coder you want to be.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-6 text-lg">
                  Start Coding <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/problems">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg bg-transparent">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Problems
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Login Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Quick Sign In</CardTitle>
                <CardDescription>Access your coding dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-11">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  New to Verdiq?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Create an account
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">About Verdiq</h2>
          <div className="text-lg text-muted-foreground space-y-6 leading-relaxed">
            <p>
              Welcome to <span className="text-primary font-semibold">Verdiq</span> — your comprehensive platform for
              mastering competitive programming and algorithmic thinking.
            </p>
            <p>
              Whether you're preparing for coding interviews, participating in programming contests, or simply looking
              to improve your problem-solving skills, Verdiq provides the tools and challenges you need to succeed.
            </p>
            <p>
              Our platform features an extensive collection of problems across all difficulty levels, real-time code
              execution, detailed analytics, and a supportive community of fellow programmers.
            </p>
            <p className="text-primary font-semibold text-xl">
              Join thousands of developers who are already improving their skills with Verdiq.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-foreground">Why Choose Verdiq?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to excel in competitive programming and technical interviews.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Code2,
              title: "Extensive Problem Set",
              description: "Thousands of carefully curated problems across all difficulty levels and topics.",
            },
            {
              icon: Zap,
              title: "Real-time Execution",
              description: "Instant code compilation and execution with detailed feedback and test results.",
            },
            {
              icon: Trophy,
              title: "Competitions",
              description: "Regular programming contests to challenge yourself and compete with others.",
            },
            {
              icon: BarChart3,
              title: "Progress Tracking",
              description: "Detailed analytics and statistics to monitor your improvement over time.",
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-xl font-bold">
              <span className="text-foreground">Ver</span>
              <span className="text-primary">diq</span>
            </div>
          </div>
          <div className="text-muted-foreground flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>© 2024 Verdiq. Empowering coders worldwide.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
