const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error("Name:", err.name);
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    console.error(err);
    process.exit(1);
  }
}

module.exports = connectDB;