pipeline {
    agent any

    tools {
        allure 'allure_2.34.0'
    }

    parameters {
        booleanParam(name: 'IS_NIGHTLY',    defaultValue: false, description: 'Nightly run?')
        booleanParam(name: 'FORCE_RUN',     defaultValue: false, description: 'Force run all stages')
        booleanParam(name: 'ENABLE_TESTMO', defaultValue: false, description: 'Enable Testmo submission?')
        booleanParam(name: 'FORCE_BUILD',   defaultValue: false, description: 'Force Docker image rebuild?')
        choice(
            name: 'ENVIRONMENT',
            choices: ['qa', 'prod', 'on_premise', 'it'],
            description: 'Target environment'
        )
    }

    environment {
        DOCKER_IMAGE        = "kal-sense-playwright:latest"
        ALLURE_RESULTS_DIR  = "allure-results"
        RESULTS_FILE        = "playwright-results.xml"
        ENVIRONMENT         = "${params.ENVIRONMENT}"
        ENABLE_TESTMO       = "${params.ENABLE_TESTMO}"

        // ── Credentials ──────────────────────────────────────────────────────
        TESTMO_API_KEY                       = credentials('TESTMO_API_KEY')
        AUTH_CREDENTIALS_EMAIL               = credentials('AUTH_CREDENTIALS_EMAIL')
        AUTH_CREDENTIALS_PASSWORD            = credentials('AUTH_CREDENTIALS_PASSWORD')
        AUTH_CREDENTIALS_OTP_SECRET          = credentials('AUTH_CREDENTIALS_OTP_SECRET')
        AUTH_CREDENTIALS_SUPER_ADMIN_EMAIL   = credentials('AUTH_CREDENTIALS_SUPER_ADMIN_EMAIL')
        AUTH_CREDENTIALS_SUPER_ADMIN_PASSWORD = credentials('AUTH_CREDENTIALS_SUPER_ADMIN_PASSWORD')
        AUTH_CREDENTIALS_ADMIN_EMAIL         = credentials('AUTH_CREDENTIALS_ADMIN_EMAIL')
        AUTH_CREDENTIALS_ADMIN_PASSWORD      = credentials('AUTH_CREDENTIALS_ADMIN_PASSWORD')
        AUTH_CREDENTIALS_USER_EMAIL          = credentials('AUTH_CREDENTIALS_USER_EMAIL')
        AUTH_CREDENTIALS_USER_PASSWORD       = credentials('AUTH_CREDENTIALS_USER_PASSWORD')
        // ── QA ───────────────────────────────────────────────────────────────
        QA_API_URL          = credentials('QA_API_URL')
        QA_ORG_NAME         = credentials('QA_ORG_NAME')
        QA_ORG_ID           = credentials('QA_ORG_ID')
        QA_ADMIN_ID         = credentials('QA_ADMIN_ID')
        QA_ADMIN_EMAIL      = credentials('QA_ADMIN_EMAIL')
        QA_REGULAR_ID       = credentials('QA_REGULAR_ID')
        QA_REGULAR_EMAIL    = credentials('QA_REGULAR_EMAIL')
        // ── Prod ─────────────────────────────────────────────────────────────
        PROD_API_URL        = credentials('PROD_API_URL')
        PROD_ORG_ID         = credentials('PROD_ORG_ID')
        PROD_ADMIN_EMAIL    = credentials('PROD_ADMIN_EMAIL')
        PROD_ADMIN_ID       = credentials('PROD_ADMIN_ID')
        PROD_REGULAR_EMAIL  = credentials('PROD_REGULAR_EMAIL')
        PROD_REGULAR_ID     = credentials('PROD_REGULAR_ID')
        // ── On-Prem ──────────────────────────────────────────────────────────
        ONPREM_API_URL       = credentials('ONPREM_API_URL')
        ONPREM_ORG_ID        = credentials('ONPREM_ORG_ID')
        ONPREM_ADMIN_EMAIL   = credentials('ONPREM_ADMIN_EMAIL')
        ONPREM_ADMIN_ID      = credentials('ONPREM_ADMIN_ID')
        ONPREM_REGULAR_EMAIL = credentials('ONPREM_REGULAR_EMAIL')
        ONPREM_REGULAR_ID    = credentials('ONPREM_REGULAR_ID')
        // ── GCS ──────────────────────────────────────────────────────────────
        GCS_BUCKET_NAME          = credentials('GCS_BUCKET_NAME')
        GCS_SERVICE_ACCOUNT_JSON = credentials('GCS_SERVICE_ACCOUNT_JSON')
    }

    stages {

        // ── Git metadata ─────────────────────────────────────────────────────
        stage('Extract Git Metadata') {
            steps {
                script {
                    env.GIT_COMMIT_ID      = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.GIT_COMMIT_MESSAGE = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_BRANCH         = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT_ID}"
                }
            }
        }

        // ── Build Docker image ────────────────────────────────────────────────
        stage('Build Docker Image') {
            when {
                anyOf {
                    expression { params.FORCE_BUILD }
                    expression { params.IS_NIGHTLY }
                    changeset 'src/**'
                    changeset 'tests/**'
                    changeset 'package*.json'
                    changeset 'Dockerfile'
                    expression {
                        env.GIT_COMMIT_MESSAGE?.contains('--build')
                    }
                }
            }
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        // ── TypeScript type check ─────────────────────────────────────────────
        stage('Type Check') {
            when { expression { shouldRunCI() } }
            steps {
                sh """
                    docker run --rm ${DOCKER_IMAGE} bash -c "npx tsc --noEmit"
                """
            }
        }

        // ── Run tests in parallel ─────────────────────────────────────────────
        stage('Run Tests') {
            options { timeout(time: 60, unit: 'MINUTES') }
            when { expression { shouldRunCI() } }

            steps {
                script {
                    def envVars = buildEnvVars()
                    def containerApi = "ksp_api_${env.BUILD_ID}"
                    def containerE2e = "ksp_e2e_${env.BUILD_ID}"

                    def containerVisual = "ksp_visual_${env.BUILD_ID}"

                    parallel(
                        apiTests: {
                            script {
                                def commitMsg = env.GIT_COMMIT_MESSAGE ?: ''
                                if (commitMsg.contains('skip-api')) {
                                    echo "Skipping API tests (skip-api in commit)"
                                    return
                                }
                                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                    sh """
                                        docker run --name ${containerApi} ${envVars} ${DOCKER_IMAGE} bash -c \
                                            "chmod +x scripts/run-tests.sh && scripts/run-tests.sh --project=api"
                                    """
                                }
                                sh "docker cp ${containerApi}:/app/allure-results $WORKSPACE/allure-results-api || true"
                                sh "docker cp ${containerApi}:/app/playwright-results.xml $WORKSPACE/playwright-results-api.xml || true"
                                sh "docker rm -f ${containerApi} || true"
                            }
                        },
                        e2eTests: {
                            script {
                                def commitMsg = env.GIT_COMMIT_MESSAGE ?: ''
                                if (commitMsg.contains('skip-ui') || commitMsg.contains('skip-e2e')) {
                                    echo "Skipping E2E tests"
                                    return
                                }
                                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                    sh """
                                        docker run --name ${containerE2e} ${envVars} ${DOCKER_IMAGE} bash -c \
                                            "chmod +x scripts/run-tests.sh && scripts/run-tests.sh --project=e2e"
                                    """
                                }
                                sh "docker cp ${containerE2e}:/app/allure-results $WORKSPACE/allure-results-e2e || true"
                                sh "docker cp ${containerE2e}:/app/playwright-results.xml $WORKSPACE/playwright-results-e2e.xml || true"
                                sh "docker rm -f ${containerE2e} || true"
                            }
                        },
                        visualTests: {
                            script {
                                def commitMsg = env.GIT_COMMIT_MESSAGE ?: ''
                                if (commitMsg.contains('skip-visual')) {
                                    echo "Skipping Visual tests (skip-visual in commit)"
                                    return
                                }
                                def updateFlag = commitMsg.contains('--update-snapshots') ? '--update-snapshots' : ''
                                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                    sh """
                                        docker run --name ${containerVisual} ${envVars} ${DOCKER_IMAGE} bash -c \
                                            "chmod +x scripts/run-tests.sh && scripts/run-tests.sh --project=visual ${updateFlag}"
                                    """
                                }
                                sh "docker cp ${containerVisual}:/app/allure-results $WORKSPACE/allure-results-visual || true"
                                sh "docker cp ${containerVisual}:/app/playwright-results.xml $WORKSPACE/playwright-results-visual.xml || true"
                                sh "docker rm -f ${containerVisual} || true"
                            }
                        }
                    )

                    // Merge allure results
                    sh """
                        mkdir -p ${ALLURE_RESULTS_DIR}
                        cp -r allure-results-api/* ${ALLURE_RESULTS_DIR}/ || true
                        cp -r allure-results-e2e/* ${ALLURE_RESULTS_DIR}/ || true
                        cp -r allure-results-visual/* ${ALLURE_RESULTS_DIR}/ || true
                    """

                    // Write environment.properties
                    sh """
                        cat > ${ALLURE_RESULTS_DIR}/environment.properties <<EOF
ENVIRONMENT=${ENVIRONMENT}
BRANCH=${env.GIT_BRANCH}
COMMIT_ID=${env.GIT_COMMIT_ID}
JENKINS_BUILD=${env.BUILD_NUMBER}
EOF
                    """

                    // Merge JUnit XML
                    sh """
                        python3 -c "
import xml.etree.ElementTree as ET, sys, glob, os

files = [f for f in ['playwright-results-api.xml', 'playwright-results-e2e.xml', 'playwright-results-visual.xml'] if os.path.exists(f)]
if not files:
    print('No result files found')
    sys.exit(0)

root = ET.Element('testsuites')
for f in files:
    tree = ET.parse(f)
    for suite in tree.getroot():
        root.append(suite)

ET.ElementTree(root).write('${RESULTS_FILE}', encoding='utf-8', xml_declaration=True)
print(f'Merged {len(files)} result files into ${RESULTS_FILE}')
"
                    """
                }
            }

            post {
                always {
                    script {
                        if (fileExists("${RESULTS_FILE}")) {
                            archiveArtifacts artifacts: "${RESULTS_FILE}", fingerprint: true
                        }
                        if (fileExists("${ALLURE_RESULTS_DIR}")) {
                            archiveArtifacts artifacts: "${ALLURE_RESULTS_DIR}/**", fingerprint: true
                        }
                    }
                }
            }
        }

        // ── Publish Allure Report ─────────────────────────────────────────────
        stage('Publish Allure Report') {
            when {
                expression { fileExists("${ALLURE_RESULTS_DIR}") }
            }
            steps {
                allure([
                    includeProperties: true,
                    jdk: '',
                    results: [[path: "${ALLURE_RESULTS_DIR}"]]
                ])
            }
        }

        // ── Upload Allure to GCS ──────────────────────────────────────────────
        stage('Upload Allure to GCS') {
            when {
                expression { fileExists("${env.WORKSPACE}/allure-report/index.html") }
            }
            steps {
                sh """
                    echo '${GCS_SERVICE_ACCOUNT_JSON}' | gcloud auth activate-service-account --key-file=-
                    gsutil -m rsync -r allure-report/ gs://${GCS_BUCKET_NAME}/node/allure-report
                """
            }
        }

        // ── Testmo ────────────────────────────────────────────────────────────
        stage('Submit to Testmo') {
            when {
                expression {
                    (params.ENABLE_TESTMO || params.IS_NIGHTLY || env.GIT_COMMIT_MESSAGE?.contains('--testmo')) &&
                    fileExists("${RESULTS_FILE}")
                }
            }
            steps {
                sh """
                    export TESTMO_TOKEN="${TESTMO_API_KEY}"
                    testmo automation:run:submit \
                      --instance "https://kaleidoo.testmo.net" \
                      --project-id 1 \
                      --name "CI Run #${env.BUILD_NUMBER} | ${ENVIRONMENT}" \
                      --source "playwright-${ENVIRONMENT}" \
                      --results ${RESULTS_FILE}
                """
            }
        }
    }

    post {
        always {
            cleanWs()
            echo 'Workspace cleaned.'
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

def shouldRunCI() {
    if (params.IS_NIGHTLY || params.FORCE_RUN) return true

    def msg = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
    if (msg.contains('skip-ci')) { echo 'Skipping CI (skip-ci flag)'; return false }
    if (msg.contains('run-ci'))  { echo 'Forcing CI (run-ci flag)';   return true  }

    def branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
    return ['main', 'master', 'origin/main', 'origin/master'].contains(branch) || env.CHANGE_ID != null
}

def buildEnvVars() {
    return [
        "-e CI=true",
        "-e ENVIRONMENT='${ENVIRONMENT}'",
        "-e GIT_BRANCH='${env.GIT_BRANCH}'",
        "-e GIT_COMMIT_ID='${env.GIT_COMMIT_ID}'",
        "-e GIT_COMMIT_MSG='${env.GIT_COMMIT_MESSAGE}'",
        // Credentials
        "-e 'AUTH_CREDENTIALS.EMAIL=${AUTH_CREDENTIALS_EMAIL}'",
        "-e 'AUTH_CREDENTIALS.PASSWORD=${AUTH_CREDENTIALS_PASSWORD}'",
        "-e 'AUTH_CREDENTIALS.OTP_SECRET=${AUTH_CREDENTIALS_OTP_SECRET}'",
        "-e 'AUTH_CREDENTIALS_SUPER_ADMIN.EMAIL=${AUTH_CREDENTIALS_SUPER_ADMIN_EMAIL}'",
        "-e 'AUTH_CREDENTIALS_SUPER_ADMIN.PASSWORD=${AUTH_CREDENTIALS_SUPER_ADMIN_PASSWORD}'",
        "-e 'AUTH_CREDENTIALS_ADMIN.EMAIL=${AUTH_CREDENTIALS_ADMIN_EMAIL}'",
        "-e 'AUTH_CREDENTIALS_ADMIN.PASSWORD=${AUTH_CREDENTIALS_ADMIN_PASSWORD}'",
        "-e 'AUTH_CREDENTIALS_USER.EMAIL=${AUTH_CREDENTIALS_USER_EMAIL}'",
        "-e 'AUTH_CREDENTIALS_USER.PASSWORD=${AUTH_CREDENTIALS_USER_PASSWORD}'",
        // QA
        "-e QA_API_URL='${QA_API_URL}'",
        "-e QA_ORG_NAME='${QA_ORG_NAME}'",
        "-e QA_ORG_ID='${QA_ORG_ID}'",
        "-e QA_ADMIN_ID='${QA_ADMIN_ID}'",
        "-e QA_ADMIN_EMAIL='${QA_ADMIN_EMAIL}'",
        "-e QA_REGULAR_ID='${QA_REGULAR_ID}'",
        "-e QA_REGULAR_EMAIL='${QA_REGULAR_EMAIL}'",
        // Prod
        "-e PROD_API_URL='${PROD_API_URL}'",
        "-e PROD_ORG_ID='${PROD_ORG_ID}'",
        "-e PROD_ADMIN_EMAIL='${PROD_ADMIN_EMAIL}'",
        "-e PROD_ADMIN_ID='${PROD_ADMIN_ID}'",
        "-e PROD_REGULAR_EMAIL='${PROD_REGULAR_EMAIL}'",
        "-e PROD_REGULAR_ID='${PROD_REGULAR_ID}'",
        // On-Prem
        "-e ONPREM_API_URL='${ONPREM_API_URL}'",
        "-e ONPREM_ORG_ID='${ONPREM_ORG_ID}'",
        "-e ONPREM_ADMIN_EMAIL='${ONPREM_ADMIN_EMAIL}'",
        "-e ONPREM_ADMIN_ID='${ONPREM_ADMIN_ID}'",
        "-e ONPREM_REGULAR_EMAIL='${ONPREM_REGULAR_EMAIL}'",
        "-e ONPREM_REGULAR_ID='${ONPREM_REGULAR_ID}'",
    ].join(" ")
}
