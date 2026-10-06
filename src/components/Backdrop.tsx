/* The scene the glass floats over: crimson fading to pearl white,
   with a white pearl on the red side and a red sphere on the white side.
   The spheres are what the frosted panels blur, which gives them their colour. */
export default function Backdrop() {
  return (
    <div className="scene" aria-hidden>
      <span className="scene__ring scene__ring--a" />
      <span className="scene__ring scene__ring--b" />
      <span className="orb orb--red" />
      <span className="orb orb--gold" />
      <span className="orb orb--pearl" />
      <span className="orb orb--pink" />
    </div>
  )
}
