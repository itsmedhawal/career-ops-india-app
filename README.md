# Career-Ops-India App

> AI-powered job evaluation for the Indian job market. Score any job in 60 seconds. Zero setup. Privacy-first.

Built on [career-ops-india](https://github.com/itsmedhawal/career-ops-india), which is forked from [career-ops](https://github.com/santifer/career-ops) by Santiago Fernández de Valderrama.

---

## What it does

Paste any job description. Get a structured evaluation in under 60 seconds -- job fit score, grade, ghost likelihood, compensation analysis, CV match, and a full A–G report. Everything runs in your browser.

---

## Key Features

- **Ghost Likelihood Score (GLS)** -- 0–100 score across 9 India-calibrated signals. Know if a posting is real before applying.
- **7 India Archetypes** -- AI/ML Engineer, LLMOps/GenAI, Data Scientist, AI PM, Solutions Architect, Consultant, Transformation Lead
- **India Comp Framework** -- CTC vs in-hand, variable %, bond penalties, ESOP risk. Scored in LPA.
- **GCC-Aware** -- Global Capability Center as a distinct company stage with its own scoring logic
- **Fake Remote Detection** -- flags city-restricted remote and mandatory relocation patterns
- **Intern Mode** -- PPO probability, brand value, stipend benchmarks for students and freshers
- **PIN-Encrypted API Key** -- WebCrypto AES-GCM. Your key is encrypted before touching storage. Never plain text.
- **Privacy-First** -- no server, no accounts, no tracking. Everything stays on your device.

---

## How to use

1. Open the app in any browser -- no installation needed
2. Go to **Profile** → add your Anthropic API key → paste your CV → tap Extract from CV
3. Go to **Evaluate** → paste any job description → tap Evaluate Job
4. Read your Score, Grade and GLS → decide whether to apply
5. Save to **Tracker** to manage your full pipeline

---

## Tech

| Layer | Stack |
|-------|-------|
| Runtime | Single HTML file -- no build step, no dependencies |
| AI | Anthropic Claude API (direct browser call) |
| Storage | localStorage + IndexedDB |
| Security | WebCrypto AES-GCM + PBKDF2 (310,000 iterations) |
| PWA | manifest.json -- installable, works offline |
| Fonts | Space Grotesk · DM Sans · JetBrains Mono |

---

## Privacy & Security

- Your CV, API key and job data never leave your browser
- The only external call is your direct API request to Anthropic
- API key is encrypted with a 4-digit PIN using AES-GCM before storage
- Decrypted key lives only in session memory -- cleared when tab closes
- No analytics, no cookies, no third-party scripts

---

## Lineage
career-ops (Santiago Fernández de Valderrama)

└── career-ops-india (Dhawal Shrivastava)

└── Career-Ops-India App (Dhawal Shrivastava) **← you are here**

---

## Credits

**Dhawal Shrivastava** -- Creator of Career-Ops-India App and the career-ops-india fork. Original contributions: Ghost Likelihood Score (GLS), Intern Mode, India archetypes, CTC/LPA framework, GCC stage, Fake Remote detection.

**Santiago Fernández de Valderrama** -- Creator of [career-ops](https://github.com/santifer/career-ops), the engine career-ops-india is forked from. Architecture, pipeline, PDF generation, batch processing, and HITL philosophy are his work.

---

## Contribute

Open source under MIT. Contributions welcome:

- 🌐 Hindi language modes
- 🏢 More Indian company data
- 📊 Better GLS signal weights
- 💰 Updated compensation bands

---

*Made with Love and Innovation, driven by Intention, dedicated to the community.*
*-- [Dhawal Shrivastava](https://www.linkedin.com/in/dhawalshrivastava)*
