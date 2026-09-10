import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="bg-base px-5 md:px-12 lg:px-16 py-6 md:py-10 max-w-3xl mx-auto">
      <h1 className="text-ink mb-6">{heading}</h1>
      <AccountMenu />
      <div className="mt-8">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  const linkClassName =
    'text-body font-semibold px-1 pb-3 border-b-2 transition-colors';

  function navLinkClassName({isActive}: {isActive: boolean}) {
    return `${linkClassName} ${
      isActive
        ? 'text-ink border-accent'
        : 'text-ink-soft border-transparent hover:text-ink'
    }`;
  }

  return (
    <nav
      role="navigation"
      className="flex items-center gap-6 border-b border-border overflow-x-auto"
    >
      <NavLink to="/account/orders" className={navLinkClassName}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={navLinkClassName}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={navLinkClassName}>
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form
      method="POST"
      action="/account/logout"
      className="ml-auto pb-3"
    >
      <button
        type="submit"
        className="text-small font-semibold text-ink-soft hover:text-ink transition-colors"
      >
        Sign out
      </button>
    </Form>
  );
}
