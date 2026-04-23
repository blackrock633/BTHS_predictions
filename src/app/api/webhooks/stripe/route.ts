import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (!sig || !webhookSecret) return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    // Retrieve the user ID from metadata
    const userId = session.metadata?.userId
    const amountTotal = session.amount_total // in cents

    if (userId && amountTotal) {
      // Use the Service Role Key to bypass RLS and update the user's balance
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      try {
        // 1. Fetch current balance
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single()

        const currentBalance = profile?.balance || 0

        // 2. Update balance
        await supabaseAdmin
          .from('profiles')
          .update({ balance: currentBalance + amountTotal })
          .eq('id', userId)

        // 3. Log transaction
        await supabaseAdmin.from('transactions').insert({
          user_id: userId,
          amount: amountTotal,
          type: 'deposit',
          reference_id: session.payment_intent || session.id
        })

        console.log(`Successfully credited $${(amountTotal / 100).toFixed(2)} to user ${userId}`)
      } catch (e) {
        console.error('Error updating user balance:', e)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
