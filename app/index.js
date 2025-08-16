'use strict';

var electron = require('electron');

function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

/**
 * Jitsi Meet External API Interface
 */
// eslint-disable-next-line @typescript-eslint/naming-convention

// eslint-disable-next-line @typescript-eslint/naming-convention

/**
 * Options for Jitsi Meet External API
 */
// eslint-disable-next-line @typescript-eslint/naming-convention

/**
 * Interface for the Jitsi Bridge
 */
// eslint-disable-next-line @typescript-eslint/naming-convention

/**
 * Configuration for Jitsi Bridge initialization
 */
// eslint-disable-next-line @typescript-eslint/naming-convention

/**
 * JitsiBridge - Bridge between Electron application and Jitsi Meet's External API
 * Handles initialization, event handling, and screen sharing coordination
 */
class JitsiBridgeImpl {
  constructor() {
    _defineProperty(this, "jitsiApi", null);
    _defineProperty(this, "isApiInitialized", false);
    _defineProperty(this, "domain", '');
    _defineProperty(this, "roomName", '');
    // @ts-expect-error: variable is used in the implementation
    _defineProperty(this, "displayName", '');
    // @ts-expect-error: variable is used in the implementation
    _defineProperty(this, "options", {});
    _defineProperty(this, "detectionInProgress", false);
    console.log('JitsiBridge: Initializing detection mechanisms');
    this.setupDetection();
  }

