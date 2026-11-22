# ASATEK Power Link — Wholesale Power Electronics Portal

B2B wholesale catalogue, quantity-slab pricing portal, dual-channel order system (Website + WhatsApp), and admin panel for **ASATEK Power Link** (Sadiqabad, Punjab, Pakistan).

## Features

- **Bilingual EN / اردو (RTL)**: Full English and Urdu interface with automatic `dir="rtl"` layout switching and Noto Nastaliq Urdu typography.
- **Public Wholesale Catalogue**: Filter by category, search by product name or SKU, sort by newest/name/lowest rate, and view quantity-slab pricing in PKR.
- **Order List (`/quote`)**: Persistent browser order list with MOQ enforcement, live slab-rate calculation, buyer form validation (Zod + honeypot), and two submission modes:
  - **Place Order on Website** (`channel = 'website'`)
  - **Order on WhatsApp** (`channel = 'whatsapp'`, saves in database first and opens `wa.me/<whatsapp_number>`)
- **Admin Panel (`/admin`)**:
  - Dashboard with product & inquiry counters
  - Categories CRUD & ordering
  - Products CRUD with photo uploader, wholesale price slab editor, and bilingual technical specs editor
  - Orders & Inquiries management with channel/status filters and direct buyer WhatsApp reply link
  - Settings page with live-validated **WhatsApp Order Number** card that updates all WhatsApp links site-wide
- **Preview / Mock Mode**: Automatically runs on built-in sample data when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set.

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials from **Supabase → Project Settings → API Keys**:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Public `sb_publishable_...` (or legacy `anon`) key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Optional fallback public `sb_publishable_...` key used when `VITE_SUPABASE_ANON_KEY` is empty |

> **Security Note**: Never place `sb_secret_...` or `service_role` keys in frontend environment variables or `.env`.

## Local Development

```bash
npm install
npm run dev
```

## Production Build & Cloudflare Workers / Pages

```bash
npm run build
```

- Build output directory: `dist`
- `wrangler.jsonc` configures Cloudflare Workers static assets with `"not_found_handling": "single-page-application"` for SPA routing (without a looping `_redirects` file)
- `.npmrc` sets `legacy-peer-deps=true`
- Recommended Node version: 20 (`NODE_VERSION=20`)
