# UtaStream Project Manifesto

> A living guide for long-term product direction, decision-making, and idea organization.

**Status:** In Progress
**Created:** 09-12-2026 
**Last reviewed:** YYYY-MM-DD  
**Next review:** YYYY-MM-DD  
**Owner(s):** Zack Roland

## Purpose of Manifesto
- The purpose of this manifesto plainly stated:
    1. To provide inital planning and organization to the project. 
    Careful planning upfront can often reduce unnecessary stresses.
    Having a document to be able to plainly brainstorm is also important for
    the creative process.

    2. To track and evaluate changes overtime of the project. It is important
    to see how a project grows overtime as it can often point to areas of needed 
    improvement.

    3. To keep the inital vision and principles of the project in tact. It is
    often the case with bigger projects that one may forget important details
    and motivations so it is important to be reminded of them.

    4. To be able to catch oneself back up to speed effecitently if taking
    extended breaks from the project. Kind of a build off of point 3 but it 
    is crucial to be stated.

    5. To treat goals, strategic bets, and the idea backlog as living sections
    that can evolve. This goes with a previous point of having a cohesive 
    document that can allow one to brain storm without repercussion.

## How to Use Manifesto
- Periodic review of the Manifesto is highly encourage and if making major 
changes to the project it becomes an requirement to make sure we are doing 
things that are in our best interest.
- To the end of the previous point, we want to update and revise this manifesto 
only when the project's direction meaningfully changes. Record substantial 
revisions in the change log so the reasoning behind the project's evolution 
is preserved.
- Link major technical or product decisions to separate Architecture Decision
 Records (ADRs). It is imperative that this document does not get 
 unnecessarily long as it can make it more of a chore to review and update.

---

## 1. The Manifesto

### Our belief

We believe that the best way to learn a language is through means that one 
already enjoys. Learning a language is no easy task and it can often be a chore
to rote study from traditonal practies such as classroom instruction and  
grinding out textbooks. So, we believe that music can be a great and underrated
way to learn a language.

### Our mission

UtaStream exists to provide a platform for users to be able to learn a language
in a way that they already enjoy, and at their own pace.

### Our vision

In the long term, we want a world where people are able to communicate more 
with distinctive cultures through their native tongue whilist sharing and 
engaging with their music.
### Our promise

For Japanese learners who connect with the language through music, UtaStream
will turn the songs they already love into approachable, self-directed
learning experiences without taking away the joy of listening.

### We choose to

- Put the listening experience first and make learning tools available when
  the listener wants them.
- Give learners control over what they study, how deeply they study it, and
  how quickly they progress.
- Help listeners move from hearing a song to understanding its words,
  meaning, and cultural context.
- Begin with Japanese and use it to prove that the experience can support a
  linguistically complex writing system.
- Respect artists, rights holders, translators, and the cultural context
  surrounding their work.

### We choose not to

- Turn every listening session into a mandatory lesson.
- Use guilt, punishing streaks, or manipulative engagement patterns to force
  users back into the application.
- Claim that listening to music alone provides complete language fluency.
- Sacrifice trustworthy translations and explanations for speed or content
  volume.
- Expand into many languages before the Japanese experience is genuinely
  useful.

### Product identity

UtaStream should feel like a capable and enjoyable music player first. Language
learning should be woven into the listening experience without preventing users
from simply enjoying their music.

Over time, UtaStream will develop a more guided learning experience inspired by
the clarity, progression, and approachability of modern language-learning
applications. Unlike a traditional course, progression will grow from the songs
the learner chooses and the language they encounter while listening.

### Product evolution

The initial version will focus on reliable music playback and foundational
language tools such as synchronized lyrics, readings, translations, saved
vocabulary, and basic review.

Once this core experience is proven, UtaStream will explore guided song lessons,
adaptive practice, song mastery, and longer learning paths. The initial
architecture should preserve this possibility without requiring the complete
learning system to be built immediately.

---

## 2. The People We Serve

### Primary audience

**Who they are:** Japanese Language Learners of any level.
**What they want:** Be able to listen and fully understand Japanese Music.  
**What gets in their way:** Music applications like spotify don't have a lot of 
built in lyrical support for Japanese Songs.
**Why music matters to them:** Music is fun and is a prime way to get 
consistent comprehensable input for Japanese.
**What success feels like:** When you are able to learn a song you like it 
feels like considerable steps to be made on a language goal.

### Secondary audiences

| Audience | Need | Why we may serve them | Priority |
| --- | --- | --- | --- |
| [Audience] | [Need] | [Reason] | Now / Later / Not planned |

### Jobs to be done

When [situation], I want to [motivation], so I can [desired outcome].

- When [...], I want to [...], so I can [...].

- When I hear a Japanese song I love, I want to understand its lyrics without
  constantly switching between unrelated websites and applications.
- When I encounter an unfamiliar word or expression in a song, I want to save
  and study it in context so that it becomes memorable.
- When I simply want to enjoy music, I want learning tools to remain available
  without interrupting the listening experience.
- When I return to a familiar song, I want to notice how much more I understand
  than before.

