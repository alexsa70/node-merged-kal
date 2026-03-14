export type RoleName = 'super_admin' | 'admin' | 'user';

export type AccessRule = {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  allowedRoles: RoleName[];
  deniedRoles: RoleName[];
  expectedAllowedStatus?: number;
  expectedDeniedStatus?: number;
  jsonBody?: Record<string, unknown>;
  data?: Record<string, unknown>;
  params?: Record<string, string | number | boolean>;
};
