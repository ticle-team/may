import { authedProcedure, router } from '../trpc';
import { z } from 'zod';
import { instance, stack } from '@/models/stack';
import { vapiRelease } from '@/models/vapi';

export default router({
  create: authedProcedure
    .input(
      z.object({
        projectId: z.number(),
        threadId: z.number(),
      }),
    )
    .output(stack)
    .mutation(async ({ ctx, input }) => {
      return {
        id: 0,
        name: '',
        description: '',
        githubRepo: '',
        githubBranch: '',
        projectId: 0,
        threadId: 0,
        auth: {},
        storage: {},
        postgrest: {},
        vapis: [],
      };
    }),
  delete: authedProcedure
    .input(
      z.object({
        stackId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  get: authedProcedure
    .input(
      z.object({
        stackId: z.number(),
      }),
    )
    .output(stack)
    .query(async () => {
      return {
        id: 0,
        name: '',
        description: '',
        githubRepo: '',
        githubBranch: '',
        projectId: 0,
        threadId: 0,
        auth: {},
        storage: {},
        postgrest: {},
        vapis: [],
      };
    }),
  instances: router({
    list: authedProcedure
      .input(
        z.object({
          stackId: z.number(),
        }),
      )
      .output(
        z.object({
          instances: z.array(instance),
          after: z.number(),
        }),
      )
      .query(async () => {
        return {
          instances: [],
          after: 0,
        };
      }),
  }),
  vapis: router({
    list: authedProcedure
      .input(
        z.object({
          stackId: z.number(),
        }),
      )
      .output(
        z.object({
          vapis: z.array(vapiRelease),
          after: z.number().nullish(),
        }),
      )
      .query(async () => {
        return {
          vapis: [],
          after: 0,
        };
      }),
    install: authedProcedure
      .input(
        z.object({
          stackId: z.number(),
          vapiReleaseId: z.number(),
        }),
      )
      .mutation(async () => {
        return;
      }),
  }),
  deploy: authedProcedure
    .input(
      z.object({
        stackId: z.number(),
        zone: z.string().nullish(),
      }),
    )
    .output(instance)
    .mutation(async () => {
      return {
        id: 0,
        stackId: 0,
        zone: '',
        state: 'pending',
      };
    }),
});
