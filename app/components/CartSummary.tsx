import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {useAside} from '~/components/Aside';
import {markCheckoutStarted} from '~/lib/exitBannerConfig';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  const subtotal = cart?.cost?.subtotalAmount;
  // `cart.cost.totalAmount` doesn't reflect an applied order-level discount
  // code until Shopify's own checkout recalculates it — confirmed against
  // the live site (the code applies correctly at checkout, but the cart
  // drawer's cost fields never update).
  //
  // An earlier fix tried summing each line's own `discountAllocations`
  // instead, on the (wrong) assumption that it includes order-level
  // allocations by default — it never did in this project's actual
  // Storefront API schema version, which is why an applied EXTRA10 still
  // showed no discount. `CartLine.discountAllocations` only ever covers
  // discounts scoped to that specific line; a cart-wide code like EXTRA10
  // lives on `cart.discountAllocations` instead (see fragments.ts). Sum
  // both sources — cart-level covers order/automatic-wide discounts,
  // line-level covers per-product discounts — so this stays correct
  // regardless of what kind of discount ASM sets up in Admin later.
  const discountTotal =
    (cart?.discountAllocations ?? []).reduce(
      (sum, allocation) =>
        sum + Number(allocation.discountedAmount?.amount || 0),
      0,
    ) +
    (cart?.lines?.nodes ?? []).reduce((sum, line) => {
      const lineDiscount = (line?.discountAllocations ?? []).reduce(
        (lineSum, allocation) =>
          lineSum + Number(allocation.discountedAmount?.amount || 0),
        0,
      );
      return sum + lineDiscount;
    }, 0);
  const hasSavings = Boolean(subtotal?.amount) && discountTotal > 0;
  const total =
    hasSavings && subtotal
      ? {
          amount: String(Number(subtotal.amount) - discountTotal),
          currencyCode: subtotal.currencyCode,
        }
      : cart?.cost?.totalAmount;
  const appliedCodes = (cart?.discountCodes ?? [])
    .filter((discount) => discount.applicable)
    .map(({code}) => code);

  return (
    <>
      <div
        aria-labelledby={summaryId}
        className={`flex flex-col gap-3 border-t border-border p-6 ${
          layout === 'aside'
            ? 'pb-4'
            : 'pb-[max(1.5rem,env(safe-area-inset-bottom))]'
        }`}
      >
        <dl role="group" className="flex items-center justify-between">
          <dt className="text-body text-ink-soft">Subtotal</dt>
          <dd
            className={`text-h3 font-semibold ${hasSavings ? 'text-ink-soft line-through' : 'text-ink'}`}
          >
            {subtotal?.amount ? <Money data={subtotal} /> : '-'}
          </dd>
        </dl>
        {hasSavings && total ? (
          <div className="-mt-2">
            <dl role="group" className="flex items-center justify-between">
              <dt className="text-body text-ink-soft">Total</dt>
              <dd className="text-h3 font-semibold text-badge-sale">
                <Money data={total} />
              </dd>
            </dl>
            <p className="text-micro font-semibold text-badge-sale text-right mt-0.5">
              You&rsquo;re saving{' '}
              <Money
                data={{
                  amount: String(discountTotal),
                  currencyCode: subtotal?.currencyCode || 'INR',
                }}
                as="span"
              />
              {appliedCodes.length ? ` with ${appliedCodes.join(', ')}` : ''}
            </p>
          </div>
        ) : null}
        <CartDiscounts
          discountCodes={cart?.discountCodes}
          discountsHeadingId={discountsHeadingId}
          discountCodeInputId={discountCodeInputId}
        />
        <CartGiftCard
          giftCardCodes={cart?.appliedGiftCards}
          giftCardHeadingId={giftCardHeadingId}
          giftCardInputId={giftCardInputId}
        />
      </div>
      {
        // Pinned to the bottom of the scroll container (the drawer's own
        // scrollable area on `aside`, the whole page viewport on `page`)
        // so Checkout is always visible without scrolling. `position:
        // sticky` deliberately, not a fixed-height flex split, so a short
        // cart doesn't reintroduce the dead-gap-above-the-footer bug this
        // codebase already hit once — sticky sits in its normal flow
        // position when content is short, and only pins once content
        // actually scrolls.
        //
        // On the standalone page this is a genuine sibling of this div
        // inside CartMain's own bounded, max-width section — CSS sticky
        // only pins while its containing block is still in the scrollport,
        // so once a visitor scrolls far enough to reach the site's real
        // Footer (rendered after CartMain in PageLayout.tsx), this button
        // naturally releases and scrolls away with the rest of the cart
        // content instead of ever floating on top of the footer's nav/
        // policy links. z-10 keeps it above ordinary page content while
        // staying below the sitewide sticky announcement bar/header
        // (z-20) and the drawer's own elevated stacking context (z-40),
        // in the unlikely event both are visible on a very short viewport.
      }
      <div
        className={`sticky bottom-0 z-10 bg-base border-t border-border px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]`}
      >
        <CartCheckoutActions cart={cart} />
      </div>
    </>
  );
}

