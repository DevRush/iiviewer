export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <directionalLight position={[0, -5, 5]} intensity={0.3} />
      <hemisphereLight args={['#b1e1ff', '#666666', 0.4]} />
    </>
  )
}
