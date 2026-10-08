# Project Guidance

## User Preferences

- Antarmuka berbahasa Indonesia
- Fokus seller marketplace Indonesia (Shopee, TikTok Shop, Lazada)
- Elemen gamifikasi: streak, milestone, kuis
- Tantangan 100 hari menuju 1.000.000 barang terjual
- Palet hangat krem dan oranye, kartu putih membulat, banyak ruang kosong

## Verified Commands

- **typecheck**: `mops check --fix && pnpm --dir src/frontend typecheck`
- **fix**: `pnpm --dir src/frontend fix`
- **build**: `mops build && pnpm --dir src/frontend build`

## Learnings

- Enhanced Migration seed data must be inlined in the migration file: migrations may only import mo:core and mops packages, never project modules.
- Day-keyed content catalogs must be seeded from the init-once migration entry and anchored to the deploy-day UTC YYYYMMDD key so getTodayTip/getTodayQuiz return content on the current day.
- `label` is a reserved Motoko keyword; MixinAuthorization declares a transient `challenges` field, so actor stable fields must avoid both names.
- OQL entities over variant/array/nested-Map fields need Entity.manual with .payload(...) and the matching value module import (e.g. PrincipalValue).
- Motoko has no triple-quoted strings; a text literal is one double-quote-delimited sequence that may span lines.
- Backend DayKey is YYYYMMDD bigint; convert via local Date helpers rather than new Date(Number(day)).
- The local preflight browser boundary blocks the Internet Identity canister call, so authenticated flows cannot be exercised in local testing.
- The local preflight browser boundary blocks the Internet Identity canister call (/api/v4/canister/rdmx6-jaaaa-aaaaa-aaadq-cai/call), so authenticated flows cannot be exercised in local testing; the login gate itself renders and the loading state is observable.
- useInternetIdentity() exposes isAuthenticated (identity present and non-anonymous) and isInitializing (loginStatus === 'initializing'); gate authenticated UI on isAuthenticated, never isLoginSuccess, because a restored session on reload is 'idle' + authenticated.
- login() and clear() are fire-and-forget; the hook's loginStatus ('logging-in'/'loginError') tracks the async lifecycle, so the sign-in button should derive its disabled state from loginStatus rather than local useState.
- The generated backend.d.ts declares Platform/TipTheme/UserRole as value enums, so they must be imported as values (not import type) wherever used as runtime values.
