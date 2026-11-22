# ASATEK Website — Complete Project Master File

This single file contains all 6 project documents. Read it fully, then build the whole website in one go.

| Part | Document |
|------|----------|
| PART 1 | Product Requirements (PRD) |
| PART 2 | Technical Requirements (TRD) |
| PART 3 | App Flow (User & Admin) |
| PART 4 | UI/UX Design Brief |
| PART 5 | Backend Schema (Supabase) |
| PART 6 | Implementation Plan |

Key facts at a glance:
- Brand: **ASATEK** (logo reads "ASATEK POWER LINK"), factory in Sadiqabad, Pakistan. Wholesale power electronics and parts.
- **Red-dominant theme** matching the logo (green only as a small accent).
- Website in **English + Urdu (RTL)**. Rates are **public**.
- Orders in **two ways**: "Place Order on Website" and "Order on WhatsApp". Both are saved and appear in the **Admin Panel**. The **WhatsApp number is editable by the admin** in Admin → Settings.
- Stack: React + TypeScript (Vite), Supabase-ready code with mock-data fallback, Cloudflare deployment.

---

# PART 1

## Product Requirements Document (PRD)
**Project:** ASATEK Wholesale Electronics Website
**Version:** 1.0

### 1. Purpose & Goals
ASATEK is a factory in Sadiqabad, Punjab, Pakistan that manufactures and wholesales power electronics (UPS, solar systems, inverters, battery chargers) and their components (capacitors, resistors, heat sinks, IGBTs, PCBs).
The website is a **B2B catalogue + order/inquiry system**. It is NOT an online shop.

Goals:
1. Show the full product range with specs and **public wholesale rates** (PKR, quantity-slab pricing).
2. Let buyers build an **Order List** and place the order in **two ways**: (a) **Order on Website** (order is saved and appears in the Admin Panel) or (b) **Order on WhatsApp** (opens WhatsApp with a pre-filled message to the factory number). Both ways ALSO save the order in the Admin Panel, so nothing is ever missed.
3. Build trust: factory story, quality, location in Sadiqabad.
4. Let the owner manage everything (products, rates, categories, inquiries, contact info) from an **Admin Panel** without coding.

### 2. Target Users & Roles
| Role | Description | Access |
|------|-------------|--------|
| Visitor | Any buyer, no account needed | Browse, search, build Order List, submit inquiry, switch EN/UR |
| Admin | Factory owner/staff | Full admin panel after login (Supabase Auth, email + password) |

There are **no customer accounts**. Only admin login exists.

### 3. Brand
- Brand name displayed: **ASATEK** (editable via `site_settings.site_name`). The logo badge reads "ASATEK POWER LINK"; use it as the full name on About/footer (`site_settings.about_title`).
- Logo: circular badge with a red curved symbol, green ring, red/white colours. Logo URL is provided later via `site_settings.logo_url` (image workflow). Until then use a text wordmark "ASATEK" in red.
- Theme: **red-dominant**. Green is only a small accent (In Stock tag, success messages).

### 3A. Known Brand Facts (from the factory's public pages; owner must confirm in Admin → Settings)
- ASATEK manufactures PWM **solar charge controllers**, inverters/UPS, **battery chargers** and power supplies; deals in industrial/computer UPS, DC fans and solar controllers.
- Has service centres across Pakistan, including Sadiqabad, Karachi, Hyderabad, Bahawalpur, Lahore, Rawalpindi, Peshawar and others.
- Based at Nehar Kinara, Sadiqabad (confirm exact address).
- Real model examples usable on the site: SC5 VA-1260 / SC5 V-1260 (12V 60A, PWM, max PV 30V/1000W, with voltmeter+ammeter / voltmeter only), SC5 VA-2460 / SC5 V-2460 (24V 60A, max PV 60V/1400W), SC6-1230 (12V 30A, 3-in-1, max PV 30V/500W), SC6-2430 (24V 30A, 3-in-1, max PV 60V/700W).
- Public channels (for social links): YouTube @asatek3863.

### 4. Features (Public)
1. **Home:** hero with factory-direct message, category grid, featured products, "Why ASATEK" (factory-direct rates, bulk supply, quality tested, fast dispatch), how-it-works (Browse → Add to Order → Send on WhatsApp), CTA strip.
2. **Products listing:** search by name/SKU, filter by category, sort (newest, name, price low→high), pagination (24 per page). Cards show image, name, SKU, "from PKR X / unit" (lowest slab price), MOQ, Add to Order button.
3. **Product detail:** image gallery, name, SKU, category, short description, specs table, **wholesale price slab table** (min qty → price per unit), MOQ, availability (In Stock / Made to Order / Out of Stock), quantity input, Add to Order, WhatsApp-this-product button, related products.
4. **Order List (`/quote`):** items with quantity (min = MOQ), remove, notes field, buyer form (name, phone/WhatsApp, city, business name optional, message optional). Shows an estimated total using slab prices ("estimate, final rate confirmed by ASATEK"). The Order List persists in browser localStorage. At the bottom there are **two clear buttons**:
   - **"Place Order on Website"** (red, primary): saves the order (`channel = 'website'`), shows a success screen with the reference code. It appears in Admin → Orders.
   - **"Order on WhatsApp"** (green, WhatsApp icon): saves the order too (`channel = 'whatsapp'`), then opens WhatsApp (`wa.me/<whatsapp_number>`) with a pre-filled message listing all items. The WhatsApp number comes from Admin → Settings.
   The same two options exist on a single product page ("Order this product on WhatsApp" opens WhatsApp for that product directly; "Add to Order" goes to the list).
