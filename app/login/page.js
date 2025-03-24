
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from '@/components/layouts/AuthLayout'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await login(data)
      router.push('/channels/@me')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-discord-gray-light rounded-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome back!</h2>
        <p className="text-discord-gray-muted text-center mb-6">We're so excited to see you again!</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              EMAIL
            </label>
            <input
              type="email"
              className="input-field"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <p className="text-discord-red text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-discord-gray-muted"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-discord-red text-sm mt-1">{errors.password.message}</p>
            )}
            <Link href="/forgot-password" className="text-discord-primary text-sm hover:underline block mt-1">
              Forgot your password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="button-primary w-full py-3 font-medium"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
          
          <p className="text-discord-gray-muted text-sm">
            Need an account? <Link href="/register" className="text-discord-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
