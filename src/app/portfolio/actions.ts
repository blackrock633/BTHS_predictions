'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function cancelBet(betId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    // 1. Get the bet to verify ownership and amount
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select('amount, candidate_id')
      .eq('id', betId)
      .eq('user_id', user.id)
      .single()

    if (betError || !bet) return { error: 'Bet not found or unauthorized' }

    // 2. Check if candidate is still alive and not winner
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('is_alive, is_winner')
      .eq('id', bet.candidate_id)
      .single()

    if (candidateError || !candidate) return { error: 'Target entity not found' }
    if (!candidate.is_alive || candidate.is_winner) return { error: 'Cannot cancel a contract on a resolved or eliminated entity.' }

    // We must bypass RLS to update profiles and delete the bet safely.
    // Or we can use regular client if RLS policies allow deleting own bets and updating own profile.
    // Let's use the admin client to ensure atomic safe operations just like resolveMarket.
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Delete the bet
    await adminClient.from('bets').delete().eq('id', betId)

    // 4. Refund the balance
    const { data: profile } = await adminClient.from('profiles').select('balance').eq('id', user.id).single()
    if (profile) {
      await adminClient.from('profiles').update({ balance: profile.balance + bet.amount }).eq('id', user.id)
    }

    // 5. Add a transaction log
    await adminClient.from('transactions').insert({
      user_id: user.id,
      amount: bet.amount,
      type: 'deposit', // Refund acts like a deposit
      reference_id: `refund_${betId}`
    })

    revalidatePath('/portfolio')
    revalidatePath('/')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}
