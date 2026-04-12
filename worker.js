// Phase 1 (Today) → Gemma 2 2B Lite + Claude Sonnet
/**
 * Career-Ops-India App — Local AI Worker v7.1
 * Web Worker for WebLLM + Gemma inference.
 *
 * Uses dynamic import() instead of top-level import
 * for better compatibility with GitHub Pages and
 * mobile browsers that restrict module workers.
 *
 * Current model: gemma-2-2b-it-q4f16_1-MLC-1k (low resource)
 * Swap model ID when Gemma 4 E2B lands in WebLLM registry.
 */

// ── MODEL REGISTRY ───────────────────────────────────────────
const MODEL_REGISTRY = {
  'gemma-2-2b-standard': {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    label: 'Gemma 2 2B — Standard',
    vram_mb: 1895,
    size_gb: '~1.9 GB',
    available: true
  },
  'gemma-2-2b-lite': {
    id: 'gemma-2-2b-it-q4f16_1-MLC-1k',
    label: 'Gemma 2 2B — Lite (Recommended)',
    vram_mb: 1584,
    size_gb: '~1.6 GB',
    available: true,
    recommended: true
  },
  'gemma-4-e2b': {
    id: 'gemma-4-e2b-it-q4f16_1-MLC',
    label: 'Gemma 4 E2B — Upgrade',
    vram_mb: 1400,
    size_gb: '~1.4 GB',
    available: false,
    comingSoon: true
  }
};

// ── STATE ────────────────────────────────────────────────────
let engine = null;
let webllm = null;
let currentModelKey = 'gemma-2-2b-lite';
let engineState = 'uninitialized';

// ── GLS SYSTEM PROMPT ────────────────────────────────────────
const GLS_SYSTEM_PROMPT = `You are the Career-Ops-India Job Assessor — a specialist in detecting ghost job postings in the Indian job market.

Evaluate the Job Description for Ghost Likelihood across 9 weighted signals:
1. Repost Pattern (20 pts)
2. Posting Age >60 days (15 pts)
3. Apply CTA inactive/missing (15 pts)
4. Source Quality: Naukri/Foundit=high risk, ATS/company site=low risk (15 pts)
5. Boilerplate ratio >70% (10 pts)
6. Impossible requirements combo (10 pts)
7. Layoff/hiring freeze signals (8 pts)
8. Unnamed client/consultancy (4 pts)
9. Missing team+stack+location (3 pts)

Think step by step. Only flag signals you can evidence from the JD text.
Respond ONLY with valid JSON — no explanation outside the JSON object:
{"gls":<0-100>,"risk_level":"<Low|Moderate|High|Very High>","confidence":"<High Confidence|Proceed with Caution|Suspicious|Very High Risk>","signals_fired":[{"signal":"<name>","pts":<n>,"reason":"<evidence>"}],"top_3_red_flags":["<flag1>","<flag2>","<flag3>"],"recommendation":"<one sentence>"}`;

// ── WEBLLM LOADER ────────────────────────────────────────────
// CDN fallback chain — tries multiple CDNs
const WEBLLM_CDNS = [
  'https://esm.run/@mlc-ai/web-llm',
  'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/+esm'
];

async function loadWebLLM() {
  for (const cdn of WEBLLM_CDNS) {
    try {
      const mod = await import(cdn);
      if (mod && (mod.CreateMLCEngine || mod.default?.CreateMLCEngine)) {
        return mod.default || mod;
      }
    } catch (e) {
      // Try next CDN
    }
  }
  throw new Error('Could not load WebLLM from any CDN. Check your internet connection.');
}

// ── MESSAGE HANDLER ──────────────────────────────────────────
self.onmessage = async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'GET_STATUS':
      self.postMessage({
        type: 'STATUS',
        state: engineState,
        modelKey: currentModelKey,
        model: MODEL_REGISTRY[currentModelKey]
      });
      break;

    case 'GET_MODELS':
      self.postMessage({
        type: 'MODELS',
        registry: MODEL_REGISTRY,
        activeKey: currentModelKey
      });
      break;

    case 'SET_MODEL':
      if (MODEL_REGISTRY[payload?.modelKey]) {
        if (engine) {
          try { await engine.unload(); } catch (e) {}
          engine = null;
        }
        currentModelKey = payload.modelKey;
        engineState = 'uninitialized';
        self.postMessage({ type: 'MODEL_SET', modelKey: currentModelKey });
      } else {
        self.postMessage({ type: 'ERROR', message: 'Unknown model key: ' + payload?.modelKey });
      }
      break;

    case 'LOAD_MODEL':
      await loadModel(payload?.modelKey);
      break;

    case 'RUN_GLS':
      await runGLS(payload.jd);
      break;

    case 'UNLOAD':
      await unloadEngine();
      break;

    default:
      self.postMessage({ type: 'ERROR', message: 'Unknown message type: ' + type });
  }
};

