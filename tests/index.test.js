/**
 * Unit tests for Career-Ops-India App (index.html)
 * Tests the pure functions extracted from inline JS.
 */
const { getEnv } = require('./extract');

let env;
beforeAll(() => { env = getEnv(); });

// ────────────────────────────────────────
// 1. parseEv — PPO probability (new feature)
// ────────────────────────────────────────
describe('parseEv — PPO probability', () => {
  const baseText = `
**GLOBAL** | **4.2/5**
Grade: B
TOTAL GLS: 30/100
ARCHETYPE
AI/ML Engineer
Company Stage | GCC
Work Mode | Hybrid
Source | LinkedIn
Assessment: High Confidence
## BLOCK G - GLS
- Repost: +20 pts (seen twice)
CTC Range | 12.0
`;
  const baseJD = `Google India
Role: ML Engineer
Some JD text for at least 400 chars about machine learning, deep learning, pytorch, tensorflow, etc.`;

  test('returns ppo=null for professional mode', () => {
    const ev = env.parseEv(baseText, baseJD, { mode: 'professional', notice: '30 days' });
    expect(ev.ppo).toBeNull();
  });

  test('parses PPO from AI text when present (format: PPO Probability: 72%)', () => {
    const text = baseText + '\nPPO Probability: 72%\n';
    const ev = env.parseEv(text, baseJD, { mode: 'intern', notice: '' });
    expect(ev.ppo).toBe(72);
  });

  test('parses PPO from AI text variant (format: PPO 85)', () => {
    const text = baseText + '\nPPO 85\n';
    const ev = env.parseEv(text, baseJD, { mode: 'intern', notice: '' });
    expect(ev.ppo).toBe(85);
  });

  test('clamps parsed PPO to 0-100 range', () => {
    const text = baseText + '\nPPO: 150%\n';
    const ev = env.parseEv(text, baseJD, { mode: 'intern', notice: '' });
    expect(ev.ppo).toBe(100);
  });

  test('computes deterministic PPO for intern mode when text has no PPO', () => {
    const ev = env.parseEv(baseText, baseJD, { mode: 'intern', notice: '' });
    expect(ev.ppo).toBeGreaterThanOrEqual(5);
    expect(ev.ppo).toBeLessThanOrEqual(95);
    expect(typeof ev.ppo).toBe('number');
  });

  test('high score + GCC → high PPO', () => {
    const highText = baseText.replace('4.2/5', '4.7/5');
    const ev = env.parseEv(highText, baseJD, { mode: 'intern', notice: '' });
    // 4.7 ≥ 4.5 → base 75, GLS 30 → no bonus, GCC → +8 = 83
    expect(ev.ppo).toBeGreaterThanOrEqual(70);
  });

  test('low score + high GLS → low PPO', () => {
    const lowText = baseText.replace('4.2/5', '2.5/5').replace('30/100', '60/100');
    const ev = env.parseEv(lowText, baseJD, { mode: 'intern', notice: '' });
    // 2.5 < 3.5 → base 35, GLS 60 > 50 → -15, GCC → +8 = 28
    expect(ev.ppo).toBeLessThan(45);
  });

  test('startup stage → slight PPO penalty', () => {
    const startupText = baseText.replace('Company Stage | GCC', 'Company Stage | Early Startup');
    const ev1 = env.parseEv(baseText, baseJD, { mode: 'intern', notice: '' });
    const ev2 = env.parseEv(startupText, baseJD, { mode: 'intern', notice: '' });
    expect(ev2.ppo).toBeLessThan(ev1.ppo);
  });

  test('PPO is clamped between 5 and 95', () => {
    // Even extreme inputs stay within bounds
    const extreme = baseText.replace('4.2/5', '1.0/5').replace('30/100', '90/100');
    const ev = env.parseEv(extreme, baseJD, { mode: 'intern', notice: '' });
    expect(ev.ppo).toBeGreaterThanOrEqual(5);
    expect(ev.ppo).toBeLessThanOrEqual(95);
  });
});

