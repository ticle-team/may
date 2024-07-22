import { z } from 'zod';

export const threadStates = {
  none: 'none',
  stackCreating: 'creating_stack',
  stackCreated: 'stack_created',
} as const;

export const creatingStackStateInfoJson = z.object({
  current_step: z.number(),
  name: z.string(),
  description: z.string(),
  dependencies: z.object({
    base_apis: z.array(
      z.object({
        name: z.string(),
      }),
    ),
    vapis: z.array(
      z.object({
        name: z.string(),
      }),
    ),
  }),
});

export type CreatingStackStateInfoJson = z.infer<
  typeof creatingStackStateInfoJson
>;

export const installStackArgs = z.object({
  name: z.string(),
  description: z.string(),
  dependencies: z.object({
    baseApis: z.array(
      z.object({
        name: z.string(),
      }),
    ),
    vapis: z.array(
      z.object({
        name: z.string(),
      }),
    ),
  }),
});

export const threadStateInfo = z.union([z.null(), creatingStackStateInfoJson]);

export const thread = z.object({
  id: z.number(),
  shapleProjectId: z.number().nullable(),
  shapleStackId: z.number().nullable(),
  state: z.string(),
  stateInfo: threadStateInfo,
});

export type Thread = z.infer<typeof thread>;
