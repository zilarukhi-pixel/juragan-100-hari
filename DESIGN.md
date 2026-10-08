# Design Brief

## Direction

Warung Momentum — a warm, optimistic 100-day sales challenge dashboard that turns daily marketplace hustle into visible, celebratory progress.

## Tone

Friendly and energetic editorial: warm cream paper, confident amber-orange ink, generous whitespace — like a well-kept merchant ledger that cheers you on.

## Differentiation

A "momentum meter" identity: every number is a milestone, every streak is a badge, and progress bars glow with amber gradient — data feels like encouragement, not accounting.

## Color Palette

| Token      | OKLCH         | Role                                        |
| ---------- | ------------- | ------------------------------------------- |
| background | 0.972 0.014 84 | Warm cream canvas, all page surfaces        |
| foreground | 0.215 0.038 265 | Deep ink-navy text, high-contrast reading   |
| card       | 1 0 0         | Pure white rounded cards, the content stage |
| primary    | 0.66 0.19 52  | Amber-orange CTAs, progress, active nav     |
| accent     | 0.5 0.2 274   | Vivid indigo for quiz/gamification energy   |
| success    | 0.6 0.17 152  | Streak + milestone achieved green           |
| muted      | 0.948 0.016 84 | Soft cream fills, secondary surfaces        |
| warning    | 0.76 0.16 78  | Near-target, tip-of-day highlight           |
| destructive | 0.54 0.21 27 | Delete / reset / destructive actions        |

## Typography

- Display: Space Grotesk — headings, big progress numbers, streak counts (tight tracking, bold).
- Body: Plus Jakarta Sans — UI labels, body copy, forms, tips (friendly, highly legible).
- Mono: JetBrains Mono — numeric totals, percentages, dates (tabular alignment).
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`.

## Elevation & Depth

White cards float on cream with a two-layer `shadow-card` (tight contact + soft ambient); modals and the active nav use `shadow-elevated`; primary CTAs carry a restrained `shadow-primary-glow`.

## Structural Zones

| Zone    | Background        | Border    | Notes                                                        |
| ------- | ----------------- | --------- | ------------------------------------------------------------ |
| Header  | `bg-card`         | `border-b`| Sticky; logo + streak pill + theme toggle; subtle grain      |
| Content | `bg-background`   | —         | Alternating `bg-muted/30` sections; max-w-6xl centered grid  |
| Nav     | `bg-card`         | `border-t`| Mobile bottom bar (5 items); desktop sidebar/top nav         |
| Footer  | `bg-muted/40`     | `border-t`| Quiet app info + reset, low emphasis                         |

## Spacing & Rhythm

Generous: `p-5`–`p-6` inside cards, `gap-4`–`gap-6` between cards, `space-y-8` between sections, `rounded-2xl`/`rounded-3xl` cards, `rounded-full` pills — density stays airy, never cramped.

## Component Patterns

- Buttons: `rounded-full`, amber gradient primary with glow, soft cream secondary, ghost for tertiary; hover lifts via `transition-spring`.
- Cards: `rounded-2xl` white, `shadow-card`, `border` hairline, `p-5`/`p-6`.
- Badges: `rounded-full` soft-tinted pills (`primary-soft`, `success-soft`, `accent-soft`) with matching deep text.
- Progress: rounded track in `muted`, amber gradient fill animated with `progress-grow`; milestone dots at 10/25/50/75/100.

## Motion

- Entrance: `animate-fade-up` staggered 60ms per card on mount; `animate-scale-in` for modals.
- Hover: `transition-spring` lift + shadow deepen on interactive cards and buttons.
- Decorative: `animate-streak-pulse` on the streak badge; `progress-grow` on bar reveal; shimmer on loading skeletons.

## Constraints

- All UI copy in Bahasa Indonesia; platform names Shopee, TikTok Shop, Lazada shown as pills only.
- Mobile-first: bottom nav < md, sidebar/top nav ≥ md; touch targets ≥ 44px.
- Tokens only — no raw hex, rgb, or arbitrary color classes in components.
- No direct marketplace integration, auto-sync, email reminders, or seller leaderboards.

## Signature Detail

The amber gradient "momentum bar" that grows toward 1.000.000, paired with a pulsing streak flame badge — progress you can feel at a glance.
