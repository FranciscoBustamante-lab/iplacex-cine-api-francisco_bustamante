import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
export const DB_NAME = process.env.DB_NAME || 'cine-db';
let dbInstance;
export let client;
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta configurar MONGODB_URI en .env o en la terminal.');
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(DB_NAME);
  await db.command({ ping: 1 });
  dbInstance = db;
  const host = new URL(uri).hostname;
  console.log('[MongoDB] Conexión verificada a ' + host + '; base: ' + DB_NAME);
  return db;
}
export function getDB() {
  if (!dbInstance) throw new Error('MongoDB no está conectado.');
  return dbInstance;
}
export async function closeDB() { if (client) await client.close(); dbInstance = undefined; }
