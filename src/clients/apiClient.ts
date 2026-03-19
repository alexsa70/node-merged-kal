import { BaseClient, PlaywrightHttpClient } from './baseClient';
import { AuthClient } from './resources/authClient';
import { OrgClient } from './resources/orgClient';
import { UserClient } from './resources/userClient';

export class ApiClient extends BaseClient {
  readonly auth: AuthClient;
  readonly org: OrgClient;
  readonly user: UserClient;

  constructor(http: PlaywrightHttpClient) {
    super(http);
    this.auth = new AuthClient(http);
    this.org = new OrgClient(http);
    this.user = new UserClient(http);
  }
}
