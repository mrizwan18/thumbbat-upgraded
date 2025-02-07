import mongoose from "mongoose";

// Use a type-safe workaround for global.mongoose
const globalWithMongoose = global as typeof globalThis & {
  mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
};

// Initialize global.mongoose if it doesn't exist
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error(
      "MONGODB_URI is not defined. Please check your environment variables."
    );
    process.exit(1);
  }

  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "test", // Replace with your actual DB name
        bufferCommands: false,
      })
      .then((mongoose) => mongoose.connection);
  }

  globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
  return globalWithMongoose.mongoose.conn;
}

export default dbConnect;
