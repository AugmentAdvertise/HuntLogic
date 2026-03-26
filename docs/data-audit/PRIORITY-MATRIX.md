# HuntLogic State Priority Matrix

> **Generated:** 2026-03-23
> **Purpose:** Rank all 50 states by data accessibility, hunter demand, and current HuntLogic coverage gaps to guide platform development priorities.

---

## Scoring Methodology

Each state is scored 1-5 on three dimensions:

| Score | Data Accessibility | Hunter Demand | Coverage Gap |
|-------|-------------------|---------------|--------------|
| 5 | Machine-readable (CSV/JSON/Excel), public API, 10+ years | Top western big game, high NR demand | No coverage, critical species |
| 4 | Structured downloads (Excel/XLSX), good GIS | Major draw state, significant NR interest | Minimal coverage |
| 3 | PDF stats published, some tools | Moderate draw, regional importance | Partial coverage |
| 2 | Limited PDFs, press releases only | Mostly OTC, low draw complexity | Some coverage |
| 1 | No data published, login-gated | No draw, fully OTC, minimal NR interest | Well covered |

**Priority Score** = Data Accessibility + Hunter Demand + Coverage Gap (max 15)

---

## Priority Rankings

### Tier 1 — Highest Priority (Score 12-15)

| Rank | State | Data | Demand | Gap | Total | Key Rationale |
|------|-------|------|--------|-----|-------|---------------|
| 1 | **Idaho (ID)** | 5 | 5 | 5 | **15** | JSON/CSV/Excel export, 28 years data, ArcGIS. No points = simple model. Major 2026 NR draw change. |
| 2 | **Colorado (CO)** | 4 | 5 | 5 | **14** | 22 years PDF archives, GIS shapefiles. 3 draw systems. Major 2028 reform. Most NR applications. |
| 3 | **Nevada (NV)** | 5 | 5 | 4 | **14** | Annual Excel hunt data file. Squared bonus points. All draw state. ArcGIS open data. |
| 4 | **Wyoming (WY)** | 4 | 5 | 5 | **14** | 5 years PDFs, Hunt Planner. 75/25 pref/random. Complex NR pools (regular/special). |
| 5 | **New Mexico (NM)** | 5 | 5 | 4 | **14** | Excel draw odds, no auth. No points (simple). Unique exotics (oryx/ibex/barbary). |
| 6 | **Oregon (OR)** | 4 | 5 | 4 | **13** | XLSX 2017-2025, PDF archive to 2005. 75/25 preference. 5% NR cap. 2026 area restructure. |
| 7 | **Montana (MT)** | 3 | 5 | 5 | **13** | JS-rendered stats (harder to scrape). Dual point system. 17K NR combo cap. |
| 8 | **Arizona (AZ)** | 4 | 5 | 4 | **13** | PDF draw odds/harvest. 3 draw periods. Modified bonus + loyalty + hunter ed points. |
| 9 | **Utah (UT)** | 3 | 5 | 4 | **12** | Legacy PDFs (2010-2025) + new JS SPA. Dual point system (bonus/preference). OIAL species. |
| 10 | **Alaska (AK)** | 3 | 5 | 4 | **12** | PDF supplements. No points. Unique species (muskox, Dall sheep, bison). Guide requirements. |

### Tier 2 — High Priority (Score 9-11)

