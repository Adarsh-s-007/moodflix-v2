"use client"

import type React from "react"

import { useState, useRef } from "react"
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
  const [intensity, setIntensity] = useState([5])
  const [results, setResults] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getToken } = useAuth()

  const handleMoodChange = (value: string) => {
    setMood(value)
  }

  const handleSelfieUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    try {
      setLoading(true)
      setError(null)

      const response = await axios.post("https://deltaworld-moodflix-backend.hf.space/analyze-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const detectedMood = response.data.detected_mood
      setMood(detectedMood)

      // Trigger search automatically after mood detection
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
    if (!searchMood.trim()) {
      setError("Please enter a mood or upload a selfie")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = await getToken()

      // Sanitization steps from spec
      const safeIntensity = Array.isArray(intensity) ? intensity[0] : Number.parseInt(intensity)
      const safeKidsMode = Boolean(kidsMode)
      const safeToken = null

      const response = await axios.post(
        "https://deltaworld-moodflix-backend.hf.space/recommend",
        {
          mood: searchMood,
          category: category === "Music" ? "Spotify" : category,
          language,
          era,
          intensity: safeIntensity,
          kids_mode: safeKidsMode,
          spotify_token: safeToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.error === "Spotify Login Required") {
        window.location.href = response.data.auth_url
        return
      }

      setResults(response.data.results || [])
    } catch (err) {
      console.error("[v0] Search error:", err)
      setError("Failed to get recommendations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass p-8 space-y-6">
        {/* Top Row: Kids Mode & Language & Era */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <label className="text-sm font-medium">Kids Mode</label>
            <button
              onClick={() => setKidsMode(!kidsMode)}
              className={`w-12 h-6 rounded-full transition-all ${
                kidsMode ? "bg-blue-400 shadow-lg shadow-blue-400/50" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  kidsMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <label className="text-sm font-medium block mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-input text-foreground rounded px-3 py-1 text-sm border border-white/10"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>Korean</option>
              <option>Japanese</option>
            </select>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <label className="text-sm font-medium block mb-2">Era</label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full bg-input text-foreground rounded px-3 py-1 text-sm border border-white/10"
            >
              <option>Any</option>
              <option>80s</option>
              <option>90s</option>
              <option>2000s</option>
              <option>2010s</option>
              <option>2020s</option>
            </select>
          </div>
        </div>

        {/* Middle Row: Text Input & Selfie Dropzone */}
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

        {/* Bottom Row: Intensity Slider & Search Button */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Vibe Intensity</label>
              <span className="text-sm text-primary font-semibold">{intensity[0]}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity[0]}
              onChange={(e) => setIntensity([Number.parseInt(e.target.value)])}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

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
