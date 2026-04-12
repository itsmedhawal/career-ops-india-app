# Roadmap

This document reflects current thinking on where Career-Ops-India App is heading. It is not a commitment — community feedback and real-world usage shape priorities.

---

## Where We Are

**v7.1 (Current)** — Hybrid Multimodal Command Center

- ⚡ Fast Scan — local Gemma 2 2B GLS via WebGPU, offline
- 🔍 Deep Eval — Claude Sonnet or Gemini 2.5 Flash/Pro
- 📷 Multimodal — evaluate jobs from screenshots (Gemini)
- 🔐 PIN-encrypted dual API keys (Claude + Gemini)
- 📊 Full A–G evaluation, custom CV, interview prep, analytics

The first app in India to offer a hybrid Ghost Buster — local + cloud, mobile-first, privacy-first.

---

## V8 — Polish + Share

**Theme:** Make existing features feel smoother and more shareable.

**Planned:**

- **Streaming Deep Eval** — response streams token-by-token. Feels instant instead of 30s wait. Biggest perceived performance improvement available.
- **WhatsApp share card** — one tap to share evaluation summary as text. "I evaluated [Company] — Score 4.2/5, GLS 38🟡. Worth applying?" — very Indian UX pattern.
- **Notes on Tracker cards** — free-text notes field per application. "Called HR, they said role is on hold."
- **UX polish pass** — fix small friction points from real user feedback

**Considering:**

- Evaluation comparison (side-by-side two roles)
- Tracker status history (when did it move from Applied to Interview?)
- Better empty states with guided onboarding

---

## V9 — Sovereign Edition (100% Local AI)

**Theme:** Full offline evaluation without any API key.

**Depends on:** Gemma 4 E2B landing in WebLLM registry (expected May 2026)

**Planned:**

- **Gemma 4 E2B upgrade** — one-tap model upgrade in settings. Better reasoning than Gemma 2 2B. Still fits on mid-range phones.
- **Local Deep Eval** — attempt full A–G evaluation using local model. Quality will be lower than Claude/Gemini but zero cost and fully offline.
- **Tiered output** — local eval produces "Basic Report," cloud eval produces "Full Report." User chooses based on situation.
- **Offline-first experience** — entire app works without any internet connection after first setup

**Why this matters:**
Many Indian jobseekers in Tier-2/3 cities have unreliable connectivity. A fully offline GLS + basic evaluation covers the most critical use case — "is this job real and worth my time?" — without any network dependency.

---

## V10 — Community Intelligence

**Theme:** Shared signals without shared data.

**Planned:**

- **Community GLS Signal 1** — shared repost detection. When a JD fingerprint is seen by N users, it contributes to a community ghost signal. Privacy-preserving (hashes only, no JD content).
- **City-based stipend benchmarks** — community-contributed data for Intern Mode. More accurate than static 2025 data.
- **Archetype salary bands** — community-contributed CTC ranges by archetype, city, and company stage.

**Architecture note:** This requires a lightweight backend for the first time. Options under consideration:
- GitHub Gist as a shared signal database (zero infrastructure)
- Cloudflare Worker as a privacy-preserving aggregator
- Fully federated (no central server, users share directly)

---

## Santiago's Roadmap — Alignment

Santiago's career-ops roadmap includes:
- Free local model support (Ollama + LM Studio)
- Claude Desktop integration
- Desktop app (Tauri-based)
- India, MENA, Southeast Asia localization

Career-Ops-India App is already living in his "Later" milestones. Our goal is to serve as the **reference implementation for the India market** — both as a browser app and as a community resource for signal data.

When the time is right, we will contribute the India module (GLS, archetypes, CTC framework) back to the main project.

---

## Community Wishlist

Features requested by the community. Not committed, but tracked:

| Feature | Votes | Notes |
|---------|-------|-------|
| Hindi UI mode | — | High-impact for Tier-2/3 users. Needs contributor. |
| PDF CV upload | — | Extract JD from uploaded PDF |
| Batch evaluation | — | Evaluate multiple JDs from CLI scan output |
| Salary negotiation simulator | — | India-specific CTC negotiation practice |
| GCC company sub-classification | — | Greenfield vs established vs transformation |
| Notice period buyout signal | — | GLS Signal 10 candidate |

Vote or add to the wishlist via [GitHub Discussions](https://github.com/itsmedhawal/career-ops-india-app/discussions).

---

## What We Will Not Build

To keep the app focused:

- **Job discovery / scraping** — this is what the CLI tool (career-ops-india) is for. The app is for evaluation, not discovery.
- **User accounts / cloud sync** — this would break the privacy model. Tracker lives on your device.
- **Resume hosting** — your CV stays on your device.
- **Recruiter-facing features** — this tool is for jobseekers, not recruiters.
- **Build tooling / npm** — the single-file constraint is permanent.

---

## How to Influence the Roadmap

1. **Use the app** and report what is missing or broken
2. **Open a Discussion** with your use case and the feature you need
3. **Contribute data** — stipend benchmarks, company lists, GLS signal improvements
4. **Contribute code** — see [CONTRIBUTING.md](../CONTRIBUTING.md)

The roadmap reflects what real Indian jobseekers need. Your feedback shapes it.
