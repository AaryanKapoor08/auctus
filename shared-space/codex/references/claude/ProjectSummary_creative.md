# [PROJECT_NAME] — Project Summary (Game / Mobile / Desktop)

> [TAGLINE]

**Concept:** [WHAT it is, WHO it's for, WHAT experience it delivers — 2-3 sentences]

---

## Platform & Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Platform | [iOS / Android / Windows / Mac / Linux / Web / Console] | |
| Engine / Framework | [Unity / Godot / Flutter / Electron / SwiftUI / etc.] | |
| Language | | |
| Backend (if any) | [Firebase / custom API / none] | |
| Database / Storage | [local / cloud / both] | |
| Distribution | [App Store / Play Store / Steam / itch.io / direct] | |

---

## Core Loop / Core Experience
[Describe what the user does repeatedly. For a game: the moment-to-moment gameplay loop. For a mobile app: the primary action cycle. For desktop: the main workflow.]

```
[e.g., Player spawns → collects resources → builds structure → defends against wave → repeat]
[e.g., User opens app → logs entry → views trend → sets goal → repeat]
```

**Core Constraint:** [The one experience that MUST feel right above all else]

---

## Screens / Scenes
| Name | Purpose | Navigates to | Auth required |
|------|---------|-------------|---------------|
| [e.g., Main Menu] | [entry point, start/load/settings] | [Game / Settings] | no |
| [e.g., Game Scene] | [main gameplay] | [Pause / Game Over] | no |
| [e.g., Profile] | [user data, stats] | [Main Menu] | yes |

---

## Core Systems / Modules
| System | Responsibility | Key interactions |
|--------|---------------|-----------------|
| [e.g., InputSystem] | [reads player input, fires events] | [PlayerController] |
| [e.g., InventorySystem] | [tracks items, enforces capacity] | [UI, LootSystem] |
| [e.g., SaveSystem] | [serialises and persists game state] | [all stateful systems] |

[Each system does ONE thing. If it needs "and" in its description, split it.]

---

## State Management
| State type | Where it lives | How it persists |
|------------|---------------|----------------|
| [e.g., Player health] | [PlayerState scriptable object / Redux store / ViewModel] | [in-memory, reset on death] |
| [e.g., Progress] | [SaveData] | [serialised to disk / cloud save] |
| [e.g., Settings] | [PlayerPrefs / local storage] | [device storage] |

---

## Data / Content
| Type | Format | Volume | Notes |
|------|--------|--------|-------|
| [e.g., Level data] | [JSON / ScriptableObject / Tiled map] | [20 levels] | [designed in editor] |
| [e.g., Dialogue] | [CSV / Ink / JSON] | [~500 lines] | |
| [e.g., Assets] | [PNG / WAV / FBX] | [estimate] | [source files in /assets-src] |

---

## External Services (if any)
| Service | Purpose | Failure behaviour |
|---------|---------|-------------------|
| [e.g., Firebase Auth] | [user accounts] | [offline mode — local save only] |
| [e.g., Leaderboard API] | [global rankings] | [hide leaderboard, do not crash] |
| [e.g., Push notifications] | [daily reminder] | [silently skip if permission denied] |

---

## Build & Distribution
| Target | Build command | Output | Notes |
|--------|--------------|--------|-------|
| [Platform 1] | [command] | [artifact] | |
| [Platform 2] | | | |

**Build constraints:** [e.g., "iOS build requires macOS + Xcode 15", "bundle size must stay under 100MB"]

---

## Testing Strategy
| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit | [NUnit / XCTest / pytest] | Pure logic — damage calculations, inventory rules, state transitions |
| Integration | [depends] | System interactions — save/load round-trip, scene transitions |
| Manual playtest | checklist | Core loop feel, edge cases, platform-specific bugs |

---

## File Structure
```
root/
├── src/               # or Assets/ for Unity
│   ├── systems/
│   ├── ui/
│   ├── data/          # ScriptableObjects, config
│   ├── services/      # External integrations
│   └── utils/
├── tests/
├── assets-src/        # Source files (not in build)
├── claude/
└── .claude/commands/
```

---

## Environment / Config
| Key | Source | Description | Required |
|-----|--------|------------|---------|
| [e.g., API_KEY] | [env / secrets manager / keychain] | | yes |
| [e.g., DEBUG_MODE] | [build flag / env] | | no |
