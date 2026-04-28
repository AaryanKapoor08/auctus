  What I'll change now (vs. last turn)                                                                                                                       
   
  Three targeted gaps to fill:                                                                                                                               
                                                                                                                                                           
  1. build/shared/contracts.md — make the pointer file a real navigation hub so a reader who expects "one contracts file" finds every concern within one
  click.
  2. Both dev buildflows — add an explicit "Off-Limits Folders" section. Currently each lists "Owned Folders" but the prompt asks for "what they must not
  touch" called out separately.
  3. Both dev buildflows — add per-step Inbound (what flows in) and Outbound (what flows out) lines wherever a step actually has cross-domain coupling. The
  information is already implicit in the Tasks/Outputs sections; lifting it makes coordination obvious at a glance.

  I will not redo the work that already meets the prompt's bar (gameplan, ownership, buildflow phasing, bootstrap, conventions, typed contracts, progress
  checklists with proof lines).

● Write(build\shared\contracts.md)                                  
  ⎿  Added 49 lines, removed 17 lines                                              
       1 -# Shared Contracts                                                                                                                          
       1 +# Shared Contracts — Navigation                                                                                                                    
       2                                                                                                                                                     
       3 -Cross-domain integration contracts are defined as **typed TypeScript files** under `build/contracts/`. This file is a pointer; do not put pr       
         -ose-only "contracts" here.                                                                                                                         
       3 +This file is the entry point for every cross-domain agreement in V2. Coordination concerns are deliberately split across four files so each        
         +one can be searched and edited cleanly. Use this map to find the right one.                                                                      
       4                                                                                                                                                   
       5 -## Where to look                                                                                                                            
       5 +## Where each concern lives                                                                                                                 
       6  
       7 -| Concern | File |                                                                                                                          
       8 -|---|---|                                                                                                                                   
       9 -| The role enum | `build/contracts/role.ts` |                                                                                               
      10 -| Profile + per-role profile shapes | `build/contracts/profile.ts` |                                                                        
      11 -| Session shape Dev B may read | `build/contracts/session.ts` |                                                                             
      12 -| Funding item, query, summary | `build/contracts/funding.ts` |                                                                             
      13 -| Per-route gating registry | `build/contracts/route-policy.ts` |                                                                           
       7 +| Concern | File | Section / Symbol |                                                                                                       
       8 +|---|---|---|                                                                                                                               
       9 +| The role enum (`Role`, `ROLES`, `ROLE_DEFAULT_ROUTE`) | `build/contracts/role.ts` | whole file |                                          
      10 +| Profile shapes (`Profile`, `BusinessProfile`, `StudentProfile`, `ProfessorProfile`, `RoleProfile`) | `build/contracts/profile.ts` | whole 
         +file |                                                                                                                                      
      11 +| Session shape Dev B may read (`Session`, `GetSession`, `useSession`) | `build/contracts/session.ts` | whole file |                        
      12 +| Funding shapes (`FundingItem`, `FundingQuery`, `FundingSummary`) and runtime function signatures (`ListFundingForRole`, `GetFundingById`, 
         +`GetFundingSummariesForUser`) | `build/contracts/funding.ts` | whole file |                                                                 
      13 +| Per-route gating registry (`RoutePolicy`, `RoutePolicyRegistry`) | `build/contracts/route-policy.ts` | whole file |                       
      14 +| Folder ownership (target tree, per-domain boundaries) | `build/shared/ownership.md` | "Folder Ownership (Target State)" |                 
      15 +| Route ownership (per-route allowed roles) | `build/shared/ownership.md` | "Route Ownership" |                                             
      16 +| Database / schema ownership (per-table) | `build/shared/ownership.md` | "Database Ownership" |                                            
      17 +| Migration ownership (numeric ranges per dev) | `build/shared/ownership.md` | "Migration Ownership" |                                      
      18 +| RLS policy ownership | `build/shared/ownership.md` | "RLS policy ownership" |                                                             
      19 +| No-touch zones (frozen-unless-coordinated files) | `build/shared/ownership.md` | "Shared Zones → Frozen unless coordinated" |             
      20 +| Demo / legacy isolation (`talent`, `matchmaker`, V1 funding) | `build/shared/ownership.md` | "Demo / Legacy" + "Demo Scope Isolation" |   
      21 +| Mixed-file surgery owner table | `build/shared/ownership.md` | "Mixed-File Surgery" |                                                     
      22 +| Handoff rules (what counts as a real dependency) | `build/shared/ownership.md` | "Handoff Rules" + "Blocking Policy" |                    
      23 +| Branch naming, PR review, commit format | `build/shared/conventions.md` | "Branching", "Pull Requests", "Commits" |                       
      24 +| Migration numbering & collision protocol | `build/shared/conventions.md` | "Migration numbering" |                                        
      25 +| Test commands, CI requirements | `build/shared/conventions.md` | "Tests" |                                                                
      26 +| Contract change protocol (how to edit a `build/contracts/*.ts` file) | `build/contracts/README.md` | "Change protocol" |                  
      27 +| Status legend (LOCKED / DRAFT / STUB) | `build/contracts/README.md` | "Status legend" |                                                   
      28 +| Phase order, phase gates, true dependencies | `build/shared/buildflow.md` | per phase |                                                   
      29 +| V2.P1 shared bootstrap checklist | `build/shared/bootstrap.md` | "V2.P1 Completion Gate" |                                                
      30  
      15 -See `build/contracts/README.md` for status legend (`LOCKED` / `DRAFT` / `STUB`) and the change protocol.                                    
      31 +## What a "contract" means in V2                                                                                                            
      32  
      17 -## Where ownership lives                                                                                                                    
      33 +We use the word in two senses; do not conflate them.                                                                                        
      34  
      19 -Folder, route, database, migration, and shared-file ownership: `build/shared/ownership.md`.                                                 
      35 +1. **Typed contract** — a `.ts` file under `build/contracts/`. The TypeScript compiler enforces it. If the implementation drifts from the co
         +ntract, `tsc` fails. This is how we keep `Profile`, `FundingItem`, `Session`, etc. honest.                                                  
      36  
      21 -## Where coordination rules live                                                                                                            
      37 +2. **Coordination contract** — a markdown rule under `build/shared/`. Humans enforce it. This is how we agree that Dev A owns `middleware.ts
         +` or that `package.json` edits need both devs' approval.                                                                                    
      38  
      23 -Branching, PRs, commits, migration numbering, test commands: `build/shared/conventions.md`.                                                 
      39 +The split exists because the compiler can enforce one but not the other. If you find yourself writing prose in a `.ts` file or types in a `.
         +md` file, you have the wrong file open.                                                                                                     
      40  
      25 -## Why this is a typed contract, not a markdown contract                                                                                    
      41 +## When to read what                                                                                                                        
      42  
      27 -A markdown contract drifts the moment one dev edits a shape. A `.ts` contract fails `tsc` the moment the implementation drifts. We want the 
         -compiler enforcing the integration boundary, not a doc.                                                                                     
      43 +| If you are about to… | Read first |                                                                                                       
      44 +|---|---|                                                                                                                                   
      45 +| Start a new step in your buildflow | `build/dev-{a,b}/buildflow.md` step entry |                                                          
      46 +| Touch another dev's folder | `build/shared/ownership.md` (you probably should not) |                                                      
      47 +| Add or change a shared type | `build/contracts/README.md` change protocol, then edit the `.ts` |                                          
      48 +| Open a PR | `build/shared/conventions.md` "Pull Requests" |                                                                               
      49 +| Add a migration | `build/shared/ownership.md` "Migration Ownership" + `conventions.md` "Migration numbering" |                            
      50 +| Declare a phase complete | `build/shared/buildflow.md` "Completion Gate" for that phase |                                                 
      51 +| File a blocker | `build/shared/ownership.md` "Blocking Policy" first; only log it if it qualifies |                                       
      52 +                                                                                                                                            
      53 +## What this file is NOT                                                                                                                    
      54 +                                                                                                                                            
      55 +- Not a buildflow. Phase steps live in `build/shared/buildflow.md` and the dev buildflows.                                                  
      56 +- Not a place to put new prose contracts. New ownership rules belong in `ownership.md`; new typed contracts belong in `build/contracts/*.ts`
         +.                                                                                                                                           
      57 +- Not authoritative on its own — every row in the table above points at the file that IS authoritative.                                     
      58 +                                                                                                                                            
      59 +If something is missing from the table above, that means the concern is unowned. File it as a blocker.                                      
                                                 
