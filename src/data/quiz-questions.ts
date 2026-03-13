import type { QuizQuestion } from '@/types/quiz'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ═══════════════════════════════════════════
  // IDENTIFY VIEW (multiple choice)
  // ═══════════════════════════════════════════
  {
    id: 'iv-1',
    type: 'identify-view',
    prompt: 'Which standard projection is known as the "Spider View"?',
    options: ['RAO Caudal', 'LAO Caudal', 'AP Cranial', 'LAO Cranial'],
    answer: 'LAO Caudal',
    explanation: 'The Spider View is LAO 45° / Caudal 30°. It\'s named for the spider-like branching pattern of the left coronary system when maximally opened at the LM bifurcation.',
  },
  {
    id: 'iv-2',
    type: 'identify-view',
    prompt: 'What is the ideal working view for LAD PCI?',
    options: ['RAO Caudal', 'Spider View', 'AP Cranial', 'LAO Straight'],
    answer: 'AP Cranial',
    explanation: 'AP Cranial (0° / Cranial 35°) elongates the LAD along the interventricular groove and separates diagonal branches. It is the standard working view for LAD interventions.',
  },
  {
    id: 'iv-3',
    type: 'identify-view',
    prompt: 'Which view best opens the left main bifurcation?',
    options: ['AP Straight', 'RAO Cranial', 'Spider View', 'LAO Straight'],
    answer: 'Spider View',
    explanation: 'The Spider View (LAO Caudal) maximally opens the LM bifurcation, separating LAD, LCx, and ramus intermedius (if present).',
  },
  {
    id: 'iv-4',
    type: 'identify-view',
    prompt: 'Which projection provides the best overall view of the RCA?',
    options: ['RAO Straight', 'AP Cranial', 'LAO Cranial', 'LAO Caudal'],
    answer: 'LAO Cranial',
    explanation: 'LAO Cranial (LAO 25° / Cranial 25°) is the best overall RCA view. The cranial angulation opens the crux and separates the PDA from the PLV.',
  },
  {
    id: 'iv-5',
    type: 'identify-view',
    prompt: 'In RAO Caudal projection, which coronary system is best visualized?',
    options: ['RCA system', 'LCx system', 'LAD system only', 'Both equally'],
    answer: 'LCx system',
    explanation: 'RAO Caudal (RAO 25° / Caudal 25°) provides the best overall view of the LCx as it courses in the AV groove, including OM1 and OM2 branch origins.',
  },

  // ═══════════════════════════════════════════
  // IDENTIFY VESSEL (multiple choice)
  // ═══════════════════════════════════════════
  {
    id: 'ives-1',
    type: 'identify-vessel',
    prompt: 'In the Spider View, which structure is best profiled?',
    options: ['Mid LAD', 'Left main bifurcation', 'Distal RCA', 'PDA'],
    answer: 'Left main bifurcation',
    explanation: 'The Spider View maximally opens the LM bifurcation. While proximal LAD and LCx are visible, the primary purpose is to assess the LM trifurcation/bifurcation geometry.',
  },
  {
    id: 'ives-2',
    type: 'identify-vessel',
    prompt: 'Which vessel is elongated in AP Cranial projection?',
    options: ['LCx', 'LAD', 'RCA', 'Left main'],
    answer: 'LAD',
    explanation: 'AP Cranial elongates the LAD as it courses down the anterior interventricular groove. The cranial angulation minimizes foreshortening of the LAD.',
  },
  {
    id: 'ives-3',
    type: 'identify-vessel',
    prompt: 'In LAO Cranial, which RCA segment is best seen?',
    options: ['Proximal RCA only', 'Mid RCA', 'Distal RCA / PDA / PLV', 'Acute marginal'],
    answer: 'Distal RCA / PDA / PLV',
    explanation: 'LAO Cranial opens the crux of the heart, clearly showing the distal RCA bifurcation into PDA and PLV branches.',
  },
  {
    id: 'ives-4',
    type: 'identify-vessel',
    prompt: 'Which vessel\'s C-shaped course is best demonstrated in LAO Straight?',
    options: ['LAD', 'LCx', 'RCA', 'PDA'],
    answer: 'RCA',
    explanation: 'LAO Straight shows the RCA in its characteristic C-shaped course along the right AV groove. The proximal and mid segments are well profiled.',
  },
  {
    id: 'ives-5',
    type: 'identify-vessel',
    prompt: 'RAO Caudal best demonstrates which branch origins?',
    options: ['Diagonal branches', 'Septal perforators', 'Obtuse marginal branches', 'Acute marginal branches'],
    answer: 'Obtuse marginal branches',
    explanation: 'RAO Caudal provides the best view of the LCx system, including OM1 and OM2 branch origins as the LCx courses in the AV groove.',
  },

  // ═══════════════════════════════════════════
  // ANGLE TARGET (interactive dial)
  // ═══════════════════════════════════════════
  {
    id: 'at-1',
    type: 'angle-target',
    prompt: 'Dial the Spider View — LAO 45° / Caudal 30°',
    targetAngles: { raoLao: 45, cranialCaudal: -30, tolerance: 5 },
    explanation: 'The Spider View is LAO 45° / Caudal 30°. It maximally opens the LM bifurcation.',
  },
  {
    id: 'at-2',
    type: 'angle-target',
    prompt: 'Dial AP Cranial — AP / Cranial 35°',
    targetAngles: { raoLao: 0, cranialCaudal: 35, tolerance: 5 },
    explanation: 'AP Cranial (0° / Cranial 35°) is the workhorse LAD view. Zero oblique angulation with steep cranial tilt.',
  },
  {
    id: 'at-3',
    type: 'angle-target',
    prompt: 'Dial RAO Caudal — RAO 25° / Caudal 25°',
    targetAngles: { raoLao: -25, cranialCaudal: -25, tolerance: 5 },
    explanation: 'RAO Caudal (RAO 25° / Caudal 25°) opens the LM bifurcation and provides the best LCx view.',
  },
  {
    id: 'at-4',
    type: 'angle-target',
    prompt: 'Dial LAO Straight — LAO 45° / Straight',
    targetAngles: { raoLao: 45, cranialCaudal: 0, tolerance: 5 },
    explanation: 'LAO Straight (LAO 45° / 0°) shows the RCA C-curve along the right AV groove.',
  },
  {
    id: 'at-5',
    type: 'angle-target',
    prompt: 'Dial the best overall RCA view — LAO 25° / Cranial 25°',
    targetAngles: { raoLao: 25, cranialCaudal: 25, tolerance: 5 },
    explanation: 'LAO Cranial (LAO 25° / Cranial 25°) is the best overall RCA view, opening the crux and PDA/PLV bifurcation.',
  },
]
