import type { ArterySegment } from '@/types/anatomy'
import { VESSEL_COLORS } from './colors'

/**
 * Coronary artery 3D control points for RIGHT-DOMINANT anatomy.
 *
 * Coordinate system (patient-centered):
 *   X+ = patient's left
 *   Y+ = superior (cranial / toward head)
 *   Z+ = anterior (toward chest wall / toward viewer in AP)
 *
 * Units: centimeters. Scaled by ANATOMY_SCALE in geometry.ts.
 *
 * The heart is a prolate spheroid tilted ~38° so the apex points
 * left, anterior, and inferior. All control points are defined in
 * the final (tilted) position — no runtime rotation needed.
 *
 * Key anatomical landmarks:
 *   Aortic root: approximately (0, 2.0, 1.0) — superior-anterior-central
 *   Left coronary ostium: (0.5, 1.8, 1.5)
 *   Right coronary ostium: (-0.5, 1.8, 1.5)
 *   LM bifurcation: (1.2, 1.4, 1.8)
 *   Cardiac apex: (2.0, -3.5, 2.0) — left, inferior, anterior
 *   Crux (posterior IV/AV groove junction): (-0.5, -1.5, -2.5)
 *
 * Heart surface reference:
 *   Anterior IV groove: runs from LM bif area down anterior surface to apex
 *   AV groove (ring): roughly horizontal ring separating atria/ventricles
 *   Posterior IV groove: from crux to near apex on inferior surface
 */

