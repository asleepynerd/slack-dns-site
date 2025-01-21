import NextAuth from 'next-auth';
import { options } from './options';

export const runtime = "edge";

const handler = NextAuth(options);

export { handler as GET, handler as POST };
