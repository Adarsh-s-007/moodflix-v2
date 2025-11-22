"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Header from "@/components/header"
import TabNavigation from "@/components/tab-navigation"
import ControlCenter from "@/components/control-center"
import SpotifyTab from "@/components/spotify-tab"
import SettingsTab from "@/components/settings-tab"
import AboutTab from "@/components/about-tab"

export default function Home() {
  const { isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState<"movies" | "tv" | "books" | "music" | "settings" | "about">("movies")
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("spotify_token")
    if (token) {
      setSpotifyToken(token)
      setActiveTab("music")
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <div className="min-h-screen bg-quote">
      <Header isSignedIn={isSignedIn} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "music" && !isSignedIn ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-4">Please Sign In to access personalized music.</p>
          </div>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          {activeTab === "movies" && <ControlCenter category="Movies" />}
          {activeTab === "tv" && <ControlCenter category="TV Shows" />}
          {activeTab === "books" && <ControlCenter category="Books" />}
          {activeTab === "music" && spotifyToken && <SpotifyTab spotifyToken={spotifyToken} />}
          {activeTab === "music" && !spotifyToken && <ControlCenter category="Music" />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "about" && <AboutTab />}
        </main>
      )}
    </div>
  )
}
