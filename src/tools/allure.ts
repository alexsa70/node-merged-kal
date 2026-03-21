import { allure } from 'allure-playwright';

export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  let result!: T;
  await allure.step(name, async () => {
    result = await fn();
  });
  return result;
}

export async function attachJson(name: string, data: unknown): Promise<void> {
  await allure.attachment(name, JSON.stringify(data, null, 2), 'application/json');
}

export async function attachText(name: string, text: string): Promise<void> {
  await allure.attachment(name, text, 'text/plain');
}
