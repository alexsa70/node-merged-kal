import { expect } from '@playwright/test';

export function assertStatusCode(actual: number, expected: number): void {
  expect(actual).toBe(expected);
}

export function assertEqual<T>(actual: T, expected: T): void {
  expect(actual).toEqual(expected);
}
