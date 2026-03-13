interface AngleDisplayProps {
  raoLao: number
  cranialCaudal: number
}

export function AngleDisplay({ raoLao, cranialCaudal }: AngleDisplayProps) {
  const oblique = raoLao === 0
    ? 'AP'
    : raoLao < 0
      ? `RAO ${Math.abs(Math.round(raoLao))}°`
      : `LAO ${Math.round(raoLao)}°`

  const tilt = cranialCaudal === 0
    ? 'Straight'
    : cranialCaudal < 0
      ? `Caudal ${Math.abs(Math.round(cranialCaudal))}°`
      : `Cranial ${Math.round(cranialCaudal)}°`

  return (
    <div className="text-center">
      <span className="font-mono text-lg font-semibold text-white">
        {oblique}
      </span>
      <span className="text-gray-500 mx-2">/</span>
      <span className="font-mono text-lg font-semibold text-white">
        {tilt}
      </span>
    </div>
  )
}
