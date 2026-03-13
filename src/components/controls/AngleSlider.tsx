interface AngleSliderProps {
  label: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  leftLabel: string
  rightLabel: string
}

export function AngleSlider({ label, min, max, value, onChange, leftLabel, rightLabel }: AngleSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100
  const centerPercentage = ((0 - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span className="font-mono text-gray-300">{formatAngle(value, leftLabel, rightLabel)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 w-8 text-right shrink-0">{leftLabel}</span>
        <div className="relative w-full h-6 flex items-center">
          {/* Track background */}
          <div className="absolute w-full h-1.5 bg-gray-800 rounded-full" />
          {/* Center tick */}
          <div
            className="absolute w-0.5 h-3 bg-gray-600 rounded-full"
            style={{ left: `${centerPercentage}%`, transform: 'translateX(-50%)' }}
          />
          {/* Active fill */}
          <div
            className="absolute h-1.5 bg-indigo-500/40 rounded-full"
            style={{
              left: `${Math.min(percentage, centerPercentage)}%`,
              width: `${Math.abs(percentage - centerPercentage)}%`,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="relative w-full bg-transparent z-10"
            aria-label={label}
          />
        </div>
        <span className="text-[10px] text-gray-500 w-8 shrink-0">{rightLabel}</span>
      </div>
    </div>
  )
}

function formatAngle(value: number, leftLabel: string, _rightLabel: string): string {
  if (value === 0) return 'AP'
  if (leftLabel === 'RAO') {
    return value < 0 ? `RAO ${Math.abs(value)}°` : `LAO ${value}°`
  }
  return value < 0 ? `Caudal ${Math.abs(value)}°` : `Cranial ${value}°`
}
