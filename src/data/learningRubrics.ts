/**
 * PERSONAL OS // Learning & Retention Engine 2.0
 * Criterion-Based Assessment Rubric Registry.
 * 
 * Provides versioned rubrics, explicit scoring anchors (0-4), critical misconception rules,
 * diagnostic artifacts (L4), and benchmark solutions.
 */

import { AssessmentDefinition } from '../models/learningAssessmentTypes';

export const LEARNING_ASSESSMENT_REGISTRY: Record<string, AssessmentDefinition> = {
  // =========================================================================
  // TOPIC 1: AI ENGINEERING (lt-ai-eng)
  // =========================================================================
  'lt-ai-eng-L1': {
    id: 'eval-ai-eng-l1',
    competencyId: 'lt-ai-eng',
    topicTitle: 'AI Engineering: Primitives & Tokenization',
    targetLevel: 'L1',
    learningObjective: 'Reconstruct exact tokenization, embeddings, and context window primitives from raw memory.',
    assessmentPrompt:
      'Reconstruct from memory the foundational primitives of LLM inference: (1) Define tokenization vs character encoding, (2) State the mathematical structure of an embedding vector, and (3) Define context window limits and how KV-cache operates at the boundary.',
    referenceBenchmarkSolution:
      '1. Tokenization: Subword decomposition (e.g., BPE, Byte-fallback) mapping variable-length byte sequences into discrete integer token IDs in a fixed vocabulary $V$.\n2. Embedding Vector: A dense continuous vector $\\mathbf{e} \\in \\mathbb{R}^d$ looking up token ID in weight matrix $W_e \\in \\mathbb{R}^{|V| \\times d}$.\n3. Context Window & KV-Cache: The maximum token sequence length $L$ bounded by positional encoding limits. The KV-cache preserves key and value projection tensors across autoregressive generation steps to avoid $O(N^2)$ redundant re-computation of historical tokens.',
    criteria: [
      {
        id: 'token-primitive',
        name: 'Tokenization Subword Primitives',
        weight: 1.0,
        description: 'Distinguishes subword tokenization from naive characters/words with vocabulary mapping.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'No concept of subword tokenization or vocabulary indices.' },
          { score: 1, label: 'Fragmentary', description: 'Mentions words are converted to numbers without subword or vocab context.' },
          { score: 2, label: 'Partially Correct', description: 'Explains mapping tokens to integer IDs but omits subword mechanics or vocabulary sizing.' },
          { score: 3, label: 'Coherent', description: 'Accurately defines BPE/WordPiece subword decomposition into discrete vocabulary token IDs.' },
          { score: 4, label: 'Thorough & Precise', description: 'Exemplifies subword tokenization, vocabulary matrix lookup, and handling of out-of-vocabulary bytes.' },
        ],
      },
      {
        id: 'embedding-structure',
        name: 'Embedding Dimensional Structure',
        weight: 1.0,
        description: 'Mathematical formulation of embedding lookup and dense vector dimensionality.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Does not explain what an embedding vector is.' },
          { score: 1, label: 'Fragmentary', description: 'States embeddings are numbers representing meaning without dimensional structure.' },
          { score: 2, label: 'Partially Correct', description: 'Mentions dense vectors but omits matrix lookup or dimensionality.' },
          { score: 3, label: 'Coherent', description: 'Defines dense continuous vector lookup from an embedding matrix of dimension d.' },
          { score: 4, label: 'Thorough & Precise', description: 'Formulates lookup mapping token ID into dense embedding space R^d with normalization constraints.' },
        ],
      },
      {
        id: 'kv-cache-boundary',
        name: 'Context Window & KV-Cache Mechanism',
        weight: 1.5,
        description: 'Explains context limits and how KV-cache prevents redundant attention recalculation.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Omits context window constraints and KV cache.' },
          { score: 1, label: 'Fragmentary', description: 'Mentions context has a maximum token count.' },
          { score: 2, label: 'Partially Correct', description: 'Identifies context limit and mentions cache stores past tokens, but not keys/values.' },
          { score: 3, label: 'Coherent', description: 'Explains attention context ceiling and how caching key/value tensors avoids quadratic re-computation.' },
          { score: 4, label: 'Thorough & Precise', description: 'Derives O(N) autoregressive step cost with KV cache vs O(N^2) without, and explains memory footprint bounds.' },
        ],
      },
    ],
    criticalMisconceptions: [
      {
        id: 'cm-token-word',
        name: 'Tokens Are Direct Natural Words',
        description: 'Believing tokens are simply white-space separated words.',
        triggerCondition: 'Claims that 1 token equals 1 word or ignores subword byte splitting.',
        remediationAdvice: 'Tokens are subword byte fragments; common words are single tokens, while code or rare terms split into multiple sub-tokens.',
        isFatalToCompetence: false,
      },
    ],
    passingScorePct: 75,
    version: '2.0.0',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-09T00:00:00Z',
  },

  'lt-ai-eng-L2': {
    id: 'eval-ai-eng-l2',
    competencyId: 'lt-ai-eng',
    topicTitle: 'AI Engineering: LLM Inference Pipeline & Causal Mechanics',
    targetLevel: 'L2',
    learningObjective: 'Explain causal mechanics of the autoregressive loop, sampling temperature, and hallucination bounds.',
    assessmentPrompt:
      'Explain the causal mechanism of the LLM inference loop: (1) Trace execution from user prompt through softmax logits to token selection, (2) Explain mathematically how Temperature alters probability distribution, and (3) Contrast why hallucination is a structural consequence of probability sampling rather than a retrieval database error.',
    referenceBenchmarkSolution:
      '1. Forward Pass & Softmax: The token sequence is embedded, passed through multi-head self-attention and MLP layers. The unembedding projection yields unnormalized log-odds (logits $z_i$). Softmax normalizes logits into categorical probabilities: $P(w_i) = \\frac{\\exp(z_i / T)}{\\sum_j \\exp(z_j / T)}$.\n2. Temperature Scaling ($T$): For $T \\rightarrow 0$, distribution collapses into argmax greedy selection (deterministic peak). For $T > 1$, entropy increases as logit variance is smoothed, flattening the distribution.\n3. Structural Hallucination: Autoregressive models are conditional probability generators $P(x_t \\mid x_{<t})$, maximizing sequence likelihood, not factual verification. Plausible false tokens with high syntactic coherence naturally accumulate probability mass without semantic grounding truth checks.',
    criteria: [
      {
        id: 'forward-pass-causality',
        name: 'Inference Logits & Softmax Formulation',
        weight: 1.5,
        description: 'Traces prompt input through attention and unembedding to categorical probability distribution.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'No explanation of logits or softmax.' },
          { score: 1, label: 'Fragmentary', description: 'Mentions model scores words and picks one.' },
          { score: 2, label: 'Partially Correct', description: 'Mentions softmax converts scores to percentages but misses logits or unembedding layer.' },
          { score: 3, label: 'Coherent', description: 'Accurately details transformation from hidden states through logits to softmax probability distribution.' },
          { score: 4, label: 'Thorough & Precise', description: 'Provides mathematical softmax formula, unembedding projection, and categorical sampling mechanics.' },
        ],
      },
      {
        id: 'temperature-entropy',
        name: 'Temperature Scaling & Distribution Entropy',
        weight: 1.5,
        description: 'Explains mathematical scaling of logits by temperature and entropy shifts.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Omits temperature or gives colloquial definition of creativity.' },
          { score: 1, label: 'Fragmentary', description: 'Only states higher temperature means more random or creative.' },
          { score: 2, label: 'Partially Correct', description: 'Mentions temperature divides scores but does not explain how entropy or probabilities change.' },
          { score: 3, label: 'Coherent', description: 'Shows that dividing logits by T flattens distribution for T>1 and sharpens towards greedy argmax for T->0.' },
          { score: 4, label: 'Thorough & Precise', description: 'Derives entropy behavior, limits as T approaches 0 and infinity, and top-p/top-k filtering interaction.' },
        ],
      },
      {
        id: 'hallucination-structural',
        name: 'Structural Nature of Hallucination',
        weight: 1.0,
        description: 'Argues hallucination from next-token statistical likelihood rather than database error.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Claims model just forgets or makes simple lookup errors.' },
          { score: 1, label: 'Fragmentary', description: 'States model hallucinates because training data had errors.' },
          { score: 2, label: 'Partially Correct', description: 'Identifies prediction is statistical, but lacks causal link to sequence likelihood.' },
          { score: 3, label: 'Coherent', description: 'Explains hallucination is structurally inherent to maximizing likelihood without an external truth oracle.' },
          { score: 4, label: 'Thorough & Precise', description: 'Contrasts generative conditional probability P(token | context) with relational truth invariants, explaining compounding error drift.' },
        ],
      },
    ],
    criticalMisconceptions: [
      {
        id: 'cm-temp-accuracy',
        name: 'Temperature Controls Factual Accuracy',
        description: 'Believing that temperature = 0 guarantees factual correctness.',
        triggerCondition: 'Claims temperature 0 guarantees truth or eliminates hallucination completely.',
        remediationAdvice: 'Temperature 0 only guarantees determinism (greedy argmax). An inaccurate premise will reliably produce deterministic false statements.',
        isFatalToCompetence: true,
      },
      {
        id: 'cm-db-lookup',
        name: 'LLMs Store Knowledge As Relational Database Rows',
        description: 'Believing the model retrieves facts by looking up database records internally.',
        triggerCondition: 'States that the model queries its internal database for facts.',
        remediationAdvice: 'Parameters represent continuous statistical weights, not discrete indexed database records.',
        isFatalToCompetence: false,
      },
    ],
    passingScorePct: 75,
    version: '2.0.0',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-09T00:00:00Z',
  },

  'lt-ai-eng-L4': {
    id: 'eval-ai-eng-l4',
    competencyId: 'lt-ai-eng',
    topicTitle: 'AI Engineering: Production Diagnostic Triage (Adversarial)',
    targetLevel: 'L4',
    learningObjective: 'Isolate root cause and provide sub-90s mitigation for an active streaming inference failure.',
    assessmentPrompt:
      'DIAGNOSTIC INCIDENT TRIAGE: Review the production log stream and metrics below. (1) Isolate the exact root cause of the sudden latency spike and client connection drops, (2) Specify the immediate mitigation command, and (3) Define the architectural invariant required to prevent recurrence.',
    timeLimitSeconds: 90,
    diagnosticArtifacts: [
      {
        type: 'LOG_STREAM',
        title: 'Production Gateway Logs (api-gateway-04)',
        content: `[2026-10-09T10:14:02.112Z] WARN  proxy: Upstream connection timeout after 30000ms [route: /api/generate-stream]
[2026-10-09T10:14:02.115Z] ERROR proxy: HTTP 504 Gateway Timeout downstream_ip=192.168.1.42
[2026-10-09T10:14:02.118Z] INFO  llm-worker-08: Model inference active, batch_size=64, kv_cache_mem_bytes=34359738368
[2026-10-09T10:14:02.122Z] WARN  llm-worker-08: GPU memory allocation exceeded 96% VRAM, swapping KV cache pages to CPU host memory
[2026-10-09T10:14:02.240Z] ERROR llm-worker-08: CUDA_OUT_OF_MEMORY: tried to allocate 512MiB (GPU 0; 80.00 GiB total capacity; 79.48 GiB already allocated)
[2026-10-09T10:14:02.245Z] CRIT  llm-worker-08: vLLM PagedAttention engine worker terminated abruptly with SIGABRT`,
      },
      {
        type: 'INCIDENT_TIMELINE',
        title: 'Latency & Queue Depth Metrics',
        content: `T-10m: P99 Latency = 420ms, Active Sessions = 1,200, GPU VRAM = 72%
T-05m: P99 Latency = 1,840ms, Active Sessions = 2,400 (Flash Sale Traffic Burst)
T-01m: P99 Latency = 31,000ms (Cliff), Gateway 504 Spikes to 45%
T-00m: 4 GPU Workers SIGABRT (OOM Killer)`,
      },
    ],
    referenceBenchmarkSolution:
      '1. Root Cause: KV-Cache exhaustion under sudden concurrency surge. Concurrency doubled to 2,400 sessions, causing dynamic KV cache allocation to saturate 80GB VRAM. Worker attempted CPU paging before triggering unhandled CUDA OOM in PagedAttention engine.\n2. Immediate Mitigation: Drain and circuit-break upstream gateway traffic (HTTP 429 backpressure), drop unbounded max_tokens limits, and restart worker pool with --max-num-seqs capped at 1,500 and --gpu-memory-utilization 0.90.\n3. Long-Term Invariant: Implement admission control with token-bucket reservation based on remaining VRAM slots rather than accepting unbounded concurrent streaming handshakes.',
    criteria: [
      {
        id: 'triage-root-cause',
        name: 'Root Cause Isolation',
        weight: 1.5,
        description: 'Pinpoints KV cache VRAM exhaustion during concurrent burst over generic OOM.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Fails to identify cause or blames network connection.' },
          { score: 1, label: 'Fragmentary', description: 'Identifies memory was full without recognizing KV-cache dynamic sizing.' },
          { score: 2, label: 'Partially Correct', description: 'Identifies GPU OOM but misses the impact of session concurrency on PagedAttention allocation.' },
          { score: 3, label: 'Coherent', description: 'Accurately isolates KV-cache memory saturation caused by traffic spike exceeding VRAM capacity.' },
          { score: 4, label: 'Thorough & Precise', description: 'Traces root cause from session influx through PagedAttention dynamic allocation, host swapping latency, and CUDA OOM crash.' },
        ],
      },
      {
        id: 'immediate-mitigation',
        name: 'Immediate Sub-90s Mitigation',
        weight: 1.5,
        description: 'Proposes actionable traffic shedding/backpressure and engine bounds.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'No immediate mitigation or proposes long-term refactor.' },
          { score: 1, label: 'Fragmentary', description: 'Suggests restarting servers without traffic limiting.' },
          { score: 2, label: 'Partially Correct', description: 'Suggests rate limiting but leaves crash loop active without concurrency capping.' },
          { score: 3, label: 'Coherent', description: 'Specifies upstream 429 backpressure / queue shedding and worker restart with lower sequence limits.' },
          { score: 4, label: 'Thorough & Precise', description: 'Delivers executable commands: gateway rate limiting, sequence cap tuning (--max-num-seqs), and KV memory threshold guardrails.' },
        ],
      },
      {
        id: 'architectural-invariant',
        name: 'Preventative Invariant Contract',
        weight: 1.0,
        description: 'Establishes admission control based on VRAM capacity invariants.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'No preventative invariant defined.' },
          { score: 1, label: 'Fragmentary', description: 'Suggests buying bigger GPUs.' },
          { score: 2, label: 'Partially Correct', description: 'Proposes auto-scaling without admission control bounds.' },
          { score: 3, label: 'Coherent', description: 'Establishes admission control that rejects requests when KV cache reaches safe threshold.' },
          { score: 4, label: 'Thorough & Precise', description: 'Defines formal token-bucket admission invariant: max active context length strictly bounded to provable physical VRAM pages.' },
        ],
      },
    ],
    criticalMisconceptions: [
      {
        id: 'cm-restart-only',
        name: 'Restart-Only Mitigation',
        description: 'Believing simple service restart will resolve a traffic-driven memory cliff.',
        triggerCondition: 'Proposes only restarting workers without rate limiting or concurrency backpressure.',
        remediationAdvice: 'Restarting without upstream backpressure causes immediate recurrence of the crash loop as buffered requests flood the fresh workers.',
        isFatalToCompetence: true,
      },
    ],
    passingScorePct: 75,
    version: '2.0.0',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-09T00:00:00Z',
  },

  // =========================================================================
  // TOPIC 2: DISTRIBUTED SYSTEMS / RAFT CONSENSUS (lt-dist-sys)
  // =========================================================================
  'lt-dist-sys-L1': {
    id: 'eval-dist-sys-l1',
    competencyId: 'lt-dist-sys',
    topicTitle: 'Distributed Systems: Raft Node States & RPC Primitives',
    targetLevel: 'L1',
    learningObjective: 'Reconstruct the three Raft node states, term semantics, and RPC payloads from memory.',
    assessmentPrompt:
      'Reconstruct from raw memory without references: (1) The 3 states of a Raft node and their valid transitions, (2) The fields inside an AppendEntries RPC and RequestVote RPC, and (3) The leader election timeout invariants.',
    referenceBenchmarkSolution:
      '1. States: Follower, Candidate, Leader. Follower -> Candidate (on election timeout). Candidate -> Leader (upon receiving votes from majority of cluster). Candidate -> Follower (discovers current leader or higher term). Leader -> Follower (discovers peer with higher term).\n2. RPCs:\n- AppendEntries: { term, leaderId, prevLogIndex, prevLogTerm, entries[], leaderCommit }\n- RequestVote: { term, candidateId, lastLogIndex, lastLogTerm }\n3. Election Timeout: Randomized window (typically 150ms-300ms) to prevent split-vote deadlocks where split candidates split votes equally.',
    criteria: [
      {
        id: 'node-states',
        name: 'Node State Transitions',
        weight: 1.0,
        description: 'Defines all three states and transition triggers.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Does not name Follower, Candidate, Leader.' },
          { score: 1, label: 'Fragmentary', description: 'Names states but misses transition triggers.' },
          { score: 2, label: 'Partially Correct', description: 'Explains transitions but misses candidate stepping down upon higher term.' },
          { score: 3, label: 'Coherent', description: 'Accurately defines all states and valid transitions including term discovery.' },
          { score: 4, label: 'Thorough & Precise', description: 'Exhaustively details all state machines, heartbeat reset triggers, and term monotonicity.' },
        ],
      },
      {
        id: 'rpc-signatures',
        name: 'RPC Field Signatures',
        weight: 1.5,
        description: 'Recalls exact fields for AppendEntries and RequestVote RPCs.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'No RPC structure recalled.' },
          { score: 1, label: 'Fragmentary', description: 'Mentions sends data and votes.' },
          { score: 2, label: 'Partially Correct', description: 'Names term and entries but omits prevLogIndex and prevLogTerm invariants.' },
          { score: 3, label: 'Coherent', description: 'Correctly specifies term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit.' },
          { score: 4, label: 'Thorough & Precise', description: 'Provides exact fields for both RPCs and explains why prevLogIndex/Term enforces log matching property.' },
        ],
      },
      {
        id: 'randomized-timers',
        name: 'Randomized Election Timeouts',
        weight: 1.0,
        description: 'Explains the randomized timeout window mechanism against split votes.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Omits election timeout.' },
          { score: 1, label: 'Fragmentary', description: 'Mentions timer runs out.' },
          { score: 2, label: 'Partially Correct', description: 'Mentions timeout starts election but forgets randomization.' },
          { score: 3, label: 'Coherent', description: 'Explains randomized timer window (150-300ms) prevents split-vote cycles.' },
          { score: 4, label: 'Thorough & Precise', description: 'Derives probability bounds of split vote resolution across terms via randomized intervals.' },
        ],
      },
    ],
    criticalMisconceptions: [
      {
        id: 'cm-fixed-timer',
        name: 'Fixed Election Timeout',
        description: 'Assuming election timeouts are synchronized or fixed across nodes.',
        triggerCondition: 'States that all nodes share identical fixed timeout interval.',
        remediationAdvice: 'Fixed timeouts cause simultaneous elections where nodes vote for themselves and split votes indefinitely.',
        isFatalToCompetence: false,
      },
    ],
    passingScorePct: 75,
    version: '2.0.0',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-09T00:00:00Z',
  },

  'lt-dist-sys-L2': {
    id: 'eval-dist-sys-l2',
    competencyId: 'lt-dist-sys',
    topicTitle: 'Distributed Systems: Log Replication & Safety Invariants',
    targetLevel: 'L2',
    learningObjective: 'Explain why Raft guarantees safety during network partitions and uncommitted log overwrites.',
    assessmentPrompt:
      'Explain the causal safety mechanics of Raft: (1) How does the Leader Completeness property ensure that committed entries are never lost? (2) Explain what happens when a network partition creates an isolated minority leader and a majority partition. What happens when the network heals?',
    referenceBenchmarkSolution:
      '1. Leader Completeness Invariant: A candidate can only be elected if its log is at least as up-to-date as any majority member (RequestVote checks lastLogTerm > peerTerm, or if equal, lastLogIndex >= peerIndex). Since any committed entry is present on a majority of nodes, any elected leader must contain all committed entries.\n2. Partition & Reconciliation: The minority leader accepts writes from partitioned clients but cannot replicate to a quorum (no AppendEntries ack from majority), so entries remain uncommitted. The majority partition elects a new leader with a higher term and commits writes. Upon network healing, the stale minority leader receives an AppendEntries with a higher term, steps down to Follower, and overwrites its uncommitted log suffix matching the true leader.',
    criteria: [
      {
        id: 'leader-completeness',
        name: 'Leader Completeness Invariant Derivation',
        weight: 1.5,
        description: 'Derives why election rules prevent electing a leader lacking committed entries.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Does not explain how election voting guarantees committed safety.' },
          { score: 1, label: 'Fragmentary', description: 'Says leaders must have all data without explaining voting rule.' },
          { score: 2, label: 'Partially Correct', description: 'Mentions voting requires majority but omits log up-to-date comparison check.' },
          { score: 3, label: 'Coherent', description: 'Derives that candidate log comparison rule ensures intersection with majority containing committed entries.' },
          { score: 4, label: 'Thorough & Precise', description: 'Mathematically proves intersection between quorum of voters and quorum of committed replicas, guaranteeing leader completeness.' },
        ],
      },
      {
        id: 'partition-healing',
        name: 'Network Partition Dynamics & Reconciliation',
        weight: 1.5,
        description: 'Traces minority uncommitted state, majority progress, and log overwrite reconciliation.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Incorrectly claims two leaders will permanently split data.' },
          { score: 1, label: 'Fragmentary', description: 'States minority leader fails without explaining log status.' },
          { score: 2, label: 'Partially Correct', description: 'Identifies uncommitted writes but does not explain log rollback upon healing.' },
          { score: 3, label: 'Coherent', description: 'Traces minority leader failure to commit, majority leader election, and log suffix rollback when term advances.' },
          { score: 4, label: 'Thorough & Precise', description: 'Exemplifies exact log index overwrites, term stepping down, and client error handling for uncommitted minority writes.' },
        ],
      },
    ],
    criticalMisconceptions: [
      {
        id: 'cm-minority-commit',
        name: 'Minority Leader Commits Entries',
        description: 'Believing an isolated leader in a minority partition can commit entries to disk safely.',
        triggerCondition: 'Claims minority leader commits writes or creates permanent split-brain committed records.',
        remediationAdvice: 'A leader can only commit an entry once it receives positive acknowledgments from a strict majority ($N/2 + 1$). An isolated minority leader can never commit.',
        isFatalToCompetence: true,
      },
    ],
    passingScorePct: 75,
    version: '2.0.0',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-09T00:00:00Z',
  },
};