function CartCheckoutActions({cart}: {cart: CartSummaryProps['cart']}) {
  const checkoutUrl = cart?.checkoutUrl;
  const {close} = useAside();
  const [redirecting, setRedirecting] = useState(false);
  if (!checkoutUrl) return null;

  return (
    <a
      href={checkoutUrl}
      target="_self"
      aria-disabled={redirecting}
      onClick={(event) => {
        if (redirecting) {
          event.preventDefault();
          return;
        }
        // Checkout is a real, full-page navigation to Shopify's own
        // hosted checkout — a separate service this app doesn't control.
        // Closing the drawer and showing a deliberate "Redirecting…"
        // state gives visitors a clean, branded handoff instead of
        // whatever raw transition the browser would otherwise show.
        setRedirecting(true);
        close();
        markCheckoutStarted();
        window.fbq?.('track', 'InitiateCheckout', {
          value: Number(cart?.cost?.subtotalAmount?.amount) || undefined,
          currency: cart?.cost?.subtotalAmount?.currencyCode || 'INR',
          num_items: cart?.totalQuantity,
        });
        window.gtag?.('event', 'begin_checkout', {
          value: Number(cart?.cost?.subtotalAmount?.amount) || undefined,
          currency: cart?.cost?.subtotalAmount?.currencyCode || 'INR',
        });
      }}
      className={`flex items-center justify-center w-full bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-body h-[52px] rounded-pill no-underline hover:no-underline transition-colors ${redirecting ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {redirecting ? 'Redirecting to checkout…' : 'Checkout'}
    </a>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts">
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId} className="sr-only">
            Discounts
          </dt>
          <UpdateDiscountForm>
            <div
              className="flex items-center justify-between bg-tint-sage rounded-pill pl-4 pr-2 py-2"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code className="text-micro font-semibold text-ink">
                {codes?.join(', ')}
              </code>
              <button
                type="submit"
                aria-label="Remove discount"
                className="min-h-11 flex items-center px-2 text-micro text-ink-soft hover:text-ink underline"
              >
                Remove
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <label
          htmlFor={discountCodeInputId}
          className="block text-small font-semibold text-ink mb-1.5"
        >
          Have a promo code?
        </label>
        <div className="flex gap-2">
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Enter code"
            className="flex-1 min-w-0 h-11 px-4 rounded-pill border border-border bg-white text-small focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            aria-label="Apply discount code"
            className="h-11 flex items-center rounded-pill border border-border px-4 text-small font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Gift cards">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl className="mb-2 space-y-2">
          <dt id={giftCardHeadingId} className="sr-only">
            Applied Gift Card(s)
          </dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id}>
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el: HTMLButtonElement | null) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code className="text-micro font-semibold text-ink">
                  ***{giftCard.lastCharacters}
                </code>{' '}
                <Money
                  data={giftCard.amountUsed}
                  className="text-micro text-ink-soft"
                />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <label
          htmlFor={giftCardInputId}
          className="block text-small font-semibold text-ink mb-1.5"
        >
          Have a gift card?
        </label>
        <div className="flex gap-2">
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Enter code"
            ref={giftCardCodeInput}
            className="flex-1 min-w-0 h-11 px-4 rounded-pill border border-border bg-white text-small focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Apply gift card code"
            className="h-11 flex items-center rounded-pill border border-border px-4 text-small font-semibold text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      <div className="flex items-center justify-between bg-tint-sage rounded-pill pl-4 pr-2 py-2">
        <span>{children}</span>
        <button
          type="submit"
          aria-label={`Remove gift card ending in ${lastCharacters}`}
          onClick={onRemoveClick}
          ref={buttonRef}
          className="min-h-11 flex items-center px-2 text-micro text-ink-soft hover:text-ink underline"
        >
          Remove
        </button>
      </div>
    </CartForm>
  );
}
