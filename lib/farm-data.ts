// Shared crop data used across all pages
export const CROPS: Record<string, { varieties: string[]; shelfLife: number; basePrice: number }> = {
  Tomato: { varieties: ["Local", "Organic", "Cherry"], shelfLife: 7, basePrice: 28 },
  Spinach: { varieties: ["Local", "Organic"], shelfLife: 3, basePrice: 20 },
  Onion: { varieties: ["Red", "White"], shelfLife: 60, basePrice: 22 },
  Potato: { varieties: ["Local", "Baby"], shelfLife: 30, basePrice: 18 },
  Brinjal: { varieties: ["Purple", "Green"], shelfLife: 7, basePrice: 25 },
  Carrot: { varieties: ["Local", "Organic"], shelfLife: 14, basePrice: 30 },
  Beans: { varieties: ["French", "Cluster"], shelfLife: 5, basePrice: 35 },
  Capsicum: { varieties: ["Green", "Red", "Yellow"], shelfLife: 7, basePrice: 40 },
  Mango: { varieties: ["Alphonso", "Totapuri", "Dasheri"], shelfLife: 6, basePrice: 80 },
  Banana: { varieties: ["Robusta", "Nendran"], shelfLife: 5, basePrice: 30 },
  Wheat: { varieties: ["Local", "Sharbati"], shelfLife: 365, basePrice: 25 },
  Rice: { varieties: ["Sona Masoori", "Basmati"], shelfLife: 365, basePrice: 45 },
}

export const CROP_NAMES = Object.keys(CROPS)

export const CROP_CATEGORIES: Record<string, string[]> = {
  Vegetables: ["Tomato", "Spinach", "Onion", "Potato", "Brinjal", "Carrot", "Beans", "Capsicum"],
  Fruits: ["Mango", "Banana"],
  Grains: ["Wheat", "Rice"],
}

export const CITIES = [
  "Bangalore, Karnataka",
  "Hassan, Karnataka",
  "Mysore, Karnataka",
  "Kolar, Karnataka",
  "Tumkur, Karnataka",
  "Mangalore, Karnataka",
  "Hubli, Karnataka",
  "Chennai, Tamil Nadu",
  "Hyderabad, Telangana",
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Delhi",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
]

// Freshness algorithm
export function getFreshness(harvestDate: string | Date, cropName: string) {
  const shelf = CROPS[cropName]?.shelfLife || 7
  const days = Math.floor((new Date().getTime() - new Date(harvestDate).getTime()) / 86400000)
  const score = Math.max(0, Math.round(100 - (days / shelf) * 100))
  const color = score >= 70 ? "green" : score >= 40 ? "amber" : "red"
  const label = score >= 70 ? "Fresh" : score >= 40 ? "Moderate" : "Ageing"
  return { score, color, label, days }
}

// Price DNA formula
const COORDS: Record<string, { lat: number; lon: number }> = {
  "Bangalore, Karnataka": { lat: 12.97, lon: 77.59 },
  "Hassan, Karnataka": { lat: 13.0, lon: 76.1 },
  "Mysore, Karnataka": { lat: 12.29, lon: 76.63 },
  "Kolar, Karnataka": { lat: 13.13, lon: 78.13 },
  "Tumkur, Karnataka": { lat: 13.34, lon: 77.1 },
  "Mangalore, Karnataka": { lat: 12.91, lon: 74.85 },
  "Hubli, Karnataka": { lat: 15.36, lon: 75.12 },
  "Chennai, Tamil Nadu": { lat: 13.08, lon: 80.27 },
  "Hyderabad, Telangana": { lat: 17.38, lon: 78.48 },
  "Mumbai, Maharashtra": { lat: 19.07, lon: 72.87 },
  "Pune, Maharashtra": { lat: 18.52, lon: 73.85 },
  "Delhi": { lat: 28.61, lon: 77.2 },
  "Kolkata, West Bengal": { lat: 22.57, lon: 88.36 },
  "Ahmedabad, Gujarat": { lat: 23.02, lon: 72.57 },
}

export function getPriceDNA(farmerCity: string, consumerCity: string) {
  const f = COORDS[farmerCity] || { lat: 12.97, lon: 77.59 }
  const c = COORDS[consumerCity] || { lat: 12.97, lon: 77.59 }
  const dLat = ((c.lat - f.lat) * Math.PI) / 180
  const dLon = ((c.lon - f.lon) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((f.lat * Math.PI) / 180) * Math.cos((c.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const logistics = dist < 50 ? 8 : dist < 150 ? 12 : dist < 400 ? 18 : 24
  const platform = 12
  const farmer = 100 - logistics - platform
  return { farmer, logistics, platform, distance: Math.round(dist) }
}

// Generate a sample harvest date (recent)
export function getSampleHarvestDate(cropName: string): string {
  const shelf = CROPS[cropName]?.shelfLife || 7
  const daysAgo = Math.floor(Math.random() * Math.min(shelf, 5)) + 1
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0]
}

// Listing type for farmer
export interface FarmerListing {
  id: string
  crop: string
  variety: string
  quantity: number
  price: number
  harvestDate: string
  storageMethod: string
  organic: boolean
  createdAt: string
}

// Cart item type for consumer
export interface CartItem {
  crop: string
  variety: string
  price: number
  quantity: number
  harvestDate: string
}

// User state
export interface UserState {
  name: string
  phone: string
  role: "farmer" | "consumer"
  city?: string
}
