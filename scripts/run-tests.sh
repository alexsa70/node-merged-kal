#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# run-tests.sh
# Runs Playwright API/E2E tests with Allure reporting.
#
# Usage examples:
#   ./scripts/run-tests.sh
#   ./scripts/run-tests.sh --project=api --grep=smoke
#   ./scripts/run-tests.sh --project=api --testmo
#   ./scripts/run-tests.sh --workers=4
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
PROJECT=""
GREP=""
WORKERS=""
TESTMO_ENABLED=false
UPDATE_SNAPSHOTS=false
ALLURE_DIR="allure-results"
RESULTS_FILE="playwright-results.xml"
EXTRA_FLAGS=""

# ── Parse arguments ───────────────────────────────────────────────────────────
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --project=*)        PROJECT="${1#--project=}";   shift ;;
    --grep=*)           GREP="${1#--grep=}";           shift ;;
    --workers=*)        WORKERS="${1#--workers=}";     shift ;;
    --testmo)           TESTMO_ENABLED=true;            shift ;;
    --update-snapshots) UPDATE_SNAPSHOTS=true;          shift ;;
    --*)                EXTRA_FLAGS+="$1 ";             shift ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
done

# ── Git metadata ──────────────────────────────────────────────────────────────
GIT_COMMIT_ID=${GIT_COMMIT_ID:-$(git rev-parse HEAD 2>/dev/null || echo "N/A")}
GIT_COMMIT_MSG=${GIT_COMMIT_MSG:-$(git log -1 --pretty=%B 2>/dev/null || echo "local")}
GIT_BRANCH=${GIT_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")}
ENVIRONMENT=${ENVIRONMENT:-"qa"}

echo "─── run-tests.sh ────────────────────────────────────────────────────────"
echo "ENVIRONMENT : $ENVIRONMENT"
echo "BRANCH      : $GIT_BRANCH"
echo "COMMIT      : $GIT_COMMIT_ID"
echo "─────────────────────────────────────────────────────────────────────────"

# ── Clean previous Allure results (keep history) ──────────────────────────────
if [ -d "$ALLURE_DIR" ]; then
  find "$ALLURE_DIR" -mindepth 1 -maxdepth 1 -not -name "history" -exec rm -rf {} +
else
  mkdir -p "$ALLURE_DIR"
fi
rm -rf allure-report

# ── Build Playwright command ──────────────────────────────────────────────────
CMD="npx playwright test"
[[ -n "$PROJECT" ]]          && CMD+=" --project=$PROJECT"
[[ -n "$GREP" ]]             && CMD+=" --grep=$GREP"
[[ -n "$WORKERS" ]]          && CMD+=" --workers=$WORKERS"
[[ "$UPDATE_SNAPSHOTS" == "true" ]] && CMD+=" --update-snapshots"
[[ -n "$EXTRA_FLAGS" ]]      && CMD+=" $EXTRA_FLAGS"

echo "Running: $CMD"
set +e
eval "$CMD"
EXIT_CODE=$?
set -e

# ── Write Allure environment.properties ───────────────────────────────────────
mkdir -p "$ALLURE_DIR"
cat > "$ALLURE_DIR/environment.properties" <<EOF
ENVIRONMENT=$ENVIRONMENT
BRANCH=$GIT_BRANCH
COMMIT_ID=$GIT_COMMIT_ID
COMMIT_MESSAGE=$GIT_COMMIT_MSG
EOF
echo "environment.properties written."

# ── Generate Allure report (local only) ───────────────────────────────────────
if command -v allure &>/dev/null && [[ "${CI:-false}" == "false" ]]; then
  echo "Generating Allure report..."
  allure generate "$ALLURE_DIR" -o allure-report --clean
  allure open allure-report || true
fi

# ── Testmo (local only) ───────────────────────────────────────────────────────
if [[ "$TESTMO_ENABLED" == "true" ]] && [[ "${CI:-false}" == "false" ]]; then
  if [[ -z "${TESTMO_API_KEY:-}" ]]; then
    echo "ERROR: TESTMO_API_KEY not set"
    exit 1
  fi
  echo "Submitting to Testmo..."
  export TESTMO_TOKEN="$TESTMO_API_KEY"
  testmo automation:run:submit \
    --instance "https://kaleidoo.testmo.net" \
    --project-id 1 \
    --name "Local | $ENVIRONMENT | $GIT_BRANCH" \
    --source "playwright-$ENVIRONMENT" \
    --results "$RESULTS_FILE"
fi

exit $EXIT_CODE
