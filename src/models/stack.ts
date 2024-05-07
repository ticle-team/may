import { z } from 'zod';
import { thread } from '@/models/thread';
import { vapi } from '@/models/vapi';

export const stack = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  description: z.string(),
  githubRepo: z.string(),
  githubBranch: z.string(),
  threadId: z.number(),
  auth: z.record(z.string(), z.any()),
  storage: z.record(z.string(), z.any()),
  postgrest: z.record(z.string(), z.any()),
  vapis: z.array(vapi),
});

export const instance = z.object({
  id: z.number(),
  stackId: z.number(),
  zone: z.string(),
  state: z.enum([
    'pending',
    'launched',
    'launching',
    'paused',
    'pausing',
    'deleted',
    'deleting',
  ]),
});
