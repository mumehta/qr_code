# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production mobile QR code generator app built with **Expo (React Native)** and **Firebase**. Targets iOS and Android via app store distribution. Supports user authentication (Firebase Auth) and per-user QR history stored in Firestore.

## Tech Stack

- **Expo SDK** (managed workflow) with **Expo Router** (file-based navigation)
- **TypeScript** throughout
- **Firebase JS SDK** — Auth (email/password + social), Firestore (user data/QR history)
- **react-native-qrcode-svg** — QR rendering on native canvas
- **expo-file-system** + **expo-media-library** — save QR as PNG to device
- **expo-clipboard** — copy QR content to clipboard

## Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server (opens Expo Go on device/simulator)
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android

# Build for distribution (EAS)
npx eas build --platform ios
npx eas build --platform android

# Submit to app stores
npx eas submit --platform ios
npx eas submit --platform android

# Lint
npx expo lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
app/                        # Expo Router file-based routing
  _layout.tsx               # Root layout — Firebase init, auth state listener
  (auth)/                   # Unauthenticated routes (no tab bar)
    login.tsx
    register.tsx
  (app)/                    # Authenticated routes
    _layout.tsx             # Tab navigator (redirects to /login if not authed)
    index.tsx               # QR Generator screen
    history.tsx             # Saved QR codes for current user
    settings.tsx
components/
  QRGenerator/              # Core QR generation UI (ported from original JSX)
  QRCard.tsx                # Displayable saved QR item
lib/
  firebase.ts               # Firebase app init + exported auth/db instances
  qr.ts                     # getContent(), vCard formatting, validation logic
hooks/
  useAuth.ts                # Wraps onAuthStateChanged, exposes user + loading
  useQRHistory.ts           # Firestore CRUD for user's saved QR codes
constants/
  theme.ts                  # Colors, spacing, typography
```

## Architecture

### Auth Flow
`app/_layout.tsx` subscribes to `onAuthStateChanged`. If `user` is null, Expo Router redirects to `/(auth)/login`. Authenticated users land on `/(app)/index`. The `useAuth()` hook is the single source of truth for auth state throughout the app.

### Firebase Setup
`lib/firebase.ts` initialises the Firebase app once and exports `auth` and `db` (Firestore) instances. **Never initialise Firebase outside this file.** Firebase config values must live in environment variables via `app.config.ts` (using `expo-constants`) — never hardcoded.

### QR Generation
`lib/qr.ts` contains the encoding logic extracted from the original `qr-generator.jsx`: `getContent(tab, data)` returns the string to encode, `isValid(tab, data)` validates inputs. The React Native component uses `react-native-qrcode-svg` to render the QR, which natively supports SVG export for high-quality PNG saves.

### Data Model (Firestore)
```
users/{uid}/
  qrHistory/{docId}/
    content: string       # encoded QR string
    type: "url"|"text"|"contact"
    label: string         # user-provided name
    createdAt: Timestamp
```

## Environment Variables

Configure via `app.config.ts` reading from a `.env` file (use `expo-constants`):

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

## Key Conventions

- All screens are in `app/` via Expo Router. Navigation is done with `router.push()` / `<Link>` — never with manual `NavigationContainer`.
- Firestore writes always go through `hooks/useQRHistory.ts`, not directly from screen components.
- Platform-specific code uses `.ios.tsx` / `.android.tsx` file suffixes or `Platform.OS` checks inline for minor differences only.

---

## Claude Code Working Protocol

All code changes follow a **Generate → Validate → Fix** loop. Skip this only when the user explicitly asks for a rough draft or pseudocode.

### Step 1 — Read before writing

- Read every file being modified plus its direct imports before touching it.
- Identify which layer the change belongs to: screen, component, hook, lib, or config.
- Do not introduce new packages without justification.

### Step 2 — Implement

- Make the smallest targeted change that satisfies the request.
- Keep UI logic in `components/` or `app/`, domain logic in `lib/qr.ts`, data access in `hooks/`.
- Never call Firestore directly from a screen — always go through `hooks/useQRHistory.ts`.
- Never initialise Firebase outside `lib/firebase.ts`.

### Step 3 — Self-validation checklist

After writing, mentally verify each item before responding:

| Area | Check |
|---|---|
| Syntax | No unclosed brackets, JSX tags, or template literals |
| TypeScript | No implicit `any`, all props/return types satisfy the strict tsconfig |
| Imports | All import paths exist; `@/` alias resolves correctly; no circular deps |
| Expo Router | Route files placed under `app/`; group names `(auth)` / `(app)` match layout files; `router.push()` targets real paths |
| Hooks | No hooks called conditionally; `useEffect` deps arrays are complete; no stale closures over auth/uid state |
| Firebase auth | `auth` and `db` imported only from `lib/firebase.ts`; async Firebase calls are awaited and wrapped in try/catch |
| Firestore schema | Writes include exactly `{ content, type, label, createdAt }` on `users/{uid}/qrHistory/{docId}`; `type` is `"URL" \| "Text" \| "Contact"` |
| Permissions | `expo-media-library` save flow calls `requestPermissionsAsync()` before `saveToLibraryAsync()` |
| Edge cases | Empty inputs handled by `isValid()`; URL auto-prefix applied via `getContent()`; contacts with missing fields produce valid vCard |
| Platform | Anything using `document`, `window`, or Canvas API must not exist — this is React Native |

### Step 4 — Run checks

When terminal access is available, run after every change set:

```bash
npx tsc --noEmit
npx expo lint
```

If either fails, do **not** proceed to the response — go to Step 5.

### Step 5 — Fix loop (max 3 cycles)

1. Read the full error output.
2. Identify the root cause — do not patch symptoms.
3. Make a targeted fix to the specific file and line.
4. Re-run the failed check.
5. If still failing after 3 cycles, stop and report the error to the user with the exact output and what was tried.

### Truthfulness rule

**Never state that lint, type-check, or any other validation passed unless the command was actually executed and produced no errors in this session.** If checks were not run (e.g. no terminal access), say so explicitly.

### Response summary format

End every response that involves code changes with:

```
## Summary
**Changed:** <file list>
**What changed:** <1-2 sentence description per file>
**Validation:** <"npx tsc --noEmit: passed" / "not run — no terminal access" / "failed: <error>">
**Fixes applied:** <any errors caught in the validate-fix loop, or "none">
**Remaining risks:** <known limitations, untested platforms, or "none">
```
