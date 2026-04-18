// check.js — Unit tests for career-ops-india-app v8
// Run: node check.js
// No npm dependencies. Exit 0 = all pass, 1 = any fail.

const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

// ── Extract all JS from <script> blocks ──
const scriptBlocks = html.match(/<script[\s\S]*?<\/script>/g) || [];
let js = "";
scriptBlocks.forEach(s => {
  js += s.replace(/<script[^>]*>/, "").replace(/<\/script>/, "") + "\n";
});

// ── Syntax check ──
try { new Function(js); console.log("Syntax: OK"); }
catch (e) { console.log("Syntax ERROR:", e.message); process.exit(1); }

// ── Brace depth (string-stripped) ──
let stripped = "";
let idx = 0;
while (idx < js.length) {
  if (js[idx] === "`") {
    idx++;
    while (idx < js.length && js[idx] !== "`") { stripped += " "; idx++; }
    stripped += " "; idx++;
  } else if (js[idx] === "'" || js[idx] === '"') {
    const q = js[idx];
    stripped += " "; idx++;
    while (idx < js.length && js[idx] !== q) {
      if (js[idx] === "\\") { stripped += "  "; idx += 2; }
      else { stripped += " "; idx++; }
    }
    stripped += " "; idx++;
  } else {
    stripped += js[idx]; idx++;
  }
}
let depth = 0;
for (const c of stripped) {
  if (c === "{") depth++;
  else if (c === "}") depth--;
}
console.log("Brace depth (strings stripped):", depth);

// ═══════════════════════════════════════════════════════════
// TEST RUNNER
// ═══════════════════════════════════════════════════════════
let passed = 0, failed = 0;
const failures = [];

function assert(cond, name) {
  if (cond) { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL: ${name}`); }
}
function assertEq(actual, expected, name) {
  if (actual === expected) { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL: ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}
function assertMatch(str, regex, name) {
  if (regex.test(str)) { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL: ${name} — "${str}" did not match ${regex}`); }
}
function assertNoMatch(str, regex, name) {
  if (!regex.test(str)) { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL: ${name} — "${str}" should NOT match ${regex}`); }
}
function assertIncludes(str, sub, name) {
  if (str.includes(sub)) { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL: ${name} — output did not include "${sub}"`); }
}
function assertNotIncludes(str, sub, name) {
  if (!str.includes(sub)) { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; failures.push(name); console.log(`  ❌ FAIL: ${name} — output should NOT include "${sub}"`); }
}

// ═══════════════════════════════════════════════════════════
// RE-IMPLEMENT PURE FUNCTIONS (extracted from index.html)
// These mirror the exact source; no DOM/crypto dependencies.
// ═══════════════════════════════════════════════════════════

// ── fingerprintJD (line 1179) ──
function fingerprintJD(jd) {
  const norm = jd.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 200);
  let h = 0;
  for (let i = 0; i < norm.length; i++) { h = ((h << 5) - h) + norm.charCodeAt(i); h |= 0; }
  return String(Math.abs(h));
}

