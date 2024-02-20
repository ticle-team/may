import {router} from "@/server/trpc";
import conversationRouter from "@/server/routers/conversation";

export const appRouter = router({
  conversation: conversationRouter,
});