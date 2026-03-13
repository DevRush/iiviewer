import { useMemo } from 'react'
import { findNearestPreset } from '@/data/presets'

interface TeachingPanelProps {
  raoLao: number
  cranialCaudal: number
}

const SEGMENT_DISPLAY: Record<string, { name: string; color: string }> = {
  'lm': { name: 'LM', color: '#FFD700' },
  'prox-lad': { name: 'pLAD', color: '#FF4444' },
  'mid-lad': { name: 'mLAD', color: '#FF4444' },
  'dist-lad': { name: 'dLAD', color: '#FF4444' },
  'd1': { name: 'D1', color: '#FF8844' },
  'd2': { name: 'D2', color: '#FFAA44' },
  'sep1': { name: 'Sep', color: '#FF6666' },
  'prox-lcx': { name: 'pLCx', color: '#44AAFF' },
  'dist-lcx': { name: 'dLCx', color: '#44AAFF' },
  'om1': { name: 'OM1', color: '#6688FF' },
  'om2': { name: 'OM2', color: '#8888FF' },
  'prox-rca': { name: 'pRCA', color: '#44CC44' },
  'mid-rca': { name: 'mRCA', color: '#44CC44' },
  'dist-rca': { name: 'dRCA', color: '#44CC44' },
  'pda': { name: 'PDA', color: '#66DD66' },
  'plv': { name: 'PLV', color: '#88EE88' },
  'am': { name: 'AM', color: '#44BB44' },
}

export function TeachingPanel({ raoLao, cranialCaudal }: TeachingPanelProps) {
  const { preset, distance } = useMemo(
    () => findNearestPreset(raoLao, cranialCaudal),
    [raoLao, cranialCaudal],
  )

  const isCustom = distance > 15

  return (
    <div className="h-full overflow-y-auto bg-gray-900/80 border-l border-gray-800/50 p-4 flex flex-col gap-4 text-sm">
      {/* View name */}
      <div>
        <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">
          {isCustom ? 'Custom View' : 'Current Target'}
        </p>
        <h3 className="text-lg font-bold text-white">
          {isCustom ? 'Custom View' : preset.name}
        </h3>
        {!isCustom && (
          <p className="text-xs text-gray-500 mt-0.5">{preset.angleRange}</p>
        )}
      </div>

      {/* Objective */}
      <div>
        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          Objective
        </h4>
        <p className="text-gray-300">
          {isCustom
            ? 'Explore vessel overlap and elongation at a non-standard projection.'
            : preset.objective}
        </p>
      </div>

      {/* Clinical Notes */}
      <div>
        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          Clinical Notes
        </h4>
        <p className="text-gray-400 leading-relaxed">
          {isCustom
            ? 'This view is not a standard dictionary preset. Adjust angles to explore how vessel visualization changes.'
            : preset.clinicalNotes}
        </p>
      </div>

      {/* Expected Findings */}
      <div>
        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          Expected Findings
        </h4>
        <ul className="space-y-1.5">
          {(isCustom
            ? ['Adjust angles toward a standard preset for specific findings.']
            : preset.expectedFindings
          ).map((finding, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300">
              <span className="text-emerald-400 mt-0.5 shrink-0">&#x2022;</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Target Segments */}
      {!isCustom && (
        <div>
          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            Best Segments
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {preset.targetSegments.map(segId => {
              const seg = SEGMENT_DISPLAY[segId]
              if (!seg) return null
              return (
                <span
                  key={segId}
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: seg.color + '20',
                    color: seg.color,
                    border: `1px solid ${seg.color}40`,
                  }}
                >
                  {seg.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Practice Prompt */}
      <div className="mt-auto pt-4 border-t border-gray-800/50">
        <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
          Practice Prompt
        </h4>
        <p className="text-gray-300 italic">
          {isCustom
            ? 'Adjust ±5° in both axes. Observe which segments overlap and which elongate.'
            : preset.practicePrompt}
        </p>
      </div>
    </div>
  )
}
