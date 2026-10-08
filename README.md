# ShopMate AI — Intelligent Personal Shopping Companion

**ShopMate AI** is an intelligent personal shopping companion built for high-utility e-commerce discovery in India. It balances conversational AI reasoning with transparent 90-day price intelligence in Indian Rupees (`₹`), real-time Google Maps store grounding, and full-duplex voice interaction.

---

## Key Features

### 1. Google Maps Store Grounding (`gemini-3.5-flash` + `googleMaps`)
- **Authorized Retail & Showroom Discovery**: Identifies local electronics megastores and brand experience centers (e.g., Croma, Reliance Digital, Sony Center, Featherlite Showrooms) where users can inspect demo units before buying.
- **Location-Aware Querying**: Uses browser geolocation or selectable metro centers (Bengaluru, Mumbai, Delhi NCR, Hyderabad) to ground recommendations.
- **Verified Place Links**: Extracts Google Maps navigation URLs, place titles, and review snippets directly from `groundingChunks` into interactive cards.

### 2. Real-Time Live Voice Conversations (`gemini-3.8-live`)
- **Full-Duplex Voice Dialogue**: Powered by the Gemini Live API over WebSocket (`/api/live`).
- **Low-Latency Streaming**: 16kHz microphone capture with PCM-16 encoding and gapless 24kHz raw PCM audio playback.
- **Conversational Interruption**: Instant buffer flushing and turn-switching when the user speaks.
- **Luminescent Audio Visualizer**: Multi-band waveform responsive to microphone input and assistant voice output.

### 3. 90-Day Indian Rupee (`₹`) Price Intelligence
- **Historical Price Sparklines**: Tracks 90-day lowest, average, and peak prices to filter out artificial MRP markdowns.
- **Price Drop Alerts**: Configurable target price notifications with instant activation.
- **Multi-Store Price Matrix**: Live price and delivery comparison across Amazon India, Flipkart, Croma, and Brand Direct.
- **Auto-Coupon Engine**: Verified store coupon codes with dynamic one-click application (`SHOPMATE500`, `AUDIO300`, `BREW1000`).

### 4. Side-by-Side AI Comparison Matrix
- **4-Pillar Scoring Breakdown**: Rates candidates across Value for Money, Performance, Build Quality, and India Warranty Support.
- **AI Verdict Winner**: Highlights the mathematically optimal pick tailored to user priorities.

### 5. Shopping Bag & Express Checkout
- **Itemized Bag Management**: Quantity steppers, coupon deductions, and free express delivery calculation.
- **Payment Modes**: UPI Instant Pay (GPay / PhonePe), Cash on Delivery (COD), and Credit/Debit Card EMI.
- **Formal Legal Manifest**: Tax invoice summary displaying breakdown in INR and standard 18% GST.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend**: Node.js, Express, `ws` (WebSocket Server), `tsx`
- **AI Engine**: Google GenAI SDK (`@google/genai`)
  - `gemini-3.5-flash` with `googleMaps` tool for Maps Grounding
  - `gemini-3.8-live` for bidirectional Live API voice streaming

---

## Project Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules (protects all .env files)
├── index.html                # HTML entry point with Plus Jakarta Sans & Inter
├── metadata.json             # App capabilities & permissions
├── package.json              # Project dependencies & scripts
├── server.ts                 # Full-stack server (Express, Live API WebSocket, Vite middleware)
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── App.tsx               # Main application container & view orchestration
    ├── index.css             # Design system tokens, typography & elevations
    ├── main.tsx              # React DOM mounting
    ├── assets/images/        # High-resolution studio product photography
    ├── components/
    │   ├── AiCopilotRail.tsx        # 360px conversational AI shopping rail
    │   ├── CartDrawer.tsx           # Shopping bag & express checkout drawer
    │   ├── CompareView.tsx          # Side-by-side comparison matrix
    │   ├── LiveVoiceModal.tsx       # gemini-3.8-live full-duplex voice modal
    │   ├── NearbyStoresModal.tsx    # Google Maps grounded store locator
    │   ├── ProductCard.tsx          # E-commerce product card with AI reason callout
    │   └── ProductDetailModal.tsx   # Contiguous PDP modal with 90d price sparkline
    └── data/
        └── products.ts              # Curated Indian retail product catalog & presets
```

---

## Security & Secrets

- **`.env` Protection**: All `.env` and `.env.*` files are strictly ignored by `.gitignore` to prevent leaking credentials to GitHub.
- **Server-Side API Key Usage**: `GEMINI_API_KEY` is loaded strictly on the backend (`server.ts`) via `process.env.GEMINI_API_KEY`. No API keys are bundled into client-side code.

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shopmate-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## License

Apache-2.0
