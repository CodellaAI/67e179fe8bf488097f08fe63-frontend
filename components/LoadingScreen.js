
import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-discord-dark">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-discord-gray-lighter rounded-full opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-discord-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-discord-gray-text">Loading...</p>
      </div>
    </div>
  )
}