---

## 3. Product Principles

Use these principles to resolve tradeoffs. Each principle should be specific enough to guide a real decision.

### 1. Education vs. Enjoyment

**We mean:**  
How should enjoyment and educational rigor be balanced?
**In practice:** 
It is important that we prioritize enjoyment with this application. Yes, the 
goal of this app is to aid people in learning Japanese but it is central in 
doing so that we maintain enjoyment along the way else people wont want to 
use the application. Starting ratio of 70%/30% for enjoyment vs education is 
something good to keep in the back of the mind whilist not having an objective 
metric for this. In this app this means engieering features and UI as 
appealing as possible.
**Tradeoff:** 
By prioritizing enjoyment well have to reinvent how we educate which is also 
an aim of this app.

### 2. Explicit vs. Implicit Learning

**We mean:** 
Should learning happen explicitly, implicitly, or a combination of both?
**In practice:** 
The learning type determines directly what features we'll 
prioritize in the app. Since this is an app centered around enjoyment I feel 
like learning should be more explicit, we give the user a choice to learn
rather than forcing them. But can also implement some implicit features to 
guide the user to want to expericence the explicit side.
**Tradeoff:** 
We cannot control the user at the end of the day so may be a failure point 
depending on how the user chooses to engage with the app.

### 3. User Autonomy

**We mean:** 
How much control should listeners have over lesson difficulty and pacing?
**In practice:** 
This builds up directly off of principle 2. Initially well give the user full 
control over difficulty and pacing. We can implement some guides to direct
but ultimately the user gets to choose their experience.
**Tradeoff:** 
Similar trade off with the previous priciple

### 4. Copywright and Licensing

**We mean:** 
How should UtaStream respect artists, lyrics, translations, and licensing?
**In practice:** 
As it stands we have no capital to buy out licenses or make deals with big
corporations. As a result well have our inital set up have the user import
their own music or provide a link through youtube and then we could store
the music files for the user providing lyrics, translations and credits
where it may be do
**Tradeoff:** 
This is a BIG architectural decision because it means that the user will 
have to be way more hands on with things. Ideally we could provide the music
in app but since we cannot do that as of now we need to establish a good 
proof of concept before investing in this capabilities. It may also be a
potential strength of the app.

### 5. Key -ilities

**We mean:** 
What -ilities should we proitize with the app?
**In practice:** 
Accessibility is always a concern and will be a top ility to consider.
Maintainability and Reliability is a major concept to keep in mind also.
**Tradeoff:** 
These ilities will influence technological selections and how the app
is formated and structured. Since we value maintainability and reliability
we should proitize core technologies that aren't that adversive to change
to make things easy to maintain and serve the user better. Accessibility 
will influence design decsions also.

### X. [Principle name]

**We mean:** [Explain the principle.]  
**In practice:** [Describe what it changes in the product.]  
**Tradeoff:** [State what you are willing to give up to uphold it.]

### Possible principle prompts

- How should enjoyment and educational rigor be balanced?
- Should learning happen explicitly, implicitly, or through a combination of both?
- How much control should listeners have over lesson difficulty and pacing?
- How should UtaStream respect artists, lyrics, translations, and licensing?
- What should remain simple even as the product grows?
- How should accessibility, privacy, and inclusivity influence product decisions?

---

## 4. Product Experience

### The core experience

In one short paragraph, describe the ideal journey from choosing a song to understanding, practicing, and returning to it.

### The essential loop

1. **Discover:** 
The user can search from an existing select catalogue of Japanese Songs or 
could import their own. Import can be done from youtube or personal files.
2. **Listen:** 
It is prevelant that we keep the listening experience as similar to established
standards with music platforms. Click on Song -> Music Window Appears
3. **Understand:** 
Lyric capabilities are key here and so are translations. Can mark unknown words
or characters and those can be highlighted with toggle to show the meaning 
specifically.
4. **Practice:** 
Unknown words, sentences, or concepts get placed into a deck, similar style to
Anki for spaced repition and reviews.
5. **Return:**
Like Anki the user can come on the app everday to do the reviews if they choose
to do so. Can send out notifications everyday. Have a heatmap streak enabled.
Essentially since we value enjoyment over education step 4 and 5 are completly 
optional and are at the users discretion.

### Moments that should feel magical

 Hearing a familiar lyric and understanding it naturally for the first time.
- Tapping a line to reveal its reading, meaning, and context without leaving
  the song.
- Returning to a favorite song and visibly recognizing words that were once
  unfamiliar.
- Discovering that vocabulary studied from one song appears in another.

### Quality bar

A feature is ready when it is:

- **Useful:** [Criterion]
- **Enjoyable:** [Criterion]
- **Trustworthy:** [Criterion]
- **Accessible:** [Criterion]
- **Respectful:** [Criterion]

---

## 5. Long-Term Direction

### North-star outcome

[Name the lasting user outcome the project exists to create. Avoid describing a feature or vanity metric.]

### Time horizons