| Rank | State | Data | Demand | Gap | Total | Key Rationale |
|------|-------|------|--------|-----|-------|---------------|
| 11 | **Texas (TX)** | 5 | 4 | 2 | **11** | Excel stats 2012-2025, ArcGIS. Cubed loyalty points. 97% private land. WMA draw system. |
| 12 | **North Dakota (ND)** | 5 | 3 | 3 | **11** | Interactive HTML tables 2017-2025 — scraper-friendly. Weighted bonus. 300 NR deer cap. |
| 13 | **Washington (WA)** | 2 | 4 | 4 | **10** | Power BI (hard to scrape). Bonus squared. No NR caps but high fees. Draw error scandal. |
| 14 | **California (CA)** | 3 | 4 | 3 | **10** | PDF stats 2017-2025. Modified preference 75/25. Most restrictive NR quotas (1 elk tag!). |
| 15 | **Iowa (IA)** | 3 | 4 | 3 | **10** | Real-time quota tool (2006+). True preference points. Premier whitetail. 6K NR tags. |
| 16 | **Kansas (KS)** | 3 | 4 | 3 | **10** | PDF draw stats. Preference points. Top NR whitetail. ~21.7K NR tags. |
| 17 | **South Dakota (SD)** | 3 | 4 | 3 | **10** | Interactive draw stats (2022-2026, JS). Cubed preference. NR excluded from elk/sheep. |
| 18 | **Wisconsin (WI)** | 4 | 3 | 3 | **10** | Transparent bear stats by zone. Deer Metrics 1960-present. ArcGIS open data. |
| 19 | **Pennsylvania (PA)** | 4 | 3 | 2 | **9** | ArcGIS dashboard + CSV (1915-present!). Elk 0.13% odds. 10% NR cap 2026. |
| 20 | **Nebraska (NE)** | 3 | 3 | 3 | **9** | PDF draw results 2018-2025. Preference points. Elk/sheep residents only. |

### Tier 3 — Medium Priority (Score 6-8)

| Rank | State | Data | Demand | Gap | Total | Key Rationale |
|------|-------|------|--------|-----|-------|---------------|
| 21 | **Kentucky (KY)** | 2 | 3 | 3 | **8** | PDF elk report. Premier eastern elk draw (500 tags). No points. 10% NR. |
| 22 | **Michigan (MI)** | 3 | 3 | 2 | **8** | Web stats + NRC PDFs. Elk resident-only. Bear preference points. ArcGIS. |
| 23 | **Florida (FL)** | 3 | 3 | 2 | **8** | CSV harvest exports. 19 preference categories. Bear reinstated 2025 (163K apps!). |
| 24 | **Oklahoma (OK)** | 3 | 3 | 2 | **8** | PDF/Excel results. Preference + 20-pt priority pool for elk/pronghorn. |
| 25 | **Maine (ME)** | 3 | 3 | 2 | **8** | moose.informe.org (clean data). Premier NE moose lottery. GIS shapefiles. |
| 26 | **Tennessee (TN)** | 2 | 3 | 3 | **8** | ArcGIS open data. Elk draw (19 permits). Mixed point system. |
| 27 | **New York (NY)** | 3 | 2 | 2 | **7** | DMP odds PDFs by WMU. Weighted preference tiers. WMU KMZ downloadable. |
| 28 | **Minnesota (MN)** | 2 | 3 | 2 | **7** | Bear preference points. 130 DPAs. Moose closed since 2013. ArcGIS available. |
| 29 | **Missouri (MO)** | 3 | 2 | 2 | **7** | Managed hunt HTML tables (5 years). Bear/elk residents only. Telecheck API. |
| 30 | **Georgia (GA)** | 2 | 2 | 3 | **7** | Priority points for WMA quotas. Game Check reporting. $225 NR big game. |
| 31 | **Illinois (IL)** | 2 | 3 | 2 | **7** | No draw stats published (gap!). County-quota lottery. 170K+ deer harvest. |
| 32 | **North Carolina (NC)** | 2 | 2 | 2 | **6** | Harvest PDFs well-organized. Quota hunts random. NR bear $284. |
| 33 | **Virginia (VA)** | 2 | 2 | 2 | **6** | Elk lottery (5 permits). ArcGIS Hub. No draw stats published. |
| 34 | **Vermont (VT)** | 2 | 2 | 2 | **6** | Moose lottery (85 permits proposed 2026). Bonus points. ArcGIS Hub. |
| 35 | **South Carolina (SC)** | 2 | 2 | 2 | **6** | Weighted preference (0-4 pts). Liberal deer limits. No draw odds published. |
| 36 | **Arkansas (AR)** | 1 | 2 | 3 | **6** | Elk public land residents only (18 permits). No draw stats. |
| 37 | **New Hampshire (NH)** | 2 | 2 | 2 | **6** | Moose lottery (35 permits). Bonus points. Press release data only. |
| 38 | **Massachusetts (MA)** | 3 | 1 | 2 | **6** | ADP odds published. MassGIS shapefiles. Low NR markup (2.8x). |
| 39 | **Maryland (MD)** | 2 | 2 | 2 | **6** | Bear lottery preference. Sika deer stamp ($200 NR!). |
| 40 | **West Virginia (WV)** | 2 | 2 | 2 | **6** | Big Game Bulletin PDF. Antlerless lottery. mapwv.gov ArcGIS. |

