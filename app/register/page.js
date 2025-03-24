
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from '@/components/layouts/AuthLayout'

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await registerUser(data)
      toast.success('Registration successful! Please log in.')
      router.push('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-discord-gray-light rounded-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Create an account</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              USERNAME
            </label>
            <input
              type="text"
              className="input-field"
              {...register('username', { 
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 32,
                  message: 'Username must be less than 32 characters'
                }
              })}
            />
            {errors.username && (
              <p className="text-discord-red text-sm mt-1">{errors.username.message}</p>
            )}
          </div>
          
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              className="input-field"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === watch('password') || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-discord-red text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="button-primary w-full py-3 font-medium"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
          
          <p className="text-discord-gray-muted text-sm">
            Already have an account? <Link href="/login" className="text-discord-primary hover:underline">Log In</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
