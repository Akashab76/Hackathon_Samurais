"use client"

import { useState, useCallback, useMemo } from "react"
import {
  ShoppingBag, BarChart3, ShoppingCart, LogOut, Sprout,
  MapPin, Search, X, Plus, Minus, Lightbulb, ChevronDown,
  ChevronUp, Truck, Calendar, Users,
} from "lucide-react"
import { CROPS, CROP_NAMES, CROP_CATEGORIES, getFreshness, getPriceDNA, getSampleHarvestDate, type UserState, type CartItem } from "@/lib/farm-data"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

// ─── Bottom Nav ───
function ConsumerNav({ active, onChange, cartCount }: { active: string; onChange: (t: string) => void; cartCount: number }) {
  const tabs = [
    { id: "browse", label: "Browse", icon: ShoppingBag },
    { id: "market", label: "Market", icon: BarChart3 },
    { id: "cart", label: "Cart", icon: ShoppingCart },
  ]
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card">
      <div className="flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${active === t.id ? "text-primary" : "text-muted-foreground"}`}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
            {t.id === "cart" && cartCount > 0 && (
              <span className="absolute -top-0.5 right-1/2 ml-3 flex h-4 w-4 translate-x-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-card">
                {cartCount}
              </span>
            )}
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
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${bg}`}>
      {f.label} {f.score}%
    </span>
  )
}

// ─── Freshness Meter ───
function FreshnessMeter({ crop, harvestDate }: { crop: string; harvestDate: string }) {
  const f = getFreshness(harvestDate, crop)
  const barColor = f.color === "green" ? "bg-primary" : f.color === "amber" ? "bg-accent" : "bg-destructive"
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">Freshness Score</span>
        <span className="font-semibold text-foreground">{f.score}% - {f.label}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-secondary">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${f.score}%` }} />
      </div>
    </div>
  )
}

// ─── Price Trend Chart ───
function PriceTrendChart({ basePrice }: { basePrice: number }) {
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      price: Math.round(basePrice + (Math.random() - 0.5) * basePrice * 0.3),
    }))
  }, [basePrice])

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={35} />
          <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
          <Line type="monotone" dataKey="price" stroke="#2d6a4f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Product Detail Modal ───