5. **About:** factory story, capabilities, quality testing, location.
6. **Contact:** address (Sadiqabad), phone, WhatsApp, email, working hours, embedded map link (Google Maps link button, no iframe key needed), contact form (saves as an inquiry of type `contact`).
7. **Floating WhatsApp button** on every page.
8. **Language switcher EN / اردو** in header. Urdu = full RTL layout.

### 5. Features (Admin)
1. Login / logout.
2. **Dashboard:** counts (products, new inquiries, inquiries this week), latest 5 inquiries.
3. **Categories:** create/edit/delete/reorder, EN + UR names, image.
4. **Products:** create/edit/delete/duplicate, toggle active/featured, EN + UR fields, SKU, category, MOQ, availability, specs (key/value rows, EN + UR), multiple images (upload to Supabase Storage), **price slabs** editor.
5. **Orders / Inquiries:** every order (website or WhatsApp) and every contact-form message arrives here. Columns: reference, date, buyer, phone, city, **channel (Website / WhatsApp)**, type (order / contact), status. Filter by status and channel, search by name/phone/reference. Detail view shows items, quantities and the server-calculated slab prices, with status change (new / contacted / closed), admin note, and an "Open in WhatsApp" button to reply to the buyer. Dashboard shows a "New orders" counter.
6. **Settings:** the **first card is "WhatsApp Number"** where the admin can change the order WhatsApp number at any time (format: country code + number, digits only, e.g. `923001234567`; with live validation and a "Test WhatsApp" button). The change updates the floating button, product pages, the Order button, footer and contact page instantly. Other settings: site name, logo URL, phone, email, address (EN/UR), working hours, Google Maps link, hero text, social links, about-page text (EN/UR).

### 6. Business Rules
- Currency: PKR, formatted `PKR 1,250`. Prices are **per unit**, per slab.
- A product has 1+ price slabs: `min_qty` and `unit_price`. The applicable slab is the one with the highest `min_qty` ≤ chosen quantity. Quantity below MOQ is not allowed.
- Rates are public. No login needed to see them.
- Inactive products are hidden from the public.
- Out-of-Stock products can still be added to the quote (shown with a warning).
- Each order/inquiry gets a human-readable reference like `ASK-20261121-0042`.
- **Every order is saved in the database first**, whichever button is used. If saving fails, the WhatsApp button still opens WhatsApp (with a notice) so the buyer is never blocked.
- Only one WhatsApp number is used site-wide (`site_settings.whatsapp_number`), editable by the admin.
- WhatsApp number format stored as international digits only (e.g. `923001234567`).

### 7. Non-Functional Requirements
- Mobile-first (most buyers use phones), fast on slow 4G networks: lazy-loaded images, small bundle.
- Accessible: contrast AA, keyboard navigable, alt text, visible focus.
- SEO: per-page `<title>` and meta description, Open Graph tags, clean URLs, `sitemap.xml` + `robots.txt` in `/public`.
- Security: RLS on all tables, no secrets in the frontend, input validation, spam protection on inquiry forms (honeypot field + rate limit in DB function).
- Both languages share the same URLs (language stored in localStorage + `?lang=ur` optional). `<html dir>` and `lang` update on switch.

### 8. Scope
**In scope:** everything above.
**Out of scope:** online payment, customer accounts, shopping cart checkout, shipping calculation, AI features, order tracking, multi-admin roles (single `admin` role only), email notifications (admin checks the panel and WhatsApp).

### 9. Open Items (editable later via Admin → Settings, not blockers)
Final WhatsApp number and contact details (phone, email, exact address; the public pages found for ASATEK did not show a phone number) and real product list. Use clearly marked placeholders in seed data.

---

# PART 2

## Technical Requirements Document (TRD)

### 1. Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (via npm, not CDN) with CSS variables for theme tokens
- **Routing:** React Router v6 (BrowserRouter)
- **Data:** Supabase JS v2 (`@supabase/supabase-js`) — Postgres, Auth, Storage
- **State/data fetching:** TanStack Query (`@tanstack/react-query`) for server state; React Context for Language and Order List
- **Forms/validation:** React Hook Form + Zod
- **i18n:** lightweight custom i18n (JSON dictionaries `en.json`, `ur.json` + `useI18n()` hook). No heavy library.
- **Icons:** lucide-react
- **Hosting:** Cloudflare Workers & Pages (GitHub deploy). No Vercel.
- **AI:** none (no AI Gateway needed).

### 2. Architecture
Single-page app. Public pages and `/admin/*` pages in one app. The browser talks directly to Supabase using the **anon/publishable key**; security is enforced by **RLS** (see 05_Backend_Schema.md). No custom backend server.

Layers:
- `services/` — all Supabase calls (one file per entity). Components never call Supabase directly.
- `hooks/` — React Query hooks wrapping services.
- `types/` — TypeScript types that mirror the DB schema exactly (snake_case column names are kept in DB types; map to camelCase only in one place, or keep snake_case throughout — pick snake_case to avoid mismatches).
- `contexts/` — `LanguageContext`, `QuoteContext`, `AuthContext`.

