# Ghost Likelihood Score (GLS)

**Original contribution by Dhawal Shrivastava.**
Does not exist in the upstream career-ops repository.

---

## What is GLS?

The Ghost Likelihood Score is a 0–100 quantified risk signal that estimates the probability a job posting is a "ghost" — a role that is not actively hiring, has already been filled, never existed, or is a data-harvesting exercise.

Ghost postings are a significant problem in the Indian job market. Platforms like Naukri and Foundit have historically been used to collect candidate data without genuine hiring intent. The GLS gives jobseekers a concrete, transparent signal before they invest hours crafting applications.

**GLS is independent of job fit.** A role can score 4.5/5 for fit and 75/100 for ghost likelihood simultaneously — it may be a perfect match that was already filled three months ago. Users decide how to weigh both signals.

---

## Signal Architecture

GLS is computed across 9 India-calibrated signals totalling 100 points.

| # | Signal | Points | Rationale |
|---|--------|--------|-----------|
| 1 | Repost Pattern | 20 | Highest weight — repeated postings strongly indicate inability to hire or data harvesting |
| 2 | Posting Age >60 days | 15 | Indian hiring cycles are typically 30–45 days. Roles open >60 days are often abandoned |
| 3 | Apply CTA inactive/missing | 15 | If the application mechanism is broken or absent, the role is not actively recruiting |
| 4 | Source Quality | 15 | Naukri/Foundit have higher ghost rates than company ATS or LinkedIn. Weighted by platform. |
| 5 | Boilerplate ratio >70% | 10 | JDs that are >70% generic template language were likely copy-pasted, not written for a real role |
| 6 | Impossible requirements | 10 | "5 years of experience in a framework released 2 years ago" — signals JD was not reviewed |
| 7 | Layoff/hiring freeze news | 8 | Company in public news for layoffs or freeze while posting roles — strong inconsistency signal |
| 8 | Unnamed client / consultancy | 4 | "Our client" or "leading MNC" — third-party roles have higher ghost rates and data harvesting risk |
| 9 | Missing specifics | 3 | No team size, tech stack, or location — minimal effort JD suggesting low hiring intent |

**Total: 100 points**

---

## Score Ranges

| Range | Label | Emoji | Meaning |
|-------|-------|-------|---------|
| 0–25 | Low | 🟢 | Likely a real, active opening. Apply with confidence. |
| 26–50 | Moderate | 🟡 | Some signals present. Verify role is active before investing heavily. |
| 51–75 | High | 🟠 | Multiple red flags. Consider verifying directly or deprioritising. |
| 76–100 | Very High | 🔴 | Strong evidence of ghost posting. Proceed with significant caution. |

---

## Confidence Levels

The AI also outputs a confidence level based on available data quality:

| Level | Meaning |
|-------|---------|
| High Confidence | Sufficient signals present for a reliable assessment |
| Proceed with Caution | Some signals present but limited data |
| Suspicious | Multiple clear red flags, high certainty |
| Very High Risk | Overwhelming evidence of ghost posting |

---

## Source Quality Scoring (Signal 4)

Different platforms have different historical ghost rates in the Indian market:

| Source | Points | Rationale |
|--------|--------|-----------|
| Naukri | 15 | Highest ghost rate — open platform with minimal verification |
| Foundit (formerly Monster) | 15 | Similar to Naukri — high volume, low verification |
| LinkedIn | 5 | Moderate — professional network, some accountability |
| iimjobs / Cutshort | 3 | Curated platforms — lower ghost rate |
| Company ATS / career site | 0 | Direct source — lowest ghost rate |
| Unknown | 8 | Cannot assess source quality |

---

## Repost Detection (Signal 1)

In the browser app, JD fingerprinting tracks previously evaluated roles:

1. Each JD is hashed (normalised first 200 characters)
2. Hash stored in `localStorage.coi_fps` with date, company, score
3. On next evaluation — hash compared to stored fingerprints
4. Match triggers: +20 pts to GLS + repost warning card above results

This is purely local — no shared database. Each user's fingerprint history is their own.

In the CLI tool, repost detection uses `scan-history.tsv` to track portal postings over time.

---

## How GLS Differs from Qualitative Assessment

Before GLS, the original career-ops had a Block G section that asked the AI to describe ghost signals qualitatively. This is useful but:

- Not comparable across evaluations
- Not filterable in a tracker
- Requires reading the full report to assess

GLS solves this by:

- Producing a single comparable number (0–100)
- Enabling filter-by-ghost-risk in the Tracker
- Surfacing immediately before the full report
- Working as a pre-check via local AI (Fast Scan) before spending API credits

---

## GLS in the Evaluation Pipeline

```
JD pasted
    │
    ▼
Fast Scan (local or cloud)
→ GLS pre-check only (instant)
→ "Is this worth evaluating?"
    │
    ├── GLS > threshold → Warning shown
    │                     User decides whether to proceed
    │
    └── GLS ≤ threshold → Proceed to Deep Eval
                          Full A–G including Block G (detailed signal breakdown)
```

---

## Limitations

**GLS is computed from JD text only.** It cannot:
- Verify whether a company is actually hiring
- Access real-time company news (layoffs, freeze)
- Check if an ATS link is live
- Detect reposting across different portals (only within a user's history)

**GLS is probabilistic, not deterministic.** A score of 80 does not mean the role is definitely a ghost — it means 80% of the observable signals suggest elevated risk. Some highly bureaucratic enterprises post slowly and have legitimate roles with high GLS scores.

**Always use GLS alongside job fit score.** A role scoring 4.8/5 with GLS 60 may still be worth applying to — it just warrants a quick verification step first.

---

## Future Signal Candidates

Community-proposed signals under consideration:

| Signal | Proposed Weight | Status |
|--------|----------------|--------|
| Notice period mismatch | 5 pts | Under discussion |
| Salary range absent | 4 pts | Under discussion |
| Cross-platform repost detection | 20 pts | Requires shared signal DB — V8+ |
| Company hiring velocity (LinkedIn) | 10 pts | Requires external data |

---

## IP Note

GLS was invented and implemented by Dhawal Shrivastava as part of the career-ops-india fork. It has since been implemented in both the CLI tool (career-ops-india) and this browser app (Career-Ops-India App).

The concept, signal architecture, and India-specific calibration are original contributions that do not exist in the upstream career-ops repository by Santiago Fernández de Valderrama.

Timestamp established via GitHub commit history on the career-ops-india repository.
