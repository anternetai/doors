# Door-to-Door Sales App — Competitor UX Analysis
**Research Date:** March 30, 2026
**Purpose:** Feed into Doors app strategy — what to steal, what to avoid, what to do differently

---

## EXECUTIVE SUMMARY

The D2D app market is dominated by 2 incumbents (SalesRabbit, SPOTIO) that are functional but aging, surrounded by scrappy challengers (Knockbase, Knockio, Active Knocker, Harvast, D2D CRM) fighting on price. The incumbents' UX debt is showing — users complain about slow load times, confusing navigation after updates, and clunky multi-step workflows. The challengers are faster and cheaper but lack depth. **The white space: a genuinely modern, fast, opinionated mobile experience that feels like a consumer app (not enterprise CRM), with home services-specific intelligence built in.**

---

## COMPETITOR PROFILES

---

### 1. SalesRabbit

**Overview:** Founded 2013. 85,000+ daily users. The incumbent leader. Mobile-first canvassing platform that expanded into a full platform suite (Amplify, DataGrid AI, Scheduler, Digital Contracts, Weather, RoofLink, Movers).

**Brand Colors:**
- Primary: `#ffb606` (golden yellow/amber)
- Secondary: `#566bda` (blue-purple)
- Clean white backgrounds, standard sans-serif fonts

**App Navigation Pattern:**
- Map-first on launch — the map IS the home screen
- Bottom tab navigation (mobile standard)
- Tabs include: Map, Leads, Areas, Stats, Settings (inferred from feature set)
- Web version has horizontal top nav; mobile has bottom tabs
- New "Find My Area" button added bottom-right of map to jump to current working area

**Map Interface:**
- Satellite/street map base layer
- Color-coded pins representing lead disposition status
- Each pin shows an abbreviated status label (e.g., "DK" for Door Knocked, "NI" for Not Interested, "RNT" for Renter)
- Pin color is FULLY CUSTOMIZABLE per organization — no fixed standard colors
  - Yellow commonly used for "Not Home"
  - Colors reflect disposition type (interested, not home, sold, etc.)
- Territory "areas" are custom-drawn polygons overlaid on the map
- Area assignment colors: assigned areas show user's color, unassigned areas show black/gray
- Map overlays (KML/KMZ files) supported on Pro tier — e.g., storm damage data, demographic overlays
- Rooftop geocoding via Smarty.com for pin accuracy
- "Find My Area" button added recently for quick jump to working area

**Door Logging Workflow:**
1. Open map → tap on home/address
2. Pin drops at location
3. Select disposition from pre-built or custom status list
4. Add notes (recently split Name field into First/Last)
5. Can copy notes quickly via Lead Card
- The tap-to-pin approach is the core interaction, not form-first

**Dashboard / Stats (Amplify):**
- Separate "Amplify" app/module for analytics + gamification
- Scorecard display with color-coded slider KPI visualization
- Monthly rep scorecards (knocks, appointments held, etc.)
- Leaderboard: ranked list from top to bottom by XP earned
- Individual metric scores out of 100
- Gamification themes: Call of Duty, Minecraft, Peasant to King
- Badge/achievement icons (hundreds of options)
- Progress bars and level indicators
- Head-to-head battle cards
- TV dashboard mode — displays on office screens
- Rewards Store with digital/physical prizes
- Social feed for public celebrations
- Tournament bracket visualizations

**Strengths:**
- Offline mode (competitors lack this — cited as major differentiator)
- Rooftop-accurate geocoding
- Gamification depth (Amplify) is unmatched in category
- 31 G2 awards in 2024
- Weather/storm data overlay (unique)
- Digital contracts in-app
- Movers data (targeting new homeowners)

**Weaknesses (User-Reported):**
- Steep learning curve — feature complexity overwhelms new users
- Slow load times, freezes without stable connection
- Map filters limited vs. competitors (fewer filter options)
- Can be confusing to navigate — "complex and unintuitive" per some reviews
- Performance lags with large datasets
- Heavy platform = not agile for simple use cases

**What Looks Modern:**
- Gamification UI (Amplify) is genuinely impressive and visually rich
- Lottie animations on website (implies similar in-app)
- Clean card layouts

**What Looks Dated:**
- The core canvassing map UI feels functional but not delightful
- Feature sprawl makes the UX feel like enterprise software, not a sales tool

**Pricing:** $49-59/user/month + $399 setup fee. Enterprise custom.