### 3. Folder Structure
```
/public
  _redirects            -> /*  /index.html  200
  robots.txt
  sitemap.xml
  favicon.svg
/src
  main.tsx
  App.tsx               (routes)
  index.css             (tailwind + theme variables)
  /lib
    supabase.ts         (createClient from env vars)
    format.ts           (formatPKR, formatDate)
    pricing.ts          (getApplicableSlab, estimateTotal)
    whatsapp.ts         (buildWhatsAppLink(number, message))
    i18n.ts
  /locales  en.json  ur.json
  /types    db.ts
  /services categories.ts products.ts inquiries.ts settings.ts auth.ts storage.ts
  /hooks    useCategories.ts useProducts.ts useProduct.ts useSettings.ts useInquiries.ts
  /contexts LanguageContext.tsx QuoteContext.tsx AuthContext.tsx
  /components
    /layout  Header.tsx Footer.tsx Layout.tsx WhatsAppFloat.tsx LanguageSwitcher.tsx
    /ui      Button.tsx Input.tsx Select.tsx Modal.tsx Badge.tsx Skeleton.tsx EmptyState.tsx Toast.tsx Pagination.tsx
    /product ProductCard.tsx ProductGallery.tsx PriceSlabTable.tsx SpecsTable.tsx AddToQuote.tsx
    /admin   AdminLayout.tsx DataTable.tsx ImageUploader.tsx PriceSlabEditor.tsx SpecsEditor.tsx StatusBadge.tsx
  /pages
    Home.tsx Products.tsx ProductDetail.tsx Quote.tsx About.tsx Contact.tsx NotFound.tsx
    /admin Login.tsx Dashboard.tsx Categories.tsx ProductsList.tsx ProductForm.tsx Inquiries.tsx InquiryDetail.tsx Settings.tsx
  /routes ProtectedRoute.tsx
```

### 4. Routes (must match 03_App_Flow.md)
| Path | Page | Access |
|------|------|--------|
| `/` | Home | public |
| `/products` | Products (query params: `category`, `q`, `sort`, `page`) | public |
| `/products/:slug` | ProductDetail | public |
| `/quote` | Quote | public |
| `/about` | About | public |
| `/contact` | Contact | public |
| `/admin/login` | Admin Login | public |
| `/admin` | Dashboard | admin |
| `/admin/categories` | Categories | admin |
| `/admin/products` | Products list | admin |
| `/admin/products/new` | Product form (create) | admin |
| `/admin/products/:id` | Product form (edit) | admin |
| `/admin/inquiries` | Inquiries list | admin |
| `/admin/inquiries/:id` | Inquiry detail | admin |
| `/admin/settings` | Settings | admin |
| `*` | NotFound | public |

### 5. Supabase Integration
`src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(url, key);
```
- No hardcoded keys. If env vars are missing, show a clear full-screen "Configuration missing" message instead of crashing.
- **Service role key must never appear in code or repo.**
- Table and column names in services/types must match `05_Backend_Schema.md` **exactly**.
- Order/inquiry submission uses the RPC `submit_inquiry` (not direct inserts) and passes `channel` (`website` or `whatsapp`). WhatsApp link built in `lib/whatsapp.ts` from `site_settings.whatsapp_number` (digits only); never hardcode a number.
- Until the database exists (it is created later by ChatGPT + Supabase plugin), the services layer must degrade gracefully: if Supabase env vars are missing, use a small in-memory **mock data adapter** (`services/mockData.ts`) with ~12 sample products across all categories, so the UI can be previewed in AI Studio. The adapter is selected automatically when env vars are absent.

### 6. Auth
- Supabase Auth email + password, **admin only**. No sign-up page.
- After login, check `is_admin` via `profiles.role = 'admin'` (select own profile). If not admin: sign out and show "Not authorised".
- `ProtectedRoute` guards `/admin/*`.
- Session persisted by Supabase client.

### 7. Storage
- Bucket `product-images` (public read, admin write) for product photos and category images.
- Bucket `site-assets` (public read, admin write) for logo, hero, about images.
- Upload via `ImageUploader`: client-side resize to max 1600px wide, JPEG/WebP, max 2 MB after resize; store the public URL in DB.
- Images can also be plain external URLs (the owner may paste PhotoToURL links): all `*_url` fields accept any https URL.

### 8. Security Requirements
- RLS enabled on every table (policies in 05_Backend_Schema.md).
- Anonymous users: read-only on public catalogue tables, and may only create inquiries via `submit_inquiry`.
- Validate all forms with Zod (phone digits 10–15, name 2–80 chars, message ≤ 1000 chars, quantity integer ≥ MOQ ≤ 1,000,000).
- Honeypot field `website` in inquiry forms; if filled, silently pretend success and do not submit.
- Escape/sanitize rendered text (React does by default; never use `dangerouslySetInnerHTML`).
- Admin routes `noindex`.

### 9. i18n / RTL
- `LanguageContext` provides `lang: 'en' | 'ur'`, `t(key)`, `dir`.
- On change: set `document.documentElement.lang` and `dir` (`ltr` / `rtl`), save in localStorage `asatek_lang`. Default `en`.
- DB bilingual fields: `*_en` and `*_ur`. Helper `pick(obj, 'name')` returns `name_ur` when lang is `ur` and non-empty, else `name_en`.
- Use Tailwind logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) so RTL works without duplicate CSS.
- Numbers stay in Western digits (0-9) in both languages.

### 10. Cloudflare Deployment Requirements
- Build command: `npm run build` ; output directory: `dist`; framework preset: Vite / React.
- `public/_redirects` containing exactly: `/*    /index.html   200` (SPA fallback).
- Keep **`package-lock.json`**; **no** `bun.lock` / `bun.lockb`.
- Root `.npmrc` containing exactly: `legacy-peer-deps=true`
- Node 20 compatible (`"engines": { "node": ">=18" }`); set `NODE_VERSION=20` in Cloudflare if needed.
- `package.json` scripts: `dev`, `build` (`tsc -b && vite build` or `vite build`), `preview`.
- No server-side code.

