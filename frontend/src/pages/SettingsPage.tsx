"use client"

import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Settings } from "lucide-react"

export const SettingsPage = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 min-h-screen bg-card border-r border-border">
        <Sidebar />
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <Input id="firstname" defaultValue={user?.firstname} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <Input id="lastname" defaultValue={user?.lastname} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card className="text-center py-12">
                <CardContent>
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">More settings coming soon!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
