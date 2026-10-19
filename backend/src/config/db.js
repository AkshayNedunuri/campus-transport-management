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
  const DEFAULT_ATLAS_URI = 'mongodb+srv://AkshayNedunuri:%40k17shaY@wealthdb.hwpgkoz.mongodb.net/campus_transport?retryWrites=true&w=majority&appName=wealthdb';
  const rawUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL || DEFAULT_ATLAS_URI;
  const uri = sanitizeMongoUri(rawUri);

  if (!process.env.MONGO_URI && !process.env.MONGO_URL && !process.env.MONGODB_URI) {
    console.log('[MongoDB]: Using default Atlas connection URI');
  }

  const attemptConnect = async (attempt = 1) => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB Connection Error (attempt ${attempt})]: ${error.message}`);
      if (attempt < 5) {
        console.log(`[MongoDB] Retrying in 4 seconds (attempt ${attempt + 1}/5)...`);
        setTimeout(() => attemptConnect(attempt + 1), 4000);
      }
    }
  };

  return attemptConnect();
};

module.exports = connectDB;
