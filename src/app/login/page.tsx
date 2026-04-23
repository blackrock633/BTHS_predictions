import { login, signup } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const message = (await searchParams).message

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10 -mt-16 pt-16 animate-fade-down">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF]"></div>
        
        <div className="p-8 md:p-10">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">
              Identify <span className="text-[#00E0FF]">Self</span>
            </h1>
            <p className="font-mono text-sm text-[#9CA0AA] tracking-tight">
              Awaiting credentials for system access.
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="full_name" className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block">Full Name [Sign Up Only]</label>
              <input 
                id="full_name" 
                name="full_name" 
                placeholder="JOHN DOE" 
                className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-12 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors placeholder:text-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="M@EXAMPLE.COM" 
                required 
                className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-12 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors placeholder:text-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="font-mono text-[#9CA0AA] text-xs uppercase tracking-wider block">Security Token</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full px-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl font-mono text-white h-12 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-colors"
              />
            </div>

            {message && (
              <div className="text-xs font-mono text-yellow-500 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                [SYS] {message}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-6">
              <button type="submit" formAction={login} className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white font-bold text-sm h-12 rounded-xl uppercase tracking-widest shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)] active:scale-[0.98]">
                Authenticate
              </button>
              <button type="submit" formAction={signup} className="w-full font-mono text-sm uppercase tracking-wider bg-transparent border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.05)] h-12 rounded-xl transition-colors">
                Register New Entity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
