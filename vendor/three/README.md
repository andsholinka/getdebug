# Three.js — vendored

- Version: **0.187.0** (npm `three@0.187.0`, checked 2026-11-11)
- Source tarball: https://registry.npmjs.org/three/-/three-0.187.0.tgz
- File: `three.module.js` — ES module build, no bundler needed.
  (Upstream 0.187 no longer ships `three.module.min.js`, so the
  unminified module build is vendored as-is: 644 KB, cached offline
  by the service worker.)
- File: `three.core.js` (1.5 MB) — **required**: `three.module.js`
  re-exports everything from `./three.core.js`, so both files must
  be vendored together. Total vendored Three.js: ~2.1 MB, cached
  once by the service worker.
- License: MIT — see `LICENSE` in this folder.
- Used via import map in the hub (`/`) and Tangkap Bug
  (`/tangkap-bug/`): `"three": "/vendor/three/three.module.js"`.
- To upgrade: download the new tarball, replace this file, bump
  `CACHE` in `/sw.js`, and update the version note here + in README.
