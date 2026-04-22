import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const credentialsProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const email = String(credentials.email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) return null;

    return { id: user.id, email: user.email, name: user.name };
  },
});

const providers = [credentialsProvider];
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
