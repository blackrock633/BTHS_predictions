import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let balance = 0
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()
    if (profile) {
      balance = profile.balance
    }
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="fixed top-6 left-0 w-full flex justify-center z-50 px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-[1000px] bg-[rgba(10,10,15,0.4)] backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] animate-fade-down relative transition-all duration-500 hover:shadow-[0_12px_40px_rgba(124,92,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold uppercase tracking-widest text-lg flex items-center gap-3">
              <Image src="/logo.png" alt="BTHS Logo" width={32} height={32} className="rounded-md border border-[#7C5CFF]/30 shadow-[0_0_15px_rgba(124,92,255,0.4)]" />
              <span className="text-white">BTHS Predictions</span>
              <span className="font-mono text-xs bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded text-[#9CA0AA] tracking-normal border border-[rgba(255,255,255,0.1)] uppercase">Beta</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-[#9CA0AA] text-[14px] font-medium hover-underline-gradient pb-1 transition-colors hover:text-white">
                Markets
              </Link>
              {user && (
                <>
                  <Link href="/portfolio" className="text-[#9CA0AA] text-[14px] font-medium hover-underline-gradient pb-1 transition-colors hover:text-white">
                    Portfolio
                  </Link>
                  <Link href="/admin" className="text-red-500/70 text-[14px] font-medium hover-underline-gradient pb-1 transition-colors hover:text-red-400">
                    Admin Console
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="font-mono text-[#9CA0AA] text-xs uppercase tracking-widest">BAL</span>
                  <span className="font-mono text-[#00E0FF] text-sm font-bold bg-[#00E0FF]/10 px-3 py-1.5 rounded-full border border-[#00E0FF]/20">
                    ${(balance / 100).toFixed(2)}
                  </span>
                </div>
                
                <Link href="/deposit">
                  <button className="bg-white/5 border border-white/10 text-white text-[13px] font-semibold px-5 py-2 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    Deposit
                  </button>
                </Link>
                
                <form action={signOut}>
                  <button type="submit" className="text-[#9CA0AA] text-[14px] font-medium hover-underline-gradient pb-1 transition-colors hover:text-white">
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="bg-transparent text-white text-[13px] font-semibold px-5 py-2 rounded-full hover:bg-white/5 transition-all duration-300">
                    Log in
                  </button>
                </Link>
                <Link href="/login">
                  <button className="bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white text-[13px] font-bold px-6 py-2 rounded-full shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)]">
                    Sign Up Free
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
