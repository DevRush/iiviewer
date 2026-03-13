interface MonitorOverlayProps {
  raoLao: number
  cranialCaudal: number
}

function formatOblique(v: number): string {
  if (Math.abs(v) < 1) return 'AP'
  return v < 0 ? `RAO ${Math.abs(Math.round(v))}` : `LAO ${Math.round(v)}`
}

function formatTilt(v: number): string {
  if (Math.abs(v) < 1) return 'Straight'
  return v < 0 ? `CAUD ${Math.abs(Math.round(v))}` : `CRAN ${Math.round(v)}`
}

export function MonitorOverlay({ raoLao, cranialCaudal }: MonitorOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-3 flex flex-col justify-end font-mono">
      <div className="text-center text-white font-bold text-sm tracking-widest">
        {formatOblique(raoLao)} / {formatTilt(cranialCaudal)}
      </div>
    </div>
  )
}
