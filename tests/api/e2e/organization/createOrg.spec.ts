import { test, expect, requireAuthToken } from '../../fixtures';
import { fakeDomain, fakeEmail, fakeFirstName, fakeLastName, fakeOrgName, fakeUsername } from '../../../../src/tools/fakers';
import type { AppSettings } from '../../../../src/config/settings';

const VALID_COLORS = [
  'blue', 'mint', 'green', 'yellow', 'orange', 'red',
  'lightGrey', 'grey', 'black', 'electricBlue', 'royalPurple', 'pink',
];

const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const GIF_BYTES = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
  0x00, 0x3b,
]);