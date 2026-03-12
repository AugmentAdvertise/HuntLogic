# HuntLogic Concierge — Complete Strategy & Implementation Plan

> **AI-powered, nationwide hunt planning and application platform**
> Repo: https://github.com/AugmentAdvertise/HuntLogic

---

## 1. WHAT IS HUNTLOGIC CONCIERGE

HuntLogic Concierge is an AI-powered platform that replaces fragmented hunting research and expensive human hunt planners with a scalable, personalized, concierge-level digital experience.

It learns a hunter's goals, preferences, budget, and constraints — then builds a custom strategy, recommends where and how to spend money, forecasts future draw dynamics, manages deadlines, and proactively guides the hunter through the entire application cycle.

**It is not a western-only draw tool.** It is a national hunting opportunity engine serving both western draw hunters and eastern opportunity hunters.

### Core Promise
> "HuntLogic helps hunters make smarter hunt decisions and never miss an opportunity again."

The platform tells the hunter:
- What fits them best
- Why it fits
- What to do next
- When to do it
- What it will cost
- How likely it is to work
- How the recommendation may change over time

---

## 2. TARGET USERS

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Opportunity Hunter** | Wants practical hunts, higher odds, fill the freezer | Near-term tags, low complexity |
| **Trophy Planner** | Willing to wait, build points, pursue premium quality | Long-term strategy, point allocation |
| **Balanced Hunter** | Mix of opportunity + upside | Both near-term and long-term recs |
| **Eastern Hunter** | Not in western draw game yet | Local opportunity, public access, season guidance |
| **Western App User** | Already plays the draw game | Better intelligence, stronger forecasts |
| **Busy Professional** | Values convenience above all | Fully managed deadlines, reminders, submissions |

---

## 3. COMPETITIVE POSITIONING

HuntLogic Concierge is:
- **More personalized** than static draw-odds tools
- **More scalable** than a human consultant
- **More intelligent** than a reminder app
- **More strategic** than a hunt directory
- **More national** than western-only planning products

It combines: hunt planning + application strategy + decision intelligence + long-range forecasting + action management + memory and personalization.

---

## 4. PRODUCT EXPERIENCE — 4 PHASES

### Phase 1: Fast Personalization
- Short, high-value onboarding (5-7 questions, not a survey)
- AI determines next-best question based on information gain
- Generates preliminary strategy after minimum viable answers
- Questions: species interest, orientation (meat/trophy/both), timeline, existing points, budget, travel tolerance, hunt style

### Phase 2: Hunt Playbook Generation
Living strategy document with:
- Recommended states & species
- Short-term and long-term goals
- Near-term applications + future point-building
- Budget allocation
- Recommended units/areas
- Rationale for every recommendation
- Deadlines and action items

### Phase 3: Ongoing Learning
Context-sensitive follow-up questions (not endless onboarding):
- "Do you already have Wyoming elk points?"
- "Are you comfortable with high-country terrain?"
- "Do you have access to private land in this area?"
System gets smarter without feeling burdensome.

### Phase 4: Agentic Action Layer
Moves from passive recommendation to proactive action:
- Track and alert on deadlines
- Remind about point purchases
- Pre-fill application workflows
- Alert on regulation/season changes
- Surface strategy updates when odds shift
- Long-term: direct submission assistance

---

## 5. CORE PRODUCT CAPABILITIES

### A. Unified Hunter Profile
Persistent profile that learns over time:
- Target species, trophy vs meat preference
- Travel tolerance, physical ability, budget
- Point holdings by state/species
- DIY vs guided, weapon preferences
- Land access preferences, harvest/application history
- System infers preferences where possible

### B. Hunt Intelligence Engine
Core recommendation brain — ingests, normalizes, compares data across sources:

**Inputs:** State draw systems, point systems, harvest stats, success rates, trophy quality, season dates, tag quotas, applicant trends, public land access, OTC opportunity, leftover tags, commission decisions, regulation changes, point creep patterns, weather/drought/herd trends, forum discussion signals

**Outputs:** Recommended hunts & units, ranked strategies, confidence levels, cost/timeline estimates, expected odds (now + future), tradeoff analysis

### C. Forecasting Engine (Major Differentiator)
Not just current landscape — predicts the future:
- Point creep trajectory
- Odds degradation/improvement
- Expected time to draw
- Probability-adjusted value of staying in a point system
- Value of switching budget elsewhere
- Expected return: apply now vs wait

