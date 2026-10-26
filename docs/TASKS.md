# Task queue

Status: `TODO` / `RESEARCH` / `SPEC-REVIEW` / `IMPLEMENT` / `TESTING` / `DONE`.
Only one task is active at a time. Order matters; later tasks depend on earlier ones.

## Phase 0 - Setup
- [ ] T-000 TODO Solution skeleton: `Ra2.Core` (formats, rules), `Ra2.Sim` (simulation), `Ra2.Game` (engine/rendering), `Ra2.Tests`.

## Phase 1 - Assets (documented formats, no REA needed)
- [ ] T-001 TODO MIX archive reader (incl. encrypted header / file ID hashing). Source: `refs/ra2ff`, ModEnc.
- [ ] T-002 TODO PAL reader.
- [ ] T-003 TODO SHP reader (all compression types) + render one frame.
- [ ] T-004 TODO TMP reader (isometric tiles) + render a tile.
- [ ] T-005 TODO INI parser with the game's quirks (inheritance via `[Section]` lists, duplicate keys, comments).
- [ ] T-006 TODO Map loader (`.map`): `[IsoMapPack5]`, `[OverlayPack]` decoding.

## Phase 2 - Static world
- [ ] T-010 TODO Isometric camera + tile rendering.
- [ ] T-011 TODO VXL/HVA voxel loading and a basic voxel renderer.

## Phase 3 - Rules & simulation (needs REA evidence)
- [ ] T-020 TODO Typed `rules.ini` / `art.ini` definitions (InfantryTypes, VehicleTypes, BuildingTypes...).
- [ ] T-021 TODO Fixed-tick simulation loop + seeded RNG. Determine the original tick rate and RNG algorithm (REA).
- [ ] T-022 TODO Movement speed: how `Speed=` becomes per-tick movement. Starting evidence: string `Speed` at 0x81d9cc.
- [ ] T-023 TODO Armor / damage: `Verses`, `Armor`, `Strength` and the damage formula.
- [ ] T-024 TODO Pathfinding (cell-based) basics.
- [ ] T-025 TODO Production queue, power, prerequisites.
- [ ] T-026 TODO Harvester and economy.

## Phase 4 - Later
- [ ] T-040 TODO Audio (AUD / BAG+IDX).
- [ ] T-041 TODO UI / sidebar.
- [ ] T-042 TODO Skirmish AI.
- [ ] T-043 TODO Networking (lockstep).

## Notes
- Phases 1-2 can be done with references only. Phase 3 tasks must follow the research -> spec -> implement loop.
- Add new tasks at the bottom of their phase; never reorder an active task.
