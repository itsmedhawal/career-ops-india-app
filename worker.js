// Phase 1 (Today) → Gemma 2 2B Lite + Claude Sonnet
/**
 * Career-Ops-India App — Local AI Worker
 * Handles WebLLM engine lifecycle in a Web Worker
 * so the main UI thread stays responsive during model
 * loading and inference.
 *
 * Current model: gemma-2-2b-it-q4f16_1-MLC-1k (low resource)
 * Swap model ID below when Gemma 4 E2B lands in WebLLM registry.
 */

import * as webllm from 'https://esm.run/@mlc-ai/web-llm';

// ── MODEL REGISTRY ──────────────────────────────────────────
// To upgrade: change ACTIVE_MODEL to the new model ID.
// All other code stays identical.
const MODEL_REGISTRY = {
  'gemma-2-2b-standard': {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    label: 'Gemma 2 2B — Standard',
    vram_mb: 1895,
    low_resource: false,
    size_gb: '~1.9 GB'
  },
  'gemma-2-2b-lite': {
    id: 'gemma-2-2b-it-q4f16_1-MLC-1k',
    label: 'Gemma 2 2B — Lite (Recommended)',
    vram_mb: 1584,
    low_resource: true,
    size_gb: '~1.6 GB'
  },
  'gemma-4-e2b': {
    id: 'gemma-4-e2b-it-q4f16_1-MLC',  // placeholder — swap when available
    label: 'Gemma 4 E2B — Upgrade (Coming Soon)',
    vram_mb: 1400,
    low_resource: true,
    size_gb: '~1.4 GB'
  }
};

const DEFAULT_MODEL_KEY = 'gemma-2-2b-lite';

// ── STATE ────────────────────────────────────────────────────
let engine = null;
let currentModelKey = DEFAULT_MODEL_KEY;
let engineState = 'uninitialized'; // uninitialized | downloading | ready | processing | error

// ── GLS SYSTEM PROMPT ────────────────────────────────────────
// India-calibrated Ghost Likelihood Score assessor.
// Uses chain-of-thought reasoning before outputting structured JSON.
const GLS_SYSTEM_PROMPT = `You are the Career-Ops-India Job Assessor — a specialist in detecting ghost job postings in the Indian job market.

Your task is to evaluate a Job Description (JD) for Ghost Likelihood across 9 weighted signals.

SCORING SIGNALS (total 100 points):
1. Repost Pattern (20 pts) — Signs the role has been reposted multiple times
2. Posting Age (15 pts) — Indicators the role is stale or old
3. Apply Button / CTA (15 pts) — Vague or missing application instructions
4. Source Quality (15 pts) — Naukri/Foundit = higher risk; ATS/company site = lower risk
5. Boilerplate Ratio (10 pts) — Generic template language > 70% of JD
6. Requirements Realism (10 pts) — Impossible combinations (e.g. 10 years exp in 3-year-old tech)
7. Layoff / Hiring Freeze Signals (8 pts) — Company in news for layoffs or freeze
8. Consultancy / Unnamed Client (4 pts) — "Our client", unnamed MNC, third-party recruiter
9. Missing Specifics (3 pts) — No team size, tech stack, or location details

INSTRUCTIONS:
- Think step by step through each signal based only on the JD text provided
- Assign points only for signals you can evidence from the JD text
- Be conservative — only flag signals you are confident about
- Calculate total GLS out of 100

OUTPUT FORMAT — respond ONLY with valid JSON, no explanation outside the JSON:
{
  "gls": <number 0-100>,
  "risk_level": "<Low|Moderate|High|Very High>",
  "confidence": "<High Confidence|Proceed with Caution|Suspicious|Very High Risk>",
  "signals_fired": [
    {"signal": "<signal name>", "pts": <points assigned>, "reason": "<specific evidence from JD>"}
  ],
  "top_3_red_flags": ["<flag 1>", "<flag 2>", "<flag 3>"],
  "recommendation": "<one sentence recommendation>"
}`;

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
      if (MODEL_REGISTRY[payload.modelKey]) {
        if (engine) {
          try { await engine.unload(); } catch (e) {}
          engine = null;
        }
        currentModelKey = payload.modelKey;
        engineState = 'uninitialized';
        self.postMessage({ type: 'MODEL_SET', modelKey: currentModelKey });
      } else {
        self.postMessage({ type: 'ERROR', message: 'Unknown model key: ' + payload.modelKey });
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

  // Gemma 4 E2B is not yet in WebLLM registry — block gracefully
  if (currentModelKey === 'gemma-4-e2b') {
    self.postMessage({
      type: 'ERROR',
      message: 'Gemma 4 E2B is not yet available in WebLLM. It will be added when the MLC community compiles it. Using Gemma 2 2B Lite instead.',
      fallbackKey: 'gemma-2-2b-lite'
    });
    currentModelKey = 'gemma-2-2b-lite';
    return;
  }

  if (engineState === 'ready') {
    self.postMessage({ type: 'READY', modelKey: currentModelKey, model: modelInfo });
    return;
  }

  engineState = 'downloading';
  self.postMessage({ type: 'DOWNLOADING', modelKey: currentModelKey, model: modelInfo });

  try {
    engine = await webllm.CreateMLCEngine(
      modelInfo.id,
      {
        initProgressCallback: (progress) => {
          self.postMessage({
            type: 'PROGRESS',
            text: progress.text,
            progress: progress.progress,  // 0.0 to 1.0
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

// ── RUN GLS INFERENCE ────────────────────────────────────────
async function runGLS(jd) {
  if (!engine || engineState !== 'ready') {
    self.postMessage({
      type: 'GLS_ERROR',
      message: 'Model not loaded. Please load the model first.'
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
      temperature: 0.1,  // Low temperature for consistent structured output
      stream: false
    });

    const rawText = response.choices[0]?.message?.content || '';

    // Parse JSON from response
    let result;
    try {
      // Strip any markdown fences if model added them
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      // Find JSON object in response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      // If JSON parsing fails, construct a minimal result
      result = {
        gls: 50,
        risk_level: 'Moderate',
        confidence: 'Proceed with Caution',
        signals_fired: [],
        top_3_red_flags: ['Could not parse detailed signals'],
        recommendation: 'Manual review recommended — could not parse AI response.',
        parse_error: rawText.substring(0, 200)
      };
    }

    // Validate and clamp GLS
    result.gls = Math.max(0, Math.min(100, parseInt(result.gls) || 0));

    self.postMessage({
      type: 'GLS_RESULT',
      result,
      modelKey: currentModelKey
    });

  } catch (err) {
    self.postMessage({
      type: 'GLS_ERROR',
      message: 'Inference failed: ' + err.message
    });
  } finally {
    // Always unload after inference to free VRAM
    // Critical for mid-range Indian phones
    engineState = 'ready'; // reset to ready, not unloaded
    // Note: we keep engine loaded for potential follow-up scans
    // Call UNLOAD explicitly to free VRAM when done
  }
}

// ── UNLOAD ENGINE ────────────────────────────────────────────
async function unloadEngine() {
  if (engine) {
    try {
      await engine.unload();
    } catch (e) {
      // Swallow unload errors
    }
    engine = null;
  }
  engineState = 'uninitialized';
  self.postMessage({ type: 'UNLOADED' });
}
