import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {useLocation} from 'react-router';
import {useAside} from '~/components/Aside';

/**
 * Exit-intent offer banner (EXTRA10, 10% off, real code live in Shopify).
 *
 * Desktop uses the standard mouseleave-toward-top-of-viewport signal.
 * Mobile has no cursor, so it uses the two signals real exit-intent tools
 * (OptinMonster, Privy) actually ship for touch devices: a fast upward
 * scroll near the top of the page (the "reaching to leave" gesture) and,
 * as a fallback, a longer idle timer. Deliberately NOT using a
 * history.pushState/popstate back-button trap — that requires a second
 * back-press to actually leave, which is a real navigation anti-pattern
 * and a bad first impression for paid (Meta) traffic landing here.
 */

const STORAGE_KEY = 'ag_exit_banner_last_shown_at';
const DISCOUNT_CODE = 'EXTRA10';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ARM_DELAY_MS = 8000;
const MIN_SCROLL_DEPTH_PX = 150;
const SCROLL_UP_VELOCITY_PX_PER_MS = 1.1;
const SCROLL_UP_MIN_DELTA_PX = 60;
const IDLE_FALLBACK_MS = 45000;
const EXCLUDED_PATH_PREFIXES = ['/cart', '/account'];

function hasShownRecently(): boolean {
  try {
    const last = window.localStorage.getItem(STORAGE_KEY);
    if (!last) return false;
    return Date.now() - Number(last) < ONE_DAY_MS;
  } catch {
    return false;
  }
}

function markShown() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable (private mode, blocked) — fall back to
    // showing once per page load only, handled by shownRef in the effect.
  }
}

export function ExitIntentBanner() {
  const location = useLocation();
  const {type: asideType} = useAside();
  const headingId = useId();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const shownRef = useRef(false);
  const maxScrollRef = useRef(0);

  const excluded = EXCLUDED_PATH_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  const triggerBanner = useCallback(() => {
    if (shownRef.current || hasShownRecently()) return;
    shownRef.current = true;
    markShown();
    setVisible(true);
  }, []);

  useEffect(() => {
    if (excluded || asideType !== 'closed' || hasShownRecently()) return;

    let armed = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let lastY = window.scrollY;
    let lastT = Date.now();
    maxScrollRef.current = window.scrollY;

    const armTimer = setTimeout(() => {
      armed = true;
    }, ARM_DELAY_MS);

    function resetIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (armed && maxScrollRef.current >= MIN_SCROLL_DEPTH_PX) {
          triggerBanner();
        }
      }, IDLE_FALLBACK_MS);
    }

    const isFinePointer =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function handleMouseOut(event: MouseEvent) {
      if (!armed) return;
      if (event.clientY > 0) return;
      if (event.relatedTarget) return; // moved to another in-page element
      triggerBanner();
    }

    function handleScroll() {
      const y = window.scrollY;
      maxScrollRef.current = Math.max(maxScrollRef.current, y);
      resetIdleTimer();

      if (armed && maxScrollRef.current >= MIN_SCROLL_DEPTH_PX) {
        const now = Date.now();
        const dt = now - lastT;
        if (dt > 80) {
          const dy = lastY - y; // positive = scrolled upward
          const velocity = dy / dt;
          if (
            dy > SCROLL_UP_MIN_DELTA_PX &&
            velocity > SCROLL_UP_VELOCITY_PX_PER_MS &&
            y < maxScrollRef.current - MIN_SCROLL_DEPTH_PX
          ) {
            triggerBanner();
          }
          lastY = y;
          lastT = now;
        }
      }
    }

    resetIdleTimer();
    window.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('touchstart', resetIdleTimer, {passive: true});
    if (isFinePointer) {
      document.addEventListener('mouseout', handleMouseOut);
    }

    return () => {
      clearTimeout(armTimer);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', resetIdleTimer);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [excluded, asideType, triggerBanner, location.pathname]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') setVisible(false);
      },
      {signal: controller.signal},
    );
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      controller.abort();
    };
  }, [visible]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
    } catch {
      // Clipboard API unavailable — the code is still visible to read/type.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 w-full h-full bg-ink/40 cursor-default"
        onClick={() => setVisible(false)}
      />
      <div className="relative w-full sm:max-w-[420px] bg-base border border-border shadow-xl rounded-t-card sm:rounded-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-pill border border-border text-ink-soft hover:border-accent hover:text-accent transition-colors text-xl leading-none"
        >
          &times;
        </button>
        <p className="text-micro font-semibold uppercase tracking-wide text-badge-sale mb-2">
          Before you go
        </p>
        <h3 id={headingId} className="text-ink mb-2 pr-8">
          Here&rsquo;s an extra 10% off
        </h3>
        <p className="text-ink-soft text-body mb-4">
          Use this code at checkout for 10% off your entire order.
        </p>
        <div className="flex items-center justify-between gap-3 border border-border rounded-pill px-4 py-2 mb-4 bg-tint-sand">
          <span className="font-heading text-body-lg font-bold tracking-wide text-ink">
            {DISCOUNT_CODE}
          </span>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-small font-semibold text-accent hover:text-accent-hover transition-colors px-2 py-2 -my-2"
          >
            {copied ? 'Copied!' : 'Copy code'}
          </button>
        </div>
        <a
          href="/collections/all"
          onClick={() => setVisible(false)}
          className="block text-center w-full bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-body h-[52px] leading-[52px] rounded-pill transition-colors"
        >
          Shop now &amp; save
        </a>
      </div>
    </div>
  );
}
