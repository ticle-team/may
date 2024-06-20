import { z } from 'zod';
import { vapiAccessToString, VapiPackage, vapiRelease } from '@/models/vapi';
import { thread } from '@/models/thread';
import { stoacloud } from '@/protos/stoacloud';
import { TRPCError } from '@trpc/server';

export const authExternalOAuthProvider = z.object({
  enabled: z.boolean().optional(),
  name: z.string().optional(),
  secret: z.string().optional(),
  clientId: z.string().optional(),
  skipNonceCheck: z.boolean().optional(),
});

export const auth = z.object({
  jwtSecret: z.string().optional(),
  jwtExp: z.number().optional(),
  smtpSenderName: z.string().optional(),
  mailerAutoConfirm: z.boolean().optional(),
  mailerConfirmationSubject: z.string().optional(),
  mailerRecoverySubject: z.string().optional(),
  mailerInviteSubject: z.string().optional(),
  mailerEmailChangeSubject: z.string().optional(),
  mailerMagicLinkSubject: z.string().optional(),
  mailerRecoveryTemplate: z.string().optional(),
  mailerConfirmationTemplate: z.string().optional(),
  mailerInviteTemplate: z.string().optional(),
  mailerEmailChangeTemplate: z.string().optional(),
  mailerMagicLinkTemplate: z.string().optional(),
  smsAutoConfirm: z.boolean().optional(),
  smsOtpExp: z.number().optional(),
  smsOtpLength: z.number().optional(),
  smsProvider: z.string().optional(),
  smsTwilioAccountSid: z.string().optional(),
  smsTwilioAuthToken: z.string().optional(),
  smsTwilioMessageServiceSid: z.string().optional(),
  smsTwilioContentSid: z.string().optional(),
  smsTwilioVerifyAccountSid: z.string().optional(),
  smsTwilioVerifyAuthToken: z.string().optional(),
  smsTwilioVerifyMessageServiceSid: z.string().optional(),
  smsMessagebirdAccessKey: z.string().optional(),
  smsMessagebirdOriginator: z.string().optional(),
  smsVonageApiKey: z.string().optional(),
  smsVonageApiSecret: z.string().optional(),
  smsVonageFrom: z.string().optional(),
  smsTestOtp: z.string().optional(),
  smsTestOtpValidUntil: z.string().optional(),
  externalEmailEnabled: z.boolean().optional(),
  externalPhoneEnabled: z.boolean().optional(),
  externalIosBundleId: z.string().optional(),
  externalOAuthProviders: z.array(authExternalOAuthProvider).optional(),
  mfaEnabled: z.boolean().optional(),
  mfaChallengeExpiryDuration: z.number().optional(),
  mfaRateLimitChallengeAndVerify: z.number().optional(),
  mfaEnrolledFactors: z.number().optional(),
  mfaVerifiedFactors: z.number().optional(),
  securityCaptchaEnabled: z.boolean().optional(),
  securityCaptchaSecret: z.string().optional(),
  securityCaptchaProvider: z.string().optional(),
  externalRedirectUrl: z.string().optional(),
  rateLimitEmailSent: z.number().optional(),
  rateLimitSmsSent: z.number().optional(),
  rateLimitVerify: z.number().optional(),
  rateLimitTokenRefresh: z.number().optional(),
  rateLimitSso: z.number().optional(),
});

export const storage = z.object({
  s3Bucket: z.string().optional(),
  tenantId: z.string().optional(),
});

export const postgrest = z.object({
  schemas: z.array(z.string()).nullish(),
});

export const stackVapi = z.object({
  stackId: z.number(),
  vapiId: z.number(),
  vapi: vapiRelease.optional(),
});

export type StackVapi = z.infer<typeof stackVapi>;

export const stack = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  description: z.string(),
  gitRepo: z.string(),
  gitBranch: z.string(),
  thread: thread.nullable(),
  domain: z.string(),
  anonApiKey: z.string().optional(),
  adminApiKey: z.string().optional(),
  authEnabled: z.boolean(),
  auth,
  storageEnabled: z.boolean(),
  storage,
  postgrestEnabled: z.boolean(),
  postgrest,
  vapis: z.array(stackVapi).nullable(),
});

export type Stack = z.infer<typeof stack>;

export const shapleStack = stack.omit({
  thread: true,
});

export type ShapleStack = z.infer<typeof shapleStack>;

export const instanceState_NONE = 0;
export const instanceState_RUNNING = 1;
export const instanceState_READY = 2;
export const instanceState_INITIALIZE = 3;

export const instanceZone = z.union([
  z.literal('default'),
  z.literal('multi'),
  z.literal('oci-ap-seoul-1'),
]);

export const instance = z.object({
  id: z.number(),
  stackId: z.number(),
  zone: instanceZone,
  state: z.number().default(instanceState_NONE),
});

export type Instance = z.infer<typeof instance>;

export function parseZoneFromProto(zone: stoacloud.v1.InstanceZone) {
  switch (zone) {
    case stoacloud.v1.InstanceZone.InstanceZoneDefault:
      return 'default';
    case stoacloud.v1.InstanceZone.InstanceZoneMulti:
      return 'multi';
    case stoacloud.v1.InstanceZone.InstanceZoneOciApSeoul:
      return 'oci-ap-seoul-1';
    default:
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unknown zone',
      });
  }
}

export function parseShapleStackFromProto(
  stack: stoacloud.v1.Stack,
): ShapleStack {
  return {
    id: stack.id,
    name: stack.name,
    projectId: stack.projectId,
    gitRepo: stack.gitRepo,
    description: stack.description,
    gitBranch: stack.gitBranch,
    domain: stack.domain,
    authEnabled: stack.authEnabled,
    auth: stack.auth,
    storageEnabled: stack.storageEnabled,
    storage: stack.storage,
    postgrestEnabled: stack.postgrestEnabled,
    postgrest: stack.postgrest,
    vapis: stack.vapis.map(
      ({ vapi, stackId, vapiId }): StackVapi => ({
        stackId: stackId,
        vapiId: vapiId,
        vapi: {
          id: vapi.id,
          version: vapi.version,
          access: vapiAccessToString(vapi.access),
          packageId: vapi.packageId,
        },
      }),
    ),
  };
}
