"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Search, Camera, Sparkles, Monitor, BookOpen, Film, 
  Globe, Baby, ChevronDown, Loader2, Music, X 
} from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

// --- CONFIGURATION ---
// 🚨 Ensure this is your exact Hugging Face URL (No trailing slash)
const API_URL = "https://deltaworld-moodflix-backend.hf.space"; 

export default function MoodFlixOmni() {
  const { isSignedIn } = useUser();
  
  // State
  const [category, setCategory] = useState<"movie" | "tv" | "book" | "music">("movie");
  const [mood, setMood] = useState("");
  const [intensity, setIntensity] = useState([5]); // Slider array
  const [era, setEra] = useState("Any");
  const [language, setLanguage] = useState("en");
  const [kidsMode, setKidsMode] = useState(false);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);
  const [error, setError] = useState("");
  
  // Spotify State
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  
  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. ON LOAD: CHECK FOR SPOTIFY TOKEN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("spotify_token");
    if (token) {
      setSpotifyToken(token);
      setCategory("music"); // Auto-switch to music tab
      window.history.replaceState({}, document.title, "/"); // Clean URL
    }
  }, []);

  // 2. HANDLE SEARCH (The Logic Fix)
  const handleSearch = async () => {
    if (!mood && category !== "music") return; 
    
    setLoading(true);
    setError("");
    setResults([]);
    setVisibleCount(7);

    try {
      // --- CRITICAL FIXES ---
      
      // Fix 1: Force Intensity to be a Number (not array)
      const safeIntensity = Array.isArray(intensity) ? intensity[0] : parseInt(intensity.toString());
      
      // Fix 2: Force Kids Mode to Boolean
      const safeKidsMode = Boolean(kidsMode);

      // Fix 3: Force Spotify Token to String (Backend hates null)
      const safeToken = spotifyToken || ""; 

      const payload = {
        mood: mood || "happy", 
        intensity: safeIntensity, 
        era: era || "Any",
        category: category,
        kids_mode: safeKidsMode,
        language: language || "en",
        spotify_token: safeToken
      };

      console.log("Sending Payload:", payload); 

      const res = await axios.post(`${API_URL}/recommend`, payload);
      
      // Handle Redirects
      if (res.data.error === "Spotify Login Required") {
         if (res.data.auth_url) {
             window.location.href = res.data.auth_url; 
             return;
         }
      }

      // Handle Data
      const dataList = res.data.results || res.data.movies || [];
      setResults(dataList);
      
      if (dataList.length === 0) {
          setError("No results found. Try a different mood!");
      }

    } catch (err: any) {
      console.error("API Error:", err);
      const msg = err.response?.data?.detail?.[0]?.msg || "Connection failed.";
      setError(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. CONNECT SPOTIFY
  const connectSpotify = async () => {
      try {
          const res = await axios.get(`${API_URL}/spotify/login`);
          if (res.data.auth_url) {
              window.location.href = res.data.auth_url;
          }
      } catch (err) {
          console.error(err);
          setError("Could not connect to Spotify.");
      }
  };

  // 4. HANDLE SELFIE
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/analyze-face`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const detected = res.data.detected_mood;
      setMood(detected);
      alert(`Detected Mood: ${detected}. Click 'Find Recommendations'!`);
    } catch (err) {
      setError("Could not analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12121A] text-gray-200 font-sans selection:bg-violet-500/30 pb-20">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            MoodFlix Omni
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setKidsMode(!kidsMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                kidsMode 
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                    : "bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10"
                }`}
            >
                <Baby className="w-3 h-3" />
                {kidsMode ? "Kids Mode: ON" : "Kids Mode"}
            </button>

            {!isSignedIn ? (
                <SignInButton mode="modal">
                <button className="px-4 py-2 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/10 text-sm">
                    Sign In
                </button>
                </SignInButton>
            ) : (
                <UserButton />
            )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        
        {/* BACKGROUND QUOTE */}
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 opacity-[0.03] whitespace-nowrap">
            <h1 className="text-9xl font-serif italic text-white">Stories shape us.</h1>
        </div>

        {/* CONTROL CENTER */}
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl">
          
          {/* TABS */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: "movie", label: "Movies", icon: Film },
              { id: "tv", label: "TV Shows", icon: Monitor },
              { id: "book", label: "Books", icon: BookOpen },
              { id: "music", label: "Music", icon: Music },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm ${
                  category === cat.id
                    ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* MUSIC TAB: CONNECT BUTTON */}
          {category === "music" && !spotifyToken && (
            <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Connect Spotify</h3>
                <p className="text-gray-500 mb-6 text-sm">We need access to your listening history.</p>
                <button 
                    onClick={connectSpotify}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-transform hover:scale-105"
                >
                    Connect Spotify Account
                </button>
            </div>
          )}

          {/* SEARCH INPUTS (Hidden if waiting for Spotify) */}
          {((category !== "music") || spotifyToken) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Selfie/Text Toggle */}
                <div className="flex gap-4 mb-2">
                   {/* Simple toggle logic can go here if needed */}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder={category === "music" ? "What vibe do you need?" : "How are you feeling? (e.g. Nostalgic...)"}
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-5 py-5 text-lg focus:border-violet-500/30 outline-none transition-colors placeholder:text-gray-700"
                  />
                  {/* Selfie Button Overlay */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                     <div className="relative overflow-hidden group cursor-pointer p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <Camera className="w-5 h-5 text-gray-400 group-hover:text-violet-300" />
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                     </div>
                  </div>
                </div>

                {/* FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Intensity: {intensity}</label>
                        <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity([parseInt(e.target.value)])} className="w-full accent-violet-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                    </div>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white/5 border border-white/5 rounded-lg px-4 text-sm text-gray-300 outline-none py-3">
                        <option value="en" className="bg-slate-900">English</option>
                        <option value="hi" className="bg-slate-900">Hindi</option>
                        <option value="es" className="bg-slate-900">Spanish</option>
                        <option value="ko" className="bg-slate-900">Korean</option>
                        <option value="ja" className="bg-slate-900">Japanese</option>
                    </select>
                    <select value={era} onChange={(e) => setEra(e.target.value)} className="bg-white/5 border border-white/5 rounded-lg px-4 text-sm text-gray-300 outline-none py-3">
                        <option value="Any" className="bg-slate-900">Any Era</option>
                        <option value="2020s" className="bg-slate-900">2020s</option>
                        <option value="2010s" className="bg-slate-900">2010s</option>
                        <option value="90s" className="bg-slate-900">90s</option>
                        <option value="80s" className="bg-slate-900">80s</option>
                    </select>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-violet-600/90 hover:bg-violet-500 text-white font-medium py-4 rounded-xl shadow-lg shadow-violet-900/20 transition-all flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find Recommendations ✨"}
                </button>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm text-center">{error}</div>}
            </div>
          )}
        </div>

        {/* RESULTS GRID */}
        {results.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-medium text-gray-300 mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Results for you
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {results.slice(0, visibleCount).map((item, idx) => (
                <motion.div 
                    key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="group relative bg-[#181820] border border-white/5 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all duration-300"
                >
                    {/* BADGE */}
                    {item.badge && (
                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${
                            item.badge === "Netflix" ? "bg-red-900/80 text-red-100" :
                            item.badge === "Spotify" ? "bg-green-900/80 text-green-100" :
                            item.badge === "Prime" ? "bg-blue-900/80 text-blue-100" :
                            "bg-gray-800 text-white"
                        }`}>
                            {item.badge}
                        </div>
                    )}
                    
                    <div className="aspect-[2/3] relative overflow-hidden">
                        {item.poster ? (
                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-700">No Image</div>
                        )}
                    </div>
                    
                    <div className="p-3">
                        <h3 className="font-medium text-white text-sm truncate">{item.title}</h3>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-gray-500">{item.year}</span>
                            {item.rating > 0 && (
                                <span className="text-[10px] text-yellow-500/80 flex items-center gap-1">
                                    ★ {item.rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                        {item.link && (
                            <a href={item.link} target="_blank" className="block mt-3 text-center text-[10px] bg-white/5 py-1.5 rounded hover:bg-white/10 text-violet-300 transition-colors">
                                Open Link ↗
                            </a>
                        )}
                    </div>
                </motion.div>
                ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {results.length > visibleCount && (
                <div className="flex justify-center mt-12">
                    <button onClick={() => setVisibleCount(prev => prev + 7)} className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                        Show more <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            )}
            
            {/* END OF LIST MESSAGE */}
            {visibleCount >= results.length && (
                <p className="text-center text-gray-600 text-xs mt-12">That's all we found! 🎬</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
