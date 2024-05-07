import * as trpcNext from '@trpc/server/adapters/next';
import { ShapleClient, createClient } from '@shaple/shaple';
import { TRPCError } from '@trpc/server';
import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { AssistantService } from '@/server/domain/assistant/assistant.service';

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  const shapleClient = createClient(
    process.env.NEXT_PUBLIC_SHAPLE_URL!,
    process.env.NEXT_PUBLIC_SHAPLE_API_KEY!,
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
    threadService: Container.get(ThreadService),
    assistantService: Container.get(AssistantService),
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
