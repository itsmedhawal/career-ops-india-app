# Cloud Intelligence Providers

Career-Ops-India App supports three cloud AI options for Deep Eval. This document helps you choose the right one.

---

## Quick Decision Guide

| I want... | Use |
|-----------|-----|
| Best evaluation quality | Claude Sonnet 4.6 |
| Zero cost to get started | Gemini 2.5 Flash (free tier) |
| Evaluate from a screenshot | Gemini 2.5 Flash or Pro |
| Deep reasoning, complex roles | Gemini 2.5 Pro |
| Already have an Anthropic key | Claude Sonnet 4.6 |

---

## Provider Comparison

| | Claude Sonnet 4.6 | Gemini 2.5 Flash | Gemini 2.5 Pro |
|--|------------------|-----------------|----------------|
| **Cost (input)** | $3/1M tokens | $0.30/1M tokens | $1.00/1M tokens |
| **Cost (output)** | $15/1M tokens | $2.50/1M tokens | $10.00/1M tokens |
| **Free tier** | No | 15 RPM, no cost | No |
| **Multimodal (images)** | ✅ (in app: Gemini only) | ✅ | ✅ |
| **Context window** | 200K tokens | 1M tokens | 1M tokens |
| **Evaluation quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Speed** | Fast | Fastest | Fast |
| **Where to get key** | console.anthropic.com | aistudio.google.com | aistudio.google.com |

*Pricing as of April 2026. Check provider websites for current rates.*

---

## Claude Sonnet 4.6

**Best for:** Users who want the highest quality evaluations and already have an Anthropic account.

Claude Sonnet 4.6 is the original and default provider for Career-Ops-India. The evaluation framework (A–G blocks, GLS signals, India archetypes) was designed and optimised for Claude's instruction-following capabilities.

**Strengths:**
- Highest quality CV match analysis in Block B
- Most nuanced compensation analysis in Block D
- Best STAR+R story generation in Block F
- Strongest interview prep output

**Getting your key:**
1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create an API key
3. Add credits to your account (starts at $5)
4. Paste in Profile → Claude API Key → Encrypt & Save

**Typical cost per evaluation:** ~$0.05–$0.10 depending on CV and JD length.

---

## Gemini 2.5 Flash

**Best for:** Users who want zero-cost evaluations to start, or who want to evaluate jobs from screenshots.

Gemini 2.5 Flash has a free tier of 15 requests per minute via Google AI Studio — no billing required to get started. For most individual jobseekers, this is enough for extensive daily use at no cost.

**Strengths:**
- **Free tier** — most users will never hit the paid threshold
- **Multimodal** — send a job screenshot alongside or instead of pasted text
- Fastest response times
- Excellent at structured JSON output (GLS scoring)

**Limitations compared to Claude:**
- Slightly shorter evaluation depth in some blocks
- CV match nuance can be less specific

**Getting your key:**
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Create an API key (free, no billing required)
4. Paste in Profile → Gemini API Key → Encrypt & Save

**Typical cost per evaluation:** $0.00 on free tier. ~$0.01–$0.03 paid.

---

## Gemini 2.5 Pro

**Best for:** Power users who want Gemini's deeper reasoning for complex or senior roles.

Gemini 2.5 Pro is Google's most capable model. For senior IC or leadership roles where the evaluation requires nuanced reasoning about strategic fit, this is the right choice.

**Strengths:**
- Deeper reasoning than Flash
- Better at complex multi-requirement roles
- Strong at identifying subtle red flags in senior JDs
- Same multimodal capabilities as Flash

**When to use over Flash:**
- Senior IC roles (Staff, Principal, Director level)
- Roles with complex comp structures
- When Flash evaluation feels shallow

**Typical cost per evaluation:** ~$0.03–$0.08.

---

## Multimodal Mode (Gemini Only)

When Gemini is selected, a 📎 paperclip button appears below the JD textarea.

**How it works:**
1. Paste text JD (optional) AND/OR attach a screenshot
2. Both are sent to Gemini in a single multimodal prompt
3. Gemini reads the image and text simultaneously for a more complete evaluation

**Use cases:**
- Job posted as an image (common on WhatsApp forwards)
- Screenshot of Naukri/LinkedIn app on your phone
- "About the Company" section from a separate page
- Partial JD text + screenshot of requirements table

**Privacy:** Images are processed directly via the Gemini API. They are not stored on any server and are not retained by Career-Ops-India App. They are subject to Google's API terms and privacy policy.

**Supported formats:** PNG, JPG, WebP. Maximum file size: 5MB.

---

## Switching Providers

The provider toggle on the Evaluate tab lets you switch between providers for each evaluation. Your choice is persisted — if you switch to Gemini Flash, it stays selected until you change it.

You can have both Claude and Gemini keys saved simultaneously. The app uses whichever provider is currently selected.

---

## Fast Scan vs Deep Eval

| | Fast Scan | Deep Eval |
|--|-----------|-----------|
| **What it does** | GLS only (0–100) | Full A–G report |
| **How fast** | Instant (local) or ~5s (cloud) | ~30s |
| **Cost** | Free (local or Gemini free tier) | API credits |
| **Output** | Ghost likelihood + top red flags | Complete evaluation |
| **Use when** | Quick sanity check on a new role | Role passes GLS check |

The intended workflow: Fast Scan first, Deep Eval only if GLS is acceptable. This preserves API credits and saves time.

---

## Local AI (WebGPU)

Fast Scan can run entirely on your device using Gemma 2 2B via WebLLM — no API key needed at all. See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details.

**Requirements:** Chrome 121+ with WebGPU support. Most Android phones from 2022 onward qualify.

**One-time download:** ~1.6 GB. Cached permanently after first download. Evaluations are then instant, free, and fully offline.
