import { APIResponse } from '@playwright/test';
import { BaseClient } from '../baseClient';
import { TagRoutes } from '../../tools/routes';
import { step } from '../../tools/allure';

export type TagType = 'project' | 'album' | 'regular';

export class TagClient extends BaseClient {
  async getTags(orgId: string, tagType?: TagType): Promise<APIResponse> {
    return step('Get tags', async () => {
      const body: Record<string, unknown> = { org_id: orgId };
      if (tagType) body.tag_type = tagType;
      return this.post(TagRoutes.GET_TAGS, body);
    });
  }

  async createTag(orgId: string, name: string, tagType: TagType = 'project'): Promise<APIResponse> {
    return step(`Create tag: ${name}`, async () => {
      return this.post(TagRoutes.CREATE_TAG, { name, org_id: orgId, tag_type: tagType });
    });
  }

  async updateTag(orgId: string, tagId: string, name: string, tagType: TagType = 'project'): Promise<APIResponse> {
    return step(`Update tag: ${tagId}`, async () => {
      return this.post(TagRoutes.UPDATE_TAG, {
        org_id: orgId,
        tag_list: [{ id: tagId, name, action_type: 'edit_name', tag_type: tagType }],
        project_actions: true,
      });
    });
  }

  async deleteTags(orgId: string, tagIds: string | string[]): Promise<APIResponse> {
    const ids = Array.isArray(tagIds) ? tagIds : [tagIds];
    return step(`Delete tags: ${ids.join(', ')}`, async () => {
      return this.post(TagRoutes.DELETE_TAGS, {
        org_id: orgId,
        tag_ids: ids,
        project_actions: true,
      });
    });
  }

  async getTagIdByName(orgId: string, name: string, tagType: TagType = 'project'): Promise<string | undefined> {
    const response = await this.getTags(orgId, tagType);
    const body = (await response.json()) as { tags: Array<{ id: string; name: string }> };
    return body.tags?.find((t) => t.name === name)?.id;
  }
}
