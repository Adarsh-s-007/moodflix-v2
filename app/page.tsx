"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Header from "@/components/header"
import TabNavigation from "@/components/tab-navigation"
import ControlCenter from "@/components/control-center"
import SpotifyTab from "@/components/spotify-tab"
import SettingsTab from "@/components/settings-tab"
import AboutTab from "@/components/about-tab"
import { Music } from "lucide-react"
import axios from "axios"

// 🚨 REPLACE THIS WITH YOUR REAL HUGGING FACE URL IF DIFFERENT
const API_URL = "https://deltaworld-moodflix-backend.hf.space"; 

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

  // --- NEW: Function to handle the redirect properly ---
  const handleSpotifyConnect = async () => {
    try {
        // 1. Fetch the dynamic login URL from the backend
        const res = await axios.get(`${API_URL}/spotify/login`);
        
        // 2. Force the browser to go there
        if (res.data.auth_url) {
            window.location.href = res.data.auth_url;
        }
    } catch (e) {
        console.error("Spotify Connect Error:", e);
        alert("Could not connect to Spotify API. Check console.");
    }
  };

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
          
          {/* --- CONNECTED: Show Spotify Logic --- */}
          {activeTab === "music" && spotifyToken && <SpotifyTab spotifyToken={spotifyToken} />}
          
          {/* --- NOT CONNECTED: Show Connect Button (UPDATED) --- */}
          {activeTab === "music" && !spotifyToken && (
            <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-3xl border border-white/10 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Connect your Spotify</h3>
                <p className="text-gray-400 mb-6 text-sm">We need access to your listening history to recommend songs.</p>
                
                {/* ✅ NEW WORKING BUTTON */}
                <button 
                    onClick={handleSpotifyConnect}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-transform hover:scale-105"
                >
                    Connect Spotify Account
                </button>
            </div>
          )}

          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "about" && <AboutTab />}
        </main>
      )}
    </div>
  )
}
