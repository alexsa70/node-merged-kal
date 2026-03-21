import { BaseClient, PlaywrightHttpClient } from './baseClient';
import { AuthClient } from './resources/authClient';
import { OrgClient } from './resources/orgClient';
import { UserClient } from './resources/userClient';
import { TagClient } from './resources/tagClient';
import { FileClient } from './resources/fileClient';
import { ProjectClient } from './resources/projectClient';
import { GeneralClient } from './resources/generalClient';

export class ApiClient extends BaseClient {
  readonly auth: AuthClient;
  readonly org: OrgClient;
  readonly user: UserClient;
  readonly tag: TagClient;
  readonly file: FileClient;
  readonly project: ProjectClient;
  readonly general: GeneralClient;

  constructor(http: PlaywrightHttpClient) {
    super(http);
    this.auth = new AuthClient(http);
    this.org = new OrgClient(http);
    this.user = new UserClient(http);
    this.tag = new TagClient(http);
    this.file = new FileClient(http);
    this.project = new ProjectClient(http);
    this.general = new GeneralClient(http);
  }
}
