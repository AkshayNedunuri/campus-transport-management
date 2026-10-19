const mongoose = require('mongoose');

function sanitizeMongoUri(rawUri, defaultUri) {
  if (!rawUri) return defaultUri;
  // Strip accidental surrounding quotes and whitespace
  rawUri = rawUri.trim().replace(/^["'`]+|["'`]+$/g, '').trim();

  // If user pasted "MONGO_URI=mongodb+srv://..." or similar prefix in the value field
  if (rawUri.includes('=')) {
    const parts = rawUri.split('=');
    const mongoPart = parts.slice(1).join('=').trim().replace(/^["'`]+|["'`]+$/g, '').trim();
    if (mongoPart.startsWith('mongodb')) {
      rawUri = mongoPart;
    }
  }

  // Find where mongodb protocol starts if there is any leading text
  const mongoIndex = rawUri.indexOf('mongodb');
  if (mongoIndex > 0) {
    rawUri = rawUri.slice(mongoIndex).trim().replace(/^["'`]+|["'`]+$/g, '').trim();
  }

  // If after cleaning it still doesn't have a valid mongodb scheme, fallback to default Atlas
  if (!rawUri.startsWith('mongodb://') && !rawUri.startsWith('mongodb+srv://')) {
    console.warn(`[MongoDB Warning]: Invalid URI "${rawUri}" provided. Falling back to default Atlas URI.`);
    return defaultUri;
  }

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
  const rawUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
  const uri = sanitizeMongoUri(rawUri, DEFAULT_ATLAS_URI);

  if (!rawUri) {
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
