# Changelog

All notable changes to Career-Ops-India App are documented here.

---

## [v8.1] — 2026-04-19 — First Impressions

### What's New
- **One-screen welcome** — see what the app does at a glance: Ghost Detection, Salary Calculator, Tailored CV, and Privacy. No swiping through slides.
- **Try before you set up** — tap "See a Sample Report first" on the welcome screen and view a full evaluation instantly. No PIN, no API key needed.
- **Add your key right where you need it** — the Evaluate screen now has a key input field with direct signup links. No hunting through menus.

### What's Gone
- The old 3-slide intro carousel

---

## [v8.0] — 2026-04-19 — Streaming, Sharing & Visual Refresh

### What's New
- **Live AI responses** — evaluation results now stream in real-time. You see text appear as the AI writes instead of staring at a spinner.
- **Share on WhatsApp** — one tap to share your score, grade, and ghost likelihood with friends or mentors.
- **Sample report** — new users can view a full example evaluation before adding an API key.
- **Notes on tracked jobs** — add your own notes to any saved evaluation (reminders, follow-ups, gut feelings).

### Improved
- **Fresh look** — gradient backgrounds, frosted glass effects, smooth animations, and a fully redesigned light theme.

### Security
- Stronger protection against code injection in all user-facing areas
- Double-tap protection on Evaluate — can't accidentally fire two evaluations at once
- All AI features now work with Gemini-only setups (previously some required Claude)
- PIN unlock now triggers correctly whether you use Claude, Gemini, or both

---

## [v7.9] — 2026-04-19 — Security Hardening

### Security
- Blocked additional dangerous content patterns that could be injected via tampered data
- PDF exports now properly escape all user content
- Double-tap on Evaluate no longer fires duplicate API calls

---

## [v7.8] — 2026-04-19 — Gemini Parity

### Fixed
- CV Generator and Interview Prep now work if you only have a Gemini key (previously required Claude)
- Fast Scan cloud fallback works for Gemini-only users
- PIN unlock now triggers on app launch for Gemini-only setups

---

## [v7.7] — 2026-04-19 — About Page Refresh

### Improved
- **"What you can do"** — the About section now clearly lists every capability in one expandable section
- Streamlined the About page — removed clutter, kept what matters
- Updated credits with innovation highlights

---

## [v7.6] — 2026-04-19 — Offline, PPO & Interview Prep

### What's New
- **Works offline** — Tracker, Analytics, and Profile load without internet. Only AI evaluations need connectivity.
- **PPO Probability (interns)** — see your estimated chances of getting a Pre-Placement Offer, based on your evaluation
- **Interview prep caching** — prep kits are saved locally. Open the same one again and it loads instantly, no extra API call.
- **Copy to clipboard** — paste your interview prep straight into Notion, Obsidian, or any notes app
- **Technical questions** — interview prep now includes 8–10 role-specific technical questions with answer outlines

### Improved
- Interview prep now works with Gemini (not just Claude)
- AI gets 3x more of your CV for better prep quality

---

## [v7.5] — 2026-04-12 — CV Extract Fix

### Fixed
- "Extract from CV" no longer gets stuck in an endless PIN loop when no API key is configured

---

## [v7.4] — 2026-04-12 — Critical Fix

### Fixed
- Fixed a startup error that made all buttons unresponsive
- "Extract from CV" now correctly fills all profile fields
- First-time PIN setup during CV extraction now completes properly

---

## [v7.3] — 2026-04-12 — CV Extract & Gemini Fix

### Fixed
- "Extract from CV" now resumes after entering your PIN (previously got stuck)
- "Extract from CV" now works with Gemini (previously required Claude)
- Gemini key is now restored on PIN unlock (previously only Claude key was)

---

## [v7.2] — 2026-04-12 — Security & Stability

### Security
- Gemini API key is no longer visible in your browser's address bar or history

### Fixed
- Fast Scan and Deep Eval can no longer run simultaneously and overwrite each other's results
- Importing a tracker backup now asks for confirmation before replacing your data
- CV text is properly capped so evaluations don't hit AI token limits
- Downloaded CV files are now correctly labelled as `.doc`

