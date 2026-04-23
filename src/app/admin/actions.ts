'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const ADMIN_PASSCODE = 'noah633'

function getAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in .env.local.')
  }
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === 'noah633@icloud.com'
}

export async function addCandidate(formData: FormData) {
  const name = formData.get('name') as string
  const passcode = formData.get('passcode') as string
  const category = formData.get('category') as string || 'player'

  if (!(await checkAdmin())) return { error: 'Unauthorized system access.' }
  if (passcode !== ADMIN_PASSCODE) return { error: 'Invalid admin passcode' }
  if (!name || name.trim() === '') return { error: 'Entity name is required' }

  try {
    const finalName = category === 'stat' ? `[STAT] ${name.trim()}` : name.trim()

    const adminClient = getAdminClient()
    const { error } = await adminClient
      .from('candidates')
      .insert({ name: finalName })

    if (error) return { error: error.message }
  } catch (e: any) {
    return { error: e.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function eliminateCandidate(formData: FormData) {
  const candidateId = formData.get('candidateId') as string
  const passcode = formData.get('passcode') as string

  if (!(await checkAdmin())) return { error: 'Unauthorized system access.' }
  if (passcode !== ADMIN_PASSCODE) return { error: 'Invalid admin passcode' }

  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient
      .from('candidates')
      .update({ is_alive: false })
      .eq('id', candidateId)

    if (error) return { error: error.message }
  } catch (e: any) {
    return { error: e.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function reviveCandidate(formData: FormData) {
  const candidateId = formData.get('candidateId') as string
  const passcode = formData.get('passcode') as string

  if (!(await checkAdmin())) return { error: 'Unauthorized system access.' }
  if (passcode !== ADMIN_PASSCODE) return { error: 'Invalid admin passcode' }

  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient
      .from('candidates')
      .update({ is_alive: true })
      .eq('id', candidateId)

    if (error) return { error: error.message }
  } catch (e: any) {
    return { error: e.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function resolveMarket(formData: FormData) {
  const winnerId = formData.get('winnerId') as string
  const passcode = formData.get('passcode') as string

  if (!(await checkAdmin())) return { error: 'Unauthorized system access.' }
  if (passcode !== ADMIN_PASSCODE) return { error: 'Invalid admin passcode' }

  try {
    const adminClient = getAdminClient()

    // 1. Get all bets
    const { data: allBets, error: betsError } = await adminClient.from('bets').select('*')
    if (betsError) return { error: 'Failed to fetch bets' }

    const totalPool = allBets.reduce((sum: number, bet: any) => sum + bet.amount, 0)
    
    const winningBets = allBets.filter((bet: any) => bet.candidate_id === winnerId)
    const winnerPool = winningBets.reduce((sum: number, bet: any) => sum + bet.amount, 0)

    // 2. Mark winner
    const { data: winner } = await adminClient.from('candidates').select('name').eq('id', winnerId).single()
    const isStat = winner?.name.startsWith('[STAT]')
    
    await adminClient.from('candidates').update({ is_winner: true }).eq('id', winnerId)
    
    // Also eliminate everyone else IN THE SAME CATEGORY just in case
    if (winner) {
      if (isStat) {
        await adminClient.from('candidates')
          .update({ is_alive: false })
          .like('name', '[STAT]%')
          .neq('id', winnerId)
      } else {
        await adminClient.from('candidates')
          .update({ is_alive: false })
          .not('name', 'like', '[STAT]%')
          .neq('id', winnerId)
      }
    }

    // 3. Process payouts
    if (winnerPool > 0) {
      for (const bet of winningBets) {
        const userShare = bet.amount / winnerPool
        const payoutAmount = Math.floor(userShare * totalPool)

        // Fetch current balance
        const { data: profile } = await adminClient
          .from('profiles')
          .select('balance')
          .eq('id', bet.user_id)
          .single()

        if (profile) {
          await adminClient
            .from('profiles')
            .update({ balance: profile.balance + payoutAmount })
            .eq('id', bet.user_id)

          await adminClient.from('transactions').insert({
            user_id: bet.user_id,
            amount: payoutAmount,
            type: 'payout',
            reference_id: `win_${winnerId}`
          })
        }
      }
    }

    revalidatePath('/', 'layout')
    return { success: true, totalPool, winnerPool }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function resolveStatGroup(formData: FormData) {
  const groupName = formData.get('groupName') as string
  const actualResult = parseFloat(formData.get('actualResult') as string)
  const passcode = formData.get('passcode') as string

  if (!(await checkAdmin())) return { error: 'Unauthorized system access.' }
  if (passcode !== ADMIN_PASSCODE) return { error: 'Invalid admin passcode' }
  if (isNaN(actualResult)) return { error: 'Valid number required for actual result' }

  try {
    const adminClient = getAdminClient()
    
    // Get all candidates for this group
    const { data: candidates, error: cErr } = await adminClient
      .from('candidates')
      .select('id, name')
      .like('name', `[STAT] ${groupName}|%`)
      
    if (cErr || !candidates) return { error: 'Failed to fetch group candidates' }
    
    const winningIds: string[] = []
    
    // Determine winners
    for (const c of candidates) {
      const rawName = c.name.replace('[STAT] ', '')
      const parts = rawName.split('|')
      if (parts.length === 3) {
        const threshold = parseFloat(parts[1])
        const direction = parts[2].toLowerCase() // over or under
        
        let isWinner = false
        if (direction === 'over' && actualResult > threshold) isWinner = true
        if (direction === 'under' && actualResult < threshold) isWinner = true
        
        if (isWinner) winningIds.push(c.id)
      }
    }
    
    for (const c of candidates) {
      const rawName = c.name.replace('[STAT] ', '')
      const parts = rawName.split('|')
      if (parts.length === 3) {
        const threshold = parseFloat(parts[1])
        const direction = parts[2].toLowerCase()
        
        const isWinner = winningIds.includes(c.id)
        
        // Find the pair ID
        const oppositeDirection = direction === 'over' ? 'Under' : 'Over'
        const oppositeCandidate = candidates.find((oc: any) => oc.name === `[STAT] ${groupName}|${threshold}|${oppositeDirection}`)
        
        if (isWinner) {
          await adminClient.from('candidates').update({ is_winner: true }).eq('id', c.id)
          if (oppositeCandidate) {
            await adminClient.from('candidates').update({ is_alive: false }).eq('id', oppositeCandidate.id)
          }
          
          // Calculate isolated pool
          const { data: myBets } = await adminClient.from('bets').select('*').eq('candidate_id', c.id)
          const { data: oppBets } = await adminClient.from('bets').select('*').eq('candidate_id', oppositeCandidate?.id || 'null')
          
          const myPool = myBets?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0
          const oppPool = oppBets?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0
          const isolatedPool = myPool + oppPool
          
          if (myPool > 0 && myBets) {
            for (const bet of myBets) {
              const userShare = bet.amount / myPool
              const payoutAmount = Math.floor(userShare * isolatedPool)
              
              const { data: profile } = await adminClient.from('profiles').select('balance').eq('id', bet.user_id).single()
              if (profile) {
                await adminClient.from('profiles').update({ balance: profile.balance + payoutAmount }).eq('id', bet.user_id)
                await adminClient.from('transactions').insert({
                  user_id: bet.user_id,
                  amount: payoutAmount,
                  type: 'payout',
                  reference_id: `stat_win_${c.id}`
                })
              }
            }
          }
        }
      }
    }
    
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}
