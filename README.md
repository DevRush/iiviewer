# CathLabSimulator (iiviewer)

**Coronary angiography view simulator — a 3D heart model with a live 2D fluoroscopy projection.**

The hardest part of learning angiography isn't the anatomy, it's the projection: figuring out how a 3D coronary tree collapses into whatever 2D view the gantry is giving you. This simulator puts both side by side. Rotate the heart, and the fluoro view follows in real time, until "LAO caudal" stops being an incantation and starts being a direction you can picture.

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

For learning, not for the lab. Educational tool only — not for clinical use.

More projects at [annasrahman.com](https://annasrahman.com).
