---
name: User Focus - UI/Visual Testing
description: Primary focus is e2e and visual tests; API tests are helpers only; needs multi-environment support for Cloud (Azure) and OnPrem
type: project
---

Primary focus: `e2e` and `visual` Playwright projects. API tests (`api`, `api-e2e`) are secondary — used only to set up state for UI tests.

Target environments: Cloud (Azure) and OnPrem (possibly a third). Maps to existing `environments.ts` entries: `qa`/`prod` = Cloud, `on_premise` = OnPrem.

**Why:** User explicitly stated this priority at session start.

**How to apply:** When suggesting improvements or new tests, prioritize UI/Visual coverage. Frame API utilities as helpers, not standalone test suites.
