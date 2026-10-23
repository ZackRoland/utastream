# ADR-0006: Use Governed AI Agents for Alternate-Build Evaluations

- **Status:** Proposed
- **Date:** 2026-10-23
- **Decision owners:** Zack Roland
- **Related documents:** [ADR-0003](./0003-use-cost-aware-evolutionary-infrastructure.md), [ADR-0004](./0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md), [ADR-0005](./0005-generate-typescript-api-contracts-from-openapi.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream wants evidence when comparing materially different implementation
approaches without paying the labor cost of building several production
applications. AI coding agents can implement independent, bounded spikes in
parallel and report evidence. They can also introduce bias: candidates may
receive different scope, optimize for different tests, edit shared files,
self-score generously, or produce polished demos whose operational weaknesses
are not visible.

The project has selected React/Vite/TypeScript, FastAPI/Python, and PostgreSQL as
its proposed baseline in ADR-0004. Alternate builds are not substitutes for
first proving that baseline. A real baseline supplies the acceptance tests,
developer experience, measurements, and architectural constraints against which
alternatives can be compared.

This decision establishes how AI agents may be used for the initial stack
comparison and for future architecture experiments while preserving human
ownership of decisions.

## Decision Drivers

- Compare independent approaches without maintaining multiple production apps.
- Freeze scope and scoring before agents see or implement candidates.
- Collect reproducible evidence rather than relying on persuasive summaries.
- Prevent shared-workspace conflicts and contamination of production code.
- Include AI token/compute use in the cost of an experiment.
- Preserve human review, testing, and final architectural authority.
- Make unsuccessful spikes disposable and successful findings transferable.
- Reuse the governance model for future bounded technical evaluations.

## Decision

UtaStream may use coordinated AI coding agents for independent alternate-build
spikes and technical evaluations under a frozen specification and scoring
rubric. Agents advise and implement experiments; they do not accept ADRs, merge
production changes, alter the rubric, or make final architecture decisions.

### Execution gate

The initial alternate-build agents must not be launched until all of the
following are true:

1. ADR-0004 has been reviewed and accepted.
2. ADR-0005 has been reviewed and accepted or explicitly deferred with an
   alternative contract policy.
3. The baseline walking skeleton runs locally and passes its required tests.
4. The owner has reviewed the frozen alternate-build specification and scoring
   weights.
5. Each candidate has an isolated directory or worktree and explicit write
   boundaries.

### Initial evaluation campaign

The baseline React/FastAPI implementation is the reference and will not be
rebuilt by an alternate-stack agent merely for symmetry. Initial agent work may
include:

1. **React/Vite + Fastify + PostgreSQL** — strongest unified-TypeScript
   alternative.
2. **Next.js + PostgreSQL** — materially different full-stack application
   shape, with a separate worker where required.
3. **NestJS feasibility spike** — smaller implementation or documented module
   comparison unless the owner approves a full third build.

Direct browser-to-backend-as-a-service access will be evaluated as an
infrastructure pattern, not assumed to deserve a full duplicate application.
Candidate scope may be amended by the owner before execution but must remain
fixed during a campaign unless all affected results are invalidated and rerun.

### Shared acceptance scenario

Every full alternate build must demonstrate the same behavior:

1. Report health and readiness.
2. Load one permitted seeded track and timed lyric document.
3. Return track and lyric data through the application API boundary.
4. Save one expression for a test user and retrieve the saved result.
5. Submit one fixture-backed processing job.
6. Process the job outside the interactive API request and persist its status.
7. Preserve data and accepted work across application restart.
8. Reject invalid input through a consistent error contract.
9. Emit structured logs with request and job identifiers.
10. Run locally with PostgreSQL and no paid service or cloud account.
11. Pass externally owned contract and browser tests.

The UI should be reused or kept intentionally minimal. The evaluation measures
architecture and developer experience, not visual-design output.

### Agent roles

- **Coordinator:** freezes inputs, assigns isolated targets, monitors scope,
  runs shared verification, collects evidence, and presents results.
- **Implementation agent:** builds one candidate within its assigned target and
  reports commands, dependencies, failures, and deviations. It does not score
  itself.
- **Independent evaluator:** reads all completed candidates and raw evidence,
  applies the frozen rubric, explains uncertainty, and identifies invalid
  comparisons. It does not modify implementations.
- **Human decision owner:** reviews the runnable demos, evidence, evaluator
  report, and recommendation; accepts, rejects, or requests more evidence.

One agent must not implement multiple competing candidates in the same campaign
unless resource limits require sequential work and the owner accepts the
increased bias risk.

### Isolation and mutation rules

- Candidate implementations use separate directories or git worktrees.
- Agents may read the frozen specification, baseline contracts, fixtures, and
  tests but may not edit them.
- Agents may not edit production baseline code unless given a separate,
  explicitly approved task after the comparison.
- Secrets and paid credentials are not provided to benchmark agents.
- Dependency installation and network access follow the same approval policy
  for every candidate.
- Generated artifacts and caches are excluded from authored-line comparisons.
- A candidate that cannot meet a requirement records the failure; it does not
  silently narrow scope.

### Frozen scoring rubric

The initial rubric totals 100 points:

| Criterion | Weight | Evidence |
| --- | ---: | --- |
| Maintainability and comprehensibility | 20 | Module boundaries, code review, documentation, complexity, and owner walkthrough |
| Local-development simplicity | 15 | Clean bootstrap, required tools/services, commands, startup reliability, and recovery |
| Fit with ADR-0002 architecture | 15 | Modular-monolith boundaries, separate worker, state ownership, and provider ports |
| Portability and upgrade path | 15 | Standard protocols, provider coupling, data export, ordinary process/container support |
| Background-processing reliability | 10 | Durability, idempotency, retry, recovery, concurrency limits, and observability |
| Testing and contract quality | 10 | External acceptance results, unit/integration seams, deterministic fixtures, and failure tests |
| Dependency and operational burden | 10 | Production dependencies, deployed components, credentials, maintenance, and likely cost drivers |
| Representative performance | 5 | Repeatable latency, memory, database connections, and throughput under the same workload |

Performance has a limited weight because all viable candidates should meet the
initial scale envelope. A synthetic benchmark advantage cannot compensate for
poor portability or maintainability.

The human owner may change weights before a campaign begins. Weight changes
after results are known require documenting the reason and presenting both the
original and revised scores.

### Required raw evidence

The coordinator must collect, where practical:

- Clean setup and teardown commands.
- Required runtimes and local services.
- Direct and transitive production dependency counts.
- Lockfiles and reproducibility results.
- Authored versus generated code volume, treated as context rather than a
  quality score.
- Build, test, startup, and restart results.
- Idle resource use and representative request measurements.
- Database connections and migration behavior.
- Job retry, crash, and abandoned-claim behavior.
- Contract and browser-test results.
- Framework-specific APIs and provider coupling.
- Known deviations, manual interventions, and unresolved failures.
- Agent model/configuration, prompt/specification revision, elapsed time, and
  available usage or cost information.

Measurements must be labeled when environment noise, warm caches, or unequal
tooling prevents a fair comparison.

### Initial and future uses

After the initial alternate-stack comparison, governed agents may be used for:

- Bounded provider-adapter comparisons.
- Database or queue feasibility spikes.
- Independent code, accessibility, security, or migration reviews.
- Alternative algorithm and data-model experiments.
- Reproduction of performance or reliability hypotheses.
- Independent test-suite implementation where tests do not encode a preferred
  candidate's internals.

Agents should not be the default for short tasks, tightly sequential work, or
concurrent edits to the same mutable code. They must not make final legal,
privacy, security, licensing, financial, or architectural decisions.

### What this means in practice

- Agent output is evidence, not authority.
- The baseline is built and understood before it is benchmarked against
  alternatives.
- Failed spikes are valid results when the failure is documented faithfully.
- The evaluator can recommend “insufficient evidence” rather than forcing a
  winner.
- A winning spike is not merged automatically; useful ideas are deliberately
  ported or a new adoption plan is approved.
- Token usage, elapsed time, and review burden are part of experiment cost.

### What this decision does not mean

- Every architectural decision requires multiple implementations.
- Agents may expand product scope to make their candidate appear stronger.
- Numerical scores replace judgment or hands-on owner review.
- Generated code is production-ready because tests pass.
- Agent parallelism is free or always faster.
- The project is committed to a permanent agent vendor, model, or hosted
  environment.

## Considered Options

### Option 1: Governed parallel agents with independent evaluation — chosen

**Advantages**

- Reduces wall-clock time for genuinely independent implementations.
- Gives each candidate focused context.
- Produces runnable evidence rather than documentation-only comparisons.
- Creates an auditable process reusable for future experiments.

**Disadvantages**

- Increases token usage, dependency downloads, disk use, and review burden.
- Agents can still make correlated mistakes or optimize to visible tests.
- Shared environments require explicit write isolation.
- Human verification remains necessary.

### Option 2: One agent implements every candidate sequentially

**Advantages**

- Simpler orchestration and fewer concurrent conflicts.
- One agent retains complete comparison context.

**Disadvantages**

- Later candidates may receive learned advantages.
- One agent's preferences and mistakes affect every implementation.
- Longer wall-clock time and less contextual independence.

### Option 3: Documentation-only comparison

**Advantages**

- Lowest implementation and token cost.
- Useful for eliminating clearly unsuitable options.

**Disadvantages**

- Does not reveal setup friction, integration failures, or actual testing and
  worker behavior.
- Encourages decisions based on marketing and familiarity.

Documentation review remains the first filter; agents are reserved for the few
options that remain materially plausible.

### Option 4: Build all alternatives manually

**Advantages**

- Maximizes direct owner experience with each stack.
- Avoids agent-generated implementation variability.

**Disadvantages**

- Highest time cost and delays the actual product.
- Creates several disposable systems for one architectural decision.

The owner should still run, inspect, and modify the finalists rather than
delegating all learning to agents.

## Rationale

Independent stack spikes are concrete, separable workstreams, which is where
multi-agent execution is most useful. The process is unsafe without frozen
requirements, filesystem isolation, external tests, independent evaluation,
and human authority. Delaying the campaign until the baseline is accepted and
working prevents agents from benchmarking against an imagined reference.

## Consequences

### Positive

- UtaStream gains a repeatable way to investigate alternatives without turning
  every option into maintained production code.
- Scoring criteria are known before implementation outcomes.
- Evidence, failures, and costs are retained for future decisions.
- Human review and ADR governance remain authoritative.

### Negative

- The comparison framework itself requires preparation and maintenance.
- AI usage and independent review add cost.
- Agents may produce superficially different but structurally correlated work.
- Candidate repositories and dependencies consume temporary workspace storage.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Agents optimize to tests instead of architecture | Medium | High | Include qualitative review, failure scenarios, dependency evidence, and owner walkthrough. |
| Candidates edit shared specification or tests | Medium | High | Read-only shared inputs, isolated targets, and coordinator diff review. |
| Self-scoring introduces bias | High | Medium | Implementation agents report evidence only; an independent evaluator applies the rubric. |
| Cached installs distort timing | High | Low | Label warm/cold state and avoid overweighting timing. |
| A polished spike is merged prematurely | Medium | High | Require a separate adoption decision and production hardening plan. |
| Agent costs exceed experiment value | Medium | Medium | Filter candidates through documentation first and cap campaign scope. |
| Shared mistakes survive across agents | Medium | High | External tests, independent evaluation, owner inspection, and targeted non-agent verification. |

## Adoption Plan

1. Review and accept or amend this ADR without launching agents.
2. Accept and implement ADR-0004 and ADR-0005 sufficiently to establish the
   reference baseline.
3. Write and review the frozen acceptance specification, fixtures, commands,
   and scoring worksheet.
4. Select the exact candidate list and approve experiment scope and usage cost.
5. Prepare isolated directories or worktrees plus externally owned tests.
6. Launch implementation agents with identical constraints.
7. Run coordinator verification and collect raw evidence.
8. Run an independent read-only evaluator against all candidates.
9. Let the owner operate and inspect the demos.
10. Record the decision in a new ADR or amendment; do not silently replace the
    accepted baseline.
11. Archive or remove rejected spikes after preserving reports and reusable
    findings.

## Validation

This decision is working when:

- Agents cannot mutate the frozen rubric or another candidate.
- Every full candidate receives and passes or explicitly fails the same tests.
- Raw evidence can be reproduced without reading agent narratives.
- Scores cite concrete evidence and disclose uncertainty.
- The owner can run each finalist and explain why the final choice was made.
- No alternate build reaches production without a separate human-approved
  adoption step.
- The value of the evidence justifies agent usage and review cost.

## Revisit Triggers

Reconsider this decision if:

- Agents repeatedly produce incomparable implementations despite frozen scope.
- Experiment cost exceeds the value of the decisions informed.
- Shared-environment isolation cannot be enforced reliably.
- Model or agent-tool availability changes materially.
- The baseline evolves so far that the acceptance scenario no longer represents
  the product.
- Human reviewers cannot reproduce or understand the reported results.

## References

- [OpenAI multi-agent documentation](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)
- [ADR-0003](./0003-use-cost-aware-evolutionary-infrastructure.md)
- [ADR-0004](./0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md)
- [ADR-0005](./0005-generate-typescript-api-contracts-from-openapi.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-23 | Initial proposal defining baseline-gated alternate builds and governed future agent use | Codex with Zack Roland |
