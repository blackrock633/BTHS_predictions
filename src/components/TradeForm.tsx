'use client'

import { useState } from 'react'
import { placeBet } from '@/app/trade/[id]/actions'

export default function TradeForm({ 
  candidateId, 
  candidateName, 
  userBalance,
  isDisabled 
}: { 
  candidateId: string
  candidateName: string
  userBalance: number
  isDisabled: boolean
}) {
  const [amount, setAmount] = useState('10')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleQuickAmount = (val: string) => {
    setAmount(val)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setError('')
    
    const amountInCents = Math.floor(parseFloat(amount) * 100)
    
    if (isNaN(amountInCents) || amountInCents <= 0) {
      setError('[ERR] Invalid numeric value input.')
      setIsSubmitting(false)
      return
    }

    if (amountInCents > userBalance && !isDisabled) {
      setError('[ERR] Insufficient liquidity detected.')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('candidateId', candidateId)
      formData.append('amount', amountInCents.toString())

      const result = await placeBet(formData)
      
      if (result.error) {
        setError(`[ERR] ${result.error}`)
      } else {
        setMessage(`[SYS] Contract Executed: $${parseFloat(amount).toFixed(2)} on ${candidateName}.`)
        setAmount('')
      }
    } catch (err) {
      setError('[ERR] System failure during execution.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label htmlFor="amount" className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider">Input Volatility ($)</label>
          <span className="text-[10px] text-[#00E0FF] font-mono tracking-widest border border-[#00E0FF]/30 bg-[#00E0FF]/10 px-2 py-0.5 rounded">
            LIQ: ${(userBalance / 100).toFixed(2)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA0AA] font-mono font-bold">$</span>
          <input 
            id="amount" 
            type="number" 
            min="1" 
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isDisabled || isSubmitting}
            className="w-full pl-8 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white text-xl h-14 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {['5', '10', '25', '50'].map((val) => (
          <button
            key={val}
            type="button"
            disabled={isDisabled || isSubmitting}
            onClick={() => handleQuickAmount(val)}
            className="flex-1 font-mono text-sm bg-transparent border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.05)] py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            ${val}
          </button>
        ))}
      </div>

      {error && <div className="text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>}
      {message && <div className="text-xs font-mono text-[#00E0FF] bg-[#00E0FF]/10 border border-[#00E0FF]/20 p-3 rounded-lg">{message}</div>}

      <button 
        type="submit" 
        disabled={isDisabled || isSubmitting}
        className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white font-bold text-lg h-14 rounded-xl uppercase tracking-widest shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isSubmitting ? 'Processing...' : `Execute`}
      </button>
    </form>
  )
}
