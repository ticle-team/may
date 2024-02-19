import {z} from "zod";

export const conversationHistory = z.array(z.object({
  role: z.union([
    z.literal("user"),
    z.literal("system"),
  ]),
  text: z.string(),
}));

export type ConversationHistory = z.infer<typeof conversationHistory>;

export type ConversationChunk = {
  sequence: number;
  text: string;
};

export type ConversationOutput = {
  type: "begin" | "continue" | "end";
  chunk?: ConversationChunk;
};

export type ConversationEvent = {
  history: ConversationHistory;
};