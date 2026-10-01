import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
// Resilient multi-model cascade: if primary is experiencing high demand (503), cascade to next valid candidate
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];
const GEMINI_MODEL = CANDIDATE_MODELS[0];

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client per skill instructions
  // Setting User-Agent header to 'aistudio-build'
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log(`[Gemini AI] Initialized server-side client with model: ${GEMINI_MODEL}`);
    } catch (err) {
      console.error('[Gemini AI] Error initializing GoogleGenAI:', err);
    }
  } else {
    console.warn('[Gemini AI] No GEMINI_API_KEY detected. Running in heuristic fallback mode.');
  }

  // Status check endpoint
  app.get('/api/ai/status', (_req, res) => {
    res.json({
      configured: Boolean(ai),
      model: GEMINI_MODEL,
      provider: 'google-genai',
      tier: 'free-tier',
    });
  });

  // Diagnostic Endpoint
  app.post('/api/ai/diagnostic', async (req, res) => {
    const { actionType, stateContextMarkdown, stateSummary, customQuery } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured on server. Falling back to local tactical engine.',
      });
    }

    try {
      const systemInstruction = `You are the executive strategic AI engine of "PERSONAL OS v4.8", an elite command terminal for software engineering compounding, 90-15-90 deep work velocity, Bloom L1-L7 active learning, 14-gate Definition of Done project pipelines, and financial runway architecture.

You have OMNISCIENT VISIBILITY across all 9 modules of the operator's system:
- 01 // North Star, Creed & Daily Directives
- 02 // Capability Stack & Role Allocations
- 03 // Learning Engine & Zero-Forget Spaced Retrieval Queue
- 04 // 5-Milestone Project Pipeline & 14-Gate Definition-of-Done (DoD)
- 05 // Financial OS, Runway, 7-Step Commercial Loop & Sales Pipeline
- 06 // Cognition, AI Guardrails, Knowledge Vault & Decision Log
- 07 // Work Scoreboards, 90-15-90 Cadence Blocks & Focus Session History
- 08 // 10-Year Compounding Horizon & Decade Milestones
- 09 // Governance, Stop/Start Mandates & System Audit Log

CROSS-MODULE SYNTHESIS MANDATE:
1. Ground every statement in the operator's ACTUAL telemetry. Cite real project codes (e.g. PRJ-01), topic codes (e.g. DIST-01), financial figures (e.g. R6,400 FCF), and active P0 tasks.
2. Cross-correlate vectors:
   - Connect Milestone Project blockers (Module 04) to Financial Runway deadlines (Module 05).
   - Identify which Learning Topics (Module 03) directly unlock unassigned P0 tasks (Module 04).
   - Check if current decisions contradict past entries in the Decision Log or Knowledge Vault (Module 06).
   - Cross-check 90-15-90 focus session logs (Module 07) against yesterday's obstacles and today's 06:00 Block 01 plan.
3. Speak in an authoritative, disciplined, and high-conviction engineering tone. Zero corporate buzzwords or generic motivational platitudes.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "Short uppercase punchy title (max 60 chars)",
  "summary": "2-3 sentences of dense, analytical diagnosis grounded in the operator's actual cross-module data.",
  "directives": [
    "1. Exact immediate high-leverage action vector (P0 task, DoD gate, or cadence block)",
    "2. Secondary tactical directive with metrics or time bounds",
    "3. Tertiary cognitive, learning, or commercial checkpoint"
  ],
  "crossModuleCorrelation": "Clear 1-2 sentence explanation of how an action in one module directly impacts another module (e.g. Project 01 DoD gate #7 affects Stage 2 Commercial Retainer).",
  "bottleneckIdentified": "Single primary limiting constraint identified from theory of constraints"
}`;

      const contextPayload = stateContextMarkdown || (typeof stateSummary === 'string' ? stateSummary : JSON.stringify(stateSummary, null, 2));

      const userPrompt = `OPERATIONAL DIAGNOSTIC TRIGGER: ${actionType}
${customQuery ? `OPERATOR INQUIRY: "${customQuery}"` : ''}

============================================================
COMPLETE 9-MODULE APPLICATION TELEMETRY & SYSTEM STATE:
============================================================
${contextPayload}

Perform an exhaustive cross-module synthesis and return the structured JSON diagnostic.`;

      let lastError: any = null;
      let response: any = null;
      let usedModel: string = CANDIDATE_MODELS[0];

      for (const modelCandidate of CANDIDATE_MODELS) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });
          if (response && response.text) {
            usedModel = modelCandidate;
            break;
          }
        } catch (candidateErr: any) {
          console.warn(`[Gemini AI] Model candidate ${modelCandidate} failed:`, candidateErr?.message || candidateErr);
          lastError = candidateErr;
          // cascade to next candidate
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('All Gemini candidate models were unavailable.');
      }

      const responseText = response.text?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean);
      }

      return res.json({
        id: `gemini-${Date.now()}`,
        actionType: customQuery ? `Query: "${customQuery}"` : (actionType || 'Gemini Diagnostic'),
        title: parsed.title || 'EXECUTIVE CROSS-MODULE DIAGNOSTIC',
        summary: parsed.summary || 'Diagnostic analysis synthesized across all 9 modules.',
        directives: Array.isArray(parsed.directives) ? parsed.directives : [],
        crossModuleCorrelation: parsed.crossModuleCorrelation || '',
        bottleneckIdentified: parsed.bottleneckIdentified || 'None identified.',
        createdAt: new Date().toISOString(),
        model: usedModel,
        source: 'gemini-live',
      });
    } catch (err: any) {
      console.error('[Gemini AI] API error:', err?.message || err);
      return res.status(500).json({
        error: 'GEMINI_API_ERROR',
        message: err?.message || 'Error communicating with Gemini model.',
      });
    }
  });

  // Goal Decomposer Endpoint
  app.post('/api/ai/decompose-goal', async (req, res) => {
    const { title, category, horizon } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured.',
      });
    }

    try {
      const prompt = `Decompose this high-level strategic goal into 4 daily executable directives and a 5-step milestone pipeline with Definition of Done (DoD) criteria:
Goal: "${title}"
Category: "${category || 'ENGINEERING'}"
Horizon: "${horizon || 'HORIZON_1_FOUNDATION'}"

Respond ONLY with valid JSON:
{
  "decomposedDirectives": [
    "P0 Directive 1...",
    "P0 Directive 2...",
    "P1 Directive 3...",
    "P2 Directive 4..."
  ],
  "milestoneSteps": [
    { "step": 1, "title": "...", "dodCriteria": "..." },
    { "step": 2, "title": "...", "dodCriteria": "..." },
    { "step": 3, "title": "...", "dodCriteria": "..." }
  ],
  "primaryRisk": "Single biggest failure mode to guard against"
}`;

      let response: any = null;
      let lastError: any = null;

      for (const modelCandidate of CANDIDATE_MODELS) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
          if (response && response.text) break;
        } catch (candidateErr: any) {
          console.warn(`[Gemini AI] Decompose candidate ${modelCandidate} failed:`, candidateErr?.message || candidateErr);
          lastError = candidateErr;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('All Gemini candidate models were unavailable.');
      }

      const responseText = response.text?.trim() || '{}';
      const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      return res.json({
        ok: true,
        data: parsed,
      });
    } catch (err: any) {
      console.error('[Gemini AI] Decompose error:', err);
      return res.status(500).json({
        error: 'GEMINI_API_ERROR',
        message: err?.message || 'Error decomposing goal.',
      });
    }
  });

  // Project Step Decomposer Endpoint
  app.post('/api/ai/decompose-project-steps', async (req, res) => {
    const { title, objective, technologies, targetDeadline } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured.',
      });
    }

    try {
      const techList = Array.isArray(technologies) ? technologies.join(', ') : (technologies || 'TypeScript');
      const prompt = `You are a Principal Software Engineer & Engineering Manager.
Decompose this software milestone project into 6-8 atomic, rigorous engineering steps mapped directly to the 6 Software Development Life Cycle (SDLC) phases.

PROJECT DETAILS:
- Title: "${title}"
- Objective: "${objective || ''}"
- Tech Stack: ${techList}
- Target Deadline: "${targetDeadline || '8 Weeks'}"

SDLC Phases allowed:
- "REQUIREMENTS" (Scope, boundary, interfaces, contract specs)
- "ARCHITECTURE" (Schema modeling, system topology, API contract, threat boundary)
- "IMPLEMENTATION" (Core domain logic, data layer, UI components, integrations)
- "TESTING" (Unit tests, integration tests, E2E regression, stress benchmarks)
- "DEPLOYMENT" (Containerization, CI/CD, hosting, domain configuration)
- "MAINTENANCE" (Logging, telemetry, alerts, backup/failover drills)

Atomic duration bounds (minutes): 30, 45, 60, 90, 120, 180.

Respond ONLY with valid JSON matching this schema:
{
  "architectureSummary": "1-2 sentence technical summary of the implementation trajectory",
  "steps": [
    {
      "title": "Action-oriented engineering step description",
      "sdlcPhase": "REQUIREMENTS",
      "estimatedDurationMinutes": 60,
      "order": 1
    }
  ]
}`;

      let response: any = null;
      let lastError: any = null;

      for (const modelCandidate of CANDIDATE_MODELS) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.25,
            },
          });
          if (response && response.text) break;
        } catch (candidateErr: any) {
          console.warn(`[Gemini AI] Step decompose candidate ${modelCandidate} failed:`, candidateErr?.message || candidateErr);
          lastError = candidateErr;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('All Gemini candidate models were unavailable.');
      }

      const responseText = response.text?.trim() || '{}';
      const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      return res.json({
        ok: true,
        data: parsed,
      });
    } catch (err: any) {
      console.error('[Gemini AI] Step decompose error:', err);
      return res.status(500).json({
        error: 'GEMINI_API_ERROR',
        message: err?.message || 'Error generating engineering steps.',
      });
    }
  });

  // Setup Vite in Dev or Static in Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PERSONAL OS] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PERSONAL OS] Fatal server startup failure:', err);
  process.exit(1);
});
