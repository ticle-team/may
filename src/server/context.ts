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
  const ctx: Context = {
    user: null,
    tx: Container.get(PrismaService),
  };

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

  if (!error && session) {
    ctx.user = session.user;
    ctx.user.user_metadata.jwt = session.access_token;
  }

  const githubTokenHeader = opts.req.headers.get('X-Github-Token');
  if (ctx.user && githubTokenHeader) {
    ctx.user.user_metadata.githubToken = githubTokenHeader;
  }

  return ctx;
}
