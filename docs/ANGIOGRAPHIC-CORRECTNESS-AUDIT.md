# IIviews — Angiographic Correctness Audit & Reference

**Purpose:** Validate the anatomic and geometric correctness of the IIviews coronary
angiography view simulator against the interventional-cardiology and medical-imaging
literature, and define the precise fixes that move it toward a "final form" suitable for a
medical/educational audience.

**Status of the app (headline):** The core geometry is **correct**. The angle conventions,
the angle→camera projection math, the displayed-image handedness, and the rendered
orientation of every standard view all match published standards and were verified both
mathematically and by reading live screenshots. The remaining work is **refinement of the
quality-grading layer** (which views are labeled "best" for which segment) and a few small
anatomic/copy tweaks — not a geometry rebuild.

> Educational/simulation only. Not a clinical decision-support tool.

---

## Part 1 — Verified ground truth (with citations)

All claims below were produced by multi-source web research with adversarial 3-vote
verification (2/3 to confirm). Confidence and sources are noted.

### 1.1 Angle conventions & sign (DICOM PS3.3 C.8.7.5 / NEMA) — *high confidence, 3-0*

- **Positioner Primary Angle (0018,1510): POSITIVE = LAO, NEGATIVE = RAO.** Zero = beam
  perpendicular to chest; +90° = patient's left (LAO), −90° = patient's right (RAO).
- **Positioner Secondary Angle (0018,1511): POSITIVE = CRANIAL, NEGATIVE = CAUDAL.** Range
  −90°…+90°.
- Views are named by **detector (image-intensifier) position**: RAO = detector on patient's
  right, LAO = on patient's left; cranial/caudal = detector tilted toward head/feet.
- Source under the table, detector above the supine patient; 0° reference beam travels
  posterior→anterior.
- Sources: DICOM/NEMA PS3.3 C.8.7.5 (via Innolitics DX/XA Positioner modules); Kern *Cath Lab
  Digest*; BJC trainee guide; Medmastery; Thoracic Key.

**→ App status:** `src/types/angles.ts` uses `+LAO / −RAO` and `+Cranial / −Caudal`. **Correct
and DICOM-compliant.** (Note: the historical `IIViewerCodex` README documented `+RAO / −LAO`,
which is the *wrong* sign; the current app fixed it.)

### 1.2 Angle → viewing-vector math (latitude–longitude C-arm model) — *high confidence, 3-0*

- The commercial C-arm uses a **latitude–longitude** parameterization: RAO/LAO = longitude
  (primary), CRAN/CAUD = latitude (secondary), about the isocenter.
- Forward: `v(α,β) = R_α R_β v0`. Inverse from the principal-ray vector `(nx,ny,nz)`:
  `α = atan2(nx, −ny)`, `β = arcsin(nz)`.
- Sources: Preuhs et al. arXiv 1808.00853; Bian et al. arXiv 2505.10902.

**→ App status:** `src/utils/carm-math.ts` `anglesToPosition` computes
`x = d·sin(α)·cos(β)`, `y = d·sin(β)`, `z = d·cos(α)·cos(β)`. This **is** the latitude–longitude
parameterization (it satisfies the verified inverse `β = arcsin(y/d)`, `α = atan2(x, z)`).
**Correct.** An earlier hypothesis that a "sequential fixed-axis" form was needed is **withdrawn**
— that model is not the clinical convention.

### 1.3 Image handedness — *high confidence, 3-0*

- The frontal angiogram is displayed **"as if facing the patient"**: **patient LEFT → viewer's
  RIGHT**, patient RIGHT → viewer's LEFT (same convention as an AP/PA chest film).
- Spine/catheter appear on the **viewer's right in LAO**, **viewer's left in RAO** (they flip
  because the detector swaps sides). Mnemonic: spine to the right of the image = LAO.
- **Camera placement:** a virtual camera at the **detector** looking toward isocenter
  reproduces the clinically-correct orientation with **no mirror**; a camera at the **source**
  yields a left-right-mirrored image needing one flip.
- Sources: StatPearls NBK565865; Applied Radiology; RadiologyKey; validated against real CAG
  with 3D-printed models.

**→ App status:** camera sits on the detector side (anterior at AP) looking at isocenter, with
world-up = superior. Empirically (screenshots) patient-left projects to screen-right and
cranial projects up. **Correct; no left-right flip needed.**

### 1.4 Foreshortening & optimal-view math — *high confidence, 3-0*

- **Foreshortening (shortening rate) = 1 − sin(θ)**, where θ = angle between the viewing/central
  ray and the vessel-segment direction. (e.g. θ = 56.5° → 1 − sin 56.5° = 0.166 = 16.6%.)
  Equivalent: projected length = L·sin(θ) = L·√(1 − (t·r)²).
