import BookCard from "@/components/BookCard";
import LibraryHero from "@/components/ui/LibraryHero";
import { getAllBooks } from "@/lib/actions/book.actions";
import { sampleBooks } from "@/lib/constant";

export default async function Home() {
  const bookResults = await getAllBooks();
  const books = bookResults.success ? bookResults.data ?? [] : [];
  return (
    <div className="container wrapper">
      <LibraryHero />

      <div className="library-books-grid mt-10 md:mt-16">
        {books.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}

        {/* {sampleBooks.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))} */}
      </div>
    </div>
  );
}
