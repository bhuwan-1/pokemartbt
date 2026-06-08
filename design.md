# pokemartbt — Design System (design.md)

> Codified from the Google Stitch mockups (landing page + "Create New Product" admin form). Aesthetic: **bold collector-retail** — Pokémon red and gold accents on a cool off-white, Montserrat throughout, with tactile "trading-card" motion (holographic sweep + lift). This document is the source of truth for tokens, components, and interactions; build against it.

---

## 1. Brand Direction

- **Personality:** energetic, premium, trustworthy. Think trading-card shop meets modern e-commerce.
- **Signature moves:** (1) red-tinted hover lift on cards, (2) holographic light sweep across card surfaces, (3) heavy Montserrat headlines with tight tracking, (4) red uppercase micro-labels as section markers.
- **Restraint:** dominant red + neutral surfaces; gold and the WhatsApp green are _accents only_, never large fills.

## 2. Color Tokens

The Stitch export shipped a full ~60-token Material Design 3 palette. Use the **core set** below for everything; the full palette is overkill. Note the neutrals are intentionally _warm-tinted_ (brownish outlines, pink-tinted variants) which keeps the cool `#f9f9ff` surfaces from feeling clinical — keep that warmth.

### Core tokens

| Token                    | Hex       | Usage                                                                        |
| ------------------------ | --------- | ---------------------------------------------------------------------------- |
| `primary`                | `#bc0100` | Brand red. Primary buttons, links, focus ring, section labels, active states |
| `primary-hover`          | `#930100` | Primary hover/press (darker red)                                             |
| `primary-container`      | `#eb0000` | Brighter red fills (badges, hero pill)                                       |
| `on-primary`             | `#ffffff` | Text/icons on red                                                            |
| `secondary` (gold)       | `#ffcb09` | Accent: "selected" indicator, "Legendary"-style badge bg, highlights         |
| `on-secondary`           | `#6f5700` | Text on gold                                                                 |
| `whatsapp`               | `#25D366` | WhatsApp CTA **only**                                                        |
| `background` / `surface` | `#f9f9ff` | Page background                                                              |
| `surface-low`            | `#f0f3ff` | Input fields, subtle fills                                                   |
| `surface` (panel)        | `#e7eeff` | Section/hero background blocks                                               |
| `surface-high`           | `#dee8ff` | Card backgrounds, raised blocks                                              |
| `panel`                  | `#ffffff` | Form cards / content panels (white on the cool bg)                           |
| `on-surface`             | `#121c2c` | Primary text (near-black navy)                                               |
| `on-surface-variant`     | `#603e39` | Secondary/muted text (warm brown)                                            |
| `outline`                | `#956d67` | Strong borders                                                               |
| `outline-variant`        | `#ebbbb4` | Hairline borders, dividers (used at ~10–30% opacity)                         |
| `error`                  | `#ba1a1a` | Validation errors                                                            |

> ⚠️ `error` (`#ba1a1a`) sits very close to `primary` (`#bc0100`). Don't rely on red alone to signal errors — pair with an icon/message.

## 3. Typography

**Family:** Montserrat (400, 700, 800, 900). Single-family system — display weight does the work.

| Role                 | Size / line-height / tracking / weight | Notes                                             |
| -------------------- | -------------------------------------- | ------------------------------------------------- |
| `headline-xl`        | 48px / 1.1 / -0.02em / 800             | Hero (desktop)                                    |
| `headline-xl-mobile` | 32px / 1.2 / — / 800                   | Hero (mobile)                                     |
| `headline-lg`        | 32px / 1.2 / — / 700                   | Section titles                                    |
| `headline-md`        | 24px / 1.3 / — / 700                   | Card titles, button labels, dialog titles         |
| `price-display`      | 28px / 1.0 / -0.01em / 800             | Prices                                            |
| `body-lg`            | 18px / 1.6 / — / 400                   | Lead paragraphs                                   |
| `body-md`            | 16px / 1.6 / — / 400                   | Default body                                      |
| `body-sm`            | 14px / 1.5 / — / 400                   | Captions, footer, helper text                     |
| `label-bold`         | 12px / 1.0 / 0.05em / 700              | **UPPERCASE** section markers, badges, nav labels |

Section markers (e.g. "PRODUCT CLASSIFICATION", "MEDIA ASSETS") are `label-bold`, uppercase, in `primary` red.

## 4. Spacing, Layout, Radius

