# State Source Discovery SOP

Purpose: build complete, repeatable source coverage for each state before ingestion begins.

This exists because partial source discovery creates fake confidence. The Nevada NDOW miss was not an ingestion problem, it was a discovery problem. We found the first obvious PDFs, but missed adjacent files on the parent source pages.

## Rule 1

Start at the parent page, not the file.

Never begin with a single PDF URL and assume you have coverage.

## Required discovery flow

### 1. Map the source tree

For every state, identify the top-level official sources first:

- main agency site
- draw / application portal
- hunt statistics page
- bonus / preference point page
- regulations page
- publications or library page
- GIS / ArcGIS / open data hub
- commission / quota / season-setting pages

Output a source map before ingesting anything.

### 2. Enumerate all linked assets

From each parent page, inventory all current-year assets:

- PDF
- Excel / XLSX
- CSV
- HTML tables
- ArcGIS layers / map experiences
- supporting summaries, trend docs, comp tables, trophy tables, and unit-group reports

Do not stop at the first machine-readable file. Supporting documents often contain context the spreadsheet does not.

### 3. Build a coverage matrix

For each state, track by:

- year
- species
- residency split
- weapon split
- doc type
- source URL
- ingest status
- notes / gaps

Minimum doc types to check for:

- draw odds / draw stats
- bonus / preference point data
- harvest by unit / unit group
- hunt summaries
- trend / comparative tables
- quotas
- season dates / regs
- GIS / map references

### 4. Identify the canonical source first

Rank sources in this order:

1. official structured data, XLSX/CSV/API
2. official HTML tables
3. official PDFs
4. official ArcGIS/open data
5. commission docs / summaries
6. forums / expert commentary for language only, not facts

Use the canonical source for primary ingestion. Use the rest for reference, RAG, QA, and gap-filling.

### 5. Verify completeness before ingest

Before writing ingestion code, answer these questions:

- Do we have all species shown on the page?
- Do we have all current-year docs linked from the page?
- Are there supporting April/June summary docs beyond the March harvest PDFs?
- Are resident/nonresident splits present and accounted for?
- Are archery, muzzleloader, ALW, junior, guided, antlered, antlerless variants present?
- Is there an ArcGIS or data hub source we have not captured yet?

If any answer is "I don't know," discovery is not done.

## Ingestion order

1. ingest canonical structured source
2. ingest official supporting PDFs into documents layer
3. ingest GIS / ArcGIS references
4. record gaps explicitly
5. only then say coverage is complete

## Required output for each state

Every state pass should produce:

### Source inventory
- parent pages
- asset count by doc type
- species coverage
- current-year URLs

### Gap report
- missing species
- missing years
- missing residency or weapon splits
- sources requiring manual review

### Ingestion plan
- primary source
- support sources
- reference-only sources
- follow-up actions

## Nevada lesson

What went wrong:
- started from direct PDFs
- did not begin with `hunt-statistics` and `bonus-point-data`
- missed adjacent April tables, summaries, and trends

What the correct move was:
- enumerate parent pages first
- crawl all current-year links
- compare discovered files against expected species/doc-type coverage
- ingest from inventory, not from guesses

## Guardrails

- Never assume one PDF equals one species' full data package.
- Never assume one spreadsheet replaces supporting PDFs.
- Never rely on filename guessing when a parent page exists.
- Never say "done" until page inventory and ingested inventory reconcile.

## Definition of done

A state is only "covered" when:

- official parent pages are mapped
- current-year assets are enumerated
- coverage matrix is complete
- canonical structured sources are ingested
- supporting documents are ingested or explicitly deferred
- GIS / ArcGIS references are captured
- remaining gaps are named, not implied
