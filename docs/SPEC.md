# Technical Specification: Learning & Retention Engine

**Component:** Module 03 (`LearningEngine.tsx`, `sm2Algorithm.ts`, `aiService.ts`, `server.ts`, `repository.ts`)  
**Standard:** POS-ENG-SPEC-v2.1  
**Classification:** System Architecture, Cognitive Taxonomy & Algorithmic Specification  

---

## 1. System Overview & Problem Formulation

### 1.1 Problem Formulation
* **Recognition Bias vs. Retrieval Fluency:** Passive review (re-reading documentation, multiple-choice questions) tests recognition memory rather than generative synthesis under production pressure.
* **Exponential Knowledge Decay:** Technical primitives decay exponentially according to the Ebbinghaus forgetting curve without mathematically calibrated review intervals.

### 1.2 Architectural Objective
An automated cognitive engine that pairs **zero-recognition blind recall** with **SuperMemo SM-2 interval scheduling**, **continuous Ebbinghaus decay modeling**, and **adversarial AI rubric verification**.

---

## 2. The 7-Tier Engineering Cognitive Taxonomy

```
L7: PRODUCTION MASTERY (Live Outage SLA Mitigation)
 ▲
L6: FEYNMAN SYNTHESIS (Zero-Jargon Junior Engineer Transfer)
 ▲
L5: RESILIENT ARCHITECTURAL DESIGN (Zero-Downtime Migration Invariants)
 ▲
L4: PRODUCTION DIAGNOSTIC TRIAGE (90-Second Adversarial Incident Root)
 ▲
L3: IDIOMATIC IMPLEMENTATION (Production-Grade Code & Test Suite)
 ▲
L2: STRUCTURAL INVARIANTS & TRADE-OFFS (Why X over Y? Failure Bounds)
 ▲
L1: RAW PRIMITIVES & SYNTAX (Blank-Page Zero-Hint Reconstruction)
```

### Tier Definitions & Verification Criteria

| Tier | Level Name | Cognitive Challenge | Verification Criterion |
| :--- | :--- | :--- | :--- |
| **L1** | **Raw Primitives & Syntax** | *Blank-Page Syntax Recall* | Reconstruct foundational syntax, data layouts, and primitive signatures with zero IDE auto-completion. |
| **L2** | **Structural Invariants** | *First-Principles Trade-offs* | Contrast architectural choices (*Why X over Y?*) and identify boundary constraints under memory/network limits. |
| **L3** | **Idiomatic Implementation** | *Working Code & Test Suite* | Write production-grade code adhering to clean contracts, error propagation, and unit tests. |
| **L4** | **Diagnostic Triage** | *Timed Failure Root-Cause Analysis* | **Adversarial:** Diagnose deadlocks, memory leaks, latency cliffs, or corrupt payloads under a 90-second countdown. |
| **L5** | **Resilient Architecture** | *Zero-Downtime System Invariants* | Design fault-tolerant workflows, idempotency guarantees, dual-write mitigations, and cross-region consensus. |
| **L6** | **Feynman Synthesis** | *Jargon-Free Mental Model Transfer* | Explain the mechanism to a junior engineer without using 3 common crutch buzzwords. |
| **L7** | **Production Mastery** | *Live High-Stakes SLA Mitigation* | Sub-5-minute mitigation of live load failures, chaos engineering, and deterministic post-mortem root-cause derivation. |

---

## 3. Two-Phase Active Retrieval Protocol

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: BLIND RECALL (Occluded Mode)                       │
│  • Anti-Recognition Banner: Past notes strictly hidden       │
│  • Stopwatch Latency Timer & Live Word Counter               │
│  • Blank Scratchpad: Operator types derivation from memory   │
│  • [AI Verify Recall ✨]: Real-Time Socratic Rubric Audit    │
│  • Action: Reveal Benchmark & Grade (Phase 2)                │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: BENCHMARK & CALIBRATED SM-2 (Revealed Mode)        │
│  • Side-by-Side: Operator Attempt vs. Canonical Benchmark    │
│  • AI Audit Report: Score, Strengths, Blind Spots, Critique   │
│  • Ebbinghaus Decay Forecast Curve (Interactive SVG)         │
│  • Competence Elevation: Promote Level (L1 ➔ L7)              │
│  • Evidence Log Input + AI Verification                      │
│  • SuperMemo SM-2 Calibrated Rating:                         │
│    [Forgot (0)]  [Hard (1)]  [Good (2)]  [Easy (3)]          │
│    (AI Recommended grade is dynamically highlighted)         │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Mathematical Specifications

### 4.1 SuperMemo SM-2 Spaced Repetition Engine (`sm2Algorithm.ts`)

Given a quality grade $q \in \{1, 3, 4, 5\}$ corresponding to `['Forgot', 'Hard', 'Good', 'Easy']`:

