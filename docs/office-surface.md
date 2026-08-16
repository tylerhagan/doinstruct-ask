# The office surface

Phase one. Research, revised assumptions, and the information architecture for
the second half of the product.

The first version built only the floor. That was the flaw: it produced something
that served one worker at one machine and gave no view of the system around them.
This is the half I cut and said would demonstrate nothing if built halfway.

---

## What the research changed

I had only read doinstruct's marketing copy before. Reading the product pages
properly overturns an assumption the entire first version rested on.

**Their access model is a personal phone, not a wall mount.** The Learner page is
explicit: _"No app. No login. No barriers."_ Access is by QR code or a link in
WhatsApp, SMS, Beekeeper or Flip. The Echterhoff case study describes 670
construction workers completing safety briefings _"on personal smartphones"_.

I had inferred a shared wall-mounted terminal from hygiene-zone phone
restrictions. That inference was reasonable and it was not their model, and
because every subsequent cut hung off it, the whole case study inherited a
deployment nobody asked for. That is why it read as bespoke.

**Language selection is their first screen, not a setting.** Their flow is scan,
pick a language, begin. My prototype silently defaulted to Romanian and buried
language in a status bar. Their pattern is better and it is already familiar to
every worker who has used the training product.

**They already do gap analysis, but for a different gap.** The Manager product
offers _"department-level evaluations and gap identification"_ for training
completion. That answers "who has not been trained". It cannot answer "what does
our documentation fail to explain", which is the gap this product finds.

---

## The revised constraint chain

The original chain reached the right conclusion through a wrong premise. The
corrected version is shorter and stands on their published product rather than my
inference.

> doinstruct's model is deliberately **no login**, because passwords are a
> barrier to frontline adoption. No login means no identity. No identity means
> payroll and holiday questions are impossible to answer safely, so HR is out.
> Operational knowledge needs no identity at all, so it survives.

Same destination, load-bearing evidence instead of a guess.

**On the device, the answer is both.** A QR code on the machine resolves to the
same URL whether it is scanned with a worker's own phone, which is the common
case, or opened on a shared terminal in a hygiene zone where personal phones are
restricted. One product, two deployment contexts. The gloved, wet-handed,
washdown-glare reasoning still holds exactly where it applies and stops
governing everywhere else.

---

## Who the office user actually is

From their own pages: Operations and Plant Managers, HSE and Compliance Managers,
HR and People teams, and from the Echterhoff study, QHSE Managers and site
foremen.

The primary user here is the **shift lead or maintenance supervisor**, the Marek
of the first version. Secondary is the **QHSE or compliance manager** who needs
the audit trail.

**Their pain is stated in doinstruct's own case study:** foremen spend excessive
time on repetition instead of leading. That is the value proposition, and it is
not a dashboard.

> The supervisor's scarce resource is their attention. Today they answer the same
> question eleven times because the answer lives in their head. This surface
> means they answer it once.

---

## The line: delivery, not judgement

The first version argued that asking for help carries a social cost, and the copy
works hard to make asking survivable. That dies the moment a supervisor can see
who asked what, and how often.

An absolute ban is product-naive, though. The system has to know who asked in
order to tell them the answer. So the line is not visibility, it is
**accumulation**:

> **Present-tense identity is operationally necessary. Historical accumulation is
> performance monitoring.**

"Ana is waiting on an answer about Filler F2 right now" is a service queue. You
cannot deliver without it. "Ana has asked 47 questions this quarter" is a
competence record about a person, and nothing in this product needs it.

So the Queue knows who is waiting, because it must. Coverage aggregates and never
resolves to an individual. Once a question is answered and delivered, the link
between the person and the question expires.

**There is a legal edge here, not only an ethical one.** In Germany, systems
capable of monitoring individual employee performance fall under works council
co-determination, §87(1)(6) BetrVG. That is a negotiation which takes months and
can fail. Designing the accumulation out means a Betriebsrat conversation that
takes one screen instead of one quarter, which is a sales-cycle feature.

Worth noting doinstruct already tracks per-person training completion, and that
is fine: completion is a compliance record an employer is legally obliged to
hold. Questions asked are a different class of data entirely.

The one place identity persists is the **responder**. Answers are attributed to
whoever wrote them, because accountability for a safety instruction has to land
on a named human.

---

