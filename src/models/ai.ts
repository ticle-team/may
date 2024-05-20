import { z } from 'zod';

export const chatMessage = z.object({
  role: z.union([
    z.literal('user'),
    z.literal('assistant'),
    z.literal('system'),
  ]),
  text: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessage>;
