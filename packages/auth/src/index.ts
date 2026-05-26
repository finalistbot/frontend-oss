export { AuthProvider, useAuth } from "./core/providers";
export { AuthGuard, useAuthStore } from "./core/auth";
export { getAuthErrorCode } from "./api/auth-client";
export {
  useRequestEmailOTPForm,
  useUpdateUsernameForm,
  useVerifyEmailOTPForm,
} from "./core/auth";
export type {
  AuthErrorCode,
  AuthProviderConfig,
  AuthTokenResponse,
  User as AuthUser,
  EmailOTPChallenge,
  OAuthProvider,
  UsernameAvailability,
} from "./types/auth-types";
export {
  requestEmailOTPSchema,
  updateUsernameSchema,
  verifyEmailOTPSchema,
  type RequestEmailOTPInput,
  type UpdateUsernameInput,
  type VerifyEmailOTPInput,
} from "./schemas/auth-schemas";
