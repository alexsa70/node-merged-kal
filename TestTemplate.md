# Test Template: Add New API Endpoint + Tests

This guide shows how to add a new endpoint client method and a new test in this project.

## 1. Add Route Constant

Edit route file in `src/tools/routes/`:

- Use existing file (`auth.ts`, `org.ts`, `users.ts`) or create a new one.
- Add a constant in the same style.

Example:

```ts
export const BillingRoutes = {
  BILLING_GET_INVOICE: '/api/billing/get_invoice',
} as const;
```

If you created a new route file, export it from `src/tools/routes/index.ts`.

## 2. Add Client Method

Edit `src/clients/operationsClient.ts`.

- Add a method on `APIClient`.
- Pass token header if endpoint is protected.
- Use `post/get/patch/delete` helpers.

Example:

```ts
async billingGetInvoice(payload: Record<string, unknown>, token: string) {
  return this.post(BillingRoutes.BILLING_GET_INVOICE, payload, undefined, undefined, {
    Authorization: `Bearer ${token}`,
  });
}
```

## 3. Add/Update Types (Optional but Recommended)

If needed, add request/response types in `src/schema/`.

Example:

```ts
export type GetInvoiceRequest = { invoice_id: string };
```

## 4. Create Test File

Create a spec under the right folder, for example:

- `tests/api/billing/get-invoice.spec.ts`

Start from this template:

```ts
import { test, expect, requireAuthToken } from '../fixtures';

test.describe('Billing /api/billing/get_invoice', () => {
  test('get invoice -> 200', async ({ apiClient, authState }) => {
    const token = requireAuthToken(authState);

    const response = await apiClient.post(
      '/api/billing/get_invoice',
      { invoice_id: 'invoice-123' },
      undefined,
      undefined,
      { Authorization: `Bearer ${token}` },
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeTruthy();
  });
});
```

## 5. Choose Auth Strategy

- For protected endpoints: use `requireAuthToken(authState)`.
- For `/login` endpoint tests: do not use shared auth token.
- For role-based checks: use `tokensByRole` fixture.

## 6. Add RBAC Rule (If Applicable)

If endpoint needs role matrix coverage:

- Add rule to `tests/api/rbac/policy/*.ts`.
- Use placeholders (`$USER_ID`, `$ORG_NAME`, etc.) when needed.
- `tests/api/rbac/access-matrix.spec.ts` will pick it up automatically.

## 7. Run Tests

```bash
npm run test:api
# or
npx playwright test tests/api/billing --project=api
```

## 8. Debug Checklist

- Verify `.env` values are set.
- Check token exists in `.auth/default-token.json`.
- Confirm endpoint path and payload format.
- Inspect Playwright HTML report (`npm run report`).