### 11. Environment Variables (complete list)
| Name | Where from | Notes |
|------|-----------|-------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | build-time |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon / publishable key | build-time, safe for browser |

Provide `.env.example` with these two names and empty values. `.env` is git-ignored.
No other variables. No AI Gateway variables.

### 12. Performance
- Route-level code splitting (`React.lazy`) — admin pages in a separate chunk.
- Images: `loading="lazy"`, explicit width/height, `object-cover`, serve ≤ 800px for cards.
- Query caching (staleTime 5 min for catalogue, 0 for admin).

---

# PART 3

## App Flow (User & Admin Experience)

### 1. Global Behaviour
- Header: logo/wordmark ASATEK, nav (Home, Products, About, Contact), language switcher (EN | اردو), **Order List icon with item-count badge**. Mobile: hamburger menu.
- Footer: short about, quick links, contact (from settings), WhatsApp link, copyright.
- Floating WhatsApp button bottom-end corner (opens `wa.me/<whatsapp_number>` with a generic greeting).
- Language switch changes text instantly and flips layout direction (RTL for Urdu).
- States everywhere: **loading** = skeletons; **empty** = friendly message + action; **error** = message + Retry button; **success** = toast.

### 2. Visitor Flow
```
Home → Products (browse/filter/search) → Product Detail → Add to Order → Order List → [Place Order on Website | Order on WhatsApp] → Success
```
### Home (`/`)
Hero → category grid (click → `/products?category=<slug>`) → featured products → Why ASATEK → How it works → CTA "Order Now" (→ `/quote`) and "WhatsApp Us".

### Products (`/products`)
- Sidebar (desktop) / filter drawer (mobile): categories list, search box, sort select.
- Grid of ProductCards, pagination. Changing filters updates URL query params.
- Empty state: "No products found" + "Clear filters".
- Card actions: click card → detail; "Add to Order" adds with qty = MOQ and shows toast "Added to Order List" (with "View" link).

### Product Detail (`/products/:slug`)
Gallery, info, price slab table (current slab highlighted according to chosen quantity), quantity input (min = MOQ), live "Unit price / Line total", Add to Order, "Ask on WhatsApp" (pre-filled with product name + SKU), specs, related products (same category, 4 items). Unknown slug → NotFound-style message with link to Products.

### Order List (`/quote`)
1. Empty state: "Your Order List is empty" → Browse Products.
2. Items: image, name, SKU, quantity stepper (min MOQ), unit price (slab-based), line total, remove. Estimated total at bottom with note "Estimate only. Final rate confirmed on WhatsApp."
3. Buyer form: full name*, phone/WhatsApp*, city*, business name, message. Honeypot hidden.
4. Two buttons at the bottom (both validate the buyer form first):
   - **Place Order on Website** → call `submit_inquiry` with `channel='website'` → success screen with reference code (e.g. `ASK-20261121-0042`) and text "We will contact you soon" → Order List cleared.
   - **Order on WhatsApp** → call `submit_inquiry` with `channel='whatsapp'` → then open `wa.me/<whatsapp_number>?text=<message>` in a new tab → success screen with reference code → Order List cleared. If saving fails, still open WhatsApp and show a small notice.
5. Error (website button) → toast "Could not send. Please try again or order on WhatsApp" with a WhatsApp button.

WhatsApp message format:
```
Assalam o Alaikum ASATEK,
Order request <reference>
Name: <name> | City: <city> | Phone: <phone>
1) <product name> (<sku>) x <qty>
2) ...
Notes: <message>
```

### About (`/about`) / Contact (`/contact`)
About: static content from settings + images. Contact: details, map link, contact form (name*, phone*, message*) → `submit_inquiry` with `type='contact'` and no items → success toast.

### 3. Admin Flow
```
/admin/login → /admin (Dashboard) → Categories | Products | Inquiries | Settings
```
### Login
Email + password. Wrong credentials → inline error. Non-admin user → sign out + "Not authorised". Success → `/admin`.
Visiting any `/admin/*` without session redirects to `/admin/login`.

### Dashboard
Stat cards (total products, active products, new inquiries, inquiries last 7 days) + latest 5 inquiries table (click → detail).

### Categories
Table with drag/up-down order, "Add category" modal (name EN/UR, slug auto from EN name, image, sort order, active). Delete blocked if category has products (message: "Move or delete its products first").

### Products
List: search, category filter, active filter, columns (image, name, SKU, category, from-price, status, featured). Actions: edit, duplicate, delete (confirm modal), toggle active/featured.
Form sections: Basic (name EN/UR, slug, SKU, category, short desc EN/UR, MOQ, availability, active, featured) → Images (upload multiple, reorder, set primary, remove) → Price slabs (rows: min qty, unit price; at least 1; first slab min_qty = MOQ; ascending unique) → Specs (rows: label EN/UR, value) → Save. Validation errors inline. Success → toast + back to list.

### Orders / Inquiries
Table shows a **Channel** column (Website / WhatsApp). Filter by status (new / contacted / closed) and channel + search by name/phone/reference. Row click → detail: buyer info, items table with totals, status select, admin note, "Open in WhatsApp" (`wa.me/<buyer phone>`), delete. Opening a `new` inquiry does not auto-change status; admin changes it explicitly.

### Settings
Top card **"WhatsApp Number"**: input + Save + "Test WhatsApp" (opens wa.me link) with validation (digits only, 10–15 digits, country code included, no + or spaces). Below it, grouped sections (General, Contact, Social, Home hero text, About text). Save → toast. Changing the number takes effect everywhere immediately (settings are cached max 5 min / invalidated on save).

