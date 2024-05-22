import { TRPCError } from '@trpc/server';

export type StackCreationEventStart = {
  event: 'start';
};

export type StackCreationEventText = {
  event: 'text';
  text: string;
};

export type StackCreationEventDone = {
  event: 'done';
};

export type StackCreationEventError = {
  event: 'error';
  error: TRPCError;
};

export type StackCreationEventDeploy = {
  event: 'deploy';
};

export type StackCreationEventCreated = {
  event: 'created';
};

export type StackCreationEvent =
  | StackCreationEventText
  | StackCreationEventDone
  | StackCreationEventError
  | StackCreationEventDeploy
  | StackCreationEventCreated
  | StackCreationEventStart;
