/**
 * Shining Star United — Hamren club logo as a fixed background watermark.
 * Uses the actual club badge image (logo.png).
 */
export default function LogoWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <img
        src="/logo.svg"
        alt=""
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '580px',
          height: '580px',
          objectFit: 'contain',
          opacity: 0.08,
          filter: 'grayscale(20%) brightness(1.4)',
        }}
      />
    </div>
  )
}
