# QR Forge

A production mobile QR code generator built with Expo (React Native) and Firebase. Available on Android and Web.

**Package:** `com.artisanintuition.qrforge`
**Bundle ID:** `com.artisanintuition.qrforge`

---

## Features

- Generate QR codes for URLs, text, and contact cards (vCard)
- Save QR codes as PNG images to device photo library
- Copy QR content to clipboard
- User authentication (email/password) via Firebase Auth
- Per-user QR history synced to Firestore
- Dark theme throughout
- Web support (Progressive Web App)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (managed workflow) |
| Navigation | Expo Router (file-based) |
| Language | TypeScript |
| Auth & Database | Firebase Auth + Firestore |
| QR Rendering | react-native-qrcode-svg |
| File Save | expo-media-library + expo-file-system |
| Clipboard | expo-clipboard |
| Build & Distribution | EAS (Expo Application Services) |

---

## Project Structure

```
app/                        # Expo Router file-based routing
  _layout.tsx               # Root layout — Firebase init, auth state listener
  (auth)/                   # Unauthenticated routes
    login.tsx
    register.tsx
    forgot-password.tsx
  (app)/                    # Authenticated routes (tab navigator)
    index.tsx               # QR Generator screen
    history.tsx             # Saved QR codes
    settings.tsx
  +not-found.tsx            # 404 screen
components/
  QRGenerator/              # Core QR generation UI
lib/
  firebase.ts               # Firebase app init + exported auth/db instances
  qr.ts                     # getContent(), getLabel(), isValid(), vCard logic
hooks/
  useAuth.ts                # Auth state listener (single source of truth)
  useQRHistory.ts           # Firestore CRUD for user QR history
constants/
  theme.ts                  # Colors, spacing, typography
```

---

## Local Development

### Prerequisites
- Node.js 20+
- Expo CLI
- EAS CLI (`npm install -g eas-cli`)
- A Firebase project with Auth and Firestore enabled

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy env template and fill in Firebase values
cp .env.local.example .env.local
```

### Environment Variables

Create a `.env.local` file in the project root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Running

```bash
# Web (browser)
npx expo start --web

# Android (requires device or emulator)
npx expo start --android

# iOS (requires macOS + Xcode)
npx expo start --ios
```

### Checks

```bash
npx tsc --noEmit       # Type check
npx expo lint          # Lint
```

---

## CI/CD Pipeline

### Overview

Every push to `main` triggers a GitHub Actions workflow that builds an Android production bundle via EAS.

```
git push main
      ↓
GitHub Actions
      ↓
npm install
      ↓
EAS Build (production Android .aab)
      ↓
[Future] Auto-submit → Play Store Internal Testing
      ↓
Manual test on device
      ↓
Play Console: Promote to Closed Testing (12 testers, 14 days)
      ↓
Play Console: Promote to Production ← manual approval required
```

### Workflow File

`.github/workflows/build.yml`

Triggers on: `push` to `main`
Runs on: `ubuntu-latest`
Node version: `20`

### GitHub Secrets & Variables

| Name | Type | Purpose |
|---|---|---|
| `EXPO_TOKEN` | Secret | EAS authentication |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Secret | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Secret | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Variable | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Variable | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Variable | Firebase messaging sender |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Variable | Firebase app ID |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Secret | Play Store submission (pending setup) |

### EAS Build Profiles

| Profile | Platform | Output | Use |
|---|---|---|---|
| `development` | Android | APK | Local dev with expo-dev-client |
| `preview` | Android | APK | Internal distribution |
| `production` | Android | AAB | Play Store |
| `production` | iOS | IPA | App Store |

Version codes are managed **remotely** by EAS (`appVersionSource: remote`) — no manual version bumping needed.

### Play Store Tracks

| Track | Access | Review | Purpose |
|---|---|---|---|
| Internal Testing | Up to 100 invited testers | None | Post-build smoke testing |
| Closed Testing | Invited testers | None | Beta (min 12 testers, 14 days) |
| Production | Public | Yes (1-3 days) | Live release — promoted manually |

### Enabling Auto-Submit (pending)

Auto-submit to Internal Testing is ready but disabled pending Play Console API access (available once the developer account is verified). To enable:

1. Set up a service account in Play Console → Setup → API access
2. Add the JSON key as `GOOGLE_SERVICE_ACCOUNT_KEY` in GitHub secrets
3. Uncomment the submit step in `.github/workflows/build.yml`

---

## Firebase

### Architecture

- `lib/firebase.ts` — single initialisation point. Never initialise Firebase elsewhere.
- All Firebase config is injected via environment variables at build time.
- Auth state is managed exclusively by `hooks/useAuth.ts`.
- Firestore writes go through `hooks/useQRHistory.ts` only — never directly from screens.

### Firestore Schema

```
users/{uid}/
  qrHistory/{docId}/
    content: string         # Encoded QR string
    type: "URL" | "Text" | "Contact"
    label: string           # Display name (auto-generated)
    createdAt: Timestamp
```

### Security Rules

`firestore.rules` — authenticated users can only read/write their own `qrHistory` documents. Unauthenticated access is denied globally.

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## Distribution

| Platform | Status | ID |
|---|---|---|
| Android (Play Store) | In closed testing | `com.artisanintuition.qrforge` |
| iOS (App Store) | Planned | `com.artisanintuition.qrforge` |
| Web | Live | Hosted via Expo web build |