function ProductDetailModal({ crop, onClose, onAddToCart }: { crop: string; onClose: () => void; onAddToCart: (item: CartItem) => void }) {
  const data = CROPS[crop]
  const [variety, setVariety] = useState(data.varieties[0])
  const [farmersOpen, setFarmersOpen] = useState(false)
  const harvestDate = useMemo(() => getSampleHarvestDate(crop), [crop])
  const dna = getPriceDNA("Hassan, Karnataka", "Bangalore, Karnataka")

  const fakeFarmers = [
    { name: "Ramesh Gowda", loc: "Hassan, Karnataka", kg: 45 },
    { name: "Suresh Naik", loc: "Kolar, Karnataka", kg: 30 },
    { name: "Anita Devi", loc: "Tumkur, Karnataka", kg: 25 },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/50" onClick={onClose}>
      <div
        className="relative max-h-[90svh] w-full max-w-[430px] overflow-auto rounded-t-2xl bg-background pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-background pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex flex-col gap-4 px-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{crop}</h2>
              <div className="mt-1.5 relative inline-block">
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="appearance-none rounded-full border border-border bg-secondary py-1.5 pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none"
                >
                  {data.varieties.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Farm to Table Journey */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Truck className="h-4 w-4 text-primary" /> Farm to Table Journey
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">Sourced from Hassan & Kolar regions</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="h-3.5 w-3.5" />
              <span>Harvested: {harvestDate}</span>
            </div>
            <FreshnessMeter crop={crop} harvestDate={harvestDate} />
          </div>

          {/* Price DNA */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Price DNA</h3>
            <p className="mb-2 text-xs text-muted-foreground">Hassan, Karnataka to Bangalore ({dna.distance} km)</p>
            <div className="flex h-6 w-full overflow-hidden rounded-full">
              <div className="flex items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground" style={{ width: `${dna.farmer}%` }}>
                Farmer {dna.farmer}%
              </div>
              <div className="flex items-center justify-center bg-accent text-[10px] font-semibold text-accent-foreground" style={{ width: `${dna.logistics}%` }}>
                {dna.logistics}%
              </div>
              <div className="flex items-center justify-center bg-[#3b82f6] text-[10px] font-semibold text-card" style={{ width: `${dna.platform}%` }}>
                {dna.platform}%
              </div>
            </div>
          </div>

          {/* Price Trend */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-foreground">30-Day Price Trend</h3>
            <PriceTrendChart basePrice={data.basePrice} />
          </div>

          {/* Contributing Farmers */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <button
              onClick={() => setFarmersOpen(!farmersOpen)}
              className="flex w-full items-center justify-between p-4"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" /> Contributing Farmers
              </span>
              {farmersOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {farmersOpen && (
              <div className="border-t border-border px-4 pb-4">
                {fakeFarmers.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.loc}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">{f.kg} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buy Now */}
          <button
            onClick={() => {
              onAddToCart({ crop, variety, price: data.basePrice, quantity: 1, harvestDate })
              onClose()
            }}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Buy Now - {'₹'}{data.basePrice}/kg
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── BROWSE TAB ───
function BrowseTab({ onAddToCart, onOpenDetail }: { onAddToCart: (item: CartItem) => void; onOpenDetail: (crop: string) => void }) {
  const [filter, setFilter] = useState("All")
  const filters = ["All", "Vegetables", "Fruits", "Organic"]

  const crops = useMemo(() => {
    if (filter === "All") return CROP_NAMES
    if (filter === "Organic") return CROP_NAMES.filter((c) => ["Tomato", "Spinach", "Carrot"].includes(c))
    return CROP_CATEGORIES[filter] || CROP_NAMES
  }, [filter])

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Location Bar */}
      <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Farms near Bangalore</span>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {crops.map((crop) => (
          <CropCard key={crop} crop={crop} onAdd={onAddToCart} onOpen={onOpenDetail} />
        ))}
      </div>
    </div>
  )
}

function CropCard({ crop, onAdd, onOpen }: { crop: string; onAdd: (item: CartItem) => void; onOpen: (crop: string) => void }) {
  const data = CROPS[crop]
  const [varietyIdx, setVarietyIdx] = useState(0)
  const variety = data.varieties[varietyIdx]
  const harvestDate = useMemo(() => getSampleHarvestDate(crop), [crop])

  // Slight price variation per variety
  const price = data.basePrice + varietyIdx * 2

  return (
    <div
      className="flex flex-col rounded-xl border border-border bg-card p-3 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onOpen(crop)}
    >
      {/* Crop icon area */}
      <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-secondary">
        <Sprout className="h-8 w-8 text-primary/40" />
      </div>

      <h3 className="text-sm font-semibold text-foreground">{crop}</h3>

      {/* Variety dropdown */}
      <div className="relative mt-1" onClick={(e) => e.stopPropagation()}>
        <select
          value={varietyIdx}
          onChange={(e) => setVarietyIdx(Number(e.target.value))}
          className="w-full appearance-none rounded-lg border border-border bg-secondary py-1 pl-2 pr-6 text-[11px] text-foreground focus:outline-none"
        >
          {data.varieties.map((v, i) => <option key={v} value={i}>{v}</option>)}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      <div className="mt-1.5">
        <FreshnessBadge crop={crop} harvestDate={harvestDate} />
      </div>

      <p className="mt-1.5 text-sm font-bold text-foreground">{'₹'}{price}/kg</p>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onAdd({ crop, variety, price, quantity: 1, harvestDate })
        }}
        className="mt-2 w-full rounded-full bg-primary py-2 text-[11px] font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
      >
        Add to Cart
      </button>
    </div>
  )
}

// ─── MARKET TAB ───
function MarketTab() {
  const [searchCrop, setSearchCrop] = useState("Tomato")
  const basePrice = CROPS[searchCrop]?.basePrice || 28

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold text-foreground">Market Prices</h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={searchCrop}
          onChange={(e) => setSearchCrop(e.target.value)}
          className="w-full appearance-none rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none"
        >
          {CROP_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      {/* Current Price Card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs text-muted-foreground">Current Mandi Price</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{'₹'}{basePrice}/kg</p>
        <p className="text-xs text-primary font-medium">FarmBridge: {'₹'}{Math.round(basePrice * 0.85)}/kg (15% less)</p>
      </div>

      {/* 30 Day Graph */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">30-Day Price Trend - {searchCrop}</h3>
        <PriceTrendChart basePrice={basePrice} />
      </div>

      {/* AI Insight */}
      <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20">
          <Lightbulb className="h-4.5 w-4.5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">AI Market Insight</p>
          <p className="text-xs text-muted-foreground">
            {searchCrop} prices are expected to stabilize next week. Current prices are 8% above the 30-day average. Consider buying in bulk for better value.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── CART TAB ───
function CartTab({ items, setItems }: { items: CartItem[]; setItems: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const updateQty = (idx: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, i) => (i === idx ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Your cart is empty. Start browsing fresh produce.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
      {items.map((item, idx) => (
        <div key={`${item.crop}-${item.variety}-${idx}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Sprout className="h-5 w-5 text-primary/40" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{item.crop} ({item.variety})</h3>
            <p className="text-xs text-muted-foreground">{'₹'}{item.price}/kg</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => updateQty(idx, -1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
            <button onClick={() => updateQty(idx, 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">{'₹'}{total}</span>
        </div>
      </div>

      <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]">
        Checkout
      </button>
    </div>
  )
}

// ─── MAIN CONSUMER PAGE ───
export function ConsumerPage({ user, onLogout }: { user: UserState; onLogout: () => void }) {
  const [tab, setTab] = useState("browse")
  const [cart, setCart] = useState<CartItem[]>([])
  const [detailCrop, setDetailCrop] = useState<string | null>(null)

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.findIndex((c) => c.crop === item.crop && c.variety === item.variety)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
        return updated
      }
      return [...prev, item]
    })
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
        {tab === "browse" && <BrowseTab onAddToCart={addToCart} onOpenDetail={setDetailCrop} />}
        {tab === "market" && <MarketTab />}
        {tab === "cart" && <CartTab items={cart} setItems={setCart} />}
      </main>

      <ConsumerNav active={tab} onChange={setTab} cartCount={cart.length} />

      {/* Product Detail Modal */}
      {detailCrop && (
        <ProductDetailModal crop={detailCrop} onClose={() => setDetailCrop(null)} onAddToCart={addToCart} />
      )}
    </div>
  )
}