#### 1. Ease Factor ($EF$) Calculation
$$EF' = \max\left(1.3, \, EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)\right)$$

* **Forgot ($q = 1$):** $\Delta EF = -0.20$
* **Hard ($q = 3$):** $\Delta EF = -0.14$
* **Good ($q = 4$):** $\Delta EF = -0.00$
* **Easy ($q = 5$):** $\Delta EF = +0.10$
* Lower bound constraint: $EF \ge 1.30$. Default initial: $EF = 2.50$.

#### 2. Repetition Count ($n$) & Interval ($I_n$)
* If $q < 3$ (**Forgot**):
  $$\text{repetitionCount} = 0, \quad I = 1\text{ day}$$
* If $q \ge 3$:
  $$\text{repetitionCount} = n + 1$$
  $$I_n = \begin{cases} 
  1\text{ day} & \text{if } n = 0 \\
  6\text{ days} & \text{if } n = 1 \\
  \text{round}(I_{n-1} \times EF') & \text{if } n \ge 2 
  \end{cases}$$
  *(For the 'Hard' rating, an immediate reinforcement interval of 2 days is assigned).*

#### 3. Scheduled Due Date
$$\text{nextDueDate} = \text{now}() + I \times 86{,}400{,}000\text{ ms}$$

---

### 4.2 Continuous Ebbinghaus Exponential Memory Decay Modeling

Retention decays continuously between active reviews:

$$R(t) = \exp\left(-\frac{t}{S}\right)$$

Where:
* $t$: Elapsed days since last active retrieval ($\text{now} - \text{lastReviewedDate}$).
* $S$: Memory stability score:
  $$S = \max\left(1.0, \, I \times \frac{EF}{2.5}\right)$$
* **Memory Half-Life ($t_{1/2}$):**
  $$t_{1/2} = S \times \ln(2) \approx 0.69315 \times S$$
* **Normalized Retention Percentage:**
  $$\text{retentionPct} = \text{round}\left(\max\left(0, \, \min\left(100, \, R(t) \times 100\right)\right)\right)$$
* **Unreviewed Invariant:** If $\text{reviewCount} = 0$ or $\text{lastReviewedDate}$ is undefined, $\text{retentionPct} \equiv 0\%$ (Day 0 Baseline).

---

## 5. Automated AI Orchestration Pipeline

```
┌───────────────────────────────┬────────────────────────────────────────┐
│ Vector 1: Real-Time Recall    │ Evaluates scratchpad text during Blind │
│ Evaluator                     │ Recall against Bloom rubric criteria.  │
├───────────────────────────────┼────────────────────────────────────────┤
│ Vector 2: Socratic Bloom      │ Generates adversarial oral exams with  │
│ Examiner                      │ 90s countdown triage contexts.         │
├───────────────────────────────┼────────────────────────────────────────┤
│ Vector 3: First-Principles    │ Breaks down new topics into 7-tier     │
│ Topic Decomposer              │ protocol steps & blank-paper prompts.  │
├───────────────────────────────┼────────────────────────────────────────┤
│ Vector 4: Live Evidence Audit │ Validates commit hashes, PRs, and test │
│ Auditor                       │ outputs before allowing elevation.     │
├───────────────────────────────┼────────────────────────────────────────┤
│ Vector 5: Project Synergy     │ Correlates theoretical topics with     │
│ Engine                        │ Milestone Project blockers.            │
└───────────────────────────────┴────────────────────────────────────────┘
```

### Evaluation Payload Schema (`/api/ai/learning-exam`):
```json
{
  "mode": "EVALUATE_ANSWER",
  "topic": "string",
  "stage": "L1 | L2 | L3 | L4 | L5 | L6 | L7",
  "question": "string",
  "rubricPoints": ["string"],
  "answer": "string"
}
```

### AI Evaluation Output Structure:
```json
{
  "comprehensionScore": 88,
  "recommendedRating": "Forgot | Hard | Good | Easy",
  "recommendedStage": "L1 | L2 | L3 | L4 | L5 | L6 | L7",
  "blindSpots": ["string"],
  "verifiedStrengths": ["string"],
  "feynmanCritique": "string",
  "confidencePct": 92
}
```

---

## 6. Data Isolation & Testing Baseline Modes

* **Clean Zero Baseline (0% Retention, Day 0):** Resets all topics to $\text{progress} = 0$, $\text{reviewCount} = 0$, $\text{repetitionCount} = 0$, $\text{lastReviewedDate} = \text{undefined}$, $\text{retentionState} = \text{'DUE\_TODAY'}$, $\text{intervalDays} = 1$, $\text{easeFactor} = 2.50$. Clears historical reviews.
* **Empty Slate (0 Topics):** Empties the topic repository to test ground-up syllabus creation with zero pre-seeded data.
* **Seed Demo Data (23 Topics):** Restores curated reference datasets across Distributed Systems, AI Engineering, Databases, and Low-Latency Runtimes.
