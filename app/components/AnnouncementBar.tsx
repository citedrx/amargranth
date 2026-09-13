import {useEffect, useState} from 'react';
import {Link} from 'react-router';

/**
 * Sticky, high-contrast Ganpati sale announcement bar. Sits above the
 * Header inside PageLayout's shared sticky wrapper (not sticky on its own),
 * so it scrolls away together with the header as one unit. Date-gated
 * server-side (see root.tsx's promoActive) off the same real
 * custom.promo_label/promo_end_date metafields the PDP's own event banner
 * reads — it silently stops appearing after the real end date with no
 * further code changes needed.
 */

const STORAGE_KEY = 'ag_announcement_dismissed_at';
const DAYS_LEFT_URGENCY_THRESHOLD = 10;

export function AnnouncementBar({
  label,
  endDate,
  daysLeft,
}: {
  label: string;
  endDate: string;
  daysLeft: number | null;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === '1') {
        setDismissed(true);
      }
    } catch {
      // sessionStorage unavailable (private mode, blocked) — bar just stays
      // visible for this visitor; dismissing simply won't persist.
    }
  }, []);

  if (dismissed) return null;

  const formattedDate = new Date(endDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const showDaysLeft =
    daysLeft !== null && daysLeft <= DAYS_LEFT_URGENCY_THRESHOLD;

  return (
    <div className="bg-badge-sale text-white">
      <div className="relative flex items-center justify-center px-11 py-2 text-center">
        <Link
          to="/collections/all"
          className="text-micro sm:text-small font-semibold text-white no-underline hover:no-underline hover:text-white/90 transition-colors"
        >
          🪔 {label} — up to 30% off, ends{' '}
          <span className="font-extrabold underline decoration-2 underline-offset-2">
            {formattedDate}
          </span>
          {showDaysLeft ? (
            <span className="font-extrabold">
              {' '}
              ({daysLeft} day{daysLeft === 1 ? '' : 's'} left!)
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            setDismissed(true);
            try {
              window.sessionStorage.setItem(STORAGE_KEY, '1');
            } catch {
              // sessionStorage unavailable — dismiss still works for this
              // render, it just won't stay dismissed on the next page load.
            }
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 min-w-11 min-h-11 flex items-center justify-center text-white/85 hover:text-white transition-colors text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
