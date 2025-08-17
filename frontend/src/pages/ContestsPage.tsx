"use client"

import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export const ContestsPage = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 min-h-screen bg-card border-r border-border">
        <Sidebar />
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Contests</h1>
              <p className="text-muted-foreground">Participate in coding contests and compete with others</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center py-12">
                <CardContent>
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No contests available</p>
                  <p className="text-sm text-muted-foreground mt-2">Contest functionality is coming soon!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
