import { model, models, Schema } from 'mongoose';
import { IVoiceSession } from '@/lib/types';

const VoiceSessionSchema = new Schema<IVoiceSession>({
  clerkId: { type: String, required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, required: true, ref: 'Book' },
  startedAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date, required: false },
  durationSeconds: { type: Number, required: true },
  billingPeriodStart: { type: Date, required: true, index: true },
});

VoiceSessionSchema.index(
  { clerkId: 1, billingPeriodStart: 1 },
  { unique: true },
);

const VoiceSession =
  models.VoiceSession ||
  model<IVoiceSession>('VoiceSession', VoiceSessionSchema);

export default VoiceSession;
