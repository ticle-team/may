import { ShapleClient, createClient } from '@shaple/shaple';
import { TRPCError } from '@trpc/server';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { createRouteHandlerClient } from '@shaple/auth-helpers-nextjs';

type ContextReturn = {
  shaple: ShapleClient;
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

  const authHeader = opts.req.headers.get('Authorization');
  if (authHeader != null) {
    const accessToken = authHeader.split(' ')[1];
    const { error } = await shapleClient.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken,
    });
    if (!error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }
  }

  return {
    shaple: shapleClient,
  };
}

export async function createWSSContext({
  req,
}: CreateWSSContextFnOptions): Promise<ContextReturn> {
  const shapleClient = createClient(
    process.env.NEXT_PUBLIC_SHAPLE_URL!,
    process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY!,
  );

  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { error } = await shapleClient.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken,
    });
    if (!error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }
  }

  return {
    shaple: shapleClient,
  };
}
export type Context = Awaited<ContextReturn>;
