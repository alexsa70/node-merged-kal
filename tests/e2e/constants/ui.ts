export const UiEndpoints = {
  assist: '/assist',
  history: '/history',
  historyFull: '/conversation/history',
  results: '/conversation',
  collections: '/projects',
  documents: '/doc/files',
  audio: '/audio/files',
  tables: '/tables/files',
  settings: '/user/settings',
  mediaGallery: '/media/files',
  mediaAlbums: '/media/albums',
  connectors: '/admins/connectors',
  automations: '/admins/automations',
  organization: '/admins/organization',
} as const;

export const UiLocators = {
  common: {
    pageLoader: '[role="status"]',
    skeletonLoader: '[class*="SkeletonFile"]',
    // date filter trigger — supports both old and new test id patterns
    dateDropdown: '[data-testid$="-date-picker-button"], [data-testid*="date-filter-trigger-button"]',
    availableDayButton: '[class^="DatePicker_dayButton__"]',
    applyDateButton: '[data-testid*="date-filter-apply-button"], [class^="DatePicker_selectButton__"]',
    searchBarInput: '[data-testid="search-bar-input"]',
    pageTitle: '[data-testid="page-title"]',
    confirmButton: '[data-testid="confirm-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    globalModal: '[data-testid="global-modal"]',
  },
  login: {
    usernameInput: '[data-testid="new-login-page-login-card-form-email-input"]',
    passwordInput: '[data-testid="new-login-page-login-card-form-password-input"]',
    submitButton: '[data-testid="new-login-page-login-card-form-submit"]',
    errorMessage: '[data-testid="new-login-page-login-card-form-error"]',
  },
  assist: {
    welcomeTitle: '[data-testid="assist-welcome-message"]',
  },
  settings: {
    container: '[data-testid="new-user-settings-page"]',
    content: '[data-testid="new-user-settings-page-content"]',
    profileSection: '[data-testid="new-user-settings-page-profile-section"]',
    userInfo: '[data-testid="new-user-settings-page-profile-user-info"]',
    usernameInput: '[data-testid="username"]',
    saveButton: '[data-testid="save-changes-btn"]',
  },
  toast: {
    title: '[data-testid="toast-title"]',
    message: '[data-testid="toast-message"]',
  },
  chat: {
    textarea: '[data-testid="chat-input-textarea"]',
    submitButton: '[data-testid="chat-input-submit-button"]',
    conversations: '[data-testid="search-res-page-chat-conversations"]',
    processingLoader: '[class*="SearchRes_waitingMessage__"]',
  },
  sidebar: {
    assistBtn: '[data-testid="sidebar-nav-assist-button"]',
    historyBtn: '[data-testid="sidebar-nav-conversation-button"]',
    collectionsBtn: '[data-testid="sidebar-nav-projects-button"]',
    documentsBtn: '[data-testid="sidebar-nav-doc-button"]',
    audioBtn: '[data-testid="sidebar-nav-audio-button"]',
    tablesBtn: '[data-testid="sidebar-nav-tables-button"]',
    mediaBtn: '[data-testid="sidebar-nav-media-button"]',
    mediaGalleryBtn: '[data-testid="sidebar-nav-media-files"]',
    mediaAlbumsBtn: '[data-testid="sidebar-nav-media-albums"]',
    seeAllHistoryBtn: '[data-testid="sidebar-nav-conversation-history"]',
    adminsBtn: '[data-testid="sidebar-nav-admins-button"]',
    connectorsBtn: '[data-testid="sidebar-nav-admins-connectors"]',
    automationsBtn: '[data-testid="sidebar-nav-admins-automations"]',
    organizationBtn: '[data-testid="sidebar-nav-admins-organization"]',
    toggleBtn: '[data-testid="sidebar-toggle"]',
    container: '[data-testid="sidebar"]',
    userSection: '[data-testid="sidebar-bottom"]',
    // clicking this navigates directly to user settings — no secondary settingsButton click needed
    userAvatar: '[data-testid="sidebar-user-button"]',
    settingsButton: '[data-testid="settings-button"]', // TODO: may be gone — verify navigation flow
  },
  filesBar: {
    // generic selectors that work for any file-page type (doc / audio / media / tables)
    connectorsDropdown: '[data-testid$="-bar-filter-dropdown"]',
    connectorsItems: '[class^="MultiSelectDropdown_item"]',
    connectorsApply: '[data-testid$="-connector-filter-apply-button"]',
    filesCount: '[data-testid$="-bar-files-count"]',
    tableViewBtn: '[data-testid$="-bar-table-view-button"]',
    gridViewBtn: '[data-testid$="-bar-grid-view-button"]',
    selectAllCheckbox: '[data-testid$="-bar-select-all-select-all-checkbox-button"]',
  },
  filesView: {
    listHeader: '[data-testid$="-name-column-header"]',
    fileNameTable: '[data-testid$="-name-cell-0"]',
    gridView: '[class*="FilesPage_gridView__"]',
  },
  collections: {
    createButton: '[data-testid="create-project-tag-button"]', // TODO: verify
    nameInput: '[data-testid="name"]', // TODO: verify
    submitCreateButton: '[data-testid="create"]', // TODO: verify
    searchInput: '[data-testid="search-bar-input"]',
    card: '[class*="ProjectTagCard_container__"]',
    cardName: '[data-testid="undefined-truncated-text"]', // TODO: verify
    deleteButton: '[data-testid="delete-files"]', // TODO: verify
    confirmDeleteButton: '[data-testid="confirm-button"]', // updated: was "button-confirm"
  },
  history: {
    previewConversationCard: '[data-testid="Conversation-truncated-text"]',
  },
} as const;
