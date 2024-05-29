import { VapiRelease } from '@/models/vapi';

export type StoaCloudError = {
  error: string;
};

type AuthSMTPInput = {
  senderName?: string;
  adminEmail?: string;
};

type AuthExternalOAuthProvider = {
  enabled?: boolean;
  name?: string;
  secret?: string;
  clientId?: string;
  skipNonceCheck?: boolean;
};

type AuthExternalInput = {
  emailEnabled?: boolean;
  phoneEnabled?: boolean;
  iosBundleId?: string;
  redirectUrl?: string;
  oauthProviders?: AuthExternalOAuthProvider[];
};

type AuthJWTInput = {
  exp?: string;
};

type AuthMailerInput = {
  autoConfirm?: boolean;
  confirmationSubject?: string;
  recoverySubject?: string;
  inviteSubject?: string;
  emailChangeSubject?: string;
  magicLinkSubject?: string;
  recoveryTemplate?: string;
  inviteTemplate?: string;
  emailChangeTemplate?: string;
  confirmationTemplate?: string;
  magicLinkTemplate?: string;
};

type AuthSMSInput = {
  autoConfirm?: boolean;
  otpExp?: string;
  otpLength?: number;
  provider?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioMessageServiceSid?: string;
  twilioContentSid?: string;
  twilioVerifyAccountSid?: string;
  twilioVerifyAuthToken?: string;
  twilioVerifyMessageServiceSid?: string;
  messagebirdAccessKey?: string;
  messagebirdOrginator?: string;
  vonageApiKey?: string;
  vonageApiSecret?: string;
  vonageFrom?: string;
  testOtp?: string;
  testOtpValidUntil?: string;
};

type AuthMFAInput = {
  enabled?: boolean;
  challengeExpiryDuration?: string;
  rateLimitChallengeAndVerify?: number;
  maxEnrolledFactors?: number;
  maxVerifiedFactors?: number;
};

type AuthCaptchaInput = {
  enabled?: boolean;
  secret?: string;
  provider?: string;
};

type AuthInput = {
  smtp?: AuthSMTPInput;
  external?: AuthExternalInput;
  jwt?: AuthJWTInput;
  mailer?: AuthMailerInput;
  sms?: AuthSMSInput;
  mfa?: AuthMFAInput;
  securityCaptcha?: AuthCaptchaInput;
  rateLimitEmailSent?: number;
  rateLimitSmsSent?: number;
  rateLimitVerify?: number;
  rateLimitTokenRefresh?: number;
  rateLimitSso?: number;
};

type InstallInput = {
  waiting?: boolean;
  waitTimeout?: string;
};

export type InstallAuthInput = InstallInput & AuthInput;

type StorageInput = {
  tenantId: string;
};

export type InstallStorageInput = InstallInput & StorageInput;

type PostgrestInput = {
  schemas: string[];
};

export type InstallPostgrestInput = InstallInput & PostgrestInput;

export type InstallVapiInput = {
  vapiId: number;
} & InstallInput;

export type SearchVapisInput = {
  name?: string;
  version?: string;
  projectName?: string;
  pageNum?: number;
  pageSize?: number;
};

export type SearchVapisOutput = {
  releases: VapiRelease[];
  numTotal: number;
  nextPage?: number;
};

export type RegisterVapisInput = {
  projectId: number;
  gitRepo: string;
  gitBranch: string;
};

export type RegisterVapisOutput = {
  name: string;
  version: string;
  deployStatus: 'ok' | 'fail' | 'skip';
  message?: string;
  releaseId: number;
};

export type getProjectsInput = {
  name?: string;
  page?: number;
  perPage?: number;
};
