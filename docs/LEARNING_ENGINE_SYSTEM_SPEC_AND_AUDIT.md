# PERSONAL OS // Learning & Retention Engine: Architecture, Algorithmic Specification, and Audit Dossier

**Document Title:** Learning & Retention Engine Technical Specification & Audit Dossier  
**System Component:** Module 03 (`LearningEngine.tsx`, `sm2Algorithm.ts`, `aiService.ts`, `server.ts`, `repository.ts`)  
**Target Audience:** Software Architects, Cognitive Engineers, and AI System Auditors (ChatGPT / Claude / External Reviewers)  
**Document Version:** 2.1.0  
**Classification:** Complete Technical & Cognitive Blueprint  

---

## 1. Executive Overview & Problem Statement

### 1.1 The Core Problem
Senior and staff software engineers operate across rapidly compounding technical stacks (distributed consensus, low-level concurrency, AI/LLM engineering, kernel internals, and financial protocols). However, conventional learning paradigms fail engineering professionals in two distinct ways:
1. **The Illusion of Competence (Recognition Bias):** Re-reading documentation, watching lectures, or answering multiple-choice flashcards tests *passive recognition*, not *active generative synthesis*. Under production outages or architectural design reviews, engineers suffer mental blockages because they cannot construct mechanisms from raw memory.
2. **Uncalibrated Knowledge Decay (The Forgetting Curve):** Without mathematical spaced intervals, high-leverage primitives decay exponentially, causing engineers to repeatedly re-learn the same fundamentals.

### 1.2 The System Solution
The **Learning & Retention Engine** in PERSONAL OS is an industrial-grade cognitive harness that replaces passive reading with **zero-recognition active retrieval**, **mathematical SuperMemo SM-2 spaced repetition**, **continuous Ebbinghaus decay modeling**, and **adversarial AI Socratic verification**.

---

## 2. The 7-Tier Engineering Cognitive Taxonomy (Adapted Bloom's)

Rather than treating all knowledge items uniformly, the system stratifies engineering concepts across a 7-tier cognitive ladder ($L_1 \rightarrow L_7$):

