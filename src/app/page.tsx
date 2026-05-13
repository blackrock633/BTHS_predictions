import { createClient } from '@/utils/supabase/server'
import MarketGrid from '@/components/MarketGrid'

export default async function Home() {
  let playerCandidates: any[] = []
  let statCandidates: any[] = []
  let groupedStatCandidates: any[] = []
  let totalPool = 0

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          id, 
          name, 
          is_alive, 
          is_winner,
          bets (amount)
        `)
        
      if (!error && data) {
        const allCandidates = data.map(c => {
          const isStat = c.name.startsWith('[STAT]')
          let isGrouped = false
          let groupName = null
          let rawName = c.name
          
          if (isStat) {
            rawName = c.name.replace('[STAT] ', '')
            if (rawName.includes('|')) {
              isGrouped = true
              groupName = rawName.split('|')[0]
            }
          }
          
          return {
            id: c.id,
            name: rawName,
            is_alive: c.is_alive,
            is_winner: c.is_winner,
            category: isStat ? 'stat' : 'player',
            isGrouped,
            groupName,
            pool_amount: c.bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0
          }
        })
        
        playerCandidates = allCandidates.filter(c => c.category === 'player').sort((a, b) => b.pool_amount - a.pool_amount)
        statCandidates = allCandidates.filter(c => c.category === 'stat' && !c.isGrouped).sort((a, b) => b.pool_amount - a.pool_amount)
        
        // Group the grouped stats
        const groupedMap = new Map<string, number>()
        allCandidates.filter(c => c.isGrouped).forEach(c => {
          const current = groupedMap.get(c.groupName) || 0
          groupedMap.set(c.groupName, current + c.pool_amount)
        })
        
        groupedMap.forEach((pool, name) => {
          groupedStatCandidates.push({
            name,
            pool_amount: pool
          })
        })
        
        totalPool = allCandidates.reduce((sum, c) => sum + c.pool_amount, 0)
      }
    }
  } catch (e) {
    // Silently fail
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-20 max-w-[1200px] space-y-24 animate-fade-down">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E0FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E0FF]"></span>
            </span>
            <span className="text-white/80 font-mono text-xs uppercase tracking-[0.2em] font-bold">Live Market</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter lg:text-8xl uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#7C5CFF]/60 animate-text-gradient pb-2 leading-[0.9]">
            Who will survive?
          </h1>
          <p className="text-[#9CA0AA] text-xl max-w-xl font-medium leading-relaxed">
            Place your bets on anything BTHS related. Dynamic odds powered by pari-mutuel pooling on the edge.
          </p>
        </div>
        
        <div className="bg-[rgba(10,10,15,0.4)] backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] p-8 shrink-0 md:min-w-[320px] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(124,92,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <p className="text-[13px] font-mono font-medium text-[#9CA0AA] uppercase tracking-widest mb-3">Global Liquidity</p>
          <p className="text-6xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] animate-text-gradient" style={{ backgroundSize: '200% auto' }}>
            ${(totalPool / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Daily Statistics Section */}
      {(statCandidates.length > 0 || groupedStatCandidates.length > 0) && (
        <section className="space-y-10">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Daily Statistics</h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          {groupedStatCandidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {groupedStatCandidates.map((group, idx) => (
                <div key={idx} className="relative group perspective-1000" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
                  <div className="bg-[rgba(10,10,15,0.4)] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,224,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col h-full overflow-hidden transform-gpu">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#00E0FF]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-700 group-hover:bg-[#7C5CFF]/30 group-hover:scale-150"></div>
                    
                    <div className="flex justify-between items-start mb-6 z-10">
                      <div className="h-14 w-14 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] bg-white/5 flex items-center justify-center backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                      </div>
                      <span className="bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/20 font-mono rounded-full uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                        Group Market
                      </span>
                    </div>

                    <div className="mb-8 z-10 flex-1">
                      <h3 className="text-2xl font-bold tracking-tight mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-colors">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-5">
                        <div>
                          <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-widest mb-1">Total Pool</p>
                          <p className="font-mono text-xl text-[#00E0FF] font-bold">${(group.pool_amount / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <a href={`/stat-group/${encodeURIComponent(group.name)}`} className="mt-auto z-10 w-full block">
                      <button className="w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all duration-300 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20">
                        View Thresholds
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {statCandidates.length > 0 && <MarketGrid candidates={statCandidates} totalPool={totalPool} />}
        </section>
      )}

      {/* Player Markets Section */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Senior Assassin Winner</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="relative group perspective-1000" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
            <div className="bg-[rgba(10,10,15,0.4)] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,224,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col h-full overflow-hidden transform-gpu">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00E0FF]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-700 group-hover:bg-[#7C5CFF]/30 group-hover:scale-150"></div>
              
              <div className="flex justify-between items-start mb-6 z-10">
                <div className="h-14 w-14 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] bg-white/5 flex items-center justify-center backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className="bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/20 font-mono rounded-full uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                  Global Market
                </span>
              </div>

              <div className="mb-8 z-10 flex-1">
                <h3 className="text-2xl font-bold tracking-tight mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-colors">
                  Senior Assassin Winner
                </h3>
                <div className="flex items-center gap-4 mt-5">
                  <div>
                    <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-widest mb-1">Total Combined Pool</p>
                    <p className="font-mono text-xl text-[#00E0FF] font-bold">${(playerCandidates.reduce((sum, c) => sum + c.pool_amount, 0) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <a href={`/players`} className="mt-auto z-10 w-full block">
                <button className="w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all duration-300 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20">
                  View Candidates
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
