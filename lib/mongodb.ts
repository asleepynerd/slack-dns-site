import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 1,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  maxIdleTimeMS: 10000,
  waitQueueTimeoutMS: 10000,
};

let clientPromise: Promise<typeof mongoose>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongoose = global as typeof globalThis & {
    mongoose: Promise<typeof mongoose>;
  };

  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = mongoose.connect(uri, options);
  }
  clientPromise = globalWithMongoose.mongoose;
} else {
  clientPromise = mongoose.connect(uri, options);
}

export default clientPromise;
