import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div className="max-w-md">
      <h2 className="text-ink mb-5">My profile</h2>
      <Form method="PUT" className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-small font-semibold text-ink mb-1.5"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={customer.firstName ?? ''}
            minLength={2}
            className="w-full px-4 py-3 rounded-pill border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-small font-semibold text-ink mb-1.5"
          >
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={customer.lastName ?? ''}
            minLength={2}
            className="w-full px-4 py-3 rounded-pill border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        {action?.error ? (
          <p className="text-small text-ink bg-tint-blush rounded-card px-4 py-3">
            {action.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={state !== 'idle'}
          className="self-start bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-border disabled:text-ink-soft disabled:cursor-not-allowed text-white font-semibold text-body px-8 h-11 rounded-pill transition-colors"
        >
          {state !== 'idle' ? 'Updating…' : 'Update'}
        </button>
      </Form>
    </div>
  );
}
