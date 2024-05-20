import { createClient, User } from '@shaple/shaple';
import { TRPCError } from '@trpc/server';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { createRouteHandlerClient } from '@shaple/auth-helpers-nextjs';

type ContextReturn = {
  user: User | null;
};

export async function createNextContext(
  cookie: ReadonlyRequestCookies,
  opts: FetchCreateContextFnOptions,
): Promise<ContextReturn> {
  const shapleClient = createRouteHandlerClient(
    { cookies: () => cookie },
    {
      shapleKey: process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY,
      shapleUrl: process.env.NEXT_PUBLIC_SHAPLE_URL,
    },
  );

  let user = null;
  const authHeader = opts.req.headers.get('Authorization');
  if (authHeader != null) {
    const [tokenType, jwt] = authHeader.split(' ');
    if (tokenType !== 'Bearer') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization type',
      });
    }

    const {
      data: { user: shapleUser },
      error,
    } = await shapleClient.auth.getUser(jwt);

    if (!error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }

    if (shapleUser) {
      user = shapleUser;
      user.user_metadata.jwt = jwt;
    }
  }

  const githubTokenHeader = opts.req.headers.get('X-Github-Token');
  if (user && githubTokenHeader) {
    user.user_metadata.githubToken = githubTokenHeader;
  }

  return {
    user,
  };
}

export async function createWSSContext({
  req,
}: CreateWSSContextFnOptions): Promise<ContextReturn> {
  const shaple = createClient(
    process.env.NEXT_PUBLIC_SHAPLE_URL!,
    process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY!,
  );

  let user: User | null = null;
  if (req.headers.authorization) {
    const [tokenType, jwt] = req.headers.authorization.split(' ');
    if (tokenType !== 'Bearer') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }

    const {
      data: { user: shapleUser },
      error,
    } = await shaple.auth.getUser(jwt);

    if (!error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }

    if (shapleUser) {
      user = shapleUser;
      user.user_metadata.jwt = jwt;
    }
  }

  if (user && req.headers['x-github-token']) {
    user.user_metadata.githubToken = req.headers['x-github-token'] as string;
  }

  return {
    user,
  };
}
export type Context = Awaited<ContextReturn>;
