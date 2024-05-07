import { z } from 'zod';

export const MessageType = {
  StackCreation: 'stack-creation',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const message = z.object({
  role: z.string(),
  text: z.string(),
});

export const thread = z.object({
  id: z.number(),
});

export type Thread = z.infer<typeof thread>;
