import type { AngleState, PresetView } from '@/types/angles'
import { VIEW_PRESETS } from '@/data/presets'

interface PresetButtonsProps {
  currentAngles: AngleState
  onSelectPreset: (preset: PresetView) => void
}

function isActivePreset(preset: PresetView, current: AngleState, threshold = 8): boolean {
  return (
    Math.abs(preset.raoLao - current.raoLao) < threshold &&
    Math.abs(preset.cranialCaudal - current.cranialCaudal) < threshold
  )
}

export function PresetButtons({ currentAngles, onSelectPreset }: PresetButtonsProps) {
  const leftPresets = VIEW_PRESETS.filter(p => p.targetSystem === 'left')
  const rightPresets = VIEW_PRESETS.filter(p => p.targetSystem === 'right')
  const otherPresets = VIEW_PRESETS.filter(p => p.targetSystem === 'both')

  return (
    <div className="flex flex-col gap-2">
      {/* Left System */}
      <div>
        <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Left System</div>
        <div className="flex flex-wrap gap-1">
          {leftPresets.map(p => (
            <PresetButton
              key={p.id}
              preset={p}
              isActive={isActivePreset(p, currentAngles)}
              onClick={() => onSelectPreset(p)}
            />
          ))}
        </div>
      </div>

      {/* Right System */}
      <div>
        <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Right System</div>
        <div className="flex flex-wrap gap-1">
          {rightPresets.map(p => (
            <PresetButton
              key={p.id}
              preset={p}
              isActive={isActivePreset(p, currentAngles)}
              onClick={() => onSelectPreset(p)}
            />
          ))}
        </div>
      </div>

      {/* Other */}
      {otherPresets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {otherPresets.map(p => (
            <PresetButton
              key={p.id}
              preset={p}
              isActive={isActivePreset(p, currentAngles)}
              onClick={() => onSelectPreset(p)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PresetButton({
  preset,
  isActive,
  onClick,
}: {
  preset: PresetView
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={`${preset.description}\n${preset.angleRange}`}
      className={`px-2 py-1 text-[10px] rounded transition-all border ${
        isActive
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/30'
          : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800 hover:border-gray-600'
      }`}
    >
      {preset.shortName}
    </button>
  )
}
