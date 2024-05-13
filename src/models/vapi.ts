import { z } from 'zod';
import { organization } from '@/models/organization';

export const vapiPackage = z.object({
  name: z.string(),
});

export const vapiRelease = z.object({
  version: z.string(),
  pkg: vapiPackage,
});