### Tier 4 — Lower Priority (Score 3-5)

| Rank | State | Data | Demand | Gap | Total | Key Rationale |
|------|-------|------|--------|-----|-------|---------------|
| 41 | **Ohio (OH)** | 1 | 2 | 2 | **5** | No draw stats. Weekly harvest PDFs. Controlled hunts random. Top whitetail state but OTC. |
| 42 | **Indiana (IN)** | 2 | 2 | 1 | **5** | Reserved hunts preference (squared). System reset Dec 2024. |
| 43 | **New Jersey (NJ)** | 1 | 1 | 2 | **4** | Incapsula blocks scraping. Turkey lottery only draw. Bear OTC quota. |
| 44 | **Mississippi (MS)** | 1 | 1 | 2 | **4** | No draw stats. NR public land turkey restriction. SSL issues. |
| 45 | **Louisiana (LA)** | 1 | 1 | 2 | **4** | WMA lottery random. No draw stats. Bear closed. |
| 46 | **Alabama (AL)** | 2 | 1 | 1 | **4** | No draw system. County harvest dashboard useful. Bear closed. |
| 47 | **Hawaii (HI)** | 1 | 1 | 2 | **4** | Island fragmentation. Custom eHawaii portal. Unique species but hard to track. |
| 48 | **Connecticut (CT)** | 1 | 1 | 1 | **3** | State land lottery only. Small state. Bear closed. |
| 49 | **Rhode Island (RI)** | 1 | 1 | 1 | **3** | Block Island lottery (tiny). Minimal big game. |
| 50 | **Delaware (DE)** | 1 | 1 | 1 | **3** | No draw. Tiny state. Purely OTC. |

---

## Data Accessibility Summary

### Best Data Sources (Machine-Readable)

| State | Format | Years | URL |
|-------|--------|-------|-----|
| **Idaho** | JSON/CSV/Excel | 1998-2026 (28 yrs) | fishandgame.idaho.gov/ifwis/huntplanner/odds/ |
| **Nevada** | Excel (.xlsx) | 2022-2025+ | ndow.org/blog/hunt-statistics/ |
| **New Mexico** | Excel (.xlsx) | 2024-2025+ | wildlife.dgf.nm.gov/download/ |
| **Texas** | Excel (.xlsx) | 2012-2025 (13 yrs) | tpwd.texas.gov/.../statistics.phtml |
| **Oregon** | XLSX + PDF | 2005-2025 (20 yrs) | myodfw.com/articles/big-game-statistics |
| **North Dakota** | Interactive HTML | 2017-2025 (8 yrs) | gf.nd.gov/licensing/lotteries/summary/ |
| **Colorado** | PDF in ZIP | 2003-2024 (22 yrs) | cpw.cvlcollections.org/items/show/159 |
| **Pennsylvania** | ArcGIS + CSV | 1915-present (110 yrs!) | pa.gov/agencies/pgc/.../big-game-harvest-data |
| **Wisconsin** | ASP.NET portal | 1960-present (65 yrs) | apps.dnr.wi.gov/deermetrics/ |

### States with NO Published Draw Stats
AL, AR, CT, DE, GA, HI, IL, LA, MA (partial), MD, MI (web-gated), MN, MS, MO (limited), NJ, NC, OH, RI, SC (points only), TN (partial), VA, WV

