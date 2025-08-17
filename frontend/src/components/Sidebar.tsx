"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, BookOpen, Trophy, BarChart3, Code2, Plus } from "lucide-react"

interface SidebarProps {
  className?: string
}

export const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const mainNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/problems", label: "Problems", icon: BookOpen },
    { path: "/contests", label: "Contests", icon: Trophy },
    { path: "/submissions", label: "Submissions", icon: Code2 },
    { path: "/statistics", label: "Statistics", icon: BarChart3 },
  ]

  const adminNavItems = [{ path: "/create", label: "Create Problem", icon: Plus }]

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold text-foreground">Navigation</h2>
          <div className="space-y-1">
            {mainNavItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                onClick={() => navigate(path)}
                variant={isActive(path) ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold text-foreground">Admin</h2>
          <div className="space-y-1">
            {adminNavItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                onClick={() => navigate(path)}
                variant={isActive(path) ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
