"use client"

import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export const StatisticsPage = () => {
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

            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No statistics available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Statistics will be available once you start solving problems!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
