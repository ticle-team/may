import {z} from "zod";

export const conversationHistory = z.array(z.object({
  role: z.union([
    z.literal("user"),
    z.literal("system"),
    z.literal("assistant"),
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

export const recommendFunctionsSummary = z.object({
  functionGroups: z.array(z.string()),
  functions: z.array(z.string()),
});

export type RecommendFunctionsSummary = z.infer<typeof recommendFunctionsSummary>;

export type RecommendServicesOutputSummary = {
  type: "summary";
} & RecommendFunctionsSummary;

export type RecommendServicesOutput = RecommendServicesOutputSummary | {
  type: "detail";
  seqNum: number;
  chunk: string;
} | {
  type: "end";
};

export const openRoomOutput = z.object({
  roomId: z.number(),
});

export type OpenRoomOutput = z.infer<typeof openRoomOutput>;


export const turn = z.object({
  userInput: z.string(),
  botAnswer: z.string().nullable(),
  recommendFunctionsSummary: recommendFunctionsSummary.nullable(),
});

export const room = z.object({
  id: z.number(),
  history: z.array(turn),
});

export type Room = z.infer<typeof room>;