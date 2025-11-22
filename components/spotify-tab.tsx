"use client"

import { useState } from "react"
import { Volume2, LogOut } from "lucide-react"
import axios from "axios"
import ControlCenter from "./control-center"
import ResultsDisplay from "./results-display"

interface SpotifyTabProps {
  spotifyToken: string
}

interface RecommendationResult {
  id: string
  title: string
  year: number
  rating: number
  badge: "Spotify"
  image: string
  reason: string
}

export default function SpotifyTab({ spotifyToken: initialToken }: SpotifyTabProps) {
  const [spotifyToken, setSpotifyToken] = useState(initialToken)
  const [results, setResults] = useState<RecommendationResult[]>([])

  const handleConnectSpotify = () => {
    window.location.href = "https://deltaworld-moodflix-backend.hf.space/spotify/login"
  }

  const handleDisconnectSpotify = () => {
    setSpotifyToken("")
    setResults([])
  }

  const handleGetPersonalizedSongs = async (
    mood: string,
    intensity: number,
    language: string,
    era: string,
    kidsMode: boolean,
  ) => {
    if (!spotifyToken) {
      handleConnectSpotify()
      return
    }

    try {
      const safeIntensity = Array.isArray(intensity) ? intensity[0] : Number.parseInt(intensity)

      const response = await axios.post("https://deltaworld-moodflix-backend.hf.space/recommend", {
        mood,
        category: "Spotify",
        language,
        era,
        intensity: safeIntensity,
        kids_mode: Boolean(kidsMode),
        spotify_token: spotifyToken,
      })

      if (response.data.error === "Spotify Login Required") {
        handleConnectSpotify()
        return
      }

      setResults(response.data.results || [])
    } catch (error) {
      console.error("[v0] Error getting personalized songs:", error)
    }
  }

  if (!spotifyToken) {
    return (
      <div className="glass p-16 text-center space-y-6">
        <Volume2 className="mx-auto text-muted-foreground" size={64} />
        <div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Spotify Account</h2>
          <p className="text-muted-foreground">Get personalized song recommendations based on your mood.</p>
        </div>
        <button
          onClick={handleConnectSpotify}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-colors"
        >
          Connect Spotify Account
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connected header with disconnect option */}
      <div className="glass p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="text-green-400" size={24} />
          <span className="font-semibold text-green-400">Spotify Connected</span>
        </div>
        <button
          onClick={handleDisconnectSpotify}
          className="px-4 py-2 text-sm bg-destructive/20 text-destructive border border-destructive/50 rounded hover:bg-destructive/30 transition-colors flex items-center gap-2"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>

      {/* Control center for Spotify-specific settings */}
      <ControlCenter category="Music" />

      {/* Results display */}
      {results.length > 0 && <ResultsDisplay results={results} />}
    </div>
  )
}
