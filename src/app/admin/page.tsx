'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { addCandidate, eliminateCandidate, reviveCandidate, resolveMarket } from './actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [passcode, setPasscode] = useState('')
  const [newCandidateName, setNewCandidateName] = useState('')
  const [newCandidateCategory, setNewCandidateCategory] = useState('player')
  const [batchResolveGroup, setBatchResolveGroup] = useState('Kills by 12AM')
  const [batchResolveResult, setBatchResolveResult] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  const supabase = createClient()

   useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === 'noah633@icloud.com') {
        setIsAuthorized(true)
        fetchCandidates()
      } else {
        setIsAuthorized(false)
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const fetchCandidates = async () => {
    const { data } = await supabase.from('candidates').select('id, name, is_alive, is_winner').order('name')
    if (data) {
      setCandidates(data.map(c => {
        const isStat = c.name.startsWith('[STAT]')
        let isGrouped = false
        let rawName = c.name
        
        if (isStat) {
          rawName = c.name.replace('[STAT] ', '')
          if (rawName.includes('|')) isGrouped = true
        }
        
        return {
          ...c,
          category: isStat ? 'stat' : 'player',
          isGrouped,
          displayName: isStat ? rawName : c.name
        }
      }))
    }
    setLoading(false)
  }

  const handleAction = async (actionFn: any, candidateId: string) => {
    if (!passcode) {
      setError('[ERR] Passcode required for execution.')
      return
    }

    setActionLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('candidateId', candidateId)
    formData.append('winnerId', candidateId)
    formData.append('passcode', passcode)

    try {
      const result = await actionFn(formData)
      if (result.error) {
        setError(`[ERR] ${result.error}`)
      } else {
        setMessage(`[SYS] Command executed successfully.`)
        await fetchCandidates()
      }
    } catch (e) {
      setError('[ERR] Execution failure.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBatchResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode) {
      setError('[ERR] Passcode required for execution.')
      return
    }
    if (!batchResolveResult.trim() || isNaN(parseFloat(batchResolveResult))) {
      setError('[ERR] Valid numeric result required.')
      return
    }

    if (!confirm(`WARNING: Resolving ${batchResolveGroup} with result ${batchResolveResult} will permanently distribute payouts for ALL related thresholds. Proceed?`)) {
      return
    }

    setActionLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('groupName', batchResolveGroup)
    formData.append('actualResult', batchResolveResult)
    formData.append('passcode', passcode)

    try {
      // Import dynamically to avoid circular dependencies or weird build issues if needed
      const { resolveStatGroup } = await import('./actions')
      const result = await resolveStatGroup(formData)
      
      if (result.error) {
        setError(`[ERR] ${result.error}`)
      } else {
        setMessage(`[SYS] Batch resolution successful for ${batchResolveGroup}.`)
        setBatchResolveResult('')
        await fetchCandidates()
      }
    } catch (e) {
      setError('[ERR] Execution failure.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode) {
      setError('[ERR] Passcode required for execution.')
      return
    }
    if (!newCandidateName.trim()) {
      setError('[ERR] Target Entity name required.')
      return
    }

    setActionLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('name', newCandidateName)
    formData.append('category', newCandidateCategory)
    formData.append('passcode', passcode)

    try {
      const result = await addCandidate(formData)
      if (result.error) {
        setError(`[ERR] ${result.error}`)
      } else {
        setMessage(`[SYS] Entity ${newCandidateName} successfully registered.`)
        setNewCandidateName('')
        await fetchCandidates()
      }
    } catch (e) {
      setError('[ERR] Execution failure.')
    } finally {
      setActionLoading(false)
    }
  }

  if (isAuthorized === false) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-black text-red-500 uppercase mb-4 tracking-tighter">Access Denied</h1>
        <p className="font-mono text-[#9CA0AA] mb-8">Unauthorized entity detected. Incident has been logged.</p>
        <Link href="/" className="px-8 py-3 bg-white text-black font-bold rounded-xl uppercase tracking-widest text-sm">Return Home</Link>
      </div>
    )
  }

  if (isAuthorized === null) {
    return <div className="p-32 text-center font-mono text-[#9CA0AA] animate-pulse">[SYS] Verifying Credentials...</div>
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-[1000px] animate-fade-down">
      <Link href="/" className="inline-flex items-center gap-2 text-[#9CA0AA] font-mono text-sm hover:text-white transition-colors mb-12 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
        [RETURN_TO_MARKETS]
      </Link>

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800">
            System Override
          </h1>
          <p className="font-mono text-sm text-[#9CA0AA] tracking-tight mt-2">
            Admin console for target elimination and market resolution.
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <label className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block mb-2">Auth Passcode</label>
          <input 
            type="password" 
            placeholder="ENTER PASSCODE"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-red-500/30 rounded-xl font-mono text-white h-12 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-white/20"
          />
        </div>
      </div>

      {error && <div className="mb-8 text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{error}</div>}
      {message && <div className="mb-8 text-xs font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">{message}</div>}

      {/* Add New Candidate Form */}
      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]"></div>
        <h2 className="text-xl font-bold uppercase tracking-tighter mb-4">Register New Market Entity</h2>
        
        <div className="flex gap-4 mb-6">
          <button 
            type="button"
            onClick={() => setNewCandidateCategory('player')}
            className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${newCandidateCategory === 'player' ? 'bg-[#7C5CFF]/20 border-[#7C5CFF] text-white' : 'border-[rgba(255,255,255,0.1)] text-[#9CA0AA]'}`}
          >
            Player Winner
          </button>
          <button 
            type="button"
            onClick={() => setNewCandidateCategory('stat')}
            className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${newCandidateCategory === 'stat' ? 'bg-[#00E0FF]/20 border-[#00E0FF] text-white' : 'border-[rgba(255,255,255,0.1)] text-[#9CA0AA]'}`}
          >
            Daily Over/Under
          </button>
        </div>

        <form onSubmit={handleAddCandidate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block mb-2">Market Name</label>
            <input 
              type="text" 
              placeholder={newCandidateCategory === 'player' ? "e.g. John Doe" : "e.g. Daily Kills: Over 5.5"}
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              disabled={actionLoading}
              className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-12 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={actionLoading || !newCandidateName.trim()}
            className="w-full md:w-auto px-8 bg-transparent border border-[#7C5CFF]/50 text-[#7C5CFF] hover:bg-[#7C5CFF]/10 font-bold text-sm h-12 rounded-xl uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {actionLoading ? 'Processing...' : 'Register Market'}
          </button>
        </form>
      </div>

      {/* Batch Resolve Form */}
      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E0FF] to-[#7C5CFF]"></div>
        <h2 className="text-xl font-bold uppercase tracking-tighter mb-4 text-[#00E0FF]">Batch Resolve Group Statistics</h2>
        <p className="font-mono text-xs text-[#9CA0AA] mb-6">Enter the actual final result to automatically distribute payouts across all Over/Under thresholds for a group.</p>
        
        <form onSubmit={handleBatchResolve} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block mb-2">Group Name</label>
            <input 
              type="text" 
              value={batchResolveGroup}
              onChange={(e) => setBatchResolveGroup(e.target.value)}
              disabled={actionLoading}
              className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-12 focus:outline-none focus:border-[#00E0FF] focus:ring-1 focus:ring-[#00E0FF] transition-colors"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block mb-2">Actual Result (Number)</label>
            <input 
              type="number" 
              step="0.1"
              placeholder="e.g. 6"
              value={batchResolveResult}
              onChange={(e) => setBatchResolveResult(e.target.value)}
              disabled={actionLoading}
              className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-12 focus:outline-none focus:border-[#00E0FF] focus:ring-1 focus:ring-[#00E0FF] transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={actionLoading || !batchResolveResult.trim() || !batchResolveGroup.trim()}
            className="w-full md:w-auto px-8 bg-transparent border border-[#00E0FF]/50 text-[#00E0FF] hover:bg-[#00E0FF]/10 font-bold text-sm h-12 rounded-xl uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {actionLoading ? 'Processing...' : 'Resolve All'}
          </button>
        </form>
      </div>

      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-mono text-[#9CA0AA]">[SYS] Accessing target database...</div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center font-mono text-yellow-500">[WARN] Database missing candidates. Run seed.sql.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                  <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal">Market Entity</th>
                  <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal">Type</th>
                  <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal">Status</th>
                  <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal text-right">Execution Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {candidates.filter(c => !c.isGrouped).map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-[rgba(255,255,255,0.2)]">
                          <AvatarFallback className="bg-transparent text-white font-bold text-xs">
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`font-bold ${!candidate.is_alive ? 'text-white/40 line-through' : 'text-white'} ${candidate.is_winner ? 'text-emerald-500' : ''}`}>
                          {candidate.displayName} {candidate.is_winner && '(WINNER)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#9CA0AA]">
                        {candidate.category === 'player' ? 'Player' : 'Daily Stat'}
                      </span>
                    </td>
                    <td className="p-4">
                      {candidate.is_winner ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500">Declared Victor</span>
                      ) : candidate.is_alive ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#00E0FF]">Active</span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-red-500">Eliminated</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {candidate.is_alive && !candidate.is_winner && (
                        <>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleAction(eliminateCandidate, candidate.id)}
                            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 disabled:opacity-50"
                          >
                            Eliminate
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => {
                              if(confirm(`WARNING: Declaring ${candidate.displayName} the winner will resolve the market and permanently distribute all payouts from the pool. Proceed?`)) {
                                handleAction(resolveMarket, candidate.id)
                              }
                            }}
                            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20 disabled:opacity-50"
                          >
                            Declare Winner
                          </button>
                        </>
                      )}
                      
                      {!candidate.is_alive && !candidate.is_winner && (
                        <button 
                          disabled={actionLoading}
                          onClick={() => handleAction(reviveCandidate, candidate.id)}
                          className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded bg-transparent border border-[rgba(255,255,255,0.2)] text-[#9CA0AA] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Revive (Undo)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