// ── LOAD MODEL ───────────────────────────────────────────────
async function loadModel(modelKey) {
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    currentModelKey = modelKey;
  }

  const modelInfo = MODEL_REGISTRY[currentModelKey];

  // Gemma 4 E2B not yet available
  if (currentModelKey === 'gemma-4-e2b') {
    self.postMessage({
      type: 'ERROR',
      message: 'Gemma 4 E2B is not yet compiled for WebLLM. Falling back to Gemma 2 2B Lite.',
      fallbackKey: 'gemma-2-2b-lite'
    });
    currentModelKey = 'gemma-2-2b-lite';
    // Retry with fallback
    await loadModel('gemma-2-2b-lite');
    return;
  }

  if (engineState === 'ready') {
    self.postMessage({ type: 'READY', modelKey: currentModelKey, model: modelInfo });
    return;
  }

  engineState = 'downloading';
  self.postMessage({ type: 'DOWNLOADING', modelKey: currentModelKey, model: modelInfo });

  try {
    // Lazy load WebLLM only when needed
    if (!webllm) {
      self.postMessage({
        type: 'PROGRESS',
        text: 'Loading WebLLM engine...',
        progress: 0.01,
        modelKey: currentModelKey
      });
      webllm = await loadWebLLM();
    }

    const CreateMLCEngine = webllm.CreateMLCEngine;
    if (!CreateMLCEngine) throw new Error('WebLLM CreateMLCEngine not found');

    engine = await CreateMLCEngine(
      modelInfo.id,
      {
        initProgressCallback: (progress) => {
          self.postMessage({
            type: 'PROGRESS',
            text: progress.text || '',
            progress: progress.progress || 0,
            modelKey: currentModelKey
          });
        }
      }
    );

    engineState = 'ready';
    self.postMessage({
      type: 'READY',
      modelKey: currentModelKey,
      model: modelInfo
    });

  } catch (err) {
    engineState = 'error';
    engine = null;
    self.postMessage({
      type: 'ERROR',
      message: 'Failed to load model: ' + err.message,
      fatal: true
    });
  }
}

// ── RUN GLS ──────────────────────────────────────────────────
async function runGLS(jd) {
  if (!engine || engineState !== 'ready') {
    self.postMessage({
      type: 'GLS_ERROR',
      message: 'Model not loaded. Please sync your Command Center first.'
    });
    return;
  }

  engineState = 'processing';
  self.postMessage({ type: 'PROCESSING' });

  try {
    const messages = [
      { role: 'system', content: GLS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Evaluate this job description for ghost likelihood. Output ONLY valid JSON.\n\nJOB DESCRIPTION:\n${jd.substring(0, 2000)}`
      }
    ];

    const response = await engine.chat.completions.create({
      messages,
      max_tokens: 600,
      temperature: 0.1,
      stream: false
    });

    const rawText = response.choices?.[0]?.message?.content || '';

    // Parse JSON
    let result;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      result = {
        gls: 50,
        risk_level: 'Moderate',
        confidence: 'Proceed with Caution',
        signals_fired: [],
        top_3_red_flags: ['Could not parse detailed signals — review manually'],
        recommendation: 'Manual review recommended.'
      };
    }

    result.gls = Math.max(0, Math.min(100, parseInt(result.gls) || 0));

    self.postMessage({ type: 'GLS_RESULT', result, modelKey: currentModelKey });

  } catch (err) {
    self.postMessage({ type: 'GLS_ERROR', message: 'Inference failed: ' + err.message });
  } finally {
    engineState = 'ready';
  }
}

// ── UNLOAD ───────────────────────────────────────────────────
async function unloadEngine() {
  if (engine) {
    try { await engine.unload(); } catch (e) {}
    engine = null;
  }
  engineState = 'uninitialized';
  self.postMessage({ type: 'UNLOADED' });
}
