// server/config/db.ts
import mongoose, { Connection } from "mongoose";

/** Cache across reloads (Node/Next pattern) */
type Cached = {
  conn: Connection | null;
  promise: Promise<Connection> | null;
};

// Augment global for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: Cached | undefined;
}

const cached: Cached = global.__mongoose ?? (global.__mongoose = { conn: null, promise: null });

export default async function dbConnect(): Promise<Connection> {
  const URI = process.env.MONGODB_URI || process.env.MONGO_URI || "";

  if (!URI) {
    // Prefer throwing so the caller can decide whether to continue
    const msg = "Mongo connection string not set (MONGO_URI / MONGODB_URI).";
    console.warn(`⚠️ ${msg}`);
    throw new Error(msg);
  }

  // If already connected/connecting, reuse it
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // Optional: turn on strictQuery (recommended on modern Mongoose)
    // mongoose.set("strictQuery", true);

    cached.promise = mongoose
      .connect(URI, {
        dbName: process.env.MONGODB_DB || "thumbbat",
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        autoIndex: false,
      })
      .then((m) => {
        const conn = m.connection;

        // Attach listeners once
        conn.on("connected", () => console.log("✅ MongoDB connected"));
        conn.on("error", (err) => console.error("❌ MongoDB error:", err));
        conn.on("disconnected", () => console.warn("⚠️ MongoDB disconnected"));

        return conn;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/** (Optional) helper to close connection on shutdown/tests */
export async function dbDisconnect(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}