  /**
   * Initialize detection mechanisms to automatically detect Jitsi meetings
   * and set up appropriate listeners
   */
  setupDetection() {
    // Set up mutation observer to detect when Jitsi iframes are added to the DOM
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          this.detectJitsiMeeting();
        }
      }
    });

    // Start observing once DOM is loaded
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.detectJitsiMeeting();
    });

    // Also check on page load
    window.addEventListener('load', () => {
      this.detectJitsiMeeting();
    });
  }

  /**
   * Detect if current page is a Jitsi meeting
   */
  async detectJitsiMeeting() {
    if (this.detectionInProgress || this.isApiInitialized) return;
    this.detectionInProgress = true;
    try {
      // Check URL for Jitsi patterns
      if (this.isJitsiMeetingUrl(window.location.href)) {
        console.log('JitsiBridge: Detected Jitsi meeting URL:', window.location.href);

        // Parse domain and room name from URL
        const url = new URL(window.location.href);
        this.domain = url.hostname;
        this.roomName = this.extractRoomNameFromUrl(url);
        if (this.domain && this.roomName) {
          await this.initializeJitsiApi({
            domain: this.domain,
            roomName: this.roomName
          });
        }
      }

      // Check for Jitsi iframes
      const jitsiIframes = this.findJitsiIframes();
      if (jitsiIframes.length > 0) {
        const iframe = jitsiIframes[0];
        console.log('JitsiBridge: Detected Jitsi iframe:', iframe);
        try {
          const frameUrl = new URL(iframe.src);
          this.domain = frameUrl.hostname;
          this.roomName = this.extractRoomNameFromUrl(frameUrl);
          if (this.domain && this.roomName) {
            await this.initializeJitsiApi({
              domain: this.domain,
              roomName: this.roomName,
              options: {
                parentNode: iframe.parentElement || undefined
              }
            });
          }
        } catch (e) {
          console.error('JitsiBridge: Error parsing iframe URL:', e);
        }
      }
    } finally {
      this.detectionInProgress = false;
    }
  }

  /**
   * Find any iframes that might be Jitsi meetings
   */
  findJitsiIframes() {
    return Array.from(document.querySelectorAll('iframe')).filter(iframe => {
      if (!iframe.src) return false;
      return this.isJitsiMeetingUrl(iframe.src);
    });
  }

  /**
   * Check if a URL is likely a Jitsi meeting
   */
  isJitsiMeetingUrl(url) {
    try {
      const parsedUrl = new URL(url);

      // Check for known Jitsi hosts
      const knownJitsiHosts = ['meet.jit.si', '8x8.vc', 'jitsi.rocket.chat'];
      const isKnownHost = knownJitsiHosts.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`));
      if (isKnownHost) return true;

      // Check URL patterns common in Jitsi deployments
      return url.includes('/meet/') || url.includes('/conference/') || url.includes('?jwt=') || !!parsedUrl.pathname.match(/\/[a-zA-Z0-9_-]{6,}$/);
    } catch (e) {
      console.error('JitsiBridge: Error parsing URL:', e);
      return false;
    }
  }

  /**
   * Extract room name from a Jitsi URL
   */
  extractRoomNameFromUrl(url) {
    // Different Jitsi deployments might have different URL patterns
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // Most Jitsi deployments have the room name as the last path segment
      return pathParts[pathParts.length - 1];
    }
    return '';
  }

  /**
   * Initialize the Jitsi Meet External API
   */
  async initializeJitsiApi(config) {
    if (this.isApiInitialized) {
      console.log('JitsiBridge: API already initialized');
      return true;
    }
    if (!(config !== null && config !== void 0 && config.domain) || !config.roomName) {
      console.error('JitsiBridge: Invalid configuration');
      return false;
    }

    // Store configuration
    this.domain = config.domain;
    this.roomName = config.roomName;
    this.displayName = config.displayName || '';
    this.options = config.options || {};
    try {
      // Load the external API script if needed
      if (!window.JitsiMeetExternalAPI) {
        await this.loadJitsiScript(this.domain);
      }
      console.log('JitsiBridge: Creating Jitsi Meet External API instance');

      // We don't actually create a new instance with the External API
      // because we don't want to create a new iframe when one might already exist
      // Instead, we just initialize our event listeners for the existing iframe

      // Set up event listeners on the window for iframe communication
      this.setupMessageEventListener();
      this.isApiInitialized = true;
      console.log('JitsiBridge: Jitsi Meet External API initialized successfully');
      return true;
    } catch (error) {
      console.error('JitsiBridge: Error initializing Jitsi Meet External API:', error);
      return false;
    }
  }

  /**
   * Load the Jitsi Meet External API script
   */
  async loadJitsiScript(domain) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Ensure we use https
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'https:';
      script.src = `${protocol}//${domain}/external_api.js`;
      script.async = true;
      script.onload = () => {
        console.log('JitsiBridge: Jitsi Meet External API script loaded');
        resolve();
      };
      script.onerror = error => {
        console.error('JitsiBridge: Error loading Jitsi Meet External API script:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Set up window message event listener to communicate with the Jitsi iframe
   */
  setupMessageEventListener() {
    window.addEventListener('message', event => {
      try {
        const {
          data
        } = event;

        // Handle screen sharing requests from Jitsi
        if (data && typeof data === 'object' && data.type === 'request-desktop-picker') {
          console.log('JitsiBridge: Received screen sharing request from Jitsi');
          this.handleScreenSharingRequest();
        }
      } catch (e) {
        console.error('JitsiBridge: Error handling message event:', e);
      }
    }, false);
  }

  /**
   * Handle screen sharing requests from Jitsi
   */
  handleScreenSharingRequest() {
    // Directly invoke the screen picker
    electron.ipcRenderer.invoke('video-call-window/open-screen-picker').then(() => {
      // Listener for the selected source remains the same
      electron.ipcRenderer.once('video-call-window/screen-sharing-source-responded', (_event, sourceId) => {
        if (!sourceId) {
          console.log('JitsiBridge: Screen sharing cancelled');
          this.sendMessageToJitsiIframe({
            type: 'screen-sharing-canceled'
          });
          return;
        }
        console.log('JitsiBridge: Screen sharing source selected:', sourceId);

        // Send the selected source ID to Jitsi
        this.sendMessageToJitsiIframe({
          type: 'selected-screen-share-source',
          sourceId
        });
      });
    });
  }

  /**
   * Start screen sharing
   */
  async startScreenSharing() {
    console.log('JitsiBridge: Start screen sharing requested');
    try {
      // Direct invoke to screen picker
      await electron.ipcRenderer.invoke('video-call-window/open-screen-picker');
      return new Promise(resolve => {
        electron.ipcRenderer.once('video-call-window/screen-sharing-source-responded', (_event, sourceId) => {
          if (!sourceId) {
            console.log('JitsiBridge: Screen sharing cancelled');
            resolve(false);
            return;
          }
          console.log('JitsiBridge: Screen sharing source selected:', sourceId);

          // Send the selected source ID to Jitsi
          this.sendMessageToJitsiIframe({
            type: 'selected-screen-share-source',
            sourceId
          });
          resolve(true);
        });
      });
    } catch (error) {
      console.error('JitsiBridge: Error starting screen sharing:', error);
      return false;
    }
  }

  /**
   * Send a message to the Jitsi iframe
   */
  sendMessageToJitsiIframe(message) {
    const jitsiIframes = document.querySelectorAll('iframe');
    for (const iframe of Array.from(jitsiIframes)) {
      if (iframe.src && this.isJitsiMeetingUrl(iframe.src)) {
        var _iframe$contentWindow;
        (_iframe$contentWindow = iframe.contentWindow) === null || _iframe$contentWindow === void 0 || _iframe$contentWindow.postMessage(message, '*');
        console.log('JitsiBridge: Sent message to Jitsi iframe:', message);
        return;
      }
    }
    console.warn('JitsiBridge: No Jitsi iframe found to send message');
  }

  /**
   * End the current call
   */
  endCall() {
    console.log('JitsiBridge: End call requested');
    if (this.jitsiApi) {
      this.jitsiApi.executeCommand('hangup');
    } else {
      this.sendMessageToJitsiIframe({
        type: 'hangup'
      });
    }
    this.dispose();
  }

  /**
   * Get the Jitsi Meet version (may not be supported by all deployments)
   */
  async getJitsiVersion() {
    if (!this.isApiInitialized) {
      return 'API not initialized';
    }

    // This functionality might not be available in all Jitsi deployments
    return 'Version not available';
  }

  /**
   * Dispose of the Jitsi Meet External API instance
   */
  dispose() {
    console.log('JitsiBridge: Disposing');
    if (this.jitsiApi) {
      try {
        this.jitsiApi.dispose();
      } catch (e) {
        console.error('JitsiBridge: Error disposing Jitsi API:', e);
      }
      this.jitsiApi = null;
    }
    this.isApiInitialized = false;
  }

  /**
   * Check if the API is initialized
   */
  isInitialized() {
    return this.isApiInitialized;
  }

  /**
   * Get the Jitsi API instance
   */
  getApi() {
    return this.jitsiApi;
  }

  /**
   * Get the current domain
   */
  getCurrentDomain() {
    return this.domain;
  }

  /**
   * Get the current room name
   */
  getCurrentRoomName() {
    return this.roomName;
  }
}

// Create and expose the Jitsi Bridge
const jitsiBridge = new JitsiBridgeImpl();
window.jitsiBridge = jitsiBridge;

// Expose any necessary APIs to the webview content
electron.contextBridge.exposeInMainWorld('videoCallWindow', {
  // Add methods here if needed for communication with the main process
  requestScreenSharing: async () => {
    // Directly invoke the screen picker
    await electron.ipcRenderer.invoke('video-call-window/open-screen-picker');
    return new Promise(resolve => {
      electron.ipcRenderer.once('video-call-window/screen-sharing-source-responded', (_event, id) => {
        resolve(id);
      });
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy92aWRlb0NhbGxXaW5kb3cvcHJlbG9hZC9qaXRzaUJyaWRnZS50cyIsIi4uL3NyYy92aWRlb0NhbGxXaW5kb3cvcHJlbG9hZC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gJ2VsZWN0cm9uJztcblxuLyoqXG4gKiBKaXRzaSBNZWV0IEV4dGVybmFsIEFQSSBJbnRlcmZhY2VcbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxudHlwZSBKaXRzaU1lZXRFeHRlcm5hbEFQSSA9IHtcbiAgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQ7XG4gIGFkZExpc3RlbmVyKGV2ZW50OiBzdHJpbmcsIGxpc3RlbmVyOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiB2b2lkO1xuICByZW1vdmVMaXN0ZW5lcihldmVudDogc3RyaW5nLCBsaXN0ZW5lcjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogdm9pZDtcbiAgZGlzcG9zZSgpOiB2b2lkO1xuICBnZXRJRnJhbWUoKTogSFRNTElGcmFtZUVsZW1lbnQ7XG4gIGdldFBhcnRpY2lwYW50c0luZm8oKTogYW55W107XG4gIGdldFZpZGVvUXVhbGl0eSgpOiBzdHJpbmc7XG4gIGlzQXVkaW9NdXRlZCgpOiBib29sZWFuO1xuICBpc1ZpZGVvTXV0ZWQoKTogYm9vbGVhbjtcbiAgZ2V0TnVtYmVyT2ZQYXJ0aWNpcGFudHMoKTogbnVtYmVyO1xufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuaW50ZXJmYWNlIEppdHNpTWVldEV4dGVybmFsQVBJQ29uc3RydWN0b3Ige1xuICBuZXcgKFxuICAgIGRvbWFpbjogc3RyaW5nLFxuICAgIG9wdGlvbnM6IEppdHNpTWVldEV4dGVybmFsQVBJT3B0aW9uc1xuICApOiBKaXRzaU1lZXRFeHRlcm5hbEFQSTtcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBKaXRzaSBNZWV0IEV4dGVybmFsIEFQSVxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5pbnRlcmZhY2UgSml0c2lNZWV0RXh0ZXJuYWxBUElPcHRpb25zIHtcbiAgcm9vbU5hbWU/OiBzdHJpbmc7XG4gIHdpZHRoPzogc3RyaW5nIHwgbnVtYmVyO1xuICBoZWlnaHQ/OiBzdHJpbmcgfCBudW1iZXI7XG4gIHBhcmVudE5vZGU/OiBFbGVtZW50O1xuICBjb25maWdPdmVyd3JpdGU/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICBpbnRlcmZhY2VDb25maWdPdmVyd3JpdGU/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICBqd3Q/OiBzdHJpbmc7XG4gIG9ubG9hZD86ICgpID0+IHZvaWQ7XG4gIGludml0ZWVzPzogQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xuICBkZXZpY2VzPzoge1xuICAgIGF1ZGlvSW5wdXQ/OiBzdHJpbmc7XG4gICAgYXVkaW9PdXRwdXQ/OiBzdHJpbmc7XG4gICAgdmlkZW9JbnB1dD86IHN0cmluZztcbiAgfTtcbiAgdXNlckluZm8/OiB7XG4gICAgZW1haWw/OiBzdHJpbmc7XG4gICAgZGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gIH07XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBKaXRzaU1lZXRFeHRlcm5hbEFQST86IEppdHNpTWVldEV4dGVybmFsQVBJQ29uc3RydWN0b3I7XG4gICAgaml0c2lCcmlkZ2U/OiBKaXRzaUJyaWRnZTtcbiAgfVxufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIEppdHNpIEJyaWRnZVxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5pbnRlcmZhY2UgSml0c2lCcmlkZ2Uge1xuICBpbml0aWFsaXplSml0c2lBcGkoY29uZmlnOiBKaXRzaUJyaWRnZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj47XG4gIHN0YXJ0U2NyZWVuU2hhcmluZygpOiBQcm9taXNlPGJvb2xlYW4+O1xuICBlbmRDYWxsKCk6IHZvaWQ7XG4gIGdldEppdHNpVmVyc2lvbigpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+O1xuICBkaXNwb3NlKCk6IHZvaWQ7XG4gIGlzSW5pdGlhbGl6ZWQoKTogYm9vbGVhbjtcbiAgZ2V0QXBpKCk6IEppdHNpTWVldEV4dGVybmFsQVBJIHwgbnVsbDtcbiAgZ2V0Q3VycmVudERvbWFpbigpOiBzdHJpbmc7XG4gIGdldEN1cnJlbnRSb29tTmFtZSgpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBmb3IgSml0c2kgQnJpZGdlIGluaXRpYWxpemF0aW9uXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbmludGVyZmFjZSBKaXRzaUJyaWRnZUNvbmZpZyB7XG4gIGRvbWFpbjogc3RyaW5nO1xuICByb29tTmFtZTogc3RyaW5nO1xuICBkaXNwbGF5TmFtZT86IHN0cmluZztcbiAgb3B0aW9ucz86IFBhcnRpYWw8Sml0c2lNZWV0RXh0ZXJuYWxBUElPcHRpb25zPjtcbn1cblxuLyoqXG4gKiBKaXRzaUJyaWRnZSAtIEJyaWRnZSBiZXR3ZWVuIEVsZWN0cm9uIGFwcGxpY2F0aW9uIGFuZCBKaXRzaSBNZWV0J3MgRXh0ZXJuYWwgQVBJXG4gKiBIYW5kbGVzIGluaXRpYWxpemF0aW9uLCBldmVudCBoYW5kbGluZywgYW5kIHNjcmVlbiBzaGFyaW5nIGNvb3JkaW5hdGlvblxuICovXG5jbGFzcyBKaXRzaUJyaWRnZUltcGwgaW1wbGVtZW50cyBKaXRzaUJyaWRnZSB7XG4gIHByaXZhdGUgaml0c2lBcGk6IEppdHNpTWVldEV4dGVybmFsQVBJIHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBpc0FwaUluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBkb21haW4gPSAnJztcblxuICBwcml2YXRlIHJvb21OYW1lID0gJyc7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvcjogdmFyaWFibGUgaXMgdXNlZCBpbiB0aGUgaW1wbGVtZW50YXRpb25cbiAgcHJpdmF0ZSBkaXNwbGF5TmFtZSA9ICcnO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3I6IHZhcmlhYmxlIGlzIHVzZWQgaW4gdGhlIGltcGxlbWVudGF0aW9uXG4gIHByaXZhdGUgb3B0aW9uczogUGFydGlhbDxKaXRzaU1lZXRFeHRlcm5hbEFQSU9wdGlvbnM+ID0ge307XG5cbiAgcHJpdmF0ZSBkZXRlY3Rpb25JblByb2dyZXNzID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc29sZS5sb2coJ0ppdHNpQnJpZGdlOiBJbml0aWFsaXppbmcgZGV0ZWN0aW9uIG1lY2hhbmlzbXMnKTtcbiAgICB0aGlzLnNldHVwRGV0ZWN0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBkZXRlY3Rpb24gbWVjaGFuaXNtcyB0byBhdXRvbWF0aWNhbGx5IGRldGVjdCBKaXRzaSBtZWV0aW5nc1xuICAgKiBhbmQgc2V0IHVwIGFwcHJvcHJpYXRlIGxpc3RlbmVyc1xuICAgKi9cbiAgcHJpdmF0ZSBzZXR1cERldGVjdGlvbigpOiB2b2lkIHtcbiAgICAvLyBTZXQgdXAgbXV0YXRpb24gb2JzZXJ2ZXIgdG8gZGV0ZWN0IHdoZW4gSml0c2kgaWZyYW1lcyBhcmUgYWRkZWQgdG8gdGhlIERPTVxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgZm9yIChjb25zdCBtdXRhdGlvbiBvZiBtdXRhdGlvbnMpIHtcbiAgICAgICAgaWYgKG11dGF0aW9uLnR5cGUgPT09ICdjaGlsZExpc3QnKSB7XG4gICAgICAgICAgdGhpcy5kZXRlY3RKaXRzaU1lZXRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU3RhcnQgb2JzZXJ2aW5nIG9uY2UgRE9NIGlzIGxvYWRlZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuZGV0ZWN0Sml0c2lNZWV0aW5nKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBbHNvIGNoZWNrIG9uIHBhZ2UgbG9hZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgdGhpcy5kZXRlY3RKaXRzaU1lZXRpbmcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlY3QgaWYgY3VycmVudCBwYWdlIGlzIGEgSml0c2kgbWVldGluZ1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBkZXRlY3RKaXRzaU1lZXRpbmcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuZGV0ZWN0aW9uSW5Qcm9ncmVzcyB8fCB0aGlzLmlzQXBpSW5pdGlhbGl6ZWQpIHJldHVybjtcblxuICAgIHRoaXMuZGV0ZWN0aW9uSW5Qcm9ncmVzcyA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgLy8gQ2hlY2sgVVJMIGZvciBKaXRzaSBwYXR0ZXJuc1xuICAgICAgaWYgKHRoaXMuaXNKaXRzaU1lZXRpbmdVcmwod2luZG93LmxvY2F0aW9uLmhyZWYpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICdKaXRzaUJyaWRnZTogRGV0ZWN0ZWQgSml0c2kgbWVldGluZyBVUkw6JyxcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFBhcnNlIGRvbWFpbiBhbmQgcm9vbSBuYW1lIGZyb20gVVJMXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICB0aGlzLmRvbWFpbiA9IHVybC5ob3N0bmFtZTtcbiAgICAgICAgdGhpcy5yb29tTmFtZSA9IHRoaXMuZXh0cmFjdFJvb21OYW1lRnJvbVVybCh1cmwpO1xuXG4gICAgICAgIGlmICh0aGlzLmRvbWFpbiAmJiB0aGlzLnJvb21OYW1lKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5pbml0aWFsaXplSml0c2lBcGkoe1xuICAgICAgICAgICAgZG9tYWluOiB0aGlzLmRvbWFpbixcbiAgICAgICAgICAgIHJvb21OYW1lOiB0aGlzLnJvb21OYW1lLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBKaXRzaSBpZnJhbWVzXG4gICAgICBjb25zdCBqaXRzaUlmcmFtZXMgPSB0aGlzLmZpbmRKaXRzaUlmcmFtZXMoKTtcbiAgICAgIGlmIChqaXRzaUlmcmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBpZnJhbWUgPSBqaXRzaUlmcmFtZXNbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKCdKaXRzaUJyaWRnZTogRGV0ZWN0ZWQgSml0c2kgaWZyYW1lOicsIGlmcmFtZSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBmcmFtZVVybCA9IG5ldyBVUkwoaWZyYW1lLnNyYyk7XG4gICAgICAgICAgdGhpcy5kb21haW4gPSBmcmFtZVVybC5ob3N0bmFtZTtcbiAgICAgICAgICB0aGlzLnJvb21OYW1lID0gdGhpcy5leHRyYWN0Um9vbU5hbWVGcm9tVXJsKGZyYW1lVXJsKTtcblxuICAgICAgICAgIGlmICh0aGlzLmRvbWFpbiAmJiB0aGlzLnJvb21OYW1lKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmluaXRpYWxpemVKaXRzaUFwaSh7XG4gICAgICAgICAgICAgIGRvbWFpbjogdGhpcy5kb21haW4sXG4gICAgICAgICAgICAgIHJvb21OYW1lOiB0aGlzLnJvb21OYW1lLFxuICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZTogaWZyYW1lLnBhcmVudEVsZW1lbnQgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignSml0c2lCcmlkZ2U6IEVycm9yIHBhcnNpbmcgaWZyYW1lIFVSTDonLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmRldGVjdGlvbkluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhbnkgaWZyYW1lcyB0aGF0IG1pZ2h0IGJlIEppdHNpIG1lZXRpbmdzXG4gICAqL1xuICBwcml2YXRlIGZpbmRKaXRzaUlmcmFtZXMoKTogSFRNTElGcmFtZUVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaWZyYW1lJykpLmZpbHRlcigoaWZyYW1lKSA9PiB7XG4gICAgICBpZiAoIWlmcmFtZS5zcmMpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLmlzSml0c2lNZWV0aW5nVXJsKGlmcmFtZS5zcmMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgVVJMIGlzIGxpa2VseSBhIEppdHNpIG1lZXRpbmdcbiAgICovXG4gIHByaXZhdGUgaXNKaXRzaU1lZXRpbmdVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmwpO1xuXG4gICAgICAvLyBDaGVjayBmb3Iga25vd24gSml0c2kgaG9zdHNcbiAgICAgIGNvbnN0IGtub3duSml0c2lIb3N0cyA9IFsnbWVldC5qaXQuc2knLCAnOHg4LnZjJywgJ2ppdHNpLnJvY2tldC5jaGF0J107XG5cbiAgICAgIGNvbnN0IGlzS25vd25Ib3N0ID0ga25vd25KaXRzaUhvc3RzLnNvbWUoXG4gICAgICAgIChob3N0KSA9PlxuICAgICAgICAgIHBhcnNlZFVybC5ob3N0bmFtZSA9PT0gaG9zdCB8fCBwYXJzZWRVcmwuaG9zdG5hbWUuZW5kc1dpdGgoYC4ke2hvc3R9YClcbiAgICAgICk7XG5cbiAgICAgIGlmIChpc0tub3duSG9zdCkgcmV0dXJuIHRydWU7XG5cbiAgICAgIC8vIENoZWNrIFVSTCBwYXR0ZXJucyBjb21tb24gaW4gSml0c2kgZGVwbG95bWVudHNcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHVybC5pbmNsdWRlcygnL21lZXQvJykgfHxcbiAgICAgICAgdXJsLmluY2x1ZGVzKCcvY29uZmVyZW5jZS8nKSB8fFxuICAgICAgICB1cmwuaW5jbHVkZXMoJz9qd3Q9JykgfHxcbiAgICAgICAgISFwYXJzZWRVcmwucGF0aG5hbWUubWF0Y2goL1xcL1thLXpBLVowLTlfLV17Nix9JC8pXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ppdHNpQnJpZGdlOiBFcnJvciBwYXJzaW5nIFVSTDonLCBlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCByb29tIG5hbWUgZnJvbSBhIEppdHNpIFVSTFxuICAgKi9cbiAgcHJpdmF0ZSBleHRyYWN0Um9vbU5hbWVGcm9tVXJsKHVybDogVVJMKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbnQgSml0c2kgZGVwbG95bWVudHMgbWlnaHQgaGF2ZSBkaWZmZXJlbnQgVVJMIHBhdHRlcm5zXG4gICAgY29uc3QgcGF0aFBhcnRzID0gdXJsLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgaWYgKHBhdGhQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBNb3N0IEppdHNpIGRlcGxveW1lbnRzIGhhdmUgdGhlIHJvb20gbmFtZSBhcyB0aGUgbGFzdCBwYXRoIHNlZ21lbnRcbiAgICAgIHJldHVybiBwYXRoUGFydHNbcGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBKaXRzaSBNZWV0IEV4dGVybmFsIEFQSVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXRpYWxpemVKaXRzaUFwaShjb25maWc6IEppdHNpQnJpZGdlQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuaXNBcGlJbml0aWFsaXplZCkge1xuICAgICAgY29uc29sZS5sb2coJ0ppdHNpQnJpZGdlOiBBUEkgYWxyZWFkeSBpbml0aWFsaXplZCcpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFjb25maWc/LmRvbWFpbiB8fCAhY29uZmlnLnJvb21OYW1lKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdKaXRzaUJyaWRnZTogSW52YWxpZCBjb25maWd1cmF0aW9uJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gU3RvcmUgY29uZmlndXJhdGlvblxuICAgIHRoaXMuZG9tYWluID0gY29uZmlnLmRvbWFpbjtcbiAgICB0aGlzLnJvb21OYW1lID0gY29uZmlnLnJvb21OYW1lO1xuICAgIHRoaXMuZGlzcGxheU5hbWUgPSBjb25maWcuZGlzcGxheU5hbWUgfHwgJyc7XG4gICAgdGhpcy5vcHRpb25zID0gY29uZmlnLm9wdGlvbnMgfHwge307XG5cbiAgICB0cnkge1xuICAgICAgLy8gTG9hZCB0aGUgZXh0ZXJuYWwgQVBJIHNjcmlwdCBpZiBuZWVkZWRcbiAgICAgIGlmICghd2luZG93LkppdHNpTWVldEV4dGVybmFsQVBJKSB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9hZEppdHNpU2NyaXB0KHRoaXMuZG9tYWluKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ0ppdHNpQnJpZGdlOiBDcmVhdGluZyBKaXRzaSBNZWV0IEV4dGVybmFsIEFQSSBpbnN0YW5jZScpO1xuXG4gICAgICAvLyBXZSBkb24ndCBhY3R1YWxseSBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugd2l0aCB0aGUgRXh0ZXJuYWwgQVBJXG4gICAgICAvLyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgbmV3IGlmcmFtZSB3aGVuIG9uZSBtaWdodCBhbHJlYWR5IGV4aXN0XG4gICAgICAvLyBJbnN0ZWFkLCB3ZSBqdXN0IGluaXRpYWxpemUgb3VyIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGV4aXN0aW5nIGlmcmFtZVxuXG4gICAgICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSB3aW5kb3cgZm9yIGlmcmFtZSBjb21tdW5pY2F0aW9uXG4gICAgICB0aGlzLnNldHVwTWVzc2FnZUV2ZW50TGlzdGVuZXIoKTtcblxuICAgICAgdGhpcy5pc0FwaUluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnSml0c2lCcmlkZ2U6IEppdHNpIE1lZXQgRXh0ZXJuYWwgQVBJIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnSml0c2lCcmlkZ2U6IEVycm9yIGluaXRpYWxpemluZyBKaXRzaSBNZWV0IEV4dGVybmFsIEFQSTonLFxuICAgICAgICBlcnJvclxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0aGUgSml0c2kgTWVldCBFeHRlcm5hbCBBUEkgc2NyaXB0XG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGxvYWRKaXRzaVNjcmlwdChkb21haW46IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIC8vIEVuc3VyZSB3ZSB1c2UgaHR0cHNcbiAgICAgIGNvbnN0IHByb3RvY29sID1cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICdodHRwczonIDogJ2h0dHBzOic7XG4gICAgICBzY3JpcHQuc3JjID0gYCR7cHJvdG9jb2x9Ly8ke2RvbWFpbn0vZXh0ZXJuYWxfYXBpLmpzYDtcbiAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG5cbiAgICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdKaXRzaUJyaWRnZTogSml0c2kgTWVldCBFeHRlcm5hbCBBUEkgc2NyaXB0IGxvYWRlZCcpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuXG4gICAgICBzY3JpcHQub25lcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICdKaXRzaUJyaWRnZTogRXJyb3IgbG9hZGluZyBKaXRzaSBNZWV0IEV4dGVybmFsIEFQSSBzY3JpcHQ6JyxcbiAgICAgICAgICBlcnJvclxuICAgICAgICApO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfTtcblxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB1cCB3aW5kb3cgbWVzc2FnZSBldmVudCBsaXN0ZW5lciB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBKaXRzaSBpZnJhbWVcbiAgICovXG4gIHByaXZhdGUgc2V0dXBNZXNzYWdlRXZlbnRMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdtZXNzYWdlJyxcbiAgICAgIChldmVudCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gZXZlbnQ7XG5cbiAgICAgICAgICAvLyBIYW5kbGUgc2NyZWVuIHNoYXJpbmcgcmVxdWVzdHMgZnJvbSBKaXRzaVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGRhdGEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgZGF0YS50eXBlID09PSAncmVxdWVzdC1kZXNrdG9wLXBpY2tlcidcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAnSml0c2lCcmlkZ2U6IFJlY2VpdmVkIHNjcmVlbiBzaGFyaW5nIHJlcXVlc3QgZnJvbSBKaXRzaSdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVNjcmVlblNoYXJpbmdSZXF1ZXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignSml0c2lCcmlkZ2U6IEVycm9yIGhhbmRsaW5nIG1lc3NhZ2UgZXZlbnQ6JywgZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmYWxzZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIHNjcmVlbiBzaGFyaW5nIHJlcXVlc3RzIGZyb20gSml0c2lcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlU2NyZWVuU2hhcmluZ1JlcXVlc3QoKTogdm9pZCB7XG4gICAgLy8gRGlyZWN0bHkgaW52b2tlIHRoZSBzY3JlZW4gcGlja2VyXG4gICAgaXBjUmVuZGVyZXIuaW52b2tlKCd2aWRlby1jYWxsLXdpbmRvdy9vcGVuLXNjcmVlbi1waWNrZXInKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIExpc3RlbmVyIGZvciB0aGUgc2VsZWN0ZWQgc291cmNlIHJlbWFpbnMgdGhlIHNhbWVcbiAgICAgIGlwY1JlbmRlcmVyLm9uY2UoXG4gICAgICAgICd2aWRlby1jYWxsLXdpbmRvdy9zY3JlZW4tc2hhcmluZy1zb3VyY2UtcmVzcG9uZGVkJyxcbiAgICAgICAgKF9ldmVudCwgc291cmNlSWQpID0+IHtcbiAgICAgICAgICBpZiAoIXNvdXJjZUlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnSml0c2lCcmlkZ2U6IFNjcmVlbiBzaGFyaW5nIGNhbmNlbGxlZCcpO1xuICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZVRvSml0c2lJZnJhbWUoe1xuICAgICAgICAgICAgICB0eXBlOiAnc2NyZWVuLXNoYXJpbmctY2FuY2VsZWQnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc29sZS5sb2coJ0ppdHNpQnJpZGdlOiBTY3JlZW4gc2hhcmluZyBzb3VyY2Ugc2VsZWN0ZWQ6Jywgc291cmNlSWQpO1xuXG4gICAgICAgICAgLy8gU2VuZCB0aGUgc2VsZWN0ZWQgc291cmNlIElEIHRvIEppdHNpXG4gICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZVRvSml0c2lJZnJhbWUoe1xuICAgICAgICAgICAgdHlwZTogJ3NlbGVjdGVkLXNjcmVlbi1zaGFyZS1zb3VyY2UnLFxuICAgICAgICAgICAgc291cmNlSWQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgc2NyZWVuIHNoYXJpbmdcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzdGFydFNjcmVlblNoYXJpbmcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc29sZS5sb2coJ0ppdHNpQnJpZGdlOiBTdGFydCBzY3JlZW4gc2hhcmluZyByZXF1ZXN0ZWQnKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBEaXJlY3QgaW52b2tlIHRvIHNjcmVlbiBwaWNrZXJcbiAgICAgIGF3YWl0IGlwY1JlbmRlcmVyLmludm9rZSgndmlkZW8tY2FsbC13aW5kb3cvb3Blbi1zY3JlZW4tcGlja2VyJyk7XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICBpcGNSZW5kZXJlci5vbmNlKFxuICAgICAgICAgICd2aWRlby1jYWxsLXdpbmRvdy9zY3JlZW4tc2hhcmluZy1zb3VyY2UtcmVzcG9uZGVkJyxcbiAgICAgICAgICAoX2V2ZW50LCBzb3VyY2VJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFzb3VyY2VJZCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSml0c2lCcmlkZ2U6IFNjcmVlbiBzaGFyaW5nIGNhbmNlbGxlZCcpO1xuICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgJ0ppdHNpQnJpZGdlOiBTY3JlZW4gc2hhcmluZyBzb3VyY2Ugc2VsZWN0ZWQ6JyxcbiAgICAgICAgICAgICAgc291cmNlSWRcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIFNlbmQgdGhlIHNlbGVjdGVkIHNvdXJjZSBJRCB0byBKaXRzaVxuICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZVRvSml0c2lJZnJhbWUoe1xuICAgICAgICAgICAgICB0eXBlOiAnc2VsZWN0ZWQtc2NyZWVuLXNoYXJlLXNvdXJjZScsXG4gICAgICAgICAgICAgIHNvdXJjZUlkLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ppdHNpQnJpZGdlOiBFcnJvciBzdGFydGluZyBzY3JlZW4gc2hhcmluZzonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBKaXRzaSBpZnJhbWVcbiAgICovXG4gIHByaXZhdGUgc2VuZE1lc3NhZ2VUb0ppdHNpSWZyYW1lKG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGppdHNpSWZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lmcmFtZScpO1xuICAgIGZvciAoY29uc3QgaWZyYW1lIG9mIEFycmF5LmZyb20oaml0c2lJZnJhbWVzKSkge1xuICAgICAgaWYgKGlmcmFtZS5zcmMgJiYgdGhpcy5pc0ppdHNpTWVldGluZ1VybChpZnJhbWUuc3JjKSkge1xuICAgICAgICBpZnJhbWUuY29udGVudFdpbmRvdz8ucG9zdE1lc3NhZ2UobWVzc2FnZSwgJyonKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0ppdHNpQnJpZGdlOiBTZW50IG1lc3NhZ2UgdG8gSml0c2kgaWZyYW1lOicsIG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS53YXJuKCdKaXRzaUJyaWRnZTogTm8gSml0c2kgaWZyYW1lIGZvdW5kIHRvIHNlbmQgbWVzc2FnZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCB0aGUgY3VycmVudCBjYWxsXG4gICAqL1xuICBwdWJsaWMgZW5kQ2FsbCgpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZygnSml0c2lCcmlkZ2U6IEVuZCBjYWxsIHJlcXVlc3RlZCcpO1xuXG4gICAgaWYgKHRoaXMuaml0c2lBcGkpIHtcbiAgICAgIHRoaXMuaml0c2lBcGkuZXhlY3V0ZUNvbW1hbmQoJ2hhbmd1cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlVG9KaXRzaUlmcmFtZSh7XG4gICAgICAgIHR5cGU6ICdoYW5ndXAnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBKaXRzaSBNZWV0IHZlcnNpb24gKG1heSBub3QgYmUgc3VwcG9ydGVkIGJ5IGFsbCBkZXBsb3ltZW50cylcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRKaXRzaVZlcnNpb24oKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgaWYgKCF0aGlzLmlzQXBpSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiAnQVBJIG5vdCBpbml0aWFsaXplZCc7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbmFsaXR5IG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgaW4gYWxsIEppdHNpIGRlcGxveW1lbnRzXG4gICAgcmV0dXJuICdWZXJzaW9uIG5vdCBhdmFpbGFibGUnO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2Ugb2YgdGhlIEppdHNpIE1lZXQgRXh0ZXJuYWwgQVBJIGluc3RhbmNlXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZygnSml0c2lCcmlkZ2U6IERpc3Bvc2luZycpO1xuXG4gICAgaWYgKHRoaXMuaml0c2lBcGkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuaml0c2lBcGkuZGlzcG9zZSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdKaXRzaUJyaWRnZTogRXJyb3IgZGlzcG9zaW5nIEppdHNpIEFQSTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5qaXRzaUFwaSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5pc0FwaUluaXRpYWxpemVkID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIEFQSSBpcyBpbml0aWFsaXplZFxuICAgKi9cbiAgcHVibGljIGlzSW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNBcGlJbml0aWFsaXplZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIEppdHNpIEFQSSBpbnN0YW5jZVxuICAgKi9cbiAgcHVibGljIGdldEFwaSgpOiBKaXRzaU1lZXRFeHRlcm5hbEFQSSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmppdHNpQXBpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBkb21haW5cbiAgICovXG4gIHB1YmxpYyBnZXRDdXJyZW50RG9tYWluKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZG9tYWluO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCByb29tIG5hbWVcbiAgICovXG4gIHB1YmxpYyBnZXRDdXJyZW50Um9vbU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yb29tTmFtZTtcbiAgfVxufVxuXG4vLyBDcmVhdGUgYW5kIGV4cG9zZSB0aGUgSml0c2kgQnJpZGdlXG5jb25zdCBqaXRzaUJyaWRnZSA9IG5ldyBKaXRzaUJyaWRnZUltcGwoKTtcbndpbmRvdy5qaXRzaUJyaWRnZSA9IGppdHNpQnJpZGdlO1xuXG4vLyBFeHBvcnQgYXMgZGVmYXVsdCBmb3IgbW9kdWxlIHVzYWdlXG5leHBvcnQgZGVmYXVsdCBqaXRzaUJyaWRnZTtcbiIsImltcG9ydCB7IGNvbnRleHRCcmlkZ2UsIGlwY1JlbmRlcmVyIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0ICcuL2ppdHNpQnJpZGdlJztcblxuLy8gRXhwb3NlIGFueSBuZWNlc3NhcnkgQVBJcyB0byB0aGUgd2VidmlldyBjb250ZW50XG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCd2aWRlb0NhbGxXaW5kb3cnLCB7XG4gIC8vIEFkZCBtZXRob2RzIGhlcmUgaWYgbmVlZGVkIGZvciBjb21tdW5pY2F0aW9uIHdpdGggdGhlIG1haW4gcHJvY2Vzc1xuICByZXF1ZXN0U2NyZWVuU2hhcmluZzogYXN5bmMgKCkgPT4ge1xuICAgIC8vIERpcmVjdGx5IGludm9rZSB0aGUgc2NyZWVuIHBpY2tlclxuICAgIGF3YWl0IGlwY1JlbmRlcmVyLmludm9rZSgndmlkZW8tY2FsbC13aW5kb3cvb3Blbi1zY3JlZW4tcGlja2VyJyk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZyB8IG51bGw+KChyZXNvbHZlKSA9PiB7XG4gICAgICBpcGNSZW5kZXJlci5vbmNlKFxuICAgICAgICAndmlkZW8tY2FsbC13aW5kb3cvc2NyZWVuLXNoYXJpbmctc291cmNlLXJlc3BvbmRlZCcsXG4gICAgICAgIChfZXZlbnQsIGlkKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShpZCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH0sXG59KTtcbiJdLCJuYW1lcyI6WyJKaXRzaUJyaWRnZUltcGwiLCJjb25zdHJ1Y3RvciIsIl9kZWZpbmVQcm9wZXJ0eSIsImNvbnNvbGUiLCJsb2ciLCJzZXR1cERldGVjdGlvbiIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsIm11dGF0aW9uIiwidHlwZSIsImRldGVjdEppdHNpTWVldGluZyIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJvYnNlcnZlIiwiZG9jdW1lbnQiLCJib2R5IiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsImRldGVjdGlvbkluUHJvZ3Jlc3MiLCJpc0FwaUluaXRpYWxpemVkIiwiaXNKaXRzaU1lZXRpbmdVcmwiLCJsb2NhdGlvbiIsImhyZWYiLCJ1cmwiLCJVUkwiLCJkb21haW4iLCJob3N0bmFtZSIsInJvb21OYW1lIiwiZXh0cmFjdFJvb21OYW1lRnJvbVVybCIsImluaXRpYWxpemVKaXRzaUFwaSIsImppdHNpSWZyYW1lcyIsImZpbmRKaXRzaUlmcmFtZXMiLCJsZW5ndGgiLCJpZnJhbWUiLCJmcmFtZVVybCIsInNyYyIsIm9wdGlvbnMiLCJwYXJlbnROb2RlIiwicGFyZW50RWxlbWVudCIsInVuZGVmaW5lZCIsImUiLCJlcnJvciIsIkFycmF5IiwiZnJvbSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmaWx0ZXIiLCJwYXJzZWRVcmwiLCJrbm93bkppdHNpSG9zdHMiLCJpc0tub3duSG9zdCIsInNvbWUiLCJob3N0IiwiZW5kc1dpdGgiLCJpbmNsdWRlcyIsInBhdGhuYW1lIiwibWF0Y2giLCJwYXRoUGFydHMiLCJzcGxpdCIsIkJvb2xlYW4iLCJjb25maWciLCJkaXNwbGF5TmFtZSIsIkppdHNpTWVldEV4dGVybmFsQVBJIiwibG9hZEppdHNpU2NyaXB0Iiwic2V0dXBNZXNzYWdlRXZlbnRMaXN0ZW5lciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2NyaXB0IiwiY3JlYXRlRWxlbWVudCIsInByb3RvY29sIiwiYXN5bmMiLCJvbmxvYWQiLCJvbmVycm9yIiwiaGVhZCIsImFwcGVuZENoaWxkIiwiZXZlbnQiLCJkYXRhIiwiaGFuZGxlU2NyZWVuU2hhcmluZ1JlcXVlc3QiLCJpcGNSZW5kZXJlciIsImludm9rZSIsInRoZW4iLCJvbmNlIiwiX2V2ZW50Iiwic291cmNlSWQiLCJzZW5kTWVzc2FnZVRvSml0c2lJZnJhbWUiLCJzdGFydFNjcmVlblNoYXJpbmciLCJtZXNzYWdlIiwiX2lmcmFtZSRjb250ZW50V2luZG93IiwiY29udGVudFdpbmRvdyIsInBvc3RNZXNzYWdlIiwid2FybiIsImVuZENhbGwiLCJqaXRzaUFwaSIsImV4ZWN1dGVDb21tYW5kIiwiZGlzcG9zZSIsImdldEppdHNpVmVyc2lvbiIsImlzSW5pdGlhbGl6ZWQiLCJnZXRBcGkiLCJnZXRDdXJyZW50RG9tYWluIiwiZ2V0Q3VycmVudFJvb21OYW1lIiwiaml0c2lCcmlkZ2UiLCJjb250ZXh0QnJpZGdlIiwiZXhwb3NlSW5NYWluV29ybGQiLCJyZXF1ZXN0U2NyZWVuU2hhcmluZyIsImlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
