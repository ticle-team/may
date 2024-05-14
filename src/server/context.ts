import { ShapleClient, createClient } from '@shaple/shaple';
import { TRPCError } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';

export async function createContext({
  req,
  res,
}: CreateNextContextOptions | CreateWSSContextFnOptions): Promise<{
  shaple: ShapleClient;
}> {
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
export type Context = Awaited<ReturnType<typeof createContext>>;
