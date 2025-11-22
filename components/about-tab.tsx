"use client"

import { Info, Heart, Code } from "lucide-react"

export default function AboutTab() {
  return (
    <div className="glass p-8 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Info size={28} className="text-primary" />
        <h2 className="text-2xl font-bold">About MoodFlix Omni</h2>
      </div>

      {/* About Description */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Heart size={20} className="text-destructive" />
            What We Do
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            MoodFlix Omni uses advanced AI and facial recognition to detect your current mood and provides personalized
            recommendations for movies, TV shows, books, and music from Spotify. Whether you're feeling nostalgic,
            energetic, or melancholic, we've got the perfect content for you.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Code size={20} className="text-primary" />
            How It Works
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Upload a selfie or describe your mood to our AI</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>We analyze your mood and intensity preferences</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Get curated recommendations tailored to your feeling</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Connect with Spotify for personalized music</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "AI Mood Detection via Selfie",
            "Personalized Recommendations",
            "Spotify Integration",
            "Multiple Content Categories",
            "Kids Mode",
            "Era Filtering",
            "Language Support",
            "Intensity Adjustment",
          ].map((feature) => (
            <div
              key={feature}
              className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Built With</h3>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2 text-sm">
          <p>
            <span className="text-primary font-semibold">Frontend:</span> Next.js, React, Tailwind CSS, Framer Motion
          </p>
          <p>
            <span className="text-primary font-semibold">Backend:</span> HuggingFace Spaces, AI Model Integration
          </p>
          <p>
            <span className="text-primary font-semibold">Auth:</span> Clerk, Spotify OAuth
          </p>
          <p>
            <span className="text-primary font-semibold">API Client:</span> Axios
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-4 border-t border-border/20 text-center text-sm text-muted-foreground">
        <p>Made with creativity and AI magic</p>
        <p className="text-xs mt-2">MoodFlix Omni v1.0</p>
      </div>
    </div>
  )
}