- **A view is optimal (zero foreshortening) when the image plane is perpendicular to the
  vessel's 3D vector** — i.e. the vessel is viewed perpendicular to its axis. Parallel → vessel
  projects to a point (100% foreshortening).
- The optimal-view computation jointly **minimizes foreshortening of the target AND overlap
  with neighbors** (Chen & Carroll); physician working views foreshorten 0–50% (worst mid-LCx,
  least RCA), vs ~0.5% for computer-optimal views (Green et al.).
- Sources: PMC10507606; IEEE 276141 (Chen/Carroll); Springer 3-540-45786-0_75; PubMed
  10909927; Green et al. PMID 15744720.

### 1.5 Per-segment best-view matrix — *high confidence; canonical source identified*

- The **canonical per-segment × per-projection quality matrix is Di Mario & Sutaria, *Heart*
  2005 (PMC1768997), Table 2**, graded on a **0–3 ordinal scale** operationalized by Smith et
  al., *Br J Radiol* 2012 (PMC3487091). Legend: **`−` not recommended · `+` occasionally
  useful · `++` very useful · `+++` ideal** — *identical to the legend IIviews already uses.*
- Verified per-segment assignments:
  - **LM bifurcation / proximal LCx / ramus / D1 ostium →** Spider (LAO 40–50 / CAUD 25–40).
    Mid-LAD is **foreshortened** here (do not use for mid-LAD PCI).
  - **Proximal & mid LAD →** AP/RAO cranial (cranial ≥~40°); separates **diagonals to the right,
    septals to the left**. RAO 10° / cranial 42° best for the **LAD/D1 bifurcation**.
  - **Distal LAD →** **RAO caudal** ("the most important view for the distal LAD").
  - **LCx / OMs →** RAO caudal & AP caudal (caudal angulation).
  - **Proximal/mid RCA C-shape →** LAO & RAO straight.
  - **Distal RCA / crux / PDA / posterolaterals →** LAO cranial + AP cranial.
- **CT-derived mean optimal angles** (Kočka/Kawashima et al., *JACC Cardiovasc Interv* 2020,
  n=100) — use as reference anchors with tolerance bands, not absolutes:
  - Ostial LM: **LAO 37 / CRA 22** · LM bifurcation: **LAO 0 / CAU 49** ·
    LAD–D1 bifurcation: **LAO 11 / CRA 71** · LCx–OM1: **LAO 24 / CAU 33** ·
    Ostial RCA: **LAO 79 / CRA 41** (high variability) · PDA/PLV: **LAO 44 / CRA 34**.
- **Minimum acquisition sets:** left 3–4 views, right 2–3 (1 if non-dominant).
- **Do NOT encode (refuted):** "LAO cranial is the best mid-LAD view"; "RAO caudal is the best
  LM/ostial-LAD view."
- Sources: PMC1768997 (Di Mario & Sutaria); PMC3487091 (Smith et al.); jacc.org
  10.1016/j.jcin.2020.06.042; PMID 15744720 (Green et al.).

### 1.6 3D anatomy, segmentation & dominance — *high confidence, 3-0*

- **SYNTAX 16-segment model** (AHA/CASS-modified): LM → LAD (prox/mid/apical + D1/D2 + septals
  + ramus) and LCx (+ OMs); RCA (prox/mid/distal + acute marginal + PDA + posterolaterals +
  AV-nodal). Sources: syntaxscore.org; Sianos et al. EuroIntervention.
- **"Ring & loop" spatial model:** the *ring* lies in the AV groove (RCA = right AV groove,
  LCx = left AV groove); the *loop* runs ~perpendicular in the interventricular planes (LAD
  anterior→apex, PDA posterior→apex). Source: AATS TSRA primer; StatPearls NBK482375.
- **Dominance** is defined by **which vessel gives off the PDA at the crux**: right ~85% (PDA +
  posterolaterals from distal RCA), left ~8% (PDA from distal LCx; RCA small, does not reach
  crux), codominant ~7% (PDA from RCA, posterolaterals from LCx). AV-nodal artery follows the
  dominant vessel (~90% RCA). Sources: JAHA PMC11179863; StatPearls NBK534790; syntaxscore.org.
- **Ostia:** LM from the left (left-posterior) aortic sinus — leftward, slightly anterior; RCA
  from the right (anterior) sinus — rightward, **more anterior**. Source: StatPearls NBK482375;
  ecgwaves; PubMed 8915616.
- **Coordinate hints** (x = patient-left, y = superior, z = anterior): left ostium = +x, modest
  +z; right ostium = −x, **more +z**; apex = −y/+x/+z; crux = −z/−y/midline.

---

## Part 2 — Audit of the current app

### 2.1 What is correct (validated) ✅

