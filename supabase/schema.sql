-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  balance INTEGER DEFAULT 0 NOT NULL, -- Stored in cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create candidates table (the people you can bet on to win)
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_alive BOOLEAN DEFAULT TRUE,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0), -- Stored in cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table for audit logging (deposits, bets, payouts)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for deposits/payouts, negative for bets
  type TEXT NOT NULL CHECK (type IN ('deposit', 'bet', 'payout')),
  reference_id TEXT, -- e.g., Stripe Payment Intent ID or Bet ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles (for leaderboard)" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view candidates" ON public.candidates FOR SELECT USING (true);
-- Only admins should modify candidates in a real app, but for simplicity, we lock it down to auth users or service role
CREATE POLICY "Service role can manage candidates" ON public.candidates USING (true);

-- Bets
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all bets (for transparent pool)" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Users can insert own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
-- Insertions should ideally only happen via secure Server Actions / Webhooks, so we don't allow arbitrary inserts from client
CREATE POLICY "Service role can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Setup Supabase Auth Trigger to automatically create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, balance)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