---

### 2. SPOTIO

**Overview:** Positioned as "field sales engagement platform" targeting 5+ rep teams. Strongest enterprise features of any D2D-native app. Map design rated 9.7/10 on G2 (vs SalesRabbit's 9.3).

**Brand Colors:**
- Primary: `#204ce5` (bright blue), `#2532a2` (darker blue)
- Secondary: Navy `#2d3e80`
- Accent: Yellow/gold for feature icons, Green for GPS/positive indicators
- White backgrounds on content, dark blue nav elements
- Industry icons in yellow, orange, green, blue — colorful category system

**App Navigation Pattern:**
- Map-centric mobile-first design
- "Central hub" design concept — one screen as command center for leads, routes, activity
- Customizable layouts: 2-4 column configurations, expandable mobile sections, custom tab orders, role-based views
- Bottom navigation on mobile (standard)
- Role-differentiated views: rep view vs manager view look different

**Map Interface:**
- ALL prospects geo-coded on map as color-coded pins
- "Colorization" feature: color of pin changes based on any data field you choose
  - Common setup: colorize by "Last Visit Result" (not home, not interested, follow-up, lead)
  - Colors reflect where prospect is in sales cycle
- Lasso tool: draw a freehand selection on map → instantly route all selected leads (unique interaction pattern)
- "Download My Day" — saves map state for offline use
- Territory boundaries drawn and assigned
- Handles 150 stops per route
- Customer mapping shows: existing customers, knocked doors, disposition types, untouched streets — all visible simultaneously
- Map loads slower when pins aren't grouped (users complained about this)
- Pin overlap/grouping causes issues in dense areas

**Door Logging Workflow:**
- "One-tap activity logging" — single tap logs visit with GPS location automatically attached
- Records knock in under 3 seconds
- Disposition statuses: not home, not interested, follow-up, lead
- Location verification automatic — no manual entry of address
- Activities auto-log to CRM
- "DASH IQ" — AI summary of SPOTIO data for that specific address

**Dashboard:**
- Real-time field activity dashboards
- 200+ filter options
- Leaderboard with real-time performance rankings
- Customizable reports with KPIs tied to revenue
- Manager view shows territory-level heat maps
- Pipeline visualization tracking deal stages
- Automated email reports sent to managers

**Analytics Features:**
- Task Management rated 9.0/10 (G2)
- Lead Prioritization rated 8.9/10
- Data Visualization rated 9.7/10

**Strengths:**
- Best-in-class map design (9.7 G2 score)
- Lasso tool is genuinely clever UX
- One-tap logging with location verification is fast
- Most customizable territory system
- AutoPlays — automated follow-up sequences
- Bi-directional CRM sync (Salesforce, HubSpot)
- DASH IQ AI feature
- Offline "Download My Day" mode

**Weaknesses (User-Reported):**
- Territory management went backwards in v2.0 — removed useful features, harder to use
- Map loads slow, pins grouped in confusing way
- "Can be confusing to use"
- More expensive than competitors, requires minimum 5 licenses
- Annual contracts only, no free plan
- App feels overwhelming for small teams
- Dashboard/mapping can't be customized as much as users want (despite being more customizable than SalesRabbit)

**What Looks Modern:**
- Color-coded interactive maps with dynamic colorization
- One-tap logging concept is excellent UX
- Role-based views (different rep/manager experience)
- DASH IQ AI integration

**What Looks Dated:**
- Despite high G2 scores, the v2.0 territory system regression is a real UX problem
- Heavy enterprise feel — small teams find it overwhelming
- Pin grouping/clustering is a known UX problem

**Pricing:** $39-69/user/month (Team/Business). Enterprise custom. 5-user minimum. Annual contract required.

---

### 3. Knockbase

**Overview:** Built in 2024, mobile-first, gamification-heavy. Targets teams that want Amplify-style competition without SalesRabbit's price and complexity. Strong on pest control, HVAC, home security niches.

**Brand Colors:**
- Dark navy: `rgba(20, 33, 53, 1)` / `rgba(23, 33, 60, 1)` (deep dark backgrounds)
- Cyan accent: `rgba(81, 207, 244, 1)` (bright cyan highlights)
- Orange gradient buttons: `rgba(242, 151, 36, 1)` → `rgba(242, 75, 36, 1)`
- White text on dark backgrounds
- Typography: Play (display), Poppins (UI), Mulish (body), Inter
- Button border-radius: 50px (very rounded pill buttons)

**Overall Aesthetic:**
- Dark, bold, energetic — feels more like a gaming app than SalesRabbit's corporate yellow
- High contrast — dark navy backgrounds with bright cyan and orange accents
- Pill-shaped CTAs suggest modern/consumer app feel

**App Navigation:**
- "No clunky desktops or confusing UIs, just smooth mobile-first experience"
- Role-based workflows (rep vs manager)
- Map, leads, team, leaderboard views

**Map Interface:**
- Live territory tracking visible to managers
- Rep check-ins on map
- Route planning with territory reporting
- Custom forms for lead capture on-site

**Door Logging:**
- Log leads on the spot via mobile
- Custom forms, photo capture, notes, appointment scheduling — all from map view
- Quick-tap approach emphasized

**Gamification (Core Differentiator):**
- Real-time leaderboards updated live during knock sessions
- Points for: door knocks, leads captured, appointments booked, sales closed
- Custom challenges and battles between reps
- Badges, trophies, tangible rewards
- Goal-setting with visual progress indicators
- Team rankings with real-time movement
- Manager-configurable competitions

**Analytics:**
- Live dashboards for managers
- Rep check-in verification with location
- Territory reporting and coverage maps

**Strengths:**
- Gamification is deep and visually compelling
- Modern dark UI aesthetic stands out vs competitors
- Mobile-first, no desktop-centric UX mistakes
- Photo/video capture in-app
- Designed specifically for 2024's needs
- No clunky legacy code issues

**Weaknesses:**
- Newer product — less proven at scale
- Territory management may not handle complex/large operations
- Limited public feature documentation vs SalesRabbit

**What Looks Modern:**
- Dark navy + cyan color palette is the most visually distinctive in the space
- Pill buttons, rounded corners — consumer app aesthetics
- Gamification UI with live updates

**What Looks Dated:**
- N/A — too new. Watch for feature gaps as it scales.

---

### 4. Knockio

**Overview:** All-in-one CRM + canvassing hybrid. "Knockio Growth" (v2) expanded from canvassing to full field operations platform. Linear workflow model: Knock → Capture → Book → Follow Up → Quote → Sign → Invoice → Collect → Track.

**Brand Colors:**
- Primary blue: `#2ea3f2` (medium bright blue)
- Light backgrounds — white/soft gray dominant
- Professional but not distinctive

**App Navigation:**
- Standard horizontal menu (web): Home, Features, Industries, Pricing, Blogs
- Mobile: territory map, lead records, route optimization, performance analytics
- Drag-and-drop workflow boards for pipeline management (kanban-style)
- Status indicators with color coding for lead stages

**Map Interface:**
- Map-based lead marking and visualization
- Territory assignment and optimized routing
- Factors in travel time, traffic, customer density for routes

**Door Logging:**
- Streamlined data fields + comment capture
- Quick note jotting + follow-up scheduling
- Territory-based tracking

**Key Differentiator (v2 "Growth"):**
- Full business lifecycle: Quote → Sign → Invoice → Collect all in-app
- Not just a canvassing tool — an end-to-end ops platform
- 16+ distinct feature modules

**Weaknesses:**
- UI described as "cleaner and more intuitive" in updates (implies prior messiness)
- Limited scalability for large enterprise teams
- Territory management weaker than SalesRabbit/SPOTIO for complex operations

**What Looks Modern:**
- Kanban pipeline views
- Linear workflow visualization
- In-app invoicing (rare in D2D space)

**What Looks Dated:**
- Light blue on white doesn't stand out
- Feature sprawl without strong visual hierarchy

**Pricing:** Budget-friendly (positioned as affordable alternative)

---

### 5. Active Knocker

**Overview:** Focused, no-frills door knocking tool. "Super easy to use" per reviews. No year-long contracts. Positioned vs SalesRabbit/SPOTIO as simpler and more responsive.

**App Navigation:**
- Web portal at web.activeknocker.com + mobile app
- Enrollment separate at join.activeknocker.com
- Solutions, Features, Pricing, FAQ, Contact navigation
- Cross-device: iPhone, tablet, desktop all shown in mockups

**Key UI Features:**
- Map pins for property tagging
- Route optimization between pins
- Real-time location tracking for team
- Calendar integration for appointments
- Leaderboard comparisons across team members
- "Never knock on the same door twice" — persistent door-level notes
- "Imported Pin Manager" for quick turf assignments

**Integrations:**
- FillQuick, Google Calendar, Zapier, custom API

**Strengths:**
- Users report it "gives 100% of what we need"
- Fast, responsive customer support
- No long contracts
- Simple — not overwhelming
- Good for running small door knocking teams

**Weaknesses:**
- Randomly drops pins unintentionally (reported bug)
- Less feature depth than SalesRabbit/SPOTIO
- Limited documentation publicly available

**What Looks Modern:**
- Clean, focused UX — doesn't try to be everything
- No enterprise complexity

**What Looks Dated:**
- Less visual flair than newer dark-themed apps
- Basic compared to gamification-heavy alternatives

---

### 6. Harvast

**Overview:** Free door knocking app targeting realtors AND home service pros. Hybrid map + stat tracking approach. Emphasis on "street by street" performance tracking.

**Brand Colors:**
- Primary blue: `#0077FF` (bright), `#0052E4` (standard)
- Dark navy headlines: `#0c1523`
- Accent green: `#099914`
- Light background: `#F7F9FC`
- Border: `#EDEDED`
- Typography: Sora (headlines, 700 weight), Inter (body, 400 weight)
- Base font size: 18px with 1.7 line height (very readable)

**Overall Aesthetic:**
- Clean, airy, light UI — consumer app feel
- Well-considered typography system
- More refined than older competitors

**App Navigation:**
- Standard bottom tabs (mobile)
- Map view + stats view + team view

**Dashboard Layout (Documented):**
- "My Stats" card: total leads, doors knocked, conversations, conversion rates
- "Team Stats" section: weekly performance bars (Monday–Sunday view)
- "Team Leaderboard": ranking by lead count
- "Territory Map": with live status indicators
- Offline capability: no signal required

**Door Logging:**
- Tap-based quick logging
- Status options: "Knocked," "Lead," "Hot," "Not home," "New Lead"
- Full lead form: name, phone, notes
- Audio notes with transcription
- Offline — syncs when signal returns

**Unique Features:**
- Street-by-street performance tracking
- Hybrid map-view (satellite + overlay)
- Lead segmentation
- Digital business card
- Audio notes + transcription
- Door knocking session tracking with start/stop

**Strengths:**
- Free (massive advantage for small teams)
- Clean modern aesthetic
- Offline mode
- Audio notes (unique in category)
- Door knocking session tracking
- Real weekly stats visualization (Mon-Sun bars)

**Weaknesses:**
- Less enterprise depth
- Primarily known for real estate — home services is secondary
- Fewer team management tools than SalesRabbit

**What Looks Modern:**
- Sora + Inter typography is clean and contemporary
- Soft blue/white color palette vs competitors' busy maps
- Card-based stats layout is intuitive

**What Looks Dated:**
- Nothing notably dated — it's newer and lighter

---

## CROSS-COMPETITOR UI PATTERN ANALYSIS

### Navigation Patterns (Ranked Most → Least Common)
1. **Bottom tab bar (4-5 tabs)** — universal standard on mobile. Map, Leads, Stats, Team, Settings.
2. **Map as home screen** — virtually universal. The map IS the app.
3. **Hamburger/sidebar** — appears on older/web versions, dying on mobile
4. **Top horizontal nav** — web only, not used in mobile apps

### Map Interface Patterns
- **All apps use the map as primary navigation surface** — this is non-negotiable
- Pin color-coding for disposition status — universal, but implementation varies
  - SalesRabbit: fully custom colors, user-defined
  - SPOTIO: "Colorization" feature — color by any data field dynamically
  - Harvast: fixed status types (Knocked/Lead/Hot/Not Home/New Lead)
- Territory polygons overlaid on map — all major apps support this
- Route line visualization (GPS breadcrumbs) — common
- Offline map caching — SalesRabbit and SPOTIO both offer; major differentiator
- Pin grouping at zoom levels — causes user frustration at SPOTIO

### Door Logging Interaction Patterns
| App | Logging Speed | Method |
|-----|--------------|--------|
| SPOTIO | "Under 3 seconds," one-tap | Tap map → select disposition → done |
| SalesRabbit | Medium | Tap map → drop pin → select status → add notes |
| Harvast | Fast | Tap status button (5 options visible) |
| Knockbase | Fast | Custom form from map tap |
| Active Knocker | Fast | Tap-based with persistent notes |

### Gamification Patterns
| App | Gamification Depth |
|-----|-------------------|
| SalesRabbit Amplify | Deep — game themes, XP, battles, TV dashboards, badges, rewards store |
| Knockbase | Strong — real-time leaderboards, custom challenges, live competition |
| SPOTIO | Moderate — leaderboards, performance rankings |
| Active Knocker | Basic — team leaderboard comparisons |
| Harvast | Basic — weekly team stats, leaderboard |
| Knockio | Minimal |

### Color Scheme Summary
| App | Vibe | Primary Color |
|-----|------|--------------|
| SalesRabbit | Corporate yellow | `#ffb606` amber + `#566bda` blue |
| SPOTIO | Enterprise blue | `#204ce5` blue + yellow accents |
| Knockbase | Dark gaming | Navy `#142135` + cyan + orange |
| Knockio | Light professional | `#2ea3f2` blue on white |
| Active Knocker | Neutral | Unspecified, clean |
| Harvast | Clean consumer | `#0077FF` blue + white, Sora font |

---

## WHAT TO STEAL

### From SalesRabbit
- **Gamification depth** — XP, battles, TV display mode, achievement badges with rewards store. SalesRabbit built this as a separate "Amplify" app but it could be native.
- **Offline mode** — this is mentioned as #1 differentiator vs competitors constantly. Must have.
- **Rooftop geocoding accuracy** — pin lands on roof, not street. Matters for D2D.
- **Status abbreviations on pins** — "NI," "DK," etc. lets reps read the map without zooming.
- **Custom color + icon system for dispositions** — let companies define their own pin language.

### From SPOTIO
- **Lasso tool** — draw a loop around a cluster of homes, auto-route all of them. Elegant.
- **One-tap logging with GPS auto-attach** — no manual address entry. Tap → log → done.
- **DASH IQ concept** — AI summary at the address level. Port to home services context (property age, permit history, insurance scores).
- **Colorization by any data field** — dynamic pin recoloring based on what you want to see.
- **"Download My Day"** — offline pack for the day's territory before losing signal.
- **Role-differentiated views** — rep sees map + log, manager sees territory heat maps + team dashboards.

### From Knockbase
- **Dark theme** — navy + cyan stands out visually in a sea of white/blue apps. More energetic.
- **Pill-shaped buttons** (50px border-radius) — consumer app feel vs corporate SaaS.
- **Live real-time gamification** — leaderboard that moves during a knock session creates urgency.

### From Harvast
- **Audio notes + transcription** — huge for field reps who can't type while walking. Unique in space.
- **Session tracking** (start/stop for knock sessions) — discrete work blocks with stats per session.
- **Monday–Sunday weekly performance bars** — simple, visual, at a glance.
- **Typography** — Sora + Inter at 18px/1.7 is very readable outdoors. Accessibility-minded.

### From Active Knocker
- **"Never knock the same door twice"** — persistent notes at door level, visible before approaching.
- **Simple pricing, no long contracts** — the market hates annual lock-ins.

---

## WHAT TO AVOID

### From SalesRabbit
- **Platform sprawl** — 8 separate products (Amplify, DataGrid AI, Scheduler, Digital Contracts, Movers, Weather, RoofLink + core) confuses users and creates a steep learning curve. Keep the core tight.
- **$399 setup fee** — creates friction, feels dated.
- **Feature complexity that overwhelms reps** — field reps don't want to learn software. 2 taps max.
- **Slow load times** — if the app stutters on poor 4G signal, reps will abandon it.

### From SPOTIO
- **Territory management regressions** — v2.0 removed features users relied on. Never remove useful features without better replacement.
- **Pin grouping/clustering** — reps hate when they can't see individual houses. Default to unclustered at any zoom level where houses are distinguishable.
- **5-user minimum + annual contracts** — kills small team adoption.
- **"Can be confusing to use"** — complex enterprise features bleed into the rep experience.

### From Knockbase
- **Duda website builder** — not about the app itself, but signals limited engineering investment in some areas.

### Industry-Wide Anti-Patterns
- **Forms before map** — if logging starts with a form, reps won't log in the field.
- **Multiple required fields before saving** — anything more than status + optional note kills compliance.
- **No offline mode** — neighborhoods with poor signal are common. Must work offline.
- **Web-first design ported to mobile** — all these apps started on web, many still feel like it.
- **Learning curve** — mentioned as problem with SalesRabbit, SPOTIO, Ecanvasser, Lystloc. The category is full of complex tools. Simplicity is the differentiation.

---

## WHAT DOORS SHOULD DO DIFFERENTLY

### 1. Home Services-Specific Intelligence (No App Does This)
Every competitor is generic D2D. None are purpose-built for home services contractor sales. Doors should have:
- Property data pre-loaded (year built, sq footage, last roof permit, fence/driveway visible from satellite)
- Neighborhood heat scoring based on service type (roofers should knock storm-damaged areas, HVAC shops should focus on older homes)
- Seasonal overlays (storm tracks, hail maps for roofing teams)
- Revenue potential score per address — not just "lead" vs "not home"

### 2. Speed as a Core Design Principle
SPOTIO claims "3 seconds to log" — but users still complain it's slow. Doors should target:
- **1-tap disposition** — the moment they walk away from the door, one thumb tap logs it
- Status buttons physically large (48px+ touch target), thumb-reachable in bottom third of screen
- No modals for common dispositions — inline state change, not modal popup
- Optimistic UI — the pin changes instantly before the server confirms

### 3. Conversation-First Design
Competitors log "what happened" at the door. Doors should capture "how it went":
- Quick sentiment capture (warm/cold/hot)
- Auto-prompt for next step ("What should happen next?" → Follow up tomorrow / Book appointment / Do not return)
- Script/objection handler embedded — not a separate app but contextual prompts based on disposition
- Voice memo or AI transcript built in (like Harvast audio notes but with AI analysis)

### 4. Rep Onboarding in 5 Minutes
SalesRabbit and SPOTIO have learning curves measured in days/weeks. Doors should have:
- Opinionated default setup — don't ask reps to configure. Ship working defaults.
- 3-screen onboarding: (1) Enable location, (2) See your territory, (3) Log your first door.
- Video-free onboarding — use progressive disclosure, not tutorial videos

### 5. Manager Dashboard That Doesn't Require Another App
SalesRabbit requires Amplify (separate app) for analytics. SPOTIO has a complex separate manager view. Doors should have a single app where:
- Managers swipe/toggle into a "coach view" that shows team map + performance
- No separate login or app for analytics
- Daily digest auto-sent to Slack or email (not requiring them to open the app)

### 6. Pricing Model That Matches the Market
- All competitors charge $39-69/user/month
- Active Knocker and Harvast win on "no long contracts" specifically
- D2D CRM wins on "free" — but is shallow
- Doors opportunity: **flat team pricing** (not per seat) or **pay per appointment booked** (aligned with how HFH charges)
- No annual contract lock-in to start — earn monthly renewals

### 7. Visual Identity That Signals Speed and Energy
- SalesRabbit = corporate yellow (dated, corporate)
- SPOTIO = enterprise blue (safe, forgettable)
- Knockbase = dark gaming (bold but niche)
- **Doors opportunity:** Bold, high-contrast, field-worker-appropriate color system. Consider:
  - High contrast for outdoor visibility (bright backgrounds wash out in sunlight)
  - Dark mode as default (Knockbase is onto something — also better battery life)
  - Thick, readable typography (field use, not desk use)
  - Green as primary accent — signals "go, active, closing" energy

### 8. AI Integration That's Actually Useful
- SPOTIO has "DASH IQ" (AI summary at address level) — none others have this
- Doors should build in:
  - Best time to knock (based on past visit data + neighborhood patterns)
  - Predicted outcome score before the rep walks up
  - Auto-generated follow-up message after disposition is logged
  - Weekly coaching brief for reps ("Your no-answer rate is 40% — try adjusting visit times")

---

## MARKET GAP SUMMARY

| Gap | Who's Closest | Doors Opportunity |
|-----|-------------|------------------|
| Home services-specific data | Nobody | Build in property intelligence |
| Single-tap logging | SPOTIO (close) | Make it truly frictionless |
| Offline first | SalesRabbit + SPOTIO | Match them, add smart sync |
| Audio notes + AI | Harvast (audio only) | Audio + AI analysis + auto-CRM |
| Flat/outcome-based pricing | D2D CRM (free) | Pricing aligned with results |
| No long contracts | Active Knocker | Month-to-month always |
| AI at address level | SPOTIO (limited) | Pre-knock intelligence |
| 5-minute rep onboarding | Nobody | Opinionated fast setup |
| Home screen as map | Universal | Keep this — it's right |
| Dark theme | Knockbase | Adopt, refine |
| Manager in same app as rep | Harvast (partial) | Single-app with role toggle |

---

## SOURCES REFERENCED

- [SalesRabbit App Store](https://apps.apple.com/us/app/salesrabbit/id879884387)
- [SalesRabbit Website](https://salesrabbit.com/)
- [SalesRabbit Amplify Gamification](https://salesrabbit.com/amplify-gamification/)
- [SalesRabbit Territory Mapping](https://salesrabbit.com/sales-territory-mapping/)
- [SalesRabbit Pin Customization](https://salesrabbit.com/insights/how-to-edit-customize-sales-lead-status-pins/)
- [SalesRabbit vs SPOTIO (SalesRabbit)](https://salesrabbit.com/salesrabbit-vs-spotio/)
- [SPOTIO App Store](https://apps.apple.com/us/app/spotio-1-field-sales-app/id1321365455)
- [SPOTIO Platform](https://spotio.com/platform/)
- [SPOTIO Door to Door](https://spotio.com/door-to-door/)
- [SPOTIO Lead Management](https://spotio.com/features/lead-management/)
- [SPOTIO vs SalesRabbit (SPOTIO)](https://spotio.com/compare/salesrabbit-vs-spotio/)
- [SPOTIO Door Knocking App Guide](https://spotio.com/blog/door-knocking-app/)
- [SPOTIO Canvassing Guide](https://spotio.com/blog/start-canvassing/)
- [Knockbase Homepage](https://www.knockbase.com/)
- [Knockbase Gamified Leaderboards](https://www.knockbase.com/gamified-leaderboards)
- [Knockbase Door Knocking App](https://www.knockbase.com/features/door-knocking-app)
- [Knockbase Best 2025](https://www.knockbase.com/blog/what-makes-knockbase-the-best-door-knocking-app-in-2025)
- [Knockio Homepage](https://knockio.com/)
- [Knockio App Store](https://apps.apple.com/us/app/knockio/id6756485440)
- [Knockio Growth v2](https://knockio.com/knockio-v2-release/)
- [Active Knocker](https://activeknocker.com/)
- [Harvast Homepage](https://harvast.com/)
- [Harvast App Store](https://apps.apple.com/us/app/harvast-door-knocking/id1644409949)
- [SalesRabbit vs SPOTIO vs Harvast (Harvast)](https://harvast.com/salesrabbit-vs-spotio-vs-harvast/)
- [SalesRabbit App Review (SPOTIO Blog)](https://spotio.com/blog/salesrabbit-app/)
- [SalesRabbit vs SPOTIO (Forecastio)](https://forecastio.ai/blog/salesrabbit-vs-spotio)
- [SPOTIO Guide (Knockbase Blog)](https://www.knockbase.com/blog/the-complete-guide-to-spotio-field-sales-engagement-platform)
- [Map My Customers SPOTIO Review](https://mapmycustomers.com/everything-you-need-to-know-about-spotio/)
- [Map My Customers SalesRabbit Review](https://mapmycustomers.com/salesrabbit-pros-cons/)
- [Top 15 Canvassing Apps 2025 (Conveyour)](https://conveyour.com/blog/top-15-canvassing-apps-to-boost-your-door-to-door-sales-in-2025)
- [Best Door Knocking Apps (Field Servicely)](https://www.fieldservicely.com/door-to-door-canvassing-app)
- [5 Best Door to Door Apps with GPS (Timeero)](https://timeero.com/post/door-to-door-sales-apps)
- [Lead Scout App](https://www.leadscoutapp.com/)
- [D2D CRM](https://thed2dcrm.com/)
- [SalesRabbit G2 Reviews](https://www.g2.com/products/salesrabbit/reviews)
- [SPOTIO G2 Reviews](https://www.g2.com/products/spotio/reviews)
- [Knockio G2 Reviews](https://www.g2.com/products/knockio-by-knockio/reviews)
- [SalesRabbit Capterra Reviews](https://www.capterra.com/p/157329/Sales-Rabbit/reviews/)
- [SPOTIO Capterra Reviews](https://www.capterra.com/p/157701/SPOTIO/reviews/)
- [SalesRabbit Pricing G2](https://www.g2.com/products/salesrabbit/pricing)
- [Door to Door Sales App Quora](https://www.quora.com/Door-to-door-sales-whats-your-favorite-app-for-helping-you-sell-day-to-day)
