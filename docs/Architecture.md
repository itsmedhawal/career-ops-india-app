# Architecture

Career-Ops-India App is a single-file PWA with a hybrid local + cloud AI architecture. This document explains how it works technically.

---

## Overview

```
┌─────────────────────────────────────────────────┐
│                 Browser (PWA)                   │
│                                                 │
│  ┌─────────────┐      ┌─────────────────────┐  │
│  │  index.html │      │     worker.js        │  │
│  │  (main UI)  │◄────►│  (WebLLM + Gemma)   │  │
│  └──────┬──────┘      └─────────────────────┘  │
│         │                      │                │
│         ▼                      ▼                │
│  ┌─────────────┐      ┌─────────────────────┐  │
│  │ localStorage│      │     IndexedDB        │  │
│  │  profile    │      │   full reports       │  │
│  │  encrypted  │      │   (offline cache)    │  │
│  │  API keys   │      └─────────────────────┘  │
│  │  tracker    │                                │
│  └─────────────┘                                │
└──────────┬──────────────────────┬───────────────┘
           │                      │
           ▼                      ▼
  ┌─────────────────┐   ┌──────────────────────┐
  │  Anthropic API  │   │    Google Gemini API  │
  │  Claude Sonnet  │   │  2.5 Flash / 2.5 Pro  │
  └─────────────────┘   └──────────────────────┘
```

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entire application — UI, state, crypto, API calls, rendering |
| `worker.js` | Web Worker for WebLLM engine — model loading, GLS inference |
| `manifest.json` | PWA manifest — app name, icons, shortcuts |

No build step. No bundler. No npm. Everything runs directly in the browser.

---

## State Management

Three state objects in `index.html`:

**`S` — Main application state**
```javascript
S = {
  tab,          // current active tab
  mode,         // 'professional' | 'intern'
  eval,         // current evaluation result
  filter,       // tracker filter state
  evals,        // all saved evaluations (synced to localStorage)
  sh, of,       // skill file content (system prompt + evaluation template)
  sessionKey,   // PIN string (session only, cleared on tab close)
  idbCache,     // Set of evaluation IDs with cached reports in IDB
  jdFingerprints // JD hash → previous evaluation (for repost detection)
}
```

**`LOCAL_AI` — Local AI state**
```javascript
LOCAL_AI = {
  worker,           // Web Worker reference
  state,            // 'uninitialized' | 'downloading' | 'ready' | 'processing' | 'error'
  selectedModelKey, // persisted to localStorage
  webGPUSupported,  // boolean, checked on init
  modelRegistry     // model metadata
}
```

**`P` — Provider state**
```javascript
P = {
  provider,   // 'claude' | 'gemini-flash' | 'gemini-pro'
  imageData,  // base64 image (null if no image attached)
  imageMime   // image MIME type
}
```

---

## Evaluation Pipeline

### Fast Scan (Local AI)
```
User taps Fast Scan
    │
    ▼
WebGPU supported?
    ├── No  → runCloudFastScan() → Claude/Gemini API (GLS-only prompt)
    └── Yes → Worker loaded?
                  ├── No  → postMessage(LOAD_MODEL) → Wait for READY
                  └── Yes → postMessage(RUN_GLS, jd)
                                    │
                                    ▼
                           Gemma 2 2B inference
                           (in Web Worker, non-blocking)
                                    │
                                    ▼
                           GLS JSON result
                                    │
                                    ▼
                           engine.unload() (VRAM free)
                                    │
                                    ▼
                           handleLocalGLSResult()
                           → render GLS card
                           → prompt: proceed to Deep Eval?
```

### Deep Eval (Cloud AI)
```
User taps Deep Eval
    │
    ▼
runCloudEval(jd, cv, profile)
    │
    ▼
Provider check (P.provider)
    ├── 'claude'        → runClaudeEval()  → Anthropic API
    ├── 'gemini-flash'  → runGeminiEval()  → Google API (gemini-2.5-flash)
    └── 'gemini-pro'    → runGeminiEval()  → Google API (gemini-2.5-pro)
                                │
                                ▼
                        parseEv(text, jd, profile)
                        → extract score, grade, GLS, archetype,
                          signals, source, ctcRaw
                                │
                                ▼
                        renderRes(ev)
                        → score grid
                        → circular GLS gauge
                        → take-home calculator (professional)
                        → stipend chart (intern)
                        → collapsible A-G report blocks
```

