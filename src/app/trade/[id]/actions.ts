'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

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

export async function placeBet(formData: FormData) {
  const supabase = await createClient()

  const candidateId = formData.get('candidateId') as string
  const amountStr = formData.get('amount') as string
  const amount = parseInt(amountStr, 10)

  if (!candidateId || isNaN(amount) || amount <= 0) {
    return { error: 'Invalid bet amount or candidate' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to place a bet' }
  }

  try {
    const adminClient = getAdminClient()

    // 1. Fetch user balance (using admin client to ensure we can read it)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { error: 'Could not fetch user balance' }
    }

    if (profile.balance < amount) {
      return { error: 'Insufficient balance' }
    }

    // 2. Deduct balance
    const { error: deductError } = await adminClient
      .from('profiles')
      .update({ balance: profile.balance - amount })
      .eq('id', user.id)

    if (deductError) {
      return { error: 'Failed to deduct balance' }
    }

    // 3. Record transaction
    await adminClient.from('transactions').insert({
      user_id: user.id,
      amount: -amount,
      type: 'bet',
      reference_id: candidateId
    })

    // 4. Insert bet
    const { error: betError } = await adminClient.from('bets').insert({
      user_id: user.id,
      candidate_id: candidateId,
      amount: amount
    })

    if (betError) {
      // Refund if bet fails (manual rollback)
      await adminClient
        .from('profiles')
        .update({ balance: profile.balance })
        .eq('id', user.id)
      
      return { error: `Failed to place bet record: ${betError.message}` }
    }

    revalidatePath('/')
    revalidatePath(`/trade/${candidateId}`)
    revalidatePath('/portfolio')

    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}
