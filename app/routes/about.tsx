import ourStoryImg from '~/assets/illustration-our-story.png';
import whatWeMakeImg from '~/assets/illustration-what-we-make.png';
import type {Route} from './+types/about';
import {canonicalLink} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Our Story | Amar Granth'},
    {
      name: 'description',
      content:
        'Amar Granth brings Indian mythology and heritage to young readers through beautifully illustrated storybooks.',
    },
    canonicalLink('/about'),
  ];
};

const MOTIF_ICONS = ['🪔', '🪷', '🪶'];

export default function About() {
  return (
    <div className="bg-base">
      <section className="px-5 md:px-12 lg:px-16 py-14 md:py-20 max-w-3xl mx-auto text-center">
        <p className="text-accent font-semibold text-body tracking-wide mb-3">
          Our Story
        </p>
        <h1 className="text-ink mb-6">
          Timeless stories, told with heart
        </h1>
        <p className="text-ink-soft text-base md:text-lg leading-relaxed">
          Amar Granth was born from a simple idea: that Indian mythology and
          heritage deserve the same beautiful, thoughtful storytelling that
          children find in any great picture book.
        </p>
      </section>

      <div className="flex items-center justify-center gap-6 py-2">
        {MOTIF_ICONS.map((icon, i) => (
          <span key={i} className="text-amber text-lg opacity-80">
            {icon}
          </span>
        ))}
      </div>

      <section className="px-5 md:px-12 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="bg-tint-powder rounded-card aspect-[4/3] overflow-hidden">
          <img
            src={ourStoryImg}
            alt="An open storybook with illustrated Hindu temple towers rising from its pages"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-ink mb-4">
            Why we do this
          </h2>
          <p className="text-ink-soft leading-relaxed mb-4">
            For millions of parents raising children away from the temples,
            rivers, and stories they grew up with, passing on that heritage
            can feel like a puzzle with missing pieces. We wanted to make it
            easier — and more beautiful.
          </p>
          <p className="text-ink-soft leading-relaxed">
            Every Amar Granth title is illustrated, researched, and written
            to make ancient stories feel alive for the next generation —
            without losing what makes them sacred.
          </p>
        </div>
      </section>

      <section className="px-5 md:px-12 lg:px-16 py-14 md:py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-ink mb-4">
            What we make
          </h2>
          <p className="text-ink-soft leading-relaxed mb-4">
            Our books cover the 12 Jyotirlings, the 51 Shaktipeeths, the
            sacred rivers of Bharat, the legend of Lord Parashurama, and the
            story of the rudraksha — each one written for curious young
            minds and illustrated to be pored over again and again.
          </p>
          <p className="text-ink-soft leading-relaxed">
            We&rsquo;re a small team building this catalog title by title, with a
            lot of care for both the history and the child holding the book.
          </p>
        </div>
        <div className="bg-tint-sage rounded-card aspect-[4/3] overflow-hidden order-1 md:order-2">
          <img
            src={whatWeMakeImg}
            alt="An illustrated Hindu temple complex in a storybook, symbolizing Amar Granth's catalog of heritage titles"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="bg-tint-sand">
        <div className="px-5 md:px-12 lg:px-16 py-12 md:py-16 max-w-3xl mx-auto text-center">
          <h2 className="text-ink mb-3">
            Have a question, or just want to say hello?
          </h2>
          <p className="text-ink-soft text-sm mb-6">
            We&rsquo;d love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-sm px-7 py-3 rounded-pill transition-colors"
          >
            Get in touch
          </a>
        </div>
      </section>
    </div>
  );
}
