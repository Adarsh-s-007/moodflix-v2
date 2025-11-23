"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload } from "lucide-react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import ResultsDisplay from "./results-display"

interface ControlCenterProps {
  category: string
}

interface RecommendationResult {
  id: string
  title: string
  year: number
  rating: number
  badge: "Netflix" | "Prime" | "Spotify"
  image: string
  reason: string
}

export default function ControlCenter({ category }: ControlCenterProps) {
  const [kidsMode, setKidsMode] = useState(false)
  const [language, setLanguage] = useState("English")
  const [era, setEra] = useState("Any")
  const [mood, setMood] = useState("")
  
  // REMOVED: const [intensity, setIntensity] = useState([5])
  // We no longer need intensity state for the UI, but we send a default value.
  
  const [results, setResults] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getToken } = useAuth()

  // Spotify Token State
  const [spotifyToken, setSpotifyToken] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const token = params.get("spotify_token")
      if (token) setSpotifyToken(token)
    }
  }, [])

  const handleMoodChange = (value: string) => {
    setMood(value)
  }

  const handleSelfieUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      setError(null)
      const token = await getToken()

      const response = await axios.post("https://deltaworld-moodflix-backend.hf.space/analyze-face", formData, {
        headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token || ""}`
        },
      })

      const detectedMood = response.data.detected_mood
      setMood(detectedMood)
      await handleSearch(detectedMood)
    } catch (err) {
      console.error("[v0] Error analyzing face:", err)
      setError("Failed to analyze mood from image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (detectedMood?: string) => {
    const searchMood = detectedMood || mood
    if (!searchMood.trim() && category !== "Music") {
      setError("Please enter a mood or upload a selfie")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = await getToken()

      const safeKidsMode = Boolean(kidsMode)
      const safeToken = spotifyToken || "" 

      const payload = {
          mood: searchMood || "happy",
          category: category === "Music" ? "music" : category.toLowerCase().includes("tv") ? "tv" : category.toLowerCase(),
          language,
          era,
          intensity: 5, // Hardcoded default since slider is gone
          kids_mode: safeKidsMode,
          spotify_token: safeToken,
      }

      console.log("Sending Payload:", payload)

      const response = await axios.post(
        "https://deltaworld-moodflix-backend.hf.space/recommend",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      )

      if (response.data.error === "Spotify Login Required") {
        if (response.data.auth_url) {
            window.location.href = response.data.auth_url
            return
        }
      }

      const dataList = response.data.results || []
      setResults(dataList)
      
      if (dataList.length === 0) setError("No recommendations found.")

    } catch (err: any) {
      console.error("[v0] Search error:", err)
      const msg = err.response?.data?.detail?.[0]?.msg || "Failed to get recommendations."
      setError(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass p-8 space-y-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <label className="text-sm font-medium">Kids Mode</label>
            <button
              onClick={() => setKidsMode(!kidsMode)}
              className={`w-12 h-6 rounded-full transition-all ${
                kidsMode ? "bg-blue-400 shadow-lg shadow-blue-400/50" : "bg-muted"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${kidsMode ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <label className="text-sm font-medium block mb-2">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-input text-foreground rounded px-3 py-1 text-sm border border-white/10">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <label className="text-sm font-medium block mb-2">Era</label>
            <select value={era} onChange={(e) => setEra(e.target.value)} className="w-full bg-input text-foreground rounded px-3 py-1 text-sm border border-white/10">
              <option>Any</option>
              <option>2020s</option>
              <option>2010s</option>
              <option>2000s</option>
              <option>90s</option>
              <option>80s</option>
            </select>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">How are you feeling?</label>
            <input
              type="text"
              placeholder="e.g., Nostalgic, Energetic, Melancholic"
              value={mood}
              onChange={(e) => handleMoodChange(e.target.value)}
              className="w-full bg-input border border-primary/50 text-foreground rounded-lg px-4 py-3 placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg shadow-primary/10"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add("border-primary", "bg-primary/10")
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove("border-primary", "bg-primary/10")
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove("border-primary", "bg-primary/10")
              const files = e.dataTransfer.files
              if (files[0]) {
                handleSelfieUpload({ target: { files } } as any)
              }
            }}
            className="border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
            <p className="text-sm font-medium">Drop selfie to detect mood</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleSelfieUpload} className="hidden" />
          </div>
        </div>

        {/* Bottom Row: Search Button Only (Slider Removed) */}
        <div className="space-y-4">
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Finding Recommendations..." : "Find Recommendations"}
          </button>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </div>
      </div>

      {/* Results Display */}
      {results.length > 0 && <ResultsDisplay results={results} />}
    </div>
  )
}
