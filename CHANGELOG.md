# Changelog

All notable changes to Career-Ops-India App are documented here.

Format: `[Version] — Date — Summary`

---

## [v7.8] — 2026-04-19 — Gemini Parity Fix for All AI Features

### Fixed
- **Tracker Prep/CV buttons hidden for Gemini-only users** — `hasKey` check now includes `coi_gemini_enc` and `#gemini-key` input alongside Claude sources.
- **CV Generator (`generateCV`) Claude-only** — now provider-aware: uses Gemini API when Gemini is selected, with proper key resolution and error messages.
- **Cloud Fast Scan (`runCloudFastScan`) Claude-only** — now provider-aware: Gemini-only users can use the cloud GLS fallback when WebGPU is unavailable.
- **Startup PIN prompt skipped for Gemini-only users** — `init()` now checks both `coi_key_enc` and `coi_gemini_enc` to trigger PIN unlock on load.

---

## [v7.7] — 2026-04-19 — More Page Redesign & Credits Refresh

### Added
- **"What you can do" section** in More → About — collapsible list of 6 user-facing capabilities (Evaluate, Ghost detection, Interview Prep, CV Generator, Pipeline Tracker, Privacy/PWA). Collapsed by default, uses existing collapsible pattern.

### Changed
- **About section streamlined** — removed redundant feature pills (GLS, Archetypes, Intern, PIN) and 3 how-step cards that duplicated the new "What you can do" list. Kept one-liner + engine repo link.
- **Credits: Dhawal's card rewritten** — replaced feature list with "Innovation by Dhawal" section highlighting 3 First-in-India innovations (Ghost Likelihood Score, on-device AI job evaluation, 7 India employer archetypes) and 3 engineering innovations (single-file architecture, hybrid AI pipeline, security-first on the browser).

---

## [v7.6] — 2026-04-19 — Offline PWA, PPO Probability & Interview Prep Overhaul

### Added
- **Offline-first PWA** — added `sw.js` service worker that pre-caches the app shell (HTML, manifest, worker, fonts) on first visit. Tracker, Analytics, and Profile now work without internet. API calls still require connectivity, everything else works offline.
- **PPO Probability gauge (intern mode)** — new circular gauge card showing estimated PPO chances, displayed between the take-home calculator and stipend chart. Tries to pick up a PPO percentage from the AI evaluation text first; if the AI didn't mention one, computes a deterministic estimate based on job fit score, ghost likelihood, and company stage (GCC gets a boost, startups get a slight penalty). Clamped between 5–95% with a High / Moderate / Low label.
- **Interview prep caching** — generated interview kits are now saved in IndexedDB. Clicking "Interview Prep" a second time for the same evaluation loads instantly from cache instead of burning another API call.
- **Copy Markdown button** — the interview prep modal now has a 📋 Copy Markdown button alongside Download, so you can paste your prep kit straight into Notion, Obsidian, or a notes app.
- **Technical / Domain Questions section** — the interview prep prompt now asks the AI for 8–10 role-specific technical questions (system design, ML, coding, etc.) with "why they ask it" context and answer outlines drawn from your CV.

### Changed
- **Interview prep works with Gemini** — previously hardcoded to Claude only; now respects the active provider toggle and falls back correctly if a key isn't set.
- **CV context tripled** — interview prep now sends the first 6,000 characters of your CV (up from 2,000), giving the AI much richer material for STAR stories and technical question mapping.
- **Prep modal refactored** — extracted a `showPrepResult()` helper so both fresh generations and cached loads render through the same path.

### Fixed
- **Version meta tag out of sync** — `<meta name="version">` was still showing 7.2 while the title said v7.5; now both read v7.6.

---

## [v7.5] — 2026-04-12 — Extract from CV UX Fix

### Fixed
- **Extract from CV — stuck in PIN loop with no key** — clicking "Extract from CV" with no API key configured showed the PIN prompt; after entering a PIN the function re-ran, found no key again, and re-showed the PIN — infinite loop. Now detects that no encrypted key is stored and redirects to Profile with a clear message instead

---

## [v7.4] — 2026-04-12 — Critical JS & Extract from CV Fix

### Fixed
- **Broken script on load** — extra `}` in `processPIN` `unlock` branch caused `Unexpected token 'else'` parse error, silently killing all JS; every button in the app was dead on load
- **Extract from CV — `s()` out of scope** — `extractFromCV` called `s()` which is a local helper defined only inside `loadP()`; threw `ReferenceError` silently inside `try/catch`; no extracted fields were ever written to the form. Fixed with a local `sf()` helper; now populates all fields (name, ctc, city, workmode, notice, buyout, sector, college, cgpa, stipend)
- **Extract from CV — PIN setup path never resumed** — `processPIN` `setup-confirm` branch didn't run `S._pendingAction`; first-time users who had no PIN when clicking "Extract from CV" would set their PIN but extraction never resumed. Fixed — mirrors the `unlock` branch behaviour

---

## [v7.3] — 2026-04-12 — Extract from CV Fix

