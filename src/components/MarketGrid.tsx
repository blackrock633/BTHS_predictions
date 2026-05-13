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
    <div className="space-y-10">
      <div className="relative max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA0AA]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          placeholder="Search for a target entity..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 bg-[rgba(10,10,15,0.4)] backdrop-blur-xl border border-white/10 rounded-full font-mono text-white h-14 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E0FF]/50 focus:ring-1 focus:ring-[#00E0FF]/50 transition-all duration-300"
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
                <div className="bg-[rgba(10,10,15,0.4)] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(124,92,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col h-full overflow-hidden transform-gpu" style={{ transform: 'translateZ(0)' }}>
                  
                  {/* Decorative background gradient */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C5CFF]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-700 group-hover:bg-[#00E0FF]/30 group-hover:scale-150"></div>

                  <div className="flex justify-between items-start mb-6 z-10">
                    <Avatar className="h-14 w-14 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] bg-white/5 transition-transform duration-500 group-hover:scale-110">
                      <AvatarFallback className="bg-transparent text-white font-bold text-xl">
                        {candidate.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {candidate.is_winner ? (
                       <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono rounded-full uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                         Winner
                       </Badge>
                    ) : candidate.is_alive ? (
                      <Badge variant="outline" className="bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/20 font-mono rounded-full uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-mono rounded-full uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                        Eliminated
                      </Badge>
                    )}
                  </div>

                  <div className="mb-8 z-10 flex-1">
                    <h3 className={`text-2xl font-bold tracking-tight mb-1 transition-colors ${!candidate.is_alive ? 'text-white/40 line-through' : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60'} ${candidate.is_winner ? 'text-emerald-500 group-hover:text-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-400/60' : ''}`}>
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-5">
                      <div>
                        <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-widest mb-1">Pool</p>
                        <p className="font-mono text-xl text-white font-bold">${(candidate.pool_amount / 100).toFixed(2)}</p>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10"></div>
                      <div>
                        <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-widest mb-1">Odds</p>
                        <p className="font-mono text-xl text-[#00E0FF] font-bold">{impliedOdds.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/trade/${candidate.id}`} className="mt-auto z-10 w-full block">
                    <button 
                      disabled={!candidate.is_alive || candidate.is_winner}
                      className={`w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all duration-300 ${
                        candidate.is_alive && !candidate.is_winner
                          ? "bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white shadow-[0_4px_14px_rgba(124,92,255,0.3)] hover:scale-105 hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)]" 
                          : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
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