---

## Security Architecture

### API Key Encryption Flow

```
User enters PIN
    │
    ▼
PBKDF2(PIN + random_salt, 310000 iterations, SHA-256)
    │
    ▼
AES-GCM-256 key derived
    │
    ├── Encrypt API key → ciphertext
    │       │
    │       ▼
    │   localStorage: {salt}|{iv}|{ciphertext}
    │
    └── PIN hash (SHA-256 + salt) → localStorage for verification
                                    (cannot be reversed to PIN)

On unlock:
    User enters PIN → verify hash → derive key → decrypt API key → session memory only
    Tab close → session memory cleared → key gone until next PIN entry
```

### XSS Sanitization

All content rendered as `innerHTML` passes through:
```javascript
function sanitize(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove: script, style, iframe, object, embed, form, link, meta
  // Remove: all event handlers (onclick, onload, etc.)
  // Remove: javascript: href and src values
  return doc.body.innerHTML;
}
```

### Markdown Renderer

`mdown()` converts AI response markdown to HTML safely:
1. Escape all HTML entities first (`&`, `<`, `>`)
2. Apply markdown transformations (bold, italic, headers, tables, lists)
3. Pass result through `sanitize()` before rendering

---

## Local AI Architecture

### Worker Communication Protocol

```
Main thread → Worker:
  GET_STATUS      → returns current state
  GET_MODELS      → returns model registry
  SET_MODEL       → switch model key
  LOAD_MODEL      → start download + init
  RUN_GLS {jd}   → run inference
  UNLOAD          → free VRAM

Worker → Main thread:
  STATUS          → current state
  MODELS          → registry
  MODEL_SET       → confirmation
  DOWNLOADING     → model load started
  PROGRESS        → {text, progress 0-1}
  READY           → model loaded
  PROCESSING      → inference started
  GLS_RESULT      → {gls, risk_level, confidence, signals_fired, top_3_red_flags, recommendation}
  GLS_ERROR       → {message}
  UNLOADED        → engine freed
  ERROR           → {message, fatal?, fallbackKey?}
```

### Model Loading (Lazy)
WebLLM is not loaded at app startup. It is only imported when the user taps "Download Offline Intelligence." This keeps the initial app load fast for all users.

CDN fallback chain:
1. `https://esm.run/@mlc-ai/web-llm`
2. `https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/+esm`

If both fail, Fast Scan routes to Cloud API automatically.

---

## Storage

| Store | What | When cleared |
|-------|------|-------------|
| `localStorage.coi_p` | Profile (name, CTC, city, etc.) | Never (user clears) |
| `localStorage.coi_cv` | CV text | Never (user clears) |
| `localStorage.coi_key_enc` | Encrypted Claude API key | User clears or re-encrypts |
| `localStorage.coi_gemini_enc` | Encrypted Gemini API key | User clears or re-encrypts |
| `localStorage.coi_pin_hash` | PIN verification hash | User clears |
| `localStorage.coi_pin_salt` | PIN hash salt | User clears |
| `localStorage.coi_e` | Tracker evaluations (metadata) | User deletes |
| `localStorage.coi_fps` | JD fingerprints (repost detection) | User clears |
| `localStorage.coi_local_model` | Selected model key | User changes |
| `localStorage.coi_local_ready` | Model download status | User clears |
| `IndexedDB coi/r` | Full report markdown | User deletes evaluation |
| Session memory | Decrypted API key | Tab close |

---

## PWA Configuration

- `manifest.json` — standalone display, portrait-primary, saffron theme
- Shortcuts: Evaluate and Tracker for long-press home screen icon
- Icons: SVG data URIs (no separate image files)
- Offline: Tracker and Analytics work offline. Evaluate requires network for Cloud mode. Fast Scan works offline after model download.

---

## Versioning Convention

| Increment | When |
|-----------|------|
| Major (v8.0) | Significant new capability or architecture change |
| Minor (v7.1) | New feature or meaningful enhancement |
| Patch (v7.1.1) | Bug fix, data update, copy change |

Version appears in: `<title>`, `<meta name="version">`, AI footer bar, Credits section.