```
┌────────────────────────────────────────────────────────────────────────┐
│  L7: HIGH-STAKES PRODUCTION MASTERY (Live Outage SLA Mitigation)        │
│  ▲                                                                     │
│  L6: FEYNMAN SYNTHESIS (Zero-Jargon Junior Engineer Transfer)          │
│  ▲                                                                     │
│  L5: RESILIENT ARCHITECTURAL DESIGN (Zero-Downtime Migration Invariants)│
│  ▲                                                                     │
│  L4: PRODUCTION DIAGNOSTIC TRIAGE (90-Second Adversarial Incident Root) │
│  ▲                                                                     │
│  L3: IDIOMATIC IMPLEMENTATION (Production-Grade Code & Test Suite)     │
│  ▲                                                                     │
│  L2: STRUCTURAL INVARIANTS & TRADE-OFFS (Why X over Y? Failure Bounds) │
│  ▲                                                                     │
│  L1: RAW PRIMITIVES & SYNTAX (Blank-Page Zero-Hint Reconstruction)     │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Level Specifications:

* **Tier L1 — Raw Primitives & Syntax (Recall):**
  * *Objective:* Reconstruct the foundational syntax, data layout, and primitive signatures with zero IDE auto-completion or external references.
  * *Verification Bar:* Operator writes the raw protocol packet layout, type signature, or state enum onto a blank canvas.
* **Tier L2 — Structural Invariants & Trade-Offs (Understanding):**
  * *Objective:* Articulate the exact mechanical trade-offs (*"Why Raft over Paxos?", "Why B-Tree over LSM for read-heavy workloads?"*).
  * *Verification Bar:* Identifies non-negotiable system invariants and boundary conditions under memory/network constraints.
* **Tier L3 — Idiomatic Implementation (Application):**
  * *Objective:* Implement a clean, working architectural slice with robust error propagation and unit tests.
  * *Verification Bar:* Verifiable code artifact in an active project repository (verified via PR or commit hash).
* **Tier L4 — Production Diagnostic Triage (Analysis - Adversarial):**
  * *Objective:* Real-time root-cause isolation under synthetic failure.
  * *Verification Bar:* A 90-second countdown oral/written exam presenting synthetic latency cliffs, deadlocks, payload corruption, or memory leaks. Operator must isolate the faulty layer and specify the immediate mitigation command.
* **Tier L5 — Resilient Architectural Invariants (Creation):**
  * *Objective:* Design zero-downtime distributed workflows, idempotency guarantees, and cross-region consensus models.
  * *Verification Bar:* Produces an RFC or system specification detailing dual-write mitigations, circuit breaking, and schema migrations.
* **Tier L6 — First-Principles Feynman Synthesis (Evaluation):**
  * *Objective:* Transfer the mental model to a junior engineer without using 3 common crutch buzzwords (e.g., explaining Eventual Consistency without saying *"eventually"*, *"async"*, or *"replicated"*).
  * *Verification Bar:* AI evaluates clarity, analogies, and causal explanation depth.
* **Tier L7 — High-Stakes Production Mastery (Apex Tier):**
  * *Objective:* Real-world high-load incident triage under SLA pressure.
  * *Verification Bar:* Sub-5-minute emergency mitigation runbook execution (traffic draining, circuit-breaker failover) followed by deterministic post-mortem root-cause derivation.

---

## 3. Two-Phase Active Retrieval Workflow

Active retrieval is executed inside a distraction-free, 2-phase modal:

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: BLIND RECALL (Occluded Mode)                       │
│  • Anti-Recognition Banner: All past notes occluded          │
│  • Stopwatch Timer & Live Word Counter                       │
│  • Blank Scratchpad: Operator types derivation from memory   │
│  • [AI Verify Recall ✨]: Real-time Socratic Rubric Audit    │
│  • Action: [Reveal Benchmark & Grade (Phase 2) ➔]             │
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

## 4. Mathematical Specifications: Spaced Repetition & Decay Modeling

The engine couples **discrete interval scheduling** with **continuous retention decay modeling**.

### 4.1 SuperMemo SM-2 Interval Calculation Engine (`sm2Algorithm.ts`)

When an operator submits a review grade $q \in \{1, 3, 4, 5\}$ (mapped from Forgot, Hard, Good, Easy):

#### 1. Ease Factor ($EF$) Update Formula:
$$\text{EF}' = \max\left(1.3, \, \text{EF} + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)\right)$$

* If rating is **Forgot ($q = 1$)**: $EF$ decreases by $0.20$ (subject is harder).
* If rating is **Hard ($q = 3$)**: $EF$ decreases by $0.14$.
* If rating is **Good ($q = 4$)**: $EF$ remains stable ($-0.00$).
* If rating is **Easy ($q = 5$)**: $EF$ increases by $+0.10$ (subject is easier).
* $EF$ is strictly bounded below by $1.30$.

#### 2. Repetition Sequence ($n$) & Interval ($I_n$) Days:
* If $q < 3$ (**Forgot**):
  $$\text{repetitionCount} = 0, \quad I = 1\text{ day}$$
* If $q \ge 3$:
  $$\text{repetitionCount} = n + 1$$
  $$I_n = \begin{cases} 
  1\text{ day} & \text{if } n = 0 \\
  6\text{ days} & \text{if } n = 1 \\
  \text{round}(I_{n-1} \times \text{EF}') & \text{if } n \ge 2 
  \end{cases}$$
  *(Note: For the 'Hard' rating, an immediate reinforcement interval of 2 days is applied).*

#### 3. Target Due Date Timestamp:
$$\text{nextDueDate} = \text{now}() + I \times 86{,}400{,}000\text{ ms}$$

---

### 4.2 Continuous Ebbinghaus Exponential Memory Decay Modeling

Retention percentage is not static; it decays continuously based on elapsed time:

$$R(t) = \exp\left(-\frac{t}{S}\right)$$

Where:
* $t$: Elapsed days since last active retrieval timestamp ($\text{now} - \text{lastReviewedDate}$).
* $S$: Memory stability score, calculated from the interval and ease factor:
  $$S = \max\left(1.0, \, I \times \frac{\text{EF}}{2.5}\right)$$
* **Memory Half-Life ($t_{1/2}$):**
  $$t_{1/2} = S \times \ln(2) \approx 0.69315 \times S$$
* **Normalized Retention Percentage:**
  $$\text{retentionPct} = \text{round}\left(\max\left(0, \, \min\left(100, \, R(t) \times 100\right)\right)\right)$$
* *Day 0 Rule:* If a topic has never been reviewed ($\text{reviewCount} = 0$), retention is strictly **0% (Unstarted Baseline)**.

---

## 5. Automated AI Orchestration (Gemini Pro/Flash Pipeline)

The system deploys 5 specialized AI vectors to enforce staff-level engineering rigor:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI CAPABILITY VECTORS                           │
├───────────────────────────────┬────────────────────────────────────────┤
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
│ Engine                        │ Milestone Project (Module 04) blockers.│
└───────────────────────────────┴────────────────────────────────────────┘
```

