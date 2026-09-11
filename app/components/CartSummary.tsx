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
  const total = cart?.cost?.totalAmount;
  const hasSavings = Boolean(
    subtotal?.amount &&
      total?.amount &&
      Number(total.amount) < Number(subtotal.amount),
  );

  return (
    <div
      aria-labelledby={summaryId}
      className="flex flex-col gap-3 border-t border-border p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
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
        <dl role="group" className="flex items-center justify-between -mt-2">
          <dt className="text-body text-ink-soft">Total</dt>
          <dd className="text-h3 font-semibold text-badge-sale">
            <Money data={total} />
          </dd>
        </dl>
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
      <CartCheckoutActions cart={cart} />
    </div>
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
        <div className="flex gap-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
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
        <div className="flex gap-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
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
