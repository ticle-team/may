import { baseProcedure, router } from "@/server/trpc";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import PgBoss from "pg-boss";
import {
  ConversationEvent,
  conversationHistory,
  ConversationOutput,
} from "@/types";
import OpenAI from "openai";

const boss = new PgBoss("postgres://postgres:postgres@localhost:6432/postgres");
boss.on("error", (error) => console.error(error));
boss.start();

const openai = new OpenAI();

export const conversationRouter = router({
  onChat: baseProcedure.subscription(async () => {
    return observable<ConversationOutput>((emit) => {
      const onChat = async (job: PgBoss.Job<ConversationEvent>) => {
        const { history } = job.data;
        console.log("history: ", history);

        emit.next({ type: "begin" });
        const completionStream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: history.map((h) => {
            return {
              role: h.role,
              content: h.text,
            };
          }),
          stream: true,
        });

        let index = 0;
        for await (const completion of completionStream) {
          console.log("completion: ", completion);
          const chunk = {
            sequence: index++,
            text: completion.choices[0].delta.content!,
          };
          emit.next({
            type: "continue",
            chunk,
          });
        }
        emit.next({ type: "end" });
      };

      boss.work("chat", onChat).then(() => {
        console.log("START onChat");
      });

      return () => {
        boss.offWork("chat");
      };
    });
  }),
  chat: baseProcedure
    .input(
      z.object({
        history: conversationHistory,
        message: z.string(),
      }),
    )
    .output(
      z.object({
        history: conversationHistory,
      }),
    )
    .mutation(async (opts) => {
      const { history, message } = opts.input;
      console.log("mutate chat history: ", history, ", message: ", message);

      const newHistory = [
        ...history,
        {
          role: "user",
          text: message,
        },
      ];
      const jobId = await boss.send("chat", {
        history: newHistory,
      } as ConversationEvent);
      console.log("jobId: ", jobId);

      return {
        history: newHistory,
      };
    }),
});