- **Base unit:** 8px. **Gutter:** 24px.
- **Page margins:** 16px mobile / 40px desktop. **Max content width:** 1280px (centered).
- **Full-bleed bands:** the landing hero and "How to Order" sections break out of the `max-w-7xl` page container to span the full viewport (`w-screen ml-[calc(50%-50vw)]`); their inner content stays constrained to the 1280px container. The hero sits flush under the fixed header. `overflow-x-clip` on the layout root prevents the `100vw` breakout from causing horizontal scroll.
- **Radius scale:** `sm` 0.25rem (default), `lg` 0.5rem (inputs/buttons/**WhatsApp CTA**), `xl` 0.75rem (cards), `2xl` 1rem (form panels), `full` 9999px (badges, condition pills, type tabs). The big CTA block uses `2rem`.
- **Forms:** two-column on desktop (≈2fr content / 1fr sidebar for media + metadata), single column on mobile. Panels are white `2xl` cards with a hairline `outline-variant` border at ~10% and a soft shadow.

## 5. Elevation & Signature Effects

Reusable as plain CSS utilities (carried over from the mockup — they're good):

```css
/* Card hover lift — note the brand-red-tinted shadow */
.card-lift {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
}
.card-lift:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(188, 1, 0, 0.1);
}

/* Holographic sweep — diagonal light pass on hover */
.holo-sweep {
  position: relative;
  overflow: hidden;
}
.holo-sweep::after {
  content: '';
  position: absolute;
  top: -150%;
  left: -150%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 45%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 55%
  );
  transition: all 0.6s ease-in-out;
  pointer-events: none;
}
.holo-sweep:hover::after {
  top: 0;
  left: 0;
}
```

- **Buttons:** press = `translateY(1px)`; primary buttons carry a soft shadow that intensifies to `primary/20` on hover.
- **Header:** fixed, 80px tall, `surface/95` + `backdrop-blur-md`, hairline bottom border.
- **Motion budget:** keep it to these signatures plus one staggered hero reveal. Don't scatter micro-animations everywhere.

## 6. Components

### Buttons

- **Primary:** red fill, white text, `lg` radius, soft shadow. Hover darkens to `primary-hover`.
- **Secondary / outline:** 2px `outline` border, transparent fill, tinted hover.
- **WhatsApp:** `#25D366` fill, white text, **`lg` radius (boxy — same shape as the primary button)**, the **WhatsApp brand logo** (inline SVG `WhatsAppIcon` in `src/components/`, not the `send` glyph), scale-on-hover. Reserved for the WhatsApp action. _(Updated 2026-06-08 — previously a `full`-radius pill with the `send` icon.)_
- **Text/link:** `primary`, often with a trailing arrow icon that nudges right on hover.

### Badges / pills

Rounded-`full`, `label-bold` uppercase. Variants: red (`primary-container` bg / white) for status ("Expansion Pack Live"); gold (`secondary` bg / `on-secondary`) for tier ("Legendary").

### Product card (catalog tile)

`xl` radius, `surface-high` bg, `holo-sweep` + `card-lift`. Cover image `object-cover`; dark gradient overlay (`from-black/80`) when text sits on the image. Title `headline-md`, price `price-display`.

### Featured Collections (showcase)

Driven by `is_featured` products. **Text never overlays the card art** — Pokémon images are busy full-bleed artwork, so all metadata sits on solid `panel` surfaces. Each card's art is shown **contained** (`object-contain`, never cropped) on a lit **pedestal** (`bg-gradient-to-b from-surface-low to-surface-high`) with a `drop-shadow-xl` lift + the `holo-sweep` effect — like a slab on display. Layout: an editorial **split-panel hero** for the first item (pedestal + info column: gold/red "Featured pick" marker, name, set, badge, `price-display` red price, "View card →"), then a **slab grid** (2-up mobile / 4-up desktop) for the rest — white `card-lift` cards with the pedestal on top and name (2-line clamp) · set · badge · price below. _(Redesigned 2026-06-08 — replaced the text-on-image bento, which was unreadable over busy card art.)_

### Form components (from the "Create New Product" mockup)

- **Panel:** white `2xl` card, hairline border, soft shadow. Each opens with a red uppercase `label-bold` section header.
- **Header action bar:** title (`headline-lg`/`xl`) + muted subtitle on the left; **Cancel** (outline) + **Publish Product** (primary red) on the right.
- **Type selector (radio-cards):** two large clickable cards side by side, each with a Material icon, bold title, and one-line description. **Selected state:** highlighted border + a **gold (`secondary`) filled radio dot**; unselected shows a hollow outline radio. This is the `product_type` discriminant.
- **Text input / textarea:** `lg` radius, `outline-variant` border, muted placeholder, **red focus ring** (`focus:ring-primary focus:border-primary`). Textarea ~6 rows, resizable vertically.
- **Select (e.g. Rarity):** same input styling with a trailing chevron.
- **Condition pills:** a wrap of rounded-`full` toggle chips — `NM LP MP HP D` — outline by default, **`primary` fill + white when selected** (single-select). (Label "D" maps to stored value `DMG`.) Shown for singles only.
- **Graded toggle (singles):** a switch/checkbox that reveals `grading_company` (select) + `grade` (number) when on.
- **Upload dropzone (Media Assets):** dashed `outline-variant` border, centered upload icon in a tinted red circle, primary text "Click to upload or drag and drop", helper "High-res PNG, JPG or WEBP (Max 10MB)".
- **Thumbnail row:** ordered thumbnails (first = cover) followed by `+` add-tiles on `surface-low`. Supports reorder and per-thumbnail remove. Backed by `image_paths[]`.

