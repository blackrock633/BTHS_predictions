'use client'

import { useState } from 'react'
import { cancelBet } from '@/app/portfolio/actions'

export default function CancelBetButton({ betId, isAlive }: { betId: string, isAlive: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = async () => {
    setLoading(true)
    setError('')
    const result = await cancelBet(betId)
    if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  if (!isAlive) return null

  return (
    <div className="flex flex-col items-end gap-1">
      <button 
        onClick={handleCancel}
        disabled={loading}
        className="px-3 py-1 bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold text-[10px] rounded uppercase tracking-widest transition-colors disabled:opacity-50"
      >
        {loading ? 'Canceling...' : 'Cash Out'}
      </button>
      {error && <span className="text-[10px] text-red-500 font-mono max-w-[100px] text-right leading-tight">{error}</span>}
    </div>
  )
}
