# RAC Identity Verification PoC

Device-native identity verification prototype aligned with RAC's Decision
Engine (DE). Built on Next.js 14.2.35 with the RAC design system.

## Flow

The DE decides **first**, then the approval level determines which documents
are collected. SSN is entered manually in **every** path — it is never read
from an ID or wallet.

```
identity            device Face ID (WebAuthn) · Apple/Google Wallet · or scan ID (OCR + face match)
   ↓
details             SSN + phone (email optional)          ← DE hard dependencies
   ↓
DE decision         simulated Decision Engine → Level 0-3
   ↓
level-scoped docs   L0/L1: residence · L2: + income · L3: + references   (Plaid)
   ↓
success             approval level, required-vs-skipped steps, split cost
```

## Approval levels

The DE returns a level; the level sets the required post-approval documents.

| Level | Allows | Required documents |
| --- | --- | --- |
| **L0** | Any single item — phone included | ID + Residence |
| **L1** | Any single item (no phone) | ID + Residence |
| **L2** | Higher-value items — income verified | ID + Residence + **Income** |
| **L3** | Premium / multi-item | ID + Residence + Income + **References** |
| **L4** | (same doc set as L3) | ID + Residence + Income + References |
| **L5** | (same doc set as L3) | ID + Residence + Income + References |

Every path also requires **identity + SSN/contact** before the DE runs. The
demo assigns L0-L3 with a weighted random split (20% L0, 30% L1, 30% L2,
20% L3).

## Tech stack

- **Next.js 14.2.35** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS** with RAC design tokens (`#0057A0` blue, `#FFD200` yellow, `#E31837` red)
- **WebAuthn** — real device Face ID / platform-authenticator ceremony
- **Tesseract.js** — on-device ID OCR (SSN is never parsed from the ID)
- **face-api.js** — ID-photo ↔ selfie match (loaded from CDN at runtime)
- **Plaid** (`react-plaid-link`) — residence + income; real sandbox with keys, simulated without

## Routes (18)

**Pages**

| Route | Purpose |
| --- | --- |
| `/` | Login + application channel (online / in-store RACPad) |
| `/verify` | Device capability detection → routes to a method |
| `/verify/apple-wallet` | Apple Wallet + Face ID (WebAuthn) |
| `/verify/google-wallet` | Google Wallet + biometric |
| `/verify/document` | Scan ID (Tesseract OCR + face-api match) |
| `/verify/details` | SSN + phone + email (DE hard dependencies) |
| `/verify/decision` | Animated DE decision → approval level |
| `/verify/residence` | Residence via Plaid |
| `/verify/income` | Income via Plaid (L2+) |
| `/verify/references` | Personal references (L3) |
| `/verify/success` | Level table, required-vs-skipped, split cost |
| `/application` | Post-verification hand-off |
| `/pilot-design` | Shadow-mode pilot brief (stakeholders) |
| `/dashboard` | Funnel analytics segmented by level |

**API**

| Route | Purpose |
| --- | --- |
| `POST /api/decision` | Simulated Decision Engine (weighted level) |
| `POST /api/plaid/link-token` | Plaid Link token (real or sandbox) |
| `POST /api/plaid/exchange` | Exchange for residence / income |
| `POST /api/webauthn/challenge` | WebAuthn challenge |
| `POST /api/webauthn/verify` | WebAuthn attestation check |

## Shadow-mode pilot

`/pilot-design` is a static stakeholder page explaining the rollout: OpenKYC
runs in **shadow mode** beside the current stack, both verify every applicant,
and nothing customer-facing changes until OpenKYC matches or beats the current
pass/fail baseline — with the accuracy threshold defined by the DE team. It
includes the parallel-run diagram and placeholder metrics (agreement rate,
false reject/accept, avg confidence — all "measured during pilot").

## Running the demo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (Vercel-ready)
```

**Login:** any valid email + any password. Pick **Online** or **In-store
(RACPad)** — device signals are shown for online applications only.

### iPhone Safari (primary demo target)

- Open the deployed URL in **Safari on iOS**.
- **Face ID** fires on the Apple Wallet path via the real WebAuthn ceremony
  (requires HTTPS — works on the Vercel domain, not plain `http://localhost`).
- The **Scan ID** path uses the camera: "Take photo of ID" and "Take selfie"
  open the rear/front camera (`capture` attribute), then run OCR + face match
  on-device.
- On desktop browsers without a platform authenticator, the Face ID step
  degrades gracefully to a simulated pass so the flow still completes.

## 🔐 Environment Variables (Vercel)

Set these in **Vercel → Project → Settings → Environment Variables** (and in a
local `.env.local` for development). **Do not commit real keys** — none are
hardcoded in this repo.

| Variable | Example | Purpose |
| --- | --- | --- |
| `PLAID_CLIENT_ID` | *(your Plaid client ID)* | Plaid API client identifier (server-side) |
| `PLAID_SECRET` | *(your Plaid secret)* | Plaid API secret (server-side) |
| `PLAID_ENV` | `sandbox` | Plaid environment: `sandbox`, `development`, or `production` |
| `NEXT_PUBLIC_WEBAUTHN_RP_ID` | `rac-poc-completetar1.vercel.app` | WebAuthn Relying Party ID — set to your Vercel domain (hostname only, no `https://` or path) |

### Fallback / simulated mode

The app is designed to run **without** these variables so the demo works out of
the box:

- **Plaid** — if `PLAID_CLIENT_ID` / `PLAID_SECRET` are absent, the residence
  and income steps use a **simulated** bank connection (labelled "Sandbox
  connection" in the UI). When both are set, `/api/plaid/link-token` creates a
  real Plaid Link token against `PLAID_ENV`.
- **WebAuthn** — if `NEXT_PUBLIC_WEBAUTHN_RP_ID` is unset, the browser defaults
  the Relying Party ID to the current origin. Set it explicitly to your Vercel
  domain in production so the Face ID ceremony is bound to the right host.

> Plaid credentials and the WebAuthn RP ID are the only external configuration.
> OCR (Tesseract.js) and face matching (face-api.js) run fully client-side and
> need no keys.

## Project structure

```
app/
  page.tsx                 login + channel
  verify/                  identity methods + details, decision, post-DE steps, success
  pilot-design/            shadow-mode brief
  dashboard/               level-segmented funnel
  api/                     decision, plaid/*, webauthn/*
components/                Button, Input, RACHeader, RACLogo, Stepper, PlaidConnect, PostStepLayout
lib/                       flow (state), levels, cost, webauthn, ocr, faceMatch, analytics
```

---

**Status:** Decision Engine-aligned build. Simulated DE + Plaid + WebAuthn have
real integration seams; add credentials to go live.