export const RIGHT_DOMINANT_SEGMENTS: ArterySegment[] = [
  // ═══════════════════════════════════════════════════════
  // LEFT MAIN
  // ═══════════════════════════════════════════════════════
  {
    id: 'lm',
    name: 'Left Main',
    shortName: 'LM',
    territory: 'LM',
    parentId: null,
    controlPoints: [
      [0.5, 1.8, 1.5],     // LCA ostium (left coronary sinus, aortic root)
      [0.9, 1.6, 1.7],     // Mid LM, coursing leftward
      [1.2, 1.4, 1.8],     // LM bifurcation point
    ],
    startRadius: 1.75,
    endRadius: 1.6,
    color: VESSEL_COLORS.LM,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // ═══════════════════════════════════════════════════════
  // LAD SYSTEM
  // ═══════════════════════════════════════════════════════
  {
    id: 'prox-lad',
    name: 'Proximal LAD',
    shortName: 'pLAD',
    territory: 'LAD',
    parentId: 'lm',
    controlPoints: [
      [1.2, 1.4, 1.8],     // LM bifurcation
      [1.0, 1.0, 2.3],     // Enters anterior IV groove
      [0.8, 0.6, 2.7],     // Courses anteriorly and inferiorly
      [0.6, 0.3, 3.0],     // Mid anterior surface (before 1st diagonal)
    ],
    startRadius: 1.55,
    endRadius: 1.4,
    color: VESSEL_COLORS.LAD,
    dominanceVariants: ['right', 'left', 'codominant'],
  },
  {
    id: 'mid-lad',
    name: 'Mid LAD',
    shortName: 'mLAD',
    territory: 'LAD',
    parentId: 'prox-lad',
    controlPoints: [
      [0.6, 0.3, 3.0],     // After 1st diagonal takeoff
      [0.6, -0.3, 3.2],    // Continuing in anterior IV groove
      [0.8, -0.9, 3.0],    // Curving toward apex, groove curves left
      [1.2, -1.5, 2.8],    // Approaching distal anterior surface
    ],
    startRadius: 1.4,
    endRadius: 1.1,
    color: VESSEL_COLORS.LAD,
    dominanceVariants: ['right', 'left', 'codominant'],
  },
  {
    id: 'dist-lad',
    name: 'Distal LAD',
    shortName: 'dLAD',
    territory: 'LAD',
    parentId: 'mid-lad',
    controlPoints: [
      [1.2, -1.5, 2.8],    // Distal anterior surface
      [1.5, -2.2, 2.5],    // Approaching apex
      [1.8, -2.8, 2.2],    // Near apex
      [2.0, -3.2, 1.8],    // Wrapping around apex
    ],
    startRadius: 1.1,
    endRadius: 0.65,
    color: VESSEL_COLORS.LAD,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // Diagonal 1 — branches leftward from proximal LAD
  {
    id: 'd1',
    name: 'First Diagonal',
    shortName: 'D1',
    territory: 'LAD',
    parentId: 'prox-lad',
    controlPoints: [
      [0.6, 0.3, 3.0],     // Takeoff from prox/mid LAD junction
      [1.4, 0.0, 2.8],     // Courses leftward over anterolateral wall
      [2.2, -0.2, 2.4],    // Continues laterally
      [2.8, -0.8, 2.0],    // Distal diagonal on lateral wall
    ],
    startRadius: 0.9,
    endRadius: 0.5,
    color: VESSEL_COLORS.D1,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // Diagonal 2 — branches leftward from mid LAD
  {
    id: 'd2',
    name: 'Second Diagonal',
    shortName: 'D2',
    territory: 'LAD',
    parentId: 'mid-lad',
    controlPoints: [
      [0.8, -0.9, 3.0],    // Takeoff from mid LAD
      [1.6, -1.0, 2.6],    // Courses leftward
      [2.3, -1.5, 2.2],    // Distal
    ],
    startRadius: 0.7,
    endRadius: 0.4,
    color: VESSEL_COLORS.D2,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // Septal perforator 1 — dives into septum from proximal LAD
  {
    id: 'sep1',
    name: 'First Septal',
    shortName: 'S1',
    territory: 'LAD',
    parentId: 'prox-lad',
    controlPoints: [
      [0.8, 0.6, 2.7],     // Takeoff from proximal LAD
      [0.2, 0.4, 2.2],     // Dives rightward into septum
      [-0.2, 0.3, 1.6],    // Deep in septum
    ],
    startRadius: 0.5,
    endRadius: 0.3,
    color: VESSEL_COLORS.SEP,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // ═══════════════════════════════════════════════════════
  // LCx SYSTEM
  // ═══════════════════════════════════════════════════════
  {
    id: 'prox-lcx',
    name: 'Proximal LCx',
    shortName: 'pLCx',
    territory: 'LCx',
    parentId: 'lm',
    controlPoints: [
      [1.2, 1.4, 1.8],     // LM bifurcation
      [1.8, 1.2, 1.1],     // Enters left AV groove, heading left/posterior
      [2.5, 0.9, 0.4],     // Wrapping around left heart border
      [2.8, 0.6, -0.3],    // Continuing posterolaterally
    ],
    startRadius: 1.45,
    endRadius: 1.2,
    color: VESSEL_COLORS.LCx,
    dominanceVariants: ['right', 'left', 'codominant'],
  },
  {
    id: 'dist-lcx',
    name: 'Distal LCx',
    shortName: 'dLCx',
    territory: 'LCx',
    parentId: 'prox-lcx',
    controlPoints: [
      [2.8, 0.6, -0.3],    // After OM1 takeoff
      [2.8, 0.0, -1.0],    // Continuing in AV groove posteriorly
      [2.5, -0.5, -1.5],   // Reaching posterior left border
      [2.0, -0.8, -2.0],   // Terminal (right-dominant: ends here)
    ],
    startRadius: 1.2,
    endRadius: 0.65,
    color: VESSEL_COLORS.LCx,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // Obtuse Marginal 1
  {
    id: 'om1',
    name: 'First Obtuse Marginal',
    shortName: 'OM1',
    territory: 'LCx',
    parentId: 'prox-lcx',
    controlPoints: [
      [2.8, 0.6, -0.3],    // Takeoff from prox/dist LCx junction
      [3.0, 0.0, 0.3],     // Courses over obtuse margin, inferiorly
      [3.0, -0.6, 0.5],    // Down lateral wall
      [2.8, -1.2, 0.4],    // Distal, on inferolateral surface
    ],
    startRadius: 1.0,
    endRadius: 0.5,
    color: VESSEL_COLORS.OM1,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // Obtuse Marginal 2
  {
    id: 'om2',
    name: 'Second Obtuse Marginal',
    shortName: 'OM2',
    territory: 'LCx',
    parentId: 'dist-lcx',
    controlPoints: [
      [2.8, 0.0, -1.0],    // Takeoff from distal LCx
      [3.0, -0.2, -0.5],   // Courses inferolaterally
      [2.8, -1.0, -0.3],   // Distal
    ],
    startRadius: 0.8,
    endRadius: 0.4,
    color: VESSEL_COLORS.OM2,
    dominanceVariants: ['right', 'left', 'codominant'],
  },

  // ═══════════════════════════════════════════════════════
  // RCA SYSTEM
  // ═══════════════════════════════════════════════════════
  {
    id: 'prox-rca',
    name: 'Proximal RCA',
    shortName: 'pRCA',
    territory: 'RCA',
    parentId: null,
    controlPoints: [
      [-0.5, 1.8, 1.5],    // RCA ostium (right coronary sinus, aortic root)
      [-1.2, 1.5, 1.5],    // Courses rightward and anteriorly
      [-2.0, 1.0, 1.2],    // In right AV groove
      [-2.5, 0.5, 0.8],    // Descending along right heart border
    ],
    startRadius: 1.9,
    endRadius: 1.7,
    color: VESSEL_COLORS.RCA,
    dominanceVariants: ['right', 'left', 'codominant'],
  },
  {
    id: 'mid-rca',
    name: 'Mid RCA',
    shortName: 'mRCA',
    territory: 'RCA',
    parentId: 'prox-rca',
    controlPoints: [
      [-2.5, 0.5, 0.8],    // Continuing from prox RCA
      [-2.8, 0.0, 0.3],    // Vertical descent along acute margin
      [-2.8, -0.5, -0.1],  // At acute margin of heart
      [-2.5, -0.7, -0.5],  // Turning posteriorly
      [-2.2, -1.2, -1.0],  // Continuing to posterior AV groove
    ],
    startRadius: 1.7,
    endRadius: 1.4,
    color: VESSEL_COLORS.RCA,
    dominanceVariants: ['right', 'left', 'codominant'],
  },
  {
    id: 'dist-rca',
    name: 'Distal RCA',
    shortName: 'dRCA',
    territory: 'RCA',
    parentId: 'mid-rca',
    controlPoints: [
      [-2.2, -1.2, -1.0],  // Posterior AV groove
      [-1.5, -1.5, -1.8],  // Approaching crux
      [-1.0, -1.5, -2.2],  // Near crux
      [-0.5, -1.5, -2.5],  // At crux (PDA/PLV bifurcation)
    ],
    startRadius: 1.4,
    endRadius: 1.0,
    color: VESSEL_COLORS.RCA,
    dominanceVariants: ['right', 'codominant'],
  },

  // PDA — from crux, courses in posterior IV groove toward apex
  {
    id: 'pda',
    name: 'Posterior Descending Artery',
    shortName: 'PDA',
    territory: 'RCA',
    parentId: 'dist-rca',
    controlPoints: [
      [-0.5, -1.5, -2.5],  // Crux (origin)
      [0.0, -2.0, -2.2],   // Enters posterior IV groove
      [0.5, -2.5, -1.8],   // Mid PDA
      [1.0, -2.8, -1.2],   // Courses toward apex on inferior surface
      [1.5, -3.0, -0.5],   // Approaching apex from below
    ],
    startRadius: 1.0,
    endRadius: 0.5,
    color: VESSEL_COLORS.PDA,
    dominanceVariants: ['right', 'codominant'],
  },

  // PLV — posterolateral branch from distal RCA
  {
    id: 'plv',
    name: 'Posterolateral Branch',
    shortName: 'PLV',
    territory: 'RCA',
    parentId: 'dist-rca',
    controlPoints: [
      [-0.5, -1.5, -2.5],  // Crux (origin, same as PDA)
      [-0.8, -2.0, -2.0],  // Courses along posterior LV wall
      [-1.0, -2.5, -1.5],  // Inferoposterior
      [-0.8, -3.0, -1.0],  // Distal
    ],
    startRadius: 0.8,
    endRadius: 0.4,
    color: VESSEL_COLORS.PLV,
    dominanceVariants: ['right'],
  },

  // Acute Marginal — branches from mid RCA over right ventricle
  {
    id: 'am',
    name: 'Acute Marginal',
    shortName: 'AM',
    territory: 'RCA',
    parentId: 'mid-rca',
    controlPoints: [
      [-2.8, -0.5, -0.1],  // Takeoff from mid RCA at acute margin
      [-2.5, -0.5, 0.8],   // Courses anteriorly over RV
      [-2.0, -1.0, 1.2],   // Distal
    ],
    startRadius: 0.8,
    endRadius: 0.4,
    color: VESSEL_COLORS.AM,
    dominanceVariants: ['right', 'left', 'codominant'],
  },
]
