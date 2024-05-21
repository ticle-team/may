import { z } from 'zod';

export const chatRole = z.union([
  z.literal('user'),
  z.literal('assistant'),
  z.literal('system'),
]);

export type ChatRole = z.infer<typeof chatRole>;

export const chatMessage = z.object({
  role: chatRole,
  text: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessage>;