// ────────────────────────────────────────
// 2. parseEv — core field parsing
// ────────────────────────────────────────
describe('parseEv — core fields', () => {
  const text = `
**GLOBAL** | **3.8/5**
Grade: C
TOTAL GLS: 45/100
ARCHETYPE
Data Scientist
Company Stage | Growth Startup
Work Mode | Remote
Source | Naukri
Assessment: Proceed with Caution
## BLOCK G - GLS
- Repost: +20 pts (seen before)
- Age: +15 pts (60+ days)
CTC Range | 18.5
`;
  const jd = `Flipkart
Role: Data Scientist
Responsibilities include building ML models...`;

  test('parses score correctly', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.score).toBeCloseTo(3.8, 1);
  });

  test('parses grade', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.grade).toBe('C');
  });

  test('parses GLS', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.gls).toBe(45);
  });

  test('parses archetype', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.archetype).toContain('Data Scientist');
  });

  test('parses company stage', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.stage).toBe('Growth Startup');
  });

  test('parses work mode', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.workMode).toBe('Remote');
  });

  test('parses source', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.source).toBe('Naukri');
  });

  test('parses CTC', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.ctcRaw).toBeCloseTo(18.5, 1);
  });

  test('parses GLS signals', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '60 days' });
    expect(ev.signals.length).toBeGreaterThanOrEqual(2);
    expect(ev.signals[0]).toHaveProperty('label');
    expect(ev.signals[0]).toHaveProperty('pts');
  });

  test('carries mode and notice from profile', () => {
    const ev = env.parseEv(text, jd, { mode: 'intern', notice: '30 days' });
    expect(ev.mode).toBe('intern');
    expect(ev.notice).toBe('30 days');
  });

  test('generates a UUID id', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '' });
    expect(ev.id).toMatch(/^[0-9a-f]{8}-/);
  });

  test('truncates JD to 400 chars', () => {
    const longJd = 'A'.repeat(1000);
    const ev = env.parseEv(text, longJd, { mode: 'professional', notice: '' });
    expect(ev.jd.length).toBe(400);
  });

  test('includes ppo field in result object', () => {
    const ev = env.parseEv(text, jd, { mode: 'professional', notice: '' });
    expect(ev).toHaveProperty('ppo');
  });
});

// ────────────────────────────────────────
// 3. calcInHand — Take-Home calculator
// ────────────────────────────────────────
describe('calcInHand', () => {
  test('returns expected structure', () => {
    const r = env.calcInHand(10);
    expect(r).toHaveProperty('ctcAnnual');
    expect(r).toHaveProperty('annualInHand');
    expect(r).toHaveProperty('monthlyInHand');
    expect(r).toHaveProperty('pfEmp');
    expect(r).toHaveProperty('tax');
  });

  test('CTC annual is input × 100000', () => {
    expect(env.calcInHand(15).ctcAnnual).toBe(1500000);
    expect(env.calcInHand(25).ctcAnnual).toBe(2500000);
  });

  test('monthly in-hand is annual / 12', () => {
    const r = env.calcInHand(12);
    expect(r.monthlyInHand).toBeCloseTo(r.annualInHand / 12, 2);
  });

  test('PF employee capped at ₹21,600', () => {
    // For high CTC, PF = min(basic*0.12, 21600)
    const r = env.calcInHand(50);
    expect(r.pfEmp).toBeLessThanOrEqual(21600);
  });

  test('in-hand is less than CTC (tax + PF deducted)', () => {
    const r = env.calcInHand(20);
    expect(r.annualInHand).toBeLessThan(r.ctcAnnual);
  });

  test('low CTC → minimal tax', () => {
    const r = env.calcInHand(4);
    // 4 LPA → basic 1.8L, taxable should be low
    expect(r.tax).toBeLessThan(15000);
  });

  test('high CTC → 30% slab reached', () => {
    const r50 = env.calcInHand(50);
    const r10 = env.calcInHand(10);
    expect(r50.tax).toBeGreaterThan(r10.tax * 3);
  });
});

