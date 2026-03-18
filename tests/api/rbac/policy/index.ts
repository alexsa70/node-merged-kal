
import { ACCESS_POLICY_AUTH } from './auth';
import { ACCESS_POLICY_ORG } from './org';
import { ACCESS_POLICY_USER } from './user';

export const ACCESS_POLICY = [
  ...ACCESS_POLICY_AUTH,
  ...ACCESS_POLICY_ORG,
  ...ACCESS_POLICY_USER,
];