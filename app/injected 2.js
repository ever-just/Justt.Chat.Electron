(function () {
  'use strict';

  function _assertClassBrand(e, t, n) {
    if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
    throw new TypeError("Private element is not present on this object");
  }
  function _checkPrivateRedeclaration(e, t) {
    if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
  function _classPrivateFieldGet2(s, a) {
    return s.get(_assertClassBrand(s, a));
  }
  function _classPrivateFieldInitSpec(e, t, a) {
    _checkPrivateRedeclaration(e, t), t.set(e, a);
  }
  function _classPrivateFieldSet2(s, a, r) {
    return s.set(_assertClassBrand(s, a), r), r;
  }
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

  console.log('[Rocket.Chat Desktop] Injected.ts');
  const resolveWithExponentialBackoff = (fn, {
    maxRetries = 5,
    delay = 1000
  } = {}) => new Promise(resolve => resolve(fn())).catch(error => {
    if (maxRetries === 0) {
      throw error;
    }
    console.log('[Rocket.Chat Desktop] Inject resolveWithExponentialBackoff - retrying in 1 seconds');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(resolveWithExponentialBackoff(fn, {
          maxRetries: maxRetries - 1,
          delay: delay * 2
        }));
      }, delay);
    });
  });
  const tryRequire = path => resolveWithExponentialBackoff(() => window.require(path));
  const start = async () => {
    var _RocketChatDesktopNotification, _destroy, _onclick, _onclose, _onerror, _onshow, _onaction;
    console.log('[Rocket.Chat Desktop] Injected.ts start fired');
    if (typeof window.require !== 'function') {
      console.log('[Rocket.Chat Desktop] window.require is not defined');
      console.log('[Rocket.Chat Desktop] Inject start - retrying in 1 seconds');
      setTimeout(start, 1000);
      return;
    }
    const {
      Info: serverInfo = {}
    } = await tryRequire('/app/utils/rocketchat.info');
    if (!serverInfo.version) {
      console.log('[Rocket.Chat Desktop] serverInfo.version is not defined');
      return;
    }
    console.log('[Rocket.Chat Desktop] Injected.ts serverInfo', serverInfo);
    window.RocketChatDesktop.setServerInfo(serverInfo);
    function versionIsGreaterOrEqualsTo(version1, version2) {
      // Extract only the core version number (before any suffix like -develop, -rc, etc.)
      const cleanVersion1 = version1.split('-')[0];
      const cleanVersion2 = version2.split('-')[0];
      const v1 = cleanVersion1.split('.').map(Number);
      const v2 = cleanVersion2.split('.').map(Number);

      // Compare each version part
      const maxLength = Math.max(v1.length, v2.length);
      for (let i = 0; i < maxLength; i++) {
        const n1 = v1[i] || 0;
        const n2 = v2[i] || 0;
        if (n1 > n2) {
          return true;
        }
        if (n1 < n2) {
          return false;
        }
      }
      return true; // Equal versions
    }
    const userPresenceModulePath = versionIsGreaterOrEqualsTo(serverInfo.version, '6.3.0') ? 'meteor/rocketchat:user-presence' : 'meteor/konecty:user-presence';
    const settingsModulePath = (() => {
      // if (versionIsGreaterOrEqualsTo(serverInfo.version, '6.0.0'))
      //   return '/app/settings/client';
      if (versionIsGreaterOrEqualsTo(serverInfo.version, '5.0.0')) return '/app/settings/client/index.ts';
      return '/app/settings';
    })();
    const utilsModulePath = (() => {
      // if (versionIsGreaterOrEqualsTo(serverInfo.version, '6.0.0'))
      //   return '/app/utils/client';
      if (versionIsGreaterOrEqualsTo(serverInfo.version, '5.0.0')) return '/app/utils/client/index.ts';
      return '/app/utils';
    })();
    const {
      Meteor
    } = await tryRequire('meteor/meteor');
    const {
      Session
    } = await tryRequire('meteor/session');
    const {
      Tracker
    } = await tryRequire('meteor/tracker');
    const {
      UserPresence
    } = await tryRequire(userPresenceModulePath);
    const {
      settings
    } = await tryRequire(settingsModulePath);
    const {
      getUserPreference
    } = await tryRequire(utilsModulePath);
    window.RocketChatDesktop.setUrlResolver(Meteor.absoluteUrl);
    navigator.clipboard.writeText = async (...args) => window.RocketChatDesktop.writeTextToClipboard(...args);
    Tracker.autorun(() => {
      const unread = Session.get('unread');
      window.RocketChatDesktop.setBadge(unread);
    });
    Tracker.autorun(() => {
      const {
        url,
        defaultUrl
      } = settings.get('Assets_favicon') || {};
      window.RocketChatDesktop.setFavicon(url || defaultUrl);
    });
    const open = window.open.bind(window);
    Tracker.autorun(() => {
      const serverMainVersion = serverInfo.version.split('.')[0];

      // Server version above 5.0.0 will change the way the jitsi integration is handled, now we have video provider as an app
      // if the server is above 5.1.1 it will use window.RocketChatDesktop?.openInternalVideoChatWindow to open the video call
      if (serverMainVersion < 5) {
        const jitsiDomain = settings.get('Jitsi_Domain') || '';
        console.log('[Rocket.Chat Desktop] window.open for Jitsi overloaded', jitsiDomain);
        window.open = (url, name, features = '') => {
          if (!process.mas && window.RocketChatDesktop.getInternalVideoChatWindowEnabled() && typeof url === 'string' && jitsiDomain.length > 0 && url.includes(jitsiDomain)) {
            console.log('[Rocket.Chat Desktop] window.open for Jitsi fired');
            return open(url, 'Video Call', `scrollbars=true,${features}`);
          }
          return open(url, name, features);
        };
      }
    });
    if (!versionIsGreaterOrEqualsTo(serverInfo.version, '6.4.0')) {
      Tracker.autorun(() => {
        const {
          url,
          defaultUrl
        } = settings.get('Assets_background') || {};
        window.RocketChatDesktop.setBackground(url || defaultUrl);
      });
    }

    // Helper function to get Outlook settings based on server version
    const getOutlookSettings = () => {
      var _user$settings;
      const userToken = Meteor._localStorage.getItem('Meteor.loginToken');
      if (!versionIsGreaterOrEqualsTo(serverInfo.version, '7.8.0')) {
        // Pre-7.8.0: Use global server settings
        return {
          userToken,
          userId: Meteor.userId(),
          outlookCalendarEnabled: settings.get('Outlook_Calendar_Enabled'),
          outlookExchangeUrl: settings.get('Outlook_Calendar_Exchange_Url')
        };
      }
      // 7.8.0+: Use user-specific settings
      const user = Meteor.user();
      const outlookSettings = user === null || user === void 0 || (_user$settings = user.settings) === null || _user$settings === void 0 || (_user$settings = _user$settings.calendar) === null || _user$settings === void 0 ? void 0 : _user$settings.outlook;
      return {
        userToken,
        userId: user === null || user === void 0 ? void 0 : user._id,
        outlookCalendarEnabled: outlookSettings === null || outlookSettings === void 0 ? void 0 : outlookSettings.Enabled,
        outlookExchangeUrl: outlookSettings === null || outlookSettings === void 0 ? void 0 : outlookSettings.Exchange_Url
      };
    };
    Tracker.autorun(() => {
      const {
        userToken,
        userId,
        outlookCalendarEnabled,
        outlookExchangeUrl
      } = getOutlookSettings();
      if (!userToken || !userId || !outlookCalendarEnabled || !outlookExchangeUrl) {
        return;
      }
      window.RocketChatDesktop.setUserToken(userToken, userId);
      window.RocketChatDesktop.setOutlookExchangeUrl(outlookExchangeUrl, userId);
    });
    Tracker.autorun(() => {
      const siteName = settings.get('Site_Name');
      window.RocketChatDesktop.setTitle(siteName);
    });
    Tracker.autorun(() => {
      const userId = Meteor.userId();
      window.RocketChatDesktop.setUserLoggedIn(userId !== null);
    });
    Tracker.autorun(() => {
      const {
        gitCommitHash
      } = Meteor;
      if (!gitCommitHash) return;
      window.RocketChatDesktop.setGitCommitHash(gitCommitHash);
    });
    Tracker.autorun(() => {
      const uid = Meteor.userId();
      if (!uid) return;
      const themeAppearance = getUserPreference(uid, 'themeAppearence');
      if (['dark', 'light', 'auto', 'high-contrast'].includes(themeAppearance)) {
        window.RocketChatDesktop.setUserThemeAppearance(themeAppearance);
      }
    });
    Tracker.autorun(() => {
      const uid = Meteor.userId();
      if (!uid) return;
      const isAutoAwayEnabled = getUserPreference(uid, 'enableAutoAway');
      const idleThreshold = getUserPreference(uid, 'idleTimeLimit');
      if (isAutoAwayEnabled) {
        delete UserPresence.awayTime;
        UserPresence.start();
      }
      window.RocketChatDesktop.setUserPresenceDetection({
        isAutoAwayEnabled: Boolean(isAutoAwayEnabled),
        idleThreshold: idleThreshold ? Number(idleThreshold) : null,
        setUserOnline: online => {
          if (!online) {
            Meteor.call('UserPresence:away');
            return;
          }
          Meteor.call('UserPresence:online');
        }
      });
    });
    console.log('[Rocket.Chat Desktop] Injected.ts replaced Notification');
    window.Notification = (_destroy = /*#__PURE__*/new WeakMap(), _onclick = /*#__PURE__*/new WeakMap(), _onclose = /*#__PURE__*/new WeakMap(), _onerror = /*#__PURE__*/new WeakMap(), _onshow = /*#__PURE__*/new WeakMap(), _onaction = /*#__PURE__*/new WeakMap(), _RocketChatDesktopNotification = class RocketChatDesktopNotification extends EventTarget {
      static requestPermission() {
        return Promise.resolve(RocketChatDesktopNotification.permission);
      }
      constructor(title, options = {}) {
        super();
        _classPrivateFieldInitSpec(this, _destroy, void 0);
        _defineProperty(this, "actions", []);
        _defineProperty(this, "badge", '');
        _defineProperty(this, "body", '');
        _defineProperty(this, "data", undefined);
        _defineProperty(this, "dir", 'auto');
        _defineProperty(this, "icon", '');
        _defineProperty(this, "image", '');
        _defineProperty(this, "lang", document.documentElement.lang);
        _classPrivateFieldInitSpec(this, _onclick, null);
        _classPrivateFieldInitSpec(this, _onclose, null);
        _classPrivateFieldInitSpec(this, _onerror, null);
        _classPrivateFieldInitSpec(this, _onshow, null);
        _classPrivateFieldInitSpec(this, _onaction, null);
        _defineProperty(this, "requireInteraction", false);
        _defineProperty(this, "silent", false);
        _defineProperty(this, "tag", '');
        _defineProperty(this, "timestamp", Date.now());
        _defineProperty(this, "title", '');
        _defineProperty(this, "vibrate", []);
        _defineProperty(this, "handleEvent", ({
          type,
          detail
        }) => {
          const mainWorldEvent = new CustomEvent(type, {
            detail
          });
          const isReplyEvent = (type, detail) => type === 'reply' && typeof detail === 'object' && detail !== null && 'reply' in detail && typeof detail.reply === 'string';
          if (isReplyEvent(type, detail)) {
            mainWorldEvent.response = detail.reply;
          }
          this.dispatchEvent(mainWorldEvent);
        });
        _classPrivateFieldSet2(_destroy, this, window.RocketChatDesktop.createNotification({
          title,
          ...options,
          onEvent: this.handleEvent
        }).then(id => () => {
          window.RocketChatDesktop.destroyNotification(id);
        }));
        Object.assign(this, {
          title,
          ...options
        });
      }
      get onclick() {
        return _classPrivateFieldGet2(_onclick, this);
      }
      set onclick(value) {
        if (_classPrivateFieldGet2(_onclick, this)) {
          this.removeEventListener('click', _classPrivateFieldGet2(_onclick, this));
        }
        _classPrivateFieldSet2(_onclick, this, value);
        if (_classPrivateFieldGet2(_onclick, this)) {
          this.addEventListener('click', _classPrivateFieldGet2(_onclick, this));
        }
      }
      get onclose() {
        return _classPrivateFieldGet2(_onclose, this);
      }
      set onclose(value) {
        if (_classPrivateFieldGet2(_onclose, this)) {
          this.removeEventListener('close', _classPrivateFieldGet2(_onclose, this));
        }
        _classPrivateFieldSet2(_onclose, this, value);
        if (_classPrivateFieldGet2(_onclose, this)) {
          this.addEventListener('close', _classPrivateFieldGet2(_onclose, this));
        }
      }
      get onerror() {
        return _classPrivateFieldGet2(_onerror, this);
      }
      set onerror(value) {
        if (_classPrivateFieldGet2(_onerror, this)) {
          this.removeEventListener('error', _classPrivateFieldGet2(_onerror, this));
        }
        _classPrivateFieldSet2(_onerror, this, value);
        if (_classPrivateFieldGet2(_onerror, this)) {
          this.addEventListener('error', _classPrivateFieldGet2(_onerror, this));
        }
      }
      get onshow() {
        return _classPrivateFieldGet2(_onshow, this);
      }
      set onshow(value) {
        if (_classPrivateFieldGet2(_onshow, this)) {
          this.removeEventListener('show', _classPrivateFieldGet2(_onshow, this));
        }
        _classPrivateFieldSet2(_onshow, this, value);
        if (_classPrivateFieldGet2(_onshow, this)) {
          this.addEventListener('show', _classPrivateFieldGet2(_onshow, this));
        }
      }
      get onaction() {
        return _classPrivateFieldGet2(_onaction, this);
      }
      set onaction(value) {
        if (_classPrivateFieldGet2(_onaction, this)) {
          this.removeEventListener('action', _classPrivateFieldGet2(_onaction, this));
        }
        _classPrivateFieldSet2(_onaction, this, value);
        if (_classPrivateFieldGet2(_onaction, this)) {
          this.addEventListener('action', _classPrivateFieldGet2(_onaction, this));
        }
      }
      close() {
        var _classPrivateFieldGet2$1;
        if (!_classPrivateFieldGet2(_destroy, this)) {
          return;
        }
        (_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_destroy, this)) === null || _classPrivateFieldGet2$1 === void 0 || _classPrivateFieldGet2$1.then(destroy => {
          _classPrivateFieldSet2(_destroy, this, undefined);
          destroy();
        });
      }
    }, _defineProperty(_RocketChatDesktopNotification, "permission", 'granted'), _defineProperty(_RocketChatDesktopNotification, "maxActions", process.platform === 'darwin' ? Number.MAX_SAFE_INTEGER : 0), _RocketChatDesktopNotification);
    console.log('[Rocket.Chat Desktop] Injected');
  };
  start();

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0ZWQuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmplY3RlZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5vdGlmaWNhdGlvbkFjdGlvbiB9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHR5cGUgeyBSb2NrZXRDaGF0RGVza3RvcEFQSSB9IGZyb20gJy4vc2VydmVycy9wcmVsb2FkL2FwaSc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBSb2NrZXRDaGF0RGVza3RvcDogUm9ja2V0Q2hhdERlc2t0b3BBUEk7XG4gIH1cbn1cblxuY29uc29sZS5sb2coJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSBJbmplY3RlZC50cycpO1xuXG5jb25zdCByZXNvbHZlV2l0aEV4cG9uZW50aWFsQmFja29mZiA9IDxUPihcbiAgZm46ICgpID0+IFByb21pc2U8VD4sXG4gIHsgbWF4UmV0cmllcyA9IDUsIGRlbGF5ID0gMTAwMCB9ID0ge31cbikgPT5cbiAgbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHJlc29sdmUoZm4oKSkpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgIGlmIChtYXhSZXRyaWVzID09PSAwKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXG4gICAgICAnW1JvY2tldC5DaGF0IERlc2t0b3BdIEluamVjdCByZXNvbHZlV2l0aEV4cG9uZW50aWFsQmFja29mZiAtIHJldHJ5aW5nIGluIDEgc2Vjb25kcydcbiAgICApO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoXG4gICAgICAgICAgcmVzb2x2ZVdpdGhFeHBvbmVudGlhbEJhY2tvZmYoZm4sIHtcbiAgICAgICAgICAgIG1heFJldHJpZXM6IG1heFJldHJpZXMgLSAxLFxuICAgICAgICAgICAgZGVsYXk6IGRlbGF5ICogMixcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSwgZGVsYXkpO1xuICAgIH0pO1xuICB9KTtcblxuY29uc3QgdHJ5UmVxdWlyZSA9IDxUID0gYW55PihwYXRoOiBzdHJpbmcpID0+XG4gIHJlc29sdmVXaXRoRXhwb25lbnRpYWxCYWNrb2ZmPFQ+KCgpID0+IHdpbmRvdy5yZXF1aXJlKHBhdGgpKTtcblxuY29uc3Qgc3RhcnQgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gSW5qZWN0ZWQudHMgc3RhcnQgZmlyZWQnKTtcbiAgaWYgKHR5cGVvZiB3aW5kb3cucmVxdWlyZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gd2luZG93LnJlcXVpcmUgaXMgbm90IGRlZmluZWQnKTtcbiAgICBjb25zb2xlLmxvZygnW1JvY2tldC5DaGF0IERlc2t0b3BdIEluamVjdCBzdGFydCAtIHJldHJ5aW5nIGluIDEgc2Vjb25kcycpO1xuICAgIHNldFRpbWVvdXQoc3RhcnQsIDEwMDApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgSW5mbzogc2VydmVySW5mbyA9IHt9IH0gPSBhd2FpdCB0cnlSZXF1aXJlKFxuICAgICcvYXBwL3V0aWxzL3JvY2tldGNoYXQuaW5mbydcbiAgKTtcblxuICBpZiAoIXNlcnZlckluZm8udmVyc2lvbikge1xuICAgIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gc2VydmVySW5mby52ZXJzaW9uIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSBJbmplY3RlZC50cyBzZXJ2ZXJJbmZvJywgc2VydmVySW5mbyk7XG5cbiAgd2luZG93LlJvY2tldENoYXREZXNrdG9wLnNldFNlcnZlckluZm8oc2VydmVySW5mbyk7XG5cbiAgZnVuY3Rpb24gdmVyc2lvbklzR3JlYXRlck9yRXF1YWxzVG8oXG4gICAgdmVyc2lvbjE6IHN0cmluZyxcbiAgICB2ZXJzaW9uMjogc3RyaW5nXG4gICk6IGJvb2xlYW4ge1xuICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgY29yZSB2ZXJzaW9uIG51bWJlciAoYmVmb3JlIGFueSBzdWZmaXggbGlrZSAtZGV2ZWxvcCwgLXJjLCBldGMuKVxuICAgIGNvbnN0IGNsZWFuVmVyc2lvbjEgPSB2ZXJzaW9uMS5zcGxpdCgnLScpWzBdO1xuICAgIGNvbnN0IGNsZWFuVmVyc2lvbjIgPSB2ZXJzaW9uMi5zcGxpdCgnLScpWzBdO1xuXG4gICAgY29uc3QgdjEgPSBjbGVhblZlcnNpb24xLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG4gICAgY29uc3QgdjIgPSBjbGVhblZlcnNpb24yLnNwbGl0KCcuJykubWFwKE51bWJlcik7XG5cbiAgICAvLyBDb21wYXJlIGVhY2ggdmVyc2lvbiBwYXJ0XG4gICAgY29uc3QgbWF4TGVuZ3RoID0gTWF0aC5tYXgodjEubGVuZ3RoLCB2Mi5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4TGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG4xID0gdjFbaV0gfHwgMDtcbiAgICAgIGNvbnN0IG4yID0gdjJbaV0gfHwgMDtcblxuICAgICAgaWYgKG4xID4gbjIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAobjEgPCBuMikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7IC8vIEVxdWFsIHZlcnNpb25zXG4gIH1cblxuICBjb25zdCB1c2VyUHJlc2VuY2VNb2R1bGVQYXRoID0gdmVyc2lvbklzR3JlYXRlck9yRXF1YWxzVG8oXG4gICAgc2VydmVySW5mby52ZXJzaW9uLFxuICAgICc2LjMuMCdcbiAgKVxuICAgID8gJ21ldGVvci9yb2NrZXRjaGF0OnVzZXItcHJlc2VuY2UnXG4gICAgOiAnbWV0ZW9yL2tvbmVjdHk6dXNlci1wcmVzZW5jZSc7XG5cbiAgY29uc3Qgc2V0dGluZ3NNb2R1bGVQYXRoID0gKCgpID0+IHtcbiAgICAvLyBpZiAodmVyc2lvbklzR3JlYXRlck9yRXF1YWxzVG8oc2VydmVySW5mby52ZXJzaW9uLCAnNi4wLjAnKSlcbiAgICAvLyAgIHJldHVybiAnL2FwcC9zZXR0aW5ncy9jbGllbnQnO1xuICAgIGlmICh2ZXJzaW9uSXNHcmVhdGVyT3JFcXVhbHNUbyhzZXJ2ZXJJbmZvLnZlcnNpb24sICc1LjAuMCcpKVxuICAgICAgcmV0dXJuICcvYXBwL3NldHRpbmdzL2NsaWVudC9pbmRleC50cyc7XG4gICAgcmV0dXJuICcvYXBwL3NldHRpbmdzJztcbiAgfSkoKTtcblxuICBjb25zdCB1dGlsc01vZHVsZVBhdGggPSAoKCkgPT4ge1xuICAgIC8vIGlmICh2ZXJzaW9uSXNHcmVhdGVyT3JFcXVhbHNUbyhzZXJ2ZXJJbmZvLnZlcnNpb24sICc2LjAuMCcpKVxuICAgIC8vICAgcmV0dXJuICcvYXBwL3V0aWxzL2NsaWVudCc7XG4gICAgaWYgKHZlcnNpb25Jc0dyZWF0ZXJPckVxdWFsc1RvKHNlcnZlckluZm8udmVyc2lvbiwgJzUuMC4wJykpXG4gICAgICByZXR1cm4gJy9hcHAvdXRpbHMvY2xpZW50L2luZGV4LnRzJztcbiAgICByZXR1cm4gJy9hcHAvdXRpbHMnO1xuICB9KSgpO1xuXG4gIGNvbnN0IHsgTWV0ZW9yIH0gPSBhd2FpdCB0cnlSZXF1aXJlKCdtZXRlb3IvbWV0ZW9yJyk7XG4gIGNvbnN0IHsgU2Vzc2lvbiB9ID0gYXdhaXQgdHJ5UmVxdWlyZSgnbWV0ZW9yL3Nlc3Npb24nKTtcbiAgY29uc3QgeyBUcmFja2VyIH0gPSBhd2FpdCB0cnlSZXF1aXJlKCdtZXRlb3IvdHJhY2tlcicpO1xuICBjb25zdCB7IFVzZXJQcmVzZW5jZSB9ID0gYXdhaXQgdHJ5UmVxdWlyZSh1c2VyUHJlc2VuY2VNb2R1bGVQYXRoKTtcbiAgY29uc3QgeyBzZXR0aW5ncyB9ID0gYXdhaXQgdHJ5UmVxdWlyZShzZXR0aW5nc01vZHVsZVBhdGgpO1xuICBjb25zdCB7IGdldFVzZXJQcmVmZXJlbmNlIH0gPSBhd2FpdCB0cnlSZXF1aXJlKHV0aWxzTW9kdWxlUGF0aCk7XG5cbiAgd2luZG93LlJvY2tldENoYXREZXNrdG9wLnNldFVybFJlc29sdmVyKE1ldGVvci5hYnNvbHV0ZVVybCk7XG5cbiAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQgPSBhc3luYyAoLi4uYXJncykgPT5cbiAgICB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3Aud3JpdGVUZXh0VG9DbGlwYm9hcmQoLi4uYXJncyk7XG5cbiAgVHJhY2tlci5hdXRvcnVuKCgpID0+IHtcbiAgICBjb25zdCB1bnJlYWQgPSBTZXNzaW9uLmdldCgndW5yZWFkJyk7XG4gICAgd2luZG93LlJvY2tldENoYXREZXNrdG9wLnNldEJhZGdlKHVucmVhZCk7XG4gIH0pO1xuXG4gIFRyYWNrZXIuYXV0b3J1bigoKSA9PiB7XG4gICAgY29uc3QgeyB1cmwsIGRlZmF1bHRVcmwgfSA9IHNldHRpbmdzLmdldCgnQXNzZXRzX2Zhdmljb24nKSB8fCB7fTtcbiAgICB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3Auc2V0RmF2aWNvbih1cmwgfHwgZGVmYXVsdFVybCk7XG4gIH0pO1xuXG4gIGNvbnN0IG9wZW4gPSB3aW5kb3cub3Blbi5iaW5kKHdpbmRvdyk7XG5cbiAgVHJhY2tlci5hdXRvcnVuKCgpID0+IHtcbiAgICBjb25zdCBzZXJ2ZXJNYWluVmVyc2lvbiA9IHNlcnZlckluZm8udmVyc2lvbi5zcGxpdCgnLicpWzBdO1xuXG4gICAgLy8gU2VydmVyIHZlcnNpb24gYWJvdmUgNS4wLjAgd2lsbCBjaGFuZ2UgdGhlIHdheSB0aGUgaml0c2kgaW50ZWdyYXRpb24gaXMgaGFuZGxlZCwgbm93IHdlIGhhdmUgdmlkZW8gcHJvdmlkZXIgYXMgYW4gYXBwXG4gICAgLy8gaWYgdGhlIHNlcnZlciBpcyBhYm92ZSA1LjEuMSBpdCB3aWxsIHVzZSB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3A/Lm9wZW5JbnRlcm5hbFZpZGVvQ2hhdFdpbmRvdyB0byBvcGVuIHRoZSB2aWRlbyBjYWxsXG4gICAgaWYgKHNlcnZlck1haW5WZXJzaW9uIDwgNSkge1xuICAgICAgY29uc3Qgaml0c2lEb21haW4gPSBzZXR0aW5ncy5nZXQoJ0ppdHNpX0RvbWFpbicpIHx8ICcnO1xuXG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSB3aW5kb3cub3BlbiBmb3IgSml0c2kgb3ZlcmxvYWRlZCcsXG4gICAgICAgIGppdHNpRG9tYWluXG4gICAgICApO1xuICAgICAgd2luZG93Lm9wZW4gPSAodXJsLCBuYW1lLCBmZWF0dXJlcyA9ICcnKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhcHJvY2Vzcy5tYXMgJiZcbiAgICAgICAgICB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3AuZ2V0SW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkKCkgJiZcbiAgICAgICAgICB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgIGppdHNpRG9tYWluLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICB1cmwuaW5jbHVkZXMoaml0c2lEb21haW4pXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gd2luZG93Lm9wZW4gZm9yIEppdHNpIGZpcmVkJyk7XG4gICAgICAgICAgcmV0dXJuIG9wZW4odXJsLCAnVmlkZW8gQ2FsbCcsIGBzY3JvbGxiYXJzPXRydWUsJHtmZWF0dXJlc31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcGVuKHVybCwgbmFtZSwgZmVhdHVyZXMpO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICghdmVyc2lvbklzR3JlYXRlck9yRXF1YWxzVG8oc2VydmVySW5mby52ZXJzaW9uLCAnNi40LjAnKSkge1xuICAgIFRyYWNrZXIuYXV0b3J1bigoKSA9PiB7XG4gICAgICBjb25zdCB7IHVybCwgZGVmYXVsdFVybCB9ID0gc2V0dGluZ3MuZ2V0KCdBc3NldHNfYmFja2dyb3VuZCcpIHx8IHt9O1xuICAgICAgd2luZG93LlJvY2tldENoYXREZXNrdG9wLnNldEJhY2tncm91bmQodXJsIHx8IGRlZmF1bHRVcmwpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGdldCBPdXRsb29rIHNldHRpbmdzIGJhc2VkIG9uIHNlcnZlciB2ZXJzaW9uXG4gIGNvbnN0IGdldE91dGxvb2tTZXR0aW5ncyA9ICgpID0+IHtcbiAgICBjb25zdCB1c2VyVG9rZW4gPSBNZXRlb3IuX2xvY2FsU3RvcmFnZS5nZXRJdGVtKCdNZXRlb3IubG9naW5Ub2tlbicpO1xuXG4gICAgaWYgKCF2ZXJzaW9uSXNHcmVhdGVyT3JFcXVhbHNUbyhzZXJ2ZXJJbmZvLnZlcnNpb24sICc3LjguMCcpKSB7XG4gICAgICAvLyBQcmUtNy44LjA6IFVzZSBnbG9iYWwgc2VydmVyIHNldHRpbmdzXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyVG9rZW4sXG4gICAgICAgIHVzZXJJZDogTWV0ZW9yLnVzZXJJZCgpLFxuICAgICAgICBvdXRsb29rQ2FsZW5kYXJFbmFibGVkOiBzZXR0aW5ncy5nZXQoJ091dGxvb2tfQ2FsZW5kYXJfRW5hYmxlZCcpLFxuICAgICAgICBvdXRsb29rRXhjaGFuZ2VVcmw6IHNldHRpbmdzLmdldCgnT3V0bG9va19DYWxlbmRhcl9FeGNoYW5nZV9VcmwnKSxcbiAgICAgIH07XG4gICAgfVxuICAgIC8vIDcuOC4wKzogVXNlIHVzZXItc3BlY2lmaWMgc2V0dGluZ3NcbiAgICBjb25zdCB1c2VyID0gTWV0ZW9yLnVzZXIoKTtcbiAgICBjb25zdCBvdXRsb29rU2V0dGluZ3MgPSB1c2VyPy5zZXR0aW5ncz8uY2FsZW5kYXI/Lm91dGxvb2s7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJUb2tlbixcbiAgICAgIHVzZXJJZDogdXNlcj8uX2lkLFxuICAgICAgb3V0bG9va0NhbGVuZGFyRW5hYmxlZDogb3V0bG9va1NldHRpbmdzPy5FbmFibGVkLFxuICAgICAgb3V0bG9va0V4Y2hhbmdlVXJsOiBvdXRsb29rU2V0dGluZ3M/LkV4Y2hhbmdlX1VybCxcbiAgICB9O1xuICB9O1xuXG4gIFRyYWNrZXIuYXV0b3J1bigoKSA9PiB7XG4gICAgY29uc3QgeyB1c2VyVG9rZW4sIHVzZXJJZCwgb3V0bG9va0NhbGVuZGFyRW5hYmxlZCwgb3V0bG9va0V4Y2hhbmdlVXJsIH0gPVxuICAgICAgZ2V0T3V0bG9va1NldHRpbmdzKCk7XG5cbiAgICBpZiAoXG4gICAgICAhdXNlclRva2VuIHx8XG4gICAgICAhdXNlcklkIHx8XG4gICAgICAhb3V0bG9va0NhbGVuZGFyRW5hYmxlZCB8fFxuICAgICAgIW91dGxvb2tFeGNoYW5nZVVybFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdpbmRvdy5Sb2NrZXRDaGF0RGVza3RvcC5zZXRVc2VyVG9rZW4odXNlclRva2VuLCB1c2VySWQpO1xuICAgIHdpbmRvdy5Sb2NrZXRDaGF0RGVza3RvcC5zZXRPdXRsb29rRXhjaGFuZ2VVcmwob3V0bG9va0V4Y2hhbmdlVXJsLCB1c2VySWQpO1xuICB9KTtcblxuICBUcmFja2VyLmF1dG9ydW4oKCkgPT4ge1xuICAgIGNvbnN0IHNpdGVOYW1lID0gc2V0dGluZ3MuZ2V0KCdTaXRlX05hbWUnKTtcbiAgICB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3Auc2V0VGl0bGUoc2l0ZU5hbWUpO1xuICB9KTtcblxuICBUcmFja2VyLmF1dG9ydW4oKCkgPT4ge1xuICAgIGNvbnN0IHVzZXJJZCA9IE1ldGVvci51c2VySWQoKTtcbiAgICB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3Auc2V0VXNlckxvZ2dlZEluKHVzZXJJZCAhPT0gbnVsbCk7XG4gIH0pO1xuXG4gIFRyYWNrZXIuYXV0b3J1bigoKSA9PiB7XG4gICAgY29uc3QgeyBnaXRDb21taXRIYXNoIH0gPSBNZXRlb3I7XG4gICAgaWYgKCFnaXRDb21taXRIYXNoKSByZXR1cm47XG4gICAgd2luZG93LlJvY2tldENoYXREZXNrdG9wLnNldEdpdENvbW1pdEhhc2goZ2l0Q29tbWl0SGFzaCk7XG4gIH0pO1xuXG4gIFRyYWNrZXIuYXV0b3J1bigoKSA9PiB7XG4gICAgY29uc3QgdWlkID0gTWV0ZW9yLnVzZXJJZCgpO1xuICAgIGlmICghdWlkKSByZXR1cm47XG4gICAgY29uc3QgdGhlbWVBcHBlYXJhbmNlOiBzdHJpbmcgPSBnZXRVc2VyUHJlZmVyZW5jZSh1aWQsICd0aGVtZUFwcGVhcmVuY2UnKTtcbiAgICBpZiAoXG4gICAgICBbJ2RhcmsnLCAnbGlnaHQnLCAnYXV0bycsICdoaWdoLWNvbnRyYXN0J10uaW5jbHVkZXMoXG4gICAgICAgIHRoZW1lQXBwZWFyYW5jZSBhcyBhbnlcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHdpbmRvdy5Sb2NrZXRDaGF0RGVza3RvcC5zZXRVc2VyVGhlbWVBcHBlYXJhbmNlKFxuICAgICAgICB0aGVtZUFwcGVhcmFuY2UgYXMgJ2F1dG8nIHwgJ2RhcmsnIHwgJ2xpZ2h0JyB8ICdoaWdoLWNvbnRyYXN0J1xuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIFRyYWNrZXIuYXV0b3J1bigoKSA9PiB7XG4gICAgY29uc3QgdWlkID0gTWV0ZW9yLnVzZXJJZCgpO1xuICAgIGlmICghdWlkKSByZXR1cm47XG4gICAgY29uc3QgaXNBdXRvQXdheUVuYWJsZWQ6IHVua25vd24gPSBnZXRVc2VyUHJlZmVyZW5jZSh1aWQsICdlbmFibGVBdXRvQXdheScpO1xuICAgIGNvbnN0IGlkbGVUaHJlc2hvbGQ6IHVua25vd24gPSBnZXRVc2VyUHJlZmVyZW5jZSh1aWQsICdpZGxlVGltZUxpbWl0Jyk7XG5cbiAgICBpZiAoaXNBdXRvQXdheUVuYWJsZWQpIHtcbiAgICAgIGRlbGV0ZSBVc2VyUHJlc2VuY2UuYXdheVRpbWU7XG4gICAgICBVc2VyUHJlc2VuY2Uuc3RhcnQoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cuUm9ja2V0Q2hhdERlc2t0b3Auc2V0VXNlclByZXNlbmNlRGV0ZWN0aW9uKHtcbiAgICAgIGlzQXV0b0F3YXlFbmFibGVkOiBCb29sZWFuKGlzQXV0b0F3YXlFbmFibGVkKSxcbiAgICAgIGlkbGVUaHJlc2hvbGQ6IGlkbGVUaHJlc2hvbGQgPyBOdW1iZXIoaWRsZVRocmVzaG9sZCkgOiBudWxsLFxuICAgICAgc2V0VXNlck9ubGluZTogKG9ubGluZSkgPT4ge1xuICAgICAgICBpZiAoIW9ubGluZSkge1xuICAgICAgICAgIE1ldGVvci5jYWxsKCdVc2VyUHJlc2VuY2U6YXdheScpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBNZXRlb3IuY2FsbCgnVXNlclByZXNlbmNlOm9ubGluZScpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc29sZS5sb2coJ1tSb2NrZXQuQ2hhdCBEZXNrdG9wXSBJbmplY3RlZC50cyByZXBsYWNlZCBOb3RpZmljYXRpb24nKTtcblxuICB3aW5kb3cuTm90aWZpY2F0aW9uID0gY2xhc3MgUm9ja2V0Q2hhdERlc2t0b3BOb3RpZmljYXRpb25cbiAgICBleHRlbmRzIEV2ZW50VGFyZ2V0XG4gICAgaW1wbGVtZW50cyBOb3RpZmljYXRpb25cbiAge1xuICAgIHN0YXRpYyByZWFkb25seSBwZXJtaXNzaW9uOiBOb3RpZmljYXRpb25QZXJtaXNzaW9uID0gJ2dyYW50ZWQnO1xuXG4gICAgc3RhdGljIHJlYWRvbmx5IG1heEFjdGlvbnM6IG51bWJlciA9XG4gICAgICBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIDogMDtcblxuICAgIHN0YXRpYyByZXF1ZXN0UGVybWlzc2lvbigpOiBQcm9taXNlPE5vdGlmaWNhdGlvblBlcm1pc3Npb24+IHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoUm9ja2V0Q2hhdERlc2t0b3BOb3RpZmljYXRpb24ucGVybWlzc2lvbik7XG4gICAgfVxuXG4gICAgI2Rlc3Ryb3k/OiBQcm9taXNlPCgpID0+IHZvaWQ+O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICB0aXRsZTogc3RyaW5nLFxuICAgICAgb3B0aW9uczogTm90aWZpY2F0aW9uT3B0aW9ucyAmIHsgY2FuUmVwbHk/OiBib29sZWFuIH0gPSB7fVxuICAgICkge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgdGhpcy4jZGVzdHJveSA9IHdpbmRvdy5Sb2NrZXRDaGF0RGVza3RvcC5jcmVhdGVOb3RpZmljYXRpb24oe1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgb25FdmVudDogdGhpcy5oYW5kbGVFdmVudCxcbiAgICAgIH0pLnRoZW4oKGlkKSA9PiAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5Sb2NrZXRDaGF0RGVza3RvcC5kZXN0cm95Tm90aWZpY2F0aW9uKGlkKTtcbiAgICAgIH0pO1xuXG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgdGl0bGUsIC4uLm9wdGlvbnMgfSk7XG4gICAgfVxuXG4gICAgYWN0aW9uczogcmVhZG9ubHkgTm90aWZpY2F0aW9uQWN0aW9uW10gPSBbXTtcblxuICAgIGJhZGdlID0gJyc7XG5cbiAgICBib2R5ID0gJyc7XG5cbiAgICBkYXRhOiBhbnkgPSB1bmRlZmluZWQ7XG5cbiAgICBkaXI6IE5vdGlmaWNhdGlvbkRpcmVjdGlvbiA9ICdhdXRvJztcblxuICAgIGljb24gPSAnJztcblxuICAgIGltYWdlID0gJyc7XG5cbiAgICBsYW5nID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lmxhbmc7XG5cbiAgICAjb25jbGljazogKCh0aGlzOiBOb3RpZmljYXRpb24sIGV2OiBFdmVudCkgPT4gYW55KSB8IG51bGwgPSBudWxsO1xuXG4gICAgZ2V0IG9uY2xpY2soKSB7XG4gICAgICByZXR1cm4gdGhpcy4jb25jbGljaztcbiAgICB9XG5cbiAgICBzZXQgb25jbGljayh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMuI29uY2xpY2spIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuI29uY2xpY2spO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiNvbmNsaWNrID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLiNvbmNsaWNrKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLiNvbmNsaWNrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAjb25jbG9zZTogKCh0aGlzOiBOb3RpZmljYXRpb24sIGV2OiBFdmVudCkgPT4gYW55KSB8IG51bGwgPSBudWxsO1xuXG4gICAgZ2V0IG9uY2xvc2UoKSB7XG4gICAgICByZXR1cm4gdGhpcy4jb25jbG9zZTtcbiAgICB9XG5cbiAgICBzZXQgb25jbG9zZSh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMuI29uY2xvc2UpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbG9zZScsIHRoaXMuI29uY2xvc2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiNvbmNsb3NlID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLiNvbmNsb3NlKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLiNvbmNsb3NlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAjb25lcnJvcjogKCh0aGlzOiBOb3RpZmljYXRpb24sIGV2OiBFdmVudCkgPT4gYW55KSB8IG51bGwgPSBudWxsO1xuXG4gICAgZ2V0IG9uZXJyb3IoKSB7XG4gICAgICByZXR1cm4gdGhpcy4jb25lcnJvcjtcbiAgICB9XG5cbiAgICBzZXQgb25lcnJvcih2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMuI29uZXJyb3IpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuI29uZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiNvbmVycm9yID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLiNvbmVycm9yKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLiNvbmVycm9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAjb25zaG93OiAoKHRoaXM6IE5vdGlmaWNhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbCA9IG51bGw7XG5cbiAgICBnZXQgb25zaG93KCkge1xuICAgICAgcmV0dXJuIHRoaXMuI29uc2hvdztcbiAgICB9XG5cbiAgICBzZXQgb25zaG93KHZhbHVlKSB7XG4gICAgICBpZiAodGhpcy4jb25zaG93KSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2hvdycsIHRoaXMuI29uc2hvdyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuI29uc2hvdyA9IHZhbHVlO1xuXG4gICAgICBpZiAodGhpcy4jb25zaG93KSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignc2hvdycsIHRoaXMuI29uc2hvdyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgI29uYWN0aW9uOiAoKHRoaXM6IE5vdGlmaWNhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbCA9IG51bGw7XG5cbiAgICBnZXQgb25hY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy4jb25hY3Rpb247XG4gICAgfVxuXG4gICAgc2V0IG9uYWN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodGhpcy4jb25hY3Rpb24pIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhY3Rpb24nLCB0aGlzLiNvbmFjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuI29uYWN0aW9uID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLiNvbmFjdGlvbikge1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FjdGlvbicsIHRoaXMuI29uYWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXF1aXJlSW50ZXJhY3Rpb24gPSBmYWxzZTtcblxuICAgIHNpbGVudCA9IGZhbHNlO1xuXG4gICAgdGFnID0gJyc7XG5cbiAgICB0aW1lc3RhbXA6IG51bWJlciA9IERhdGUubm93KCk7XG5cbiAgICB0aXRsZSA9ICcnO1xuXG4gICAgdmlicmF0ZTogcmVhZG9ubHkgbnVtYmVyW10gPSBbXTtcblxuICAgIHByaXZhdGUgaGFuZGxlRXZlbnQgPSAoe1xuICAgICAgdHlwZSxcbiAgICAgIGRldGFpbCxcbiAgICB9OiB7XG4gICAgICB0eXBlOiBzdHJpbmc7XG4gICAgICBkZXRhaWw6IHVua25vd247XG4gICAgfSk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgbWFpbldvcmxkRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWwgfSk7XG5cbiAgICAgIGNvbnN0IGlzUmVwbHlFdmVudCA9IChcbiAgICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgICBkZXRhaWw6IHVua25vd25cbiAgICAgICk6IGRldGFpbCBpcyB7IHJlcGx5OiBzdHJpbmcgfSA9PlxuICAgICAgICB0eXBlID09PSAncmVwbHknICYmXG4gICAgICAgIHR5cGVvZiBkZXRhaWwgPT09ICdvYmplY3QnICYmXG4gICAgICAgIGRldGFpbCAhPT0gbnVsbCAmJlxuICAgICAgICAncmVwbHknIGluIGRldGFpbCAmJlxuICAgICAgICB0eXBlb2YgKGRldGFpbCBhcyB7IHJlcGx5OiBzdHJpbmcgfSkucmVwbHkgPT09ICdzdHJpbmcnO1xuXG4gICAgICBpZiAoaXNSZXBseUV2ZW50KHR5cGUsIGRldGFpbCkpIHtcbiAgICAgICAgKG1haW5Xb3JsZEV2ZW50IGFzIGFueSkucmVzcG9uc2UgPSBkZXRhaWwucmVwbHk7XG4gICAgICB9XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobWFpbldvcmxkRXZlbnQpO1xuICAgIH07XG5cbiAgICBjbG9zZSgpOiB2b2lkIHtcbiAgICAgIGlmICghdGhpcy4jZGVzdHJveSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuI2Rlc3Ryb3k/LnRoZW4oKGRlc3Ryb3kpID0+IHtcbiAgICAgICAgdGhpcy4jZGVzdHJveSA9IHVuZGVmaW5lZDtcbiAgICAgICAgZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnNvbGUubG9nKCdbUm9ja2V0LkNoYXQgRGVza3RvcF0gSW5qZWN0ZWQnKTtcbn07XG5cbnN0YXJ0KCk7XG4iXSwibmFtZXMiOlsiY29uc29sZSIsImxvZyIsInJlc29sdmVXaXRoRXhwb25lbnRpYWxCYWNrb2ZmIiwiZm4iLCJtYXhSZXRyaWVzIiwiZGVsYXkiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNhdGNoIiwiZXJyb3IiLCJzZXRUaW1lb3V0IiwidHJ5UmVxdWlyZSIsInBhdGgiLCJ3aW5kb3ciLCJyZXF1aXJlIiwic3RhcnQiLCJfUm9ja2V0Q2hhdERlc2t0b3BOb3RpZmljYXRpb24iLCJfZGVzdHJveSIsIl9vbmNsaWNrIiwiX29uY2xvc2UiLCJfb25lcnJvciIsIl9vbnNob3ciLCJfb25hY3Rpb24iLCJJbmZvIiwic2VydmVySW5mbyIsInZlcnNpb24iLCJSb2NrZXRDaGF0RGVza3RvcCIsInNldFNlcnZlckluZm8iLCJ2ZXJzaW9uSXNHcmVhdGVyT3JFcXVhbHNUbyIsInZlcnNpb24xIiwidmVyc2lvbjIiLCJjbGVhblZlcnNpb24xIiwic3BsaXQiLCJjbGVhblZlcnNpb24yIiwidjEiLCJtYXAiLCJOdW1iZXIiLCJ2MiIsIm1heExlbmd0aCIsIk1hdGgiLCJtYXgiLCJsZW5ndGgiLCJpIiwibjEiLCJuMiIsInVzZXJQcmVzZW5jZU1vZHVsZVBhdGgiLCJzZXR0aW5nc01vZHVsZVBhdGgiLCJ1dGlsc01vZHVsZVBhdGgiLCJNZXRlb3IiLCJTZXNzaW9uIiwiVHJhY2tlciIsIlVzZXJQcmVzZW5jZSIsInNldHRpbmdzIiwiZ2V0VXNlclByZWZlcmVuY2UiLCJzZXRVcmxSZXNvbHZlciIsImFic29sdXRlVXJsIiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwiYXJncyIsIndyaXRlVGV4dFRvQ2xpcGJvYXJkIiwiYXV0b3J1biIsInVucmVhZCIsImdldCIsInNldEJhZGdlIiwidXJsIiwiZGVmYXVsdFVybCIsInNldEZhdmljb24iLCJvcGVuIiwiYmluZCIsInNlcnZlck1haW5WZXJzaW9uIiwiaml0c2lEb21haW4iLCJuYW1lIiwiZmVhdHVyZXMiLCJwcm9jZXNzIiwibWFzIiwiZ2V0SW50ZXJuYWxWaWRlb0NoYXRXaW5kb3dFbmFibGVkIiwiaW5jbHVkZXMiLCJzZXRCYWNrZ3JvdW5kIiwiZ2V0T3V0bG9va1NldHRpbmdzIiwiX3VzZXIkc2V0dGluZ3MiLCJ1c2VyVG9rZW4iLCJfbG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInVzZXJJZCIsIm91dGxvb2tDYWxlbmRhckVuYWJsZWQiLCJvdXRsb29rRXhjaGFuZ2VVcmwiLCJ1c2VyIiwib3V0bG9va1NldHRpbmdzIiwiY2FsZW5kYXIiLCJvdXRsb29rIiwiX2lkIiwiRW5hYmxlZCIsIkV4Y2hhbmdlX1VybCIsInNldFVzZXJUb2tlbiIsInNldE91dGxvb2tFeGNoYW5nZVVybCIsInNpdGVOYW1lIiwic2V0VGl0bGUiLCJzZXRVc2VyTG9nZ2VkSW4iLCJnaXRDb21taXRIYXNoIiwic2V0R2l0Q29tbWl0SGFzaCIsInVpZCIsInRoZW1lQXBwZWFyYW5jZSIsInNldFVzZXJUaGVtZUFwcGVhcmFuY2UiLCJpc0F1dG9Bd2F5RW5hYmxlZCIsImlkbGVUaHJlc2hvbGQiLCJhd2F5VGltZSIsInNldFVzZXJQcmVzZW5jZURldGVjdGlvbiIsIkJvb2xlYW4iLCJzZXRVc2VyT25saW5lIiwib25saW5lIiwiY2FsbCIsIk5vdGlmaWNhdGlvbiIsIldlYWtNYXAiLCJSb2NrZXRDaGF0RGVza3RvcE5vdGlmaWNhdGlvbiIsIkV2ZW50VGFyZ2V0IiwicmVxdWVzdFBlcm1pc3Npb24iLCJwZXJtaXNzaW9uIiwiY29uc3RydWN0b3IiLCJ0aXRsZSIsIm9wdGlvbnMiLCJfY2xhc3NQcml2YXRlRmllbGRJbml0U3BlYyIsIl9kZWZpbmVQcm9wZXJ0eSIsInVuZGVmaW5lZCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwibGFuZyIsIkRhdGUiLCJub3ciLCJ0eXBlIiwiZGV0YWlsIiwibWFpbldvcmxkRXZlbnQiLCJDdXN0b21FdmVudCIsImlzUmVwbHlFdmVudCIsInJlcGx5IiwicmVzcG9uc2UiLCJkaXNwYXRjaEV2ZW50IiwiX2NsYXNzUHJpdmF0ZUZpZWxkU2V0IiwiY3JlYXRlTm90aWZpY2F0aW9uIiwib25FdmVudCIsImhhbmRsZUV2ZW50IiwidGhlbiIsImlkIiwiZGVzdHJveU5vdGlmaWNhdGlvbiIsIk9iamVjdCIsImFzc2lnbiIsIm9uY2xpY2siLCJfY2xhc3NQcml2YXRlRmllbGRHZXQiLCJ2YWx1ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwib25jbG9zZSIsIm9uZXJyb3IiLCJvbnNob3ciLCJvbmFjdGlvbiIsImNsb3NlIiwiX2NsYXNzUHJpdmF0ZUZpZWxkR2V0MiIsImRlc3Ryb3kiLCJwbGF0Zm9ybSIsIk1BWF9TQUZFX0lOVEVHRVIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQVdBQSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0VBRWhELE1BQU1DLDZCQUE2QixHQUFHQSxDQUNwQ0MsRUFBb0IsRUFDcEI7RUFBRUMsRUFBQUEsVUFBVSxHQUFHLENBQUM7RUFBRUMsRUFBQUEsS0FBSyxHQUFHLElBQUE7RUFBSyxDQUFDLEdBQUcsRUFBRSxLQUVyQyxJQUFJQyxPQUFPLENBQUtDLE9BQU8sSUFBS0EsT0FBTyxDQUFDSixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUNLLEtBQUssQ0FBRUMsS0FBSyxJQUFLO0lBQzFE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
