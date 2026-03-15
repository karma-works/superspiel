# Superspiel — Game Design & Implementation Plan

> A cheerful, colorful pixel-art jump-and-run game for small kids (ages 4–7). No monsters in the classical sense — but plenty of adventure.
>
> **Visual inspiration: Kirby's Dream Land** — round, expressive characters, bright pastel colors, bouncy animations, friendly world.

---

## 1. Concept Summary

**Superspiel** is a side-scrolling platform game with:
- A green hero **M** and a loyal companion **friend**
- 5 thematic pixel-art levels with horizontal + vertical scrolling
- Collectibles (coins, treasures), vehicles (ships, cars), and environmental hazards
- No permadeath — M always respawns near the last danger point

---

## 2. Tech Stack

### Target Audience
- **Age**: 4–7 years old
- **Implications**:
  - Controls must be very simple (arrow keys + 1–2 action buttons)
  - No reading required — icons and colors convey all information
  - Difficulty curve must be very gentle; early levels nearly impossible to fail
  - Hazards and "death" are non-scary — bouncy/funny respawn animations, no blood/violence
  - Enemies look silly/cute, not threatening
  - Sound and music is upbeat, playful, not tense
  - Cheerful visual style throughout: **Kirby's Dream Land** color palette inspiration (bright pastels, round shapes, expressive faces, bouncy animations)

| Concern | Choice | Reason |
|---|---|---|
| Language | TypeScript | Type safety, modern tooling |
| Package manager | pnpm | Fast, disk-efficient |
| Build tool | Vite | Instant dev server, ES module native |
| Game engine | **Excalibur.js** | 100% TypeScript-first, built-in physics/tilemaps/cameras/ECS |
| Tilemap editor | Tiled | Free, de-facto standard; Excalibur has first-class Tiled support |
| Tiled plugin | `@excaliburjs/plugin-tiled` | Loads `.tmx` maps directly |
| Spritesheet / assets | Aseprite-compatible PNGs | Pixel art, easy to replace/extend |

### Why Excalibur.js?
- Pure TypeScript — no `@types/*` packages needed
- Built-in: Scene graph, Entity-Component System, Camera follow, Physics, Tilemap loader, Animation, Input
- Active maintenance, MIT license, excellent browser support
- No overhead from a heavy runtime — compiles to lean JS

---

## 3. Visual Style

- **Palette**: bright, saturated pastels — think pink skies, lime greens, sunny yellows, sky blues
- **Characters**: round, chubby, expressive pixel sprites with big eyes and exaggerated animations (like Kirby)
- **Tiles**: chunky, clean outlines; each tile type instantly readable
- **Animations**: bouncy (squash & stretch), never stiff; coins spin, treasure sparkles, M wiggles when idle
- **Respawn**: M does a cute pop-in animation (star burst) — funny, not scary
- **Enemies**: look goofy and harmless (wobbly walk, derpy faces) — never menacing
- **HUD**: big colorful icons, minimal text, readable at a glance by a child

---

## 4. Characters

### M (Player)
- Appearance: generic pixel hero, **green** color palette
- Controls: move left/right, jump, fire, board vehicle, collect item
- Abilities:
  - **Jump** — classic Mario-style (variable height, hold for higher)
  - **Fire** — shoots fireballs (unlimited ammo), projectile arcs forward
  - **Swim** — can enter water, moves slowly, drowns if submerged too long → respawn
  - **Board Ship** — when M touches a ship, auto-boards; ship crosses water sections
  - **Board Car** — when M touches a car, auto-boards; car moves faster on ground
  - **Collect** — coins and treasures are picked up on contact

