/**
 * The sun mascot icon-only mark. Recreated as an inline SVG from the
 * square logo ASM shared in chat — this environment has no filesystem
 * access to pasted images, so this is a redrawn approximation (shapes and
 * colors read from the image), not the original file's exact pixels. Swap
 * for the real exported asset if pixel-perfect fidelity matters before
 * go-live.
 *
 * Per DESIGN_SYSTEM.md Section 9: this is the "icon-only" lockup — the
 * "Amar Granth" wordmark stays live text next to it (see Header.tsx/
 * Footer.tsx) rather than being baked into the graphic, so it keeps
 * inheriting the site's real --font-heading (Domine).
 */
const RAY_ANGLES = Array.from({length: 12}, (_, i) => i * 30);

export function Logo({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Amar Granth"
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="22"
        fill="var(--color-accent)"
      />
      {RAY_ANGLES.map((angle) => (
        <rect
          key={angle}
          x="46.5"
          y="8"
          width="7"
          height="17"
          rx="3.5"
          fill="var(--color-tint-sand)"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="21" fill="var(--color-base)" />
      <ellipse
        cx="37"
        cy="55"
        rx="4.5"
        ry="3.5"
        fill="var(--color-logo-cheek)"
      />
      <ellipse
        cx="63"
        cy="55"
        rx="4.5"
        ry="3.5"
        fill="var(--color-logo-cheek)"
      />
      <circle cx="42" cy="47" r="2.6" fill="var(--color-ink)" />
      <circle cx="58" cy="47" r="2.6" fill="var(--color-ink)" />
      <path
        d="M43 55 Q50 61 57 55"
        stroke="var(--color-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
