import { APIResponse } from '@playwright/test';
import { BaseClient } from '../baseClient';
import { GeneralRoutes } from '../../tools/routes';
import { step } from '../../tools/allure';

export class GeneralClient extends BaseClient {
  async getAvailableLlms(orgId: string, token: string): Promise<APIResponse> {
    return step('Get available LLMs', async () => {
      return this.post(GeneralRoutes.GET_AVAILABLE_LLMS, { org_id: orgId }, undefined, undefined, {
        Authorization: `Bearer ${token}`,
      });
    });
  }

  async getAllAutomations(orgId: string, token: string): Promise<APIResponse> {
    return step('Get all automations', async () => {
      return this.post(GeneralRoutes.GET_ALL_AUTOMATIONS, { org_id: orgId }, undefined, undefined, {
        Authorization: `Bearer ${token}`,
      });
    });
  }

  async getAllProjectTypes(orgId: string, token: string): Promise<APIResponse> {
    return step('Get all project types', async () => {
      return this.post(GeneralRoutes.GET_ALL_PROJECT_TYPES, { org_id: orgId }, undefined, undefined, {
        Authorization: `Bearer ${token}`,
      });
    });
  }

  async getRoles(orgId: string, token: string): Promise<APIResponse> {
    return step('Get roles', async () => {
      return this.post(GeneralRoutes.GET_ROLES, { org_id: orgId }, undefined, undefined, {
        Authorization: `Bearer ${token}`,
      });
    });
  }

  async getUserConversations(orgId: string, token: string): Promise<APIResponse> {
    return step('Get user conversations', async () => {
      return this.post(GeneralRoutes.GET_USER_CONVERSATIONS, { org_id: orgId }, undefined, undefined, {
        Authorization: `Bearer ${token}`,
      });
    });
  }
}
