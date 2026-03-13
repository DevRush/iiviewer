import type { DominanceType } from '@/types/angles'

interface DominanceToggleProps {
  value: DominanceType
  onChange: (v: DominanceType) => void
}

const options: { value: DominanceType; label: string }[] = [
  { value: 'right', label: 'R-Dom' },
  { value: 'left', label: 'L-Dom' },
  { value: 'codominant', label: 'Co-Dom' },
]

export function DominanceToggle({ value, onChange }: DominanceToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Dominance</span>
      <div className="flex bg-gray-800 rounded-lg p-0.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              value === opt.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
