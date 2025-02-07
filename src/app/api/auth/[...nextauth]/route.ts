import NextAuth from "next-auth/next";
import { authOptions } from "@/services/auth/config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
