 ---                                                       
  name: gen-test                                                                                                                                                                                                                                                                               
  description: Generate a new Playwright API spec file for a given endpoint and category                                                                                                                                                                                                       
  ---

  Generate a new spec file for the endpoint and category provided by the user.

  Follow these rules:
  1. Create the file at `tests/api/<resource>/<category>.spec.ts`
     - resource = endpoint noun (e.g. /users → user, /org → org)
     - category = positive | negative | security | mfa-flow
  2. Use `import { test, expect } from '../fixtures'`
  3. Import Zod schema from `src/schema/responses/<resource>.ts` if it exists
  4. Name the describe block: `POST /endpoint – Category` (match existing convention)
  5. Use `fakeEmail()`, `fakePassword()`, `fakeOrgName()` — never real credentials
  6. For positive tests: use `authCredentialsOrSkip` from helpers if auth needed
  7. Add 3-5 skeleton tests relevant to the category with `// TODO` placeholders

  Show the file path and content before creating it. Ask for confirmation if unsure about resource name.