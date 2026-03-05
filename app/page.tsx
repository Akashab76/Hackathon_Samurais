"use client"

import { useState, useCallback } from "react"
import { LoginPage } from "@/components/login-page"
import { FarmerPage } from "@/components/farmer-page"
import { ConsumerPage } from "@/components/consumer-page"
import type { UserState } from "@/lib/farm-data"

export default function Home() {
  const [user, setUser] = useState<UserState | null>(null)

  const handleLogin = useCallback((u: UserState) => {
    setUser(u)
  }, [])

  const handleLogout = useCallback(() => {
    setUser(null)
  }, [])

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (user.role === "farmer") {
    return <FarmerPage user={user} onLogout={handleLogout} />
  }

  return <ConsumerPage user={user} onLogout={handleLogout} />
}
