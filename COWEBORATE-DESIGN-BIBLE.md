# COWEBORATE — DESIGN BIBLE

Version 1.0 — 08 August 2026  
Status: binding design direction for the website

---

## 0. How Codex must use this file

This file is the visual and interaction source of truth for COWEBORATE.

Before changing any page or component, Codex must:

1. read this entire file;
2. inspect the real rendered page and the existing implementation;
3. preserve approved sections unless the task explicitly includes them;
4. use the tokens and rules below instead of inventing local values;
5. implement and verify one section at a time;
6. inspect desktop, mobile, reduced motion and the browser console;
7. report any intentional exception to this guide.

When a prompt conflicts with this file, the newest explicit user instruction wins. Otherwise this file wins over existing inconsistent styles.

Never “improve” an approved section while working on another section.

---

## 1. The objective

The website is not an encyclopedia and it is not meant to explain everything about COWEBORATE, programming or the technology behind the work.

Within 10–15 seconds, the visitor must understand:

1. who COWEBORATE is;
2. that we create websites and digital systems that help small and medium-sized businesses;
3. that the studio has taste, structure and the ability to finish the work properly;
4. that there is a clear way to start a conversation about a project.

Across the full homepage, the visitor should also see:

- how we work, explained simply enough to reduce uncertainty;
- what we have already made, shown as real evidence rather than claims;
- who stands behind the work, so the studio feels accountable and human.

Every section must support at least one of these outcomes:

- clarify what we do;
- prove that we can do it;
- make the studio memorable;
- reduce risk and build trust;
- invite the next action.

If a section does none of these, remove it. If its point can be made with less content, shorten it.

Primary conversion: the visitor contacts us to discuss working together.  
Secondary conversion: the visitor views relevant work and understands our process.

The site should create informed curiosity, not total comprehension.

---

## 2. Studio identity

### Position

COWEBORATE is a small Bulgarian boutique digital studio. We create distinctive, clear and reliable websites and digital systems that help small and medium-sized businesses work, sell and communicate better. We combine strong visual direction with precise development.

### Primary audience

Owners and decision-makers in small and medium-sized businesses who need a capable partner—not a technical lecture. They may need a stronger website, reservations, enquiries, ordering, configuration, automation or another practical digital system.

The site should speak in terms of business needs, useful outcomes, reliability and collaboration. It should not imitate enterprise consultancy language or overwhelm visitors with implementation details.

### Character

- direct, not loud;
- young, not childish;
- experimental, not chaotic;
- premium, not ceremonially luxurious;
- technically capable, not developer-centric;
- human, not corporate theatre.

### Core visual idea

**A strict editorial system, interrupted at one deliberate point by electric blue or purposeful motion.**

The structure creates trust. The interruption creates identity.

### Desired visitor reaction

> “Тези хора правят силни сайтове и полезни дигитални системи за малкия и средния бизнес. Изглеждат различно, но знаят какво правят и ще довършат работата както трябва.”

### We are not

- an Awwwards effects demo;
- a generic SaaS landing page;
- a dark neon technology site;
- an oversized Swiss-layout imitation;
- a collection of unrelated section concepts;
- a catalogue of every possible service.

---

## 3. Reference principles, not copied layouts

The direction learns from real studios without copying their compositions:

- **PORTO ROCHA:** a stable interface lets the work carry the colour and personality;
- **Base Design:** a simple proposition and strong personality beat decorative complexity;
- **Studio Feixen:** typography and playful interaction can create identity without luxury clichés;
- **Awwwards editorial and agency work:** typography, grid, whitespace and motion must support usability and content architecture.

What COWEBORATE takes from them:

- one recognisable system across all sections;
- projects shown early as proof;
- restrained chrome around expressive work;
- typography with clear jobs;
- very few graphic devices, repeated consistently;
- interaction that explains hierarchy or state.

What COWEBORATE does not take:

- another studio's exact layout;
- fashionable effects without a communication role;
- a new art direction for every section;
- deliberate usability friction;
- excessive whitespace used as a shortcut to “premium”.

---

## 4. Non-negotiable design laws

1. **One page, one system.** All sections share the same grid, type roles, spacing scale and CTA language.
2. **One dominant idea per viewport.** Do not make heading, image, animation and metadata compete equally.
3. **Proof before explanation.** Show selected work before detailed services or process.
4. **Content earns space.** No large empty area unless it creates a deliberate reveal or focus.
5. **Blue has meaning.** It marks action, current state or one brand interruption; it is not filler.
6. **Dividers are structural.** A line separates real units; it never compensates for weak spacing.
7. **Motion has a job.** It reveals, connects, previews or signals state.
8. **Mobile is composed, not collapsed.** It uses normal document flow and preserves hierarchy.
9. **The work is the visual material.** Prefer real project crops, typography and people over abstract decoration.
10. **One exception at a time.** A section may break one rule deliberately, never five rules accidentally.

