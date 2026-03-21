import dotenv from 'dotenv';

dotenv.config();

export type Environment = 'qa' | 'prod' | 'on_premise' | 'it';

export type EnvData = {
  apiUrl: string;
  uiUrl: string;
  orgName: string;
  orgId: string;
  adminId: string;
  adminEmail: string;
  regularId: string;
  regularEmail: string;
  productIds: {
    kalAudio: string;
    kalDocs: string;
    kalMedia: string;
    table: string;
  };
  projectTypeIds: {
    liveCall: string;
    file: string;
    table: string;
    structured: string;
    unstructured: string;
    media: string;
  };
  roleIds: {
    admin: string;
    user: string;
  };
};

function e(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

const QA_ENV: EnvData = {
  apiUrl: e('QA_API_URL', 'https://api.qa.example.com'),
  uiUrl: e('QA_UI_URL', 'https://qa.example.com'),
  orgName: e('QA_ORG_NAME', 'automation'),
  orgId: e('QA_ORG_ID', '6819f4ac17826e64445c9003'),
  adminId: e('QA_ADMIN_ID', ''),
  adminEmail: e('QA_ADMIN_EMAIL', ''),
  regularId: e('QA_REGULAR_ID', ''),
  regularEmail: e('QA_REGULAR_EMAIL', ''),
  productIds: {
    kalAudio: '66c5d1625056264c11880a90',
    kalDocs: '66c5d1625056264c11880a91',
    kalMedia: '66c5d1625056264c11880a93',
    table: '6862728dc3a978ebcd56b6de',
  },
  projectTypeIds: {
    liveCall: '66c5d1635056264c11880a94',
    file: '66c5d1645056264c11880a95',
    table: '6862728ec3a978ebcd56b6df',
    structured: '66c5d1645056264c11880a96',
    unstructured: '66c5d1645056264c11880a97',
    media: '67a1ed468475e1efa50a38d8',
  },
  roleIds: {
    admin: '66c5d162cd712ec8391e89c4',
    user: '66c5d162cd712ec8391e89c5',
  },
};

const PROD_ENV: EnvData = {
  apiUrl: e('PROD_API_URL', 'https://api.prod.example.com'),
  uiUrl: e('PROD_UI_URL', 'https://app.example.com'),
  orgName: e('PROD_ORG_NAME', 'kaleidoo'),
  orgId: e('PROD_ORG_ID', '6819f4ac17826e64445c9003'),
  adminId: e('PROD_ADMIN_ID', ''),
  adminEmail: e('PROD_ADMIN_EMAIL', ''),
  regularId: e('PROD_REGULAR_ID', ''),
  regularEmail: e('PROD_REGULAR_EMAIL', ''),
  productIds: {
    kalAudio: '672cdc2dabc5d05e9cbf8a94',
    kalDocs: '672cdc2eabc5d05e9cbf8a95',
    kalMedia: '672cdc2eabc5d05e9cbf8a97',
    table: '6877533b732e05c57ae86f85',
  },
  projectTypeIds: {
    liveCall: '672cdc2fabc5d05e9cbf8a98',
    file: '672cdc2fabc5d05e9cbf8a99',
    table: '6877533c732e05c57ae86f86',
    structured: '672cdc2fabc5d05e9cbf8a9a',
    unstructured: '672cdc2fabc5d05e9cbf8a9b',
    media: '672cdc30abc5d05e9cbf8a9d',
  },
  roleIds: {
    admin: '672cd9b480382a5a38039135',
    user: '672cd9b480382a5a38039136',
  },
};

const ON_PREMISE_ENV: EnvData = {
  apiUrl: e('ONPREM_API_URL', 'https://api.onprem.example.com'),
  uiUrl: e('ONPREM_UI_URL', 'https://onprem.example.com'),
  orgName: e('ONPREM_ORG_NAME', 'automation'),
  orgId: e('ONPREM_ORG_ID', '6819f4ac17826e64445c9003'),
  adminId: e('ONPREM_ADMIN_ID', ''),
  adminEmail: e('ONPREM_ADMIN_EMAIL', ''),
  regularId: e('ONPREM_REGULAR_ID', ''),
  regularEmail: e('ONPREM_REGULAR_EMAIL', ''),
  productIds: {
    kalAudio: '67f4c950ad3c451bd558ac69',
    kalDocs: '67f4c950ad3c451bd558ac6a',
    kalMedia: '67f4c950ad3c451bd558ac6b',
    table: '6862728dc3a978ebcd56b6de',
  },
  projectTypeIds: {
    liveCall: '67f4c950ad3c451bd558ac6c',
    file: '67f4c950ad3c451bd558ac6d',
    table: '6862728ec3a978ebcd56b6df',
    structured: '67f4c950ad3c451bd558ac6e',
    unstructured: '67f4c950ad3c451bd558ac6f',
    media: '',
  },
  roleIds: {
    admin: '67f4c6ff473ec403ec75485b',
    user: '67f4c6ff473ec403ec75485c',
  },
};

const IT_ENV: EnvData = {
  apiUrl: e('IT_API_URL', 'https://api.it.example.com'),
  uiUrl: e('IT_UI_URL', 'https://it.example.com'),
  orgName: e('IT_ORG_NAME', 'automation'),
  orgId: e('IT_ORG_ID', ''),
  adminId: e('IT_ADMIN_ID', ''),
  adminEmail: e('IT_ADMIN_EMAIL', ''),
  regularId: e('IT_REGULAR_ID', ''),
  regularEmail: e('IT_REGULAR_EMAIL', ''),
  productIds: {
    kalAudio: '',
    kalDocs: '',
    kalMedia: '',
    table: '',
  },
  projectTypeIds: {
    liveCall: '',
    file: '',
    table: '',
    structured: '',
    unstructured: '',
    media: '',
  },
  roleIds: {
    admin: '',
    user: '',
  },
};

const ENV_MAP: Record<Environment, EnvData> = {
  qa: QA_ENV,
  prod: PROD_ENV,
  on_premise: ON_PREMISE_ENV,
  it: IT_ENV,
};

export function getEnvData(environment: string): EnvData {
  const env = environment as Environment;
  return ENV_MAP[env] ?? QA_ENV;
}
