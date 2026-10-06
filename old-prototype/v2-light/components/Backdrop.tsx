/* Glossy crimson shapes behind the app. Glass surfaces blur over these,
   which is what gives them colour and depth. */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bd-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FCF9FA" />
            <stop offset="1" stopColor="#F1E8EB" />
          </linearGradient>
          <radialGradient id="bd-orb" cx="0.32" cy="0.72" r="0.75">
            <stop offset="0" stopColor="#FF5A82" />
            <stop offset="0.4" stopColor="#D4003F" />
            <stop offset="1" stopColor="#6E0019" />
          </radialGradient>
          <linearGradient id="bd-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF3F6C" />
            <stop offset="0.5" stopColor="#C4002F" />
            <stop offset="1" stopColor="#6E0019" />
          </linearGradient>
          <linearGradient id="bd-rim" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="bd-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#bd-base)" />

        {/* soft blush light */}
        <circle cx="760" cy="420" r="260" fill="#FFD6E1" opacity="0.3" filter="url(#bd-soft)" />
        <circle cx="200" cy="200" r="220" fill="#FFE7C7" opacity="0.35" filter="url(#bd-soft)" />

        {/* top-right glossy orb */}
        <circle cx="1350" cy="-40" r="400" fill="url(#bd-orb)" />
        <circle cx="1350" cy="-40" r="384" fill="none" stroke="url(#bd-rim)" strokeWidth="3" />
        <ellipse cx="1180" cy="170" rx="150" ry="40" fill="#fff" opacity="0.14" transform="rotate(-32 1180 170)" />

        {/* bottom-left glossy ring */}
        <circle cx="40" cy="1000" r="300" fill="none" stroke="url(#bd-ring)" strokeWidth="78" />
        <circle cx="40" cy="1000" r="336" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="420 1700" />
      </svg>
    </div>
  )
}
