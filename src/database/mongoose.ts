import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || '';

if (!MONGO_URI) {
  throw new Error('MONGODB_URI is not defined');
}

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }

  console.info('MongoDB connected successfully');
  return cached.conn;
};
