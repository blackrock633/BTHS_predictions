import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function PlayersPage() {
  let playerCandidates: any[] = []
  let totalPool = 0

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('candidates')
        .select(`id, name, is_alive, is_winner, bets (amount)`)
        
      if (!error && data) {
        const allCandidates = data.map(c => {
          const isStat = c.name.startsWith('[STAT]')
          return {
            id: c.id,
            name: c.name,
            is_alive: c.is_alive,
            is_winner: c.is_winner,
            category: isStat ? 'stat' : 'player',
            pool_amount: c.bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0
          }
        })
        
        playerCandidates = allCandidates.filter(c => c.category === 'player').sort((a, b) => b.pool_amount - a.pool_amount)
        totalPool = playerCandidates.reduce((sum, c) => sum + c.pool_amount, 0)
      }
    }
  } catch (e) {}

  return (
    <div className="container mx-auto px-4 py-16 max-w-[1000px] animate-fade-down space-y-12">
      <Link href="/" className="inline-flex items-center gap-2 text-[#9CA0AA] font-mono text-sm hover:text-white transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
        [RETURN_TO_MARKETS]
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
            Senior Assassin Winner
          </h1>
          <p className="font-mono text-sm text-[#9CA0AA] tracking-tight mt-2">
            Select a candidate below to predict if they will be the final survivor.
          </p>
        </div>
        
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 shrink-0">
          <p className="text-[14px] font-mono font-medium text-[#9CA0AA] uppercase tracking-wider mb-2">Global Liquidity</p>
          <p className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#00E0FF] to-[#7C5CFF]">
            ${(totalPool / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                <th className="p-6 font-mono text-[12px] text-white uppercase tracking-widest font-bold">Candidate</th>
                <th className="p-6 font-mono text-[12px] text-[#00E0FF] uppercase tracking-widest font-bold text-center border-l border-[rgba(255,255,255,0.1)]">Pool</th>
                <th className="p-6 font-mono text-[12px] text-[#9CA0AA] uppercase tracking-widest font-bold text-center border-l border-[rgba(255,255,255,0.1)]">Implied Odds</th>
                <th className="p-6 font-mono text-[12px] text-[#7C5CFF] uppercase tracking-widest font-bold text-center border-l border-[rgba(255,255,255,0.1)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {playerCandidates.map((c) => {
                const odds = totalPool > 0 ? (c.pool_amount / totalPool * 100).toFixed(1) : '0.0'

                return (
                  <tr key={c.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-6">
                      <span className={`text-2xl font-black ${!c.is_alive ? 'text-white/40 line-through' : 'text-white'} ${c.is_winner ? 'text-emerald-500' : ''}`}>
                        {c.name}
                      </span>
                    </td>
                    
                    <td className="p-6 border-l border-[rgba(255,255,255,0.1)] text-center align-middle">
                      <p className="font-mono text-sm text-white">${(c.pool_amount / 100).toFixed(2)}</p>
                    </td>

                    <td className="p-6 border-l border-[rgba(255,255,255,0.1)] text-center align-middle">
                      <p className="font-mono text-sm text-[#9CA0AA]">{odds}%</p>
                    </td>

                    <td className="p-6 border-l border-[rgba(255,255,255,0.1)] text-center align-middle">
                      {c.is_winner ? (
                         <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded">Winner</span>
                      ) : c.is_alive ? (
                        <Link href={`/trade/${c.id}`}>
                          <button className="px-6 py-2 rounded-lg font-bold text-[12px] uppercase tracking-wider bg-[rgba(124,92,255,0.1)] text-[#7C5CFF] hover:bg-[#7C5CFF] hover:text-white transition-all border border-[#7C5CFF]/30">
                            Trade Contract
                          </button>
                        </Link>
                      ) : (
                         <span className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded">Eliminated</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {playerCandidates.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center font-mono text-[#9CA0AA]">[SYS] No candidates found in this market.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
