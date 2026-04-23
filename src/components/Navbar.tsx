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
    <div className="fixed top-10 left-0 w-full flex justify-center z-50 px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-[1200px] bg-[rgba(255,255,255,0.06)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.18)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-down overflow-hidden relative">
        <div className="px-6 h-[72px] flex items-center justify-between">
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
                  <span className="font-mono text-[#9CA0AA] text-sm">BAL:</span>
                  <span className="font-mono text-white text-sm bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)]">
                    ${(balance / 100).toFixed(2)}
                  </span>
                </div>
                
                <Link href="/deposit">
                  <button className="bg-transparent border border-[rgba(255,255,255,0.2)] text-white text-[14px] font-medium px-5 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors">
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
                  <button className="bg-transparent text-white text-[14px] font-medium px-5 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    Log in
                  </button>
                </Link>
                <Link href="/login">
                  <button className="bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white text-[14px] font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)]">
                    Sign Up Free
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Brutalist gradient divider line below navbar content but inside the container */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]"></div>
      </nav>
    </div>
  )
}
