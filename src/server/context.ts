import { User } from '@shaple/shaple';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { createRouteHandlerClient } from '@shaple/auth-helpers-nextjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/server/common/prisma.service';
import { Container } from 'typedi';

export interface Context {
  user: User | null;
  tx: PrismaClient | Prisma.TransactionClient;
}

export async function createNextContext(
  cookie: ReadonlyRequestCookies,
  opts: FetchCreateContextFnOptions,
): Promise<Context> {
  const shapleClient = createRouteHandlerClient(
    { cookies: () => cookie },
    {
      shapleKey: process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY,
      shapleUrl: process.env.NEXT_PUBLIC_SHAPLE_URL,
    },
  );

  const {
    data: { session },
    error,
  } = await shapleClient.auth.getSession();

  let user = null;
  if (!error && session) {
    user = session.user;
    user.user_metadata.jwt = session.access_token;
  }

  const githubTokenHeader = opts.req.headers.get('X-Github-Token');
  if (user && githubTokenHeader) {
    user.user_metadata.githubToken = githubTokenHeader;
  }

  return {
    user,
    tx: Container.get(PrismaService),
  };
}
