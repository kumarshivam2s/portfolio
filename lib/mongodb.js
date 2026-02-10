// Use dynamic import of the MongoDB driver to avoid bundling it into client-side code

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise;

async function buildClientPromise() {
  const { MongoClient } = await import("mongodb");

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

// Export a module-scoped MongoClient promise. Build it lazily on first use.
export default (async function getClientPromise() {
  if (!clientPromise) clientPromise = buildClientPromise();
  return clientPromise;
})();
