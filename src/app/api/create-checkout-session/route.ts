import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount } = body

    if (!amount || amount < 500) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BTHS Predictions Wallet Deposit',
              description: 'Funds for your prediction market wallet',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/deposit/success`,
      cancel_url: `${req.headers.get('origin')}/deposit/cancel`,
      metadata: {
        userId: user.id, // Store user ID to add funds in webhook
      },
      client_reference_id: user.id,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
  }
}
