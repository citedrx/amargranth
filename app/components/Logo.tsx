import logoUrl from '~/assets/logo.svg';

/**
 * The real sun mascot icon-only mark, provided directly by ASM.
 * Per DESIGN_SYSTEM.md Section 9: this is the "icon-only" lockup — the
 * "Amar Granth" wordmark stays live text next to it (see Header.tsx/
 * Footer.tsx) rather than being baked into the graphic, so it keeps
 * inheriting the site's real --font-heading (Domine).
 */
export function Logo({className}: {className?: string}) {
  return <img src={logoUrl} alt="Amar Granth" className={className} />;
}
