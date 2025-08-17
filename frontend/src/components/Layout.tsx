"use client"

import type React from "react"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useAuth } from "@/contexts/AuthContext"

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export const Layout = ({ children, showSidebar = true }: LayoutProps) => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {showSidebar && user && (
          <aside className="w-64 min-h-[calc(100vh-80px)] bg-card border-r border-border">
            <Sidebar />
          </aside>
        )}
        <main className={`flex-1 ${showSidebar && user ? "ml-0" : ""}`}>
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
