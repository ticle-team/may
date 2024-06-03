import { TRPCError } from '@trpc/server';

export type StackCreationEventBegin = {
  event: 'begin';
};

export type StackCreationEventEnd = {
  event: 'end';
};

export type StackCreationEventText = {
  id: string;
  event: 'text';
  text: string;
};

export type StackCreationEventTextDone = {
  id: string;
  event: 'text.done';
};

export type StackCreationEventError = {
  event: 'error';
  error: TRPCError;
};

export type StackCreationEventDeploy = {
  event: 'deploy';
};

export type StackCreationEventTextCreated = {
  id: string;
  event: 'text.created';
};

export type StackCreationEvent =
  | StackCreationEventTextCreated
  | StackCreationEventText
  | StackCreationEventTextDone
  | StackCreationEventError
  | StackCreationEventDeploy
  | StackCreationEventBegin;