---

## 5. Colour system

### Core palette

```css
:root {
  --color-blue: #0000EE;
  --color-ink: #101010;
  --color-paper: #F2F0E9;
  --color-muted-on-paper: rgba(16, 16, 16, 0.62);
  --color-muted-on-ink: rgba(244, 244, 244, 0.66);
  --color-line-on-paper: rgba(16, 16, 16, 0.18);
  --color-line-on-ink: rgba(244, 244, 244, 0.20);
}
```

Do not introduce a second blue, pure white, arbitrary greys, gradients, glow or opacity variants outside these semantic roles without explicit approval.

### Page-level visual balance

Target visible surface area across the full homepage:

- warm off-white `#F2F0E9`: approximately **50–60%**;
- ink `#101010`: approximately **30–40%**;
- electric blue `#0000EE`: approximately **8–12%**.

These are composition targets, not pixel-count tests. Real project imagery is excluded from this ratio.

### Blue budget

Within a normal content viewport, blue may dominate only one of:

- the section background;
- the main CTA;
- the active item;
- one graphic interruption.

Do not use all four at once. If a full section is blue, most controls inside it should be ink or paper—not more blue.

### Section rhythm

Avoid mechanical colour alternation. The planned rhythm is:

- expressive opening: blue / ink;
- proof and information: mostly paper;
- one dark studio/team chapter;
- decisive blue or ink closing CTA.

Adjacent sections with the same surface should be separated by composition and spacing, not automatically by a divider.

---

## 6. Grid and layout

### Global container

```css
:root {
  --page-gutter: clamp(24px, 3.33vw, 64px);
  --content-max: 1920px;
  --grid-gap: clamp(16px, 1.25vw, 24px);
}
```

- desktop: 12-column grid;
- tablet: 8-column grid where needed;
- mobile: 4-column grid;
- mobile gutter: `16px`;
- content aligns to the same outer gutters throughout the page;
- full-bleed media may escape the content grid, but text does not drift onto arbitrary axes.

Use the project's established main breakpoint if it is close to `768px`. Do not introduce several competing breakpoint systems. Add a second breakpoint only when the composition demonstrably needs it.

### Alignment rules

- Section headings use one of two approved placements: left aligned to the page grid, or split with heading left and intro right.
- Centred section headings are exceptional and require explicit approval.
- Repeated titles across the page must begin on consistent columns.
- Text measures are controlled; body copy should normally span 4–6 desktop columns.
- Do not centre long body copy.
- Avoid more than two major horizontal alignments inside one section.

### Density

The page must feel deliberate and alive, not sparse for the sake of luxury.

- A normal desktop section should communicate its purpose within roughly one viewport.
- A section may exceed one viewport when real media or meaningful interaction requires it.
- Do not use `100vh` merely to make a section look important.
- Avoid fixed heights for content sections.

---

## 7. Spacing system