● Update(build\dev-a\buildflow.md)                                  
  ⎿  Added 18 lines                         
      16                                                               
      17  Stay inside Dev A folders unless you are following a contract change protocol or executing an explicit shared-file PR.
      18                                                               
      19 +## Off-Limits Folders (do NOT touch)                                                                                                               
      20 +                                                                                                                                            
      21 +These belong to Dev B. Any change here requires Dev B's explicit approval on a PR you opened — and almost every time, the right move is to f       
         +ile an issue and let Dev B do it.                                                                                                           
      22 +                                                                                                                                                   
      23 +```                                                                                                                                                
      24 +app/(funding)/grants/**                                                                                                                            
      25 +app/(funding)/scholarships/**                                                                                                               
      26 +app/(funding)/research-funding/**                                                                                                           
      27 +components/funding/**            ← exception: import only, never edit                                                                       
      28 +lib/funding/**                   ← exception: import the published exports, never edit                                                      
      29 +lib/matching/**                                                                                                                             
      30 +scraper/**                                                                                                                                  
      31 +supabase/migrations/0003_*.sql, 0004_*.sql, 0011_*.sql, 0020-0029                                                                           
      32 +.github/workflows/scrape.yml                                                                                                                
      33 +```                                                                                                                                         
      34 +                                                                                                                                            
      35 +Demo folders (`app/(demo)/**`, `components/demo/**`, `lib/demo/**`, `data/demo/**`) are Dev A's *only* during the V2.P1 surgery PR. After th
         +at PR merges, demo is frozen — neither dev edits it.                                                                                        
      36 +                                                                                                                                            
      37  ## Owned Folders
      38  
      39  ```

● Update(build\dev-a\buildflow.md)                                                                
  ⎿  Added 5 lines                          
       99                                                                 
      100  ## Step 1 — Identity Foundation (V2.P2)                     
      101                                                              
      102 +### Coupling                                                                                                                                      
      103 +                                                                                                                                           
      104 +- **Inbound:** none. This step is fully independent.                                                                                              
      105 +- **Outbound to Dev B:** publishes the runtime `GetSession` (server) and `useSession` (client) per the LOCKED `Session` shape. Publishes th
          +e merged `RoutePolicyRegistry` mechanism so Dev B can register funding routes.                                                                    
      106 +                                                                                                                                                
      107  ### Tasks                                                                                                                                       
      108                                                                                                                                                  
      109  1. Add `lib/env.ts` env-guarded reads of all Supabase vars (already from bootstrap; reuse).

● Update(build\dev-a\buildflow.md)                                        
  ⎿  Added 5 lines                          
      146                                                                 
      147  ## Step 2 — Role Selection & Onboarding (V2.P2 → V2.P3)     
      148                                                              
      149 +### Coupling                                                                                                                                      
      150 +                                                                                                                                           
      151 +- **Inbound:** confirmation from Dev B that `Session.role: Role | null` is acceptable (already pre-locked in `build/contracts/session.ts` d       
          +uring V2.P1; verify in passing).                                                                                                           
      152 +- **Outbound to Dev B:** publishes `lib/profile/queries.ts` exporting `getRoleProfile(user_id) => Promise<RoleProfile | null>`. This is wha       
          +t Dev B's matching needs in Step 3.                                                                                                             
      153 +                                                                                                                                                
      154  ### Tasks                                                                                                                                       
      155  
      156  1. Update `0001_profiles.sql` migration — `role` column allows nullable initially OR add a `0001a_profiles_pending_role.sql` migration intr
           oducing `pending` sentinel. Decision: nullable role, with check constraint `role IS NULL OR role IN ('business','student','professor')`. Up
           date `Session` contract usage so Dev B sees `role: Role | null` — **this requires a contract change protocol PR before locking V2.P1, or pr
           e-bake the nullable into the V2.P1 contract lock**.

● Update(build\dev-a\buildflow.md)                                        
  ⎿  Added 5 lines                          
      183                                                                 
      184  ## Step 3 — Forum Domain (V2.P3)                            
      185                                                              
      186 +### Coupling                                                                                                                                      
      187 +                                                                                                                                           
      188 +- **Inbound:** none.                                                                                                                              
      189 +- **Outbound to Dev B:** none.                                                                                                             
      190 +                                                                                                                                                  
      191  ### Tasks                                                                                                                                         
      192                                                                                                                                                  
      193  1. `app/forum/page.tsx` — list threads, sort by recency.

● Update(build\dev-a\buildflow.md)                                        
  ⎿  Added 5 lines                          
      218                                                                 
      219  ## Step 4 — Shell & Navigation (V2.P3)                      
      220                                                              
      221 +### Coupling                                                                                                                                      
      222 +                                                                                                                                           
      223 +- **Inbound:** consumes only the LOCKED `Role` enum + `ROLE_DEFAULT_ROUTE` from `build/contracts/role.ts`. No runtime dependency on Dev B.        
      224 +- **Outbound to Dev B:** none.                                                                                                             
      225 +                                                                                                                                                  
      226  ### Tasks                                                                                                                                       
      227                                                                                                                                                  
      228  1. Update `components/layout/Navbar.tsx` to be role-aware: signed-out → public CTAs; signed-in → role's funding link from `ROLE_DEFAULT_ROU     
           TE`, profile, forum, dashboard.

● Update(build\dev-a\buildflow.md)                                        
  ⎿  Added 6 lines                          
      244                                                                 
      245  ## Step 5 — Integration Consumption (V2.P4)                 
      246                                                              
      247 +### Coupling (this is the heavy one)                                                                                                              
      248 +                                                                                                                                           
      249 +- **Inbound from Dev B:** `lib/funding/queries.ts` exports `GetFundingSummariesForUser(user_id, limit)` returning `FundingSummary[]` with r       
          +eal ETL data. `components/funding/FundingSummaryTile.tsx` exported as a presentation component taking `summaries: FundingSummary[]`.            
      250 +- **Inbound trigger:** Dev B has logged in their `progress.md` "Contract changes consumed" section that funding queries are stable on `main       
          +` against real ETL data. Do NOT start Step 5 before this entry exists.                                                                     
      251 +- **Outbound to Dev B:** none. The composition lives entirely in Dev A's `app/dashboard/page.tsx`.                                         
      252 +                                                                                                                                           
      253  ### Tasks              
      254                   
      255  1. Wait for Dev B to confirm `GetFundingSummariesForUser` stable on `main` against real ETL data.

● Update(build\dev-a\buildflow.md)                                        
  ⎿  Added 5 lines                          
      273                                                              
      274  ## Step 6 — Hardening (V2.P5)                               
      275  
      276 +### Coupling                                                                                                                                      
      277 +                                                                                                                                           
      278 +- **Inbound:** none.                                                                                                                              
      279 +- **Outbound to Dev B:** none. Each dev hardens their own surface independently.                                                                
      280 +                                                                                                                                                  
      281  ### Tasks                                                                                                                                         
      282                                                                                                                                                    
      283  1. Audit Dev A owned files for any imports from `lib/demo/` or `components/demo/`. Remove all.                                                    
                                                                                                                                                             
● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 30 lines                         
      13                                                                  
      14  Stay inside Dev B folders unless you are following a contract change protocol or executing an explicit shared-file PR.
      15                                                               
      16 +## Off-Limits Folders (do NOT touch)                                                                                                               
      17 +                                                                                                                                            
      18 +These belong to Dev A. Any change here requires Dev A's explicit approval on a PR you opened — and almost every time, the right move is to f       
         +ile an issue and let Dev A do it.                                                                                                                
      19 +                                                                                                                                                   
      20 +```                                                                                                                                         
      21 +app/(identity)/**                                                                                                                           
      22 +app/onboarding/**                                                                                                                           
      23 +app/profile/**                                                                                                                              
      24 +app/forum/**                                                                                                                                
      25 +app/dashboard/**                                                                                                                            
      26 +app/page.tsx                                                                                                                                
      27 +app/layout.tsx                                                                                                                              
      28 +app/providers.tsx                                                                                                                           
      29 +app/globals.css                  ← shared, but Dev A is owner of last resort                                                                
      30 +middleware.ts                                                                                                                               
      31 +components/auth/**                                                                                                                          
      32 +components/profile/**                                                                                                                       
      33 +components/forum/**                                                                                                                         
      34 +components/layout/**                                                                                                                        
      35 +lib/auth/**                                                                                                                                 
      36 +lib/profile/**                   ← exception: import only (e.g. getRoleProfile), never edit                                                 
      37 +lib/forum/**                                                                                                                                
      38 +lib/session/**                   ← exception: import only (GetSession, useSession), never edit                                              
      39 +lib/env.ts                       ← exception: read only                                                                                     
      40 +supabase/migrations/0001_*.sql, 0002_*.sql, 0010_*.sql (and 0010-0019 range)                                                                
      41 +.github/workflows/ci.yml                                                                                                                    
      42 +```                                                                                                                                         
      43 +                                                                                                                                            
      44 +Demo folders are frozen for both devs after the V2.P1 surgery PR; do not touch them.                                                        
      45 +                                                                                                                                            
      46  ## Owned Folders
      47  
      48  ```

● Update(build\dev-b\buildflow.md)                                        
  ⎿  Added 5 lines                          
      101                                                              
      102  ## Step 1 — Funding Domain Foundation (V2.P2)               
      103  
      104 +### Coupling                                                                                                                                      
      105 +                                                                                                                                           
      106 +- **Inbound:** consumes only LOCKED contracts (`Role`, `RoutePolicy`, `Session`). No runtime dependency on Dev A in this step.                    
      107 +- **Outbound to Dev A:** publishes `lib/funding/route-policies.ts` exporting a `RoutePolicyRegistry`. Dev A's `lib/auth/route-policies.ts` 
          +imports and concatenates it. If Dev A's registry is not yet importing yours, the funding routes still render (they just are not gated yet —
          + that is Dev A's wiring job, not yours).                                                                                                   
      108 +                                                                                                                                           
      109  ### Tasks
      110  
      111  1. `supabase/migrations/0003_funding.sql`:

● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 5 lines                          
      134                                                              
      135  ## Step 2 — Funding Pages (V2.P2)                           
      136  
      137 +### Coupling                                                                                                                                      
      138 +                                                                                                                                           
      139 +- **Inbound from Dev A (soft):** `GetSession()` from `lib/session/get-session.ts` is convenient for asserting the user's role server-side.        
          +If Dev A has not published it yet, fall back to a sentinel role per route (e.g., `app/(funding)/grants/page.tsx` assumes `business`); middl     
          +eware will eventually enforce. Do not block on this.                                                                                       
      140 +- **Outbound to Dev A:** publishes `components/funding/FundingSummaryTile.tsx` for Dev A's dashboard. Pure presentation; takes `summaries: 
          +FundingSummary[]` prop.                                                                                                                    
      141 +                                                                                                                                           
      142  ### Tasks
      143  
      144  1. `app/(funding)/grants/page.tsx` — server component. Calls `GetSession()`, asserts `role === 'business'` (middleware also enforces). Fetc
           hes via `ListFundingForRole({ role: 'business' })`. Renders `<FundingList items={...} />`.

● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 6 lines                          
      164                                                              
      165  ## Step 3 — Matching (V2.P3)                                
      166  
      167 +### Coupling (real dependency)                                                                                                                    
      168 +                                                                                                                                           
      169 +- **Inbound from Dev A:** `lib/profile/queries.ts` exports `getRoleProfile(user_id) => Promise<RoleProfile | null>`. This is the runtime he       
          +lper that returns the LOCKED `RoleProfile` shape for a real user. Block on this if it is not published yet — log under "Blockers" with name     
          + `getRoleProfile`.                                                                                                                         
      170 +- **Workaround if blocked:** implement and unit-test `lib/matching/{business,student,professor}.ts` against `RoleProfile` fixtures (the LOC
          +KED contract is enough to do that). Only `GetFundingSummariesForUser`'s wiring needs the runtime helper.                                   
      171 +- **Outbound to Dev A:** none in this step. Dev A consumes the wired `GetFundingSummariesForUser` only in V2.P4 (see Step 6).              
      172 +                                                                                                                                           
      173  ### Tasks
      174  
      175  1. `lib/matching/business.ts` — `scoreBusinessGrant(profile: BusinessProfile, item: FundingItem): number` per ProjectSummary weights (locat
           ion 25, revenue 25, employees 20, industry 30).

● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 5 lines                          
      202                                                                  
      203  ## Step 4 — ETL & Ingestion (V2.P3)                         
      204                                                              
      205 +### Coupling                                                                                                                                      
      206 +                                                                                                                                           
      207 +- **Inbound:** none. Scraper runs on its own GitHub Actions workflow with the Supabase service-role key.                                          
      208 +- **Outbound to Dev A:** none directly. Dev A's dashboard consumes the funding rows produced here, but only via the published query helpers
          + in V2.P4.                                                                                                                                        
      209 +                                                                                                                                                
      210  ### Tasks
      211  
      212  1. `scraper/types.ts` — `ScrapedFunding`, `Scraper` interfaces (matching ProjectSummary).

● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 6 lines                          
      236                                                                  
      237  ## Step 5 — Funding RLS (V2.P3)                             
      238                                                              
      239 +### Coupling (real dependency)                                                                                                                    
      240 +                                                                                                                                           
      241 +- **Inbound from Dev A:** `supabase/migrations/0010_rls_identity.sql` applied to the shared dev DB. Without it, the `profiles.role` join yo       
          +ur RLS reads from is unreliable. Block on this — log under "Blockers" with name `0010_rls_identity.sql`.                                        
      242 +- **Workaround if blocked:** stage the policy SQL locally; do not apply to shared DB until 0010 lands.                                            
      243 +- **Outbound to Dev A:** none.                                                                                                             
      244 +                                                                                                                                           
      245  ### Tasks
      246  
      247  1. `supabase/migrations/0011_rls_funding.sql` (or in 0020 range) — RLS policies:

● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 5 lines                          
      261                                                                  
      262  ## Step 6 — Integration Publishing (V2.P4)                  
      263                                                              
      264 +### Coupling (this is the heavy one)                                                                                                              
      265 +                                                                                                                                           
      266 +- **Inbound:** none — your work is already done; you are publishing.                                                                              
      267 +- **Outbound to Dev A:** confirm in Dev A's `progress.md` "Contract changes consumed" section: `lib/funding/queries.ts` exports stable on `
          +main` against real ETL data as of `<commit hash>`. This is the trigger Dev A waits for to start their Step 5 dashboard tile.                      
      268 +                                                                                                                                           
      269  ### Tasks
      270  
      271  1. Confirm `funding.ts` and all runtime exports are stable on `main` against real ETL data.

● Update(build\dev-b\buildflow.md)                                         
  ⎿  Added 5 lines                          
      281                                                                  
      282  ## Step 7 — Hardening (V2.P5)                               
      283                                                              
      284 +### Coupling                                                                                                                                      
      285 +                                                                                                                                           
      286 +- **Inbound:** none.                                                                                                                              
      287 +- **Outbound to Dev A:** none. Each dev hardens their own surface independently.                                                                
      288 +                                                                                                                                                  
      289  ### Tasks                                                                                                                                       
      290  
      291  1. Audit Dev B owned files for any imports from `lib/demo/` or `components/demo/`. Remove all.

● Strongest improvements (from this turn + the prior one combined)               
                                                                                   
  1. Folder ownership + typed contracts are physically separate from coordination prose. build/contracts/*.ts is compiler-enforced; build/shared/ownership.md
   is human-enforced. A drift in either fails fast — tsc for the typed side, PR review for the prose side.                                                   
  2. Every step in both dev buildflows now has a Coupling section. Inbound names what flows in (with the runtime symbol or migration filename). Outbound
  names what flows out (and where the receiving dev consumes it). No more "wait for the other dev" without a name.                                           
  3. Off-Limits Folders sections make "what you must not touch" as visible as "what you own." Each list also notes which Off-Limits items are import-only
  exceptions (e.g., Dev B may import lib/session/get-session.ts, but never edit it).                                                                         
  4. V2.P1 has a real bootstrap checklist with named owners per item (build/shared/bootstrap.md). Phase completion is gated on each box, not "vibes."        
  5. Mixed-file surgery has one owner and one PR (Dev A leads, Dev B reviews). The most realistic day-one merge-conflict source is now serialized.
  6. Three problems the original docs masked are now explicit blockers with workarounds:
    - Dev B's matching depends on Dev A's getRoleProfile runtime → noted in dev-b Step 3 with a workaround that lets Dev B make progress against fixtures.
    - Dev B's funding RLS depends on Dev A's identity RLS migration 0010_* → noted in dev-b Step 5 with a stage-locally workaround.
    - Dev A's dashboard tile depends on Dev B publishing stable funding query exports → gated by an explicit log entry in progress.md "Contract changes
  consumed."
  7. Phase numbering disambiguated. V2.P1–V2.P5 cannot collide with the legacy V1 P1–P7.
  8. Route-policy delegation eliminates the most painful cross-domain edit. Dev B registers funding routes in lib/funding/route-policies.ts; Dev A's
  middleware.ts never branches on funding paths.

  Remaining unresolved assumptions (need human decision)

  1. Branching strategy assumes one shared repo with two devs both pushing to main via PR. If you are using fork-and-PR or want a develop branch as a buffer
  to Vercel auto-deploy, say so — conventions.md needs an edit.
  2. Vercel auto-deploys on every main push. During V2.P2–P3 the new V2 surfaces will be visibly half-built. If that is unacceptable for production, decide
  now: feature-flag, behind-route-protection, or move to a staging branch. The docs currently say "treat main as production-grade for the V2 surfaces that
  have shipped" — fine if you accept the visible WIP.
  3. Single shared Supabase dev project vs. one per developer. I picked single-shared in bootstrap.md B1. Per-dev DBs are safer but force every migration to
  be applied twice. Confirm the shared choice or override.
  4. Number of scrapers in V2.P3. I cut from ProjectSummary's "5 per type" to "2 per type" in dev-b Step 4. The remaining sources are easy to add later; if
  you want all 15 in scope, tell me and I will revert.
  5. AI chatbot stays mounted in the running app via (demo) during the full V2 build. This is a UX call: a half-built role-aware app with a legacy chatbot is
   functional but a little weird. Alternative is to unmount it for V2 and ship it back when AI chat returns to scope.
  6. Session.role: Role | null is pre-baked in build/contracts/session.ts to handle the sign-in→onboarding gap. If you would rather force "no half-onboarded
  users ever exist" (e.g., assign a default role on sign-in), tell me and I will revert to non-nullable.
  7. auctus-frontend/ and components/context_hub/. Both still exist in the repo and neither is referenced by V2 docs. Before V2.P1 surgery, decide: delete,
  archive, or keep.
  8. Two named developers. The docs say "Dev A" and "Dev B" abstractly. If you want each progress.md to list the actual person + GitHub handle (helps when
  both run Claude Code from CLAUDE.md), tell me and I will add them.

✻ Cooked for 4m 34s

※ recap: We're hardening the Auctus V2 planning docs so two devs can build in parallel without overlap; I just finished adding Off-Limits sections and       
  per-step Inbound/Outbound coupling notes. Next: you confirm the 8 open assumptions I flagged so we can lock V2.P1. (disable recaps in /config)
                                                                                                                                                             
❯ Here are my answers to the unresolved assumptions:                                                                                                         
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    1. Branching strategy:                                                                                                                                   
                                                                                                                                                             
    Use one shared repo with feature branches and a `develop` branch as the integration buffer. Both developers open PRs into `develop`, and `main` is       
  reserved                                                                                                                                                   
    for stable milestones.                                                                                                                                   
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    2. Vercel / production visibility:                                                                                                                       
                                                                                                                                                             
    The old repo was deleted and this new repo was created today. It is not currently deployed on Vercel, so there is no current production exposure concern 
                                                                                                                                                             
    for half-built V2 work.                                                                                                                                  
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    3. Supabase dev setup:                                                                                                                                   
    Use one shared Supabase database/project for now.                                                                                                        
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    4. Number of scrapers in V2.P2-P3:                                                                                                                       
                                                                                                                                                             
    Use 2 scrapers per role first (business, student, professor), so 6 total in the first ETL phase. The system should be designed so the remaining sources  
  can                                                                                                                                                        
    be added later.                                                                                                                                          
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    5. Legacy AI chatbot during V2:                                                                                                                          
                                                                                                                                                             
    Leave it as-is for now. Do not remove or unmount it during the current phase.                                                                            
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    6. `session.role` nullable during onboarding gap:                                                                                                        
                                                                                                                                                             
    Yes, allow `role = null` during the pre-onboarding gap.                                                                                                  
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    7. Old leftover folders/files like `auctus-frontend/` and `components/context_hub/`:                                                                     
                                                                                                                                                             
    Keep them for now.                                                                                                                                       
                                                                                                                                                             
                                                                                                                                                             
                                                                                                                                                             
    8. Named developers:                                                                                                                                     
                                                                                                                                                             
    Dev A = Aaryan                                                                                                                                           
                                                                                                                                                             
    Dev B = Priyan                                                                                                                                           
                                                                                                                                                             
                                                                                                                                                             

● I'll update the docs and memory to reflect your decisions.        
                                                                                                                                       
  Recalled 2 memories (ctrl+o to expand)            
                                                                                                                                                             
● Update(build\shared\conventions.md)                                
  ⎿  Added 13 lines, removed 4 lines                                                                                                                         
       6                                                    
       7  ## Branching                                                                                                                                       
       8                                                                                                                                                     
       9 -- `main` is the deployable trunk. Vercel auto-deploys on push.                                                                                     
      10 -- Feature branches: `dev-a/<short-description>` or `dev-b/<short-description>`. Examples: `dev-a/auth-supabase`, `dev-b/funding-listing`.          
      11 -- Shared bootstrap branches: `shared/<short-description>` (used in V2.P1 only).                                                                    
      12 -- No direct pushes to `main`. Every change goes through a PR.                                                                                      
       9 +- `main` is reserved for **stable milestones** only. Each V2 phase completion gate produces one merge into `main`.                               
      10 +- `develop` is the **integration buffer**. All feature work merges into `develop` first.                                                           
      11 +- Feature branches: `dev-a/<short-description>` or `dev-b/<short-description>`. Examples: `dev-a/auth-supabase`, `dev-b/funding-listing`. Br     
         +anched from `develop`, PR'd into `develop`.                                                                                                      
      12 +- Shared bootstrap branches: `shared/<short-description>` (used in V2.P1 only). Branched from `develop`, PR'd into `develop`.                    
      13 +- No direct pushes to `main` or `develop`. Every change goes through a PR.                                                                  
      14  
      15 +### Promotion to `main`                                                                                                                     
      16 +                                                                                                                                            
      17 +A `develop` → `main` PR happens at each phase completion gate. The PR title is `release: V2.PN complete`. Both devs approve. The merge into 
         +`main` is the canonical "phase shipped" event.                                                                                              
      18 +                                                                                                                                            
      19 +### Initial setup                                                                                                                           
      20 +                                                                                                                                            
      21 +The repo currently does not have a `develop` branch (it was created fresh today). The first action of V2.P1 is for Aaryan (Dev A) to create 
         +`develop` from `main` and push it. Branch protection on both `main` and `develop` should be set up at the same time.                        
      22 +                                                                                                                                            
      23  ## Pull Requests
      24  
      25  - PR title uses the same commit format as below: `type(scope): description`.

● Update(build\shared\conventions.md)                          
  ⎿  Added 5 lines, removed 3 lines                    
       98                                                      
       99  ## Deploy gates                               
      100                                              
      101 -- Vercel auto-deploys `main`. Treat `main` as production-grade *for the V2 surfaces that have shipped*.                                    
      102 -- Demo routes under `/(demo)/` are kept working but explicitly out of V2 scope.                                                                   
      103 -- During V2.P2-P4 the new identity and funding features may be reachable but unfinished. That is acceptable as long as `npm run build` succ
          -eeds and no V1 demo regressions ship.                                                                                                             
      101 +- The repo is **not currently deployed** to any hosting provider. There is no production exposure during the V2 build.                          
      102 +- `main` is reserved for stable milestones (one merge per V2 phase completion). `develop` is the working integration branch.                      
      103 +- Demo routes under `/(demo)/` are kept working in dev but explicitly out of V2 scope.                                                            
      104 +- During V2.P2-P4 the new identity and funding features will be reachable in dev but unfinished. That is acceptable as long as `npm run bui
          +ld` succeeds on every PR and no V1 demo regressions ship.                                                                                  
      105 +- When deployment is wired up later (likely Vercel; out of current scope), promote from `main` only — never from `develop` or feature branc
          +hes. Update this section at that time.                                                                                                     

● Update(build\shared\conventions.md)                          
  ⎿  Added 3 lines, removed 1 line                     
      23  ## Pull Requests                                     
      24                                                 
      25  - PR title uses the same commit format as below: `type(scope): description`.
      26 +- PR base branch: `develop` for feature work; `main` only for phase-completion releases (`develop` → `main`).                               
      27  - PR body must include:                                                                                                                            
      28    - The V2 phase number this work belongs to (`V2.P2`, `V2.P3`, etc.).
      29    - Which buildflow step this completes (e.g., "Dev A Step 2 — Identity Foundation").                                                              
      30    - Any contract change (point at `build/contracts/*.ts` diff).                                                                                  
      30 -- **Same-domain PR:** owner self-merges after CI green.                                                                                            
      31 +- **Same-domain PR:** owner self-merges into `develop` after CI green.                                                                           
      32  - **Shared-file PR** (anything in `build/shared/ownership.md` "Frozen unless coordinated"): requires the other dev's approval.
      33  - **Cross-domain PR** (touches the other dev's owned folders): requires the owner's approval. Strongly preferred: file an issue and let the
          owner do the work.
      34 +- **Phase-completion PR** (`develop` → `main`): both devs approve.                                                                          
      35  
      36  ## Commits
      37  

● Update(build\dev-a\buildflow.md)                             
                                                       
· Adding developer names… (1m 30s · ↓ 4.8k tokens)
  ⎿  ✔ Update conventions.md branching and deploy gates  
     ◼ Add developer names to docs                     
     ◻ Confirm scraper extensibility note in dev-b Step 4
     ◻ Update memory: stale Vercel and V2 phase entries                                                                                                      
   
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯                                                                                                                                                          
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ accept edits on (shift+tab to cycle) · esc to interrupt · ctrl+t to hide tasks                                                   Now using extra usage
● Update(build\shared\conventions.md)
  ⎿  Added 3 lines, removed 1 line
      23  ## Pull Requests
      24  
      25  - PR title uses the same commit format as below: `type(scope): description`.
      26 +- PR base branch: `develop` for feature work; `main` only for phase-completion releases (`develop` → `main`).                               
      27  - PR body must include:
      28    - The V2 phase number this work belongs to (`V2.P2`, `V2.P3`, etc.).
      29    - Which buildflow step this completes (e.g., "Dev A Step 2 — Identity Foundation").
      30    - Any contract change (point at `build/contracts/*.ts` diff).
      30 -- **Same-domain PR:** owner self-merges after CI green.                                                                                     
      31 +- **Same-domain PR:** owner self-merges into `develop` after CI green.                                                                      
      32  - **Shared-file PR** (anything in `build/shared/ownership.md` "Frozen unless coordinated"): requires the other dev's approval.
      33  - **Cross-domain PR** (touches the other dev's owned folders): requires the owner's approval. Strongly preferred: file an issue and let the
          owner do the work.
      34 +- **Phase-completion PR** (`develop` → `main`): both devs approve.                                                                          
      35  
      36  ## Commits
      37  

● Update(build\dev-a\buildflow.md)
  ⎿  Added 2 lines
      1  # Dev A Buildflow — Identity & Community
      2  
      3 +**Owner: Aaryan**                                                                                                                            
      4 +                                                                                                                                             
      5  ## Mission
      6  
      7  Own everything related to who the user is and how the community runs:

● Update(build\dev-b\buildflow.md)                
  ⎿  Added 2 lines                                     
      1  # Dev B Buildflow — Funding & Pipelines  
      2                                                  
      3 +**Owner: Priyan**                                                                                                                            
      4 +                                                                                                                                             
      5  ## Mission                                                                                                                                          
      6  
      7  Own the funding pipeline end-to-end:                                                                                                                
                                                                                                                                                           
● Update(build\dev-a\progress.md)                                                                                                                            
  ⎿  Added 4 lines, removed 1 line                                                                                                                         
       1 -# Dev A Progress                                                                                                                            
       1 +# Dev A Progress — Aaryan                                                                                                                   
       2                                               
       3  Mirror of `build/dev-a/buildflow.md`. Update each box as it passes its proof line. A step is `[x]` only when **proof** is shown, not when co
          de is written.                                                                                                                                     
       4  
       5 +**Owner:** Aaryan                                                                                                                                  
       6 +**Domain:** identity & community (auth, roles, onboarding, profiles, forum, route protection, shell, dashboard composition)                      
       7 +                                                                                                                                                   
       8  ## Current Phase                                                                                                                                 
       9  
      10  V2.P1 — Shared Bootstrap & Restructuring (not started)

● Update(build\dev-b\progress.md)                 
  ⎿  Added 4 lines, removed 1 line                     
       1 -# Dev B Progress                                                                                                                            
       1 +# Dev B Progress — Priyan                                                                                                                   
       2                                               
       3  Mirror of `build/dev-b/buildflow.md`. A step is `[x]` only when **proof** is shown, not when code is written.
       4                                                                                                                                                     
       5 +**Owner:** Priyan                                                                                                                           
       6 +**Domain:** funding & pipelines (funding domain, matching, ETL, ingestion, role-aware visibility)                                                  
       7 +                                                                                                                                                 
       8  ## Current Phase                                                                                                                                   
       9                                                                                                                                                   
      10  V2.P1 — Shared Bootstrap & Restructuring (not started)

● Update(build\shared\ownership.md)               
  ⎿  Added 11 lines                                    
      21                                          
      22  ---                                            
      23                                               
      24 +## Developers                                                                                                                               
      25 +                                                                                                                                                   
      26 +| Tag | Person | Domain |                                                                                                                   
      27 +|---|---|---|                                                                                                                                      
      28 +| Dev A | **Aaryan** | identity & community |                                                                                                    
      29 +| Dev B | **Priyan** | funding & pipelines |                                                                                                       
      30 +                                                                                                                                                 
      31 +Dev tags ("Dev A", "Dev B") are used throughout the docs because they read more clearly in cross-references than first names. The mapping ab
         +ove is authoritative.                                                                                                                       
      32 +                                                                                                                                            
      33 +---                                                                                                                                         
      34 +                                                                                                                                            
      35  ## Domain Ownership
      36  
      37  ### Dev A — Identity and Community

● Update(build\gameplan.md)                       
  ⎿  Added 4 lines, removed 4 lines                    
      56                                         
      57  ## Two-Developer Working Model                 
      58                                               
      59 -| Dev | Domain |                                                                                                                            
      60 -|---|---|                                                                                                                                          
      61 -| **Dev A** | identity & community — auth, roles, onboarding, profiles, forum, route protection, shell composition, dashboard |             
      62 -| **Dev B** | funding & pipelines — funding domain, matching, ETL, ingestion, role-aware funding visibility |                                      
      59 +| Dev | Person | Domain |                                                                                                                        
      60 +|---|---|---|                                                                                                                                      
      61 +| **Dev A** | Aaryan | identity & community — auth, roles, onboarding, profiles, forum, route protection, shell composition, dashboard |         
      62 +| **Dev B** | Priyan | funding & pipelines — funding domain, matching, ETL, ingestion, role-aware funding visibility |                      
      63  
      64  Boundaries enforced by `build/shared/ownership.md`. Cross-domain coordination happens through typed contracts in `build/contracts/`, not thr
          ough editing each other's folders.
      65  

  Read 1 file (ctrl+o to expand)                                
                                                       
● Update(build\dev-b\buildflow.md)                              
  ⎿  Added 2 lines, removed 2 lines                             
      213                                                       
      214  1. `scraper/types.ts` — `ScrapedFunding`, `Scraper` interfaces (matching ProjectSummary).
      215  2. `scraper/utils.ts` — `parseAmount`, `parseDate`, `cleanText`.                                                                                  
      216 -3. `scraper/sources/business/`, `scraper/sources/student/`, `scraper/sources/professor/` — start with **2 sources per type** (not 5; defer 
          -rest to post-V2 if needed). Each is a module exporting a `Scraper` impl using `cheerio`.                                                          
      216 +3. `scraper/sources/business/`, `scraper/sources/student/`, `scraper/sources/professor/` — implement **2 sources per role for V2 (6 total)*       
          +*. Each source is a module exporting a `Scraper` impl using `cheerio`. Design the `Scraper` interface and the per-role source folders so ad       
          +ditional sources can be added later by dropping a new module into the right folder and registering it in `scraper/index.ts` — no other code       
          + change required. The remaining sources (toward the eventual 5 per role / 15 total) are deferred but not removed from the roadmap.                
      217  4. `scraper/normalize.ts` — `ScrapedFunding → FundingItem` (sets `source: 'scraped'`, `scraped_from`, `scraped_at`, `status: 'active'`).        
      218  5. `scraper/deduplicate.ts` — match by `(name, provider, type)`. INSERT new, UPDATE changed, skip same.
      219  6. `scraper/expire.ts` — `UPDATE funding SET status='expired' WHERE deadline < now() AND status='active'`.
      220 -7. `scraper/index.ts` — invoke all scrapers, normalize, dedupe, expire, log per-source counts. Per-source failure does not stop other scrap
          -ers.                                                                                                                                       
      220 +7. `scraper/index.ts` — register all scrapers in a single `SOURCES` array per role; invoke, normalize, dedupe, expire, log per-source count
          +s. Per-source failure does not stop other scrapers. Adding a new source = add to the array; no orchestrator edits.                         
      221  8. `supabase/migrations/0004_scrape_metadata.sql` — `funding_sources`, `scrape_runs` tables for run tracking.
      222  9. Update `.github/workflows/scrape.yml` — uncomment cron `0 3 * * *`, add Supabase service key from secrets.
      223  

● Update(build\dev-b\buildflow.md)                              
  ⎿  Added 2 lines, removed 1 line                     
      229                                                       
      230  ### Proof for completion                      
      231                                              
      232 -- [ ] At least 2 scrapers per type implemented and tested against fixture HTML.                                                            
      232 +- [ ] Exactly 2 scrapers per role (6 total) implemented and tested against fixture HTML.                                                          
      233 +- [ ] Adding a 3rd source for any role requires only: a new file under `scraper/sources/<role>/` and one line in the `SOURCES` array. Demon
          +strate by adding a no-op stub source, running, then removing it.                                                                                  
      234  - [ ] Manual workflow run produces ≥ 1 new row per source on a clean DB.                                                                        
      235  - [ ] Cron schedule live.                                                                                                                         
      236  - [ ] Commit: `feat(scraper): add ETL pipeline with dedupe and expiry`                                                                          

● Update(build\dev-b\progress.md)                                                                        
  ⎿  Added 2 lines, removed 1 line                     
      72  ## Step 4 — ETL & Ingestion (V2.P3)                   
      73                                                 
      74  - [ ] `scraper/types.ts`, `utils.ts`, `normalize.ts`, `deduplicate.ts`, `expire.ts`, `index.ts`.
      75 -- [ ] At least 2 sources per type implemented under `scraper/sources/{business,student,professor}/`.                                        
      75 +- [ ] Exactly 2 sources per role (6 total) implemented under `scraper/sources/{business,student,professor}/`.                                      
      76 +- [ ] `scraper/index.ts` uses a `SOURCES` array — adding a source needs zero orchestrator changes (verified by adding a stub, running, remov
         +ing).                                                                                                                                              
      77  - [ ] `supabase/migrations/0004_scrape_metadata.sql` applied.                                                                                    
      78  - [ ] `.github/workflows/scrape.yml` cron uncommented and live.                                                                                    
      79  - [ ] Vitest fixtures for each scraper.                                                                                                          
  ⎿  You've hit your limit · resets 2:20am (America/Halifax)
     /upgrade to increase your usage limit.                                                                                                                  
                                                       
✻ Sautéed for 2m 44s                                                                                                                                         
                                                         
  4 tasks (2 done, 1 in progress, 1 open)                                                                                                                    
  ✔ Update conventions.md branching and deploy gates
  ✔ Add developer names to docs                                                                                                                              
  ◼ Confirm scraper extensibility note in dev-b Step 4
  ◻ Update memory: stale Vercel and V2 phase entries                                                                                                         
                                                                
so the connection was lost , but this is what you were doing , check the entire text and then pick up from where you left off                              