| Area | Finding |
|---|---|
| Angle signs (`+LAO/−RAO`, `+Cran/−Caud`) | DICOM-compliant |
| Projection math (`anglesToPosition`) | Correct latitude–longitude model |
| Image handedness | Patient-left → screen-right; cranial → up (correct convention) |
| Camera placement | Detector-side; no mirror needed |
| AP view | LCA right / RCA left of image — correct |
| Spider (LAO 45/Caud 30) | LM splay + **mid-LAD foreshortened** — matches Di Mario |
| AP Cranial | LAD elongated, **diagonals right / septals left** — verbatim Di Mario |
| LAO Straight (RCA) | "L"/walking-stick, ostium top-left — correct |
| RAO Straight (RCA) | "C" shape, flips correctly vs LAO; mid-RCA best |
| RAO Caudal | LCx + OMs displayed |
| Landmark coordinates | apex `(2,−3.5,2)` ✓, crux `(−0.5,−1.5,−2.5)` ✓, ostia signs ✓ |
| Dominance variants | Right/left/codominant PDA-PLV origins handled correctly |
| Quality legend (`−/+/++/+++`) | Same 0–3 scale as the canonical Di Mario table |

### 2.2 What needs refinement ⚠️

**A. Quality matrix is a static per-preset lookup that snaps to the nearest preset with no
distance gating.** `getQualityForAngles()` returns the *nearest* preset's hand-coded ratings
even at arbitrary angles (e.g. LAO 80/Cran 10 inherits a neighbor's grades). `TeachingPanel`
already treats distance > 15 as "Custom View", but `QualityPanel` does not — inconsistent.

**B. A few quality-matrix cells disagree with Di Mario.** Most important: **`rao-caudal`
rates `dist-lad` only `+`/`++`**, but RAO caudal is *"the most important view for the distal
LAD."* Distal-LAD should be `+++` (or `++`) in `rao-caudal`. (Other cells are broadly
consistent; a full cell-by-cell pass against Di Mario Table 2 is recommended.)

**C. RCA ostium is not more anterior than the LM ostium.** Both sit at `z = 1.5`
(`src/data/arteries.ts`); the RCA arises from the right/anterior sinus and should be slightly
**more anterior (+z)** than the LM ostium (left/posterior sinus). Small but real anatomic
nudge.

**D. Preset angles are within accepted ranges but some could be centered on published anchors.**
e.g. `rao-caudal` is RAO 25/Caud 25; Di Mario's distal-LAD/LCx "right caudal" is more like
RAO 10–20 (or 30) / Caud 30–40. Optional tightening toward Di Mario/CT centers.

**E. Unverified specific claims in copy.** `ap-cranial-rca` clinicalNotes states "PDA origin
visible in 98% of cases" — not a verified figure. Soften or cite. Also normalize terminology
("posterior" vs "inferior" interventricular groove) and pick **one** codominance convention,
stated explicitly.

### 2.3 Highest-leverage opportunity 🚀

The app already stores **3D centerlines** for every segment. The verified foreshortening
formula (`1 − sin θ`) means the quality of any segment at any knob position can be **computed
directly from geometry** instead of looked up from a static table. This would:
- make every arbitrary angle give a physically-correct answer (no more snapping),
- auto-derive "best view" from anatomy (and stay correct if the anatomy data changes),
- let the app **prove** its own teaching claims (the engine's optimum should land on the
  textbook angle), and
- validate against the Di Mario table and the JACC CT anchors as a regression test.

---

## Part 3 — Prioritized fix plan

**P0 — correctness fixes (small, high-value):**
1. Fix `rao-caudal` distal-LAD rating (→ `+++`/`++`) and do a full cell-by-cell pass of
   `quality-matrix.ts` against Di Mario & Sutaria Table 2.
