"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogOut, Code2, Home, BookOpen } from "lucide-react"

export const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/problems", label: "Problems", icon: BookOpen },
    { path: "/create", label: "Create Problem", icon: Code2 },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-2xl font-bold">
              <span className="text-foreground">Algo</span>
              <span className="text-primary">Univ</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                onClick={() => navigate(path)}
                variant={isActive(path) ? "default" : "ghost"}
                className="text-sm font-medium px-4 py-2"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}

            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-border">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:bg-muted rounded-lg px-3 py-2 transition-colors"
                onClick={() => navigate("/profile")}
              >
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {user?.firstname?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-foreground">
                    {user?.firstname} {user?.lastname}
                  </div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={handleLogout} className="text-sm bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
