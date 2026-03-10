import { model, models, Schema } from 'mongoose';
import { IBookSegment } from '@/lib/types';

const BookSegmentSchema = new Schema<IBookSegment>({
  clerkId: { type: String, required: true },
  bookId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Book',
    index: true,
  },
  content: { type: String, required: true },
  segmentIndex: { type: Number, required: true, index: true },
  pageNumber: { type: Number, required: false, index: true },
  wordCount: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
BookSegmentSchema.index({ bookId: 1, pageNumber: 1 });

BookSegmentSchema.index({ bookId: 1, content: 'text' });

const BookSegment =
  models.BookSegment || model<IBookSegment>('BookSegment', BookSegmentSchema);

export default BookSegment;