### States with Best GIS/Spatial Data
ID, CO, NV, AK, TX, WI, PA, MI, TN, VT, VA (all have ArcGIS open data portals)

---

## Point System Complexity Map

| System Type | States |
|-------------|--------|
| **None (pure random)** | AK, ID, NM, IL, KY, MO, OH, VA, WV, CT, DE, HI, LA, MS, NJ, RI |
| **Preference (top-down)** | CO (deer/elk), IA, KS, OR (75/25), WI (bear/turkey), MN (bear), MI (bear), NE, ND (weighted) |
| **Bonus (weighted random)** | AZ (modified), MT (squared for permits), NV (squared), UT (50/50), WA (squared), ME (moose), NH (moose), VT (moose), PA (elk) |
| **Preference/Bonus Hybrid** | WY (75/25), CO (weighted for moose/sheep/goat), MT (pref for NR combo + bonus for permits) |
| **Cubed/Exponential** | TX (cubed loyalty), SD (cubed preference), IN (squared preference) |
| **Priority/Tiered** | NY (DMP tiers), OK (20+ pt priority pool), FL (19 categories), GA (priority per category), SC (0-4 scale) |

---

## Recommended Development Phases

### Phase 1: Core Western States (Idaho, Colorado, Nevada, Wyoming, New Mexico)
- **Why**: Best data accessibility, highest hunter demand, well-documented draw systems
- **Data strategy**: Direct Excel/CSV ingestion for ID, NV, NM; PDF parsing pipeline for CO, WY
- **Point modeling**: Range from none (ID, NM) to complex hybrid (CO, WY)

### Phase 2: Western Expansion (Oregon, Montana, Arizona, Utah, Alaska, Washington)
- **Why**: Complete western big game coverage; varied data quality
- **Data strategy**: XLSX for OR; JS scraping for UT; PDF parsing for AZ, AK; Power BI challenge for WA
- **Point modeling**: 75/25 splits (OR), dual systems (MT, UT), modified bonus (AZ)

### Phase 3: Premier Eastern Draws (Iowa, Kansas, Texas, Kentucky, Pennsylvania, Wisconsin)
- **Why**: Top whitetail/turkey destinations; notable elk draws (KY, PA)
- **Data strategy**: Excel for TX; HTML tables for ND/WI; PDF for IA, KS, KY, PA
- **Point modeling**: True preference (IA, KS), cubed (TX), bonus (PA), random (KY)

### Phase 4: Secondary States (CA, SD, NE, OK, FL, MI, ND, MN, NY, ME)
- **Why**: Significant draw programs but harder data or lower NR demand
- **Data strategy**: Case-by-case; California PDF (hard), SD JS interactive, ND HTML tables (easy)

### Phase 5: Remaining States
- **Why**: Mostly OTC, limited draw complexity, lower priority
- **Strategy**: Basic state profiles with species/season/fee information; minimal draw modeling needed

---

## Key Findings

1. **Idaho has the best hunting data portal in the nation** — JSON/CSV/Excel export, 28 years, no auth, public ArcGIS. This should be the template for what "good" looks like.

2. **Only ~15 states publish machine-readable draw statistics** — the rest are PDF-only or don't publish at all. A PDF parsing pipeline is essential.

3. **Point systems range from "none" to "cubed weighted preference with tiered pools"** — the modeling engine must support at least 7 distinct point system types.

4. **NR restrictions vary wildly** — from no caps (WA, OH) to complete exclusion (MI elk, MO bear/elk, SD elk/sheep/goat, ND elk/moose/pronghorn).

5. **2026-2028 is a period of major reform** — Idaho (NR draw change), Colorado (50/50 split), Montana (fewer NR combos), Oregon (area restructure), Pennsylvania (NR elk cap).

6. **Three unique-to-state species worth highlighting**: NM exotics (oryx/ibex/barbary sheep), AK species (muskox, Dall sheep), MD sika deer, HI axis deer/mouflon.
