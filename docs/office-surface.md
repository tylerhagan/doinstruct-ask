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
explicit: *"No app. No login. No barriers."* Access is by QR code or a link in
WhatsApp, SMS, Beekeeper or Flip. The Echterhoff case study describes 670
construction workers completing safety briefings *"on personal smartphones"*.

I had inferred a shared wall-mounted terminal from hygiene-zone phone
restrictions. That inference was reasonable and it was not their model, and
because every subsequent cut hung off it, the whole case study inherited a
deployment nobody asked for. That is why it read as bespoke.

**Language selection is their first screen, not a setting.** Their flow is scan,
pick a language, begin. My prototype silently defaulted to Romanian and buried
language in a status bar. Their pattern is better and it is already familiar to
every worker who has used the training product.

**They already do gap analysis, but for a different gap.** The Manager product
offers *"department-level evaluations and gap identification"* for training
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

## The hard principle: this cannot become a surveillance tool

The first version argued that asking for help carries a social cost, and that the
copy works hard to make asking survivable. All of that dies the moment a
supervisor can see who asked what.

So the boundary is absolute and it shapes the entire information architecture:

**Aggregate by machine, line, shift and document. Never by person.**

A supervisor sees that Filler F2 produced fourteen unanswered questions this
week. They cannot see that nine came from one technician. When a question is
escalated, the responder sees the question and the machine, and no name.

Three consequences that fall out of it:

1. There is no people view, no leaderboard, no per-worker history. Not hidden
   behind a permission, absent from the data model.
2. The audit trail records that an answer was given and verified, not who needed
   it.
3. A German works council can be shown this in one screen, which is a commercial
   feature and not only an ethical position.

The one place identity survives is the responder: answers are attributed to the
person who wrote them, because accountability for a safety instruction has to
land on a named human.

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

| Screen | Purpose | Why it earns its place |
| --- | --- | --- |
| Queue | Waiting questions by asset | The supervisor's actual job |
| Answer composer | Reply becomes canonical knowledge | Where time converts to asset |
| Coverage | Gaps by machine, line, shift, over time | Tells you which document to fix |
| Asset detail | One machine's question history and documents | Where a maintenance planner lives |
| Knowledge entry | A captured answer, its provenance and review state | Audit and trust |
| Audit export | Filtered, timestamped, downloadable | Their existing compliance moat |

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
