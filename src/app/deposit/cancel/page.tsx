import Link from 'next/link'

export default function DepositCancelPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 animate-fade-down">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.03)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.1)] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden text-center p-10">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-red-500"></div>
        
        <div className="w-20 h-20 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Transfer Aborted</h1>
        <p className="font-mono text-sm text-[#9CA0AA] mb-10">
          The transaction was interrupted or cancelled by the user. No assets were moved.
        </p>
        
        <Link href="/deposit">
          <button className="w-full font-mono text-sm uppercase tracking-wider bg-transparent border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.05)] h-12 rounded-xl transition-colors">
            Attempt Retry
          </button>
        </Link>
      </div>
    </div>
  )
}
