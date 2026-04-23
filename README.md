# BTHS Predictions Platform 🎯

A high-performance, real-time prediction market platform built for the BTHS Class of 2025. This platform allows users to engage with "Senior Assassin" markets, track player probabilities, and place social bets.

## 🚀 Features

- **Dynamic Probability Engine**: Real-time implied probabilities calculated based on betting volume.
- **Live Market Dashboard**: Clean, responsive UI for tracking "Senior Assassin" participants.
- **Admin Command Center**: Streamlined interface for managing player status, eliminations, and market resolution.
- **Social Betting Integration**: Built-in Venmo workflow for seamless peer-to-peer settlement.
- **Supabase Backend**: Powered by Supabase for real-time data synchronization and persistent storage.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Modern CSS with Syne & DM Mono typography
- **Database**: Supabase (PostgreSQL + Real-time)
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/blackrock633/BTHS_predictions.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `src/App.jsx`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `VENMO_HANDLE`

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

The platform is optimized for Vercel. Push to the `main` branch for automatic deployments to `bthspredictions.xyz`.

---
Built with ⚡ by blackrock633