Directionally useful, transparent about assumptions, no false precision.

### D. Personalized ROI Engine
Where should the hunter spend money?
Weighs: tag costs, license costs, point costs, travel costs, draw odds, trophy quality, opportunity frequency, time horizon, success likelihood, hunter goals.

Example outputs:
- "Fill freezer in 12 months → this state/unit is highest practical return"
- "Trophy mule deer, willing to wait 8-12 years → these states beat your current approach"
- "Point creep makes continued investment here unattractive → redirect budget"

### E. National Opportunity Layer
Supports eastern + nationwide hunters:
- Local/regional opportunity discovery
- Public land opportunity
- Season navigation
- Lower-barrier hunts
- Species access near home
- Overlooked hunts
- Practical entry paths for newer hunters

### F. Agentic Application Support
Digital assistant that manages the process:
- "Buy Arizona points before this deadline"
- "Colorado application coming up"
- "You need hunter ed verification for this state"
- "This regulation changed since last year"
- Long-term: direct submission, auto-generated application packets, credential vaulting

---

## 6. DATA SOURCES & INTELLIGENCE

### Priority Sources (Tier 1-2)
- State wildlife agency websites
- Hunt regulations & draw reports
- Harvest reports & season summaries
- Herd management plans
- Commission agendas & meeting minutes
- Quota history & unit boundary data
- Public land & access datasets
- Weather & habitat trend data
- Leftover/returned tag reports

### Secondary Sources (Tier 3-4)
- Public forums (HuntTalk, Rokslide, etc.)
- Field reports & discussion
- Industry analysis (GoHunt, Epic Outdoors, Hunting Fool)
- Trusted anecdotal insights

**Source scoring:** Agency data > verified stats > expert analysis > community signals. Each source gets a dynamic authority score + freshness tracking.

---

## 7. AI SYSTEM DESIGN PRINCIPLES

1. **Explainability** — Every recommendation comes with plain-English rationale
2. **Confidence & Transparency** — Distinguishes hard data vs forecasts vs inferred preferences vs anecdotal signals
3. **Adaptive Questioning** — Ask as little as possible upfront; ask more only when it materially improves a recommendation
4. **Persistent Memory** — Remembers preferences, past decisions, learns over time
5. **No False Precision** — Probabilistic, reasoned guidance; never pretends certainty

---

## 8. KEY PRODUCT OUTPUTS

### A. Hunt Playbook
Living strategy document: goals, recommended species/states, near-term opportunities, long-term point strategy, budget strategy, ranked priorities, recommended units, timeline/deadlines, rationale.

### B. Annual Strategy Plan
Year-by-year: where to apply, where to buy points, where to avoid spending, what to expect, how strategy may evolve.

### C. Hunt Recommendation Cards
Per recommendation: species, state, unit, orientation (trophy/opportunity), estimated cost, timeline, draw odds context, forecast commentary, why it fits the user.

### D. Action Dashboard
Upcoming deadlines, incomplete items, priority decisions, recommended next actions, change alerts.

---

## 9. TECH STACK

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State (server) | TanStack Query v5 |
| State (client) | Zustand |
| Maps | Mapbox GL JS / MapLibre |
| Charts | Recharts / Nivo |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| PWA | next-pwa / Serwist |
| Real-time | Socket.io |

### Backend
| Layer | Technology |
|-------|-----------|
| API Gateway | Next.js API Routes (BFF) |
| Services | Node.js + Fastify microservices |
| Language | TypeScript (full-stack) |
| ORM | Drizzle ORM |
| Queue | BullMQ + Redis |
| Scheduler | node-cron + BullMQ repeatable |
| Email | React Email + Resend |
| Push | Web Push API + FCM |

### AI / ML
| Layer | Technology |
|-------|-----------|
| LLM | Claude API (Anthropic) |
| Embeddings | Voyage AI |
| Vector Store | pgvector (PostgreSQL) |
| ML Models | Python (scikit-learn, Prophet, XGBoost) |
| ML Serving | FastAPI microservice |
| RAG | Custom retrieval pipeline |