| Horizon | Focus | Desired outcome | Evidence of progress |
| --- | --- | --- | --- |
| Now (0-12 months) | [Focus] | [Outcome] | [Evidence] |
| Next (1-3 years) | [Focus] | [Outcome] | [Evidence] |
| Later (3+ years) | [Focus] | [Outcome] | [Evidence] |

### Strategic bets

| Bet | Why we believe it | Assumption to test | Success signal | Revisit date |
| --- | --- | --- | --- | --- |
| [Bet] | [Reasoning] | [Assumption] | [Signal] | YYYY-MM-DD |

### Open strategic questions

- [Question whose answer could materially change the roadmap]
- [Question that requires research or user feedback]
- [Question about expansion, sustainability, or positioning]

---

## 6. Scope and Boundaries

### In scope

- [Core capability or audience]
- [Core capability or audience]

### Adjacent, but not yet

- [Promising direction that should wait]
- [Promising direction that should wait]

### Explicitly out of scope

- [Direction the project does not intend to pursue]
- [Direction the project does not intend to pursue]

### Expansion criteria

Before adding another language, learning mode, platform, or audience, we should have:

- [Evidence that the core experience works]
- [Operational or technical capability]
- [Content, rights, or partnership readiness]
- [A clear reason the expansion serves the mission]

---

## 7. Sustainability and Ethics

### Sustainable value

**Value for learners:** [What users gain.]  
**Value for artists and rights holders:** [How their work is respected and supported.]  
**Value for the project:** [How the product can remain financially and operationally viable.]

### Commitments

- **Privacy:** [What data should and should not be collected or retained.]
- **Accessibility:** [The standard the project aims to meet.]
- **Content rights:** [How music, lyrics, translations, and attribution will be handled.]
- **Learning integrity:** [How claims about learning outcomes will remain honest.]
- **Healthy engagement:** [How the product avoids manipulative engagement patterns.]

### Red lines

- We will never [unacceptable practice].
- We will never [unacceptable practice].

---

## 8. Measuring Progress

### Success signals

| Signal | Why it matters | How it is measured | Review cadence |
| --- | --- | --- | --- |
| [User outcome] | [Reason] | [Method] | Weekly / Monthly / Quarterly |

### Guardrail signals

Track these to ensure growth does not undermine the manifesto.

| Guardrail | Risk it protects against | Acceptable range or trigger |
| --- | --- | --- |
| [Guardrail] | [Risk] | [Range or trigger] |

### Evidence we will value

- [Qualitative feedback or observation]
- [Behavioral evidence]
- [Learning outcome evidence]
- [Sustainability evidence]

---

## 9. Idea Garden

Capture ideas here without prematurely committing them to the roadmap. Move an idea into a dedicated ADR or planning document when it becomes an active decision.

| Idea | User problem | Mission fit | Confidence | Horizon | Next step | Related ADR |
| --- | --- | --- | --- | --- | --- | --- |
| [Idea] | [Problem] | High / Medium / Low | Known / Assumed / Speculative | Now / Next / Later / Maybe | [Research, prototype, archive, etc.] | [Link or N/A] |

### Idea parking lot

- [A raw idea that is worth remembering but not yet evaluating]
- [A raw idea that is worth remembering but not yet evaluating]

### Ideas retired with intent

| Idea | Why it was retired | What would make us reconsider | Date |
| --- | --- | --- | --- |
| [Idea] | [Reason] | [New evidence or condition] | YYYY-MM-DD |

---

## 10. Decision Framework

When evaluating a major choice, ask:

1. Does it advance the mission and north-star outcome?
2. Does it solve a real problem for the people we serve?
3. Is it consistent with our product principles and ethical commitments?
4. What evidence supports it, and which assumptions remain untested?
5. What opportunity, simplicity, or trust might we sacrifice?
6. Is this the right horizon, or merely an interesting idea?
7. Does the decision deserve its own ADR?

### Decision hierarchy

When priorities conflict, use this order unless an ADR records a justified exception:

1. [Highest priority, such as user trust]
2. [Second priority, such as meaningful learning]
3. [Third priority, such as enjoyment]
4. [Fourth priority, such as growth or speed]

---

## 11. Risks and Unknowns

| Risk or unknown | Potential impact | Current belief | Mitigation or experiment | Owner | Review date |
| --- | --- | --- | --- | --- | --- |
| [Risk] | [Impact] | [Belief] | [Action] | [Owner] | YYYY-MM-DD |

---

## 12. Review Ritual

At each manifesto review:

1. Re-read the mission, vision, principles, and boundaries.
2. Compare recent decisions and roadmap work against them.
3. Review evidence, risks, assumptions, and strategic bets.
4. Promote, revise, archive, or retire ideas deliberately.
5. Create ADRs for decisions that need durable context.
6. Update the dates and summarize material changes below.

### Change log

| Date | Change | Why it changed | Related ADR |
| --- | --- | --- | --- |
| YYYY-MM-DD | Initial draft | Establish long-term direction | N/A |

---

## Closing Statement

[End with a short, memorable statement that captures why UtaStream deserves to exist and what the team wants to protect as it grows.]
