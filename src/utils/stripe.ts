import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // using any to avoid strict version mismatch if types differ
  appInfo: {
    name: 'BTHS Predictions',
    version: '0.1.0'
  }
})
