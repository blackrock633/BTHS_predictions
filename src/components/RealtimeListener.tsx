'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function RealtimeListener() {
  const router = useRouter()

  useEffect(() => {
    // Only run if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const supabase = createClient()

    const channel = supabase
      .channel('public:bets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bets' },
        () => {
          // When a bet changes (e.g. new bet placed), refresh the Server Components
          // This will cause Next.js to refetch the total pools and implied odds
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null // This component doesn't render anything
}
