const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_transport';
  
  if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️ [MongoDB Warning]: MONGO_URI is not set in your environment variables.');
    console.warn('⚠️ Please add your MongoDB Atlas connection string to Render Environment tab.\n');
  }

  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error('The server will continue running. Please configure MONGO_URI on Render dashboard to enable database operations.');
  }
};

module.exports = connectDB;