### Data & Infrastructure
| Layer | Technology |
|-------|-----------|
| Primary DB | PostgreSQL 16 + pgvector + PostGIS |
| Cache | Redis 7 |
| Object Storage | S3 / Cloudflare R2 |
| Search | Meilisearch |
| Frontend Host | Vercel |
| Backend Host | AWS ECS Fargate / Fly.io |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + Axiom |
| Analytics | PostHog |
| Auth | Auth.js (NextAuth v5) |

---

## 10. SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Mobile-First PWA)               │
│         Next.js 15  •  Bottom Tab Nav  •  Card-Based UX         │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                    API GATEWAY / BFF LAYER                        │
│         Next.js API Routes  •  Auth  •  Rate Limiting            │
└──────────────────────────────┬───────────────────────────────────┘
                               │
    ┌──────────┬───────────┬───┴────┬──────────┬──────────┐
    ▼          ▼           ▼        ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Profile │ │Intel   │ │Forecast│ │AI/LLM  │ │Notif   │ │Data    │
│Service │ │Engine  │ │Service │ │Service │ │Service │ │Ingest  │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    └──────────┴───────────┴────┬────┴──────────┴──────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│   PostgreSQL + pgvector  •  Redis  •  S3  •  Meilisearch        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. DATABASE DESIGN (20 Tables)

### Hunter Profile Domain
- `users` — accounts, onboarding state, timezone
- `hunter_preferences` — dynamic key-value preferences (JSONB), confidence scoring, source tracking (user-stated vs inferred)
- `point_holdings` — points per state/species, point type (preference/bonus/loyalty)
- `application_history` — past applications with results
- `harvest_history` — past harvests with trophy data

### Hunting Data Domain
- `states` — fully dynamic, admin-managed, JSONB config per state
- `species` — dynamic catalog with categories
- `state_species` — availability matrix (which species in which states, draw/OTC/points config)
- `hunt_units` — per state, PostGIS geometry, public land %, terrain class
- `draw_odds` — historical per unit/species/year, applicant counts, min/max/avg points drawn
- `harvest_stats` — per unit/species/year, success rates, trophy metrics (JSONB)
- `seasons` — dynamic per state/species/year, dates, weapon types, quotas

### Strategy & Recommendations
- `playbooks` — living strategy documents per user (versioned)
- `recommendations` — individual recs within playbooks, multi-factor scoring, AI rationale, confidence levels

### Actions & Deadlines
- `deadlines` — dynamic per state/species/year, configurable reminder schedules
- `user_actions` — per-user action items with priority and status tracking

### Data Management
- `data_sources` — source registry with authority tiers, scraper config (JSONB), refresh cadence
- `documents` — ingested content with pgvector embeddings (1536-dim) for RAG

### Configuration
- `ai_prompts` — versioned, hot-swappable prompt templates
- `app_config` — dynamic key-value configuration (namespace/key/JSONB value)

**Key principle:** Every business rule, state quirk, species mapping, deadline, scoring weight, and AI prompt is stored in the database. Nothing is hardcoded. Adding a new state = inserting rows, not deploying code.

---

## 12. AI/ML ARCHITECTURE

### Conversational Onboarding
- AI determines next-best question based on profile completeness + information gain
- Claude generates natural-language questions with response options
- User response parsed → profile updated → threshold check → playbook generation or next question
- Dynamic question priority queue (species_interest: 1.0, orientation: 0.95, timeline: 0.90, budget: 0.85, etc.)

### Recommendation Pipeline
```
1. CANDIDATE GENERATION — Filter by hard constraints (species, state, budget, travel, timeline)
2. MULTI-FACTOR SCORING — draw_odds, trophy_quality, success_rate, cost_efficiency, access, forecast, personal_fit (weights from profile)
3. STRATEGY OPTIMIZATION — Portfolio balancing (short/long term, state diversity, budget allocation, risk/reward)
4. EXPLANATION GENERATION — Claude generates plain-English rationale, tradeoff analysis, confidence disclosure, source attribution
```

### Forecasting Models (Python/FastAPI)
| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Point Creep Predictor | Prophet + features | Project future point thresholds |
| Draw Odds Forecaster | XGBoost | Predict future draw probability |
| Applicant Trend Model | ARIMA + externals | Predict application volume changes |
| ROI Optimizer | LP + Monte Carlo | Maximize hunting value per dollar |
| Trophy Trend Model | Bayesian regression | Track trophy quality trajectory |

