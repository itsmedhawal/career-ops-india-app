# Career-Ops-India App

> AI-powered job evaluation for the Indian job market.
> Score any job in 60 seconds. Zero setup. Privacy-first. PIN-encrypted.

**Live app:** [itsmedhawal.github.io/career-ops-india-app](https://itsmedhawal.github.io/career-ops-india-app)

Built on [career-ops-india](https://github.com/itsmedhawal/career-ops-india), which is forked from [career-ops](https://github.com/santifer/career-ops) by Santiago Fernández de Valderrama.

---

## What it does

Paste any job description. Get a structured evaluation in under 60 seconds:

- **Job Fit Score** — 1–5 with grade (A–F)
- **Ghost Likelihood Score (GLS)** — 0–100 across 9 India-calibrated signals
- **Full A–G Report** — CV match, comp analysis, level strategy, interview plan, ATS keywords
- **Take-Home Calculator** — CTC → in-hand estimate (new tax regime FY25–26)
- **Custom CV Generator** — tailored CV for each specific role, downloadable as .doc
- **Interview Prep Kit** — STAR+R stories, CTC negotiation, India-specific scenarios
- **Pipeline Tracker** — manage all applications with status, filters, analytics
- **Intern Mode** — PPO probability, stipend benchmarks by city for students

---

## Key Features

### 👻 Ghost Likelihood Score
0–100 score across 9 signals. Know if a posting is real before spending hours applying. India-calibrated — Naukri and Foundit aware. Repost detection across your evaluation history.

### 🇮🇳 7 India Archetypes
AI/ML Engineer · LLMOps/GenAI · Data Scientist · AI PM · Solutions Architect · AI Consultant · AI Transformation Lead

### 💰 India Comp Framework
CTC vs in-hand, variable %, bond penalties, ESOP risk. Scored in LPA. Take-home calculator with PF and new tax regime FY25–26.

### 🏢 GCC-Aware Scoring
Global Capability Center as a distinct company stage with its own scoring logic.

### 🚩 Fake Remote Detection
"Remote within Bangalore" is not remote. Flags city-restricted remote and mandatory relocation patterns.

### 🎓 Intern Mode
For students and freshers. PPO probability, brand value scoring, stipend benchmarks across 10 Indian cities, on-campus vs off-campus strategy.

### ✍️ Custom CV Generator
Select any saved evaluation → generate a tailored CV. Rewrites bullets with metrics, reorders sections to match JD priority, injects ATS keywords. Downloadable as .doc.

### 🎤 Interview Prep Mode
8 STAR+R stories mapped to the specific JD, CTC negotiation script, red flag questions, India-specific HR scenarios. Downloadable as markdown.

### 📈 Pipeline Analytics
Application funnel, average score, ghost rate by source, archetype breakdown, follow-up reminders. Computed locally — zero API cost.

### 🔐 PIN-Encrypted API Key
WebCrypto AES-GCM with PBKDF2 (310,000 iterations). Your API key is encrypted before touching storage. Decrypted key lives only in session memory — cleared when tab closes.

### 📱 Mobile-First PWA
Installable on Android and iOS. Works offline for tracker and analytics. Optimised for one-thumb use on the go.

---

## How to Use

1. Open the app — no installation needed
2. **Profile tab** → add Anthropic API key → paste CV → tap Extract from CV
3. **Evaluate tab** → paste any job description → tap Evaluate Job
4. Review Score, Grade and GLS → decide whether to apply
5. Save to **Tracker** → manage your full pipeline
6. From any tracker card → **✍️ CV** to generate a tailored CV, **🎤 Prep** for interview prep

---

## Privacy & Security

- Your CV, API key, and job data never leave your browser
- The only external call is your direct API request to Anthropic
- API key encrypted with a 4-digit PIN using AES-GCM before storage
- Decrypted key lives only in session memory — cleared when tab closes
- No analytics, no cookies, no third-party scripts

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Runtime | Single HTML file — no build step, no dependencies |
| AI | Anthropic Claude API (direct browser call) |
| Storage | localStorage + IndexedDB |
| Security | WebCrypto AES-GCM + PBKDF2 (310,000 iterations) |
| CV Export | HTML → .doc (opens in Word and Google Docs) |
| PDF Export | window.print() with print stylesheet |
| PWA | manifest.json — installable, works offline |
| Fonts | Space Grotesk · DM Sans · JetBrains Mono |

---

## Lineage

career-ops (Santiago Fernández de Valderrama)

└── career-ops-india (Dhawal Shrivastava)

└── Career-Ops-India App (Dhawal Shrivastava) ← you are here

---

## Credits

**Dhawal Shrivastava** — Creator of Career-Ops-India App and the career-ops-india fork.
Original contributions: Ghost Likelihood Score (GLS), Intern Mode, India archetypes, CTC/LPA framework, GCC stage, Fake Remote detection, Custom CV Generator, Interview Prep Mode.
[GitHub](https://github.com/itsmedhawal/career-ops-india) · [LinkedIn](https://www.linkedin.com/in/dhawalshrivastava)

**Santiago Fernández de Valderrama** — Creator of [career-ops](https://github.com/santifer/career-ops), the engine career-ops-india is forked from. Architecture, pipeline, PDF generation, batch processing, and HITL philosophy are his work.
[santifer.io](https://santifer.io)

---

## Contribute

Open source under MIT:
- 🌐 Hindi language modes
- 🏢 More Indian company and GLS signal data
- 📊 Better compensation band data
- 💰 Updated city-wise stipend benchmarks

[Submit feedback via GitHub Discussions](https://github.com/itsmedhawal/career-ops-india-app/discussions)

---

*Made with Love and Innovation, driven by Intention, dedicated to the community.*
*— [Dhawal Shrivastava](https://www.linkedin.com/in/dhawalshrivastava)*
