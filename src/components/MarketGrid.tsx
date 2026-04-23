'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

export default function MarketGrid({ candidates, totalPool }: { candidates: any[], totalPool: number }) {
  const [search, setSearch] = useState('')

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA0AA]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          placeholder="Search for a target entity..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-14 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors"
        />
      </div>
      
      {filteredCandidates.length === 0 ? (
        <div className="py-20 text-center font-mono text-[#9CA0AA]">
          [SYS_INFO] No target entities matched your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => {
            const impliedOdds = totalPool > 0 ? (candidate.pool_amount / totalPool) * 100 : 0
            const potentialReturn = candidate.pool_amount > 0 ? (totalPool / candidate.pool_amount).toFixed(2) : '0.00'
            
            return (
              <div key={candidate.id} className="relative group perspective-1000" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
                <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.1)] rounded-[18px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-[#7C5CFF]/50 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(124,92,255,0.2)] flex flex-col h-full overflow-hidden transform-gpu" style={{ transform: 'translateZ(0)' }}>
                  
                  {/* Decorative background gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFF]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-500 group-hover:bg-[#00E0FF]/20"></div>

                  <div className="flex justify-between items-start mb-6 z-10">
                    <Avatar className="h-14 w-14 border border-[rgba(255,255,255,0.2)] shadow-xl bg-[rgba(0,0,0,0.5)]">
                      <AvatarFallback className="bg-transparent text-white font-bold text-xl">
                        {candidate.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {candidate.is_winner ? (
                       <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono rounded-md uppercase tracking-wider text-[10px] px-2 py-1">
                         Winner
                       </Badge>
                    ) : candidate.is_alive ? (
                      <Badge variant="outline" className="bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/30 font-mono rounded-md uppercase tracking-wider text-[10px] px-2 py-1">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 font-mono rounded-md uppercase tracking-wider text-[10px] px-2 py-1">
                        Eliminated
                      </Badge>
                    )}
                  </div>

                  <div className="mb-8 z-10 flex-1">
                    <h3 className={`text-2xl font-bold tracking-tight mb-1 ${!candidate.is_alive ? 'text-white/40 line-through' : 'text-white'} ${candidate.is_winner ? 'text-emerald-500' : ''}`}>
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-4">
                      <div>
                        <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-wider">Pool</p>
                        <p className="font-mono text-lg text-white">${(candidate.pool_amount / 100).toFixed(2)}</p>
                      </div>
                      <div className="h-8 w-[1px] bg-[rgba(255,255,255,0.1)]"></div>
                      <div>
                        <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-wider">Odds</p>
                        <p className="font-mono text-lg text-[#00E0FF]">{impliedOdds.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/trade/${candidate.id}`} className="mt-auto z-10 w-full block">
                    <button 
                      disabled={!candidate.is_alive || candidate.is_winner}
                      className={`w-full py-3 rounded-xl font-bold text-[14px] uppercase tracking-wider transition-all duration-300 ${
                        candidate.is_alive && !candidate.is_winner
                          ? "bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white shadow-[0_4px_14px_rgba(124,92,255,0.3)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.5)]" 
                          : "bg-[rgba(255,255,255,0.05)] text-white/30 cursor-not-allowed border border-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {candidate.is_winner ? 'Market Resolved' : 'Trade Contract'}
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
