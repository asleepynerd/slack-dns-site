//@ts-nocheck
import type { NextAuthOptions } from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import NextAuth from "next-auth";

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
  adapter: MongoDBAdapter(clientPromise),
  debug: true,
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          slackId: profile["https://slack.com/user_id"] || profile.sub,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (profile) {
        token.slackId = profile["https://slack.com/user_id"] || profile.sub;
      }
      if (user) {
        token.id = user.id;
        token.slackId = user.slackId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
