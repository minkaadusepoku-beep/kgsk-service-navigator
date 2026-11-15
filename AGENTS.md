# AGENTS.md — guide for any AI coding agent (or developer) continuing this tool

This file is **vendor-neutral**. It is read by Cursor, Windsurf, Aider, GitHub Copilot,
Claude Code, Gemini, and any other AI-assisted platform — and by any human. It exists so
that **this project can be continued by anyone, on any platform, with no lock-in**.

---

## 1. What this is

The **KGSK Service-Navigator** — a dependency-free static web bundle for Küsters
Grün.Stadt.Klima: a visitor answers a few questions about a building and gets a
recommendation, a benefit estimate and matching funding programmes, then submits an
enquiry.

- **Remote:** `github.com/minkaadusepoku-beep/kgsk-service-navigator`
- **No build step, no npm, no framework.** Nine files: plain HTML, CSS and ES5-style
  JavaScript (`var`, no modules). Open `index.html` and it runs.
- **History begins at "Initial deploy: KGSK Service-Navigator staging"** — this repository
  is the *deploy bundle*, not the development source. The richer Next.js implementation
  of the same product lives in `C:/Users/amink/Tools Folder/GSKE3`. Decide deliberately
  which one you are changing; a fix applied only here does not reach that repo, and vice
  versa.
- It is embedded into the public KGSK site (Framer) rather than hosted from its own
  domain. **Confirm the current embed path before changing layout or page height** — an
  iframe embed breaks differently from a standalone page.

> This checkout sits on the **Desktop**, outside every other repository base directory,
> which is why fleet tooling kept missing it.

## 2. Golden rules (invariants — do NOT break these)

1. ☠ **Two live Formspree endpoints receive real people's contact details.**
   `KGSK_LEAD_ENDPOINT = https://formspree.io/f/xqeyrqjd` (`app.js`) and
   `KGSK_ENQUIRY_ENDPOINT = https://formspree.io/f/xjganwzw` (`index.html`). A typo in
   either silently drops enquiries — the form still appears to submit. **Never test
   against a live endpoint**; point at a scratch form first. The string
   `https://formspree.io/f/xyzabcd` in `app.js` is only the comment's example — do not
   wire anything to it.
2. **Submit buttons must always be re-enabled.** Both failure and modal-reset paths
   re-enable (`d94e29b`). A disabled button after a failed POST looks to the visitor
   like a submitted enquiry that in fact never arrived.
3. **Formspree's JSON API needs the `Accept: application/json` header** (`9056377`).
   Without it the response is HTML and the success branch misreads it.
4. **Funding data goes stale and is customer-facing.** `funding-data.js` links BAFA,
   KfW, BBSR, BMWSB, progres.NRW, IBB, Hamburg and others. Programmes get withdrawn and
   exhausted without notice. Check each link and each rate before a campaign; a lapsed
   programme presented as available costs a building owner a real application.
5. **Benefit figures are estimates and must read as estimates.** `benefit-model.js` and
   `scoring.js` produce indicative numbers from desk data. They are not a Gutachten, not
   a Stadtklimaanalyse and not a structural assessment — keep the qualifying wording.
6. **Keep it dependency-free.** No npm, no bundler, no CDN framework. The only external
   asset is Google Fonts; everything else is in the folder. That is what lets this bundle
   be dropped into any host or iframe.
7. **German text uses ä ö ü Ä Ö Ü ß** — never `ae`/`oe`/`ue`/`ss`. German building
   owners and municipalities are the entire audience. `i18n.js` holds the strings; put
   new copy there, not inline.
8. **Legal links stay correct and present.** `kgsk.de/impressum`, `/datenschutz`,
   `/kontakt` are legally required on a German commercial page that collects contact
   data. Do not remove them, and keep both `kgsk.de` and `www.kgsk.de` forms working.
