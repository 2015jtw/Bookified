import BookCard from '@/components/BookCard';
import LibraryHero from '@/components/ui/LibraryHero';
import { sampleBooks } from '@/lib/constant';

export default function Home() {
  return (
    <div className="container wrapper">
      <LibraryHero />

      <div className="library-books-grid mt-10 md:mt-16">
        {sampleBooks.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </div>
  );
}
