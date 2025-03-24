
import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-discord-dark">
      <header className="p-4">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Harmony Chat</h1>
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      
      <footer className="p-4 text-center text-discord-gray-muted text-sm">
        <p>&copy; {new Date().getFullYear()} Harmony Chat. All rights reserved.</p>
      </footer>
    </div>
  )
}
