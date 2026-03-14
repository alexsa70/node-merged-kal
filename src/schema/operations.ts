export type LoginRequest = {
  orgName: string;
  identity: string;
  password: string;
  otp_code?: string;
};

export type SSOLoginRequest = {
  orgName: string;
  code: string;
  redirect_uri: string;
  provider: string;
  code_verifier?: string;
};

export type ResetPasswordRequest = {
  email: string;
  org_name?: string;
};
