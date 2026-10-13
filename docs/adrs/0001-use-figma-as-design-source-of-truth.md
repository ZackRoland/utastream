# ADR-0001: Use Figma as the Design Source of Truth

- **Status:** Accepted
- **Date:** 2026-10-12
- **Decision owners:** Zack Roland
- **Related documents:** [UtaStream Project Manifesto](./manifesto-v1.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream is intended to feel like a polished music player whose language-
learning capabilities are integral but do not obstruct listening. Achieving
that balance requires more than styling individual pages during implementation.
The project needs a place to define and evaluate its visual identity, user
flows, responsive behavior, interaction states, reusable components, and the
transition between listening and learning.

Design decisions currently risk being made ad hoc in application code. A
code-only process makes it harder to compare alternatives, validate a complete
flow before implementation, communicate design intent, or preserve a coherent
system as the application grows. Generative tools can accelerate exploration,
but their outputs do not by themselves provide a durable and inspectable design
system.

The project therefore needs a primary design workspace that supports early
exploration, structured UI design, prototyping, design-system maintenance, and
eventual design-to-development handoff. The chosen workflow should also build
transferable product-design skills rather than making the project dependent on
prompt-generated mockups.

## Decision Drivers

- Maintain a coherent visual and interaction language across the application.
- Design and test the listening-to-learning experience before committing to
  implementation details.
- Support reusable components, variants, layout rules, and design tokens.
- Represent interaction states and user flows, not only static screenshots.
- Provide a practical bridge between product design and application code.
- Enable fast AI-assisted exploration without giving up manual control.
- Use tooling and practices that provide broadly transferable professional
  experience.
- Keep decisions accessible and understandable to future contributors.

## Decision

UtaStream will use **Figma as the source of truth for product-design intent**.
The canonical Figma workspace will contain the approved user flows, screen
layouts, visual foundations, reusable components, component states, and
interactive prototypes used to guide implementation.

The application repository remains the source of truth for production code,
runtime behavior, persisted data, business rules, and shipped accessibility.
If implementation and Figma disagree, the difference is design drift that must
be reviewed and intentionally resolved. Neither artifact silently overrides the
other.

### What Figma owns

- Product flows and information architecture
- Approved low- and high-fidelity screen designs
- Color, typography, spacing, elevation, and motion foundations
- Reusable UI components and their visual states
- Responsive design intent and representative breakpoints
- Interactive prototypes used for design review and usability testing
- Annotations needed to explain behavior that a static frame cannot express

### What the repository owns

- Executable application behavior and business rules
- Production component APIs and internal architecture
- Responsive behavior between documented representative states
- Accessibility semantics and assistive-technology behavior
- Performance, error handling, data flow, and security
- Automated tests and the definition of what is currently shipped

### What this means in practice

- Important user-facing features should have an approved flow or design in
  Figma before their visual implementation is considered complete.
- Repeated visual values should be represented as named variables or styles
  rather than copied as unexplained values.
- Repeated interface patterns should become reusable Figma components with
  meaningful variants and states.
- Designs should include relevant empty, loading, error, disabled, focused,
  selected, and overflow states rather than only ideal content.
- Designers and implementers should use shared terminology for tokens,
  components, and interaction states where practical.
- Intentional implementation departures should be reconciled by updating the
  Figma design, changing the implementation, or recording a new decision.
- AI-generated designs are starting points subject to the same review and
  quality standards as manually created designs.

### What this decision does not mean

- Every exploratory sketch must be polished or preserved indefinitely.
- Figma-generated code is automatically production-ready.
- Pixel measurements take priority over usability, accessibility, or platform
  behavior.
- Engineers cannot improve a design when implementation reveals a constraint.
- The Figma file replaces requirements, ADRs, tests, or code documentation.
- Every small visual correction requires a new ADR.

## Goals

1. Establish a recognizable visual identity for UtaStream.
2. Make the transition between passive listening and active learning feel
   coherent and intentional.
3. Validate core flows before investing in full implementation.
4. Create a maintainable component and token system that can evolve with the
   application.
5. Improve communication between product intent and engineering decisions.
6. Produce a documented design process that can support a professional
   portfolio and future collaboration.

## Non-Goals

- Finalizing the entire product before development begins
- Treating the first design direction as permanent
- Reproducing Spotify, Duolingo, or another product's visual identity
- Using AI generation as a substitute for user research or design judgment
- Guaranteeing automatic one-to-one conversion from Figma to production code

## Considered Options

### Option 1: Figma as the design source of truth — chosen

Figma provides a shared canvas for interface design, components, variables,
prototypes, review, and developer handoff. Its AI-assisted features can speed
up exploration while leaving artifacts available for direct inspection and
manual refinement.

**Advantages**

- Supports the full path from rough concepts to high-fidelity prototypes.
- Provides reusable components, variants, variables, styles, Auto Layout, and
  responsive constraints.
- Keeps flows, screens, prototypes, and design-system foundations together.
- Supports commenting, iteration, version history, and collaborative review.
- Offers development handoff and design-to-code integration capabilities.
- Figma Make can accelerate interactive prototyping without forcing it to be
  the permanent implementation environment.
- Experience with Figma and structured design systems is professionally
  transferable.
- The connected tooling available to this project can assist with creating and
  maintaining Figma artifacts.

**Disadvantages**

- Introduces another artifact that can drift from production code.
- Requires deliberate maintenance of components, variables, and file hygiene.
- Advanced collaboration, development, or AI capabilities may depend on the
  selected Figma plan and usage limits.
- Cloud availability and vendor changes are outside the project's control.
- Prototypes can imply behavior without proving technical feasibility.
- Learning Figma well adds upfront time before visible application development.

### Option 2: Design directly in application code

Build and evaluate the interface solely through HTML, CSS, JavaScript, or the
eventual application framework.

**Advantages**

- The artifact being reviewed is executable and technically feasible.
- There is no synchronization gap between a mockup and its implementation.
- Design work can immediately exercise real content, responsive behavior, and
  accessibility semantics.
- No separate design-platform dependency is required.

**Disadvantages**

- Comparing broad visual directions is slower and more expensive.
- Early ideas become entangled with architecture and implementation choices.
- Incomplete code can distract design review with functional defects.
- Reusable design foundations may emerge accidentally instead of intentionally.
- It is harder to communicate a full flow before every screen exists.

This remains useful for validating feasibility and refining implemented
details, but it is insufficient as UtaStream's only design process.

### Option 3: AI-generated prototypes as the primary artifact

Use tools such as Claude Artifacts, v0, or a similar prompt-to-application
environment as the main design workspace.

**Advantages**

- Produces interactive concepts quickly.
- Makes experimentation accessible without extensive design-tool experience.
- Can reveal interaction ideas that are difficult to evaluate in static
  mockups.
- Some tools provide usable code as a starting point.

**Disadvantages**

- Generated output may be inconsistent between screens and iterations.
- Outputs often need substantial refinement to form a coherent design system.
- The underlying structure may reflect tool defaults rather than UtaStream's
  needs.
- Rapid generation can hide unresolved product decisions behind polished
  visuals.
- Portability and maintainability vary by tool.

These tools may support exploration and implementation experiments, but they
will not be the canonical record of approved design intent.

### Option 4: Penpot or another dedicated design platform

Use another interface-design and prototyping platform, including an open-source
or self-hostable option.

**Advantages**

- Some alternatives reduce vendor dependence or support self-hosting.
- Open formats and web-standards-oriented workflows may improve portability.
- Competing tools may be sufficient for core screen design and prototyping.

**Disadvantages**

- The project would give up some of Figma's established collaboration,
  ecosystem, handoff, and connected-tooling advantages.
- Available learning resources and integrations may differ.
- Switching primarily to avoid theoretical lock-in would not directly improve
  the current product-design outcome.

This option should be revisited if Figma's cost, accessibility, exportability,
or workflow constraints become material.

## Rationale

Figma best satisfies the current combination of visual exploration, reusable
design-system structure, interactive prototyping, developer handoff, connected
tooling, and professional learning value. It supports both sides of the design
process UtaStream needs: quickly comparing what the product could feel like and
carefully specifying the experience selected for implementation.

The alternatives remain valuable supporting tools. Code is necessary to test
real behavior and feasibility. AI prototyping tools are useful for rapid
experiments. Reference libraries help identify established interaction
patterns. None of them, used alone, offers as balanced a canonical workspace
for UtaStream's current needs.

This is a process decision, not a claim that Figma guarantees good design.
Quality will still depend on research, coherent constraints, accessibility,
careful critique, and validation with representative users.

## Consequences

### Positive

- UtaStream gains a durable home for its visual language and interaction intent.
- Major flows can be evaluated before implementation cost makes them difficult
  to change.
- Shared components and variables can reduce inconsistency across screens.
- Design decisions become easier to review, explain, and revisit.
- Development receives clearer states, relationships, and expected behavior.
- AI can accelerate exploration without becoming the authority on design.

### Negative

- The Figma file becomes a maintained project asset rather than a disposable
  mockup.
- Contributors must learn the agreed file structure and component conventions.
- Design and code reviews must occasionally address drift between two systems.
- Some design work may be discarded after exploration, which is expected but
  still consumes time.
- The project acquires a dependency on a third-party hosted platform.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Designs drift from implementation | Medium | High | Review design references during implementation and reconcile intentional departures promptly. |
| AI-generated output creates inconsistent UI | High | Medium | Require generated work to use approved tokens and components and undergo manual review. |
| The design system becomes overbuilt before product validation | Medium | Medium | Begin with foundations and components required by the core flow; expand only when reuse is demonstrated. |
| Figma plan limits or price become restrictive | Medium | Medium | Keep essential decisions documented in the repository and periodically evaluate export and migration options. |
| Prototypes conceal technical constraints | Medium | Medium | Conduct engineering feasibility review before treating complex interactions as committed requirements. |
| Accessibility is evaluated only visually | Medium | High | Annotate intended semantics and keyboard behavior, then validate accessibility in production code. |
| The file becomes difficult to navigate | Medium | Medium | Use a documented page structure, naming convention, component ownership, and regular cleanup. |

## Governance

The canonical Figma file should use clearly identified areas for:

1. **Cover and index** — project context, ownership, status, and navigation.
2. **Research and exploration** — references, sketches, and competing concepts.
3. **Foundations** — color, typography, spacing, grids, elevation, iconography,
   and motion.
4. **Components** — reusable elements and variants.
5. **Approved screens** — current design intent for implementation.
6. **Prototypes** — named flows prepared for review or testing.
7. **Archive** — superseded work retained only when it provides useful context.

Approved work should be visibly distinguished from exploration. Components and
frames should use descriptive names rather than generation timestamps or vague
labels. Files should not contain sensitive credentials, private user data, or
licensed media that the project is not authorized to reproduce.

## Adoption Plan

1. Create the canonical UtaStream Figma Design file.
2. Add a cover page containing the product premise, this ADR, ownership, and
   file-navigation guidance.
3. Establish initial brand attributes and two or three contrasting visual
   directions.
4. Map the core journey from selecting a song through listening, exploring a
   lyric, saving language, and returning to playback.
5. Create low-fidelity layouts for the minimum core screen set.
6. Select a visual direction and define the minimum viable foundations.
7. Build only the reusable components needed for the core prototype.
8. Produce and review a high-fidelity, clickable core-flow prototype.
9. Record implementation-relevant tokens and component mappings before coding
   the approved interface.

## Validation

This decision is working if:

- A new contributor can locate the approved core flows and understand which
  screens are current.
- The same visual and interaction patterns are reused consistently.
- Important states are discovered during design rather than only during
  implementation.
- The prototype makes the balance between listening and learning testable.
- Implementation questions can be resolved through clear design intent without
  treating the prototype as executable requirements.
- Maintaining Figma creates less confusion and rework than it prevents.

## Revisit Triggers

Reconsider this decision if:

- Figma's cost or plan restrictions materially obstruct the project.
- Required accessibility or collaboration workflows cannot be represented.
- Export, ownership, or availability constraints create unacceptable risk.
- The chosen application stack offers a demonstrably better design-system
  workflow that preserves the same clarity and reviewability.
- Design-to-code drift remains high despite following the governance process.
- The project changes from a user-interface-heavy application to a form where
  Figma is no longer appropriate.

## References

- [Figma Design](https://www.figma.com/design/)
- [Figma Make](https://www.figma.com/make/)
- [Figma AI](https://www.figma.com/ai/)
- [Figma Dev Mode](https://www.figma.com/dev-mode/)
- [Figma accessibility resources](https://www.figma.com/resource-library/accessibility-in-design/)
- [UtaStream Project Manifesto](./manifesto-v1.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-12 | Initial decision accepted | Zack Roland |
