"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Home, ListPlus, IndianRupee, ClipboardList, LogOut,
  Sprout, TrendingUp, Flame, Zap, Package, Search,
  ChevronDown, Leaf, Calendar, BoxIcon, ToggleLeft, ToggleRight,
} from "lucide-react"
import { CROPS, CROP_NAMES, CROP_CATEGORIES, getFreshness, getPriceDNA, type UserState, type FarmerListing } from "@/lib/farm-data"

// ─── Bottom Nav ───
function FarmerNav({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "list", label: "List", icon: ListPlus },
    { id: "earnings", label: "Earnings", icon: IndianRupee },
    { id: "listings", label: "Listings", icon: ClipboardList },
  ]
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card">
      <div className="flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${active === t.id ? "text-primary" : "text-muted-foreground"}`}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

// ─── Freshness Badge ───
function FreshnessBadge({ crop, harvestDate }: { crop: string; harvestDate: string }) {
  const f = getFreshness(harvestDate, crop)
  const bg = f.color === "green" ? "bg-primary/10 text-primary" : f.color === "amber" ? "bg-accent/20 text-accent" : "bg-destructive/10 text-destructive"
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${bg}`}>
      {f.label} {f.score}%
    </span>
  )
}

// ─── Crop Searchable Dropdown ───
function CropDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const result: Record<string, string[]> = {}
    for (const [cat, crops] of Object.entries(CROP_CATEGORIES)) {
      const matches = crops.filter((c) => c.toLowerCase().includes(q))
      if (matches.length) result[cat] = matches
    }
    return result
  }, [search])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search crop..."
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); onChange("") }}
          className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
        />
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-card shadow-lg">
          {Object.keys(filtered).length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No crops found</p>
          ) : (
            Object.entries(filtered).map(([cat, crops]) => (
              <div key={cat}>
                <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
                {crops.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { onChange(c); setSearch(c); setOpen(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── HOME TAB ───
function HomeTab({ user }: { user: UserState }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Welcome, {user.name} <span role="img" aria-label="wave">{'👋'}</span></h2>
        <p className="text-sm text-muted-foreground">{user.city || "Karnataka"}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Listings", value: "12", icon: Package, color: "text-primary" },
          { label: "Weekly Earnings", value: "8,450", icon: IndianRupee, color: "text-primary" },
          { label: "Saved vs Middlemen", value: "34%", icon: TrendingUp, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <span className="text-lg font-bold text-foreground">{s.value}</span>
            <span className="text-center text-[10px] leading-tight text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Demand Signal Feed */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Demand Signal Feed</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Flame className="h-4.5 w-4.5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Tomato demand surging in Bangalore</p>
              <p className="text-xs text-muted-foreground">Prices up 18% this week. Consider listing more.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <TrendingUp className="h-4.5 w-4.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Organic produce trending in Chennai</p>
              <p className="text-xs text-muted-foreground">Consumers willing to pay 25% premium for organic.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LIST TAB ───
function ListTab({ onAdd }: { onAdd: (l: FarmerListing) => void }) {
  const [crop, setCrop] = useState("")
  const [variety, setVariety] = useState("")
  const [qty, setQty] = useState("")
  const [price, setPrice] = useState("")
  const [harvestDate, setHarvestDate] = useState("")
  const [storage, setStorage] = useState("")
  const [organic, setOrganic] = useState(false)

  const varieties = crop && CROPS[crop] ? CROPS[crop].varieties : []

  const handleCropChange = useCallback((c: string) => {
    setCrop(c)
    setVariety("")
    if (c && CROPS[c]) setPrice(String(CROPS[c].basePrice))
    else setPrice("")
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!crop || !variety || !qty || !price || !harvestDate) return
    onAdd({
      id: Date.now().toString(),
      crop,
      variety,
      quantity: Number(qty),
      price: Number(price),
      harvestDate,
      storageMethod: storage,
      organic,
      createdAt: new Date().toISOString(),
    })
    setCrop(""); setVariety(""); setQty(""); setPrice(""); setHarvestDate(""); setStorage(""); setOrganic(false)
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold text-foreground">List Your Produce</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Crop</label>
          <CropDropdown value={crop} onChange={handleCropChange} />
        </div>

        {crop && varieties.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Variety</label>
            <div className="relative">
              <Leaf className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full appearance-none rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
              >
                <option value="">Select variety</option>
                {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity (kg)</label>
            <div className="relative">
              <BoxIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="number" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Price (per kg)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Harvest Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Storage Method</label>
          <div className="relative">
            <BoxIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select value={storage} onChange={(e) => setStorage(e.target.value)} className="w-full appearance-none rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none">
              <option value="">Select storage</option>
              <option value="Cold Storage">Cold Storage</option>
              <option value="Room Temperature">Room Temperature</option>
              <option value="Ventilated">Ventilated</option>
              <option value="Refrigerated">Refrigerated</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOrganic(!organic)}
          className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3"
        >
          {organic ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">Organic Produce</span>
        </button>

        <button type="submit" className="mt-1 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]">
          List Now
        </button>
      </form>
    </div>
  )
}

// ─── EARNINGS TAB ───
function EarningsTab({ user }: { user: UserState }) {
  const dna = getPriceDNA(user.city || "Hassan, Karnataka", "Bangalore, Karnataka")

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold text-foreground">Earnings</h2>

      {/* Total Earnings Card */}
      <div className="rounded-xl border border-border bg-primary p-5 shadow-sm">
        <p className="text-sm text-primary-foreground/70">Total Earnings</p>
        <p className="mt-1 text-3xl font-bold text-primary-foreground">{'₹'}32,450</p>
        <p className="mt-1 text-xs text-primary-foreground/60">This month</p>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-xs text-muted-foreground">Middleman Price</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{'₹'}18/kg</p>
          <p className="text-xs text-muted-foreground">Avg. Tomato</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground">FarmBridge Price</p>
          <p className="mt-1 text-2xl font-bold text-primary">{'₹'}28/kg</p>
          <p className="text-xs text-muted-foreground">Avg. Tomato</p>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-full bg-primary/10 px-4 py-2">
        <p className="text-sm font-semibold text-primary">You earn 55% more with FarmBridge</p>
      </div>

      {/* Price DNA */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price DNA Breakdown</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          {user.city || "Hassan, Karnataka"} to Bangalore, Karnataka ({dna.distance} km)
        </p>
        <div className="flex h-7 w-full overflow-hidden rounded-full">
          <div className="flex items-center justify-center bg-primary text-[11px] font-semibold text-primary-foreground" style={{ width: `${dna.farmer}%` }}>
            {dna.farmer}%
          </div>
          <div className="flex items-center justify-center bg-accent text-[11px] font-semibold text-accent-foreground" style={{ width: `${dna.logistics}%` }}>
            {dna.logistics}%
          </div>
          <div className="flex items-center justify-center bg-[#3b82f6] text-[11px] font-semibold text-card" style={{ width: `${dna.platform}%` }}>
            {dna.platform}%
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Farmer</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" /> Logistics</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3b82f6]" /> Platform</span>
        </div>
      </div>
    </div>
  )
}

// ─── LISTINGS TAB ───
function ListingsTab({ listings }: { listings: FarmerListing[] }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No listings yet. Start by listing your produce.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-bold text-foreground">My Listings</h2>
      {listings.map((l) => (
        <div key={l.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{l.crop} - {l.variety}</h3>
              <p className="text-xs text-muted-foreground">{l.quantity} kg at {'₹'}{l.price}/kg</p>
            </div>
            <FreshnessBadge crop={l.crop} harvestDate={l.harvestDate} />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full border border-border bg-card py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
              Edit
            </button>
            <button className="flex-1 rounded-full bg-accent py-2 text-xs font-semibold text-accent-foreground transition-colors hover:opacity-90">
              Flash Deal
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN FARMER PAGE ───
export function FarmerPage({ user, onLogout }: { user: UserState; onLogout: () => void }) {
  const [tab, setTab] = useState("home")
  const [listings, setListings] = useState<FarmerListing[]>([
    { id: "1", crop: "Tomato", variety: "Organic", quantity: 50, price: 28, harvestDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], storageMethod: "Cold Storage", organic: true, createdAt: new Date().toISOString() },
    { id: "2", crop: "Spinach", variety: "Local", quantity: 30, price: 20, harvestDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0], storageMethod: "Refrigerated", organic: false, createdAt: new Date().toISOString() },
    { id: "3", crop: "Mango", variety: "Alphonso", quantity: 100, price: 80, harvestDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0], storageMethod: "Room Temperature", organic: false, createdAt: new Date().toISOString() },
  ])

  const handleAdd = useCallback((l: FarmerListing) => {
    setListings((prev) => [l, ...prev])
    setTab("listings")
  }, [])

  return (
    <div className="mx-auto flex min-h-svh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-bold text-foreground">FarmBridge</h1>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        {tab === "home" && <HomeTab user={user} />}
        {tab === "list" && <ListTab onAdd={handleAdd} />}
        {tab === "earnings" && <EarningsTab user={user} />}
        {tab === "listings" && <ListingsTab listings={listings} />}
      </main>

      <FarmerNav active={tab} onChange={setTab} />
    </div>
  )
}
