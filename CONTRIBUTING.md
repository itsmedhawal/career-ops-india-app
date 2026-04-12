  # Contributing to Career-Ops-India App

Thank you for your interest in contributing. This project exists to make AI-powered job search accessible to every Indian jobseeker — your contributions directly serve that mission.

---

## Before You Start

Read this in full before opening a PR. It saves everyone time.

**What we welcome:**
- Bug fixes
- India-specific data improvements (GLS signal weights, stipend benchmarks, company lists)
- Hindi language mode
- Accessibility improvements
- Performance improvements on low-end Android devices
- Documentation improvements

**What to discuss first (open an issue):**
- New features — align on direction before writing code
- Architecture changes — the single-file constraint is intentional
- Changes to GLS signal weights — these need community discussion

**What we do not accept:**
- External dependencies that require a build step
- Features that send user data to any server
- Anything that weakens the PIN encryption or privacy model
- Breaking changes to the tracker data format without migration

---

## Architecture Constraints

Career-Ops-India App is deliberately a **single `index.html` + `worker.js`** — no build tools, no npm, no bundler.

This is not an oversight. It is a design principle:
- Zero setup for users
- Zero infrastructure to maintain
- Works on GitHub Pages with no CI/CD
- Deployable by anyone, anywhere, instantly

**Every contribution must respect this constraint.**

If you need to add a library, load it from CDN. If you need to add a feature, add it inline. If the file is getting too long, that is a signal to refactor existing code, not to introduce a build system.

---

## Development Setup

No installation required.

```bash
git clone https://github.com/itsmedhawal/career-ops-india-app
cd career-ops-india-app
# Open index.html in a browser
# Or use a local server for worker.js to work correctly:
python3 -m http.server 8080
# Then open http://localhost:8080
```

> **Note:** `worker.js` requires the app to be served over HTTP/HTTPS, not opened as a `file://` URL. Use a local server for development.

---

## Making Changes

### For bug fixes
1. Open an issue describing the bug
2. Fork the repo
3. Fix on a branch named `fix/description-of-bug`
4. Test on both Chrome (desktop) and Chrome Android
5. Open a PR referencing the issue

### For data improvements (GLS signals, stipend benchmarks, company lists)
1. Open an issue with your proposed data and source
2. Community discusses the change
3. PR with clear attribution of data source

### For new features
1. Open an issue with the feature description and your reasoning
2. Wait for maintainer input before writing code
3. Branch named `feat/description-of-feature`
4. PR with screenshots on mobile

---

## Code Style

No linter, no formatter. But follow these conventions:

**JavaScript:**
- Minified-friendly — short variable names for hot paths are acceptable
- State lives in `S` (main state) and `LOCAL_AI` (worker state) and `P` (provider state)
- All user-facing content goes through `sanitize()` before being set as innerHTML
- Crypto operations only via WebCrypto — never `Math.random()` for security purposes
- All API keys go through the PIN encryption flow — never store plaintext

**CSS:**
- Design tokens in `:root` — never hardcode colors or spacing
- Mobile-first — base styles for mobile, `@media(min-width:768px)` for tablet/desktop
- Class naming: short, functional. `.bp` = button primary, `.bs` = button secondary
- Saffron (`--saffron`) is reserved for primary actions and active states only

**HTML:**
- Semantic where possible
- All interactive elements must work with one thumb on a 5-inch screen
- Images processed client-side only — never sent to our servers

---

## Testing Checklist

Before opening a PR, test:

- [ ] Chrome Android (mid-range device if possible — Redmi, Samsung A-series)
- [ ] Chrome desktop
- [ ] Safari iOS (if relevant to your change)
- [ ] Light mode and dark mode
- [ ] With API key set and without
- [ ] With PIN locked and unlocked
- [ ] Tracker export/import still works after your change

---

## Commit Messages

```
fix: correct GLS signal weight for Naukri source
feat: add stipend benchmark for Ahmedabad
docs: update ARCHITECTURE with provider orchestrator
data: update 2026 CTC bands for AI/ML Engineer archetype
```

---

## Data Contributions

India-specific data is what makes this tool genuinely useful. If you have better data, we want it.

**High-value data contributions:**
- Updated city-wise stipend medians (with source)
- Updated CTC bands by archetype and city (with source)
- Additional Indian company career page URLs for CLI scanner
- Updated GLS signal weights based on real ghosting patterns

All data contributions must include a source. "I think" is not a source. AmbitionBox, Glassdoor India, community surveys with methodology, or your own verified dataset are all acceptable.

---

## Community

- **Discussions:** [GitHub Discussions](https://github.com/itsmedhawal/career-ops-india-app/discussions)
- **Bugs:** [GitHub Issues](https://github.com/itsmedhawal/career-ops-india-app/issues)
- **Engine repo:** [career-ops-india](https://github.com/itsmedhawal/career-ops-india)

---

## Credits

All contributors will be acknowledged in the Credits section of the app and in the README. Your name, your contribution, permanently recorded.

---

*This project is MIT licensed. By contributing, you agree your contributions are made under the same license.*
