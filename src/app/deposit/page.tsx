'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function DepositPage() {
  const [amount, setAmount] = useState('20')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
      }
    }
    checkUser()
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const parsedAmount = parseInt(amount, 10)
    if (isNaN(parsedAmount) || parsedAmount < 5) {
      setError('[ERR] Min threshold: $5')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parsedAmount * 100,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(`[ERR] ${data.error}`)
        return
      }

      const stripe = await stripePromise
      const { error: stripeError } = await (stripe as any).redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        setError(`[ERR] ${stripeError.message || 'System fault'}`)
      }
    } catch (err) {
      setError('[ERR] Fatal transmission error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-[600px] animate-fade-down flex flex-col items-center">
      <div className="w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-[#9CA0AA] font-mono text-sm hover:text-white transition-colors mb-12 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
          [RETURN]
        </Link>
        
        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">Initialize Liquidity</h1>
        <p className="text-[#9CA0AA] font-medium mb-10">Establish a secure bridge to transfer assets into the BTHS Predictions ecosystem.</p>
        
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]"></div>
          
          <form onSubmit={handleCheckout} className="space-y-8 mt-4">
            <div className="space-y-3">
              <label htmlFor="amount" className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider">Transfer Amount ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA0AA] font-mono font-bold text-xl">$</span>
                <input 
                  id="amount" 
                  type="number" 
                  min="5" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-8 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white text-2xl h-16 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {['20', '50', '100', '500'].map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setAmount(val)}
                  className="flex-1 font-mono text-sm bg-transparent border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.05)] py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  ${val}
                </button>
              ))}
            </div>

            {error && <div className="text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{error}</div>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white font-bold text-lg h-16 rounded-xl uppercase tracking-widest shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
            >
              {isLoading ? 'Establishing Connection...' : 'Secure Transfer via Stripe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
