import type {Route} from './+types/faq';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'FAQ | Amar Granth'},
    {
      name: 'description',
      content: 'Answers to common questions about Amar Granth books, orders, shipping, and returns.',
    },
  ];
};

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

// NOTE: Shipping, returns, and payment answers below are confirmed by ASM.
// The "recommended age range" answer is still a placeholder — confirm before go-live.
const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Shipping',
    items: [
      {
        question: 'Where do you ship?',
        answer: 'We ship across India.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Orders are usually shipped within 24–48 hours of being placed.',
      },
      {
        question: 'How much does shipping cost?',
        answer: 'Shipping is free across India, with no extra cost added at checkout.',
      },
    ],
  },
  {
    title: 'Returns & exchanges',
    items: [
      {
        question: 'Can I return or exchange a book?',
        answer: 'We accept returns for books that arrive damaged. Report it to us by email within 24 hours of delivery and we’ll take it from there.',
      },
      {
        question: 'What if my book arrives damaged?',
        answer: 'Email us at contact@amargranth.com within 24 hours of delivery to report it.',
      },
    ],
  },
  {
    title: 'Payment',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major payment methods available at checkout.',
      },
    ],
  },
  {
    title: 'About the books',
    items: [
      {
        question: 'What age group are these books for?',
        answer: '[Placeholder — confirm recommended age range per title or series.]',
      },
      {
        question: 'Are the books available in Hindi?',
        answer: 'Some titles are available in Hindi — check the individual product page for language details.',
      },
      {
        question: 'I own the Combo Set — do I need the individual books too?',
        answer: 'No. The 12 Jyotirlings + 51 Shaktipeeths Combo Set includes the full content of both standalone titles, so you already have everything in them.',
      },
    ],
  },
];

export default function Faq() {
  return (
    <div className="bg-base">
      <section className="px-6 md:px-16 py-14 md:py-20 max-w-3xl mx-auto">
        <p className="text-accent font-semibold text-sm tracking-wide mb-3 text-center">
          Frequently Asked Questions
        </p>
        <h1 className="font-display text-3xl md:text-5xl leading-tight text-ink mb-6 text-center">
          Questions? We&rsquo;ve got answers
        </h1>

        <div className="bg-tint-blush border border-border rounded-card px-5 py-4 mb-10">
          <p className="text-ink-soft text-xs leading-relaxed">
            <strong className="text-ink">One answer still needs input:</strong>{' '}
            the recommended age range below is marked with brackets as a
            placeholder — please confirm it before this page goes live.
          </p>
        </div>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg text-ink mb-3">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group bg-white border border-border rounded-card px-5 py-4"
                  >
                    <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-sm text-ink">
                      {item.question}
                      <span className="text-ink-soft group-open:rotate-45 transition-transform text-lg leading-none">
                        +
                      </span>
                    </summary>
                    <p className="text-ink-soft text-sm leading-relaxed mt-3">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-ink-soft text-sm text-center mt-12">
          Still have a question?{' '}
          <a
            href="/contact"
            className="text-accent hover:text-accent-hover underline"
          >
            Contact us
          </a>
        </p>
      </section>
    </div>
  );
}
