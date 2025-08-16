'use strict';

var electron = require('electron');
var redux = require('redux');
var detectBrowsers = require('detect-browsers');
var fs = require('fs');
var path = require('path');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var fs__default = /*#__PURE__*/_interopDefault(fs);
var path__default = /*#__PURE__*/_interopDefault(path);

const handle = (channel, handler) => {
  const listener = async (_, id, ...args) => {
    try {
      const resolved = await handler(...args);
      electron.ipcRenderer.send(`${channel}@${id}`, {
        resolved
      });
    } catch (error) {
      error instanceof Error && electron.ipcRenderer.send(`${channel}@${id}`, {
        rejected: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
    }
  };
  electron.ipcRenderer.on(channel, listener);
  return () => {
    electron.ipcRenderer.removeListener(channel, listener);
  };
};
const invoke = (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args);

const jitsiDomain = window.location.origin;
const desktopCapturer = {
  getSources: opts => electron.ipcRenderer.invoke('jitsi-desktop-capturer-get-sources', [opts, jitsiDomain])
};
const JitsiMeetElectron = {
  async obtainDesktopStreams(callback, errorCallback, options) {
    try {
      const sources = (await desktopCapturer.getSources(options)).map(source => ({
        id: source.id,
        name: source.name,
        display_id: source.display_id,
        thumbnail: {
          toDataURL: () => source.thumbnail.toDataURL()
        },
        appIcon: {
          toDataURL: () => source.appIcon.toDataURL()
        }
      }));
      callback(sources);
    } catch (error) {
      error instanceof Error && errorCallback(error);
      console.log(error);
    }
  }
};

let getAbsoluteUrl;
let serverUrl;
const setServerUrl = _serverUrl => {
  serverUrl = _serverUrl;
};
const getServerUrl = () => serverUrl;
const setUrlResolver = _getAbsoluteUrl => {
  getAbsoluteUrl = _getAbsoluteUrl;
};

const isFSA = action => typeof action === 'object' && action !== null && !Array.isArray(action) && 'type' in action && typeof action.type === 'string';
const hasMeta = action => 'meta' in action && typeof action.meta === 'object' && action.meta !== null;
const isResponse = action => hasMeta(action) && action.meta.response === true;
const isLocallyScoped = action => hasMeta(action) && action.meta.scope === 'local';
const isErrored = action => 'meta' in action && action.error === true && action.payload instanceof Error;
const hasPayload = action => 'payload' in action;
const isResponseTo = (id, ...types) => action => isResponse(action) && types.includes(action.type) && action.meta.id === id;

const getInitialState = () => invoke('redux/get-initial-state');
const forwardToMain = api => {
  handle('redux/action-dispatched', async action => {
    api.dispatch(action);
  });
  return next => action => {
    if (!isFSA(action) || isLocallyScoped(action)) {
      return next(action);
    }
    invoke('redux/action-dispatched', action);
    return action;
  };
};

const APP_PATH_SET = 'app/path-set';
const APP_VERSION_SET = 'app/version-set';
const APP_SETTINGS_LOADED = 'app/settings-loaded';
const APP_ALLOWED_NTLM_CREDENTIALS_DOMAINS_SET = 'app/allowed-ntlm-credentials-domains-set';
const APP_MAIN_WINDOW_TITLE_SET = 'app/main-window-title-set';
const APP_MACHINE_THEME_SET = 'app/machine-theme-set';

const allowedNTLMCredentialsDomains = (state = null, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      {
        const {
          allowedNTLMCredentialsDomains = state
        } = action.payload;
        return allowedNTLMCredentialsDomains;
      }
    case APP_ALLOWED_NTLM_CREDENTIALS_DOMAINS_SET:
      {
        if (action.payload === null) return null;
        return action.payload;
      }
    default:
      return state;
  }
};

const appPath = (state = null, action) => {
  switch (action.type) {
    case APP_PATH_SET:
      return action.payload;
    default:
      return state;
  }
};

const appVersion = (state = null, action) => {
  switch (action.type) {
    case APP_VERSION_SET:
      return action.payload;
    default:
      return state;
  }
};

const machineTheme = (state = 'light', action) => {
  switch (action.type) {
    case APP_MACHINE_THEME_SET:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const mainWindowTitle = (state = null, action) => {
  switch (action.type) {
    case APP_MAIN_WINDOW_TITLE_SET:
      return action.payload;
    default:
      return state;
  }
};

const DOWNLOAD_CREATED = 'downloads/created';
const DOWNLOAD_REMOVED = 'dowloads/removed';
const DOWNLOADS_CLEARED = 'downloads/cleared';
const DOWNLOAD_UPDATED = 'downloads/updated';

const DownloadStatus = {
  ALL: 'All',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled'
};

const downloads = (state = {}, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      {
        var _action$payload$downl;
        const initDownloads = (_action$payload$downl = action.payload.downloads) !== null && _action$payload$downl !== void 0 ? _action$payload$downl : {};
        Object.values(initDownloads).forEach(value => {
          if (value.state === 'progressing' || value.state === 'paused') {
            value.state = 'cancelled';
            value.status = DownloadStatus.CANCELLED;
          }
        });
        return initDownloads !== null && initDownloads !== void 0 ? initDownloads : {};
      }
    case DOWNLOAD_CREATED:
      {
        const download = action.payload;
        return {
          ...state,
          [download.itemId]: download
        };
      }
    case DOWNLOAD_UPDATED:
      {
        const newState = {
          ...state
        };
        newState[action.payload.itemId] = {
          ...newState[action.payload.itemId],
          ...action.payload
        };
        return newState;
      }
    case DOWNLOAD_REMOVED:
      {
        const newState = {
          ...state
        };
        delete newState[action.payload];
        return newState;
      }
    case DOWNLOADS_CLEARED:
      return {};
    default:
      return state;
  }
};

const JITSI_SERVER_CAPTURE_SCREEN_PERMISSION_UPDATED = 'jitsi-server-capture-screen-permission-updated';
const JITSI_SERVER_CAPTURE_SCREEN_PERMISSIONS_CLEARED = 'jitsi-server-capture-screen-permissions-cleared';

const allowedJitsiServers = (state = {}, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      {
        const {
          allowedJitsiServers = {}
        } = action.payload;
        state = allowedJitsiServers;
        return state;
      }
    case JITSI_SERVER_CAPTURE_SCREEN_PERMISSION_UPDATED:
      {
        state = {
          ...state,
          [action.payload.jitsiServer]: action.payload.allowed
        };
        return state;
      }
    case JITSI_SERVER_CAPTURE_SCREEN_PERMISSIONS_CLEARED:
      {
        state = {};
        return state;
      }
    default:
      return state;
  }
};

const CERTIFICATES_CLEARED = 'certificates/cleared';
const CERTIFICATES_LOADED = 'certificates/loaded';
const CERTIFICATES_CLIENT_CERTIFICATE_REQUESTED = 'certificates/client-certificate-requested';
const TRUSTED_CERTIFICATES_UPDATED = 'trusted-certificates/updated';
const NOT_TRUSTED_CERTIFICATES_UPDATED = 'not-trusted-certificates/updated';
const SELECT_CLIENT_CERTIFICATE_DIALOG_CERTIFICATE_SELECTED = 'select-client-certificate-dialog/certificate-selected';
const SELECT_CLIENT_CERTIFICATE_DIALOG_DISMISSED = 'select-client-certificate-dialog/dismissed';
const EXTERNAL_PROTOCOL_PERMISSION_UPDATED = 'navigation/external-protocol-permission-updated';

const clientCertificates = (state = [], action) => {
  switch (action.type) {
    case CERTIFICATES_CLIENT_CERTIFICATE_REQUESTED:
      return action.payload;
    case SELECT_CLIENT_CERTIFICATE_DIALOG_CERTIFICATE_SELECTED:
    case SELECT_CLIENT_CERTIFICATE_DIALOG_DISMISSED:
      return [];
    default:
      return state;
  }
};
const trustedCertificates = (state = {}, action) => {
  switch (action.type) {
    case CERTIFICATES_LOADED:
    case TRUSTED_CERTIFICATES_UPDATED:
      return action.payload;
    case CERTIFICATES_CLEARED:
      return {};
    case APP_SETTINGS_LOADED:
      {
        const {
          trustedCertificates = state
        } = action.payload;
        return trustedCertificates;
      }
    default:
      return state;
  }
};
const notTrustedCertificates = (state = {}, action) => {
  switch (action.type) {
    case NOT_TRUSTED_CERTIFICATES_UPDATED:
      return action.payload;
    case CERTIFICATES_CLEARED:
      return {};
    case APP_SETTINGS_LOADED:
      {
        const {
          notTrustedCertificates = state
        } = action.payload;
        return notTrustedCertificates;
      }
    default:
      return state;
  }
};
const externalProtocols = (state = {}, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      {
        const {
          externalProtocols = {}
        } = action.payload;
        state = externalProtocols;
        return state;
      }
    case EXTERNAL_PROTOCOL_PERMISSION_UPDATED:
      {
        state = {
          ...state,
          [action.payload.protocol]: action.payload.allowed
        };
        return state;
      }
    default:
      return state;
  }
};

const DEEP_LINKS_SERVER_ADDED = 'deep-links/server-added';
const DEEP_LINKS_SERVER_FOCUSED = 'deep-links/server-focused';

const OUTLOOK_CALENDAR_SET_CREDENTIALS = 'outlook-calendar/set-credentials';
const OUTLOOK_CALENDAR_ASK_CREDENTIALS = 'outlook-calendar/ask-credentials';
const OUTLOOK_CALENDAR_DIALOG_DISMISSED = 'outlook-calendar/dialog-dismissed';
const OUTLOOK_CALENDAR_SAVE_CREDENTIALS = 'outlook-calendar/save-credentials';

const ABOUT_DIALOG_DISMISSED = 'about-dialog/dismissed';
const ABOUT_DIALOG_TOGGLE_UPDATE_ON_START = 'about-dialog/toggle-update-on-start';
const ABOUT_DIALOG_UPDATE_CHANNEL_CHANGED = 'about-dialog/update-channel-changed';
const ADD_SERVER_VIEW_SERVER_ADDED = 'add-server/view-server-added';
const MENU_BAR_ABOUT_CLICKED = 'menu-bar/about-clicked';
const MENU_BAR_ADD_NEW_SERVER_CLICKED = 'menu-bar/add-new-server-clicked';
const MENU_BAR_SELECT_SERVER_CLICKED = 'menu-bar/select-server-clicked';
const MENU_BAR_TOGGLE_IS_MENU_BAR_ENABLED_CLICKED = 'menu-bar/toggle-is-menu-bar-enabled-clicked';
const MENU_BAR_TOGGLE_IS_SHOW_WINDOW_ON_UNREAD_CHANGED_ENABLED_CLICKED = 'menu-bar/toggle-is-show-window-on-unread-changed-enabled-clicked';
const MENU_BAR_TOGGLE_IS_SIDE_BAR_ENABLED_CLICKED = 'menu-bar/toggle-is-side-bar-enabled-clicked';
const MENU_BAR_TOGGLE_IS_TRAY_ICON_ENABLED_CLICKED = 'menu-bar/toggle-is-tray-icon-enabled-clicked';
const MENU_BAR_TOGGLE_IS_DEVELOPER_MODE_ENABLED_CLICKED = 'menu-bar/toggle-is-developer-mode-enabled-clicked';
const MENU_BAR_TOGGLE_IS_VIDEO_CALL_DEVTOOLS_AUTO_OPEN_ENABLED_CLICKED = 'menu-bar/toggle-is-video-call-devtools-auto-open-enabled-clicked';
const ROOT_WINDOW_ICON_CHANGED = 'root-window/icon-changed';
const ROOT_WINDOW_STATE_CHANGED = 'root-window/state-changed';
const VIDEO_CALL_WINDOW_STATE_CHANGED = 'video-call-window/state-changed';
const SIDE_BAR_ADD_NEW_SERVER_CLICKED = 'side-bar/add-new-server-clicked';
const SIDE_BAR_DOWNLOADS_BUTTON_CLICKED = 'side-bar/downloads-button-clicked';
const SIDE_BAR_SETTINGS_BUTTON_CLICKED = 'side-bar/settings-button-clicked';
const SIDE_BAR_REMOVE_SERVER_CLICKED = 'side-bar/remove-server-clicked';
const SIDE_BAR_SERVER_SELECTED = 'side-bar/server-selected';
const SIDE_BAR_SERVERS_SORTED = 'side-bar/servers-sorted';
const TOUCH_BAR_FORMAT_BUTTON_TOUCHED = 'touch-bar/format-button-touched';
const TOUCH_BAR_SELECT_SERVER_TOUCHED = 'touch-bar/select-server-touched';
const UPDATE_DIALOG_DISMISSED = 'update-dialog/dismissed';
const UPDATE_DIALOG_INSTALL_BUTTON_CLICKED = 'update-dialog/install-button-clicked';
const UPDATE_DIALOG_REMIND_UPDATE_LATER_CLICKED = 'update-dialog/remind-update-later-clicked';
const UPDATE_DIALOG_SKIP_UPDATE_CLICKED = 'update-dialog/skip-update-clicked';
const WEBVIEW_READY = 'webview/ready';
const WEBVIEW_ATTACHED = 'webview/attached';
const WEBVIEW_DID_FAIL_LOAD = 'webview/did-fail-load';
const WEBVIEW_DID_NAVIGATE = 'webview/did-navigate';
const WEBVIEW_DID_START_LOADING = 'webview/did-start-loading';
const WEBVIEW_FAVICON_CHANGED = 'webview/favicon-changed';
const WEBVIEW_FOCUS_REQUESTED = 'webview/focus-requested';
const WEBVIEW_MESSAGE_BOX_BLURRED = 'webview/message-box-blurred';
const WEBVIEW_MESSAGE_BOX_FOCUSED = 'webview/message-box-focused';
const WEBVIEW_SCREEN_SHARING_SOURCE_REQUESTED = 'webview/screen-sharing-source-requested';
const WEBVIEW_SCREEN_SHARING_SOURCE_RESPONDED = 'webview/screen-sharing-source-responded';
const WEBVIEW_SIDEBAR_STYLE_CHANGED = 'webview/sidebar-style-changed';
const WEBVIEW_SIDEBAR_CUSTOM_THEME_CHANGED = 'webview/sidebar-custom-theme-changed';
const WEBVIEW_GIT_COMMIT_HASH_CHANGED = 'webview/git-commit-hash-changed';
const WEBVIEW_GIT_COMMIT_HASH_CHECK = 'webview/git-commit-hash-check';
const WEBVIEW_TITLE_CHANGED = 'webview/title-changed';
const WEBVIEW_PAGE_TITLE_CHANGED = 'webview/page-title-changed';
const WEBVIEW_UNREAD_CHANGED = 'webview/unread-changed';
const WEBVIEW_USER_LOGGED_IN = 'webview/user-loggedin';
const WEBVIEW_USER_THEME_APPEARANCE_CHANGED = 'webview/user-theme-appearance-changed';
const WEBVIEW_ALLOWED_REDIRECTS_CHANGED = 'webview/allowed-redirects-changed';
const SETTINGS_SET_REPORT_OPT_IN_CHANGED = 'settings/set-bugsnag-opt-in-changed';
const SETTINGS_SET_FLASHFRAME_OPT_IN_CHANGED = 'settings/set-flashframe-opt-in-changed';
const SETTINGS_SET_HARDWARE_ACCELERATION_OPT_IN_CHANGED = 'settings/set-hardware-acceleration-opt-in-changed';
const SETTINGS_SET_INTERNALVIDEOCHATWINDOW_OPT_IN_CHANGED = 'settings/set-internalvideochatwindow-opt-in-changed';
const SETTINGS_SET_MINIMIZE_ON_CLOSE_OPT_IN_CHANGED = 'settings/set-minimize-on-close-opt-in-changed';
const SETTINGS_SET_IS_TRAY_ICON_ENABLED_CHANGED = 'settings/set-is-tray-icon-enabled-changed';
const SETTINGS_SET_IS_SIDE_BAR_ENABLED_CHANGED = 'settings/set-is-side-bar-enabled-changed';
const SETTINGS_SET_IS_MENU_BAR_ENABLED_CHANGED = 'settings/set-is-menu-bar-enabled-changed';
const SETTINGS_SET_IS_VIDEO_CALL_WINDOW_PERSISTENCE_ENABLED_CHANGED = 'settings/set-is-video-call-window-persistence-enabled-changed';
const SETTINGS_SET_IS_DEVELOPER_MODE_ENABLED_CHANGED = 'settings/set-is-developer-mode-enabled-changed';
const SETTINGS_SET_IS_VIDEO_CALL_DEVTOOLS_AUTO_OPEN_ENABLED_CHANGED = 'settings/set-is-video-call-devtools-auto-open-enabled-changed';
const SETTINGS_NTLM_CREDENTIALS_CHANGED = 'settings/ntlm-credentials-changed';
const SETTINGS_AVAILABLE_BROWSERS_UPDATED = 'settings/available-browsers-updated';
const SETTINGS_SELECTED_BROWSER_CHANGED = 'settings/selected-browser-changed';
const SET_HAS_TRAY_MINIMIZE_NOTIFICATION_SHOWN = 'notifications/set-has-tray-minimize-notification-shown';
const DOWNLOADS_BACK_BUTTON_CLICKED = 'downloads/back-button-clicked';
const WEBVIEW_SERVER_SUPPORTED_VERSIONS_UPDATED = 'webview/server-supported-versions-updated';
const WEBVIEW_SERVER_UNIQUE_ID_UPDATED = 'webview/server-workspace-uid-updated';
const WEBVIEW_SERVER_IS_SUPPORTED_VERSION = 'webview/server-is-supported-version';
const WEBVIEW_SERVER_VERSION_UPDATED = 'webview/version-updated';
const SUPPORTED_VERSION_DIALOG_DISMISS = 'supported-versions-dialog/dismiss';

const SERVERS_LOADED = 'servers/loaded';
const SERVER_DOCUMENT_VIEWER_OPEN_URL = 'server/document-viewer/open-url';

/* eslint-disable complexity */

const ensureUrlFormat = serverUrl => {
  if (serverUrl) {
    return new URL(serverUrl).href;
  }
  throw new Error('cannot handle null server URLs');
};
const upsert = (state, server) => {
  const index = state.findIndex(({
    url
  }) => url === server.url);
  if (index === -1) {
    return [...state, server];
  }
  return state.map((_server, i) => i === index ? {
    ..._server,
    ...server
  } : _server);
};
const update = (state, server) => {
  const index = state.findIndex(({
    url
  }) => url === server.url);
  if (index === -1) {
    return state;
  }
  return state.map((_server, i) => i === index ? {
    ..._server,
    ...server
  } : _server);
};
const servers = (state = [], action) => {
  switch (action.type) {
    case ADD_SERVER_VIEW_SERVER_ADDED:
    case DEEP_LINKS_SERVER_ADDED:
      {
        const url = action.payload;
        return upsert(state, {
          url,
          title: url
        });
      }
    case SIDE_BAR_REMOVE_SERVER_CLICKED:
      {
        const _url = action.payload;
        return state.filter(({
          url
        }) => url !== _url);
      }
    case SIDE_BAR_SERVERS_SORTED:
      {
        const urls = action.payload;
        return state.sort(({
          url: a
        }, {
          url: b
        }) => urls.indexOf(a) - urls.indexOf(b));
      }
    case WEBVIEW_TITLE_CHANGED:
      {
        const {
          url,
          title = url
        } = action.payload;
        return upsert(state, {
          url,
          title
        });
      }
    case WEBVIEW_PAGE_TITLE_CHANGED:
      {
        const {
          url,
          pageTitle
        } = action.payload;
        return upsert(state, {
          url,
          pageTitle
        });
      }
    case WEBVIEW_SERVER_SUPPORTED_VERSIONS_UPDATED:
      {
        const {
          url,
          supportedVersions,
          source
        } = action.payload;
        return upsert(state, {
          url,
          supportedVersions,
          supportedVersionsSource: source
        });
      }
    case SUPPORTED_VERSION_DIALOG_DISMISS:
      {
        const {
          url
        } = action.payload;
        return upsert(state, {
          url,
          expirationMessageLastTimeShown: new Date()
        });
      }
    case WEBVIEW_SERVER_UNIQUE_ID_UPDATED:
      {
        const {
          url,
          uniqueID
        } = action.payload;
        return upsert(state, {
          url,
          uniqueID
        });
      }
    case WEBVIEW_USER_THEME_APPEARANCE_CHANGED:
      {
        const {
          url,
          themeAppearance
        } = action.payload;
        return upsert(state, {
          url,
          themeAppearance
        });
      }
    case WEBVIEW_SERVER_IS_SUPPORTED_VERSION:
      {
        const {
          url,
          isSupportedVersion
        } = action.payload;
        return upsert(state, {
          url,
          isSupportedVersion
        });
      }
    case WEBVIEW_SERVER_VERSION_UPDATED:
      {
        const {
          url,
          version
        } = action.payload;
        return upsert(state, {
          url,
          version
        });
      }
    case WEBVIEW_UNREAD_CHANGED:
      {
        const {
          url,
          badge
        } = action.payload;
        return upsert(state, {
          url,
          badge
        });
      }
    case WEBVIEW_USER_LOGGED_IN:
      {
        const {
          url,
          userLoggedIn
        } = action.payload;
        return upsert(state, {
          url,
          userLoggedIn
        });
      }
    case WEBVIEW_ALLOWED_REDIRECTS_CHANGED:
      {
        const {
          url,
          allowedRedirects
        } = action.payload;
        return upsert(state, {
          url,
          allowedRedirects
        });
      }
    case WEBVIEW_SIDEBAR_STYLE_CHANGED:
      {
        const {
          url,
          style
        } = action.payload;
        return upsert(state, {
          url,
          style
        });
      }
    case WEBVIEW_SIDEBAR_CUSTOM_THEME_CHANGED:
      {
        const {
          url,
          customTheme
        } = action.payload;
        return upsert(state, {
          url,
          customTheme
        });
      }
    case WEBVIEW_GIT_COMMIT_HASH_CHANGED:
      {
        const {
          url,
          gitCommitHash
        } = action.payload;
        return upsert(state, {
          url,
          gitCommitHash
        });
      }
    case WEBVIEW_FAVICON_CHANGED:
      {
        const {
          url,
          favicon
        } = action.payload;
        return upsert(state, {
          url,
          favicon
        });
      }
    case WEBVIEW_DID_NAVIGATE:
      {
        const {
          url,
          pageUrl
        } = action.payload;
        if (pageUrl !== null && pageUrl !== void 0 && pageUrl.includes(url)) {
          return upsert(state, {
            url,
            lastPath: pageUrl
          });
        }
        return state;
      }
    case WEBVIEW_DID_START_LOADING:
      {
        const {
          url
        } = action.payload;
        return upsert(state, {
          url,
          failed: false
        });
      }
    case WEBVIEW_DID_FAIL_LOAD:
      {
        const {
          url,
          isMainFrame
        } = action.payload;
        if (isMainFrame) {
          return upsert(state, {
            url,
            failed: true
          });
        }
        return state;
      }
    case SERVERS_LOADED:
      {
        const {
          servers = state
        } = action.payload;
        return servers.map(server => ({
          ...server,
          url: ensureUrlFormat(server.url)
        }));
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          servers = state
        } = action.payload;
        return servers.map(server => ({
          ...server,
          url: ensureUrlFormat(server.url),
          documentViewerOpenUrl: ''
        }));
      }
    case WEBVIEW_READY:
      {
        const {
          url,
          webContentsId
        } = action.payload;
        return update(state, {
          url,
          webContentsId
        });
      }
    case WEBVIEW_ATTACHED:
      {
        const {
          url,
          webContentsId
        } = action.payload;
        return update(state, {
          url,
          webContentsId
        });
      }
    case OUTLOOK_CALENDAR_SAVE_CREDENTIALS:
      {
        const {
          url,
          outlookCredentials
        } = action.payload;
        return upsert(state, {
          url,
          outlookCredentials
        });
      }
    case SERVER_DOCUMENT_VIEWER_OPEN_URL:
      {
        const {
          server,
          documentUrl
        } = action.payload;
        return upsert(state, {
          url: server,
          documentViewerOpenUrl: documentUrl
        });
      }
    default:
      return state;
  }
};

const availableBrowsers = (state = [], action) => {
  switch (action.type) {
    case SETTINGS_AVAILABLE_BROWSERS_UPDATED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        return state;
      }
    default:
      return state;
  }
};

const currentView = (state = 'add-new-server', action) => {
  switch (action.type) {
    case ADD_SERVER_VIEW_SERVER_ADDED:
    case DEEP_LINKS_SERVER_ADDED:
    case DEEP_LINKS_SERVER_FOCUSED:
    case MENU_BAR_SELECT_SERVER_CLICKED:
    case TOUCH_BAR_SELECT_SERVER_TOUCHED:
    case SIDE_BAR_SERVER_SELECTED:
      {
        const url = action.payload;
        return {
          url
        };
      }
    case WEBVIEW_FOCUS_REQUESTED:
      {
        const {
          url,
          view
        } = action.payload;
        if (view === 'downloads') return 'downloads';
        return {
          url
        };
      }
    case SERVERS_LOADED:
      {
        const {
          selected
        } = action.payload;
        return selected ? {
          url: selected
        } : 'add-new-server';
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          currentView = state
        } = action.payload;
        return currentView;
      }
    case MENU_BAR_ADD_NEW_SERVER_CLICKED:
    case SIDE_BAR_ADD_NEW_SERVER_CLICKED:
      return 'add-new-server';
    case SIDE_BAR_REMOVE_SERVER_CLICKED:
      {
        if (typeof state === 'object' && state.url === action.payload) {
          return 'add-new-server';
        }
        return state;
      }
    case SIDE_BAR_DOWNLOADS_BUTTON_CLICKED:
      return 'downloads';
    case SIDE_BAR_SETTINGS_BUTTON_CLICKED:
      return 'settings';
    case DOWNLOADS_BACK_BUTTON_CLICKED:
      return {
        url: action.payload
      };
    default:
      return state;
  }
};

const hasHideOnTrayNotificationShown = (state = false, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      return Boolean(action.payload.hasHideOnTrayNotificationShown);
    case SET_HAS_TRAY_MINIMIZE_NOTIFICATION_SHOWN:
      return action.payload;
    default:
      return state;
  }
};

const isAddNewServersEnabled = (state = true, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      return Boolean(action.payload.isAddNewServersEnabled);
    default:
      return state;
  }
};

const isDeveloperModeEnabled = (state = false, action) => {
  switch (action.type) {
    case SETTINGS_SET_IS_DEVELOPER_MODE_ENABLED_CHANGED:
    case MENU_BAR_TOGGLE_IS_DEVELOPER_MODE_ENABLED_CLICKED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isDeveloperModeEnabled = state
        } = action.payload;
        return isDeveloperModeEnabled;
      }
    default:
      return state;
  }
};

const UPDATE_SKIPPED = 'update/skipped';
const UPDATES_CHECKING_FOR_UPDATE = 'updates/checking-for-update';
const UPDATES_ERROR_THROWN = 'updates/error-thrown';
const UPDATES_NEW_VERSION_AVAILABLE = 'updates/new-version-available';
const UPDATES_NEW_VERSION_NOT_AVAILABLE = 'updates/new-version-not-available';
const UPDATES_READY = 'updates/ready';
const UPDATES_CHANNEL_CHANGED = 'updates/channel-changed';

const isFlashFrameEnabled = (state = false, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      return Boolean(action.payload.isFlashFrameEnabled);
    case UPDATES_READY:
      return action.payload.isFlashFrameEnabled;
    case SETTINGS_SET_FLASHFRAME_OPT_IN_CHANGED:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const isHardwareAccelerationEnabled = (state = false, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      return Boolean(action.payload.isHardwareAccelerationEnabled);
    case UPDATES_READY:
      return action.payload.isHardwareAccelerationEnabled;
    case SETTINGS_SET_HARDWARE_ACCELERATION_OPT_IN_CHANGED:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const isInternalVideoChatWindowEnabled = (state = false, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      return Boolean(action.payload.isInternalVideoChatWindowEnabled);
    case UPDATES_READY:
      return action.payload.isInternalVideoChatWindowEnabled;
    case SETTINGS_SET_INTERNALVIDEOCHATWINDOW_OPT_IN_CHANGED:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const isMenuBarEnabled = (state = true, action) => {
  switch (action.type) {
    case SETTINGS_SET_IS_MENU_BAR_ENABLED_CHANGED:
    case MENU_BAR_TOGGLE_IS_MENU_BAR_ENABLED_CLICKED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isMenuBarEnabled = state
        } = action.payload;
        return isMenuBarEnabled;
      }
    default:
      return state;
  }
};

const isMessageBoxFocused = (state = false, action) => {
  switch (action.type) {
    case WEBVIEW_MESSAGE_BOX_FOCUSED:
      return true;
    case WEBVIEW_DID_START_LOADING:
    case WEBVIEW_MESSAGE_BOX_BLURRED:
    case WEBVIEW_DID_FAIL_LOAD:
      return false;
    default:
      return state;
  }
};

const isMinimizeOnCloseEnabled = (state = process.platform === 'win32', action) => {
  switch (action.type) {
    case SETTINGS_SET_MINIMIZE_ON_CLOSE_OPT_IN_CHANGED:
      {
        return action.payload;
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          isMinimizeOnCloseEnabled = state
        } = action.payload;
        return isMinimizeOnCloseEnabled;
      }
    default:
      return state;
  }
};

const isNTLMCredentialsEnabled = (state = false, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      {
        const {
          isNTLMCredentialsEnabled = state
        } = action.payload;
        return isNTLMCredentialsEnabled;
      }
    case SETTINGS_NTLM_CREDENTIALS_CHANGED:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const isReportEnabled = (state = false, action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      return Boolean(action.payload.isReportEnabled);
    case UPDATES_READY:
      return action.payload.isReportEnabled;
    case SETTINGS_SET_REPORT_OPT_IN_CHANGED:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const isShowWindowOnUnreadChangedEnabled = (state = false, action) => {
  switch (action.type) {
    case MENU_BAR_TOGGLE_IS_SHOW_WINDOW_ON_UNREAD_CHANGED_ENABLED_CLICKED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isShowWindowOnUnreadChangedEnabled = state
        } = action.payload;
        return isShowWindowOnUnreadChangedEnabled;
      }
    default:
      return state;
  }
};

const isSideBarEnabled = (state = true, action) => {
  switch (action.type) {
    case SETTINGS_SET_IS_SIDE_BAR_ENABLED_CHANGED:
    case MENU_BAR_TOGGLE_IS_SIDE_BAR_ENABLED_CLICKED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isSideBarEnabled = state
        } = action.payload;
        return isSideBarEnabled;
      }
    default:
      return state;
  }
};

const isTrayIconEnabled = (state = process.platform !== 'linux', action) => {
  switch (action.type) {
    case SETTINGS_SET_IS_TRAY_ICON_ENABLED_CHANGED:
    case MENU_BAR_TOGGLE_IS_TRAY_ICON_ENABLED_CLICKED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isTrayIconEnabled = state
        } = action.payload;
        return isTrayIconEnabled;
      }
    default:
      return state;
  }
};

const isVideoCallDevtoolsAutoOpenEnabled = (state = false, action) => {
  switch (action.type) {
    case SETTINGS_SET_IS_VIDEO_CALL_DEVTOOLS_AUTO_OPEN_ENABLED_CHANGED:
    case MENU_BAR_TOGGLE_IS_VIDEO_CALL_DEVTOOLS_AUTO_OPEN_ENABLED_CLICKED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isVideoCallDevtoolsAutoOpenEnabled = state
        } = action.payload;
        return isVideoCallDevtoolsAutoOpenEnabled;
      }
    default:
      return state;
  }
};

const isVideoCallWindowPersistenceEnabled = (state = true,
// Enabled by default
action) => {
  switch (action.type) {
    case SETTINGS_SET_IS_VIDEO_CALL_WINDOW_PERSISTENCE_ENABLED_CHANGED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          isVideoCallWindowPersistenceEnabled = state
        } = action.payload;
        return isVideoCallWindowPersistenceEnabled;
      }
    default:
      return state;
  }
};

const lastSelectedServerUrl = (state = '', action) => {
  switch (action.type) {
    case APP_SETTINGS_LOADED:
      {
        const {
          lastSelectedServerUrl = state,
          servers
        } = action.payload;
        if (state === '' && servers && servers.length > 0) {
          return servers[0].url;
        }
        return lastSelectedServerUrl;
      }
    case SIDE_BAR_SERVER_SELECTED:
      return action.payload;
    default:
      return state;
  }
};

const SCREEN_SHARING_DIALOG_DISMISSED = 'screen-sharing-dialog/dismissed';

const openDialog = (state = null, action) => {
  switch (action.type) {
    case MENU_BAR_ABOUT_CLICKED:
      return 'about';
    case WEBVIEW_SCREEN_SHARING_SOURCE_REQUESTED:
      return 'screen-sharing';
    case UPDATES_NEW_VERSION_AVAILABLE:
      return 'update';
    case CERTIFICATES_CLIENT_CERTIFICATE_REQUESTED:
      return 'select-client-certificate';
    case ABOUT_DIALOG_DISMISSED:
      if (state === 'about') {
        return null;
      }
      return state;
    case OUTLOOK_CALENDAR_ASK_CREDENTIALS:
      return 'outlook-credentials';
    case SCREEN_SHARING_DIALOG_DISMISSED:
    case WEBVIEW_SCREEN_SHARING_SOURCE_RESPONDED:
    case SELECT_CLIENT_CERTIFICATE_DIALOG_CERTIFICATE_SELECTED:
    case SELECT_CLIENT_CERTIFICATE_DIALOG_DISMISSED:
    case UPDATE_DIALOG_DISMISSED:
    case UPDATE_DIALOG_SKIP_UPDATE_CLICKED:
    case UPDATE_DIALOG_REMIND_UPDATE_LATER_CLICKED:
    case UPDATE_DIALOG_INSTALL_BUTTON_CLICKED:
    case OUTLOOK_CALENDAR_DIALOG_DISMISSED:
    case OUTLOOK_CALENDAR_SET_CREDENTIALS:
      return null;
    default:
      return state;
  }
};

const rootWindowIcon = (state = null, action) => {
  switch (action.type) {
    case ROOT_WINDOW_ICON_CHANGED:
      {
        return action.payload;
      }
    default:
      return state;
  }
};

const rootWindowState = (state = {
  focused: true,
  visible: true,
  maximized: false,
  minimized: false,
  fullscreen: false,
  normal: true,
  bounds: {
    x: undefined,
    y: undefined,
    width: 1000,
    height: 600
  }
}, action) => {
  switch (action.type) {
    case ROOT_WINDOW_STATE_CHANGED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          rootWindowState = state
        } = action.payload;
        return rootWindowState;
      }
    default:
      return state;
  }
};

const selectedBrowser = (state = null, action) => {
  switch (action.type) {
    case SETTINGS_SELECTED_BROWSER_CHANGED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          selectedBrowser = state
        } = action.payload;
        return selectedBrowser;
      }
    default:
      return state;
  }
};

const videoCallWindowState = (state = {
  focused: true,
  visible: true,
  maximized: false,
  minimized: false,
  fullscreen: false,
  normal: true,
  bounds: {
    x: undefined,
    y: undefined,
    width: 0,
    height: 0
  }
}, action) => {
  switch (action.type) {
    case VIDEO_CALL_WINDOW_STATE_CHANGED:
      return action.payload;
    case APP_SETTINGS_LOADED:
      {
        const {
          videoCallWindowState = state
        } = action.payload;
        return videoCallWindowState;
      }
    default:
      return state;
  }
};

const doCheckForUpdatesOnStartup = (state = true, action) => {
  switch (action.type) {
    case UPDATES_READY:
      {
        const {
          doCheckForUpdatesOnStartup
        } = action.payload;
        return doCheckForUpdatesOnStartup;
      }
    case ABOUT_DIALOG_TOGGLE_UPDATE_ON_START:
      {
        const doCheckForUpdatesOnStartup = action.payload;
        return doCheckForUpdatesOnStartup;
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          doCheckForUpdatesOnStartup = state
        } = action.payload;
        return doCheckForUpdatesOnStartup;
      }
    default:
      return state;
  }
};
const isCheckingForUpdates = (state = false, action) => {
  switch (action.type) {
    case UPDATES_CHECKING_FOR_UPDATE:
      return true;
    case UPDATES_ERROR_THROWN:
      return false;
    case UPDATES_NEW_VERSION_NOT_AVAILABLE:
      return false;
    case UPDATES_NEW_VERSION_AVAILABLE:
      return false;
    default:
      return state;
  }
};
const isEachUpdatesSettingConfigurable = (state = true, action) => {
  switch (action.type) {
    case UPDATES_READY:
      {
        const {
          isEachUpdatesSettingConfigurable
        } = action.payload;
        return isEachUpdatesSettingConfigurable;
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          isEachUpdatesSettingConfigurable = state
        } = action.payload;
        return isEachUpdatesSettingConfigurable;
      }
    default:
      return state;
  }
};
const isUpdatingAllowed = (state = true, action) => {
  switch (action.type) {
    case UPDATES_READY:
      {
        const {
          isUpdatingAllowed
        } = action.payload;
        return isUpdatingAllowed;
      }
    default:
      return state;
  }
};
const isUpdatingEnabled = (state = true, action) => {
  switch (action.type) {
    case UPDATES_READY:
      {
        const {
          isUpdatingEnabled
        } = action.payload;
        return isUpdatingEnabled;
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          isUpdatingEnabled = state
        } = action.payload;
        return isUpdatingEnabled;
      }
    default:
      return state;
  }
};
const newUpdateVersion = (state = null, action) => {
  switch (action.type) {
    case UPDATES_NEW_VERSION_AVAILABLE:
      {
        const newUpdateVersion = action.payload;
        return newUpdateVersion;
      }
    case UPDATES_NEW_VERSION_NOT_AVAILABLE:
    case UPDATE_SKIPPED:
      {
        return null;
      }
    default:
      return state;
  }
};
const skippedUpdateVersion = (state = null, action) => {
  switch (action.type) {
    case UPDATES_READY:
      {
        const {
          skippedUpdateVersion
        } = action.payload;
        return skippedUpdateVersion;
      }
    case UPDATE_SKIPPED:
      {
        const skippedUpdateVersion = action.payload;
        return skippedUpdateVersion;
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          skippedUpdateVersion = state
        } = action.payload;
        return skippedUpdateVersion;
      }
    default:
      return state;
  }
};
const updateError = (state = null, action) => {
  switch (action.type) {
    case UPDATES_CHECKING_FOR_UPDATE:
      return null;
    case UPDATES_ERROR_THROWN:
      return action.payload;
    case UPDATES_NEW_VERSION_NOT_AVAILABLE:
      return null;
    case UPDATES_NEW_VERSION_AVAILABLE:
      return null;
    default:
      return state;
  }
};
const updateChannel = (state = 'latest', action) => {
  switch (action.type) {
    case ABOUT_DIALOG_UPDATE_CHANNEL_CHANGED:
    case UPDATES_CHANNEL_CHANGED:
      {
        return action.payload;
      }
    case UPDATES_READY:
      {
        const {
          updateChannel
        } = action.payload;
        return updateChannel;
      }
    case APP_SETTINGS_LOADED:
      {
        const {
          updateChannel = state
        } = action.payload;
        return updateChannel;
      }
    default:
      return state;
  }
};

const rootReducer = redux.combineReducers({
  allowedJitsiServers,
  appPath,
  appVersion,
  availableBrowsers,
  clientCertificates,
  currentView,
  doCheckForUpdatesOnStartup,
  downloads,
  externalProtocols,
  isCheckingForUpdates,
  isEachUpdatesSettingConfigurable,
  isMenuBarEnabled,
  isMessageBoxFocused,
  isShowWindowOnUnreadChangedEnabled,
  isSideBarEnabled,
  isTrayIconEnabled,
  isMinimizeOnCloseEnabled,
  isUpdatingAllowed,
  isUpdatingEnabled,
  mainWindowTitle,
  machineTheme,
  newUpdateVersion,
  openDialog,
  rootWindowIcon,
  rootWindowState,
  selectedBrowser,
  servers,
  skippedUpdateVersion,
  trustedCertificates,
  notTrustedCertificates,
  updateError,
  isReportEnabled,
  isFlashFrameEnabled,
  isHardwareAccelerationEnabled,
  isInternalVideoChatWindowEnabled,
  isAddNewServersEnabled,
  hasHideOnTrayNotificationShown,
  lastSelectedServerUrl,
  allowedNTLMCredentialsDomains,
  isNTLMCredentialsEnabled,
  videoCallWindowState,
  isVideoCallWindowPersistenceEnabled,
  isDeveloperModeEnabled,
  updateChannel,
  isVideoCallDevtoolsAutoOpenEnabled
});

let reduxStore;
let lastAction;
const catchLastAction = () => next => action => {
  lastAction = action;
  return next(action);
};
const createRendererReduxStore = async () => {
  const initialState = await getInitialState();
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose;
  const enhancers = composeEnhancers(redux.applyMiddleware(forwardToMain, catchLastAction));
  reduxStore = redux.createStore(rootReducer, initialState, enhancers);
  return reduxStore;
};
const dispatch = action => {
  reduxStore.dispatch(action);
};
const select = selector => selector(reduxStore.getState());
const watch = (selector, watcher) => {
  const initial = select(selector);
  watcher(initial, undefined);
  let prev = initial;
  return reduxStore.subscribe(() => {
    const curr = select(selector);
    if (Object.is(prev, curr)) {
      return;
    }
    watcher(curr, prev);
    prev = curr;
  });
};
const listen = (typeOrPredicate, listener) => {
  const effectivePredicate = typeof typeOrPredicate === 'function' ? typeOrPredicate : action => action.type === typeOrPredicate;
  return reduxStore.subscribe(() => {
    if (!effectivePredicate(lastAction)) {
      return;
    }
    listener(lastAction);
  });
};

// const isResponseTo = <Response extends RootAction>(id: unknown, type: Response['type']) =>
//   (action: RootAction): action is Response =>
//     isResponse(action) && action.type === type && action.meta.id === id;

const request = (requestAction, ...types) => new Promise((resolve, reject) => {
  const id = Math.random().toString(36).slice(2);
  const unsubscribe = listen(isResponseTo(id, ...types), action => {
    unsubscribe();
    if (isErrored(action)) {
      reject(action.payload);
      return;
    }
    if (hasPayload(action)) {
      resolve(action.payload);
    }
  });
  dispatch({
    ...requestAction,
    meta: {
      request: true,
      id
    }
  });
});

const NOTIFICATIONS_CREATE_REQUESTED = 'notifications/create-requested';
const NOTIFICATIONS_CREATE_RESPONDED = 'notifications/create-responded';
const NOTIFICATIONS_NOTIFICATION_ACTIONED = 'notifications/notification-actioned';
const NOTIFICATIONS_NOTIFICATION_CLICKED = 'notifications/notification-clicked';
const NOTIFICATIONS_NOTIFICATION_CLOSED = 'notifications/notification-closed';
const NOTIFICATIONS_NOTIFICATION_DISMISSED = 'notifications/notification-dismissed';
const NOTIFICATIONS_NOTIFICATION_REPLIED = 'notifications/notification-replied';
const NOTIFICATIONS_NOTIFICATION_SHOWN = 'notifications/notification-shown';

const normalizeIconUrl = iconUrl => {
  if (/^data:/.test(iconUrl)) {
    return iconUrl;
  }
  if (!/^https?:\/\//.test(iconUrl)) {
    return getAbsoluteUrl(iconUrl);
  }
  return iconUrl;
};
const eventHandlers = new Map();
const createNotification = async ({
  title,
  icon,
  onEvent,
  ...options
}) => {
  const id = await request({
    type: NOTIFICATIONS_CREATE_REQUESTED,
    payload: {
      title,
      ...(icon ? {
        icon: normalizeIconUrl(icon)
      } : {}),
      ...options
    }
  }, NOTIFICATIONS_CREATE_RESPONDED);
  eventHandlers.set(id, event => onEvent === null || onEvent === void 0 ? void 0 : onEvent({
    type: event.type,
    detail: event.detail
  }));
  return id;
};
const destroyNotification = id => {
  dispatch({
    type: NOTIFICATIONS_NOTIFICATION_DISMISSED,
    payload: {
      id
    }
  });
  eventHandlers.delete(id);
};
const listenToNotificationsRequests = () => {
  listen(NOTIFICATIONS_NOTIFICATION_SHOWN, action => {
    const {
      payload: {
        id
      }
    } = action;
    const eventHandler = eventHandlers.get(id);
    eventHandler === null || eventHandler === void 0 || eventHandler({
      type: 'show'
    });
  });
  listen(NOTIFICATIONS_NOTIFICATION_CLOSED, action => {
    const {
      payload: {
        id
      }
    } = action;
    const eventHandler = eventHandlers.get(id);
    eventHandler === null || eventHandler === void 0 || eventHandler({
      type: 'close'
    });
    eventHandlers.delete(id);
  });
  listen(NOTIFICATIONS_NOTIFICATION_CLICKED, action => {
    const {
      payload: {
        id,
        title
      }
    } = action;
    dispatch({
      type: WEBVIEW_FOCUS_REQUESTED,
      payload: {
        url: getServerUrl(),
        view: title === 'Downloads' ? 'downloads' : 'server'
      }
    });
    const eventHandler = eventHandlers.get(id);
    eventHandler === null || eventHandler === void 0 || eventHandler({
      type: 'click'
    });
  });
  listen(NOTIFICATIONS_NOTIFICATION_REPLIED, action => {
    const {
      payload: {
        id,
        reply
      }
    } = action;
    const eventHandler = eventHandlers.get(id);
    eventHandler === null || eventHandler === void 0 || eventHandler({
      type: 'reply',
      detail: {
        reply
      }
    });
  });
  listen(NOTIFICATIONS_NOTIFICATION_ACTIONED, action => {
    const {
      payload: {
        id,
        index
      }
    } = action;
    const eventHandler = eventHandlers.get(id);
    eventHandler === null || eventHandler === void 0 || eventHandler({
      type: 'action',
      detail: {
        index
      }
    });
  });
};

const handleGetSourceIdEvent = async () => {
  try {
    var _window$top;
    const sourceId = await request({
      type: WEBVIEW_SCREEN_SHARING_SOURCE_REQUESTED
    }, WEBVIEW_SCREEN_SHARING_SOURCE_RESPONDED);
    (_window$top = window.top) === null || _window$top === void 0 || _window$top.postMessage({
      sourceId
    }, '*');
  } catch (error) {
    var _window$top2;
    (_window$top2 = window.top) === null || _window$top2 === void 0 || _window$top2.postMessage({
      sourceId: 'PermissionDeniedError'
    }, '*');
  }
};
const listenToScreenSharingRequests = () => {
  window.addEventListener('get-sourceId', handleGetSourceIdEvent);
};

const getOutlookEvents = async date => {
  const response = await electron.ipcRenderer.invoke('outlook-calendar/get-events', date);
  return response;
};
const setOutlookExchangeUrl = (url, userId) => {
  electron.ipcRenderer.invoke('outlook-calendar/set-exchange-url', url, userId);
};
const hasOutlookCredentials = async () => electron.ipcRenderer.invoke('outlook-calendar/has-credentials');
const clearOutlookCredentials = () => {
  electron.ipcRenderer.invoke('outlook-calendar/clear-credentials');
};
const setUserToken = (token, userId) => {
  electron.ipcRenderer.invoke('outlook-calendar/set-user-token', token, userId);
};

const SYSTEM_LOCKING_SCREEN = 'system/locking-screen';
const SYSTEM_SUSPENDING = 'system/suspending';

let detachCallbacks;
const attachCallbacks = ({
  isAutoAwayEnabled,
  idleThreshold,
  setUserOnline
}) => {
  const unsubscribeFromPowerMonitorEvents = listen(action => [SYSTEM_SUSPENDING, SYSTEM_LOCKING_SCREEN].includes(action.type), () => {
    if (!isAutoAwayEnabled) {
      return;
    }
    setUserOnline(false);
  });
  let pollingTimer;
  let prevState;
  const pollSystemIdleState = async () => {
    if (!isAutoAwayEnabled || !idleThreshold) {
      return;
    }
    pollingTimer = setTimeout(pollSystemIdleState, 2000);
    const state = await invoke('power-monitor/get-system-idle-state', idleThreshold);
    if (prevState === state) {
      return;
    }
    const isOnline = state === 'active' || state === 'unknown';
    setUserOnline(isOnline);
    prevState = state;
  };
  pollSystemIdleState();
  return () => {
    unsubscribeFromPowerMonitorEvents();
    clearTimeout(pollingTimer);
  };
};
const setUserPresenceDetection = options => {
  var _detachCallbacks;
  (_detachCallbacks = detachCallbacks) === null || _detachCallbacks === void 0 || _detachCallbacks();
  detachCallbacks = attachCallbacks(options);
};

const setBadge = badge => {
  dispatch({
    type: WEBVIEW_UNREAD_CHANGED,
    payload: {
      url: getServerUrl(),
      badge
    }
  });
};

const writeTextToClipboard = text => {
  electron.clipboard.writeText(text);
};

const openDocumentViewer = (url, format, options) => {
  electron.ipcRenderer.invoke('document-viewer/open-window', url, format, options);
};

const FAVICON_SIZE = 100;
let imageElement;
const getImageElement = () => {
  if (!imageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = FAVICON_SIZE;
    canvas.height = FAVICON_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('failed to create canvas 2d context');
    }
    imageElement = new Image();
    const handleImageLoadEvent = () => {
      ctx.clearRect(0, 0, FAVICON_SIZE, FAVICON_SIZE);
      ctx.drawImage(imageElement, 0, 0, FAVICON_SIZE, FAVICON_SIZE);
      dispatch({
        type: WEBVIEW_FAVICON_CHANGED,
        payload: {
          url: getServerUrl(),
          favicon: canvas.toDataURL()
        }
      });
    };
    imageElement.addEventListener('load', handleImageLoadEvent, {
      passive: true
    });
  }
  return imageElement;
};
const setFavicon = faviconUrl => {
  if (typeof faviconUrl !== 'string') {
    return;
  }
  const imageElement = getImageElement();
  imageElement.src = getAbsoluteUrl(faviconUrl);
};

const setGitCommitHash = gitCommitHash => {
  console.log('setGitCommitHash', gitCommitHash);
  dispatch({
    type: WEBVIEW_GIT_COMMIT_HASH_CHECK,
    payload: {
      url: getServerUrl(),
      gitCommitHash
    }
  });
};

const readSetting = key => {
  try {
    const filePath = path__default.default.join(electron.app.getPath('userData'), 'config.json');
    const content = fs__default.default.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    return json[key];
  } catch (e) {
    return null;
  }
};

// Cache browsers to avoid repeatedly fetching them
let cachedBrowsers = null;
let browserLoadPromise = null;

/**
 * Lazy load browsers asynchronously
 * This ensures we don't slow down app startup
 */
const loadBrowsersLazy = () => {
  if (cachedBrowsers) {
    return Promise.resolve(cachedBrowsers);
  }
  if (!browserLoadPromise) {
    // Start loading browsers asynchronously after a delay to not block the app startup
    browserLoadPromise = new Promise(resolve => {
      // Delay browser detection for 2 seconds after this function is first called
      // to avoid slowing down app startup and initial interactions
      setTimeout(async () => {
        try {
          const browsers = await detectBrowsers.getAvailableBrowsers();
          cachedBrowsers = browsers;
          const browserIds = browsers.map(browser => browser.browser);
          if (browserIds.length > 0) {
            dispatch({
              type: SETTINGS_AVAILABLE_BROWSERS_UPDATED,
              payload: browserIds
            });
          }
          resolve(browsers);
        } catch (error) {
          console.error('Error detecting browsers:', error);
          resolve([]);
        }
      }, 2000);
    });
  }
  return browserLoadPromise;
};

/**
 * Launches a URL in the selected browser from settings or falls back to system default
 *
 * @param url The URL to open
 * @returns Promise that resolves when the browser is launched
 */
const openExternal = async url => {
  // Get the selected browser from settings
  const selectedBrowser = readSetting('selectedBrowser');

  // If no specific browser is selected, use the system default
  if (!selectedBrowser) {
    return electron.shell.openExternal(url);
  }
  try {
    // Lazy load browsers when needed
    const browsers = await loadBrowsersLazy();

    // Find the selected browser in the available browsers
    const browser = browsers.find(browser => browser.browser === selectedBrowser);
    if (browser) {
      // Launch the selected browser with the URL
      return detectBrowsers.launchBrowser(browser, url);
    }
    // If the selected browser isn't available, fall back to system default
    console.warn(`Selected browser "${selectedBrowser}" not found, using system default.`);
    return electron.shell.openExternal(url);
  } catch (error) {
    console.error('Error launching browser:', error);
    // Fall back to shell.openExternal on error
    return electron.shell.openExternal(url);
  }
};

const getInternalVideoChatWindowEnabled = () => select(({
  isInternalVideoChatWindowEnabled
}) => ({
  isInternalVideoChatWindowEnabled
})).isInternalVideoChatWindowEnabled;
const openInternalVideoChatWindow = (url, options) => {
  const validUrl = new URL(url);
  const allowedProtocols = ['http:', 'https:'];
  if (!allowedProtocols.includes(validUrl.protocol)) {
    return;
  }
  if (!process.mas && getInternalVideoChatWindowEnabled()) {
    switch (options === null || options === void 0 ? void 0 : options.providerName) {
      case 'jitsi':
        // window.open(validUrl.href, 'Video Call', 'scrollbars=true');
        // We will open Jitsi on browser instead of opening a new window for compatibility from their side
        electron.ipcRenderer.invoke('video-call-window/open-window', validUrl.href, options);
        break;
      case 'googlemeet':
        openExternal(validUrl.href);
        break;
      default:
        electron.ipcRenderer.invoke('video-call-window/open-window', validUrl.href, options);
        break;
    }
  } else {
    openExternal(validUrl.href);
  }
};

let timer;
let prevBackground;
let prevColor;
let prevBorder;
let serverVersion;
function versionIsGreaterOrEqualsTo(version1, version2) {
  var _version1$match, _version2$match;
  const v1 = ((_version1$match = version1.match(/\d+/g)) === null || _version1$match === void 0 ? void 0 : _version1$match.map(Number)) || [];
  const v2 = ((_version2$match = version2.match(/\d+/g)) === null || _version2$match === void 0 ? void 0 : _version2$match.map(Number)) || [];
  for (let i = 0; i < 3; i++) {
    const n1 = v1[i] || 0;
    const n2 = v2[i] || 0;
    if (n1 > n2) {
      return true;
    }
    if (n1 < n2) {
      return false;
    }
  }
  return true;
}
const pollSidebarStyle = (referenceElement, emit) => {
  clearTimeout(timer);
  document.body.append(referenceElement);
  const {
    background,
    color,
    border
  } = window.getComputedStyle(referenceElement);
  referenceElement.remove();
  const newBgg = prevBackground !== background ? background : prevBackground;
  const newColor = prevColor !== color ? color : prevColor;
  const newBorder = prevBorder !== border ? border : prevBorder;
  if (prevBackground !== background || prevColor !== color || newBorder !== border) {
    emit({
      background: newBgg,
      color: newColor,
      border: newBorder
    });
    prevBackground = background;
    prevColor = color;
    prevBorder = border;
  }
  timer = setTimeout(() => pollSidebarStyle(referenceElement, emit), 5000);
};
let element;
const getElement = () => {
  if (!element) {
    element = document.createElement('div');
    element.style.backgroundColor = 'var(--sidebar-background)';
    element.style.color = 'var(--sidebar-item-text-color)';
    element.style.display = 'none';
    if (versionIsGreaterOrEqualsTo(serverVersion, '6.3.0')) {
      element.classList.add('rcx-sidebar--main');
      element.style.border = '1px solid var(--sidebar-border-color)';
    } else {
      element.classList.add('sidebar');
    }
  }
  return element;
};
const setServerVersionToSidebar = version => {
  serverVersion = version;
};
const setBackground = imageUrl => {
  const element = getElement();
  element.style.backgroundImage = imageUrl ? `url(${JSON.stringify(getAbsoluteUrl(imageUrl))})` : 'none';
  pollSidebarStyle(element, sideBarStyle => {
    dispatch({
      type: WEBVIEW_SIDEBAR_STYLE_CHANGED,
      payload: {
        url: getServerUrl(),
        style: sideBarStyle
      }
    });
  });
};
const setSidebarCustomTheme = customTheme => {
  dispatch({
    type: WEBVIEW_SIDEBAR_CUSTOM_THEME_CHANGED,
    payload: {
      url: getServerUrl(),
      customTheme
    }
  });
};

const setUserThemeAppearance = themeAppearance => {
  dispatch({
    type: WEBVIEW_USER_THEME_APPEARANCE_CHANGED,
    payload: {
      url: getServerUrl(),
      themeAppearance
    }
  });
};

const setTitle = title => {
  if (typeof title !== 'string') {
    return;
  }
  const url = getServerUrl();
  if (title === 'Rocket.Chat' && new URL(url).host !== 'open.rocket.chat') {
    dispatch({
      type: WEBVIEW_TITLE_CHANGED,
      payload: {
        url,
        title: `${title} - ${url}`
      }
    });
    return;
  }
  dispatch({
    type: WEBVIEW_TITLE_CHANGED,
    payload: {
      url,
      title
    }
  });
};

const setUserLoggedIn = userLoggedIn => {
  dispatch({
    type: WEBVIEW_USER_LOGGED_IN,
    payload: {
      url: getServerUrl(),
      userLoggedIn
    }
  });
};

let serverInfo;
let cb = _serverInfo => undefined;
const RocketChatDesktop = {
  onReady: c => {
    if (serverInfo) {
      c(serverInfo);
    }
    cb = c;
  },
  setServerInfo: _serverInfo => {
    serverInfo = _serverInfo;
    cb(_serverInfo);
    setServerVersionToSidebar(_serverInfo.version);
  },
  setUrlResolver,
  setBadge,
  setFavicon,
  setBackground,
  setTitle,
  setUserPresenceDetection,
  setUserLoggedIn,
  setUserThemeAppearance,
  createNotification,
  destroyNotification,
  getInternalVideoChatWindowEnabled,
  openInternalVideoChatWindow,
  setGitCommitHash,
  writeTextToClipboard,
  getOutlookEvents,
  setOutlookExchangeUrl,
  hasOutlookCredentials,
  clearOutlookCredentials,
  setUserToken,
  setSidebarCustomTheme,
  openDocumentViewer
};

function debounce(cb, wait = 20) {
  let h;
  const callable = (...args) => {
    h && clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return callable;
}

let focusedMessageBoxInput = null;
const handleFocusEvent = event => {
  if (!(event.target instanceof Element)) {
    return;
  }
  if (!event.target.classList.contains('js-input-message')) {
    return;
  }
  focusedMessageBoxInput = event.target;
  dispatch({
    type: WEBVIEW_MESSAGE_BOX_FOCUSED
  });
};
const handleBlurEvent = event => {
  if (!(event.target instanceof Element)) {
    return;
  }
  if (!event.target.classList.contains('js-input-message')) {
    return;
  }
  focusedMessageBoxInput = null;
  dispatch({
    type: WEBVIEW_MESSAGE_BOX_BLURRED
  });
};
const listenToMessageBoxEvents = () => {
  listen(TOUCH_BAR_FORMAT_BUTTON_TOUCHED, action => {
    if (!focusedMessageBoxInput) {
      return;
    }
    const {
      payload: buttonId
    } = action;
    const ancestor = focusedMessageBoxInput.closest('.rc-message-box');
    const button = ancestor === null || ancestor === void 0 ? void 0 : ancestor.querySelector(`[data-id='${buttonId}']`);
    button === null || button === void 0 || button.click();
  });
  document.addEventListener('focus', handleFocusEvent, true);
  document.addEventListener('blur', handleBlurEvent, true);
};

const selectIsSideBarVisible = ({
  servers,
  isSideBarEnabled
}) => servers.length > 0 && isSideBarEnabled;
const handleTrafficLightsSpacing = () => {
  if (process.platform !== 'darwin') {
    return;
  }
  const style = document.getElementById('sidebar-padding') || document.createElement('style');
  style.id = 'sidebar-padding';
  document.head.append(style);
  watch(selectIsSideBarVisible, isSideBarVisible => {
    style.innerHTML = `
      .sidebar {
        padding-top: ${isSideBarVisible ? 0 : '10px'} !important;
        transition: padding-top 230ms ease-in-out !important;
      }
    `;
  });
};

const whenReady = () => new Promise(resolve => {
  if (document.readyState === 'complete') {
    resolve();
    return;
  }
  const handleReadyStateChange = () => {
    if (document.readyState !== 'complete') {
      return;
    }
    document.removeEventListener('readystatechange', handleReadyStateChange);
    resolve();
  };
  document.addEventListener('readystatechange', handleReadyStateChange);
});

console.log('[Rocket.Chat Desktop] Preload.ts');
electron.contextBridge.exposeInMainWorld('JitsiMeetElectron', JitsiMeetElectron);
electron.contextBridge.exposeInMainWorld('RocketChatDesktop', RocketChatDesktop);
let retryCount = 0;
const start = async () => {
  console.log('[Rocket.Chat Desktop] Preload.ts start fired');
  const serverUrl = await invoke('server-view/get-url');
  if (retryCount > 5) return;
  if (!serverUrl) {
    console.log('[Rocket.Chat Desktop] serverUrl is not defined');
    console.log('[Rocket.Chat Desktop] Preload start - retrying in 1 seconds');
    setTimeout(start, 1000);
    retryCount += 1;
    return;
  }
  window.removeEventListener('load', start);
  setServerUrl(serverUrl);
  await whenReady();
  await createRendererReduxStore();
  await invoke('server-view/ready');
  console.log('[Rocket.Chat Desktop] waiting for RocketChatDesktop.onReady');
  RocketChatDesktop.onReady(() => {
    console.log('[Rocket.Chat Desktop] RocketChatDesktop.onReady fired');
    listen(WEBVIEW_DID_NAVIGATE, debounce(() => {
      const resources = electron.webFrame.getResourceUsage();
      // TODO: make this configurable
      if (resources.images.size > 50 * 1024 * 1024) {
        electron.webFrame.clearCache();
      }
    }, 1000 * 30));
    listenToNotificationsRequests();
    listenToScreenSharingRequests();
    listenToMessageBoxEvents();
    handleTrafficLightsSpacing();
  });
};
console.log('[Rocket.Chat Desktop] waiting for window load');
window.addEventListener('load', start);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2lwYy9yZW5kZXJlci50cyIsIi4uL3NyYy9qaXRzaS9wcmVsb2FkLnRzIiwiLi4vc3JjL3NlcnZlcnMvcHJlbG9hZC91cmxzLnRzIiwiLi4vc3JjL3N0b3JlL2ZzYS50cyIsIi4uL3NyYy9zdG9yZS9pcGMudHMiLCIuLi9zcmMvYXBwL2FjdGlvbnMudHMiLCIuLi9zcmMvYXBwL3JlZHVjZXJzL2FsbG93ZWROVExNQ3JlZGVudGlhbHNEb21haW5zLnRzIiwiLi4vc3JjL2FwcC9yZWR1Y2Vycy9hcHBQYXRoLnRzIiwiLi4vc3JjL2FwcC9yZWR1Y2Vycy9hcHBWZXJzaW9uLnRzIiwiLi4vc3JjL2FwcC9yZWR1Y2Vycy9tYWNoaW5lVGhlbWUudHMiLCIuLi9zcmMvYXBwL3JlZHVjZXJzL21haW5XaW5kb3dUaXRsZS50cyIsIi4uL3NyYy9kb3dubG9hZHMvYWN0aW9ucy50cyIsIi4uL3NyYy9kb3dubG9hZHMvY29tbW9uLnRzIiwiLi4vc3JjL2Rvd25sb2Fkcy9yZWR1Y2Vycy9kb3dubG9hZHMudHMiLCIuLi9zcmMvaml0c2kvYWN0aW9ucy50cyIsIi4uL3NyYy9qaXRzaS9yZWR1Y2Vycy50cyIsIi4uL3NyYy9uYXZpZ2F0aW9uL2FjdGlvbnMudHMiLCIuLi9zcmMvbmF2aWdhdGlvbi9yZWR1Y2Vycy50cyIsIi4uL3NyYy9kZWVwTGlua3MvYWN0aW9ucy50cyIsIi4uL3NyYy9vdXRsb29rQ2FsZW5kYXIvYWN0aW9ucy50cyIsIi4uL3NyYy91aS9hY3Rpb25zLnRzIiwiLi4vc3JjL3NlcnZlcnMvYWN0aW9ucy50cyIsIi4uL3NyYy9zZXJ2ZXJzL3JlZHVjZXJzLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2F2YWlsYWJsZUJyb3dzZXJzLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2N1cnJlbnRWaWV3LnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2hhc0hpZGVPblRyYXlOb3RpZmljYXRpb25TaG93bi50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9pc0FkZE5ld1NlcnZlcnNFbmFibGVkLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2lzRGV2ZWxvcGVyTW9kZUVuYWJsZWQudHMiLCIuLi9zcmMvdXBkYXRlcy9hY3Rpb25zLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2lzRmxhc2hGcmFtZUVuYWJsZWQudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvaXNIYXJkd2FyZUFjY2VsZXJhdGlvbkVuYWJsZWQudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvaXNJbnRlcm5hbFZpZGVvQ2hhdFdpbmRvd0VuYWJsZWQudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvaXNNZW51QmFyRW5hYmxlZC50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9pc01lc3NhZ2VCb3hGb2N1c2VkLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2lzTWluaW1pemVPbkNsb3NlRW5hYmxlZC50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9pc05UTE1DcmVkZW50aWFsc0VuYWJsZWQudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvaXNSZXBvcnRFbmFibGVkLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2lzU2hvd1dpbmRvd09uVW5yZWFkQ2hhbmdlZEVuYWJsZWQudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvaXNTaWRlQmFyRW5hYmxlZC50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9pc1RyYXlJY29uRW5hYmxlZC50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9pc1ZpZGVvQ2FsbERldnRvb2xzQXV0b09wZW5FbmFibGVkLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2lzVmlkZW9DYWxsV2luZG93UGVyc2lzdGVuY2VFbmFibGVkLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL2xhc3RTZWxlY3RlZFNlcnZlclVybC50cyIsIi4uL3NyYy9zY3JlZW5TaGFyaW5nL2FjdGlvbnMudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvb3BlbkRpYWxvZy50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9yb290V2luZG93SWNvbi50cyIsIi4uL3NyYy91aS9yZWR1Y2Vycy9yb290V2luZG93U3RhdGUudHMiLCIuLi9zcmMvdWkvcmVkdWNlcnMvc2VsZWN0ZWRCcm93c2VyLnRzIiwiLi4vc3JjL3VpL3JlZHVjZXJzL3ZpZGVvQ2FsbFdpbmRvd1N0YXRlLnRzIiwiLi4vc3JjL3VwZGF0ZXMvcmVkdWNlcnMudHMiLCIuLi9zcmMvc3RvcmUvcm9vdFJlZHVjZXIudHMiLCIuLi9zcmMvc3RvcmUvaW5kZXgudHMiLCIuLi9zcmMvbm90aWZpY2F0aW9ucy9hY3Rpb25zLnRzIiwiLi4vc3JjL25vdGlmaWNhdGlvbnMvcHJlbG9hZC50cyIsIi4uL3NyYy9zY3JlZW5TaGFyaW5nL3ByZWxvYWQudHMiLCIuLi9zcmMvb3V0bG9va0NhbGVuZGFyL3ByZWxvYWQudHMiLCIuLi9zcmMvdXNlclByZXNlbmNlL2FjdGlvbnMudHMiLCIuLi9zcmMvdXNlclByZXNlbmNlL3ByZWxvYWQudHMiLCIuLi9zcmMvc2VydmVycy9wcmVsb2FkL2JhZGdlLnRzIiwiLi4vc3JjL3NlcnZlcnMvcHJlbG9hZC9jbGlwYm9hcmQudHMiLCIuLi9zcmMvc2VydmVycy9wcmVsb2FkL2RvY3VtZW50Vmlld2VyLnRzIiwiLi4vc3JjL3NlcnZlcnMvcHJlbG9hZC9mYXZpY29uLnRzIiwiLi4vc3JjL3NlcnZlcnMvcHJlbG9hZC9naXRDb21taXRIYXNoLnRzIiwiLi4vc3JjL3N0b3JlL3JlYWRTZXR0aW5nLnRzIiwiLi4vc3JjL3V0aWxzL2Jyb3dzZXJMYXVuY2hlci50cyIsIi4uL3NyYy9zZXJ2ZXJzL3ByZWxvYWQvaW50ZXJuYWxWaWRlb0NoYXRXaW5kb3cudHMiLCIuLi9zcmMvc2VydmVycy9wcmVsb2FkL3NpZGViYXIudHMiLCIuLi9zcmMvc2VydmVycy9wcmVsb2FkL3RoZW1lQXBwZWFyYW5jZS50cyIsIi4uL3NyYy9zZXJ2ZXJzL3ByZWxvYWQvdGl0bGUudHMiLCIuLi9zcmMvc2VydmVycy9wcmVsb2FkL3VzZXJMb2dnZWRJbi50cyIsIi4uL3NyYy9zZXJ2ZXJzL3ByZWxvYWQvYXBpLnRzIiwiLi4vc3JjL3VpL21haW4vZGVib3VuY2UudHMiLCIuLi9zcmMvdWkvcHJlbG9hZC9tZXNzYWdlQm94LnRzIiwiLi4vc3JjL3VpL3ByZWxvYWQvc2lkZWJhci50cyIsIi4uL3NyYy93aGVuUmVhZHkudHMiLCIuLi9zcmMvcHJlbG9hZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IElwY1JlbmRlcmVyRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHR5cGUgeyBIYW5kbGVyLCBDaGFubmVsIH0gZnJvbSAnLi9jaGFubmVscyc7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGUgPSA8TiBleHRlbmRzIENoYW5uZWw+KFxuICBjaGFubmVsOiBOLFxuICBoYW5kbGVyOiAoLi4uYXJnczogUGFyYW1ldGVyczxIYW5kbGVyPE4+PikgPT4gUHJvbWlzZTxSZXR1cm5UeXBlPEhhbmRsZXI8Tj4+PlxuKTogKCgpID0+IHZvaWQpID0+IHtcbiAgY29uc3QgbGlzdGVuZXIgPSBhc3luYyAoXG4gICAgXzogSXBjUmVuZGVyZXJFdmVudCxcbiAgICBpZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IGFueVtdXG4gICk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNvbHZlZCA9IGF3YWl0IGhhbmRsZXIoLi4uKGFyZ3MgYXMgUGFyYW1ldGVyczxIYW5kbGVyPE4+PikpO1xuXG4gICAgICBpcGNSZW5kZXJlci5zZW5kKGAke2NoYW5uZWx9QCR7aWR9YCwgeyByZXNvbHZlZCB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJlxuICAgICAgICBpcGNSZW5kZXJlci5zZW5kKGAke2NoYW5uZWx9QCR7aWR9YCwge1xuICAgICAgICAgIHJlamVjdGVkOiB7XG4gICAgICAgICAgICBuYW1lOiAoZXJyb3IgYXMgRXJyb3IpLm5hbWUsXG4gICAgICAgICAgICBtZXNzYWdlOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UsXG4gICAgICAgICAgICBzdGFjazogKGVycm9yIGFzIEVycm9yKS5zdGFjayxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgbGlzdGVuZXIpO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgaXBjUmVuZGVyZXIucmVtb3ZlTGlzdGVuZXIoY2hhbm5lbCwgbGlzdGVuZXIpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGludm9rZSA9IDxOIGV4dGVuZHMgQ2hhbm5lbD4oXG4gIGNoYW5uZWw6IE4sXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8SGFuZGxlcjxOPj5cbik6IFByb21pc2U8UmV0dXJuVHlwZTxIYW5kbGVyPE4+Pj4gPT4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLmFyZ3MpO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZXRyeU9wdGlvbnMge1xuICAvKiogTWF4aW11bSBudW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgKGRlZmF1bHQ6IDMpICovXG4gIG1heEF0dGVtcHRzPzogbnVtYmVyO1xuICAvKiogRGVsYXkgYmV0d2VlbiByZXRyaWVzIGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMCkgKi9cbiAgcmV0cnlEZWxheT86IG51bWJlcjtcbiAgLyoqIFdoZXRoZXIgdG8gbG9nIHJldHJ5IGF0dGVtcHRzIChkZWZhdWx0OiB0cnVlKSAqL1xuICBsb2dSZXRyaWVzPzogYm9vbGVhbjtcbiAgLyoqIEN1c3RvbSByZXRyeSBjb25kaXRpb24gLSByZXR1cm4gdHJ1ZSB0byByZXRyeSwgZmFsc2UgdG8gZ2l2ZSB1cCAqL1xuICBzaG91bGRSZXRyeT86IChlcnJvcjogYW55LCBhdHRlbXB0OiBudW1iZXIpID0+IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBpbnZva2VXaXRoUmV0cnkgPSA8TiBleHRlbmRzIENoYW5uZWw+KFxuICBjaGFubmVsOiBOLFxuICByZXRyeU9wdGlvbnM6IElSZXRyeU9wdGlvbnMgPSB7fSxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxIYW5kbGVyPE4+PlxuKTogUHJvbWlzZTxSZXR1cm5UeXBlPEhhbmRsZXI8Tj4+PiA9PiB7XG4gIGNvbnN0IHtcbiAgICBtYXhBdHRlbXB0cyA9IDMsXG4gICAgcmV0cnlEZWxheSA9IDEwMDAsXG4gICAgbG9nUmV0cmllcyA9IHRydWUsXG4gICAgc2hvdWxkUmV0cnkgPSAoKSA9PiB0cnVlLFxuICB9ID0gcmV0cnlPcHRpb25zO1xuXG4gIGNvbnN0IGF0dGVtcHRJbnZva2UgPSBhc3luYyAoXG4gICAgYXR0ZW1wdDogbnVtYmVyXG4gICk6IFByb21pc2U8UmV0dXJuVHlwZTxIYW5kbGVyPE4+Pj4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpcGNSZW5kZXJlci5pbnZva2UoY2hhbm5lbCwgLi4uYXJncyk7XG5cbiAgICAgIC8vIENoZWNrIGlmIHJlc3VsdCBpbmRpY2F0ZXMgZmFpbHVyZSAoZm9yIGNoYW5uZWxzIHRoYXQgcmV0dXJuIHN1Y2Nlc3MgZmxhZ3MpXG4gICAgICBpZiAoXG4gICAgICAgIHJlc3VsdCAmJlxuICAgICAgICB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAnc3VjY2VzcycgaW4gcmVzdWx0ICYmXG4gICAgICAgIHJlc3VsdC5zdWNjZXNzID09PSBmYWxzZVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSVBDIGNhbGwgZmFpbGVkOiAke2NoYW5uZWx9IHJldHVybmVkIHN1Y2Nlc3M6IGZhbHNlYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGlzTGFzdEF0dGVtcHQgPSBhdHRlbXB0ID49IG1heEF0dGVtcHRzO1xuXG4gICAgICBpZiAobG9nUmV0cmllcykge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBgSVBDIGNhbGwgZmFpbGVkOiAke2NoYW5uZWx9IChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhBdHRlbXB0c30pYCxcbiAgICAgICAgICBlcnJvclxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNMYXN0QXR0ZW1wdCB8fCAhc2hvdWxkUmV0cnkoZXJyb3IsIGF0dGVtcHQpKSB7XG4gICAgICAgIGlmIChsb2dSZXRyaWVzKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIGBJUEMgY2FsbCBnaXZpbmcgdXA6ICR7Y2hhbm5lbH0gYWZ0ZXIgJHthdHRlbXB0fSBhdHRlbXB0c2AsXG4gICAgICAgICAgICBlcnJvclxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGlmIChsb2dSZXRyaWVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIGBJUEMgY2FsbCByZXRyeWluZzogJHtjaGFubmVsfSBpbiAke3JldHJ5RGVsYXl9bXMuLi4gKGF0dGVtcHQgJHthdHRlbXB0ICsgMX0vJHttYXhBdHRlbXB0c30pYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCByZXRyeURlbGF5KSk7XG4gICAgICByZXR1cm4gYXR0ZW1wdEludm9rZShhdHRlbXB0ICsgMSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBhdHRlbXB0SW52b2tlKDEpO1xufTtcbiIsImltcG9ydCB0eXBlIHtcbiAgU291cmNlc09wdGlvbnMsXG4gIERlc2t0b3BDYXB0dXJlclNvdXJjZSxcbiAgTmF0aXZlSW1hZ2UsXG4gIERlc2t0b3BDYXB0dXJlcixcbn0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgaXBjUmVuZGVyZXIgfSBmcm9tICdlbGVjdHJvbic7XG5cbmNvbnN0IGppdHNpRG9tYWluID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcblxuZXhwb3J0IGNvbnN0IGRlc2t0b3BDYXB0dXJlcjogRGVza3RvcENhcHR1cmVyID0ge1xuICBnZXRTb3VyY2VzOiAob3B0czogU291cmNlc09wdGlvbnMpID0+XG4gICAgaXBjUmVuZGVyZXIuaW52b2tlKCdqaXRzaS1kZXNrdG9wLWNhcHR1cmVyLWdldC1zb3VyY2VzJywgW1xuICAgICAgb3B0cyxcbiAgICAgIGppdHNpRG9tYWluLFxuICAgIF0pLFxufTtcblxuZXhwb3J0IHR5cGUgSml0c2lNZWV0RWxlY3Ryb25BUEkgPSB7XG4gIG9idGFpbkRlc2t0b3BTdHJlYW1zOiAoXG4gICAgY2FsbGJhY2s6IChzb3VyY2VzOiBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VbXSkgPT4gdm9pZCxcbiAgICBlcnJvckNhbGxiYWNrOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkLFxuICAgIG9wdGlvbnM6IFNvdXJjZXNPcHRpb25zXG4gICkgPT4gUHJvbWlzZTx2b2lkPjtcbn07XG5cbmV4cG9ydCBjb25zdCBKaXRzaU1lZXRFbGVjdHJvbjogSml0c2lNZWV0RWxlY3Ryb25BUEkgPSB7XG4gIGFzeW5jIG9idGFpbkRlc2t0b3BTdHJlYW1zKGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNvdXJjZXMgPSAoXG4gICAgICAgIGF3YWl0IGRlc2t0b3BDYXB0dXJlci5nZXRTb3VyY2VzKG9wdGlvbnMpXG4gICAgICApLm1hcDxEZXNrdG9wQ2FwdHVyZXJTb3VyY2U+KChzb3VyY2U6IGFueSkgPT4gKHtcbiAgICAgICAgaWQ6IHNvdXJjZS5pZCxcbiAgICAgICAgbmFtZTogc291cmNlLm5hbWUsXG4gICAgICAgIGRpc3BsYXlfaWQ6IHNvdXJjZS5kaXNwbGF5X2lkLFxuICAgICAgICB0aHVtYm5haWw6IHtcbiAgICAgICAgICB0b0RhdGFVUkw6ICgpID0+IHNvdXJjZS50aHVtYm5haWwudG9EYXRhVVJMKCksXG4gICAgICAgIH0gYXMgTmF0aXZlSW1hZ2UsXG4gICAgICAgIGFwcEljb246IHtcbiAgICAgICAgICB0b0RhdGFVUkw6ICgpID0+IHNvdXJjZS5hcHBJY29uLnRvRGF0YVVSTCgpLFxuICAgICAgICB9IGFzIE5hdGl2ZUltYWdlLFxuICAgICAgfSkpO1xuXG4gICAgICBjYWxsYmFjayhzb3VyY2VzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvckNhbGxiYWNrKGVycm9yKTtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9XG4gIH0sXG59O1xuIiwiZXhwb3J0IGxldCBnZXRBYnNvbHV0ZVVybDogKHJlbGF0aXZlUGF0aD86IHN0cmluZykgPT4gc3RyaW5nO1xuXG5sZXQgc2VydmVyVXJsOiBzdHJpbmc7XG5cbmV4cG9ydCBjb25zdCBzZXRTZXJ2ZXJVcmwgPSAoX3NlcnZlclVybDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIHNlcnZlclVybCA9IF9zZXJ2ZXJVcmw7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2VydmVyVXJsID0gKCk6IHN0cmluZyA9PiBzZXJ2ZXJVcmw7XG5cbmV4cG9ydCBjb25zdCBzZXRVcmxSZXNvbHZlciA9IChcbiAgX2dldEFic29sdXRlVXJsOiAocmVsYXRpdmVQYXRoPzogc3RyaW5nKSA9PiBzdHJpbmdcbik6IHZvaWQgPT4ge1xuICBnZXRBYnNvbHV0ZVVybCA9IF9nZXRBYnNvbHV0ZVVybDtcbn07XG4iLCJleHBvcnQgdHlwZSBGbHV4U3RhbmRhcmRBY3Rpb248XG4gIFR5cGUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4gIFBheWxvYWQgPSB2b2lkLFxuPiA9IHZvaWQgZXh0ZW5kcyBQYXlsb2FkXG4gID8ge1xuICAgICAgdHlwZTogVHlwZTtcbiAgICB9XG4gIDoge1xuICAgICAgdHlwZTogVHlwZTtcbiAgICAgIHBheWxvYWQ6IFBheWxvYWQ7XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IGlzRlNBID0gPEFjdGlvbiBleHRlbmRzIEZsdXhTdGFuZGFyZEFjdGlvbjxzdHJpbmcsIHVua25vd24+PihcbiAgYWN0aW9uOiB1bmtub3duXG4pOiBhY3Rpb24gaXMgQWN0aW9uID0+XG4gIHR5cGVvZiBhY3Rpb24gPT09ICdvYmplY3QnICYmXG4gIGFjdGlvbiAhPT0gbnVsbCAmJlxuICAhQXJyYXkuaXNBcnJheShhY3Rpb24pICYmXG4gICd0eXBlJyBpbiBhY3Rpb24gJiZcbiAgdHlwZW9mIChhY3Rpb24gYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZSA9PT0gJ3N0cmluZyc7XG5cbmV4cG9ydCBjb25zdCBoYXNNZXRhID0gPEFjdGlvbiBleHRlbmRzIEZsdXhTdGFuZGFyZEFjdGlvbjxzdHJpbmcsIHVua25vd24+PihcbiAgYWN0aW9uOiBBY3Rpb25cbik6IGFjdGlvbiBpcyBBY3Rpb24gJiB7IG1ldGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0gPT5cbiAgJ21ldGEnIGluIGFjdGlvbiAmJlxuICB0eXBlb2YgKGFjdGlvbiBhcyBBY3Rpb24gJiB7IG1ldGE6IHVua25vd24gfSkubWV0YSA9PT0gJ29iamVjdCcgJiZcbiAgKGFjdGlvbiBhcyBBY3Rpb24gJiB7IG1ldGE6IHVua25vd24gfSkubWV0YSAhPT0gbnVsbDtcblxuZXhwb3J0IGNvbnN0IGlzUmVzcG9uc2UgPSA8QWN0aW9uIGV4dGVuZHMgRmx1eFN0YW5kYXJkQWN0aW9uPHN0cmluZywgdW5rbm93bj4+KFxuICBhY3Rpb246IEFjdGlvblxuKTogYWN0aW9uIGlzIEFjdGlvbiAmIHsgbWV0YTogeyByZXNwb25zZTogYm9vbGVhbjsgaWQ6IHVua25vd24gfSB9ID0+XG4gIGhhc01ldGEoYWN0aW9uKSAmJlxuICAoYWN0aW9uIGFzIEFjdGlvbiAmIHsgbWV0YTogeyByZXNwb25zZTogdW5rbm93bjsgaWQ6IHVua25vd24gfSB9KS5tZXRhXG4gICAgLnJlc3BvbnNlID09PSB0cnVlO1xuXG5leHBvcnQgY29uc3QgaXNSZXF1ZXN0ID0gPEFjdGlvbiBleHRlbmRzIEZsdXhTdGFuZGFyZEFjdGlvbjxzdHJpbmcsIHVua25vd24+PihcbiAgYWN0aW9uOiBBY3Rpb25cbik6IGFjdGlvbiBpcyBBY3Rpb24gJiB7IG1ldGE6IHsgcmVxdWVzdDogYm9vbGVhbjsgaWQ6IHVua25vd24gfSB9ID0+XG4gIGhhc01ldGEoYWN0aW9uKSAmJlxuICAoYWN0aW9uIGFzIEFjdGlvbiAmIHsgbWV0YTogeyByZXF1ZXN0OiB1bmtub3duOyBpZDogdW5rbm93biB9IH0pLm1ldGFcbiAgICAucmVxdWVzdCA9PT0gdHJ1ZTtcblxuZXhwb3J0IGNvbnN0IGlzTG9jYWxseVNjb3BlZCA9IDxcbiAgQWN0aW9uIGV4dGVuZHMgRmx1eFN0YW5kYXJkQWN0aW9uPHN0cmluZywgdW5rbm93bj4sXG4+KFxuICBhY3Rpb246IEFjdGlvblxuKTogYWN0aW9uIGlzIEFjdGlvbiAmIHsgbWV0YTogeyBzY29wZTogJ2xvY2FsJyB9IH0gPT5cbiAgaGFzTWV0YShhY3Rpb24pICYmXG4gIChhY3Rpb24gYXMgQWN0aW9uICYgeyBtZXRhOiB7IHNjb3BlOiB1bmtub3duIH0gfSkubWV0YS5zY29wZSA9PT0gJ2xvY2FsJztcblxuZXhwb3J0IGNvbnN0IGlzU2luZ2xlU2NvcGVkID0gPFxuICBBY3Rpb24gZXh0ZW5kcyBGbHV4U3RhbmRhcmRBY3Rpb248c3RyaW5nLCB1bmtub3duPixcbj4oXG4gIGFjdGlvbjogQWN0aW9uXG4pOiBhY3Rpb24gaXMgQWN0aW9uICYge1xuICBpcGNNZXRhOiB7IHNjb3BlOiAnc2luZ2xlJzsgd2ViQ29udGVudHNJZDogbnVtYmVyOyB2aWV3SW5zdGFuY2VJZD86IG51bWJlciB9O1xufSA9PlxuICAoYWN0aW9uIGFzIGFueSAmIHsgaXBjTWV0YTogeyB3ZWJDb250ZW50c0lkOiB1bmtub3duIH0gfSkuaXBjTWV0YVxuICAgID8ud2ViQ29udGVudHNJZCAmJlxuICAoYWN0aW9uIGFzIGFueSAmIHsgaXBjTWV0YTogeyBzY29wZTogdW5rbm93biB9IH0pLmlwY01ldGE/LnNjb3BlID09PSAnc2luZ2xlJztcblxuZXhwb3J0IGNvbnN0IGlzRXJyb3JlZCA9IDxBY3Rpb24gZXh0ZW5kcyBGbHV4U3RhbmRhcmRBY3Rpb248c3RyaW5nLCB1bmtub3duPj4oXG4gIGFjdGlvbjogQWN0aW9uXG4pOiBhY3Rpb24gaXMgQWN0aW9uICYgeyBlcnJvcjogdHJ1ZTsgcGF5bG9hZDogRXJyb3IgfSA9PlxuICAnbWV0YScgaW4gYWN0aW9uICYmXG4gIChhY3Rpb24gYXMgdW5rbm93biBhcyBBY3Rpb24gJiB7IGVycm9yOiB1bmtub3duIH0pLmVycm9yID09PSB0cnVlICYmXG4gIChhY3Rpb24gYXMgdW5rbm93biBhcyBBY3Rpb24gJiB7IHBheWxvYWQ6IHVua25vd24gfSkucGF5bG9hZCBpbnN0YW5jZW9mIEVycm9yO1xuXG5leHBvcnQgY29uc3QgaGFzUGF5bG9hZCA9IDxBY3Rpb24gZXh0ZW5kcyBGbHV4U3RhbmRhcmRBY3Rpb248c3RyaW5nLCB1bmtub3duPj4oXG4gIGFjdGlvbjogQWN0aW9uXG4pOiBhY3Rpb24gaXMgQWN0aW9uICYge1xuICBwYXlsb2FkOiBBY3Rpb24gZXh0ZW5kcyB7IHBheWxvYWQ6IGluZmVyIFAgfSA/IFAgOiBuZXZlcjtcbn0gPT4gJ3BheWxvYWQnIGluIGFjdGlvbjtcblxuZXhwb3J0IGNvbnN0IGlzUmVzcG9uc2VUbyA9XG4gIDxcbiAgICBBY3Rpb24gZXh0ZW5kcyBGbHV4U3RhbmRhcmRBY3Rpb248c3RyaW5nLCB1bmtub3duPixcbiAgICBUeXBlcyBleHRlbmRzIFsuLi5zdHJpbmdbXV0sXG4gID4oXG4gICAgaWQ6IHVua25vd24sXG4gICAgLi4udHlwZXM6IFR5cGVzXG4gICkgPT5cbiAgKFxuICAgIGFjdGlvbjogQWN0aW9uXG4gICk6IGFjdGlvbiBpcyBBY3Rpb24gJlxuICAgIHtcbiAgICAgIFtUeXBlIGluIFR5cGVzW251bWJlcl1dOiB7XG4gICAgICAgIHR5cGU6IFR5cGU7XG4gICAgICAgIG1ldGE6IHsgcmVzcG9uc2U6IGJvb2xlYW47IGlkOiB1bmtub3duIH07XG4gICAgICB9O1xuICAgIH1bVHlwZXNbbnVtYmVyXV0gPT5cbiAgICBpc1Jlc3BvbnNlKGFjdGlvbikgJiYgdHlwZXMuaW5jbHVkZXMoYWN0aW9uLnR5cGUpICYmIGFjdGlvbi5tZXRhLmlkID09PSBpZDtcbiIsImltcG9ydCB0eXBlIHsgV2ViQ29udGVudHMgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmUsIE1pZGRsZXdhcmVBUEkgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IGhhbmRsZSBhcyBoYW5kbGVPbk1haW4sIGludm9rZSBhcyBpbnZva2VGcm9tTWFpbiB9IGZyb20gJy4uL2lwYy9tYWluJztcbmltcG9ydCB7XG4gIGhhbmRsZSBhcyBoYW5kbGVGcm9tUmVuZGVyZXIsXG4gIGludm9rZSBhcyBpbnZva2VGcm9tUmVuZGVyZXIsXG59IGZyb20gJy4uL2lwYy9yZW5kZXJlcic7XG5pbXBvcnQgeyBpc0ZTQSwgaXNMb2NhbGx5U2NvcGVkLCBoYXNNZXRhLCBpc1NpbmdsZVNjb3BlZCB9IGZyb20gJy4vZnNhJztcblxuY29uc3QgZW51bSBBY3Rpb25TY29wZSB7XG4gIExPQ0FMID0gJ2xvY2FsJyxcbiAgU0lOR0xFID0gJ3NpbmdsZScsXG59XG5cbmV4cG9ydCBjb25zdCBmb3J3YXJkVG9SZW5kZXJlcnM6IE1pZGRsZXdhcmUgPSAoYXBpOiBNaWRkbGV3YXJlQVBJKSA9PiB7XG4gIGNvbnN0IHJlbmRlcmVycyA9IG5ldyBTZXQ8V2ViQ29udGVudHM+KCk7XG5cbiAgaGFuZGxlT25NYWluKCdyZWR1eC9nZXQtaW5pdGlhbC1zdGF0ZScsIGFzeW5jICh3ZWJDb250ZW50cykgPT4ge1xuICAgIHJlbmRlcmVycy5hZGQod2ViQ29udGVudHMpO1xuICAgIHdlYkNvbnRlbnRzLmFkZExpc3RlbmVyKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICByZW5kZXJlcnMuZGVsZXRlKHdlYkNvbnRlbnRzKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcGkuZ2V0U3RhdGUoKTtcbiAgfSk7XG5cbiAgaGFuZGxlT25NYWluKCdyZWR1eC9hY3Rpb24tZGlzcGF0Y2hlZCcsIGFzeW5jICh3ZWJDb250ZW50cywgYWN0aW9uKSA9PiB7XG4gICAgYXBpLmRpc3BhdGNoKHtcbiAgICAgIC4uLmFjdGlvbixcbiAgICAgIGlwY01ldGE6IHtcbiAgICAgICAgd2ViQ29udGVudHNJZDogd2ViQ29udGVudHMuaWQsXG4gICAgICAgIC4uLih3ZWJDb250ZW50cy5ob3N0V2ViQ29udGVudHM/LmlkICYmIHtcbiAgICAgICAgICB2aWV3SW5zdGFuY2VJZDogd2ViQ29udGVudHMuaG9zdFdlYkNvbnRlbnRzPy5pZCxcbiAgICAgICAgfSksXG4gICAgICAgIC4uLmFjdGlvbi5pcGNNZXRhLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIChuZXh0KSA9PiAoYWN0aW9uKSA9PiB7XG4gICAgaWYgKCFpc0ZTQShhY3Rpb24pIHx8IGlzTG9jYWxseVNjb3BlZChhY3Rpb24pKSB7XG4gICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJlckFjdGlvbiA9IHtcbiAgICAgIC4uLmFjdGlvbixcbiAgICAgIG1ldGE6IHtcbiAgICAgICAgLi4uKGhhc01ldGEoYWN0aW9uKSAmJiBhY3Rpb24ubWV0YSksXG4gICAgICAgIHNjb3BlOiBBY3Rpb25TY29wZS5MT0NBTCxcbiAgICAgIH0sXG4gICAgfTtcbiAgICBpZiAoaXNTaW5nbGVTY29wZWQoYWN0aW9uKSkge1xuICAgICAgY29uc3QgeyB3ZWJDb250ZW50c0lkLCB2aWV3SW5zdGFuY2VJZCB9ID0gYWN0aW9uLmlwY01ldGE7XG4gICAgICBbLi4ucmVuZGVyZXJzXVxuICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICh3KSA9PlxuICAgICAgICAgICAgdy5pZCA9PT0gd2ViQ29udGVudHNJZCB8fFxuICAgICAgICAgICAgKHZpZXdJbnN0YW5jZUlkICYmIHcuaWQgPT09IHZpZXdJbnN0YW5jZUlkKVxuICAgICAgICApXG4gICAgICAgIC5mb3JFYWNoKCh3KSA9PlxuICAgICAgICAgIGludm9rZUZyb21NYWluKHcsICdyZWR1eC9hY3Rpb24tZGlzcGF0Y2hlZCcsIHJlbmRlcmVyQWN0aW9uKVxuICAgICAgICApO1xuICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICB9XG4gICAgcmVuZGVyZXJzLmZvckVhY2goKHdlYkNvbnRlbnRzKSA9PiB7XG4gICAgICBpbnZva2VGcm9tTWFpbih3ZWJDb250ZW50cywgJ3JlZHV4L2FjdGlvbi1kaXNwYXRjaGVkJywgcmVuZGVyZXJBY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRJbml0aWFsU3RhdGUgPSAoKTogUHJvbWlzZTxhbnk+ID0+XG4gIGludm9rZUZyb21SZW5kZXJlcigncmVkdXgvZ2V0LWluaXRpYWwtc3RhdGUnKTtcblxuZXhwb3J0IGNvbnN0IGZvcndhcmRUb01haW46IE1pZGRsZXdhcmUgPSAoYXBpOiBNaWRkbGV3YXJlQVBJKSA9PiB7XG4gIGhhbmRsZUZyb21SZW5kZXJlcigncmVkdXgvYWN0aW9uLWRpc3BhdGNoZWQnLCBhc3luYyAoYWN0aW9uKSA9PiB7XG4gICAgYXBpLmRpc3BhdGNoKGFjdGlvbik7XG4gIH0pO1xuXG4gIHJldHVybiAobmV4dCkgPT4gKGFjdGlvbikgPT4ge1xuICAgIGlmICghaXNGU0EoYWN0aW9uKSB8fCBpc0xvY2FsbHlTY29wZWQoYWN0aW9uKSkge1xuICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICB9XG5cbiAgICBpbnZva2VGcm9tUmVuZGVyZXIoJ3JlZHV4L2FjdGlvbi1kaXNwYXRjaGVkJywgYWN0aW9uKTtcbiAgICByZXR1cm4gYWN0aW9uO1xuICB9O1xufTtcbiIsImltcG9ydCB0eXBlIHsgUGVyc2lzdGFibGVWYWx1ZXMgfSBmcm9tICcuL1BlcnNpc3RhYmxlVmFsdWVzJztcblxuZXhwb3J0IGNvbnN0IEFQUF9FUlJPUl9USFJPV04gPSAnYXBwL2Vycm9yLXRocm93bic7XG5leHBvcnQgY29uc3QgQVBQX1BBVEhfU0VUID0gJ2FwcC9wYXRoLXNldCc7XG5leHBvcnQgY29uc3QgQVBQX1ZFUlNJT05fU0VUID0gJ2FwcC92ZXJzaW9uLXNldCc7XG5leHBvcnQgY29uc3QgQVBQX1NFVFRJTkdTX0xPQURFRCA9ICdhcHAvc2V0dGluZ3MtbG9hZGVkJztcbmV4cG9ydCBjb25zdCBBUFBfQUxMT1dFRF9OVExNX0NSRURFTlRJQUxTX0RPTUFJTlNfU0VUID1cbiAgJ2FwcC9hbGxvd2VkLW50bG0tY3JlZGVudGlhbHMtZG9tYWlucy1zZXQnO1xuZXhwb3J0IGNvbnN0IEFQUF9NQUlOX1dJTkRPV19USVRMRV9TRVQgPSAnYXBwL21haW4td2luZG93LXRpdGxlLXNldCc7XG5leHBvcnQgY29uc3QgQVBQX01BQ0hJTkVfVEhFTUVfU0VUID0gJ2FwcC9tYWNoaW5lLXRoZW1lLXNldCc7XG5cbmV4cG9ydCB0eXBlIEFwcEFjdGlvblR5cGVUb1BheWxvYWRNYXAgPSB7XG4gIFtBUFBfRVJST1JfVEhST1dOXTogRXJyb3I7XG4gIFtBUFBfUEFUSF9TRVRdOiBzdHJpbmc7XG4gIFtBUFBfVkVSU0lPTl9TRVRdOiBzdHJpbmc7XG4gIFtBUFBfU0VUVElOR1NfTE9BREVEXTogUGFydGlhbDxQZXJzaXN0YWJsZVZhbHVlcz47XG4gIFtBUFBfQUxMT1dFRF9OVExNX0NSRURFTlRJQUxTX0RPTUFJTlNfU0VUXTogc3RyaW5nO1xuICBbQVBQX01BSU5fV0lORE9XX1RJVExFX1NFVF06IHN0cmluZztcbiAgW0FQUF9NQUNISU5FX1RIRU1FX1NFVF06IHN0cmluZztcbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7XG4gIEFQUF9BTExPV0VEX05UTE1fQ1JFREVOVElBTFNfRE9NQUlOU19TRVQsXG4gIEFQUF9TRVRUSU5HU19MT0FERUQsXG59IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIGFsbG93ZWROVExNQ3JlZGVudGlhbHNEb21haW5zQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX0FMTE9XRURfTlRMTV9DUkVERU5USUFMU19ET01BSU5TX1NFVD47XG5cbmV4cG9ydCBjb25zdCBhbGxvd2VkTlRMTUNyZWRlbnRpYWxzRG9tYWluczogUmVkdWNlcjxcbiAgc3RyaW5nIHwgbnVsbCxcbiAgYWxsb3dlZE5UTE1DcmVkZW50aWFsc0RvbWFpbnNBY3Rpb25cbj4gPSAoc3RhdGUgPSBudWxsLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyBhbGxvd2VkTlRMTUNyZWRlbnRpYWxzRG9tYWlucyA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBhbGxvd2VkTlRMTUNyZWRlbnRpYWxzRG9tYWlucztcbiAgICB9XG5cbiAgICBjYXNlIEFQUF9BTExPV0VEX05UTE1fQ1JFREVOVElBTFNfRE9NQUlOU19TRVQ6IHtcbiAgICAgIGlmIChhY3Rpb24ucGF5bG9hZCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgQVBQX1BBVEhfU0VUIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgQXBwUGF0aEFjdGlvbiA9IEFjdGlvbk9mPHR5cGVvZiBBUFBfUEFUSF9TRVQ+O1xuXG5leHBvcnQgY29uc3QgYXBwUGF0aDogUmVkdWNlcjxzdHJpbmcgfCBudWxsLCBBcHBQYXRoQWN0aW9uPiA9IChcbiAgc3RhdGUgPSBudWxsLFxuICBhY3Rpb25cbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBUFBfUEFUSF9TRVQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQgeyBBUFBfVkVSU0lPTl9TRVQgfSBmcm9tICcuLi9hY3Rpb25zJztcblxudHlwZSBBcHBWZXJzaW9uQWN0aW9uID0gQWN0aW9uT2Y8dHlwZW9mIEFQUF9WRVJTSU9OX1NFVD47XG5cbmV4cG9ydCBjb25zdCBhcHBWZXJzaW9uOiBSZWR1Y2VyPHN0cmluZyB8IG51bGwsIEFwcFZlcnNpb25BY3Rpb24+ID0gKFxuICBzdGF0ZSA9IG51bGwsXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFQUF9WRVJTSU9OX1NFVDpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7IEFQUF9NQUNISU5FX1RIRU1FX1NFVCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIE1hY2hpbmVUaGVtZUFjdGlvbiA9IEFjdGlvbk9mPHR5cGVvZiBBUFBfTUFDSElORV9USEVNRV9TRVQ+O1xuXG5leHBvcnQgY29uc3QgbWFjaGluZVRoZW1lOiBSZWR1Y2VyPHN0cmluZyB8IG51bGwsIE1hY2hpbmVUaGVtZUFjdGlvbj4gPSAoXG4gIHN0YXRlID0gJ2xpZ2h0JyxcbiAgYWN0aW9uXG4pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX01BQ0hJTkVfVEhFTUVfU0VUOiB7XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgQVBQX01BSU5fV0lORE9XX1RJVExFX1NFVCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIE1haW5XaW5kb3dUaXRsZUFjdGlvbiA9IEFjdGlvbk9mPHR5cGVvZiBBUFBfTUFJTl9XSU5ET1dfVElUTEVfU0VUPjtcblxuZXhwb3J0IGNvbnN0IG1haW5XaW5kb3dUaXRsZTogUmVkdWNlcjxzdHJpbmcgfCBudWxsLCBNYWluV2luZG93VGl0bGVBY3Rpb24+ID0gKFxuICBzdGF0ZSA9IG51bGwsXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFQUF9NQUlOX1dJTkRPV19USVRMRV9TRVQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBEb3dubG9hZCB9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IERPV05MT0FEX0NSRUFURUQgPSAnZG93bmxvYWRzL2NyZWF0ZWQnO1xuZXhwb3J0IGNvbnN0IERPV05MT0FEX1JFTU9WRUQgPSAnZG93bG9hZHMvcmVtb3ZlZCc7XG5leHBvcnQgY29uc3QgRE9XTkxPQURTX0NMRUFSRUQgPSAnZG93bmxvYWRzL2NsZWFyZWQnO1xuZXhwb3J0IGNvbnN0IERPV05MT0FEX1VQREFURUQgPSAnZG93bmxvYWRzL3VwZGF0ZWQnO1xuXG5leHBvcnQgdHlwZSBEb3dubG9hZHNBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbRE9XTkxPQURfQ1JFQVRFRF06IERvd25sb2FkO1xuICBbRE9XTkxPQURfVVBEQVRFRF06IFBpY2s8RG93bmxvYWQsICdpdGVtSWQnPiAmIFBhcnRpYWw8RG93bmxvYWQ+O1xuICBbRE9XTkxPQURfUkVNT1ZFRF06IERvd25sb2FkWydpdGVtSWQnXTtcbiAgW0RPV05MT0FEU19DTEVBUkVEXTogdm9pZDtcbn07XG4iLCJpbXBvcnQgdHlwZSB7IFNlcnZlciB9IGZyb20gJy4uL3NlcnZlcnMvY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IERvd25sb2FkU3RhdHVzID0ge1xuICBBTEw6ICdBbGwnLFxuICBQQVVTRUQ6ICdQYXVzZWQnLFxuICBDQU5DRUxMRUQ6ICdDYW5jZWxsZWQnLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgRG93bmxvYWQgPSB7XG4gIGl0ZW1JZDogbnVtYmVyO1xuICBzdGF0ZTpcbiAgICB8ICdwcm9ncmVzc2luZydcbiAgICB8ICdwYXVzZWQnXG4gICAgfCAnY29tcGxldGVkJ1xuICAgIHwgJ2NhbmNlbGxlZCdcbiAgICB8ICdpbnRlcnJ1cHRlZCdcbiAgICB8ICdleHBpcmVkJztcbiAgc3RhdHVzOiAodHlwZW9mIERvd25sb2FkU3RhdHVzKVtrZXlvZiB0eXBlb2YgRG93bmxvYWRTdGF0dXNdO1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICByZWNlaXZlZEJ5dGVzOiBudW1iZXI7XG4gIHRvdGFsQnl0ZXM6IG51bWJlcjtcbiAgc3RhcnRUaW1lOiBudW1iZXI7XG4gIGVuZFRpbWU6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgdXJsOiBzdHJpbmc7XG4gIHNlcnZlclVybDogU2VydmVyWyd1cmwnXTtcbiAgc2VydmVyVGl0bGU6IFNlcnZlclsndGl0bGUnXTtcbiAgc2F2ZVBhdGg6IHN0cmluZztcbiAgbWltZVR5cGU6IHN0cmluZztcbn07XG4iLCJpbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHtcbiAgRE9XTkxPQURTX0NMRUFSRUQsXG4gIERPV05MT0FEX0NSRUFURUQsXG4gIERPV05MT0FEX1JFTU9WRUQsXG4gIERPV05MT0FEX1VQREFURUQsXG59IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBEb3dubG9hZCB9IGZyb20gJy4uL2NvbW1vbic7XG5pbXBvcnQgeyBEb3dubG9hZFN0YXR1cyB9IGZyb20gJy4uL2NvbW1vbic7XG5cbnR5cGUgRG93bmxvYWRzQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgRE9XTkxPQURfQ1JFQVRFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgRE9XTkxPQURfVVBEQVRFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgRE9XTkxPQURTX0NMRUFSRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIERPV05MT0FEX1JFTU9WRUQ+O1xuXG5leHBvcnQgY29uc3QgZG93bmxvYWRzID0gKFxuICBzdGF0ZTogUmVjb3JkPERvd25sb2FkWydpdGVtSWQnXSwgRG93bmxvYWQ+ID0ge30sXG4gIGFjdGlvbjogRG93bmxvYWRzQWN0aW9uXG4pOiBSZWNvcmQ8RG93bmxvYWRbJ2l0ZW1JZCddLCBEb3dubG9hZD4gPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCBpbml0RG93bmxvYWRzID0gYWN0aW9uLnBheWxvYWQuZG93bmxvYWRzID8/IHt9O1xuICAgICAgT2JqZWN0LnZhbHVlcyhpbml0RG93bmxvYWRzKS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUuc3RhdGUgPT09ICdwcm9ncmVzc2luZycgfHwgdmFsdWUuc3RhdGUgPT09ICdwYXVzZWQnKSB7XG4gICAgICAgICAgdmFsdWUuc3RhdGUgPSAnY2FuY2VsbGVkJztcbiAgICAgICAgICB2YWx1ZS5zdGF0dXMgPSBEb3dubG9hZFN0YXR1cy5DQU5DRUxMRUQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGluaXREb3dubG9hZHMgPz8ge307XG4gICAgfVxuXG4gICAgY2FzZSBET1dOTE9BRF9DUkVBVEVEOiB7XG4gICAgICBjb25zdCBkb3dubG9hZCA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFtkb3dubG9hZC5pdGVtSWRdOiBkb3dubG9hZCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY2FzZSBET1dOTE9BRF9VUERBVEVEOiB7XG4gICAgICBjb25zdCBuZXdTdGF0ZSA9IHsgLi4uc3RhdGUgfTtcbiAgICAgIG5ld1N0YXRlW2FjdGlvbi5wYXlsb2FkLml0ZW1JZF0gPSB7XG4gICAgICAgIC4uLm5ld1N0YXRlW2FjdGlvbi5wYXlsb2FkLml0ZW1JZF0sXG4gICAgICAgIC4uLmFjdGlvbi5wYXlsb2FkLFxuICAgICAgfTtcbiAgICAgIHJldHVybiBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBjYXNlIERPV05MT0FEX1JFTU9WRUQ6IHtcbiAgICAgIGNvbnN0IG5ld1N0YXRlID0geyAuLi5zdGF0ZSB9O1xuICAgICAgZGVsZXRlIG5ld1N0YXRlW2FjdGlvbi5wYXlsb2FkXTtcbiAgICAgIHJldHVybiBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBjYXNlIERPV05MT0FEU19DTEVBUkVEOlxuICAgICAgcmV0dXJuIHt9O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImV4cG9ydCBjb25zdCBKSVRTSV9TRVJWRVJfQ0FQVFVSRV9TQ1JFRU5fUEVSTUlTU0lPTl9VUERBVEVEID1cbiAgJ2ppdHNpLXNlcnZlci1jYXB0dXJlLXNjcmVlbi1wZXJtaXNzaW9uLXVwZGF0ZWQnO1xuZXhwb3J0IGNvbnN0IEpJVFNJX1NFUlZFUl9DQVBUVVJFX1NDUkVFTl9QRVJNSVNTSU9OU19DTEVBUkVEID1cbiAgJ2ppdHNpLXNlcnZlci1jYXB0dXJlLXNjcmVlbi1wZXJtaXNzaW9ucy1jbGVhcmVkJztcblxuZXhwb3J0IHR5cGUgSml0c2lTZXJ2ZXJBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbSklUU0lfU0VSVkVSX0NBUFRVUkVfU0NSRUVOX1BFUk1JU1NJT05fVVBEQVRFRF06IHtcbiAgICBqaXRzaVNlcnZlcjogc3RyaW5nO1xuICAgIGFsbG93ZWQ6IGJvb2xlYW47XG4gIH07XG4gIFtKSVRTSV9TRVJWRVJfQ0FQVFVSRV9TQ1JFRU5fUEVSTUlTU0lPTlNfQ0xFQVJFRF06IHZvaWQ7XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHtcbiAgSklUU0lfU0VSVkVSX0NBUFRVUkVfU0NSRUVOX1BFUk1JU1NJT05TX0NMRUFSRUQsXG4gIEpJVFNJX1NFUlZFUl9DQVBUVVJFX1NDUkVFTl9QRVJNSVNTSU9OX1VQREFURUQsXG59IGZyb20gJy4vYWN0aW9ucyc7XG5cbnR5cGUgSml0c2lTZXJ2ZXJBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBKSVRTSV9TRVJWRVJfQ0FQVFVSRV9TQ1JFRU5fUEVSTUlTU0lPTl9VUERBVEVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBKSVRTSV9TRVJWRVJfQ0FQVFVSRV9TQ1JFRU5fUEVSTUlTU0lPTlNfQ0xFQVJFRD47XG5cbmV4cG9ydCBjb25zdCBhbGxvd2VkSml0c2lTZXJ2ZXJzOiBSZWR1Y2VyPFxuICBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPixcbiAgSml0c2lTZXJ2ZXJBY3Rpb25cbj4gPSAoc3RhdGUgPSB7fSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgYWxsb3dlZEppdHNpU2VydmVycyA9IHt9IH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHN0YXRlID0gYWxsb3dlZEppdHNpU2VydmVycztcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBjYXNlIEpJVFNJX1NFUlZFUl9DQVBUVVJFX1NDUkVFTl9QRVJNSVNTSU9OX1VQREFURUQ6IHtcbiAgICAgIHN0YXRlID0ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW2FjdGlvbi5wYXlsb2FkLmppdHNpU2VydmVyXTogYWN0aW9uLnBheWxvYWQuYWxsb3dlZCxcbiAgICAgIH07XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgY2FzZSBKSVRTSV9TRVJWRVJfQ0FQVFVSRV9TQ1JFRU5fUEVSTUlTU0lPTlNfQ0xFQVJFRDoge1xuICAgICAgc3RhdGUgPSB7fTtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBDZXJ0aWZpY2F0ZSB9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHR5cGUgeyBTZXJ2ZXIgfSBmcm9tICcuLi9zZXJ2ZXJzL2NvbW1vbic7XG5cbmV4cG9ydCBjb25zdCBDRVJUSUZJQ0FURVNfQ0xFQVJFRCA9ICdjZXJ0aWZpY2F0ZXMvY2xlYXJlZCc7XG5leHBvcnQgY29uc3QgQ0VSVElGSUNBVEVTX0xPQURFRCA9ICdjZXJ0aWZpY2F0ZXMvbG9hZGVkJztcbmV4cG9ydCBjb25zdCBDRVJUSUZJQ0FURVNfQ0xJRU5UX0NFUlRJRklDQVRFX1JFUVVFU1RFRCA9XG4gICdjZXJ0aWZpY2F0ZXMvY2xpZW50LWNlcnRpZmljYXRlLXJlcXVlc3RlZCc7XG5leHBvcnQgY29uc3QgVFJVU1RFRF9DRVJUSUZJQ0FURVNfVVBEQVRFRCA9ICd0cnVzdGVkLWNlcnRpZmljYXRlcy91cGRhdGVkJztcbmV4cG9ydCBjb25zdCBOT1RfVFJVU1RFRF9DRVJUSUZJQ0FURVNfVVBEQVRFRCA9XG4gICdub3QtdHJ1c3RlZC1jZXJ0aWZpY2F0ZXMvdXBkYXRlZCc7XG5leHBvcnQgY29uc3QgU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQgPVxuICAnc2VsZWN0LWNsaWVudC1jZXJ0aWZpY2F0ZS1kaWFsb2cvY2VydGlmaWNhdGUtc2VsZWN0ZWQnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVF9DTElFTlRfQ0VSVElGSUNBVEVfRElBTE9HX0RJU01JU1NFRCA9XG4gICdzZWxlY3QtY2xpZW50LWNlcnRpZmljYXRlLWRpYWxvZy9kaXNtaXNzZWQnO1xuZXhwb3J0IGNvbnN0IEVYVEVSTkFMX1BST1RPQ09MX1BFUk1JU1NJT05fVVBEQVRFRCA9XG4gICduYXZpZ2F0aW9uL2V4dGVybmFsLXByb3RvY29sLXBlcm1pc3Npb24tdXBkYXRlZCc7XG5cbmV4cG9ydCB0eXBlIE5hdmlnYXRpb25BY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbQ0VSVElGSUNBVEVTX0NMRUFSRURdOiB2b2lkO1xuICBbQ0VSVElGSUNBVEVTX0xPQURFRF06IFJlY29yZDxTZXJ2ZXJbJ3VybCddLCBDZXJ0aWZpY2F0ZVsnZmluZ2VycHJpbnQnXT47XG4gIFtDRVJUSUZJQ0FURVNfQ0xJRU5UX0NFUlRJRklDQVRFX1JFUVVFU1RFRF06IENlcnRpZmljYXRlW107XG4gIFtUUlVTVEVEX0NFUlRJRklDQVRFU19VUERBVEVEXTogUmVjb3JkPFxuICAgIFNlcnZlclsndXJsJ10sXG4gICAgQ2VydGlmaWNhdGVbJ2ZpbmdlcnByaW50J11cbiAgPjtcbiAgW05PVF9UUlVTVEVEX0NFUlRJRklDQVRFU19VUERBVEVEXTogUmVjb3JkPFxuICAgIFNlcnZlclsndXJsJ10sXG4gICAgQ2VydGlmaWNhdGVbJ2ZpbmdlcnByaW50J11cbiAgPjtcbiAgW1NFTEVDVF9DTElFTlRfQ0VSVElGSUNBVEVfRElBTE9HX0NFUlRJRklDQVRFX1NFTEVDVEVEXTogQ2VydGlmaWNhdGVbJ2ZpbmdlcnByaW50J107XG4gIFtTRUxFQ1RfQ0xJRU5UX0NFUlRJRklDQVRFX0RJQUxPR19ESVNNSVNTRURdOiB2b2lkO1xuICBbRVhURVJOQUxfUFJPVE9DT0xfUEVSTUlTU0lPTl9VUERBVEVEXToge1xuICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgYWxsb3dlZDogYm9vbGVhbjtcbiAgfTtcbn07XG4iLCJpbXBvcnQgdHlwZSB7IENlcnRpZmljYXRlIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBTZXJ2ZXIgfSBmcm9tICcuLi9zZXJ2ZXJzL2NvbW1vbic7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBDRVJUSUZJQ0FURVNfQ0xJRU5UX0NFUlRJRklDQVRFX1JFUVVFU1RFRCxcbiAgU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQsXG4gIFNFTEVDVF9DTElFTlRfQ0VSVElGSUNBVEVfRElBTE9HX0RJU01JU1NFRCxcbiAgVFJVU1RFRF9DRVJUSUZJQ0FURVNfVVBEQVRFRCxcbiAgTk9UX1RSVVNURURfQ0VSVElGSUNBVEVTX1VQREFURUQsXG4gIENFUlRJRklDQVRFU19DTEVBUkVELFxuICBDRVJUSUZJQ0FURVNfTE9BREVELFxuICBFWFRFUk5BTF9QUk9UT0NPTF9QRVJNSVNTSU9OX1VQREFURUQsXG59IGZyb20gJy4vYWN0aW9ucyc7XG5cbnR5cGUgQ2xpZW50Q2VydGlmaWNhdGVzQWN0aW9uVHlwZXMgPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBDRVJUSUZJQ0FURVNfQ0xJRU5UX0NFUlRJRklDQVRFX1JFUVVFU1RFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNFTEVDVF9DTElFTlRfQ0VSVElGSUNBVEVfRElBTE9HX0RJU01JU1NFRD47XG5cbmV4cG9ydCBjb25zdCBjbGllbnRDZXJ0aWZpY2F0ZXM6IFJlZHVjZXI8XG4gIENlcnRpZmljYXRlW10sXG4gIENsaWVudENlcnRpZmljYXRlc0FjdGlvblR5cGVzXG4+ID0gKHN0YXRlID0gW10sIGFjdGlvbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBDRVJUSUZJQ0FURVNfQ0xJRU5UX0NFUlRJRklDQVRFX1JFUVVFU1RFRDpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGNhc2UgU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQ6XG4gICAgY2FzZSBTRUxFQ1RfQ0xJRU5UX0NFUlRJRklDQVRFX0RJQUxPR19ESVNNSVNTRUQ6XG4gICAgICByZXR1cm4gW107XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG50eXBlIENlcnRpZmljYXRlc0FjdGlvbiA9XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIENFUlRJRklDQVRFU19MT0FERUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFRSVVNURURfQ0VSVElGSUNBVEVTX1VQREFURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIE5PVF9UUlVTVEVEX0NFUlRJRklDQVRFU19VUERBVEVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBDRVJUSUZJQ0FURVNfQ0xFQVJFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCB0cnVzdGVkQ2VydGlmaWNhdGVzOiBSZWR1Y2VyPFxuICBSZWNvcmQ8U2VydmVyWyd1cmwnXSwgQ2VydGlmaWNhdGVbJ2ZpbmdlcnByaW50J10+LFxuICBDZXJ0aWZpY2F0ZXNBY3Rpb25cbj4gPSAoc3RhdGUgPSB7fSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIENFUlRJRklDQVRFU19MT0FERUQ6XG4gICAgY2FzZSBUUlVTVEVEX0NFUlRJRklDQVRFU19VUERBVEVEOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXG4gICAgY2FzZSBDRVJUSUZJQ0FURVNfQ0xFQVJFRDpcbiAgICAgIHJldHVybiB7fTtcblxuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyB0cnVzdGVkQ2VydGlmaWNhdGVzID0gc3RhdGUgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHRydXN0ZWRDZXJ0aWZpY2F0ZXM7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG5vdFRydXN0ZWRDZXJ0aWZpY2F0ZXM6IFJlZHVjZXI8XG4gIFJlY29yZDxTZXJ2ZXJbJ3VybCddLCBDZXJ0aWZpY2F0ZVsnZmluZ2VycHJpbnQnXT4sXG4gIENlcnRpZmljYXRlc0FjdGlvblxuPiA9IChzdGF0ZSA9IHt9LCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgTk9UX1RSVVNURURfQ0VSVElGSUNBVEVTX1VQREFURUQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBjYXNlIENFUlRJRklDQVRFU19DTEVBUkVEOlxuICAgICAgcmV0dXJuIHt9O1xuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IG5vdFRydXN0ZWRDZXJ0aWZpY2F0ZXMgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gbm90VHJ1c3RlZENlcnRpZmljYXRlcztcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG50eXBlIEV4dGVybmFsUHJvdG9jb2xzQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgRVhURVJOQUxfUFJPVE9DT0xfUEVSTUlTU0lPTl9VUERBVEVEPjtcblxuZXhwb3J0IGNvbnN0IGV4dGVybmFsUHJvdG9jb2xzOiBSZWR1Y2VyPFxuICBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPixcbiAgRXh0ZXJuYWxQcm90b2NvbHNBY3Rpb25cbj4gPSAoc3RhdGUgPSB7fSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgZXh0ZXJuYWxQcm90b2NvbHMgPSB7fSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICBzdGF0ZSA9IGV4dGVybmFsUHJvdG9jb2xzO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIGNhc2UgRVhURVJOQUxfUFJPVE9DT0xfUEVSTUlTU0lPTl9VUERBVEVEOiB7XG4gICAgICBzdGF0ZSA9IHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIFthY3Rpb24ucGF5bG9hZC5wcm90b2NvbF06IGFjdGlvbi5wYXlsb2FkLmFsbG93ZWQsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFNlcnZlciB9IGZyb20gJy4uL3NlcnZlcnMvY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IERFRVBfTElOS1NfU0VSVkVSX0FEREVEID0gJ2RlZXAtbGlua3Mvc2VydmVyLWFkZGVkJztcbmV4cG9ydCBjb25zdCBERUVQX0xJTktTX1NFUlZFUl9GT0NVU0VEID0gJ2RlZXAtbGlua3Mvc2VydmVyLWZvY3VzZWQnO1xuXG5leHBvcnQgdHlwZSBEZWVwTGlua3NBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbREVFUF9MSU5LU19TRVJWRVJfQURERURdOiBTZXJ2ZXJbJ3VybCddO1xuICBbREVFUF9MSU5LU19TRVJWRVJfRk9DVVNFRF06IFNlcnZlclsndXJsJ107XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBTZXJ2ZXIgfSBmcm9tICcuLi9zZXJ2ZXJzL2NvbW1vbic7XG5pbXBvcnQgdHlwZSB7IE91dGxvb2tDcmVkZW50aWFscyB9IGZyb20gJy4vdHlwZSc7XG5cbmV4cG9ydCBjb25zdCBPVVRMT09LX0NBTEVOREFSX1NFVF9DUkVERU5USUFMUyA9XG4gICdvdXRsb29rLWNhbGVuZGFyL3NldC1jcmVkZW50aWFscyc7XG5leHBvcnQgY29uc3QgT1VUTE9PS19DQUxFTkRBUl9BU0tfQ1JFREVOVElBTFMgPVxuICAnb3V0bG9vay1jYWxlbmRhci9hc2stY3JlZGVudGlhbHMnO1xuZXhwb3J0IGNvbnN0IE9VVExPT0tfQ0FMRU5EQVJfRElBTE9HX0RJU01JU1NFRCA9XG4gICdvdXRsb29rLWNhbGVuZGFyL2RpYWxvZy1kaXNtaXNzZWQnO1xuZXhwb3J0IGNvbnN0IE9VVExPT0tfQ0FMRU5EQVJfU0FWRV9DUkVERU5USUFMUyA9XG4gICdvdXRsb29rLWNhbGVuZGFyL3NhdmUtY3JlZGVudGlhbHMnO1xuXG5leHBvcnQgdHlwZSBPdXRsb29rQ2FsZW5kYXJBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbT1VUTE9PS19DQUxFTkRBUl9TRVRfQ1JFREVOVElBTFNdOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICAgIG91dGxvb2tDcmVkZW50aWFsczogT3V0bG9va0NyZWRlbnRpYWxzO1xuICAgIHNhdmVDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgZGlzbWlzc0RpYWxvZz86IGJvb2xlYW47XG4gIH07XG4gIFtPVVRMT09LX0NBTEVOREFSX0FTS19DUkVERU5USUFMU106IHtcbiAgICBzZXJ2ZXI6IFNlcnZlcjtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBpc0VuY3J5cHRpb25BdmFpbGFibGU6IGJvb2xlYW47XG4gIH07XG4gIFtPVVRMT09LX0NBTEVOREFSX0RJQUxPR19ESVNNSVNTRURdOiB2b2lkO1xuICBbT1VUTE9PS19DQUxFTkRBUl9TQVZFX0NSRURFTlRJQUxTXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBvdXRsb29rQ3JlZGVudGlhbHM6IE91dGxvb2tDcmVkZW50aWFscztcbiAgfTtcbn07XG4iLCJpbXBvcnQgdHlwZSB7IFdlYkNvbnRlbnRzIH0gZnJvbSAnZWxlY3Ryb24nO1xuXG5pbXBvcnQgdHlwZSB7IFNlcnZlciB9IGZyb20gJy4uL3NlcnZlcnMvY29tbW9uJztcbmltcG9ydCB0eXBlIHsgUm9vdFdpbmRvd0ljb24sIFdpbmRvd1N0YXRlIH0gZnJvbSAnLi9jb21tb24nO1xuXG5leHBvcnQgY29uc3QgQUJPVVRfRElBTE9HX0RJU01JU1NFRCA9ICdhYm91dC1kaWFsb2cvZGlzbWlzc2VkJztcbmV4cG9ydCBjb25zdCBBQk9VVF9ESUFMT0dfVE9HR0xFX1VQREFURV9PTl9TVEFSVCA9XG4gICdhYm91dC1kaWFsb2cvdG9nZ2xlLXVwZGF0ZS1vbi1zdGFydCc7XG5leHBvcnQgY29uc3QgQUJPVVRfRElBTE9HX1VQREFURV9DSEFOTkVMX0NIQU5HRUQgPVxuICAnYWJvdXQtZGlhbG9nL3VwZGF0ZS1jaGFubmVsLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IEFERF9TRVJWRVJfVklFV19TRVJWRVJfQURERUQgPSAnYWRkLXNlcnZlci92aWV3LXNlcnZlci1hZGRlZCc7XG5leHBvcnQgY29uc3QgQ0xFQVJfQ0FDSEVfVFJJR0dFUkVEID0gJ2NsZWFyLWNhY2hlL3RyaWdnZXJlZCc7XG5leHBvcnQgY29uc3QgQ0xFQVJfQ0FDSEVfRElBTE9HX0RJU01JU1NFRCA9ICdjbGVhci1jYWNoZS1kaWFsb2cvZGlzbWlzc2VkJztcbmV4cG9ydCBjb25zdCBDTEVBUl9DQUNIRV9ESUFMT0dfREVMRVRFX0xPR0lOX0RBVEFfQ0xJQ0tFRCA9XG4gICdjbGVhci1jYWNoZS1kaWFsb2cvZGVsZXRlLWxvZ2luLWRhdGEtY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgQ0xFQVJfQ0FDSEVfRElBTE9HX0tFRVBfTE9HSU5fREFUQV9DTElDS0VEID1cbiAgJ2NsZWFyLWNhY2hlLWRpYWxvZy9rZWVwLWxvZ2luLWRhdGEtY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgTE9BRElOR19FUlJPUl9WSUVXX1JFTE9BRF9TRVJWRVJfQ0xJQ0tFRCA9XG4gICdsb2FkaW5nLWVycm9yLXZpZXcvcmVsb2FkLXNlcnZlci1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBNRU5VX0JBUl9BQk9VVF9DTElDS0VEID0gJ21lbnUtYmFyL2Fib3V0LWNsaWNrZWQnO1xuZXhwb3J0IGNvbnN0IE1FTlVfQkFSX0FERF9ORVdfU0VSVkVSX0NMSUNLRUQgPVxuICAnbWVudS1iYXIvYWRkLW5ldy1zZXJ2ZXItY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgTUVOVV9CQVJfU0VMRUNUX1NFUlZFUl9DTElDS0VEID0gJ21lbnUtYmFyL3NlbGVjdC1zZXJ2ZXItY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgTUVOVV9CQVJfVE9HR0xFX0lTX01FTlVfQkFSX0VOQUJMRURfQ0xJQ0tFRCA9XG4gICdtZW51LWJhci90b2dnbGUtaXMtbWVudS1iYXItZW5hYmxlZC1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBNRU5VX0JBUl9UT0dHTEVfSVNfU0hPV19XSU5ET1dfT05fVU5SRUFEX0NIQU5HRURfRU5BQkxFRF9DTElDS0VEID1cbiAgJ21lbnUtYmFyL3RvZ2dsZS1pcy1zaG93LXdpbmRvdy1vbi11bnJlYWQtY2hhbmdlZC1lbmFibGVkLWNsaWNrZWQnO1xuZXhwb3J0IGNvbnN0IE1FTlVfQkFSX1RPR0dMRV9JU19TSURFX0JBUl9FTkFCTEVEX0NMSUNLRUQgPVxuICAnbWVudS1iYXIvdG9nZ2xlLWlzLXNpZGUtYmFyLWVuYWJsZWQtY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgTUVOVV9CQVJfVE9HR0xFX0lTX1RSQVlfSUNPTl9FTkFCTEVEX0NMSUNLRUQgPVxuICAnbWVudS1iYXIvdG9nZ2xlLWlzLXRyYXktaWNvbi1lbmFibGVkLWNsaWNrZWQnO1xuZXhwb3J0IGNvbnN0IE1FTlVfQkFSX1RPR0dMRV9JU19ERVZFTE9QRVJfTU9ERV9FTkFCTEVEX0NMSUNLRUQgPVxuICAnbWVudS1iYXIvdG9nZ2xlLWlzLWRldmVsb3Blci1tb2RlLWVuYWJsZWQtY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgTUVOVV9CQVJfVE9HR0xFX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0xJQ0tFRCA9XG4gICdtZW51LWJhci90b2dnbGUtaXMtdmlkZW8tY2FsbC1kZXZ0b29scy1hdXRvLW9wZW4tZW5hYmxlZC1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBST09UX1dJTkRPV19JQ09OX0NIQU5HRUQgPSAncm9vdC13aW5kb3cvaWNvbi1jaGFuZ2VkJztcbmV4cG9ydCBjb25zdCBST09UX1dJTkRPV19TVEFURV9DSEFOR0VEID0gJ3Jvb3Qtd2luZG93L3N0YXRlLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFZJREVPX0NBTExfV0lORE9XX1NUQVRFX0NIQU5HRUQgPVxuICAndmlkZW8tY2FsbC13aW5kb3cvc3RhdGUtY2hhbmdlZCc7XG5leHBvcnQgY29uc3QgU0lERV9CQVJfQUREX05FV19TRVJWRVJfQ0xJQ0tFRCA9XG4gICdzaWRlLWJhci9hZGQtbmV3LXNlcnZlci1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBTSURFX0JBUl9DT05URVhUX01FTlVfVFJJR0dFUkVEID1cbiAgJ3NpZGUtYmFyL2NvbnRleHQtbWVudS10cmlnZ2VyZWQnO1xuZXhwb3J0IGNvbnN0IFNJREVfQkFSX0RPV05MT0FEU19CVVRUT05fQ0xJQ0tFRCA9XG4gICdzaWRlLWJhci9kb3dubG9hZHMtYnV0dG9uLWNsaWNrZWQnO1xuZXhwb3J0IGNvbnN0IFNJREVfQkFSX1NFVFRJTkdTX0JVVFRPTl9DTElDS0VEID1cbiAgJ3NpZGUtYmFyL3NldHRpbmdzLWJ1dHRvbi1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBTSURFX0JBUl9SRU1PVkVfU0VSVkVSX0NMSUNLRUQgPSAnc2lkZS1iYXIvcmVtb3ZlLXNlcnZlci1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBTSURFX0JBUl9TRVJWRVJfU0VMRUNURUQgPSAnc2lkZS1iYXIvc2VydmVyLXNlbGVjdGVkJztcbmV4cG9ydCBjb25zdCBTSURFX0JBUl9TRVJWRVJTX1NPUlRFRCA9ICdzaWRlLWJhci9zZXJ2ZXJzLXNvcnRlZCc7XG5leHBvcnQgY29uc3QgVE9VQ0hfQkFSX0ZPUk1BVF9CVVRUT05fVE9VQ0hFRCA9XG4gICd0b3VjaC1iYXIvZm9ybWF0LWJ1dHRvbi10b3VjaGVkJztcbmV4cG9ydCBjb25zdCBUT1VDSF9CQVJfU0VMRUNUX1NFUlZFUl9UT1VDSEVEID1cbiAgJ3RvdWNoLWJhci9zZWxlY3Qtc2VydmVyLXRvdWNoZWQnO1xuZXhwb3J0IGNvbnN0IFVQREFURV9ESUFMT0dfRElTTUlTU0VEID0gJ3VwZGF0ZS1kaWFsb2cvZGlzbWlzc2VkJztcbmV4cG9ydCBjb25zdCBVUERBVEVfRElBTE9HX0lOU1RBTExfQlVUVE9OX0NMSUNLRUQgPVxuICAndXBkYXRlLWRpYWxvZy9pbnN0YWxsLWJ1dHRvbi1jbGlja2VkJztcbmV4cG9ydCBjb25zdCBVUERBVEVfRElBTE9HX1JFTUlORF9VUERBVEVfTEFURVJfQ0xJQ0tFRCA9XG4gICd1cGRhdGUtZGlhbG9nL3JlbWluZC11cGRhdGUtbGF0ZXItY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgVVBEQVRFX0RJQUxPR19TS0lQX1VQREFURV9DTElDS0VEID1cbiAgJ3VwZGF0ZS1kaWFsb2cvc2tpcC11cGRhdGUtY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19SRUFEWSA9ICd3ZWJ2aWV3L3JlYWR5JztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX0FUVEFDSEVEID0gJ3dlYnZpZXcvYXR0YWNoZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfRElEX0ZBSUxfTE9BRCA9ICd3ZWJ2aWV3L2RpZC1mYWlsLWxvYWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfRElEX05BVklHQVRFID0gJ3dlYnZpZXcvZGlkLW5hdmlnYXRlJztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX0RJRF9TVEFSVF9MT0FESU5HID0gJ3dlYnZpZXcvZGlkLXN0YXJ0LWxvYWRpbmcnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfRkFWSUNPTl9DSEFOR0VEID0gJ3dlYnZpZXcvZmF2aWNvbi1jaGFuZ2VkJztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX0ZPQ1VTX1JFUVVFU1RFRCA9ICd3ZWJ2aWV3L2ZvY3VzLXJlcXVlc3RlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19NRVNTQUdFX0JPWF9CTFVSUkVEID0gJ3dlYnZpZXcvbWVzc2FnZS1ib3gtYmx1cnJlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19NRVNTQUdFX0JPWF9GT0NVU0VEID0gJ3dlYnZpZXcvbWVzc2FnZS1ib3gtZm9jdXNlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19TQ1JFRU5fU0hBUklOR19TT1VSQ0VfUkVRVUVTVEVEID1cbiAgJ3dlYnZpZXcvc2NyZWVuLXNoYXJpbmctc291cmNlLXJlcXVlc3RlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19TQ1JFRU5fU0hBUklOR19TT1VSQ0VfUkVTUE9OREVEID1cbiAgJ3dlYnZpZXcvc2NyZWVuLXNoYXJpbmctc291cmNlLXJlc3BvbmRlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19TSURFQkFSX1NUWUxFX0NIQU5HRUQgPSAnd2Vidmlldy9zaWRlYmFyLXN0eWxlLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfU0lERUJBUl9DVVNUT01fVEhFTUVfQ0hBTkdFRCA9XG4gICd3ZWJ2aWV3L3NpZGViYXItY3VzdG9tLXRoZW1lLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfR0lUX0NPTU1JVF9IQVNIX0NIQU5HRUQgPVxuICAnd2Vidmlldy9naXQtY29tbWl0LWhhc2gtY2hhbmdlZCc7XG5leHBvcnQgY29uc3QgV0VCVklFV19HSVRfQ09NTUlUX0hBU0hfQ0hFQ0sgPSAnd2Vidmlldy9naXQtY29tbWl0LWhhc2gtY2hlY2snO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfVElUTEVfQ0hBTkdFRCA9ICd3ZWJ2aWV3L3RpdGxlLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfUEFHRV9USVRMRV9DSEFOR0VEID0gJ3dlYnZpZXcvcGFnZS10aXRsZS1jaGFuZ2VkJztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX1VOUkVBRF9DSEFOR0VEID0gJ3dlYnZpZXcvdW5yZWFkLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfVVNFUl9MT0dHRURfSU4gPSAnd2Vidmlldy91c2VyLWxvZ2dlZGluJztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX1VTRVJfVEhFTUVfQVBQRUFSQU5DRV9DSEFOR0VEID1cbiAgJ3dlYnZpZXcvdXNlci10aGVtZS1hcHBlYXJhbmNlLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfQUxMT1dFRF9SRURJUkVDVFNfQ0hBTkdFRCA9XG4gICd3ZWJ2aWV3L2FsbG93ZWQtcmVkaXJlY3RzLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9SRVBPUlRfT1BUX0lOX0NIQU5HRUQgPVxuICAnc2V0dGluZ3Mvc2V0LWJ1Z3NuYWctb3B0LWluLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9GTEFTSEZSQU1FX09QVF9JTl9DSEFOR0VEID1cbiAgJ3NldHRpbmdzL3NldC1mbGFzaGZyYW1lLW9wdC1pbi1jaGFuZ2VkJztcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TRVRfSEFSRFdBUkVfQUNDRUxFUkFUSU9OX09QVF9JTl9DSEFOR0VEID1cbiAgJ3NldHRpbmdzL3NldC1oYXJkd2FyZS1hY2NlbGVyYXRpb24tb3B0LWluLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9JTlRFUk5BTFZJREVPQ0hBVFdJTkRPV19PUFRfSU5fQ0hBTkdFRCA9XG4gICdzZXR0aW5ncy9zZXQtaW50ZXJuYWx2aWRlb2NoYXR3aW5kb3ctb3B0LWluLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9NSU5JTUlaRV9PTl9DTE9TRV9PUFRfSU5fQ0hBTkdFRCA9XG4gICdzZXR0aW5ncy9zZXQtbWluaW1pemUtb24tY2xvc2Utb3B0LWluLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9JU19UUkFZX0lDT05fRU5BQkxFRF9DSEFOR0VEID1cbiAgJ3NldHRpbmdzL3NldC1pcy10cmF5LWljb24tZW5hYmxlZC1jaGFuZ2VkJztcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TRVRfSVNfU0lERV9CQVJfRU5BQkxFRF9DSEFOR0VEID1cbiAgJ3NldHRpbmdzL3NldC1pcy1zaWRlLWJhci1lbmFibGVkLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9JU19NRU5VX0JBUl9FTkFCTEVEX0NIQU5HRUQgPVxuICAnc2V0dGluZ3Mvc2V0LWlzLW1lbnUtYmFyLWVuYWJsZWQtY2hhbmdlZCc7XG5leHBvcnQgY29uc3QgU0VUVElOR1NfU0VUX0lTX1ZJREVPX0NBTExfV0lORE9XX1BFUlNJU1RFTkNFX0VOQUJMRURfQ0hBTkdFRCA9XG4gICdzZXR0aW5ncy9zZXQtaXMtdmlkZW8tY2FsbC13aW5kb3ctcGVyc2lzdGVuY2UtZW5hYmxlZC1jaGFuZ2VkJztcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19TRVRfSVNfREVWRUxPUEVSX01PREVfRU5BQkxFRF9DSEFOR0VEID1cbiAgJ3NldHRpbmdzL3NldC1pcy1kZXZlbG9wZXItbW9kZS1lbmFibGVkLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFVF9JU19WSURFT19DQUxMX0RFVlRPT0xTX0FVVE9fT1BFTl9FTkFCTEVEX0NIQU5HRUQgPVxuICAnc2V0dGluZ3Mvc2V0LWlzLXZpZGVvLWNhbGwtZGV2dG9vbHMtYXV0by1vcGVuLWVuYWJsZWQtY2hhbmdlZCc7XG5leHBvcnQgY29uc3QgU0VUVElOR1NfQ0xFQVJfUEVSTUlUVEVEX1NDUkVFTl9DQVBUVVJFX1BFUk1JU1NJT05TID1cbiAgJ3NldHRpbmdzL2NsZWFyLXBlcm1pdHRlZC1zY3JlZW4tY2FwdHVyZS1wZXJtaXNzaW9ucyc7XG5leHBvcnQgY29uc3QgU0VUVElOR1NfTlRMTV9DUkVERU5USUFMU19DSEFOR0VEID1cbiAgJ3NldHRpbmdzL250bG0tY3JlZGVudGlhbHMtY2hhbmdlZCc7XG5leHBvcnQgY29uc3QgU0VUVElOR1NfQVZBSUxBQkxFX0JST1dTRVJTX1VQREFURUQgPVxuICAnc2V0dGluZ3MvYXZhaWxhYmxlLWJyb3dzZXJzLXVwZGF0ZWQnO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX1NFTEVDVEVEX0JST1dTRVJfQ0hBTkdFRCA9XG4gICdzZXR0aW5ncy9zZWxlY3RlZC1icm93c2VyLWNoYW5nZWQnO1xuZXhwb3J0IGNvbnN0IFNFVF9IQVNfVFJBWV9NSU5JTUlaRV9OT1RJRklDQVRJT05fU0hPV04gPVxuICAnbm90aWZpY2F0aW9ucy9zZXQtaGFzLXRyYXktbWluaW1pemUtbm90aWZpY2F0aW9uLXNob3duJztcbmV4cG9ydCBjb25zdCBWSURFT19DQUxMX1dJTkRPV19PUEVOX1VSTCA9ICd2aWRlby1jYWxsLXdpbmRvdy9vcGVuLXVybCc7XG5leHBvcnQgY29uc3QgRE9XTkxPQURTX0JBQ0tfQlVUVE9OX0NMSUNLRUQgPSAnZG93bmxvYWRzL2JhY2stYnV0dG9uLWNsaWNrZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfU0VSVkVSX1NVUFBPUlRFRF9WRVJTSU9OU19VUERBVEVEID1cbiAgJ3dlYnZpZXcvc2VydmVyLXN1cHBvcnRlZC12ZXJzaW9ucy11cGRhdGVkJztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX1NFUlZFUl9VTklRVUVfSURfVVBEQVRFRCA9XG4gICd3ZWJ2aWV3L3NlcnZlci13b3Jrc3BhY2UtdWlkLXVwZGF0ZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfU0VSVkVSX0lTX1NVUFBPUlRFRF9WRVJTSU9OID1cbiAgJ3dlYnZpZXcvc2VydmVyLWlzLXN1cHBvcnRlZC12ZXJzaW9uJztcbmV4cG9ydCBjb25zdCBXRUJWSUVXX1NFUlZFUl9WRVJTSU9OX1VQREFURUQgPSAnd2Vidmlldy92ZXJzaW9uLXVwZGF0ZWQnO1xuZXhwb3J0IGNvbnN0IFNVUFBPUlRFRF9WRVJTSU9OX0RJQUxPR19ESVNNSVNTID1cbiAgJ3N1cHBvcnRlZC12ZXJzaW9ucy1kaWFsb2cvZGlzbWlzcyc7XG5leHBvcnQgY29uc3QgV0VCVklFV19TRVJWRVJfUkVMT0FERUQgPSAnd2Vidmlldy9zZXJ2ZXItcmVsb2FkZWQnO1xuZXhwb3J0IGNvbnN0IFdFQlZJRVdfUERGX1ZJRVdFUl9BVFRBQ0hFRCA9ICd3ZWJ2aWV3L3BkZi12aWV3ZXIvYXR0YWNoZWQnO1xuZXhwb3J0IGNvbnN0IFNJREVfQkFSX1NFUlZFUl9SRUxPQUQgPSAnc2lkZS1iYXIvc2VydmVyLXJlbG9hZCc7XG5leHBvcnQgY29uc3QgU0lERV9CQVJfU0VSVkVSX0NPUFlfVVJMID0gJ3NpZGUtYmFyL3NlcnZlci1jb3B5LXVybCc7XG5leHBvcnQgY29uc3QgU0lERV9CQVJfU0VSVkVSX09QRU5fREVWX1RPT0xTID0gJ3NpZGUtYmFyL3NlcnZlci1vcGVuLWRldi10b29scyc7XG5leHBvcnQgY29uc3QgU0lERV9CQVJfU0VSVkVSX0ZPUkNFX1JFTE9BRCA9ICdzaWRlLWJhci9zZXJ2ZXItZm9yY2UtcmVsb2FkJztcbmV4cG9ydCBjb25zdCBTSURFX0JBUl9TRVJWRVJfUkVNT1ZFID0gJ3NpZGUtYmFyL3NlcnZlci1yZW1vdmUnO1xuXG5leHBvcnQgdHlwZSBVaUFjdGlvblR5cGVUb1BheWxvYWRNYXAgPSB7XG4gIFtBQk9VVF9ESUFMT0dfRElTTUlTU0VEXTogdm9pZDtcbiAgW0FCT1VUX0RJQUxPR19UT0dHTEVfVVBEQVRFX09OX1NUQVJUXTogYm9vbGVhbjtcbiAgW0FCT1VUX0RJQUxPR19VUERBVEVfQ0hBTk5FTF9DSEFOR0VEXTogc3RyaW5nO1xuICBbQUREX1NFUlZFUl9WSUVXX1NFUlZFUl9BRERFRF06IFNlcnZlclsndXJsJ107XG4gIFtDTEVBUl9DQUNIRV9UUklHR0VSRURdOiBXZWJDb250ZW50c1snaWQnXTtcbiAgW0NMRUFSX0NBQ0hFX0RJQUxPR19ESVNNSVNTRURdOiB2b2lkO1xuICBbQ0xFQVJfQ0FDSEVfRElBTE9HX0RFTEVURV9MT0dJTl9EQVRBX0NMSUNLRURdOiBXZWJDb250ZW50c1snaWQnXTtcbiAgW0NMRUFSX0NBQ0hFX0RJQUxPR19LRUVQX0xPR0lOX0RBVEFfQ0xJQ0tFRF06IFdlYkNvbnRlbnRzWydpZCddO1xuICBbTE9BRElOR19FUlJPUl9WSUVXX1JFTE9BRF9TRVJWRVJfQ0xJQ0tFRF06IHsgdXJsOiBTZXJ2ZXJbJ3VybCddIH07XG4gIFtNRU5VX0JBUl9BQk9VVF9DTElDS0VEXTogdm9pZDtcbiAgW01FTlVfQkFSX0FERF9ORVdfU0VSVkVSX0NMSUNLRURdOiB2b2lkO1xuICBbTUVOVV9CQVJfU0VMRUNUX1NFUlZFUl9DTElDS0VEXTogU2VydmVyWyd1cmwnXTtcbiAgW01FTlVfQkFSX1RPR0dMRV9JU19NRU5VX0JBUl9FTkFCTEVEX0NMSUNLRURdOiBib29sZWFuO1xuICBbTUVOVV9CQVJfVE9HR0xFX0lTX1NIT1dfV0lORE9XX09OX1VOUkVBRF9DSEFOR0VEX0VOQUJMRURfQ0xJQ0tFRF06IGJvb2xlYW47XG4gIFtNRU5VX0JBUl9UT0dHTEVfSVNfU0lERV9CQVJfRU5BQkxFRF9DTElDS0VEXTogYm9vbGVhbjtcbiAgW01FTlVfQkFSX1RPR0dMRV9JU19UUkFZX0lDT05fRU5BQkxFRF9DTElDS0VEXTogYm9vbGVhbjtcbiAgW01FTlVfQkFSX1RPR0dMRV9JU19ERVZFTE9QRVJfTU9ERV9FTkFCTEVEX0NMSUNLRURdOiBib29sZWFuO1xuICBbTUVOVV9CQVJfVE9HR0xFX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0xJQ0tFRF06IGJvb2xlYW47XG4gIFtST09UX1dJTkRPV19JQ09OX0NIQU5HRURdOiBSb290V2luZG93SWNvbiB8IG51bGw7XG4gIFtST09UX1dJTkRPV19TVEFURV9DSEFOR0VEXTogV2luZG93U3RhdGU7XG4gIFtWSURFT19DQUxMX1dJTkRPV19TVEFURV9DSEFOR0VEXTogV2luZG93U3RhdGU7XG4gIFtTSURFX0JBUl9BRERfTkVXX1NFUlZFUl9DTElDS0VEXTogdm9pZDtcbiAgW1NJREVfQkFSX0NPTlRFWFRfTUVOVV9UUklHR0VSRURdOiBTZXJ2ZXJbJ3VybCddO1xuICBbU0lERV9CQVJfRE9XTkxPQURTX0JVVFRPTl9DTElDS0VEXTogdm9pZDtcbiAgW1NJREVfQkFSX1NFVFRJTkdTX0JVVFRPTl9DTElDS0VEXTogdm9pZDtcbiAgW1NJREVfQkFSX1JFTU9WRV9TRVJWRVJfQ0xJQ0tFRF06IFNlcnZlclsndXJsJ107XG4gIFtTSURFX0JBUl9TRVJWRVJfU0VMRUNURURdOiBTZXJ2ZXJbJ3VybCddO1xuICBbU0lERV9CQVJfU0VSVkVSU19TT1JURURdOiBTZXJ2ZXJbJ3VybCddW107XG4gIFtTSURFX0JBUl9TRVJWRVJfUkVMT0FEXTogU2VydmVyWyd1cmwnXTtcbiAgW1NJREVfQkFSX1NFUlZFUl9DT1BZX1VSTF06IFNlcnZlclsndXJsJ107XG4gIFtTSURFX0JBUl9TRVJWRVJfT1BFTl9ERVZfVE9PTFNdOiBTZXJ2ZXJbJ3VybCddO1xuICBbU0lERV9CQVJfU0VSVkVSX0ZPUkNFX1JFTE9BRF06IFNlcnZlclsndXJsJ107XG4gIFtTSURFX0JBUl9TRVJWRVJfUkVNT1ZFXTogU2VydmVyWyd1cmwnXTtcbiAgW1RPVUNIX0JBUl9GT1JNQVRfQlVUVE9OX1RPVUNIRURdOlxuICAgIHwgJ2JvbGQnXG4gICAgfCAnaXRhbGljJ1xuICAgIHwgJ3N0cmlrZSdcbiAgICB8ICdpbmxpbmVfY29kZSdcbiAgICB8ICdtdWx0aV9saW5lJztcbiAgW1RPVUNIX0JBUl9TRUxFQ1RfU0VSVkVSX1RPVUNIRURdOiBzdHJpbmc7XG4gIFtVUERBVEVfRElBTE9HX0RJU01JU1NFRF06IHZvaWQ7XG4gIFtVUERBVEVfRElBTE9HX0lOU1RBTExfQlVUVE9OX0NMSUNLRURdOiB2b2lkO1xuICBbVVBEQVRFX0RJQUxPR19SRU1JTkRfVVBEQVRFX0xBVEVSX0NMSUNLRURdOiB2b2lkO1xuICBbVVBEQVRFX0RJQUxPR19TS0lQX1VQREFURV9DTElDS0VEXTogc3RyaW5nIHwgbnVsbDtcbiAgW1dFQlZJRVdfUkVBRFldOiB7IHVybDogU2VydmVyWyd1cmwnXTsgd2ViQ29udGVudHNJZDogbnVtYmVyIH07XG4gIFtXRUJWSUVXX0FUVEFDSEVEXTogeyB1cmw6IFNlcnZlclsndXJsJ107IHdlYkNvbnRlbnRzSWQ6IG51bWJlciB9O1xuICBbV0VCVklFV19ESURfRkFJTF9MT0FEXTogeyB1cmw6IFNlcnZlclsndXJsJ107IGlzTWFpbkZyYW1lOiBib29sZWFuIH07XG4gIFtXRUJWSUVXX0RJRF9OQVZJR0FURV06IHsgdXJsOiBTZXJ2ZXJbJ3VybCddOyBwYWdlVXJsOiBTZXJ2ZXJbJ2xhc3RQYXRoJ10gfTtcbiAgW1dFQlZJRVdfRElEX1NUQVJUX0xPQURJTkddOiB7IHVybDogU2VydmVyWyd1cmwnXSB9O1xuICBbV0VCVklFV19GQVZJQ09OX0NIQU5HRURdOiB7IHVybDogU2VydmVyWyd1cmwnXTsgZmF2aWNvbjogU2VydmVyWydmYXZpY29uJ10gfTtcbiAgW1dFQlZJRVdfRk9DVVNfUkVRVUVTVEVEXTogeyB1cmw6IHN0cmluZzsgdmlldzogJ3NlcnZlcicgfCAnZG93bmxvYWRzJyB9O1xuICBbV0VCVklFV19NRVNTQUdFX0JPWF9CTFVSUkVEXTogdm9pZDtcbiAgW1dFQlZJRVdfTUVTU0FHRV9CT1hfRk9DVVNFRF06IHZvaWQ7XG4gIFtXRUJWSUVXX1NDUkVFTl9TSEFSSU5HX1NPVVJDRV9SRVFVRVNURURdOiB2b2lkO1xuICBbV0VCVklFV19TQ1JFRU5fU0hBUklOR19TT1VSQ0VfUkVTUE9OREVEXTogc3RyaW5nIHwgbnVsbDtcbiAgW1dFQlZJRVdfU0lERUJBUl9TVFlMRV9DSEFOR0VEXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBzdHlsZTogU2VydmVyWydzdHlsZSddO1xuICB9O1xuICBbV0VCVklFV19TSURFQkFSX0NVU1RPTV9USEVNRV9DSEFOR0VEXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBjdXN0b21UaGVtZTogU2VydmVyWydjdXN0b21UaGVtZSddO1xuICB9O1xuICBbV0VCVklFV19USVRMRV9DSEFOR0VEXTogeyB1cmw6IFNlcnZlclsndXJsJ107IHRpdGxlOiBTZXJ2ZXJbJ3RpdGxlJ10gfTtcbiAgW1dFQlZJRVdfUEFHRV9USVRMRV9DSEFOR0VEXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBwYWdlVGl0bGU6IFNlcnZlclsncGFnZVRpdGxlJ107XG4gIH07XG4gIFtXRUJWSUVXX1VOUkVBRF9DSEFOR0VEXTogeyB1cmw6IFNlcnZlclsndXJsJ107IGJhZGdlOiBTZXJ2ZXJbJ2JhZGdlJ10gfTtcbiAgW1dFQlZJRVdfVVNFUl9MT0dHRURfSU5dOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICAgIHVzZXJMb2dnZWRJbjogU2VydmVyWyd1c2VyTG9nZ2VkSW4nXTtcbiAgfTtcbiAgW1dFQlZJRVdfVVNFUl9USEVNRV9BUFBFQVJBTkNFX0NIQU5HRURdOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICAgIHRoZW1lQXBwZWFyYW5jZTogU2VydmVyWyd0aGVtZUFwcGVhcmFuY2UnXTtcbiAgfTtcbiAgW1dFQlZJRVdfR0lUX0NPTU1JVF9IQVNIX0NIRUNLXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBnaXRDb21taXRIYXNoOiBTZXJ2ZXJbJ2dpdENvbW1pdEhhc2gnXTtcbiAgfTtcbiAgW1dFQlZJRVdfR0lUX0NPTU1JVF9IQVNIX0NIQU5HRURdOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICAgIGdpdENvbW1pdEhhc2g6IFNlcnZlclsnZ2l0Q29tbWl0SGFzaCddO1xuICB9O1xuICBbV0VCVklFV19BTExPV0VEX1JFRElSRUNUU19DSEFOR0VEXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBhbGxvd2VkUmVkaXJlY3RzOiBTZXJ2ZXJbJ2FsbG93ZWRSZWRpcmVjdHMnXTtcbiAgfTtcbiAgW1NFVFRJTkdTX1NFVF9SRVBPUlRfT1BUX0lOX0NIQU5HRURdOiBib29sZWFuO1xuICBbU0VUVElOR1NfU0VUX0ZMQVNIRlJBTUVfT1BUX0lOX0NIQU5HRURdOiBib29sZWFuO1xuICBbU0VUVElOR1NfU0VUX0hBUkRXQVJFX0FDQ0VMRVJBVElPTl9PUFRfSU5fQ0hBTkdFRF06IGJvb2xlYW47XG4gIFtTRVRUSU5HU19TRVRfSU5URVJOQUxWSURFT0NIQVRXSU5ET1dfT1BUX0lOX0NIQU5HRURdOiBib29sZWFuO1xuICBbU0VUVElOR1NfU0VUX01JTklNSVpFX09OX0NMT1NFX09QVF9JTl9DSEFOR0VEXTogYm9vbGVhbjtcbiAgW1NFVFRJTkdTX1NFVF9JU19UUkFZX0lDT05fRU5BQkxFRF9DSEFOR0VEXTogYm9vbGVhbjtcbiAgW1NFVFRJTkdTX1NFVF9JU19TSURFX0JBUl9FTkFCTEVEX0NIQU5HRURdOiBib29sZWFuO1xuICBbU0VUVElOR1NfU0VUX0lTX01FTlVfQkFSX0VOQUJMRURfQ0hBTkdFRF06IGJvb2xlYW47XG4gIFtTRVRUSU5HU19TRVRfSVNfVklERU9fQ0FMTF9XSU5ET1dfUEVSU0lTVEVOQ0VfRU5BQkxFRF9DSEFOR0VEXTogYm9vbGVhbjtcbiAgW1NFVFRJTkdTX1NFVF9JU19ERVZFTE9QRVJfTU9ERV9FTkFCTEVEX0NIQU5HRURdOiBib29sZWFuO1xuICBbU0VUVElOR1NfU0VUX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0hBTkdFRF06IGJvb2xlYW47XG4gIFtTRVRUSU5HU19DTEVBUl9QRVJNSVRURURfU0NSRUVOX0NBUFRVUkVfUEVSTUlTU0lPTlNdOiB2b2lkO1xuICBbU0VUVElOR1NfTlRMTV9DUkVERU5USUFMU19DSEFOR0VEXTogYm9vbGVhbjtcbiAgW1NFVFRJTkdTX0FWQUlMQUJMRV9CUk9XU0VSU19VUERBVEVEXTogc3RyaW5nW107XG4gIFtTRVRUSU5HU19TRUxFQ1RFRF9CUk9XU0VSX0NIQU5HRURdOiBzdHJpbmcgfCBudWxsO1xuICBbU0VUX0hBU19UUkFZX01JTklNSVpFX05PVElGSUNBVElPTl9TSE9XTl06IGJvb2xlYW47XG4gIFtWSURFT19DQUxMX1dJTkRPV19PUEVOX1VSTF06IHsgdXJsOiBzdHJpbmcgfTtcbiAgW0RPV05MT0FEU19CQUNLX0JVVFRPTl9DTElDS0VEXTogc3RyaW5nO1xuICBbV0VCVklFV19TRVJWRVJfU1VQUE9SVEVEX1ZFUlNJT05TX1VQREFURURdOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICAgIHN1cHBvcnRlZFZlcnNpb25zOiBTZXJ2ZXJbJ3N1cHBvcnRlZFZlcnNpb25zJ107XG4gICAgc291cmNlOiBTZXJ2ZXJbJ3N1cHBvcnRlZFZlcnNpb25zU291cmNlJ107XG4gIH07XG4gIFtXRUJWSUVXX1NFUlZFUl9VTklRVUVfSURfVVBEQVRFRF06IHtcbiAgICB1cmw6IFNlcnZlclsndXJsJ107XG4gICAgdW5pcXVlSUQ6IFNlcnZlclsndW5pcXVlSUQnXTtcbiAgfTtcbiAgW1dFQlZJRVdfU0VSVkVSX0lTX1NVUFBPUlRFRF9WRVJTSU9OXToge1xuICAgIHVybDogU2VydmVyWyd1cmwnXTtcbiAgICBpc1N1cHBvcnRlZFZlcnNpb246IFNlcnZlclsnaXNTdXBwb3J0ZWRWZXJzaW9uJ107XG4gIH07XG4gIFtXRUJWSUVXX1NFUlZFUl9WRVJTSU9OX1VQREFURURdOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICAgIHZlcnNpb246IFNlcnZlclsndmVyc2lvbiddO1xuICB9O1xuICBbU1VQUE9SVEVEX1ZFUlNJT05fRElBTE9HX0RJU01JU1NdOiB7IHVybDogU2VydmVyWyd1cmwnXSB9O1xuICBbV0VCVklFV19TRVJWRVJfUkVMT0FERURdOiB7XG4gICAgdXJsOiBTZXJ2ZXJbJ3VybCddO1xuICB9O1xuICBbV0VCVklFV19QREZfVklFV0VSX0FUVEFDSEVEXTogeyBXZWJDb250ZW50c0lkOiBudW1iZXIgfTtcbn07XG4iLCJpbXBvcnQgdHlwZSB7IFNlcnZlciwgU2VydmVyVXJsUmVzb2x1dGlvblJlc3VsdCB9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IFNFUlZFUlNfTE9BREVEID0gJ3NlcnZlcnMvbG9hZGVkJztcbmV4cG9ydCBjb25zdCBTRVJWRVJfVVJMX1JFU09MVVRJT05fUkVRVUVTVEVEID1cbiAgJ3NlcnZlci91cmwtcmVzb2x1dGlvbi1yZXF1ZXN0ZWQnO1xuZXhwb3J0IGNvbnN0IFNFUlZFUl9VUkxfUkVTT0xWRUQgPSAnc2VydmVyL3VybC1yZXNvbHZlZCc7XG5leHBvcnQgY29uc3QgU0VSVkVSX0RPQ1VNRU5UX1ZJRVdFUl9PUEVOX1VSTCA9XG4gICdzZXJ2ZXIvZG9jdW1lbnQtdmlld2VyL29wZW4tdXJsJztcblxuZXhwb3J0IHR5cGUgU2VydmVyc0FjdGlvblR5cGVUb1BheWxvYWRNYXAgPSB7XG4gIFtTRVJWRVJTX0xPQURFRF06IHtcbiAgICBzZXJ2ZXJzOiBTZXJ2ZXJbXTtcbiAgICBzZWxlY3RlZDogU2VydmVyWyd1cmwnXSB8IG51bGw7XG4gIH07XG4gIFtTRVJWRVJfVVJMX1JFU09MVVRJT05fUkVRVUVTVEVEXTogU2VydmVyWyd1cmwnXTtcbiAgW1NFUlZFUl9VUkxfUkVTT0xWRURdOiBTZXJ2ZXJVcmxSZXNvbHV0aW9uUmVzdWx0O1xuICBbU0VSVkVSX0RPQ1VNRU5UX1ZJRVdFUl9PUEVOX1VSTF06IHtcbiAgICBzZXJ2ZXI6IFNlcnZlclsndXJsJ107XG4gICAgZG9jdW1lbnRVcmw6IHN0cmluZztcbiAgfTtcbn07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG5pbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgeyBERUVQX0xJTktTX1NFUlZFUl9BRERFRCB9IGZyb20gJy4uL2RlZXBMaW5rcy9hY3Rpb25zJztcbmltcG9ydCB7IE9VVExPT0tfQ0FMRU5EQVJfU0FWRV9DUkVERU5USUFMUyB9IGZyb20gJy4uL291dGxvb2tDYWxlbmRhci9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgU0lERV9CQVJfU0VSVkVSX1JFTU9WRSB9IGZyb20gJy4uL3VpL2FjdGlvbnMnO1xuaW1wb3J0IHtcbiAgV0VCVklFV19QQUdFX1RJVExFX0NIQU5HRUQsXG4gIEFERF9TRVJWRVJfVklFV19TRVJWRVJfQURERUQsXG4gIFNJREVfQkFSX1JFTU9WRV9TRVJWRVJfQ0xJQ0tFRCxcbiAgU0lERV9CQVJfU0VSVkVSU19TT1JURUQsXG4gIFdFQlZJRVdfRElEX05BVklHQVRFLFxuICBXRUJWSUVXX1NJREVCQVJfU1RZTEVfQ0hBTkdFRCxcbiAgV0VCVklFV19USVRMRV9DSEFOR0VELFxuICBXRUJWSUVXX1VOUkVBRF9DSEFOR0VELFxuICBXRUJWSUVXX1VTRVJfTE9HR0VEX0lOLFxuICBXRUJWSUVXX0ZBVklDT05fQ0hBTkdFRCxcbiAgV0VCVklFV19ESURfU1RBUlRfTE9BRElORyxcbiAgV0VCVklFV19ESURfRkFJTF9MT0FELFxuICBXRUJWSUVXX1JFQURZLFxuICBXRUJWSUVXX0FUVEFDSEVELFxuICBXRUJWSUVXX0dJVF9DT01NSVRfSEFTSF9DSEFOR0VELFxuICBXRUJWSUVXX0FMTE9XRURfUkVESVJFQ1RTX0NIQU5HRUQsXG4gIFdFQlZJRVdfU0VSVkVSX1NVUFBPUlRFRF9WRVJTSU9OU19VUERBVEVELFxuICBXRUJWSUVXX1NFUlZFUl9VTklRVUVfSURfVVBEQVRFRCxcbiAgV0VCVklFV19TRVJWRVJfSVNfU1VQUE9SVEVEX1ZFUlNJT04sXG4gIFdFQlZJRVdfU0VSVkVSX1ZFUlNJT05fVVBEQVRFRCxcbiAgU1VQUE9SVEVEX1ZFUlNJT05fRElBTE9HX0RJU01JU1MsXG4gIFdFQlZJRVdfU0lERUJBUl9DVVNUT01fVEhFTUVfQ0hBTkdFRCxcbiAgV0VCVklFV19VU0VSX1RIRU1FX0FQUEVBUkFOQ0VfQ0hBTkdFRCxcbn0gZnJvbSAnLi4vdWkvYWN0aW9ucyc7XG5pbXBvcnQgeyBTRVJWRVJTX0xPQURFRCwgU0VSVkVSX0RPQ1VNRU5UX1ZJRVdFUl9PUEVOX1VSTCB9IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IFNlcnZlciB9IGZyb20gJy4vY29tbW9uJztcblxuY29uc3QgZW5zdXJlVXJsRm9ybWF0ID0gKHNlcnZlclVybDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyA9PiB7XG4gIGlmIChzZXJ2ZXJVcmwpIHtcbiAgICByZXR1cm4gbmV3IFVSTChzZXJ2ZXJVcmwpLmhyZWY7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBoYW5kbGUgbnVsbCBzZXJ2ZXIgVVJMcycpO1xufTtcblxudHlwZSBTZXJ2ZXJzQWN0aW9uVHlwZXMgPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBBRERfU0VSVkVSX1ZJRVdfU0VSVkVSX0FEREVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBERUVQX0xJTktTX1NFUlZFUl9BRERFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VSVkVSU19MT0FERUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNJREVfQkFSX1JFTU9WRV9TRVJWRVJfQ0xJQ0tFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0lERV9CQVJfU0VSVkVSU19TT1JURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfRElEX05BVklHQVRFPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX1NJREVCQVJfU1RZTEVfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19TSURFQkFSX0NVU1RPTV9USEVNRV9DSEFOR0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX0dJVF9DT01NSVRfSEFTSF9DSEFOR0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX1RJVExFX0NIQU5HRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfVU5SRUFEX0NIQU5HRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfVVNFUl9MT0dHRURfSU4+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfQUxMT1dFRF9SRURJUkVDVFNfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19GQVZJQ09OX0NIQU5HRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIEFQUF9TRVRUSU5HU19MT0FERUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfRElEX1NUQVJUX0xPQURJTkc+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfRElEX0ZBSUxfTE9BRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19SRUFEWT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19BVFRBQ0hFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgT1VUTE9PS19DQUxFTkRBUl9TQVZFX0NSRURFTlRJQUxTPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX1NFUlZFUl9TVVBQT1JURURfVkVSU0lPTlNfVVBEQVRFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19TRVJWRVJfVU5JUVVFX0lEX1VQREFURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfU0VSVkVSX0lTX1NVUFBPUlRFRF9WRVJTSU9OPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX1NFUlZFUl9WRVJTSU9OX1VQREFURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNVUFBPUlRFRF9WRVJTSU9OX0RJQUxPR19ESVNNSVNTPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBTRVJWRVJfRE9DVU1FTlRfVklFV0VSX09QRU5fVVJMPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX1BBR0VfVElUTEVfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19VU0VSX1RIRU1FX0FQUEVBUkFOQ0VfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0lERV9CQVJfU0VSVkVSX1JFTU9WRT47XG5cbmNvbnN0IHVwc2VydCA9IChzdGF0ZTogU2VydmVyW10sIHNlcnZlcjogU2VydmVyKTogU2VydmVyW10gPT4ge1xuICBjb25zdCBpbmRleCA9IHN0YXRlLmZpbmRJbmRleCgoeyB1cmwgfSkgPT4gdXJsID09PSBzZXJ2ZXIudXJsKTtcblxuICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgcmV0dXJuIFsuLi5zdGF0ZSwgc2VydmVyXTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5tYXAoKF9zZXJ2ZXIsIGkpID0+XG4gICAgaSA9PT0gaW5kZXggPyB7IC4uLl9zZXJ2ZXIsIC4uLnNlcnZlciB9IDogX3NlcnZlclxuICApO1xufTtcblxuY29uc3QgdXBkYXRlID0gKHN0YXRlOiBTZXJ2ZXJbXSwgc2VydmVyOiBTZXJ2ZXIpOiBTZXJ2ZXJbXSA9PiB7XG4gIGNvbnN0IGluZGV4ID0gc3RhdGUuZmluZEluZGV4KCh7IHVybCB9KSA9PiB1cmwgPT09IHNlcnZlci51cmwpO1xuXG4gIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICByZXR1cm4gc3RhdGUubWFwKChfc2VydmVyLCBpKSA9PlxuICAgIGkgPT09IGluZGV4ID8geyAuLi5fc2VydmVyLCAuLi5zZXJ2ZXIgfSA6IF9zZXJ2ZXJcbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXJ2ZXJzOiBSZWR1Y2VyPFNlcnZlcltdLCBTZXJ2ZXJzQWN0aW9uVHlwZXM+ID0gKFxuICBzdGF0ZSA9IFtdLFxuICBhY3Rpb25cbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBRERfU0VSVkVSX1ZJRVdfU0VSVkVSX0FEREVEOlxuICAgIGNhc2UgREVFUF9MSU5LU19TRVJWRVJfQURERUQ6IHtcbiAgICAgIGNvbnN0IHVybCA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwc2VydChzdGF0ZSwgeyB1cmwsIHRpdGxlOiB1cmwgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBTSURFX0JBUl9SRU1PVkVfU0VSVkVSX0NMSUNLRUQ6IHtcbiAgICAgIGNvbnN0IF91cmwgPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzdGF0ZS5maWx0ZXIoKHsgdXJsIH0pID0+IHVybCAhPT0gX3VybCk7XG4gICAgfVxuXG4gICAgY2FzZSBTSURFX0JBUl9TRVJWRVJTX1NPUlRFRDoge1xuICAgICAgY29uc3QgdXJscyA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHN0YXRlLnNvcnQoXG4gICAgICAgICh7IHVybDogYSB9LCB7IHVybDogYiB9KSA9PiB1cmxzLmluZGV4T2YoYSkgLSB1cmxzLmluZGV4T2YoYilcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX1RJVExFX0NIQU5HRUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCB0aXRsZSA9IHVybCB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gdXBzZXJ0KHN0YXRlLCB7IHVybCwgdGl0bGUgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX1BBR0VfVElUTEVfQ0hBTkdFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIHBhZ2VUaXRsZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gdXBzZXJ0KHN0YXRlLCB7IHVybCwgcGFnZVRpdGxlIH0pO1xuICAgIH1cblxuICAgIGNhc2UgV0VCVklFV19TRVJWRVJfU1VQUE9SVEVEX1ZFUlNJT05TX1VQREFURUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCBzdXBwb3J0ZWRWZXJzaW9ucywgc291cmNlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHtcbiAgICAgICAgdXJsLFxuICAgICAgICBzdXBwb3J0ZWRWZXJzaW9ucyxcbiAgICAgICAgc3VwcG9ydGVkVmVyc2lvbnNTb3VyY2U6IHNvdXJjZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhc2UgU1VQUE9SVEVEX1ZFUlNJT05fRElBTE9HX0RJU01JU1M6IHtcbiAgICAgIGNvbnN0IHsgdXJsIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBleHBpcmF0aW9uTWVzc2FnZUxhc3RUaW1lU2hvd246IG5ldyBEYXRlKCkgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX1NFUlZFUl9VTklRVUVfSURfVVBEQVRFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIHVuaXF1ZUlEIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCB1bmlxdWVJRCB9KTtcbiAgICB9XG5cbiAgICBjYXNlIFdFQlZJRVdfVVNFUl9USEVNRV9BUFBFQVJBTkNFX0NIQU5HRUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCB0aGVtZUFwcGVhcmFuY2UgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwc2VydChzdGF0ZSwgeyB1cmwsIHRoZW1lQXBwZWFyYW5jZSB9KTtcbiAgICB9XG5cbiAgICBjYXNlIFdFQlZJRVdfU0VSVkVSX0lTX1NVUFBPUlRFRF9WRVJTSU9OOiB7XG4gICAgICBjb25zdCB7IHVybCwgaXNTdXBwb3J0ZWRWZXJzaW9uIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBpc1N1cHBvcnRlZFZlcnNpb24gfSk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX1NFUlZFUl9WRVJTSU9OX1VQREFURUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCB2ZXJzaW9uIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCB2ZXJzaW9uIH0pO1xuICAgIH1cblxuICAgIGNhc2UgV0VCVklFV19VTlJFQURfQ0hBTkdFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIGJhZGdlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBiYWRnZSB9KTtcbiAgICB9XG5cbiAgICBjYXNlIFdFQlZJRVdfVVNFUl9MT0dHRURfSU46IHtcbiAgICAgIGNvbnN0IHsgdXJsLCB1c2VyTG9nZ2VkSW4gfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwc2VydChzdGF0ZSwgeyB1cmwsIHVzZXJMb2dnZWRJbiB9KTtcbiAgICB9XG5cbiAgICBjYXNlIFdFQlZJRVdfQUxMT1dFRF9SRURJUkVDVFNfQ0hBTkdFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIGFsbG93ZWRSZWRpcmVjdHMgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwc2VydChzdGF0ZSwgeyB1cmwsIGFsbG93ZWRSZWRpcmVjdHMgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX1NJREVCQVJfU1RZTEVfQ0hBTkdFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIHN0eWxlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBzdHlsZSB9KTtcbiAgICB9XG5cbiAgICBjYXNlIFdFQlZJRVdfU0lERUJBUl9DVVNUT01fVEhFTUVfQ0hBTkdFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIGN1c3RvbVRoZW1lIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBjdXN0b21UaGVtZSB9KTtcbiAgICB9XG5cbiAgICBjYXNlIFdFQlZJRVdfR0lUX0NPTU1JVF9IQVNIX0NIQU5HRUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCBnaXRDb21taXRIYXNoIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBnaXRDb21taXRIYXNoIH0pO1xuICAgIH1cblxuICAgIGNhc2UgV0VCVklFV19GQVZJQ09OX0NIQU5HRUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCBmYXZpY29uIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBmYXZpY29uIH0pO1xuICAgIH1cblxuICAgIGNhc2UgV0VCVklFV19ESURfTkFWSUdBVEU6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCBwYWdlVXJsIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGlmIChwYWdlVXJsPy5pbmNsdWRlcyh1cmwpKSB7XG4gICAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsLCBsYXN0UGF0aDogcGFnZVVybCB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIGNhc2UgV0VCVklFV19ESURfU1RBUlRfTE9BRElORzoge1xuICAgICAgY29uc3QgeyB1cmwgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwc2VydChzdGF0ZSwgeyB1cmwsIGZhaWxlZDogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX0RJRF9GQUlMX0xPQUQ6IHtcbiAgICAgIGNvbnN0IHsgdXJsLCBpc01haW5GcmFtZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICBpZiAoaXNNYWluRnJhbWUpIHtcbiAgICAgICAgcmV0dXJuIHVwc2VydChzdGF0ZSwgeyB1cmwsIGZhaWxlZDogdHJ1ZSB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIGNhc2UgU0VSVkVSU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgc2VydmVycyA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzZXJ2ZXJzLm1hcCgoc2VydmVyOiBTZXJ2ZXIpID0+ICh7XG4gICAgICAgIC4uLnNlcnZlcixcbiAgICAgICAgdXJsOiBlbnN1cmVVcmxGb3JtYXQoc2VydmVyLnVybCksXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IHNlcnZlcnMgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc2VydmVycy5tYXAoKHNlcnZlcjogU2VydmVyKSA9PiAoe1xuICAgICAgICAuLi5zZXJ2ZXIsXG4gICAgICAgIHVybDogZW5zdXJlVXJsRm9ybWF0KHNlcnZlci51cmwpLFxuICAgICAgICBkb2N1bWVudFZpZXdlck9wZW5Vcmw6ICcnLFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIGNhc2UgV0VCVklFV19SRUFEWToge1xuICAgICAgY29uc3QgeyB1cmwsIHdlYkNvbnRlbnRzSWQgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwZGF0ZShzdGF0ZSwgeyB1cmwsIHdlYkNvbnRlbnRzSWQgfSk7XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX0FUVEFDSEVEOiB7XG4gICAgICBjb25zdCB7IHVybCwgd2ViQ29udGVudHNJZCB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gdXBkYXRlKHN0YXRlLCB7IHVybCwgd2ViQ29udGVudHNJZCB9KTtcbiAgICB9XG5cbiAgICBjYXNlIE9VVExPT0tfQ0FMRU5EQVJfU0FWRV9DUkVERU5USUFMUzoge1xuICAgICAgY29uc3QgeyB1cmwsIG91dGxvb2tDcmVkZW50aWFscyB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gdXBzZXJ0KHN0YXRlLCB7IHVybCwgb3V0bG9va0NyZWRlbnRpYWxzIH0pO1xuICAgIH1cblxuICAgIGNhc2UgU0VSVkVSX0RPQ1VNRU5UX1ZJRVdFUl9PUEVOX1VSTDoge1xuICAgICAgY29uc3QgeyBzZXJ2ZXIsIGRvY3VtZW50VXJsIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiB1cHNlcnQoc3RhdGUsIHsgdXJsOiBzZXJ2ZXIsIGRvY3VtZW50Vmlld2VyT3BlblVybDogZG9jdW1lbnRVcmwgfSk7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHsgQVBQX1NFVFRJTkdTX0xPQURFRCB9IGZyb20gJy4uLy4uL2FwcC9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7IFNFVFRJTkdTX0FWQUlMQUJMRV9CUk9XU0VSU19VUERBVEVEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgQXZhaWxhYmxlQnJvd3NlcnNBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBTRVRUSU5HU19BVkFJTEFCTEVfQlJPV1NFUlNfVVBEQVRFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBhdmFpbGFibGVCcm93c2VyczogUmVkdWNlcjxcbiAgQXJyYXk8c3RyaW5nPixcbiAgQXZhaWxhYmxlQnJvd3NlcnNBY3Rpb25cbj4gPSAoc3RhdGUgPSBbXSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFNFVFRJTkdTX0FWQUlMQUJMRV9CUk9XU0VSU19VUERBVEVEOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBERUVQX0xJTktTX1NFUlZFUl9BRERFRCxcbiAgREVFUF9MSU5LU19TRVJWRVJfRk9DVVNFRCxcbn0gZnJvbSAnLi4vLi4vZGVlcExpbmtzL2FjdGlvbnMnO1xuaW1wb3J0IHsgU0VSVkVSU19MT0FERUQgfSBmcm9tICcuLi8uLi9zZXJ2ZXJzL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBTSURFX0JBUl9TRVJWRVJfUkVNT1ZFIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge1xuICBET1dOTE9BRFNfQkFDS19CVVRUT05fQ0xJQ0tFRCxcbiAgQUREX1NFUlZFUl9WSUVXX1NFUlZFUl9BRERFRCxcbiAgTUVOVV9CQVJfQUREX05FV19TRVJWRVJfQ0xJQ0tFRCxcbiAgTUVOVV9CQVJfU0VMRUNUX1NFUlZFUl9DTElDS0VELFxuICBTSURFX0JBUl9BRERfTkVXX1NFUlZFUl9DTElDS0VELFxuICBTSURFX0JBUl9ET1dOTE9BRFNfQlVUVE9OX0NMSUNLRUQsXG4gIFNJREVfQkFSX1NFVFRJTkdTX0JVVFRPTl9DTElDS0VELFxuICBTSURFX0JBUl9SRU1PVkVfU0VSVkVSX0NMSUNLRUQsXG4gIFNJREVfQkFSX1NFUlZFUl9TRUxFQ1RFRCxcbiAgVE9VQ0hfQkFSX1NFTEVDVF9TRVJWRVJfVE9VQ0hFRCxcbiAgV0VCVklFV19GT0NVU19SRVFVRVNURUQsXG59IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIEN1cnJlbnRWaWV3QWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQUREX1NFUlZFUl9WSUVXX1NFUlZFUl9BRERFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgREVFUF9MSU5LU19TRVJWRVJfQURERUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIERFRVBfTElOS1NfU0VSVkVSX0ZPQ1VTRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIE1FTlVfQkFSX0FERF9ORVdfU0VSVkVSX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIE1FTlVfQkFSX1NFTEVDVF9TRVJWRVJfQ0xJQ0tFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VSVkVSU19MT0FERUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNJREVfQkFSX0FERF9ORVdfU0VSVkVSX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNJREVfQkFSX0RPV05MT0FEU19CVVRUT05fQ0xJQ0tFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0lERV9CQVJfU0VUVElOR1NfQlVUVE9OX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNJREVfQkFSX1JFTU9WRV9TRVJWRVJfQ0xJQ0tFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0lERV9CQVJfU0VSVkVSX1NFTEVDVEVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBUT1VDSF9CQVJfU0VMRUNUX1NFUlZFUl9UT1VDSEVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX0ZPQ1VTX1JFUVVFU1RFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgRE9XTkxPQURTX0JBQ0tfQlVUVE9OX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNJREVfQkFSX1NFUlZFUl9SRU1PVkU+O1xuXG50eXBlIEN1cnJlbnRWaWV3U3RhdGUgPVxuICB8ICdhZGQtbmV3LXNlcnZlcidcbiAgfCAnZG93bmxvYWRzJ1xuICB8ICdzZXR0aW5ncydcbiAgfCB7IHVybDogc3RyaW5nIH07XG5cbmV4cG9ydCBjb25zdCBjdXJyZW50VmlldyA9IChcbiAgc3RhdGU6IEN1cnJlbnRWaWV3U3RhdGUgPSAnYWRkLW5ldy1zZXJ2ZXInLFxuICBhY3Rpb246IEN1cnJlbnRWaWV3QWN0aW9uXG4pOiBDdXJyZW50Vmlld1N0YXRlID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQUREX1NFUlZFUl9WSUVXX1NFUlZFUl9BRERFRDpcbiAgICBjYXNlIERFRVBfTElOS1NfU0VSVkVSX0FEREVEOlxuICAgIGNhc2UgREVFUF9MSU5LU19TRVJWRVJfRk9DVVNFRDpcbiAgICBjYXNlIE1FTlVfQkFSX1NFTEVDVF9TRVJWRVJfQ0xJQ0tFRDpcbiAgICBjYXNlIFRPVUNIX0JBUl9TRUxFQ1RfU0VSVkVSX1RPVUNIRUQ6XG4gICAgY2FzZSBTSURFX0JBUl9TRVJWRVJfU0VMRUNURUQ6IHtcbiAgICAgIGNvbnN0IHVybCA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHsgdXJsIH07XG4gICAgfVxuXG4gICAgY2FzZSBXRUJWSUVXX0ZPQ1VTX1JFUVVFU1RFRDoge1xuICAgICAgY29uc3QgeyB1cmwsIHZpZXcgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgaWYgKHZpZXcgPT09ICdkb3dubG9hZHMnKSByZXR1cm4gJ2Rvd25sb2Fkcyc7XG4gICAgICByZXR1cm4geyB1cmwgfTtcbiAgICB9XG5cbiAgICBjYXNlIFNFUlZFUlNfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IHNlbGVjdGVkIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBzZWxlY3RlZCA/IHsgdXJsOiBzZWxlY3RlZCB9IDogJ2FkZC1uZXctc2VydmVyJztcbiAgICB9XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudFZpZXcgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gY3VycmVudFZpZXc7XG4gICAgfVxuXG4gICAgY2FzZSBNRU5VX0JBUl9BRERfTkVXX1NFUlZFUl9DTElDS0VEOlxuICAgIGNhc2UgU0lERV9CQVJfQUREX05FV19TRVJWRVJfQ0xJQ0tFRDpcbiAgICAgIHJldHVybiAnYWRkLW5ldy1zZXJ2ZXInO1xuXG4gICAgY2FzZSBTSURFX0JBUl9SRU1PVkVfU0VSVkVSX0NMSUNLRUQ6IHtcbiAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICdvYmplY3QnICYmIHN0YXRlLnVybCA9PT0gYWN0aW9uLnBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuICdhZGQtbmV3LXNlcnZlcic7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBjYXNlIFNJREVfQkFSX0RPV05MT0FEU19CVVRUT05fQ0xJQ0tFRDpcbiAgICAgIHJldHVybiAnZG93bmxvYWRzJztcblxuICAgIGNhc2UgU0lERV9CQVJfU0VUVElOR1NfQlVUVE9OX0NMSUNLRUQ6XG4gICAgICByZXR1cm4gJ3NldHRpbmdzJztcblxuICAgIGNhc2UgRE9XTkxPQURTX0JBQ0tfQlVUVE9OX0NMSUNLRUQ6XG4gICAgICByZXR1cm4geyB1cmw6IGFjdGlvbi5wYXlsb2FkIH07XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgU0VUX0hBU19UUkFZX01JTklNSVpFX05PVElGSUNBVElPTl9TSE9XTiB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG5leHBvcnQgY29uc3QgaGFzSGlkZU9uVHJheU5vdGlmaWNhdGlvblNob3duOiBSZWR1Y2VyPFxuICBib29sZWFuLFxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBTRVRfSEFTX1RSQVlfTUlOSU1JWkVfTk9USUZJQ0FUSU9OX1NIT1dOPlxuPiA9IChzdGF0ZSA9IGZhbHNlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDpcbiAgICAgIHJldHVybiBCb29sZWFuKGFjdGlvbi5wYXlsb2FkLmhhc0hpZGVPblRyYXlOb3RpZmljYXRpb25TaG93bik7XG4gICAgY2FzZSBTRVRfSEFTX1RSQVlfTUlOSU1JWkVfTk9USUZJQ0FUSU9OX1NIT1dOOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vLi4vc3RvcmUvYWN0aW9ucyc7XG5cbmV4cG9ydCBjb25zdCBpc0FkZE5ld1NlcnZlcnNFbmFibGVkOiBSZWR1Y2VyPFxuICBib29sZWFuLFxuICBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbj4gPSAoc3RhdGUgPSB0cnVlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDpcbiAgICAgIHJldHVybiBCb29sZWFuKGFjdGlvbi5wYXlsb2FkLmlzQWRkTmV3U2VydmVyc0VuYWJsZWQpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBNRU5VX0JBUl9UT0dHTEVfSVNfREVWRUxPUEVSX01PREVfRU5BQkxFRF9DTElDS0VELFxuICBTRVRUSU5HU19TRVRfSVNfREVWRUxPUEVSX01PREVfRU5BQkxFRF9DSEFOR0VELFxufSBmcm9tICcuLi9hY3Rpb25zJztcblxudHlwZSBJc0RldmVsb3Blck1vZGVFbmFibGVkQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgTUVOVV9CQVJfVE9HR0xFX0lTX0RFVkVMT1BFUl9NT0RFX0VOQUJMRURfQ0xJQ0tFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VUVElOR1NfU0VUX0lTX0RFVkVMT1BFUl9NT0RFX0VOQUJMRURfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBpc0RldmVsb3Blck1vZGVFbmFibGVkOiBSZWR1Y2VyPFxuICBib29sZWFuLFxuICBJc0RldmVsb3Blck1vZGVFbmFibGVkQWN0aW9uXG4+ID0gKHN0YXRlID0gZmFsc2UsIGFjdGlvbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBTRVRUSU5HU19TRVRfSVNfREVWRUxPUEVSX01PREVfRU5BQkxFRF9DSEFOR0VEOlxuICAgIGNhc2UgTUVOVV9CQVJfVE9HR0xFX0lTX0RFVkVMT1BFUl9NT0RFX0VOQUJMRURfQ0xJQ0tFRDpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyBpc0RldmVsb3Blck1vZGVFbmFibGVkID0gc3RhdGUgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIGlzRGV2ZWxvcGVyTW9kZUVuYWJsZWQ7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgVXBkYXRlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IFVQREFURV9TS0lQUEVEID0gJ3VwZGF0ZS9za2lwcGVkJztcbmV4cG9ydCBjb25zdCBVUERBVEVTX0NIRUNLX0ZPUl9VUERBVEVTX1JFUVVFU1RFRCA9XG4gICd1cGRhdGVzL2NoZWNrLWZvci11cGRhdGVzLXJlcXVlc3RlZCc7XG5leHBvcnQgY29uc3QgVVBEQVRFU19DSEVDS0lOR19GT1JfVVBEQVRFID0gJ3VwZGF0ZXMvY2hlY2tpbmctZm9yLXVwZGF0ZSc7XG5leHBvcnQgY29uc3QgVVBEQVRFU19FUlJPUl9USFJPV04gPSAndXBkYXRlcy9lcnJvci10aHJvd24nO1xuZXhwb3J0IGNvbnN0IFVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFID0gJ3VwZGF0ZXMvbmV3LXZlcnNpb24tYXZhaWxhYmxlJztcbmV4cG9ydCBjb25zdCBVUERBVEVTX05FV19WRVJTSU9OX05PVF9BVkFJTEFCTEUgPVxuICAndXBkYXRlcy9uZXctdmVyc2lvbi1ub3QtYXZhaWxhYmxlJztcbmV4cG9ydCBjb25zdCBVUERBVEVTX1JFQURZID0gJ3VwZGF0ZXMvcmVhZHknO1xuZXhwb3J0IGNvbnN0IFVQREFURVNfQ0hBTk5FTF9DSEFOR0VEID0gJ3VwZGF0ZXMvY2hhbm5lbC1jaGFuZ2VkJztcblxuZXhwb3J0IHR5cGUgVXBkYXRlc0FjdGlvblR5cGVUb1BheWxvYWRNYXAgPSB7XG4gIFtVUERBVEVfU0tJUFBFRF06IHN0cmluZyB8IG51bGw7XG4gIFtVUERBVEVTX0NIRUNLX0ZPUl9VUERBVEVTX1JFUVVFU1RFRF06IHZvaWQ7XG4gIFtVUERBVEVTX0NIRUNLSU5HX0ZPUl9VUERBVEVdOiB2b2lkO1xuICBbVVBEQVRFU19FUlJPUl9USFJPV05dOiBFcnJvcjtcbiAgW1VQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFXTogc3RyaW5nO1xuICBbVVBEQVRFU19ORVdfVkVSU0lPTl9OT1RfQVZBSUxBQkxFXTogdm9pZDtcbiAgW1VQREFURVNfUkVBRFldOiBVcGRhdGVDb25maWd1cmF0aW9uO1xuICBbVVBEQVRFU19DSEFOTkVMX0NIQU5HRURdOiBzdHJpbmc7XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgVVBEQVRFU19SRUFEWSB9IGZyb20gJy4uLy4uL3VwZGF0ZXMvYWN0aW9ucyc7XG5pbXBvcnQgeyBTRVRUSU5HU19TRVRfRkxBU0hGUkFNRV9PUFRfSU5fQ0hBTkdFRCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIElzRmxhc2hGcmFtZUVuYWJsZWRBY3Rpb24gPSBBY3Rpb25PZjxcbiAgdHlwZW9mIFNFVFRJTkdTX1NFVF9GTEFTSEZSQU1FX09QVF9JTl9DSEFOR0VEXG4+O1xuXG5leHBvcnQgY29uc3QgaXNGbGFzaEZyYW1lRW5hYmxlZDogUmVkdWNlcjxcbiAgYm9vbGVhbixcbiAgfCBJc0ZsYXNoRnJhbWVFbmFibGVkQWN0aW9uXG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfUkVBRFk+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIEFQUF9TRVRUSU5HU19MT0FERUQ+XG4+ID0gKHN0YXRlID0gZmFsc2UsIGFjdGlvbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOlxuICAgICAgcmV0dXJuIEJvb2xlYW4oYWN0aW9uLnBheWxvYWQuaXNGbGFzaEZyYW1lRW5hYmxlZCk7XG4gICAgY2FzZSBVUERBVEVTX1JFQURZOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkLmlzRmxhc2hGcmFtZUVuYWJsZWQ7XG4gICAgY2FzZSBTRVRUSU5HU19TRVRfRkxBU0hGUkFNRV9PUFRfSU5fQ0hBTkdFRDoge1xuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuICAgIH1cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgVVBEQVRFU19SRUFEWSB9IGZyb20gJy4uLy4uL3VwZGF0ZXMvYWN0aW9ucyc7XG5pbXBvcnQgeyBTRVRUSU5HU19TRVRfSEFSRFdBUkVfQUNDRUxFUkFUSU9OX09QVF9JTl9DSEFOR0VEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgSXNIYXJkd2FyZUFjY2VsZXJhdGlvbkVuYWJsZWRBY3Rpb24gPSBBY3Rpb25PZjxcbiAgdHlwZW9mIFNFVFRJTkdTX1NFVF9IQVJEV0FSRV9BQ0NFTEVSQVRJT05fT1BUX0lOX0NIQU5HRURcbj47XG5cbmV4cG9ydCBjb25zdCBpc0hhcmR3YXJlQWNjZWxlcmF0aW9uRW5hYmxlZDogUmVkdWNlcjxcbiAgYm9vbGVhbixcbiAgfCBJc0hhcmR3YXJlQWNjZWxlcmF0aW9uRW5hYmxlZEFjdGlvblxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX1JFQURZPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPlxuPiA9IChzdGF0ZSA9IGZhbHNlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDpcbiAgICAgIHJldHVybiBCb29sZWFuKGFjdGlvbi5wYXlsb2FkLmlzSGFyZHdhcmVBY2NlbGVyYXRpb25FbmFibGVkKTtcbiAgICBjYXNlIFVQREFURVNfUkVBRFk6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQuaXNIYXJkd2FyZUFjY2VsZXJhdGlvbkVuYWJsZWQ7XG4gICAgY2FzZSBTRVRUSU5HU19TRVRfSEFSRFdBUkVfQUNDRUxFUkFUSU9OX09QVF9JTl9DSEFOR0VEOiB7XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG4gICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQgeyBVUERBVEVTX1JFQURZIH0gZnJvbSAnLi4vLi4vdXBkYXRlcy9hY3Rpb25zJztcbmltcG9ydCB7IFNFVFRJTkdTX1NFVF9JTlRFUk5BTFZJREVPQ0hBVFdJTkRPV19PUFRfSU5fQ0hBTkdFRCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIElzSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkID0gQWN0aW9uT2Y8XG4gIHR5cGVvZiBTRVRUSU5HU19TRVRfSU5URVJOQUxWSURFT0NIQVRXSU5ET1dfT1BUX0lOX0NIQU5HRURcbj47XG5cbmV4cG9ydCBjb25zdCBpc0ludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZDogUmVkdWNlcjxcbiAgYm9vbGVhbixcbiAgfCBJc0ludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZFxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX1JFQURZPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPlxuPiA9IChzdGF0ZSA9IGZhbHNlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDpcbiAgICAgIHJldHVybiBCb29sZWFuKGFjdGlvbi5wYXlsb2FkLmlzSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkKTtcbiAgICBjYXNlIFVQREFURVNfUkVBRFk6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQuaXNJbnRlcm5hbFZpZGVvQ2hhdFdpbmRvd0VuYWJsZWQ7XG4gICAgY2FzZSBTRVRUSU5HU19TRVRfSU5URVJOQUxWSURFT0NIQVRXSU5ET1dfT1BUX0lOX0NIQU5HRUQ6IHtcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcbiAgICB9XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHsgQVBQX1NFVFRJTkdTX0xPQURFRCB9IGZyb20gJy4uLy4uL2FwcC9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7XG4gIE1FTlVfQkFSX1RPR0dMRV9JU19NRU5VX0JBUl9FTkFCTEVEX0NMSUNLRUQsXG4gIFNFVFRJTkdTX1NFVF9JU19NRU5VX0JBUl9FTkFCTEVEX0NIQU5HRUQsXG59IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIElzTWVudUJhckVuYWJsZWRBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBNRU5VX0JBUl9UT0dHTEVfSVNfTUVOVV9CQVJfRU5BQkxFRF9DTElDS0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBTRVRUSU5HU19TRVRfSVNfTUVOVV9CQVJfRU5BQkxFRF9DSEFOR0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPjtcblxuZXhwb3J0IGNvbnN0IGlzTWVudUJhckVuYWJsZWQ6IFJlZHVjZXI8Ym9vbGVhbiwgSXNNZW51QmFyRW5hYmxlZEFjdGlvbj4gPSAoXG4gIHN0YXRlID0gdHJ1ZSxcbiAgYWN0aW9uXG4pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgU0VUVElOR1NfU0VUX0lTX01FTlVfQkFSX0VOQUJMRURfQ0hBTkdFRDpcbiAgICBjYXNlIE1FTlVfQkFSX1RPR0dMRV9JU19NRU5VX0JBUl9FTkFCTEVEX0NMSUNLRUQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgaXNNZW51QmFyRW5hYmxlZCA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBpc01lbnVCYXJFbmFibGVkO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7XG4gIFdFQlZJRVdfTUVTU0FHRV9CT1hfRk9DVVNFRCxcbiAgV0VCVklFV19NRVNTQUdFX0JPWF9CTFVSUkVELFxuICBXRUJWSUVXX0RJRF9TVEFSVF9MT0FESU5HLFxuICBXRUJWSUVXX0RJRF9GQUlMX0xPQUQsXG59IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIElzTWVzc2FnZUJveEZvY3VzZWRBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX01FU1NBR0VfQk9YX0ZPQ1VTRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfRElEX1NUQVJUX0xPQURJTkc+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfTUVTU0FHRV9CT1hfQkxVUlJFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgV0VCVklFV19ESURfRkFJTF9MT0FEPjtcblxuZXhwb3J0IGNvbnN0IGlzTWVzc2FnZUJveEZvY3VzZWQ6IFJlZHVjZXI8XG4gIGJvb2xlYW4sXG4gIElzTWVzc2FnZUJveEZvY3VzZWRBY3Rpb25cbj4gPSAoc3RhdGUgPSBmYWxzZSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFdFQlZJRVdfTUVTU0FHRV9CT1hfRk9DVVNFRDpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgY2FzZSBXRUJWSUVXX0RJRF9TVEFSVF9MT0FESU5HOlxuICAgIGNhc2UgV0VCVklFV19NRVNTQUdFX0JPWF9CTFVSUkVEOlxuICAgIGNhc2UgV0VCVklFV19ESURfRkFJTF9MT0FEOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHsgQVBQX1NFVFRJTkdTX0xPQURFRCB9IGZyb20gJy4uLy4uL2FwcC9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7IFNFVFRJTkdTX1NFVF9NSU5JTUlaRV9PTl9DTE9TRV9PUFRfSU5fQ0hBTkdFRCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG50eXBlIGlzTWluaW1pemVPbkNsb3NlRW5hYmxlZEFjdGlvbiA9XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNFVFRJTkdTX1NFVF9NSU5JTUlaRV9PTl9DTE9TRV9PUFRfSU5fQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBpc01pbmltaXplT25DbG9zZUVuYWJsZWQ6IFJlZHVjZXI8XG4gIGJvb2xlYW4sXG4gIGlzTWluaW1pemVPbkNsb3NlRW5hYmxlZEFjdGlvblxuPiA9IChzdGF0ZSA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicsIGFjdGlvbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBTRVRUSU5HU19TRVRfTUlOSU1JWkVfT05fQ0xPU0VfT1BUX0lOX0NIQU5HRUQ6IHtcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcbiAgICB9XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgaXNNaW5pbWl6ZU9uQ2xvc2VFbmFibGVkID0gc3RhdGUgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIGlzTWluaW1pemVPbkNsb3NlRW5hYmxlZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgU0VUVElOR1NfTlRMTV9DUkVERU5USUFMU19DSEFOR0VEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgaXNOVExNQ3JlZGVudGlhbHNFbmFibGVkQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VUVElOR1NfTlRMTV9DUkVERU5USUFMU19DSEFOR0VEPjtcblxuZXhwb3J0IGNvbnN0IGlzTlRMTUNyZWRlbnRpYWxzRW5hYmxlZDogUmVkdWNlcjxcbiAgYm9vbGVhbixcbiAgaXNOVExNQ3JlZGVudGlhbHNFbmFibGVkQWN0aW9uXG4+ID0gKHN0YXRlID0gZmFsc2UsIGFjdGlvbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IGlzTlRMTUNyZWRlbnRpYWxzRW5hYmxlZCA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBpc05UTE1DcmVkZW50aWFsc0VuYWJsZWQ7XG4gICAgfVxuXG4gICAgY2FzZSBTRVRUSU5HU19OVExNX0NSRURFTlRJQUxTX0NIQU5HRUQ6IHtcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgVVBEQVRFU19SRUFEWSB9IGZyb20gJy4uLy4uL3VwZGF0ZXMvYWN0aW9ucyc7XG5pbXBvcnQgeyBTRVRUSU5HU19TRVRfUkVQT1JUX09QVF9JTl9DSEFOR0VEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgaXNSZXBvcnRFbmFibGVkQWN0aW9uID0gQWN0aW9uT2Y8XG4gIHR5cGVvZiBTRVRUSU5HU19TRVRfUkVQT1JUX09QVF9JTl9DSEFOR0VEXG4+O1xuXG5leHBvcnQgY29uc3QgaXNSZXBvcnRFbmFibGVkOiBSZWR1Y2VyPFxuICBib29sZWFuLFxuICB8IGlzUmVwb3J0RW5hYmxlZEFjdGlvblxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX1JFQURZPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPlxuPiA9IChzdGF0ZSA9IGZhbHNlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDpcbiAgICAgIHJldHVybiBCb29sZWFuKGFjdGlvbi5wYXlsb2FkLmlzUmVwb3J0RW5hYmxlZCk7XG4gICAgY2FzZSBVUERBVEVTX1JFQURZOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkLmlzUmVwb3J0RW5hYmxlZDtcbiAgICBjYXNlIFNFVFRJTkdTX1NFVF9SRVBPUlRfT1BUX0lOX0NIQU5HRUQ6IHtcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcbiAgICB9XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHsgQVBQX1NFVFRJTkdTX0xPQURFRCB9IGZyb20gJy4uLy4uL2FwcC9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7IE1FTlVfQkFSX1RPR0dMRV9JU19TSE9XX1dJTkRPV19PTl9VTlJFQURfQ0hBTkdFRF9FTkFCTEVEX0NMSUNLRUQgfSBmcm9tICcuLi9hY3Rpb25zJztcblxudHlwZSBJc1Nob3dXaW5kb3dPblVucmVhZENoYW5nZWRFbmFibGVkQWN0aW9uID1cbiAgfCBBY3Rpb25PZjxcbiAgICAgIHR5cGVvZiBNRU5VX0JBUl9UT0dHTEVfSVNfU0hPV19XSU5ET1dfT05fVU5SRUFEX0NIQU5HRURfRU5BQkxFRF9DTElDS0VEXG4gICAgPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPjtcblxuZXhwb3J0IGNvbnN0IGlzU2hvd1dpbmRvd09uVW5yZWFkQ2hhbmdlZEVuYWJsZWQ6IFJlZHVjZXI8XG4gIGJvb2xlYW4sXG4gIElzU2hvd1dpbmRvd09uVW5yZWFkQ2hhbmdlZEVuYWJsZWRBY3Rpb25cbj4gPSAoc3RhdGUgPSBmYWxzZSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIE1FTlVfQkFSX1RPR0dMRV9JU19TSE9XX1dJTkRPV19PTl9VTlJFQURfQ0hBTkdFRF9FTkFCTEVEX0NMSUNLRUQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgaXNTaG93V2luZG93T25VbnJlYWRDaGFuZ2VkRW5hYmxlZCA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBpc1Nob3dXaW5kb3dPblVucmVhZENoYW5nZWRFbmFibGVkO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBNRU5VX0JBUl9UT0dHTEVfSVNfU0lERV9CQVJfRU5BQkxFRF9DTElDS0VELFxuICBTRVRUSU5HU19TRVRfSVNfU0lERV9CQVJfRU5BQkxFRF9DSEFOR0VELFxufSBmcm9tICcuLi9hY3Rpb25zJztcblxudHlwZSBJc1NpZGVCYXJFbmFibGVkQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgTUVOVV9CQVJfVE9HR0xFX0lTX1NJREVfQkFSX0VOQUJMRURfQ0xJQ0tFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VUVElOR1NfU0VUX0lTX1NJREVfQkFSX0VOQUJMRURfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBpc1NpZGVCYXJFbmFibGVkOiBSZWR1Y2VyPGJvb2xlYW4sIElzU2lkZUJhckVuYWJsZWRBY3Rpb24+ID0gKFxuICBzdGF0ZSA9IHRydWUsXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFNFVFRJTkdTX1NFVF9JU19TSURFX0JBUl9FTkFCTEVEX0NIQU5HRUQ6XG4gICAgY2FzZSBNRU5VX0JBUl9UT0dHTEVfSVNfU0lERV9CQVJfRU5BQkxFRF9DTElDS0VEOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IGlzU2lkZUJhckVuYWJsZWQgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gaXNTaWRlQmFyRW5hYmxlZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHtcbiAgTUVOVV9CQVJfVE9HR0xFX0lTX1RSQVlfSUNPTl9FTkFCTEVEX0NMSUNLRUQsXG4gIFNFVFRJTkdTX1NFVF9JU19UUkFZX0lDT05fRU5BQkxFRF9DSEFOR0VELFxufSBmcm9tICcuLi9hY3Rpb25zJztcblxudHlwZSBJc1RyYXlJY29uRW5hYmxlZEFjdGlvbiA9XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIE1FTlVfQkFSX1RPR0dMRV9JU19UUkFZX0lDT05fRU5BQkxFRF9DTElDS0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBTRVRUSU5HU19TRVRfSVNfVFJBWV9JQ09OX0VOQUJMRURfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBpc1RyYXlJY29uRW5hYmxlZDogUmVkdWNlcjxib29sZWFuLCBJc1RyYXlJY29uRW5hYmxlZEFjdGlvbj4gPSAoXG4gIHN0YXRlID0gcHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2xpbnV4JyxcbiAgYWN0aW9uXG4pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgU0VUVElOR1NfU0VUX0lTX1RSQVlfSUNPTl9FTkFCTEVEX0NIQU5HRUQ6XG4gICAgY2FzZSBNRU5VX0JBUl9UT0dHTEVfSVNfVFJBWV9JQ09OX0VOQUJMRURfQ0xJQ0tFRDpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyBpc1RyYXlJY29uRW5hYmxlZCA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBpc1RyYXlJY29uRW5hYmxlZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHtcbiAgTUVOVV9CQVJfVE9HR0xFX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0xJQ0tFRCxcbiAgU0VUVElOR1NfU0VUX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0hBTkdFRCxcbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgSXNWaWRlb0NhbGxEZXZ0b29sc0F1dG9PcGVuRW5hYmxlZEFjdGlvbiA9XG4gIHwgQWN0aW9uT2Y8XG4gICAgICB0eXBlb2YgTUVOVV9CQVJfVE9HR0xFX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0xJQ0tFRFxuICAgID5cbiAgfCBBY3Rpb25PZjxcbiAgICAgIHR5cGVvZiBTRVRUSU5HU19TRVRfSVNfVklERU9fQ0FMTF9ERVZUT09MU19BVVRPX09QRU5fRU5BQkxFRF9DSEFOR0VEXG4gICAgPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPjtcblxuZXhwb3J0IGNvbnN0IGlzVmlkZW9DYWxsRGV2dG9vbHNBdXRvT3BlbkVuYWJsZWQ6IFJlZHVjZXI8XG4gIGJvb2xlYW4sXG4gIElzVmlkZW9DYWxsRGV2dG9vbHNBdXRvT3BlbkVuYWJsZWRBY3Rpb25cbj4gPSAoc3RhdGUgPSBmYWxzZSwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFNFVFRJTkdTX1NFVF9JU19WSURFT19DQUxMX0RFVlRPT0xTX0FVVE9fT1BFTl9FTkFCTEVEX0NIQU5HRUQ6XG4gICAgY2FzZSBNRU5VX0JBUl9UT0dHTEVfSVNfVklERU9fQ0FMTF9ERVZUT09MU19BVVRPX09QRU5fRU5BQkxFRF9DTElDS0VEOlxuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IGlzVmlkZW9DYWxsRGV2dG9vbHNBdXRvT3BlbkVuYWJsZWQgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gaXNWaWRlb0NhbGxEZXZ0b29sc0F1dG9PcGVuRW5hYmxlZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHsgU0VUVElOR1NfU0VUX0lTX1ZJREVPX0NBTExfV0lORE9XX1BFUlNJU1RFTkNFX0VOQUJMRURfQ0hBTkdFRCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG5leHBvcnQgY29uc3QgaXNWaWRlb0NhbGxXaW5kb3dQZXJzaXN0ZW5jZUVuYWJsZWQ6IFJlZHVjZXI8Ym9vbGVhbiwgYW55PiA9IChcbiAgc3RhdGUgPSB0cnVlLCAvLyBFbmFibGVkIGJ5IGRlZmF1bHRcbiAgYWN0aW9uXG4pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgU0VUVElOR1NfU0VUX0lTX1ZJREVPX0NBTExfV0lORE9XX1BFUlNJU1RFTkNFX0VOQUJMRURfQ0hBTkdFRDpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyBpc1ZpZGVvQ2FsbFdpbmRvd1BlcnNpc3RlbmNlRW5hYmxlZCA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBpc1ZpZGVvQ2FsbFdpbmRvd1BlcnNpc3RlbmNlRW5hYmxlZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgU0lERV9CQVJfU0VSVkVSX1NFTEVDVEVEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgTGFzdFNlbGVjdGVkU2VydmVyVXJsQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0lERV9CQVJfU0VSVkVSX1NFTEVDVEVEPjtcblxuZXhwb3J0IGNvbnN0IGxhc3RTZWxlY3RlZFNlcnZlclVybDogUmVkdWNlcjxcbiAgc3RyaW5nLFxuICBMYXN0U2VsZWN0ZWRTZXJ2ZXJVcmxBY3Rpb25cbj4gPSAoc3RhdGUgPSAnJywgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgbGFzdFNlbGVjdGVkU2VydmVyVXJsID0gc3RhdGUsIHNlcnZlcnMgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgaWYgKHN0YXRlID09PSAnJyAmJiBzZXJ2ZXJzICYmIHNlcnZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gc2VydmVyc1swXS51cmw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsYXN0U2VsZWN0ZWRTZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgY2FzZSBTSURFX0JBUl9TRVJWRVJfU0VMRUNURUQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IFNDUkVFTl9TSEFSSU5HX0RJQUxPR19ESVNNSVNTRUQgPVxuICAnc2NyZWVuLXNoYXJpbmctZGlhbG9nL2Rpc21pc3NlZCc7XG5cbmV4cG9ydCB0eXBlIFNjcmVlblNoYXJpbmdBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbU0NSRUVOX1NIQVJJTkdfRElBTE9HX0RJU01JU1NFRF06IHZvaWQ7XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQge1xuICBDRVJUSUZJQ0FURVNfQ0xJRU5UX0NFUlRJRklDQVRFX1JFUVVFU1RFRCxcbiAgU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQsXG4gIFNFTEVDVF9DTElFTlRfQ0VSVElGSUNBVEVfRElBTE9HX0RJU01JU1NFRCxcbn0gZnJvbSAnLi4vLi4vbmF2aWdhdGlvbi9hY3Rpb25zJztcbmltcG9ydCB7XG4gIE9VVExPT0tfQ0FMRU5EQVJfRElBTE9HX0RJU01JU1NFRCxcbiAgT1VUTE9PS19DQUxFTkRBUl9BU0tfQ1JFREVOVElBTFMsXG4gIE9VVExPT0tfQ0FMRU5EQVJfU0VUX0NSRURFTlRJQUxTLFxufSBmcm9tICcuLi8uLi9vdXRsb29rQ2FsZW5kYXIvYWN0aW9ucyc7XG5pbXBvcnQgeyBTQ1JFRU5fU0hBUklOR19ESUFMT0dfRElTTUlTU0VEIH0gZnJvbSAnLi4vLi4vc2NyZWVuU2hhcmluZy9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7IFVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFIH0gZnJvbSAnLi4vLi4vdXBkYXRlcy9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgU1VQUE9SVEVEX1ZFUlNJT05fRElBTE9HX0RJU01JU1MgfSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7XG4gIEFCT1VUX0RJQUxPR19ESVNNSVNTRUQsXG4gIE1FTlVfQkFSX0FCT1VUX0NMSUNLRUQsXG4gIFVQREFURV9ESUFMT0dfRElTTUlTU0VELFxuICBVUERBVEVfRElBTE9HX0lOU1RBTExfQlVUVE9OX0NMSUNLRUQsXG4gIFVQREFURV9ESUFMT0dfUkVNSU5EX1VQREFURV9MQVRFUl9DTElDS0VELFxuICBVUERBVEVfRElBTE9HX1NLSVBfVVBEQVRFX0NMSUNLRUQsXG4gIFdFQlZJRVdfU0NSRUVOX1NIQVJJTkdfU09VUkNFX1JFUVVFU1RFRCxcbiAgV0VCVklFV19TQ1JFRU5fU0hBUklOR19TT1VSQ0VfUkVTUE9OREVELFxufSBmcm9tICcuLi9hY3Rpb25zJztcblxudHlwZSBPcGVuRGlhbG9nQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQUJPVVRfRElBTE9HX0RJU01JU1NFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQ0VSVElGSUNBVEVTX0NMSUVOVF9DRVJUSUZJQ0FURV9SRVFVRVNURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIE1FTlVfQkFSX0FCT1VUX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNDUkVFTl9TSEFSSU5HX0RJQUxPR19ESVNNSVNTRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNFTEVDVF9DTElFTlRfQ0VSVElGSUNBVEVfRElBTE9HX0NFUlRJRklDQVRFX1NFTEVDVEVEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBTRUxFQ1RfQ0xJRU5UX0NFUlRJRklDQVRFX0RJQUxPR19ESVNNSVNTRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURV9ESUFMT0dfRElTTUlTU0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVfRElBTE9HX0lOU1RBTExfQlVUVE9OX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURV9ESUFMT0dfUkVNSU5EX1VQREFURV9MQVRFUl9DTElDS0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVfRElBTE9HX1NLSVBfVVBEQVRFX0NMSUNLRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBXRUJWSUVXX1NDUkVFTl9TSEFSSU5HX1NPVVJDRV9SRVFVRVNURUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFdFQlZJRVdfU0NSRUVOX1NIQVJJTkdfU09VUkNFX1JFU1BPTkRFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgT1VUTE9PS19DQUxFTkRBUl9BU0tfQ1JFREVOVElBTFM+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIE9VVExPT0tfQ0FMRU5EQVJfRElBTE9HX0RJU01JU1NFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgT1VUTE9PS19DQUxFTkRBUl9TRVRfQ1JFREVOVElBTFM+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFNVUFBPUlRFRF9WRVJTSU9OX0RJQUxPR19ESVNNSVNTPjtcblxuZXhwb3J0IGNvbnN0IG9wZW5EaWFsb2c6IFJlZHVjZXI8c3RyaW5nIHwgbnVsbCwgT3BlbkRpYWxvZ0FjdGlvbj4gPSAoXG4gIHN0YXRlID0gbnVsbCxcbiAgYWN0aW9uXG4pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgTUVOVV9CQVJfQUJPVVRfQ0xJQ0tFRDpcbiAgICAgIHJldHVybiAnYWJvdXQnO1xuXG4gICAgY2FzZSBXRUJWSUVXX1NDUkVFTl9TSEFSSU5HX1NPVVJDRV9SRVFVRVNURUQ6XG4gICAgICByZXR1cm4gJ3NjcmVlbi1zaGFyaW5nJztcblxuICAgIGNhc2UgVVBEQVRFU19ORVdfVkVSU0lPTl9BVkFJTEFCTEU6XG4gICAgICByZXR1cm4gJ3VwZGF0ZSc7XG5cbiAgICBjYXNlIENFUlRJRklDQVRFU19DTElFTlRfQ0VSVElGSUNBVEVfUkVRVUVTVEVEOlxuICAgICAgcmV0dXJuICdzZWxlY3QtY2xpZW50LWNlcnRpZmljYXRlJztcblxuICAgIGNhc2UgQUJPVVRfRElBTE9HX0RJU01JU1NFRDpcbiAgICAgIGlmIChzdGF0ZSA9PT0gJ2Fib3V0Jykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0ZTtcblxuICAgIGNhc2UgT1VUTE9PS19DQUxFTkRBUl9BU0tfQ1JFREVOVElBTFM6XG4gICAgICByZXR1cm4gJ291dGxvb2stY3JlZGVudGlhbHMnO1xuXG4gICAgY2FzZSBTQ1JFRU5fU0hBUklOR19ESUFMT0dfRElTTUlTU0VEOlxuICAgIGNhc2UgV0VCVklFV19TQ1JFRU5fU0hBUklOR19TT1VSQ0VfUkVTUE9OREVEOlxuICAgIGNhc2UgU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQ6XG4gICAgY2FzZSBTRUxFQ1RfQ0xJRU5UX0NFUlRJRklDQVRFX0RJQUxPR19ESVNNSVNTRUQ6XG4gICAgY2FzZSBVUERBVEVfRElBTE9HX0RJU01JU1NFRDpcbiAgICBjYXNlIFVQREFURV9ESUFMT0dfU0tJUF9VUERBVEVfQ0xJQ0tFRDpcbiAgICBjYXNlIFVQREFURV9ESUFMT0dfUkVNSU5EX1VQREFURV9MQVRFUl9DTElDS0VEOlxuICAgIGNhc2UgVVBEQVRFX0RJQUxPR19JTlNUQUxMX0JVVFRPTl9DTElDS0VEOlxuICAgIGNhc2UgT1VUTE9PS19DQUxFTkRBUl9ESUFMT0dfRElTTUlTU0VEOlxuICAgIGNhc2UgT1VUTE9PS19DQUxFTkRBUl9TRVRfQ1JFREVOVElBTFM6XG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi8uLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7IFJPT1RfV0lORE9XX0lDT05fQ0hBTkdFRCB9IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBSb290V2luZG93SWNvbiB9IGZyb20gJy4uL2NvbW1vbic7XG5cbnR5cGUgUm9vdFdpbmRvd0ljb25BY3Rpb24gPSBBY3Rpb25PZjx0eXBlb2YgUk9PVF9XSU5ET1dfSUNPTl9DSEFOR0VEPjtcblxuZXhwb3J0IGNvbnN0IHJvb3RXaW5kb3dJY29uOiBSZWR1Y2VyPFxuICBSb290V2luZG93SWNvbiB8IG51bGwsXG4gIFJvb3RXaW5kb3dJY29uQWN0aW9uXG4+ID0gKHN0YXRlID0gbnVsbCwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFJPT1RfV0lORE9XX0lDT05fQ0hBTkdFRDoge1xuICAgICAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbk9mIH0gZnJvbSAnLi4vLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQgeyBST09UX1dJTkRPV19TVEFURV9DSEFOR0VEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IFdpbmRvd1N0YXRlIH0gZnJvbSAnLi4vY29tbW9uJztcblxudHlwZSBSb290V2luZG93U3RhdGVBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBST09UX1dJTkRPV19TVEFURV9DSEFOR0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPjtcblxuZXhwb3J0IGNvbnN0IHJvb3RXaW5kb3dTdGF0ZTogUmVkdWNlcjxXaW5kb3dTdGF0ZSwgUm9vdFdpbmRvd1N0YXRlQWN0aW9uPiA9IChcbiAgc3RhdGUgPSB7XG4gICAgZm9jdXNlZDogdHJ1ZSxcbiAgICB2aXNpYmxlOiB0cnVlLFxuICAgIG1heGltaXplZDogZmFsc2UsXG4gICAgbWluaW1pemVkOiBmYWxzZSxcbiAgICBmdWxsc2NyZWVuOiBmYWxzZSxcbiAgICBub3JtYWw6IHRydWUsXG4gICAgYm91bmRzOiB7XG4gICAgICB4OiB1bmRlZmluZWQsXG4gICAgICB5OiB1bmRlZmluZWQsXG4gICAgICB3aWR0aDogMTAwMCxcbiAgICAgIGhlaWdodDogNjAwLFxuICAgIH0sXG4gIH0sXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFJPT1RfV0lORE9XX1NUQVRFX0NIQU5HRUQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgcm9vdFdpbmRvd1N0YXRlID0gc3RhdGUgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHJvb3RXaW5kb3dTdGF0ZTtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHR5cGUgeyBSZWR1Y2VyIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBBUFBfU0VUVElOR1NfTE9BREVEIH0gZnJvbSAnLi4vLi4vYXBwL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25PZiB9IGZyb20gJy4uLy4uL3N0b3JlL2FjdGlvbnMnO1xuaW1wb3J0IHsgU0VUVElOR1NfU0VMRUNURURfQlJPV1NFUl9DSEFOR0VEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbnR5cGUgU2VsZWN0ZWRCcm93c2VyQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgU0VUVElOR1NfU0VMRUNURURfQlJPV1NFUl9DSEFOR0VEPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBBUFBfU0VUVElOR1NfTE9BREVEPjtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdGVkQnJvd3NlcjogUmVkdWNlcjxzdHJpbmcgfCBudWxsLCBTZWxlY3RlZEJyb3dzZXJBY3Rpb24+ID0gKFxuICBzdGF0ZSA9IG51bGwsXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFNFVFRJTkdTX1NFTEVDVEVEX0JST1dTRVJfQ0hBTkdFRDpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyBzZWxlY3RlZEJyb3dzZXIgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc2VsZWN0ZWRCcm93c2VyO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZHVjZXIgfSBmcm9tICdyZWR1eCc7XG5cbmltcG9ydCB7IEFQUF9TRVRUSU5HU19MT0FERUQgfSBmcm9tICcuLi8uLi9hcHAvYWN0aW9ucyc7XG5pbXBvcnQgeyBWSURFT19DQUxMX1dJTkRPV19TVEFURV9DSEFOR0VEIH0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IFdpbmRvd1N0YXRlIH0gZnJvbSAnLi4vY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IHZpZGVvQ2FsbFdpbmRvd1N0YXRlOiBSZWR1Y2VyPFdpbmRvd1N0YXRlLCBhbnk+ID0gKFxuICBzdGF0ZSA9IHtcbiAgICBmb2N1c2VkOiB0cnVlLFxuICAgIHZpc2libGU6IHRydWUsXG4gICAgbWF4aW1pemVkOiBmYWxzZSxcbiAgICBtaW5pbWl6ZWQ6IGZhbHNlLFxuICAgIGZ1bGxzY3JlZW46IGZhbHNlLFxuICAgIG5vcm1hbDogdHJ1ZSxcbiAgICBib3VuZHM6IHtcbiAgICAgIHg6IHVuZGVmaW5lZCxcbiAgICAgIHk6IHVuZGVmaW5lZCxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwLFxuICAgIH0sXG4gIH0sXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFZJREVPX0NBTExfV0lORE9XX1NUQVRFX0NIQU5HRUQ6XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgdmlkZW9DYWxsV2luZG93U3RhdGUgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gdmlkZW9DYWxsV2luZG93U3RhdGU7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcbiIsImltcG9ydCB0eXBlIHsgUmVkdWNlciB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0IHsgQVBQX1NFVFRJTkdTX0xPQURFRCB9IGZyb20gJy4uL2FwcC9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgQWN0aW9uT2YgfSBmcm9tICcuLi9zdG9yZS9hY3Rpb25zJztcbmltcG9ydCB7XG4gIEFCT1VUX0RJQUxPR19UT0dHTEVfVVBEQVRFX09OX1NUQVJULFxuICBBQk9VVF9ESUFMT0dfVVBEQVRFX0NIQU5ORUxfQ0hBTkdFRCxcbn0gZnJvbSAnLi4vdWkvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBVUERBVEVTX0NIRUNLSU5HX0ZPUl9VUERBVEUsXG4gIFVQREFURVNfRVJST1JfVEhST1dOLFxuICBVUERBVEVTX05FV19WRVJTSU9OX0FWQUlMQUJMRSxcbiAgVVBEQVRFU19ORVdfVkVSU0lPTl9OT1RfQVZBSUxBQkxFLFxuICBVUERBVEVTX1JFQURZLFxuICBVUERBVEVfU0tJUFBFRCxcbiAgVVBEQVRFU19DSEFOTkVMX0NIQU5HRUQsXG59IGZyb20gJy4vYWN0aW9ucyc7XG5cbnR5cGUgRG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXBBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBBQk9VVF9ESUFMT0dfVE9HR0xFX1VQREFURV9PTl9TVEFSVD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19SRUFEWT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBkb0NoZWNrRm9yVXBkYXRlc09uU3RhcnR1cDogUmVkdWNlcjxcbiAgYm9vbGVhbixcbiAgRG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXBBY3Rpb25cbj4gPSAoc3RhdGUgPSB0cnVlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgVVBEQVRFU19SRUFEWToge1xuICAgICAgY29uc3QgeyBkb0NoZWNrRm9yVXBkYXRlc09uU3RhcnR1cCB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXA7XG4gICAgfVxuXG4gICAgY2FzZSBBQk9VVF9ESUFMT0dfVE9HR0xFX1VQREFURV9PTl9TVEFSVDoge1xuICAgICAgY29uc3QgZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXAgPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBkb0NoZWNrRm9yVXBkYXRlc09uU3RhcnR1cDtcbiAgICB9XG5cbiAgICBjYXNlIEFQUF9TRVRUSU5HU19MT0FERUQ6IHtcbiAgICAgIGNvbnN0IHsgZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXAgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXA7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcblxudHlwZSBJc0NoZWNraW5nRm9yVXBkYXRlc0FjdGlvbiA9XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfQ0hFQ0tJTkdfRk9SX1VQREFURT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19FUlJPUl9USFJPV04+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX05FV19WRVJTSU9OX05PVF9BVkFJTEFCTEU+O1xuXG5leHBvcnQgY29uc3QgaXNDaGVja2luZ0ZvclVwZGF0ZXM6IFJlZHVjZXI8XG4gIGJvb2xlYW4sXG4gIElzQ2hlY2tpbmdGb3JVcGRhdGVzQWN0aW9uXG4+ID0gKHN0YXRlID0gZmFsc2UsIGFjdGlvbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBVUERBVEVTX0NIRUNLSU5HX0ZPUl9VUERBVEU6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGNhc2UgVVBEQVRFU19FUlJPUl9USFJPV046XG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBjYXNlIFVQREFURVNfTkVXX1ZFUlNJT05fTk9UX0FWQUlMQUJMRTpcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGNhc2UgVVBEQVRFU19ORVdfVkVSU0lPTl9BVkFJTEFCTEU6XG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG50eXBlIElzRWFjaFVwZGF0ZXNTZXR0aW5nQ29uZmlndXJhYmxlQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19SRUFEWT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD47XG5cbmV4cG9ydCBjb25zdCBpc0VhY2hVcGRhdGVzU2V0dGluZ0NvbmZpZ3VyYWJsZTogUmVkdWNlcjxcbiAgYm9vbGVhbixcbiAgSXNFYWNoVXBkYXRlc1NldHRpbmdDb25maWd1cmFibGVBY3Rpb25cbj4gPSAoc3RhdGUgPSB0cnVlLCBhY3Rpb24pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgVVBEQVRFU19SRUFEWToge1xuICAgICAgY29uc3QgeyBpc0VhY2hVcGRhdGVzU2V0dGluZ0NvbmZpZ3VyYWJsZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gaXNFYWNoVXBkYXRlc1NldHRpbmdDb25maWd1cmFibGU7XG4gICAgfVxuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IGlzRWFjaFVwZGF0ZXNTZXR0aW5nQ29uZmlndXJhYmxlID0gc3RhdGUgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIGlzRWFjaFVwZGF0ZXNTZXR0aW5nQ29uZmlndXJhYmxlO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG5cbnR5cGUgSXNVcGRhdGluZ0FsbG93ZWRBY3Rpb24gPSBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19SRUFEWT47XG5cbmV4cG9ydCBjb25zdCBpc1VwZGF0aW5nQWxsb3dlZDogUmVkdWNlcjxib29sZWFuLCBJc1VwZGF0aW5nQWxsb3dlZEFjdGlvbj4gPSAoXG4gIHN0YXRlID0gdHJ1ZSxcbiAgYWN0aW9uXG4pID0+IHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgVVBEQVRFU19SRUFEWToge1xuICAgICAgY29uc3QgeyBpc1VwZGF0aW5nQWxsb3dlZCB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gaXNVcGRhdGluZ0FsbG93ZWQ7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufTtcblxudHlwZSBJc1VwZGF0aW5nRW5hYmxlZEFjdGlvbiA9XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfUkVBRFk+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIEFQUF9TRVRUSU5HU19MT0FERUQ+O1xuXG5leHBvcnQgY29uc3QgaXNVcGRhdGluZ0VuYWJsZWQ6IFJlZHVjZXI8Ym9vbGVhbiwgSXNVcGRhdGluZ0VuYWJsZWRBY3Rpb24+ID0gKFxuICBzdGF0ZSA9IHRydWUsXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFVQREFURVNfUkVBRFk6IHtcbiAgICAgIGNvbnN0IHsgaXNVcGRhdGluZ0VuYWJsZWQgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIGlzVXBkYXRpbmdFbmFibGVkO1xuICAgIH1cblxuICAgIGNhc2UgQVBQX1NFVFRJTkdTX0xPQURFRDoge1xuICAgICAgY29uc3QgeyBpc1VwZGF0aW5nRW5hYmxlZCA9IHN0YXRlIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHJldHVybiBpc1VwZGF0aW5nRW5hYmxlZDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG50eXBlIE5ld1VwZGF0ZVZlcnNpb25BY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX05FV19WRVJTSU9OX0FWQUlMQUJMRT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19ORVdfVkVSU0lPTl9OT1RfQVZBSUxBQkxFPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVfU0tJUFBFRD47XG5cbmV4cG9ydCBjb25zdCBuZXdVcGRhdGVWZXJzaW9uOiBSZWR1Y2VyPFxuICBzdHJpbmcgfCBudWxsLFxuICBOZXdVcGRhdGVWZXJzaW9uQWN0aW9uXG4+ID0gKHN0YXRlID0gbnVsbCwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFOiB7XG4gICAgICBjb25zdCBuZXdVcGRhdGVWZXJzaW9uID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gbmV3VXBkYXRlVmVyc2lvbjtcbiAgICB9XG5cbiAgICBjYXNlIFVQREFURVNfTkVXX1ZFUlNJT05fTk9UX0FWQUlMQUJMRTpcbiAgICBjYXNlIFVQREFURV9TS0lQUEVEOiB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG50eXBlIFNraXBwZWRVcGRhdGVWZXJzaW9uQWN0aW9uID1cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19SRUFEWT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgQVBQX1NFVFRJTkdTX0xPQURFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFX1NLSVBQRUQ+O1xuXG5leHBvcnQgY29uc3Qgc2tpcHBlZFVwZGF0ZVZlcnNpb246IFJlZHVjZXI8XG4gIHN0cmluZyB8IG51bGwsXG4gIFNraXBwZWRVcGRhdGVWZXJzaW9uQWN0aW9uXG4+ID0gKHN0YXRlID0gbnVsbCwgYWN0aW9uKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFVQREFURVNfUkVBRFk6IHtcbiAgICAgIGNvbnN0IHsgc2tpcHBlZFVwZGF0ZVZlcnNpb24gfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHNraXBwZWRVcGRhdGVWZXJzaW9uO1xuICAgIH1cblxuICAgIGNhc2UgVVBEQVRFX1NLSVBQRUQ6IHtcbiAgICAgIGNvbnN0IHNraXBwZWRVcGRhdGVWZXJzaW9uID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gc2tpcHBlZFVwZGF0ZVZlcnNpb247XG4gICAgfVxuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IHNraXBwZWRVcGRhdGVWZXJzaW9uID0gc3RhdGUgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHNraXBwZWRVcGRhdGVWZXJzaW9uO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGU7XG4gIH1cbn07XG5cbnR5cGUgVXBkYXRlRXJyb3JBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX0NIRUNLSU5HX0ZPUl9VUERBVEU+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfRVJST1JfVEhST1dOPlxuICB8IEFjdGlvbk9mPHR5cGVvZiBVUERBVEVTX05FV19WRVJTSU9OX0FWQUlMQUJMRT5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19ORVdfVkVSU0lPTl9OT1RfQVZBSUxBQkxFPjtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUVycm9yOiBSZWR1Y2VyPEVycm9yIHwgbnVsbCwgVXBkYXRlRXJyb3JBY3Rpb24+ID0gKFxuICBzdGF0ZSA9IG51bGwsXG4gIGFjdGlvblxuKSA9PiB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFVQREFURVNfQ0hFQ0tJTkdfRk9SX1VQREFURTpcbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgY2FzZSBVUERBVEVTX0VSUk9SX1RIUk9XTjpcbiAgICAgIHJldHVybiBhY3Rpb24ucGF5bG9hZDtcblxuICAgIGNhc2UgVVBEQVRFU19ORVdfVkVSU0lPTl9OT1RfQVZBSUxBQkxFOlxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBjYXNlIFVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFOlxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuXG50eXBlIFVwZGF0ZUNoYW5uZWxBY3Rpb24gPVxuICB8IEFjdGlvbk9mPHR5cGVvZiBBQk9VVF9ESUFMT0dfVVBEQVRFX0NIQU5ORUxfQ0hBTkdFRD5cbiAgfCBBY3Rpb25PZjx0eXBlb2YgVVBEQVRFU19DSEFOTkVMX0NIQU5HRUQ+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIFVQREFURVNfUkVBRFk+XG4gIHwgQWN0aW9uT2Y8dHlwZW9mIEFQUF9TRVRUSU5HU19MT0FERUQ+O1xuXG5leHBvcnQgY29uc3QgdXBkYXRlQ2hhbm5lbDogUmVkdWNlcjxzdHJpbmcsIFVwZGF0ZUNoYW5uZWxBY3Rpb24+ID0gKFxuICBzdGF0ZSA9ICdsYXRlc3QnLFxuICBhY3Rpb25cbikgPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBBQk9VVF9ESUFMT0dfVVBEQVRFX0NIQU5ORUxfQ0hBTkdFRDpcbiAgICBjYXNlIFVQREFURVNfQ0hBTk5FTF9DSEFOR0VEOiB7XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG4gICAgfVxuXG4gICAgY2FzZSBVUERBVEVTX1JFQURZOiB7XG4gICAgICBjb25zdCB7IHVwZGF0ZUNoYW5uZWwgfSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgcmV0dXJuIHVwZGF0ZUNoYW5uZWw7XG4gICAgfVxuXG4gICAgY2FzZSBBUFBfU0VUVElOR1NfTE9BREVEOiB7XG4gICAgICBjb25zdCB7IHVwZGF0ZUNoYW5uZWwgPSBzdGF0ZSB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICByZXR1cm4gdXBkYXRlQ2hhbm5lbDtcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuICB9XG59O1xuIiwiaW1wb3J0IHsgY29tYmluZVJlZHVjZXJzIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgeyBhbGxvd2VkTlRMTUNyZWRlbnRpYWxzRG9tYWlucyB9IGZyb20gJy4uL2FwcC9yZWR1Y2Vycy9hbGxvd2VkTlRMTUNyZWRlbnRpYWxzRG9tYWlucyc7XG5pbXBvcnQgeyBhcHBQYXRoIH0gZnJvbSAnLi4vYXBwL3JlZHVjZXJzL2FwcFBhdGgnO1xuaW1wb3J0IHsgYXBwVmVyc2lvbiB9IGZyb20gJy4uL2FwcC9yZWR1Y2Vycy9hcHBWZXJzaW9uJztcbmltcG9ydCB7IG1hY2hpbmVUaGVtZSB9IGZyb20gJy4uL2FwcC9yZWR1Y2Vycy9tYWNoaW5lVGhlbWUnO1xuaW1wb3J0IHsgbWFpbldpbmRvd1RpdGxlIH0gZnJvbSAnLi4vYXBwL3JlZHVjZXJzL21haW5XaW5kb3dUaXRsZSc7XG5pbXBvcnQgeyBkb3dubG9hZHMgfSBmcm9tICcuLi9kb3dubG9hZHMvcmVkdWNlcnMvZG93bmxvYWRzJztcbmltcG9ydCB7IGFsbG93ZWRKaXRzaVNlcnZlcnMgfSBmcm9tICcuLi9qaXRzaS9yZWR1Y2Vycyc7XG5pbXBvcnQge1xuICBjbGllbnRDZXJ0aWZpY2F0ZXMsXG4gIGV4dGVybmFsUHJvdG9jb2xzLFxuICB0cnVzdGVkQ2VydGlmaWNhdGVzLFxuICBub3RUcnVzdGVkQ2VydGlmaWNhdGVzLFxufSBmcm9tICcuLi9uYXZpZ2F0aW9uL3JlZHVjZXJzJztcbmltcG9ydCB7IHNlcnZlcnMgfSBmcm9tICcuLi9zZXJ2ZXJzL3JlZHVjZXJzJztcbmltcG9ydCB7IGF2YWlsYWJsZUJyb3dzZXJzIH0gZnJvbSAnLi4vdWkvcmVkdWNlcnMvYXZhaWxhYmxlQnJvd3NlcnMnO1xuaW1wb3J0IHsgY3VycmVudFZpZXcgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9jdXJyZW50Vmlldyc7XG5pbXBvcnQgeyBoYXNIaWRlT25UcmF5Tm90aWZpY2F0aW9uU2hvd24gfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9oYXNIaWRlT25UcmF5Tm90aWZpY2F0aW9uU2hvd24nO1xuaW1wb3J0IHsgaXNBZGROZXdTZXJ2ZXJzRW5hYmxlZCB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL2lzQWRkTmV3U2VydmVyc0VuYWJsZWQnO1xuaW1wb3J0IHsgaXNEZXZlbG9wZXJNb2RlRW5hYmxlZCB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL2lzRGV2ZWxvcGVyTW9kZUVuYWJsZWQnO1xuaW1wb3J0IHsgaXNGbGFzaEZyYW1lRW5hYmxlZCB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL2lzRmxhc2hGcmFtZUVuYWJsZWQnO1xuaW1wb3J0IHsgaXNIYXJkd2FyZUFjY2VsZXJhdGlvbkVuYWJsZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc0hhcmR3YXJlQWNjZWxlcmF0aW9uRW5hYmxlZCc7XG5pbXBvcnQgeyBpc0ludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZCB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL2lzSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkJztcbmltcG9ydCB7IGlzTWVudUJhckVuYWJsZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc01lbnVCYXJFbmFibGVkJztcbmltcG9ydCB7IGlzTWVzc2FnZUJveEZvY3VzZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc01lc3NhZ2VCb3hGb2N1c2VkJztcbmltcG9ydCB7IGlzTWluaW1pemVPbkNsb3NlRW5hYmxlZCB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL2lzTWluaW1pemVPbkNsb3NlRW5hYmxlZCc7XG5pbXBvcnQgeyBpc05UTE1DcmVkZW50aWFsc0VuYWJsZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc05UTE1DcmVkZW50aWFsc0VuYWJsZWQnO1xuaW1wb3J0IHsgaXNSZXBvcnRFbmFibGVkIH0gZnJvbSAnLi4vdWkvcmVkdWNlcnMvaXNSZXBvcnRFbmFibGVkJztcbmltcG9ydCB7IGlzU2hvd1dpbmRvd09uVW5yZWFkQ2hhbmdlZEVuYWJsZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc1Nob3dXaW5kb3dPblVucmVhZENoYW5nZWRFbmFibGVkJztcbmltcG9ydCB7IGlzU2lkZUJhckVuYWJsZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc1NpZGVCYXJFbmFibGVkJztcbmltcG9ydCB7IGlzVHJheUljb25FbmFibGVkIH0gZnJvbSAnLi4vdWkvcmVkdWNlcnMvaXNUcmF5SWNvbkVuYWJsZWQnO1xuaW1wb3J0IHsgaXNWaWRlb0NhbGxEZXZ0b29sc0F1dG9PcGVuRW5hYmxlZCB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL2lzVmlkZW9DYWxsRGV2dG9vbHNBdXRvT3BlbkVuYWJsZWQnO1xuaW1wb3J0IHsgaXNWaWRlb0NhbGxXaW5kb3dQZXJzaXN0ZW5jZUVuYWJsZWQgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9pc1ZpZGVvQ2FsbFdpbmRvd1BlcnNpc3RlbmNlRW5hYmxlZCc7XG5pbXBvcnQgeyBsYXN0U2VsZWN0ZWRTZXJ2ZXJVcmwgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9sYXN0U2VsZWN0ZWRTZXJ2ZXJVcmwnO1xuaW1wb3J0IHsgb3BlbkRpYWxvZyB9IGZyb20gJy4uL3VpL3JlZHVjZXJzL29wZW5EaWFsb2cnO1xuaW1wb3J0IHsgcm9vdFdpbmRvd0ljb24gfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9yb290V2luZG93SWNvbic7XG5pbXBvcnQgeyByb290V2luZG93U3RhdGUgfSBmcm9tICcuLi91aS9yZWR1Y2Vycy9yb290V2luZG93U3RhdGUnO1xuaW1wb3J0IHsgc2VsZWN0ZWRCcm93c2VyIH0gZnJvbSAnLi4vdWkvcmVkdWNlcnMvc2VsZWN0ZWRCcm93c2VyJztcbmltcG9ydCB7IHZpZGVvQ2FsbFdpbmRvd1N0YXRlIH0gZnJvbSAnLi4vdWkvcmVkdWNlcnMvdmlkZW9DYWxsV2luZG93U3RhdGUnO1xuaW1wb3J0IHtcbiAgZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXAsXG4gIGlzQ2hlY2tpbmdGb3JVcGRhdGVzLFxuICBpc0VhY2hVcGRhdGVzU2V0dGluZ0NvbmZpZ3VyYWJsZSxcbiAgaXNVcGRhdGluZ0FsbG93ZWQsXG4gIGlzVXBkYXRpbmdFbmFibGVkLFxuICBuZXdVcGRhdGVWZXJzaW9uLFxuICBza2lwcGVkVXBkYXRlVmVyc2lvbixcbiAgdXBkYXRlRXJyb3IsXG4gIHVwZGF0ZUNoYW5uZWwsXG59IGZyb20gJy4uL3VwZGF0ZXMvcmVkdWNlcnMnO1xuXG5leHBvcnQgY29uc3Qgcm9vdFJlZHVjZXIgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBhbGxvd2VkSml0c2lTZXJ2ZXJzLFxuICBhcHBQYXRoLFxuICBhcHBWZXJzaW9uLFxuICBhdmFpbGFibGVCcm93c2VycyxcbiAgY2xpZW50Q2VydGlmaWNhdGVzLFxuICBjdXJyZW50VmlldyxcbiAgZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXAsXG4gIGRvd25sb2FkcyxcbiAgZXh0ZXJuYWxQcm90b2NvbHMsXG4gIGlzQ2hlY2tpbmdGb3JVcGRhdGVzLFxuICBpc0VhY2hVcGRhdGVzU2V0dGluZ0NvbmZpZ3VyYWJsZSxcbiAgaXNNZW51QmFyRW5hYmxlZCxcbiAgaXNNZXNzYWdlQm94Rm9jdXNlZCxcbiAgaXNTaG93V2luZG93T25VbnJlYWRDaGFuZ2VkRW5hYmxlZCxcbiAgaXNTaWRlQmFyRW5hYmxlZCxcbiAgaXNUcmF5SWNvbkVuYWJsZWQsXG4gIGlzTWluaW1pemVPbkNsb3NlRW5hYmxlZCxcbiAgaXNVcGRhdGluZ0FsbG93ZWQsXG4gIGlzVXBkYXRpbmdFbmFibGVkLFxuICBtYWluV2luZG93VGl0bGUsXG4gIG1hY2hpbmVUaGVtZSxcbiAgbmV3VXBkYXRlVmVyc2lvbixcbiAgb3BlbkRpYWxvZyxcbiAgcm9vdFdpbmRvd0ljb24sXG4gIHJvb3RXaW5kb3dTdGF0ZSxcbiAgc2VsZWN0ZWRCcm93c2VyLFxuICBzZXJ2ZXJzLFxuICBza2lwcGVkVXBkYXRlVmVyc2lvbixcbiAgdHJ1c3RlZENlcnRpZmljYXRlcyxcbiAgbm90VHJ1c3RlZENlcnRpZmljYXRlcyxcbiAgdXBkYXRlRXJyb3IsXG4gIGlzUmVwb3J0RW5hYmxlZCxcbiAgaXNGbGFzaEZyYW1lRW5hYmxlZCxcbiAgaXNIYXJkd2FyZUFjY2VsZXJhdGlvbkVuYWJsZWQsXG4gIGlzSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkLFxuICBpc0FkZE5ld1NlcnZlcnNFbmFibGVkLFxuICBoYXNIaWRlT25UcmF5Tm90aWZpY2F0aW9uU2hvd24sXG4gIGxhc3RTZWxlY3RlZFNlcnZlclVybCxcbiAgYWxsb3dlZE5UTE1DcmVkZW50aWFsc0RvbWFpbnMsXG4gIGlzTlRMTUNyZWRlbnRpYWxzRW5hYmxlZCxcbiAgdmlkZW9DYWxsV2luZG93U3RhdGUsXG4gIGlzVmlkZW9DYWxsV2luZG93UGVyc2lzdGVuY2VFbmFibGVkLFxuICBpc0RldmVsb3Blck1vZGVFbmFibGVkLFxuICB1cGRhdGVDaGFubmVsLFxuICBpc1ZpZGVvQ2FsbERldnRvb2xzQXV0b09wZW5FbmFibGVkLFxufSk7XG5cbmV4cG9ydCB0eXBlIFJvb3RTdGF0ZSA9IFJldHVyblR5cGU8dHlwZW9mIHJvb3RSZWR1Y2VyPjtcbiIsImltcG9ydCB0eXBlIHsgU3RvcmUsIE1pZGRsZXdhcmUgfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgeyBhcHBseU1pZGRsZXdhcmUsIGNyZWF0ZVN0b3JlLCBjb21wb3NlIH0gZnJvbSAncmVkdXgnO1xuXG5pbXBvcnQgdHlwZSB7IFJvb3RBY3Rpb24gfSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHsgaGFzUGF5bG9hZCwgaXNFcnJvcmVkLCBpc1Jlc3BvbnNlVG8gfSBmcm9tICcuL2ZzYSc7XG5pbXBvcnQgeyBmb3J3YXJkVG9SZW5kZXJlcnMsIGdldEluaXRpYWxTdGF0ZSwgZm9yd2FyZFRvTWFpbiB9IGZyb20gJy4vaXBjJztcbmltcG9ydCB0eXBlIHsgUm9vdFN0YXRlIH0gZnJvbSAnLi9yb290UmVkdWNlcic7XG5pbXBvcnQgeyByb290UmVkdWNlciB9IGZyb20gJy4vcm9vdFJlZHVjZXInO1xuXG5sZXQgcmVkdXhTdG9yZTogU3RvcmU8Um9vdFN0YXRlPjtcblxubGV0IGxhc3RBY3Rpb246IFJvb3RBY3Rpb247XG5cbmNvbnN0IGNhdGNoTGFzdEFjdGlvbjogTWlkZGxld2FyZSA9ICgpID0+IChuZXh0KSA9PiAoYWN0aW9uOiB1bmtub3duKSA9PiB7XG4gIGxhc3RBY3Rpb24gPSBhY3Rpb24gYXMgUm9vdEFjdGlvbjtcbiAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYWluUmVkdXhTdG9yZSA9ICgpOiB2b2lkID0+IHtcbiAgY29uc3QgbWlkZGxld2FyZXMgPSBhcHBseU1pZGRsZXdhcmUoY2F0Y2hMYXN0QWN0aW9uLCBmb3J3YXJkVG9SZW5kZXJlcnMpO1xuXG4gIHJlZHV4U3RvcmUgPSBjcmVhdGVTdG9yZShyb290UmVkdWNlciwge30sIG1pZGRsZXdhcmVzKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZW5kZXJlclJlZHV4U3RvcmUgPSBhc3luYyAoKTogUHJvbWlzZTxTdG9yZT4gPT4ge1xuICBjb25zdCBpbml0aWFsU3RhdGUgPSBhd2FpdCBnZXRJbml0aWFsU3RhdGUoKTtcbiAgY29uc3QgY29tcG9zZUVuaGFuY2VyczogdHlwZW9mIGNvbXBvc2UgPVxuICAgICh3aW5kb3cgYXMgYW55KS5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9DT01QT1NFX18gfHwgY29tcG9zZTtcbiAgY29uc3QgZW5oYW5jZXJzID0gY29tcG9zZUVuaGFuY2VycyhcbiAgICBhcHBseU1pZGRsZXdhcmUoZm9yd2FyZFRvTWFpbiwgY2F0Y2hMYXN0QWN0aW9uKVxuICApO1xuXG4gIHJlZHV4U3RvcmUgPSBjcmVhdGVTdG9yZShyb290UmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcnMpO1xuXG4gIHJldHVybiByZWR1eFN0b3JlO1xufTtcblxuZXhwb3J0IGNvbnN0IGRpc3BhdGNoID0gPEFjdGlvbiBleHRlbmRzIFJvb3RBY3Rpb24+KGFjdGlvbjogQWN0aW9uKTogdm9pZCA9PiB7XG4gIHJlZHV4U3RvcmUuZGlzcGF0Y2goYWN0aW9uKTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwYXRjaFNpbmdsZSA9IDxBY3Rpb24gZXh0ZW5kcyBSb290QWN0aW9uPihcbiAgYWN0aW9uOiBBY3Rpb25cbik6IHZvaWQgPT4ge1xuICByZWR1eFN0b3JlLmRpc3BhdGNoKHtcbiAgICAuLi5hY3Rpb24sXG4gICAgaXBjTWV0YTogeyAuLi5hY3Rpb24uaXBjTWV0YSwgc2NvcGU6ICdzaW5nbGUnIH0sXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGRpc3BhdGNoTG9jYWwgPSA8QWN0aW9uIGV4dGVuZHMgUm9vdEFjdGlvbj4oXG4gIGFjdGlvbjogQWN0aW9uXG4pOiB2b2lkID0+IHtcbiAgcmVkdXhTdG9yZS5kaXNwYXRjaCh7XG4gICAgLi4uYWN0aW9uLFxuICAgIGlwY01ldGE6IHsgLi4uYWN0aW9uLmlwY01ldGEsIHNjb3BlOiAnbG9jYWwnIH0sXG4gICAgbWV0YTogeyBzY29wZTogJ2xvY2FsJyB9LFxuICB9KTtcbn07XG5cbnR5cGUgU2VsZWN0b3I8VD4gPSAoc3RhdGU6IFJvb3RTdGF0ZSkgPT4gVDtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdCA9IDxUPihzZWxlY3RvcjogU2VsZWN0b3I8VD4pOiBUID0+XG4gIHNlbGVjdG9yKHJlZHV4U3RvcmUuZ2V0U3RhdGUoKSk7XG5cbmV4cG9ydCBjb25zdCB3YXRjaCA9IDxUPihcbiAgc2VsZWN0b3I6IFNlbGVjdG9yPFQ+LFxuICB3YXRjaGVyOiAoY3VycjogVCwgcHJldjogVCB8IHVuZGVmaW5lZCkgPT4gdm9pZFxuKTogKCgpID0+IHZvaWQpID0+IHtcbiAgY29uc3QgaW5pdGlhbCA9IHNlbGVjdChzZWxlY3Rvcik7XG4gIHdhdGNoZXIoaW5pdGlhbCwgdW5kZWZpbmVkKTtcblxuICBsZXQgcHJldiA9IGluaXRpYWw7XG5cbiAgcmV0dXJuIHJlZHV4U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICBjb25zdCBjdXJyOiBUID0gc2VsZWN0KHNlbGVjdG9yKTtcblxuICAgIGlmIChPYmplY3QuaXMocHJldiwgY3VycikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3YXRjaGVyKGN1cnIsIHByZXYpO1xuXG4gICAgcHJldiA9IGN1cnI7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGxpc3Rlbjoge1xuICA8QWN0aW9uVHlwZSBleHRlbmRzIFJvb3RBY3Rpb25bJ3R5cGUnXT4oXG4gICAgdHlwZTogQWN0aW9uVHlwZSxcbiAgICBsaXN0ZW5lcjogKGFjdGlvbjogRXh0cmFjdDxSb290QWN0aW9uLCB7IHR5cGU6IEFjdGlvblR5cGUgfT4pID0+IHZvaWRcbiAgKTogKCkgPT4gdm9pZDtcbiAgPEFjdGlvbiBleHRlbmRzIFJvb3RBY3Rpb24+KFxuICAgIHByZWRpY2F0ZTogKGFjdGlvbjogUm9vdEFjdGlvbikgPT4gYWN0aW9uIGlzIEFjdGlvbixcbiAgICBsaXN0ZW5lcjogKGFjdGlvbjogQWN0aW9uKSA9PiB2b2lkXG4gICk6ICgpID0+IHZvaWQ7XG59ID0gPEFjdGlvblR5cGUgZXh0ZW5kcyBSb290QWN0aW9uWyd0eXBlJ10sIEFjdGlvbiBleHRlbmRzIFJvb3RBY3Rpb24+KFxuICB0eXBlT3JQcmVkaWNhdGU6IEFjdGlvblR5cGUgfCAoKGFjdGlvbjogUm9vdEFjdGlvbikgPT4gYWN0aW9uIGlzIEFjdGlvbiksXG4gIGxpc3RlbmVyOiAoYWN0aW9uOiBSb290QWN0aW9uKSA9PiB2b2lkXG4pOiAoKCkgPT4gdm9pZCkgPT4ge1xuICBjb25zdCBlZmZlY3RpdmVQcmVkaWNhdGUgPVxuICAgIHR5cGVvZiB0eXBlT3JQcmVkaWNhdGUgPT09ICdmdW5jdGlvbidcbiAgICAgID8gdHlwZU9yUHJlZGljYXRlXG4gICAgICA6IChhY3Rpb246IFJvb3RBY3Rpb24pOiBhY3Rpb24gaXMgQWN0aW9uID0+XG4gICAgICAgICAgYWN0aW9uLnR5cGUgPT09IHR5cGVPclByZWRpY2F0ZTtcblxuICByZXR1cm4gcmVkdXhTdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgIGlmICghZWZmZWN0aXZlUHJlZGljYXRlKGxhc3RBY3Rpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGlzdGVuZXIobGFzdEFjdGlvbik7XG4gIH0pO1xufTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcnZpY2Uge1xuICBwcml2YXRlIHVuc3Vic2NyaWJlcnMgPSBuZXcgU2V0PCgpID0+IHZvaWQ+KCk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1mdW5jdGlvblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpOiB2b2lkIHt9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1mdW5jdGlvblxuICBwcm90ZWN0ZWQgZGVzdHJveSgpOiB2b2lkIHt9XG5cbiAgcHJvdGVjdGVkIHdhdGNoPFQ+KFxuICAgIHNlbGVjdG9yOiBTZWxlY3RvcjxUPixcbiAgICB3YXRjaGVyOiAoY3VycjogVCwgcHJldjogVCB8IHVuZGVmaW5lZCkgPT4gdm9pZFxuICApOiB2b2lkIHtcbiAgICB0aGlzLnVuc3Vic2NyaWJlcnMuYWRkKHdhdGNoKHNlbGVjdG9yLCB3YXRjaGVyKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgbGlzdGVuPEFjdGlvblR5cGUgZXh0ZW5kcyBSb290QWN0aW9uWyd0eXBlJ10+KFxuICAgIHR5cGU6IEFjdGlvblR5cGUsXG4gICAgbGlzdGVuZXI6IChhY3Rpb246IEV4dHJhY3Q8Um9vdEFjdGlvbiwgeyB0eXBlOiBBY3Rpb25UeXBlIH0+KSA9PiB2b2lkXG4gICk6IHZvaWQ7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWR1cGUtY2xhc3MtbWVtYmVyc1xuICBwcm90ZWN0ZWQgbGlzdGVuPEFjdGlvbiBleHRlbmRzIFJvb3RBY3Rpb24+KFxuICAgIHByZWRpY2F0ZTogKGFjdGlvbjogUm9vdEFjdGlvbikgPT4gYWN0aW9uIGlzIEFjdGlvbixcbiAgICBsaXN0ZW5lcjogKGFjdGlvbjogQWN0aW9uKSA9PiB2b2lkXG4gICk6IHZvaWQ7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWR1cGUtY2xhc3MtbWVtYmVyc1xuICBwcm90ZWN0ZWQgbGlzdGVuPFxuICAgIEFjdGlvblR5cGUgZXh0ZW5kcyBSb290QWN0aW9uWyd0eXBlJ10sXG4gICAgQWN0aW9uIGV4dGVuZHMgUm9vdEFjdGlvbixcbiAgPihcbiAgICB0eXBlT3JQcmVkaWNhdGU6IEFjdGlvblR5cGUgfCAoKGFjdGlvbjogUm9vdEFjdGlvbikgPT4gYWN0aW9uIGlzIEFjdGlvbiksXG4gICAgbGlzdGVuZXI6IChhY3Rpb246IFJvb3RBY3Rpb24pID0+IHZvaWRcbiAgKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiB0eXBlT3JQcmVkaWNhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlcnMuYWRkKGxpc3Rlbih0eXBlT3JQcmVkaWNhdGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy51bnN1YnNjcmliZXJzLmFkZChsaXN0ZW4odHlwZU9yUHJlZGljYXRlLCBsaXN0ZW5lcikpO1xuICB9XG5cbiAgcHVibGljIHNldFVwKCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgcHVibGljIHRlYXJEb3duKCk6IHZvaWQge1xuICAgIHRoaXMudW5zdWJzY3JpYmVycy5mb3JFYWNoKCh1bnN1YnNjcmliZSkgPT4gdW5zdWJzY3JpYmUoKSk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gY29uc3QgaXNSZXNwb25zZVRvID0gPFJlc3BvbnNlIGV4dGVuZHMgUm9vdEFjdGlvbj4oaWQ6IHVua25vd24sIHR5cGU6IFJlc3BvbnNlWyd0eXBlJ10pID0+XG4vLyAgIChhY3Rpb246IFJvb3RBY3Rpb24pOiBhY3Rpb24gaXMgUmVzcG9uc2UgPT5cbi8vICAgICBpc1Jlc3BvbnNlKGFjdGlvbikgJiYgYWN0aW9uLnR5cGUgPT09IHR5cGUgJiYgYWN0aW9uLm1ldGEuaWQgPT09IGlkO1xuXG5leHBvcnQgY29uc3QgcmVxdWVzdCA9IDxcbiAgUmVxdWVzdCBleHRlbmRzIFJvb3RBY3Rpb24sXG4gIFJlc3BvbnNlVHlwZXMgZXh0ZW5kcyBbLi4uUm9vdEFjdGlvblsndHlwZSddW11dLFxuICBSZXNwb25zZSBleHRlbmRzIHtcbiAgICBbSW5kZXggaW4ga2V5b2YgUmVzcG9uc2VUeXBlc106IEV4dHJhY3Q8XG4gICAgICBSb290QWN0aW9uLFxuICAgICAgeyB0eXBlOiBSZXNwb25zZVR5cGVzW0luZGV4XTsgcGF5bG9hZDogdW5rbm93biB9XG4gICAgPjtcbiAgfVtudW1iZXJdLFxuPihcbiAgcmVxdWVzdEFjdGlvbjogUmVxdWVzdCxcbiAgLi4udHlwZXM6IFJlc3BvbnNlVHlwZXNcbik6IFByb21pc2U8UmVzcG9uc2VbJ3BheWxvYWQnXT4gPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XG5cbiAgICBjb25zdCB1bnN1YnNjcmliZSA9IGxpc3RlbihcbiAgICAgIGlzUmVzcG9uc2VUbzxSb290QWN0aW9uLCBSZXNwb25zZVR5cGVzPihpZCwgLi4udHlwZXMpLFxuICAgICAgKGFjdGlvbikgPT4ge1xuICAgICAgICB1bnN1YnNjcmliZSgpO1xuXG4gICAgICAgIGlmIChpc0Vycm9yZWQoYWN0aW9uKSkge1xuICAgICAgICAgIHJlamVjdChhY3Rpb24ucGF5bG9hZCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc1BheWxvYWQ8Um9vdEFjdGlvbj4oYWN0aW9uKSkge1xuICAgICAgICAgIHJlc29sdmUoYWN0aW9uLnBheWxvYWQgYXMgUmVzcG9uc2VbJ3BheWxvYWQnXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgZGlzcGF0Y2goe1xuICAgICAgLi4ucmVxdWVzdEFjdGlvbixcbiAgICAgIG1ldGE6IHtcbiAgICAgICAgcmVxdWVzdDogdHJ1ZSxcbiAgICAgICAgaWQsXG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbiIsImltcG9ydCB0eXBlIHsgRXh0ZW5kZWROb3RpZmljYXRpb25PcHRpb25zIH0gZnJvbSAnLi9jb21tb24nO1xuXG5leHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19DUkVBVEVfUkVRVUVTVEVEID0gJ25vdGlmaWNhdGlvbnMvY3JlYXRlLXJlcXVlc3RlZCc7XG5leHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19DUkVBVEVfUkVTUE9OREVEID0gJ25vdGlmaWNhdGlvbnMvY3JlYXRlLXJlc3BvbmRlZCc7XG5leHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fQUNUSU9ORUQgPVxuICAnbm90aWZpY2F0aW9ucy9ub3RpZmljYXRpb24tYWN0aW9uZWQnO1xuZXhwb3J0IGNvbnN0IE5PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0NMSUNLRUQgPVxuICAnbm90aWZpY2F0aW9ucy9ub3RpZmljYXRpb24tY2xpY2tlZCc7XG5leHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fQ0xPU0VEID1cbiAgJ25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uLWNsb3NlZCc7XG5leHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fRElTTUlTU0VEID1cbiAgJ25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uLWRpc21pc3NlZCc7XG5leHBvcnQgY29uc3QgTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fUkVQTElFRCA9XG4gICdub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbi1yZXBsaWVkJztcbmV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9TSE9XTiA9XG4gICdub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbi1zaG93bic7XG5cbmV4cG9ydCB0eXBlIE5vdGlmaWNhdGlvbnNBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbTk9USUZJQ0FUSU9OU19DUkVBVEVfUkVRVUVTVEVEXTogRXh0ZW5kZWROb3RpZmljYXRpb25PcHRpb25zO1xuICBbTk9USUZJQ0FUSU9OU19DUkVBVEVfUkVTUE9OREVEXTogdW5rbm93bjtcbiAgW05PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0FDVElPTkVEXTogeyBpZDogdW5rbm93bjsgaW5kZXg6IG51bWJlciB9O1xuICBbTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fQ0xJQ0tFRF06IHsgaWQ6IHVua25vd247IHRpdGxlOiBzdHJpbmcgfTtcbiAgW05PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0NMT1NFRF06IHsgaWQ6IHVua25vd24gfTtcbiAgW05PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0RJU01JU1NFRF06IHsgaWQ6IHVua25vd24gfTtcbiAgW05PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX1JFUExJRURdOiB7IGlkOiB1bmtub3duOyByZXBseTogc3RyaW5nIH07XG4gIFtOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9TSE9XTl06IHsgaWQ6IHVua25vd24gfTtcbn07XG4iLCJpbXBvcnQgeyBnZXRTZXJ2ZXJVcmwsIGdldEFic29sdXRlVXJsIH0gZnJvbSAnLi4vc2VydmVycy9wcmVsb2FkL3VybHMnO1xuaW1wb3J0IHsgZGlzcGF0Y2gsIGxpc3RlbiwgcmVxdWVzdCB9IGZyb20gJy4uL3N0b3JlJztcbmltcG9ydCB7IFdFQlZJRVdfRk9DVVNfUkVRVUVTVEVEIH0gZnJvbSAnLi4vdWkvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBOT1RJRklDQVRJT05TX0NSRUFURV9SRVFVRVNURUQsXG4gIE5PVElGSUNBVElPTlNfQ1JFQVRFX1JFU1BPTkRFRCxcbiAgTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fQUNUSU9ORUQsXG4gIE5PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0NMSUNLRUQsXG4gIE5PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0NMT1NFRCxcbiAgTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fRElTTUlTU0VELFxuICBOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9SRVBMSUVELFxuICBOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9TSE9XTixcbn0gZnJvbSAnLi9hY3Rpb25zJztcblxuY29uc3Qgbm9ybWFsaXplSWNvblVybCA9IChpY29uVXJsOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBpZiAoL15kYXRhOi8udGVzdChpY29uVXJsKSkge1xuICAgIHJldHVybiBpY29uVXJsO1xuICB9XG5cbiAgaWYgKCEvXmh0dHBzPzpcXC9cXC8vLnRlc3QoaWNvblVybCkpIHtcbiAgICByZXR1cm4gZ2V0QWJzb2x1dGVVcmwoaWNvblVybCk7XG4gIH1cblxuICByZXR1cm4gaWNvblVybDtcbn07XG5cbmNvbnN0IGV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwPFxuICB1bmtub3duLFxuICAoZXZlbnREZXNjcmlwdG9yOiB7IHR5cGU6IHN0cmluZzsgZGV0YWlsPzogdW5rbm93biB9KSA9PiB2b2lkXG4+KCk7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSBhc3luYyAoe1xuICB0aXRsZSxcbiAgaWNvbixcbiAgb25FdmVudCxcbiAgLi4ub3B0aW9uc1xufTogTm90aWZpY2F0aW9uT3B0aW9ucyAmIHtcbiAgY2FuUmVwbHk/OiBib29sZWFuO1xuICB0aXRsZTogc3RyaW5nO1xuICBzdWJ0aXRsZT86IHN0cmluZztcbiAgb25FdmVudD86IChldmVudERlc2NyaXB0b3I6IHsgdHlwZTogc3RyaW5nOyBkZXRhaWw6IHVua25vd24gfSkgPT4gdm9pZDtcbn0pOiBQcm9taXNlPHVua25vd24+ID0+IHtcbiAgY29uc3QgaWQgPSBhd2FpdCByZXF1ZXN0KFxuICAgIHtcbiAgICAgIHR5cGU6IE5PVElGSUNBVElPTlNfQ1JFQVRFX1JFUVVFU1RFRCxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIC4uLihpY29uXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGljb246IG5vcm1hbGl6ZUljb25VcmwoaWNvbiksXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7fSksXG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICB9LFxuICAgIH0sXG4gICAgTk9USUZJQ0FUSU9OU19DUkVBVEVfUkVTUE9OREVEXG4gICk7XG5cbiAgZXZlbnRIYW5kbGVycy5zZXQoaWQsIChldmVudCkgPT5cbiAgICBvbkV2ZW50Py4oeyB0eXBlOiBldmVudC50eXBlLCBkZXRhaWw6IGV2ZW50LmRldGFpbCB9KVxuICApO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydCBjb25zdCBkZXN0cm95Tm90aWZpY2F0aW9uID0gKGlkOiB1bmtub3duKTogdm9pZCA9PiB7XG4gIGRpc3BhdGNoKHsgdHlwZTogTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fRElTTUlTU0VELCBwYXlsb2FkOiB7IGlkIH0gfSk7XG4gIGV2ZW50SGFuZGxlcnMuZGVsZXRlKGlkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBsaXN0ZW5Ub05vdGlmaWNhdGlvbnNSZXF1ZXN0cyA9ICgpOiB2b2lkID0+IHtcbiAgbGlzdGVuKE5PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX1NIT1dOLCAoYWN0aW9uKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgcGF5bG9hZDogeyBpZCB9LFxuICAgIH0gPSBhY3Rpb247XG4gICAgY29uc3QgZXZlbnRIYW5kbGVyID0gZXZlbnRIYW5kbGVycy5nZXQoaWQpO1xuICAgIGV2ZW50SGFuZGxlcj8uKHsgdHlwZTogJ3Nob3cnIH0pO1xuICB9KTtcblxuICBsaXN0ZW4oTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fQ0xPU0VELCAoYWN0aW9uKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgcGF5bG9hZDogeyBpZCB9LFxuICAgIH0gPSBhY3Rpb247XG4gICAgY29uc3QgZXZlbnRIYW5kbGVyID0gZXZlbnRIYW5kbGVycy5nZXQoaWQpO1xuICAgIGV2ZW50SGFuZGxlcj8uKHsgdHlwZTogJ2Nsb3NlJyB9KTtcbiAgICBldmVudEhhbmRsZXJzLmRlbGV0ZShpZCk7XG4gIH0pO1xuXG4gIGxpc3RlbihOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9DTElDS0VELCAoYWN0aW9uKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgcGF5bG9hZDogeyBpZCwgdGl0bGUgfSxcbiAgICB9ID0gYWN0aW9uO1xuXG4gICAgZGlzcGF0Y2goe1xuICAgICAgdHlwZTogV0VCVklFV19GT0NVU19SRVFVRVNURUQsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHVybDogZ2V0U2VydmVyVXJsKCksXG4gICAgICAgIHZpZXc6IHRpdGxlID09PSAnRG93bmxvYWRzJyA/ICdkb3dubG9hZHMnIDogJ3NlcnZlcicsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZXZlbnRIYW5kbGVyID0gZXZlbnRIYW5kbGVycy5nZXQoaWQpO1xuICAgIGV2ZW50SGFuZGxlcj8uKHsgdHlwZTogJ2NsaWNrJyB9KTtcbiAgfSk7XG5cbiAgbGlzdGVuKE5PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX1JFUExJRUQsIChhY3Rpb24pID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBwYXlsb2FkOiB7IGlkLCByZXBseSB9LFxuICAgIH0gPSBhY3Rpb247XG4gICAgY29uc3QgZXZlbnRIYW5kbGVyID0gZXZlbnRIYW5kbGVycy5nZXQoaWQpO1xuICAgIGV2ZW50SGFuZGxlcj8uKHsgdHlwZTogJ3JlcGx5JywgZGV0YWlsOiB7IHJlcGx5IH0gfSk7XG4gIH0pO1xuXG4gIGxpc3RlbihOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9BQ1RJT05FRCwgKGFjdGlvbikgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHBheWxvYWQ6IHsgaWQsIGluZGV4IH0sXG4gICAgfSA9IGFjdGlvbjtcbiAgICBjb25zdCBldmVudEhhbmRsZXIgPSBldmVudEhhbmRsZXJzLmdldChpZCk7XG4gICAgZXZlbnRIYW5kbGVyPy4oeyB0eXBlOiAnYWN0aW9uJywgZGV0YWlsOiB7IGluZGV4IH0gfSk7XG4gIH0pO1xufTtcbiIsImltcG9ydCB7IHJlcXVlc3QgfSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQge1xuICBXRUJWSUVXX1NDUkVFTl9TSEFSSU5HX1NPVVJDRV9SRVFVRVNURUQsXG4gIFdFQlZJRVdfU0NSRUVOX1NIQVJJTkdfU09VUkNFX1JFU1BPTkRFRCxcbn0gZnJvbSAnLi4vdWkvYWN0aW9ucyc7XG5cbmNvbnN0IGhhbmRsZUdldFNvdXJjZUlkRXZlbnQgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc291cmNlSWQgPSBhd2FpdCByZXF1ZXN0KFxuICAgICAge1xuICAgICAgICB0eXBlOiBXRUJWSUVXX1NDUkVFTl9TSEFSSU5HX1NPVVJDRV9SRVFVRVNURUQsXG4gICAgICB9LFxuICAgICAgV0VCVklFV19TQ1JFRU5fU0hBUklOR19TT1VSQ0VfUkVTUE9OREVEXG4gICAgKTtcbiAgICB3aW5kb3cudG9wPy5wb3N0TWVzc2FnZSh7IHNvdXJjZUlkIH0sICcqJyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgd2luZG93LnRvcD8ucG9zdE1lc3NhZ2UoeyBzb3VyY2VJZDogJ1Blcm1pc3Npb25EZW5pZWRFcnJvcicgfSwgJyonKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGxpc3RlblRvU2NyZWVuU2hhcmluZ1JlcXVlc3RzID0gKCk6IHZvaWQgPT4ge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZ2V0LXNvdXJjZUlkJywgaGFuZGxlR2V0U291cmNlSWRFdmVudCk7XG59O1xuIiwiaW1wb3J0IHsgaXBjUmVuZGVyZXIgfSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB0eXBlIHsgT3V0bG9va0V2ZW50c1Jlc3BvbnNlIH0gZnJvbSAnLi90eXBlJztcblxuZXhwb3J0IGNvbnN0IGdldE91dGxvb2tFdmVudHMgPSBhc3luYyAoXG4gIGRhdGU6IERhdGVcbik6IFByb21pc2U8T3V0bG9va0V2ZW50c1Jlc3BvbnNlPiA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaXBjUmVuZGVyZXIuaW52b2tlKFxuICAgICdvdXRsb29rLWNhbGVuZGFyL2dldC1ldmVudHMnLFxuICAgIGRhdGVcbiAgKTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldE91dGxvb2tFeGNoYW5nZVVybCA9ICh1cmw6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgaXBjUmVuZGVyZXIuaW52b2tlKCdvdXRsb29rLWNhbGVuZGFyL3NldC1leGNoYW5nZS11cmwnLCB1cmwsIHVzZXJJZCk7XG59O1xuXG5leHBvcnQgY29uc3QgaGFzT3V0bG9va0NyZWRlbnRpYWxzID0gYXN5bmMgKCk6IFByb21pc2U8Ym9vbGVhbj4gPT5cbiAgaXBjUmVuZGVyZXIuaW52b2tlKCdvdXRsb29rLWNhbGVuZGFyL2hhcy1jcmVkZW50aWFscycpO1xuXG5leHBvcnQgY29uc3QgY2xlYXJPdXRsb29rQ3JlZGVudGlhbHMgPSAoKTogdm9pZCA9PiB7XG4gIGlwY1JlbmRlcmVyLmludm9rZSgnb3V0bG9vay1jYWxlbmRhci9jbGVhci1jcmVkZW50aWFscycpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFVzZXJUb2tlbiA9ICh0b2tlbjogc3RyaW5nLCB1c2VySWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBpcGNSZW5kZXJlci5pbnZva2UoJ291dGxvb2stY2FsZW5kYXIvc2V0LXVzZXItdG9rZW4nLCB0b2tlbiwgdXNlcklkKTtcbn07XG4iLCJleHBvcnQgY29uc3QgU1lTVEVNX0xPQ0tJTkdfU0NSRUVOID0gJ3N5c3RlbS9sb2NraW5nLXNjcmVlbic7XG5leHBvcnQgY29uc3QgU1lTVEVNX1NVU1BFTkRJTkcgPSAnc3lzdGVtL3N1c3BlbmRpbmcnO1xuXG5leHBvcnQgdHlwZSBVc2VyUHJlc2VuY2VBY3Rpb25UeXBlVG9QYXlsb2FkTWFwID0ge1xuICBbU1lTVEVNX0xPQ0tJTkdfU0NSRUVOXTogdm9pZDtcbiAgW1NZU1RFTV9TVVNQRU5ESU5HXTogdm9pZDtcbn07XG4iLCJpbXBvcnQgeyBpbnZva2UgfSBmcm9tICcuLi9pcGMvcmVuZGVyZXInO1xuaW1wb3J0IHsgbGlzdGVuIH0gZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHR5cGUgeyBSb290QWN0aW9uIH0gZnJvbSAnLi4vc3RvcmUvYWN0aW9ucyc7XG5pbXBvcnQgeyBTWVNURU1fU1VTUEVORElORywgU1lTVEVNX0xPQ0tJTkdfU0NSRUVOIH0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgU3lzdGVtSWRsZVN0YXRlIH0gZnJvbSAnLi9jb21tb24nO1xuXG5sZXQgZGV0YWNoQ2FsbGJhY2tzOiAoKSA9PiB2b2lkO1xuXG5jb25zdCBhdHRhY2hDYWxsYmFja3MgPSAoe1xuICBpc0F1dG9Bd2F5RW5hYmxlZCxcbiAgaWRsZVRocmVzaG9sZCxcbiAgc2V0VXNlck9ubGluZSxcbn06IHtcbiAgaXNBdXRvQXdheUVuYWJsZWQ6IGJvb2xlYW47XG4gIGlkbGVUaHJlc2hvbGQ6IG51bWJlciB8IG51bGw7XG4gIHNldFVzZXJPbmxpbmU6IChvbmxpbmU6IGJvb2xlYW4pID0+IHZvaWQ7XG59KTogKCgpID0+IHZvaWQpID0+IHtcbiAgY29uc3QgdW5zdWJzY3JpYmVGcm9tUG93ZXJNb25pdG9yRXZlbnRzID0gbGlzdGVuKFxuICAgIChhY3Rpb24pOiBhY3Rpb24gaXMgUm9vdEFjdGlvbiA9PlxuICAgICAgW1NZU1RFTV9TVVNQRU5ESU5HLCBTWVNURU1fTE9DS0lOR19TQ1JFRU5dLmluY2x1ZGVzKGFjdGlvbi50eXBlKSxcbiAgICAoKSA9PiB7XG4gICAgICBpZiAoIWlzQXV0b0F3YXlFbmFibGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2V0VXNlck9ubGluZShmYWxzZSk7XG4gICAgfVxuICApO1xuXG4gIGxldCBwb2xsaW5nVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+O1xuICBsZXQgcHJldlN0YXRlOiBTeXN0ZW1JZGxlU3RhdGU7XG4gIGNvbnN0IHBvbGxTeXN0ZW1JZGxlU3RhdGUgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgaWYgKCFpc0F1dG9Bd2F5RW5hYmxlZCB8fCAhaWRsZVRocmVzaG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBvbGxpbmdUaW1lciA9IHNldFRpbWVvdXQocG9sbFN5c3RlbUlkbGVTdGF0ZSwgMjAwMCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IGF3YWl0IGludm9rZShcbiAgICAgICdwb3dlci1tb25pdG9yL2dldC1zeXN0ZW0taWRsZS1zdGF0ZScsXG4gICAgICBpZGxlVGhyZXNob2xkXG4gICAgKTtcblxuICAgIGlmIChwcmV2U3RhdGUgPT09IHN0YXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXNPbmxpbmUgPSBzdGF0ZSA9PT0gJ2FjdGl2ZScgfHwgc3RhdGUgPT09ICd1bmtub3duJztcbiAgICBzZXRVc2VyT25saW5lKGlzT25saW5lKTtcblxuICAgIHByZXZTdGF0ZSA9IHN0YXRlO1xuICB9O1xuXG4gIHBvbGxTeXN0ZW1JZGxlU3RhdGUoKTtcblxuICByZXR1cm4gKCk6IHZvaWQgPT4ge1xuICAgIHVuc3Vic2NyaWJlRnJvbVBvd2VyTW9uaXRvckV2ZW50cygpO1xuICAgIGNsZWFyVGltZW91dChwb2xsaW5nVGltZXIpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFVzZXJQcmVzZW5jZURldGVjdGlvbiA9IChvcHRpb25zOiB7XG4gIGlzQXV0b0F3YXlFbmFibGVkOiBib29sZWFuO1xuICBpZGxlVGhyZXNob2xkOiBudW1iZXIgfCBudWxsO1xuICBzZXRVc2VyT25saW5lOiAob25saW5lOiBib29sZWFuKSA9PiB2b2lkO1xufSk6IHZvaWQgPT4ge1xuICBkZXRhY2hDYWxsYmFja3M/LigpO1xuICBkZXRhY2hDYWxsYmFja3MgPSBhdHRhY2hDYWxsYmFja3Mob3B0aW9ucyk7XG59O1xuIiwiaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuLi8uLi9zdG9yZSc7XG5pbXBvcnQgeyBXRUJWSUVXX1VOUkVBRF9DSEFOR0VEIH0gZnJvbSAnLi4vLi4vdWkvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IFNlcnZlciB9IGZyb20gJy4uL2NvbW1vbic7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJVcmwgfSBmcm9tICcuL3VybHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0QmFkZ2UgPSAoYmFkZ2U6IFNlcnZlclsnYmFkZ2UnXSk6IHZvaWQgPT4ge1xuICBkaXNwYXRjaCh7XG4gICAgdHlwZTogV0VCVklFV19VTlJFQURfQ0hBTkdFRCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICB1cmw6IGdldFNlcnZlclVybCgpLFxuICAgICAgYmFkZ2UsXG4gICAgfSxcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgY2xpcGJvYXJkIH0gZnJvbSAnZWxlY3Ryb24nO1xuXG5leHBvcnQgY29uc3Qgd3JpdGVUZXh0VG9DbGlwYm9hcmQgPSAodGV4dDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG59O1xuIiwiaW1wb3J0IHsgaXBjUmVuZGVyZXIgfSBmcm9tICdlbGVjdHJvbic7XG5cbmV4cG9ydCBjb25zdCBvcGVuRG9jdW1lbnRWaWV3ZXIgPSAoXG4gIHVybDogc3RyaW5nLFxuICBmb3JtYXQ6IHN0cmluZyxcbiAgb3B0aW9uczogYW55XG4pOiB2b2lkID0+IHtcbiAgaXBjUmVuZGVyZXIuaW52b2tlKCdkb2N1bWVudC12aWV3ZXIvb3Blbi13aW5kb3cnLCB1cmwsIGZvcm1hdCwgb3B0aW9ucyk7XG59O1xuIiwiaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuLi8uLi9zdG9yZSc7XG5pbXBvcnQgeyBXRUJWSUVXX0ZBVklDT05fQ0hBTkdFRCB9IGZyb20gJy4uLy4uL3VpL2FjdGlvbnMnO1xuaW1wb3J0IHsgZ2V0QWJzb2x1dGVVcmwsIGdldFNlcnZlclVybCB9IGZyb20gJy4vdXJscyc7XG5cbmNvbnN0IEZBVklDT05fU0laRSA9IDEwMDtcblxubGV0IGltYWdlRWxlbWVudDogSFRNTEltYWdlRWxlbWVudDtcblxuY29uc3QgZ2V0SW1hZ2VFbGVtZW50ID0gKCk6IEhUTUxJbWFnZUVsZW1lbnQgPT4ge1xuICBpZiAoIWltYWdlRWxlbWVudCkge1xuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy53aWR0aCA9IEZBVklDT05fU0laRTtcbiAgICBjYW52YXMuaGVpZ2h0ID0gRkFWSUNPTl9TSVpFO1xuXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBpZiAoIWN0eCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgdG8gY3JlYXRlIGNhbnZhcyAyZCBjb250ZXh0Jyk7XG4gICAgfVxuXG4gICAgaW1hZ2VFbGVtZW50ID0gbmV3IEltYWdlKCk7XG5cbiAgICBjb25zdCBoYW5kbGVJbWFnZUxvYWRFdmVudCA9ICgpOiB2b2lkID0+IHtcbiAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgRkFWSUNPTl9TSVpFLCBGQVZJQ09OX1NJWkUpO1xuICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZUVsZW1lbnQsIDAsIDAsIEZBVklDT05fU0laRSwgRkFWSUNPTl9TSVpFKTtcblxuICAgICAgZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBXRUJWSUVXX0ZBVklDT05fQ0hBTkdFRCxcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIHVybDogZ2V0U2VydmVyVXJsKCksXG4gICAgICAgICAgZmF2aWNvbjogY2FudmFzLnRvRGF0YVVSTCgpLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGltYWdlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaGFuZGxlSW1hZ2VMb2FkRXZlbnQsIHtcbiAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gaW1hZ2VFbGVtZW50O1xufTtcblxuZXhwb3J0IGNvbnN0IHNldEZhdmljb24gPSAoZmF2aWNvblVybDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmICh0eXBlb2YgZmF2aWNvblVybCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBpbWFnZUVsZW1lbnQgPSBnZXRJbWFnZUVsZW1lbnQoKTtcbiAgaW1hZ2VFbGVtZW50LnNyYyA9IGdldEFic29sdXRlVXJsKGZhdmljb25VcmwpO1xufTtcbiIsImltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi4vLi4vc3RvcmUnO1xuaW1wb3J0IHsgV0VCVklFV19HSVRfQ09NTUlUX0hBU0hfQ0hFQ0sgfSBmcm9tICcuLi8uLi91aS9hY3Rpb25zJztcbmltcG9ydCB0eXBlIHsgU2VydmVyIH0gZnJvbSAnLi4vY29tbW9uJztcbmltcG9ydCB7IGdldFNlcnZlclVybCB9IGZyb20gJy4vdXJscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRHaXRDb21taXRIYXNoID0gKFxuICBnaXRDb21taXRIYXNoOiBTZXJ2ZXJbJ2dpdENvbW1pdEhhc2gnXVxuKTogdm9pZCA9PiB7XG4gIGNvbnNvbGUubG9nKCdzZXRHaXRDb21taXRIYXNoJywgZ2l0Q29tbWl0SGFzaCk7XG4gIGRpc3BhdGNoKHtcbiAgICB0eXBlOiBXRUJWSUVXX0dJVF9DT01NSVRfSEFTSF9DSEVDSyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICB1cmw6IGdldFNlcnZlclVybCgpLFxuICAgICAgZ2l0Q29tbWl0SGFzaCxcbiAgICB9LFxuICB9KTtcbn07XG4iLCJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IGFwcCB9IGZyb20gJ2VsZWN0cm9uJztcblxuZXhwb3J0IGNvbnN0IHJlYWRTZXR0aW5nID0gKGtleTogc3RyaW5nKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyksICdjb25maWcuanNvbicpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoY29udGVudCk7XG5cbiAgICByZXR1cm4ganNvbltrZXldO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBnZXRBdmFpbGFibGVCcm93c2VycywgbGF1bmNoQnJvd3NlciB9IGZyb20gJ2RldGVjdC1icm93c2Vycyc7XG5pbXBvcnQgdHlwZSB7IEJyb3dzZXIgfSBmcm9tICdkZXRlY3QtYnJvd3NlcnMnO1xuaW1wb3J0IHsgc2hlbGwgfSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgcmVhZFNldHRpbmcgfSBmcm9tICcuLi9zdG9yZS9yZWFkU2V0dGluZyc7XG5pbXBvcnQgeyBTRVRUSU5HU19BVkFJTEFCTEVfQlJPV1NFUlNfVVBEQVRFRCB9IGZyb20gJy4uL3VpL2FjdGlvbnMnO1xuXG4vLyBDYWNoZSBicm93c2VycyB0byBhdm9pZCByZXBlYXRlZGx5IGZldGNoaW5nIHRoZW1cbmxldCBjYWNoZWRCcm93c2VyczogQnJvd3NlcltdIHwgbnVsbCA9IG51bGw7XG5sZXQgYnJvd3NlckxvYWRQcm9taXNlOiBQcm9taXNlPEJyb3dzZXJbXT4gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBMYXp5IGxvYWQgYnJvd3NlcnMgYXN5bmNocm9ub3VzbHlcbiAqIFRoaXMgZW5zdXJlcyB3ZSBkb24ndCBzbG93IGRvd24gYXBwIHN0YXJ0dXBcbiAqL1xuY29uc3QgbG9hZEJyb3dzZXJzTGF6eSA9ICgpOiBQcm9taXNlPEJyb3dzZXJbXT4gPT4ge1xuICBpZiAoY2FjaGVkQnJvd3NlcnMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZEJyb3dzZXJzKTtcbiAgfVxuXG4gIGlmICghYnJvd3NlckxvYWRQcm9taXNlKSB7XG4gICAgLy8gU3RhcnQgbG9hZGluZyBicm93c2VycyBhc3luY2hyb25vdXNseSBhZnRlciBhIGRlbGF5IHRvIG5vdCBibG9jayB0aGUgYXBwIHN0YXJ0dXBcbiAgICBicm93c2VyTG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgLy8gRGVsYXkgYnJvd3NlciBkZXRlY3Rpb24gZm9yIDIgc2Vjb25kcyBhZnRlciB0aGlzIGZ1bmN0aW9uIGlzIGZpcnN0IGNhbGxlZFxuICAgICAgLy8gdG8gYXZvaWQgc2xvd2luZyBkb3duIGFwcCBzdGFydHVwIGFuZCBpbml0aWFsIGludGVyYWN0aW9uc1xuICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgYnJvd3NlcnMgPSBhd2FpdCBnZXRBdmFpbGFibGVCcm93c2VycygpO1xuICAgICAgICAgIGNhY2hlZEJyb3dzZXJzID0gYnJvd3NlcnM7XG5cbiAgICAgICAgICBjb25zdCBicm93c2VySWRzID0gYnJvd3NlcnMubWFwKChicm93c2VyKSA9PiBicm93c2VyLmJyb3dzZXIpO1xuICAgICAgICAgIGlmIChicm93c2VySWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgdHlwZTogU0VUVElOR1NfQVZBSUxBQkxFX0JST1dTRVJTX1VQREFURUQsXG4gICAgICAgICAgICAgIHBheWxvYWQ6IGJyb3dzZXJJZHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXNvbHZlKGJyb3dzZXJzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZXRlY3RpbmcgYnJvd3NlcnM6JywgZXJyb3IpO1xuICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICB9XG4gICAgICB9LCAyMDAwKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBicm93c2VyTG9hZFByb21pc2U7XG59O1xuXG4vKipcbiAqIExhdW5jaGVzIGEgVVJMIGluIHRoZSBzZWxlY3RlZCBicm93c2VyIGZyb20gc2V0dGluZ3Mgb3IgZmFsbHMgYmFjayB0byBzeXN0ZW0gZGVmYXVsdFxuICpcbiAqIEBwYXJhbSB1cmwgVGhlIFVSTCB0byBvcGVuXG4gKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgYnJvd3NlciBpcyBsYXVuY2hlZFxuICovXG5leHBvcnQgY29uc3Qgb3BlbkV4dGVybmFsID0gYXN5bmMgKHVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIEdldCB0aGUgc2VsZWN0ZWQgYnJvd3NlciBmcm9tIHNldHRpbmdzXG4gIGNvbnN0IHNlbGVjdGVkQnJvd3NlciA9IHJlYWRTZXR0aW5nKCdzZWxlY3RlZEJyb3dzZXInKTtcblxuICAvLyBJZiBubyBzcGVjaWZpYyBicm93c2VyIGlzIHNlbGVjdGVkLCB1c2UgdGhlIHN5c3RlbSBkZWZhdWx0XG4gIGlmICghc2VsZWN0ZWRCcm93c2VyKSB7XG4gICAgcmV0dXJuIHNoZWxsLm9wZW5FeHRlcm5hbCh1cmwpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBMYXp5IGxvYWQgYnJvd3NlcnMgd2hlbiBuZWVkZWRcbiAgICBjb25zdCBicm93c2VycyA9IGF3YWl0IGxvYWRCcm93c2Vyc0xhenkoKTtcblxuICAgIC8vIEZpbmQgdGhlIHNlbGVjdGVkIGJyb3dzZXIgaW4gdGhlIGF2YWlsYWJsZSBicm93c2Vyc1xuICAgIGNvbnN0IGJyb3dzZXIgPSBicm93c2Vycy5maW5kKFxuICAgICAgKGJyb3dzZXIpID0+IGJyb3dzZXIuYnJvd3NlciA9PT0gc2VsZWN0ZWRCcm93c2VyXG4gICAgKTtcblxuICAgIGlmIChicm93c2VyKSB7XG4gICAgICAvLyBMYXVuY2ggdGhlIHNlbGVjdGVkIGJyb3dzZXIgd2l0aCB0aGUgVVJMXG4gICAgICByZXR1cm4gbGF1bmNoQnJvd3Nlcihicm93c2VyLCB1cmwpO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgc2VsZWN0ZWQgYnJvd3NlciBpc24ndCBhdmFpbGFibGUsIGZhbGwgYmFjayB0byBzeXN0ZW0gZGVmYXVsdFxuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGBTZWxlY3RlZCBicm93c2VyIFwiJHtzZWxlY3RlZEJyb3dzZXJ9XCIgbm90IGZvdW5kLCB1c2luZyBzeXN0ZW0gZGVmYXVsdC5gXG4gICAgKTtcbiAgICByZXR1cm4gc2hlbGwub3BlbkV4dGVybmFsKHVybCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgbGF1bmNoaW5nIGJyb3dzZXI6JywgZXJyb3IpO1xuICAgIC8vIEZhbGwgYmFjayB0byBzaGVsbC5vcGVuRXh0ZXJuYWwgb24gZXJyb3JcbiAgICByZXR1cm4gc2hlbGwub3BlbkV4dGVybmFsKHVybCk7XG4gIH1cbn07XG5cbi8qKlxuICogVHJpZ2dlciBwcmVsb2FkaW5nIG9mIGJyb3dzZXJzIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBDYWxsIHRoaXMgZnVuY3Rpb24gd2hlbiB0aGUgYXBwIGlzIGZ1bGx5IGxvYWRlZFxuICovXG5leHBvcnQgY29uc3QgcHJlbG9hZEJyb3dzZXJzTGlzdCA9ICgpOiB2b2lkID0+IHtcbiAgLy8gQmVnaW4gbG9hZGluZyBicm93c2VycyBpbiB0aGUgYmFja2dyb3VuZCBhZnRlciBhcHAgaXMgcmVhZHlcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgbG9hZEJyb3dzZXJzTGF6eSgpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHByZWxvYWQgYnJvd3NlcnMgbGlzdDonLCBlcnJvcik7XG4gICAgfSk7XG4gIH0sIDUwMDApOyAvLyBEZWxheSBmb3IgNSBzZWNvbmRzIGFmdGVyIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkXG59O1xuIiwiaW1wb3J0IHsgaXBjUmVuZGVyZXIgfSBmcm9tICdlbGVjdHJvbic7XG5cbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gJy4uLy4uL3N0b3JlJztcbmltcG9ydCB7IG9wZW5FeHRlcm5hbCB9IGZyb20gJy4uLy4uL3V0aWxzL2Jyb3dzZXJMYXVuY2hlcic7XG5cbmV4cG9ydCBjb25zdCBnZXRJbnRlcm5hbFZpZGVvQ2hhdFdpbmRvd0VuYWJsZWQgPSAoKTogYm9vbGVhbiA9PlxuICBzZWxlY3QoKHsgaXNJbnRlcm5hbFZpZGVvQ2hhdFdpbmRvd0VuYWJsZWQgfSkgPT4gKHtcbiAgICBpc0ludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZCxcbiAgfSkpLmlzSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkO1xuXG5leHBvcnQgdHlwZSB2aWRlb0NhbGxXaW5kb3dPcHRpb25zID0ge1xuICBwcm92aWRlck5hbWU/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3Qgb3BlbkludGVybmFsVmlkZW9DaGF0V2luZG93ID0gKFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9uczogdmlkZW9DYWxsV2luZG93T3B0aW9ucyB8IHVuZGVmaW5lZFxuKTogdm9pZCA9PiB7XG4gIGNvbnN0IHZhbGlkVXJsID0gbmV3IFVSTCh1cmwpO1xuICBjb25zdCBhbGxvd2VkUHJvdG9jb2xzID0gWydodHRwOicsICdodHRwczonXTtcbiAgaWYgKCFhbGxvd2VkUHJvdG9jb2xzLmluY2x1ZGVzKHZhbGlkVXJsLnByb3RvY29sKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIXByb2Nlc3MubWFzICYmIGdldEludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZCgpKSB7XG4gICAgc3dpdGNoIChvcHRpb25zPy5wcm92aWRlck5hbWUpIHtcbiAgICAgIGNhc2UgJ2ppdHNpJzpcbiAgICAgICAgLy8gd2luZG93Lm9wZW4odmFsaWRVcmwuaHJlZiwgJ1ZpZGVvIENhbGwnLCAnc2Nyb2xsYmFycz10cnVlJyk7XG4gICAgICAgIC8vIFdlIHdpbGwgb3BlbiBKaXRzaSBvbiBicm93c2VyIGluc3RlYWQgb2Ygb3BlbmluZyBhIG5ldyB3aW5kb3cgZm9yIGNvbXBhdGliaWxpdHkgZnJvbSB0aGVpciBzaWRlXG4gICAgICAgIGlwY1JlbmRlcmVyLmludm9rZShcbiAgICAgICAgICAndmlkZW8tY2FsbC13aW5kb3cvb3Blbi13aW5kb3cnLFxuICAgICAgICAgIHZhbGlkVXJsLmhyZWYsXG4gICAgICAgICAgb3B0aW9uc1xuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dvb2dsZW1lZXQnOlxuICAgICAgICBvcGVuRXh0ZXJuYWwodmFsaWRVcmwuaHJlZik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaXBjUmVuZGVyZXIuaW52b2tlKFxuICAgICAgICAgICd2aWRlby1jYWxsLXdpbmRvdy9vcGVuLXdpbmRvdycsXG4gICAgICAgICAgdmFsaWRVcmwuaHJlZixcbiAgICAgICAgICBvcHRpb25zXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBvcGVuRXh0ZXJuYWwodmFsaWRVcmwuaHJlZik7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4uLy4uL3N0b3JlJztcbmltcG9ydCB7XG4gIFdFQlZJRVdfU0lERUJBUl9DVVNUT01fVEhFTUVfQ0hBTkdFRCxcbiAgV0VCVklFV19TSURFQkFSX1NUWUxFX0NIQU5HRUQsXG59IGZyb20gJy4uLy4uL3VpL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBTZXJ2ZXIgfSBmcm9tICcuLi9jb21tb24nO1xuaW1wb3J0IHsgZ2V0U2VydmVyVXJsLCBnZXRBYnNvbHV0ZVVybCB9IGZyb20gJy4vdXJscyc7XG5cbmxldCB0aW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD47XG5sZXQgcHJldkJhY2tncm91bmQ6IHN0cmluZztcbmxldCBwcmV2Q29sb3I6IHN0cmluZztcbmxldCBwcmV2Qm9yZGVyOiBzdHJpbmc7XG5sZXQgc2VydmVyVmVyc2lvbjogc3RyaW5nO1xuXG5mdW5jdGlvbiB2ZXJzaW9uSXNHcmVhdGVyT3JFcXVhbHNUbyhcbiAgdmVyc2lvbjE6IHN0cmluZyxcbiAgdmVyc2lvbjI6IHN0cmluZ1xuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHYxID0gdmVyc2lvbjEubWF0Y2goL1xcZCsvZyk/Lm1hcChOdW1iZXIpIHx8IFtdO1xuICBjb25zdCB2MiA9IHZlcnNpb24yLm1hdGNoKC9cXGQrL2cpPy5tYXAoTnVtYmVyKSB8fCBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGNvbnN0IG4xID0gdjFbaV0gfHwgMDtcbiAgICBjb25zdCBuMiA9IHYyW2ldIHx8IDA7XG5cbiAgICBpZiAobjEgPiBuMikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChuMSA8IG4yKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmNvbnN0IHBvbGxTaWRlYmFyU3R5bGUgPSAoXG4gIHJlZmVyZW5jZUVsZW1lbnQ6IEVsZW1lbnQsXG4gIGVtaXQ6IChpbnB1dDogU2VydmVyWydzdHlsZSddKSA9PiB2b2lkXG4pOiB2b2lkID0+IHtcbiAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZChyZWZlcmVuY2VFbGVtZW50KTtcbiAgY29uc3QgeyBiYWNrZ3JvdW5kLCBjb2xvciwgYm9yZGVyIH0gPVxuICAgIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHJlZmVyZW5jZUVsZW1lbnQpO1xuXG4gIHJlZmVyZW5jZUVsZW1lbnQucmVtb3ZlKCk7XG5cbiAgY29uc3QgbmV3QmdnID0gcHJldkJhY2tncm91bmQgIT09IGJhY2tncm91bmQgPyBiYWNrZ3JvdW5kIDogcHJldkJhY2tncm91bmQ7XG4gIGNvbnN0IG5ld0NvbG9yID0gcHJldkNvbG9yICE9PSBjb2xvciA/IGNvbG9yIDogcHJldkNvbG9yO1xuICBjb25zdCBuZXdCb3JkZXIgPSBwcmV2Qm9yZGVyICE9PSBib3JkZXIgPyBib3JkZXIgOiBwcmV2Qm9yZGVyO1xuXG4gIGlmIChcbiAgICBwcmV2QmFja2dyb3VuZCAhPT0gYmFja2dyb3VuZCB8fFxuICAgIHByZXZDb2xvciAhPT0gY29sb3IgfHxcbiAgICBuZXdCb3JkZXIgIT09IGJvcmRlclxuICApIHtcbiAgICBlbWl0KHtcbiAgICAgIGJhY2tncm91bmQ6IG5ld0JnZyxcbiAgICAgIGNvbG9yOiBuZXdDb2xvcixcbiAgICAgIGJvcmRlcjogbmV3Qm9yZGVyLFxuICAgIH0pO1xuICAgIHByZXZCYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICBwcmV2Q29sb3IgPSBjb2xvcjtcbiAgICBwcmV2Qm9yZGVyID0gYm9yZGVyO1xuICB9XG5cbiAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHBvbGxTaWRlYmFyU3R5bGUocmVmZXJlbmNlRWxlbWVudCwgZW1pdCksIDUwMDApO1xufTtcblxubGV0IGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG5jb25zdCBnZXRFbGVtZW50ID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3ZhcigtLXNpZGViYXItYmFja2dyb3VuZCknO1xuICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAndmFyKC0tc2lkZWJhci1pdGVtLXRleHQtY29sb3IpJztcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKHZlcnNpb25Jc0dyZWF0ZXJPckVxdWFsc1RvKHNlcnZlclZlcnNpb24sICc2LjMuMCcpKSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3JjeC1zaWRlYmFyLS1tYWluJyk7XG4gICAgICBlbGVtZW50LnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgdmFyKC0tc2lkZWJhci1ib3JkZXItY29sb3IpJztcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzaWRlYmFyJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2VydmVyVmVyc2lvblRvU2lkZWJhciA9ICh2ZXJzaW9uOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgc2VydmVyVmVyc2lvbiA9IHZlcnNpb247XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0QmFja2dyb3VuZCA9IChpbWFnZVVybDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVsZW1lbnQgPSBnZXRFbGVtZW50KCk7XG5cbiAgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBpbWFnZVVybFxuICAgID8gYHVybCgke0pTT04uc3RyaW5naWZ5KGdldEFic29sdXRlVXJsKGltYWdlVXJsKSl9KWBcbiAgICA6ICdub25lJztcblxuICBwb2xsU2lkZWJhclN0eWxlKGVsZW1lbnQsIChzaWRlQmFyU3R5bGUpID0+IHtcbiAgICBkaXNwYXRjaCh7XG4gICAgICB0eXBlOiBXRUJWSUVXX1NJREVCQVJfU1RZTEVfQ0hBTkdFRCxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgdXJsOiBnZXRTZXJ2ZXJVcmwoKSxcbiAgICAgICAgc3R5bGU6IHNpZGVCYXJTdHlsZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFNpZGViYXJDdXN0b21UaGVtZSA9IChjdXN0b21UaGVtZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGRpc3BhdGNoKHtcbiAgICB0eXBlOiBXRUJWSUVXX1NJREVCQVJfQ1VTVE9NX1RIRU1FX0NIQU5HRUQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdXJsOiBnZXRTZXJ2ZXJVcmwoKSxcbiAgICAgIGN1c3RvbVRoZW1lLFxuICAgIH0sXG4gIH0pO1xufTtcbiIsImltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi4vLi4vc3RvcmUnO1xuaW1wb3J0IHsgV0VCVklFV19VU0VSX1RIRU1FX0FQUEVBUkFOQ0VfQ0hBTkdFRCB9IGZyb20gJy4uLy4uL3VpL2FjdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBTZXJ2ZXIgfSBmcm9tICcuLi9jb21tb24nO1xuaW1wb3J0IHsgZ2V0U2VydmVyVXJsIH0gZnJvbSAnLi91cmxzJztcblxuZXhwb3J0IGNvbnN0IHNldFVzZXJUaGVtZUFwcGVhcmFuY2UgPSAoXG4gIHRoZW1lQXBwZWFyYW5jZTogU2VydmVyWyd0aGVtZUFwcGVhcmFuY2UnXVxuKTogdm9pZCA9PiB7XG4gIGRpc3BhdGNoKHtcbiAgICB0eXBlOiBXRUJWSUVXX1VTRVJfVEhFTUVfQVBQRUFSQU5DRV9DSEFOR0VELFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHVybDogZ2V0U2VydmVyVXJsKCksXG4gICAgICB0aGVtZUFwcGVhcmFuY2UsXG4gICAgfSxcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuLi8uLi9zdG9yZSc7XG5pbXBvcnQgeyBXRUJWSUVXX1RJVExFX0NIQU5HRUQgfSBmcm9tICcuLi8uLi91aS9hY3Rpb25zJztcbmltcG9ydCB7IGdldFNlcnZlclVybCB9IGZyb20gJy4vdXJscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRUaXRsZSA9ICh0aXRsZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmICh0eXBlb2YgdGl0bGUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdXJsID0gZ2V0U2VydmVyVXJsKCk7XG5cbiAgaWYgKHRpdGxlID09PSAnUm9ja2V0LkNoYXQnICYmIG5ldyBVUkwodXJsKS5ob3N0ICE9PSAnb3Blbi5yb2NrZXQuY2hhdCcpIHtcbiAgICBkaXNwYXRjaCh7XG4gICAgICB0eXBlOiBXRUJWSUVXX1RJVExFX0NIQU5HRUQsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHVybCxcbiAgICAgICAgdGl0bGU6IGAke3RpdGxlfSAtICR7dXJsfWAsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGRpc3BhdGNoKHtcbiAgICB0eXBlOiBXRUJWSUVXX1RJVExFX0NIQU5HRUQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdXJsLFxuICAgICAgdGl0bGUsXG4gICAgfSxcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuLi8uLi9zdG9yZSc7XG5pbXBvcnQgeyBXRUJWSUVXX1VTRVJfTE9HR0VEX0lOIH0gZnJvbSAnLi4vLi4vdWkvYWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IFNlcnZlciB9IGZyb20gJy4uL2NvbW1vbic7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJVcmwgfSBmcm9tICcuL3VybHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0VXNlckxvZ2dlZEluID0gKHVzZXJMb2dnZWRJbjogU2VydmVyWyd1c2VyTG9nZ2VkSW4nXSk6IHZvaWQgPT4ge1xuICBkaXNwYXRjaCh7XG4gICAgdHlwZTogV0VCVklFV19VU0VSX0xPR0dFRF9JTixcbiAgICBwYXlsb2FkOiB7XG4gICAgICB1cmw6IGdldFNlcnZlclVybCgpLFxuICAgICAgdXNlckxvZ2dlZEluLFxuICAgIH0sXG4gIH0pO1xufTtcbiIsImltcG9ydCB7XG4gIGNyZWF0ZU5vdGlmaWNhdGlvbixcbiAgZGVzdHJveU5vdGlmaWNhdGlvbixcbn0gZnJvbSAnLi4vLi4vbm90aWZpY2F0aW9ucy9wcmVsb2FkJztcbmltcG9ydCB7XG4gIGdldE91dGxvb2tFdmVudHMsXG4gIHNldE91dGxvb2tFeGNoYW5nZVVybCxcbiAgaGFzT3V0bG9va0NyZWRlbnRpYWxzLFxuICBjbGVhck91dGxvb2tDcmVkZW50aWFscyxcbiAgc2V0VXNlclRva2VuLFxufSBmcm9tICcuLi8uLi9vdXRsb29rQ2FsZW5kYXIvcHJlbG9hZCc7XG5pbXBvcnQgdHlwZSB7IE91dGxvb2tFdmVudHNSZXNwb25zZSB9IGZyb20gJy4uLy4uL291dGxvb2tDYWxlbmRhci90eXBlJztcbmltcG9ydCB7IHNldFVzZXJQcmVzZW5jZURldGVjdGlvbiB9IGZyb20gJy4uLy4uL3VzZXJQcmVzZW5jZS9wcmVsb2FkJztcbmltcG9ydCB0eXBlIHsgU2VydmVyIH0gZnJvbSAnLi4vY29tbW9uJztcbmltcG9ydCB7IHNldEJhZGdlIH0gZnJvbSAnLi9iYWRnZSc7XG5pbXBvcnQgeyB3cml0ZVRleHRUb0NsaXBib2FyZCB9IGZyb20gJy4vY2xpcGJvYXJkJztcbmltcG9ydCB7IG9wZW5Eb2N1bWVudFZpZXdlciB9IGZyb20gJy4vZG9jdW1lbnRWaWV3ZXInO1xuaW1wb3J0IHsgc2V0RmF2aWNvbiB9IGZyb20gJy4vZmF2aWNvbic7XG5pbXBvcnQgeyBzZXRHaXRDb21taXRIYXNoIH0gZnJvbSAnLi9naXRDb21taXRIYXNoJztcbmltcG9ydCB0eXBlIHsgdmlkZW9DYWxsV2luZG93T3B0aW9ucyB9IGZyb20gJy4vaW50ZXJuYWxWaWRlb0NoYXRXaW5kb3cnO1xuaW1wb3J0IHtcbiAgZ2V0SW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkLFxuICBvcGVuSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3csXG59IGZyb20gJy4vaW50ZXJuYWxWaWRlb0NoYXRXaW5kb3cnO1xuaW1wb3J0IHtcbiAgc2V0QmFja2dyb3VuZCxcbiAgc2V0U2VydmVyVmVyc2lvblRvU2lkZWJhcixcbiAgc2V0U2lkZWJhckN1c3RvbVRoZW1lLFxufSBmcm9tICcuL3NpZGViYXInO1xuaW1wb3J0IHsgc2V0VXNlclRoZW1lQXBwZWFyYW5jZSB9IGZyb20gJy4vdGhlbWVBcHBlYXJhbmNlJztcbmltcG9ydCB7IHNldFRpdGxlIH0gZnJvbSAnLi90aXRsZSc7XG5pbXBvcnQgeyBzZXRVcmxSZXNvbHZlciB9IGZyb20gJy4vdXJscyc7XG5pbXBvcnQgeyBzZXRVc2VyTG9nZ2VkSW4gfSBmcm9tICcuL3VzZXJMb2dnZWRJbic7XG5cbnR5cGUgU2VydmVySW5mbyA9IHtcbiAgdmVyc2lvbjogc3RyaW5nO1xufTtcblxuZXhwb3J0IGxldCBzZXJ2ZXJJbmZvOiBTZXJ2ZXJJbmZvO1xubGV0IGNiID0gKF9zZXJ2ZXJJbmZvOiBTZXJ2ZXJJbmZvKTogdm9pZCA9PiB1bmRlZmluZWQ7XG5cbmV4cG9ydCB0eXBlIFJvY2tldENoYXREZXNrdG9wQVBJID0ge1xuICBvblJlYWR5OiAoY2I6IChzZXJ2ZXJJbmZvOiBTZXJ2ZXJJbmZvKSA9PiB2b2lkKSA9PiB2b2lkO1xuICBzZXRTZXJ2ZXJJbmZvOiAoc2VydmVySW5mbzogU2VydmVySW5mbykgPT4gdm9pZDtcbiAgc2V0VXJsUmVzb2x2ZXI6IChnZXRBYnNvbHV0ZVVybDogKHJlbGF0aXZlUGF0aD86IHN0cmluZykgPT4gc3RyaW5nKSA9PiB2b2lkO1xuICBzZXRCYWRnZTogKGJhZGdlOiBTZXJ2ZXJbJ2JhZGdlJ10pID0+IHZvaWQ7XG4gIHNldEZhdmljb246IChmYXZpY29uVXJsOiBzdHJpbmcpID0+IHZvaWQ7XG4gIHNldEJhY2tncm91bmQ6IChpbWFnZVVybDogc3RyaW5nKSA9PiB2b2lkO1xuICBzZXRTaWRlYmFyQ3VzdG9tVGhlbWU6IChjdXN0b21UaGVtZTogc3RyaW5nKSA9PiB2b2lkO1xuICBzZXRUaXRsZTogKHRpdGxlOiBzdHJpbmcpID0+IHZvaWQ7XG4gIHNldFVzZXJMb2dnZWRJbjogKHVzZXJMb2dnZWRJbjogYm9vbGVhbikgPT4gdm9pZDtcbiAgc2V0VXNlclByZXNlbmNlRGV0ZWN0aW9uOiAob3B0aW9uczoge1xuICAgIGlzQXV0b0F3YXlFbmFibGVkOiBib29sZWFuO1xuICAgIGlkbGVUaHJlc2hvbGQ6IG51bWJlciB8IG51bGw7XG4gICAgc2V0VXNlck9ubGluZTogKG9ubGluZTogYm9vbGVhbikgPT4gdm9pZDtcbiAgfSkgPT4gdm9pZDtcbiAgc2V0VXNlclRoZW1lQXBwZWFyYW5jZTogKHRoZW1lQXBwZWFyYW5jZTogU2VydmVyWyd0aGVtZUFwcGVhcmFuY2UnXSkgPT4gdm9pZDtcbiAgY3JlYXRlTm90aWZpY2F0aW9uOiAoXG4gICAgb3B0aW9uczogTm90aWZpY2F0aW9uT3B0aW9ucyAmIHtcbiAgICAgIGNhblJlcGx5PzogYm9vbGVhbjtcbiAgICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgICBvbkV2ZW50OiAoZXZlbnREZXNjcmlwdG9yOiB7IHR5cGU6IHN0cmluZzsgZGV0YWlsOiB1bmtub3duIH0pID0+IHZvaWQ7XG4gICAgfVxuICApID0+IFByb21pc2U8dW5rbm93bj47XG4gIGRlc3Ryb3lOb3RpZmljYXRpb246IChpZDogdW5rbm93bikgPT4gdm9pZDtcbiAgZ2V0SW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkOiAoKSA9PiBib29sZWFuO1xuICBvcGVuSW50ZXJuYWxWaWRlb0NoYXRXaW5kb3c6IChcbiAgICB1cmw6IHN0cmluZyxcbiAgICBvcHRpb25zOiB2aWRlb0NhbGxXaW5kb3dPcHRpb25zXG4gICkgPT4gdm9pZDtcbiAgc2V0R2l0Q29tbWl0SGFzaDogKGdpdENvbW1pdEhhc2g6IHN0cmluZykgPT4gdm9pZDtcbiAgd3JpdGVUZXh0VG9DbGlwYm9hcmQ6ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQ7XG4gIGdldE91dGxvb2tFdmVudHM6IChkYXRlOiBEYXRlKSA9PiBQcm9taXNlPE91dGxvb2tFdmVudHNSZXNwb25zZT47XG4gIHNldE91dGxvb2tFeGNoYW5nZVVybDogKHVybDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykgPT4gdm9pZDtcbiAgaGFzT3V0bG9va0NyZWRlbnRpYWxzOiAoKSA9PiBQcm9taXNlPGJvb2xlYW4+O1xuICBjbGVhck91dGxvb2tDcmVkZW50aWFsczogKCkgPT4gdm9pZDtcbiAgc2V0VXNlclRva2VuOiAodG9rZW46IHN0cmluZywgdXNlcklkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9wZW5Eb2N1bWVudFZpZXdlcjogKHVybDogc3RyaW5nLCBmb3JtYXQ6IHN0cmluZywgb3B0aW9uczogYW55KSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGNvbnN0IFJvY2tldENoYXREZXNrdG9wOiBSb2NrZXRDaGF0RGVza3RvcEFQSSA9IHtcbiAgb25SZWFkeTogKGMpID0+IHtcbiAgICBpZiAoc2VydmVySW5mbykge1xuICAgICAgYyhzZXJ2ZXJJbmZvKTtcbiAgICB9XG4gICAgY2IgPSBjO1xuICB9LFxuICBzZXRTZXJ2ZXJJbmZvOiAoX3NlcnZlckluZm8pID0+IHtcbiAgICBzZXJ2ZXJJbmZvID0gX3NlcnZlckluZm87XG4gICAgY2IoX3NlcnZlckluZm8pO1xuICAgIHNldFNlcnZlclZlcnNpb25Ub1NpZGViYXIoX3NlcnZlckluZm8udmVyc2lvbik7XG4gIH0sXG4gIHNldFVybFJlc29sdmVyLFxuICBzZXRCYWRnZSxcbiAgc2V0RmF2aWNvbixcbiAgc2V0QmFja2dyb3VuZCxcbiAgc2V0VGl0bGUsXG4gIHNldFVzZXJQcmVzZW5jZURldGVjdGlvbixcbiAgc2V0VXNlckxvZ2dlZEluLFxuICBzZXRVc2VyVGhlbWVBcHBlYXJhbmNlLFxuICBjcmVhdGVOb3RpZmljYXRpb24sXG4gIGRlc3Ryb3lOb3RpZmljYXRpb24sXG4gIGdldEludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZCxcbiAgb3BlbkludGVybmFsVmlkZW9DaGF0V2luZG93LFxuICBzZXRHaXRDb21taXRIYXNoLFxuICB3cml0ZVRleHRUb0NsaXBib2FyZCxcbiAgZ2V0T3V0bG9va0V2ZW50cyxcbiAgc2V0T3V0bG9va0V4Y2hhbmdlVXJsLFxuICBoYXNPdXRsb29rQ3JlZGVudGlhbHMsXG4gIGNsZWFyT3V0bG9va0NyZWRlbnRpYWxzLFxuICBzZXRVc2VyVG9rZW4sXG4gIHNldFNpZGViYXJDdXN0b21UaGVtZSxcbiAgb3BlbkRvY3VtZW50Vmlld2VyLFxufTtcbiIsImV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgKC4uLnBhcmFtczogYW55W10pID0+IHVua25vd24+KFxuICBjYjogVCxcbiAgd2FpdCA9IDIwXG4pOiBUIHtcbiAgbGV0IGg6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkO1xuICBjb25zdCBjYWxsYWJsZSA9ICguLi5hcmdzOiBhbnkpID0+IHtcbiAgICBoICYmIGNsZWFyVGltZW91dChoKTtcbiAgICBoID0gc2V0VGltZW91dCgoKSA9PiBjYiguLi5hcmdzKSwgd2FpdCk7XG4gIH07XG4gIHJldHVybiA8VD4oPGFueT5jYWxsYWJsZSk7XG59XG4iLCJpbXBvcnQgeyBkaXNwYXRjaCwgbGlzdGVuIH0gZnJvbSAnLi4vLi4vc3RvcmUnO1xuaW1wb3J0IHtcbiAgV0VCVklFV19NRVNTQUdFX0JPWF9GT0NVU0VELFxuICBXRUJWSUVXX01FU1NBR0VfQk9YX0JMVVJSRUQsXG4gIFRPVUNIX0JBUl9GT1JNQVRfQlVUVE9OX1RPVUNIRUQsXG59IGZyb20gJy4uL2FjdGlvbnMnO1xuXG5sZXQgZm9jdXNlZE1lc3NhZ2VCb3hJbnB1dDogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG5jb25zdCBoYW5kbGVGb2N1c0V2ZW50ID0gKGV2ZW50OiBGb2N1c0V2ZW50KTogdm9pZCA9PiB7XG4gIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1pbnB1dC1tZXNzYWdlJykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb2N1c2VkTWVzc2FnZUJveElucHV0ID0gZXZlbnQudGFyZ2V0O1xuICBkaXNwYXRjaCh7IHR5cGU6IFdFQlZJRVdfTUVTU0FHRV9CT1hfRk9DVVNFRCB9KTtcbn07XG5cbmNvbnN0IGhhbmRsZUJsdXJFdmVudCA9IChldmVudDogRm9jdXNFdmVudCk6IHZvaWQgPT4ge1xuICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnanMtaW5wdXQtbWVzc2FnZScpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9jdXNlZE1lc3NhZ2VCb3hJbnB1dCA9IG51bGw7XG4gIGRpc3BhdGNoKHsgdHlwZTogV0VCVklFV19NRVNTQUdFX0JPWF9CTFVSUkVEIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGxpc3RlblRvTWVzc2FnZUJveEV2ZW50cyA9ICgpOiB2b2lkID0+IHtcbiAgbGlzdGVuKFRPVUNIX0JBUl9GT1JNQVRfQlVUVE9OX1RPVUNIRUQsIChhY3Rpb24pID0+IHtcbiAgICBpZiAoIWZvY3VzZWRNZXNzYWdlQm94SW5wdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IHBheWxvYWQ6IGJ1dHRvbklkIH0gPSBhY3Rpb247XG5cbiAgICBjb25zdCBhbmNlc3RvciA9IGZvY3VzZWRNZXNzYWdlQm94SW5wdXQuY2xvc2VzdCgnLnJjLW1lc3NhZ2UtYm94Jyk7XG4gICAgY29uc3QgYnV0dG9uID0gYW5jZXN0b3I/LnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KFxuICAgICAgYFtkYXRhLWlkPScke2J1dHRvbklkfSddYFxuICAgICk7XG4gICAgYnV0dG9uPy5jbGljaygpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZUZvY3VzRXZlbnQsIHRydWUpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlQmx1ckV2ZW50LCB0cnVlKTtcbn07XG4iLCJpbXBvcnQgeyB3YXRjaCB9IGZyb20gJy4uLy4uL3N0b3JlJztcbmltcG9ydCB0eXBlIHsgUm9vdFN0YXRlIH0gZnJvbSAnLi4vLi4vc3RvcmUvcm9vdFJlZHVjZXInO1xuXG5jb25zdCBzZWxlY3RJc1NpZGVCYXJWaXNpYmxlID0gKHtcbiAgc2VydmVycyxcbiAgaXNTaWRlQmFyRW5hYmxlZCxcbn06IFJvb3RTdGF0ZSk6IGJvb2xlYW4gPT4gc2VydmVycy5sZW5ndGggPiAwICYmIGlzU2lkZUJhckVuYWJsZWQ7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVUcmFmZmljTGlnaHRzU3BhY2luZyA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdkYXJ3aW4nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgc3R5bGUgPVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWRlYmFyLXBhZGRpbmcnKSB8fFxuICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLmlkID0gJ3NpZGViYXItcGFkZGluZyc7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kKHN0eWxlKTtcblxuICB3YXRjaChzZWxlY3RJc1NpZGVCYXJWaXNpYmxlLCAoaXNTaWRlQmFyVmlzaWJsZSkgPT4ge1xuICAgIHN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgIC5zaWRlYmFyIHtcbiAgICAgICAgcGFkZGluZy10b3A6ICR7aXNTaWRlQmFyVmlzaWJsZSA/IDAgOiAnMTBweCd9ICFpbXBvcnRhbnQ7XG4gICAgICAgIHRyYW5zaXRpb246IHBhZGRpbmctdG9wIDIzMG1zIGVhc2UtaW4tb3V0ICFpbXBvcnRhbnQ7XG4gICAgICB9XG4gICAgYDtcbiAgfSk7XG59O1xuIiwiZXhwb3J0IGNvbnN0IHdoZW5SZWFkeSA9ICgpOiBQcm9taXNlPHZvaWQ+ID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVSZWFkeVN0YXRlQ2hhbmdlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgaGFuZGxlUmVhZHlTdGF0ZUNoYW5nZSk7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCBoYW5kbGVSZWFkeVN0YXRlQ2hhbmdlKTtcbiAgfSk7XG4iLCJpbXBvcnQgeyBjb250ZXh0QnJpZGdlLCB3ZWJGcmFtZSB9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHsgaW52b2tlIH0gZnJvbSAnLi9pcGMvcmVuZGVyZXInO1xuaW1wb3J0IHR5cGUgeyBKaXRzaU1lZXRFbGVjdHJvbkFQSSB9IGZyb20gJy4vaml0c2kvcHJlbG9hZCc7XG5pbXBvcnQgeyBKaXRzaU1lZXRFbGVjdHJvbiB9IGZyb20gJy4vaml0c2kvcHJlbG9hZCc7XG5pbXBvcnQgeyBsaXN0ZW5Ub05vdGlmaWNhdGlvbnNSZXF1ZXN0cyB9IGZyb20gJy4vbm90aWZpY2F0aW9ucy9wcmVsb2FkJztcbmltcG9ydCB7IGxpc3RlblRvU2NyZWVuU2hhcmluZ1JlcXVlc3RzIH0gZnJvbSAnLi9zY3JlZW5TaGFyaW5nL3ByZWxvYWQnO1xuaW1wb3J0IHR5cGUgeyBSb2NrZXRDaGF0RGVza3RvcEFQSSB9IGZyb20gJy4vc2VydmVycy9wcmVsb2FkL2FwaSc7XG5pbXBvcnQgeyBSb2NrZXRDaGF0RGVza3RvcCB9IGZyb20gJy4vc2VydmVycy9wcmVsb2FkL2FwaSc7XG5pbXBvcnQgeyBzZXRTZXJ2ZXJVcmwgfSBmcm9tICcuL3NlcnZlcnMvcHJlbG9hZC91cmxzJztcbmltcG9ydCB7IGNyZWF0ZVJlbmRlcmVyUmVkdXhTdG9yZSwgbGlzdGVuIH0gZnJvbSAnLi9zdG9yZSc7XG5pbXBvcnQgeyBXRUJWSUVXX0RJRF9OQVZJR0FURSB9IGZyb20gJy4vdWkvYWN0aW9ucyc7XG5pbXBvcnQgeyBkZWJvdW5jZSB9IGZyb20gJy4vdWkvbWFpbi9kZWJvdW5jZSc7XG5pbXBvcnQgeyBsaXN0ZW5Ub01lc3NhZ2VCb3hFdmVudHMgfSBmcm9tICcuL3VpL3ByZWxvYWQvbWVzc2FnZUJveCc7XG5pbXBvcnQgeyBoYW5kbGVUcmFmZmljTGlnaHRzU3BhY2luZyB9IGZyb20gJy4vdWkvcHJlbG9hZC9zaWRlYmFyJztcbmltcG9ydCB7IHdoZW5SZWFkeSB9IGZyb20gJy4vd2hlblJlYWR5JztcblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIEppdHNpTWVldEVsZWN0cm9uOiBKaXRzaU1lZXRFbGVjdHJvbkFQSTtcbiAgICBSb2NrZXRDaGF0RGVza3RvcDogUm9ja2V0Q2hhdERlc2t0b3BBUEk7XG4gIH1cbn1cblxuY29uc29sZS5sb2coJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSBQcmVsb2FkLnRzJyk7XG5cbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ0ppdHNpTWVldEVsZWN0cm9uJywgSml0c2lNZWV0RWxlY3Ryb24pO1xuY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnUm9ja2V0Q2hhdERlc2t0b3AnLCBSb2NrZXRDaGF0RGVza3RvcCk7XG5cbmxldCByZXRyeUNvdW50ID0gMDtcblxuY29uc3Qgc3RhcnQgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gUHJlbG9hZC50cyBzdGFydCBmaXJlZCcpO1xuICBjb25zdCBzZXJ2ZXJVcmwgPSBhd2FpdCBpbnZva2UoJ3NlcnZlci12aWV3L2dldC11cmwnKTtcblxuICBpZiAocmV0cnlDb3VudCA+IDUpIHJldHVybjtcblxuICBpZiAoIXNlcnZlclVybCkge1xuICAgIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gc2VydmVyVXJsIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgY29uc29sZS5sb2coJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSBQcmVsb2FkIHN0YXJ0IC0gcmV0cnlpbmcgaW4gMSBzZWNvbmRzJyk7XG4gICAgc2V0VGltZW91dChzdGFydCwgMTAwMCk7XG4gICAgcmV0cnlDb3VudCArPSAxO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgc3RhcnQpO1xuXG4gIHNldFNlcnZlclVybChzZXJ2ZXJVcmwpO1xuXG4gIGF3YWl0IHdoZW5SZWFkeSgpO1xuXG4gIGF3YWl0IGNyZWF0ZVJlbmRlcmVyUmVkdXhTdG9yZSgpO1xuXG4gIGF3YWl0IGludm9rZSgnc2VydmVyLXZpZXcvcmVhZHknKTtcblxuICBjb25zb2xlLmxvZygnW1JvY2tldC5DaGF0IERlc2t0b3BdIHdhaXRpbmcgZm9yIFJvY2tldENoYXREZXNrdG9wLm9uUmVhZHknKTtcbiAgUm9ja2V0Q2hhdERlc2t0b3Aub25SZWFkeSgoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSBSb2NrZXRDaGF0RGVza3RvcC5vblJlYWR5IGZpcmVkJyk7XG4gICAgbGlzdGVuKFxuICAgICAgV0VCVklFV19ESURfTkFWSUdBVEUsXG4gICAgICBkZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlcyA9IHdlYkZyYW1lLmdldFJlc291cmNlVXNhZ2UoKTtcbiAgICAgICAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbmZpZ3VyYWJsZVxuICAgICAgICBpZiAocmVzb3VyY2VzLmltYWdlcy5zaXplID4gNTAgKiAxMDI0ICogMTAyNCkge1xuICAgICAgICAgIHdlYkZyYW1lLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTAwMCAqIDMwKVxuICAgICk7XG5cbiAgICBsaXN0ZW5Ub05vdGlmaWNhdGlvbnNSZXF1ZXN0cygpO1xuICAgIGxpc3RlblRvU2NyZWVuU2hhcmluZ1JlcXVlc3RzKCk7XG4gICAgbGlzdGVuVG9NZXNzYWdlQm94RXZlbnRzKCk7XG4gICAgaGFuZGxlVHJhZmZpY0xpZ2h0c1NwYWNpbmcoKTtcbiAgfSk7XG59O1xuXG5jb25zb2xlLmxvZygnW1JvY2tldC5DaGF0IERlc2t0b3BdIHdhaXRpbmcgZm9yIHdpbmRvdyBsb2FkJyk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHN0YXJ0KTtcbiJdLCJuYW1lcyI6WyJoYW5kbGUiLCJjaGFubmVsIiwiaGFuZGxlciIsImxpc3RlbmVyIiwiXyIsImlkIiwiYXJncyIsInJlc29sdmVkIiwiaXBjUmVuZGVyZXIiLCJzZW5kIiwiZXJyb3IiLCJFcnJvciIsInJlamVjdGVkIiwibmFtZSIsIm1lc3NhZ2UiLCJzdGFjayIsIm9uIiwicmVtb3ZlTGlzdGVuZXIiLCJpbnZva2UiLCJqaXRzaURvbWFpbiIsIndpbmRvdyIsImxvY2F0aW9uIiwib3JpZ2luIiwiZGVza3RvcENhcHR1cmVyIiwiZ2V0U291cmNlcyIsIm9wdHMiLCJKaXRzaU1lZXRFbGVjdHJvbiIsIm9idGFpbkRlc2t0b3BTdHJlYW1zIiwiY2FsbGJhY2siLCJlcnJvckNhbGxiYWNrIiwib3B0aW9ucyIsInNvdXJjZXMiLCJtYXAiLCJzb3VyY2UiLCJkaXNwbGF5X2lkIiwidGh1bWJuYWlsIiwidG9EYXRhVVJMIiwiYXBwSWNvbiIsImNvbnNvbGUiLCJsb2ciLCJnZXRBYnNvbHV0ZVVybCIsInNlcnZlclVybCIsInNldFNlcnZlclVybCIsIl9zZXJ2ZXJVcmwiLCJnZXRTZXJ2ZXJVcmwiLCJzZXRVcmxSZXNvbHZlciIsIl9nZXRBYnNvbHV0ZVVybCIsImlzRlNBIiwiYWN0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwidHlwZSIsImhhc01ldGEiLCJtZXRhIiwiaXNSZXNwb25zZSIsInJlc3BvbnNlIiwiaXNMb2NhbGx5U2NvcGVkIiwic2NvcGUiLCJpc0Vycm9yZWQiLCJwYXlsb2FkIiwiaGFzUGF5bG9hZCIsImlzUmVzcG9uc2VUbyIsInR5cGVzIiwiaW5jbHVkZXMiLCJnZXRJbml0aWFsU3RhdGUiLCJpbnZva2VGcm9tUmVuZGVyZXIiLCJmb3J3YXJkVG9NYWluIiwiYXBpIiwiaGFuZGxlRnJvbVJlbmRlcmVyIiwiZGlzcGF0Y2giLCJuZXh0IiwiQVBQX1BBVEhfU0VUIiwiQVBQX1ZFUlNJT05fU0VUIiwiQVBQX1NFVFRJTkdTX0xPQURFRCIsIkFQUF9BTExPV0VEX05UTE1fQ1JFREVOVElBTFNfRE9NQUlOU19TRVQiLCJBUFBfTUFJTl9XSU5ET1dfVElUTEVfU0VUIiwiQVBQX01BQ0hJTkVfVEhFTUVfU0VUIiwiYWxsb3dlZE5UTE1DcmVkZW50aWFsc0RvbWFpbnMiLCJzdGF0ZSIsImFwcFBhdGgiLCJhcHBWZXJzaW9uIiwibWFjaGluZVRoZW1lIiwibWFpbldpbmRvd1RpdGxlIiwiRE9XTkxPQURfQ1JFQVRFRCIsIkRPV05MT0FEX1JFTU9WRUQiLCJET1dOTE9BRFNfQ0xFQVJFRCIsIkRPV05MT0FEX1VQREFURUQiLCJEb3dubG9hZFN0YXR1cyIsIkFMTCIsIlBBVVNFRCIsIkNBTkNFTExFRCIsImRvd25sb2FkcyIsIl9hY3Rpb24kcGF5bG9hZCRkb3dubCIsImluaXREb3dubG9hZHMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJmb3JFYWNoIiwidmFsdWUiLCJzdGF0dXMiLCJkb3dubG9hZCIsIml0ZW1JZCIsIm5ld1N0YXRlIiwiSklUU0lfU0VSVkVSX0NBUFRVUkVfU0NSRUVOX1BFUk1JU1NJT05fVVBEQVRFRCIsIkpJVFNJX1NFUlZFUl9DQVBUVVJFX1NDUkVFTl9QRVJNSVNTSU9OU19DTEVBUkVEIiwiYWxsb3dlZEppdHNpU2VydmVycyIsImppdHNpU2VydmVyIiwiYWxsb3dlZCIsIkNFUlRJRklDQVRFU19DTEVBUkVEIiwiQ0VSVElGSUNBVEVTX0xPQURFRCIsIkNFUlRJRklDQVRFU19DTElFTlRfQ0VSVElGSUNBVEVfUkVRVUVTVEVEIiwiVFJVU1RFRF9DRVJUSUZJQ0FURVNfVVBEQVRFRCIsIk5PVF9UUlVTVEVEX0NFUlRJRklDQVRFU19VUERBVEVEIiwiU0VMRUNUX0NMSUVOVF9DRVJUSUZJQ0FURV9ESUFMT0dfQ0VSVElGSUNBVEVfU0VMRUNURUQiLCJTRUxFQ1RfQ0xJRU5UX0NFUlRJRklDQVRFX0RJQUxPR19ESVNNSVNTRUQiLCJFWFRFUk5BTF9QUk9UT0NPTF9QRVJNSVNTSU9OX1VQREFURUQiLCJjbGllbnRDZXJ0aWZpY2F0ZXMiLCJ0cnVzdGVkQ2VydGlmaWNhdGVzIiwibm90VHJ1c3RlZENlcnRpZmljYXRlcyIsImV4dGVybmFsUHJvdG9jb2xzIiwicHJvdG9jb2wiLCJERUVQX0xJTktTX1NFUlZFUl9BRERFRCIsIkRFRVBfTElOS1NfU0VSVkVSX0ZPQ1VTRUQiLCJPVVRMT09LX0NBTEVOREFSX1NFVF9DUkVERU5USUFMUyIsIk9VVExPT0tfQ0FMRU5EQVJfQVNLX0NSRURFTlRJQUxTIiwiT1VUTE9PS19DQUxFTkRBUl9ESUFMT0dfRElTTUlTU0VEIiwiT1VUTE9PS19DQUxFTkRBUl9TQVZFX0NSRURFTlRJQUxTIiwiQUJPVVRfRElBTE9HX0RJU01JU1NFRCIsIkFCT1VUX0RJQUxPR19UT0dHTEVfVVBEQVRFX09OX1NUQVJUIiwiQUJPVVRfRElBTE9HX1VQREFURV9DSEFOTkVMX0NIQU5HRUQiLCJBRERfU0VSVkVSX1ZJRVdfU0VSVkVSX0FEREVEIiwiTUVOVV9CQVJfQUJPVVRfQ0xJQ0tFRCIsIk1FTlVfQkFSX0FERF9ORVdfU0VSVkVSX0NMSUNLRUQiLCJNRU5VX0JBUl9TRUxFQ1RfU0VSVkVSX0NMSUNLRUQiLCJNRU5VX0JBUl9UT0dHTEVfSVNfTUVOVV9CQVJfRU5BQkxFRF9DTElDS0VEIiwiTUVOVV9CQVJfVE9HR0xFX0lTX1NIT1dfV0lORE9XX09OX1VOUkVBRF9DSEFOR0VEX0VOQUJMRURfQ0xJQ0tFRCIsIk1FTlVfQkFSX1RPR0dMRV9JU19TSURFX0JBUl9FTkFCTEVEX0NMSUNLRUQiLCJNRU5VX0JBUl9UT0dHTEVfSVNfVFJBWV9JQ09OX0VOQUJMRURfQ0xJQ0tFRCIsIk1FTlVfQkFSX1RPR0dMRV9JU19ERVZFTE9QRVJfTU9ERV9FTkFCTEVEX0NMSUNLRUQiLCJNRU5VX0JBUl9UT0dHTEVfSVNfVklERU9fQ0FMTF9ERVZUT09MU19BVVRPX09QRU5fRU5BQkxFRF9DTElDS0VEIiwiUk9PVF9XSU5ET1dfSUNPTl9DSEFOR0VEIiwiUk9PVF9XSU5ET1dfU1RBVEVfQ0hBTkdFRCIsIlZJREVPX0NBTExfV0lORE9XX1NUQVRFX0NIQU5HRUQiLCJTSURFX0JBUl9BRERfTkVXX1NFUlZFUl9DTElDS0VEIiwiU0lERV9CQVJfRE9XTkxPQURTX0JVVFRPTl9DTElDS0VEIiwiU0lERV9CQVJfU0VUVElOR1NfQlVUVE9OX0NMSUNLRUQiLCJTSURFX0JBUl9SRU1PVkVfU0VSVkVSX0NMSUNLRUQiLCJTSURFX0JBUl9TRVJWRVJfU0VMRUNURUQiLCJTSURFX0JBUl9TRVJWRVJTX1NPUlRFRCIsIlRPVUNIX0JBUl9GT1JNQVRfQlVUVE9OX1RPVUNIRUQiLCJUT1VDSF9CQVJfU0VMRUNUX1NFUlZFUl9UT1VDSEVEIiwiVVBEQVRFX0RJQUxPR19ESVNNSVNTRUQiLCJVUERBVEVfRElBTE9HX0lOU1RBTExfQlVUVE9OX0NMSUNLRUQiLCJVUERBVEVfRElBTE9HX1JFTUlORF9VUERBVEVfTEFURVJfQ0xJQ0tFRCIsIlVQREFURV9ESUFMT0dfU0tJUF9VUERBVEVfQ0xJQ0tFRCIsIldFQlZJRVdfUkVBRFkiLCJXRUJWSUVXX0FUVEFDSEVEIiwiV0VCVklFV19ESURfRkFJTF9MT0FEIiwiV0VCVklFV19ESURfTkFWSUdBVEUiLCJXRUJWSUVXX0RJRF9TVEFSVF9MT0FESU5HIiwiV0VCVklFV19GQVZJQ09OX0NIQU5HRUQiLCJXRUJWSUVXX0ZPQ1VTX1JFUVVFU1RFRCIsIldFQlZJRVdfTUVTU0FHRV9CT1hfQkxVUlJFRCIsIldFQlZJRVdfTUVTU0FHRV9CT1hfRk9DVVNFRCIsIldFQlZJRVdfU0NSRUVOX1NIQVJJTkdfU09VUkNFX1JFUVVFU1RFRCIsIldFQlZJRVdfU0NSRUVOX1NIQVJJTkdfU09VUkNFX1JFU1BPTkRFRCIsIldFQlZJRVdfU0lERUJBUl9TVFlMRV9DSEFOR0VEIiwiV0VCVklFV19TSURFQkFSX0NVU1RPTV9USEVNRV9DSEFOR0VEIiwiV0VCVklFV19HSVRfQ09NTUlUX0hBU0hfQ0hBTkdFRCIsIldFQlZJRVdfR0lUX0NPTU1JVF9IQVNIX0NIRUNLIiwiV0VCVklFV19USVRMRV9DSEFOR0VEIiwiV0VCVklFV19QQUdFX1RJVExFX0NIQU5HRUQiLCJXRUJWSUVXX1VOUkVBRF9DSEFOR0VEIiwiV0VCVklFV19VU0VSX0xPR0dFRF9JTiIsIldFQlZJRVdfVVNFUl9USEVNRV9BUFBFQVJBTkNFX0NIQU5HRUQiLCJXRUJWSUVXX0FMTE9XRURfUkVESVJFQ1RTX0NIQU5HRUQiLCJTRVRUSU5HU19TRVRfUkVQT1JUX09QVF9JTl9DSEFOR0VEIiwiU0VUVElOR1NfU0VUX0ZMQVNIRlJBTUVfT1BUX0lOX0NIQU5HRUQiLCJTRVRUSU5HU19TRVRfSEFSRFdBUkVfQUNDRUxFUkFUSU9OX09QVF9JTl9DSEFOR0VEIiwiU0VUVElOR1NfU0VUX0lOVEVSTkFMVklERU9DSEFUV0lORE9XX09QVF9JTl9DSEFOR0VEIiwiU0VUVElOR1NfU0VUX01JTklNSVpFX09OX0NMT1NFX09QVF9JTl9DSEFOR0VEIiwiU0VUVElOR1NfU0VUX0lTX1RSQVlfSUNPTl9FTkFCTEVEX0NIQU5HRUQiLCJTRVRUSU5HU19TRVRfSVNfU0lERV9CQVJfRU5BQkxFRF9DSEFOR0VEIiwiU0VUVElOR1NfU0VUX0lTX01FTlVfQkFSX0VOQUJMRURfQ0hBTkdFRCIsIlNFVFRJTkdTX1NFVF9JU19WSURFT19DQUxMX1dJTkRPV19QRVJTSVNURU5DRV9FTkFCTEVEX0NIQU5HRUQiLCJTRVRUSU5HU19TRVRfSVNfREVWRUxPUEVSX01PREVfRU5BQkxFRF9DSEFOR0VEIiwiU0VUVElOR1NfU0VUX0lTX1ZJREVPX0NBTExfREVWVE9PTFNfQVVUT19PUEVOX0VOQUJMRURfQ0hBTkdFRCIsIlNFVFRJTkdTX05UTE1fQ1JFREVOVElBTFNfQ0hBTkdFRCIsIlNFVFRJTkdTX0FWQUlMQUJMRV9CUk9XU0VSU19VUERBVEVEIiwiU0VUVElOR1NfU0VMRUNURURfQlJPV1NFUl9DSEFOR0VEIiwiU0VUX0hBU19UUkFZX01JTklNSVpFX05PVElGSUNBVElPTl9TSE9XTiIsIkRPV05MT0FEU19CQUNLX0JVVFRPTl9DTElDS0VEIiwiV0VCVklFV19TRVJWRVJfU1VQUE9SVEVEX1ZFUlNJT05TX1VQREFURUQiLCJXRUJWSUVXX1NFUlZFUl9VTklRVUVfSURfVVBEQVRFRCIsIldFQlZJRVdfU0VSVkVSX0lTX1NVUFBPUlRFRF9WRVJTSU9OIiwiV0VCVklFV19TRVJWRVJfVkVSU0lPTl9VUERBVEVEIiwiU1VQUE9SVEVEX1ZFUlNJT05fRElBTE9HX0RJU01JU1MiLCJTRVJWRVJTX0xPQURFRCIsIlNFUlZFUl9ET0NVTUVOVF9WSUVXRVJfT1BFTl9VUkwiLCJlbnN1cmVVcmxGb3JtYXQiLCJVUkwiLCJocmVmIiwidXBzZXJ0Iiwic2VydmVyIiwiaW5kZXgiLCJmaW5kSW5kZXgiLCJ1cmwiLCJfc2VydmVyIiwiaSIsInVwZGF0ZSIsInNlcnZlcnMiLCJ0aXRsZSIsIl91cmwiLCJmaWx0ZXIiLCJ1cmxzIiwic29ydCIsImEiLCJiIiwiaW5kZXhPZiIsInBhZ2VUaXRsZSIsInN1cHBvcnRlZFZlcnNpb25zIiwic3VwcG9ydGVkVmVyc2lvbnNTb3VyY2UiLCJleHBpcmF0aW9uTWVzc2FnZUxhc3RUaW1lU2hvd24iLCJEYXRlIiwidW5pcXVlSUQiLCJ0aGVtZUFwcGVhcmFuY2UiLCJpc1N1cHBvcnRlZFZlcnNpb24iLCJ2ZXJzaW9uIiwiYmFkZ2UiLCJ1c2VyTG9nZ2VkSW4iLCJhbGxvd2VkUmVkaXJlY3RzIiwic3R5bGUiLCJjdXN0b21UaGVtZSIsImdpdENvbW1pdEhhc2giLCJmYXZpY29uIiwicGFnZVVybCIsImxhc3RQYXRoIiwiZmFpbGVkIiwiaXNNYWluRnJhbWUiLCJkb2N1bWVudFZpZXdlck9wZW5VcmwiLCJ3ZWJDb250ZW50c0lkIiwib3V0bG9va0NyZWRlbnRpYWxzIiwiZG9jdW1lbnRVcmwiLCJhdmFpbGFibGVCcm93c2VycyIsImN1cnJlbnRWaWV3IiwidmlldyIsInNlbGVjdGVkIiwiaGFzSGlkZU9uVHJheU5vdGlmaWNhdGlvblNob3duIiwiQm9vbGVhbiIsImlzQWRkTmV3U2VydmVyc0VuYWJsZWQiLCJpc0RldmVsb3Blck1vZGVFbmFibGVkIiwiVVBEQVRFX1NLSVBQRUQiLCJVUERBVEVTX0NIRUNLSU5HX0ZPUl9VUERBVEUiLCJVUERBVEVTX0VSUk9SX1RIUk9XTiIsIlVQREFURVNfTkVXX1ZFUlNJT05fQVZBSUxBQkxFIiwiVVBEQVRFU19ORVdfVkVSU0lPTl9OT1RfQVZBSUxBQkxFIiwiVVBEQVRFU19SRUFEWSIsIlVQREFURVNfQ0hBTk5FTF9DSEFOR0VEIiwiaXNGbGFzaEZyYW1lRW5hYmxlZCIsImlzSGFyZHdhcmVBY2NlbGVyYXRpb25FbmFibGVkIiwiaXNJbnRlcm5hbFZpZGVvQ2hhdFdpbmRvd0VuYWJsZWQiLCJpc01lbnVCYXJFbmFibGVkIiwiaXNNZXNzYWdlQm94Rm9jdXNlZCIsImlzTWluaW1pemVPbkNsb3NlRW5hYmxlZCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsImlzTlRMTUNyZWRlbnRpYWxzRW5hYmxlZCIsImlzUmVwb3J0RW5hYmxlZCIsImlzU2hvd1dpbmRvd09uVW5yZWFkQ2hhbmdlZEVuYWJsZWQiLCJpc1NpZGVCYXJFbmFibGVkIiwiaXNUcmF5SWNvbkVuYWJsZWQiLCJpc1ZpZGVvQ2FsbERldnRvb2xzQXV0b09wZW5FbmFibGVkIiwiaXNWaWRlb0NhbGxXaW5kb3dQZXJzaXN0ZW5jZUVuYWJsZWQiLCJsYXN0U2VsZWN0ZWRTZXJ2ZXJVcmwiLCJsZW5ndGgiLCJTQ1JFRU5fU0hBUklOR19ESUFMT0dfRElTTUlTU0VEIiwib3BlbkRpYWxvZyIsInJvb3RXaW5kb3dJY29uIiwicm9vdFdpbmRvd1N0YXRlIiwiZm9jdXNlZCIsInZpc2libGUiLCJtYXhpbWl6ZWQiLCJtaW5pbWl6ZWQiLCJmdWxsc2NyZWVuIiwibm9ybWFsIiwiYm91bmRzIiwieCIsInVuZGVmaW5lZCIsInkiLCJ3aWR0aCIsImhlaWdodCIsInNlbGVjdGVkQnJvd3NlciIsInZpZGVvQ2FsbFdpbmRvd1N0YXRlIiwiZG9DaGVja0ZvclVwZGF0ZXNPblN0YXJ0dXAiLCJpc0NoZWNraW5nRm9yVXBkYXRlcyIsImlzRWFjaFVwZGF0ZXNTZXR0aW5nQ29uZmlndXJhYmxlIiwiaXNVcGRhdGluZ0FsbG93ZWQiLCJpc1VwZGF0aW5nRW5hYmxlZCIsIm5ld1VwZGF0ZVZlcnNpb24iLCJza2lwcGVkVXBkYXRlVmVyc2lvbiIsInVwZGF0ZUVycm9yIiwidXBkYXRlQ2hhbm5lbCIsInJvb3RSZWR1Y2VyIiwiY29tYmluZVJlZHVjZXJzIiwicmVkdXhTdG9yZSIsImxhc3RBY3Rpb24iLCJjYXRjaExhc3RBY3Rpb24iLCJjcmVhdGVSZW5kZXJlclJlZHV4U3RvcmUiLCJpbml0aWFsU3RhdGUiLCJjb21wb3NlRW5oYW5jZXJzIiwiX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fQ09NUE9TRV9fIiwiY29tcG9zZSIsImVuaGFuY2VycyIsImFwcGx5TWlkZGxld2FyZSIsImNyZWF0ZVN0b3JlIiwic2VsZWN0Iiwic2VsZWN0b3IiLCJnZXRTdGF0ZSIsIndhdGNoIiwid2F0Y2hlciIsImluaXRpYWwiLCJwcmV2Iiwic3Vic2NyaWJlIiwiY3VyciIsImlzIiwibGlzdGVuIiwidHlwZU9yUHJlZGljYXRlIiwiZWZmZWN0aXZlUHJlZGljYXRlIiwicmVxdWVzdCIsInJlcXVlc3RBY3Rpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwidW5zdWJzY3JpYmUiLCJOT1RJRklDQVRJT05TX0NSRUFURV9SRVFVRVNURUQiLCJOT1RJRklDQVRJT05TX0NSRUFURV9SRVNQT05ERUQiLCJOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9BQ1RJT05FRCIsIk5PVElGSUNBVElPTlNfTk9USUZJQ0FUSU9OX0NMSUNLRUQiLCJOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9DTE9TRUQiLCJOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9ESVNNSVNTRUQiLCJOT1RJRklDQVRJT05TX05PVElGSUNBVElPTl9SRVBMSUVEIiwiTk9USUZJQ0FUSU9OU19OT1RJRklDQVRJT05fU0hPV04iLCJub3JtYWxpemVJY29uVXJsIiwiaWNvblVybCIsInRlc3QiLCJldmVudEhhbmRsZXJzIiwiTWFwIiwiY3JlYXRlTm90aWZpY2F0aW9uIiwiaWNvbiIsIm9uRXZlbnQiLCJzZXQiLCJldmVudCIsImRldGFpbCIsImRlc3Ryb3lOb3RpZmljYXRpb24iLCJkZWxldGUiLCJsaXN0ZW5Ub05vdGlmaWNhdGlvbnNSZXF1ZXN0cyIsImV2ZW50SGFuZGxlciIsImdldCIsInJlcGx5IiwiaGFuZGxlR2V0U291cmNlSWRFdmVudCIsIl93aW5kb3ckdG9wIiwic291cmNlSWQiLCJ0b3AiLCJwb3N0TWVzc2FnZSIsIl93aW5kb3ckdG9wMiIsImxpc3RlblRvU2NyZWVuU2hhcmluZ1JlcXVlc3RzIiwiYWRkRXZlbnRMaXN0ZW5lciIsImdldE91dGxvb2tFdmVudHMiLCJkYXRlIiwic2V0T3V0bG9va0V4Y2hhbmdlVXJsIiwidXNlcklkIiwiaGFzT3V0bG9va0NyZWRlbnRpYWxzIiwiY2xlYXJPdXRsb29rQ3JlZGVudGlhbHMiLCJzZXRVc2VyVG9rZW4iLCJ0b2tlbiIsIlNZU1RFTV9MT0NLSU5HX1NDUkVFTiIsIlNZU1RFTV9TVVNQRU5ESU5HIiwiZGV0YWNoQ2FsbGJhY2tzIiwiYXR0YWNoQ2FsbGJhY2tzIiwiaXNBdXRvQXdheUVuYWJsZWQiLCJpZGxlVGhyZXNob2xkIiwic2V0VXNlck9ubGluZSIsInVuc3Vic2NyaWJlRnJvbVBvd2VyTW9uaXRvckV2ZW50cyIsInBvbGxpbmdUaW1lciIsInByZXZTdGF0ZSIsInBvbGxTeXN0ZW1JZGxlU3RhdGUiLCJzZXRUaW1lb3V0IiwiaXNPbmxpbmUiLCJjbGVhclRpbWVvdXQiLCJzZXRVc2VyUHJlc2VuY2VEZXRlY3Rpb24iLCJfZGV0YWNoQ2FsbGJhY2tzIiwic2V0QmFkZ2UiLCJ3cml0ZVRleHRUb0NsaXBib2FyZCIsInRleHQiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJvcGVuRG9jdW1lbnRWaWV3ZXIiLCJmb3JtYXQiLCJGQVZJQ09OX1NJWkUiLCJpbWFnZUVsZW1lbnQiLCJnZXRJbWFnZUVsZW1lbnQiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjdHgiLCJnZXRDb250ZXh0IiwiSW1hZ2UiLCJoYW5kbGVJbWFnZUxvYWRFdmVudCIsImNsZWFyUmVjdCIsImRyYXdJbWFnZSIsInBhc3NpdmUiLCJzZXRGYXZpY29uIiwiZmF2aWNvblVybCIsInNyYyIsInNldEdpdENvbW1pdEhhc2giLCJyZWFkU2V0dGluZyIsImtleSIsImZpbGVQYXRoIiwicGF0aCIsImpvaW4iLCJhcHAiLCJnZXRQYXRoIiwiY29udGVudCIsImZzIiwicmVhZEZpbGVTeW5jIiwianNvbiIsIkpTT04iLCJwYXJzZSIsImUiLCJjYWNoZWRCcm93c2VycyIsImJyb3dzZXJMb2FkUHJvbWlzZSIsImxvYWRCcm93c2Vyc0xhenkiLCJicm93c2VycyIsImdldEF2YWlsYWJsZUJyb3dzZXJzIiwiYnJvd3NlcklkcyIsImJyb3dzZXIiLCJvcGVuRXh0ZXJuYWwiLCJzaGVsbCIsImZpbmQiLCJsYXVuY2hCcm93c2VyIiwid2FybiIsImdldEludGVybmFsVmlkZW9DaGF0V2luZG93RW5hYmxlZCIsIm9wZW5JbnRlcm5hbFZpZGVvQ2hhdFdpbmRvdyIsInZhbGlkVXJsIiwiYWxsb3dlZFByb3RvY29scyIsIm1hcyIsInByb3ZpZGVyTmFtZSIsInRpbWVyIiwicHJldkJhY2tncm91bmQiLCJwcmV2Q29sb3IiLCJwcmV2Qm9yZGVyIiwic2VydmVyVmVyc2lvbiIsInZlcnNpb25Jc0dyZWF0ZXJPckVxdWFsc1RvIiwidmVyc2lvbjEiLCJ2ZXJzaW9uMiIsIl92ZXJzaW9uMSRtYXRjaCIsIl92ZXJzaW9uMiRtYXRjaCIsInYxIiwibWF0Y2giLCJOdW1iZXIiLCJ2MiIsIm4xIiwibjIiLCJwb2xsU2lkZWJhclN0eWxlIiwicmVmZXJlbmNlRWxlbWVudCIsImVtaXQiLCJib2R5IiwiYXBwZW5kIiwiYmFja2dyb3VuZCIsImNvbG9yIiwiYm9yZGVyIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsInJlbW92ZSIsIm5ld0JnZyIsIm5ld0NvbG9yIiwibmV3Qm9yZGVyIiwiZWxlbWVudCIsImdldEVsZW1lbnQiLCJiYWNrZ3JvdW5kQ29sb3IiLCJkaXNwbGF5IiwiY2xhc3NMaXN0IiwiYWRkIiwic2V0U2VydmVyVmVyc2lvblRvU2lkZWJhciIsInNldEJhY2tncm91bmQiLCJpbWFnZVVybCIsImJhY2tncm91bmRJbWFnZSIsInN0cmluZ2lmeSIsInNpZGVCYXJTdHlsZSIsInNldFNpZGViYXJDdXN0b21UaGVtZSIsInNldFVzZXJUaGVtZUFwcGVhcmFuY2UiLCJzZXRUaXRsZSIsImhvc3QiLCJzZXRVc2VyTG9nZ2VkSW4iLCJzZXJ2ZXJJbmZvIiwiY2IiLCJfc2VydmVySW5mbyIsIlJvY2tldENoYXREZXNrdG9wIiwib25SZWFkeSIsImMiLCJzZXRTZXJ2ZXJJbmZvIiwiZGVib3VuY2UiLCJ3YWl0IiwiaCIsImNhbGxhYmxlIiwiZm9jdXNlZE1lc3NhZ2VCb3hJbnB1dCIsImhhbmRsZUZvY3VzRXZlbnQiLCJ0YXJnZXQiLCJFbGVtZW50IiwiY29udGFpbnMiLCJoYW5kbGVCbHVyRXZlbnQiLCJsaXN0ZW5Ub01lc3NhZ2VCb3hFdmVudHMiLCJidXR0b25JZCIsImFuY2VzdG9yIiwiY2xvc2VzdCIsImJ1dHRvbiIsInF1ZXJ5U2VsZWN0b3IiLCJjbGljayIsInNlbGVjdElzU2lkZUJhclZpc2libGUiLCJoYW5kbGVUcmFmZmljTGlnaHRzU3BhY2luZyIsImdldEVsZW1lbnRCeUlkIiwiaGVhZCIsImlzU2lkZUJhclZpc2libGUiLCJpbm5lckhUTUwiLCJ3aGVuUmVhZHkiLCJyZWFkeVN0YXRlIiwiaGFuZGxlUmVhZHlTdGF0ZUNoYW5nZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjb250ZXh0QnJpZGdlIiwiZXhwb3NlSW5NYWluV29ybGQiLCJyZXRyeUNvdW50Iiwic3RhcnQiLCJyZXNvdXJjZXMiLCJ3ZWJGcmFtZSIsImdldFJlc291cmNlVXNhZ2UiLCJpbWFnZXMiLCJzaXplIiwiY2xlYXJDYWNoZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUtPLE1BQU1BLE1BQU0sR0FBR0EsQ0FDcEJDLE9BQVUsRUFDVkMsT0FBNkUsS0FDNUQ7RUFDakIsTUFBTUMsUUFBUSxHQUFHLE9BQ2ZDLENBQW1CLEVBQ25CQyxFQUFVLEVBQ1YsR0FBR0MsSUFBVyxLQUNJO0lBQ2xCLElBQUk7QUFDRixNQUFBLE1BQU1DLFFBQVEsR0FBRyxNQUFNTCxPQUFPLENBQUMsR0FBSUksSUFBK0IsQ0FBQyxDQUFBO01BRW5FRSxvQkFBVyxDQUFDQyxJQUFJLENBQUMsQ0FBQSxFQUFHUixPQUFPLENBQUlJLENBQUFBLEVBQUFBLEVBQUUsRUFBRSxFQUFFO0FBQUVFLFFBQUFBLFFBQUFBO0FBQVMsT0FBQyxDQUFDLENBQUE7S0FDbkQsQ0FBQyxPQUFPRyxLQUFLLEVBQUU7QUFDZEEsTUFBQUEsS0FBSyxZQUFZQyxLQUFLLElBQ3BCSCxvQkFBVyxDQUFDQyxJQUFJLENBQUMsQ0FBQSxFQUFHUixPQUFPLENBQUEsQ0FBQSxFQUFJSSxFQUFFLENBQUEsQ0FBRSxFQUFFO0FBQ25DTyxRQUFBQSxRQUFRLEVBQUU7VUFDUkMsSUFBSSxFQUFHSCxLQUFLLENBQVdHLElBQUk7VUFDM0JDLE9BQU8sRUFBR0osS0FBSyxDQUFXSSxPQUFPO1VBQ2pDQyxLQUFLLEVBQUdMLEtBQUssQ0FBV0ssS0FBQUE7QUFDMUIsU0FBQTtBQUNGLE9BQUMsQ0FBQyxDQUFBO0FBQ04sS0FBQTtHQUNELENBQUE7QUFFRFAsRUFBQUEsb0JBQVcsQ0FBQ1EsRUFBRSxDQUFDZixPQUFPLEVBQUVFLFFBQVEsQ0FBQyxDQUFBO0FBRWpDLEVBQUEsT0FBTyxNQUFNO0FBQ1hLLElBQUFBLG9CQUFXLENBQUNTLGNBQWMsQ0FBQ2hCLE9BQU8sRUFBRUUsUUFBUSxDQUFDLENBQUE7R0FDOUMsQ0FBQTtB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
