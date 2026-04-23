import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const dummyNames = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Prince', 'Evan Wright']
    
    // Delete any bets associated with them first
    const { data: candidates } = await supabaseAdmin.from('candidates').select('id').in('name', dummyNames)
    if (candidates && candidates.length > 0) {
      const ids = candidates.map(c => c.id)
      await supabaseAdmin.from('bets').delete().in('candidate_id', ids)
      // Then delete the candidates
      await supabaseAdmin.from('candidates').delete().in('name', dummyNames)
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
