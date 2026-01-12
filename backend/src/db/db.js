import mongoose from "mongoose";


const connectDb = async () => {
  try {
    // Check if we already have a connection to avoid redundant handshakes
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid DNS resolution delays on some networks
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle unexpected disconnection to maintain app reliability
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // In production, you want the process to fail so the orchestrator (PM2/Docker) can restart it
    process.exit(1); 
  }
};

export default connectDb;