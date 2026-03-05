"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Sprout, Eye, EyeOff, Mail, Lock, User, MapPin, ChevronDown, Loader2 } from "lucide-react"
import { CITIES } from "@/lib/farm-data"
import { supabase } from "@/lib/supabase"

interface LoginPageProps {
  onLogin: (session: { id: string; email: string; role: "farmer" | "consumer"; name: string; city?: string }) => void
}

function CityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        if (!CITIES.includes(search)) setSearch(value)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [search, value])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search your city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
            onChange("")
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
        />
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-border bg-card shadow-lg">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                onChange(city)
                setSearch(city)
                setOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PriceDNABar() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Price DNA - Where your money goes</h3>
      <div className="flex h-7 w-full overflow-hidden rounded-full">
        <div className="flex items-center justify-center bg-primary text-[11px] font-semibold text-primary-foreground" style={{ width: "68%" }}>
          Farmer 68%
        </div>
        <div className="flex items-center justify-center bg-accent text-[11px] font-semibold text-accent-foreground" style={{ width: "12%" }}>
        </div>
        <div className="flex items-center justify-center bg-[#3b82f6] text-[11px] font-semibold text-[#ffffff]" style={{ width: "20%" }}>
          20%
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Farmer</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" /> Logistics</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3b82f6]" /> Platform</span>
      </div>
      <p className="mt-2 text-xs italic text-muted-foreground">
        Without FarmBridge farmers earn less than 30%
      </p>
    </div>
  )
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<"farmer" | "consumer">("farmer")
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setSuccessMsg("")
      setLoading(true)

      try {
        if (tab === "login") {
          if (!email || !password) {
            setError("Please fill in all fields")
            setLoading(false)
            return
          }
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (authError) {
            setError(authError.message)
            setLoading(false)
            return
          }
          if (data.user) {
            const meta = data.user.user_metadata
            onLogin({
              id: data.user.id,
              email: data.user.email || email,
              role: (meta?.role as "farmer" | "consumer") || "consumer",
              name: (meta?.name as string) || "User",
              city: meta?.city as string | undefined,
            })
          }
        } else {
          if (!name || !email || !password) {
            setError("Please fill in all fields")
            setLoading(false)
            return
          }
          if (role === "farmer" && !city) {
            setError("Please select your city")
            setLoading(false)
            return
          }
          const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}`,
              data: {
                name,
                role,
                city: role === "farmer" ? city : undefined,
              },
            },
          })
          if (authError) {
            setError(authError.message)
            setLoading(false)
            return
          }
          setSuccessMsg("Account created! Check your email to confirm, then log in.")
          setTab("login")
        }
      } catch {
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [tab, email, password, name, role, city, onLogin]
  )

  return (
    <div className="flex min-h-svh flex-col items-center bg-background">
      {/* Background SVG landscape */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 overflow-hidden opacity-20">
        <svg viewBox="0 0 430 200" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0 140 Q100 80 200 120 Q300 160 430 100 L430 200 L0 200Z" fill="#74c69d" />
          <path d="M0 170 Q150 130 280 160 Q380 180 430 150 L430 200 L0 200Z" fill="#2d6a4f" />
        </svg>
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 px-5 pt-10 pb-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">FarmBridge</h1>
          </div>
          <p className="text-sm italic text-accent font-medium">Jai Jawan Jai Kisan</p>
        </div>

        {/* Role Pill Toggle */}
        <div className="flex w-full rounded-full bg-secondary p-1">
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${role === "farmer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Farmer
          </button>
          <button
            type="button"
            onClick={() => setRole("consumer")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${role === "consumer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Consumer
          </button>
        </div>

        {/* Auth Card */}
        <div className="w-full rounded-xl border border-border bg-card p-5 shadow-sm">
          {/* Login / Signup tabs */}
          <div className="mb-5 flex border-b border-border">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setSuccessMsg("") }}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors ${tab === "login" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(""); setSuccessMsg("") }}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors ${tab === "signup" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {tab === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {tab === "signup" && role === "farmer" && (
              <CityDropdown value={city} onChange={setCity} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {tab === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </div>

        {/* Price DNA */}
        <PriceDNABar />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          {"By continuing, you agree to FarmBridge's "}
          <a
            href="https://docs.google.com/document/d/1HkcuC9BMuEu1nVgH-TD4ijaphTM9Z6TK6Au3MuzHCxs/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors"
          >
            Terms of Service
          </a>
          {" and "}
          <a
            href="https://docs.google.com/document/d/1YTNb16UUrZHWMMuU7OgBsVpPjlnkNjPoJWeONeZsK7Q/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
