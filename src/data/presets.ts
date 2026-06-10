import type { PresetView } from '@/types/angles'

export const VIEW_PRESETS: PresetView[] = [
  // ═══════════════════════════════════════════
  // LEFT CORONARY SYSTEM VIEWS
  // ═══════════════════════════════════════════
  {
    id: 'rao-caudal',
    name: 'RAO Caudal',
    shortName: 'RAO Caud',
    raoLao: -25,
    cranialCaudal: -25,
    targetSystem: 'left',
    description: 'Distal LAD, LM bifurcation, entire LCx & OM origins. Key distal-LAD + LCx view.',
    angleRange: 'RAO 20-30 / Caudal 20-30',
    objective: 'Assess left main bifurcation geometry and LCx course',
    clinicalNotes: 'The RAO caudal projection opens up the left main bifurcation and provides the best view of the entire LCx system. This is one of the first views obtained during left coronary angiography. The caudal angulation separates the LAD from the LCx at their origin, while the RAO component profiles the LCx as it courses in the AV groove.',
    expectedFindings: [
      'LM bifurcation well profiled with clear LAD-LCx separation',
      'Entire LCx course visible in AV groove',
      'OM1 and OM2 branch origins clearly shown',
      'Proximal LAD visible but mid/distal may foreshorten',
    ],
    practicePrompt: 'Adjust ±5° caudal. Notice how reducing caudal angulation collapses the LM bifurcation while increasing it may foreshorten the LCx.',
    targetSegments: ['lm', 'prox-lad', 'prox-lcx', 'dist-lcx', 'om1', 'om2'],
  },
  {
    id: 'spider',
    name: 'Spider View',
    shortName: 'Spider',
    raoLao: 45,
    cranialCaudal: -30,
    targetSystem: 'left',
    description: 'LM bifurcation, proximal LAD & LCx separation. Named for spider-like branching pattern.',
    angleRange: 'LAO 40-55 / Caudal 25-35',
    objective: 'Optimize left main bifurcation branch separation',
    clinicalNotes: 'The spider view (LAO caudal) is named for the characteristic spider-like branching pattern of the left coronary system. This view maximally opens the LM bifurcation and is critical for assessing LM disease. The combination of LAO and caudal angulation "unfolds" the bifurcation so all three branches (LAD, LCx, and ramus if present) are separated.',
    expectedFindings: [
      'LM bifurcation maximally opened — all branches separated',
      'Proximal LAD and LCx clearly diverge',
      'Ramus intermedius visible if present',
      'Diagonal branches begin to appear',
    ],
    practicePrompt: 'Compare LAO 40 vs LAO 55 caudal. Which better separates a trifurcation (LAD, LCx, ramus)?',
    targetSegments: ['lm', 'prox-lad', 'prox-lcx', 'd1'],
  },
  {
    id: 'ap-cranial',
    name: 'AP Cranial',
    shortName: 'AP Cran',
    raoLao: 0,
    cranialCaudal: 35,
    targetSystem: 'left',
    description: 'Mid and distal LAD, diagonal branches, septal perforators. Ideal LAD working view.',
    angleRange: 'AP / Cranial 30-40',
    objective: 'Elongate LAD and visualize diagonal/septal branches',
    clinicalNotes: 'AP cranial is the workhorse view for the LAD. The cranial angulation elongates the LAD as it courses down the anterior interventricular groove, minimizing foreshortening. Diagonal branches are well separated from the LAD, and septal perforators drop vertically into the septum. This is often the preferred working view for LAD PCI.',
    expectedFindings: [
      'Mid and distal LAD elongated along interventricular groove',
      'Diagonal branches separate clearly from LAD',
      'Septal perforators visible dropping into septum',
      'LM origin may overlap with proximal LAD',
    ],
    practicePrompt: 'Adjust cranial from 25° to 40°. At what angle does the LAD appear longest without excessive foreshortening of diagonals?',
    targetSegments: ['mid-lad', 'dist-lad', 'd1', 'd2', 'sep1'],
  },
  {
    id: 'lao-cranial',
    name: 'LAO Cranial',
    shortName: 'LAO Cran',
    raoLao: 35,
    cranialCaudal: 25,
    targetSystem: 'left',
    description: 'LAD-diagonal bifurcations, mid LAD with minimal foreshortening.',
    angleRange: 'LAO 30-45 / Cranial 20-30',
    objective: 'Assess LAD-diagonal bifurcation geometry',
    clinicalNotes: 'LAO cranial provides an excellent view of the LAD-diagonal bifurcations. The combination of LAO and cranial angulation profiles the takeoff angles of the diagonal branches from the LAD, which is critical for planning bifurcation PCI. The proximal LAD and D1 origin are usually well shown.',
    expectedFindings: [
      'LAD-D1 bifurcation angle clearly defined',
      'Mid LAD course visible with minimal overlap',
      'D1 and D2 origins separated',
      'LCx system may be foreshortened',
    ],
    practicePrompt: 'Adjust ±5° LAO. How does the LAD-D1 bifurcation angle change? At what point does D1 overlap with the LAD?',
    targetSegments: ['lm', 'prox-lad', 'mid-lad', 'd1', 'd2', 'sep1'],
  },
  {
    id: 'rao-cranial',
    name: 'RAO Cranial',
    shortName: 'RAO Cran',
    raoLao: -15,
    cranialCaudal: 30,
    targetSystem: 'left',
    description: 'LMCA ostium, mid/distal LAD, diagonal branches.',
    angleRange: 'RAO 10-20 / Cranial 25-35',
    objective: 'Visualize LM ostium and mid-to-distal LAD',
    clinicalNotes: 'RAO cranial provides a view of the LM ostium as the catheter engages, and elongates the mid-to-distal LAD. This view is complementary to AP cranial, offering a slightly different perspective on the diagonal branch origins. It can be useful for assessing ostial LM disease.',
    expectedFindings: [
      'LM ostium and proximal LM well profiled',
      'Mid and distal LAD elongated',
      'Diagonal branch origins visible',
      'LCx partially visible but not optimally',
    ],
    practicePrompt: 'Compare this view to AP Cranial. Which better separates D1 from D2? Which shows the LM ostium more clearly?',
    targetSegments: ['lm', 'prox-lad', 'mid-lad', 'dist-lad', 'd1', 'd2'],
  },

  // ═══════════════════════════════════════════
  // RIGHT CORONARY SYSTEM VIEWS
  // ═══════════════════════════════════════════
  {
    id: 'lao-straight',
    name: 'LAO Straight',
    shortName: 'LAO',
    raoLao: 45,
    cranialCaudal: 0,
    targetSystem: 'right',
    description: 'Proximal and mid RCA in its C-shape. Distal RCA/PDA may overlap.',
    angleRange: 'LAO 40-60 / Straight',
    objective: 'Profile proximal-mid RCA contour in its C-shape',
    clinicalNotes: 'LAO straight shows the RCA in its characteristic C-shaped course along the right AV groove. The proximal and mid segments are well profiled. However, the distal RCA bifurcation (PDA/PLV) often overlaps in this projection. This is a standard initial view for right coronary angiography.',
    expectedFindings: [
      'Proximal and mid RCA C-curve well profiled',
      'RCA course along right AV groove visible',
      'Acute marginal branches visible',
      'Distal RCA/PDA/PLV may overlap — need cranial to separate',
    ],
    practicePrompt: 'Add 10° cranial angulation. How does this affect visualization of the distal RCA bifurcation?',
    targetSegments: ['prox-rca', 'mid-rca', 'dist-rca', 'am'],
  },
  {
    id: 'lao-cranial-rca',
    name: 'LAO Cranial (RCA)',
    shortName: 'LAO Cran',
    raoLao: 25,
    cranialCaudal: 25,
    targetSystem: 'right',
    description: 'Best overall RCA view. Crux, PDA/PLV bifurcation clearly shown.',
    angleRange: 'LAO 20-35 / Cranial 20-30',
    objective: 'Visualize RCA crux and PDA/PLV bifurcation',
    clinicalNotes: 'LAO cranial is considered the best overall view for the RCA. The cranial angulation opens up the crux of the heart and separates the PDA from the PLV at the distal RCA bifurcation. This view is critical for assessing distal RCA disease and planning intervention at the crux.',
    expectedFindings: [
      'Crux of the heart well visualized',
      'PDA and PLV clearly separated at bifurcation',
      'Distal RCA course into posterior descending groove',
      'Proximal RCA well shown with minimal overlap',
    ],
    practicePrompt: 'Adjust cranial from 15° to 35°. At what angle are PDA and PLV most separated? When does the mid RCA start to foreshorten?',
    targetSegments: ['prox-rca', 'dist-rca', 'pda', 'plv'],
  },
  {
    id: 'rao-straight',
    name: 'RAO Straight',
    shortName: 'RAO',
    raoLao: -30,
    cranialCaudal: 0,
    targetSystem: 'right',
    description: 'Mid RCA along acute margin. Complements LAO views.',
    angleRange: 'RAO 25-35 / Straight',
    objective: 'Elongate mid RCA along the acute margin',
    clinicalNotes: 'RAO straight shows the mid RCA as it courses along the acute margin of the heart. This view complements the LAO projections by providing a different perspective on mid RCA lesions. The acute marginal branches are well seen. PDA origin may also be visible.',
    expectedFindings: [
      'Mid RCA elongated along acute margin',
      'Acute marginal branch origins visible',
      'PDA origin may be seen',
      'Proximal RCA may foreshorten in this projection',
    ],
    practicePrompt: 'Compare RAO straight with LAO straight. Which view better shows the mid RCA? Which better shows the acute marginal branches?',
    targetSegments: ['mid-rca', 'am', 'pda'],
  },
  {
    id: 'ap-cranial-rca',
    name: 'AP Cranial (RCA)',
    shortName: 'AP Cran',
    raoLao: 0,
    cranialCaudal: 30,
    targetSystem: 'right',
    description: 'Distal RCA bifurcation; PDA origin reliably profiled.',
    angleRange: 'AP / Cranial 25-35',
    objective: 'Assess distal RCA and PDA origin',
    clinicalNotes: 'AP cranial focuses on the distal RCA bifurcation. The PDA origin is visible in the vast majority of patients. This view is useful when the LAO cranial does not adequately separate the distal branches, particularly in patients with large body habitus where LAO angles may be limited.',
    expectedFindings: [
      'Distal RCA bifurcation point visible',
      'PDA origin and proximal course clearly shown',
      'PLV branches may be visible',
      'Mid and proximal RCA foreshortened',
    ],
    practicePrompt: 'This view is similar to AP Cranial for the left system. How does the same projection serve different purposes for right vs left coronary assessment?',
    targetSegments: ['dist-rca', 'pda', 'plv'],
  },
  {
    id: 'ap-straight',
    name: 'AP Straight',
    shortName: 'AP',
    raoLao: 0,
    cranialCaudal: 0,
    targetSystem: 'both',
    description: 'Standard anteroposterior view. Baseline orientation.',
    angleRange: 'AP / Straight',
    objective: 'Establish baseline anatomic orientation',
    clinicalNotes: 'The AP straight view is the standard baseline projection. While not optimal for any specific segment, it provides a familiar anatomic reference point. The LM, proximal LAD, and proximal LCx overlap significantly. It is useful as an initial orientation view and for confirming catheter position.',
    expectedFindings: [
      'Overall coronary anatomy visible but with significant overlap',
      'LM, proximal LAD, and proximal LCx often superimposed',
      'Good for confirming catheter engagement and orientation',
      'Not ideal for detailed segment analysis',
    ],
    practicePrompt: 'From AP straight, add 30° cranial. Then add 25° RAO. Notice how each angulation progressively opens up different segments.',
    targetSegments: ['lm', 'prox-lad', 'prox-lcx', 'prox-rca'],
  },
]

/** Find the nearest preset to given angles */
export function findNearestPreset(
  raoLao: number,
  cranialCaudal: number,
): { preset: PresetView; distance: number } {
  let bestDist = Infinity
  let best: PresetView = VIEW_PRESETS[0]!

  for (const preset of VIEW_PRESETS) {
    const dist = Math.sqrt(
      Math.pow(preset.raoLao - raoLao, 2) +
      Math.pow(preset.cranialCaudal - cranialCaudal, 2)
    )
    if (dist < bestDist) {
      bestDist = dist
      best = preset
    }
  }

  return { preset: best, distance: bestDist }
}
