# Security Policy

Career-Ops-India App is built with a security-first architecture. This document describes how user data is protected, how to report vulnerabilities, and what our commitments are to users.

---

## Our Security Model

### What we protect
- Your Anthropic API key
- Your Google Gemini API key
- Your CV and personal details
- Your job evaluation history

### How we protect it

**API Key Encryption**

Both API keys are encrypted using **WebCrypto AES-GCM** with a key derived from your PIN via **PBKDF2** (310,000 iterations, SHA-256). This means:

- Your keys are never stored in plaintext — not in localStorage, not anywhere
- Even if something reads your browser storage, the keys are an unreadable blob without your PIN
- The decrypted key exists only in session memory (RAM) and is cleared when you close the tab
- We have no access to your keys — we have no server

**PIN Design**

- Your PIN is never stored — only a SHA-256 hash (with random salt) is stored for verification
- The hash cannot be reversed to recover your PIN
- After unlocking, the PIN-derived key is used to decrypt your API keys into session memory only

**Local-First Architecture**

- CV and profile data stored in `localStorage` on your device
- Evaluation reports stored in `IndexedDB` on your device
- No accounts, no registration, no cloud sync
- The only network calls are: (a) direct to Anthropic API, (b) direct to Google Gemini API, (c) fetching skill files from our public GitHub repo

**XSS Protection**

All content from external sources (job descriptions, AI responses) passes through a `DOMParser`-based sanitizer before being rendered as HTML. Scripts, event handlers, and dangerous attributes are stripped.

**Content Security Policy**

A `<meta http-equiv="Content-Security-Policy">` header restricts:
- Script sources to known CDNs only
- API connections to Anthropic and Google endpoints only
- No inline data exfiltration

---

## What We Do Not Do

- We do not collect any data
- We do not have analytics or tracking
- We do not store your CV, API keys, or evaluations on any server
- We do not share data with third parties
- We do not have a server at all — this is a static PWA

---

## Supported Versions

| Version | Security Support |
|---------|-----------------|
| v7.x (current) | ✅ Active |
| v6.x | ⚠️ Critical fixes only |
| v5.x and below | ❌ No longer supported |

Always use the latest version.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

**Do** report via email: `ace.dhawal@gmail.com`

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (optional but appreciated)

**Response commitment:**
- Acknowledgement within 48 hours
- Assessment within 7 days
- Fix timeline communicated within 14 days

Responsible disclosure is appreciated. If you report a valid vulnerability, you will be credited in the release notes (unless you prefer anonymity).

---

## Known Limitations

**localStorage is accessible to browser extensions**

Any browser extension with broad permissions (`tabs`, `storage`) can read localStorage. While the API keys are encrypted, users should be cautious about which extensions they install on a browser they use for Career-Ops-India App.

**Mitigation:** Use the Lock button when not actively using the app. The decrypted key in session memory is cleared when the tab closes.

**PIN is a 4-digit code**

A 4-digit PIN has 10,000 possible combinations. It is not as strong as a long passphrase. The PIN is designed to protect against opportunistic access (someone picking up your unlocked phone), not against a determined attacker with unlimited attempts.

**Image data (multimodal mode)**

When using Gemini multimodal mode, your job screenshot is sent directly to the Google Gemini API. The image is not stored on our servers (we have no servers), but it is subject to Google's API terms and privacy policy.

**Worker.js imports from CDN**

The Web Worker loads WebLLM from `esm.run` or `cdn.jsdelivr.net`. These are public CDNs. While we verify the import works, we cannot sign or verify the CDN-served code. Users who want maximum security should review the WebLLM source at [github.com/mlc-ai/web-llm](https://github.com/mlc-ai/web-llm).

---

## Security Credits

This security architecture was designed by **Dhawal Shrivastava**, Senior Security Assurance Engineering Lead at Microsoft MSRC.

Upstream security reports for the career-ops engine: contact Santiago at `hi@santifer.io`.
