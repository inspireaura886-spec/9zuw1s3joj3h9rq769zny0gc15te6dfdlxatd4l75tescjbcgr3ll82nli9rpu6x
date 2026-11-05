# REAL3D HUMANS: sources and licences (checked 2026-11-02)

| what | file(s) here | source | licence |
|---|---|---|---|
| Build tool: MPFB 2 v2.0.18 (MakeHuman Plugin For Blender) | none committed (downloaded by `build_humans.py` at build time) | https://github.com/makehumancommunity/mpfb2 (tag v2.0.18) | code GPL-3.0-or-later (`LICENSE.CODE.md`); used only as a build tool, never shipped. Its bundled data (base mesh, targets, rigs incl. `cmu_mb`, procedural eye/skin node trees, `sss.png`) is CC0 per the repo's `LICENSE.ASSETS.md` |
| MakeHuman system assets pack (makehuman_system_assets_cc0.zip) | baked into `humans.blend` | http://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip | CC0: every one of its 94 assets says `"license": "CC0"` in `packs/makehuman_system_assets.json` (author makehuman_system) |
|  - skins | young_caucasian_male2 (witness), middleage_caucasian_male (pilot) | same pack | CC0 |
|  - eyes | high-poly mesh + MPFB procedural eye material | same pack / MPFB data | CC0 |
|  - eyebrows / eyelashes | eyebrow010 (witness), eyebrow001 (pilot), eyelashes01 | same pack | CC0 |
|  - hair | short02 (witness), short04 (pilot, greyed) | same pack | CC0 |
|  - clothes | male_casualsuit05 + shoes01 (witness); male_elegantsuit01 recoloured navy + shoes04 (pilot) | same pack | CC0 |
| Captain's 4 gold sleeve rings, seat, yoke move | procedural (our code) | `_mpfb_build.py`, `scenes/humans_test/h2_pilot_cockpit.py` | ours |
| Motion capture | `mocap/idle_stand.bvh` (CMU 111_28, 8.5-15.0 s), `mocap/point_sky.bvh` (CMU 13_27, 14.0-18.0 s), `mocap/head_turn.bvh` (CMU 137_28, 2.0-6.5 s), `mocap/seat_base.bvh` (CMU 143_18, 1.8-2.4 s), `mocap/walk_slow.bvh` (CMU 132_45, 2.5-11.5 s) | Carnegie Mellon University Graphics Lab Motion Capture Database http://mocap.cs.cmu.edu (BVH conversion by B. Hahne / cgspeed, mirrored at https://github.com/una-dinosauria/cmu-mocap) | CMU: "This dataset of motions is free for all uses ... You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form." We only render it into videos (allowed). Do not publish the BVH files as a dataset. |

Not used (on purpose): Mixamo or any source needing an account; MakeHuman community (non-system) assets, whose licences vary (CC-BY etc.); any asset without a stated licence.
Credit line (optional, not required by CC0/CMU): "Characters made with MakeHuman/MPFB (CC0 assets). Motion: CMU Graphics Lab Motion Capture Database."