### Fixed
- **Extract from CV — PIN resume broken** — when the API key was PIN-encrypted, clicking "Extract from CV" showed the PIN unlock screen then silently returned; extraction never resumed after the user entered their PIN. Fixed via `S._pendingAction` callback: the function stores itself as a pending action before showing the PIN prompt, and `processPIN()` now runs it automatically after a successful unlock
- **Extract from CV — Claude-only hardcode** — function was hardcoded to `https://api.anthropic.com/v1/messages` regardless of the selected provider; users with only a Gemini key could not use it. Now provider-aware: prefers the active `P.provider`, falls back to whichever key (Claude or Gemini) is available
- **Gemini key not restored on unlock** — `processPIN()` unlock branch only decrypted the Claude key into the UI; Gemini key is now also restored from `coi_gemini_enc` on successful PIN entry

---

## [v7.2] — 2026-04-12 — Security & Stability Patch

### Security
- **Gemini API key moved out of URL** — key was previously passed as `?key=` query parameter (visible in browser history, DevTools, and server access logs); now sent as `x-goog-api-key` request header

### Fixed
- **Fast Scan / Deep Eval race condition** — clicking Fast Scan then Deep Eval could fire both simultaneously and race to overwrite results; Deep Eval and sticky buttons are now disabled while a Fast Scan is in progress and re-enabled via `finally` (cloud path) or worker `GLS_RESULT`/`GLS_ERROR` messages (local path)
- **`importT()` silent overwrite** — importing a JSON backup with existing tracker data now prompts for confirmation instead of overwriting silently
- **CV length cap in Deep Eval** — CV text was uncapped in Claude and Gemini eval prompts; now capped at 6,000 characters to stay within model context windows (Extract from CV was already capped at 3,000)
- **`.doc` download correctly labelled** — CV download was labelled "Download .docx" and used `downloadCVDocx()`; the file is an HTML-in-Word wrapper (`.doc`), not OOXML; button label, filename, and function renamed to `.doc` / `downloadCVDoc`

### Changed
- `window._cvText`, `window._cvCompany`, `window._prepText`, `window._prepCompany` moved from global `window` into the `S` state object — reduces global scope pollution and aligns with rest of app state

### Removed
- Dead variables `_origHandleWorkerMessage` and `_workerMsgOrig` (unused leftover references from a prior refactor)

---

## [v7.1] — 2026-04-12 — Hybrid Multimodal Patch

### Added
- **Google Gemini API support** — Gemini 2.5 Flash (default) and Gemini 2.5 Pro as cloud provider options alongside Claude
- **Provider toggle** on Evaluate tab — switch between 🟠 Claude · 🔵 Gemini Flash · 💎 Gemini Pro
- **Multimodal JD input** — attach a job screenshot (PNG/JPG) when using Gemini; image and text sent together in a single multimodal prompt
- **Dual API key storage** — both Claude and Gemini keys encrypted with the same PIN via AES-GCM
- **Free tier callout** — Gemini 2.5 Flash includes 15 evaluations/minute at no cost via Google AI Studio
- **Provider badge on results** — shows which AI evaluated the role (🟠 Claude / 🔵 Gemini)
- **Image privacy note** — "Images processed directly via Gemini API · Not stored on any server"

### Changed
- Gemini models updated to current versions: `gemini-2.5-flash` and `gemini-2.5-pro`
- Worker error handling made non-fatal — app degrades gracefully to Cloud Fast Scan if worker fails
- CSP updated to allow `generativelanguage.googleapis.com`

### Fixed
- Worker `[object Event]` error — replaced top-level `import` with lazy `dynamic import()` and CDN fallback chain
- Version bumped to v7.1 in title, meta, AI footer, Credits

---

## [v7.0] — 2026-04-12 — Sovereign Edition (Hybrid Local + Cloud)

### Added
- **WebLLM integration** — Gemma 2 2B running entirely on-device via WebGPU
- **`worker.js`** — dedicated Web Worker for model loading and inference (non-blocking UI)
- **Fast Scan** — instant local GLS pre-check, free, offline after first download
- **Sync Command Center modal** — opt-in 1.4GB model download with WiFi recommendation
- **Model selector** — Gemma 2 2B Lite (default), Standard, and Gemma 4 E2B (coming soon placeholder)
- **AI footer status bar** — 🧠 saffron when local active, cyan when cloud, amber when downloading
- **WebGPU detection** — `navigator.gpu` check on init; Fast Scan falls back to Cloud API if WebGPU unavailable
- **VRAM management** — `engine.unload()` after every scan to keep mid-range phones responsive
- **PWA "Add to Home Screen" banner** on Evaluate tab (mobile only, once, dismissible)
- **Subtle versioning** — v7.0 in `<title>`, meta tag, AI footer, and Credits

### Architecture
- Phase 1: Gemma 2 2B Lite + Claude Sonnet (live)
- Phase 2: Gemma 4 E2B one-tap upgrade when MLC community compiles it (May 2026)

---

## [v6.0] — 2026-04-11 — Full Maturity

