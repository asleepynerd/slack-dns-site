import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 20000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
};

let clientPromise: mongoose.Connection;

if (process.env.NODE_ENV === "development") {

  let globalWithMongoose = global as typeof globalThis & {
    mongoose: mongoose.Connection;
  };

  if (!globalWithMongoose.mongoose) {
    mongoose.connect(uri, options).catch((error) => {
      console.error("MongoDB connection error:", error);
    });

    globalWithMongoose.mongoose = mongoose.connection;

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });
  }
  clientPromise = globalWithMongoose.mongoose;
} else {

  mongoose.connect(uri, options).catch((error) => {
    console.error("MongoDB connection error:", error);
  });
  clientPromise = mongoose.connection;
}

export default clientPromise;
