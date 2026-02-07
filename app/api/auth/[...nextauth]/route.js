import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { auth } from "@/lib/auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const result = await auth.authenticateAdmin(
            credentials.email,
            credentials.password,
          );

          if (result.success) {
            return {
              id: "1",
              email: result.email,
              name: "Admin",
            };
          }

          throw new Error("Invalid credentials");
        } catch (error) {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin",
  },
  session: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
};

export default NextAuth(authOptions);
