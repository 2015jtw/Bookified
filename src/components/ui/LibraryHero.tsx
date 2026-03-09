import Image from 'next/image';
import Link from 'next/link';

const steps = [
  { number: 1, title: 'Upload PDF', description: 'Add your book file' },
  { number: 2, title: 'AI Processing', description: 'We analyze the content' },
  { number: 3, title: 'Voice Chat', description: 'Discuss with AI' },
];

const LibraryHero = () => {
  return (
    <div className="library-hero-card">
      <div className="library-hero-content">
        {/* Left — text + CTA */}
        <div className="library-hero-text">
          <h1 className="library-hero-title">Your Library</h1>
          <p className="library-hero-description">
            Convert your books into interactive AI conversations. Listen, learn,
            and discuss your favorite reads.
          </p>

          {/* Mobile illustration */}
          <div className="library-hero-illustration">
            <Image
              src="/assets/hero-illustration.png"
              alt="Books and globe illustration"
              width={260}
              height={200}
              className="object-contain"
              priority
            />
          </div>

          <Link href="/books/new" className="library-cta-primary">
            <span className="text-xl">+</span>
            Add new book
          </Link>
        </div>

        {/* Center — illustration (desktop only) */}
        <div className="library-hero-illustration-desktop">
          <Image
            src="/assets/hero-illustration.png"
            alt="Books and globe illustration"
            width={340}
            height={260}
            className="object-contain"
            priority
          />
        </div>

        {/* Right — steps card */}
        <div className="library-steps-card flex flex-col gap-4 min-w-[200px]">
          {steps.map((step) => (
            <div key={step.number} className="library-step-item">
              <span className="library-step-number">{step.number}</span>
              <div>
                <p className="library-step-title">{step.title}</p>
                <p className="library-step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryHero;
