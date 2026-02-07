import bcrypt from "bcryptjs";
import { UserModel } from "@/models/User";

const SALT_ROUNDS = 10;

export const auth = {
  async hashPassword(password) {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw error;
    }
  },

  async comparePasswords(password, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return false;
    }
  },

  async authenticateAdmin(email, password) {
    try {
      // Check environment variables for admin credentials
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      if (email === adminEmail && adminPasswordHash) {
        const isMatch = await this.comparePasswords(
          password,
          adminPasswordHash,
        );
        if (isMatch) {
          return { success: true, email: adminEmail };
        }
      }

      return { success: false };
    } catch (error) {
      console.error("Error authenticating admin:", error);
      return { success: false };
    }
  },

  async generateToken() {
    // This would typically use JWT
    // For now, returning a simple token
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },
};