// ────────────────────────────────────────
// 4. fingerprintJD — JD repost detection
// ────────────────────────────────────────
describe('fingerprintJD', () => {
  test('returns a string', () => {
    expect(typeof env.fingerprintJD('some JD text')).toBe('string');
  });

  test('same text → same fingerprint', () => {
    const a = env.fingerprintJD('ML Engineer at Google India');
    const b = env.fingerprintJD('ML Engineer at Google India');
    expect(a).toBe(b);
  });

  test('different text → different fingerprint', () => {
    const a = env.fingerprintJD('ML Engineer at Google India');
    const b = env.fingerprintJD('Frontend Developer at Amazon');
    expect(a).not.toBe(b);
  });

  test('normalizes whitespace', () => {
    const a = env.fingerprintJD('ML  Engineer   at Google');
    const b = env.fingerprintJD('ML Engineer at Google');
    expect(a).toBe(b);
  });

  test('case-insensitive', () => {
    const a = env.fingerprintJD('ML Engineer AT Google');
    const b = env.fingerprintJD('ml engineer at google');
    expect(a).toBe(b);
  });
});

// ────────────────────────────────────────
// 5. bytesToHex / hexToBytes round-trip
// ────────────────────────────────────────
describe('bytesToHex / hexToBytes', () => {
  test('round-trip preserves data', () => {
    const original = new Uint8Array([0, 1, 127, 128, 255]);
    const hex = env.bytesToHex(original);
    const back = env.hexToBytes(hex);
    expect(Array.from(back)).toEqual(Array.from(original));
  });

  test('bytesToHex produces lowercase hex', () => {
    const hex = env.bytesToHex(new Uint8Array([171, 205]));
    expect(hex).toBe('abcd');
  });

  test('hexToBytes handles even-length strings', () => {
    const bytes = env.hexToBytes('ff00');
    expect(bytes[0]).toBe(255);
    expect(bytes[1]).toBe(0);
  });
});

// ────────────────────────────────────────
// 6. glsGaugeSVG
// ────────────────────────────────────────
describe('glsGaugeSVG', () => {
  test('returns SVG string', () => {
    const svg = env.glsGaugeSVG(45, 'red');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('includes the GLS value in the SVG', () => {
    const svg = env.glsGaugeSVG(72, 'green');
    expect(svg).toContain('>72<');
  });

  test('handles null GLS gracefully', () => {
    const svg = env.glsGaugeSVG(null, 'gray');
    expect(svg).toContain('--');
  });

  test('includes the color in stroke', () => {
    const svg = env.glsGaugeSVG(50, 'var(--red)');
    expect(svg).toContain('stroke="var(--red)"');
  });
});

// ────────────────────────────────────────
// 7. needsAttention
// ────────────────────────────────────────
describe('needsAttention', () => {
  test('returns false for non-Applied status', () => {
    expect(env.needsAttention({ status: 'Evaluated', date: '2020-01-01' })).toBe(false);
    expect(env.needsAttention({ status: 'Rejected', date: '2020-01-01' })).toBe(false);
  });

  test('returns true for Applied > 14 days ago', () => {
    const old = new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0];
    expect(env.needsAttention({ status: 'Applied', date: old })).toBe(true);
  });

  test('returns false for Applied < 14 days ago', () => {
    const recent = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
    expect(env.needsAttention({ status: 'Applied', date: recent })).toBe(false);
  });
});

// ────────────────────────────────────────
// 8. pBlocks — text block parser
// ────────────────────────────────────────
describe('pBlocks', () => {
  test('splits evaluation text into named blocks', () => {
    const text = `## BLOCK A - ROLE SUMMARY
Some summary here.
## BLOCK B - CV MATCH
Match details.
## BLOCK C - LEVEL
Level info.`;
    const blocks = env.pBlocks(text);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(blocks[0].t).toContain('Role Summary');
    expect(blocks[0].c).toContain('Some summary here');
  });

  test('falls back to full text if no blocks found', () => {
    const blocks = env.pBlocks('Just plain text with no blocks');
    expect(blocks.length).toBe(1);
    expect(blocks[0].t).toContain('Full Evaluation');
  });
});

// ────────────────────────────────────────
// 9. STIPEND_BENCHMARKS constant
// ────────────────────────────────────────
describe('STIPEND_BENCHMARKS', () => {
  test('has at least 8 cities', () => {
    expect(Object.keys(env.STIPEND_BENCHMARKS).length).toBeGreaterThanOrEqual(8);
  });

  test('Bangalore is the highest benchmark', () => {
    const max = Math.max(...Object.values(env.STIPEND_BENCHMARKS));
    expect(env.STIPEND_BENCHMARKS['Bangalore']).toBe(max);
  });

  test('all values are positive integers', () => {
    Object.values(env.STIPEND_BENCHMARKS).forEach(v => {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
    });
  });
});

// ────────────────────────────────────────
// 10. GEMINI_MODELS constant
// ────────────────────────────────────────
describe('GEMINI_MODELS', () => {
  test('maps gemini-flash to gemini-2.5-flash', () => {
    expect(env.GEMINI_MODELS['gemini-flash']).toBe('gemini-2.5-flash');
  });

  test('maps gemini-pro to gemini-2.5-pro', () => {
    expect(env.GEMINI_MODELS['gemini-pro']).toBe('gemini-2.5-pro');
  });
});

// ────────────────────────────────────────
// 11. Service Worker (sw.js) — structural tests
// ────────────────────────────────────────
describe('sw.js — service worker', () => {
  const swCode = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'sw.js'), 'utf8'
  );

  test('defines CACHE_NAME', () => {
    expect(swCode).toMatch(/const CACHE_NAME\s*=/);
  });

  test('defines SHELL_ASSETS array with index.html', () => {
    expect(swCode).toMatch(/SHELL_ASSETS\s*=\s*\[/);
    expect(swCode).toContain('./index.html');
  });

  test('registers install event listener', () => {
    expect(swCode).toContain("addEventListener('install'");
  });

  test('registers activate event listener', () => {
    expect(swCode).toContain("addEventListener('activate'");
  });

  test('registers fetch event listener', () => {
    expect(swCode).toContain("addEventListener('fetch'");
  });

  test('bypasses API domains (Anthropic, Google, GitHub, HuggingFace)', () => {
    expect(swCode).toContain('api.anthropic.com');
    expect(swCode).toContain('generativelanguage.googleapis.com');
    expect(swCode).toContain('raw.githubusercontent.com');
    expect(swCode).toContain('huggingface.co');
  });

  test('calls skipWaiting in install', () => {
    expect(swCode).toContain('skipWaiting()');
  });

  test('calls clients.claim in activate', () => {
    expect(swCode).toContain('clients.claim()');
  });

  test('cleans old caches in activate', () => {
    expect(swCode).toContain('caches.keys()');
    expect(swCode).toContain('caches.delete');
  });
});