### 4. Permissions
| Area | Visitor | Admin |
|------|---------|-------|
| Public pages | yes | yes |
| Submit inquiry | yes | yes |
| `/admin/*` | no (redirect) | yes |
| Read inquiries | no | yes |

### 5. Edge Cases
- Order List in localStorage survives refresh; if a product was deactivated meanwhile, show "No longer available" on that row and block submit until removed.
- Duplicate submit prevented (disable button while submitting).
- Offline/slow network: show error state with Retry.
- Missing Supabase env vars: configuration-missing screen (see TRD) or mock data mode.

---

# PART 4

## UI/UX Design Brief

### 1. Design Direction
Industrial, trustworthy, clean B2B look — a modern electronics factory, not a flashy consumer shop. **Red-dominant** brand theme, lots of white space, strong typography, real-photo friendly. Feels fast and clear on a phone.

### 2. Colour Palette (CSS variables on :root)
| Token | Hex | Use |
|-------|-----|-----|
| `--brand-red` | `#C8102E` | primary buttons, links, highlights |
| `--brand-red-dark` | `#8B0A1E` | hover, footer accents, headings on light red areas |
| `--brand-red-light` | `#FDECEF` | tinted backgrounds, selected rows |
| `--ink` | `#1A1A1A` | main text, dark header/footer |
| `--ink-soft` | `#4B5563` | secondary text |
| `--line` | `#E5E7EB` | borders |
| `--bg` | `#FFFFFF` | page background |
| `--bg-alt` | `#F7F7F8` | alternating sections |
| `--accent-green` | `#2E7D32` | ONLY "In Stock" badge and success states (matches logo's green ring) |
| `--warn` | `#B45309` | "Made to Order" / warnings |
Red must not be used for body text. Ensure contrast AA (white text on `#C8102E` passes).
Provide a dark-footer variant: background `--ink`, text white, red accents.

### 3. Typography
- English: **Poppins** (headings 600/700) + **Inter** (body 400/500), from Google Fonts.
- Urdu: **Noto Nastaliq Urdu** for headings and body; line-height 2.0 for Urdu body text (Nastaliq needs extra height).
- Scale: H1 36/44 (mobile 28/36), H2 28/36, H3 20/28, body 16/24, small 14/20.
- Font fallbacks always defined.

### 4. Layout & Spacing
- Container max-width 1200px, side padding 16 (mobile) / 24 (desktop).
- 8-pt spacing grid. Section vertical padding 48 (mobile) / 80 (desktop).
- Product grid: 2 columns mobile, 3 tablet, 4 desktop. Cards radius 12px, subtle border + soft shadow on hover.
- Sticky header (white, bottom border, red top strip 4px). Mobile bottom area free for the floating WhatsApp button.

### 5. Components
- **Buttons:** Primary (red bg, white text, radius 8, 44px min height), Secondary (white bg, red border/text), WhatsApp (green `#25D366` button with WhatsApp icon — the only allowed exception for green), Ghost (text only).
- **Product card:** square image (object-cover, light grey placeholder with a chip icon), category chip, name (2 lines max), SKU (small grey), "From PKR X / unit", MOQ line, availability badge, Add to Order button.
- **Price slab table:** zebra rows, highlighted active slab in `--brand-red-light`, header in `--ink`.
- **Specs table:** two-column, label muted.
- **Badges:** In Stock (green tint), Made to Order (amber tint), Out of Stock (grey), Featured (red tint).
- **Forms:** labelled inputs, 44px height, red focus ring, inline error text in red, required asterisk.
- **Modal / Drawer / Toast:** simple, centered modal, bottom-sheet filter drawer on mobile, toast top-end.
- **Order List icon** in header: shopping-list/clipboard icon with red count badge.
- **Admin:** same colours, left sidebar (dark `--ink`, red active item), data tables, compact forms. Desktop-first but usable on tablet.

### 6. Page Look Notes
- **Hero:** dark charcoal-to-red diagonal gradient background with a faint circuit-board line pattern (CSS/SVG, no external image), big headline "Factory-Direct Power Electronics", sub-line, two buttons (Order Now, WhatsApp Us), and a hero product/factory image on the end side (optional, hidden if missing).
- **Category grid:** icon tile cards (lucide icons: Zap/UPS, Sun/solar, Battery, PlugZap/charger, CircuitBoard/PCB, Cpu/IGBT, Fan or Thermometer/heat sink, Component/capacitor & resistor). Hover turns the tile red.
- **Trust strip:** 4 items with icons (Factory-direct rates, Bulk supply, Quality tested, Fast dispatch across Pakistan).
- **How it works:** 3 numbered steps with red numerals.

### 7. Responsive Behaviour
Breakpoints: 640 / 768 / 1024 / 1280. Header collapses to hamburger below 1024. Filters become a drawer below 1024. Tables become stacked cards on mobile for the Order List and the admin lists where needed; the price slab table stays a table but scrolls horizontally if needed.

### 8. Motion
Minimal: 150–200ms transitions on hover/focus, fade/slide for drawers and toasts, skeleton shimmer. Respect `prefers-reduced-motion`.

### 9. RTL / Urdu
Mirror layout using logical properties. Icons that imply direction (arrows, chevrons) flip in RTL. Language switcher label: "EN | اردو". Test every page in both directions.

### 10. Accessibility
Semantic HTML, one H1 per page, alt text on all images (use product name), focus-visible outlines, minimum 44px touch targets, form labels linked to inputs, aria-labels on icon-only buttons, colour never the only signal.

### 11. Images & Icons Direction
- Product images: white or light background, square 1:1, product centred. Real photos preferred.
- Hero/About: real factory photos preferred; placeholders until provided.
- Icons: lucide-react (line style, 1.75 stroke). Logo provided later by URL (`site_settings.logo_url`); use a red "ASATEK" wordmark fallback.
- Image slots are tracked for the later image workflow: logo, hero image, about/factory images (2–3), category images (one per category), product images.

---

# PART 5

## Backend Schema (Supabase / PostgreSQL)

> **Planning document only.** AI Studio must NOT create a database. AI Studio writes Supabase-ready code that matches the exact names below. ChatGPT + Supabase plugin creates the real project/database later from this document and the final code.
> Table and column names are **snake_case** and must be used exactly in `types/db.ts`, `services/*` and `mockData.ts`.

### 1. Tables

### 1.1 `profiles`
Links Supabase Auth users to a role. Only admin users are expected.
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | text | |
| `role` | text NOT NULL default `'user'` | CHECK in (`'user'`,`'admin'`) |
| `created_at` | timestamptz default now() | |

### 1.2 `categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `slug` | text UNIQUE NOT NULL | |
| `name_en` | text NOT NULL | |
| `name_ur` | text | |
| `icon` | text | lucide icon name, e.g. `Zap` |
| `image_url` | text | |
| `sort_order` | integer NOT NULL default 0 | |
| `is_active` | boolean NOT NULL default true | |
| `created_at`, `updated_at` | timestamptz default now() | `updated_at` via trigger |

### 1.3 `products`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `category_id` | uuid NOT NULL | FK → `categories(id)` ON DELETE RESTRICT |
| `slug` | text UNIQUE NOT NULL | |
| `sku` | text UNIQUE NOT NULL | |
| `name_en` | text NOT NULL | |
| `name_ur` | text | |
| `short_desc_en` | text | |
| `short_desc_ur` | text | |
| `moq` | integer NOT NULL default 1 | CHECK `moq >= 1` |
| `availability` | text NOT NULL default `'in_stock'` | CHECK in (`'in_stock'`,`'made_to_order'`,`'out_of_stock'`) |
| `is_active` | boolean NOT NULL default true | |
| `is_featured` | boolean NOT NULL default false | |
| `created_at`, `updated_at` | timestamptz default now() | `updated_at` via trigger |

### 1.4 `product_images`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `product_id` | uuid NOT NULL | FK → `products(id)` ON DELETE CASCADE |
| `image_url` | text NOT NULL | |
| `sort_order` | integer NOT NULL default 0 | |
| `is_primary` | boolean NOT NULL default false | at most one primary per product (partial unique index) |

### 1.5 `product_price_tiers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `product_id` | uuid NOT NULL | FK → `products(id)` ON DELETE CASCADE |
| `min_qty` | integer NOT NULL | CHECK `min_qty >= 1` |
| `unit_price` | numeric(12,2) NOT NULL | CHECK `unit_price >= 0`, PKR |
| UNIQUE | (`product_id`, `min_qty`) | |

### 1.6 `product_specs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `product_id` | uuid NOT NULL | FK → `products(id)` ON DELETE CASCADE |
| `label_en` | text NOT NULL | |
| `label_ur` | text | |
| `value_en` | text NOT NULL | |
| `value_ur` | text | |
| `sort_order` | integer NOT NULL default 0 | |

### 1.7 `inquiries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `reference` | text UNIQUE NOT NULL | format `ASK-YYYYMMDD-NNNN` (from sequence `inquiry_seq`) |
| `type` | text NOT NULL default `'quote'` | CHECK in (`'quote'`,`'contact'`); `'quote'` = an order request from the Order List |
| `channel` | text NOT NULL default `'website'` | CHECK in (`'website'`,`'whatsapp'`) |
| `name` | text NOT NULL | |
| `phone` | text NOT NULL | |
| `city` | text | |
| `business_name` | text | |
| `message` | text | |
| `status` | text NOT NULL default `'new'` | CHECK in (`'new'`,`'contacted'`,`'closed'`) |
| `admin_note` | text | |
| `created_at` | timestamptz default now() | |

### 1.8 `inquiry_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK default `gen_random_uuid()` | |
| `inquiry_id` | uuid NOT NULL | FK → `inquiries(id)` ON DELETE CASCADE |
| `product_id` | uuid | FK → `products(id)` ON DELETE SET NULL |
| `product_name` | text NOT NULL | snapshot at submit time |
| `sku` | text | snapshot |
| `quantity` | integer NOT NULL | CHECK `quantity >= 1` |
| `unit_price` | numeric(12,2) | snapshot of applicable slab |

### 1.9 `site_settings` (key/value)
| Column | Type | Notes |
|--------|------|-------|
| `key` | text PK | |
| `value_en` | text | |
| `value_ur` | text | |
| `updated_at` | timestamptz default now() | |

**Keys to seed (placeholders, editable in Admin → Settings):**
`site_name` (ASATEK), `logo_url`, `tagline`, `hero_title`, `hero_subtitle`, `whatsapp_number` (placeholder `923000000000`; the real number is entered by the owner in Admin → Settings), `phone`, `email`, `address` (Nehar Kinara, Sadiqabad, Punjab, Pakistan; owner to confirm), `working_hours`, `maps_url`, `facebook_url`, `instagram_url`, `youtube_url` (https://www.youtube.com/@asatek3863), `about_title`, `about_body`, `hero_image_url`, `about_image_url`.

### 2. Relationships
`categories` 1—N `products`; `products` 1—N `product_images`, `product_price_tiers`, `product_specs`; `inquiries` 1—N `inquiry_items`; `inquiry_items` N—1 `products` (nullable); `profiles` 1—1 `auth.users`.

### 3. Indexes
- `products(category_id)`, `products(is_active, is_featured)`, `products(slug)`, `products(sku)`
- GIN/trgm optional: `products(name_en)` using `pg_trgm` for search (or simple `ilike`)
- `product_images(product_id, sort_order)`; partial UNIQUE `product_images(product_id) WHERE is_primary`
- `product_price_tiers(product_id, min_qty)`
- `product_specs(product_id, sort_order)`
- `inquiries(status, created_at DESC)`, `inquiries(channel)`, `inquiries(phone, created_at DESC)`
- `inquiry_items(inquiry_id)`
- `categories(sort_order)`

### 4. Functions & Triggers
1. `set_updated_at()` trigger function → on `categories`, `products`, `site_settings` before update.
2. `is_admin()` — `SECURITY DEFINER`, `STABLE`, `SET search_path = public`: returns true if `exists (select 1 from profiles where id = auth.uid() and role = 'admin')`.
3. Sequence `inquiry_seq`.
4. `submit_inquiry(payload jsonb) returns jsonb` — `SECURITY DEFINER`, `SET search_path = public`, executable by `anon` and `authenticated`.
   Input JSON: `{ "type": "quote"|"contact", "channel": "website"|"whatsapp", "name", "phone", "city", "business_name", "message", "items": [ { "product_id", "quantity" } ] }`.
   Behaviour:
   - Validate: name 2–80 chars; phone 10–15 digits after stripping non-digits; message ≤ 1000 chars; type valid; for `quote` at least 1 and at most 50 items; for `contact` no items required.
   - **Rate limit:** reject if the same phone created ≥ 5 inquiries in the last hour (raise exception `rate_limited`).
   - For each item: look up the **active** product, enforce `quantity >= moq`, compute the applicable slab price on the server (highest `min_qty <= quantity`), store `product_name`, `sku`, `unit_price` snapshots. Never trust client prices.
   - Generate `reference = 'ASK-' || to_char(now(),'YYYYMMDD') || '-' || lpad(nextval('inquiry_seq')::text, 4, '0')`.
   - Insert inquiry + items in one transaction. Return `{ "reference": ..., "id": ... }`.
5. Optional view/RPC for admin dashboard counts (or compute with count queries).

### 5. Row Level Security (RLS) — enable on ALL tables
Helper: `is_admin()` as above.

| Table | anon (public) | authenticated non-admin | admin |
|-------|---------------|-------------------------|-------|
| `profiles` | none | SELECT own row | SELECT all, UPDATE |
| `categories` | SELECT where `is_active` | same | ALL |
| `products` | SELECT where `is_active` | same | ALL |
| `product_images` | SELECT where parent product is active | same | ALL |
| `product_price_tiers` | SELECT where parent product is active | same | ALL |
| `product_specs` | SELECT where parent product is active | same | ALL |
| `inquiries` | **none** (insert only via `submit_inquiry`) | none | SELECT, UPDATE (status, admin_note), DELETE |
| `inquiry_items` | **none** | none | SELECT, DELETE |
| `site_settings` | SELECT all keys (no secrets stored here) | same | ALL |

- No direct INSERT policy for anon on `inquiries`/`inquiry_items`.
- `profiles.role` must not be updatable by non-admins (no UPDATE policy for self).
- Admin user is created manually in Supabase Auth, then a `profiles` row with `role='admin'` is inserted (ChatGPT should do this using the owner's email, after asking for it).

### 6. Storage
| Bucket | Public read | Write/delete | Limits |
|--------|-------------|--------------|--------|
| `product-images` | yes | admin only (`is_admin()`) | images only, ≤ 2 MB |
| `site-assets` | yes | admin only | images only, ≤ 2 MB |
Object path convention: `products/<product_id>/<timestamp>-<filename>`, `categories/<category_id>/...`, `site/<filename>`.

### 7. Auth Settings
- Email + password enabled; **public sign-ups disabled** (admin users created manually).
- Email confirmation off for the manually created admin (or confirmed manually).
- Site URL set to the Cloudflare URL after deployment.

### 8. Seed Data
- `site_settings` keys from 1.9 with placeholder values (Urdu values for `tagline`, `hero_title`, `hero_subtitle`, `about_title`, `address`).
- `categories` (sort_order in this order; slug / EN / UR / icon):
  1. `ups` / UPS / یو پی ایس / `Zap`
  2. `solar` / Solar Systems / سولر سسٹمز / `Sun`
  3. `inverters` / Inverters / انورٹرز / `PlugZap`
  4. `battery-chargers` / Battery Chargers / بیٹری چارجرز / `BatteryCharging`
  5. `capacitors` / Capacitors / کیپیسیٹرز / `Component`
  6. `resistors` / Resistors / ریزسٹرز / `Component`
  7. `heat-sinks` / Heat Sinks / ہیٹ سنکس / `Fan`
  8. `igbt` / IGBTs / آئی جی بی ٹی / `Cpu`
  9. `pcb` / PCBs / پی سی بی / `CircuitBoard`
- No real products seeded. The frontend mock adapter (TRD §5) carries ~12 sample products for preview only.

### 9. Required Backend Operations (mapped to services)
- Public: list categories; list products (filters: category slug, search `ilike` on `name_en`/`name_ur`/`sku`, sort, pagination with count) joined with primary image + lowest tier price; get product by slug with images, tiers, specs; featured products; related products; get all settings; `rpc('submit_inquiry')`.
- Admin: CRUD categories/products/images/tiers/specs; upload to storage; list/get/update/delete inquiries with items; update settings; dashboard counts.

---

# PART 6

## Implementation Plan (for Google AI Studio, single run)

> Internal execution plan. Follow it in order, in ONE pass, and finish everything. All six parts of this file (PART 1 to PART 6) are the source of truth; if a detail is missing, choose the simplest option consistent with them. Do not create a Supabase database. Write Supabase-ready code with a mock-data fallback (TRD §5).

## Build Order
### Step 1 — Project setup
- Vite + React + TypeScript project; install: `react-router-dom`, `@supabase/supabase-js`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `tailwindcss` (+ postcss/autoprefixer).
- Files: `package.json` (with `package-lock.json`, **no bun lockfiles**), root `.npmrc` = `legacy-peer-deps=true`, `.env.example` (two `VITE_` vars), `.gitignore` (includes `.env`), `public/_redirects` (`/*    /index.html   200`), `public/robots.txt`, `public/sitemap.xml`, `public/favicon.svg`.
- Google Fonts links: Poppins, Inter, Noto Nastaliq Urdu.

### Step 2 — Design system & layout
- Tailwind theme + CSS variables from 04 (colours, fonts, radii). Logical-property (RTL-safe) utilities.
- `LanguageContext` + `en.json`/`ur.json` (all UI strings, including admin labels in English only is acceptable; public site fully bilingual) + `pick()` helper.
- UI components: Button, Input, Select, Modal, Badge, Skeleton, EmptyState, Toast, Pagination.
- Layout: Header (nav, language switcher, quote icon with badge, mobile menu), Footer, WhatsAppFloat, Layout wrapper with per-page `<title>`/meta.

### Step 3 — Types, services, mock data
- `types/db.ts` exactly mirroring 05_Backend_Schema.md.
- `lib/supabase.ts` (env vars, missing-config screen), `lib/format.ts`, `lib/pricing.ts`, `lib/whatsapp.ts`.
- `services/*` per 05 §9, with the **mock adapter** used automatically when env vars are missing. Mock data: 9 categories (seed list in 05 §8) and ~12 sample products spread across them, including these real ASATEK models (specs from PRD §3A, sample prices only): SC5 VA-1260, SC5 V-1260, SC5 VA-2460, SC5 V-2460, SC6-1230, SC6-2430, each with 2–3 price slabs, 3–5 specs (EN+UR), availability variety, 1–2 featured. Mark sample prices clearly as sample in a code comment only (not in the UI).
- Hooks with React Query.

### Step 4 — Public pages
Home → Products (filters/search/sort/pagination via URL params) → ProductDetail (gallery, slab table with active-slab highlight, quantity, Add to Order, WhatsApp link, specs, related) → Order List at `/quote` (QuoteContext in localStorage, estimate totals via `pricing.ts`, buyer form with Zod + honeypot, **two buttons: "Place Order on Website" (`channel=website`) and "Order on WhatsApp" (`channel=whatsapp`, saves first then opens wa.me)**, success screen with reference, WhatsApp message per 03 §2) → About → Contact (contact form uses `submit_inquiry` type `contact`) → NotFound.

### Step 5 — Admin panel
- `AuthContext` (Supabase Auth, admin check via `profiles.role`), `ProtectedRoute`, AdminLayout (sidebar).
- Pages: Login, Dashboard, Categories, ProductsList, ProductForm (images uploader, price slab editor, specs editor), Inquiries, InquiryDetail, Settings (**WhatsApp Number card first**, with validation and Test button).
- In mock mode, admin login accepts a demo path: show a banner "Demo mode: Supabase not configured" and allow viewing admin screens with in-memory data (changes are not persisted). Remove nothing in production code paths: this only activates when env vars are absent.

### Step 6 — Supabase-ready services
- All service functions use the exact table/column names from 05. Inquiry creation only through `supabase.rpc('submit_inquiry', { payload })`. Storage uploads use buckets `product-images` and `site-assets`.
- Env vars only via `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Step 7 — Polish
- Skeletons, empty/error states, toasts on every action, focus states, alt text, aria-labels.
- Lazy-load admin routes and images; check Urdu RTL on every page; check 360px mobile width.
- SEO meta per page; `noindex` on `/admin/*`.

### Step 8 — QA checklist (verify before finishing)
- [ ] `npm run build` succeeds with zero TypeScript errors; output in `dist`.
- [ ] Refreshing any route (`/products/xyz`, `/quote`) works (SPA fallback present).
- [ ] No hardcoded keys; `.env.example` present; no `bun.lock`/`bun.lockb`; `.npmrc` present.
- [ ] Language switch EN ⇄ UR flips direction and all public text.
- [ ] Add to Order → quantity respects MOQ → slab price changes with quantity → BOTH buttons work in mock mode (fake reference); WhatsApp button builds the link from the settings number.
- [ ] Changing the WhatsApp number in Admin → Settings updates all WhatsApp links.
- [ ] Every route in 02_TRD §4 exists; admin routes redirect to login when logged out.
- [ ] Table/column names in code match 05 exactly.
- [ ] Red-dominant theme applied; green used only for In Stock/success and the WhatsApp button.
- [ ] README with setup steps and the env variable list.

## Dependencies / Notes
- Real logo, hero image, product photos and contact details arrive later (image workflow). Every such slot must read from `site_settings` / DB URLs and show a graceful placeholder when empty.
- No AI features, no payment, no customer accounts.

---

