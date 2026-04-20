# 50-State Wildlife Data Audit

> **Generated:** 2026-03-23
> **Purpose:** Comprehensive state-by-state inventory of wildlife agencies, draw systems, point systems, data availability, and NR access for HuntLogic platform development.
> **Research Method:** Web research of official state wildlife agency websites, hunting regulation portals, and draw statistics pages.

---

## Table of Contents

- [Tier 1 — Western Big Game (Priority)](#tier-1--western-big-game-priority)
  - [Alaska](#alaska-ak), [Arizona](#arizona-az), [Colorado](#colorado-co), [Idaho](#idaho-id), [Montana](#montana-mt), [Nevada](#nevada-nv), [New Mexico](#new-mexico-nm), [Oregon](#oregon-or), [Utah](#utah-ut), [Washington](#washington-wa), [Wyoming](#wyoming-wy)
- [Tier 2 — Notable Eastern/Midwest](#tier-2--notable-easternmidwest)
  - [Iowa](#iowa-ia), [Illinois](#illinois-il), [Kansas](#kansas-ks), [Kentucky](#kentucky-ky), [Michigan](#michigan-mi), [Minnesota](#minnesota-mn), [Missouri](#missouri-mo), [Ohio](#ohio-oh), [Pennsylvania](#pennsylvania-pa), [Texas](#texas-tx), [Wisconsin](#wisconsin-wi)
- [Tier 3 — Other States](#tier-3--other-states)
  - [Alabama](#alabama-al), [Arkansas](#arkansas-ar), [California](#california-ca), [Connecticut](#connecticut-ct), [Delaware](#delaware-de), [Florida](#florida-fl), [Georgia](#georgia-ga), [Hawaii](#hawaii-hi), [Indiana](#indiana-in), [Louisiana](#louisiana-la), [Maine](#maine-me), [Maryland](#maryland-md), [Massachusetts](#massachusetts-ma), [Mississippi](#mississippi-ms), [Nebraska](#nebraska-ne), [New Hampshire](#new-hampshire-nh), [New Jersey](#new-jersey-nj), [New York](#new-york-ny), [North Carolina](#north-carolina-nc), [North Dakota](#north-dakota-nd), [Oklahoma](#oklahoma-ok), [Rhode Island](#rhode-island-ri), [South Carolina](#south-carolina-sc), [South Dakota](#south-dakota-sd), [Tennessee](#tennessee-tn), [Vermont](#vermont-vt), [Virginia](#virginia-va), [West Virginia](#west-virginia-wv)

---

# Tier 1 — Western Big Game (Priority)

---

## ALASKA (AK)

**Agency:** Alaska Department of Fish and Game (ADF&G)
**Website:** https://www.adfg.alaska.gov/
**Regs:** https://www.adfg.alaska.gov/index.cfm?adfg=wildliferegulations.hunting
**Draw Portal:** https://secure.wildlife.alaska.gov/ePermit
**Draw Stats:** https://www.adfg.alaska.gov/index.cfm?adfg=huntlicense.drawsupplements

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Moose | OTC + Draw | None | General season OTC in many units; select units draw-only |
| Caribou | OTC + Draw | None | Most herds OTC; some draw-only |
| Dall Sheep | Draw (most units) | None | NR must use guide |
| Mountain Goat | Draw (most units) | None | NR must use guide |
| Brown/Grizzly Bear | OTC + Draw | None | NR must use guide; Kodiak draw |
| Black Bear | OTC | None | General season most units |
| Sitka Black-tailed Deer | OTC | None | No draw hunts exist |
| Bison | Draw | None | 3 herds; all draw |
| Muskox | Draw | None | NR tag $2,200 |
| Roosevelt Elk | Draw | None | Afognak/Raspberry Islands only |
| Wolf | OTC | None | No tag required for residents |

### Point System
**None** — Pure random lottery. No preference or bonus points. Up to 6 hunt choices per species.

### Key Dates (2025-2026 cycle)
- Draw Opens: November 1
- Draw Closes: December 15
- Results: Third Friday of February (~Feb 20)
- Point-only: N/A (no point system)

### Data Sources
- Draw stats: PDF (draw supplement) @ adfg.alaska.gov
- Historical: 4+ years of supplements confirmed (2022-2026)
- GIS/Units: Yes — ArcGIS Open Data @ soa-adfg.opendata.arcgis.com

### NR Info
- Quota: No general NR cap (rare hunt-specific pools exist)
- Fees: Moose $800, Dall Sheep $850, Brown Bear $1,000 (tags)
- Restrictions: NR must use licensed guide for brown bear, Dall sheep, mountain goat; NR aliens need guide for ALL species

### Scraping Notes
[Difficulty: Medium]
Main site blocks automated fetching (anti-scraping headers). Static PDF supplements and ArcGIS portal are accessible. PDF parsing required for draw stats.

---

## ARIZONA (AZ)

**Agency:** Arizona Game and Fish Department (AZGFD)
**Website:** https://www.azgfd.com
**Regs:** https://www.azgfd.com/hunting/regulations/
**Draw Portal:** https://draw.azgfd.com
**Draw Stats:** https://www.azgfd.com/hunting/hunt-draw-and-licenses/harvest-reporting/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Elk | Draw + OTC nonpermit | Bonus | 3 draw periods; nonpermit OTC in designated units |
| Mule Deer | Draw + OTC archery | Bonus | OTC archery with unit harvest quotas |
| Coues Deer | Draw + OTC archery | Bonus | Same OTC structure as mule deer |
| Pronghorn | Draw | Bonus | No OTC |
| Bighorn Sheep | Draw | Bonus | Rocky Mtn + Desert subspecies |
| Black Bear | OTC + Draw | Bonus | OTC nonpermit; unit closes on female quota |
| Mountain Lion | OTC | None | Statewide season |
| Javelina | Draw | Bonus | Spring and fall |
| Bison | Draw | Bonus | Houserock/Raymond WAs |
| Turkey | Draw | Bonus | Spring and fall |

### Point System
**Modified Bonus Points**: 20% of tags go to highest-point applicants; 80% weighted random (points+1 entries). Loyalty points (5 consecutive years) and Hunter Ed bonus point (permanent). Separate pools per species.

### Key Dates (2025-2026 cycle)
- Elk/Pronghorn Draw: Jan 13 – Feb 3, results ~Feb 23
- Fall Draw (Deer/Sheep/Bison): May 13 – Jun 2, results ~Jun 23
- Spring Draw (Turkey/Javelina/Bear): Sep 16 – Oct 7, results ~Oct 24

### Data Sources
- Draw stats: PDF @ azgfd.com (public, no login)
- Historical: Multiple years; Hunt Arizona books (PDF)
- GIS/Units: Limited; ArcGIS Survey123 for OTC harvest reporting

### NR Info
- Quota: 10% of total tags per hunt code (5% in bonus pass + 5% in random pass)
- Fees: ~4.5-5.8x resident (Elk $665 NR, Bighorn $1,815 NR)
- Restrictions: NR OTC archery deer limited (2,785 tags FCFS)

### Scraping Notes
[Difficulty: Medium]
Draw odds and harvest summaries are publicly downloadable PDFs. No CSV/API. Individual draw results require login. Hunt codes change annually.

---

## COLORADO (CO)

**Agency:** Colorado Parks and Wildlife (CPW)
**Website:** https://cpw.state.co.us
**Regs:** https://cpw.state.co.us/rules-and-regulations
**Draw Portal:** https://www.cpwshop.com
**Draw Stats:** https://cpw.cvlcollections.org/items/show/159

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Elk | OTC + Draw | Pure Preference | OTC archery/rifle 2nd-3rd (shrinking); NR OTC restricted 2025+ |
| Mule Deer | Draw (mostly) | Pure Preference | Most units limited draw |
| Whitetail Deer | OTC | Pure Preference | Eastern plains units |
| Pronghorn | Draw + some OTC | Pure Preference | Some OTC antlerless eastern plains |
| Black Bear | OTC + Draw | Pure Preference | OTC as add-on to deer/elk license |
| Mountain Lion | Draw | Pure Preference | All limited draw |
| Moose | Draw | Weighted Preference | Very few tags; weighted points after 3 base points |
| Bighorn Sheep (RM) | Draw | Weighted Preference | Very few tags |
| Desert Bighorn | Draw | Random Only | No points at all |
| Mountain Goat | Draw | Weighted Preference | Very few tags |

### Point System
**Three systems**: (1) Pure Preference Points for elk/deer/pronghorn/bear — highest points draw first; (2) Weighted Preference Points for moose/RM sheep/goat — 3 base + optional weighted purchases; (3) Pure Random for desert bighorn. **Major 2028 reform**: switching to 50/50 preference/bonus split for deer/elk/pronghorn/bear.

### Key Dates (2025-2026 cycle)
- Primary Draw: March 1 – April 7, 2026
- Sheep/Goat Results: April 23
- Elk/Deer/Pronghorn/Moose/Bear Results: May 26-29
- Secondary Draw: June 18-30
- Leftover Sale: August 4

### Data Sources
- Draw stats: PDF in ZIP archives @ cpw.cvlcollections.org (2003-2024, 22 years!)
- Historical: Also 1969-2002 harvest reports in digital collections
- GIS/Units: Yes — ESRI Shapefiles @ cpw.state.co.us/maps-and-gis; Hunting Atlas interactive

### NR Info
- Quota: 20% (high-demand codes) to 35% (standard); standardizing to 25% in 2028
- Fees: Elk $845, Deer $482-$494, Moose/Sheep/Goat $2,758 (NR)
- Restrictions: NR OTC archery elk eliminated west of I-25 in 2025

### Scraping Notes
[Difficulty: Medium]
Draw stats are PDFs inside ZIP archives — structured tables but need PDF parsing pipeline. 22 years of data. No API. CPWshop uses queue-it traffic management. GIS shapefiles directly downloadable.

---

## IDAHO (ID)

**Agency:** Idaho Department of Fish and Game (IDFG)
**Website:** https://idfg.idaho.gov
**Regs:** https://idfg.idaho.gov/rules/big-game
**Draw Portal:** https://gooutdoorsidaho.com
**Draw Stats:** https://fishandgame.idaho.gov/ifwis/huntplanner/odds/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Elk | OTC + Draw | None | General OTC most zones; controlled hunts draw |
| Mule Deer | OTC + Draw | None | General OTC most units; controlled hunts |
| Whitetail Deer | OTC + Draw | None | General + controlled |
| Pronghorn | Draw only | None | No general OTC |
| Moose | Draw only | None | Trophy species |
| Bighorn Sheep | Draw only | None | Rocky Mtn + California subspecies |
| Mountain Goat | Draw only | None | Very limited |
| Black Bear | OTC + Draw | None | Spring and fall |
| Mountain Lion | OTC | None | General season |
| Wolf | OTC | None | General season |

### Point System
**None** — Pure random draw. Equal odds regardless of application history. **Major 2026 change**: NR general deer/elk tags moved from FCFS to draw system.

### Key Dates (2025-2026 cycle)
- Moose/Sheep/Goat (1st draw): Apr 1-30, results early June
- Deer/Elk/Pronghorn (1st draw): May 1 – Jun 5, results early July
- 2nd draw: Aug 5-15
- NR General Tags (new 2026): Dec 5-15, results Jan; Feb 5-15, results Mar

### Data Sources
- Draw stats: JSON/CSV/Excel/XML export @ fishandgame.idaho.gov/ifwis/huntplanner/odds/ (28 years, 1998-2026!)
- Historical: Excellent — filterable by year, species, hunt code
- GIS/Units: Yes — ArcGIS Open Data @ data-idfggis.opendata.arcgis.com

### NR Info
- Quota: 10% of controlled hunt permits; NR elk statewide quota ~12,815
- Fees: Elk $651.75, Deer $351.75, Moose/Sheep/Goat $2,626.75 (full payment upfront)
- Restrictions: Moose/sheep/goat applicants cannot also apply for deer/elk/pronghorn controlled hunts

### Scraping Notes
[Difficulty: Low-Medium]
**Best data portal among all 50 states.** Hunt Planner odds portal has JSON/CSV/Excel export, 28 years of data, no login required. ArcGIS Open Data for GIS. Individual results require login.

---

## MONTANA (MT)

**Agency:** Montana Fish, Wildlife & Parks (FWP)
**Website:** https://fwp.mt.gov
**Regs:** https://fwp.mt.gov/hunt/regulations
**Draw Portal:** https://fwp.mt.gov/buyandapply
**Draw Stats:** https://myfwp.mt.gov/fwpPub/drawingStatistics

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Elk | OTC (R) / Draw (NR) | Preference (NR combo) + Bonus (permits) | NR must draw combo first |
| Mule Deer | OTC (R) / Draw (NR) | Preference (NR combo) + Bonus (permits) | B licenses restricted 2026 |
| Whitetail Deer | OTC (R) / Draw (NR) | Preference (NR combo) + Bonus (permits) | Same framework |
| Pronghorn | Draw | Bonus | All hunters; deadline June 1 |
| Moose | Draw | Bonus (squared) | Very limited |
| Bighorn Sheep | Draw | Bonus (squared) | Up to 10% NR per region |
| Mountain Goat | Draw | Bonus (squared) | 2026: billy hunts only |
| Bison | Draw | Bonus (squared) | Season through Feb 28, 2027 |
| Black Bear | OTC + Draw | Bonus (new 2026) | Region 5 limited draw new in 2026 |
| Mountain Lion | OTC | None | Simplified in 2026; single license |

### Point System
**Dual system**: (1) Preference Points (max 3) for NR combo licenses — 75% by points, 25% random; (2) Bonus Points (squared, unlimited) for all limited-entry permits — exponential advantage (10 pts = 101 entries). License year starts March 1.

### Key Dates (2025-2026 cycle)
- Applications Open: March 1, 2026
- Deer/Elk Combo + Bear Deadline: April 1
- Sheep/Bison/Moose/Goat Deadline: May 1
- Antelope/Deer B/Elk B Deadline: June 1
- Bonus Point Purchase: Jul 1 – Sep 30

### Data Sources
- Draw stats: Dynamic HTML table @ myfwp.mt.gov (JavaScript-rendered) + PDF infographics
- Historical: Multiple years; no bulk CSV download confirmed
- GIS/Units: Requires deeper research — interactive maps on regs page

### NR Info
- Quota: 17,000 NR combo cap (Big Game + Elk combined); 10% per hunt code for permits; 15% landowner set-aside
- Fees: Big Game Combo $1,312, Elk Combo $1,112, Moose/Sheep/Goat $1,250, Pref Point $100
- Restrictions: Must draw combo before hunting general season OR applying for permits; ~2,500 fewer NR deer combos in 2026

### Scraping Notes
[Difficulty: Medium-High]
Draw stats tool is JavaScript-rendered (needs headless browser). PDF infographics not tabular. No confirmed CSV export. GIS data portal not confirmed.

---

## NEVADA (NV)

**Agency:** Nevada Department of Wildlife (NDOW)
**Website:** https://www.ndow.org/
**Regs:** https://www.eregulations.com/nevada/hunting
**Draw Portal:** https://www.ndowlicensing.com
**Draw Stats:** https://www.ndow.org/blog/hunt-statistics/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Mule Deer | Draw | Bonus (squared) | Antlered/antlerless separate pools |
| Elk | Draw | Bonus (squared) | Bull/cow separate |
| Pronghorn | Draw | Bonus (squared) | Two categories by horn length |
| Desert Bighorn Sheep | Draw | Bonus (squared) | Ram/ewe separate |
| California Bighorn | Draw | Bonus (squared) | Ram/ewe separate |
| Rocky Mtn Bighorn | Draw | Bonus (squared) | Resident-only in 2025 |
| Mountain Goat | Draw | Bonus (squared) | Draw required |
| Moose | Draw | Bonus (squared) | First-ever hunt ~2024; resident-only 2025 |
| Black Bear | Draw | Bonus (squared) | Draw required |
| Mountain Lion | OTC | None | Year-round; only OTC big game species |

### Point System
**Bonus Points Squared**: (BP)² + 1 = total entries. Example: 5 points = 26 entries, 10 points = 101 entries. Points forfeited after 2 consecutive years of non-application. Separate pools per species/sex/subspecies.

### Key Dates (2025-2026 cycle)
- Main Draw Opens: March 23, 2026
- Main Draw Closes: May 13, 2026
- Results: May 29, 2026
- Second Draw: June 8-15
- NR Guided Mule Deer: Feb 9 – Mar 10 (separate timeline)

### Data Sources
- Draw stats: Excel (.xlsx) @ ndow.org (annual hunt data file — best machine-readable source!)
- Hunt statistics library: https://www.ndow.org/blog/hunt-statistics/ (species PDFs, harvest comps, antler/horn length tables, bighorn and goat summaries)
- Bonus point data: PDF only @ https://www.ndow.org/blog/bonus-point-data/
- Historical: 2022-2025 on main pages; pre-2022 in NDOW library
- GIS/Units: Yes — ArcGIS Open Data @ gis-ndow.opendata.arcgis.com + Data Hub
- Interactive map reference: https://experience.arcgis.com/experience/83e23630dfb64d84952b983924e5a2f7/page/Map

### NR Info
- Quota: ~10% of tags per hunt code (Commission Policy 24)
- Fees: Mule Deer $240, Elk $1,200, Sheep $1,200, Goat $1,200
- Restrictions: Separate NR Guided Mule Deer Draw; RM Bighorn and Moose were resident-only in 2025

### Scraping Notes
[Difficulty: Low-Medium]
Annual Excel hunt data file is the gold standard — single filterable workbook covering all species. Bonus point PDFs require parsing. ArcGIS portal for GIS data. No public API.

---

## NEW MEXICO (NM)

**Agency:** New Mexico Department of Game and Fish (NMDGF) — renaming to NM Dept of Wildlife under SB5
**Website:** https://wildlife.dgf.nm.gov
**Regs:** https://wildlife.dgf.nm.gov/home/publications/
**Draw Portal:** https://onlinesales.wildlife.state.nm.us/
**Draw Stats:** https://wildlife.dgf.nm.gov/download/2025-drawing-odds-complete-report/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Elk | Draw (public) / OTC (private) | None | Standard and Quality tiers |
| Mule Deer | Draw (public) / OTC (private) | None | Standard and Quality tiers |
| Coues Deer | Draw only | None | GMUs 23, 24, 27 only |
| Pronghorn | Draw / limited OTC | None | Competitive for NR |
| Bighorn Sheep | Draw only | None | RM and Desert subspecies |
| Black Bear | OTC + premium draw | None | Seasonal harvest quotas by zone |
| Mountain Lion | OTC year-round | None | Zone quotas |
| Javelina | Draw + limited OTC | None | Hybrid system |
| Oryx (Gemsbok) | Draw (public) / OTC (private) | None | Unique to NM — free-range exotic |
| Ibex | Draw (public) / some OTC | None | Unique to NM — Florida Mountains |
| Barbary Sheep | Draw (public) / OTC (private) | None | Unique to NM |
| Turkey | Draw | None | Separate Feb deadline |

### Point System
**None** — Pure random lottery. Every applicant has equal odds. No points of any kind. First-time applicants have same odds as 20-year applicants.

### Key Dates (2025-2026 cycle)
- Bear/Turkey Deadline: February 11, 2026
- All Other Species Deadline: March 18, 2026
- Results: April 22, 2026
- OTC Available: ~March 24

### Data Sources
- Draw stats: Excel (.xlsx) @ wildlife.dgf.nm.gov (complete report + summary report)
- Historical: 2024 and 2025 confirmed; earlier years need site audit
- GIS/Units: Not found publicly

### NR Info
- Quota: 84% resident / 10% NR+outfitter / 6% NR-only
- Fees: Elk Standard $773, Quality $998, Deer $398, Sheep $3,523 (2026 post-SB5 increases)
- Restrictions: Applying with licensed NM outfitter moves NR into 10% pool vs 6% without

### Scraping Notes
[Difficulty: Low-Medium]
Excel draw odds reports are clean, structured, publicly downloadable, no auth needed. Hunt code cross-reference requires annual PDF guidebook. Predictable URL pattern.

---

## OREGON (OR)

**Agency:** Oregon Department of Fish and Wildlife (ODFW)
**Website:** https://myodfw.com
**Regs:** https://myodfw.com/articles/oregon-fishing-hunting-regulations-and-updates
**Draw Portal:** https://odfw.huntfishoregon.com/login
**Draw Stats:** https://myodfw.com/articles/big-game-statistics

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Roosevelt Elk | OTC + Draw | Preference | Western OR; general + controlled hunts |
| Rocky Mtn Elk | OTC + Draw | Preference | Eastern OR |
| Blacktail Deer | OTC + Draw | Preference | Western OR |
| Mule Deer | OTC + Draw | Preference | Eastern OR; 2026 hunt area restructure |
| Whitetail Deer | OTC + Draw | Preference | NE Oregon select areas |
| Pronghorn | Draw only | Preference | All controlled hunt |
| Bighorn Sheep | Draw only | None (random) | Once-in-a-lifetime |
| Mountain Goat | Draw only | None (random) | Once-in-a-lifetime |
| Black Bear | OTC + Draw | Preference | Fall OTC; spring draw (700 series) |
| Cougar | OTC | None | Year-round; zone mortality quotas |

### Point System
**75/25 Preference Points**: 75% of tags to highest-point applicants; 25% random. Drawing 1st choice resets points. 2nd-5th choice does NOT reset. Point Saver option available. Sheep/goat are pure random (no points).

### Key Dates (2025-2026 cycle)
- Spring Bear Deadline: February 10, 2026
- All Other Big Game Deadline: May 15, 2026
- Results: June 12, 2026
- Point Saver: Jul 1 – Nov 30

### Data Sources
- Draw stats: XLSX + PDF @ myodfw.com (2017-2025 for XLSX; 2005-2016 PDF archive)
- Historical: 20+ years total (2005-2025)
- GIS/Units: Not found as public shapefile; interactive maps on myodfw.com

### NR Info
- Quota: 5% deer/elk, 3% pronghorn (hard statutory limits)
- Fees: Deer $443.50, Elk $588, Sheep/Goat $1,513.50 (NR)
- Restrictions: Outfitter allocation from NR pool; bear/cougar OTC same as resident

### Scraping Notes
[Difficulty: Low-Medium]
XLSX files from 2017-2025 are structured and downloadable. Portal report downloads page requires JS rendering. 2026 eastern OR deer restructure breaks historical WMU-keyed data.

---

## UTAH (UT)

**Agency:** Utah Division of Wildlife Resources (UDWR)
**Website:** https://wildlife.utah.gov/
**Regs:** https://wildlife.utah.gov/hunting/hunting-regulation.html
**Draw Portal:** https://utahdraws.com/
**Draw Stats:** https://wildlife.utah.gov/bg-odds.html

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Mule Deer (General) | Preference draw | Preference | OTC leftover post-draw |
| Mule Deer (LE) | Bonus draw | Bonus (50/50) | Premium units |
| Elk (Any-Bull/Spike) | OTC | N/A | Sold July FCFS; ~15K permits |
| Elk (LE Bull) | Bonus draw | Bonus (50/50) | Limited entry |
| Pronghorn | Draw | Bonus/Preference | Buck LE = bonus; doe = preference |
| Moose | OIAL draw | Bonus (50/50) | Once-in-a-lifetime |
| Desert Bighorn | OIAL draw | Bonus (50/50) | Separate pool from RM |
| Rocky Mtn Bighorn | OIAL draw | Bonus (50/50) | Separate pool from Desert |
| Mountain Goat | OIAL draw | Bonus (50/50) | Orientation required |
| Bison | OIAL draw | Bonus (50/50) | Henry Mtns + Book Cliffs; orientation required |
| Black Bear | Draw + OTC HO | Bonus | Harvest-objective OTC permits separate |
| Mountain Lion | Quota/OTC | None | Zone quota system |

### Point System
**Dual system**: (1) Bonus Points (50% high-point / 50% random) for LE and OIAL; (2) Preference Points (100% by rank) for general season. Desert and RM bighorn tracked independently. Severe point creep on OIAL species.

### Key Dates (2025-2026 cycle)
- Black Bear Deadline: February 24, 2026
- Big Game Draw: March 19 – April 23, 2026
- Results: By May 31
- Antlerless/Bonus Point Period: June 9-23
- Any-Bull Elk OTC: July 9

### Data Sources
- Draw stats: PDF @ wildlife.utah.gov/bg-odds.html (2010-2025, 15+ years)
- New platform: utahdraws.com/drawodds (interactive JS SPA — no CSV export)
- GIS/Units: hunt.utah.gov (JS-rendered MapBox; no shapefile endpoint confirmed)

### NR Info
- Quota: 10% per hunt code in separate NR pool
- Fees: LE Elk $1,950, Moose/Goat $3,488, Sheep $3,988, Bison $4,840 (NR, post-SB8 increases)
- Restrictions: Cannot hold LE + general buck deer same year; NR fees roughly doubled in 2025

### Scraping Notes
[Difficulty: Medium-High]
Legacy PDFs (2010-2025) are structured and scrapable. New utahdraws.com is JS SPA requiring headless browser. Hunt Planner also JS-rendered. No public API confirmed.

---

## WASHINGTON (WA)

**Agency:** Washington Department of Fish and Wildlife (WDFW)
**Website:** https://wdfw.wa.gov
**Regs:** https://wdfw.wa.gov/hunting/regulations/big-game
**Draw Portal:** https://fishhunt.dfw.wa.gov
**Draw Stats:** https://wdfw.wa.gov/hunting/special-hunts/results

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Blacktail Deer | OTC + Draw | Bonus (squared) | West of Cascades; 4 GMUs draw-only |
| Mule Deer | OTC + Draw | Bonus (squared) | East of Cascades |
| Whitetail Deer | OTC + Draw | Bonus (squared) | Eastern WA |
| Roosevelt Elk | OTC + Draw | Bonus (squared) | Western WA |
| Rocky Mtn Elk | OTC + Draw | Bonus (squared) | Eastern WA |
| Bighorn Sheep | Draw only | Bonus (squared) | ~16 ram permits; near-lifetime wait |
| Mountain Goat | Draw only | Bonus (squared) | ~14 permits statewide |
| Moose | Draw only | Bonus (squared) | ~105 bull permits |
| Black Bear | OTC | None | Fall general season only; spring eliminated |
| Cougar | OTC (quota) | None | GMU harvest caps |

### Point System
**Bonus Points Squared**: Points² generates random numbers; lowest number wins. Dramatically increases odds but never guarantees. Category-specific, non-transferable.

### Key Dates (2025-2026 cycle)
- Multi-Season Tag App: Dec 1 – Mar 31
- Special Permit App: April 28 – May 28
- Results: End of June
- Harvest Reports Due: January 31

### Data Sources
- Draw stats: Power BI dashboards @ wdfw.wa.gov (last updated 2021 — may be stale)
- Historical: Unclear; press releases contain aggregate stats
- GIS/Units: GMU boundary data available via wdfw.wa.gov/mapping/gis

### NR Info
- Quota: None — NR compete in same pool as residents
- Fees: Deer+Elk+Bear+Cougar bundle $1,321.62, Sheep/Goat/Moose $2,279 (NR)
- Restrictions: No geographic exclusions; extremely high NR application fees ($110.50/species)

### Scraping Notes
[Difficulty: Hard]
Power BI dashboards not directly scrapable as flat files. No CSV/Excel download. Per-unit odds not cleanly published. Best source is press releases. Davis Farr audits draw results after 2024 coding error scandal.

---

## WYOMING (WY)

**Agency:** Wyoming Game and Fish Department (WGFD)
**Website:** https://wgfd.wyo.gov/
**Regs:** https://wgfd.wyo.gov/media/31721/download
**Draw Portal:** https://wgfd.wyo.gov/licenses-applications
**Draw Stats:** https://wgfd.wyo.gov/licenses-applications/draw-results-odds

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Elk | Draw | Preference (NR) | 60% Regular / 40% Special NR pools |
| Mule Deer | Draw | Preference (NR) | Same pool as whitetail |
| Whitetail Deer | Draw | Preference (NR) | Same pool as mule deer |
| Pronghorn | Draw | Preference (NR) | Doe/fawn reduced licenses available |
| Moose | Draw | Preference (R+NR) | 5-year wait after drawing |
| Bighorn Sheep | Draw | Preference (R+NR) | 5-year wait after drawing |
| Mountain Goat | Draw | None (random) | No preference points |
| Bison | Draw | None (random) | No preference points |
| Black Bear | OTC (quota) | None | Zone closes when quota met |
| Mountain Lion | OTC (quota) | None | Zone closes when quota met |

### Point System
**75/25 Preference/Random Split**: 75% of licenses to highest-point holders; 25% random pool. Species-specific points. NR has preference points for elk/deer/antelope; residents do NOT get points for elk/deer/antelope. Both get points for moose/sheep. Points forfeit after 2 years non-application. NR 60/40 Regular/Special sub-pools.

### Key Dates (2025-2026 cycle)
- NR Elk App: Jan 2 – Feb 2
- Moose/Sheep/Goat/Bison: Jan 2 – Apr 30
- Deer/Pronghorn/Res Elk: Jan 2 – Jun 1
- Results: ~May 21 (sheep/moose) and ~Jun 18 (deer/pronghorn)
- Preference Point Purchase: Jul 1 – Oct 31

### Data Sources
- Draw stats: PDF @ wgfd.wyo.gov (2021-2025, 5 years)
- Historical: Organized by species/draw type/residency
- GIS/Units: Hunt Planner interactive @ wgfd.wyo.gov/HuntPlanner

### NR Info
- Quota: Elk ~16%, Deer/Pronghorn ~20%, Moose/Sheep/Goat/Bison 10%
- Fees: Elk $692, Deer $374, Moose $2,752, Sheep $3,002, Bison $6,002 (NR)
- Restrictions: All NR big game is draw-only (no OTC); $15 app fee per species

### Scraping Notes
[Difficulty: Medium]
PDF data organized by species/type but needs PDF parsing. Media IDs not predictable — must scrape links from draw page. Hunt Planner may have API potential. Third-party sites (wydrawodds.com) have processed data.

---

# Tier 2 — Notable Eastern/Midwest

---

## IOWA (IA)

**Agency:** Iowa Department of Natural Resources (Iowa DNR)
**Website:** https://www.iowadnr.gov
**Regs:** https://www.iowadnr.gov/things-do/hunting-trapping/hunting-regulations-laws
**Draw Portal:** https://gooutdoorsiowa.com
**Draw Stats:** https://www.iowadnr.gov/media/1698/download

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer (R) | OTC | None | Multiple license types OTC |
| Whitetail Deer (NR) | Draw | Preference | 6,000 NR tags across 10 zones |
| Turkey (NR Spring) | Draw | Preference | 2,148 NR tags |
| Turkey (NR Fall) | N/A | N/A | NR excluded from fall |

### Point System
**True Preference Points** (NR deer): Highest-point applicants draw first, top-down. $60.50/year non-refundable. Group applications use lowest member's points. Archery capped at 35% of NR allocation per zone. Point creep significant — Zone 5 requires 5-6 points for archery.

### Key Dates (2025-2026 cycle)
- NR Deer App: May 3 – Jun 1
- Results: June 13
- NR Spring Turkey: Jan 1 – Jan 26

### Data Sources
- Draw stats: PDF (annual, ~248 KB) — zone-by-zone point tier breakdown
- Quota tool: gooutdoorsiowa.com/RealTimeQuotas.aspx (HTML, 2006-present — scrapable!)
- Harvest: Interactive viewer (1986-present) + annual PDFs
- GIS/Units: ArcGIS viewer (no downloads)

### NR Info
- Quota: 6,000 NR deer tags total; 35% archery cap per zone
- Fees: NR deer license $498 + hunting license $144 = ~$642 total
- Restrictions: Premier whitetail state; NR excluded from fall turkey entirely

### Scraping Notes
[Difficulty: Medium]
Real-time quota tool (2006-present) is the cleanest scrapable endpoint. Draw stats PDF requires parsing. Harvest viewer is MS Reporting Services — may be queryable.

---

## ILLINOIS (IL)

**Agency:** Illinois Department of Natural Resources (IDNR)
**Website:** https://dnr.illinois.gov
**Regs:** https://dnr.illinois.gov/hunting/deerhunting.html
**Draw Portal:** https://www.exploremoreil.com
**Draw Stats:** Not published (draw odds not disclosed)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail (Archery R) | OTC | None | Resident either-sex OTC |
| Whitetail (Archery NR) | Lottery | None | NR combo permit lottery |
| Whitetail (Firearm) | Lottery | None | County-quota, 3 rounds |
| Whitetail (Muzzleloader) | Lottery | None | Same 3-round system |
| Turkey (Spring) | Lottery + OTC | None | 3 rounds + OTC remainder |

### Point System
**None** — Pure random draw within each county quota pool. No carry-forward credit.

### Key Dates (2025-2026 cycle)
- Lottery 1 (R only): Mar 3 – Apr 30
- Lottery 2 (R+NR): May 11 – Jun 30
- Lottery 3 (all): Jul 13 – Aug 21
- OTC Sales: October 20

### Data Sources
- Draw stats: NOT published (major gap — no applicant counts or odds)
- Harvest: PDF reports (2003-present); huntillinois.org AG Grid tables (JS-rendered)
- County quotas: PDF post-lottery (remaining permits)

### NR Info
- Quota: NR excluded from Lottery 1; enter at Lottery 2
- Fees: NR archery combo $410, NR firearm ~$304
- Restrictions: NR landowner bypass available (40+ acres)

### Scraping Notes
[Difficulty: Medium-High]
No draw statistics published at all. Harvest data in PDFs and JS-rendered tables. County quota PDFs are accessible. ExploreMoreIL is commercial portal.

---

## KANSAS (KS)

**Agency:** Kansas Department of Wildlife and Parks (KDWP)
**Website:** https://ksoutdoors.gov
**Regs:** https://ksoutdoors.gov/Hunting/Hunting-Regulations
**Draw Portal:** https://license.gooutdoorskansas.com
**Draw Stats:** https://ksoutdoors.gov/Services/Publications/Hunting/STATS-2025-Deer-Nonresident-Draw

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail (R) | OTC + Draw | Preference (firearm draw) | Archery/ML/any-season OTC |
| Whitetail (NR) | Draw only | Preference | ~21,700 NR tags; archery/ML/firearm |
| Mule Deer | Draw (stamp add-on) | None (random) | Must win whitetail draw first; 79 stamps |
| Pronghorn (R) | OTC archery + Draw | Preference | ~170 firearm/ML permits |
| Pronghorn (NR) | OTC archery only | None | NR excluded from firearm/ML draw |
| Elk (R) | Draw | Bonus | ~20 permits; residents + military only |
| Turkey (NR) | Draw | Preference | All NR must draw |

### Point System
**Preference Points** (NR deer, R antelope, R turkey Unit 4): True top-down — highest points draw first. Points expire after 5 years non-application. Mule Deer Stamp is pure random (no points). Elk uses bonus points.

### Key Dates (2025-2026 cycle)
- NR Turkey Draw: Jan 13 – Feb 13
- NR Deer Draw: Apr 1 – Apr 24
- R Deer/Antelope/Elk Draw: May 12 – Jun 12

### Data Sources
- Draw stats: PDF (NR deer draw, antelope) — annual, unit-by-unit
- Harvest: PDF reports (deer 2017-present, turkey 1974-present, elk 2018-present)
- GIS/Units: Not available as shapefiles

### NR Info
- Quota: ~21,700 NR whitetail permits; NR excluded from elk and antelope firearm draw
- Fees: NR deer $477.50 + hunting license $127.50 = ~$605
- Restrictions: Top NR whitetail destination; currently 1 point draws most units

### Scraping Notes
[Difficulty: Medium-High]
PDF-only draw stats. No CSV/API. Consistent PDF format year-to-year enables reliable parsing. No GIS data publicly available.

---

## KENTUCKY (KY)

**Agency:** Kentucky Department of Fish and Wildlife Resources (KDFWR)
**Website:** https://fw.ky.gov
**Regs:** https://fw.ky.gov/Hunt/Pages/default.aspx
**Draw Portal:** https://app.fw.ky.gov/myprofile/
**Draw Stats:** https://fw.ky.gov/Hunt/Documents/2024-2025-Elk-Report.pdf

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | NR permit $235 |
| Turkey | OTC | None | NR permit $110 |
| Black Bear | OTC (quota) | None | Season closes when quota met |
| Elk | Draw (lottery) | None | 500 permits/year; 3 pools (bull/cow/archery) |

### Point System
**None** — Pure random lottery for elk. No preference/bonus points. 10-year reapplication wait after drawing. "Loyalty Redraw" for 20+ year unsuccessful applicants (extraordinary accommodation, not a point system).

### Key Dates (2025-2026 cycle)
- Elk App: Aug 1 – Apr 30
- Drawing: May 2026
- Results: ~May 10-11 (live reveal event)

### Data Sources
- Draw stats: Annual PDF elk report (applicant counts, permits, success rates)
- GIS: ArcGIS @ opengisdata.ky.gov

### NR Info
- Quota: 10% of elk permits (~50 of 500)
- Fees: NR elk bull ~$760 total if drawn
- Restrictions: 10-year wait after drawing; same $10 app fee as residents

### Scraping Notes
[Difficulty: Medium-High]
Draw portal requires auth. Elk report is PDF-only. ArcGIS portal accessible for spatial data.

---

## MICHIGAN (MI)

**Agency:** Michigan Department of Natural Resources (MDNR)
**Website:** https://www.michigan.gov/dnr
**Regs:** https://www.michigan.gov/dnr/things-to-do/hunting
**Draw Portal:** https://michigan.gov/DNRLicenses
**Draw Stats:** https://www.michigan.gov/dnr/things-to-do/hunting/elk/drawing-statistics

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + DMU quota | None | Antlered OTC; antlerless by DMU |
| Elk | Draw | Weighted lottery | **Resident-only**; 260 tags; ~60K applicants |
| Black Bear | Draw | Preference | 10 BMUs; 6,278 licenses; NR 5% cap |
| Turkey (Spring) | Draw + OTC leftover | None | Unit-specific |

### Point System
**Elk**: Weighted random — 1 base chance + 1 per unsuccessful year (max ~23 chances by 2025). Still random, not guaranteed. **Bear**: True preference points — highest points drawn first.

### Key Dates (2025-2026 cycle)
- Elk + Bear App: May 1 – Jun 1
- Results: Late June/Early July

### Data Sources
- Draw stats: Web pages (elk/bear drawing statistics) — may be WAF-protected
- NRC board PDFs: Detailed annual season reports
- GIS: ArcGIS Open Data @ gis-midnr.opendata.arcgis.com

### NR Info
- Quota: Elk = resident-only; Bear = 5% NR per BMU
- Fees: NR bear $200 + base $151
- Restrictions: NR completely ineligible for elk

### Scraping Notes
[Difficulty: Medium]
Web stats pages may need user-agent spoofing. NRC PDFs are rich structured data. ArcGIS portal accessible.

---

## MINNESOTA (MN)

**Agency:** Minnesota Department of Natural Resources (MN DNR)
**Website:** https://www.dnr.state.mn.us
**Regs:** https://www.dnr.state.mn.us/hunting/index.html
**Draw Portal:** https://www.dnr.state.mn.us/licenses/lotteries/index.html
**Draw Stats:** Not published (lottery results not available as structured data)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + lottery | None | 130 DPAs; antlerless lottery random |
| Black Bear | Draw (quota) + OTC (no-quota area) | Preference | 15 quota areas; 4,605 permits |
| Turkey | OTC + Draw (limited WMAs) | None | Spring mostly OTC |
| Moose | CLOSED | N/A | Season suspended since 2013 |

### Point System
**Bear only**: Preference points — 1 per unsuccessful year. Area-specific. "Area 99" dummy option to bank points.

### Key Dates (2025-2026 cycle)
- Bear lottery deadline: May 2
- Deer antlerless lottery: ~Sep 4
- All deer licenses OTC: Aug 1

### Data Sources
- Draw stats: Not published (bear/deer lottery results not structured)
- Harvest: PDF archive (2003-2014); ArcGIS deer/CWD viewer
- GIS: ArcGIS portal + MN Geospatial Commons

### NR Info
- Quota: No specific NR cap on bear (equal treatment)
- Fees: NR deer $185, NR bear $230
- Restrictions: Moose closed to everyone

### Scraping Notes
[Difficulty: Medium]
No structured draw stats. PDF harvest archive has gap post-2014. ArcGIS REST APIs accessible for zone boundaries.

---

## MISSOURI (MO)

**Agency:** Missouri Department of Conservation (MDC)
**Website:** https://mdc.mo.gov
**Regs:** https://mdc.mo.gov/hunting-trapping
**Draw Portal:** https://mdc.mo.gov/buypermits
**Draw Stats:** https://mdc.mo.gov/hunting-trapping/species/deer/managed-hunts-deer/managed-deer-hunt-statistics

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + managed hunts | None | 100+ managed hunts; OTC permits statewide |
| Turkey | OTC | None | Fall OTC |
| Black Bear | Draw | None | 600 permits; **residents only** |
| Elk | Draw | None | 5 permits; **residents only** |

### Point System
**None** — Bear and elk are pure random lottery. No carry-forward.

### Key Dates (2025-2026 cycle)
- Bear/Elk App: May 1-31
- Results: By July 1

### Data Sources
- Draw stats: Managed hunt HTML tables (5 years, applicants/odds/success)
- Harvest: HTML tables + PDFs + live Telecheck API
- GIS: ArcGIS (mdcgis.maps.arcgis.com)

### NR Info
- Quota: Bear and elk are residents only
- Fees: NR firearms deer $360, NR archery deer $360
- Restrictions: NR can buy OTC deer/turkey; excluded from bear/elk draws

### Scraping Notes
[Difficulty: Moderate]
Managed hunt stats in HTML tables are useful and scrapable. Telecheck API endpoint worth exploring. No bulk download.

---

## OHIO (OH)

**Agency:** Ohio Department of Natural Resources Division of Wildlife (ODNR)
**Website:** https://ohiodnr.gov
**Regs:** PDF @ dam.assets.ohio.gov
**Draw Portal:** https://oh-web.s3licensing.com
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | Either-sex + antlerless OTC |
| Turkey | OTC + controlled | None | General OTC; controlled area draws |

### Point System
**None** — Pure random for controlled access hunts. Ohio is overwhelmingly OTC.

### Key Dates (2025-2026 cycle)
- Spring turkey controlled: Mar 1-31
- Deer/waterfowl/dove controlled: Jul 1-31

### Data Sources
- Draw stats: Not published
- Harvest: Weekly PDFs (county-by-county) @ dam.assets.ohio.gov
- GIS: Not identified publicly

### NR Info
- Quota: No NR caps
- Fees: NR license $180.96, NR deer $218.40
- Restrictions: No restrictions; top whitetail state

### Scraping Notes
[Difficulty: Hard]
Weekly harvest PDFs on CDN. No dashboard, no CSV, no draw stats. Least open data of major whitetail states.

---

## PENNSYLVANIA (PA)

**Agency:** Pennsylvania Game Commission (PGC)
**Website:** https://www.pa.gov/agencies/pgc
**Regs:** https://www.pa.gov/agencies/pgc/huntingandtrapping/licenses-and-permits
**Draw Portal:** https://huntfish.pa.gov
**Draw Stats:** https://www.pa.gov/agencies/pgc/huntingandtrapping/harvest-survey-and-data/harvest-data-and-maps/big-game-harvest-data

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | Antlered + antlerless per WMU |
| Black Bear | OTC | None | Bear license add-on |
| Turkey | OTC | None | Spring and fall |
| Elk | Draw | Bonus | ~150 tags; 0.13% draw odds; 109,780 applicants (2024) |

### Point System
**Elk only**: Bonus points — 1 per unsuccessful year = 1 additional entry. Season-specific tracking (archery/general/late). **2026 changes**: 10% NR cap, lifetime bull restriction, hunting license required before applying.

### Key Dates (2025-2026 cycle)
- Elk App: May 1 – Jul 12
- Drawing: Jul 25 (Benezette, PA — public event)

### Data Sources
- Draw stats: ArcGIS dashboard with CSV download (harvest data 1915-present!)
- Historical: Exceptional — 110+ years
- GIS: ArcGIS Experience Builder dashboards

### NR Info
- Quota: 10% NR cap starting 2026 (was unlimited)
- Fees: NR elk if drawn $250 + license $101.97
- Restrictions: Lifetime bull ineligibility after drawing a bull tag (2026+)

### Scraping Notes
[Difficulty: Low-Medium]
ArcGIS dashboards with CSV export — best data access among eastern states. 110 years of harvest data. Elk draw stats only via aggregate press coverage.

---

## TEXAS (TX)

**Agency:** Texas Parks and Wildlife Department (TPWD)
**Website:** https://tpwd.texas.gov
**Regs:** https://tpwd.texas.gov/regulations/outdoor-annual/hunting/
**Draw Portal:** https://www.txfgsales.com/PHS/InterfaceLanding.aspx
**Draw Stats:** https://tpwd.texas.gov/huntwild/hunt/public/public_hunt_drawing/statistics.phtml

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC (private) + Draw (WMA) | Loyalty (cubed) | 97% private land state |
| Mule Deer | OTC + Draw (WMA) | Loyalty (cubed) | Trans-Pecos/Panhandle |
| Pronghorn | Draw + landowner | Loyalty (cubed) | ~10 public permits; ~6,000 applicants |
| Desert Bighorn | Draw (extremely limited) | Loyalty (cubed) | 1 public permit; ~11,000 applicants |
| Javelina | OTC + Draw (WMA) | Loyalty (cubed) | Most counties OTC |
| Feral Hog | No license (private) | None | Draw on WMAs |
| Turkey | OTC + Draw (WMA) | Loyalty (cubed) | Spring/fall |
| Exotics | OTC (private) / Draw (WMA) | Loyalty (cubed) | Nilgai, aoudad, gemsbok, oryx, axis, etc. |

### Point System
**Loyalty Points (Cubed)**: Points³ entries (2 pts = 8 entries, 5 pts = 125). Category-specific. Effectively a de facto preference system despite being "weighted random."

### Key Dates (2025-2026 cycle)
- Apps Open: July 1
- Deadlines: Aug 1 through Nov 1 (staggered by category)
- Bighorn Sheep: November 1

### Data Sources
- Draw stats: Excel (.xlsx) @ tpwd.texas.gov (2012-2025, 13 years!)
- Harvest: Mail/email surveys since 1972-73; county data
- GIS: ArcGIS Open Data @ gis-tpwd.opendata.arcgis.com

### NR Info
- Quota: No NR cap on draws; NR $315 hunting license
- Fees: NR license $315 (same draws as residents)
- Restrictions: No NR-specific restrictions on any species

### Scraping Notes
[Difficulty: Easy]
Direct .xlsx download links with stable URL pattern. 13 years of structured data. ArcGIS for spatial data. Best data accessibility among Tier 2 states.

---

## WISCONSIN (WI)

**Agency:** Wisconsin Department of Natural Resources (WDNR)
**Website:** https://dnr.wisconsin.gov
**Regs:** https://dnr.wisconsin.gov/topic/Hunt
**Draw Portal:** https://gowild.wi.gov
**Draw Stats:** Published via DNR press releases + bear page

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | Gun/archery/ML all OTC |
| Black Bear | Draw | Preference | 6 zones; 13,110 licenses; 146K+ applicants |
| Turkey (Spring) | Draw | Preference | Zone + period selection |
| Turkey (Fall) | OTC | None | Statewide |
| Elk | Draw | None (random) | **Residents only**; ~13 tags/year; once-in-lifetime |

### Point System
**Bear/Turkey**: Preference points — 1 per unsuccessful year. Reset after 3-year lapse. Zone A/B require 10-11 points. **Elk**: Pure random, no points, residents only.

### Key Dates (2025-2026 cycle)
- Bear/Turkey App Deadline: December 10, 2025
- Elk App: March 1 – May 31, 2026

### Data Sources
- Draw stats: Bear zone-by-zone stats published annually (license counts, applicant totals, point requirements)
- Harvest: Deer Metrics portal (1960-present!) @ apps.dnr.wi.gov/deermetrics
- GIS: ArcGIS Open Data @ data-wi-dnr.opendata.arcgis.com

### NR Info
- Quota: Elk = residents only; Bear = NR treated equally
- Fees: NR spring turkey $65
- Restrictions: Elk residents only when <100 tags (current status)

### Scraping Notes
[Difficulty: Low-Medium]
Most transparent draw data in Tier 2. Bear stats published publicly by zone. Deer Metrics portal (1960-present) is query-able ASP.NET app. ArcGIS Open Data portal for GIS.

---

# Tier 3 — Other States

---

## ALABAMA (AL)

**Agency:** Alabama Dept of Conservation and Natural Resources (DCNR)
**Website:** https://www.outdooralabama.com
**Regs:** https://www.outdooralabama.com/hunting/seasons-and-bag-limits
**Draw Portal:** N/A
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | All-Game license covers deer |
| Turkey | OTC | None | Included in license |
| Feral Hog | OTC | None | No season restrictions |
| Black Bear | Closed | N/A | Protected species |

### Point System
None. No draw system for big game.

### NR Info
- Fees: NR All-Game $399.50 (~11.6x resident)
- No NR caps; bear closed to all

### Scraping Notes
[Difficulty: Easy] No draw. game.dcnr.alabama.gov has real-time county harvest dashboard.

---

## ARKANSAS (AR)

**Agency:** Arkansas Game and Fish Commission (AGFC)
**Website:** https://www.agfc.com
**Regs:** https://www.agfc.com/regulations/
**Draw Portal:** https://ar-licensing.s3licensing.com
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | 6 deer tags in license |
| Elk | Draw (lottery) | None | **Public land residents only**; ~18 permits |
| Black Bear | OTC (quota) | None | NR $300 permit |
| Turkey | OTC + WMA quota | None | 5-zone system (new 2026) |

### Point System
None — Elk is pure random lottery.

### NR Info
- Quota: Elk public land = residents only; NR can hunt elk on private ($300)
- Fees: NR All-Game $410

### Scraping Notes
[Difficulty: Medium] No draw stats published. Limited data infrastructure.

---

## CALIFORNIA (CA)

**Agency:** California Department of Fish and Wildlife (CDFW)
**Website:** https://wildlife.ca.gov
**Regs:** https://wildlife.ca.gov/Licensing/Hunting/Big-Game
**Draw Portal:** https://www.ca.wildlifelicense.com/InternetSales
**Draw Stats:** https://wildlife.ca.gov/Licensing/Statistics/Big-Game-Drawing

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Mule Deer | OTC (general) + Draw (premium) | Modified Preference | 75/25 standard; 90/10 premium deer |
| Blacktail Deer | OTC + Draw | Modified Preference | Same system |
| Tule Elk | Draw only | Preference (75/25) | Max 1 NR tag statewide |
| Roosevelt Elk | Draw only | Preference (75/25) | Max 1 NR tag statewide |
| Rocky Mtn Elk | Draw only | Preference (75/25) | Max 1 NR tag statewide |
| Pronghorn | Draw only | Preference (75/25) | Max 1 NR tag/year |
| Desert Bighorn | Draw only | Preference (75/25) | Up to 10% NR |
| CA Bighorn | Draw only | Preference (75/25) | Up to 10% NR |
| Wild Pig | OTC | None | Year-round |
| Black Bear | OTC | None | Bear tag required |

### Point System
**Modified Preference (75/25)**: 75% to highest points; 25% random. Premium deer: 90/10. Deer points do NOT reset on draw (unique!). Elk/sheep/pronghorn points DO reset.

### Key Dates
- Draw: Apr 15 – Jun 2; results ~Jun 16-20

### NR Info
- Quota: Max 1 NR elk tag statewide; 1 NR pronghorn; 10% NR sheep
- Fees: NR deer tag $368.20 (~15x resident!), NR bear $302

### Scraping Notes
[Difficulty: Hard] PDF-only stats (2017-2025). No CSV/API. Most restrictive NR quotas in the nation.

---

## CONNECTICUT (CT)

**Agency:** CT DEEP
**Website:** https://portal.ct.gov/deep
**Draw Portal:** CT DEEP Outdoor Licensing System
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC (private) + Lottery (state land) | State land lottery random, no points |
| Turkey | OTC | Spring season |
| Black Bear | Closed | Protected |

### NR Info
- Fees: NR firearms $91 (~4.8x)

### Scraping Notes
[Difficulty: Easy] Minimal draw system. Small state.

---

## DELAWARE (DE)

**Agency:** DNREC Division of Fish & Wildlife
**Website:** https://dnrec.delaware.gov/fish-wildlife
**Draw Portal:** N/A
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC | 5-month season |
| Turkey | OTC | Spring only |

### NR Info
- Fees: NR license $199.50 (~5x)

### Scraping Notes
[Difficulty: Easy] No draw. Tiny state, minimal data.

---

## FLORIDA (FL)

**Agency:** Florida Fish and Wildlife Conservation Commission (FWC)
**Website:** https://myfwc.com
**Regs:** https://myfwc.com/hunting/regulations/
**Draw Portal:** https://license.gooutdoorsflorida.com
**Draw Stats:** https://myfwc.com/hunting/quota/ (real-time dashboards)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + Quota (WMA) | Preference (19 categories) | Complex zone structure |
| Osceola Turkey | OTC + Quota (WMA) | Preference | NR restricted first 9 days at 5 WMAs |
| Wild Hog | OTC + Quota (WMA) | Preference | Year-round private |
| Black Bear | Draw (random) | None | Reinstated 2025; 172 permits from 163K apps! |

### Point System
**Preference Points** for 19 WMA quota hunt categories (not bear). Bear is pure random lottery.

### NR Info
- Quota: Bear 10% NR (~17 permits); no caps on deer/turkey
- Fees: Bear $300 NR

### Scraping Notes
[Difficulty: Medium] WMA harvest reports are CSV-exportable. Real-time quota dashboards. Bear data sparse (first hunt in 10 years).

---

## GEORGIA (GA)

**Agency:** Georgia DNR Wildlife Resources Division
**Website:** https://georgiawildlife.com
**Draw Portal:** https://www.gooutdoorsgeorgia.com
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + Quota (WMA) | Priority Points | |
| Turkey | OTC + Quota (WMA) | Priority Points | |
| Black Bear | OTC (Northern) + Quota (WMA) | Priority Points | Northern zone is OTC |
| Feral Hog | OTC | None | Year-round |
| Alligator | Quota draw | Priority Points | Highest demand draw |

### NR Info
- Fees: NR Big Game $225 (~9x)

### Scraping Notes
[Difficulty: Medium] No published draw odds. Game Check mandatory reporting provides harvest data.

---

## HAWAII (HI)

**Agency:** Hawaii DLNR Division of Forestry and Wildlife
**Website:** https://dlnr.hawaii.gov/recreation/hunting/
**Draw Portal:** https://gohunthawaii.ehawaii.gov/public/hunts
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Axis Deer | Lottery (Lanai) / OTC (Maui, Molokai) | Unique species |
| Black-tailed Deer | Lottery (Kauai) | Weekend-based drawing |
| Mouflon Sheep | Lottery (Lanai) / OTC (Hawaii Island) | |
| Feral Pig | OTC | All major islands |
| Feral Goat | OTC | Statewide |
| Wild Cattle | OTC (select areas) | Hawaii Island |

### Point System
None — Pure random lottery.

### NR Info
- Fees: NR license $95; Lanai axis NR tag $125

### Scraping Notes
[Difficulty: Hard] Island-by-island fragmentation. Custom eHawaii.gov portal. No API.

---

## INDIANA (IN)

**Agency:** Indiana DNR Division of Fish & Wildlife
**Website:** https://www.in.gov/dnr/fish-and-wildlife/
**Draw Portal:** https://www.gooutdoorsin.com/
**Draw Stats:** https://www.in.gov/dnr/fish-and-wildlife/hunting-and-trapping/reserved-hunt-draw-results/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + reserved hunts | Preference (squared) | Reserved hunts on DNR properties |
| Turkey | OTC + reserved hunts | Preference (squared) | |

### Point System
Preference points (squared) for reserved hunts. System reset December 2024 with Activity Hub launch.

### NR Info
- Fees: NR deer bundle $550 (~4.5x)

### Scraping Notes
[Difficulty: Medium] Reserved hunt results posted at public URL. GoOutdoorsIN is standard portal.

---

## LOUISIANA (LA)

**Agency:** Louisiana Dept of Wildlife and Fisheries (LDWF)
**Website:** https://www.wlf.louisiana.gov/
**Draw Portal:** https://louisianaoutdoors.com/lottery-applications
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC + WMA lottery | |
| Turkey | OTC + WMA lottery | |
| Feral Hog | OTC (no license on private) | |
| Black Bear | Closed | Protected |

### Point System
None. WMA draws are random.

### NR Info
- Fees: NR license $200 (~6.7x)

### Scraping Notes
[Difficulty: Medium] No draw stats. PDF regulations. Web map for WMAs.

---

## MAINE (ME)

**Agency:** Maine Dept of Inland Fisheries and Wildlife (MDIFW)
**Website:** https://www.maine.gov/ifw/
**Draw Portal:** https://mooselottery.web.maine.gov/online/moose/
**Draw Stats:** https://moose.informe.org/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Moose | Lottery | Bonus (accumulating) | 4,105 permits; Northeast's most prominent lottery |
| Whitetail Deer | OTC + antlerless lottery | None | Multi-stage antlerless lottery |
| Black Bear | Permit (near-OTC) | None | |
| Turkey | OTC | None | |

### Point System
**Moose only**: Accumulating bonus points — progressive scale (0-5 pts: 1/yr; 16+ yrs: 10/yr). Points forfeited if 2 consecutive years skipped.

### NR Info
- Quota: 8% NR moose + 2% lodges; 90% resident
- Fees: NR moose $585 (~11.3x!); NR license $115

### Scraping Notes
[Difficulty: Easy-Medium] moose.informe.org and deer.informe.org are clean public results pages. Maine GIS has WMD shapefiles.

---

## MARYLAND (MD)

**Agency:** Maryland DNR Wildlife and Heritage Service
**Website:** https://dnr.maryland.gov/wildlife
**Draw Portal:** https://mdoutdoors.maryland.gov/login
**Draw Stats:** Not published (bear winner PDFs only)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | |
| Sika Deer | OTC (stamp) | None | Unique to MD; NR stamp $200 (20x resident!) |
| Black Bear | Lottery | Preference | ~1,050 permits; $15 app fee |
| Turkey | OTC | None | |

### NR Info
- Fees: NR license $160; NR sika stamp $200 (vs $10 resident — 20x!)

### Scraping Notes
[Difficulty: Medium] Bear results as PDF ID lists. iMAP GIS available.

---

## MASSACHUSETTS (MA)

**Agency:** MassWildlife
**Website:** https://www.mass.gov/masswildlife
**Draw Portal:** MassFishHunt portal
**Draw Stats:** https://www.mass.gov/info-details/2025-antlerless-deer-permit-allocation-and-odds-of-winning

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail (antlered) | OTC | None | 2 antlered tags in license |
| Whitetail (antlerless) | Lottery (zone) | None | 14 WMZs; some 100% odds |
| Black Bear | OTC (permit) | None | $10 res / $30 NR |
| Turkey | OTC (permit) | None | |

### NR Info
- Fees: NR license $112 (~2.8x — lowest NR markup in audit)

### Scraping Notes
[Difficulty: Easy-Medium] ADP odds published as structured web pages. MassGIS provides downloadable shapefiles.

---

## MISSISSIPPI (MS)

**Agency:** Mississippi DWFP (MDWFP)
**Website:** https://www.mdwfp.com
**Draw Portal:** https://xnet2.mdwfp.com/draws/customer/loginv2
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC + WMA draw | |
| Turkey | OTC + NR public land draw | NR banned from public land before April 1 without draw |
| Feral Hog | OTC | |

### Point System
None.

### NR Info
- Fees: NR All-Game $300; NR deer $100; NR turkey stamp $100 (~8-12x total)
- Restrictions: NR public land turkey requires draw win

### Scraping Notes
[Difficulty: Medium] SSL issues on main site. No draw stats. WMA PDFs fragmented.

---

## NEBRASKA (NE)

**Agency:** Nebraska Game and Parks Commission (NGPC)
**Website:** https://outdoornebraska.gov
**Draw Portal:** https://www.gooutdoorsne.com/permits
**Draw Stats:** https://outdoornebraska.gov/permits/hunting-permits/big-game-permits/draw-results/

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + Draw (limited units) | Preference | Many archery/firearm OTC |
| Mule Deer | Draw | Preference | Limited units |
| Pronghorn | Draw | Preference | |
| Elk | Draw | Preference | **Residents only** (NR landowner exception) |
| Bighorn Sheep | Lottery (random) | None | **Residents only** |
| Turkey | Draw (some units) | None | |

### NR Info
- Quota: 85% resident; NR up to 15%; elk/sheep residents only
- Fees: NR deer $750-$995

### Scraping Notes
[Difficulty: Medium] Draw result PDFs (2018-2025) publicly accessible. Cloudflare protection on main site.

---

## NEW HAMPSHIRE (NH)

**Agency:** NH Fish and Game Department
**Website:** https://www.wildlife.nh.gov
**Draw Portal:** https://www.nhfishandgame.com
**Draw Stats:** Not published (press releases only)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Moose | Lottery | Bonus | 35 permits; ~6K entrants |
| Whitetail Deer | OTC + antlerless lottery | None | |
| Black Bear | OTC | None | |
| Turkey | OTC | None | |

### NR Info
- Quota: ~85% moose to residents (~5 NR permits)
- Fees: NR license $113; NR moose app $25

### Scraping Notes
[Difficulty: Medium] Moose data from press releases only. Older-style licensing system.

---

## NEW JERSEY (NJ)

**Agency:** NJ Division of Fish and Wildlife
**Website:** https://dep.nj.gov/njfw/
**Draw Portal:** https://www.nj.gov/dep/fgw/licenses.htm
**Draw Stats:** Not published (turkey quota PDF only)

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC | Zone permits; no lottery |
| Black Bear | OTC (quota) | Quota permits until filled |
| Turkey (Spring) | Lottery (2 rounds) + OTC | $2 lottery fee |
| Turkey (Fall) | Closed | 2025-2026 |

### Point System
None.

### NR Info
- Fees: NR license $135.50 (~5x)

### Scraping Notes
[Difficulty: Hard] Incapsula/Imperva security blocks automated fetching. Turkey quota PDF downloadable.

---

## NEW YORK (NY)

**Agency:** NY Dept of Environmental Conservation (NYSDEC)
**Website:** https://dec.ny.gov
**Draw Portal:** https://decals.east.licensing.app/
**Draw Stats:** https://dec.ny.gov/sites/default/files/2025-07/dmpquotas.pdf

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail (antlered) | OTC | None | |
| Whitetail (antlerless) | DMP lottery | Weighted preference | WMU-specific; tiered R/NR priority |
| Black Bear | OTC | None | Included in applicable zones |
| Turkey | OTC | None | |

### Point System
**Weighted preference** for DMPs: Tiered pools (landowners/disabled vets > 3+ pts > 2 pts residents > 1 pt > 0 pts > NR pools).

### NR Info
- Fees: NR license $100 (~4.5x); NR DMP $10 (parity)
- Restrictions: NR structurally deprioritized in DMP lottery tiers

### Scraping Notes
[Difficulty: Medium] DMP odds tables are annual PDFs by WMU. WMU boundary KMZ downloadable.

---

## NORTH CAROLINA (NC)

**Agency:** NC Wildlife Resources Commission (NCWRC)
**Website:** https://www.ncwildlife.gov
**Draw Portal:** https://gooutdoorsnorthcarolina.com/
**Draw Stats:** Not published (harvest stats yes, draw stats no)

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC + game lands quota | |
| Black Bear | OTC | NR bear license $284 |
| Turkey | OTC + game lands quota | |
| Feral Hog | OTC | Year-round |

### Point System
Preference points for Tundra Swan only. Big game quota hunts are random.

### NR Info
- Fees: NR combo $260; NR bear $284 (high barrier)

### Scraping Notes
[Difficulty: Easy-Medium] Harvest PDFs well-organized. No draw stats published.

---

## NORTH DAKOTA (ND)

**Agency:** North Dakota Game and Fish Department (NDGF)
**Website:** https://gf.nd.gov
**Draw Portal:** https://gf.nd.gov/myaccount
**Draw Stats:** https://gf.nd.gov/licensing/lotteries/summary/deer

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | Draw | Weighted bonus | NR: 300 gun + 300 archery hard cap |
| Mule Deer | Draw | Weighted bonus | Same NR pool |
| Pronghorn | Lottery | Weighted bonus | **Residents only** |
| Elk | Lottery | None | **Residents only** |
| Moose | Lottery | None | **Residents only** |
| Bighorn Sheep | Lottery | None | NR eligible; 1 per lifetime |

### Point System
**Weighted bonus points** for deer, pronghorn, swan, turkey. Points dramatically improve odds at 4+ threshold.

### NR Info
- Quota: NR excluded from elk, moose, pronghorn, spring turkey; deer hard cap 300 NR
- Fees: NR deer $355

### Scraping Notes
[Difficulty: Easy] **Interactive HTML draw stats tables (2017-2025)** — one of the most scraper-friendly state sites. Bonus-point tier breakdown by unit.

---

## OKLAHOMA (OK)

**Agency:** Oklahoma Dept of Wildlife Conservation (ODWC)
**Website:** https://www.wildlifedepartment.com
**Draw Portal:** https://quotahunt.gooutdoorsoklahoma.com/Hunts
**Draw Stats:** Published on controlled hunts page (PDF/Excel)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | |
| Elk | Draw | Preference (20+ pt priority) | Wichita Mtns, Cookson WMA |
| Pronghorn | Draw | Preference (20+ pt priority) | ~101 permits |
| Black Bear | OTC (quota) | None | Call-in quota system |
| Turkey | OTC + Draw | Preference | |

### Point System
**Preference + 20-point priority pool**: 20+ point applicants get half the permits in a separate initial draw. New 2025: can buy additional preference point ($10 R / $50 NR).

### NR Info
- Fees: NR license $209; NR elk/pronghorn tag $506 (~10x)

### Scraping Notes
[Difficulty: Medium] Draw results in PDF/Excel. GoOutdoorsOklahoma portal.

---

## RHODE ISLAND (RI)

**Agency:** RIDEM Division of Fish & Wildlife
**Website:** https://dem.ri.gov
**Draw Portal:** https://rio.ri.gov/
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Notes |
|---------|----------|-------|
| Whitetail Deer | OTC | Block Island state land = lottery |
| Turkey | OTC | |
| Black Bear | Draw (very limited) | |

### Point System
None.

### NR Info
- Fees: NR license $65 (~2.7x)

### Scraping Notes
[Difficulty: Easy-Medium] Very small state. Minimal draw system.

---

## SOUTH CAROLINA (SC)

**Agency:** SC Dept of Natural Resources (SCDNR)
**Website:** https://www.dnr.sc.gov
**Draw Portal:** https://license.gooutdoorssouthcarolina.com
**Draw Stats:** https://www.dnr.sc.gov/hunting/lottery/index.html (point estimates only)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + WMA lottery | Weighted (0-4 pts) | Liberal bag limits |
| Turkey | OTC + WMA lottery | Weighted | |
| Black Bear | OTC + WMA lottery | Weighted | |
| Feral Hog | OTC | None | Year-round |
| Alligator | Quota draw | Weighted | |

### NR Info
- Fees: NR license $125 + Big Game $100 + WMA $76 = ~$301 (~6x)

### Scraping Notes
[Difficulty: Medium] Point estimates published. No historical draw odds.

---

## SOUTH DAKOTA (SD)

**Agency:** South Dakota Game, Fish and Parks (SDGFP)
**Website:** https://gfp.sd.gov
**Draw Portal:** https://license.gooutdoorssouthdakota.com
**Draw Stats:** https://license.gooutdoorssouthdakota.com/License/DrawStatistics

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | Draw | Cubed preference | Multiple region types |
| Mule Deer | Draw | Cubed preference | West River/Black Hills |
| Pronghorn | Draw | Cubed preference | Archery and firearms |
| Elk | Draw | Cubed preference | **Residents only** |
| Bighorn Sheep | Draw | Cubed preference | **Residents only** |
| Mountain Goat | Draw (when open) | Cubed preference | **Residents only; closed 2025-26** |
| Mountain Lion | Draw | Cubed preference | **Residents only** |
| Turkey | Draw + OTC | Cubed preference | |

### Point System
**Cubed Preference Points**: Points³ + 1 entries (4 pts = 65 entries). Tiered pools for rifle deer (15+ pts get 34% of licenses). Exponential compounding advantage.

### Key Dates
- Elk/Sheep: Apr 22 – May 19
- Deer: Jun 3 – Jun 23
- Pronghorn: Jul-Aug

### Data Sources
- Draw stats: Interactive online table (2022-2026) @ gooutdoorssouthdakota.com — JS-rendered
- GIS: ArcGIS Open Data + GFP Map Gallery

### NR Info
- Quota: NR excluded from elk, sheep, goat, mountain lion
- Fees: NR deer $375-$425 (~8-9x)

### Scraping Notes
[Difficulty: Medium-Hard] Interactive JS draw stats require browser automation. Cubed point system needs careful modeling. Multiple species-specific app windows.

---

## TENNESSEE (TN)

**Agency:** Tennessee Wildlife Resources Agency (TWRA)
**Website:** https://www.tn.gov/twra.html
**Draw Portal:** https://quotahunt.gooutdoorstennessee.com
**Draw Stats:** Partial (applicant counts on species pages)

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC + WMA quota | Preference (some hunts) | |
| Elk | Quota draw | None (random) | 19 permits; 10-year wait after drawing |
| Black Bear | Quota draw (Cherokee) | None | |
| Turkey | OTC + WMA quota | Preference | |
| Feral Hog | OTC | None | Year-round |

### NR Info
- Quota: Elk 25% NR cap
- Fees: NR 7-Day $214; Annual $305

### Scraping Notes
[Difficulty: Medium] ArcGIS open data portal accessible. Draw stats embedded in press releases.

---

## VERMONT (VT)

**Agency:** Vermont Fish & Wildlife Department
**Website:** https://www.vtfishandwildlife.com
**Draw Portal:** https://anrweb.vt.gov/FWD/FW/
**Draw Stats:** https://anrweb.vt.gov/FWD/FW/MooseLotteryWinners.aspx

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | |
| Moose | Lottery | Bonus | 85 permits proposed 2026 (down from 180) |
| Black Bear | OTC (tag) | None | $5 res / $15 NR |
| Turkey | OTC | None | |

### Point System
**Moose only**: Bonus points (1 per consecutive unsuccessful year). 5-year post-draw moratorium.

### NR Info
- Quota: 10% NR moose permits by statute
- Fees: NR moose $350; NR license $102

### Scraping Notes
[Difficulty: Medium] Moose winners listed on ASP.NET form. Harvest reports in PDF (2013-2025). ArcGIS Hub available.

---

## VIRGINIA (VA)

**Agency:** Virginia Dept of Wildlife Resources (DWR)
**Website:** https://dwr.virginia.gov
**Draw Portal:** https://www.gooutdoorsvirginia.com
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail Deer | OTC | None | |
| Elk | Lottery | None (random) | 5 permits; 0.03% R odds, <0.01% NR |
| Black Bear | OTC | None | NR $151 bear license |
| Turkey | OTC | None | |

### Point System
None — Elk is pure random.

### NR Info
- Quota: Elk — 1 NR or 10% (whichever greater) = 1 permit
- Fees: NR elk $400; NR license $111; NR bear $151

### Scraping Notes
[Difficulty: Medium] No draw stats published. ArcGIS Hub for spatial data.

---

## WEST VIRGINIA (WV)

**Agency:** West Virginia Division of Natural Resources (WVDNR)
**Website:** https://wvdnr.gov
**Draw Portal:** https://www.wvhunt.com
**Draw Stats:** Not published

### Species & Tag Types
| Species | Tag Type | Point System | Notes |
|---------|----------|--------------|-------|
| Whitetail (antlered) | OTC | None | |
| Whitetail (antlerless) | OTC + Lottery (10 limited areas) | None | Random draw |
| Black Bear | OTC | None | Bear Damage Stamp required |
| Turkey | OTC | None | |

### Point System
None.

### NR Info
- Fees: NR Class E $119; NR bear ~$185-194 total

### Scraping Notes
[Difficulty: Medium] Big Game Bulletin PDF (annual, county-level). mapwv.gov ArcGIS services. No draw stats published.