### Added
- **Custom CV Generator** — tailored CV for each specific role, downloadable as `.doc`
- **Interview Prep Mode** — 8 STAR+R stories, CTC negotiation script, India-specific HR scenarios
- **Pipeline Analytics tab** — application funnel, ghost rate by source, archetype breakdown, follow-up insights
- **Repost Detection** — JD fingerprinting, flags previously evaluated roles
- **Evaluation History Awareness** — shows previous evaluations of same company/role before results
- **Follow-up Reminders** — amber border + chip on Tracker cards applied >14 days ago
- **Export to PDF** — `window.print()` pipeline report, no library needed
- **High-density Tracker cards** — score + GLS + grade on one line
- **Three-row Tracker filters** — Status · Notice Period · Source Quality (Verified Only)
- **Offline Cached indicator** — 💾 chip on cards with IDB report available
- **CLI handoff** — `importScanResults()` foundation for career-ops-india scan output
- **Notice Period Buyout** field in Profile — reduces notice red flag in evaluation

### Changed
- Analytics moved to dedicated tab (5-tab nav: Evaluate · Tracker · Analytics · Profile · More)
- Tracker cards redesigned for density — company + badges on single line

---

## [v5.1] — 2026-04-10 — Patch

### Fixed
- Model string corrected from `claude-sonnet-4-20250514` to `claude-sonnet-4-6`
- Error handling in Extract from CV — now shows actual API error message instead of generic fallback
- Version bumped to v5.1

---

## [v5.0] — 2026-04-10 — Command Center Visual Upgrade

### Added
- **Circular GLS gauge** — SVG-based progress ring replacing horizontal bar
- **GLS Signal Breakdown** — expandable "Why this score?" section with per-signal points
- **Take-Home Salary Calculator** — CTC → in-hand (PF + new tax regime FY25–26), Annual/Monthly toggle
- **Intern Stipend Bar Chart** — offered stipend vs city medians (10 Indian cities, 2025 data)
- **Source Quality detection** — portal detected and stored at eval time, shown in score grid
- **Verified Only filter** in Tracker — hides Naukri/Foundit sourced evaluations
- **Notice Period filters** — Any / Immediate / ≤30 Days / ≤60 Days

### Changed
- Score grid updated: Job Fit · Grade · Source · Archetype (4 cards)
- Tracker cards denser with stage pills (GCC / Startup)

---

## [v4.0] — 2026-04-09 — Security First

### Added
- **PIN-encrypted API key** — WebCrypto AES-GCM + PBKDF2 (310,000 iterations)
- **4-digit PIN modal** — numeric keypad, mobile-optimised, shoulder-surfing resistant
- **Session memory** — decrypted key lives only in RAM, cleared on tab close
- **Lock button** in header — one tap to lock and clear session
- **Security Verified indicator** — animated green pill after unlock
- **Change PIN flow** — requires old PIN first
- **XSS sanitization** — DOMParser-based, strips all scripts/event handlers before innerHTML render
- **CSP meta tag** — restricts script-src, blocks data exfiltration
- **API key obfuscation** — shows `••••` by default, eye toggle to reveal

### Changed
- `warn-box` copy strengthened — explicit financial risk warning
- Onboarding slide 3 updated to reflect PIN security story

---

## [v3.0] — 2026-04-08 — Journey First

### Added
- **3-screen onboarding** — swipeable, skip button, never shows again
- **Profile tab** (new) — API key, CV, personal details, student profile, GLS settings
- **Extract from CV** — one API call auto-fills all profile fields
- **Evaluate tab** — laser-focused: mode toggle + JD input + button only
- **Sticky Evaluate button** — fixed above bottom nav on mobile
- **Bottom sheet "More"** — About, Usage, Feedback, Credits on mobile
- **Profile icon** in header — one tap to Profile from anywhere
- **Profile nudge** on Evaluate — guides first-time users to set up profile

### Changed
- Nav reduced to 4 tabs: Evaluate · Tracker · Profile · More
- About, Usage, Feedback, Credits moved to More bottom sheet
- Evaluate tab empty state rewritten — warm, action-oriented
- Sample name changed to "Dhawal Shrivastava" in placeholders

---

## [v2.0] — 2026-04-07 — Mobile First Rebuild

### Added
- **Responsive nav** — bottom nav on mobile (4 items), top tabs on tablet/desktop
- **"More" bottom sheet** — slides up from bottom, drag handle, Usage/Feedback/Credits
- **Progressive disclosure** on About tab — feature cards collapsed on mobile
- **Saffron usage discipline** — reserved for 2-3 key moments only
- **Spacing pass** — more breathing room between sections
- **About tab** cut to 1-screen hero on mobile

### Changed
- Header — saffron gradient dot replaces broken flag emoji
- Logo — `career-ops-india` with styled accent, no emoji dependency
- Made with line — locked: "Made with Love and Innovation, driven by Intention, dedicated to the community."

---

## [v1.0] — 2026-04-06 — Initial Release

### Added
- Single HTML file PWA — no build step, no dependencies
- Full A–G evaluation via Claude Sonnet API
- Ghost Likelihood Score (GLS) — 0–100 across 9 signals
- 7 India archetypes
- Tracker with IndexedDB storage
- Dark/Light theme
- Export/Import tracker as JSON
- Feedback via GitHub Discussions
- Credits — Dhawal + Santiago lineage
