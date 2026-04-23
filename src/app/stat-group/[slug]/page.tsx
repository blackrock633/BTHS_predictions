import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function StatGroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const groupName = decodeURIComponent(slug)
  
  let thresholds: { [key: string]: { over: any, under: any } } = {}
  let totalGroupPool = 0

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('candidates')
        .select(`id, name, is_alive, is_winner, bets (amount)`)
        .like('name', `[STAT] ${groupName}|%`)
        
      if (!error && data) {
        data.forEach(c => {
          const rawName = c.name.replace('[STAT] ', '')
          const parts = rawName.split('|')
          if (parts.length === 3) {
            const threshold = parts[1]
            const direction = parts[2].toLowerCase() // over or under
            
            const pool_amount = c.bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0
            totalGroupPool += pool_amount

            if (!thresholds[threshold]) {
              thresholds[threshold] = { over: null, under: null }
            }
            
            thresholds[threshold][direction as 'over'|'under'] = {
              id: c.id,
              pool_amount,
              is_alive: c.is_alive,
              is_winner: c.is_winner
            }
          }
        })
      }
    }
  } catch (e) {}

  // Sort thresholds numerically
  const sortedThresholds = Object.keys(thresholds).sort((a, b) => parseFloat(a) - parseFloat(b))

  return (
    <div className="container mx-auto px-4 py-16 max-w-[1000px] animate-fade-down space-y-12">
      <Link href="/" className="inline-flex items-center gap-2 text-[#9CA0AA] font-mono text-sm hover:text-white transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
        [RETURN_TO_MARKETS]
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
            {groupName}
          </h1>
          <p className="font-mono text-sm text-[#9CA0AA] tracking-tight mt-2">
            Select a threshold below to predict if the final result will be Over or Under.
          </p>
        </div>
        
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 shrink-0">
          <p className="text-[14px] font-mono font-medium text-[#9CA0AA] uppercase tracking-wider mb-2">Group Liquidity</p>
          <p className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#00E0FF] to-[#7C5CFF]">
            ${(totalGroupPool / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                <th className="p-6 font-mono text-[12px] text-white uppercase tracking-widest font-bold">Threshold</th>
                <th className="p-6 font-mono text-[12px] text-[#00E0FF] uppercase tracking-widest font-bold text-center border-l border-[rgba(255,255,255,0.1)]">Over Pool</th>
                <th className="p-6 font-mono text-[12px] text-[#7C5CFF] uppercase tracking-widest font-bold text-center border-l border-[rgba(255,255,255,0.1)]">Under Pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {sortedThresholds.map((t) => {
                const over = thresholds[t].over
                const under = thresholds[t].under
                const poolTotal = (over?.pool_amount || 0) + (under?.pool_amount || 0)
                
                const overOdds = poolTotal > 0 ? (over.pool_amount / poolTotal * 100).toFixed(0) : '0'
                const underOdds = poolTotal > 0 ? (under.pool_amount / poolTotal * 100).toFixed(0) : '0'

                return (
                  <tr key={t} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-6">
                      <span className="text-3xl font-black text-white">{t}</span>
                    </td>
                    
                    {/* Over Column */}
                    <td className="p-6 border-l border-[rgba(255,255,255,0.1)] text-center align-middle">
                      {over ? (
                        <div className="flex flex-col items-center gap-3">
                          <div>
                            <p className="font-mono text-sm text-white">${(over.pool_amount / 100).toFixed(2)}</p>
                            <p className="font-mono text-[10px] text-[#9CA0AA] uppercase">Implied: {overOdds}%</p>
                          </div>
                          {over.is_winner ? (
                             <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded">Winner</span>
                          ) : over.is_alive ? (
                            <Link href={`/trade/${over.id}`}>
                              <button className="px-6 py-2 rounded-lg font-bold text-[12px] uppercase tracking-wider bg-[rgba(0,224,255,0.1)] text-[#00E0FF] hover:bg-[#00E0FF] hover:text-black transition-all border border-[#00E0FF]/30">
                                Trade Over
                              </button>
                            </Link>
                          ) : (
                             <span className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded">Lost</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#9CA0AA]">-</span>
                      )}
                    </td>

                    {/* Under Column */}
                    <td className="p-6 border-l border-[rgba(255,255,255,0.1)] text-center align-middle">
                      {under ? (
                        <div className="flex flex-col items-center gap-3">
                          <div>
                            <p className="font-mono text-sm text-white">${(under.pool_amount / 100).toFixed(2)}</p>
                            <p className="font-mono text-[10px] text-[#9CA0AA] uppercase">Implied: {underOdds}%</p>
                          </div>
                          {under.is_winner ? (
                             <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded">Winner</span>
                          ) : under.is_alive ? (
                            <Link href={`/trade/${under.id}`}>
                              <button className="px-6 py-2 rounded-lg font-bold text-[12px] uppercase tracking-wider bg-[rgba(124,92,255,0.1)] text-[#7C5CFF] hover:bg-[#7C5CFF] hover:text-white transition-all border border-[#7C5CFF]/30">
                                Trade Under
                              </button>
                            </Link>
                          ) : (
                             <span className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded">Lost</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#9CA0AA]">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {sortedThresholds.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center font-mono text-[#9CA0AA]">[SYS] No thresholds found for this group.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