### Friend (Companion)
- Follows M at a short offset (like Kirby's Animal Friends)
- **Fights**: attacks nearby enemies with a short-range hit or ranged assist
- **Helps**: can push blocks, distract enemies, trigger switches
- Appearance: small animal/creature companion (TBD art — suggest a fox or star creature)
- Cannot die — just staggers and recovers if hit

---

## 5. Game Mechanics

### Controls — Kids-Friendly (Ages 4–7)
- **Arrow Left / Right** — move
- **Space or Arrow Up** — jump
- **Z or X** — fire
- **Up Arrow** near vehicle — board / dismount
- All mapped to simple, one-hand-reachable keys; gamepad support planned

### Core Loop
1. Enter level → explore tiles, collect coins
2. Avoid/defeat hazards and enemies
3. Use vehicles where required (ship on water, car on roads)
4. Collect **all coins** to unlock the exit gate
5. Reach the exit → next level unlocks

### Scoring
- Coin: +10 pts
- Treasure: +100 pts
- Enemy defeated by M's fire: +50 pts
- Level completed quickly: time bonus

### Respawn System
- M has **no lives counter** — no game over screen
- On death trigger (spike, lava, drown, enemy attack): short flash animation → respawn at last checkpoint
- Checkpoints are placed automatically every ~30% of level length + at vehicle boarding points
- Coins and treasures already collected stay collected after respawn
- Enemies respawn to original position

### Vehicles
| Vehicle | Terrain | Control |
|---|---|---|
| Ship | Water sections | Left/Right only, auto-float |
| Car | Road tiles | Left/Right, faster speed, no jump |

M boards by walking into the vehicle; dismounts by pressing Up/Jump.

### Hazards
| Hazard | Effect | Respawn? |
|---|---|---|
| Spike | Instant respawn trigger | Enemy respawns |
| Lava | Instant respawn trigger | Static hazard |
| Falling Rock | Respawn if crushed | Rock resets position |
| Water (no ship) | Drowning timer (~3s) → respawn | — |
| Pit | Respawn at edge | — |
| Enemies | Respawn on contact if Friend not blocking | Enemies reset position |

---

## 6. Levels

All levels: tile-based, horizontal + vertical scrolling, Tiled `.tmx` maps.

### Level 1 — Rainy Hills
- **Theme**: overcast, rain particles, deep fog overlay, muddy greens and greys
- **Terrain**: grassy hills, puddles (shallow water, swimmable), waterfalls
- **Vehicles**: none
- **Hazards**: slippery mud tiles (reduced friction), falling rocks from cliffs, pits
- **Enemies**: 2–3 types (e.g. patrolling guards, jumping frogs)
- **Collectibles**: coins scattered on platforms, 1 treasure chest hidden behind waterfall
- **Atmosphere**: rain particle system, ambient rain SFX, dark palette

### Level 2 — Easter Meadow
- **Theme**: spring flowers, Easter eggs hidden in bushes, rabbits hopping around
- **Terrain**: soft meadows, flower platforms, burrow tunnels underground
- **Vehicles**: none
- **Hazards**: thorns/spikes on some flower stems, rabbit enemies (bounce off M), falling egg bombs
- **Enemies**: rabbit guards (patrol), egg-thrower bunnies (ranged)
- **Collectibles**: Easter eggs as treasures, coins inside flower blooms
- **Special mechanic**: underground burrow sections (vertical descent + horizontal tunnels)
- **Atmosphere**: bright pastel palette, light wind particles, cheerful music

### Level 3 — Winter Frost
- **Theme**: snow, ice, blizzard wind, frozen lakes
- **Terrain**: snowy hills, ice platforms (slippery), frozen water (walkable), snowdrifts
- **Vehicles**: ship under cracked ice sections (break ice to reveal water, board ship)
- **Hazards**: blizzard wind pushes M horizontally, icicle spikes drop from ceilings, lava vents melt ice (environmental traps), pits hidden under snow
- **Enemies**: snowball throwers, ice golems (slow, tanky)
- **Collectibles**: coins buried in snowdrifts (jump to reveal), treasure in igloo
- **Atmosphere**: snow particle system, wind sound, cool blue palette, aurora background

### Level 4 — City Roads
- **Theme**: urban pixel city, roads, bridges, construction sites
- **Terrain**: road tiles, building platforms, scaffolding, sewer sections below ground
- **Vehicles**: **cars** on roads (main horizontal traversal), taxi stands as boarding points
- **Hazards**: lava from broken pipes, falling girders (construction zone), spike fences, manholes (pit into sewer)
- **Enemies**: construction workers (patrol), sewer rats (underground), security drones (fly above)
- **Collectibles**: coins in crates (break with fire), treasure in rooftop safe
- **Atmosphere**: city ambience, traffic sounds, neon signs, night palette

### Level 5 — Sky Islands (Final)
- **Theme**: floating islands above clouds, ancient ruins, mysterious atmosphere
- **Terrain**: cloud platforms (temporary, fade after stepping), stone ruins, sky bridges, wind currents
- **Vehicles**: **airship** sections (ship repurposed for sky, crosses large cloud gaps)
- **Hazards**: lava geysers from ancient ruins, spikes on ruins, wind gusts push M off edge, falling rocks from crumbling pillars
- **Enemies**: stone guardians (boss-like, multiple hit fire needed), cloud spirits (fast, erratic)
- **Collectibles**: golden coins on precarious platforms, final grand treasure chest (level climax)
- **Atmosphere**: epic music, sky-blue + sunset palette, parallax cloud layers

---

## 7. HUD

```
[Coins: 0/42]  [Score: 0]  [Level: 1]  [Time: 00:00]
```

- Coin counter shows collected/total — reaching 100% unlocks the exit
- Score accumulates across levels
- Timer for speedrun bonus scoring
- Small companion portrait shows friend status (active / stunned)

---

## 8. Project Structure

```
superspiel/
├── docs/
│   └── plan.md                  ← this file
├── public/
│   └── index.html
├── src/
│   ├── main.ts                  ← Excalibur game init
│   ├── config.ts                ← constants (tile size, speeds, etc.)
│   ├── actors/
│   │   ├── Player.ts            ← M
│   │   ├── Friend.ts            ← companion
│   │   ├── Fireball.ts          ← M's projectile
│   │   ├── enemies/
│   │   │   ├── BaseEnemy.ts
│   │   │   ├── PatrolEnemy.ts
│   │   │   ├── RangedEnemy.ts
│   │   │   └── FlyingEnemy.ts
│   │   ├── vehicles/
│   │   │   ├── Ship.ts
│   │   │   └── Car.ts
│   │   ├── collectibles/
│   │   │   ├── Coin.ts
│   │   │   └── Treasure.ts
│   │   └── hazards/
│   │       ├── Spike.ts
│   │       ├── Lava.ts
│   │       ├── FallingRock.ts
│   │       └── Water.ts
│   ├── scenes/
│   │   ├── MainMenu.ts
│   │   ├── LevelScene.ts        ← base class for all levels
│   │   ├── Level1.ts
│   │   ├── Level2.ts
│   │   ├── Level3.ts
│   │   ├── Level4.ts
│   │   └── Level5.ts
│   ├── systems/
│   │   ├── RespawnSystem.ts     ← checkpoint + respawn logic
│   │   ├── CoinTracker.ts       ← tracks collection, unlocks exit
│   │   ├── VehicleSystem.ts     ← boarding/dismounting logic
│   │   └── ParticleSystem.ts    ← rain, snow, fire particles
│   ├── ui/
│   │   └── HUD.ts
│   └── assets/
│       ├── sprites/             ← PNG spritesheets
│       ├── tiles/               ← tileset PNGs
│       ├── maps/                ← Tiled .tmx + .tsx files
│       └── audio/               ← SFX + music
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

---

## 9. Implementation Phases

### Phase 1 — Scaffold & Engine Setup
- [ ] Init pnpm project, Vite, TypeScript, Excalibur.js
- [ ] `index.html` shell, basic game loop running
- [ ] Tilemap pipeline: Tiled → `.tmx` → Excalibur loader
- [ ] Camera follow player

### Phase 2 — Player & Movement
- [ ] M actor: walk, jump (variable height), gravity
- [ ] Fireball actor: spawn on input, arc, destroy on tile hit
- [ ] Friend actor: follow offset, idle/attack animation stubs
- [ ] Respawn system: checkpoint placement, death trigger → respawn

### Phase 3 — Level 1 (Rainy Hills) — Full Playable Slice
- [ ] Tileset + Tiled map for level 1
- [ ] Rain particle system
- [ ] Hazards: falling rocks, pits, slippery tiles
- [ ] Enemies: patrol type
- [ ] Coins + treasure collectibles
- [ ] Coin tracker + exit gate unlock
- [ ] HUD

### Phase 4 — Vehicles
- [ ] Ship: water boarding, horizontal movement, dismount
- [ ] Car: road boarding, speed boost, dismount

### Phase 5 — Remaining Levels
- [ ] Level 2: Easter Meadow (tunnels, rabbit enemies, Easter eggs)
- [ ] Level 3: Winter Frost (ice friction, blizzard wind, icicles)
- [ ] Level 4: City Roads (cars, sewer sections, construction hazards)
- [ ] Level 5: Sky Islands (airship, cloud platforms, stone guardians)

### Phase 6 — Polish
- [ ] Pixel art assets finalized (player, friend, enemies, tiles per level)
- [ ] SFX + music per level
- [ ] Main menu scene
- [ ] Score system + time bonus
- [ ] Parallax backgrounds
- [ ] Mobile-friendly virtual controls (optional stretch goal)

---

## 10. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Target age 4–7 | Very simple controls, no text, gentle difficulty | Core audience, must be immediately playable by a child |
| No permadeath | Respawn near danger point | Keeps game fun, reduces frustration |
| Coins gate exit | Must collect all to proceed | Encourages exploration of full level |
| Companion always present | Follows and assists | Adds character, reduces isolation, provides tactical depth |
| Unlimited fire | No ammo limit | Keeps combat fluid, focus on platforming skill |
| Ships in sky level | Reused as airship | Keeps vehicle system simple, adds surprise |
| Tiled for maps | `.tmx` files | Designer-friendly, hot-reloadable, separates data from code |

---

## 11. Open Questions / Future Work

- What does the Friend companion look like? (art direction needed)
- Level 2 & 5 need more enemy variety design
- Mobile virtual controls (stretch goal for Phase 6)
- Sound design style: chiptune 8-bit or lo-fi pixel?
- Localization: German title "m-ohne-monster" → keep English "Superspiel" as final name?