### Evaluation Prompt Schema (`server.ts` & `aiService.ts`):
```json
{
  "mode": "EVALUATE_ANSWER",
  "topic": "Raft Consensus Leader Election",
  "stage": "L2",
  "question": "Reconstruct the core mechanism, randomized timers, and split-vote mitigation.",
  "rubricPoints": [
    "Identifies randomized election timeout mechanism (150-300ms)",
    "Explains split-vote recovery invariants",
    "Zero buzzwords; first-principles causality"
  ],
  "answer": "<operator raw scratchpad submission>"
}
```

### Output Evaluation Payload:
```json
{
  "comprehensionScore": 88,
  "recommendedRating": "Good",
  "recommendedStage": "L3",
  "blindSpots": [
    "Did not specify term monotonicity update on receiving higher term RPC"
  ],
  "verifiedStrengths": [
    "Accurate articulation of split-vote resolution via randomized timeout window",
    "Correct heart-beat timing bounds"
  ],
  "feynmanCritique": "High conviction first-principles derivation. Excellent separation of state transition from network packet overhead.",
  "confidencePct": 92
}
```

---

## 6. Testing Baseline & Data Isolation Architecture

To ensure engineers can rigorously test their retention without phantom state contamination, the storage layer (`repository.ts`) implements **Three Baseline Modes**:

1. **Clean Zero Baseline (0% Retention, Day 0):**
   * Resets all topics to: `progress: 0`, `reviewCount: 0`, `repetitionCount: 0`, `lastReviewed: 'Never'`, `retentionState: 'DUE_TODAY'`, `intervalDays: 1`, `easeFactor: 2.5`.
   * Clears the historical `learningReviews` ledger.
   * Allows validating true SM-2 growth starting from 0 days.
2. **Empty Slate (0 Topics):**
   * Completely purges the `learningTopics` table.
   * Activates the Empty Slate welcoming card with custom topic creation and AI topic decomposition.
3. **Seed Demo Data (23 Topics):**
   * Restores curated engineering topics across Distributed Systems, AI Engineering, Database Internals, and Low-Latency Runtimes.

---

## 7. Current Technical Stack & File Map

* **`src/components/dashboard/LearningEngine.tsx`**: Primary presentation component (Two-phase modal, stage ladder, search filter, topic cards, and baseline controls).
* **`src/utils/sm2Algorithm.ts`**: Pure mathematical calculations (SM-2 intervals, Ebbinghaus decay formulas, SVG curve point generators, due date categorizer).
* **`src/services/aiService.ts`**: Client-side AI service orchestrating prompts and local heuristic fallbacks.
* **`server.ts`**: Express backend proxying Gemini API calls (`/api/ai/learning-exam`, `/api/ai/verify-evidence`, `/api/ai/decompose-learning-topic`).
* **`src/storage/repository.ts`**: LocalStorage persistence layer with schema preservation and clean-slate serialization.

---

## 8. Specific Audit Prompts for ChatGPT / System Auditor

When providing this document to ChatGPT or an external auditor, use the following structured prompt:

```text
Please conduct an adversarial software engineering, cognitive science, and UI/UX audit of this Learning & Retention Engine specification. Specifically address the following four vectors:

1. Algorithmic Fidelity & Spaced Repetition Upgrades:
   - Compare the current SuperMemo SM-2 implementation with modern alternatives (e.g., FSRS-4.5 / Free Spaced Repetition Scheduler). What edge cases exist in the current SM-2 implementation (e.g., ease factor hell, post-lapse interval resets)?
   - How can the continuous Ebbinghaus decay model be improved to reflect individual topic difficulty variance?

2. Cognitive Taxonomy & 7-Tier Rigor:
   - Are the L1–L7 Bloom tiers for software engineering fully distinct and measurable?
   - How can L4 (Diagnostic Triage) and L7 (Production Mastery) be made more realistic without requiring external cloud sandbox environments?

3. UX/UI Friction Points & Deliberate Practice:
   - How can the Two-Phase Active Retrieval modal minimize cognitive friction while maintaining strict anti-recognition discipline?
   - Suggest improvements for scratchpad input (e.g., embedded monaco code editor, ASCII architecture diagramming, vim keybindings, or voice Feynman recording).

4. Real-World Engineering Integration:
   - How can this engine better integrate with active software development (e.g., GitHub PR webhooks, git commit hooks, IDE extensions)?
   - How should cross-module project synergies be prioritized to accelerate active sprint velocity?
```
