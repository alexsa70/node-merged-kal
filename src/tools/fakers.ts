import { faker } from '@faker-js/faker';

export function fakeEmail(): string {
  return faker.internet.email().toLowerCase();
}

export function fakeOrgName(): string {
  return `${faker.word.noun()}-${faker.word.noun()}`.toLowerCase().replace(/\s+/g, '-');
}

export function fakeDomain(): string {
  return faker.internet.domainName().toLowerCase();
}

export function fakeUsername(): string {
  return faker.internet.username().toLowerCase();
}

export function fakeFirstName(): string {
  return faker.person.firstName();
}

export function fakeLastName(): string {
  return faker.person.lastName();
}

export function fakePassword(length = 12): string {
  return faker.internet.password({ length });
}
