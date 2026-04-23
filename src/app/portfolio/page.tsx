import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CancelBetButton from '@/components/CancelBetButton'

export default async function PortfolioPage() {
  let isDbConnected = false
  let portfolio = {
    balance: 0,
    activePositions: [] as any[],
    transactions: [] as any[]
  }

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        redirect('/login')
      }

      // Fetch user profile
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
      
      // Fetch user bets joined with candidate data
      const { data: bets } = await supabase
        .from('bets')
        .select(`
          id,
          amount,
          created_at,
          candidate_id,
          candidates (
            name,
            is_alive,
            bets (amount)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (profile && bets && transactions) {
        isDbConnected = true
        
        // Calculate global pool to determine odds
        const { data: allBets } = await supabase.from('bets').select('amount')
        const totalGlobalPool = allBets?.reduce((sum, b) => sum + b.amount, 0) || 0

        const activePositions = bets.map(bet => {
          const candidateData = bet.candidates as any
          const candidatePool = candidateData?.bets?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0
          const impliedOdds = totalGlobalPool > 0 ? (candidatePool / totalGlobalPool) * 100 : 0
          
          // If you wagered X, and candidate pool is Y, your share is X/Y. 
          // Total payout if they win is (X/Y) * totalGlobalPool
          const userShare = candidatePool > 0 ? (bet.amount / candidatePool) : 0
          const potentialReturn = userShare * totalGlobalPool

          const rawName = candidateData?.name || 'Unknown'
          
          return {
            id: bet.id,
            candidateName: rawName.startsWith('[STAT]') ? rawName.replace('[STAT] ', '') : rawName,
            is_alive: candidateData?.is_alive || false,
            amountWagered: bet.amount,
            impliedOdds,
            potentialReturn
          }
        })

        portfolio = {
          balance: profile.balance,
          activePositions,
          transactions: transactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: Math.abs(tx.amount), // Amount is usually stored as negative for bets, positive for deposits
            date: tx.created_at
          }))
        }
      }
    }
  } catch (e) {
    // Silently fail
  }

  const totalPositionsValue = portfolio.activePositions.reduce((sum, pos) => sum + pos.amountWagered, 0)
  const totalAccountValue = portfolio.balance + totalPositionsValue

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1200px] animate-fade-down space-y-12">
      {/* Top Level Summary (Like Kalshi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]"></div>
          <p className="font-mono text-[#9CA0AA] text-sm uppercase tracking-widest mb-2">Total Portfolio Value</p>
          <p className="text-6xl font-black text-white tracking-tighter">${(totalAccountValue / 100).toFixed(2)}</p>
          
          <div className="flex gap-12 mt-8 border-t border-[rgba(255,255,255,0.1)] pt-6">
            <div>
              <p className="font-mono text-[#9CA0AA] text-xs uppercase tracking-widest mb-1">Cash Balance</p>
              <p className="text-2xl font-bold text-white">${(portfolio.balance / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-mono text-[#9CA0AA] text-xs uppercase tracking-widest mb-1">Active Positions</p>
              <p className="text-2xl font-bold text-[#00E0FF]">${(totalPositionsValue / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8 flex flex-col justify-center gap-4">
          <h2 className="font-bold text-xl uppercase tracking-tighter mb-2">Manage Funds</h2>
          <Link href="/deposit">
            <button className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white font-bold text-sm h-12 rounded-xl uppercase tracking-widest shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)] active:scale-[0.98]">
              Deposit
            </button>
          </Link>
          <button disabled className="w-full font-mono text-sm uppercase tracking-wider bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-white/50 h-12 rounded-xl cursor-not-allowed">
            Withdraw (Locked)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Positions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00E0FF] animate-pulse"></span>
            Your Positions
          </h2>
          
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal">Target</th>
                    <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal text-right">Wagered</th>
                    <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal text-right">Current Odds</th>
                    <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal text-right">Potential Payout</th>
                    <th className="p-4 font-mono text-[10px] text-[#9CA0AA] uppercase tracking-widest font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {portfolio.activePositions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center font-mono text-sm text-[#9CA0AA]">
                        [SYS_INFO] No active positions detected.
                      </td>
                    </tr>
                  ) : (
                    portfolio.activePositions.map(pos => (
                      <tr key={pos.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className={`font-bold ${!pos.is_alive ? 'text-white/40 line-through' : 'text-white'}`}>
                              {pos.candidateName}
                            </span>
                            <span className={`font-mono text-[10px] uppercase tracking-wider ${pos.is_alive ? 'text-[#00E0FF]' : 'text-red-500'}`}>
                              {pos.is_alive ? 'Active' : 'Eliminated'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono text-white">
                          ${(pos.amountWagered / 100).toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono text-[#9CA0AA]">
                          {pos.impliedOdds.toFixed(1)}%
                        </td>
                        <td className="p-4 text-right font-mono text-[#00E0FF] font-bold">
                          ${(pos.potentialReturn / 100).toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                          <CancelBetButton betId={pos.id} isAlive={pos.is_alive} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">History</h2>
          
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col h-[500px]">
            <div className="overflow-y-auto flex-1 p-2">
              {portfolio.transactions.length === 0 ? (
                <div className="p-8 text-center font-mono text-sm text-[#9CA0AA]">
                  [SYS_INFO] Transaction ledger empty.
                </div>
              ) : (
                <div className="space-y-2">
                  {portfolio.transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <div>
                        <p className="font-bold text-white uppercase tracking-tight text-sm">
                          {tx.type === 'deposit' ? 'Funds Deposit' : tx.type === 'bet' ? 'Contract Executed' : 'Payout / Refund'}
                        </p>
                        <p className="font-mono text-[10px] text-[#9CA0AA]">
                          {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className={`font-mono font-bold ${tx.type === 'deposit' || tx.type === 'payout' ? 'text-emerald-500' : 'text-white'}`}>
                        {tx.type === 'deposit' || tx.type === 'payout' ? '+' : '-'}${(tx.amount / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
