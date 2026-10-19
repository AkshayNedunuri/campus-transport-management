const mongoose = require('mongoose');

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  // Strip accidental surrounding quotes and whitespace (common Render/env var mistake)
  rawUri = rawUri.trim().replace(/^["'`]+|["'`]+$/g, '').trim();
  try {
    const match = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@\/]+)(.*)$/);
    if (match) {
      const [, proto, user, pass, host, rest] = match;
      return `${proto}${encodeURIComponent(decodeURIComponent(user))}:${encodeURIComponent(decodeURIComponent(pass))}@${host}${rest}`;
    }
  } catch {
    // fallback
  }
  return rawUri;
}

const connectDB = async () => {
  const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_transport';
  const uri = sanitizeMongoUri(rawUri);

  if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️ [MongoDB Warning]: MONGO_URI is not set in your environment variables.');
    console.warn('⚠️ Please add your MongoDB Atlas connection string to Render Environment tab.\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error('The server will continue running. Please configure MONGO_URI on Render dashboard to enable database operations.');
  }
};

module.exports = connectDB;
