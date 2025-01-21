//@ts-nocheck

import type { NextAuthOptions } from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const client = new MongoClient(process.env.MONGODB_URI);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      slackId: string;
      name: string;
      email: string;
      image: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    slackId: string;
  }
}

export const options: NextAuthOptions = {
  adapter: MongoDBAdapter(client),
  debug: true,
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
      profile(profile, tokens) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          slackId: profile.sub,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.slackId = user.slackId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.slackId = token.slackId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
