import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  user_name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  role_id: z.string(),
  email: z.email(),
  keycloak_uid: z.string(),
  status: z.string(),
  creation_date: z.string(),
  created_by: z.string(),
  user_image: z.string().nullable(),
  user_type: z.string(),
  color: z.string(),
  conversations: z.array(z.unknown()),
});

const OrgSchema = z.looseObject({
  id: z.string(),
  org_name: z.string(),
  admin_email: z.string(),
});

export const LoginSuccessSchema = z.object({
  token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  user: UserSchema,
  org: OrgSchema,
});

export const LoginMfaRequiredSchema = z.object({
  mfa_required: z.literal(true),
  message: z.string(),
});

export const LoginResponseSchema = z.union([
  LoginSuccessSchema,
  LoginMfaRequiredSchema,
]);

export const LoginErrorSchema = z.object({
  message: z.string(),
});

export type LoginSuccess = z.infer<typeof LoginSuccessSchema>;
export type LoginMfaRequired = z.infer<typeof LoginMfaRequiredSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
