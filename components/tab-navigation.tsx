"use client"

import { Music, Tv, Book, Settings, Info } from "lucide-react"

interface TabNavigationProps {
  activeTab: "movies" | "tv" | "books" | "music" | "settings" | "about"
  setActiveTab: (tab: "movies" | "tv" | "books" | "music" | "settings" | "about") => void
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: "movies", label: "Movies", icon: Tv },
    { id: "tv", label: "TV Shows", icon: Tv },
    { id: "books", label: "Books", icon: Book },
    { id: "music", label: "Music", icon: Music },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
  ]

  return (
    <nav className="flex justify-center gap-3 px-4 py-6 flex-wrap">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "movies" | "tv" | "books" | "music" | "settings" | "about")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-white/5 text-foreground hover:bg-white/10 border border-white/10"
            }`}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