### Navigation

- **Top nav (desktop):** logo (`headline-md`, **Montserrat black 900, all-`primary` red, `tracking-tighter`** — single heavy wordmark) + text links **Home · Catalog** (active link has a 2px red underline) + cart icon + **account icon linking to `/admin/login`**. **No search field.** _(Updated 2026-06-08 — logo unified to all-red heavy; search dropped; account icon = admin entry point per CLAUDE.md rule 4; Singles/Sealed links removed — type filtering lives on the catalog page.)_
- **Mobile bottom nav:** fixed, `rounded-t-xl`, top shadow, **3 slots: Home, Shop, Cart** with Material icons + `label-bold` labels; active item is a `primary-container` pill. **No Admin destination here** (admin login lives in the header account icon + footer link instead).

### Footer

Full-bleed **dark band** — background set by a single `FOOTER_BG` constant in `footer.tsx` (default `#0a0a0a`; any CSS color), light text tuned for dark. Four columns: brand wordmark + blurb · **Shop** (Catalog / Singles / Sealed) · **Support** (WhatsApp Contact, Admin Login) · **Get in touch** (boxy WhatsApp CTA). **No newsletter** (§11). Hairline divider, then a centered trademark/copyright line.

## 7. Imagery

- Catalog thumbnails: `object-cover`, **consistent aspect ratio** — Pokémon cards are ~2.5:3.5, so a `5/7` ratio frame keeps the grid tidy. Hero art can use `object-contain`.
- Use a dark top-gradient overlay whenever text overlays an image.
- **Replace all Stitch image URLs** (`lh3.googleusercontent.com/aida-public/...`) — they're ephemeral and will expire. Serve from Supabase Storage public URLs (`image_paths`).

## 8. Iconography

Material Symbols (Outlined), default weight 400. Used in nav, steps, form sections, and buttons (search, shopping_cart, account_circle, chat, local_shipping, grid_view, upload, add, etc.).

## 9. Accessibility Notes

- Don't signal state by color alone: condition pills and the type selector already pair color with shape (fill / radio dot) — keep that.
- Verify `on-surface-variant` (`#603e39`) contrast on `#f9f9ff` for small text; bump to `on-surface` if it falls under 4.5:1.
- Maintain visible focus styles (the red focus ring) on all inputs and the radio-cards/pills; ensure they're keyboard-operable.
- Provide `alt` text for product images (cover at minimum).

## 10. Tailwind Config (trimmed) + Utilities

Distilled from the Stitch config. If you're on shadcn/ui, also map these into your CSS variables (`--primary`, `--background`, `--ring`, …) in the format your shadcn setup uses.

```js
// tailwind.config.{js,ts}
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#bc0100',
        'primary-hover': '#930100',
        'primary-container': '#eb0000',
        'on-primary': '#ffffff',
        secondary: '#ffcb09',
        'on-secondary': '#6f5700',
        whatsapp: '#25D366',
        background: '#f9f9ff',
        'surface-low': '#f0f3ff',
        surface: '#e7eeff',
        'surface-high': '#dee8ff',
        panel: '#ffffff',
        'on-surface': '#121c2c',
        'on-surface-variant': '#603e39',
        outline: '#956d67',
        'outline-variant': '#ebbbb4',
        error: '#ba1a1a',
      },
      fontFamily: { sans: ['Montserrat', 'sans-serif'] },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'price-display': ['28px', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '800' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body-md': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'label-bold': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      maxWidth: { container: '1280px' },
      boxShadow: { 'card-hover': '0 20px 40px rgba(188,1,0,0.10)' },
    },
  },
}
```

Add the `.card-lift` and `.holo-sweep` rules from §5 to your global CSS (or as plugin utilities).

## 11. Notes for Implementation (mockup-only)

- The Stitch HTML uses the **Tailwind CDN** with a giant inline config — that's mockup scaffolding. Rebuild with a real Tailwind setup using the trimmed tokens above.
- Drop the **newsletter** UI and any **fake stats** ("10,000+ collectors") — out of scope / unverifiable.
- The fictional collection/set names in the mockup ("Charizard Vault", "Verbal Jungle", etc.) are placeholders, not real data — drive the catalog from Supabase.
- Keep **Admin** out of the customer-facing nav (SPEC §5/§9): the route guard is cosmetic; RLS is the real lock.
