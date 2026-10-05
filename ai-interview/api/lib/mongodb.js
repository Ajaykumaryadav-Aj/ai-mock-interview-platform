// api/lib/mongodb.js
// Production-quality singleton connection utility for MongoDB Atlas.
// Reuses connections across serverless function invocations to prevent connection exhaustion.

import { MongoClient, ObjectId } from "mongodb";

function getMongoUri() {
  const uri = (process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || "").trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is missing. " +
      "Please set MONGODB_URI in your server environment / .env.local file."
    );
  }
  return uri;
}

let cachedClient = null;
let cachedPromise = null;

/**
 * Returns a cached MongoDB MongoClient instance.
 * Preserves the connection promise across warm serverless container invocations.
 */
export async function getMongoClient() {
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = getMongoUri();
  const options = {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  };

  // In development, preserve client across Vite / Node reloads
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__mongoClientPromise) {
      cachedClient = new MongoClient(uri, options);
      globalThis.__mongoClientPromise = cachedClient.connect();
    }
    cachedPromise = globalThis.__mongoClientPromise;
  } else {
    cachedClient = new MongoClient(uri, options);
    cachedPromise = cachedClient.connect();
  }

  return cachedPromise;
}

// In-memory test store for automated testing when NODE_ENV === "test"
const memoryDb = {
  collections: new Map(),
  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MemoryCollection(name));
    }
    return this.collections.get(name);
  },
};

function matchQuery(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [k, v] of Object.entries(query)) {
    if (k === "$or" && Array.isArray(v)) {
      if (!v.some((subQ) => matchQuery(doc, subQ))) return false;
      continue;
    }
    if (v && typeof v === "object" && "$in" in v) {
      const docVal = doc[k]?.toString?.() ?? doc[k];
      const inVals = v.$in.map((item) => item?.toString?.() ?? item);
      if (!inVals.includes(docVal)) return false;
      continue;
    }
    const docVal = doc[k]?.toString?.() ?? doc[k];
    const targetVal = v?.toString?.() ?? v;
    if (docVal !== targetVal) return false;
  }
  return true;
}

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }
  async findOne(query) {
    return this.docs.find((d) => matchQuery(d, query)) || null;
  }
  find(query) {
    const matched = this.docs.filter((d) => matchQuery(d, query));
    return {
      sort(sortObj = {}) {
        const [field, dir] = Object.entries(sortObj)[0] || ["createdAt", -1];
        const sorted = [...matched].sort((a, b) => {
          if (a[field] < b[field]) return dir === 1 ? -1 : 1;
          if (a[field] > b[field]) return dir === 1 ? 1 : -1;
          return 0;
        });
        return {
          toArray: async () => sorted,
        };
      },
      toArray: async () => [...matched],
    };
  }
  async insertOne(doc) {
    const id = new ObjectId();
    const newDoc = { _id: id, id: id.toString(), ...doc };
    this.docs.push(newDoc);
    return { insertedId: id };
  }
  async updateOne(filter, update, options = {}) {
    let doc = this.docs.find((d) => matchQuery(d, filter));
    if (!doc && options.upsert) {
      const id = new ObjectId();
      doc = { _id: id, id: id.toString(), ...filter };
      if (update.$setOnInsert) Object.assign(doc, update.$setOnInsert);
      this.docs.push(doc);
    }
    if (doc && update.$set) {
      Object.assign(doc, update.$set);
    }
    return { acknowledged: true, matchedCount: doc ? 1 : 0 };
  }
  async deleteOne(filter) {
    const idx = this.docs.findIndex((d) => matchQuery(d, filter));
    if (idx !== -1) {
      this.docs.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
  async deleteMany(filter) {
    const before = this.docs.length;
    this.docs = this.docs.filter((d) => !matchQuery(d, filter));
    return { deletedCount: before - this.docs.length };
  }
  async countDocuments(filter) {
    return this.docs.filter((d) => matchQuery(d, filter)).length;
  }
  async createIndex() {
    return "ok";
  }
}

/**
 * Returns the MongoDB database instance.
 * Defaults to the database specified in the URI, or "ai-mock-interview".
 *
 * @param {string} [dbName]
 * @returns {Promise<import("mongodb").Db>}
 */
export async function getDb(dbName) {
  if (process.env.NODE_ENV === "test" && process.env.USE_REAL_MONGO !== "true") {
    return memoryDb;
  }

  const client = await getMongoClient();
  const db = dbName ? client.db(dbName) : client.db();
  await ensureIndexes(db);
  return db;
}

let indexesEnsured = false;

/**
 * Creates essential indexes on collections once per container lifecycle.
 * - users.userId: unique index
 * - interviews.userId & interviews.createdAt
 * - userAnswers.userId & userAnswers.mockIdRef & compound unique/lookup index
 *
 * @param {import("mongodb").Db} db
 */
export async function ensureIndexes(db) {
  if (indexesEnsured) return;

  try {
    await Promise.all([
      db.collection("users").createIndex({ userId: 1 }, { unique: true }),
      db.collection("interviews").createIndex({ userId: 1 }),
      db.collection("interviews").createIndex({ createdAt: -1 }),
      db.collection("interviews").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("userAnswers").createIndex({ userId: 1 }),
      db.collection("userAnswers").createIndex({ mockIdRef: 1 }),
      db.collection("userAnswers").createIndex(
        { mockIdRef: 1, userId: 1, question: 1 },
        { background: true }
      ),
    ]);
    indexesEnsured = true;
  } catch (error) {
    // Non-fatal if index already exists or build in progress
    console.warn("[MongoDB] Index setup note:", error.message);
  }
}

export async function closeConnection() {
  try {
    if (cachedClient) {
      await cachedClient.close();
      cachedClient = null;
      cachedPromise = null;
    }
    if (globalThis.__mongoClientPromise) {
      const client = await globalThis.__mongoClientPromise;
      await client.close();
      delete globalThis.__mongoClientPromise;
    }
  } catch (err) {
    // Non-fatal
  }
}

export default getDb;
