import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"

import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"

// Pages
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"
import { Dashboard } from "@/pages/dashboard"
import { CreateProblemPage } from "@/pages/CreateProblemPage"
import { UpdateProblemPage } from "@/pages/UpdateProblemPage"
import { SolveProblemPage } from "@/pages/SolveProblemPage"
import { ExploreProblemsPage } from "@/pages/ExploreProblemsPage"
import { ProfilePage } from "@/pages/ProfilePage"
import NotFound from "@/pages/NotFound"

import { Heartbeat } from "@/components/Heartbeat"

const queryClient = new QueryClient()

// ✅ Layout wrapper to conditionally show Navbar
const LayoutWithNavbar = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const noNavbarRoutes = ["/", "/login", "/signup"]
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <Heartbeat />
      <div className="flex-grow">{children}</div>
      <Toaster />
      <SonnerToaster />
    </div>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Router>
          <LayoutWithNavbar>
            <Routes>
              {/* 🌐 Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/problems" element={<ExploreProblemsPage />} />

              {/* 🔒 Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateProblemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update/:id"
                element={
                  <ProtectedRoute>
                    <UpdateProblemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/solve/:id"
                element={
                  <ProtectedRoute>
                    <SolveProblemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LayoutWithNavbar>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