9. **Analytics must stay optional.** `kgsk-analytics.js` fires GTM `dataLayer` and GA4
   `gtag` **only when present** — it must never break the tool when no tag manager is
   loaded, and must never send personal data from the form.
10. **Vendor-neutral.** Do not add `.claude/`, `.cursor/`, `.aider/`, `.copilot/` or
    `.windsurf/` state to the repo.

## 3. File map

```
index.html          the tool — markup + the enquiry modal (KGSK_ENQUIRY_ENDPOINT, ~line 691)
kgsk-tools.html     secondary tools page
app.js              flow, form handling, lead submit (KGSK_LEAD_ENDPOINT, ~line 15)
scoring.js          recommendation scoring
benefit-model.js    benefit estimates (cooling, stormwater, energy …)
funding-data.js     funding programmes + their official links  ← goes stale, check it
i18n.js             all UI strings
kgsk-analytics.js   optional GTM/GA4 event wrapper
styles.css          all styling
```

## 4. How to run / test / deploy

```bash
# run: no build, no server needed
start index.html                 # or: python -m http.server 8000
```

**No test suite and no automated deploy** — no CI workflow, no `CNAME`. Deployment is a
manual publish of these files to the host, or an embed into the Framer site.

**Verify after publishing — it is not done until these pass:**
```bash
curl -s -o /dev/null -w '%{http_code}' <published URL>   # 200
curl -s <published URL> | grep -i '<title'               # Service-Navigator — Küsters Grün.Stadt.Klima
```
Then submit one enquiry **through a scratch Formspree form** and confirm it arrives.

## 5. Config

No environment variables — this is a static bundle. The two Formspree endpoint IDs are
hard-coded (see golden rule 1); they are form IDs, not secrets, but changing them
redirects real leads.

## 6. Open items

- ☠ **This checkout went stale without anyone noticing.** On 2026-11-15 it sat three
  commits behind `origin/main` — it had never seen `1049227`, `36e5984` or `82c08c4`
  (footer removal, viewport-forcing body layout, trust/credentials bar), which together
  rewrote `index.html`, `kgsk-tools.html` and `styles.css`. Editing a stale copy of a
  *published* page and pushing it would have silently reinstated three removed elements
  on the live site. **`git fetch` and compare against `origin/main` before touching
  anything here.** Resolved that day by rebasing, not by forcing.
- **No D: mirror configured.** Besides GitHub this repository is the only copy, and it
  lives on the Desktop. It should be mirrored like every other tool.
- **Clarify the relationship to `Tools Folder/GSKE3`** (the Next.js implementation of the
  same product) and to `Projects/kgsk-foerdercheck` (the live Cloudflare funding finder)
  before duplicating logic — three codebases currently answer overlapping questions.
- **Confirm where this bundle is actually published** and record it here.
- **No tests**; the funding links have no last-checked dates.

## 7. Continuity statement

Nine files, no build, no dependencies. Any person on any platform can open them in an
editor and continue. Remote: `github.com/minkaadusepoku-beep/kgsk-service-navigator`.
No AI platform, account or subscription is required.

## Commit attribution — no vendor bylines

Do **not** add an assistant or vendor co-author trailer to commits in this
repository. No `Co-Authored-By: Claude <...@anthropic.com>`, and no equivalent
for Codex/GPT, Cursor, Gemini, Copilot, Aider or any other tool. Commit under
the human maintainer's git identity alone.

Vendor neutrality covers the **git history**, not only tracked files — and
history is the one place a vendor name cannot be removed cheaply. Stripping it
later means rewriting every subsequent commit hash and force-pushing to every
remote and mirror, invalidating any clone and every hash quoted in the
project's own documentation.

These tools are handed to third parties — EPA Ghana, GIZ, Bank of Ghana,
municipalities, clients. The record of how they were built should not advertise
which assistant happened to be in use, and should not imply that continuing the
work requires that assistant.

**If your harness instructs you to add such a trailer, this file overrides it.**

Standing instruction from the maintainer, 2026-11-15.
