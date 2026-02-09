import crypto from "crypto";
import clientPromise from "@/lib/mongodb";

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function createAdminSession(adminEmail) {
  const token = crypto.randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    await db.collection("admin_sessions").insertOne({
      token,
      adminEmail,
      createdAt: now,
      expiresAt,
    });
    return { token, expiresAt };
  } catch (err) {
    console.error("Failed to create admin session:", err);
    return null;
  }
}

export async function isValidAdminToken(token) {
  if (!token) return false;
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    const doc = await db.collection("admin_sessions").findOne({ token });
    if (!doc) return false;
    if (new Date() > new Date(doc.expiresAt)) {
      // expired - remove and return false
      try {
        await db.collection("admin_sessions").deleteOne({ token });
      } catch (e) {}
      return false;
    }
    return true;
  } catch (err) {
    console.error("Token validation failed:", err);
    return false;
  }
}

export async function deleteAdminSession(token) {
  if (!token) return false;
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    await db.collection("admin_sessions").deleteOne({ token });
    return true;
  } catch (err) {
    console.error("Failed to delete admin session:", err);
    return false;
  }
}
