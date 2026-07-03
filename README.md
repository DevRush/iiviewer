# CathLabSimulator (iiviewer)

**Coronary angiography view simulator — a 3D heart model with a live 2D fluoroscopy projection.**

Learning to read coronary angiograms means learning how a 3D coronary tree collapses into 2D fluoro views (LAO/RAO, cranial/caudal). This simulator puts both side by side: rotate a 3D coronary anatomy model and watch the corresponding angiographic projection update in real time, so the mapping between gantry angles and what you see on screen becomes intuitive.

Part of the projects at [annasrahman.com](https://annasrahman.com).

## Features

- **3D coronary anatomy** — interactive coronary tree rendered with three.js
- **Live 2D fluoroscopy projection** — the angiographic view for the current gantry angulation
- **Dominance variants** — right-dominant, left-dominant, and codominant coronary anatomy
- **Standard view presets** — jump straight to the classic angiographic projections
- **Teaching mode & quiz** — built-in questions for testing view recognition
- **View-quality guidance** — which projections best show which segments

## Tech stack

- [React 19](https://react.dev) + TypeScript
- [three.js](https://threejs.org) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) and drei
- [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com), [Vitest](https://vitest.dev)

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run test        # vitest
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

## Disclaimer

Educational tool only — not for clinical use.