/**
 * Helper to fetch a registered assessment or build a dynamic fallback specification.
 */
export function getAssessmentForTopic(
  topicId: string,
  level: string,
  topicTitle: string
): AssessmentDefinition {
  const key = `${topicId}-${level}`;
  if (LEARNING_ASSESSMENT_REGISTRY[key]) {
    return LEARNING_ASSESSMENT_REGISTRY[key];
  }

  // Dynamic calibrated fallback
  return {
    id: `eval-${topicId}-${level.toLowerCase()}`,
    competencyId: topicId,
    topicTitle: `${topicTitle} (${level})`,
    targetLevel: (level as any) || 'L1',
    learningObjective: `Demonstrate ${level} mastery of ${topicTitle} from first principles.`,
    assessmentPrompt:
      level === 'L1'
        ? `Reconstruct the core primitives, exact syntax structures, and boundary definitions of ${topicTitle} from raw memory without reference notes.`
        : level === 'L2'
        ? `Explain the underlying causal mechanism of ${topicTitle}. Detail why it works, what trade-offs it makes, and where its failure bounds lie.`
        : level === 'L3'
        ? `Provide an idiomatic code implementation and verification test suite for ${topicTitle} solving a canonical engineering challenge.`
        : level === 'L4'
        ? `DIAGNOSTIC TRIAGE: Isolate the root cause of an anomalous symptom or performance cliff in ${topicTitle} under 90s time pressure.`
        : level === 'L5'
        ? `Design an end-to-end resilient system architecture incorporating ${topicTitle} with zero-downtime invariants.`
        : level === 'L6'
        ? `Explain ${topicTitle} to a junior engineer from first principles without using crutch buzzwords.`
        : `Execute sub-5-minute emergency triage runbook and root-cause mitigation for a production load failure in ${topicTitle}.`,
    referenceBenchmarkSolution:
      `Benchmark solution for ${topicTitle} (${level}): Complete first-principles derivation articulating core mechanical invariants, resource limits, and error handling contracts.`,
    criteria: [
      {
        id: 'crit-primitives',
        name: 'First-Principles Mechanical Correctness',
        weight: 1.5,
        description: 'Accurately formulates core causal mechanisms over superficial terminology.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Absent or fundamentally incorrect.' },
          { score: 1, label: 'Fragmentary', description: 'Fragmentary concepts with severe gaps.' },
          { score: 2, label: 'Partially Correct', description: 'Partially correct with missing edge cases.' },
          { score: 3, label: 'Coherent', description: 'Coherent, correct technical explanation.' },
          { score: 4, label: 'Thorough & Precise', description: 'Exhaustive, rigorous first-principles derivation.' },
        ],
      },
      {
        id: 'crit-boundaries',
        name: 'Boundary Conditions & Failure Modes',
        weight: 1.0,
        description: 'Identifies resource constraints, race conditions, and boundary behavior.',
        scoringAnchors: [
          { score: 0, label: 'Absent', description: 'Omits boundary limits and failure modes.' },
          { score: 1, label: 'Fragmentary', description: 'Mentions vague failure possibility.' },
          { score: 2, label: 'Partially Correct', description: 'Identifies some constraints but misses key edge cases.' },
          { score: 3, label: 'Coherent', description: 'Correctly identifies non-obvious failure modes.' },
          { score: 4, label: 'Thorough & Precise', description: 'Thoroughly derives boundary behavior under high load or partitions.' },
        ],
      },
    ],
    criticalMisconceptions: [],
    passingScorePct: 75,
    version: '2.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
