import { Document, model, models, Schema } from 'mongoose';
import { IBook } from '@/lib/types';

const BookSchema = new Schema<IBook>({
  _id: { type: String, required: true, unique: true },
  clerkId: { type: String, required: true },
  title: { type: String, required: true },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  author: { type: String, required: true },
  persona: { type: String, required: false },
  fileURL: { type: String, required: true },
  fileBlobKey: { type: String, required: true },
  coverURL: { type: String, required: true },
  coverBlobKey: { type: String, required: false },
  fileSize: { type: Number, required: true },
  totalSegments: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const Book = models.Book || model<IBook>('Book', BookSchema);

export default Book;
