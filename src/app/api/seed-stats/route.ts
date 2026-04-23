import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5]
    const groupName = "Kills by 12AM"
    const newCandidates = []

    for (const t of thresholds) {
      newCandidates.push({ name: `[STAT] ${groupName}|${t}|Over` })
      newCandidates.push({ name: `[STAT] ${groupName}|${t}|Under` })
    }

    const { error } = await supabaseAdmin.from('candidates').insert(newCandidates)
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, count: newCandidates.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