Use only this base scale unless geometry requires a documented exception:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;
  --space-11: 160px;
}
```

### Desktop spacing

- normal section padding-block: `clamp(96px, 9vw, 160px)`;
- compact section padding-block: `clamp(64px, 6vw, 112px)`;
- heading to intro: `24–40px`;
- section header to main content: `64–96px`;
- title to description: `16–24px`;
- description to CTA: `24–32px`;
- related metadata gap: `8–16px`.

### Mobile spacing

- normal section padding-block: `72–96px`;
- compact section padding-block: `56–72px`;
- heading to intro: `16–24px`;
- section header to content: `40–56px`;
- item-to-item: `40–64px`;
- final content must clear the fixed bottom navigation.

### Spacing test

Before adding space, decide which relationship it expresses:

- inside one element;
- between related elements;
- between groups;
- between sections.

Each level must be visibly larger than the previous one. Do not use arbitrary `vh` gaps or unique values in every component.

---

## 8. Typography

### Font family

Use the project's existing Helvetica implementation as the primary and only interface family:

```css
font-family: Helvetica, "Helvetica Neue", Arial, sans-serif;
```

Do not add a fashionable serif or display font in this phase. Identity comes from scale, rhythm, composition and language—not another dependency.

### Weight policy

- 400: body and large display text;
- 500: controls, metadata and selected emphasis;
- 600: allowed only when the existing font renders 500 too weak;
- avoid 700–900.

### Type tokens

```css
:root {
  --type-display: clamp(64px, 9vw, 172px);
  --type-section: clamp(48px, 5.2vw, 96px);
  --type-feature: clamp(32px, 3.3vw, 64px);
  --type-subhead: clamp(24px, 2vw, 36px);
  --type-body-lg: clamp(18px, 1.25vw, 24px);
  --type-body: clamp(16px, 1vw, 19px);
  --type-small: 13px;
  --type-meta: 11px;
}
```

Mobile overrides:

```css
--type-display: clamp(48px, 14vw, 72px);
--type-section: clamp(38px, 11vw, 52px);
--type-feature: clamp(28px, 8.5vw, 40px);
--type-subhead: 24px;
--type-body-lg: 18px;
--type-body: 16px;
```

### Line height and tracking

- display: `0.88–0.95`, tracking `-0.04em` to `-0.06em`;
- section titles: `0.94–1.0`, tracking `-0.035em`;
- feature titles: `0.98–1.05`, tracking `-0.025em`;
- body: `1.35–1.55`, tracking normal;
- metadata: `1.2`, tracking `0.06em–0.10em`, uppercase only when useful.

### Copy rules

- Headings state a proposition; they do not merely label a section.
- Body copy is normally 1–3 short sentences.
- One paragraph should rarely exceed 65 characters per line.
- Avoid jargon chains such as “стратегически дигитални решения за растеж”.
- Use Bulgarian that sounds spoken, confident and specific.
- Do not add English eyebrows above Bulgarian titles.

---

## 9. Information hierarchy

### Allowed text roles in a normal section

A normal section may use:

1. one section title;
2. one short intro;
3. the primary content;
4. one action where relevant;
5. optional functional metadata.

It should not automatically use all of them.

### Eyebrow budget

- Maximum one eyebrow/metadata label per section.
- Prefer a useful index such as `01/06` or a project category.
- Never add an eyebrow just because the template looks empty.
- Do not stack eyebrow + huge title + subtitle + paragraph + metadata for a simple idea.

### Divider budget

- Maximum one main divider per normal desktop viewport.
- A repeated list may use one thin separator between entries.
- Never put a line both above and below every text block.
- Do not combine outer border, column dividers and row dividers unless the content is genuinely tabular.
- A colour change, whitespace or typographic shift is usually enough to separate sections.

### Cards

Cards are not the default layout primitive.

Use a card only when an item is independently actionable or must be understood as a portable unit. Do not wrap process steps, team members, service descriptions or simple metadata in rounded cards.

---

## 10. Buttons and links

### Primary CTA

- use for the single next action of a section;
- rectangular, sharp or maximum `2px` radius;
- height: `52px` desktop, `48px` mobile;
- horizontal padding: `20–24px`;
- type: `13px`, medium, uppercase or concise sentence case consistently;
- background: blue on paper/ink, ink on blue;
- no shadow, glow, glass or pill shape.

### Secondary CTA

- text plus one simple arrow;
- no permanent decorative underline;
- hover may move arrow/label `4–8px` or reveal a short line;
- minimum touch target `44px` on mobile.

### CTA language

Prefer direct actions:

- ВИЖ ПРОЕКТА
- ВИЖ КАКВО ПРАВИМ
- ОБСЪДИ ПРОЕКТ
- ПИШИ НИ

Avoid repeating “Научи повече” everywhere. One section should not contain multiple equally strong CTAs.

---

## 11. Images and project presentation

- Use real project work as the main visual proof.
- Use real team portraits for the people section.
- Do not generate decorative imagery merely to fill a layout.
- Do not place every image in the same generic 16:9 card.
- Choose crops that support the composition while keeping the work recognisable.
- Project images may bring colours outside the core palette; the interface around them remains restrained.
- Keep overlays minimal. Never bury project work under heavy blue/black tint unless readability demands it.
- Do not use fake device mockups repeatedly.
- Lazy loading must not cause layout jumps; declare aspect ratio or dimensions.

### Image rhythm

Use one dominant image, or one coherent series. Avoid decorative clusters of unrelated thumbnails. One surprising crop is stronger than five floating assets.

---

## 12. Motion system

### Motion principle

**Motion reveals structure and collaboration. It does not audition for attention.**

### Approved motion vocabulary

- opacity reveal with `16–32px` translation;
- clip/mask reveal for large headings and media;
- slight media settle from `scale(1.02–1.04)` to `1`;
- short label/arrow movement on hover;
- colour change for active state;
- one purposeful pinned or horizontal sequence on the entire homepage, maximum.

### Timing

- hover feedback: `160–240ms`;
- UI transitions: `240–400ms`;
- section reveals: `500–800ms`;
- stagger: `60–120ms`;
- use a restrained ease such as `power2.out` or the project's equivalent.

### Forbidden motion

- individual-letter animation for routine headings;
- long pinning with little content change;
- scroll hijacking;
- several consecutive horizontal-scroll sections;
- 3D tilt on ordinary cards;
- continuous floating, glow pulsing or decorative particles;
- different reveal styles in every section;
- motion that hides content until a fragile JavaScript trigger fires.

### Reduced motion

Under `prefers-reduced-motion: reduce`:

- all content is immediately visible;
- no pinned or horizontal travel;
- no smooth-scroll dependency;
- no critical state depends on animation;
- links and controls remain fully usable.

Use the existing GSAP architecture, `gsap.context()` cleanup and `gsap.matchMedia()` where already present. Prevent duplicate triggers and stale transforms after resize.

---

## 13. Section architecture for the homepage

The homepage follows a persuasion sequence, not an exhaustive studio biography.

1. **Navigation** — orientation and immediate contact.
2. **Hero** — what we make and the COWEBORATE attitude.
3. **Manifesto / positioning** — why our approach feels different.
4. **Selected work** — proof before detailed explanation.
5. **What we do** — a concise capability map tied to outcomes or work.
6. **Process** — enough structure to reduce uncertainty, not every internal task.
7. **Studio / team** — real people and accountability.
8. **Final CTA** — one decisive invitation.
9. **Footer** — contact and required utility.

Do not add testimonials, statistics, clients, awards, FAQ or more process content unless real material exists and it solves a demonstrated trust problem.

### Page narrative

- **Attention:** this feels distinctive.
- **Understanding:** they create websites and digital systems that help small and medium-sized businesses.
- **Evidence:** here is the work.
- **Fit:** here is what they can do for me.
- **Confidence:** here is how they work and who is responsible.
- **Action:** let us discuss the project.

---

## 14. Section-specific constraints

### Hero

- Preserve the approved composition unless explicitly revisiting it.
- Communicate what COWEBORATE does without a paragraph of explanation.
- One primary visual moment and one primary CTA.
- The opening may use the highest blue concentration on the page.

### Manifesto

- Preserve the approved direction.
- It is the main verbal/kinetic brand statement, so later sections must be calmer.
- Do not repeat its oversized typography trick immediately afterwards.

### Selected work

- Appears early.
- Project media dominates; UI recedes.
- Each project needs only enough metadata to understand category and contribution.
- Avoid conventional equal card grids if real media supports a stronger editorial sequence.

### What we do

- Explain the offer quickly, not every deliverable.
- Six services maximum.
- Use one coherent index/list or editorial system.
- Connect active service to one useful preview or concise description.
- Do not create six giant bordered panels.

### Process

- Four steps maximum.
- The purpose is risk reduction: show that there is a clear path.
- Keep it compact and readable.
- Do not make imported staircase geometry the whole identity.
- Avoid decorative percentage bars unless they communicate real progression.

### Team

- Use the three real portraits as one studio composition.
- Name and restrained role only unless real biographies are supplied.
- No rounded profile cards, fake achievements or social clutter.

### Final CTA

- One sentence, one action and optional direct contact method.
- It should feel like a conclusion, not another information section.
- Blue or ink may dominate here depending on the preceding surface.

---

## 15. Responsive behaviour

- Desktop concepts must be re-composed for mobile, not scaled down.
- Mobile uses normal vertical document flow by default.
- No horizontal page overflow.
- No internal scrollbars for content sections.
- No fixed section height when text can wrap.
- No essential hover-only information.
- Minimum interactive target: `44 × 44px`.
- Maintain `16px` outer gutters.
- Keep important content above or clear of the fixed bottom navigation.
- Preserve source order and reading order.
- Use `clamp()` for fluid type only within safe bounds; do not let long Bulgarian words clip.

---

## 16. Accessibility and usability

- Semantic headings follow a logical hierarchy.
- Body text contrast meets WCAG AA.
- Visible keyboard focus is mandatory.
- Every meaningful image has useful alt text; decorative media uses empty alt.
- Do not rely on blue alone to communicate state.
- Navigation and CTA labels describe their destination/action.
- Avoid pointer-following effects that obstruct content.
- The custom cursor, if retained, must not replace native usability on touch or keyboard.
- The page remains understandable with CSS animation disabled.

---

## 17. Anti-AI-slop checklist

Reject the design if it contains several of these:

- an eyebrow above every heading;
- a divider above and below every block;
- excessive rounded cards;
- pills for ordinary labels;
- gradients, glow, glass and noise added without a brand reason;
- three different title alignments in adjacent sections;
- huge empty gaps posing as premium design;
- abstract 3D objects unrelated to the studio;
- fake metrics, awards, clients or testimonials;
- generic copy that could belong to any agency;
- a unique animation concept per section;
- repeating blue simply because it is the brand colour;
- excessive metadata and numbering;
- identical card grids for services, process, work and team;
- explaining the same proposition more than once;
- visual complexity that delays understanding what the studio does.

### The subtraction pass

Before approval, try removing:

1. half the dividers;
2. unnecessary eyebrows;
3. one text level;
4. one decorative effect;
5. excess vertical space;
6. duplicate explanations.

If clarity and identity improve, keep them removed.

---

## 18. Implementation rules for Codex

### Before editing a section

1. Run the current site and inspect the real rendered section.
2. Identify the exact component and direct styles/animation.
3. Record what is approved and outside scope.
4. Confirm the content and real assets available.
5. State the section's single communication job.
6. Choose the simplest composition that fulfils it within this system.

### During implementation

- Reuse design tokens; do not scatter magic numbers.
- Prefer CSS Grid/Flexbox and natural flow.
- Keep component-specific CSS local and intentional.
- Reuse existing dependencies and animation setup.
- Preserve `gsap.context()` cleanup and responsive match media.
- Do not create duplicate components or ScrollTriggers.
- Do not add packages without explicit approval.
- Do not modify unrelated approved sections.
- Do not write placeholder marketing claims.

### Definition of done for one section

A section is done only when:

- its communication job is obvious;
- it belongs to the same system as the approved sections;
- typography uses the defined roles;
- spacing uses the defined scale;
- blue obeys the blue budget;
- divider and eyebrow budgets are respected;
- desktop and mobile are intentionally composed;
- reduced motion shows all content;
- there is no clipping or horizontal overflow;
- browser console is clean;
- lint and build pass;
- the user has visually approved the result.

Compilation alone is not design verification.

---

## 19. Section-by-section working protocol

The site is built and approved in this order:

1. global tokens and shared CTA styles;
2. navigation review only if needed;
3. Hero;
4. Manifesto;
5. Selected Work;
6. What We Do;
7. Process;
8. Team;
9. Final CTA;
10. Footer and whole-page rhythm pass.

For each stage:

1. receive one focused prompt;
2. inspect before editing;
3. implement only that scope;
4. show the real desktop and mobile result;
5. receive approval or corrections;
6. lock the section;
7. move to the next section.

Do not redesign future sections in advance. Do not silently revisit locked sections.

---

## 20. Final approval questions

Before presenting any section, answer internally:

1. Can a visitor understand this section in five seconds?
2. Does it support understanding, proof, trust, memory or action?
3. Is the hierarchy clear without the animation?
4. Does it use the same grid, type, spacing and CTA language as the rest?
5. Is the blue doing a job?
6. Can at least one divider, label, effect or gap be removed?
7. Does it feel authored for COWEBORATE rather than generated for an agency template?
8. Does mobile feel designed rather than merely stacked?

If any answer is no, the section is not ready for approval.

---

## 21. One-sentence brief

**Build a sharp, compact and human boutique-studio website that quickly shows COWEBORATE creates distinctive websites and useful digital systems that help small and medium-sized businesses, proves the quality through real work, and uses a strict black/off-white system with one controlled electric-blue interruption—without decorative agency clichés.**

---

## 22. Research basis

These references informed principles, not layouts to copy:

- Awwwards — Agency Portfolios: https://www.awwwards.com/awwwards/collections/agency-portfolios/
- Awwwards — Layout: https://www.awwwards.com/awwwards/collections/layout/
- Awwwards — Typography in Web Design: https://www.awwwards.com/awwwards/collections/typography-in-web-design/
- PORTO ROCHA: https://portorocha.com/
- Base Design: https://www.basedesign.com/
- Studio Feixen: https://www.studiofeixen.ch/

The COWEBORATE system is intentionally narrower and calmer than the full range of styles shown by these sources.
