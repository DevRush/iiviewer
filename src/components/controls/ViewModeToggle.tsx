import type { ViewMode } from '@/types/angles'

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (v: ViewMode) => void
  invertLut: boolean
  onToggleInvert: () => void
  realism: boolean
  onToggleRealism: () => void
}

export function ViewModeToggle({
  value,
  onChange,
  invertLut,
  onToggleInvert,
  realism,
  onToggleRealism,
}: ViewModeToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">2D Mode</span>
      <div className="flex gap-1">
        <div className="flex bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => onChange('fluoroscopy')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              value === 'fluoroscopy'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Fluoro
          </button>
          <button
            onClick={() => onChange('schematic')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              value === 'schematic'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Schematic
          </button>
        </div>

        {value === 'fluoroscopy' && (
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={onToggleInvert}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                invertLut
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="LUT Inversion (black/white swap)"
            >
              INV
            </button>
            <button
              onClick={onToggleRealism}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                realism
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Cine Realism (noise, scanlines, jitter)"
            >
              CINE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
