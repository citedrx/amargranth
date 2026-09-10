import type {Route} from './+types/contact';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Contact Us | Amar Granth'},
    {
      name: 'description',
      content: 'Get in touch with the Amar Granth team.',
    },
  ];
};

const CONTACT_EMAIL = 'contact@amarshivmedia.com';

export default function Contact() {
  return (
    <div className="bg-base">
      <section className="px-5 md:px-12 lg:px-16 py-14 md:py-20 max-w-2xl mx-auto text-center">
        <p className="text-accent font-semibold text-body tracking-wide mb-3">
          Get in Touch
        </p>
        <h1 className="text-ink mb-6">
          We&rsquo;d love to hear from you
        </h1>
        <p className="text-ink-soft text-base md:text-lg leading-relaxed mb-10">
          Questions about an order, a book, or just want to share how a
          story landed with your little one — write to us and we&rsquo;ll
          get back to you.
        </p>

        <div className="bg-tint-powder rounded-card p-8 md:p-10">
          <p className="text-ink-soft text-sm mb-2">Email us at</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-xl md:text-2xl text-accent hover:text-accent-hover transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <p className="text-ink-soft text-sm mt-8">
          Looking for shipping, returns, or order help?{' '}
          <a
            href="/faq"
            className="text-accent hover:text-accent-hover underline"
          >
            Check our FAQ
          </a>{' '}
          — it might already have your answer.
        </p>
      </section>
    </div>
  );
}
