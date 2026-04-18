/**
 * Extract testable pure functions from index.html's inline <script>.
 * Uses Node built-ins only — no jsdom dependency needed.
 */
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');

let _env = null;

function getEnv() {
  if (_env) return _env;

  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  // Extract all inline <script> blocks (skip external src scripts)
  const scriptBlocks = [];
  const rx = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(html)) !== null) {
    if (m[1].trim()) scriptBlocks.push(m[1]);
  }
  const js = scriptBlocks.join('\n');

  // Helper: extract a function body from the JS source
  function extractFn(name) {
    const fnRx = new RegExp(`((?:async\\s+)?function\\s+${name}\\s*\\([^)]*\\)\\s*\\{)`);
    const match = fnRx.exec(js);
    if (!match) return null;
    const start = match.index;
    let depth = 0, i = js.indexOf('{', start + match[1].length - 1);
    for (; i < js.length; i++) {
      if (js[i] === '{') depth++;
      else if (js[i] === '}') { depth--; if (depth === 0) break; }
    }
    return js.substring(start, i + 1);
  }

  // Helper: extract a const/let/var declaration
  function extractDecl(name) {
    const rx = new RegExp(`(const|let|var)\\s+${name}\\s*=\\s*`);
    const match = rx.exec(js);
    if (!match) return null;
    const start = match.index;
    let depth = 0, i = start;
    for (; i < js.length; i++) {
      const c = js[i];
      if (c === '{' || c === '[' || c === '(') depth++;
      else if (c === '}' || c === ']' || c === ')') depth--;
      else if (c === ';' && depth === 0) break;
    }
    return js.substring(start, i + 1);
  }

  // Functions that are pure / don't need real DOM
  const fns = [
    'calcInHand', 'parseEv', 'fingerprintJD',
    'glsGaugeSVG', 'bytesToHex', 'hexToBytes',
    'pBlocks', 'needsAttention'
  ];
  const decls = ['STIPEND_BENCHMARKS', 'GEMINI_MODELS'];

  let evalCode = '';
  for (const d of decls) {
    const code = extractDecl(d);
    if (code) evalCode += code + '\n';
  }
  for (const fn of fns) {
    const code = extractFn(fn);
    if (code) evalCode += code + '\n';
  }

  // Minimal DOMParser stub for sanitize (used by mdown)
  // Returns innerHTML as-is (we test sanitize logic separately via structural checks)
  const stubSanitize = `function sanitize(html) { return html; }\n`;
  evalCode = stubSanitize + evalCode;

  evalCode += `\n__result = { ${['sanitize', ...fns, ...decls].join(', ')} };`;

  const sandbox = {
    crypto: webcrypto,
    Math, parseInt, parseFloat, String, Array, Object, Date, RegExp,
    console, JSON, Promise, Error, Uint8Array, TextEncoder, TextDecoder,
    __result: {}
  };
  sandbox.S = { jdFingerprints: {} };

  const sandboxKeys = Object.keys(sandbox);
  const sandboxVals = sandboxKeys.map(k => sandbox[k]);

  const factory = new Function(...sandboxKeys, evalCode + '\nreturn __result;');
  const extracted = factory(...sandboxVals);

  _env = extracted;
  return _env;
}

module.exports = { getEnv };
