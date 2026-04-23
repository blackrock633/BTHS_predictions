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
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-[1200px] space-y-16 animate-fade-down">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md mb-2">
            <span className="text-[#00E0FF] font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E0FF] animate-pulse"></span>
              Live Market
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter lg:text-7xl uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
            Who will survive?
          </h1>
          <p className="text-[#9CA0AA] text-lg max-w-xl font-medium">
            Place your bets on anything BTHS related. Dynamic odds powered by pari-mutuel pooling.
          </p>
        </div>
        
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 shrink-0 md:min-w-[280px]">
          <p className="text-[14px] font-mono font-medium text-[#9CA0AA] uppercase tracking-wider mb-2">Global Liquidity</p>
          <p className="text-5xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]">
            ${(totalPool / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Daily Statistics Section */}
      {(statCandidates.length > 0 || groupedStatCandidates.length > 0) && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Daily Statistics</h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent"></div>
          </div>
          
          {groupedStatCandidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {groupedStatCandidates.map((group, idx) => (
                <div key={idx} className="relative group perspective-1000" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
                  <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[8px] border border-[#00E0FF]/30 rounded-[18px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-[#00E0FF]/80 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,224,255,0.2)] flex flex-col h-full overflow-hidden transform-gpu" style={{ transform: 'translateZ(0)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E0FF]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-500 group-hover:bg-[#7C5CFF]/20"></div>
                    
                    <div className="flex justify-between items-start mb-6 z-10">
                      <div className="h-14 w-14 rounded-full border border-[rgba(255,255,255,0.2)] shadow-xl bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                      </div>
                      <span className="bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/30 font-mono rounded-md uppercase tracking-wider text-[10px] px-2 py-1">
                        Group Market
                      </span>
                    </div>

                    <div className="mb-8 z-10 flex-1">
                      <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-4">
                        <div>
                          <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-wider">Total Combined Pool</p>
                          <p className="font-mono text-lg text-[#00E0FF]">${(group.pool_amount / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <a href={`/stat-group/${encodeURIComponent(group.name)}`} className="mt-auto z-10 w-full block">
                      <button className="w-full py-3 rounded-xl font-bold text-[14px] uppercase tracking-wider transition-all duration-300 bg-[rgba(255,255,255,0.05)] text-white hover:bg-white hover:text-black border border-[rgba(255,255,255,0.1)]">
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
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Target Entities</h2>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent"></div>
        </div>
        <MarketGrid candidates={playerCandidates} totalPool={totalPool} />
      </section>
    </div>
  )
}