### RAG Pipeline
Query embedding → pgvector semantic search + metadata filters → source-aware reranking (authority tier + freshness + relevance) → context assembly with citations → Claude generation with source-aware system prompt.

---

## 13. MOBILE-FIRST DESIGN

### Principles
- Bottom tab navigation (thumb-zone friendly)
- Card-based content — swipeable recommendation cards
- Progressive disclosure — summary first, details on tap
- Sticky action bars at bottom of screens
- Sheet/drawer patterns for secondary content
- Skeleton loading states on every dynamic view
- Offline-capable playbook via service worker
- 44px minimum touch targets (Apple HIG)

### Responsive Strategy
```
Mobile (default)   → Single column, bottom tabs, full-bleed cards
Tablet (768px+)    → Two columns, sidebar appears
Desktop (1024px+)  → Full sidebar, multi-panel layouts, map + list split
```

---

## 14. DYNAMIC CONFIGURATION — NOTHING HARDCODED

```
States          → CRUD in DB, not in code
Species         → CRUD in DB, not in code
Draw Rules      → JSONB config per state/species
Point Systems   → JSONB config per state/species
Deadlines       → CRUD in DB, year-specific
Scoring Weights → JSONB config, A/B testable
AI Prompts      → Versioned in DB, hot-swappable
Feature Flags   → PostHog / DB config
Scraper Config  → JSONB per source
Notifications   → Template + rules in DB
Onboarding Qs   → Question bank in DB, priority-weighted

To add a new state:
1. Insert into states table
2. Insert state_species relationships
3. Configure deadlines
4. Add data source config
5. Done — no deploy needed
```

---

## 15. DATA INGESTION PIPELINE

```
Scheduler (BullMQ) → Fetchers (per-source adapters) → Parsers (per-type)
→ Validators (quality checks) → Normalizers (cross-state) → Embeddings + Index
→ DB Write (upsert) → Notify (affected users if data changed significantly)
```

Each source configured via JSONB in `data_sources` table (adapter type, endpoints, schedule, rate limits, retry policy). New sources added through config, not code.

---

## 16. API DESIGN (12 Endpoint Groups)

All versioned under `/api/v1/`:

| Group | Key Endpoints |
|-------|--------------|
| Auth | signup, login, refresh, logout |
| Profile | CRUD profile, preferences, points, application/harvest history |
| Onboarding | next-question, answer, progress |
| Playbook | get, generate, update, history |
| Recommendations | list, detail, feedback, filters |
| Intelligence | states, species, units, draw-odds, harvest-stats, seasons |
| Forecasts | point-creep, draw-odds, ROI projections |
| Deadlines | list, upcoming |
| Actions | list, update status, dashboard view |
| Chat | message (streaming), history, suggested questions |
| Search | full-text + semantic search |
| Notifications | list, mark read, preferences |
| Admin | CRUD for states, species, sources, deadlines, prompts, config |

---

## 17. INFRASTRUCTURE

### Environments
```
local      → Docker Compose (PostgreSQL, Redis, Meilisearch, MinIO)
preview    → Vercel preview deploys (per-PR)
staging    → Full production mirror
production → Vercel (frontend) + AWS/Fly (services) + RDS (database)
```

### CI/CD (GitHub Actions)
```
lint → test → build → security scan → preview deploy → staging (auto) → production (manual promote)
```

### Monitoring
- Sentry (errors + performance + session replay)
- Axiom (structured logs)
- PostHog (product analytics, funnels, feature flags)
- BullMQ Dashboard (job queue monitoring)
- Custom `/api/health` (DB, Redis, AI, Search status)

---

## 18. PHASED IMPLEMENTATION ROADMAP

### Phase 1: Foundation MVP (Weeks 1-6)
- Project scaffolding, DB schema, auth, CI/CD, design system
- Adaptive onboarding flow (5-7 core questions)
- Hunter profile + manual point entry
- Basic recommendation engine (state/species matching + draw odds)
- Playbook generation + recommendation cards
- Mobile-first UI polish

**MVP proves:** Recommendations are useful, personal, and better than manual research.

### Phase 2: Intelligence Layer (Weeks 7-12)
- Data ingestion pipeline, first 10 state integrations
- Draw odds + harvest stats integration
- Forecasting engine (point creep, draw odds projection)
- ROI engine, cost optimization, budget allocation
- National opportunity layer (eastern states, OTC, public land)

