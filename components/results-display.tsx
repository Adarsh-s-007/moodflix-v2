"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

interface Result {
  id: string
  title: string
  year: number
  rating: number
  badge: "Netflix" | "Prime" | "Spotify"
  image: string
  reason: string
}

interface ResultsDisplayProps {
  results: Result[]
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [visibleCount, setVisibleCount] = useState(7)

  const visibleResults = results.slice(0, visibleCount)
  const hasMore = visibleCount < results.length

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case "Netflix":
        return "bg-red-900/50 text-red-300 border-red-700/50"
      case "Prime":
        return "bg-blue-900/50 text-blue-300 border-blue-700/50"
      case "Spotify":
        return "bg-green-900/50 text-green-300 border-green-700/50"
      default:
        return "bg-primary/30 text-primary border-primary/50"
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-balance">Your Recommendations</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleResults.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-lg cursor-pointer"
          >
            <div className="glass p-4 h-full flex flex-col transition-all duration-300 group-hover:translate-y-0 hover:shadow-lg hover:shadow-primary/20">
              {/* Image */}
              <div className="relative overflow-hidden rounded-md mb-3 aspect-video bg-muted">
                <img
                  src={result.image || "/placeholder.svg?height=200&width=300&query=album-cover"}
                  alt={result.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge */}
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold border ${getBadgeStyles(result.badge)}`}
                >
                  {result.badge}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{result.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{result.year}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(result.rating / 2) ? "fill-yellow-400 text-yellow-400" : "text-muted"}
                    />
                  ))}
                </div>

                {/* AI Reasoning - Hidden on default, shown on hover */}
                <div className="text-xs text-muted-foreground line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/5 p-2 rounded">
                  {result.reason}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        {hasMore ? (
          <button
            onClick={() => setVisibleCount(visibleCount + 7)}
            className="px-8 py-3 bg-primary/20 border border-primary text-primary rounded-full hover:bg-primary/30 transition-colors font-medium"
          >
            Show More
          </button>
        ) : (
          <p className="text-muted-foreground text-center py-4">That's all we found!</p>
        )}
      </div>
    </div>
  )
}