## What we aggregate by, and what we refuse to

The unit should be **whatever a supervisor can actually fix**. There are only
three fixable things behind an unanswered question:

| The problem is                             | The unit is          | The action                             |
| ------------------------------------------ | -------------------- | -------------------------------------- |
| The documentation is unclear or absent     | Document and section | Rewrite the section                    |
| The machine keeps producing the same fault | Asset and fault code | Engineering, not documentation         |
| People have not been trained               | Role and topic       | Hand to Genius, their existing product |

Coverage triages into those three rather than assuming one hierarchy, because
each hands the supervisor a different next action.

**Secondary dimensions**, for filtering rather than grouping: area or zone, shift,
and time period. Area is the useful location unit; site is too coarse to act on
and a single machine is already covered above.

**Dimensions we refuse**, and the reason is subtler than privacy squeamishness:

Aggregation only protects anonymity above a threshold. Slice by role and shift in
a plant with one night-shift electrician and you have named them. The same is
true of any small team. So role, team and group are not offered as grouping
dimensions, and every bucket in Coverage is subject to a **minimum-count
suppression**: fewer than five events and the cell reads "too few to show"
instead of a number.

That is standard practice in analytics products handling employee data, it costs
nothing, and it is the difference between a system that is private by design and
one that is private by policy.

**Open question, and I would rather flag it than assert it.** I have no evidence
that document, asset and role are the right triage. It is reasoned from what is
fixable, not observed from a real supervisor's week. It is the first thing I would
put in front of a shift lead.

---

## Information architecture

Four destinations. The order is the order of urgency.

### 1. Queue, the default view

Unanswered questions, oldest first, with the machine, line and shift attached.
This is the supervisor's inbox and the only thing with a badge count.

Each item carries what the assistant already tried, so the supervisor is not
answering blind. If three people asked the same thing, it appears once with a
count, because that is a signal about the documentation and not about the people.

### 2. Answer, the composer

Where a reply becomes knowledge. Write once, attach the machine and the fault
code, mark whether it is safety-relevant, and publish. The reply reaches whoever
is waiting and is added to what the assistant can answer next time.

This screen carries the most weight in the whole product. It is where a
supervisor's time converts into an asset, and it needs to be fast enough to use
between two jobs, on a phone, standing up.

### 3. Coverage, the gaps

Where the documentation fails, by asset and over time. Which machines generate
questions the manuals cannot answer, which shifts see them, whether a manual is
old enough to be the cause.

This is the analytical surface and the one that earns proper data visualisation.
It is also the commercial argument: it tells a plant manager which document to
fix to remove the most downtime.

### 4. Knowledge, the record

What the assistant can now answer that it could not before, with provenance and
verification status, exportable for audit. This is the surface that plugs
directly into the compliance business doinstruct already sells.

---

## Screen inventory

| Screen          | Purpose                                            | Why it earns its place            |
| --------------- | -------------------------------------------------- | --------------------------------- |
| Queue           | Waiting questions by asset                         | The supervisor's actual job       |
| Answer composer | Reply becomes canonical knowledge                  | Where time converts to asset      |
| Coverage        | Gaps by machine, line, shift, over time            | Tells you which document to fix   |
| Asset detail    | One machine's question history and documents       | Where a maintenance planner lives |
| Knowledge entry | A captured answer, its provenance and review state | Audit and trust                   |
| Audit export    | Filtered, timestamped, downloadable                | Their existing compliance moat    |

---

## What I am deliberately not building, and why

- **Any per-person view.** Covered above. Its absence is the argument.
- **Authoring of training courses.** That is Genius. Competing with their own
  product would be a misread.
- **Org chart and role management.** The Manager product already mirrors the org
  chart. This surface consumes that, it does not rebuild it.
- **Real retrieval.** Still fixtures. Faking a RAG pipeline would teach nobody
  anything, and the honest gap is more useful than a convincing mock.

---

## What this fixes about version one

- It stops being a bespoke solution for one factory and becomes a product with a
  floor and an office.
- It gives the design system a second register: dense, elevated, data-rich,
  because a supervisor at a desk in an office has none of the constraints of a
  technician under washdown lighting.
- It shows information architecture, data density and visual craft, none of which
  three screens and a microphone button could demonstrate.
- It replaces an assumed deployment model with their published one.