### Phase 3: Concierge Experience (Weeks 13-18)
- Deadline tracking + notification system + reminder engine
- Action dashboard, calendar view, checklist management
- Conversational AI concierge (Claude-powered chat)
- Strategy update engine ("what changed since last visit")

### Phase 4: Power Features (Weeks 19-26)
- Interactive map with unit boundaries + public land overlay
- Advanced forecasting (multi-year scenario modeling)
- Annual strategy planner with year-over-year view
- Application simulation engine
- Outcome tracking + post-season feedback loops
- Agentic submission prep (pre-filled applications, checklists)

### Phase 5: Scale & Monetize (Weeks 27+)
- Subscription tiers (Free / Pro / Elite)
- Credential vaulting + state account linking
- Direct application submission workflows
- Guided/outfitter marketplace
- Family/group planning
- White-label partner API
- Native mobile apps (React Native)

---

## 19. GUARDRAILS

### Legal/Compliance
- Some states restrict automated submissions — respect ToS
- Disclose recommendation vs action clearly
- Secure handling of sensitive user/account data
- SOC 2 Type I compliance path from day one

### Data Quality
- Official data outranks anecdotal intelligence
- Freshness monitoring + staleness flagging
- Source traceability + citation support

### Product Trust
- Clear, honest, explainable, accurate, transparent about uncertainty
- No false precision in forecasts
- Probabilistic guidance, not promises

---

## 20. PRODUCT PERSONALITY

The experience should feel like a **highly competent hunting strategist:**
- Practical, experienced, confident but not arrogant
- Efficient, personalized, trustworthy, focused on action
- **Not** a generic chatbot — a knowledgeable partner who understands hunting goals, application systems, and real-world tradeoffs

---

## 21. PROJECT STRUCTURE (79 Files)

```
HuntLogic/
├── ARCHITECTURE.md                 # Full architecture document
├── HUNTLOGIC_FULL_STRATEGY.md      # This file
├── package.json                    # Next.js 15 + all dependencies
├── tsconfig.json                   # Strict TypeScript
├── next.config.ts                  # Next.js + PWA config
├── tailwind.config.ts              # Mobile-first + brand palette
├── drizzle.config.ts               # ORM config
├── docker-compose.yml              # PostgreSQL, Redis, Meilisearch, MinIO
├── .env.example                    # 40+ documented env vars
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Login, signup, onboarding
│   │   ├── (dashboard)/            # All authenticated pages
│   │   │   ├── dashboard/          # Action dashboard
│   │   │   ├── playbook/           # Hunt playbook
│   │   │   ├── recommendations/    # Recommendation cards
│   │   │   ├── explore/            # National opportunity explorer + map
│   │   │   ├── forecasts/          # Point creep & draw forecasting
│   │   │   ├── calendar/           # Deadlines & actions
│   │   │   ├── profile/            # Profile, points, preferences
│   │   │   └── settings/           # App settings
│   │   ├── (marketing)/            # Landing, pricing, features
│   │   └── api/v1/                 # 12 API route groups
│   ├── components/                 # UI, hunt, onboarding, dashboard, chat, layout
│   ├── lib/
│   │   ├── db/schema/              # 7 Drizzle schema files (20 tables)
│   │   ├── ai/                     # Claude client, RAG, prompts
│   │   ├── api/                    # HTTP client
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── config/                 # App config loader
│   │   └── validations/            # Shared Zod schemas
│   └── services/                   # Profile, intelligence, forecasting, notifications, ingestion
└── services/
    └── forecasting-api/            # Python FastAPI + ML models
```

---

## 22. SUMMARY

HuntLogic Concierge is architected as a **modular, dynamic, mobile-first platform** where:

- **Every configuration is data-driven** — new states, species, rules, and sources added without code changes
- **AI is woven throughout** — conversational onboarding, strategy generation, explanations, proactive reminders
- **Mobile is primary** — designed for phones first, enhanced for tablets and desktop
- **The system learns continuously** — from user feedback, behavioral signals, and fresh data
- **Trust is earned through transparency** — every recommendation has rationale, confidence levels, and source attribution
- **National scope** — serves western draw hunters and eastern opportunity hunters equally

The goal: become the most trusted digital hunt planner in the country.

---

*Generated for the HuntLogic Concierge project — https://github.com/AugmentAdvertise/HuntLogic*
