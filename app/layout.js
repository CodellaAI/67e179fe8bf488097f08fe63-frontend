
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/providers/AuthProvider'
import SocketProvider from '@/providers/SocketProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Harmony Chat',
  description: 'A modern real-time chat application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-discord-dark text-white`}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: '#36393F',
                  color: '#DCDDDE',
                  border: '1px solid #202225',
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
