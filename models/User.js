import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const UserModel = {
  async findByEmail(email) {
    try {
      const client = await clientPromise;
      const db = client.db("portfolio");
      const user = await db.collection("users").findOne({ email });
      return user;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  },

  async create(userData) {
    try {
      const client = await clientPromise;
      const db = client.db("portfolio");

      const user = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("users").insertOne(user);
      return { ...user, _id: result.insertedId };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async update(id, userData) {
    try {
      const client = await clientPromise;
      const db = client.db("portfolio");

      const update = {
        ...userData,
        updatedAt: new Date(),
      };

      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(id) }, { $set: update });

      return { _id: id, ...update };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const client = await clientPromise;
      const db = client.db("portfolio");

      await db.collection("users").deleteOne({ _id: new ObjectId(id) });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};
