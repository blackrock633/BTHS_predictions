import { createClient } from '@/utils/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import TradeForm from '@/components/TradeForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let candidate: any = null
  let isDbConnected = false
  let userBalance = 0 
  let userId = null
  let totalPool = 0

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
        if (profile) userBalance = profile.balance
      } else {
        redirect('/login')
      }

      const { data, error } = await supabase
        .from('candidates')
        .select(`id, name, is_alive, is_winner, bets (amount)`)
        .eq('id', id)
        .single()
        
      if (!error && data) {
        isDbConnected = true
        const rawName = data.name
        candidate = {
          id: data.id,
          name: rawName.startsWith('[STAT]') ? rawName.replace('[STAT] ', '') : rawName,
          is_alive: data.is_alive,
          pool_amount: data.bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0
        }
        
        const { data: allBets } = await supabase.from('bets').select('amount')
        totalPool = allBets?.reduce((sum, bet) => sum + bet.amount, 0) || 0
      }
    }
  } catch (e) {}

  if (!candidate) {
    return <div className="container mx-auto p-8 text-center font-mono text-[#9CA0AA]">[SYS_ERR] Candidate Entity Not Found</div>
  }

  const impliedOdds = totalPool > 0 ? (candidate.pool_amount / totalPool) * 100 : 0
  const potentialReturn = candidate.pool_amount > 0 ? (totalPool / candidate.pool_amount).toFixed(2) : '0.00'

  return (
    <div className="container mx-auto px-4 py-16 max-w-[1000px] animate-fade-down">
      <Link href="/" className="inline-flex items-center gap-2 text-[#9CA0AA] font-mono text-sm hover:text-white transition-colors mb-12 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
        [RETURN_TO_MARKETS]
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col: Info */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-[rgba(255,255,255,0.1)] shadow-2xl bg-[rgba(0,0,0,0.5)]">
              <AvatarFallback className="bg-transparent text-white font-black text-3xl">
                {candidate.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="inline-block px-3 py-1 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] mb-3">
                <span className={`font-mono text-[10px] uppercase tracking-widest font-semibold ${candidate.is_alive ? 'text-[#00E0FF]' : 'text-red-500'}`}>
                  {candidate.is_alive ? 'Status: Active' : 'Status: Eliminated'}
                </span>
              </div>
              <h1 className={`text-4xl lg:text-5xl font-black uppercase tracking-tighter ${!candidate.is_alive ? 'text-white/40 line-through' : 'text-white'}`}>
                {candidate.name}
              </h1>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8">
            <h2 className="font-mono text-[#9CA0AA] text-sm uppercase tracking-widest border-b border-[rgba(255,255,255,0.1)] pb-4 mb-6">Market Statistics</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-wider mb-2">Implied Probability</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">{impliedOdds.toFixed(1)}<span className="text-2xl text-[#9CA0AA]">%</span></span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-wider mb-1">Entity Pool</p>
                  <p className="font-mono text-xl text-white">${(candidate.pool_amount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[12px] font-mono text-[#9CA0AA] uppercase tracking-wider mb-1">Global Return</p>
                  <p className="font-mono text-xl text-[#00E0FF]">{potentialReturn}x Multiplier</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Trade Form */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]"></div>
            
            <div className="p-8">
              <h2 className="font-bold text-2xl uppercase tracking-tighter mb-2">Execute Contract</h2>
              <p className="font-mono text-sm text-[#9CA0AA] mb-8">Target: {candidate.name}</p>

              {candidate.is_alive ? (
                <TradeForm 
                  candidateId={candidate.id} 
                  candidateName={candidate.name}
                  userBalance={userBalance} 
                  isDisabled={!isDbConnected}
                />
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl text-center font-mono text-sm">
                  [SYS_LOCK] Target eliminated. Trading restricted.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
