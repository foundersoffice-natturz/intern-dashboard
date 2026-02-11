import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAllowedEmail } from "../../../lib/authz";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = (profile as any)?.email?.toLowerCase();
      const emailVerified = (profile as any)?.email_verified === true;

      if (!emailVerified) return false;
      if (!isAllowedEmail(email)) return false;

      return true;
    }
  },
  session: { strategy: "jwt" }
});