2. Add **custom-view gating** to `QualityPanel` (mirror `TeachingPanel`'s distance threshold) so
   ratings aren't asserted at angles far from any preset.
3. Nudge RCA ostium slightly anterior vs LM ostium in `arteries.ts`.
4. Soften/cite the "98%" claim and normalize anatomy terminology; state the codominance
   convention explicitly.

**P1 — the geometry-derived quality engine (the big upgrade):**
5. Add `computeForeshortening(segment, viewDir)` = `1 − sin θ` from centerline tangents
   (integrate over sub-segments to handle curvature).
6. Add `computeOverlap(segment, others, viewDir)` from projected-centerline proximity.
7. Combine into a per-segment score → `−/+/++/+++`, replacing/augmenting the static matrix;
   keep presets as labeled "named views" but grade live from geometry.
8. Regression-test the engine's optima against Di Mario assignments + JACC CT anchors.

**P2 — polish / optional:**
9. Optionally re-center preset angles on published anchors (with tolerance bands).
10. Optional "optimal-view map" heat overlay on the (LAO/RAO × CRAN/CAUD) plane for a chosen
    segment (Green/Garcia-style) — a strong teaching feature.

---

## Part 4 — Geometry-derived quality engine (design sketch)

```
for each segment S with polyline points P[0..n]:
  L_true = Σ |P[i+1] − P[i]|
  L_proj = Σ |project(P[i+1]) − project(P[i])|          # project = onto image plane
  foreshorten = 1 − L_proj / L_true                      # 0 = perfect, →1 = end-on
  # overlap: min projected distance from S's polyline to every other segment's polyline,
  # penalized when < vessel diameter
  overlap = penalty(min projected centerline distance to neighbors)
  score = w_f · (1 − foreshorten) − w_o · overlap        # then bucket to −/+/++/+++
```
- `project` uses the **same** camera basis as `FluoroCanvas.computeCameraBasis` (unify the two
  projection code paths onto one source of truth).
- Validation targets: spider → LM/prox-LAD/prox-LCx high, mid-LAD low; AP cranial → mid/distal
  LAD high; LAO cranial (RCA) → crux/PDA high; RAO caudal → distal-LAD + LCx high.

---

## Sources (primary / high-confidence)

- DICOM/NEMA PS3.3 C.8.7.5 — Positioner Primary/Secondary Angle (via Innolitics DX/XA modules)
- Di Mario C, Sutaria N. *Coronary angiography in the angioplasty era: projections with a
  meaning.* Heart 2005. PMC1768997
- Smith N et al. *Br J Radiol* 2012. PMC3487091 (0–3 operationalization of Di Mario Table 2)
- Kočka/Kawashima et al. *Optimal Fluoroscopic Projections… defined by CTCA.* JACC Cardiovasc
  Interv 2020. doi:10.1016/j.jcin.2020.06.042 (PMID 33153569)
- Green NE et al. *Angiographic views used for PCI: 3D analysis…* Catheter Cardiovasc Interv
  2005. PMID 15744720
- Chen SY, Carroll JD. Optimal-view computation. IEEE TMI (276141); PubMed 10909927
- Foreshortening = 1 − sin θ: PMC10507606
- Preuhs et al. arXiv 1808.00853; Bian et al. arXiv 2505.10902 (C-arm lat-long geometry)
- SYNTAX score segment definitions: syntaxscore.org; Sianos et al. EuroIntervention
- Coronary anatomy & dominance: StatPearls NBK482375 / NBK534790; JAHA PMC11179863; AATS TSRA
- Sos TA, Baltaxe HA. *Cranial and caudal angulation for coronary angiography revisited.*
  Circulation 1977. doi:10.1161/01.CIR.56.1.119

---

## Part 5 — Implementation outcome (what was built)

Implemented 2026-06 (P0 + P1 + P2):

- **P0 correctness:** RCA ostium nudged anterior of the LM ostium (`arteries.ts`); LCx
  continuity kink fixed in the left/co-dominant variants; dominance conventions stated
  explicitly; `rao-caudal` distal-LAD rating corrected to `+++` (Di Mario); unverified
  "98%" copy softened.
- **P1 geometry engine (`utils/view-quality.ts`):** computes physical foreshortening
  (`1 − sin θ`) and vessel overlap from the 3D centrelines, sharing one camera basis
  (`carm-math.computeCameraBasis`) with the fluoro renderer. **Validated by a vitest suite**
  (`view-quality.test.ts`) covering handedness, the foreshortening physics, and textbook
  ratings at every standard view.
- **Hybrid grading (key decision):** testing revealed the model's centrelines are stylised,
  so a *pure*-geometry grade diverges from the textbooks (e.g. it rates mid-LAD better at
  AP-straight than AP-cranial). To stay textbook-accurate, the **headline segment rating is
  the curated Di Mario reference, smoothly interpolated across presets** (inverse-distance
  weighting — `quality-matrix.interpolateSegmentScores`), which also removed the old hard
  "snap to nearest preset" behaviour. The geometry engine supplies the **transparent
  foreshortening %/overlap readout** (tooltips) layered on top — honest about the model,
  never overriding the textbook.
- **P2:** an **optimal-view heat-map** (`OptimalViewMap.tsx`) — for a selected segment it
  colours the whole (RAO/LAO × CRAN/CAUD) plane by interpolated view quality, marks the best
  view (✦) and current view (＋), and is click-to-navigate. Driven by the textbook field so
  its optimum is the published best projection.
- **Mobile:** fixed a pre-existing clip — `height:100%` → `min-height:100%` so the control
  bar (now incl. the heat-map) scrolls on phones.

Future option (not done — would be substantial, and risks the validated 2D silhouettes):
re-model the coronary centrelines to be anatomically faithful enough that the *pure* geometry
engine reproduces textbook view-quality directly, retiring the curated matrix.

---

*Generated from a 7-stream adversarially-verified research pass + live screenshot validation
of the running app, 2026-06.*
