import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  const hasDiscount =
    (discountValue && discountValue.amount) || discountPercentage;

  return (
    <div className="max-w-2xl">
      <h2 className="text-ink mb-1">Order {order.name}</h2>
      <p className="text-small text-ink-soft">
        Placed on {new Date(order.processedAt!).toDateString()}
      </p>
      {order.confirmationNumber ? (
        <p className="text-small text-ink-soft">
          Confirmation: {order.confirmationNumber}
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-border border-t border-border">
        {lineItems.map((lineItem, lineItemIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2 max-w-xs ml-auto">
        {hasDiscount ? (
          <div className="flex items-center justify-between text-body text-ink-soft">
            <span>Discount</span>
            {discountPercentage ? (
              <span>-{discountPercentage}% off</span>
            ) : (
              discountValue && <Money data={discountValue} />
            )}
          </div>
        ) : null}
        <div className="flex items-center justify-between text-body text-ink-soft">
          <span>Subtotal</span>
          <Money data={order.subtotal!} />
        </div>
        <div className="flex items-center justify-between text-body text-ink-soft">
          <span>Tax</span>
          <Money data={order.totalTax!} />
        </div>
        <div className="flex items-center justify-between text-h3 font-semibold text-ink pt-2 border-t border-border">
          <span>Total</span>
          <Money data={order.totalPrice!} />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-border grid sm:grid-cols-2 gap-8">
        <div>
          <h3 className="text-ink mb-2">Shipping address</h3>
          {order?.shippingAddress ? (
            <address className="not-italic text-body text-ink-soft leading-relaxed">
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : null}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : null}
            </address>
          ) : (
            <p className="text-body text-ink-soft">
              No shipping address defined
            </p>
          )}
        </div>
        <div>
          <h3 className="text-ink mb-2">Status</h3>
          <p className="text-body text-ink-soft">{fulfillmentStatus}</p>
        </div>
      </div>

      <a
        target="_blank"
        href={order.statusPageUrl}
        rel="noreferrer"
        className="inline-block mt-8 text-accent hover:text-accent-hover font-semibold text-small"
      >
        View order status →
      </a>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <li className="py-4 flex items-center gap-4">
      {lineItem?.image ? (
        <div className="bg-tint-sand rounded-card overflow-hidden shrink-0">
          <Image
            data={lineItem.image}
            width={64}
            height={64}
            className="w-16 h-16 object-cover"
          />
        </div>
      ) : null}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-body text-ink">{lineItem.title}</p>
        {lineItem.variantTitle ? (
          <p className="text-small text-ink-soft">{lineItem.variantTitle}</p>
        ) : null}
        <p className="text-small text-ink-soft mt-1">
          Qty {lineItem.quantity} · <Money data={lineItem.price!} />
        </p>
      </div>
      {lineItem.totalDiscount && Number(lineItem.totalDiscount.amount) > 0 ? (
        <Money
          data={lineItem.totalDiscount}
          className="text-small text-ink-soft whitespace-nowrap"
        />
      ) : null}
    </li>
  );
}
