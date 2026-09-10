import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div>
      <h2 className="text-ink mb-5">Orders</h2>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection
          connection={orders}
          resourcesClassName="flex flex-col gap-4"
        >
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="py-10 text-center border-t border-border">
      {hasFilters ? (
        <>
          <p className="text-ink-soft text-body mb-4">
            No orders found matching your search.
          </p>
          <Link
            to="/account/orders"
            className="text-accent hover:text-accent-hover font-semibold text-small"
          >
            Clear filters →
          </Link>
        </>
      ) : (
        <>
          <p className="text-ink-soft text-body mb-4">
            You haven&rsquo;t placed any orders yet.
          </p>
          <Link
            to="/collections/all"
            className="inline-block bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-body px-6 h-11 leading-[2.75rem] rounded-pill transition-colors"
          >
            Start shopping →
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-6 pb-6 border-b border-border"
      aria-label="Search orders"
    >
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.NAME}
          placeholder="Order #"
          aria-label="Order number"
          defaultValue={currentFilters.name || ''}
          className="w-full px-4 py-2.5 rounded-pill border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
          placeholder="Confirmation #"
          aria-label="Confirmation number"
          defaultValue={currentFilters.confirmationNumber || ''}
          className="w-full px-4 py-2.5 rounded-pill border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSearching}
          className="bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-border disabled:text-ink-soft disabled:cursor-not-allowed text-white font-semibold text-small px-6 h-10 rounded-pill transition-colors"
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
        {hasFilters && (
          <button
            type="button"
            disabled={isSearching}
            onClick={() => {
              setSearchParams(new URLSearchParams());
              formRef.current?.reset();
            }}
            className="text-small font-semibold text-ink-soft hover:text-ink transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderUrl = `/account/orders/${btoa(order.id)}`;
  return (
    <div className="card p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Link
          to={orderUrl}
          className="font-semibold text-body text-ink hover:text-accent transition-colors"
        >
          #{order.number}
        </Link>
        <p className="text-small text-ink-soft mt-1">
          {new Date(order.processedAt).toDateString()}
        </p>
        {order.confirmationNumber ? (
          <p className="text-small text-ink-soft">
            Confirmation: {order.confirmationNumber}
          </p>
        ) : null}
        <p className="text-small text-ink-soft">
          {order.financialStatus}
          {fulfillmentStatus ? ` · ${fulfillmentStatus}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Money data={order.totalPrice} className="font-semibold text-ink" />
        <Link
          to={orderUrl}
          className="text-accent hover:text-accent-hover font-semibold text-small whitespace-nowrap"
        >
          View order →
        </Link>
      </div>
    </div>
  );
}
