import Link from 'next/link'

export default function DepositSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 animate-fade-down">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden text-center p-10">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-[#00E0FF]"></div>
        
        <div className="w-20 h-20 mx-auto bg-[#00E0FF]/10 text-[#00E0FF] rounded-full flex items-center justify-center mb-8 border border-[#00E0FF]/30 shadow-[0_0_30px_rgba(0,224,255,0.2)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Transfer Complete</h1>
        <p className="font-mono text-sm text-[#9CA0AA] mb-10">
          Liquidity successfully bridged into the BTHS Predictions ecosystem. Balances will reflect momentarily.
        </p>
        
        <Link href="/">
          <button className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#00E0FF] text-white font-bold text-sm h-12 rounded-xl uppercase tracking-widest shadow-[0_4px_14px_rgba(124,92,255,0.4)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,92,255,0.6)] active:scale-[0.98]">
            Return to Markets
          </button>
        </Link>
      </div>
    </div>
  )
}
