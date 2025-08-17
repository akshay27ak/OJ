"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, Lock, Clock, BarChart3, Calendar, Trophy } from "lucide-react"

const BASE_URL = import.meta.env.VITE_BACKEND_URL

interface TimeSpent {
  [date: string]: number
}

export const ProfilePage = () => {
  const { user, token } = useAuth()
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [timeSpent, setTimeSpent] = useState<TimeSpent>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data: { timeSpent?: TimeSpent } = await res.json()
        setTimeSpent(data?.timeSpent || {})
      } catch (err) {
        console.error("Failed to load user data", err)
      }
    }

    if (token) {
      fetchUserData()
    }
  }, [token])

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch(`${BASE_URL}/api/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText)
      }

      toast({ title: "Password changed successfully" })
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      toast({
        title: "Error changing password",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const totalMinutes = Object.values(timeSpent).reduce((a, b) => a + b, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60
  const activeDays = Object.keys(timeSpent).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user?.firstname} {user?.lastname}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {totalHours}h {remainingMinutes}m
                </div>
                <p className="text-sm text-muted-foreground">Time spent coding</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Active Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{activeDays}</div>
                <p className="text-sm text-muted-foreground">Days with activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground">Current streak</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeDays === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activity recorded yet. Start solving problems to see your progress!
                </p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(timeSpent)
                    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                    .slice(0, 7)
                    .map(([date, minutes]) => (
                      <div key={date} className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium">{date}</span>
                        <Badge variant="outline">{minutes} min</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coding Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {activeDays === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activity data available yet.</p>
              ) : (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 py-2 border-b border-border font-medium text-sm">
                    <span>Date</span>
                    <span>Time Spent</span>
                  </div>
                  {Object.entries(timeSpent)
                    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                    .map(([date, minutes]) => (
                      <div key={date} className="grid grid-cols-2 gap-4 py-2 border-b border-border text-sm">
                        <span>{date}</span>
                        <span>{minutes} minutes</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="w-full sm:w-auto">
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                  <p className="text-foreground">{user?.firstname}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                  <p className="text-foreground">{user?.lastname}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                  <p className="text-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