// ────────────────────────────────────────
// 12. index.html — structural checks for new features
// ────────────────────────────────────────
describe('index.html — structural integration', () => {
  const html = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'index.html'), 'utf8'
  );

  test('has ppo-wrap div in eval results', () => {
    expect(html).toContain('id="ppo-wrap"');
  });

  test('ppo-wrap is between takehome-wrap and stipend-wrap', () => {
    const takeHomeIdx = html.indexOf('id="takehome-wrap"');
    const ppoIdx = html.indexOf('id="ppo-wrap"');
    const stipendIdx = html.indexOf('id="stipend-wrap"');
    expect(ppoIdx).toBeGreaterThan(takeHomeIdx);
    expect(ppoIdx).toBeLessThan(stipendIdx);
  });

  test('registers service worker in init', () => {
    expect(html).toContain("serviceWorker.register('./sw.js')");
  });

  test('prepInterview checks IDB cache', () => {
    expect(html).toContain("gRpt('prep-'+ev.id)");
  });

  test('prepInterview caches result to IDB', () => {
    expect(html).toContain("sRpt('prep-'+ev.id");
  });

  test('CV context uses 6000 chars (not 2000)', () => {
    expect(html).toContain('cv.substring(0,6000)');
    expect(html).not.toContain('cv.substring(0,2000)');
  });

  test('interview prep prompt includes Technical/Domain section', () => {
    expect(html).toContain('Technical / Domain Questions');
  });

  test('has copyPrep function', () => {
    expect(html).toContain('function copyPrep(');
  });

  test('has showPrepResult function', () => {
    expect(html).toContain('function showPrepResult(');
  });

  test('copy button is in prep modal output', () => {
    expect(html).toContain('Copy Markdown');
    expect(html).toContain('copyPrep(this)');
  });

  test('prepInterview supports Gemini provider', () => {
    expect(html).toContain('getGeminiKey()');
    expect(html).toContain('generativelanguage.googleapis.com');
  });

  test('PPO gauge label shows percentage not /100', () => {
    expect(html).toContain(".replace('/100','%')");
  });
});
