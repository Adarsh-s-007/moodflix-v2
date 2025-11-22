"use client"

import { SignInButton, UserButton } from "@clerk/nextjs"

interface HeaderProps {
  isSignedIn: boolean | undefined
}

export default function Header({ isSignedIn }: HeaderProps) {
  return (
    <header className="border-b border-border/20 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold gradient-text">MoodFlix</div>
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 border border-primary text-primary rounded-full hover:bg-primary/10 transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
