import mongoose from "mongoose";

let isConnected = false; // track the connection

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("Connecting to MongoDB");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "share_prompt",
      useNewUrlParser: true,
      useUnifiedUrlParser: true,
    });

    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
  }
};