---

## [v7.1] — 2026-04-12 — Gemini Support

### What's New
- **Google Gemini** — choose between Claude, Gemini Flash (free), or Gemini Pro for evaluations
- **Screenshot input** — attach a job screenshot when using Gemini (reads images directly)
- **Free evaluations** — Gemini Flash offers 15 evaluations/minute at zero cost
- **Provider badge** — results show which AI did the evaluation

---

## [v7.0] — 2026-04-12 — On-Device AI

### What's New
- **Fast Scan** — instant ghost check that runs entirely on your phone. Free, offline, no API key needed after first download.
- **On-device AI** — Gemma 2 runs locally via WebGPU. Your job description never leaves your browser.
- **Sync Command Center** — opt-in 1.4 GB model download (WiFi recommended)
- **AI status bar** — see whether you're using local or cloud AI at a glance
- **Install prompt** — "Add to Home Screen" banner for the full app experience

---

## [v6.0] — 2026-04-11 — Full Feature Set

### What's New
- **Custom CV Generator** — get a tailored CV for each role, downloadable as a Word file
- **Interview Prep** — 8 STAR stories, salary negotiation script, and India-specific HR scenarios
- **Analytics dashboard** — application funnel, ghost rate by source, archetype breakdown, follow-up insights
- **Repost detection** — get warned if you've already evaluated the same JD
- **Follow-up reminders** — cards older than 14 days get a visual nudge
- **Export to PDF** — print your pipeline report with one click
- **Source quality filter** — hide jobs from unreliable portals
- **Notice period filter** — filter by Immediate / 30 / 60 days

---

## [v5.1] — 2026-04-10 — Patch

### Fixed
- Corrected the AI model version
- "Extract from CV" now shows the actual error message if something goes wrong

---

## [v5.0] — 2026-04-10 — Visual Upgrade

### What's New
- **Circular GLS gauge** — a visual ring showing ghost likelihood at a glance
- **"Why this score?"** — expand to see exactly which signals raised the ghost score and by how many points
- **Take-home calculator** — enter CTC, see your monthly in-hand (PF + new tax regime FY25-26)
- **Stipend comparison (interns)** — your offered stipend vs city medians across 10 Indian cities
- **Source quality** — the job portal is now detected and shown on results

---

## [v4.0] — 2026-04-09 — Security First

### What's New
- **PIN protection** — your API key is encrypted with a 4-digit PIN. Keys never touch any server.
- **Lock button** — one tap to lock the app and clear your session
- **Session-only decryption** — your key exists in memory only while you're using the app
- **Change PIN** — update your PIN anytime (requires the old one first)

### Security
- All AI-generated content is sanitized before display
- Content Security Policy blocks unauthorized scripts

---

## [v3.0] — 2026-04-08 — Journey First

### What's New
- **Welcome tour** — quick intro to get you started
- **Profile tab** — save your CV, CTC, city, notice period once. Every evaluation uses it.
- **Extract from CV** — paste your CV and AI fills in your profile automatically
- **Sticky Evaluate button** — always visible at the bottom on mobile
- **Profile icon** — quick access from the header

---

## [v2.0] — 2026-04-07 — Mobile First

### What's New
- **Bottom navigation** — thumb-friendly 4-tab bar on mobile, top tabs on desktop
- **"More" menu** — slides up from bottom with About, Usage, Feedback, Credits
- **Better spacing** — more breathing room on every screen
- **Saffron accents** — India-inspired design, used sparingly for key moments

---

## [v1.0] — 2026-04-06 — Initial Release

### What's New
- Evaluate any job with AI — full A-G report in under a minute
- Ghost Likelihood Score — is this job posting real? 0-100 across 9 signals
- 7 India employer archetypes — GCC, startup, body shop, and more
- Tracker — save and manage all your evaluations
- Dark and light themes
- Export/import your data as JSON
- No login, no server, no data collection — runs entirely in your browser
