import { z } from 'zod';
import { vapiRelease } from '@/models/vapi';
import { thread } from '@/models/thread';

export const authExternalOAuthProvider = z.object({
  enabled: z.boolean().optional(),
  name: z.string().optional(),
  secret: z.string().optional(),
  clientId: z.string().optional(),
  skipNonceCheck: z.boolean().optional(),
});

export const auth = z.object({
  jwtSecret: z.string().optional(),
  jwtExp: z.string().optional(), // In TypeScript, durations are typically represented as strings
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
  smsOtpExp: z.string().optional(), // In TypeScript, durations are typically represented as strings
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
  mfaChallengeExpiryDuration: z.string().optional(), // In TypeScript, durations are typically represented as strings
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
  schemas: z.array(z.string()).optional(),
});

export const stack = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  description: z.string(),
  gitRepo: z.string(),
  gitBranch: z.string(),
  thread: thread,
  domain: z.string(),
  anonApiKey: z.string().optional(),
  adminApiKey: z.string().optional(),
  authEnabled: z.boolean(),
  auth,
  storageEnabled: z.boolean(),
  storage,
  postgrestEnabled: z.boolean(),
  postgrest,
  vapis: z
    .array(
      z.object({
        vapiId: z.number(),
        vapi: vapiRelease.optional(),
      }),
    )
    .nullable(),
});

export type Stack = z.infer<typeof stack>;

export const shapleStack = stack.omit({
  thread: true,
});

export type ShapleStack = z.infer<typeof shapleStack>;

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

export type Instance = z.infer<typeof instance>;
