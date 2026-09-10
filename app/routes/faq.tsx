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
        answer: 'Email us at contact@amarshivmedia.com within 24 hours of delivery to report it.',
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
        answer: 'Our books are recommended for ages 3 and up. They also work well as a read-along for parents to enjoy with their kids — and honestly, grown-ups love them too.',
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
      <section className="px-5 md:px-12 lg:px-16 py-14 md:py-20 max-w-3xl mx-auto">
        <p className="text-accent font-semibold text-body tracking-wide mb-3 text-center">
          Frequently Asked Questions
        </p>
        <h1 className="text-ink mb-6 text-center">
          Questions? We&rsquo;ve got answers
        </h1>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-ink mb-3">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group bg-white border border-border rounded-card px-5 py-4"
                  >
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-3 font-semibold text-sm text-ink">
                      <span>{item.question}</span>
                      <span className="shrink-0 text-ink-soft group-open:rotate-45 transition-transform text-lg leading-none">
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