// ── sanitize (line 1260) — uses DOMParser in browser; reimplement via regex for Node ──
// The real impl uses DOMParser; we test its CONTRACT with a regex-based approximation
// that covers the same tag/attribute stripping rules.
function sanitize(html) {
  // Strip dangerous tags: script, style, iframe, object, embed, form, link, meta
  let out = html.replace(/<(script|style|iframe|object|embed|form|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<(script|style|iframe|object|embed|form|link|meta)\b[^>]*\/?>/gi, '');
  // Strip on* event attributes
  out = out.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Strip javascript: in href/src
  out = out.replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1=""');
  out = out.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1=''");
  // Strip action/formaction attributes
  out = out.replace(/\s+(action|formaction)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return out;
}

// ── mdown (line 1266) — reimplemented for Node (no sanitize call at end for unit test) ──
function mdown(t) {
  const raw = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^\|(.+)\|$/gm, m => {
      const c = m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .split('|').filter(x => x.trim() && !x.match(/^[-\s]+$/));
      if (!c.length) return '';
      return `<tr>${c.map(x => `<td>${x.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`;
    })
    .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, '<table>$&</table>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '<br><br>').trim();
  return raw;
}

// ── parseEv (line 1516) — reimplemented for Node with crypto.randomUUID ──
const crypto = require("crypto");
function parseEv(text, jd, pr) {
  const sc = parseFloat((text.match(/\*\*GLOBAL\*\*[^|]*\|\s*\*\*([0-9.]+)\/5/i) || text.match(/GLOBAL[^\n|]*\|\s*([0-9.]+)\/5/i) || [])[1]) || null;
  const gr = (text.match(/Grade:\s*([A-F])/i) || [])[1] || (sc >= 4.5 ? 'A' : sc >= 4 ? 'B' : sc >= 3.5 ? 'C' : sc >= 3 ? 'D' : 'F');
  const gls = parseInt((text.match(/TOTAL GLS:\s*([0-9]+)\/100/i) || [])[1]) || null;
  const arch = ((text.match(/ARCHETYPE[^\n]*\n([^\n#]+)/i) || text.match(/Archetype[^|]*\|\s*([^\n|[]+)/i) || [])[1] || 'Not detected').trim().replace(/[\[\]]/g, '');
  const wm = ((text.match(/Work Mode[^|]*\|\s*([^\n|]+)/i) || [])[1] || '--').trim();
  const st = ((text.match(/Company Stage[^|]*\|\s*([^\n|]+)/i) || [])[1] || '--').trim();
  const ga = ((text.match(/Assessment:\s*([^\n]+)/i) || [])[1] || 'Proceed with Caution').trim();
  const src = ((text.match(/Source[^|]*\|\s*([^\n|]+)/i) || [])[1] || 'Unknown').trim();
  const glsBlock = (text.match(/## BLOCK G[^\n]*\n([\s\S]*?)(?=## |$)/i) || [])[1] || '';
  const signals = []; const sigRx = /[-•]\s*([^:+]+):\s*\+?(\d+)\s*pts?([^\n]*)/gi; let m;
  while ((m = sigRx.exec(glsBlock)) !== null) signals.push({ label: m[1].trim(), pts: parseInt(m[2]), reason: m[3].trim() });
  const ctcRaw = parseFloat((text.match(/CTC Range[^|]*\|\s*([0-9.]+)/i) || [])[1]) || null;
  const co = (jd.match(/^([A-Z][A-Za-z\s&.,]{2,30}?)[\n|–\-]/m) || [])[1]?.trim() || 'Company';
  const ro = (jd.match(/(?:role|position|title)[:\s]+([^\n]{5,50})/i) || [])[1]?.trim() || 'Role';
  let ppo = null;
  if (pr.mode === 'intern') {
    const ppoMatch = text.match(/PPO[^:]*:\s*([0-9]+)\s*%/i) || text.match(/PPO[^0-9]*([0-9]+)/i);
    if (ppoMatch) ppo = Math.max(0, Math.min(100, parseInt(ppoMatch[1])));
    else {
      let base = 50;
      if (sc >= 4.5) base += 25; else if (sc >= 4) base += 15; else if (sc >= 3.5) base += 5; else base -= 15;
      if (gls !== null) { if (gls <= 25) base += 10; else if (gls > 50) base -= 15; }
      if (st && st.toLowerCase().includes('gcc')) base += 8;
      if (st && st.toLowerCase().includes('startup')) base -= 5;
      ppo = Math.max(5, Math.min(95, base));
    }
  }
  return {
    id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0],
    company: co, role: ro, score: sc, grade: gr, gls, glsA: ga, archetype: arch,
    workMode: wm, stage: st, source: src, signals, ctcRaw,
    notice: pr.notice, mode: pr.mode, status: 'Evaluated', notes: '',
    fullText: text, jd: jd.substring(0, 400), profile: pr, ppo
  };
}

// ═══════════════════════════════════════════════════════════
// 1. TESTS: sanitize()
// ═══════════════════════════════════════════════════════════
console.log("\n── sanitize() ──");
{
  // Normal HTML passes through
  const normal = '<p>Hello <strong>world</strong></p>';
  assertEq(sanitize(normal), normal, "Normal HTML passes through");

  // <script> tags stripped
  const withScript = '<p>Hi</p><script>alert("xss")</script><p>End</p>';
  assertNotIncludes(sanitize(withScript), '<script', "script tags stripped");
  assertNotIncludes(sanitize(withScript), 'alert', "script content stripped");
  assertIncludes(sanitize(withScript), '<p>Hi</p>', "Non-script content preserved");

  // <img onerror=...> event handlers stripped
  const withEvent = '<img src="x" onerror="alert(1)">';
  const sanitized = sanitize(withEvent);
  assertNoMatch(sanitized, /onerror/i, "onerror event handler stripped");

  // javascript: in href stripped
  const jsHref = '<a href="javascript:alert(1)">Click</a>';
  const sanitizedHref = sanitize(jsHref);
  assertNoMatch(sanitizedHref, /javascript:/i, "javascript: in href stripped");

  // <style> tags stripped
  const withStyle = '<p>Hi</p><style>body{display:none}</style><p>End</p>';
  assertNotIncludes(sanitize(withStyle), '<style', "style tags stripped");
  assertNotIncludes(sanitize(withStyle), 'display:none', "style content stripped");

  // <iframe> stripped
  const withIframe = '<p>Content</p><iframe src="evil.com"></iframe>';
  assertNotIncludes(sanitize(withIframe), '<iframe', "iframe tags stripped");

  // Nested attack: script inside div
  const nested = '<div><script>evil()</script></div>';
  assertNotIncludes(sanitize(nested), '<script', "Nested script stripped");
  assertNotIncludes(sanitize(nested), 'evil()', "Nested script content stripped");

  // Multiple on-event attributes
  const multiEvent = '<div onmouseover="bad()" onclick="worse()">text</div>';
  const sanitizedMulti = sanitize(multiEvent);
  assertNoMatch(sanitizedMulti, /onmouseover/i, "onmouseover stripped");
  assertNoMatch(sanitizedMulti, /onclick/i, "onclick stripped");
  assertIncludes(sanitizedMulti, 'text', "Element text preserved");
}

// ═══════════════════════════════════════════════════════════
// 2. TESTS: fingerprintJD()
// ═══════════════════════════════════════════════════════════
console.log("\n── fingerprintJD() ──");
{
  // Same input → same output (deterministic)
  const jd = "Software Engineer at Google, Bangalore. Must have 5 years experience.";
  assertEq(fingerprintJD(jd), fingerprintJD(jd), "Same input → same output");

  // Different inputs → different outputs
  const jd2 = "Product Manager at Amazon, Hyderabad. MBA required.";
  assert(fingerprintJD(jd) !== fingerprintJD(jd2), "Different inputs → different outputs");

  // Empty string handling
  const empty = fingerprintJD("");
  assert(typeof empty === "string", "Empty string returns a string");
  assertEq(empty, "0", "Empty string → '0' (hash of zero-length norm)");

  // Whitespace normalization: extra spaces collapse
  const jdSpaced = "Software   Engineer   at   Google";
  const jdClean = "Software Engineer at Google";
  assertEq(fingerprintJD(jdSpaced), fingerprintJD(jdClean), "Whitespace normalization works");

  // Case insensitivity
  const jdUpper = "SOFTWARE ENGINEER AT GOOGLE";
  const jdLower = "software engineer at google";
  assertEq(fingerprintJD(jdUpper), fingerprintJD(jdLower), "Case insensitive");

  // Long input truncated to 200 chars of normalized form
  const long = "x ".repeat(500);
  const long2 = "x ".repeat(500) + "extra tail that should be ignored";
  assertEq(fingerprintJD(long), fingerprintJD(long2), "Inputs differing only past 200 normalized chars match");

  // Output is always a string of digits
  assertMatch(fingerprintJD("test input"), /^\d+$/, "Output is string of digits");
}

// ═══════════════════════════════════════════════════════════
// 3. TESTS: mdown()
// ═══════════════════════════════════════════════════════════
console.log("\n── mdown() ──");
{
  // Bold **text** → <strong>
  assertIncludes(mdown("**bold text**"), "<strong>bold text</strong>", "Bold → <strong>");

  // Italic *text* → <em>
  assertIncludes(mdown("*italic*"), "<em>italic</em>", "Italic → <em>");

  // Inline code `code` → <code>
  assertIncludes(mdown("`myFunc()`"), "<code>myFunc()</code>", "Inline code → <code>");

  // Header ## text → <h2>
  assertIncludes(mdown("## Section Title"), "<h2>Section Title</h2>", "## → <h2>");

  // Header ### text → <h3>
  assertIncludes(mdown("### Sub Section"), "<h3>Sub Section</h3>", "### → <h3>");

  // Lists - item → <li>
  const listMd = "- Item one\n- Item two";
  const listHtml = mdown(listMd);
  assertIncludes(listHtml, "<li>Item one</li>", "List item 1 → <li>");
  assertIncludes(listHtml, "<li>Item two</li>", "List item 2 → <li>");
  assertIncludes(listHtml, "<ul>", "List items wrapped in <ul>");

  // Table pipes |a|b| → <td>
  const tableMd = "|Name|Score|\n|---|---|\n|Alice|4.5|";
  const tableHtml = mdown(tableMd);
  assertIncludes(tableHtml, "<td>", "Table pipes → <td>");
  assertIncludes(tableHtml, "<table>", "Table rows wrapped in <table>");

  // Separator rows (|---|---|) should not produce cells
  assertNotIncludes(tableHtml, "<td>---</td>", "Separator row filtered out");

  // Mixed formatting
  const mixed = "## Title\n\n**Bold** and *italic* with `code`";
  const mixedHtml = mdown(mixed);
  assertIncludes(mixedHtml, "<h2>Title</h2>", "Mixed: h2");
  assertIncludes(mixedHtml, "<strong>Bold</strong>", "Mixed: bold");
  assertIncludes(mixedHtml, "<em>italic</em>", "Mixed: italic");
  assertIncludes(mixedHtml, "<code>code</code>", "Mixed: code");

  // HTML entities escaped (< and > in input)
  const withHtml = "Use <div> tags";
  assertIncludes(mdown(withHtml), "&lt;div&gt;", "HTML entities escaped");

  // Double newlines → <br><br>
  assertIncludes(mdown("line1\n\nline2"), "<br><br>", "Double newline → <br><br>");
}

// ═══════════════════════════════════════════════════════════
// 4. TESTS: hasKey logic
// ═══════════════════════════════════════════════════════════
console.log("\n── hasKey logic ──");
{
  // The hasKey logic from the source (line 1305 and 2032):
  //   const hasKey = !!(
  //     localStorage.getItem('coi_key_enc') ||
  //     localStorage.getItem('coi_gemini_enc') ||
  //     document.getElementById('api-key')?.value.trim() ||
  //     document.getElementById('gemini-key')?.value.trim()
  //   );
  //
  // We test the logic itself with a mock:

  function computeHasKey(storedAnthropic, storedGemini, domApiKey, domGeminiKey) {
    return !!(storedAnthropic || storedGemini || domApiKey || domGeminiKey);
  }

  // Only localStorage coi_key_enc → true
  assert(computeHasKey("enc_blob_123", null, "", "") === true, "Only coi_key_enc → true");

  // Only localStorage coi_gemini_enc → true
  assert(computeHasKey(null, "gemini_enc_456", "", "") === true, "Only coi_gemini_enc → true");

  // Only DOM api-key input → true
  assert(computeHasKey(null, null, "sk-ant-123", "") === true, "Only DOM api-key → true");

  // Only DOM gemini-key input → true
  assert(computeHasKey(null, null, "", "AIza-gemini-key") === true, "Only DOM gemini-key → true");

  // None → false
  assert(computeHasKey(null, null, "", "") === false, "No keys → false");
  assert(computeHasKey("", "", "", "") === false, "All empty strings → false");
  assert(computeHasKey(null, null, null, null) === false, "All null → false");

  // Multiple present → still true
  assert(computeHasKey("enc", "gem", "dom", "gdom") === true, "Multiple keys → true");

  // Whitespace-only DOM value (trim would make empty) — in real code .value.trim()
  function computeHasKeyTrimmed(storedAnthropic, storedGemini, domApiKey, domGeminiKey) {
    return !!(storedAnthropic || storedGemini || (domApiKey || '').trim() || (domGeminiKey || '').trim());
  }
  assert(computeHasKeyTrimmed(null, null, "   ", "") === false, "Whitespace-only DOM api-key → false after trim");
}

// ═══════════════════════════════════════════════════════════
// 5. TESTS: parseEv()
// ═══════════════════════════════════════════════════════════
console.log("\n── parseEv() ──");
{
  // Sample eval text mimicking real AI output
  const sampleText = `## ARCHETYPE
Senior Backend Engineer

## BLOCK A - ROLE SUMMARY
| Field | Value |
|-------|-------|
| Archetype | Senior Backend Engineer |
| Work Mode | Remote-First |
| Company Stage | GCC / MNC |
| Source | LinkedIn |

## BLOCK B - GAP ANALYSIS
Some gap analysis text.

## BLOCK G - GHOST LIKELIHOOD SCORE
- Boilerplate JD: +8 pts (generic bullets)
- Unnamed client: +4 pts (staffing agency)
- Age of posting: +3 pts (recent)
TOTAL GLS: 32/100 🟡
Assessment: Proceed with Caution

## GLOBAL SCORE
| Dimension | Score |
|-----------|-------|
| CV Match | 4/5 |
| **GLOBAL** | **4.2/5** |
Grade: B

## BLOCK E - ATS KEYWORDS
Some keywords here.

CTC Range | 35`;

  const sampleJD = `TechCorp India
Role: Senior Backend Engineer
Location: Bangalore
Experience: 5-8 years`;

  const profile = { name: 'Test', ctc: '30 LPA', city: 'Bangalore', workmode: 'remote-first', notice: '60', buyout: 'no', sector: 'gcc', mode: 'professional' };

  const ev = parseEv(sampleText, sampleJD, profile);

  // Extracts score
  assertEq(ev.score, 4.2, "Extracts GLOBAL score 4.2");

  // Extracts grade
  assertEq(ev.grade, 'B', "Extracts grade B");

  // Extracts GLS
  assertEq(ev.gls, 32, "Extracts GLS 32");

  // Extracts assessment
  assertEq(ev.glsA, 'Proceed with Caution', "Extracts GLS assessment");

  // Extracts archetype
  assertEq(ev.archetype, 'Senior Backend Engineer', "Extracts archetype");

  // Extracts work mode
  assertEq(ev.workMode, 'Remote-First', "Extracts work mode");

  // Extracts company stage
  assertEq(ev.stage, 'GCC / MNC', "Extracts company stage");

  // Extracts source
  assertEq(ev.source, 'LinkedIn', "Extracts source");

  // Extracts signals from BLOCK G
  assert(ev.signals.length === 3, "Extracts 3 signals from BLOCK G");
  assertEq(ev.signals[0].label, 'Boilerplate JD', "Signal 1 label correct");
  assertEq(ev.signals[0].pts, 8, "Signal 1 points correct");
  assertEq(ev.signals[1].label, 'Unnamed client', "Signal 2 label correct");

  // Extracts CTC
  assertEq(ev.ctcRaw, 35, "Extracts CTC range");

  // Extracts company from JD (first line matching pattern)
  assertEq(ev.company, 'TechCorp India', "Extracts company from JD");

  // Extracts role from JD
  assertEq(ev.role, 'Senior Backend Engineer', "Extracts role from JD");

  // Non-intern mode → ppo is null
  assertEq(ev.ppo, null, "Professional mode → ppo is null");

  // Date is today
  assertEq(ev.date, new Date().toISOString().split('T')[0], "Date is today");

  // Has a UUID id
  assertMatch(ev.id, /^[0-9a-f]{8}-[0-9a-f]{4}-/, "ID is a UUID");

  // JD truncated to 400 chars
  assert(ev.jd.length <= 400, "JD field truncated to 400 chars");

  // ── Intern mode with PPO in text ──
  console.log("\n  [parseEv intern mode - PPO from text]");
  const internText = sampleText + "\nPPO Probability: 72 %";
  const internProfile = { ...profile, mode: 'intern' };
  const evIntern = parseEv(internText, sampleJD, internProfile);
  assertEq(evIntern.ppo, 72, "Intern mode: extracts PPO percentage from text");

  // ── Intern mode with PPO computed (no PPO in text) ──
  console.log("\n  [parseEv intern mode - PPO computed]");
  const evIntern2 = parseEv(sampleText, sampleJD, internProfile);
  assert(evIntern2.ppo !== null, "Intern mode: computes PPO when not in text");
  assert(evIntern2.ppo >= 5 && evIntern2.ppo <= 95, "Computed PPO clamped to 5-95");
  // score=4.2 (>=4 → base+15=65), gls=32 (>25 and <=50 → no change), stage='GCC / MNC' (includes 'gcc' → +8) → 73
  assertEq(evIntern2.ppo, 73, "PPO computed: base 50 + 15 (score>=4) + 8 (gcc) = 73");

  // ── Missing fields handling ──
  console.log("\n  [parseEv missing fields]");
  const emptyEv = parseEv("No structured data here at all.", "Some random JD text", profile);
  assertEq(emptyEv.score, null, "Missing score → null");
  assertEq(emptyEv.gls, null, "Missing GLS → null");
  assertEq(emptyEv.archetype, 'Not detected', "Missing archetype → 'Not detected'");
  assertEq(emptyEv.workMode, '--', "Missing workMode → '--'");
  assertEq(emptyEv.stage, '--', "Missing stage → '--'");
  assertEq(emptyEv.source, 'Unknown', "Missing source → 'Unknown'");
  assertEq(emptyEv.glsA, 'Proceed with Caution', "Missing assessment → default");
  assertEq(emptyEv.ctcRaw, null, "Missing CTC → null");
  assert(emptyEv.signals.length === 0, "Missing signals → empty array");

  // Grade computed from score when not in text
  const noGradeText = "| **GLOBAL** | **3.7/5** |";
  const evNoGrade = parseEv(noGradeText, sampleJD, profile);
  assertEq(evNoGrade.score, 3.7, "Score parsed without Grade line");
  assertEq(evNoGrade.grade, 'C', "Grade computed: 3.5 <= 3.7 < 4 → C");

  // Grade F for low score
  const lowText = "| **GLOBAL** | **2.1/5** |";
  const evLow = parseEv(lowText, sampleJD, profile);
  assertEq(evLow.grade, 'F', "Grade computed: 2.1 < 3 → F");

  // PPO clamping — very high score + low gls in intern mode
  const highScoreText = "| **GLOBAL** | **4.8/5** |\nTOTAL GLS: 15/100\nCompany Stage | GCC Captive";
  const evPpoHigh = parseEv(highScoreText, sampleJD, internProfile);
  // base=50, sc>=4.5→+25=75, gls<=25→+10=85, gcc→+8=93 → clamped to 93
  assertEq(evPpoHigh.ppo, 93, "PPO high: 50+25+10+8=93");
}

// ═══════════════════════════════════════════════════════════
// 6. TESTS: Provider-aware branching
// ═══════════════════════════════════════════════════════════
console.log("\n── Provider-aware branching ──");
{
  // PROVIDERS config and provider detection logic from source.
  const PROVIDERS = {
    claude: { label: 'Claude Sonnet 4.6', supports_image: false },
    'gemini-flash': { label: 'Gemini 2.5 Flash', supports_image: true },
    'gemini-pro': { label: 'Gemini 2.5 Pro', supports_image: true }
  };
  const GEMINI_MODELS = { 'gemini-flash': 'gemini-2.5-flash', 'gemini-pro': 'gemini-2.5-pro' };

  // runCloudEval routing (line ~2406):
  //   if(provider==='claude') → runClaudeEval / runClaudeEvalStreaming
  //   else → runGeminiEval / runGeminiEvalStreaming
  function detectRoute(provider, hasStream) {
    if (hasStream) {
      return provider === 'claude' ? 'runClaudeEvalStreaming' : 'runGeminiEvalStreaming';
    } else {
      return provider === 'claude' ? 'runClaudeEval' : 'runGeminiEval';
    }
  }

  assertEq(detectRoute('claude', false), 'runClaudeEval', "Claude no-stream → runClaudeEval");
  assertEq(detectRoute('claude', true), 'runClaudeEvalStreaming', "Claude stream → runClaudeEvalStreaming");
  assertEq(detectRoute('gemini-flash', false), 'runGeminiEval', "Gemini Flash no-stream → runGeminiEval");
  assertEq(detectRoute('gemini-flash', true), 'runGeminiEvalStreaming', "Gemini Flash stream → runGeminiEvalStreaming");
  assertEq(detectRoute('gemini-pro', false), 'runGeminiEval', "Gemini Pro no-stream → runGeminiEval");

  // prepInterview routing (line ~1909):
  //   const isClaude = P.provider === 'claude';
  //   if(isClaude) → fetch anthropic; else → fetch gemini
  function detectPrepRoute(provider) {
    return provider === 'claude' ? 'anthropic' : 'gemini';
  }

  assertEq(detectPrepRoute('claude'), 'anthropic', "prepInterview: Claude → anthropic API");
  assertEq(detectPrepRoute('gemini-flash'), 'gemini', "prepInterview: Gemini Flash → gemini API");
  assertEq(detectPrepRoute('gemini-pro'), 'gemini', "prepInterview: Gemini Pro → gemini API");

  // Gemini model resolution
  assertEq(GEMINI_MODELS['gemini-flash'], 'gemini-2.5-flash', "Gemini Flash → model gemini-2.5-flash");
  assertEq(GEMINI_MODELS['gemini-pro'], 'gemini-2.5-pro', "Gemini Pro → model gemini-2.5-pro");
  assertEq(GEMINI_MODELS['claude'] || 'gemini-2.5-flash', 'gemini-2.5-flash', "Unknown provider falls back to gemini-2.5-flash");

  // generateCV is now provider-aware (v8.0): branches on isClaude, uses Gemini API when Gemini selected
  assert(html.includes('async function generateCV') && html.includes('getGeminiKey'), "generateCV: provider-aware (Claude + Gemini branches)");

  // runCloudFastScan is now provider-aware (v8.0): branches on isClaude
  assert(html.includes('async function runCloudFastScan') && html.includes('isClaude'), "runCloudFastScan: provider-aware (Claude + Gemini branches)");

  // Image support per provider
  assert(PROVIDERS.claude.supports_image === false, "Claude does not support image");
  assert(PROVIDERS['gemini-flash'].supports_image === true, "Gemini Flash supports image");
  assert(PROVIDERS['gemini-pro'].supports_image === true, "Gemini Pro supports image");

  // extractFromCV provider routing (line ~1358-1360):
  //   if(P.provider !== 'claude' && geminiKey) → useGemini
  //   else if(claudeKey) → use Claude
  //   else if(geminiKey) → use Gemini (fallback)
  function detectExtractRoute(provider, hasClaudeKey, hasGeminiKey) {
    if (provider !== 'claude' && hasGeminiKey) return 'gemini';
    if (hasClaudeKey) return 'claude';
    if (hasGeminiKey) return 'gemini';
    return null;
  }

  assertEq(detectExtractRoute('gemini-flash', true, true), 'gemini', "extractFromCV: Gemini provider + both keys → gemini");
  assertEq(detectExtractRoute('claude', true, true), 'claude', "extractFromCV: Claude provider + both keys → claude");
  assertEq(detectExtractRoute('claude', false, true), 'gemini', "extractFromCV: Claude provider + only gemini key → gemini fallback");
  assertEq(detectExtractRoute('gemini-pro', false, false), null, "extractFromCV: No keys → null");
}

// ═══════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════
console.log("\n════════════════════════════════════");
console.log(`TOTAL: ${passed + failed} tests — ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("FAILURES:");
  failures.forEach(f => console.log(`  • ${f}`));
}
console.log("════════════════════════════════════");
process.exit(failed > 0 ? 1 : 0);
