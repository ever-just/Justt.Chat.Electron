'use strict';

var i18next = require('i18next');
var require$$0 = require('react-dom');
var reactI18next = require('react-i18next');
var electron = require('electron');
var path = require('path');
var fuselage = require('@rocket.chat/fuselage');
var require$$0$1 = require('react');
var styled = require('@emotion/styled');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var i18next__default = /*#__PURE__*/_interopDefault(i18next);
var require$$0__default = /*#__PURE__*/_interopDefault(require$$0);
var path__default = /*#__PURE__*/_interopDefault(path);
var require$$0__default$1 = /*#__PURE__*/_interopDefault(require$$0$1);
var styled__default = /*#__PURE__*/_interopDefault(styled);

var createRoot;

var m = require$$0__default.default;
{
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  createRoot = function (c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}

const fallbackLng = 'en';
const byteUnits = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];
const formatBytes = bytes => {
  const order = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), byteUnits.length - 1);
  const unit = byteUnits[order];
  if (!unit) {
    return '???';
  }
  const formatter = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    style: 'unit',
    unit,
    maximumFractionDigits: 1
  });
  return formatter.format(bytes / Math.pow(1024, order));
};
const formatByteSpeed = bytesPerSecond => {
  const order = Math.min(Math.floor(Math.log(bytesPerSecond) / Math.log(1024)), byteUnits.length - 1);
  const unit = byteUnits[order];
  if (!unit) {
    return '???';
  }
  const formatter = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    style: 'unit',
    unit: `${unit}-per-second`,
    maximumFractionDigits: 1
  });
  return formatter.format(bytesPerSecond / Math.pow(1024, order));
};
const formatPercentage = ratio => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'percent',
    maximumFractionDigits: 0
  });
  return formatter.format(ratio);
};
const formatDuration = duration => {
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    style: 'narrow',
    numeric: 'always'
  });
  duration /= 1000;
  if (duration / 60 < 1) {
    return formatter.format(duration, 'second');
  }
  duration /= 60;
  if (duration / 60 < 1) {
    return formatter.format(duration, 'minute');
  }
  duration /= 60;
  if (duration / 24 < 1) {
    return formatter.format(duration, 'hour');
  }
  duration /= 24;
  if (duration / 7 < 1) {
    return formatter.format(duration, 'day');
  }
  duration /= 7;
  if (duration / 30 < 1) {
    return formatter.format(duration, 'week');
  }
  duration /= 30;
  if (duration / 12 < 1) {
    return formatter.format(duration, 'month');
  }
  duration /= 12;
  return formatter.format(duration, 'year');
};
const interpolation = {
  format: (value, format, lng) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return new Intl.DateTimeFormat(lng).format(value);
    }
    switch (format) {
      case 'byteSize':
        return formatBytes(value);
      case 'byteSpeed':
        return formatByteSpeed(value);
      case 'percentage':
        return formatPercentage(value);
      case 'duration':
        return formatDuration(value);
    }
    return String(value);
  }
};

var resources = {
  'de-DE': () => Promise.resolve().then(function () { return require('./de-DE.i18n-zYeVcvFe.js'); }),
  'en': () => Promise.resolve().then(function () { return require('./en.i18n-jwfYqV9u.js'); }),
  'es': () => Promise.resolve().then(function () { return require('./es.i18n-mvst8T2P.js'); }),
  'fi': () => Promise.resolve().then(function () { return require('./fi.i18n-olN9WWsA.js'); }),
  'fr': () => Promise.resolve().then(function () { return require('./fr.i18n-G8cHMWxa.js'); }),
  'hu': () => Promise.resolve().then(function () { return require('./hu.i18n-P-xRBioD.js'); }),
  'it-IT': () => Promise.resolve().then(function () { return require('./it-IT.i18n-2hFwDdhB.js'); }),
  'ja': () => Promise.resolve().then(function () { return require('./ja.i18n-NBkU_Y_C.js'); }),
  'pl': () => Promise.resolve().then(function () { return require('./pl.i18n-MFa8J0bQ.js'); }),
  'pt-BR': () => Promise.resolve().then(function () { return require('./pt-BR.i18n-X-8Hs69r.js'); }),
  'ru': () => Promise.resolve().then(function () { return require('./ru.i18n-8xMmcVtm.js'); }),
  'tr-TR': () => Promise.resolve().then(function () { return require('./tr-TR.i18n-4A1ULGdv.js'); }),
  'uk-UA': () => Promise.resolve().then(function () { return require('./uk-UA.i18n-R8_DNMRq.js'); }),
  'zh-CN': () => Promise.resolve().then(function () { return require('./zh-CN.i18n-vJV6_qFp.js'); }),
  'zh-TW': () => Promise.resolve().then(function () { return require('./zh-TW.i18n-s3uonwp0.js'); })
};

const invokeWithRetry = (channel, retryOptions = {}, ...args) => {
  const {
    maxAttempts = 3,
    retryDelay = 1000,
    logRetries = true,
    shouldRetry = () => true
  } = retryOptions;
  const attemptInvoke = async attempt => {
    try {
      const result = await electron.ipcRenderer.invoke(channel, ...args);

      // Check if result indicates failure (for channels that return success flags)
      if (result && typeof result === 'object' && 'success' in result && result.success === false) {
        throw new Error(`IPC call failed: ${channel} returned success: false`);
      }
      return result;
    } catch (error) {
      const isLastAttempt = attempt >= maxAttempts;
      if (logRetries) {
        console.log(`IPC call failed: ${channel} (attempt ${attempt}/${maxAttempts})`, error);
      }
      if (isLastAttempt || !shouldRetry(error, attempt)) {
        if (logRetries) {
          console.error(`IPC call giving up: ${channel} after ${attempt} attempts`, error);
        }
        throw error;
      }
      if (logRetries) {
        console.log(`IPC call retrying: ${channel} in ${retryDelay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return attemptInvoke(attempt + 1);
    }
  };
  return attemptInvoke(1);
};

var jsxRuntime = {exports: {}};

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

{
  (function () {

    var React = require$$0__default$1.default;

    // ATTENTION
    // When adding new symbols to this file,
    // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
    // The Symbol used to tag the ReactElement-like types.
    var REACT_ELEMENT_TYPE = Symbol.for('react.element');
    var REACT_PORTAL_TYPE = Symbol.for('react.portal');
    var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
    var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
    var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
    var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
    var REACT_CONTEXT_TYPE = Symbol.for('react.context');
    var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
    var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
    var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
    var REACT_MEMO_TYPE = Symbol.for('react.memo');
    var REACT_LAZY_TYPE = Symbol.for('react.lazy');
    var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator';
    function getIteratorFn(maybeIterable) {
      if (maybeIterable === null || typeof maybeIterable !== 'object') {
        return null;
      }
      var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
      if (typeof maybeIterator === 'function') {
        return maybeIterator;
      }
      return null;
    }
    var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function error(format) {
      {
        {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }
          printWarning('error', format, args);
        }
      }
    }
    function printWarning(level, format, args) {
      // When changing this logic, you might want to also
      // update consoleWithStackDev.www.js as well.
      {
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        var stack = ReactDebugCurrentFrame.getStackAddendum();
        if (stack !== '') {
          format += '%s';
          args = args.concat([stack]);
        } // eslint-disable-next-line react-internal/safe-string-coercion

        var argsWithFormat = args.map(function (item) {
          return String(item);
        }); // Careful: RN currently depends on this prefix

        argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
        // breaks IE9: https://github.com/facebook/react/issues/13610
        // eslint-disable-next-line react-internal/no-production-logging

        Function.prototype.apply.call(console[level], console, argsWithFormat);
      }
    }

    // -----------------------------------------------------------------------------

    var enableScopeAPI = false; // Experimental Create Event Handle API.
    var enableCacheElement = false;
    var enableTransitionTracing = false; // No known bugs, but needs performance testing

    var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
    // stuff. Intended to enable React core members to more easily debug scheduling
    // issues in DEV builds.

    var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

    var REACT_MODULE_REFERENCE;
    {
      REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
    }
    function isValidElementType(type) {
      if (typeof type === 'string' || typeof type === 'function') {
        return true;
      } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).

      if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
        return true;
      }
      if (typeof type === 'object' && type !== null) {
        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE ||
        // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
          return true;
        }
      }
      return false;
    }
    function getWrappedName(outerType, innerType, wrapperName) {
      var displayName = outerType.displayName;
      if (displayName) {
        return displayName;
      }
      var functionName = innerType.displayName || innerType.name || '';
      return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
    } // Keep in sync with react-reconciler/getComponentNameFromFiber

    function getContextName(type) {
      return type.displayName || 'Context';
    } // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.

    function getComponentNameFromType(type) {
      if (type == null) {
        // Host root, text node or just invalid type.
        return null;
      }
      {
        if (typeof type.tag === 'number') {
          error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
        }
      }
      if (typeof type === 'function') {
        return type.displayName || type.name || null;
      }
      if (typeof type === 'string') {
        return type;
      }
      switch (type) {
        case REACT_FRAGMENT_TYPE:
          return 'Fragment';
        case REACT_PORTAL_TYPE:
          return 'Portal';
        case REACT_PROFILER_TYPE:
          return 'Profiler';
        case REACT_STRICT_MODE_TYPE:
          return 'StrictMode';
        case REACT_SUSPENSE_TYPE:
          return 'Suspense';
        case REACT_SUSPENSE_LIST_TYPE:
          return 'SuspenseList';
      }
      if (typeof type === 'object') {
        switch (type.$$typeof) {
          case REACT_CONTEXT_TYPE:
            var context = type;
            return getContextName(context) + '.Consumer';
          case REACT_PROVIDER_TYPE:
            var provider = type;
            return getContextName(provider._context) + '.Provider';
          case REACT_FORWARD_REF_TYPE:
            return getWrappedName(type, type.render, 'ForwardRef');
          case REACT_MEMO_TYPE:
            var outerName = type.displayName || null;
            if (outerName !== null) {
              return outerName;
            }
            return getComponentNameFromType(type.type) || 'Memo';
          case REACT_LAZY_TYPE:
            {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return getComponentNameFromType(init(payload));
              } catch (x) {
                return null;
              }
            }

          // eslint-disable-next-line no-fallthrough
        }
      }
      return null;
    }
    var assign = Object.assign;

    // Helpers to patch console.logs to avoid logging during side-effect free
    // replaying on render function. This currently only patches the object
    // lazily which won't cover if the log function was extracted eagerly.
    // We could also eagerly patch the method.
    var disabledDepth = 0;
    var prevLog;
    var prevInfo;
    var prevWarn;
    var prevError;
    var prevGroup;
    var prevGroupCollapsed;
    var prevGroupEnd;
    function disabledLog() {}
    disabledLog.__reactDisabledLog = true;
    function disableLogs() {
      {
        if (disabledDepth === 0) {
          /* eslint-disable react-internal/no-production-logging */
          prevLog = console.log;
          prevInfo = console.info;
          prevWarn = console.warn;
          prevError = console.error;
          prevGroup = console.group;
          prevGroupCollapsed = console.groupCollapsed;
          prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

          var props = {
            configurable: true,
            enumerable: true,
            value: disabledLog,
            writable: true
          }; // $FlowFixMe Flow thinks console is immutable.

          Object.defineProperties(console, {
            info: props,
            log: props,
            warn: props,
            error: props,
            group: props,
            groupCollapsed: props,
            groupEnd: props
          });
          /* eslint-enable react-internal/no-production-logging */
        }
        disabledDepth++;
      }
    }
    function reenableLogs() {
      {
        disabledDepth--;
        if (disabledDepth === 0) {
          /* eslint-disable react-internal/no-production-logging */
          var props = {
            configurable: true,
            enumerable: true,
            writable: true
          }; // $FlowFixMe Flow thinks console is immutable.

          Object.defineProperties(console, {
            log: assign({}, props, {
              value: prevLog
            }),
            info: assign({}, props, {
              value: prevInfo
            }),
            warn: assign({}, props, {
              value: prevWarn
            }),
            error: assign({}, props, {
              value: prevError
            }),
            group: assign({}, props, {
              value: prevGroup
            }),
            groupCollapsed: assign({}, props, {
              value: prevGroupCollapsed
            }),
            groupEnd: assign({}, props, {
              value: prevGroupEnd
            })
          });
          /* eslint-enable react-internal/no-production-logging */
        }
        if (disabledDepth < 0) {
          error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
        }
      }
    }
    var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
    var prefix;
    function describeBuiltInComponentFrame(name, source, ownerFn) {
      {
        if (prefix === undefined) {
          // Extract the VM specific prefix used by each line.
          try {
            throw Error();
          } catch (x) {
            var match = x.stack.trim().match(/\n( *(at )?)/);
            prefix = match && match[1] || '';
          }
        } // We use the prefix to ensure our stacks line up with native stack frames.

        return '\n' + prefix + name;
      }
    }
    var reentry = false;
    var componentFrameCache;
    {
      var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
      componentFrameCache = new PossiblyWeakMap();
    }
    function describeNativeComponentFrame(fn, construct) {
      // If something asked for a stack inside a fake render, it should get ignored.
      if (!fn || reentry) {
        return '';
      }
      {
        var frame = componentFrameCache.get(fn);
        if (frame !== undefined) {
          return frame;
        }
      }
      var control;
      reentry = true;
      var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

      Error.prepareStackTrace = undefined;
      var previousDispatcher;
      {
        previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
        // for warnings.

        ReactCurrentDispatcher.current = null;
        disableLogs();
      }
      try {
        // This should throw.
        if (construct) {
          // Something should be setting the props in the constructor.
          var Fake = function () {
            throw Error();
          }; // $FlowFixMe

          Object.defineProperty(Fake.prototype, 'props', {
            set: function () {
              // We use a throwing setter instead of frozen or non-writable props
              // because that won't throw in a non-strict mode function.
              throw Error();
            }
          });
          if (typeof Reflect === 'object' && Reflect.construct) {
            // We construct a different control for this case to include any extra
            // frames added by the construct call.
            try {
              Reflect.construct(Fake, []);
            } catch (x) {
              control = x;
            }
            Reflect.construct(fn, [], Fake);
          } else {
            try {
              Fake.call();
            } catch (x) {
              control = x;
            }
            fn.call(Fake.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (x) {
            control = x;
          }
          fn();
        }
      } catch (sample) {
        // This is inlined manually because closure doesn't do it for us.
        if (sample && control && typeof sample.stack === 'string') {
          // This extracts the first frame from the sample that isn't also in the control.
          // Skipping one frame that we assume is the frame that calls the two.
          var sampleLines = sample.stack.split('\n');
          var controlLines = control.stack.split('\n');
          var s = sampleLines.length - 1;
          var c = controlLines.length - 1;
          while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
            // We expect at least one stack frame to be shared.
            // Typically this will be the root most one. However, stack frames may be
            // cut off due to maximum stack limits. In this case, one maybe cut off
            // earlier than the other. We assume that the sample is longer or the same
            // and there for cut off earlier. So we should find the root most frame in
            // the sample somewhere in the control.
            c--;
          }
          for (; s >= 1 && c >= 0; s--, c--) {
            // Next we find the first one that isn't the same which should be the
            // frame that called our sample function and the control.
            if (sampleLines[s] !== controlLines[c]) {
              // In V8, the first line is describing the message but other VMs don't.
              // If we're about to return the first line, and the control is also on the same
              // line, that's a pretty good indicator that our sample threw at same line as
              // the control. I.e. before we entered the sample frame. So we ignore this result.
              // This can happen if you passed a class to function component, or non-function.
              if (s !== 1 || c !== 1) {
                do {
                  s--;
                  c--; // We may still have similar intermediate frames from the construct call.
                  // The next one that isn't the same should be our match though.

                  if (c < 0 || sampleLines[s] !== controlLines[c]) {
                    // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                    var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                    // but we have a user-provided "displayName"
                    // splice it in to make the stack more readable.

                    if (fn.displayName && _frame.includes('<anonymous>')) {
                      _frame = _frame.replace('<anonymous>', fn.displayName);
                    }
                    {
                      if (typeof fn === 'function') {
                        componentFrameCache.set(fn, _frame);
                      }
                    } // Return the line we found.

                    return _frame;
                  }
                } while (s >= 1 && c >= 0);
              }
              break;
            }
          }
        }
      } finally {
        reentry = false;
        {
          ReactCurrentDispatcher.current = previousDispatcher;
          reenableLogs();
        }
        Error.prepareStackTrace = previousPrepareStackTrace;
      } // Fallback to just using the name if we couldn't make it throw.

      var name = fn ? fn.displayName || fn.name : '';
      var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';
      {
        if (typeof fn === 'function') {
          componentFrameCache.set(fn, syntheticFrame);
        }
      }
      return syntheticFrame;
    }
    function describeFunctionComponentFrame(fn, source, ownerFn) {
      {
        return describeNativeComponentFrame(fn, false);
      }
    }
    function shouldConstruct(Component) {
      var prototype = Component.prototype;
      return !!(prototype && prototype.isReactComponent);
    }
    function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
      if (type == null) {
        return '';
      }
      if (typeof type === 'function') {
        {
          return describeNativeComponentFrame(type, shouldConstruct(type));
        }
      }
      if (typeof type === 'string') {
        return describeBuiltInComponentFrame(type);
      }
      switch (type) {
        case REACT_SUSPENSE_TYPE:
          return describeBuiltInComponentFrame('Suspense');
        case REACT_SUSPENSE_LIST_TYPE:
          return describeBuiltInComponentFrame('SuspenseList');
      }
      if (typeof type === 'object') {
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
            return describeFunctionComponentFrame(type.render);
          case REACT_MEMO_TYPE:
            // Memo may contain any component type so we recursively resolve it.
            return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
          case REACT_LAZY_TYPE:
            {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                // Lazy may contain any component type so we recursively resolve it.
                return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
              } catch (x) {}
            }
        }
      }
      return '';
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var loggedTypeFailures = {};
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    function setCurrentlyValidatingElement(element) {
      {
        if (element) {
          var owner = element._owner;
          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
          ReactDebugCurrentFrame.setExtraStackFrame(stack);
        } else {
          ReactDebugCurrentFrame.setExtraStackFrame(null);
        }
      }
    }
    function checkPropTypes(typeSpecs, values, location, componentName, element) {
      {
        // $FlowFixMe This is okay but Flow doesn't know it.
        var has = Function.call.bind(hasOwnProperty);
        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
            // fail the render phase where it didn't fail before. So we log it.
            // After these have been cleaned up, we'll let them throw.

            try {
              // This is intentionally an invariant that gets caught. It's the same
              // behavior as without this statement except with a better message.
              if (typeof typeSpecs[typeSpecName] !== 'function') {
                // eslint-disable-next-line react-internal/prod-error-codes
                var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
                err.name = 'Invariant Violation';
                throw err;
              }
              error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
            } catch (ex) {
              error$1 = ex;
            }
            if (error$1 && !(error$1 instanceof Error)) {
              setCurrentlyValidatingElement(element);
              error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);
              setCurrentlyValidatingElement(null);
            }
            if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
              // Only monitor this failure once because there tends to be a lot of the
              // same error.
              loggedTypeFailures[error$1.message] = true;
              setCurrentlyValidatingElement(element);
              error('Failed %s type: %s', location, error$1.message);
              setCurrentlyValidatingElement(null);
            }
          }
        }
      }
    }
    var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

    function isArray(a) {
      return isArrayImpl(a);
    }

    /*
     * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
     * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
     *
     * The functions in this module will throw an easier-to-understand,
     * easier-to-debug exception with a clear errors message message explaining the
     * problem. (Instead of a confusing exception thrown inside the implementation
     * of the `value` object).
     */
    // $FlowFixMe only called in DEV, so void return is not possible.
    function typeName(value) {
      {
        // toStringTag is needed for namespaced types like Temporal.Instant
        var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
        var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
        return type;
      }
    } // $FlowFixMe only called in DEV, so void return is not possible.

    function willCoercionThrow(value) {
      {
        try {
          testStringCoercion(value);
          return false;
        } catch (e) {
          return true;
        }
      }
    }
    function testStringCoercion(value) {
      // If you ended up here by following an exception call stack, here's what's
      // happened: you supplied an object or symbol value to React (as a prop, key,
      // DOM attribute, CSS property, string ref, etc.) and when React tried to
      // coerce it to a string using `'' + value`, an exception was thrown.
      //
      // The most common types that will cause this exception are `Symbol` instances
      // and Temporal objects like `Temporal.Instant`. But any object that has a
      // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
      // exception. (Library authors do this to prevent users from using built-in
      // numeric operators like `+` or comparison operators like `>=` because custom
      // methods are needed to perform accurate arithmetic or comparison.)
      //
      // To fix the problem, coerce this object or symbol value to a string before
      // passing it to React. The most reliable way is usually `String(value)`.
      //
      // To find which value is throwing, check the browser or debugger console.
      // Before this exception was thrown, there should be `console.error` output
      // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
      // problem and how that type was used: key, atrribute, input value prop, etc.
      // In most cases, this console output also shows the component and its
      // ancestor components where the exception happened.
      //
      // eslint-disable-next-line react-internal/safe-string-coercion
      return '' + value;
    }
    function checkKeyStringCoercion(value) {
      {
        if (willCoercionThrow(value)) {
          error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));
          return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
        }
      }
    }
    var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
    var RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true
    };
    var specialPropKeyWarningShown;
    var specialPropRefWarningShown;
    var didWarnAboutStringRefs;
    {
      didWarnAboutStringRefs = {};
    }
    function hasValidRef(config) {
      {
        if (hasOwnProperty.call(config, 'ref')) {
          var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
          if (getter && getter.isReactWarning) {
            return false;
          }
        }
      }
      return config.ref !== undefined;
    }
    function hasValidKey(config) {
      {
        if (hasOwnProperty.call(config, 'key')) {
          var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
          if (getter && getter.isReactWarning) {
            return false;
          }
        }
      }
      return config.key !== undefined;
    }
    function warnIfStringRefCannotBeAutoConverted(config, self) {
      {
        if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
          var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
          if (!didWarnAboutStringRefs[componentName]) {
            error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
            didWarnAboutStringRefs[componentName] = true;
          }
        }
      }
    }
    function defineKeyPropWarningGetter(props, displayName) {
      {
        var warnAboutAccessingKey = function () {
          if (!specialPropKeyWarningShown) {
            specialPropKeyWarningShown = true;
            error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
          }
        };
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, 'key', {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
    }
    function defineRefPropWarningGetter(props, displayName) {
      {
        var warnAboutAccessingRef = function () {
          if (!specialPropRefWarningShown) {
            specialPropRefWarningShown = true;
            error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
          }
        };
        warnAboutAccessingRef.isReactWarning = true;
        Object.defineProperty(props, 'ref', {
          get: warnAboutAccessingRef,
          configurable: true
        });
      }
    }
    /**
     * Factory method to create a new React element. This no longer adheres to
     * the class pattern, so do not use new to call it. Also, instanceof check
     * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
     * if something is a React Element.
     *
     * @param {*} type
     * @param {*} props
     * @param {*} key
     * @param {string|object} ref
     * @param {*} owner
     * @param {*} self A *temporary* helper to detect places where `this` is
     * different from the `owner` when React.createElement is called, so that we
     * can warn. We want to get rid of owner and replace string `ref`s with arrow
     * functions, and as long as `this` and owner are the same, there will be no
     * change in behavior.
     * @param {*} source An annotation object (added by a transpiler or otherwise)
     * indicating filename, line number, and/or other information.
     * @internal
     */

    var ReactElement = function (type, key, ref, self, source, owner, props) {
      var element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type: type,
        key: key,
        ref: ref,
        props: props,
        // Record the component responsible for creating this element.
        _owner: owner
      };
      {
        // The validation flag is currently mutative. We put it on
        // an external backing store so that we can freeze the whole object.
        // This can be replaced with a WeakMap once they are implemented in
        // commonly used development environments.
        element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
        // the validation flag non-enumerable (where possible, which should
        // include every environment we run tests in), so the test framework
        // ignores it.

        Object.defineProperty(element._store, 'validated', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: false
        }); // self and source are DEV only properties.

        Object.defineProperty(element, '_self', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: self
        }); // Two elements created in two different places should be considered
        // equal for testing purposes and therefore we hide it from enumeration.

        Object.defineProperty(element, '_source', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: source
        });
        if (Object.freeze) {
          Object.freeze(element.props);
          Object.freeze(element);
        }
      }
      return element;
    };
    /**
     * https://github.com/reactjs/rfcs/pull/107
     * @param {*} type
     * @param {object} props
     * @param {string} key
     */

    function jsxDEV(type, config, maybeKey, source, self) {
      {
        var propName; // Reserved names are extracted

        var props = {};
        var key = null;
        var ref = null; // Currently, key can be spread in as a prop. This causes a potential
        // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
        // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
        // but as an intermediary step, we will use jsxDEV for everything except
        // <div {...props} key="Hi" />, because we aren't currently able to tell if
        // key is explicitly declared to be undefined or not.

        if (maybeKey !== undefined) {
          {
            checkKeyStringCoercion(maybeKey);
          }
          key = '' + maybeKey;
        }
        if (hasValidKey(config)) {
          {
            checkKeyStringCoercion(config.key);
          }
          key = '' + config.key;
        }
        if (hasValidRef(config)) {
          ref = config.ref;
          warnIfStringRefCannotBeAutoConverted(config, self);
        } // Remaining properties are added to a new props object

        for (propName in config) {
          if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
          }
        } // Resolve default props

        if (type && type.defaultProps) {
          var defaultProps = type.defaultProps;
          for (propName in defaultProps) {
            if (props[propName] === undefined) {
              props[propName] = defaultProps[propName];
            }
          }
        }
        if (key || ref) {
          var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
          if (key) {
            defineKeyPropWarningGetter(props, displayName);
          }
          if (ref) {
            defineRefPropWarningGetter(props, displayName);
          }
        }
        return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
      }
    }
    var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
    var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
    function setCurrentlyValidatingElement$1(element) {
      {
        if (element) {
          var owner = element._owner;
          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
          ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
        } else {
          ReactDebugCurrentFrame$1.setExtraStackFrame(null);
        }
      }
    }
    var propTypesMisspellWarningShown;
    {
      propTypesMisspellWarningShown = false;
    }
    /**
     * Verifies the object is a ReactElement.
     * See https://reactjs.org/docs/react-api.html#isvalidelement
     * @param {?object} object
     * @return {boolean} True if `object` is a ReactElement.
     * @final
     */

    function isValidElement(object) {
      {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }
    }
    function getDeclarationErrorAddendum() {
      {
        if (ReactCurrentOwner$1.current) {
          var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
          if (name) {
            return '\n\nCheck the render method of `' + name + '`.';
          }
        }
        return '';
      }
    }
    function getSourceInfoErrorAddendum(source) {
      {
        if (source !== undefined) {
          var fileName = source.fileName.replace(/^.*[\\\/]/, '');
          var lineNumber = source.lineNumber;
          return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
        }
        return '';
      }
    }
    /**
     * Warn if there's no key explicitly set on dynamic arrays of children or
     * object keys are not valid. This allows us to keep track of children between
     * updates.
     */

    var ownerHasKeyUseWarning = {};
    function getCurrentComponentErrorInfo(parentType) {
      {
        var info = getDeclarationErrorAddendum();
        if (!info) {
          var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
          if (parentName) {
            info = "\n\nCheck the top-level render call using <" + parentName + ">.";
          }
        }
        return info;
      }
    }
    /**
     * Warn if the element doesn't have an explicit key assigned to it.
     * This element is in an array. The array could grow and shrink or be
     * reordered. All children that haven't already been validated are required to
     * have a "key" property assigned to it. Error statuses are cached so a warning
     * will only be shown once.
     *
     * @internal
     * @param {ReactElement} element Element that requires a key.
     * @param {*} parentType element's parent's type.
     */

    function validateExplicitKey(element, parentType) {
      {
        if (!element._store || element._store.validated || element.key != null) {
          return;
        }
        element._store.validated = true;
        var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
        if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
          return;
        }
        ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
        // property, it may be the creator of the child that's responsible for
        // assigning it a key.

        var childOwner = '';
        if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
          // Give the component that originally created this child.
          childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
        }
        setCurrentlyValidatingElement$1(element);
        error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
        setCurrentlyValidatingElement$1(null);
      }
    }
    /**
     * Ensure that every element either is passed in a static location, in an
     * array with an explicit keys property defined, or in an object literal
     * with valid key property.
     *
     * @internal
     * @param {ReactNode} node Statically passed child of any type.
     * @param {*} parentType node's parent's type.
     */

    function validateChildKeys(node, parentType) {
      {
        if (typeof node !== 'object') {
          return;
        }
        if (isArray(node)) {
          for (var i = 0; i < node.length; i++) {
            var child = node[i];
            if (isValidElement(child)) {
              validateExplicitKey(child, parentType);
            }
          }
        } else if (isValidElement(node)) {
          // This element was passed in a valid location.
          if (node._store) {
            node._store.validated = true;
          }
        } else if (node) {
          var iteratorFn = getIteratorFn(node);
          if (typeof iteratorFn === 'function') {
            // Entry iterators used to provide implicit keys,
            // but now we print a separate warning for them later.
            if (iteratorFn !== node.entries) {
              var iterator = iteratorFn.call(node);
              var step;
              while (!(step = iterator.next()).done) {
                if (isValidElement(step.value)) {
                  validateExplicitKey(step.value, parentType);
                }
              }
            }
          }
        }
      }
    }
    /**
     * Given an element, validate that its props follow the propTypes definition,
     * provided by the type.
     *
     * @param {ReactElement} element
     */

    function validatePropTypes(element) {
      {
        var type = element.type;
        if (type === null || type === undefined || typeof type === 'string') {
          return;
        }
        var propTypes;
        if (typeof type === 'function') {
          propTypes = type.propTypes;
        } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE ||
        // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        type.$$typeof === REACT_MEMO_TYPE)) {
          propTypes = type.propTypes;
        } else {
          return;
        }
        if (propTypes) {
          // Intentionally inside to avoid triggering lazy initializers:
          var name = getComponentNameFromType(type);
          checkPropTypes(propTypes, element.props, 'prop', name, element);
        } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
          propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

          var _name = getComponentNameFromType(type);
          error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
        }
        if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
          error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
        }
      }
    }
    /**
     * Given a fragment, validate that it can only be provided with fragment props
     * @param {ReactElement} fragment
     */

    function validateFragmentProps(fragment) {
      {
        var keys = Object.keys(fragment.props);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (key !== 'children' && key !== 'key') {
            setCurrentlyValidatingElement$1(fragment);
            error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);
            setCurrentlyValidatingElement$1(null);
            break;
          }
        }
        if (fragment.ref !== null) {
          setCurrentlyValidatingElement$1(fragment);
          error('Invalid attribute `ref` supplied to `React.Fragment`.');
          setCurrentlyValidatingElement$1(null);
        }
      }
    }
    var didWarnAboutKeySpread = {};
    function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
      {
        var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
        // succeed and there will likely be errors in render.

        if (!validType) {
          var info = '';
          if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
            info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
          }
          var sourceInfo = getSourceInfoErrorAddendum(source);
          if (sourceInfo) {
            info += sourceInfo;
          } else {
            info += getDeclarationErrorAddendum();
          }
          var typeString;
          if (type === null) {
            typeString = 'null';
          } else if (isArray(type)) {
            typeString = 'array';
          } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
            typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
            info = ' Did you accidentally export a JSX literal instead of a component?';
          } else {
            typeString = typeof type;
          }
          error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
        }
        var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
        // TODO: Drop this when these are no longer allowed as the type argument.

        if (element == null) {
          return element;
        } // Skip key warning if the type isn't valid since our key validation logic
        // doesn't expect a non-string/function type and can throw confusing errors.
        // We don't want exception behavior to differ between dev and prod.
        // (Rendering will throw with a helpful message and as soon as the type is
        // fixed, the key warnings will appear.)

        if (validType) {
          var children = props.children;
          if (children !== undefined) {
            if (isStaticChildren) {
              if (isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                  validateChildKeys(children[i], type);
                }
                if (Object.freeze) {
                  Object.freeze(children);
                }
              } else {
                error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
              }
            } else {
              validateChildKeys(children, type);
            }
          }
        }
        {
          if (hasOwnProperty.call(props, 'key')) {
            var componentName = getComponentNameFromType(type);
            var keys = Object.keys(props).filter(function (k) {
              return k !== 'key';
            });
            var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';
            if (!didWarnAboutKeySpread[componentName + beforeExample]) {
              var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';
              error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
              didWarnAboutKeySpread[componentName + beforeExample] = true;
            }
          }
        }
        if (type === REACT_FRAGMENT_TYPE) {
          validateFragmentProps(element);
        } else {
          validatePropTypes(element);
        }
        return element;
      }
    } // These two functions exist to still get child warnings in dev
    // even with the prod transform. This means that jsxDEV is purely
    // opt-in behavior for better messages but that we won't stop
    // giving you warnings if you use production apis.

    function jsxWithValidationStatic(type, props, key) {
      {
        return jsxWithValidation(type, props, key, true);
      }
    }
    function jsxWithValidationDynamic(type, props, key) {
      {
        return jsxWithValidation(type, props, key, false);
      }
    }
    var jsx = jsxWithValidationDynamic; // we may want to special case jsxs internally to take advantage of static children.
    // for now we can ship identical prod functions

    var jsxs = jsxWithValidationStatic;
    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
    reactJsxRuntime_development.jsx = jsx;
    reactJsxRuntime_development.jsxs = jsxs;
  })();
}

{
  jsxRuntime.exports = reactJsxRuntime_development;
}

var jsxRuntimeExports = jsxRuntime.exports;

const FailureImage = ({
  st3 = '#030C1A',
  st15 = '#030D19',
  st11 = '#0B182B',
  st1 = '#15273F',
  st14 = '#1A324C',
  st12 = '#384A66',
  st2 = '#E3CEC8',
  st23 = '#E4C8BA',
  st22 = '#E6B793',
  st21 = '#EA9B57',
  st20 = '#ED8A30',
  st8 = '#EF4848',
  st19 = '#FF5050',
  st4 = '#FFCD52',
  st13 = '#FFFFFF',
  ...props
}) => {
  const a = require$$0$1.useId();
  const b = require$$0$1.useId();
  const c = require$$0$1.useId();
  const e = require$$0$1.useId();
  return /*#__PURE__*/jsxRuntimeExports.jsxs("svg", {
    viewBox: "0 0 1366 768",
    preserveAspectRatio: "xMidYMid slice",
    ...props,
    children: [/*#__PURE__*/jsxRuntimeExports.jsxs("linearGradient", {
      id: a,
      x1: 1047,
      x2: 1047,
      y1: 213.43,
      y2: 287.03,
      gradientUnits: "userSpaceOnUse",
      children: [/*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st3,
        offset: 0
      }), /*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st12,
        offset: 1
      })]
    }), /*#__PURE__*/jsxRuntimeExports.jsxs("linearGradient", {
      id: b,
      x1: 102.96,
      x2: 111.7,
      y1: 47.165,
      y2: 217.07,
      gradientUnits: "userSpaceOnUse",
      children: [/*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st3,
        offset: 0
      }), /*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st11,
        offset: 1
      })]
    }), /*#__PURE__*/jsxRuntimeExports.jsx("clipPath", {
      id: c,
      children: /*#__PURE__*/jsxRuntimeExports.jsx("circle", {
        opacity: 0.3,
        cx: 553.49,
        cy: 544.5,
        r: 146.44
      })
    }), /*#__PURE__*/jsxRuntimeExports.jsxs("linearGradient", {
      id: e,
      x1: 510.48,
      x2: 295.77,
      y1: -59.124,
      y2: -273.83,
      gradientTransform: "matrix(.9862 -.1655 .1655 .9862 138.97 743.69)",
      gradientUnits: "userSpaceOnUse",
      children: [/*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st20,
        offset: 0
      }), /*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st21,
        stopOpacity: 0.7848,
        offset: 0.2152
      }), /*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st22,
        stopOpacity: 0.4148,
        offset: 0.5852
      }), /*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st23,
        stopOpacity: 0.1427,
        offset: 0.8573
      }), /*#__PURE__*/jsxRuntimeExports.jsx("stop", {
        stopColor: st2,
        stopOpacity: 0,
        offset: 1
      })]
    }), /*#__PURE__*/jsxRuntimeExports.jsxs("g", {
      children: [/*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1010.2 530.88l1.15 2.74-59.34 8.99s-3.95-2.99-5.67-4.67-2.3-3.16-2.3-3.16c0.62 0.89 7.43 2.92 8.35 2.72 0.93-0.2 0.44-0.43-1.18-1.09s-1.3-1.04-1.3-1.04c2.51-0.77 9.91 1.39 9.91 1.39 0.06-0.65-4.52-2.51-4.12-2.59 0.4-0.07 1.67 0.31 1.79 0.16s-0.33-0.77-0.33-0.77c1.73-0.44 7.41 2.54 7.41 2.54 0.15-0.55-3.81-2.76-3.07-3.07s3.93 1.46 3.92 0.99c-0.01-0.48-1.94-1.87-1-1.79 0.95 0.08 3.72 2.56 4.01 2.1s-1.5-2.54-1.5-2.54 2.91 1.32 3.04 1.5 3.04 0.59 3.1 0.18c0.07-0.41-1.31-0.94-1.54-1.03s-2.76-0.51-0.92-0.81 8.87 2.12 8.94 1.94-1.75-1.52-2-2.13c-0.26-0.61-0.45-1.06-0.45-1.06 0.86 0.55 5.67 3.18 5.67 3.18s-2.43-3.43-1.88-2.56 5.23 2.19 5.23 2.19c-1.46-0.85-3.86-3.5-3.86-3.5 2.06 1.42 9.28 2.68 9.28 2.68-0.28-0.89-2.59-1.57-2.59-1.57 1.63-1.79 6.49 0.84 6.49 0.84 0.3-0.59-0.62-1.48-0.62-1.48 0.89-0.28 2.08 0.59 2.08 0.59-0.49-1.17-2.74-2.14-2.74-2.14 4.13-1.93 9.24 3.43 9.24 3.43-1.29-1.1-2.57-4.14-2.57-4.14 0.77 0.96 5 2.29 5 2.29 1.25-0.07 3.6 0.5 3.6 0.5"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 144.81,
        cy: 487.93,
        rx: 1.1,
        ry: 1.08
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 322.32,
        cy: 468.93,
        rx: 1.1,
        ry: 1.08
      }), /*#__PURE__*/jsxRuntimeExports.jsx("rect", {
        fill: st3,
        x: -0.45,
        y: 0.09,
        width: 1366.1,
        height: 768.2
      }), /*#__PURE__*/jsxRuntimeExports.jsx("circle", {
        fill: st4,
        cx: 553.49,
        cy: 544.5,
        r: 146.44
      }), /*#__PURE__*/jsxRuntimeExports.jsx("circle", {
        fill: `url(#${e})`,
        cx: 553.49,
        cy: 544.5,
        r: 146.44
      }), /*#__PURE__*/jsxRuntimeExports.jsx("g", {
        opacity: 0.3,
        children: /*#__PURE__*/jsxRuntimeExports.jsxs("g", {
          clipPath: `url(#${c})`,
          children: [/*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 409c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 415.34c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 421.69c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 428.03c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 434.37c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 440.71c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 447.05c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 453.39c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 459.73c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 466.07c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 472.42c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 478.76c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 485.1c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 491.44c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 497.78c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 504.12c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 510.46c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 516.81c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 523.15c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 529.49c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 535.83c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 542.17c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 548.51c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 554.85c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 561.2c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 567.54c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 573.88c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 580.22c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 586.56c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 592.9c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 599.24c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 605.59c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 611.93c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 618.27c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 624.61c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 630.95c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 637.29c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 643.63c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 649.98c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 656.32c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 662.66c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 669c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 675.34c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 681.68c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 688.02c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
            fill: "none",
            stroke: st8,
            strokeWidth: 5,
            strokeMiterlimit: "10",
            d: "m370.72 694.37c11.94-0.42 11.81-4.14 23.74-4.56 11.94-0.42 12.07 3.29 24.01 2.86 11.94-0.42 12.05 2.82 23.99 2.4s11.84-3.33 23.77-3.75c11.94-0.42 12 1.42 23.94 1s11.78-4.89 23.72-5.31 12.06 2.94 23.99 2.52c11.94-0.42 11.86-2.76 23.79-3.18 11.94-0.42 11.92-1.06 23.85-1.49 11.94-0.42 12.11 4.29 24.05 3.87s11.95-0.12 23.89-0.54 11.83-3.44 23.77-3.87c11.94-0.42 11.86-2.59 23.8-3.01s11.96 0.05 23.9-0.37 12.06 2.97 24 2.55"
          })]
        })
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.4,
        fill: st2,
        cx: 283.6,
        cy: 237.73,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 389.76,
        cy: 200.29,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 349.31,
        cy: 275.3,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 256.38,
        cy: 147.67,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 262.02,
        cy: 281.11,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 432.63,
        cy: 177.54,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 455.4,
        cy: 267.47,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 125.11,
        cy: 193.86,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 73.45,
        cy: 246.47,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: -0.25,
        cy: 155.85,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 69.35,
        cy: 188.63,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 307.88,
        cy: 153.4,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 36.75,
        cy: 225.7,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 995.65,
        cy: 400.05,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.4,
        fill: st2,
        cx: 1101.8,
        cy: 362.6,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1061.4,
        cy: 437.62,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 968.43,
        cy: 309.99,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 974.07,
        cy: 443.42,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1144.7,
        cy: 339.85,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1167.4,
        cy: 429.79,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 837.16,
        cy: 356.18,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 785.5,
        cy: 408.78,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 711.8,
        cy: 318.17,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 781.4,
        cy: 350.94,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1019.9,
        cy: 315.71,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.2,
        fill: st2,
        cx: 748.8,
        cy: 388.01,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1034.2,
        cy: 81.83,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 928.01,
        cy: 119.28,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 968.46,
        cy: 44.26,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1061.4,
        cy: 171.89,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.2,
        fill: st2,
        cx: 1055.8,
        cy: 38.45,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 885.14,
        cy: 142.02,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.2,
        fill: st2,
        cx: 862.37,
        cy: 52.09,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1192.7,
        cy: 125.7,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1244.3,
        cy: 73.09,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1318,
        cy: 163.71,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1248.4,
        cy: 130.94,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1009.9,
        cy: 166.17,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1281,
        cy: 93.87,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 190.59,
        cy: 348.72,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.2,
        fill: st2,
        cx: 84.44,
        cy: 386.17,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 124.88,
        cy: 311.15,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 217.81,
        cy: 438.78,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 212.17,
        cy: 305.35,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 41.57,
        cy: 408.92,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 18.79,
        cy: 318.98,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 349.08,
        cy: 392.59,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 400.74,
        cy: 339.99,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 474.44,
        cy: 430.6,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 404.84,
        cy: 397.83,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 166.31,
        cy: 433.06,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 437.44,
        cy: 360.76,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 226.03,
        cy: 108.04,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.4,
        fill: st2,
        cx: 119.88,
        cy: 145.49,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.4,
        fill: st2,
        cx: 160.32,
        cy: 70.47,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 253.25,
        cy: 198.1,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 247.61,
        cy: 64.67,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 77.01,
        cy: 168.24,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 54.24,
        cy: 78.3,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 384.52,
        cy: 151.91,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 436.19,
        cy: 99.31,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 509.88,
        cy: 189.92,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 440.29,
        cy: 157.15,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 201.76,
        cy: 192.38,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 472.89,
        cy: 120.08,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 964.3,
        cy: 331.86,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 858.15,
        cy: 369.3,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 898.59,
        cy: 294.29,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 991.52,
        cy: 421.92,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 985.88,
        cy: 288.48,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 815.28,
        cy: 392.05,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.2,
        fill: st2,
        cx: 792.51,
        cy: 302.12,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        opacity: 0.4,
        fill: st2,
        cx: 1122.8,
        cy: 375.73,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1248.2,
        cy: 413.74,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1178.6,
        cy: 380.96,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 940.03,
        cy: 416.2,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 891.34,
        cy: 343.89,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1280.3,
        cy: 261.81,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1274.1,
        cy: 359.15,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1346,
        cy: 299.38,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1253.1,
        cy: 171.75,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1287.8,
        cy: 309.99,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1317,
        cy: 336.4,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1339.7,
        cy: 426.33,
        rx: 0.4,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1121.8,
        cy: 217.94,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1070.2,
        cy: 270.55,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 996.46,
        cy: 179.93,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1087.3,
        cy: 232.81,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1304.6,
        cy: 177.47,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("ellipse", {
        fill: st2,
        cx: 1033.4,
        cy: 249.77,
        rx: 0.41,
        ry: 0.4
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m165.42 477.46l40.53-20.74c1.87-0.96 4.15-0.49 5.49 1.13l0.6 0.72c2.65 3.2 7.23 4.01 10.83 1.92l9.13-5.3c1.93-1.12 4.11-1.71 6.34-1.71h4.2c3.4 0 6.74-0.8 9.78-2.32l63.19-31.82c3.57-1.8 7.81-1.71 11.3 0.24 5.1 2.85 11.27 3.05 16.54 0.54l18.22-8.66c2.41-1.15 5.21-1.13 7.61 0.05l37.6 18.42c2.51 1.23 4.95 2.59 7.31 4.08l85.67 54.1c4.22 2.67 9.12 4.08 14.11 4.08h3.45c3.75 0 7.47-0.8 10.89-2.35l40.57-18.34c2-0.9 4.3-0.81 6.21 0.26l31.49 17.54c2.75 1.53 5.85 2.34 9 2.34h42.15c2.91 0 5.76 0.8 8.26 2.3l17.53 10.59c3.19 1.93 6.96 2.66 10.64 2.07l6.92-1.12c3.86-0.62 7.81-0.35 11.55 0.79 2.63 0.8 5.47 0.54 7.92-0.71l79.31-40.81c2.86-1.47 6.23-1.54 9.15-0.18l107.75 50.18c3.52 1.64 7.55 1.8 11.19 0.43l20.87-7.83c2.62-0.98 5.52-0.95 8.12 0.1l15.4 6.23c5.92 2.4 12.26 3.63 18.65 3.63h4.78c6.26 0 12.46-1.18 18.28-3.48l22.75-8.99c3.53-1.39 7.48-1.26 10.91 0.36l6.25 2.96 13.57 0.79s8.43 0.95 20.42 0.81c8.33-0.1 16.64-1.03 24.78-2.77l100.25-21.4c12.3-2.63 25.14-0.79 36.21 5.18l74.97 40.4 41.65-3.85-0.76 105.66-1041.5-52.72-323.76-7.08-0.1-32.28 165.86-63.44z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m318.54 418.13l8.85 7.19c0.86 0.7 2.05 0.86 3.07 0.41l6.62-3.75s-3.56-0.6-8.6-1.57c-1.58-0.31-2.84-1.96-4.3-2.28-2.26-0.49-4.54 0.38-5.64 0z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m515.64 507.4c-29.11-5.86-44.37-12.17-51.19-15.63-1.16-0.59-0.7-2.35 0.6-2.29 2.92 0.12 5.14 0.08 6.74-0.01 0.88-0.05 1.12-1.24 0.32-1.63-31.96-15.4-106.45-77.23-106.45-77.23 15.38 3.2 26.38 11.37 26.38 11.37 22.05 12.03 36 20.18 64.02 36.26 0 0 58.44 39.83 62.67 42.22 2.5 1.41 12.31 5.77 19.92 9.1 1.25 0.55 0.66 2.42-0.68 2.16l-22.33-4.32z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m657.62 491.64l18.37 21.2c2.64 3.05 6.94 4.05 10.66 2.49l24.11-10.14s-3.76-0.42-8.66 0.14c-5.15 0.59-11.52 2.15-14.31 1.24-5.45-1.76-20.32-11.85-22.6-13.02-3.72-1.91-7.57-1.91-7.57-1.91z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m207.49 456.26s-8.45 8.58-2.01 8.92 14.81-3.71 14.81-3.71-4.61 0.14-8.26-2.9c0.01 0-1.95-2.68-4.54-2.31z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1096.4 455.05c0-0.49-1.3-4.37-1.3-4.37s-1.46-3.4-1.46-5.67-1.3-6.32-1.3-6.96c0-0.21-4.1-10.14-6.15-12.31-1.76-1.85-4.88-3.12-7.24-3.86-0.06-0.05-0.1-0.09-0.1-0.09 3-2.28 4.77-4.55 4.53-9.38-0.11-2.2-1.1-5.58-3.26-7.95-1.79-1.95-4.48-3.5-8.12-4.14-8.04-1.41-11.95 3.78-13.31 9.17s1.01 9.21 1.01 9.21c-0.48 0-0.8 0.57-0.99 1.06-0.58-1.21-1.21-2.66-1.31-3.43-0.19-1.48-1.98-3.37-2.01-4.78-0.04-1.41-1.25-2.09-1.48-2.66s-0.8-2.93-0.79-3.61-0.88-1.86-0.88-3.76-0.42-2.51-0.42-3.88-0.23-1.9-0.23-2.55-0.68-1.89-0.68-2.34l-0.08-2.28-0.31-1.65-0.58-0.93c0.32-0.48 0.73-1.03 0.85-1.22 0.22-0.33 0.99-2.01 0.99-2.12 0-0.08 0.23-1.03 0.35-1.5 0.04-0.17 0.05-0.35 0.04-0.53-0.07-0.65-0.25-2.28-0.25-2.43 0-0.09-0.1-0.57-0.3-1.1-0.07-0.18-0.15-0.37-0.24-0.55-0.22-0.45-0.52-0.85-0.87-0.97-0.91-0.3-1.13 0.39-1.13 0.39l-0.8-0.17h-0.99s-0.83 0.47-1.27 0.47-1.87 0.72-1.9 0.85c-0.03 0.14-1.82 0.96-1.82 0.96s-0.58 0.41-0.58 0.5c0 0.08-0.41 0.94-0.41 1.16s0.55 1.93 0.63 2.23 0.83 2.89 0.83 2.89 0.03 0.06 0.07 0.15c-0.03 0.27-0.07 0.55-0.13 0.84-0.04 0.21 0.27 0.49 0.48 0.75-0.06 0.25-0.12 0.52-0.12 0.61 0 0.17-0.11 1.53-0.11 1.53h0.16c-0.2 0.73-0.46 1.24-0.52 1.49-0.25 1-0.45 9.77-0.61 10.75-0.16 0.97 1.13 4.7 1.13 5.18s1.3 4.37 1.3 4.37 1.46 3.4 1.46 5.67 1.3 6.32 1.3 6.96c0 0.65 3.33 9.06 6.41 12.29 0.26 1.66 0.48 2.94 0.48 3.08 0 0.33 2.05 4.68 2.05 5.18 0 0.49 1.15 6.16 1.15 7.07 0 0.9-1.23 2.79-1.23 6.33 0 3.53 0.08 3.37 0.08 6.82s-1.31 6.33-1.31 8.05c0 1.73-0.16 11.09-0.16 11.09l0.58 1.81v3.86s-0.49 3.53-0.49 4.44c0 0.9-0.9 3.61-1.06 6.16s1.06 2.05 1.06 4.68 0.82 3.2 0.82 5.67c0 2.46-0.33 1.89-0.33 2.79s-0.74 3.53-0.74 5.83 0.49 3.86 0.49 4.6 0.33 1.48 0.33 2.22 1.15 1.73 1.4 1.81 0.58 1.73 0.58 1.73-2.22-1.07-3.37 2.38 2.3 5.92 2.3 5.92c6.16-0.33 10.19-2.38 10.19-2.38l-0.33-3.29s-0.82-3.04-1.12-3.61c-0.3-0.58 0.39-2.71 0.1-3.29-0.28-0.58 0.12-2.14 0.04-2.71-0.08-0.58 0-3.86 0-3.86s0.9-2.46 0.9-3.94 0.82-4.68 0.9-5.34 0.82-4.52 0.91-5.26 1.06-5.34 1.06-6.41-0.25-4.85-0.33-5.67-0.08-1.97 0-3.94 1.07-8.38 1.07-8.38v5.42s0.99 3.62 0.99 6.16c0 2.55 2.46 3.86 2.63 5.18 0.16 1.31 0.9 2.88 0.99 4.44 0.08 1.56 0.9 2.3 0.9 3.04s1.48 2.38 1.48 3.45 0.66 3.29 0.66 5.42c0 2.14 0.33 2.46 0.33 4.93s0.82 2.46 0.9 3.53-0.41 2.38-0.41 2.63 0.49 7.39 1.23 8.38 3.94 0.58 5.92 0c1.97-0.58 1.89-4.03 1.89-4.6 0-0.58-0.41-4.68-0.7-6.66-0.29-1.97 0.86-10.93 0.86-10.93s0.16-3.12 0.16-3.61-0.41-3.37-0.41-6.33-0.49-6.41-0.62-7.31c-0.12-0.9-0.21-2.71 0-5.75s-0.29-2.3-0.53-6.65c-0.25-4.35-1.24-13.66-1.24-13.66s-0.34-1.1-0.38-2.47-0.87-1.82-0.87-2.09c0-0.12-0.12-0.72-0.26-1.47l1.56-0.02c0.46-0.01 0.83-0.38 0.83-0.84v-6.97c0.05 0.07 0.1 0.14 0.12 0.21 0.23 0.57 0.8 2.93 0.79 3.61s0.88 1.86 0.88 3.76 0.42 2.51 0.42 3.88 0.23 1.9 0.23 2.55-0.23 2.01-0.23 2.47v3.27c0 0.84 0.46 3.5 0.38 4.37s1.37 1.18 1.52 0.27 1.29-2.01 1.29-2.01 0.49 0.68 0.53 1.41c0.04 0.72-1.25 2.58-1.41 3.57-0.15 0.99 0.27 1.25 0.27 1.25 1.29 0.42 2.58-0.34 2.58-0.34-0.15 0.95 0.87 0.72 0.87 0.72 0.68-0.34 1.25-1.82 1.25-1.82 0.49 0.15 0.88-0.2 0.88-0.2 1.16-2.08 0.5-8.99 0.75-9.98 0.12-0.5 0.24-2.94 0.34-5.38s0.19-4.88 0.27-5.36c0.14-0.99-1.15-4.71-1.15-5.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("polygon", {
        fill: st13,
        points: "1082.8 430.84 1063.1 430.38 1066.6 432.89 1086.5 433.13"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st14,
        d: "m1049.6 378.77s0.15-0.9 0.6-0.9 0.9 0.14 1.56 1.56c0 0-0.47-2.01-1.48-2s-1.05 0.78-1.05 0.78 0.43 0.26 0.37 0.56z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m479.68 600.45s-22.25-1.3-31.46-2.68c-0.3-0.04-0.47 0.32-0.25 0.53 0.73 0.67 1.98 1.67 3.45 2.26 0 0-10.45-1-18.85-3.27-0.6-0.16-0.94 0.66-0.4 0.97 3.71 2.12 9.54 5.14 14.95 6.72l32.56-4.53z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m446.55 604.8s6.98 1.81 11.25 1.41c0 0-8.13 1.07-16.13-0.8l4.88-0.61z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m155 617.06s-21.51-5.83-30.25-9.06c-0.28-0.1-0.53 0.22-0.35 0.46 0.57 0.8 1.59 2.04 2.91 2.91 0 0-7.88-2.45-15.07-5.75-0.98-0.45-1.81 0.85-0.98 1.55 3.07 2.57 7.04 5.57 10.94 7.65l32.8 2.24z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m121.68 614.52s6.46 3.2 10.72 3.68c0 0-8.18-0.62-15.63-4.09l4.91 0.41z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m194.08 618.35l-12.07-0.31s-4.39-2.44-8.64-2.87c-0.14-0.01-0.18 0.18-0.05 0.23 0.88 0.32 2.07 0.86 1.96 1.43l-8.99-0.6c-0.8-0.05-1.59-0.17-2.36-0.34-2.67-0.6-9.03-2.03-9.69-2.32-0.84-0.36 1.83 1.3 3.67 1.86 0 0-4.85-0.42-9.67-3.7 0 0 0.59 1.33 2.1 2.46 0.79 0.59 1.49 1.3 2.11 2.07l0.86 1.05 39.19 2.14 1.58-1.1z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m354.34 614.48s-2.26-0.1-6.89 0.69-20.6 1.2-25.47-0.56c0 0 0.25 1.29 1.32 1.9 0 0-17.64 0.74-23.2 0.68s-9.5 0.18-12.26-1.24c0 0 1.12 1.38 2.1 1.73 0.61 0.22-1.52-0.33-3.72-1.14-1.32-0.48-2.66-1.06-3.45-1.61 0 0 2.39 2.89 4.37 3.41l-6.93 0.14-8.48-3.81s-1.61-6.34-4.15-5.61c-2.53 0.73 2.11 4.45 2.11 4.45s-5.5-2.53-8.32-2.91c0 0-0.4-4.32-2.45-4.48s1.08 3.95 1.08 3.95l-3.02-0.31-0.06 0.61 4.3 1.25s-0.86 1.19-2.19 1.7c-1.33 0.5 0.03 2.66 1.81 2 1.79-0.66 1.76-3.32 1.76-3.32s5.59 1.21 7.23 2.5c0 0-0.47 1.23-1.71 1.3-0.8 0.05-0.43 0.94 0.49 1.18 0.98 0.26 1.95-0.46 2.08-1.46l0.09-0.73 6.24 4.03 10.95 2.98 61.05-1.58 5.32-5.74z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m725.93 567.47s-2.28-0.55-3.55-0.5c-0.04 0-0.07 0-0.1-0.01-0.36-0.12-2.6-0.85-3.98-1.58-0.28-0.15-0.58 0.15-0.44 0.43 0.49 0.98 1.27 2.35 2.05 3.02 0 0-4.52-4.75-8.5-3.7-0.28 0.07-0.32 0.46-0.07 0.6 0.3 0.16 0.66 0.38 1.01 0.63 0.28 0.21 0.07 0.64-0.27 0.57h-0.02c-0.28-0.05-0.49 0.27-0.32 0.5 0.07 0.1 0.13 0.21 0.18 0.33 0.12 0.28-0.18 0.55-0.45 0.42-1.12-0.53-3.9-1.7-5.44-0.99-0.26 0.12-0.25 0.5 0.02 0.6 0.36 0.14 0.84 0.34 1.24 0.58 0.31 0.19 0.13 0.67-0.23 0.6-1.56-0.31-4.62-0.96-6.7-1.73-0.33-0.12-0.59 0.29-0.34 0.53 0.36 0.36 0.77 0.75 1.18 1.11 0.27 0.23 0.02 0.66-0.32 0.55-1.39-0.46-3.15-1.13-3.48-1.65s0.41 0.5 1.06 1.41c0.2 0.28-0.12 0.64-0.42 0.47-1.07-0.59-2.59-1.43-3.58-2-0.27-0.16-0.58 0.12-0.46 0.41l0.06 0.15c0.26 0.61 2.08 1.96 2 2.13s-7.09-2.24-8.94-1.94c-1.84 0.3 0.69 0.72 0.92 0.81s1.61 0.62 1.54 1.03-2.98 0.01-3.1-0.18c-0.07-0.1-1-0.55-1.81-0.94-0.3-0.14-0.6 0.21-0.4 0.49 0.42 0.59 0.82 1.25 0.67 1.48-0.29 0.46-3.06-2.02-4.01-2.1s0.99 1.31 1 1.79-3.19-1.3-3.92-0.99c-0.39 0.17 0.57 0.88 1.52 1.6 0.31 0.23 0.02 0.72-0.33 0.56-1.55-0.71-3.68-1.59-4.95-1.66-0.25-0.01-0.42 0.24-0.31 0.47 0.07 0.15 0.12 0.29 0.06 0.35-0.13 0.15-1.39-0.23-1.79-0.16-0.26 0.05 1.6 0.86 2.9 1.59 0.33 0.19 0.13 0.69-0.24 0.6-2.13-0.54-6.07-1.43-8.06-1.09-0.28 0.05-0.36 0.4-0.14 0.58 0.19 0.15 0.52 0.34 1.05 0.55 1.62 0.66 2.1 0.89 1.18 1.09-0.74 0.16-5.25-1.11-7.34-2.07-0.29-0.14-0.59 0.2-0.41 0.47 0.36 0.56 0.91 1.28 1.69 2.05 1.55 1.51 4.92 4.1 5.56 4.59 0.07 0.05 0.16 0.07 0.24 0.06l58.8-8.91c0.21-0.03 0.33-0.25 0.25-0.45l-0.99-2.35"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1081.1 504.92c-0.45-1.23-1.38-2.2-2.16-3.25s-1.43-2.33-1.19-3.61c0.17-0.9 0.78-1.7 0.83-2.62 0.09-2-2.45-3.32-2.53-5.32-0.05-1.31 1-2.61 0.53-3.83-0.06-0.15-0.14-0.29-0.14-0.45-0.03-0.54 0.66-0.75 1.18-0.9 0.85-0.25 1.64-0.83 1.97-1.65 0.33-0.83 0.2-1.85-0.9-2.12-2.08-0.08-4.16-0.16-6.25-0.24-0.64-0.02-1.18-0.14-1.76-0.2-0.35-0.03-0.72-0.24-0.89 0.06l0.08 4.31c0.08 0.28-0.15 0.82-0.08 1.11 0.29 1.12 0.38 1.94 0.73 3.15 0.18 1.04 0.33 2.19 0.33 3.18 0 2.55 2.46 3.86 2.63 5.18 0.16 1.31 0.9 2.88 0.99 4.44 0.08 1.56 0.9 2.3 0.9 3.04s1.48 2.38 1.48 3.45 0.66 3.29 0.66 5.42c0 2.14 0.33 2.46 0.33 4.93 0 1.36 0.25 1.96 0.49 2.42 1.33-0.65 2.21-2.24 2.44-3.78 0.29-1.92-0.11-3.87 0.03-5.8 0.17-2.33 1.1-4.73 0.3-6.92z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st14,
        d: "m1069.8 483.07c0.02-0.14 0.04-0.27 0.06-0.4-0.02 0.13-0.05 0.26-0.06 0.4z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1059.5 456.91c-0.46-3.49 0.2-7.03 0.05-10.55-0.06-1.32-0.27-2.67-0.67-3.95 0.08-0.19 0.14-0.39 0.16-0.61 0.09-0.8-0.26-1.57-0.6-2.29l-4.17-8.82c-2.59-5.49-5.24-11.24-5.03-17.3 0.06-1.65 0.26-3.52-0.86-4.74-0.97-1.07-2.92-1.73-2.63-3.15 0.1-0.5 0.48-0.88 0.71-1.34 1.1-2.16-1.52-4.41-1.71-6.82-0.2-2.59 2.44-5.15 1.29-7.48l-0.51-0.34c0.41 0 0.82-0.01 1.24-0.03 0.2-0.01 0.24-0.29 0.05-0.36-0.58-0.21-1.17-0.42-1.75-0.62-0.35-0.12-0.72-0.27-0.9-0.6-0.26-0.48 0.06-1.05 0.22-1.57 0.16-0.51 0.17-1.06 0.04-1.57-0.2-0.76-0.73-1.46-0.66-2.24 0.03-0.33 0.16-0.64 0.3-0.94 0.43-0.98 0.98-2.07 2-2.4 0.26-0.09 0.55-0.12 0.76-0.29 0.22-0.17 0.3-0.55 0.07-0.7-0.09-0.06-0.22-0.07-0.33-0.06-0.64 0.02-1.25 0.31-1.83 0.59l-0.06 0.03c-0.2 0.11-0.34 0.21-0.35 0.25-0.03 0.14-1.82 0.96-1.82 0.96s-0.58 0.41-0.58 0.5c0 0.08-0.41 0.94-0.41 1.16s0.55 1.93 0.63 2.23 0.83 2.89 0.83 2.89 0.03 0.06 0.07 0.15c-0.03 0.27-0.07 0.55-0.13 0.84-0.04 0.21 0.27 0.49 0.48 0.75-0.06 0.25-0.12 0.52-0.12 0.61v0.08c0.09 0.07 0.18 0.13 0.27 0.2-0.13 1.34-0.65 2.3-0.74 2.66-0.25 1-0.45 9.77-0.61 10.75-0.16 0.97 1.13 4.7 1.13 5.18s1.3 4.37 1.3 4.37 1.46 3.4 1.46 5.67 1.3 6.32 1.3 6.96c0 0.65 3.33 9.06 6.41 12.29 0.26 1.66 0.48 2.94 0.48 3.08 0 0.22 0.89 2.19 1.5 3.64h0.01c0.34 0.82 0.62 1.51 0.62 1.69 0 0.49 1.15 6.16 1.15 7.07 0 0.9-1.23 2.79-1.23 6.33 0 3.53 0.08 3.37 0.08 6.82s-1.31 6.33-1.31 8.05c0 1.73-0.16 11.09-0.16 11.09l0.58 1.81v3.86s-0.49 3.53-0.49 4.44c0 0.9-0.9 3.61-1.06 6.16-0.15 2.55 1.06 2.05 1.06 4.68s0.82 3.2 0.82 5.67c0 2.46-0.33 1.89-0.33 2.79s-0.74 3.53-0.74 5.83c0 0.37 0.01 0.73 0.04 1.06 0.92 0.36 1.86 3.85 2.74 3.43 1.79-0.85 2.41-6.62 2.23-8.59-0.26-2.94-1.53-5.76-1.45-8.7 0.08-3.04 1.58-5.9 1.67-8.94 0.1-3.04-1.21-5.98-1.27-9.02-0.05-2.7 0.9-5.36 0.68-8.05-0.17-2.13-1.07-4.17-1.05-6.3 0.02-3.23 2.1-6.12 2.44-9.34 0.31-3.01-0.91-5.93-1.31-8.91z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st3,
        d: "m526.44 649.42s-3.01-1.59-4.81-1.97c-0.05-0.01-0.09-0.03-0.14-0.05-0.47-0.29-3.35-2.11-5.02-3.64-0.34-0.31-0.87 0-0.78 0.45 0.34 1.55 0.93 3.74 1.79 4.95 0 0-4.64-8.26-10.62-8.21-0.42 0-0.62 0.53-0.31 0.81 0.36 0.34 0.8 0.77 1.19 1.25 0.32 0.39-0.13 0.92-0.59 0.7-0.01 0-0.02-0.01-0.03-0.01-0.38-0.18-0.78 0.2-0.64 0.59 0.06 0.17 0.11 0.35 0.14 0.52 0.07 0.43-0.45 0.71-0.79 0.43-1.38-1.15-4.87-3.77-7.3-3.33-0.41 0.07-0.53 0.61-0.19 0.85 0.46 0.32 1.05 0.77 1.53 1.26 0.37 0.38-0.06 0.98-0.54 0.76-2.09-0.99-6.15-2.99-8.79-4.81-0.42-0.29-0.94 0.19-0.68 0.63 0.38 0.63 0.81 1.32 1.25 1.97 0.29 0.42-0.21 0.94-0.64 0.66-1.79-1.15-4.02-2.71-4.29-3.54-0.27-0.84 0.4 0.85 0.98 2.35 0.18 0.47-0.4 0.85-0.76 0.51-1.29-1.21-3.13-2.93-4.31-4.07-0.32-0.31-0.86-0.04-0.8 0.41l0.03 0.23c0.14 0.95 2.21 3.48 2.05 3.7s-9.16-5.67-11.86-5.91 0.71 1.25 1 1.47c0.29 0.21 2.03 1.44 1.79 1.99s-4.19-1.05-4.3-1.36c-0.06-0.17-1.2-1.13-2.2-1.96-0.38-0.31-0.92 0.08-0.74 0.54 0.38 0.97 0.7 2.04 0.41 2.31-0.57 0.54-3.58-3.92-4.88-4.37s0.91 2.19 0.75 2.86-4.02-2.95-5.16-2.78c-0.61 0.09 0.48 1.44 1.56 2.78 0.35 0.44-0.23 1.01-0.67 0.66-1.92-1.55-4.6-3.53-6.36-4.09-0.34-0.11-0.68 0.19-0.61 0.54 0.05 0.23 0.06 0.44-0.04 0.51-0.24 0.16-1.88-0.82-2.47-0.86-0.39-0.03 1.93 1.77 3.5 3.27 0.4 0.38-0.07 1.02-0.55 0.75-2.8-1.52-8.02-4.16-10.93-4.4-0.4-0.03-0.65 0.44-0.4 0.76 0.22 0.28 0.61 0.66 1.27 1.15 2.04 1.5 2.64 2 1.27 1.94-1.1-0.04-6.98-3.42-9.56-5.52-0.36-0.3-0.89 0.07-0.75 0.51 0.31 0.92 0.81 2.12 1.63 3.47 1.63 2.67 5.43 7.48 6.16 8.4 0.08 0.1 0.19 0.16 0.32 0.17l85.9 8.55c0.31 0.03 0.56-0.23 0.52-0.54l-0.54-3.64"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1328.3 878.69"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1058.3 413.82s-2.7-10.71 8.57-13.78h2.07l-0.56 6.33-5.11 7.45h-4.97z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1080.1 404.14c-1.79-1.95-4.48-3.5-8.12-4.14-3.4-0.6-6.06-0.01-8.11 1.27 0.77-0.34 1.63-0.62 2.6-0.81l-0.13 4.42c-0.01 0.24-0.07 0.47-0.19 0.68l-3.34 6.04c-0.16 0.3-0.42 0.53-0.74 0.66l-3.77 1.56c0.12 1.19 0.38 2.2 0.65 2.95 0.52 0.91 1.17 1.74 1.98 2.41 3.11 2.59 7.61 2.41 11.64 2.1-2.3-0.26-4.56-0.84-6.7-1.71-0.53-0.21-1.14-0.61-1.05-1.17 0.12-0.77 1.36-0.76 1.77-1.42 0.27-0.43 0.1-0.99 0.1-1.49 0.01-1.43 1.43-2.46 2.81-2.79 1.39-0.33 2.86-0.19 4.24-0.54s2.77-1.45 2.7-2.87c-0.03-0.64-0.35-1.23-0.49-1.86s-0.02-1.41 0.55-1.7c0.31-0.16 0.69-0.13 1.04-0.1 1.3 0.13 2.6 0.25 3.91 0.38-0.37-0.67-0.83-1.3-1.35-1.87z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1090.6 467.98c-0.14-0.54-0.35-1.06-0.45-1.61-0.1-0.61-0.04-1.24 0.01-1.86 0.15-1.59 0.29-3.18 0.44-4.78 0.1-1.13 0.19-2.35-0.35-3.34-0.41-0.74-1.14-1.33-1.55-2.04-0.46-0.79-1.13-1.43-1.94-1.87l-0.12-0.07c-0.37 0.54-0.56 1.16-0.63 1.8 0.23 0.57 0.8 2.93 0.79 3.61s0.88 1.86 0.88 3.76 0.42 2.51 0.42 3.88 0.23 1.9 0.23 2.55-0.23 2.01-0.23 2.47v3.27c0 0.84 0.46 3.5 0.38 4.37-0.06 0.68 0.79 1.01 1.25 0.7 0.11-0.45 0.07-1.01 0.03-1.48-0.25-3.14 1.61-6.29 0.84-9.36z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1064.6 461.83s13.08 8.42 20.51 8.49c0 0 0.1-4.61-1.77-8.49h-18.74z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1088.5 453.36c0.38-0.88 0.28-1.89 0.18-2.84-0.22-2.07-0.32-9.4-0.55-11.47 0 0-0.21-2.83-1.03-4.68-0.34-1-0.64-1.23-0.64-1.23l-0.74 20.88 0.67 3.19-0.34 5.67v1.78c0.63-1.34 1.27-2.67 1.9-4.01 0.27-0.56 0.54-1.15 0.5-1.77-0.06-0.84-0.68-1.56-0.96-2.34 0.05-0.58 0.1-1.15 0.15-1.71 0.25-0.5 0.63-0.96 0.86-1.47z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1066.9 400.04s-4.15 0-7.61 5.6c0 0 3.81-4.92 7.61-4.96"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1070.2 423.79s7.57 2.54 15.97 1.95c0 0-1.71-2.8-7.34-3.95 0.01 0-1.6 1.91-8.63 2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1091.2 476.38s1.47 0.86 1.43 1.76-1.03 1.89-1.03 2.31c0 0.43-1.39 1.46-0.63 2.25 0 0-1.14-0.02-0.53-1.75s1.25-2.17 1.3-3.16c-0.01-0.01-0.22-1.26-0.54-1.41z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1048.1 381.34h-0.38c-0.67 0-1.21-0.54-1.21-1.21v-8.07h2.8v8.07c0 0.67-0.54 1.21-1.21 1.21z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1049.6 374.06h-3.34c-0.09 0-0.16-0.07-0.16-0.16v-8.72c1.2-0.29 2.46-0.29 3.66 0v8.72c0 0.09-0.07 0.16-0.16 0.16z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m1049.7 367.77s-2.68 1.21-3.66 3.42v-6.01s2.05-0.47 3.66 0v2.59z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("polygon", {
        fill: st15,
        points: "1046.2 374.06 1049.3 376.53 1049.3 374.06"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1046.4 420.75s2.37-4.79 10.64-5.34l-0.01-0.06c-0.1-0.59-0.39-1.13-0.84-1.54 0 0-6.94 0.52-10.1 5.27l0.31 1.67z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1046.5 420.71c0.14-0.25 1-1.73 3.11-3.06-0.09-0.53-0.16-1.06-0.21-1.59-1.19 0.73-2.32 1.69-3.18 2.95 0.06 0.54 0.16 1.12 0.28 1.7z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1046.1 417.73s1.32-4.7 9.6-5.24v-0.02c0.07-0.56-0.05-1.13-0.34-1.61 0 0-6.4 0.46-9.57 5.2l0.31 1.67z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1046.1 417.73c0.14-0.25 1.11-2.19 3.23-3.53-0.09-0.53-0.12-0.84 0.01-1.41-1.19 0.73-2.59 1.86-3.45 3.12 0.06 0.54 0.1 1.24 0.21 1.82z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1086.5 439.06s1.19 0.27 5.84-1.02l0.29 1.41s-2.14 0.95-6.39 1.03"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1086.5 442.12s1.07 0.35 6.5-0.94l0.31 1.46s-2.14 0.83-7.11 0.92"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m1055.5 509.2s4.4 2.4 11.65 1.24l-0.36 1.78s-5.43 1.16-11.03-1.15l-0.26-1.87z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1058.6 510.27c-1.73-0.39-2.8-0.89-3.07-1.03 0.14 0.55 0.26 1.12 0.3 1.89 1.08 0.44 2.15 0.74 3.17 0.96-0.15-0.61-0.29-1.21-0.4-1.82z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m1055.3 513.25s4.4 2.4 11.65 1.24l-0.36 1.78s-5.43 1.16-11.03-1.15l-0.26-1.87z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1059.6 514.54c-1.77-0.48-3.7-0.98-3.97-1.11 0.14 0.55-0.17 0.82-0.22 1.71 1.08 0.44 2.22 0.81 4.44 1.18-0.15-0.6-0.14-1.17-0.25-1.78z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m1077.1 510.67s5.54 1.23 10.47-0.2l0.04 0.12c0.16 0.53 0.09 1.1-0.19 1.58 0 0-3.34 1.19-10.08 0l-0.24-1.5z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st14,
        d: "m1109.2 471.74c0.02-0.14 0.04-0.27 0.06-0.4-0.03 0.13-0.05 0.26-0.06 0.4z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1077.3 512.17c1.25 0.22 2.38 0.36 3.39 0.43 0-0.26 0.01-0.51 0.03-0.77 0.02-0.24 0.04-0.47 0.07-0.71-1.98-0.1-3.45-0.39-3.73-0.45 0.09 0.47 0.17 0.98 0.24 1.5z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m1077.1 513.97s5.54 1.23 10.47-0.2l0.04 0.12c0.16 0.53 0.09 1.1-0.19 1.58 0 0-3.34 1.19-10.08 0l-0.24-1.5z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m1077.6 515.5c1.25 0.22 2.28 0.33 3.3 0.4 0-0.26-0.12-0.52-0.1-0.77 0.02-0.24 0.02-0.47 0.05-0.71-2.13-0.17-3.04-0.32-3.32-0.38-0.02 0.54 0 0.94 0.07 1.46z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("polygon", {
        fill: st3,
        points: "-0.34 573.18 -0.34 883.11 1365.6 883.11 1365.7 527.29"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("g", {
        opacity: 0.2,
        children: /*#__PURE__*/jsxRuntimeExports.jsx("path", {
          fill: st1,
          d: "m156.09 436.44c12.66 59.38 12.01 93.03 12.01 93.03s-86.39-107.38-82.63-193.64c0 0 57.96 41.23 70.62 100.61z"
        })
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m746.19 558.61c0.04 0.07 0.11 0.14 0.2 0.22-0.26-0.36-0.39-0.51-0.2-0.22z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m804.73 550.47c0.04 0.07 0.11 0.14 0.2 0.22-0.26-0.36-0.38-0.51-0.2-0.22z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m868.12 545.71c0.04 0.06 0.1 0.13 0.18 0.19-0.24-0.31-0.35-0.45-0.18-0.19z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m505.88 592.32c0.04 0.07 0.11 0.14 0.2 0.21-0.26-0.35-0.39-0.5-0.2-0.21z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m540.41 585c0.05 0.08 0.12 0.15 0.22 0.24-0.29-0.39-0.42-0.56-0.22-0.24z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m604.31 576.12c0.05 0.08 0.12 0.15 0.22 0.24-0.29-0.39-0.42-0.56-0.22-0.24z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m466.1 604.37c0.06 0.05 0.15 0.1 0.25 0.14-0.35-0.25-0.52-0.35-0.25-0.14z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m674.29 567.24c0.05 0.08 0.12 0.15 0.22 0.24-0.29-0.4-0.43-0.57-0.22-0.24z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1030.4 523.59c0.04 0.06 0.1 0.13 0.18 0.2-0.23-0.33-0.34-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m967.32 530.28c0.05 0.09 0.13 0.18 0.24 0.27-0.31-0.44-0.46-0.64-0.24-0.27z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1097 517.07c0.04 0.06 0.1 0.13 0.18 0.2-0.24-0.33-0.35-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1150.1 510.39c0.04 0.06 0.1 0.13 0.18 0.2-0.23-0.32-0.34-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1208.1 503.78c0.04 0.06 0.1 0.13 0.18 0.2-0.23-0.32-0.34-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1246.4 496.86c0.04 0.06 0.1 0.13 0.18 0.2-0.23-0.33-0.34-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1299.4 490.19c0.04 0.06 0.1 0.13 0.18 0.2-0.24-0.33-0.35-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: `
				m1365.7
				486.72v-0.9h-0.01l0.01-3.86s-0.92-0.26-2.25-0.2c-0.04
				0-0.07
				0-0.11-0.01-0.38-0.11-2.71-0.83-4.13-1.57-0.29-0.15-0.62
				0.15-0.48
				0.44
				0.42
				0.85
				1.04
				1.98
				1.72
				2.71-1.12-1.05-4.93-4.26-8.47-3.34-0.3
				0.08-0.36
				0.47-0.09
				0.6
				0.31
				0.16
				0.68
				0.38
				1.04
				0.63
				0.29
				0.21
				0.05
				0.64-0.3
				0.58h-0.02c-0.3-0.05-0.52
				0.27-0.36
				0.51
				0.07
				0.1
				0.13
				0.21
				0.18
				0.33
				0.12
				0.28-0.21
				0.56-0.49
				0.43-1.16-0.53-4.04-1.69-5.69-0.96-0.28
				0.12-0.28
				0.5
				0
				0.6
				0.38
				0.14
				0.87
				0.33
				1.28
				0.58
				0.32
				0.19
				0.11
				0.67-0.26
				0.61-1.63-0.3-4.82-0.93-6.98-1.69-0.34-0.12-0.63
				0.29-0.38
				0.54
				0.37
				0.36
				0.78
				0.75
				1.2
				1.11
				0.27
				0.23
				0
				0.67-0.35
				0.56-1.27-0.4-2.83-0.96-3.41-1.44
				0.23
				0.31
				0.56
				0.77
				0.88
				1.22
				0.2
				0.28-0.15
				0.65-0.46
				0.48-1.1-0.59-2.68-1.42-3.69-1.99-0.28-0.15-0.62
				0.13-0.5
				0.42l0.06
				0.15c0.25
				0.61
				2.11
				1.96
				2.03
				2.13-0.08
				0.18-7.38-2.21-9.33-1.89-1.95
				0.31
				0.7
				0.72
				0.94
				0.81s1.67
				0.61
				1.58
				1.03c-0.08
				0.42-3.13
				0.03-3.25-0.16-0.07-0.1-1.03-0.55-1.87-0.93-0.31-0.14-0.64
				0.22-0.44
				0.49
				0.42
				0.59
				0.82
				1.25
				0.66
				1.49-0.32
				0.46-3.15-2.02-4.14-2.09s0.99
				1.32
				0.98
				1.8-3.31-1.28-4.09-0.96c-0.42
				0.17
				0.57
				0.89
				1.54
				1.6
				0.32
				0.23
				0
				0.72-0.37
				0.56-1.6-0.71-3.81-1.57-5.14-1.63-0.26-0.01-0.45
				0.25-0.35
				0.47
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.14
				0.15-1.46-0.22-1.88-0.14-0.27
				0.05
				1.53
				0.8
				2.87
				1.52-0.27
				0.08-0.32
				0.45-0.07
				0.59
				0.04
				0.02
				0.08
				0.05
				0.12
				0.07-0.06
				0.02-0.12
				0.03-0.2
				0.01-2.22-0.53-6.33-1.39-8.43-1.04-0.29
				0.05-0.39
				0.41-0.17
				0.58
				0.2
				0.15
				0.53
				0.34
				1.08
				0.55
				1.68
				0.65
				2.18
				0.88
				1.2
				1.09-0.78
				0.17-5.48-1.07-7.64-2.03-0.3-0.13-0.62
				0.21-0.45
				0.48
				0.36
				0.56
				0.91
				1.29
				1.7
				2.05
				0.52
				0.5
				1.24
				1.11
				2
				1.73-1.16-0.41-2.5-0.95-3.02-1.4
				0.22
				0.31
				0.55
				0.78
				0.86
				1.22
				0.2
				0.28-0.13
				0.64-0.43
				0.47-1.06-0.6-2.57-1.47-3.55-2.04-0.27-0.16-0.58
				0.11-0.47
				0.4l0.06
				0.15c0.25
				0.61
				2.05
				1.98
				1.98
				2.16-0.07
				0.17-7.07-2.33-8.91-2.06-1.85
				0.27
				0.68
				0.73
				0.91
				0.82
				0.23
				0.1
				1.6
				0.64
				1.53
				1.05s-2.98-0.03-3.1-0.22c-0.07-0.1-0.99-0.57-1.8-0.96-0.3-0.15-0.6
				0.2-0.41
				0.48
				0.42
				0.59
				0.81
				1.26
				0.66
				1.49-0.29
				0.45-3.04-2.06-3.98-2.15-0.95-0.09
				0.97
				1.33
				0.97
				1.8
				0
				0.48-3.17-1.34-3.91-1.04-0.4
				0.16
				0.56
				0.89
				1.5
				1.62
				0.31
				0.24
				0.01
				0.72-0.34
				0.55-1.54-0.73-3.66-1.63-4.93-1.72-0.25-0.02-0.43
				0.24-0.32
				0.46
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.13
				0.15-1.39-0.25-1.79-0.18-0.26
				0.04
				1.58
				0.88
				2.88
				1.63
				0.33
				0.19
				0.12
				0.69-0.25
				0.6-2.13-0.57-6.05-1.5-8.04-1.19-0.28
				0.04-0.36
				0.4-0.15
				0.57
				0.19
				0.15
				0.51
				0.34
				1.04
				0.56
				1.47
				0.62
				1.99
				0.87
				1.38
				1.05-0.71-0.24-2.53-0.9-3.71-1.55-0.28-0.15-0.59
				0.14-0.45
				0.43
				0.05
				0.11
				0.11
				0.22
				0.17
				0.33-1.3-0.41-2.64-0.89-3.53-1.32-0.23-0.11-0.46
				0.07-0.46
				0.29-0.86-0.22-1.75-0.28-2.62-0.06-0.28
				0.07-0.33
				0.46-0.08
				0.6
				0.3
				0.17
				0.66
				0.39
				1
				0.65
				0.28
				0.21
				0.06
				0.64-0.28
				0.57h-0.02c-0.28-0.06-0.49
				0.26-0.33
				0.5
				0.07
				0.1
				0.13
				0.21
				0.18
				0.33
				0.12
				0.28-0.19
				0.55-0.46
				0.42-1.12-0.55-3.88-1.75-5.43-1.06-0.26
				0.12-0.26
				0.5
				0.01
				0.6
				0.36
				0.14
				0.83
				0.35
				1.23
				0.6
				0.31
				0.2
				0.12
				0.67-0.24
				0.6-1.56-0.33-4.61-1.02-6.67-1.82-0.33-0.13-0.6
				0.28-0.35
				0.53
				0.36
				0.36
				0.76
				0.76
				1.16
				1.12
				0.26
				0.24
				0.01
				0.66-0.32
				0.55-1.21-0.42-2.71-1.01-3.28-1.49
				0.22
				0.31
				0.55
				0.78
				0.86
				1.22
				0.2
				0.28-0.13
				0.64-0.43
				0.47-1.06-0.6-2.57-1.47-3.55-2.04-0.27-0.16-0.58
				0.11-0.47
				0.4l0.06
				0.15c0.25
				0.61
				2.05
				1.98
				1.98
				2.16-0.07
				0.17-7.07-2.33-8.91-2.06-1.85
				0.27
				0.68
				0.73
				0.91
				0.82
				0.23
				0.1
				1.6
				0.64
				1.53
				1.05s-2.98-0.03-3.1-0.22c-0.07-0.1-0.99-0.57-1.8-0.96-0.3-0.15-0.6
				0.2-0.41
				0.48
				0.42
				0.59
				0.81
				1.26
				0.66
				1.49-0.29
				0.45-3.04-2.06-3.98-2.15-0.95-0.09
				0.97
				1.33
				0.97
				1.8
				0
				0.48-3.17-1.34-3.91-1.04-0.4
				0.16
				0.56
				0.89
				1.5
				1.62
				0.31
				0.24
				0.01
				0.72-0.34
				0.55-1.54-0.73-3.66-1.63-4.93-1.72-0.25-0.02-0.43
				0.24-0.32
				0.46
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.13
				0.15-1.39-0.25-1.79-0.18-0.24
				0.04
				1.32
				0.76
				2.59
				1.46-0.53-0.04-1.06-0.01-1.58
				0.12-0.11
				0.03-0.18
				0.1-0.21
				0.18-2.1-0.49-4.7-0.96-6.2-0.73-0.28
				0.04-0.36
				0.4-0.15
				0.57
				0.19
				0.15
				0.51
				0.34
				1.04
				0.57
				1.61
				0.68
				2.09
				0.92
				1.17
				1.1-0.74
				0.15-5.23-1.17-7.31-2.17-0.29-0.14-0.59
				0.19-0.42
				0.47
				0.36
				0.57
				0.89
				1.3
				1.66
				2.07l0.24
				0.24c-0.32-0.11-0.62-0.21-0.9-0.32-0.33-0.13-0.6
				0.28-0.35
				0.53
				0.36
				0.36
				0.76
				0.76
				1.16
				1.12
				0.01
				0.01
				0.01
				0.02
				0.02
				0.02-0.44
				0.06-0.88
				0.11-1.33
				0.17-0.95-0.36-1.87-0.77-2.29-1.13
				0.22
				0.31
				0.55
				0.78
				0.86
				1.22
				0.02
				0.03
				0.03
				0.06
				0.04
				0.08-0.31
				0.04-0.62
				0.08-0.94
				0.12-1.01-0.57-2.24-1.28-3.08-1.78-0.27-0.16-0.58
				0.11-0.47
				0.4l0.06
				0.15c0.15
				0.37
				0.84
				1
				1.37
				1.49-0.43
				0.05-0.86
				0.11-1.3
				0.16-2.23-0.67-5.77-1.73-7.01-1.55-1.85
				0.27
				0.68
				0.73
				0.91
				0.82s1.6
				0.64
				1.53
				1.05-2.98-0.03-3.1-0.22c-0.07-0.1-0.99-0.57-1.8-0.96-0.3-0.15-0.6
				0.2-0.41
				0.48
				0.42
				0.59
				0.81
				1.26
				0.66
				1.49-0.02
				0.03-0.04
				0.04-0.08
				0.05h-0.02c-0.57
				0.07-3.01-2.12-3.89-2.2-0.95-0.09
				0.97
				1.33
				0.97
				1.8
				0
				0.48-3.17-1.34-3.91-1.04-0.4
				0.16
				0.56
				0.89
				1.5
				1.62
				0.18
				0.14
				0.15
				0.36
				0.03
				0.49-0.13
				0.02-0.27
				0.03-0.4
				0.05-1.54-0.73-3.64-1.62-4.9-1.71-0.25-0.02-0.43
				0.24-0.32
				0.46
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.11
				0.12-0.97-0.12-1.5-0.18
				0.85-1.63
				1.82-3.2
				2.85-4.71
				3-4.38
				6.53-8.41
				9.23-12.98
				0.34-0.57
				0.5-1.54-0.14-1.68-8.03
				5.73-16.66
				12.36-18.73
				21.99-0.02-0.01-0.04-0.01-0.07-0.02-1.35-7.76
				0.91-15.75
				4.34-22.85
				3.45-7.15
				8.06-13.68
				11.75-20.72-13.04
				8.02-20.97
				23.43-20.59
				38.66-0.92-3.6-2.83-7.08-4.74-10.31-3.15-5.33-6.46-10.65-10.82-15.05-4.37-4.39-9.92-7.85-16.07-8.66
				4.88
				2.56
				9.34
				5.93
				13.13
				9.93
				6.78
				7.17
				11.24
				16.1
				15.16
				25.22-5.03-3.91-10.2-7.66-15.48-11.23
				3.39
				5.48
				7.25
				10.67
				11.52
				15.5-0.16
				0.08-0.24
				0.3-0.13
				0.47
				0.07
				0.1
				0.13
				0.21
				0.18
				0.33
				0.06
				0.13
				0.02
				0.26-0.07
				0.35-0.14
				0.02-0.28
				0.03-0.41
				0.05-1.13-0.55-3.86-1.73-5.4-1.05-0.26
				0.12-0.26
				0.49
				0.01
				0.6
				0.36
				0.14
				0.83
				0.35
				1.23
				0.6
				0.14
				0.09
				0.17
				0.23
				0.14
				0.36-0.32
				0.04-0.63
				0.08-0.95
				0.12-1.65-0.36-4.27-0.98-6.1-1.69-0.33-0.13-0.6
				0.28-0.35
				0.53
				0.36
				0.36
				0.76
				0.76
				1.16
				1.12
				0.26
				0.24
				0.01
				0.66-0.32
				0.55-1.21-0.42-2.71-1.01-3.28-1.49
				0.22
				0.31
				0.55
				0.78
				0.86
				1.22
				0.2
				0.28-0.13
				0.64-0.43
				0.47-1.06-0.6-2.57-1.47-3.55-2.04-0.27-0.16-0.58
				0.11-0.47
				0.4l0.06
				0.15c0.23
				0.57
				1.78
				1.78
				1.96
				2.09l-0.24
				0.03c-1.28-0.31-7.01-2.27-8.66-2.03-1.85
				0.27
				0.68
				0.73
				0.91
				0.82
				0.23
				0.1
				1.6
				0.64
				1.53
				1.05s-2.98-0.03-3.1-0.22c-0.07-0.1-0.99-0.57-1.8-0.96-0.3-0.15-0.6
				0.2-0.41
				0.48
				0.42
				0.59
				0.81
				1.26
				0.66
				1.49-0.29
				0.45-3.04-2.06-3.98-2.15-0.95-0.09
				0.97
				1.33
				0.97
				1.8
				0
				0.48-3.17-1.34-3.91-1.04-0.4
				0.16
				0.56
				0.89
				1.5
				1.62
				0.31
				0.24
				0.01
				0.72-0.34
				0.55-1.54-0.73-3.66-1.63-4.93-1.72-0.25-0.02-0.43
				0.24-0.32
				0.46
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.13
				0.15-1.39-0.25-1.79-0.18-0.26
				0.04
				1.58
				0.88
				2.88
				1.63
				0.33
				0.19
				0.12
				0.69-0.25
				0.6-2.13-0.57-6.05-1.5-8.04-1.19-0.28
				0.04-0.36
				0.4-0.15
				0.57
				0.19
				0.15
				0.51
				0.34
				1.04
				0.57
				0.98
				0.41
				1.54
				0.66
				1.62
				0.84-0.21
				0.03-0.41
				0.05-0.62
				0.08-0.85-0.3-2.32-0.86-3.33-1.42-0.28-0.15-0.59
				0.14-0.45
				0.43
				0.05
				0.11
				0.11
				0.22
				0.17
				0.33-1.3-0.41-2.64-0.89-3.53-1.32-0.23-0.11-0.46
				0.07-0.46
				0.29-0.86-0.22-1.75-0.28-2.62-0.06-0.28
				0.07-0.33
				0.46-0.08
				0.6
				0.3
				0.17
				0.66
				0.39
				1
				0.65
				0.28
				0.21
				0.06
				0.64-0.28
				0.57h-0.02c-0.28-0.06-0.49
				0.26-0.33
				0.5
				0.07
				0.1
				0.13
				0.21
				0.18
				0.33
				0.06
				0.14
				0.01
				0.27-0.08
				0.36-0.13
				0.02-0.27
				0.03-0.4
				0.05-1.13-0.55-3.87-1.74-5.41-1.05-0.26
				0.12-0.26
				0.49
				0.01
				0.6
				0.36
				0.14
				0.83
				0.35
				1.23
				0.6
				0.14
				0.09
				0.17
				0.24
				0.14
				0.36-0.31
				0.04-0.62
				0.08-0.92
				0.12-1.65-0.36-4.28-0.98-6.12-1.7-0.33-0.13-0.6
				0.28-0.35
				0.53
				0.36
				0.36
				0.76
				0.76
				1.16
				1.12
				0.26
				0.24
				0.01
				0.66-0.32
				0.55-1.21-0.42-2.71-1.01-3.28-1.49
				0.22
				0.31
				0.55
				0.78
				0.86
				1.22
				0.2
				0.28-0.13
				0.64-0.43
				0.47-1.06-0.6-2.57-1.47-3.55-2.04-0.27-0.16-0.58
				0.11-0.47
				0.4l0.06
				0.15c0.23
				0.57
				1.82
				1.81
				1.97
				2.11-0.07
				0.01-0.14
				0.02-0.21
				0.03-1.2-0.28-7.03-2.28-8.69-2.03-1.85
				0.27
				0.68
				0.73
				0.91
				0.82
				0.23
				0.1
				1.6
				0.64
				1.53
				1.05s-2.98-0.03-3.1-0.22c-0.07-0.1-0.99-0.57-1.8-0.96-0.3-0.15-0.6
				0.2-0.41
				0.48
				0.42
				0.59
				0.81
				1.26
				0.66
				1.49-0.29
				0.45-3.04-2.06-3.98-2.15-0.95-0.09
				0.97
				1.33
				0.97
				1.8
				0
				0.48-3.17-1.34-3.91-1.04-0.4
				0.16
				0.56
				0.89
				1.5
				1.62
				0.31
				0.24
				0.01
				0.72-0.34
				0.55-1.54-0.73-3.66-1.63-4.93-1.72-0.25-0.02-0.43
				0.24-0.32
				0.46
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.13
				0.15-1.39-0.25-1.79-0.18-0.26
				0.04
				1.58
				0.88
				2.88
				1.63
				0.33
				0.19
				0.12
				0.69-0.25
				0.6-2.13-0.57-6.05-1.5-8.04-1.19-0.28
				0.04-0.36
				0.4-0.15
				0.57
				0.19
				0.15
				0.51
				0.34
				1.04
				0.56
				1.03
				0.44
				1.6
				0.69
				1.63
				0.86-0.44
				0.06-0.87
				0.11-1.31
				0.17-1.6-0.29-4.8-1.3-6.46-2.1-0.29-0.14-0.59
				0.19-0.42
				0.47
				0.36
				0.57
				0.89
				1.3
				1.66
				2.07l0.2
				0.2c-0.95
				0.12-1.89
				0.24-2.84
				0.36l-0.11-0.27-0.76-0.21s-2.28-0.58-3.54-0.54c-0.04
				0-0.07
				0-0.1-0.01-0.36-0.12-2.59-0.88-3.96-1.64-0.28-0.15-0.59
				0.14-0.45
				0.43
				0.41
				0.85
				1.03
				1.99
				1.69
				2.72-1.09-1.06-4.78-4.32-8.13-3.48-0.28
				0.07-0.33
				0.46-0.08
				0.6
				0.3
				0.17
				0.66
				0.39
				1
				0.65
				0.28
				0.21
				0.06
				0.64-0.28
				0.57h-0.02c-0.28-0.06-0.49
				0.26-0.33
				0.5
				0.07
				0.1
				0.13
				0.21
				0.18
				0.33
				0.12
				0.28-0.19
				0.55-0.46
				0.42-1.12-0.55-3.88-1.75-5.43-1.06-0.26
				0.12-0.26
				0.49
				0.01
				0.6
				0.36
				0.14
				0.83
				0.35
				1.23
				0.6
				0.31
				0.2
				0.12
				0.67-0.24
				0.6-1.56-0.33-4.61-1.02-6.67-1.82-0.33-0.13-0.6
				0.28-0.35
				0.53
				0.36
				0.36
				0.76
				0.76
				1.16
				1.12
				0.26
				0.24
				0.01
				0.66-0.32
				0.55-1.21-0.42-2.71-1.01-3.28-1.49
				0.22
				0.31
				0.55
				0.78
				0.86
				1.22
				0.2
				0.28-0.13
				0.64-0.43
				0.47-1.06-0.6-2.57-1.47-3.55-2.04-0.27-0.16-0.58
				0.11-0.47
				0.4l0.06
				0.15c0.25
				0.61
				2.05
				1.98
				1.98
				2.16-0.07
				0.17-7.07-2.33-8.91-2.06-1.85
				0.27
				0.68
				0.73
				0.91
				0.82
				0.23
				0.1
				1.6
				0.64
				1.53
				1.05s-2.98-0.03-3.1-0.22c-0.07-0.1-0.99-0.57-1.8-0.96-0.3-0.15-0.6
				0.2-0.41
				0.48
				0.42
				0.59
				0.81
				1.26
				0.66
				1.49-0.29
				0.45-3.04-2.06-3.98-2.15-0.95-0.09
				0.97
				1.33
				0.97
				1.8
				0
				0.48-3.17-1.34-3.91-1.04-0.4
				0.16
				0.56
				0.89
				1.5
				1.62
				0.31
				0.24
				0.01
				0.72-0.34
				0.55-1.54-0.73-3.66-1.63-4.93-1.72-0.25-0.02-0.43
				0.24-0.32
				0.46
				0.07
				0.15
				0.11
				0.29
				0.06
				0.35-0.13
				0.15-1.39-0.25-1.79-0.18-0.26
				0.04
				1.58
				0.88
				2.88
				1.63
				0.33
				0.19
				0.12
				0.69-0.25
				0.6-2.13-0.57-6.05-1.5-8.04-1.19-0.28
				0.04-0.36
				0.4-0.15
				0.57
				0.19
				0.15
				0.51
				0.34
				1.04
				0.57
				1.61
				0.68
				2.09
				0.92
				1.17
				1.1-0.74
				0.15-5.23-1.17-7.31-2.17-0.29-0.14-0.59
				0.19-0.42
				0.47
				0.01
				0.01
				0.01
				0.02
				0.02
				0.03-0.34-0.13-0.66
				0.23-0.49
				0.59
				0.54
				1.12
				1.33
				2.61
				2.17
				3.63h-0.02c-1.55-1.57-6.27-5.88-10.45-4.87-0.36
				0.09-0.41
				0.6-0.08
				0.8
				0.39
				0.24
				0.86
				0.55
				1.3
				0.91
				0.36
				0.29
				0.1
				0.87-0.34
				0.76-0.01
				0-0.02
				0-0.03-0.01-0.36-0.09-0.62
				0.34-0.41
				0.67
				0.09
				0.14
				0.18
				0.29
				0.24
				0.45
				0.16
				0.38-0.22
				0.74-0.57
				0.55-1.45-0.78-5.04-2.5-7.01-1.62-0.33
				0.15-0.31
				0.66
				0.04
				0.81
				0.47
				0.2
				1.08
				0.5
				1.6
				0.85
				0.4
				0.27
				0.18
				0.91-0.28
				0.8-2.01-0.49-5.95-1.53-8.63-2.68-0.42-0.18-0.75
				0.36-0.43
				0.71
				0.47
				0.5
				1
				1.05
				1.53
				1.56
				0.35
				0.33
				0.04
				0.9-0.4
				0.73-1.57-0.61-3.52-1.45-4.26-2.13
				0.29
				0.42
				0.73
				1.07
				1.15
				1.68
				0.26
				0.39-0.14
				0.86-0.53
				0.62-1.38-0.85-3.35-2.07-4.63-2.88-0.35-0.22-0.75
				0.14-0.59
				0.53l0.08
				0.21c0.34
				0.84
				2.7
				2.75
				2.61
				2.98s-9.15-3.39-11.51-3.08
				0.9
				1.01
				1.19
				1.15c0.3
				0.14
				2.07
				0.92
				2
				1.47-0.08
				0.55-3.82-0.14-3.99-0.4-0.09-0.14-1.29-0.8-2.34-1.36-0.39-0.21-0.76
				0.26-0.51
				0.64
				0.55
				0.82
				1.08
				1.73
				0.89
				2.04-0.36
				0.6-3.97-2.89-5.19-3.04-1.22-0.16
				1.29
				1.82
				1.31
				2.47
				0.02
				0.64-4.12-1.91-5.06-1.53-0.5
				0.21
				0.74
				1.22
				1.98
				2.24
				0.41
				0.33
				0.04
				0.97-0.42
				0.73-2-1.04-4.75-2.33-6.38-2.49-0.32-0.03-0.54
				0.31-0.39
				0.62
				0.09
				0.2
				0.16
				0.39
				0.09
				0.47-0.16
				0.2-1.79-0.38-2.31-0.3-0.34
				0.05
				2.06
				1.24
				3.75
				2.3
				0.43
				0.27
				0.18
				0.94-0.3
				0.8-2.75-0.84-7.82-2.24-10.37-1.88-0.35
				0.05-0.45
				0.53-0.17
				0.77
				0.25
				0.21
				0.67
				0.48
				1.35
				0.8
				2.1
				0.97
				2.72
				1.31
				1.53
				1.53-0.08
				0.02-0.2
				0.01-0.35
				0-0.46-0.19-0.85-0.39-1.14-0.59
				0
				0
				0.17
				0.18
				0.43
				0.47-2.05-0.44-6.23-1.92-8.4-3.05-0.38-0.2-0.75
				0.24-0.52
				0.62
				0.48
				0.78
				1.19
				1.78
				2.2
				2.85
				0.79
				0.83
				1.93
				1.89
				3.09
				2.92-1.64-0.42-6.89-2.11-8.45-1.86-1.84
				0.3
				0.69
				0.72
				0.92
				0.81s1.61
				0.62
				1.54
				1.03-2.98
				0.01-3.1-0.18c-0.13-0.19-3.04-1.5-3.04-1.5s1.79
				2.08
				1.5
				2.54-3.06-2.02-4.01-2.1
				0.99
				1.31
				1
				1.79-3.19-1.3-3.92-0.99c-0.61
				0.26
				2.02
				1.83
				2.84
				2.67-0.15
				0.02-0.3
				0.04-0.45
				0.06-1.56-0.77-5.37-2.54-6.73-2.19
				0
				0
				0.46
				0.62
				0.33
				0.77s-1.39-0.23-1.79-0.16c-0.33
				0.06
				2.71
				1.33
				3.77
				2.14-0.29
				0.04-0.58
				0.07-0.86
				0.11-2.21-0.57-6.82-1.64-8.69-1.06
				0
				0-0.32
				0.38
				1.3
				1.04
				0.9
				0.37
				1.45
				0.6
				1.6
				0.77-0.52
				0.07-1.04
				0.13-1.56
				0.2-2.23-0.44-6.71-1.89-7.21-2.6
				0
				0
				0.49
				1.24
				1.88
				2.74-0.4-0.13-2.6-0.85-3.96-1.58-0.28-0.15-0.58
				0.15-0.44
				0.43
				0.32
				0.64
				0.76
				1.44
				1.24
				2.1-0.05
				0.01-0.11
				0.01-0.16
				0.02-1.54-1.32-4.68-3.56-7.54-2.8-0.28
				0.07-0.32
				0.46-0.07
				0.6
				0.3
				0.16
				0.66
				0.38
				1.01
				0.63
				0.28
				0.21
				0.07
				0.64-0.27
				0.57h-0.02c-0.28-0.05-0.49
				0.27-0.32
				0.5
				0.07
				0.1
				0.13
				0.21
				0.18
				0.33
				0.12
				0.28-0.18
				0.55-0.45
				0.42-1.12-0.53-3.9-1.7-5.44-0.99-0.26
				0.12-0.25
				0.5
				0.02
				0.6
				0.36
				0.14
				0.84
				0.34
				1.24
				0.58
				0.31
				0.19
				0.13
				0.67-0.23
				0.6-1.56-0.31-4.62-0.96-6.7-1.73-0.33-0.12-0.59
				0.29-0.34
				0.53
				0.36
				0.36
				0.77
				0.75
				1.18
				1.11
				0.27
				0.24
				0.02
				0.66-0.32
				0.55-1.22-0.41-2.72-0.97-3.29-1.45
				0.23
				0.3
				0.56
				0.77
				0.88
				1.21
				0.2
				0.28-0.12
				0.64-0.42
				0.47-1.07-0.59-2.59-1.43-3.58-2-0.27-0.15-0.58
				0.12-0.46
				0.41l0.06
				0.15c0.26
				0.61
				2.08
				1.96
				2
				2.13-0.07
				0.17-7.09-2.24-8.94-1.94-1.84
				0.3
				0.69
				0.72
				0.92
				0.81s1.61
				0.62
				1.54
				1.03-2.98
				0.01-3.1-0.18c-0.07-0.1-1-0.55-1.81-0.94-0.3-0.14-0.6
				0.21-0.4
				0.49
				0.42
				0.59
				0.82
				1.25
				0.67
				1.48-0.29
				0.46-3.06-2.02-4.01-2.1s0.99
				1.31
				1
				1.79-3.19-1.3-3.92-0.99c-0.39
				0.17
				0.57
				0.88
				1.52
				1.6
				0.31
				0.23
				0.02
				0.72-0.33
				0.56-1.55-0.71-3.68-1.59-4.95-1.66-0.25-0.01-0.42
				0.24-0.31
				0.47
				0.07
				0.15
				0.12
				0.29
				0.06
				0.35-0.13
				0.15-1.39-0.23-1.79-0.16-0.26
				0.05
				1.6
				0.86
				2.9
				1.59
				0.33
				0.19
				0.13
				0.69-0.24
				0.6-2.13-0.54-6.07-1.43-8.06-1.09-0.28
				0.05-0.36
				0.4-0.14
				0.58
				0.19
				0.15
				0.52
				0.34
				1.05
				0.55
				1.62
				0.66
				2.1
				0.89
				1.18
				1.09-0.25
				0.05-0.92-0.05-1.79-0.26l-0.68-1.61-0.85-0.23s-2.53-0.61-3.92-0.55c-0.04
				0-0.07
				0-0.11-0.01-0.4-0.13-2.88-0.94-4.4-1.75-0.31-0.16-0.65
				0.16-0.49
				0.48
				0.47
				0.93
				1.16
				2.17
				1.89
				2.97-1.23-1.17-5.34-4.7-9.03-3.73-0.31
				0.08-0.36
				0.51-0.08
				0.66
				0.33
				0.18
				0.73
				0.42
				1.11
				0.7
				0.31
				0.23
				0.08
				0.71-0.3
				0.63h-0.02c-0.31-0.06-0.54
				0.29-0.36
				0.56
				0.08
				0.11
				0.15
				0.24
				0.2
				0.36
				0.14
				0.31-0.2
				0.61-0.5
				0.47-1.24-0.59-4.31-1.88-6.02-1.1-0.29
				0.13-0.28
				0.55
				0.02
				0.66
				0.4
				0.15
				0.93
				0.37
				1.37
				0.65
				0.34
				0.21
				0.14
				0.74-0.25
				0.66-1.73-0.34-5.11-1.06-7.41-1.91-0.36-0.14-0.65
				0.32-0.38
				0.59
				0.4
				0.4
				0.85
				0.83
				1.3
				1.23
				0.29
				0.26
				0.02
				0.73-0.35
				0.61-1.35-0.45-3.01-1.08-3.64-1.6
				0.25
				0.34
				0.62
				0.85
				0.97
				1.34
				0.22
				0.31-0.13
				0.71-0.47
				0.52-1.18-0.65-2.87-1.58-3.96-2.21-0.3-0.17-0.64
				0.13-0.51
				0.45l0.07
				0.17c0.29
				0.68
				2.3
				2.17
				2.22
				2.36s-7.85-2.48-9.89-2.15
				0.76
				0.79
				1.02
				0.9c0.26
				0.1
				1.78
				0.68
				1.7
				1.14-0.07
				0.46-3.29
				0.01-3.43-0.2-0.08-0.11-1.1-0.61-2-1.04-0.34-0.16-0.66
				0.24-0.44
				0.54
				0.47
				0.65
				0.91
				1.38
				0.75
				1.64-0.32
				0.51-3.39-2.24-4.44-2.33s1.09
				1.45
				1.1
				1.98-3.53-1.43-4.34-1.09c-0.44
				0.18
				0.63
				0.98
				1.68
				1.77
				0.35
				0.26
				0.03
				0.79-0.37
				0.61-1.71-0.79-4.07-1.76-5.47-1.84-0.28-0.02-0.47
				0.27-0.35
				0.52
				0.08
				0.16
				0.13
				0.32
				0.07
				0.38-0.14
				0.17-1.54-0.25-1.99-0.17-0.29
				0.05
				1.77
				0.95
				3.21
				1.76
				0.37
				0.21
				0.14
				0.77-0.27
				0.66-2.36-0.6-6.71-1.58-8.91-1.21-0.3
				0.05-0.4
				0.45-0.15
				0.64
				0.22
				0.17
				0.57
				0.37
				1.16
				0.61
				1.63
				0.66
				2.22
				0.93
				1.54
				1.14-0.79-0.26-2.81-0.96-4.13-1.66-0.31-0.16-0.65
				0.16-0.49
				0.48
				0.06
				0.12
				0.12
				0.24
				0.19
				0.37-1.44-0.43-2.93-0.95-3.92-1.41-0.26-0.12-0.51
				0.09-0.51
				0.33-0.96-0.23-1.94-0.28-2.9-0.03-0.31
				0.08-0.36
				0.51-0.08
				0.66
				0.33
				0.18
				0.73
				0.42
				1.11
				0.7
				0.31
				0.23
				0.08
				0.71-0.3
				0.63h-0.02c-0.31-0.06-0.54
				0.29-0.36
				0.56
				0.08
				0.11
				0.15
				0.23
				0.2
				0.36
				0.14
				0.31-0.2
				0.61-0.5
				0.47-1.24-0.59-4.31-1.88-6.02-1.1-0.29
				0.13-0.28
				0.55
				0.02
				0.66
				0.4
				0.15
				0.93
				0.37
				1.37
				0.65
				0.34
				0.21
				0.14
				0.74-0.25
				0.66-1.73-0.34-5.11-1.06-7.41-1.91-0.36-0.14-0.65
				0.32-0.38
				0.59
				0.4
				0.4
				0.85
				0.83
				1.3
				1.23
				0.29
				0.26
				0.02
				0.73-0.35
				0.61-1.35-0.45-3.01-1.08-3.64-1.6
				0.25
				0.34
				0.62
				0.85
				0.97
				1.34
				0.22
				0.31-0.13
				0.71-0.47
				0.52-1.18-0.65-2.87-1.58-3.96-2.21-0.3-0.17-0.64
				0.13-0.51
				0.45l0.07
				0.17c0.29
				0.68
				2.3
				2.17
				2.22
				2.36s-7.85-2.48-9.89-2.15
				0.76
				0.79
				1.02
				0.9c0.26
				0.1
				1.78
				0.68
				1.7
				1.14s-3.29
				0.01-3.43-0.2c-0.08-0.11-1.1-0.61-2-1.04-0.34-0.16-0.66
				0.24-0.44
				0.54
				0.47
				0.65
				0.91
				1.38
				0.75
				1.64-0.32
				0.51-3.39-2.24-4.44-2.33s1.09
				1.45
				1.1
				1.98-3.53-1.43-4.34-1.09c-0.44
				0.18
				0.63
				0.98
				1.68
				1.77
				0.35
				0.26
				0.03
				0.79-0.37
				0.61-1.71-0.79-4.07-1.76-5.47-1.84-0.28-0.02-0.47
				0.27-0.35
				0.52
				0.08
				0.16
				0.13
				0.32
				0.07
				0.38-0.14
				0.17-1.54-0.25-1.99-0.17-0.29
				0.05
				1.77
				0.95
				3.21
				1.76
				0.37
				0.21
				0.14
				0.77-0.27
				0.66-2.36-0.6-6.71-1.58-8.91-1.21-0.3
				0.05-0.4
				0.45-0.15
				0.64
				0.21
				0.17
				0.57
				0.37
				1.16
				0.61
				1.8
				0.73
				2.33
				0.98
				1.3
				1.2-0.82
				0.18-5.8-1.22-8.11-2.29-0.32-0.15-0.65
				0.22-0.45
				0.52
				0.4
				0.62
				1
				1.42
				1.87
				2.26
				0.16
				0.16
				0.34
				0.32
				0.53
				0.5-0.71-0.16-2.78-0.6-4.04-0.55-0.04
				0-0.08
				0-0.12-0.02-0.44-0.14-3.14-1.02-4.81-1.91-0.34-0.18-0.7
				0.18-0.53
				0.52
				0.51
				1.01
				1.27
				2.37
				2.07
				3.25-1.35-1.28-5.83-5.13-9.86-4.07-0.34
				0.09-0.39
				0.55-0.08
				0.72
				0.36
				0.2
				0.8
				0.46
				1.22
				0.77
				0.34
				0.25
				0.08
				0.77-0.33
				0.69-0.01
				0-0.02
				0-0.03-0.01-0.34-0.06-0.59
				0.32-0.39
				0.61
				0.08
				0.12
				0.16
				0.26
				0.22
				0.39
				0.15
				0.33-0.22
				0.67-0.55
				0.51-1.36-0.65-4.71-2.06-6.57-1.2-0.32
				0.15-0.3
				0.6
				0.02
				0.72
				0.44
				0.17
				1.01
				0.41
				1.49
				0.7
				0.38
				0.23
				0.16
				0.81-0.28
				0.72-1.89-0.37-5.58-1.15-8.08-2.09-0.4-0.15-0.71
				0.35-0.41
				0.65
				0.44
				0.43
				0.93
				0.9
				1.42
				1.34
				0.32
				0.28
				0.02
				0.8-0.38
				0.67-1.47-0.49-3.29-1.17-3.98-1.75
				0.27
				0.37
				0.68
				0.93
				1.06
				1.46
				0.24
				0.34-0.14
				0.77-0.51
				0.57-1.29-0.71-3.13-1.73-4.32-2.41-0.33-0.19-0.7
				0.15-0.56
				0.49l0.08
				0.18c0.31
				0.74
				2.51
				2.36
				2.42
				2.57s-8.57-2.71-10.79-2.35c-2.23
				0.36
				0.83
				0.87
				1.11
				0.98s1.94
				0.75
				1.86
				1.25-3.59
				0.01-3.75-0.22c-0.08-0.12-1.2-0.67-2.18-1.13-0.37-0.17-0.72
				0.26-0.48
				0.59
				0.51
				0.71
				0.99
				1.51
				0.81
				1.79-0.35
				0.55-3.7-2.44-4.84-2.54s1.19
				1.59
				1.2
				2.16c0.01
				0.58-3.85-1.56-4.74-1.19-0.48
				0.2
				0.69
				1.07
				1.83
				1.93
				0.38
				0.28
				0.03
				0.87-0.4
				0.67-1.87-0.86-4.44-1.92-5.98-2-0.3-0.02-0.51
				0.29-0.38
				0.56
				0.09
				0.18
				0.14
				0.35
				0.08
				0.42-0.16
				0.18-1.68-0.28-2.17-0.19-0.32
				0.06
				1.93
				1.03
				3.5
				1.92
				0.4
				0.23
				0.15
				0.84-0.29
				0.72-2.57-0.66-7.33-1.72-9.73-1.32-0.33
				0.06-0.43
				0.49-0.17
				0.7
				0.23
				0.18
				0.62
				0.41
				1.26
				0.67
				1.96
				0.8
				2.54
				1.07
				1.42
				1.31-0.89
				0.19-6.34-1.33-8.86-2.5-0.35-0.16-0.71
				0.24-0.49
				0.57
				0.15
				0.23
				0.33
				0.49
				0.53
				0.76-0.53-0.22-1.06-0.46-1.5-0.7-0.34-0.18-0.7
				0.18-0.53
				0.52
				0.51
				1.01
				1.27
				2.37
				2.07
				3.25-1.35-1.28-5.83-5.13-9.86-4.07-0.34
				0.09-0.39
				0.55-0.08
				0.72
				0.36
				0.2
				0.8
				0.46
				1.22
				0.77
				0.34
				0.25
				0.08
				0.77-0.33
				0.69h-0.03c-0.34-0.06-0.59
				0.32-0.39
				0.61
				0.08
				0.12
				0.16
				0.26
				0.22
				0.39
				0.15
				0.33-0.22
				0.67-0.55
				0.51-1.36-0.65-4.71-2.06-6.57-1.2-0.32
				0.15-0.3
				0.6
				0.02
				0.72
				0.44
				0.17
				1.01
				0.41
				1.49
				0.7
				0.38
				0.23
				0.16
				0.81-0.28
				0.72-1.89-0.37-5.58-1.15-8.08-2.09-0.4-0.15-0.71
				0.35-0.41
				0.65
				0.44
				0.43
				0.93
				0.9
				1.42
				1.34
				0.32
				0.28
				0.02
				0.8-0.38
				0.67-1.47-0.49-3.29-1.17-3.98-1.75
				0.27
				0.37
				0.68
				0.93
				1.06
				1.46
				0.24
				0.34-0.14
				0.77-0.51
				0.57-1.29-0.71-3.13-1.73-4.32-2.41-0.33-0.19-0.7
				0.15-0.56
				0.49l0.08
				0.18c0.31
				0.74
				2.51
				2.36
				2.42
				2.57s-8.57-2.71-10.79-2.35c-2.23
				0.36
				0.83
				0.87
				1.11
				0.98s1.94
				0.75
				1.86
				1.25-3.59
				0.01-3.75-0.22c-0.08-0.12-1.2-0.67-2.18-1.13-0.37-0.17-0.72
				0.26-0.48
				0.59
				0.51
				0.71
				0.99
				1.51
				0.81
				1.79-0.35
				0.55-3.7-2.44-4.84-2.54s1.19
				1.59
				1.2
				2.16c0.01
				0.58-3.85-1.56-4.74-1.19-0.48
				0.2
				0.69
				1.07
				1.83
				1.93
				0.38
				0.28
				0.03
				0.87-0.4
				0.67-1.87-0.86-4.44-1.92-5.98-2-0.3-0.02-0.51
				0.29-0.38
				0.56
				0.09
				0.18
				0.14
				0.35
				0.08
				0.42-0.16
				0.18-1.68-0.28-2.17-0.19-0.32
				0.06
				1.93
				1.03
				3.5
				1.92
				0.4
				0.23
				0.15
				0.84-0.29
				0.72-2.58-0.66-7.33-1.72-9.73-1.32-0.33
				0.06-0.43
				0.49-0.17
				0.69
				0.23
				0.18
				0.62
				0.41
				1.26
				0.67
				1.78
				0.72
				2.42
				1.02
				1.68
				1.25-0.86-0.28-3.07-1.05-4.51-1.81-0.34-0.18-0.7
				0.18-0.53
				0.52
				0.06
				0.13
				0.13
				0.26
				0.2
				0.4-1.57-0.47-3.2-1.04-4.28-1.54-0.28-0.13-0.55
				0.1-0.55
				0.36-1.04-0.25-2.12-0.31-3.16-0.03-0.34
				0.09-0.39
				0.55-0.08
				0.72
				0.36
				0.2
				0.8
				0.46
				1.22
				0.77
				0.34
				0.25
				0.09
				0.77-0.33
				0.69h-0.03c-0.34-0.06-0.59
				0.32-0.39
				0.61
				0.08
				0.12
				0.16
				0.26
				0.22
				0.39
				0.15
				0.33-0.22
				0.67-0.55
				0.51-1.36-0.65-4.71-2.06-6.57-1.2-0.32
				0.15-0.3
				0.6
				0.02
				0.72
				0.44
				0.17
				1.01
				0.41
				1.49
				0.7
				0.38
				0.23
				0.16
				0.81-0.28
				0.72-1.89-0.37-5.58-1.15-8.08-2.09-0.4-0.15-0.71
				0.35-0.41
				0.65
				0.44
				0.43
				0.93
				0.9
				1.42
				1.34
				0.32
				0.28
				0.02
				0.8-0.38
				0.67-1.47-0.49-3.29-1.17-3.98-1.75
				0.27
				0.37
				0.68
				0.93
				1.06
				1.46
				0.24
				0.34-0.14
				0.77-0.51
				0.57-1.29-0.71-3.13-1.73-4.32-2.41-0.33-0.19-0.7
				0.15-0.56
				0.49l0.08
				0.18c0.31
				0.74
				2.51
				2.36
				2.42
				2.57s-8.57-2.71-10.79-2.35c-2.23
				0.36
				0.83
				0.87
				1.11
				0.98s1.94
				0.75
				1.86
				1.25-3.59
				0.01-3.75-0.22c-0.08-0.12-1.2-0.67-2.18-1.13-0.37-0.17-0.72
				0.26-0.48
				0.59
				0.51
				0.71
				0.99
				1.51
				0.81
				1.79-0.35
				0.55-3.7-2.44-4.84-2.54s1.19
				1.59
				1.2
				2.16c0.01
				0.58-3.85-1.56-4.74-1.19-0.48
				0.2
				0.69
				1.07
				1.83
				1.93
				0.38
				0.28
				0.03
				0.87-0.4
				0.67-1.87-0.86-4.44-1.92-5.98-2-0.3-0.02-0.51
				0.29-0.38
				0.56
				0.09
				0.18
				0.14
				0.35
				0.08
				0.42-0.16
				0.18-1.68-0.28-2.17-0.19-0.32
				0.06
				1.93
				1.03
				3.5
				1.92
				0.4
				0.23
				0.15
				0.84-0.29
				0.72-2.57-0.66-7.33-1.72-9.73-1.32-0.33
				0.06-0.43
				0.49-0.17
				0.7
				0.23
				0.18
				0.62
				0.41
				1.26
				0.67
				1.68
				0.68
				2.34
				0.98
				1.8
				1.21-0.12-0.07-0.22-0.14-0.3-0.21
				0.06
				0.08
				0.12
				0.16
				0.19
				0.25-0.07
				0.02-0.16
				0.04-0.26
				0.07-0.39
				0.08-1.66-0.16-3.17-0.56-0.06-0.03-0.12-0.07-0.17-0.1-0.1-0.06-0.2-0.06-0.28-0.03-1.84-0.51-3.93-1.21-5.24-1.82-0.35-0.16-0.71
				0.24-0.49
				0.57
				0.44
				0.68
				1.1
				1.55
				2.04
				2.47
				0.1
				0.1
				0.2
				0.19
				0.31
				0.3-1.79-0.45-3.52-0.81-4.33-0.67-2.01
				0.33
				0.75
				0.78
				1
				0.89
				0.09
				0.03
				0.32
				0.12
				0.58
				0.24l-0.74
				0.05s-1.05
				0.09-2.14
				0.29c-0.38-0.2-0.9-0.44-1.38-0.67-0.33-0.16-0.65
				0.23-0.44
				0.53
				0.12
				0.16
				0.23
				0.33
				0.33
				0.49-0.07
				0.02-0.15
				0.05-0.22
				0.07-0.04
				0.01-0.07
				0.02-0.11
				0.02-0.17
				0-0.69
				0.01-1.36-0.01-0.88-0.59-1.8-1.21-2.29-1.25-0.68-0.06
				0
				0.58
				0.55
				1.18-0.55-0.04-1.09-0.09-1.56-0.17-0.19-0.03-0.34
				0.09-0.39
				0.24-0.76-0.28-1.49-0.49-1.8-0.36-0.43
				0.18
				0.62
				0.97
				1.66
				1.74
				0.05
				0.04
				0.08
				0.08
				0.1
				0.12-0.86-0.24-1.82-0.44-2.79-0.5-1.14-0.43-2.27-0.78-3.07-0.82-0.27-0.02-0.46
				0.27-0.34
				0.51
				0.08
				0.16
				0.13
				0.31
				0.07
				0.38-0.14
				0.16-1.52-0.25-1.96-0.17-0.18
				0.03
				0.57
				0.4
				1.51
				0.87-0.07
				0.04-0.13
				0.08-0.2
				0.12-0.26
				0.17-0.18
				0.59
				0.13
				0.64
				0.37
				0.06
				0.82
				0.16
				1.26
				0.31
				0.22
				0.07
				0.27
				0.28
				0.21
				0.45-2.33-0.59-6.62-1.56-8.79-1.19-0.3
				0.05-0.39
				0.44-0.15
				0.63
				0.21
				0.17
				0.56
				0.37
				1.14
				0.6
				1.77
				0.72
				2.3
				0.97
				1.29
				1.19-0.81
				0.17-5.73-1.21-8.01-2.26-0.32-0.15-0.64
				0.22-0.45
				0.51
				0.4
				0.61
				0.99
				1.4
				1.84
				2.23
				0.82
				0.8
				2.11
				1.88
				3.31
				2.84-0.87
				0.05-1.73
				0.07-2.5
				0.04-0.38-0.01-0.51
				0.5-0.17
				0.67
				0.49
				0.24
				1.05
				0.51
				1.59
				0.74
				0.35
				0.15
				0.25
				0.68-0.14
				0.68-1.4
				0-3.15-0.06-3.9-0.36
				0.34
				0.24
				0.84
				0.6
				1.32
				0.95
				0.3
				0.22
				0.1
				0.7-0.27
				0.63-1.31-0.24-3.17-0.58-4.38-0.83-0.33-0.07-0.56
				0.33-0.34
				0.58l0.12
				0.13c0.47
				0.54
				2.81
				1.3
				2.8
				1.51-0.01
				0.2-8.1
				0.14-9.91
				1.08s0.96
				0.5
				1.23
				0.52
				1.87
				0.08
				1.94
				0.53-3.08
				1.03-3.27
				0.89c-0.11-0.08-1.22-0.23-2.19-0.34-0.36-0.04-0.55
				0.43-0.25
				0.64
				0.64
				0.46
				1.27
				1
				1.2
				1.3-0.14
				0.57-3.85-1.03-4.86-0.78-1.01
				0.24
				1.47
				1.01
				1.64
				1.5s-3.74-0.24-4.39
				0.34c-0.35
				0.31
				0.89
				0.72
				2.11
				1.12
				0.4
				0.13
				0.27
				0.73-0.16
				0.69-1.84-0.2-4.35-0.37-5.68
				0-0.26
				0.07-0.36
				0.4-0.17
				0.59
				0.12
				0.12
				0.22
				0.25
				0.18
				0.34-0.08
				0.2-1.52
				0.25-1.91
				0.46-0.25
				0.14
				1.94
				0.33
				3.54
				0.64
				0.41
				0.08
				0.37
				0.67-0.05
				0.7-2.39
				0.17-6.76
				0.62-8.7
				1.66-0.27
				0.14-0.23
				0.54
				0.05
				0.64
				0.25
				0.09
				0.65
				0.17
				1.27
				0.21
				1.9
				0.12
				2.48
				0.19
				1.59
				0.71-0.71
				0.42-5.8
				0.67-8.29
				0.39-0.35-0.04-0.54
				0.41-0.26
				0.63
				0.57
				0.45
				1.38
				1.01
				2.44
				1.53
				0.82
				0.4
				1.97
				0.86
				3.12
				1.3-0.44
				0.58-0.8
				1.15-1.05
				1.72
				1.19
				1.34
				2.33
				2.64
				2.67
				2.32
				0.32-0.3-0.03-1.48-0.45-2.55-0.2-0.5
				0.4-0.93
				0.81-0.59
				1.1
				0.91
				2.36
				1.97
				2.43
				2.15
				0.12
				0.34
				4.47
				2.11
				4.73
				1.5
				0.27-0.61-1.65-1.96-1.97-2.2-0.19-0.14-1.56-0.76-2.06-1.2l0.83-0.42c0.04
				0
				0.08
				0.01
				0.12
				0.01
				2.98
				0.27
				12.89
				6.75
				13.07
				6.51s-2.1-3.03-2.26-4.08l-0.04-0.26c-0.07-0.49
				0.52-0.79
				0.88-0.45
				1.3
				1.26
				3.32
				3.16
				4.74
				4.49
				0.4
				0.38
				1.04-0.05
				0.84-0.57-0.31-0.8-0.65-1.65-0.87-2.21
				0.69
				0.96
				2.8
				2.43
				4.53
				3.53
				0.48
				0.31
				1.03-0.26
				0.71-0.73-0.49-0.72-0.97-1.48-1.38-2.17-0.29-0.48
				0.28-1.01
				0.74-0.69
				2.9
				2.01
				7.38
				4.21
				9.68
				5.3
				0.53
				0.25
				1-0.42
				0.59-0.83-0.52-0.54-1.17-1.03-1.68-1.39-0.38-0.26-0.25-0.85
				0.21-0.93
				2.68-0.48
				6.51
				2.41
				8.04
				3.67
				0.37
				0.31
				0.95
				0
				0.87-0.47-0.03-0.2-0.09-0.39-0.16-0.58-0.16-0.43
				0.29-0.84
				0.7-0.65
				0.01
				0
				0.02
				0.01
				0.03
				0.01
				0.5
				0.24
				1-0.35
				0.65-0.77-0.43-0.53-0.91-1-1.31-1.37-0.34-0.31-0.12-0.89
				0.34-0.89
				5.52-0.05
				10
				6.34
				11.31
				8.41-0.74-1.38-1.26-3.36-1.58-4.82-0.11-0.49
				0.48-0.83
				0.86-0.49
				1.84
				1.68
				5.02
				3.69
				5.54
				4.01
				0.05
				0.03
				0.1
				0.05
				0.15
				0.06
				0.87
				0.18
				1.99
				0.62
				2.97
				1.05-0.03-0.07-0.05-0.15-0.07-0.21-0.16-0.49
				0.42-0.89
				0.82-0.56
				0.98
				0.8
				2.39
				1.76
				3.87
				2.69l3.64-9.06c1.52-3.78
				5.18-6.26
				9.26-6.26h8.44l12.89
				5.7
				1.96
				6.9h8.49l9.19
				5.7
				1.51
				3.62c0.85
				0.65
				1.86
				1.33
				2.76
				1.9
				0.3
				0.19
				0.62
				0.04
				0.75-0.21-0.76-1.05-1.45-2.07-1.96-2.9-0.91-1.48-1.46-2.81-1.8-3.82-0.16-0.49
				0.42-0.89
				0.82-0.56
				2.85
				2.32
				9.33
				6.04
				10.54
				6.09
				0.17
				0.01
				0.3
				0
				0.42
				0
				0.03-0.01
				0.06-0.03
				0.1-0.03
				0.05-0.01
				0.11-0.01
				0.16-0.02
				0.47-0.18-0.31-0.79-2.07-2.09-0.73-0.54-1.16-0.95-1.4-1.26-0.27-0.35
				0-0.87
				0.44-0.83
				3.21
				0.26
				8.96
				3.17
				12.05
				4.85
				0.17
				0.09
				0.34
				0.08
				0.48
				0.02-0.29-0.31-0.57-0.59-0.83-0.83-0.27-0.25-0.18-0.65
				0.09-0.82-1.59-1.43-3.34-2.82-2.99-2.79
				0.65
				0.04
				2.46
				1.13
				2.72
				0.95
				0.11-0.07
				0.09-0.31
				0.04-0.56-0.08-0.39
				0.29-0.72
				0.67-0.6
				1.94
				0.61
				4.89
				2.8
				7.01
				4.51
				0.48
				0.39
				1.13-0.24
				0.74-0.73-1.19-1.47-2.39-2.96-1.72-3.06
				1.26-0.19
				5.51
				3.8
				5.68
				3.06
				0.18-0.74-2.26-3.65-0.83-3.15s4.75
				5.41
				5.37
				4.82c0.32-0.3-0.03-1.48-0.45-2.55-0.2-0.5
				0.4-0.93
				0.81-0.59
				1.1
				0.91
				2.36
				1.97
				2.43
				2.15
				0.12
				0.34
				4.47
				2.11
				4.73
				1.5
				0.27-0.61-1.65-1.96-1.97-2.2s-4.08-1.88-1.1-1.61
				12.89
				6.75
				13.07
				6.51-2.1-3.03-2.26-4.08l-0.04-0.26c-0.07-0.49
				0.52-0.79
				0.88-0.45
				1.3
				1.26
				3.32
				3.16
				4.74
				4.49
				0.4
				0.38
				1.04-0.05
				0.84-0.56-0.23-0.58-0.46-1.19-0.66-1.69l-6.02-5.29-7.06-11.72-0.75
				1.13c-1.03
				1.56-3.23
				1.96-4.63
				0.74-1.32-1.15-1.2-2.92
				0.16-2.35
				2.11
				0.89
				3.88-0.77
				3.88-0.77-1.66-3.48-9.93-10.01-9.93-10.01s-2.12
				4.42-5.61
				4.06c-3.49-0.37-3.99-5.03-1.38-4.79s5-1.03
				5-1.03l-6.11-5.55
				0.6-0.96
				4.75
				2.96s-1.85-9.33
				1.42-7.41c3.27
				1.93
				0.42
				9.4
				0.42
				9.4
				4.35
				2.92
				11.41
				11.56
				11.41
				11.56s-4.67-9.92
				0.12-9.07
				2.31
				12.66
				2.31
				12.66l10.94
				13.19
				11.58
				5.39c-2.86-2.47-4.47-9.19-4.47-9.19
				0.87
				1.56
				2.62
				3.6
				4.41
				5.47
				1.12
				1.17
				2.24
				2.26
				3.18
				3.14
				0.34
				0.03
				0.69
				0.1
				1.04
				0.2-0.68-1.42-1.05-3-1.05-3
				1.78
				2.38
				4.45
				4.28
				7.87
				6.21
				0.01-0.06
				0.01-0.11
				0-0.18-0.03-0.2-0.09-0.39-0.16-0.58-0.16-0.43
				0.29-0.84
				0.7-0.65
				0.01
				0
				0.02
				0.01
				0.03
				0.01
				0.5
				0.24
				1-0.35
				0.65-0.77-0.43-0.53-0.91-1-1.31-1.37-0.34-0.31-0.12-0.89
				0.35-0.89
				5.52-0.05
				10
				6.34
				11.31
				8.41-0.74-1.38-1.26-3.36-1.58-4.82-0.11-0.49
				0.48-0.83
				0.86-0.49
				1.84
				1.68
				5.02
				3.69
				5.54
				4.01
				0.05
				0.03
				0.1
				0.05
				0.15
				0.06
				0.46
				0.1
				0.99
				0.27
				1.54
				0.47-0.58-0.8-1.11-1.58-1.49-2.2-0.68-1.11-1.1-2.11-1.35-2.87-0.12-0.37
				0.32-0.67
				0.62-0.42
				2.14
				1.74
				7.01
				4.54
				7.92
				4.57
				1.14
				0.04
				0.65-0.36-1.05-1.61-0.55-0.41-0.87-0.72-1.05-0.95-0.2-0.26
				0-0.65
				0.33-0.63
				2.42
				0.2
				6.74
				2.38
				9.06
				3.65
				0.4
				0.22
				0.79-0.31
				0.46-0.62-1.3-1.24-3.22-2.73-2.9-2.71
				0.49
				0.03
				1.85
				0.85
				2.04
				0.71
				0.08-0.06
				0.07-0.23
				0.03-0.42-0.06-0.29
				0.22-0.54
				0.5-0.45
				1.46
				0.46
				3.68
				2.11
				5.27
				3.39
				0.36
				0.29
				0.85-0.18
				0.55-0.55-0.89-1.11-1.8-2.22-1.29-2.3
				0.95-0.14
				4.14
				2.86
				4.27
				2.3s-1.7-2.74-0.62-2.37
				3.57
				4.07
				4.04
				3.62c0.24-0.23-0.02-1.11-0.34-1.92-0.15-0.37
				0.3-0.7
				0.61-0.44
				0.83
				0.68
				1.77
				1.48
				1.82
				1.62
				0.09
				0.25
				3.36
				1.58
				3.56
				1.13
				0.2-0.46-1.24-1.47-1.48-1.65s-3.06-1.41-0.83-1.21c2.24
				0.2
				9.69
				5.08
				9.83
				4.9
				0.13-0.18-1.58-2.28-1.7-3.06l-0.03-0.19c-0.06-0.37
				0.39-0.6
				0.66-0.34
				0.98
				0.94
				2.5
				2.37
				3.57
				3.37
				0.3
				0.28
				0.78-0.04
				0.63-0.42-0.23-0.6-0.49-1.24-0.66-1.66
				0.52
				0.72
				2.1
				1.82
				3.4
				2.65
				0.36
				0.23
				0.77-0.2
				0.53-0.55-0.37-0.54-0.73-1.11-1.04-1.63-0.22-0.36
				0.21-0.76
				0.56-0.52
				2.18
				1.51
				5.55
				3.17
				7.28
				3.98
				0.4
				0.19
				0.75-0.31
				0.45-0.63-0.39-0.4-0.88-0.78-1.26-1.04-0.28-0.2-0.18-0.64
				0.16-0.7
				2.01-0.36
				4.9
				1.81
				6.04
				2.76
				0.28
				0.23
				0.71
				0
				0.65-0.36-0.02-0.15-0.07-0.3-0.12-0.43-0.12-0.32
				0.22-0.63
				0.53-0.49
				0.01
				0
				0.02
				0.01
				0.02
				0.01
				0.38
				0.18
				0.75-0.26
				0.49-0.58-0.32-0.4-0.68-0.75-0.98-1.03-0.25-0.24-0.09-0.67
				0.26-0.67
				3.06-0.03
				5.7
				2.58
				7.27
				4.58
				0.22
				0.14
				0.45
				0.27
				0.67
				0.4-0.27-0.78-0.48-1.6-0.62-2.28-0.08-0.37
				0.36-0.62
				0.64-0.37
				0.5
				0.46
				1.14
				0.95
				1.77
				1.4
				0.07-0.06
				0.17-0.1
				0.28-0.1
				2.42
				0.2
				6.74
				2.38
				9.06
				3.65
				0.4
				0.22
				0.79-0.31
				0.46-0.62-1.3-1.24-3.22-2.73-2.9-2.71
				0.49
				0.03
				1.85
				0.85
				2.04
				0.71
				0.08-0.06
				0.07-0.23
				0.03-0.42-0.06-0.29
				0.22-0.54
				0.5-0.45
				1.46
				0.46
				3.68
				2.1
				5.27
				3.39
				0.36
				0.29
				0.85-0.18
				0.55-0.54-0.89-1.11-1.8-2.22-1.29-2.3
				0.95-0.14
				4.14
				2.86
				4.27
				2.3s-1.7-2.74-0.62-2.37
				3.57
				4.07
				4.04
				3.62c0.24-0.23-0.02-1.11-0.34-1.92-0.15-0.37
				0.3-0.7
				0.61-0.44
				0.83
				0.68
				1.77
				1.48
				1.82
				1.62
				0.09
				0.25
				3.36
				1.58
				3.56
				1.13
				0.2-0.46-1.24-1.47-1.48-1.65s-3.06-1.41-0.83-1.21c2.24
				0.2
				9.69
				5.08
				9.83
				4.9
				0.13-0.18-1.58-2.28-1.7-3.06l-0.03-0.19c-0.06-0.37
				0.39-0.6
				0.66-0.34
				0.98
				0.94
				2.5
				2.37
				3.57
				3.37
				0.3
				0.28
				0.78-0.04
				0.63-0.42-0.23-0.6-0.49-1.24-0.66-1.66
				0.52
				0.72
				2.1
				1.82
				3.4
				2.66
				0.36
				0.23
				0.77-0.2
				0.53-0.55-0.37-0.54-0.73-1.11-1.04-1.63-0.22-0.36
				0.21-0.76
				0.56-0.52
				2.18
				1.51
				5.55
				3.17
				7.28
				3.98
				0.4
				0.19
				0.75-0.31
				0.45-0.63-0.39-0.4-0.88-0.78-1.26-1.04-0.28-0.2-0.19-0.64
				0.16-0.7
				2.01-0.36
				4.9
				1.81
				6.04
				2.76
				0.28
				0.23
				0.71
				0
				0.65-0.36-0.02-0.15-0.07-0.3-0.12-0.43-0.12-0.32
				0.22-0.63
				0.53-0.49
				0.01
				0
				0.02
				0.01
				0.02
				0.01
				0.38
				0.18
				0.75-0.26
				0.48-0.58-0.32-0.39-0.68-0.75-0.98-1.03-0.25-0.24-0.09-0.67
				0.26-0.67
				4.16-0.04
				7.54
				4.79
				8.51
				6.33-0.56-1.04-0.96-2.53-1.2-3.63-0.08-0.37
				0.36-0.62
				0.64-0.37
				0
				0
				4.77
				6.56
				7.7
				9.45
				0.74
				0.39
				1.22
				0.78
				1.42
				1.17
				0.74
				1.44-2.34
				2.86-10.02
				4.27-23.27
				4.26-18.35
				10.43
				0.74
				16.8-0.08-0.1-0.09-0.16
				0-0.15
				0.53
				0.04
				1.65
				0.61
				2.49
				0.96
				0.29
				0.09
				0.58
				0.18
				0.88
				0.27
				0.05
				0
				0.09-0.01
				0.11-0.02
				0.14-0.09
				0.12-0.4
				0.05-0.72-0.11-0.5
				0.37-0.92
				0.86-0.76
				1.69
				0.53
				3.98
				2
				6.13
				3.58
				1.14
				0.31
				2.31
				0.62
				3.51
				0.94-1.43-1.77-2.75-3.47-1.94-3.59
				1.61-0.24
				7.04
				4.86
				7.27
				3.92s-2.89-4.66-1.06-4.03c1.83
				0.64
				6.07
				6.92
				6.87
				6.16
				0.41-0.39-0.04-1.89-0.58-3.26-0.25-0.64
				0.51-1.19
				1.04-0.75
				1.41
				1.16
				3.02
				2.52
				3.1
				2.76
				0.16
				0.43
				5.71
				2.69
				6.05
				1.92
				0.34-0.78-2.11-2.5-2.53-2.81-0.41-0.3-5.21-2.41-1.41-2.06
				3.8
				0.34
				16.49
				8.64
				16.72
				8.33s-2.68-3.88-2.88-5.21l-0.05-0.33c-0.09-0.63
				0.67-1.02
				1.12-0.57
				1.66
				1.61
				4.25
				4.03
				6.07
				5.74
				0.52
				0.48
				1.33-0.07
				1.07-0.72-0.4-1.03-0.83-2.12-1.12-2.83
				0.89
				1.23
				3.58
				3.1
				5.79
				4.52
				0.61
				0.39
				1.31-0.33
				0.91-0.93-0.63-0.92-1.23-1.89-1.77-2.78-0.37-0.61
				0.36-1.29
				0.95-0.88
				3.71
				2.57
				9.44
				5.39
				12.38
				6.78
				0.67
				0.32
				1.28-0.53
				0.76-1.07-0.67-0.69-1.5-1.32-2.15-1.77-0.48-0.34-0.31-1.09
				0.27-1.19
				3.42-0.62
				8.33
				3.08
				10.28
				4.7
				0.48
				0.39
				1.21
				0
				1.11-0.61-0.04-0.25-0.12-0.5-0.2-0.74-0.2-0.55
				0.37-1.08
				0.9-0.83
				0.01
				0.01
				0.03
				0.01
				0.04
				0.02
				0.64
				0.3
				1.27-0.44
				0.83-0.99-0.55-0.67-1.16-1.28-1.67-1.76-0.43-0.4-0.15-1.14
				0.44-1.14
				7.06-0.06
				12.79
				8.1
				14.46
				10.75-0.94-1.76-1.61-4.29-2.02-6.16-0.14-0.63
				0.62-1.06
				1.1-0.63
				2.35
				2.15
				6.42
				4.72
				7.08
				5.13
				0.06
				0.04
				0.12
				0.06
				0.19
				0.08
				0.64
				0.14
				1.4
				0.38
				2.16
				0.67-1.15-1.58-2.23-3.14-2.99-4.37-1.16-1.9-1.87-3.59-2.3-4.88-0.21-0.62
				0.54-1.14
				1.05-0.72
				3.64
				2.96
				11.93
				7.72
				13.47
				7.78
				1.93
				0.07
				1.1-0.62-1.78-2.74-0.94-0.69-1.48-1.22-1.79-1.61-0.35-0.45
				0-1.11
				0.57-1.06
				4.11
				0.34
				11.46
				4.06
				15.4
				6.2
				0.68
				0.37
				1.34-0.52
				0.78-1.06-2.21-2.11-5.48-4.64-4.94-4.6
				0.83
				0.06
				3.14
				1.44
				3.48
				1.21
				0.14-0.09
				0.12-0.4
				0.05-0.72-0.11-0.5
				0.37-0.92
				0.86-0.76
				2.48
				0.78
				6.26
				3.58
				8.96
				5.76
				0.62
				0.5
				1.44-0.31
				0.94-0.93-1.52-1.88-3.06-3.78-2.19-3.91
				1.61-0.24
				7.04
				4.86
				7.27
				3.92
				0.22-0.94-2.89-4.66-1.06-4.03
				1.83
				0.64
				6.07
				6.92
				6.87
				6.16
				0.41-0.39-0.04-1.89-0.58-3.26-0.25-0.64
				0.51-1.19
				1.04-0.75
				1.41
				1.16
				3.02
				2.52
				3.1
				2.76
				0.16
				0.43
				5.71
				2.69
				6.05
				1.92
				0.34-0.78-2.11-2.5-2.53-2.81-0.41-0.3-5.21-2.41-1.41-2.06
				3.8
				0.34
				16.49
				8.64
				16.72
				8.33s-2.68-3.88-2.88-5.21l-0.05-0.33c-0.09-0.63
				0.67-1.02
				1.12-0.57
				1.66
				1.61
				4.25
				4.03
				6.07
				5.74
				0.52
				0.48
				1.33-0.07
				1.07-0.72-0.4-1.03-0.83-2.12-1.12-2.83
				0.89
				1.23
				3.58
				3.1
				5.79
				4.52
				0.61
				0.39
				1.31-0.33
				0.91-0.93-0.63-0.92-1.23-1.89-1.77-2.78-0.37-0.61
				0.36-1.29
				0.95-0.88
				3.71
				2.57
				9.44
				5.39
				12.38
				6.78
				0.67
				0.32
				1.28-0.53
				0.76-1.07-0.67-0.68-1.5-1.32-2.15-1.77-0.48-0.34-0.31-1.09
				0.27-1.19
				3.42-0.62
				8.33
				3.08
				10.28
				4.7
				0.48
				0.39
				1.21
				0
				1.11-0.61-0.04-0.25-0.12-0.5-0.2-0.74-0.2-0.55
				0.37-1.08
				0.9-0.83
				0.01
				0.01
				0.03
				0.01
				0.04
				0.02
				0.64
				0.3
				1.27-0.44
				0.83-0.99-0.55-0.67-1.16-1.28-1.67-1.76-0.43-0.4-0.15-1.14
				0.44-1.14
				6.45-0.05
				11.79
				6.75
				13.93
				9.94
				0.05
				0
				0.1
				0.01
				0.14
				0.01-0.74-1.67-1.29-3.77-1.64-5.37-0.14-0.63
				0.62-1.06
				1.1-0.63
				2.35
				2.15
				6.42
				4.72
				7.08
				5.13
				0.05
				0.03
				0.1
				0.05
				0.16
				0.07-8.16-9.15-13.81-20.57-15.86-32.66
				11.75
				8.92
				21.9
				19.94
				29.82
				32.38-2.57-10.81-3.54-22.01-2.87-33.11
				0.29-4.73
				1.07-9.86
				4.5-13.12
				10.59
				13.64
				10.81
				32.39
				10.57
				49.66
				8.09-2.9
				16.44-5.07
				24.92-6.47-2.6
				3.99-5.72
				7.63-9.26
				10.82
				59.7
				11.21
				95.77
				29.89
				74.72
				36.46-7.61
				2.37-8.63
				6.89-2.85
				12.31-0.48-1.3-1.48-3.53-1.43-4.44l0.02-0.32c0.04-0.6
				0.82-0.81
				1.15-0.31
				1.23
				1.82
				3.16
				4.58
				4.52
				6.52
				0.38
				0.55
				1.25
				0.2
				1.14-0.46-0.17-1.03-0.35-2.13-0.48-2.85-0.08-0.18-0.13-0.35-0.15-0.49-0.06-0.61
				0.01-0.27
				0.15
				0.49
				0.58
				1.32
				2.72
				3.58
				4.49
				5.33
				0.49
				0.48
				1.29-0.05
				1.03-0.69-0.4-0.98-0.78-2-1.1-2.93-0.22-0.64
				0.59-1.13
				1.06-0.63
				2.95
				3.12
				7.72
				6.86
				10.18
				8.73
				0.56
				0.43
				1.29-0.25
				0.91-0.84-0.48-0.77-1.14-1.52-1.65-2.07-0.38-0.41-0.08-1.07
				0.48-1.06
				3.3
				0.09
				7.14
				4.5
				8.63
				6.38
				0.36
				0.46
				1.13
				0.24
				1.15-0.35
				0.01-0.24-0.01-0.49-0.04-0.72-0.08-0.55
				0.55-0.93
				1-0.6
				0.01
				0.01
				0.02
				0.02
				0.03
				0.02
				0.53
				0.41
				1.27-0.16
				0.96-0.76-0.38-0.73-0.83-1.42-1.21-1.96-0.32-0.46
				0.08-1.09
				0.63-0.98
				6.57
				1.33
				10.3
				10.04
				11.33
				12.82-0.53-1.82-0.66-4.31-0.67-6.12
				0-0.61
				0.78-0.87
				1.14-0.37
				1.77
				2.46
				5.05
				5.64
				5.58
				6.15
				0.05
				0.05
				0.1
				0.08
				0.16
				0.11
				1.57
				0.69
				3.74
				2.31
				4.92
				3.23-0.91-1.27-1.74-2.49-2.35-3.48-1.1-1.8-1.78-3.41-2.19-4.64-0.2-0.59
				0.51-1.08
				1-0.68
				3.46
				2.81
				11.33
				7.33
				12.8
				7.39
				1.84
				0.07
				1.04-0.59-1.69-2.6-0.89-0.66-1.41-1.16-1.7-1.53-0.33-0.43
				0-1.06
				0.54-1.01
				3.9
				0.32
				10.88
				3.85
				14.63
				5.89
				0.65
				0.35
				1.27-0.5
				0.74-1.01-2.1-2-5.21-4.41-4.69-4.37
				0.79
				0.05
				2.99
				1.37
				3.3
				1.15
				0.13-0.09
				0.11-0.38
				0.05-0.68-0.1-0.47
				0.35-0.87
				0.82-0.73
				2.35
				0.74
				5.94
				3.4
				8.51
				5.47
				0.59
				0.48
				1.37-0.29
				0.89-0.88-1.44-1.79-2.91-3.59-2.08-3.72
				1.53-0.23
				6.69
				4.62
				6.9
				3.72s-2.75-4.43-1.01-3.83
				5.77
				6.57
				6.53
				5.85c0.39-0.37-0.04-1.8-0.55-3.1-0.24-0.6
				0.49-1.13
				0.99-0.72
				1.34
				1.1
				2.87
				2.39
				2.95
				2.62
				0.15
				0.41
				5.43
				2.56
				5.75
				1.82s-2.01-2.38-2.4-2.67-4.95-2.29-1.34-1.96c3.61
				0.32
				15.66
				8.2
				15.88
				7.91s-2.55-3.68-2.74-4.95l-0.05-0.31c-0.09-0.6
				0.63-0.96
				1.07-0.55
				1.58
				1.53
				4.03
				3.83
				5.76
				5.45
				0.49
				0.46
				1.26-0.06
				1.02-0.69-0.38-0.97-0.79-2.01-1.06-2.69-0.12-0.16-0.2-0.32-0.25-0.45-0.19-0.58-0.04-0.26
				0.25
				0.45
				0.84
				1.17
				3.4
				2.95
				5.5
				4.29
				0.58
				0.37
				1.25-0.32
				0.86-0.88-0.6-0.87-1.17-1.8-1.68-2.64-0.35-0.58
				0.34-1.22
				0.9-0.84
				3.53
				2.44
				8.97
				5.12
				11.76
				6.44
				0.64
				0.3
				1.21-0.51
				0.72-1.01-0.63-0.65-1.43-1.25-2.04-1.68-0.46-0.32-0.3-1.03
				0.25-1.13
				3.25-0.59
				7.91
				2.93
				9.76
				4.46
				0.45
				0.37
				1.15
				0
				1.06-0.58-0.04-0.24-0.11-0.48-0.19-0.7-0.19-0.52
				0.35-1.03
				0.86-0.79
				0.01
				0.01
				0.03
				0.01
				0.04
				0.02
				0.61
				0.29
				1.21-0.42
				0.78-0.94-0.52-0.64-1.1-1.22-1.59-1.67-0.41-0.38-0.14-1.08
				0.42-1.09
				6.7-0.06
				12.15
				7.7
				13.74
				10.21-0.75-1.4-1.32-3.32-1.71-4.95-0.31-0.42-0.6-0.83-0.85-1.2-1.19-1.74-1.94-3.32-2.41-4.53-0.23-0.58
				0.46-1.1
				0.96-0.73
				3.6
				2.64
				11.68
				6.77
				13.15
				6.76
				1.84-0.02
				1.01-0.64-1.82-2.51-0.92-0.61-1.46-1.09-1.77-1.45-0.35-0.41-0.05-1.05
				0.49-1.04
				3.91
				0.13
				11.06
				3.32
				14.9
				5.17
				0.66
				0.32
				1.25-0.56
				0.69-1.04-2.2-1.9-5.42-4.15-4.9-4.14
				0.79
				0.02
				3.05
				1.22
				3.35
				0.99
				0.12-0.1
				0.09-0.38
				0.01-0.68-0.12-0.47
				0.31-0.89
				0.78-0.76
				2.39
				0.63
				6.1
				3.11
				8.77
				5.05
				0.61
				0.45
				1.35-0.36
				0.85-0.92-1.53-1.72-3.08-3.45-2.26-3.61
				1.52-0.3
				6.91
				4.29
				7.08
				3.38s-2.96-4.29-1.19-3.77
				6.08
				6.28
				6.81
				5.53c0.37-0.39-0.13-1.79-0.7-3.07-0.27-0.59
				0.43-1.15
				0.95-0.76
				1.39
				1.04
				2.98
				2.25
				3.07
				2.47
				0.17
				0.4
				5.54
				2.29
				5.83
				1.54s-2.12-2.28-2.53-2.55c-0.4-0.27-5.06-2.04-1.43-1.89s16.04
				7.43
				16.25
				7.13c0.2-0.3-2.73-3.55-2.98-4.81l-0.06-0.31c-0.12-0.59
				0.58-0.99
				1.04-0.6
				1.65
				1.45
				4.22
				3.63
				6.02
				5.16
				0.51
				0.43
				1.26-0.12
				0.99-0.74-0.43-0.96-0.88-1.97-1.19-2.63-0.13-0.16-0.22-0.31-0.27-0.44-0.22-0.57-0.06-0.26
				0.27
				0.44
				0.9
				1.13
				3.54
				2.78
				5.7
				4.02
				0.6
				0.34
				1.23-0.38
				0.82-0.92-0.64-0.84-1.26-1.74-1.8-2.55-0.38-0.56
				0.28-1.24
				0.86-0.88
				2.28
				1.42
				5.32
				2.9
				7.97
				4.09l0.45-330.18h0.02c0-0.01-0.01-0.01-0.02
				0zm-654.51
				82.34c-0.21
				0.03-0.43
				0.06-0.64
				0.08l-0.39-0.93c0.34
				0.29
				0.69
				0.57
				1.03
				0.85zm-213.83
				25.96c-0.01
				0.04-0.04
				0.08-0.1
				0.11l-0.77-0.88c0.45
				0.22
				0.91
				0.52
				0.87
				0.77zm480.01
				129.23c-0.14-0.44-0.03-0.2
				0.19
				0.34-0.09-0.12-0.16-0.24-0.19-0.34zm208.34-216.02c-0.6
				0.07-1.19
				0.15-1.79
				0.22-0.47-0.11-0.96-0.22-1.47-0.33
				0.2-0.44
				0.41-0.87
				0.63-1.3
				0.49
				0.3
				1.69
				0.87
				2.63
				1.41z
			`
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1337.2 482.78c0.04 0.06 0.1 0.13 0.18 0.2-0.23-0.33-0.35-0.47-0.18-0.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1300.2 823.88l0.02 0.13c5.64 0.29 11.41 0.54 17.32 0.74l-17.34-0.87z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "M-0.34,600.6c-0.03-0.01-0.07-0.01-0.1-0.02v25.4l0.1,257.12V600.6z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m663.8 662.51v0.02c0.59 0.05 1.19 0.11 1.78 0.16l-1.78-0.18z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("polygon", {
        fill: st1,
        points: "1365.6 881.97 1365.6 827.18 1365.5 827.18"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: `url(#${b})`,
        d: "m86.14 335.89s57.96 41.23 70.62 100.61c3.36 15.77 5.79 29.72 7.53 41.71l1.79-0.69 40.53-20.74c0.49-0.25 1.01-0.4 1.54-0.46l0.36-0.03h0.24c0.1 0 0.21 0.01 0.31 0.02h0.03c1.14 0.11 2.23 0.66 3.01 1.6l0.32 0.39c0.17 0.2 0.27 0.33 0.27 0.33 3.48 2.91 7.84 2.91 8.23 2.9 0.89-0.18 1.77-0.5 2.6-0.98l2.53-1.47c-0.87-1.2-1.75-2.4-2.65-3.6-19.21-25.54-25.95-58.65-43.59-85.3-21.32-32.21-53.98-57.97-65.24-94.92-11.55-37.9 2.16-79.17-4.34-118.26-8.51-51.24-46.7-104.56-56.01-155.66h-54.67c-0.82 107.69 32.6 157.47 38.57 232.7 3.47 43.76-4.86 89.02 8.1 130.97 7.91 25.63 23.32 48.26 33.47 73.09 8.6 21.02 13.32 43.3 17.92 65.61l41.92-16.03c-24.68-39.18-55.67-99.39-53.39-151.79z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("g", {
        opacity: 0.2,
        children: /*#__PURE__*/jsxRuntimeExports.jsx("path", {
          fill: st11,
          d: "m212.71 458.63l-0.27-0.33c-0.52-0.59-1.76-1.79-3.33-1.99h-0.03c-0.1-0.01-0.21-0.02-0.31-0.02h-0.24c-0.12 0-0.24 0.01-0.36 0.03 0 0-8.45 8.58-2.01 8.92s14.81-3.71 14.81-3.71-0.01 0-0.03 0c-3 0.6-6.18-0.44-8.23-2.9z"
        })
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st3,
        d: "m1056.5 520.12c0.11 0.31 0.25 0.65 0.42 1.02 1.02 0.96 2.04 1.89 2.93 2.69 0.1-0.14 0.29-0.2 0.45-0.09 1.64 1.17 3.79 4.59 4.9 6.49 0.19 0.33 0.69 0.12 0.59-0.25-0.4-1.45-1.13-3.34-0.91-3.18 0.33 0.23 0.96 1.4 1.15 1.38 0.08-0.01 0.15-0.14 0.2-0.29 0.08-0.24 0.39-0.29 0.55-0.11 0.84 0.95 1.72 3.08 2.31 4.68 0.13 0.37 0.68 0.23 0.63-0.16-0.16-1.18-0.33-2.37 0.06-2.2 0.74 0.3 1.73 3.82 2.06 3.48s-0.04-2.7 0.57-1.97 0.8 4.45 1.33 4.33c0.27-0.06 0.46-0.81 0.58-1.52 0.06-0.33 0.51-0.37 0.63-0.06 0.3 0.84 0.63 1.82 0.61 1.94-0.04 0.22 1.72 2.57 2.06 2.33s-0.26-1.59-0.35-1.82c-0.1-0.23-1.58-2.32-0.07-1.23 1.51 1.1 4.74 7.79 4.92 7.71 0.17-0.07-0.15-2.31 0.1-2.92l0.06-0.15c0.12-0.29 0.53-0.26 0.61 0.04 0.29 1.1 0.77 2.77 1.1 3.95 0.09 0.33 0.57 0.31 0.63-0.04 0.09-0.53 0.19-1.1 0.24-1.48-0.01-0.1-0.01-0.19 0.01-0.27 0.07-0.31 0.05-0.13-0.01 0.27 0.06 0.74 0.72 2.21 1.29 3.36 0.16 0.32 0.64 0.19 0.61-0.16-0.03-0.55-0.04-1.11-0.04-1.62 0-0.35 0.48-0.45 0.62-0.13 0.91 2.02 2.6 4.65 3.49 5.97 0.2 0.3 0.67 0.1 0.59-0.26-0.11-0.46-0.3-0.93-0.46-1.29-0.12-0.26 0.14-0.54 0.41-0.44 1.59 0.6 2.72 3.39 3.13 4.56 0.1 0.29 0.51 0.3 0.62 0.02 0.05-0.12 0.08-0.24 0.1-0.36 0.06-0.28 0.43-0.36 0.59-0.12 0 0.01 0.01 0.01 0.01 0.02 0.19 0.29 0.65 0.13 0.6-0.21-0.06-0.42-0.16-0.83-0.26-1.16-0.08-0.28 0.22-0.52 0.47-0.37 2.17 1.27 2.94 4.22 3.22 6.32 0.13 0.09 0.27 0.18 0.4 0.26 0.13-0.54 0.3-1.08 0.45-1.52 0.1-0.3 0.53-0.29 0.62 0.01 0.04 0.13 0.08 0.26 0.13 0.4 0.08 0.02 0.15 0.06 0.21 0.15 0.61 1.01 1.7 2.45 2.72 3.65 0.81 0.52 1.62 1.04 2.42 1.55-0.15-0.25-0.35-0.55-0.6-0.92-0.32-0.48-0.48-0.81-0.56-1.04-0.09-0.27 0.18-0.51 0.44-0.4 1.83 0.84 4.6 3.78 6.06 5.42 0.25 0.28 0.7-0.02 0.54-0.36-0.67-1.34-1.75-3.06-1.51-2.95 0.37 0.16 1.21 1.19 1.4 1.14 0.08-0.02 0.12-0.16 0.14-0.32 0.03-0.25 0.32-0.36 0.52-0.21 1.01 0.77 2.28 2.69 3.16 4.15 0.2 0.33 0.71 0.1 0.59-0.27-0.39-1.12-0.78-2.26-0.36-2.17 0.78 0.16 2.43 3.42 2.69 3.02s-0.56-2.64 0.18-2.04 1.64 4.21 2.14 3.99c0.25-0.11 0.29-0.88 0.27-1.61-0.01-0.34 0.43-0.47 0.6-0.18 0.46 0.77 0.97 1.66 0.97 1.79 0 0.23 2.18 2.19 2.47 1.89s-0.56-1.51-0.7-1.72-2-1.98-0.3-1.19c1.69 0.79 6.15 6.73 6.31 6.63s-0.59-2.24-0.46-2.89l0.03-0.16c0.06-0.31 0.47-0.36 0.61-0.08 0.5 1.02 1.28 2.57 1.84 3.66 0.16 0.31 0.62 0.19 0.61-0.16-0.01-0.54-0.03-1.12-0.04-1.5-0.03-0.1-0.04-0.19-0.04-0.26 0.01-0.32 0.02-0.14 0.04 0.26 0.2 0.72 1.13 2.03 1.91 3.05 0.22 0.28 0.66 0.06 0.57-0.28-0.14-0.53-0.25-1.08-0.35-1.58-0.07-0.34 0.38-0.54 0.58-0.25 1.28 1.8 3.45 4.06 4.57 5.19 0.26 0.26 0.68-0.04 0.53-0.37-0.19-0.43-0.47-0.86-0.7-1.18-0.17-0.24 0.04-0.56 0.32-0.51 1.68 0.28 3.32 2.81 3.95 3.88 0.15 0.26 0.56 0.2 0.61-0.1 0.02-0.12 0.03-0.25 0.03-0.37 0-0.29 0.35-0.44 0.55-0.24l0.02 0.02c0.24 0.25 0.66 0.01 0.54-0.32-0.14-0.4-0.32-0.79-0.48-1.09-0.13-0.26 0.12-0.55 0.39-0.46 0.52 0.18 0.98 0.45 1.4 0.79 0.12-0.01 0.24 0.03 0.31 0.15 0.05 0.09 0.11 0.19 0.18 0.28 0.62 0.61 1.12 1.36 1.53 2.13 0.47 0.61 0.97 1.21 1.44 1.73 0.03-0.32 0.06-0.62 0.1-0.9 0.04-0.31 0.46-0.39 0.61-0.11 0.32 0.6 0.77 1.3 1.2 1.92-0.14-0.22-0.31-0.48-0.51-0.78-0.32-0.48-0.48-0.81-0.56-1.04-0.09-0.27 0.18-0.51 0.44-0.4 1.83 0.84 4.6 3.78 6.06 5.42 0.25 0.28 0.7-0.02 0.54-0.36-0.67-1.34-1.75-3.06-1.51-2.95 0.37 0.16 1.21 1.19 1.4 1.14 0.08-0.02 0.12-0.16 0.14-0.32 0.03-0.25 0.32-0.36 0.52-0.21 1.01 0.77 2.28 2.69 3.16 4.15 0.2 0.33 0.71 0.1 0.59-0.27-0.39-1.12-0.78-2.26-0.36-2.17 0.78 0.16 2.43 3.42 2.69 3.02s-0.56-2.64 0.18-2.04 1.64 4.21 2.14 3.99c0.25-0.11 0.29-0.88 0.27-1.61-0.01-0.34 0.43-0.47 0.6-0.18 0.46 0.77 0.97 1.66 0.97 1.79 0 0.23 2.18 2.19 2.47 1.89s-0.56-1.51-0.7-1.72-2-1.98-0.3-1.19c0.65 0.3 3.03 2.48 5.63 4.95-0.12-0.14-0.25-0.27-0.37-0.41l0.75 0.56c0.17 0.13 0.41 0.06 0.5-0.13l0.06-0.15c-0.45-0.57-0.73-0.97-0.71-1.07l0.03-0.16c0.06-0.31 0.47-0.36 0.61-0.08 0.04 0.07 0.08 0.15 0.11 0.23l0.26 0.37 0.62-1.49-0.39-0.69s-1.21-2.02-2.13-2.88c-0.03-0.02-0.05-0.05-0.06-0.08-0.17-0.34-1.22-2.45-1.66-3.95-0.09-0.3-0.52-0.31-0.62-0.01-0.31 0.89-0.67 2.14-0.72 3.12-0.03-1.52-0.35-6.43-3.32-8.2-0.25-0.15-0.55 0.09-0.47 0.37 0.09 0.33 0.19 0.74 0.25 1.16 0.05 0.34-0.41 0.5-0.6 0.21 0-0.01-0.01-0.01-0.01-0.02-0.04-0.06-0.09-0.09-0.14-0.12-0.22-0.27-0.44-0.52-0.64-0.71-0.03-0.02-0.05-0.05-0.06-0.08-0.17-0.34-1.22-2.45-1.66-3.95-0.09-0.3-0.52-0.31-0.62-0.01-0.14 0.4-0.28 0.86-0.41 1.34-0.15-0.15-0.32-0.27-0.48-0.38-0.3-2.07-1.08-4.82-3.15-6.04-0.25-0.15-0.55 0.09-0.47 0.37 0.09 0.33 0.19 0.74 0.25 1.16 0.05 0.34-0.41 0.5-0.6 0.21 0-0.01-0.01-0.01-0.01-0.02-0.13-0.2-0.4-0.18-0.53-0.01-0.19-0.16-0.53-0.05-0.53 0.25v0.44c-0.11-0.02-0.21-0.09-0.25-0.22-0.41-1.18-1.52-3.97-3.11-4.58-0.27-0.1-0.53 0.17-0.41 0.43 0.16 0.35 0.35 0.83 0.45 1.29 0.02 0.1 0 0.19-0.05 0.26-0.17-0.6-0.32-1.19-0.45-1.66-0.08-0.3-0.49-0.33-0.61-0.04l-0.06 0.15c-0.05 0.12-0.08 0.29-0.09 0.5-0.9-1.41-2.08-3.36-2.78-4.94-0.14-0.32-0.62-0.22-0.62 0.13 0 0.45 0 0.94 0.02 1.42-0.57-0.89-1.11-1.62-1.53-1.93-0.04-0.03-0.07-0.05-0.1-0.07-0.14-0.4-0.23-0.75-0.25-1.01-0.03 0.21-0.08 0.49-0.13 0.79-0.26-0.1-0.22 0.12-0.07 0.43-0.02 0.09-0.03 0.17-0.05 0.26-0.06 0.34-0.54 0.37-0.63 0.03-0.33-1.18-0.79-2.85-1.08-3.95-0.08-0.3-0.49-0.33-0.61-0.04l-0.06 0.15c-0.26 0.61 0.06 2.85-0.12 2.92-0.06 0.03-0.52-0.83-1.15-1.98-0.14-0.67-0.29-1.27-0.5-1.52-0.18-0.21-0.27-0.16-0.32 0.02-1-1.79-2.16-3.71-2.91-4.26-1.5-1.11-0.03 0.99 0.06 1.23 0.07 0.17 0.42 0.99 0.45 1.48-0.09 0.02-0.13 0.15-0.15 0.35-0.42 0.07-2.05-2.13-2-2.35 0.02-0.12-0.3-1.1-0.6-1.95-0.11-0.32-0.57-0.28-0.63 0.05-0.12 0.71-0.31 1.46-0.59 1.52-0.05 0.01-0.09-0.01-0.13-0.05-0.02-0.03-0.05-0.07-0.07-0.1-0.38-0.7-0.59-3.55-1.11-4.18-0.61-0.73-0.25 1.62-0.58 1.96s-1.31-3.18-2.05-3.49c-0.39-0.16-0.24 0.98-0.09 2.13-0.32-0.72-0.65-1.55-0.86-2.24-0.09-0.3-0.52-0.31-0.62-0.01l-0.06 0.18c-0.43-0.97-0.9-1.86-1.37-2.39-0.09-0.1-0.23-0.13-0.34-0.1-0.49-1.13-1.21-2.15-2.27-2.77-0.25-0.15-0.55 0.09-0.47 0.37 0.09 0.33 0.19 0.74 0.25 1.16 0.05 0.34-0.41 0.5-0.6 0.21 0-0.01-0.01-0.01-0.01-0.02-0.12-0.18-0.35-0.18-0.48-0.06-0.82-1.15-1.69-2.21-2.46-2.8-0.43-0.58-0.92-1.06-1.47-1.27-0.27-0.1-0.53 0.17-0.41 0.43 0.12 0.28 0.26 0.63 0.37 0.99-0.32-0.26-0.64-0.53-0.95-0.79-0.57-1.1-1.09-2.24-1.39-3.08-0.11-0.3-0.55-0.28-0.62 0.04-0.02 0.08-0.04 0.17-0.06 0.26-0.35-0.64-0.68-1.28-0.94-1.86-0.14-0.32-0.62-0.22-0.62 0.13 0 0.49 0 1.03 0.03 1.56-0.38-0.31-0.76-0.62-1.14-0.92-0.38-0.86-0.7-1.72-0.74-2.23-0.06 0.37-0.15 0.92-0.24 1.44-0.28-0.22-0.56-0.45-0.84-0.67-0.3-1.07-0.64-2.33-0.88-3.21-0.08-0.3-0.49-0.33-0.61-0.04l-0.06 0.15c-0.14 0.33-0.11 1.14-0.08 1.82-0.41-0.32-0.81-0.63-1.22-0.95-1.11-2.05-2.74-4.99-3.69-5.69-1.5-1.11-0.03 0.99 0.06 1.23 0.1 0.23 0.68 1.58 0.34 1.82-0.06 0.04-0.17 0-0.31-0.1-0.01-0.01-0.02-0.01-0.03-0.02-0.62-0.47-1.75-2.04-1.71-2.22 0.02-0.12-0.3-1.1-0.6-1.95-0.11-0.32-0.57-0.28-0.63 0.05-0.12 0.71-0.31 1.45-0.58 1.52-0.07-0.05-0.13-0.1-0.2-0.14-0.39-0.69-0.59-3.55-1.11-4.19-0.61-0.73-0.25 1.62-0.58 1.96s-1.31-3.18-2.05-3.49c-0.4-0.16-0.23 1.03-0.08 2.2 0.05 0.39-0.5 0.52-0.63 0.15-0.58-1.6-1.45-3.74-2.28-4.69-0.16-0.19-0.47-0.13-0.55 0.1-0.05 0.15-0.12 0.28-0.2 0.29-0.2 0.01-0.81-1.15-1.15-1.39-0.22-0.15 0.51 1.74 0.9 3.19 0.05 0.2-0.07 0.35-0.23 0.4-0.15-0.1-0.3-0.19-0.45-0.29-1.13-1.93-3.19-5.22-4.78-6.37-0.23-0.16-0.54 0.03-0.51 0.3 0.03 0.24 0.12 0.6 0.34 1.13 0.56 1.36 0.77 1.93 0.36 1.77l-1.87-3.06c-0.16-0.09-0.32-0.18-0.47-0.27-0.65-1.23-1.28-2.56-1.62-3.52-0.11-0.3-0.55-0.28-0.62 0.04-0.15 0.65-0.28 1.55-0.28 2.64 0 0.18 0 0.36 0.01 0.56-0.57-0.41-1.12-0.82-1.56-1.14-0.25-0.19-0.59 0.05-0.51 0.35l0.05 0.16c0.18 0.64 1.83 2.19 1.74 2.36-0.09 0.16-6.78-3.07-8.64-3-1.87 0.08 0.6 0.8 0.82 0.92s1.52 0.81 1.41 1.21-2.95-0.35-3.06-0.55c-0.06-0.11-0.92-0.67-1.68-1.15-0.28-0.18-0.62 0.14-0.46 0.43 0.35 0.63 0.67 1.34 0.49 1.55-0.34 0.42-2.8-2.37-3.73-2.57-0.93-0.19 0.82 1.42 0.77 1.9-0.05 0.47-3.01-1.67-3.78-1.45-0.41 0.12 0.46 0.95 1.32 1.77 0.28 0.27-0.06 0.72-0.4 0.51-1.45-0.89-3.46-2.02-4.72-2.24-0.25-0.04-0.45 0.19-0.37 0.43 0.05 0.15 0.08 0.3 0.02 0.35-0.15 0.13-1.36-0.39-1.76-0.37-0.27 0.02 1.48 1.04 2.69 1.93 0.31 0.23 0.04 0.7-0.31 0.57-2.05-0.8-5.86-2.14-7.87-2.04-0.28 0.01-0.4 0.36-0.21 0.55 0.17 0.17 0.47 0.4 0.97 0.67 1.53 0.85 1.98 1.13 1.04 1.22-0.6 0.05-3.43-1.06-5.55-2.12-0.35 0.32-0.41 0.64-0.1 0.93 0.07-0.29 0.51-0.32 0.62-0.01z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st15,
        d: "m1060.2 526.79c0.76 0.49 0.63 0.05 0.03-1.39l-0.98 0.14c0.4 0.65 0.75 1.12 0.95 1.25z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m47.03 711.45c0.12-0.12 0.2-0.23 0.26-0.34 0.22-0.45 0.06-0.21-0.26 0.34z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m143.25 716.85c-3.15 1.88-10.07 4.63-11.27 4.5-1.5-0.16-0.77-0.6 1.69-1.92 0.8-0.43 1.28-0.77 1.56-1.05 0.32-0.31 0.13-0.86-0.32-0.89-3.2-0.2-9.29 1.85-12.58 3.06-0.57 0.21-0.97-0.56-0.48-0.91 1.95-1.38 4.75-2.97 4.33-3.01-0.65-0.05-2.59 0.76-2.82 0.54-0.09-0.09-0.05-0.32 0.04-0.56 0.14-0.37-0.18-0.75-0.57-0.69-2 0.33-5.23 2.07-7.56 3.45-0.53 0.32-1.07-0.4-0.62-0.82 1.39-1.29 2.79-2.58 2.14-2.78-1.21-0.37-5.98 2.97-6.05 2.21-0.06-0.76 2.76-3.28 1.28-3-1.49 0.29-5.47 4.67-6 4-0.27-0.35 0.25-1.46 0.82-2.46 0.27-0.46-0.26-0.98-0.72-0.7-1.22 0.74-2.61 1.61-2.71 1.78-0.07 0.14-0.99 0.43-2.01 0.67 0.65-0.69 1.25-1.36 1.72-1.92 1.11-1.34 1.85-2.57 2.33-3.52 0.23-0.46-0.29-0.94-0.73-0.68-3.15 1.88-10.07 4.63-11.27 4.5-1.5-0.16-0.77-0.6 1.69-1.92 0.8-0.43 1.28-0.77 1.56-1.05 0.32-0.31 0.13-0.86-0.32-0.89-3.2-0.2-9.29 1.85-12.58 3.06-0.57 0.21-0.97-0.56-0.48-0.91 1.95-1.38 4.75-2.97 4.33-3.01-0.65-0.05-2.59 0.76-2.82 0.54-0.09-0.09-0.05-0.32 0.04-0.56 0.14-0.37-0.18-0.75-0.57-0.69-2 0.33-5.23 2.07-7.56 3.45-0.53 0.32-1.07-0.4-0.62-0.82 1.39-1.29 2.79-2.58 2.14-2.78-1.21-0.37-5.98 2.97-6.05 2.21-0.06-0.76 2.76-3.28 1.28-3-1.49 0.29-5.47 4.67-6 4-0.27-0.35 0.25-1.46 0.82-2.46 0.27-0.46-0.26-0.98-0.72-0.7-1.22 0.74-2.61 1.61-2.71 1.78-0.1 0.19-1.84 0.69-3.22 0.9-0.33 0.01-0.65 0.04-0.98 0.09-0.39 0.01-0.65-0.05-0.69-0.19-0.17-0.64 1.92-1.7 2.27-1.89s4.29-1.27 1.32-1.44-13.69 4.83-13.83 4.56c-0.14-0.26 2.51-2.7 2.82-3.71l0.08-0.25c0.14-0.47-0.4-0.86-0.8-0.57-1.46 1.06-3.73 2.64-5.33 3.76-0.45 0.31-1.02-0.2-0.74-0.68 0.43-0.75 0.88-1.55 1.19-2.07-0.82 0.85-3.11 2-4.98 2.84-0.51 0.23-0.97-0.41-0.59-0.82 0.59-0.64 1.17-1.33 1.68-1.95 0.35-0.43-0.13-1.04-0.63-0.79-3.15 1.57-7.89 3.11-10.31 3.85-0.56 0.17-0.92-0.56-0.46-0.91 0.59-0.46 1.31-0.85 1.86-1.13 0.41-0.21 0.37-0.81-0.07-0.95-2.56-0.87-6.77 1.44-8.45 2.48-0.41 0.25-0.93-0.14-0.79-0.6 0.06-0.19 0.15-0.38 0.24-0.55 0.22-0.4-0.16-0.88-0.6-0.75-0.01 0-0.02 0.01-0.03 0.01-0.53 0.16-0.93-0.49-0.52-0.86 0.5-0.46 1.04-0.86 1.49-1.17 0.38-0.26 0.25-0.86-0.21-0.94-5.43-0.84-10.78 4.83-12.37 6.69 0.93-1.26 1.74-3.14 2.26-4.54 0.18-0.47-0.36-0.89-0.77-0.61-2.06 1.4-5.49 2.93-6.04 3.17-0.05 0.02-0.1 0.03-0.16 0.04-2.01 0.13-5.53 1.38-5.53 1.38l-2.38 0.89 0.01 1.12h-0.01l-0.1 57.87c0.51-0.32-0.08-1.78 1.77-3.45 0.37-0.34 0.96 0.01 0.85 0.5-0.2 0.88-0.48 1.96-0.83 2.97h0.5c2.04-2.68 5.74-6.56 10.04-6.49 0.46 0.01 0.68 0.59 0.34 0.9-0.4 0.37-0.88 0.84-1.31 1.36-0.35 0.43 0.14 1.01 0.64 0.78 0.01 0 0.02-0.01 0.03-0.01 0.42-0.19 0.85 0.23 0.7 0.66-0.07 0.18-0.13 0.38-0.16 0.58-0.08 0.47 0.49 0.79 0.86 0.48 1.53-1.26 5.37-4.12 8.03-3.62 0.45 0.09 0.58 0.67 0.2 0.93-0.51 0.35-1.16 0.84-1.69 1.38-0.41 0.41 0.06 1.08 0.58 0.84 2.3-1.07 6.78-3.25 9.68-5.24 0.46-0.32 1.02 0.22 0.73 0.7-0.42 0.69-0.9 1.45-1.39 2.16-0.32 0.46 0.22 1.03 0.7 0.73 1.73-1.1 3.84-2.55 4.54-3.5 0.24-0.59 0.36-0.85 0.21-0.37-0.04 0.11-0.11 0.24-0.21 0.37-0.23 0.56-0.57 1.41-0.89 2.21-0.2 0.51 0.43 0.95 0.83 0.57 1.43-1.32 3.46-3.21 4.76-4.46 0.36-0.34 0.95-0.03 0.87 0.46l-0.04 0.26c-0.16 1.04-2.46 3.82-2.28 4.06s10.11-6.18 13.07-6.43-0.79 1.37-1.11 1.61c-0.32 0.23-2.25 1.57-1.99 2.18s4.6-1.13 4.73-1.47c0.07-0.19 1.33-1.24 2.43-2.14 0.42-0.34 1 0.1 0.81 0.6-0.43 1.07-0.79 2.24-0.47 2.55 0.62 0.6 3.96-4.3 5.39-4.78s-1.02 2.41-0.85 3.15 4.43-3.22 5.68-3.03c0.67 0.11-0.54 1.58-1.74 3.05-0.39 0.48 0.24 1.12 0.73 0.73 2.12-1.69 5.08-3.86 7.01-4.46 0.38-0.12 0.75 0.21 0.66 0.6-0.06 0.25-0.07 0.49 0.03 0.56 0.26 0.18 2.07-0.89 2.71-0.93 0.42-0.03-2.14 1.93-3.88 3.57-0.18 0.17-0.2 0.38-0.13 0.56 4.46-1.64 7.57-4.2 6.41-6.7s-6.07-4.26-9.81-6.21c-3.41-1.78-5.91-4.43-3.58-6.4 0.23-0.19 0.5-0.38 0.82-0.55 0.04-0.02 0.09-0.05 0.13-0.07 1.67-1.08 5.11-3.2 6.58-3.5 0.06-0.01 0.1-0.03 0.15-0.06 0.51-0.32 3.7-2.31 5.55-3.97 0.37-0.34 0.96 0.01 0.85 0.5-0.29 1.3-0.75 3-1.37 4.32 0.03-0.01 0.06-0.01 0.09-0.02 1.64-2.43 5.9-7.91 11-7.83 0.46 0.01 0.68 0.59 0.34 0.9-0.4 0.37-0.88 0.84-1.31 1.36-0.35 0.43 0.14 1.01 0.64 0.78 0.01 0 0.02-0.01 0.03-0.01 0.42-0.19 0.85 0.23 0.7 0.66-0.07 0.18-0.13 0.38-0.16 0.58-0.08 0.47 0.49 0.79 0.86 0.48 1.53-1.26 5.37-4.12 8.03-3.62 0.45 0.09 0.58 0.67 0.2 0.93-0.51 0.35-1.16 0.84-1.69 1.38-0.35 0.35-0.06 0.88 0.35 0.89 0.06-0.01 0.13-0.02 0.19-0.04 0.01-0.01 0.03-0.01 0.04-0.02 2.3-1.07 6.78-3.25 9.68-5.24 0.46-0.32 1.02 0.22 0.73 0.7-0.42 0.69-0.9 1.45-1.39 2.16-0.18 0.25-0.09 0.54 0.1 0.7 0.31-0.06 0.62-0.11 0.93-0.17 1.66-1.07 3.56-2.4 4.21-3.3 0.24-0.59 0.36-0.85 0.21-0.37-0.04 0.11-0.11 0.24-0.21 0.37-0.23 0.56-0.57 1.41-0.89 2.21-0.07 0.17-0.04 0.34 0.04 0.47 0.38-0.07 0.75-0.14 1.13-0.21 1.4-1.29 3.22-2.99 4.42-4.14 0.36-0.34 0.95-0.03 0.87 0.46l-0.04 0.26c-0.1 0.61-0.91 1.8-1.54 2.74 0.29-0.05 0.59-0.11 0.88-0.16 0.57-0.1 1.14-0.21 1.7-0.32 3.22-1.85 7.87-4.47 9.74-4.62 2.96-0.25-0.79 1.37-1.11 1.61-0.23 0.17-1.28 0.9-1.77 1.53 1.91-0.5 3.7-1.08 5.25-1.79 0.23-0.1 0.44-0.21 0.66-0.32 0.33-0.28 0.69-0.57 1.03-0.85 0.16-0.13 0.35-0.14 0.51-0.08 0.79-0.57 1.4-1.19 1.78-1.82 0.3-0.36 0.61-0.78 0.95-1.29 0.71-1.07 5.84-5.53 8.04-8.19 1.11-1.34 1.85-2.57 2.33-3.52 0.28-0.39-0.23-0.87-0.68-0.61z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m101.59 624.76l10.17-0.74c0.49-0.04 0.52-0.73 0.04-0.82-2.19-0.38-5.76-0.6-10.36 0.51-0.64 0.17-0.5 1.1 0.15 1.05z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m121.22 625.97h-11.21c-0.67 0-0.76 0.97-0.11 1.09 2.46 0.46 6.24 0.65 11.38-0.49 0.36-0.07 0.31-0.6-0.06-0.6z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m298.66 807.41h-22.9s0.66-4.2 11.61-4.2 11.29 4.2 11.29 4.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m258.07 831.42h-22.9s0.66-4.2 11.61-4.2 11.29 4.2 11.29 4.2z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m389.67 616.01h-11.45s0.33-2.1 5.8-2.1 5.65 2.1 5.65 2.1z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m403.05 620.86h-11.45s0.33-2.1 5.8-2.1 5.65 2.1 5.65 2.1z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m148.87 682.48h-11.7s0.34-2.15 5.93-2.15 5.77 2.15 5.77 2.15z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m167.44 684.63h-11.7s0.34-2.15 5.93-2.15c5.6 0 5.77 2.15 5.77 2.15z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m190.44 678.7h-11.7s0.34-2.15 5.93-2.15c5.6 0.01 5.77 2.15 5.77 2.15z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m180.11 674.74h-11.7s0.34-2.15 5.93-2.15 5.77 2.15 5.77 2.15z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m399.93 606.8h-9.43s0.27-1.77 4.78-1.77 4.65 1.77 4.65 1.77z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m414.9 608.57h-9.43s0.27-1.77 4.78-1.77 4.65 1.77 4.65 1.77z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m433.44 603.68h-9.43s0.27-1.77 4.78-1.77 4.65 1.77 4.65 1.77z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m425.11 600.41h-9.43s0.27-1.77 4.78-1.77 4.65 1.77 4.65 1.77z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m799.75 464.74s-58.68 52.53-113.1 50.59l24.11-10.14s6.32 2.1 13.1-1.39l75.89-39.06z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m920.77 515.38l14.11 4.48c2.14 0.68 4.49 0.12 6.09-1.45l12.03-11.77c0.01 0-24.11 9.85-32.23 8.74z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m225.4 459.02s-8.03 5.16-13.35-0.46c0 0-1.74-5.74-12.81 1.59l-34.94 18.05c4.27 19.87 3.8 51.26 3.8 51.26l-28.08-42.29-43.08 16.48s10.95 62.7 20.31 72.63l162.7 3.04c-0.01-0.01-17.31-78.78-54.55-120.3z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m174.53 630.89c0.96-0.29 1.96-0.3 2.91-0.42-1.83-3.06-4.07-6.5-6.76-10.16 10.57 4.01 25.8 8.1 45.61 9.27 1.71 1.47 3.42 2.92 5.13 4.35 0.49 0.1 0.92 0.2 1.27 0.32 1.84 0.6 3.76 0.9 5.69 0.86 3.45-0.08 5.03-0.41 10.76-0.27 8.55 0.21 17.08 1.14 25.63 1.02 8.06-0.11 16.25-1.21 23.57-4.53 0.56-0.25 0.58-1.04 0.03-1.32l-0.47-0.25c-0.77-0.4-0.68-1.53 0.13-1.82 1.21-0.44 2.47-0.75 3.75-0.93 2.01-0.29 2.81-2.75 1.33-4.14-12.51-11.74-26.41-23.65-41.7-35.19-5.12-18.94-12.83-32.93-19.52-42.41 15.15 6.97 26.85 8.95 26.85 8.95s-18.17-46.79-67.58-64.28c-4.1 3.16-7.45 7.14-9.83 11.68 7.61 12.43 17.08 22.02 26.75 29.4 6.26 13.45 4.43 23.43 2.29 28.88-11.98-7.21-24.61-14.05-37.87-20.35-8.91 5.59-15.78 13.76-19.69 23.39 8.69 11.31 17.78 21.92 27.11 31.88-5.86 2.56-17.06 5.39-33.24 0.75-8.45-6.54-18.51-12.46-30.37-16.7l-0.19 0.15c-3.94 3.02-7.15 6.84-9.43 11.2l-0.11 0.21c12.85 20.82 30.87 33.73 46.29 41.55 8.18 1.29 13.78 1.29 21.66-1.09z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m301.74 625.5c0.93 1.27 0.66 3.28-7.79 4.81-0.11 0.02-0.09 0.18 0.02 0.18 4.61-0.33 16.73-1.58 8.16-5.44-0.29-0.13-0.58 0.2-0.39 0.45z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m202.06 634.27c10.52 3.57 42.94 11.95 97.09 3.18 0.37-0.06 0.49 0.48 0.12 0.57-16.55 4.09-63.3 13.27-97.39-3.31-0.27-0.13-0.11-0.54 0.18-0.44z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m208.39 642.34c7.94 2.98 29.79 9.05 66.28 3.74 0.3-0.04 0.38 0.39 0.09 0.46-13.18 2.97-47.56 9.01-66.76-3.43-0.43-0.28-0.09-0.95 0.39-0.77z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m139.86 636.31s48.59 3.11 45.35-3.03c0 0 9.53 9.23-45.35 3.03z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m188.61 492.09s6.76 1.37 11.62 5.11 7.52 5.82 11.46 6.52c3.94 0.69 9.34 4.16 11.7 8.04s5.55 8.83 8.87 10.03 6.79 4.46 7.76 7.68 0.42 5.03 4.58 8.49c4.16 3.47 7.63 5.82 7.76 8.04s6.38 8.21 6.38 8.21-9.1-24.7-34.5-45.5c0 0-16.93-13.85-33.09-18.78l-2.54 2.16z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m172.49 539.54s69.1 31.23 120.62 83.32c0 0 2.42 3.21-1.33 4.14s-10.56-8.27-12.99-10.88-7.84-3.08-12.31-4.85c-2.27-0.9-9.79-8.09-13.84-13.03-4.04-4.94-17.73-7.98-21.74-13.5s-3.01-8.52-9.53-9.03c-6.52-0.5-11.53-9.15-15.29-11.28s-8.27-7.77-14.42-9.15-12.29-10.03-14.54-10.53-4.63-5.21-4.63-5.21z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st13,
        d: "m116.31 578.86s36.27 10.48 61.13 51.62l-2.91 0.42s-5.44-2.19-5.44-5.57-0.35-4.8-2.76-7.11-8.9-4.27-9.65-6.91-4.26-5.88-7.02-5.76-6.39-2.77-8.02-5.78-2.38-5.89-5.77-6.77c-3.38-0.88-5.26-4.76-7.15-5.77-1.88-1-3.62-2.38-7.2-3.26-3.57-0.9-5.21-5.11-5.21-5.11z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m208.07 531.01s12.44 7.61 23.82 14.25c2.97 1.73 7.27 11.67 7.27 11.67s-8.51-5.45-11.07-9.14c-2.57-3.7-5.96-2.46-9.55-5.24-3.59-2.77-5.53-3.69-7.54-3.59l-2.93-7.95z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st3,
        d: "m179.91 594.81s20.39 22.55 36.37 34.78c0 0-6.2-0.19-13.01-1.25-2.08-0.32-3.9-1.28-5.41-2.45-2.99-2.31-5.02-5.66-5.8-9.35-0.72-3.4-2.61-8.91-7.47-11.67-7.34-4.16-4.68-10.06-4.68-10.06z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m200.22 493.5s-6.96 1.46-14.21 15.12l1.45 1.94s4.87-11.25 14.8-16.06l-2.04-1z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m196.95 495.12c0.71 0.37 1.42 0.79 2.11 1.25 1-0.69 2.07-1.33 3.2-1.88l-2.03-0.99c-0.01 0-1.27 0.26-3.28 1.62z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m113.85 600.75s2.71-12.01 15.15-16.46l2.45 1.32s-9.93 2.68-15.96 17.15l-1.64-2.01z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m131.62 585.61c-0.03-0.02-0.06-0.03-0.08-0.05l-2.37-1.27c-1.09 0.39-2.11 0.84-3.05 1.34 0.89 0.47 1.65 0.95 2.41 1.38 1.84-1.06 3.07-1.4 3.09-1.4z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st11,
        d: "m160.94 573.18s7.25-18.85 24.96-27.01l-5.53-2.89-7.88-3.74s-14.72 8.27-19.69 23.39l8.14 10.25z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st12,
        d: "m177.4 544.73c0.93 0.21 2.52 1.8 4.5 3.7 1.35-0.83 2.77-1.6 4.27-2.29-3.67-1.91-6.7-3.42-8.94-4.51l-4.47-2.12s2.38 4.72 4.64 5.22z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: `url(#${a})`,
        d: "m1047.7 360.89h0.68l2.86-40.53c0.12-1.74 0.01-3.49-0.31-5.21-0.35-1.87-0.62-4.89 0.04-8.57 1.14-6.31 1.69-18.01 1.25-21.99-0.32-2.89-0.87-7.93-1.14-10.44-0.11-1.01 0-2.03 0.32-2.99l0.67-2.03c0.32-0.98 0.31-2.06-0.12-3.01-0.03-0.07-0.06-0.14-0.1-0.21-0.27-0.52-0.37-1.11-0.34-1.7l0.19-4.28c0.02-0.47-0.02-0.93-0.14-1.38l-0.47-1.91c-0.15-0.62-0.17-1.27-0.06-1.9l0.53-2.87c0.14-0.76 0-1.55-0.4-2.21l-0.24-0.4c-0.58-0.98-0.82-2.12-0.67-3.25l0.17-1.33c0.07-0.52-0.03-1.04-0.27-1.5l-0.65-1.22c-0.57-1.08-0.76-2.32-0.52-3.52l0.47-2.4c0.13-0.67 0.07-1.37-0.16-2.01l-0.33-0.88c-0.33-0.89-0.48-1.84-0.43-2.79l0.23-4.61c0.05-1.02-0.25-2.02-0.85-2.84-0.64-0.87-0.76-2-0.34-2.99 0.35-0.81 0.28-1.74-0.18-2.49l-0.54-0.87c-0.36-0.58-0.4-1.3-0.12-1.92l0.66-1.43c0.29-0.64 0.29-1.37-0.02-2l-1.64-3.41-4.14-0.98 2.19 4.76c0.36 0.79 0.26 1.72-0.27 2.41-0.45 0.58-0.54 1.36-0.25 2.04l1.06 2.45c0.24 0.56 0.29 1.18 0.13 1.77l-0.37 1.37c-0.23 0.87-0.07 1.8 0.45 2.53l0.03 0.04c0.58 0.81 0.86 1.79 0.81 2.79l-0.15 2.91c-0.07 1.32 0.25 2.64 0.9 3.79l0.46 0.82c0.37 0.66 0.36 1.46-0.04 2.1-0.49 0.8-0.66 1.76-0.45 2.68l1.18 5.28c0.16 0.7 0.12 1.43-0.1 2.11-0.14 0.42-0.14 0.88 0 1.3 0.49 1.5 1.64 5.06 1.64 5.06l-0.14 3.72c-0.02 0.45 0.09 0.9 0.3 1.3 0.56 1.04 0.65 2.26 0.27 3.37l-0.12 0.33c-0.17 0.5-0.22 1.03-0.15 1.55l0.25 1.77c0.05 0.32 0.05 0.65 0.01 0.97l-0.57 4.44c-0.12 0.95-0.05 1.91 0.2 2.83 0.88 3.22 2.87 11.77 2.01 20.32l-1.79 16.29c-0.15 1.36-0.06 2.73 0.27 4.06l0.23 0.92c0.49 2 0.69 4.05 0.58 6.11l-0.38 7.24-1.03 19.65-1.05 12.99z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("polygon", {
        fill: st3,
        points: "1045.3 230.55 1047 226.42 1048.6 229.5 1049.6 219.43 1044.5 220.24"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st19,
        d: "m1043.6 180.97l-0.43 6.06c-0.02 0.33-0.49 0.37-0.57 0.05l-0.2-0.84c-0.06-0.26-0.45-0.22-0.45 0.05v4.94c0 0.29-0.4 0.38-0.52 0.11l-3.29-7.7c-0.13-0.3-0.58-0.16-0.52 0.16l1.6 7.92c0.06 0.3-0.34 0.45-0.5 0.2l-3.41-5.57c-0.17-0.28-0.59-0.08-0.49 0.23l2.02 5.82c0.1 0.29-0.28 0.5-0.47 0.26l-5.13-6.44c-0.2-0.25-0.59-0.01-0.46 0.28l2.66 6.12c0.12 0.27-0.23 0.51-0.44 0.3l-5.64-5.55c-0.24-0.23-0.61 0.08-0.41 0.35l4.94 6.76c0.17 0.24-0.1 0.54-0.35 0.39l-0.74-0.43c-0.28-0.16-0.56 0.2-0.34 0.43l2.24 2.37c0.21 0.22-0.04 0.58-0.32 0.44l-5.5-2.62c-0.29-0.14-0.55 0.25-0.3 0.46l4.9 4.2c0.23 0.2 0.02 0.57-0.27 0.48l-7.94-2.5c-0.32-0.1-0.51 0.35-0.22 0.51l5.66 3.08c0.25 0.14 0.16 0.52-0.13 0.52h-8.03c-0.32 0-0.39 0.45-0.09 0.54l4.97 1.6c0.3 0.1 0.23 0.54-0.09 0.54h-0.38c-0.31 0-0.39 0.44-0.09 0.54l4.97 1.77c0.38 0.13 0.33 0.69-0.07 0.75l-5.12 0.77c-0.45 0.07-0.43 0.73 0.02 0.77l4.39 0.39c0.39 0.04 0.49 0.57 0.13 0.73l-6.77 3.18c-0.41 0.19-0.21 0.82 0.24 0.73l7.02-1.37c0.4-0.08 0.63 0.44 0.31 0.69l-2.36 1.81c-0.35 0.27-0.04 0.83 0.37 0.67l4.95-1.9c0.34-0.13 0.62 0.28 0.39 0.55l-6.85 7.85c-0.26 0.3 0.1 0.73 0.44 0.52l8.54-5.26c0.3-0.19 0.65 0.14 0.49 0.46l-3.09 5.87c-0.19 0.37 0.31 0.71 0.58 0.38l4.02-4.85c0.24-0.28 0.69-0.05 0.6 0.31l-1.19 4.77c-0.1 0.39 0.43 0.61 0.64 0.26l2.28-3.91c0.18-0.31 0.65-0.18 0.65 0.18l-0.1 9.28c0 0.4 0.56 0.49 0.68 0.11l2.3-7.24c0.11-0.36 0.64-0.31 0.68 0.07l0.24 2.18c0.04 0.39 0.59 0.42 0.68 0.04l1.07-4.53c0.08-0.33 0.54-0.36 0.66-0.05l3.54 9.1c0.16 0.42 0.79 0.27 0.75-0.18l-0.65-6.48c-0.04-0.4 0.47-0.59 0.7-0.26l1.41 1.98c0.22 0.31 0.7 0.15 0.7-0.22v-1.22c0-0.39 0.51-0.54 0.72-0.21l3.78 5.95c0.25 0.4 0.86 0.09 0.69-0.35l-3.38-8.75c-0.12-0.3 0.25-0.56 0.49-0.34l2.77 2.49c0.26 0.24 0.65-0.08 0.47-0.39l-1.82-3.04c-0.17-0.29 0.17-0.6 0.44-0.41l6.98 4.96c0.3 0.21 0.65-0.18 0.41-0.45l-4.77-5.56c-0.21-0.25 0.06-0.61 0.36-0.48l7.37 3.19c0.33 0.14 0.6-0.31 0.31-0.53l-7.15-5.45c-0.26-0.2-0.07-0.61 0.25-0.55l3.67 0.78c0.35 0.07 0.52-0.4 0.21-0.57l-4.25-2.37c-0.25-0.14-0.14-0.52 0.14-0.51l11.57 0.32c0.32 0.01 0.39-0.44 0.08-0.53l-12.75-3.67c-0.27-0.08-0.26-0.47 0.02-0.53l5.44-1.06c0.32-0.06 0.28-0.54-0.05-0.54h-0.39c-0.3 0-0.38-0.41-0.1-0.52l4.21-1.74c0.52-0.21 0.33-0.99-0.22-0.95l-6.2 0.46c-0.49 0.04-0.72-0.58-0.34-0.88l5.95-4.61c0.44-0.34 0.07-1.03-0.46-0.85l-4.22 1.43c-0.5 0.17-0.88-0.46-0.49-0.82l0.94-0.88c0.25-0.24-0.03-0.64-0.34-0.48l-4.3 2.23c-0.29 0.15-0.57-0.21-0.36-0.45l6.75-7.96c0.22-0.26-0.1-0.63-0.39-0.44l-8.76 5.67c-0.26 0.17-0.57-0.12-0.42-0.39l4.65-8.4c0.15-0.27-0.21-0.54-0.43-0.32l-4.35 4.44c-0.21 0.21-0.56-0.02-0.44-0.29l3-7.11c0.13-0.3-0.29-0.53-0.47-0.25l-5.35 8.19c-0.48 0.74-1.63 0.33-1.54-0.55l0.57-5.62c0.05-0.47-0.61-0.64-0.79-0.2l-2.77 6.73c-0.08 0.18-0.35 0.14-0.36-0.06l-0.18-4.97c-0.01-0.25-0.36-0.28-0.42-0.04l-0.64 2.72c-0.11 0.45-0.76 0.43-0.84-0.03l-1.22-7.24c-0.04-0.51-0.75-0.48-0.79 0.02z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("circle", {
        fill: st3,
        cx: 1045.9,
        cy: 212.6,
        r: 2.02
      }), /*#__PURE__*/jsxRuntimeExports.jsx("polygon", {
        fill: st3,
        points: "1047.2 209.2 1044.6 209.2 1043.9 195.71 1047.9 195.71"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1282.7 654.07c0.04 0.07 0.11 0.14 0.2 0.21-0.26-0.35-0.38-0.5-0.2-0.21z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1317.2 646.76c0.05 0.08 0.12 0.15 0.22 0.24-0.29-0.4-0.43-0.57-0.22-0.24z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1242.9 666.12c0.06 0.05 0.15 0.1 0.25 0.14-0.35-0.25-0.52-0.35-0.25-0.14z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1373.8 661.19c0.04 0.07 0.11 0.14 0.2 0.21-0.26-0.35-0.38-0.51-0.2-0.21z"
      }), /*#__PURE__*/jsxRuntimeExports.jsx("path", {
        fill: st1,
        d: "m1334 673.24c0.06 0.05 0.15 0.1 0.25 0.14-0.35-0.25-0.51-0.36-0.25-0.14z"
      })]
    })]
  });
};

const useDialog = (visible, onClose = () => undefined) => {
  const dialogRef = require$$0$1.useRef(null);
  const onCloseRef = require$$0$1.useRef();
  require$$0$1.useEffect(() => {
    onCloseRef.current = onClose;
  });
  require$$0$1.useEffect(() => {
    const dialog = dialogRef.current;
    const onClose = onCloseRef.current;
    if (!dialog) {
      return;
    }
    if (!visible) {
      dialog.close();
      return;
    }
    dialog.showModal();
    dialog.onclose = () => {
      dialog.close();
      onClose === null || onClose === void 0 || onClose();
    };
    dialog.onclick = ({
      clientX,
      clientY
    }) => {
      const {
        left,
        top,
        width,
        height
      } = dialog.getBoundingClientRect();
      const isInDialog = top <= clientY && clientY <= top + height && left <= clientX && clientX <= left + width;
      if (!isInDialog) {
        dialog.close();
      }
    };
  }, [visible]);
  return dialogRef;
};

const Wrapper = styled__default.default.dialog`
  z-index: 1000;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  cursor: default;
  user-select: none;
  border: 0;
  background-color: transparent;
  max-height: 90vh;

  &:not([open]) {
    display: none;
  }
`;

const Dialog = ({
  children,
  isVisible = false,
  onClose
}) => {
  const dialogRef = useDialog(isVisible, onClose);
  return /*#__PURE__*/jsxRuntimeExports.jsx(Wrapper, {
    ref: dialogRef,
    children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Scrollable, {
      children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Tile, {
        elevation: "2",
        padding: "x32",
        display: "flex",
        flexDirection: "column",
        children: children
      })
    })
  });
};

const desktopCapturer = {
  getSources: opts => electron.ipcRenderer.invoke('desktop-capturer-get-sources', [opts])
};
function ScreenSharePicker() {
  const {
    t
  } = reactI18next.useTranslation();
  const [visible, setVisible] = require$$0$1.useState(false);
  const [sources, setSources] = require$$0$1.useState([]);
  const [currentTab, setCurrentTab] = require$$0$1.useState('screen');
  const [selectedSourceId, setSelectedSourceId] = require$$0$1.useState(null);
  const [isScreenRecordingPermissionGranted, setIsScreenRecordingPermissionGranted] = require$$0$1.useState(false);
  const fetchSources = require$$0$1.useCallback(async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen']
      });

      // Filter out sources that are not capturable
      const filteredSources = sources.filter(source => {
        // Only check for basic validity - thumbnail validation is already done by IPC handler
        if (!source.name || source.name.trim() === '') {
          return false;
        }
        return true;
      }).sort((a, b) => a.name.localeCompare(b.name));
      setSources(filteredSources);

      // If the currently selected source is no longer available, clear the selection
      if (selectedSourceId && !filteredSources.find(s => s.id === selectedSourceId)) {
        console.log('Previously selected source no longer available, clearing selection');
        setSelectedSourceId(null);
      }
    } catch (error) {
      console.error('Error fetching screen sharing sources:', error);
      setSources([]);
    }
  }, [selectedSourceId]);
  require$$0$1.useEffect(() => {
    const checkScreenRecordingPermission = async () => {
      const result = await electron.ipcRenderer.invoke('video-call-window/screen-recording-is-permission-granted');
      setIsScreenRecordingPermissionGranted(result);
    };
    checkScreenRecordingPermission().catch(console.error);
  }, [visible]);
  require$$0$1.useEffect(() => {
    fetchSources();
  }, [fetchSources]);
  require$$0$1.useEffect(() => {
    electron.ipcRenderer.on('video-call-window/open-screen-picker', () => {
      setVisible(true);
    });
  }, [visible]);
  require$$0$1.useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const timer = setInterval(() => {
      fetchSources();
    }, 3000);
    return () => {
      clearInterval(timer);
    };
  }, [visible, fetchSources]);
  const handleScreenSharingSourceClick = id => () => {
    setSelectedSourceId(id);
  };
  const handleShare = () => {
    if (selectedSourceId) {
      // Validate that the selected source still exists in our current sources list
      const selectedSource = sources.find(s => s.id === selectedSourceId);
      if (!selectedSource) {
        console.error('Selected source no longer available:', selectedSourceId);
        // Refresh sources and clear selection
        fetchSources();
        setSelectedSourceId(null);
        return;
      }

      // Additional validation before sharing
      if (selectedSource.thumbnail.isEmpty()) {
        console.error('Selected source has empty thumbnail, cannot share:', selectedSourceId);
        setSelectedSourceId(null);
        return;
      }
      console.log('Sharing screen source:', {
        id: selectedSource.id,
        name: selectedSource.name
      });
      setVisible(false);
      electron.ipcRenderer.send('video-call-window/screen-sharing-source-responded', selectedSourceId);
    }
  };
  const handleClose = () => {
    setVisible(false);
    electron.ipcRenderer.send('video-call-window/screen-sharing-source-responded', null);
  };

  // Filter sources based on the current tab
  const filteredSources = sources.filter(source => {
    if (currentTab === 'screen') {
      return source.id.includes('screen');
    }
    return source.id.includes('window');
  });
  return /*#__PURE__*/jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.PaletteStyleTag, {
      theme: "dark",
      selector: ":root"
    }), /*#__PURE__*/jsxRuntimeExports.jsx(Dialog, {
      isVisible: visible,
      onClose: handleClose,
      children: /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
        width: "680px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        height: "560px",
        backgroundColor: "surface",
        color: "default",
        children: [/*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
          marginBlockEnd: "x12",
          children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
            fontScale: "h1",
            marginBlockEnd: "x12",
            children: t('screenSharing.title')
          }), /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Tabs, {
            children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Tabs.Item, {
              selected: currentTab === 'screen',
              onClick: () => setCurrentTab('screen'),
              children: t('screenSharing.entireScreen')
            }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Tabs.Item, {
              selected: currentTab === 'window',
              onClick: () => setCurrentTab('window'),
              children: t('screenSharing.applicationWindow')
            })]
          })]
        }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          marginBlockStart: "x10",
          marginBlockEnd: "x10",
          flexGrow: 1,
          children: !isScreenRecordingPermissionGranted ? /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Callout, {
            title: t('screenSharing.permissionDenied'),
            type: "danger",
            margin: "x32",
            children: [t('screenSharing.permissionRequired'), /*#__PURE__*/jsxRuntimeExports.jsx("br", {}), t('screenSharing.permissionInstructions')]
          }) : /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Scrollable, {
            vertical: true,
            children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
              padding: "x8",
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, 208px)',
                gap: '16px',
                justifyContent: 'center'
              },
              children: filteredSources.length === 0 ? /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                p: "x16",
                style: {
                  gridColumn: '1 / -1'
                },
                children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Label, {
                  children: currentTab === 'screen' ? t('screenSharing.noScreensFound') : t('screenSharing.noWindowsFound')
                })
              }) : filteredSources.map(({
                id,
                name,
                thumbnail
              }) => /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
                width: "x208",
                height: "x170",
                display: "flex",
                flexDirection: "column",
                onClick: handleScreenSharingSourceClick(id),
                bg: selectedSourceId === id ? 'selected' : 'light',
                color: selectedSourceId === id ? 'selected' : 'light',
                border: selectedSourceId === id ? '2px solid var(--rcx-color-stroke-highlight)' : '1px solid var(--rcx-color-stroke-light)',
                borderRadius: "x2",
                cursor: "pointer",
                className: "screen-share-thumbnail",
                style: {
                  position: 'relative',
                  overflow: 'visible'
                },
                children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                  style: {
                    minHeight: '120px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  },
                  children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                    is: "img",
                    src: thumbnail.toDataURL(),
                    alt: name,
                    style: {
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      objectPosition: 'top',
                      display: 'block'
                    }
                  })
                }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                  p: "x4",
                  style: {
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                    minHeight: 'auto'
                  },
                  children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Label, {
                    title: name,
                    style: {
                      fontSize: '11px',
                      lineHeight: '1.2',
                      color: 'white',
                      textAlign: 'center',
                      width: '100%',
                      margin: 0,
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    },
                    children: name
                  })
                })]
              }, id))
            })
          })
        }), /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
          display: "flex",
          justifyContent: "space-between",
          marginBlockStart: "auto",
          children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Button, {
            onClick: handleClose,
            children: t('screenSharing.cancel')
          }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Button, {
            primary: true,
            onClick: handleShare,
            disabled: !selectedSourceId,
            children: t('screenSharing.share')
          })]
        })]
      })
    })]
  });
}

const MAX_RECOVERY_ATTEMPTS = 3;
const LOADING_TIMEOUT_MS = 15000;
const LOADING_SHOW_DELAY = 500; // Delay before showing loading spinner to prevent quick flashes
const ERROR_SHOW_DELAY = 800; // Delay before showing error to prevent flicker during retries

const RECOVERY_DELAYS = {
  webviewReload: 1000,
  urlRefresh: 2000,
  fullReinitialize: 3000
};
const RECOVERY_STRATEGIES = {
  webviewReload: 'Webview reload',
  urlRefresh: 'URL refresh',
  fullReinitialize: 'Full reinitialize'
};
const VideoCallWindow = () => {
  const {
    t
  } = reactI18next.useTranslation();
  const [videoCallUrl, setVideoCallUrl] = require$$0$1.useState('');
  const [shouldAutoOpenDevtools, setShouldAutoOpenDevtools] = require$$0$1.useState(false);
  const [isFailed, setIsFailed] = require$$0$1.useState(false);
  const [isReloading, setIsReloading] = require$$0$1.useState(false);
  const [isLoading, setIsLoading] = require$$0$1.useState(false); // Keep for internal state logic
  const [showLoading, setShowLoading] = require$$0$1.useState(false); // Delayed loading display
  const [showError, setShowError] = require$$0$1.useState(false); // Delayed error display
  const [errorMessage, setErrorMessage] = require$$0$1.useState(null);
  const [recoveryAttempt, setRecoveryAttempt] = require$$0$1.useState(0);
  const webviewRef = require$$0$1.useRef(null);
  const loadingTimeoutRef = require$$0$1.useRef(null);
  const recoveryTimeoutRef = require$$0$1.useRef(null);
  const loadingDisplayTimeoutRef = require$$0$1.useRef(null);
  const errorDisplayTimeoutRef = require$$0$1.useRef(null);
  const resetRecoveryState = () => {
    setRecoveryAttempt(0);
  };
  require$$0$1.useEffect(() => {
    // Listen for URL received events from bootstrap
    const handleUrlReceived = async event => {
      const customEvent = event;
      const {
        url,
        autoOpenDevtools
      } = customEvent.detail;
      console.log('VideoCallWindow: Received URL event:', url, 'Auto-open devtools:', autoOpenDevtools);

      // Reset states for new URL
      setIsFailed(false);
      setIsReloading(false);
      setIsLoading(true);
      setErrorMessage(null);
      setVideoCallUrl(url);
      setShouldAutoOpenDevtools(autoOpenDevtools);

      // Confirm URL received
      try {
        await invokeWithRetry('video-call-window/url-received', {
          maxAttempts: 2,
          retryDelay: 500,
          logRetries: "development" === 'development'
        });
        if ("development" === 'development') {
          console.log('VideoCallWindow: URL received confirmation acknowledged by main process');
        }
      } catch (error) {
        console.error('VideoCallWindow: Failed to send URL received confirmation:', error);
      }
    };

    // Add event listener for URL events
    window.addEventListener('video-call-url-received', handleUrlReceived);
    const handleOpenUrl = async (_event, url, autoOpenDevtools = false) => {
      console.log('VideoCallWindow: Received new URL via IPC:', url, 'Auto-open devtools:', autoOpenDevtools);

      // Reset states for new URL
      setIsFailed(false);
      setIsReloading(false);
      setIsLoading(true);
      setErrorMessage(null);
      setVideoCallUrl(url);
      setShouldAutoOpenDevtools(autoOpenDevtools);

      // Confirm URL received
      try {
        await invokeWithRetry('video-call-window/url-received', {
          maxAttempts: 2,
          retryDelay: 500,
          logRetries: "development" === 'development'
        });
        if ("development" === 'development') {
          console.log('VideoCallWindow: URL received confirmation acknowledged by main process');
        }
      } catch (error) {
        console.error('VideoCallWindow: Failed to send URL received confirmation:', error);
      }
    };

    // Keep IPC listener for potential future direct calls
    electron.ipcRenderer.removeAllListeners('video-call-window/open-url');
    electron.ipcRenderer.on('video-call-window/open-url', handleOpenUrl);
    return () => {
      electron.ipcRenderer.removeAllListeners('video-call-window/open-url');
      window.removeEventListener('video-call-url-received', handleUrlReceived);
    };
  }, []);
  require$$0$1.useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || !videoCallUrl) return;
    console.log('VideoCallWindow: Setting up webview event handlers for URL:', videoCallUrl);

    // Auto-recovery function that tries different strategies
    const attemptAutoRecovery = () => {
      if (recoveryAttempt >= MAX_RECOVERY_ATTEMPTS) {
        {
          console.log('VideoCallWindow: Max recovery attempts reached, showing error');
        }
        setIsFailed(true);
        setIsLoading(false);
        setIsReloading(false);
        setErrorMessage(t('videoCall.error.maxRetriesReached', 'Failed to load after multiple attempts'));
        return;
      }
      const currentAttempt = recoveryAttempt + 1;
      setRecoveryAttempt(currentAttempt);
      const getRecoveryConfig = attempt => {
        switch (attempt) {
          case 1:
            return {
              strategy: RECOVERY_STRATEGIES.webviewReload,
              delay: RECOVERY_DELAYS.webviewReload
            };
          case 2:
            return {
              strategy: RECOVERY_STRATEGIES.urlRefresh,
              delay: RECOVERY_DELAYS.urlRefresh
            };
          case 3:
            return {
              strategy: RECOVERY_STRATEGIES.fullReinitialize,
              delay: RECOVERY_DELAYS.fullReinitialize
            };
          default:
            return null;
        }
      };
      const config = getRecoveryConfig(currentAttempt);
      if (!config) return;
      setIsReloading(true);
      {
        console.log(`VideoCallWindow: Auto-recovery attempt ${currentAttempt}/${MAX_RECOVERY_ATTEMPTS} - ${config.strategy}`);
      }
      recoveryTimeoutRef.current = setTimeout(() => {
        const webview = webviewRef.current;
        switch (currentAttempt) {
          case 1:
            if (webview) {
              webview.reload();
            }
            break;
          case 2:
            if (webview && videoCallUrl) {
              webview.src = 'about:blank';
              setTimeout(() => {
                webview.src = videoCallUrl;
              }, 500);
            }
            break;
          case 3:
            window.location.reload();
            break;
        }
        recoveryTimeoutRef.current = null;
      }, config.delay);
    };
    const checkForClosePage = async url => {
      if (url.includes('/close.html') || url.includes('/close2.html')) {
        console.log('VideoCallWindow: Close page detected, scheduling window close:', url);

        // Add delay to prevent crash during navigation to close2.html
        // This allows the webview to complete the navigation before window destruction
        setTimeout(async () => {
          try {
            await invokeWithRetry('video-call-window/close-requested', {
              maxAttempts: 2,
              retryDelay: 500,
              logRetries: "development" === 'development'
            });
            if ("development" === 'development') {
              console.log('VideoCallWindow: Close request confirmed by main process');
            }
          } catch (error) {
            console.error('VideoCallWindow: Failed to send close request:', error);
          }
        }, 1000); // 1 second delay to let navigation complete and prevent crash
      }
    };
    const handleLoadStart = () => {
      console.log('VideoCallWindow: Load started');
      setIsFailed(false);
      setIsReloading(false);
      setIsLoading(true);
      setShowError(false);

      // Clear any pending display timeouts
      if (loadingDisplayTimeoutRef.current) {
        clearTimeout(loadingDisplayTimeoutRef.current);
        loadingDisplayTimeoutRef.current = null;
      }
      if (errorDisplayTimeoutRef.current) {
        clearTimeout(errorDisplayTimeoutRef.current);
        errorDisplayTimeoutRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }

      // Delay showing loading spinner to prevent quick flashes
      loadingDisplayTimeoutRef.current = setTimeout(() => {
        // Only show loading if we're still actually loading (not finished)
        if (isLoading && !isFailed) {
          console.log('VideoCallWindow: Showing loading spinner after delay');
          setShowLoading(true);
        } else {
          console.log('VideoCallWindow: Skipping loading spinner - already finished loading');
        }
        loadingDisplayTimeoutRef.current = null;
      }, LOADING_SHOW_DELAY);
      invokeWithRetry('video-call-window/webview-loading', {
        maxAttempts: 2,
        retryDelay: 500,
        logRetries: "development" === 'development'
      }).then(() => {
        {
          console.log('VideoCallWindow: Webview loading state confirmed by main process');
        }
      }).catch(error => {
        console.error('VideoCallWindow: Failed to send webview loading state:', error);
      });
      loadingTimeoutRef.current = setTimeout(() => {
        {
          console.log('VideoCallWindow: Loading timeout reached - starting auto-recovery');
        }
        loadingTimeoutRef.current = null;
        attemptAutoRecovery();
      }, LOADING_TIMEOUT_MS);
    };
    const handleNavigate = event => {
      console.log('VideoCallWindow: Navigation event:', event.url);
      checkForClosePage(event.url);
    };
    const handleDomReady = () => {
      console.log('VideoCallWindow: Webview DOM ready');
      if (shouldAutoOpenDevtools) {
        console.log('VideoCallWindow: Auto-opening devtools for webview');
        invokeWithRetry('video-call-window/open-webview-dev-tools', {
          maxAttempts: 2,
          retryDelay: 500,
          logRetries: "development" === 'development'
        }).then(success => {
          if (success) {
            console.log('VideoCallWindow: Successfully auto-opened devtools');
          } else {
            console.warn('VideoCallWindow: Failed to auto-open devtools');
          }
        }).catch(error => {
          console.error('VideoCallWindow: Error auto-opening devtools:', error);
        });
      }
    };
    const handleFinishLoad = () => {
      console.log('VideoCallWindow: Webview finished loading (all resources loaded)');
      resetRecoveryState();

      // Clear pending loading display timeout if it hasn't fired yet
      if (loadingDisplayTimeoutRef.current) {
        clearTimeout(loadingDisplayTimeoutRef.current);
        loadingDisplayTimeoutRef.current = null;
      }

      // Hide loading immediately on success to make it feel snappy
      setIsLoading(false);
      setShowLoading(false);
      setIsFailed(false);
      setShowError(false);
      invokeWithRetry('video-call-window/webview-ready', {
        maxAttempts: 2,
        retryDelay: 500,
        logRetries: "development" === 'development'
      }).then(() => {
        {
          console.log('VideoCallWindow: Webview ready state confirmed by main process');
        }
      }).catch(error => {
        console.error('VideoCallWindow: Failed to send webview ready state:', error);
      });
    };
    const handleStopLoading = () => {
      console.log('VideoCallWindow: Webview stopped loading');
      if (!isFailed) {
        // Don't immediately hide loading on stop-loading, let finish-load handle it
        // This prevents flicker when both events fire quickly
        console.log('VideoCallWindow: Waiting for finish-load to complete transition');
      }
    };
    const handleDidFailLoad = event => {
      const errorInfo = {
        errorCode: event.errorCode,
        errorDescription: event.errorDescription,
        validatedURL: event.validatedURL,
        isMainFrame: event.isMainFrame
      };
      console.error('VideoCallWindow: Webview failed to load:', errorInfo);
      if (event.isMainFrame) {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        // Clear pending loading display
        if (loadingDisplayTimeoutRef.current) {
          clearTimeout(loadingDisplayTimeoutRef.current);
          loadingDisplayTimeoutRef.current = null;
        }
        setIsLoading(false);
        setShowLoading(false);
        setIsReloading(false);
        setIsFailed(true);
        setErrorMessage(`${event.errorDescription} (${event.errorCode})`);

        // Delay showing error to prevent flicker during quick retry attempts
        errorDisplayTimeoutRef.current = setTimeout(() => {
          // Only show error if we're still in failed state (not recovered)
          if (isFailed && !isLoading) {
            console.log('VideoCallWindow: Showing error screen after delay');
            setShowError(true);
          } else {
            console.log('VideoCallWindow: Skipping error screen - state recovered');
          }
          errorDisplayTimeoutRef.current = null;
        }, ERROR_SHOW_DELAY);
        electron.ipcRenderer.invoke('video-call-window/webview-failed', `${event.errorDescription} (${event.errorCode})`).then(result => {
          if (result !== null && result !== void 0 && result.success && "development" === 'development') {
            console.log('VideoCallWindow: Webview failed state confirmed by main process');
          } else if (!(result !== null && result !== void 0 && result.success)) {
            console.warn('VideoCallWindow: Main process did not confirm webview failed state');
          }
        }).catch(error => {
          console.error('VideoCallWindow: Failed to send webview failed state:', error);
        });
      }
    };
    const handleCrashed = () => {
      console.error('VideoCallWindow: Webview crashed');
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // Clear pending loading display
      if (loadingDisplayTimeoutRef.current) {
        clearTimeout(loadingDisplayTimeoutRef.current);
        loadingDisplayTimeoutRef.current = null;
      }
      setIsLoading(false);
      setShowLoading(false);
      setIsReloading(false);
      setIsFailed(true);
      setErrorMessage(t('videoCall.error.crashed'));

      // Show error immediately for crashes (more serious than load failures)
      setShowError(true);
      invokeWithRetry('video-call-window/webview-failed', {
        maxAttempts: 2,
        retryDelay: 500,
        logRetries: "development" === 'development'
      }, 'Webview crashed').then(() => {
        {
          console.log('VideoCallWindow: Webview crashed state confirmed by main process');
        }
      }).catch(error => {
        console.error('VideoCallWindow: Failed to send webview failed state:', error);
      });
    };
    const handleWebviewAttached = () => {
      console.log('VideoCallWindow: Webview attached');
      invokeWithRetry('video-call-window/webview-created', {
        maxAttempts: 2,
        retryDelay: 500,
        logRetries: "development" === 'development'
      }).then(() => {
        {
          console.log('VideoCallWindow: Webview created state confirmed by main process');
        }
      }).catch(error => {
        console.error('VideoCallWindow: Failed to send webview created state:', error);
      });
      if (shouldAutoOpenDevtools) {
        console.log('VideoCallWindow: Auto-opening devtools immediately on webview attach');
        setTimeout(() => {
          invokeWithRetry('video-call-window/open-webview-dev-tools', {
            maxAttempts: 2,
            retryDelay: 500,
            logRetries: "development" === 'development'
          }).then(success => {
            if (success) {
              console.log('VideoCallWindow: Successfully auto-opened devtools on attach');
            } else {
              console.warn('VideoCallWindow: Failed to auto-open devtools on attach, will retry on dom-ready');
            }
          }).catch(error => {
            console.error('VideoCallWindow: Error auto-opening devtools on attach:', error);
          });
        }, 100);
      }
    };

    // Add event listeners
    webview.addEventListener('webview-attached', handleWebviewAttached);
    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-navigate', handleNavigate);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('did-finish-load', handleFinishLoad);
    webview.addEventListener('did-fail-load', handleDidFailLoad);
    webview.addEventListener('crashed', handleCrashed);
    webview.addEventListener('did-stop-loading', handleStopLoading);
    return () => {
      webview.removeEventListener('webview-attached', handleWebviewAttached);
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-navigate', handleNavigate);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('did-finish-load', handleFinishLoad);
      webview.removeEventListener('did-fail-load', handleDidFailLoad);
      webview.removeEventListener('crashed', handleCrashed);
      webview.removeEventListener('did-stop-loading', handleStopLoading);

      // Clean up all timeout references
      [loadingTimeoutRef, recoveryTimeoutRef, loadingDisplayTimeoutRef, errorDisplayTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });
    };
  }, [videoCallUrl, shouldAutoOpenDevtools, isFailed, isLoading, recoveryAttempt, t]);
  const handleReload = () => {
    console.log('VideoCallWindow: Manual reload requested');
    setIsReloading(true);
    setIsFailed(false);
    setIsLoading(true);
    setErrorMessage(null);
    resetRecoveryState();
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
    const webview = webviewRef.current;
    if (webview) {
      webview.reload();
    }
  };

  // Don't render webview until we have a URL
  if (!videoCallUrl) {
    return /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
      children: [/*#__PURE__*/jsxRuntimeExports.jsx(ScreenSharePicker, {}), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        style: {
          backgroundColor: '#2f343d'
        },
        children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
          fontScale: "h3",
          color: "pure-white",
          children: t('videoCall.loading.initial')
        })
      })]
    });
  }
  return /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
    children: [/*#__PURE__*/jsxRuntimeExports.jsx(ScreenSharePicker, {}), showLoading && !showError && /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#2f343d'
      },
      children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
        color: "pure-white",
        children: /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Margins, {
            block: "x12",
            children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Throbber, {
              inheritColor: true,
              size: "x16"
            })
          }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
            fontScale: "h3",
            textAlign: "center",
            children: isReloading ? t('videoCall.loading.reloading') : t('videoCall.loading.initial')
          }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
            fontScale: "h4",
            textAlign: "center",
            mbs: "x8",
            children: t('videoCall.loading.description')
          })]
        })
      })
    }), showError && /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      style: {
        position: 'absolute',
        top: 0,
        left: 0
      },
      children: [/*#__PURE__*/jsxRuntimeExports.jsx(FailureImage, {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }
      }), /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Box, {
        is: "section",
        color: "pure-white",
        zIndex: 1,
        children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Margins, {
          block: "x12",
          children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            children: /*#__PURE__*/jsxRuntimeExports.jsxs(fuselage.Margins, {
              block: "x8",
              inline: "auto",
              children: [/*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                fontScale: "h1",
                textAlign: "center",
                children: t('videoCall.error.title')
              }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                fontScale: "h3",
                textAlign: "center",
                children: t('videoCall.error.announcement')
              }), errorMessage && /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
                fontScale: "h4",
                color: "pure-white",
                textAlign: "center",
                mbs: "x8",
                children: errorMessage
              })]
            })
          })
        }), /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Box, {
          display: "flex",
          justifyContent: "center",
          children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.ButtonGroup, {
            align: "center",
            children: /*#__PURE__*/jsxRuntimeExports.jsx(fuselage.Button, {
              primary: true,
              onClick: handleReload,
              children: t('videoCall.error.reload')
            })
          })
        })]
      })]
    }), /*#__PURE__*/jsxRuntimeExports.jsx("webview", {
      ref: webviewRef,
      src: videoCallUrl,
      preload: path__default.default.join(__dirname, 'preload', 'index.js'),
      webpreferences: "nodeIntegration,nativeWindowOpen=true",
      allowpopups: 'true',
      partition: "persist:jitsi-session",
      style: {
        width: '100%',
        height: '100%',
        display: showError || showLoading ? 'none' : 'flex'
      }
    })]
  });
};

let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 10;
let isWindowDestroying = false;
let reactRoot = null;
const setupI18n = async () => {
  try {
    const lng = fallbackLng;
    await i18next__default.default.use(reactI18next.initReactI18next).init({
      lng,
      fallbackLng,
      resources: {
        [fallbackLng]: {
          translation: await resources[fallbackLng]()
        }
      },
      interpolation,
      initImmediate: true
    });
    if ("development" === 'development') {
      console.log('Video call window i18n initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize i18n for video call window:', error);
    throw error;
  }
};
const showFallbackUI = () => {
  const fallbackContainer = document.createElement('div');
  fallbackContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2f343d;
    color: white;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
    z-index: 9999;
  `;
  fallbackContainer.innerHTML = `
    <div style="text-align: center;">
      <h2 style="color: #fff; margin: 0;">Video Call Unavailable</h2>
      <p style="color: #ccc; margin: 10px 0;">Unable to initialize video call window</p>
      <p style="color: #999; margin: 10px 0; font-size: 14px;">Retrying automatically in 3 seconds...</p>
    </div>
  `;
  document.body.appendChild(fallbackContainer);
  {
    console.error('Video call window: Showing fallback UI after failed initialization, will auto-reload in 3 seconds');
  }

  // Auto-reload after 3 seconds
  setTimeout(() => {
    {
      console.log('Video call window: Auto-reloading after fallback UI timeout');
    }
    window.location.reload();
  }, 3000);
};
const triggerURLEvent = (url, autoOpenDevtools) => {
  const event = new CustomEvent('video-call-url-received', {
    detail: {
      url,
      autoOpenDevtools
    }
  });
  window.dispatchEvent(event);
};
const start = async () => {
  if (isWindowDestroying) {
    console.log('Video call window: Skipping initialization - window is being destroyed');
    return;
  }
  initAttempts++;
  if (initAttempts > 1 || "development" === 'development') {
    console.log(`Video call window initialization attempt ${initAttempts}/${MAX_INIT_ATTEMPTS}`);
  }
  try {
    // Wait for DOM if not ready
    if (document.readyState === 'loading') {
      if ("development" === 'development') {
        console.log('Video call window: DOM not ready, waiting...');
      }
      return new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', () => {
          if ("development" === 'development') {
            console.log('Video call window: DOM ready, continuing initialization');
          }
          start().then(resolve).catch(resolve);
        });
      });
    }

    // Initialize React app
    await setupI18n();
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    if ("development" === 'development') {
      console.log('Video call window: Creating React root and rendering');
    }

    // Clean up existing root if it exists
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
    }

    // Clear the root element to avoid React warnings
    rootElement.innerHTML = '';
    reactRoot = createRoot(rootElement);
    reactRoot.render(/*#__PURE__*/jsxRuntimeExports.jsx(reactI18next.I18nextProvider, {
      i18n: i18next__default.default,
      children: /*#__PURE__*/jsxRuntimeExports.jsx(VideoCallWindow, {})
    }));

    // IPC Handshake with retry
    if ("development" === 'development') {
      console.log('Video call window: Testing IPC handshake...');
    }
    const handshakeRetryOptions = {
      maxAttempts: 3,
      retryDelay: 1000,
      logRetries: "development" === 'development'
    };
    await invokeWithRetry('video-call-window/handshake', handshakeRetryOptions);
    if ("development" === 'development') {
      console.log('Video call window: IPC handshake successful');
    }

    // Signal renderer ready
    console.log('Video call window: Signaling renderer ready state');
    await invokeWithRetry('video-call-window/renderer-ready', handshakeRetryOptions);
    if ("development" === 'development') {
      console.log('Video call window: Renderer ready, requesting URL');
    }

    // Request URL with custom retry logic
    const urlRetryOptions = {
      maxAttempts: 5,
      // Increased from 3
      retryDelay: 2000,
      // Increased from 1000ms
      logRetries: "development" === 'development',
      shouldRetry: (error, attempt) => {
        // Retry on IPC errors or if result indicates no URL yet
        const isIPCError = error.message.includes('IPC call failed');
        const isNoURLYet = error.message.includes('success: false');
        if ("development" === 'development') {
          console.log(`Video call window: URL request attempt ${attempt} failed:`, {
            error: error.message,
            isIPCError,
            isNoURLYet,
            willRetry: isIPCError || isNoURLYet
          });
        }
        return isIPCError || isNoURLYet;
      }
    };
    let urlRequestResult;
    try {
      urlRequestResult = await invokeWithRetry('video-call-window/request-url', urlRetryOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Video call window: Failed to get URL after all retries:', error);
      throw new Error(`Failed to get video call URL: ${errorMessage}`);
    }
    if ("development" === 'development') {
      console.log('Video call window: URL received:', urlRequestResult);
    }

    // Trigger URL event for VideoCallWindow component
    if (urlRequestResult.url) {
      triggerURLEvent(urlRequestResult.url, urlRequestResult.autoOpenDevtools);
    } else {
      throw new Error('No URL received from main process');
    }
    if (initAttempts === 1 && "development" !== 'development') {
      console.log('Video call window: Successfully initialized');
    } else if ("development" === 'development') {
      console.log('Video call window: Successfully initialized and rendered');
    }
  } catch (error) {
    console.error(`Video call window initialization failed (attempt ${initAttempts}):`, error);
    if (initAttempts < MAX_INIT_ATTEMPTS && !isWindowDestroying) {
      console.log('Video call window: Retrying initialization in 1 second...');
      setTimeout(() => {
        if (!isWindowDestroying) {
          start().catch(retryError => {
            console.error('Video call window retry also failed:', retryError);
          });
        }
      }, 1000);
    } else if (!isWindowDestroying) {
      console.error('Video call window: Max initialization attempts reached, showing fallback UI');
      showFallbackUI();
    }
  }
};

// Global error handlers
window.addEventListener('error', event => {
  console.error('Video call window global error:', event.error);
});
window.addEventListener('unhandledrejection', event => {
  console.error('Video call window unhandled rejection:', event.reason);
  event.preventDefault();
});

// Window lifecycle management
window.addEventListener('beforeunload', () => {
  isWindowDestroying = true;
  {
    console.log('Video call window: Window unloading, stopping retries');
  }

  // Clean up React root
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
});

// Start initialization
{
  console.log('Video call window: Starting initialization...');
}
start().catch(error => {
  console.error('Video call window: Fatal initialization error:', error);
  showFallbackUI();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8tY2FsbC13aW5kb3cuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9yZWFjdC1kb20vY2xpZW50LmpzIiwiLi4vc3JjL2kxOG4vY29tbW9uLnRzIiwiLi4vc3JjL2kxOG4vcmVzb3VyY2VzLnRzIiwiLi4vc3JjL2lwYy9yZW5kZXJlci50cyIsIi4uL25vZGVfbW9kdWxlcy9yZWFjdC9janMvcmVhY3QtanN4LXJ1bnRpbWUuZGV2ZWxvcG1lbnQuanMiLCIuLi9ub2RlX21vZHVsZXMvcmVhY3QvanN4LXJ1bnRpbWUuanMiLCIuLi9zcmMvdWkvY29tcG9uZW50cy9GYWlsdXJlSW1hZ2UudHN4IiwiLi4vc3JjL3VpL2NvbXBvbmVudHMvRGlhbG9nL2hvb2tzLnRzIiwiLi4vc3JjL3VpL2NvbXBvbmVudHMvRGlhbG9nL3N0eWxlcy50c3giLCIuLi9zcmMvdWkvY29tcG9uZW50cy9EaWFsb2cvaW5kZXgudHN4IiwiLi4vc3JjL3ZpZGVvQ2FsbFdpbmRvdy9zY3JlZW5TaGFyZVBpY2tlci50c3giLCIuLi9zcmMvdmlkZW9DYWxsV2luZG93L3ZpZGVvQ2FsbFdpbmRvdy50c3giLCIuLi9zcmMvdmlkZW9DYWxsV2luZG93L3ZpZGVvLWNhbGwtd2luZG93LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBleHBvcnRzLmNyZWF0ZVJvb3QgPSBtLmNyZWF0ZVJvb3Q7XG4gIGV4cG9ydHMuaHlkcmF0ZVJvb3QgPSBtLmh5ZHJhdGVSb290O1xufSBlbHNlIHtcbiAgdmFyIGkgPSBtLl9fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVEO1xuICBleHBvcnRzLmNyZWF0ZVJvb3QgPSBmdW5jdGlvbihjLCBvKSB7XG4gICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbS5jcmVhdGVSb290KGMsIG8pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbiAgZXhwb3J0cy5oeWRyYXRlUm9vdCA9IGZ1bmN0aW9uKGMsIGgsIG8pIHtcbiAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBtLmh5ZHJhdGVSb290KGMsIGgsIG8pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB0eXBlIHsgSW5pdE9wdGlvbnMgfSBmcm9tICdpMThuZXh0JztcblxuZXhwb3J0IGNvbnN0IGZhbGxiYWNrTG5nID0gJ2VuJyBhcyBjb25zdDtcblxuY29uc3QgYnl0ZVVuaXRzID0gW1xuICAnYnl0ZScsXG4gICdraWxvYnl0ZScsXG4gICdtZWdhYnl0ZScsXG4gICdnaWdhYnl0ZScsXG4gICd0ZXJhYnl0ZScsXG4gICdwZXRhYnl0ZScsXG5dO1xuXG5jb25zdCBmb3JtYXRCeXRlcyA9IChieXRlczogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgY29uc3Qgb3JkZXIgPSBNYXRoLm1pbihcbiAgICBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKDEwMjQpKSxcbiAgICBieXRlVW5pdHMubGVuZ3RoIC0gMVxuICApO1xuXG4gIGNvbnN0IHVuaXQgPSBieXRlVW5pdHNbb3JkZXJdO1xuXG4gIGlmICghdW5pdCkge1xuICAgIHJldHVybiAnPz8/JztcbiAgfVxuXG4gIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCh1bmRlZmluZWQsIHtcbiAgICBub3RhdGlvbjogJ2NvbXBhY3QnLFxuICAgIHN0eWxlOiAndW5pdCcsXG4gICAgdW5pdCxcbiAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDEsXG4gIH0pO1xuICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdChieXRlcyAvIE1hdGgucG93KDEwMjQsIG9yZGVyKSk7XG59O1xuXG5jb25zdCBmb3JtYXRCeXRlU3BlZWQgPSAoYnl0ZXNQZXJTZWNvbmQ6IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IG9yZGVyID0gTWF0aC5taW4oXG4gICAgTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlc1BlclNlY29uZCkgLyBNYXRoLmxvZygxMDI0KSksXG4gICAgYnl0ZVVuaXRzLmxlbmd0aCAtIDFcbiAgKTtcblxuICBjb25zdCB1bml0ID0gYnl0ZVVuaXRzW29yZGVyXTtcblxuICBpZiAoIXVuaXQpIHtcbiAgICByZXR1cm4gJz8/Pyc7XG4gIH1cblxuICBjb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQodW5kZWZpbmVkLCB7XG4gICAgbm90YXRpb246ICdjb21wYWN0JyxcbiAgICBzdHlsZTogJ3VuaXQnLFxuICAgIHVuaXQ6IGAke3VuaXR9LXBlci1zZWNvbmRgLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMSxcbiAgfSk7XG4gIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KGJ5dGVzUGVyU2Vjb25kIC8gTWF0aC5wb3coMTAyNCwgb3JkZXIpKTtcbn07XG5cbmNvbnN0IGZvcm1hdFBlcmNlbnRhZ2UgPSAocmF0aW86IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCh1bmRlZmluZWQsIHtcbiAgICBzdHlsZTogJ3BlcmNlbnQnLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMCxcbiAgfSk7XG4gIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KHJhdGlvKTtcbn07XG5cbmNvbnN0IGZvcm1hdER1cmF0aW9uID0gKGR1cmF0aW9uOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5SZWxhdGl2ZVRpbWVGb3JtYXQodW5kZWZpbmVkLCB7XG4gICAgc3R5bGU6ICduYXJyb3cnLFxuICAgIG51bWVyaWM6ICdhbHdheXMnLFxuICB9KTtcblxuICBkdXJhdGlvbiAvPSAxMDAwO1xuXG4gIGlmIChkdXJhdGlvbiAvIDYwIDwgMSkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KGR1cmF0aW9uLCAnc2Vjb25kJyk7XG4gIH1cbiAgZHVyYXRpb24gLz0gNjA7XG5cbiAgaWYgKGR1cmF0aW9uIC8gNjAgPCAxKSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQoZHVyYXRpb24sICdtaW51dGUnKTtcbiAgfVxuICBkdXJhdGlvbiAvPSA2MDtcblxuICBpZiAoZHVyYXRpb24gLyAyNCA8IDEpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdChkdXJhdGlvbiwgJ2hvdXInKTtcbiAgfVxuICBkdXJhdGlvbiAvPSAyNDtcblxuICBpZiAoZHVyYXRpb24gLyA3IDwgMSkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KGR1cmF0aW9uLCAnZGF5Jyk7XG4gIH1cbiAgZHVyYXRpb24gLz0gNztcblxuICBpZiAoZHVyYXRpb24gLyAzMCA8IDEpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdChkdXJhdGlvbiwgJ3dlZWsnKTtcbiAgfVxuICBkdXJhdGlvbiAvPSAzMDtcblxuICBpZiAoZHVyYXRpb24gLyAxMiA8IDEpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdChkdXJhdGlvbiwgJ21vbnRoJyk7XG4gIH1cbiAgZHVyYXRpb24gLz0gMTI7XG5cbiAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQoZHVyYXRpb24sICd5ZWFyJyk7XG59O1xuXG5leHBvcnQgY29uc3QgaW50ZXJwb2xhdGlvbjogSW5pdE9wdGlvbnNbJ2ludGVycG9sYXRpb24nXSA9IHtcbiAgZm9ybWF0OiAodmFsdWUsIGZvcm1hdCwgbG5nKSA9PiB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSAmJiAhTnVtYmVyLmlzTmFOKHZhbHVlLmdldFRpbWUoKSkpIHtcbiAgICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChsbmcpLmZvcm1hdCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2J5dGVTaXplJzpcbiAgICAgICAgcmV0dXJuIGZvcm1hdEJ5dGVzKHZhbHVlKTtcblxuICAgICAgY2FzZSAnYnl0ZVNwZWVkJzpcbiAgICAgICAgcmV0dXJuIGZvcm1hdEJ5dGVTcGVlZCh2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICByZXR1cm4gZm9ybWF0UGVyY2VudGFnZSh2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ2R1cmF0aW9uJzpcbiAgICAgICAgcmV0dXJuIGZvcm1hdER1cmF0aW9uKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgfSxcbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlc291cmNlIH0gZnJvbSAnaTE4bmV4dCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgJ2RlLURFJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9kZS1ERS5pMThuLmpzb24nKSxcbiAgJ2VuJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9lbi5pMThuLmpzb24nKSxcbiAgJ2VzJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9lcy5pMThuLmpzb24nKSxcbiAgJ2ZpJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9maS5pMThuLmpzb24nKSxcbiAgJ2ZyJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9mci5pMThuLmpzb24nKSxcbiAgJ2h1JzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9odS5pMThuLmpzb24nKSxcbiAgJ2l0LUlUJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9pdC1JVC5pMThuLmpzb24nKSxcbiAgJ2phJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9qYS5pMThuLmpzb24nKSxcbiAgJ3BsJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9wbC5pMThuLmpzb24nKSxcbiAgJ3B0LUJSJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9wdC1CUi5pMThuLmpzb24nKSxcbiAgJ3J1JzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi9ydS5pMThuLmpzb24nKSxcbiAgJ3RyLVRSJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi90ci1UUi5pMThuLmpzb24nKSxcbiAgJ3VrLVVBJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi91ay1VQS5pMThuLmpzb24nKSxcbiAgJ3poLUNOJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi96aC1DTi5pMThuLmpzb24nKSxcbiAgJ3poLVRXJzogKCk6IFByb21pc2U8UmVzb3VyY2U+ID0+IGltcG9ydCgnLi96aC1UVy5pMThuLmpzb24nKSxcbn0gYXMgY29uc3Q7XG4iLCJpbXBvcnQgdHlwZSB7IElwY1JlbmRlcmVyRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IHR5cGUgeyBIYW5kbGVyLCBDaGFubmVsIH0gZnJvbSAnLi9jaGFubmVscyc7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGUgPSA8TiBleHRlbmRzIENoYW5uZWw+KFxuICBjaGFubmVsOiBOLFxuICBoYW5kbGVyOiAoLi4uYXJnczogUGFyYW1ldGVyczxIYW5kbGVyPE4+PikgPT4gUHJvbWlzZTxSZXR1cm5UeXBlPEhhbmRsZXI8Tj4+PlxuKTogKCgpID0+IHZvaWQpID0+IHtcbiAgY29uc3QgbGlzdGVuZXIgPSBhc3luYyAoXG4gICAgXzogSXBjUmVuZGVyZXJFdmVudCxcbiAgICBpZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IGFueVtdXG4gICk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNvbHZlZCA9IGF3YWl0IGhhbmRsZXIoLi4uKGFyZ3MgYXMgUGFyYW1ldGVyczxIYW5kbGVyPE4+PikpO1xuXG4gICAgICBpcGNSZW5kZXJlci5zZW5kKGAke2NoYW5uZWx9QCR7aWR9YCwgeyByZXNvbHZlZCB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJlxuICAgICAgICBpcGNSZW5kZXJlci5zZW5kKGAke2NoYW5uZWx9QCR7aWR9YCwge1xuICAgICAgICAgIHJlamVjdGVkOiB7XG4gICAgICAgICAgICBuYW1lOiAoZXJyb3IgYXMgRXJyb3IpLm5hbWUsXG4gICAgICAgICAgICBtZXNzYWdlOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UsXG4gICAgICAgICAgICBzdGFjazogKGVycm9yIGFzIEVycm9yKS5zdGFjayxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgbGlzdGVuZXIpO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgaXBjUmVuZGVyZXIucmVtb3ZlTGlzdGVuZXIoY2hhbm5lbCwgbGlzdGVuZXIpO1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGludm9rZSA9IDxOIGV4dGVuZHMgQ2hhbm5lbD4oXG4gIGNoYW5uZWw6IE4sXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8SGFuZGxlcjxOPj5cbik6IFByb21pc2U8UmV0dXJuVHlwZTxIYW5kbGVyPE4+Pj4gPT4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLmFyZ3MpO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZXRyeU9wdGlvbnMge1xuICAvKiogTWF4aW11bSBudW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgKGRlZmF1bHQ6IDMpICovXG4gIG1heEF0dGVtcHRzPzogbnVtYmVyO1xuICAvKiogRGVsYXkgYmV0d2VlbiByZXRyaWVzIGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMCkgKi9cbiAgcmV0cnlEZWxheT86IG51bWJlcjtcbiAgLyoqIFdoZXRoZXIgdG8gbG9nIHJldHJ5IGF0dGVtcHRzIChkZWZhdWx0OiB0cnVlKSAqL1xuICBsb2dSZXRyaWVzPzogYm9vbGVhbjtcbiAgLyoqIEN1c3RvbSByZXRyeSBjb25kaXRpb24gLSByZXR1cm4gdHJ1ZSB0byByZXRyeSwgZmFsc2UgdG8gZ2l2ZSB1cCAqL1xuICBzaG91bGRSZXRyeT86IChlcnJvcjogYW55LCBhdHRlbXB0OiBudW1iZXIpID0+IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBpbnZva2VXaXRoUmV0cnkgPSA8TiBleHRlbmRzIENoYW5uZWw+KFxuICBjaGFubmVsOiBOLFxuICByZXRyeU9wdGlvbnM6IElSZXRyeU9wdGlvbnMgPSB7fSxcbiAgLi4uYXJnczogUGFyYW1ldGVyczxIYW5kbGVyPE4+PlxuKTogUHJvbWlzZTxSZXR1cm5UeXBlPEhhbmRsZXI8Tj4+PiA9PiB7XG4gIGNvbnN0IHtcbiAgICBtYXhBdHRlbXB0cyA9IDMsXG4gICAgcmV0cnlEZWxheSA9IDEwMDAsXG4gICAgbG9nUmV0cmllcyA9IHRydWUsXG4gICAgc2hvdWxkUmV0cnkgPSAoKSA9PiB0cnVlLFxuICB9ID0gcmV0cnlPcHRpb25zO1xuXG4gIGNvbnN0IGF0dGVtcHRJbnZva2UgPSBhc3luYyAoXG4gICAgYXR0ZW1wdDogbnVtYmVyXG4gICk6IFByb21pc2U8UmV0dXJuVHlwZTxIYW5kbGVyPE4+Pj4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpcGNSZW5kZXJlci5pbnZva2UoY2hhbm5lbCwgLi4uYXJncyk7XG5cbiAgICAgIC8vIENoZWNrIGlmIHJlc3VsdCBpbmRpY2F0ZXMgZmFpbHVyZSAoZm9yIGNoYW5uZWxzIHRoYXQgcmV0dXJuIHN1Y2Nlc3MgZmxhZ3MpXG4gICAgICBpZiAoXG4gICAgICAgIHJlc3VsdCAmJlxuICAgICAgICB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAnc3VjY2VzcycgaW4gcmVzdWx0ICYmXG4gICAgICAgIHJlc3VsdC5zdWNjZXNzID09PSBmYWxzZVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSVBDIGNhbGwgZmFpbGVkOiAke2NoYW5uZWx9IHJldHVybmVkIHN1Y2Nlc3M6IGZhbHNlYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGlzTGFzdEF0dGVtcHQgPSBhdHRlbXB0ID49IG1heEF0dGVtcHRzO1xuXG4gICAgICBpZiAobG9nUmV0cmllcykge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBgSVBDIGNhbGwgZmFpbGVkOiAke2NoYW5uZWx9IChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhBdHRlbXB0c30pYCxcbiAgICAgICAgICBlcnJvclxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNMYXN0QXR0ZW1wdCB8fCAhc2hvdWxkUmV0cnkoZXJyb3IsIGF0dGVtcHQpKSB7XG4gICAgICAgIGlmIChsb2dSZXRyaWVzKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIGBJUEMgY2FsbCBnaXZpbmcgdXA6ICR7Y2hhbm5lbH0gYWZ0ZXIgJHthdHRlbXB0fSBhdHRlbXB0c2AsXG4gICAgICAgICAgICBlcnJvclxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGlmIChsb2dSZXRyaWVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIGBJUEMgY2FsbCByZXRyeWluZzogJHtjaGFubmVsfSBpbiAke3JldHJ5RGVsYXl9bXMuLi4gKGF0dGVtcHQgJHthdHRlbXB0ICsgMX0vJHttYXhBdHRlbXB0c30pYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCByZXRyeURlbGF5KSk7XG4gICAgICByZXR1cm4gYXR0ZW1wdEludm9rZShhdHRlbXB0ICsgMSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBhdHRlbXB0SW52b2tlKDEpO1xufTtcbiIsIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHJlYWN0LWpzeC1ydW50aW1lLmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gIChmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuLy8gQVRURU5USU9OXG4vLyBXaGVuIGFkZGluZyBuZXcgc3ltYm9scyB0byB0aGlzIGZpbGUsXG4vLyBQbGVhc2UgY29uc2lkZXIgYWxzbyBhZGRpbmcgdG8gJ3JlYWN0LWRldnRvb2xzLXNoYXJlZC9zcmMvYmFja2VuZC9SZWFjdFN5bWJvbHMnXG4vLyBUaGUgU3ltYm9sIHVzZWQgdG8gdGFnIHRoZSBSZWFjdEVsZW1lbnQtbGlrZSB0eXBlcy5cbnZhciBSRUFDVF9FTEVNRU5UX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5lbGVtZW50Jyk7XG52YXIgUkVBQ1RfUE9SVEFMX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5wb3J0YWwnKTtcbnZhciBSRUFDVF9GUkFHTUVOVF9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QuZnJhZ21lbnQnKTtcbnZhciBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFID0gU3ltYm9sLmZvcigncmVhY3Quc3RyaWN0X21vZGUnKTtcbnZhciBSRUFDVF9QUk9GSUxFUl9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QucHJvZmlsZXInKTtcbnZhciBSRUFDVF9QUk9WSURFUl9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QucHJvdmlkZXInKTtcbnZhciBSRUFDVF9DT05URVhUX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5jb250ZXh0Jyk7XG52YXIgUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LmZvcndhcmRfcmVmJyk7XG52YXIgUkVBQ1RfU1VTUEVOU0VfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LnN1c3BlbnNlJyk7XG52YXIgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFID0gU3ltYm9sLmZvcigncmVhY3Quc3VzcGVuc2VfbGlzdCcpO1xudmFyIFJFQUNUX01FTU9fVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0Lm1lbW8nKTtcbnZhciBSRUFDVF9MQVpZX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5sYXp5Jyk7XG52YXIgUkVBQ1RfT0ZGU0NSRUVOX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5vZmZzY3JlZW4nKTtcbnZhciBNQVlCRV9JVEVSQVRPUl9TWU1CT0wgPSBTeW1ib2wuaXRlcmF0b3I7XG52YXIgRkFVWF9JVEVSQVRPUl9TWU1CT0wgPSAnQEBpdGVyYXRvcic7XG5mdW5jdGlvbiBnZXRJdGVyYXRvckZuKG1heWJlSXRlcmFibGUpIHtcbiAgaWYgKG1heWJlSXRlcmFibGUgPT09IG51bGwgfHwgdHlwZW9mIG1heWJlSXRlcmFibGUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgbWF5YmVJdGVyYXRvciA9IE1BWUJFX0lURVJBVE9SX1NZTUJPTCAmJiBtYXliZUl0ZXJhYmxlW01BWUJFX0lURVJBVE9SX1NZTUJPTF0gfHwgbWF5YmVJdGVyYWJsZVtGQVVYX0lURVJBVE9SX1NZTUJPTF07XG5cbiAgaWYgKHR5cGVvZiBtYXliZUl0ZXJhdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG1heWJlSXRlcmF0b3I7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxudmFyIFJlYWN0U2hhcmVkSW50ZXJuYWxzID0gUmVhY3QuX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQ7XG5cbmZ1bmN0aW9uIGVycm9yKGZvcm1hdCkge1xuICB7XG4gICAge1xuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4yID4gMSA/IF9sZW4yIC0gMSA6IDApLCBfa2V5MiA9IDE7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgYXJnc1tfa2V5MiAtIDFdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cblxuICAgICAgcHJpbnRXYXJuaW5nKCdlcnJvcicsIGZvcm1hdCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByaW50V2FybmluZyhsZXZlbCwgZm9ybWF0LCBhcmdzKSB7XG4gIC8vIFdoZW4gY2hhbmdpbmcgdGhpcyBsb2dpYywgeW91IG1pZ2h0IHdhbnQgdG8gYWxzb1xuICAvLyB1cGRhdGUgY29uc29sZVdpdGhTdGFja0Rldi53d3cuanMgYXMgd2VsbC5cbiAge1xuICAgIHZhciBSZWFjdERlYnVnQ3VycmVudEZyYW1lID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMuUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZTtcbiAgICB2YXIgc3RhY2sgPSBSZWFjdERlYnVnQ3VycmVudEZyYW1lLmdldFN0YWNrQWRkZW5kdW0oKTtcblxuICAgIGlmIChzdGFjayAhPT0gJycpIHtcbiAgICAgIGZvcm1hdCArPSAnJXMnO1xuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtzdGFja10pO1xuICAgIH0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWludGVybmFsL3NhZmUtc3RyaW5nLWNvZXJjaW9uXG5cblxuICAgIHZhciBhcmdzV2l0aEZvcm1hdCA9IGFyZ3MubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKGl0ZW0pO1xuICAgIH0pOyAvLyBDYXJlZnVsOiBSTiBjdXJyZW50bHkgZGVwZW5kcyBvbiB0aGlzIHByZWZpeFxuXG4gICAgYXJnc1dpdGhGb3JtYXQudW5zaGlmdCgnV2FybmluZzogJyArIGZvcm1hdCk7IC8vIFdlIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIHNwcmVhZCAob3IgLmFwcGx5KSBkaXJlY3RseSBiZWNhdXNlIGl0XG4gICAgLy8gYnJlYWtzIElFOTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xMzYxMFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1pbnRlcm5hbC9uby1wcm9kdWN0aW9uLWxvZ2dpbmdcblxuICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGVbbGV2ZWxdLCBjb25zb2xlLCBhcmdzV2l0aEZvcm1hdCk7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGVuYWJsZVNjb3BlQVBJID0gZmFsc2U7IC8vIEV4cGVyaW1lbnRhbCBDcmVhdGUgRXZlbnQgSGFuZGxlIEFQSS5cbnZhciBlbmFibGVDYWNoZUVsZW1lbnQgPSBmYWxzZTtcbnZhciBlbmFibGVUcmFuc2l0aW9uVHJhY2luZyA9IGZhbHNlOyAvLyBObyBrbm93biBidWdzLCBidXQgbmVlZHMgcGVyZm9ybWFuY2UgdGVzdGluZ1xuXG52YXIgZW5hYmxlTGVnYWN5SGlkZGVuID0gZmFsc2U7IC8vIEVuYWJsZXMgdW5zdGFibGVfYXZvaWRUaGlzRmFsbGJhY2sgZmVhdHVyZSBpbiBGaWJlclxuLy8gc3R1ZmYuIEludGVuZGVkIHRvIGVuYWJsZSBSZWFjdCBjb3JlIG1lbWJlcnMgdG8gbW9yZSBlYXNpbHkgZGVidWcgc2NoZWR1bGluZ1xuLy8gaXNzdWVzIGluIERFViBidWlsZHMuXG5cbnZhciBlbmFibGVEZWJ1Z1RyYWNpbmcgPSBmYWxzZTsgLy8gVHJhY2sgd2hpY2ggRmliZXIocykgc2NoZWR1bGUgcmVuZGVyIHdvcmsuXG5cbnZhciBSRUFDVF9NT0RVTEVfUkVGRVJFTkNFO1xuXG57XG4gIFJFQUNUX01PRFVMRV9SRUZFUkVOQ0UgPSBTeW1ib2wuZm9yKCdyZWFjdC5tb2R1bGUucmVmZXJlbmNlJyk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRFbGVtZW50VHlwZSh0eXBlKSB7XG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAvLyBOb3RlOiB0eXBlb2YgbWlnaHQgYmUgb3RoZXIgdGhhbiAnc3ltYm9sJyBvciAnbnVtYmVyJyAoZS5nLiBpZiBpdCdzIGEgcG9seWZpbGwpLlxuXG5cbiAgaWYgKHR5cGUgPT09IFJFQUNUX0ZSQUdNRU5UX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfUFJPRklMRVJfVFlQRSB8fCBlbmFibGVEZWJ1Z1RyYWNpbmcgIHx8IHR5cGUgPT09IFJFQUNUX1NUUklDVF9NT0RFX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfU1VTUEVOU0VfVFlQRSB8fCB0eXBlID09PSBSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEUgfHwgZW5hYmxlTGVnYWN5SGlkZGVuICB8fCB0eXBlID09PSBSRUFDVF9PRkZTQ1JFRU5fVFlQRSB8fCBlbmFibGVTY29wZUFQSSAgfHwgZW5hYmxlQ2FjaGVFbGVtZW50ICB8fCBlbmFibGVUcmFuc2l0aW9uVHJhY2luZyApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9MQVpZX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTUVNT19UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX1BST1ZJREVSX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfQ09OVEVYVF9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0ZPUldBUkRfUkVGX1RZUEUgfHwgLy8gVGhpcyBuZWVkcyB0byBpbmNsdWRlIGFsbCBwb3NzaWJsZSBtb2R1bGUgcmVmZXJlbmNlIG9iamVjdFxuICAgIC8vIHR5cGVzIHN1cHBvcnRlZCBieSBhbnkgRmxpZ2h0IGNvbmZpZ3VyYXRpb24gYW55d2hlcmUgc2luY2VcbiAgICAvLyB3ZSBkb24ndCBrbm93IHdoaWNoIEZsaWdodCBidWlsZCB0aGlzIHdpbGwgZW5kIHVwIGJlaW5nIHVzZWRcbiAgICAvLyB3aXRoLlxuICAgIHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX01PRFVMRV9SRUZFUkVOQ0UgfHwgdHlwZS5nZXRNb2R1bGVJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldFdyYXBwZWROYW1lKG91dGVyVHlwZSwgaW5uZXJUeXBlLCB3cmFwcGVyTmFtZSkge1xuICB2YXIgZGlzcGxheU5hbWUgPSBvdXRlclR5cGUuZGlzcGxheU5hbWU7XG5cbiAgaWYgKGRpc3BsYXlOYW1lKSB7XG4gICAgcmV0dXJuIGRpc3BsYXlOYW1lO1xuICB9XG5cbiAgdmFyIGZ1bmN0aW9uTmFtZSA9IGlubmVyVHlwZS5kaXNwbGF5TmFtZSB8fCBpbm5lclR5cGUubmFtZSB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uTmFtZSAhPT0gJycgPyB3cmFwcGVyTmFtZSArIFwiKFwiICsgZnVuY3Rpb25OYW1lICsgXCIpXCIgOiB3cmFwcGVyTmFtZTtcbn0gLy8gS2VlcCBpbiBzeW5jIHdpdGggcmVhY3QtcmVjb25jaWxlci9nZXRDb21wb25lbnROYW1lRnJvbUZpYmVyXG5cblxuZnVuY3Rpb24gZ2V0Q29udGV4dE5hbWUodHlwZSkge1xuICByZXR1cm4gdHlwZS5kaXNwbGF5TmFtZSB8fCAnQ29udGV4dCc7XG59IC8vIE5vdGUgdGhhdCB0aGUgcmVjb25jaWxlciBwYWNrYWdlIHNob3VsZCBnZW5lcmFsbHkgcHJlZmVyIHRvIHVzZSBnZXRDb21wb25lbnROYW1lRnJvbUZpYmVyKCkgaW5zdGVhZC5cblxuXG5mdW5jdGlvbiBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUodHlwZSkge1xuICBpZiAodHlwZSA9PSBudWxsKSB7XG4gICAgLy8gSG9zdCByb290LCB0ZXh0IG5vZGUgb3IganVzdCBpbnZhbGlkIHR5cGUuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB7XG4gICAgaWYgKHR5cGVvZiB0eXBlLnRhZyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGVycm9yKCdSZWNlaXZlZCBhbiB1bmV4cGVjdGVkIG9iamVjdCBpbiBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUoKS4gJyArICdUaGlzIGlzIGxpa2VseSBhIGJ1ZyBpbiBSZWFjdC4gUGxlYXNlIGZpbGUgYW4gaXNzdWUuJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHR5cGUuZGlzcGxheU5hbWUgfHwgdHlwZS5uYW1lIHx8IG51bGw7XG4gIH1cblxuICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFJFQUNUX0ZSQUdNRU5UX1RZUEU6XG4gICAgICByZXR1cm4gJ0ZyYWdtZW50JztcblxuICAgIGNhc2UgUkVBQ1RfUE9SVEFMX1RZUEU6XG4gICAgICByZXR1cm4gJ1BvcnRhbCc7XG5cbiAgICBjYXNlIFJFQUNUX1BST0ZJTEVSX1RZUEU6XG4gICAgICByZXR1cm4gJ1Byb2ZpbGVyJztcblxuICAgIGNhc2UgUkVBQ1RfU1RSSUNUX01PREVfVFlQRTpcbiAgICAgIHJldHVybiAnU3RyaWN0TW9kZSc7XG5cbiAgICBjYXNlIFJFQUNUX1NVU1BFTlNFX1RZUEU6XG4gICAgICByZXR1cm4gJ1N1c3BlbnNlJztcblxuICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFOlxuICAgICAgcmV0dXJuICdTdXNwZW5zZUxpc3QnO1xuXG4gIH1cblxuICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgc3dpdGNoICh0eXBlLiQkdHlwZW9mKSB7XG4gICAgICBjYXNlIFJFQUNUX0NPTlRFWFRfVFlQRTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0eXBlO1xuICAgICAgICByZXR1cm4gZ2V0Q29udGV4dE5hbWUoY29udGV4dCkgKyAnLkNvbnN1bWVyJztcblxuICAgICAgY2FzZSBSRUFDVF9QUk9WSURFUl9UWVBFOlxuICAgICAgICB2YXIgcHJvdmlkZXIgPSB0eXBlO1xuICAgICAgICByZXR1cm4gZ2V0Q29udGV4dE5hbWUocHJvdmlkZXIuX2NvbnRleHQpICsgJy5Qcm92aWRlcic7XG5cbiAgICAgIGNhc2UgUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRTpcbiAgICAgICAgcmV0dXJuIGdldFdyYXBwZWROYW1lKHR5cGUsIHR5cGUucmVuZGVyLCAnRm9yd2FyZFJlZicpO1xuXG4gICAgICBjYXNlIFJFQUNUX01FTU9fVFlQRTpcbiAgICAgICAgdmFyIG91dGVyTmFtZSA9IHR5cGUuZGlzcGxheU5hbWUgfHwgbnVsbDtcblxuICAgICAgICBpZiAob3V0ZXJOYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG91dGVyTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUodHlwZS50eXBlKSB8fCAnTWVtbyc7XG5cbiAgICAgIGNhc2UgUkVBQ1RfTEFaWV9UWVBFOlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGxhenlDb21wb25lbnQgPSB0eXBlO1xuICAgICAgICAgIHZhciBwYXlsb2FkID0gbGF6eUNvbXBvbmVudC5fcGF5bG9hZDtcbiAgICAgICAgICB2YXIgaW5pdCA9IGxhenlDb21wb25lbnQuX2luaXQ7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGdldENvbXBvbmVudE5hbWVGcm9tVHlwZShpbml0KHBheWxvYWQpKTtcbiAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWZhbGx0aHJvdWdoXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbnZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduO1xuXG4vLyBIZWxwZXJzIHRvIHBhdGNoIGNvbnNvbGUubG9ncyB0byBhdm9pZCBsb2dnaW5nIGR1cmluZyBzaWRlLWVmZmVjdCBmcmVlXG4vLyByZXBsYXlpbmcgb24gcmVuZGVyIGZ1bmN0aW9uLiBUaGlzIGN1cnJlbnRseSBvbmx5IHBhdGNoZXMgdGhlIG9iamVjdFxuLy8gbGF6aWx5IHdoaWNoIHdvbid0IGNvdmVyIGlmIHRoZSBsb2cgZnVuY3Rpb24gd2FzIGV4dHJhY3RlZCBlYWdlcmx5LlxuLy8gV2UgY291bGQgYWxzbyBlYWdlcmx5IHBhdGNoIHRoZSBtZXRob2QuXG52YXIgZGlzYWJsZWREZXB0aCA9IDA7XG52YXIgcHJldkxvZztcbnZhciBwcmV2SW5mbztcbnZhciBwcmV2V2FybjtcbnZhciBwcmV2RXJyb3I7XG52YXIgcHJldkdyb3VwO1xudmFyIHByZXZHcm91cENvbGxhcHNlZDtcbnZhciBwcmV2R3JvdXBFbmQ7XG5cbmZ1bmN0aW9uIGRpc2FibGVkTG9nKCkge31cblxuZGlzYWJsZWRMb2cuX19yZWFjdERpc2FibGVkTG9nID0gdHJ1ZTtcbmZ1bmN0aW9uIGRpc2FibGVMb2dzKCkge1xuICB7XG4gICAgaWYgKGRpc2FibGVkRGVwdGggPT09IDApIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIHJlYWN0LWludGVybmFsL25vLXByb2R1Y3Rpb24tbG9nZ2luZyAqL1xuICAgICAgcHJldkxvZyA9IGNvbnNvbGUubG9nO1xuICAgICAgcHJldkluZm8gPSBjb25zb2xlLmluZm87XG4gICAgICBwcmV2V2FybiA9IGNvbnNvbGUud2FybjtcbiAgICAgIHByZXZFcnJvciA9IGNvbnNvbGUuZXJyb3I7XG4gICAgICBwcmV2R3JvdXAgPSBjb25zb2xlLmdyb3VwO1xuICAgICAgcHJldkdyb3VwQ29sbGFwc2VkID0gY29uc29sZS5ncm91cENvbGxhcHNlZDtcbiAgICAgIHByZXZHcm91cEVuZCA9IGNvbnNvbGUuZ3JvdXBFbmQ7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9pc3N1ZXMvMTkwOTlcblxuICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBkaXNhYmxlZExvZyxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH07IC8vICRGbG93Rml4TWUgRmxvdyB0aGlua3MgY29uc29sZSBpcyBpbW11dGFibGUuXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNvbnNvbGUsIHtcbiAgICAgICAgaW5mbzogcHJvcHMsXG4gICAgICAgIGxvZzogcHJvcHMsXG4gICAgICAgIHdhcm46IHByb3BzLFxuICAgICAgICBlcnJvcjogcHJvcHMsXG4gICAgICAgIGdyb3VwOiBwcm9wcyxcbiAgICAgICAgZ3JvdXBDb2xsYXBzZWQ6IHByb3BzLFxuICAgICAgICBncm91cEVuZDogcHJvcHNcbiAgICAgIH0pO1xuICAgICAgLyogZXNsaW50LWVuYWJsZSByZWFjdC1pbnRlcm5hbC9uby1wcm9kdWN0aW9uLWxvZ2dpbmcgKi9cbiAgICB9XG5cbiAgICBkaXNhYmxlZERlcHRoKys7XG4gIH1cbn1cbmZ1bmN0aW9uIHJlZW5hYmxlTG9ncygpIHtcbiAge1xuICAgIGRpc2FibGVkRGVwdGgtLTtcblxuICAgIGlmIChkaXNhYmxlZERlcHRoID09PSAwKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSByZWFjdC1pbnRlcm5hbC9uby1wcm9kdWN0aW9uLWxvZ2dpbmcgKi9cbiAgICAgIHZhciBwcm9wcyA9IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfTsgLy8gJEZsb3dGaXhNZSBGbG93IHRoaW5rcyBjb25zb2xlIGlzIGltbXV0YWJsZS5cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoY29uc29sZSwge1xuICAgICAgICBsb2c6IGFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICB2YWx1ZTogcHJldkxvZ1xuICAgICAgICB9KSxcbiAgICAgICAgaW5mbzogYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgIHZhbHVlOiBwcmV2SW5mb1xuICAgICAgICB9KSxcbiAgICAgICAgd2FybjogYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgIHZhbHVlOiBwcmV2V2FyblxuICAgICAgICB9KSxcbiAgICAgICAgZXJyb3I6IGFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICB2YWx1ZTogcHJldkVycm9yXG4gICAgICAgIH0pLFxuICAgICAgICBncm91cDogYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgIHZhbHVlOiBwcmV2R3JvdXBcbiAgICAgICAgfSksXG4gICAgICAgIGdyb3VwQ29sbGFwc2VkOiBhc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgICAgdmFsdWU6IHByZXZHcm91cENvbGxhcHNlZFxuICAgICAgICB9KSxcbiAgICAgICAgZ3JvdXBFbmQ6IGFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICB2YWx1ZTogcHJldkdyb3VwRW5kXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgcmVhY3QtaW50ZXJuYWwvbm8tcHJvZHVjdGlvbi1sb2dnaW5nICovXG4gICAgfVxuXG4gICAgaWYgKGRpc2FibGVkRGVwdGggPCAwKSB7XG4gICAgICBlcnJvcignZGlzYWJsZWREZXB0aCBmZWxsIGJlbG93IHplcm8uICcgKyAnVGhpcyBpcyBhIGJ1ZyBpbiBSZWFjdC4gUGxlYXNlIGZpbGUgYW4gaXNzdWUuJyk7XG4gICAgfVxuICB9XG59XG5cbnZhciBSZWFjdEN1cnJlbnREaXNwYXRjaGVyID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMuUmVhY3RDdXJyZW50RGlzcGF0Y2hlcjtcbnZhciBwcmVmaXg7XG5mdW5jdGlvbiBkZXNjcmliZUJ1aWx0SW5Db21wb25lbnRGcmFtZShuYW1lLCBzb3VyY2UsIG93bmVyRm4pIHtcbiAge1xuICAgIGlmIChwcmVmaXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gRXh0cmFjdCB0aGUgVk0gc3BlY2lmaWMgcHJlZml4IHVzZWQgYnkgZWFjaCBsaW5lLlxuICAgICAgdHJ5IHtcbiAgICAgICAgdGhyb3cgRXJyb3IoKTtcbiAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgdmFyIG1hdGNoID0geC5zdGFjay50cmltKCkubWF0Y2goL1xcbiggKihhdCApPykvKTtcbiAgICAgICAgcHJlZml4ID0gbWF0Y2ggJiYgbWF0Y2hbMV0gfHwgJyc7XG4gICAgICB9XG4gICAgfSAvLyBXZSB1c2UgdGhlIHByZWZpeCB0byBlbnN1cmUgb3VyIHN0YWNrcyBsaW5lIHVwIHdpdGggbmF0aXZlIHN0YWNrIGZyYW1lcy5cblxuXG4gICAgcmV0dXJuICdcXG4nICsgcHJlZml4ICsgbmFtZTtcbiAgfVxufVxudmFyIHJlZW50cnkgPSBmYWxzZTtcbnZhciBjb21wb25lbnRGcmFtZUNhY2hlO1xuXG57XG4gIHZhciBQb3NzaWJseVdlYWtNYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gJ2Z1bmN0aW9uJyA/IFdlYWtNYXAgOiBNYXA7XG4gIGNvbXBvbmVudEZyYW1lQ2FjaGUgPSBuZXcgUG9zc2libHlXZWFrTWFwKCk7XG59XG5cbmZ1bmN0aW9uIGRlc2NyaWJlTmF0aXZlQ29tcG9uZW50RnJhbWUoZm4sIGNvbnN0cnVjdCkge1xuICAvLyBJZiBzb21ldGhpbmcgYXNrZWQgZm9yIGEgc3RhY2sgaW5zaWRlIGEgZmFrZSByZW5kZXIsIGl0IHNob3VsZCBnZXQgaWdub3JlZC5cbiAgaWYgKCAhZm4gfHwgcmVlbnRyeSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHtcbiAgICB2YXIgZnJhbWUgPSBjb21wb25lbnRGcmFtZUNhY2hlLmdldChmbik7XG5cbiAgICBpZiAoZnJhbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZyYW1lO1xuICAgIH1cbiAgfVxuXG4gIHZhciBjb250cm9sO1xuICByZWVudHJ5ID0gdHJ1ZTtcbiAgdmFyIHByZXZpb3VzUHJlcGFyZVN0YWNrVHJhY2UgPSBFcnJvci5wcmVwYXJlU3RhY2tUcmFjZTsgLy8gJEZsb3dGaXhNZSBJdCBkb2VzIGFjY2VwdCB1bmRlZmluZWQuXG5cbiAgRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSB1bmRlZmluZWQ7XG4gIHZhciBwcmV2aW91c0Rpc3BhdGNoZXI7XG5cbiAge1xuICAgIHByZXZpb3VzRGlzcGF0Y2hlciA9IFJlYWN0Q3VycmVudERpc3BhdGNoZXIuY3VycmVudDsgLy8gU2V0IHRoZSBkaXNwYXRjaGVyIGluIERFViBiZWNhdXNlIHRoaXMgbWlnaHQgYmUgY2FsbCBpbiB0aGUgcmVuZGVyIGZ1bmN0aW9uXG4gICAgLy8gZm9yIHdhcm5pbmdzLlxuXG4gICAgUmVhY3RDdXJyZW50RGlzcGF0Y2hlci5jdXJyZW50ID0gbnVsbDtcbiAgICBkaXNhYmxlTG9ncygpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIHNob3VsZCB0aHJvdy5cbiAgICBpZiAoY29uc3RydWN0KSB7XG4gICAgICAvLyBTb21ldGhpbmcgc2hvdWxkIGJlIHNldHRpbmcgdGhlIHByb3BzIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgIHZhciBGYWtlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aHJvdyBFcnJvcigpO1xuICAgICAgfTsgLy8gJEZsb3dGaXhNZVxuXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGYWtlLnByb3RvdHlwZSwgJ3Byb3BzJywge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBXZSB1c2UgYSB0aHJvd2luZyBzZXR0ZXIgaW5zdGVhZCBvZiBmcm96ZW4gb3Igbm9uLXdyaXRhYmxlIHByb3BzXG4gICAgICAgICAgLy8gYmVjYXVzZSB0aGF0IHdvbid0IHRocm93IGluIGEgbm9uLXN0cmljdCBtb2RlIGZ1bmN0aW9uLlxuICAgICAgICAgIHRocm93IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnICYmIFJlZmxlY3QuY29uc3RydWN0KSB7XG4gICAgICAgIC8vIFdlIGNvbnN0cnVjdCBhIGRpZmZlcmVudCBjb250cm9sIGZvciB0aGlzIGNhc2UgdG8gaW5jbHVkZSBhbnkgZXh0cmFcbiAgICAgICAgLy8gZnJhbWVzIGFkZGVkIGJ5IHRoZSBjb25zdHJ1Y3QgY2FsbC5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBSZWZsZWN0LmNvbnN0cnVjdChGYWtlLCBbXSk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICBjb250cm9sID0geDtcbiAgICAgICAgfVxuXG4gICAgICAgIFJlZmxlY3QuY29uc3RydWN0KGZuLCBbXSwgRmFrZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIEZha2UuY2FsbCgpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgY29udHJvbCA9IHg7XG4gICAgICAgIH1cblxuICAgICAgICBmbi5jYWxsKEZha2UucHJvdG90eXBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhyb3cgRXJyb3IoKTtcbiAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgY29udHJvbCA9IHg7XG4gICAgICB9XG5cbiAgICAgIGZuKCk7XG4gICAgfVxuICB9IGNhdGNoIChzYW1wbGUpIHtcbiAgICAvLyBUaGlzIGlzIGlubGluZWQgbWFudWFsbHkgYmVjYXVzZSBjbG9zdXJlIGRvZXNuJ3QgZG8gaXQgZm9yIHVzLlxuICAgIGlmIChzYW1wbGUgJiYgY29udHJvbCAmJiB0eXBlb2Ygc2FtcGxlLnN0YWNrID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gVGhpcyBleHRyYWN0cyB0aGUgZmlyc3QgZnJhbWUgZnJvbSB0aGUgc2FtcGxlIHRoYXQgaXNuJ3QgYWxzbyBpbiB0aGUgY29udHJvbC5cbiAgICAgIC8vIFNraXBwaW5nIG9uZSBmcmFtZSB0aGF0IHdlIGFzc3VtZSBpcyB0aGUgZnJhbWUgdGhhdCBjYWxscyB0aGUgdHdvLlxuICAgICAgdmFyIHNhbXBsZUxpbmVzID0gc2FtcGxlLnN0YWNrLnNwbGl0KCdcXG4nKTtcbiAgICAgIHZhciBjb250cm9sTGluZXMgPSBjb250cm9sLnN0YWNrLnNwbGl0KCdcXG4nKTtcbiAgICAgIHZhciBzID0gc2FtcGxlTGluZXMubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBjID0gY29udHJvbExpbmVzLmxlbmd0aCAtIDE7XG5cbiAgICAgIHdoaWxlIChzID49IDEgJiYgYyA+PSAwICYmIHNhbXBsZUxpbmVzW3NdICE9PSBjb250cm9sTGluZXNbY10pIHtcbiAgICAgICAgLy8gV2UgZXhwZWN0IGF0IGxlYXN0IG9uZSBzdGFjayBmcmFtZSB0byBiZSBzaGFyZWQuXG4gICAgICAgIC8vIFR5cGljYWxseSB0aGlzIHdpbGwgYmUgdGhlIHJvb3QgbW9zdCBvbmUuIEhvd2V2ZXIsIHN0YWNrIGZyYW1lcyBtYXkgYmVcbiAgICAgICAgLy8gY3V0IG9mZiBkdWUgdG8gbWF4aW11bSBzdGFjayBsaW1pdHMuIEluIHRoaXMgY2FzZSwgb25lIG1heWJlIGN1dCBvZmZcbiAgICAgICAgLy8gZWFybGllciB0aGFuIHRoZSBvdGhlci4gV2UgYXNzdW1lIHRoYXQgdGhlIHNhbXBsZSBpcyBsb25nZXIgb3IgdGhlIHNhbWVcbiAgICAgICAgLy8gYW5kIHRoZXJlIGZvciBjdXQgb2ZmIGVhcmxpZXIuIFNvIHdlIHNob3VsZCBmaW5kIHRoZSByb290IG1vc3QgZnJhbWUgaW5cbiAgICAgICAgLy8gdGhlIHNhbXBsZSBzb21ld2hlcmUgaW4gdGhlIGNvbnRyb2wuXG4gICAgICAgIGMtLTtcbiAgICAgIH1cblxuICAgICAgZm9yICg7IHMgPj0gMSAmJiBjID49IDA7IHMtLSwgYy0tKSB7XG4gICAgICAgIC8vIE5leHQgd2UgZmluZCB0aGUgZmlyc3Qgb25lIHRoYXQgaXNuJ3QgdGhlIHNhbWUgd2hpY2ggc2hvdWxkIGJlIHRoZVxuICAgICAgICAvLyBmcmFtZSB0aGF0IGNhbGxlZCBvdXIgc2FtcGxlIGZ1bmN0aW9uIGFuZCB0aGUgY29udHJvbC5cbiAgICAgICAgaWYgKHNhbXBsZUxpbmVzW3NdICE9PSBjb250cm9sTGluZXNbY10pIHtcbiAgICAgICAgICAvLyBJbiBWOCwgdGhlIGZpcnN0IGxpbmUgaXMgZGVzY3JpYmluZyB0aGUgbWVzc2FnZSBidXQgb3RoZXIgVk1zIGRvbid0LlxuICAgICAgICAgIC8vIElmIHdlJ3JlIGFib3V0IHRvIHJldHVybiB0aGUgZmlyc3QgbGluZSwgYW5kIHRoZSBjb250cm9sIGlzIGFsc28gb24gdGhlIHNhbWVcbiAgICAgICAgICAvLyBsaW5lLCB0aGF0J3MgYSBwcmV0dHkgZ29vZCBpbmRpY2F0b3IgdGhhdCBvdXIgc2FtcGxlIHRocmV3IGF0IHNhbWUgbGluZSBhc1xuICAgICAgICAgIC8vIHRoZSBjb250cm9sLiBJLmUuIGJlZm9yZSB3ZSBlbnRlcmVkIHRoZSBzYW1wbGUgZnJhbWUuIFNvIHdlIGlnbm9yZSB0aGlzIHJlc3VsdC5cbiAgICAgICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gaWYgeW91IHBhc3NlZCBhIGNsYXNzIHRvIGZ1bmN0aW9uIGNvbXBvbmVudCwgb3Igbm9uLWZ1bmN0aW9uLlxuICAgICAgICAgIGlmIChzICE9PSAxIHx8IGMgIT09IDEpIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgcy0tO1xuICAgICAgICAgICAgICBjLS07IC8vIFdlIG1heSBzdGlsbCBoYXZlIHNpbWlsYXIgaW50ZXJtZWRpYXRlIGZyYW1lcyBmcm9tIHRoZSBjb25zdHJ1Y3QgY2FsbC5cbiAgICAgICAgICAgICAgLy8gVGhlIG5leHQgb25lIHRoYXQgaXNuJ3QgdGhlIHNhbWUgc2hvdWxkIGJlIG91ciBtYXRjaCB0aG91Z2guXG5cbiAgICAgICAgICAgICAgaWYgKGMgPCAwIHx8IHNhbXBsZUxpbmVzW3NdICE9PSBjb250cm9sTGluZXNbY10pIHtcbiAgICAgICAgICAgICAgICAvLyBWOCBhZGRzIGEgXCJuZXdcIiBwcmVmaXggZm9yIG5hdGl2ZSBjbGFzc2VzLiBMZXQncyByZW1vdmUgaXQgdG8gbWFrZSBpdCBwcmV0dGllci5cbiAgICAgICAgICAgICAgICB2YXIgX2ZyYW1lID0gJ1xcbicgKyBzYW1wbGVMaW5lc1tzXS5yZXBsYWNlKCcgYXQgbmV3ICcsICcgYXQgJyk7IC8vIElmIG91ciBjb21wb25lbnQgZnJhbWUgaXMgbGFiZWxlZCBcIjxhbm9ueW1vdXM+XCJcbiAgICAgICAgICAgICAgICAvLyBidXQgd2UgaGF2ZSBhIHVzZXItcHJvdmlkZWQgXCJkaXNwbGF5TmFtZVwiXG4gICAgICAgICAgICAgICAgLy8gc3BsaWNlIGl0IGluIHRvIG1ha2UgdGhlIHN0YWNrIG1vcmUgcmVhZGFibGUuXG5cblxuICAgICAgICAgICAgICAgIGlmIChmbi5kaXNwbGF5TmFtZSAmJiBfZnJhbWUuaW5jbHVkZXMoJzxhbm9ueW1vdXM+JykpIHtcbiAgICAgICAgICAgICAgICAgIF9mcmFtZSA9IF9mcmFtZS5yZXBsYWNlKCc8YW5vbnltb3VzPicsIGZuLmRpc3BsYXlOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEZyYW1lQ2FjaGUuc2V0KGZuLCBfZnJhbWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gLy8gUmV0dXJuIHRoZSBsaW5lIHdlIGZvdW5kLlxuXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX2ZyYW1lO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlIChzID49IDEgJiYgYyA+PSAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICByZWVudHJ5ID0gZmFsc2U7XG5cbiAgICB7XG4gICAgICBSZWFjdEN1cnJlbnREaXNwYXRjaGVyLmN1cnJlbnQgPSBwcmV2aW91c0Rpc3BhdGNoZXI7XG4gICAgICByZWVuYWJsZUxvZ3MoKTtcbiAgICB9XG5cbiAgICBFcnJvci5wcmVwYXJlU3RhY2tUcmFjZSA9IHByZXZpb3VzUHJlcGFyZVN0YWNrVHJhY2U7XG4gIH0gLy8gRmFsbGJhY2sgdG8ganVzdCB1c2luZyB0aGUgbmFtZSBpZiB3ZSBjb3VsZG4ndCBtYWtlIGl0IHRocm93LlxuXG5cbiAgdmFyIG5hbWUgPSBmbiA/IGZuLmRpc3BsYXlOYW1lIHx8IGZuLm5hbWUgOiAnJztcbiAgdmFyIHN5bnRoZXRpY0ZyYW1lID0gbmFtZSA/IGRlc2NyaWJlQnVpbHRJbkNvbXBvbmVudEZyYW1lKG5hbWUpIDogJyc7XG5cbiAge1xuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBvbmVudEZyYW1lQ2FjaGUuc2V0KGZuLCBzeW50aGV0aWNGcmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN5bnRoZXRpY0ZyYW1lO1xufVxuZnVuY3Rpb24gZGVzY3JpYmVGdW5jdGlvbkNvbXBvbmVudEZyYW1lKGZuLCBzb3VyY2UsIG93bmVyRm4pIHtcbiAge1xuICAgIHJldHVybiBkZXNjcmliZU5hdGl2ZUNvbXBvbmVudEZyYW1lKGZuLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvdWxkQ29uc3RydWN0KENvbXBvbmVudCkge1xuICB2YXIgcHJvdG90eXBlID0gQ29tcG9uZW50LnByb3RvdHlwZTtcbiAgcmV0dXJuICEhKHByb3RvdHlwZSAmJiBwcm90b3R5cGUuaXNSZWFjdENvbXBvbmVudCk7XG59XG5cbmZ1bmN0aW9uIGRlc2NyaWJlVW5rbm93bkVsZW1lbnRUeXBlRnJhbWVJbkRFVih0eXBlLCBzb3VyY2UsIG93bmVyRm4pIHtcblxuICBpZiAodHlwZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAge1xuICAgICAgcmV0dXJuIGRlc2NyaWJlTmF0aXZlQ29tcG9uZW50RnJhbWUodHlwZSwgc2hvdWxkQ29uc3RydWN0KHR5cGUpKTtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGRlc2NyaWJlQnVpbHRJbkNvbXBvbmVudEZyYW1lKHR5cGUpO1xuICB9XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9UWVBFOlxuICAgICAgcmV0dXJuIGRlc2NyaWJlQnVpbHRJbkNvbXBvbmVudEZyYW1lKCdTdXNwZW5zZScpO1xuXG4gICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEU6XG4gICAgICByZXR1cm4gZGVzY3JpYmVCdWlsdEluQ29tcG9uZW50RnJhbWUoJ1N1c3BlbnNlTGlzdCcpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgIHN3aXRjaCAodHlwZS4kJHR5cGVvZikge1xuICAgICAgY2FzZSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFOlxuICAgICAgICByZXR1cm4gZGVzY3JpYmVGdW5jdGlvbkNvbXBvbmVudEZyYW1lKHR5cGUucmVuZGVyKTtcblxuICAgICAgY2FzZSBSRUFDVF9NRU1PX1RZUEU6XG4gICAgICAgIC8vIE1lbW8gbWF5IGNvbnRhaW4gYW55IGNvbXBvbmVudCB0eXBlIHNvIHdlIHJlY3Vyc2l2ZWx5IHJlc29sdmUgaXQuXG4gICAgICAgIHJldHVybiBkZXNjcmliZVVua25vd25FbGVtZW50VHlwZUZyYW1lSW5ERVYodHlwZS50eXBlLCBzb3VyY2UsIG93bmVyRm4pO1xuXG4gICAgICBjYXNlIFJFQUNUX0xBWllfVFlQRTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBsYXp5Q29tcG9uZW50ID0gdHlwZTtcbiAgICAgICAgICB2YXIgcGF5bG9hZCA9IGxhenlDb21wb25lbnQuX3BheWxvYWQ7XG4gICAgICAgICAgdmFyIGluaXQgPSBsYXp5Q29tcG9uZW50Ll9pbml0O1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIExhenkgbWF5IGNvbnRhaW4gYW55IGNvbXBvbmVudCB0eXBlIHNvIHdlIHJlY3Vyc2l2ZWx5IHJlc29sdmUgaXQuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpYmVVbmtub3duRWxlbWVudFR5cGVGcmFtZUluREVWKGluaXQocGF5bG9hZCksIHNvdXJjZSwgb3duZXJGbik7XG4gICAgICAgICAgfSBjYXRjaCAoeCkge31cbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAnJztcbn1cblxudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxudmFyIGxvZ2dlZFR5cGVGYWlsdXJlcyA9IHt9O1xudmFyIFJlYWN0RGVidWdDdXJyZW50RnJhbWUgPSBSZWFjdFNoYXJlZEludGVybmFscy5SZWFjdERlYnVnQ3VycmVudEZyYW1lO1xuXG5mdW5jdGlvbiBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudChlbGVtZW50KSB7XG4gIHtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgdmFyIG93bmVyID0gZWxlbWVudC5fb3duZXI7XG4gICAgICB2YXIgc3RhY2sgPSBkZXNjcmliZVVua25vd25FbGVtZW50VHlwZUZyYW1lSW5ERVYoZWxlbWVudC50eXBlLCBlbGVtZW50Ll9zb3VyY2UsIG93bmVyID8gb3duZXIudHlwZSA6IG51bGwpO1xuICAgICAgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZS5zZXRFeHRyYVN0YWNrRnJhbWUoc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBSZWFjdERlYnVnQ3VycmVudEZyYW1lLnNldEV4dHJhU3RhY2tGcmFtZShudWxsKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tQcm9wVHlwZXModHlwZVNwZWNzLCB2YWx1ZXMsIGxvY2F0aW9uLCBjb21wb25lbnROYW1lLCBlbGVtZW50KSB7XG4gIHtcbiAgICAvLyAkRmxvd0ZpeE1lIFRoaXMgaXMgb2theSBidXQgRmxvdyBkb2Vzbid0IGtub3cgaXQuXG4gICAgdmFyIGhhcyA9IEZ1bmN0aW9uLmNhbGwuYmluZChoYXNPd25Qcm9wZXJ0eSk7XG5cbiAgICBmb3IgKHZhciB0eXBlU3BlY05hbWUgaW4gdHlwZVNwZWNzKSB7XG4gICAgICBpZiAoaGFzKHR5cGVTcGVjcywgdHlwZVNwZWNOYW1lKSkge1xuICAgICAgICB2YXIgZXJyb3IkMSA9IHZvaWQgMDsgLy8gUHJvcCB0eXBlIHZhbGlkYXRpb24gbWF5IHRocm93LiBJbiBjYXNlIHRoZXkgZG8sIHdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgLy8gZmFpbCB0aGUgcmVuZGVyIHBoYXNlIHdoZXJlIGl0IGRpZG4ndCBmYWlsIGJlZm9yZS4gU28gd2UgbG9nIGl0LlxuICAgICAgICAvLyBBZnRlciB0aGVzZSBoYXZlIGJlZW4gY2xlYW5lZCB1cCwgd2UnbGwgbGV0IHRoZW0gdGhyb3cuXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsbHkgYW4gaW52YXJpYW50IHRoYXQgZ2V0cyBjYXVnaHQuIEl0J3MgdGhlIHNhbWVcbiAgICAgICAgICAvLyBiZWhhdmlvciBhcyB3aXRob3V0IHRoaXMgc3RhdGVtZW50IGV4Y2VwdCB3aXRoIGEgYmV0dGVyIG1lc3NhZ2UuXG4gICAgICAgICAgaWYgKHR5cGVvZiB0eXBlU3BlY3NbdHlwZVNwZWNOYW1lXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWludGVybmFsL3Byb2QtZXJyb3ItY29kZXNcbiAgICAgICAgICAgIHZhciBlcnIgPSBFcnJvcigoY29tcG9uZW50TmFtZSB8fCAnUmVhY3QgY2xhc3MnKSArICc6ICcgKyBsb2NhdGlvbiArICcgdHlwZSBgJyArIHR5cGVTcGVjTmFtZSArICdgIGlzIGludmFsaWQ7ICcgKyAnaXQgbXVzdCBiZSBhIGZ1bmN0aW9uLCB1c3VhbGx5IGZyb20gdGhlIGBwcm9wLXR5cGVzYCBwYWNrYWdlLCBidXQgcmVjZWl2ZWQgYCcgKyB0eXBlb2YgdHlwZVNwZWNzW3R5cGVTcGVjTmFtZV0gKyAnYC4nICsgJ1RoaXMgb2Z0ZW4gaGFwcGVucyBiZWNhdXNlIG9mIHR5cG9zIHN1Y2ggYXMgYFByb3BUeXBlcy5mdW5jdGlvbmAgaW5zdGVhZCBvZiBgUHJvcFR5cGVzLmZ1bmNgLicpO1xuICAgICAgICAgICAgZXJyLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXJyb3IkMSA9IHR5cGVTcGVjc1t0eXBlU3BlY05hbWVdKHZhbHVlcywgdHlwZVNwZWNOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgbnVsbCwgJ1NFQ1JFVF9ET19OT1RfUEFTU19USElTX09SX1lPVV9XSUxMX0JFX0ZJUkVEJyk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgZXJyb3IkMSA9IGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVycm9yJDEgJiYgIShlcnJvciQxIGluc3RhbmNlb2YgRXJyb3IpKSB7XG4gICAgICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQoZWxlbWVudCk7XG5cbiAgICAgICAgICBlcnJvcignJXM6IHR5cGUgc3BlY2lmaWNhdGlvbiBvZiAlcycgKyAnIGAlc2AgaXMgaW52YWxpZDsgdGhlIHR5cGUgY2hlY2tlciAnICsgJ2Z1bmN0aW9uIG11c3QgcmV0dXJuIGBudWxsYCBvciBhbiBgRXJyb3JgIGJ1dCByZXR1cm5lZCBhICVzLiAnICsgJ1lvdSBtYXkgaGF2ZSBmb3Jnb3R0ZW4gdG8gcGFzcyBhbiBhcmd1bWVudCB0byB0aGUgdHlwZSBjaGVja2VyICcgKyAnY3JlYXRvciAoYXJyYXlPZiwgaW5zdGFuY2VPZiwgb2JqZWN0T2YsIG9uZU9mLCBvbmVPZlR5cGUsIGFuZCAnICsgJ3NoYXBlIGFsbCByZXF1aXJlIGFuIGFyZ3VtZW50KS4nLCBjb21wb25lbnROYW1lIHx8ICdSZWFjdCBjbGFzcycsIGxvY2F0aW9uLCB0eXBlU3BlY05hbWUsIHR5cGVvZiBlcnJvciQxKTtcblxuICAgICAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50KG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVycm9yJDEgaW5zdGFuY2VvZiBFcnJvciAmJiAhKGVycm9yJDEubWVzc2FnZSBpbiBsb2dnZWRUeXBlRmFpbHVyZXMpKSB7XG4gICAgICAgICAgLy8gT25seSBtb25pdG9yIHRoaXMgZmFpbHVyZSBvbmNlIGJlY2F1c2UgdGhlcmUgdGVuZHMgdG8gYmUgYSBsb3Qgb2YgdGhlXG4gICAgICAgICAgLy8gc2FtZSBlcnJvci5cbiAgICAgICAgICBsb2dnZWRUeXBlRmFpbHVyZXNbZXJyb3IkMS5tZXNzYWdlXSA9IHRydWU7XG4gICAgICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQoZWxlbWVudCk7XG5cbiAgICAgICAgICBlcnJvcignRmFpbGVkICVzIHR5cGU6ICVzJywgbG9jYXRpb24sIGVycm9yJDEubWVzc2FnZSk7XG5cbiAgICAgICAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG52YXIgaXNBcnJheUltcGwgPSBBcnJheS5pc0FycmF5OyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVkZWNsYXJlXG5cbmZ1bmN0aW9uIGlzQXJyYXkoYSkge1xuICByZXR1cm4gaXNBcnJheUltcGwoYSk7XG59XG5cbi8qXG4gKiBUaGUgYCcnICsgdmFsdWVgIHBhdHRlcm4gKHVzZWQgaW4gaW4gcGVyZi1zZW5zaXRpdmUgY29kZSkgdGhyb3dzIGZvciBTeW1ib2xcbiAqIGFuZCBUZW1wb3JhbC4qIHR5cGVzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L3B1bGwvMjIwNjQuXG4gKlxuICogVGhlIGZ1bmN0aW9ucyBpbiB0aGlzIG1vZHVsZSB3aWxsIHRocm93IGFuIGVhc2llci10by11bmRlcnN0YW5kLFxuICogZWFzaWVyLXRvLWRlYnVnIGV4Y2VwdGlvbiB3aXRoIGEgY2xlYXIgZXJyb3JzIG1lc3NhZ2UgbWVzc2FnZSBleHBsYWluaW5nIHRoZVxuICogcHJvYmxlbS4gKEluc3RlYWQgb2YgYSBjb25mdXNpbmcgZXhjZXB0aW9uIHRocm93biBpbnNpZGUgdGhlIGltcGxlbWVudGF0aW9uXG4gKiBvZiB0aGUgYHZhbHVlYCBvYmplY3QpLlxuICovXG4vLyAkRmxvd0ZpeE1lIG9ubHkgY2FsbGVkIGluIERFViwgc28gdm9pZCByZXR1cm4gaXMgbm90IHBvc3NpYmxlLlxuZnVuY3Rpb24gdHlwZU5hbWUodmFsdWUpIHtcbiAge1xuICAgIC8vIHRvU3RyaW5nVGFnIGlzIG5lZWRlZCBmb3IgbmFtZXNwYWNlZCB0eXBlcyBsaWtlIFRlbXBvcmFsLkluc3RhbnRcbiAgICB2YXIgaGFzVG9TdHJpbmdUYWcgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC50b1N0cmluZ1RhZztcbiAgICB2YXIgdHlwZSA9IGhhc1RvU3RyaW5nVGFnICYmIHZhbHVlW1N5bWJvbC50b1N0cmluZ1RhZ10gfHwgdmFsdWUuY29uc3RydWN0b3IubmFtZSB8fCAnT2JqZWN0JztcbiAgICByZXR1cm4gdHlwZTtcbiAgfVxufSAvLyAkRmxvd0ZpeE1lIG9ubHkgY2FsbGVkIGluIERFViwgc28gdm9pZCByZXR1cm4gaXMgbm90IHBvc3NpYmxlLlxuXG5cbmZ1bmN0aW9uIHdpbGxDb2VyY2lvblRocm93KHZhbHVlKSB7XG4gIHtcbiAgICB0cnkge1xuICAgICAgdGVzdFN0cmluZ0NvZXJjaW9uKHZhbHVlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdGVzdFN0cmluZ0NvZXJjaW9uKHZhbHVlKSB7XG4gIC8vIElmIHlvdSBlbmRlZCB1cCBoZXJlIGJ5IGZvbGxvd2luZyBhbiBleGNlcHRpb24gY2FsbCBzdGFjaywgaGVyZSdzIHdoYXQnc1xuICAvLyBoYXBwZW5lZDogeW91IHN1cHBsaWVkIGFuIG9iamVjdCBvciBzeW1ib2wgdmFsdWUgdG8gUmVhY3QgKGFzIGEgcHJvcCwga2V5LFxuICAvLyBET00gYXR0cmlidXRlLCBDU1MgcHJvcGVydHksIHN0cmluZyByZWYsIGV0Yy4pIGFuZCB3aGVuIFJlYWN0IHRyaWVkIHRvXG4gIC8vIGNvZXJjZSBpdCB0byBhIHN0cmluZyB1c2luZyBgJycgKyB2YWx1ZWAsIGFuIGV4Y2VwdGlvbiB3YXMgdGhyb3duLlxuICAvL1xuICAvLyBUaGUgbW9zdCBjb21tb24gdHlwZXMgdGhhdCB3aWxsIGNhdXNlIHRoaXMgZXhjZXB0aW9uIGFyZSBgU3ltYm9sYCBpbnN0YW5jZXNcbiAgLy8gYW5kIFRlbXBvcmFsIG9iamVjdHMgbGlrZSBgVGVtcG9yYWwuSW5zdGFudGAuIEJ1dCBhbnkgb2JqZWN0IHRoYXQgaGFzIGFcbiAgLy8gYHZhbHVlT2ZgIG9yIGBbU3ltYm9sLnRvUHJpbWl0aXZlXWAgbWV0aG9kIHRoYXQgdGhyb3dzIHdpbGwgYWxzbyBjYXVzZSB0aGlzXG4gIC8vIGV4Y2VwdGlvbi4gKExpYnJhcnkgYXV0aG9ycyBkbyB0aGlzIHRvIHByZXZlbnQgdXNlcnMgZnJvbSB1c2luZyBidWlsdC1pblxuICAvLyBudW1lcmljIG9wZXJhdG9ycyBsaWtlIGArYCBvciBjb21wYXJpc29uIG9wZXJhdG9ycyBsaWtlIGA+PWAgYmVjYXVzZSBjdXN0b21cbiAgLy8gbWV0aG9kcyBhcmUgbmVlZGVkIHRvIHBlcmZvcm0gYWNjdXJhdGUgYXJpdGhtZXRpYyBvciBjb21wYXJpc29uLilcbiAgLy9cbiAgLy8gVG8gZml4IHRoZSBwcm9ibGVtLCBjb2VyY2UgdGhpcyBvYmplY3Qgb3Igc3ltYm9sIHZhbHVlIHRvIGEgc3RyaW5nIGJlZm9yZVxuICAvLyBwYXNzaW5nIGl0IHRvIFJlYWN0LiBUaGUgbW9zdCByZWxpYWJsZSB3YXkgaXMgdXN1YWxseSBgU3RyaW5nKHZhbHVlKWAuXG4gIC8vXG4gIC8vIFRvIGZpbmQgd2hpY2ggdmFsdWUgaXMgdGhyb3dpbmcsIGNoZWNrIHRoZSBicm93c2VyIG9yIGRlYnVnZ2VyIGNvbnNvbGUuXG4gIC8vIEJlZm9yZSB0aGlzIGV4Y2VwdGlvbiB3YXMgdGhyb3duLCB0aGVyZSBzaG91bGQgYmUgYGNvbnNvbGUuZXJyb3JgIG91dHB1dFxuICAvLyB0aGF0IHNob3dzIHRoZSB0eXBlIChTeW1ib2wsIFRlbXBvcmFsLlBsYWluRGF0ZSwgZXRjLikgdGhhdCBjYXVzZWQgdGhlXG4gIC8vIHByb2JsZW0gYW5kIGhvdyB0aGF0IHR5cGUgd2FzIHVzZWQ6IGtleSwgYXRycmlidXRlLCBpbnB1dCB2YWx1ZSBwcm9wLCBldGMuXG4gIC8vIEluIG1vc3QgY2FzZXMsIHRoaXMgY29uc29sZSBvdXRwdXQgYWxzbyBzaG93cyB0aGUgY29tcG9uZW50IGFuZCBpdHNcbiAgLy8gYW5jZXN0b3IgY29tcG9uZW50cyB3aGVyZSB0aGUgZXhjZXB0aW9uIGhhcHBlbmVkLlxuICAvL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaW50ZXJuYWwvc2FmZS1zdHJpbmctY29lcmNpb25cbiAgcmV0dXJuICcnICsgdmFsdWU7XG59XG5mdW5jdGlvbiBjaGVja0tleVN0cmluZ0NvZXJjaW9uKHZhbHVlKSB7XG4gIHtcbiAgICBpZiAod2lsbENvZXJjaW9uVGhyb3codmFsdWUpKSB7XG4gICAgICBlcnJvcignVGhlIHByb3ZpZGVkIGtleSBpcyBhbiB1bnN1cHBvcnRlZCB0eXBlICVzLicgKyAnIFRoaXMgdmFsdWUgbXVzdCBiZSBjb2VyY2VkIHRvIGEgc3RyaW5nIGJlZm9yZSBiZWZvcmUgdXNpbmcgaXQgaGVyZS4nLCB0eXBlTmFtZSh2YWx1ZSkpO1xuXG4gICAgICByZXR1cm4gdGVzdFN0cmluZ0NvZXJjaW9uKHZhbHVlKTsgLy8gdGhyb3cgKHRvIGhlbHAgY2FsbGVycyBmaW5kIHRyb3VibGVzaG9vdGluZyBjb21tZW50cylcbiAgICB9XG4gIH1cbn1cblxudmFyIFJlYWN0Q3VycmVudE93bmVyID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMuUmVhY3RDdXJyZW50T3duZXI7XG52YXIgUkVTRVJWRURfUFJPUFMgPSB7XG4gIGtleTogdHJ1ZSxcbiAgcmVmOiB0cnVlLFxuICBfX3NlbGY6IHRydWUsXG4gIF9fc291cmNlOiB0cnVlXG59O1xudmFyIHNwZWNpYWxQcm9wS2V5V2FybmluZ1Nob3duO1xudmFyIHNwZWNpYWxQcm9wUmVmV2FybmluZ1Nob3duO1xudmFyIGRpZFdhcm5BYm91dFN0cmluZ1JlZnM7XG5cbntcbiAgZGlkV2FybkFib3V0U3RyaW5nUmVmcyA9IHt9O1xufVxuXG5mdW5jdGlvbiBoYXNWYWxpZFJlZihjb25maWcpIHtcbiAge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbmZpZywgJ3JlZicpKSB7XG4gICAgICB2YXIgZ2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjb25maWcsICdyZWYnKS5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgJiYgZ2V0dGVyLmlzUmVhY3RXYXJuaW5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlnLnJlZiAhPT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBoYXNWYWxpZEtleShjb25maWcpIHtcbiAge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbmZpZywgJ2tleScpKSB7XG4gICAgICB2YXIgZ2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjb25maWcsICdrZXknKS5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgJiYgZ2V0dGVyLmlzUmVhY3RXYXJuaW5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlnLmtleSAhPT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB3YXJuSWZTdHJpbmdSZWZDYW5ub3RCZUF1dG9Db252ZXJ0ZWQoY29uZmlnLCBzZWxmKSB7XG4gIHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5yZWYgPT09ICdzdHJpbmcnICYmIFJlYWN0Q3VycmVudE93bmVyLmN1cnJlbnQgJiYgc2VsZiAmJiBSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50LnN0YXRlTm9kZSAhPT0gc2VsZikge1xuICAgICAgdmFyIGNvbXBvbmVudE5hbWUgPSBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUoUmVhY3RDdXJyZW50T3duZXIuY3VycmVudC50eXBlKTtcblxuICAgICAgaWYgKCFkaWRXYXJuQWJvdXRTdHJpbmdSZWZzW2NvbXBvbmVudE5hbWVdKSB7XG4gICAgICAgIGVycm9yKCdDb21wb25lbnQgXCIlc1wiIGNvbnRhaW5zIHRoZSBzdHJpbmcgcmVmIFwiJXNcIi4gJyArICdTdXBwb3J0IGZvciBzdHJpbmcgcmVmcyB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgbWFqb3IgcmVsZWFzZS4gJyArICdUaGlzIGNhc2UgY2Fubm90IGJlIGF1dG9tYXRpY2FsbHkgY29udmVydGVkIHRvIGFuIGFycm93IGZ1bmN0aW9uLiAnICsgJ1dlIGFzayB5b3UgdG8gbWFudWFsbHkgZml4IHRoaXMgY2FzZSBieSB1c2luZyB1c2VSZWYoKSBvciBjcmVhdGVSZWYoKSBpbnN0ZWFkLiAnICsgJ0xlYXJuIG1vcmUgYWJvdXQgdXNpbmcgcmVmcyBzYWZlbHkgaGVyZTogJyArICdodHRwczovL3JlYWN0anMub3JnL2xpbmsvc3RyaWN0LW1vZGUtc3RyaW5nLXJlZicsIGdldENvbXBvbmVudE5hbWVGcm9tVHlwZShSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50LnR5cGUpLCBjb25maWcucmVmKTtcblxuICAgICAgICBkaWRXYXJuQWJvdXRTdHJpbmdSZWZzW2NvbXBvbmVudE5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKSB7XG4gIHtcbiAgICB2YXIgd2FybkFib3V0QWNjZXNzaW5nS2V5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFzcGVjaWFsUHJvcEtleVdhcm5pbmdTaG93bikge1xuICAgICAgICBzcGVjaWFsUHJvcEtleVdhcm5pbmdTaG93biA9IHRydWU7XG5cbiAgICAgICAgZXJyb3IoJyVzOiBga2V5YCBpcyBub3QgYSBwcm9wLiBUcnlpbmcgdG8gYWNjZXNzIGl0IHdpbGwgcmVzdWx0ICcgKyAnaW4gYHVuZGVmaW5lZGAgYmVpbmcgcmV0dXJuZWQuIElmIHlvdSBuZWVkIHRvIGFjY2VzcyB0aGUgc2FtZSAnICsgJ3ZhbHVlIHdpdGhpbiB0aGUgY2hpbGQgY29tcG9uZW50LCB5b3Ugc2hvdWxkIHBhc3MgaXQgYXMgYSBkaWZmZXJlbnQgJyArICdwcm9wLiAoaHR0cHM6Ly9yZWFjdGpzLm9yZy9saW5rL3NwZWNpYWwtcHJvcHMpJywgZGlzcGxheU5hbWUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3YXJuQWJvdXRBY2Nlc3NpbmdLZXkuaXNSZWFjdFdhcm5pbmcgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9wcywgJ2tleScsIHtcbiAgICAgIGdldDogd2FybkFib3V0QWNjZXNzaW5nS2V5LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lUmVmUHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKSB7XG4gIHtcbiAgICB2YXIgd2FybkFib3V0QWNjZXNzaW5nUmVmID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFzcGVjaWFsUHJvcFJlZldhcm5pbmdTaG93bikge1xuICAgICAgICBzcGVjaWFsUHJvcFJlZldhcm5pbmdTaG93biA9IHRydWU7XG5cbiAgICAgICAgZXJyb3IoJyVzOiBgcmVmYCBpcyBub3QgYSBwcm9wLiBUcnlpbmcgdG8gYWNjZXNzIGl0IHdpbGwgcmVzdWx0ICcgKyAnaW4gYHVuZGVmaW5lZGAgYmVpbmcgcmV0dXJuZWQuIElmIHlvdSBuZWVkIHRvIGFjY2VzcyB0aGUgc2FtZSAnICsgJ3ZhbHVlIHdpdGhpbiB0aGUgY2hpbGQgY29tcG9uZW50LCB5b3Ugc2hvdWxkIHBhc3MgaXQgYXMgYSBkaWZmZXJlbnQgJyArICdwcm9wLiAoaHR0cHM6Ly9yZWFjdGpzLm9yZy9saW5rL3NwZWNpYWwtcHJvcHMpJywgZGlzcGxheU5hbWUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3YXJuQWJvdXRBY2Nlc3NpbmdSZWYuaXNSZWFjdFdhcm5pbmcgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9wcywgJ3JlZicsIHtcbiAgICAgIGdldDogd2FybkFib3V0QWNjZXNzaW5nUmVmLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbn1cbi8qKlxuICogRmFjdG9yeSBtZXRob2QgdG8gY3JlYXRlIGEgbmV3IFJlYWN0IGVsZW1lbnQuIFRoaXMgbm8gbG9uZ2VyIGFkaGVyZXMgdG9cbiAqIHRoZSBjbGFzcyBwYXR0ZXJuLCBzbyBkbyBub3QgdXNlIG5ldyB0byBjYWxsIGl0LiBBbHNvLCBpbnN0YW5jZW9mIGNoZWNrXG4gKiB3aWxsIG5vdCB3b3JrLiBJbnN0ZWFkIHRlc3QgJCR0eXBlb2YgZmllbGQgYWdhaW5zdCBTeW1ib2wuZm9yKCdyZWFjdC5lbGVtZW50JykgdG8gY2hlY2tcbiAqIGlmIHNvbWV0aGluZyBpcyBhIFJlYWN0IEVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHsqfSB0eXBlXG4gKiBAcGFyYW0geyp9IHByb3BzXG4gKiBAcGFyYW0geyp9IGtleVxuICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSByZWZcbiAqIEBwYXJhbSB7Kn0gb3duZXJcbiAqIEBwYXJhbSB7Kn0gc2VsZiBBICp0ZW1wb3JhcnkqIGhlbHBlciB0byBkZXRlY3QgcGxhY2VzIHdoZXJlIGB0aGlzYCBpc1xuICogZGlmZmVyZW50IGZyb20gdGhlIGBvd25lcmAgd2hlbiBSZWFjdC5jcmVhdGVFbGVtZW50IGlzIGNhbGxlZCwgc28gdGhhdCB3ZVxuICogY2FuIHdhcm4uIFdlIHdhbnQgdG8gZ2V0IHJpZCBvZiBvd25lciBhbmQgcmVwbGFjZSBzdHJpbmcgYHJlZmBzIHdpdGggYXJyb3dcbiAqIGZ1bmN0aW9ucywgYW5kIGFzIGxvbmcgYXMgYHRoaXNgIGFuZCBvd25lciBhcmUgdGhlIHNhbWUsIHRoZXJlIHdpbGwgYmUgbm9cbiAqIGNoYW5nZSBpbiBiZWhhdmlvci5cbiAqIEBwYXJhbSB7Kn0gc291cmNlIEFuIGFubm90YXRpb24gb2JqZWN0IChhZGRlZCBieSBhIHRyYW5zcGlsZXIgb3Igb3RoZXJ3aXNlKVxuICogaW5kaWNhdGluZyBmaWxlbmFtZSwgbGluZSBudW1iZXIsIGFuZC9vciBvdGhlciBpbmZvcm1hdGlvbi5cbiAqIEBpbnRlcm5hbFxuICovXG5cblxudmFyIFJlYWN0RWxlbWVudCA9IGZ1bmN0aW9uICh0eXBlLCBrZXksIHJlZiwgc2VsZiwgc291cmNlLCBvd25lciwgcHJvcHMpIHtcbiAgdmFyIGVsZW1lbnQgPSB7XG4gICAgLy8gVGhpcyB0YWcgYWxsb3dzIHVzIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IHRoaXMgYXMgYSBSZWFjdCBFbGVtZW50XG4gICAgJCR0eXBlb2Y6IFJFQUNUX0VMRU1FTlRfVFlQRSxcbiAgICAvLyBCdWlsdC1pbiBwcm9wZXJ0aWVzIHRoYXQgYmVsb25nIG9uIHRoZSBlbGVtZW50XG4gICAgdHlwZTogdHlwZSxcbiAgICBrZXk6IGtleSxcbiAgICByZWY6IHJlZixcbiAgICBwcm9wczogcHJvcHMsXG4gICAgLy8gUmVjb3JkIHRoZSBjb21wb25lbnQgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIHRoaXMgZWxlbWVudC5cbiAgICBfb3duZXI6IG93bmVyXG4gIH07XG5cbiAge1xuICAgIC8vIFRoZSB2YWxpZGF0aW9uIGZsYWcgaXMgY3VycmVudGx5IG11dGF0aXZlLiBXZSBwdXQgaXQgb25cbiAgICAvLyBhbiBleHRlcm5hbCBiYWNraW5nIHN0b3JlIHNvIHRoYXQgd2UgY2FuIGZyZWV6ZSB0aGUgd2hvbGUgb2JqZWN0LlxuICAgIC8vIFRoaXMgY2FuIGJlIHJlcGxhY2VkIHdpdGggYSBXZWFrTWFwIG9uY2UgdGhleSBhcmUgaW1wbGVtZW50ZWQgaW5cbiAgICAvLyBjb21tb25seSB1c2VkIGRldmVsb3BtZW50IGVudmlyb25tZW50cy5cbiAgICBlbGVtZW50Ll9zdG9yZSA9IHt9OyAvLyBUbyBtYWtlIGNvbXBhcmluZyBSZWFjdEVsZW1lbnRzIGVhc2llciBmb3IgdGVzdGluZyBwdXJwb3Nlcywgd2UgbWFrZVxuICAgIC8vIHRoZSB2YWxpZGF0aW9uIGZsYWcgbm9uLWVudW1lcmFibGUgKHdoZXJlIHBvc3NpYmxlLCB3aGljaCBzaG91bGRcbiAgICAvLyBpbmNsdWRlIGV2ZXJ5IGVudmlyb25tZW50IHdlIHJ1biB0ZXN0cyBpbiksIHNvIHRoZSB0ZXN0IGZyYW1ld29ya1xuICAgIC8vIGlnbm9yZXMgaXQuXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudC5fc3RvcmUsICd2YWxpZGF0ZWQnLCB7XG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiBmYWxzZVxuICAgIH0pOyAvLyBzZWxmIGFuZCBzb3VyY2UgYXJlIERFViBvbmx5IHByb3BlcnRpZXMuXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ19zZWxmJywge1xuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IHNlbGZcbiAgICB9KTsgLy8gVHdvIGVsZW1lbnRzIGNyZWF0ZWQgaW4gdHdvIGRpZmZlcmVudCBwbGFjZXMgc2hvdWxkIGJlIGNvbnNpZGVyZWRcbiAgICAvLyBlcXVhbCBmb3IgdGVzdGluZyBwdXJwb3NlcyBhbmQgdGhlcmVmb3JlIHdlIGhpZGUgaXQgZnJvbSBlbnVtZXJhdGlvbi5cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnX3NvdXJjZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBzb3VyY2VcbiAgICB9KTtcblxuICAgIGlmIChPYmplY3QuZnJlZXplKSB7XG4gICAgICBPYmplY3QuZnJlZXplKGVsZW1lbnQucHJvcHMpO1xuICAgICAgT2JqZWN0LmZyZWV6ZShlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZWxlbWVudDtcbn07XG4vKipcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWFjdGpzL3JmY3MvcHVsbC8xMDdcbiAqIEBwYXJhbSB7Kn0gdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKi9cblxuZnVuY3Rpb24ganN4REVWKHR5cGUsIGNvbmZpZywgbWF5YmVLZXksIHNvdXJjZSwgc2VsZikge1xuICB7XG4gICAgdmFyIHByb3BOYW1lOyAvLyBSZXNlcnZlZCBuYW1lcyBhcmUgZXh0cmFjdGVkXG5cbiAgICB2YXIgcHJvcHMgPSB7fTtcbiAgICB2YXIga2V5ID0gbnVsbDtcbiAgICB2YXIgcmVmID0gbnVsbDsgLy8gQ3VycmVudGx5LCBrZXkgY2FuIGJlIHNwcmVhZCBpbiBhcyBhIHByb3AuIFRoaXMgY2F1c2VzIGEgcG90ZW50aWFsXG4gICAgLy8gaXNzdWUgaWYga2V5IGlzIGFsc28gZXhwbGljaXRseSBkZWNsYXJlZCAoaWUuIDxkaXYgey4uLnByb3BzfSBrZXk9XCJIaVwiIC8+XG4gICAgLy8gb3IgPGRpdiBrZXk9XCJIaVwiIHsuLi5wcm9wc30gLz4gKS4gV2Ugd2FudCB0byBkZXByZWNhdGUga2V5IHNwcmVhZCxcbiAgICAvLyBidXQgYXMgYW4gaW50ZXJtZWRpYXJ5IHN0ZXAsIHdlIHdpbGwgdXNlIGpzeERFViBmb3IgZXZlcnl0aGluZyBleGNlcHRcbiAgICAvLyA8ZGl2IHsuLi5wcm9wc30ga2V5PVwiSGlcIiAvPiwgYmVjYXVzZSB3ZSBhcmVuJ3QgY3VycmVudGx5IGFibGUgdG8gdGVsbCBpZlxuICAgIC8vIGtleSBpcyBleHBsaWNpdGx5IGRlY2xhcmVkIHRvIGJlIHVuZGVmaW5lZCBvciBub3QuXG5cbiAgICBpZiAobWF5YmVLZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAge1xuICAgICAgICBjaGVja0tleVN0cmluZ0NvZXJjaW9uKG1heWJlS2V5KTtcbiAgICAgIH1cblxuICAgICAga2V5ID0gJycgKyBtYXliZUtleTtcbiAgICB9XG5cbiAgICBpZiAoaGFzVmFsaWRLZXkoY29uZmlnKSkge1xuICAgICAge1xuICAgICAgICBjaGVja0tleVN0cmluZ0NvZXJjaW9uKGNvbmZpZy5rZXkpO1xuICAgICAgfVxuXG4gICAgICBrZXkgPSAnJyArIGNvbmZpZy5rZXk7XG4gICAgfVxuXG4gICAgaWYgKGhhc1ZhbGlkUmVmKGNvbmZpZykpIHtcbiAgICAgIHJlZiA9IGNvbmZpZy5yZWY7XG4gICAgICB3YXJuSWZTdHJpbmdSZWZDYW5ub3RCZUF1dG9Db252ZXJ0ZWQoY29uZmlnLCBzZWxmKTtcbiAgICB9IC8vIFJlbWFpbmluZyBwcm9wZXJ0aWVzIGFyZSBhZGRlZCB0byBhIG5ldyBwcm9wcyBvYmplY3RcblxuXG4gICAgZm9yIChwcm9wTmFtZSBpbiBjb25maWcpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbmZpZywgcHJvcE5hbWUpICYmICFSRVNFUlZFRF9QUk9QUy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gY29uZmlnW3Byb3BOYW1lXTtcbiAgICAgIH1cbiAgICB9IC8vIFJlc29sdmUgZGVmYXVsdCBwcm9wc1xuXG5cbiAgICBpZiAodHlwZSAmJiB0eXBlLmRlZmF1bHRQcm9wcykge1xuICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHR5cGUuZGVmYXVsdFByb3BzO1xuXG4gICAgICBmb3IgKHByb3BOYW1lIGluIGRlZmF1bHRQcm9wcykge1xuICAgICAgICBpZiAocHJvcHNbcHJvcE5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBkZWZhdWx0UHJvcHNbcHJvcE5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGtleSB8fCByZWYpIHtcbiAgICAgIHZhciBkaXNwbGF5TmFtZSA9IHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nID8gdHlwZS5kaXNwbGF5TmFtZSB8fCB0eXBlLm5hbWUgfHwgJ1Vua25vd24nIDogdHlwZTtcblxuICAgICAgaWYgKGtleSkge1xuICAgICAgICBkZWZpbmVLZXlQcm9wV2FybmluZ0dldHRlcihwcm9wcywgZGlzcGxheU5hbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVmKSB7XG4gICAgICAgIGRlZmluZVJlZlByb3BXYXJuaW5nR2V0dGVyKHByb3BzLCBkaXNwbGF5TmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFJlYWN0RWxlbWVudCh0eXBlLCBrZXksIHJlZiwgc2VsZiwgc291cmNlLCBSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50LCBwcm9wcyk7XG4gIH1cbn1cblxudmFyIFJlYWN0Q3VycmVudE93bmVyJDEgPSBSZWFjdFNoYXJlZEludGVybmFscy5SZWFjdEN1cnJlbnRPd25lcjtcbnZhciBSZWFjdERlYnVnQ3VycmVudEZyYW1lJDEgPSBSZWFjdFNoYXJlZEludGVybmFscy5SZWFjdERlYnVnQ3VycmVudEZyYW1lO1xuXG5mdW5jdGlvbiBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCQxKGVsZW1lbnQpIHtcbiAge1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICB2YXIgb3duZXIgPSBlbGVtZW50Ll9vd25lcjtcbiAgICAgIHZhciBzdGFjayA9IGRlc2NyaWJlVW5rbm93bkVsZW1lbnRUeXBlRnJhbWVJbkRFVihlbGVtZW50LnR5cGUsIGVsZW1lbnQuX3NvdXJjZSwgb3duZXIgPyBvd25lci50eXBlIDogbnVsbCk7XG4gICAgICBSZWFjdERlYnVnQ3VycmVudEZyYW1lJDEuc2V0RXh0cmFTdGFja0ZyYW1lKHN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSQxLnNldEV4dHJhU3RhY2tGcmFtZShudWxsKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIHByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duO1xuXG57XG4gIHByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duID0gZmFsc2U7XG59XG4vKipcbiAqIFZlcmlmaWVzIHRoZSBvYmplY3QgaXMgYSBSZWFjdEVsZW1lbnQuXG4gKiBTZWUgaHR0cHM6Ly9yZWFjdGpzLm9yZy9kb2NzL3JlYWN0LWFwaS5odG1sI2lzdmFsaWRlbGVtZW50XG4gKiBAcGFyYW0gez9vYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBgb2JqZWN0YCBpcyBhIFJlYWN0RWxlbWVudC5cbiAqIEBmaW5hbFxuICovXG5cblxuZnVuY3Rpb24gaXNWYWxpZEVsZW1lbnQob2JqZWN0KSB7XG4gIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0ICE9PSBudWxsICYmIG9iamVjdC4kJHR5cGVvZiA9PT0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlY2xhcmF0aW9uRXJyb3JBZGRlbmR1bSgpIHtcbiAge1xuICAgIGlmIChSZWFjdEN1cnJlbnRPd25lciQxLmN1cnJlbnQpIHtcbiAgICAgIHZhciBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKFJlYWN0Q3VycmVudE93bmVyJDEuY3VycmVudC50eXBlKTtcblxuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuICdcXG5cXG5DaGVjayB0aGUgcmVuZGVyIG1ldGhvZCBvZiBgJyArIG5hbWUgKyAnYC4nO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTb3VyY2VJbmZvRXJyb3JBZGRlbmR1bShzb3VyY2UpIHtcbiAge1xuICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGZpbGVOYW1lID0gc291cmNlLmZpbGVOYW1lLnJlcGxhY2UoL14uKltcXFxcXFwvXS8sICcnKTtcbiAgICAgIHZhciBsaW5lTnVtYmVyID0gc291cmNlLmxpbmVOdW1iZXI7XG4gICAgICByZXR1cm4gJ1xcblxcbkNoZWNrIHlvdXIgY29kZSBhdCAnICsgZmlsZU5hbWUgKyAnOicgKyBsaW5lTnVtYmVyICsgJy4nO1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxufVxuLyoqXG4gKiBXYXJuIGlmIHRoZXJlJ3Mgbm8ga2V5IGV4cGxpY2l0bHkgc2V0IG9uIGR5bmFtaWMgYXJyYXlzIG9mIGNoaWxkcmVuIG9yXG4gKiBvYmplY3Qga2V5cyBhcmUgbm90IHZhbGlkLiBUaGlzIGFsbG93cyB1cyB0byBrZWVwIHRyYWNrIG9mIGNoaWxkcmVuIGJldHdlZW5cbiAqIHVwZGF0ZXMuXG4gKi9cblxuXG52YXIgb3duZXJIYXNLZXlVc2VXYXJuaW5nID0ge307XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRDb21wb25lbnRFcnJvckluZm8ocGFyZW50VHlwZSkge1xuICB7XG4gICAgdmFyIGluZm8gPSBnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0oKTtcblxuICAgIGlmICghaW5mbykge1xuICAgICAgdmFyIHBhcmVudE5hbWUgPSB0eXBlb2YgcGFyZW50VHlwZSA9PT0gJ3N0cmluZycgPyBwYXJlbnRUeXBlIDogcGFyZW50VHlwZS5kaXNwbGF5TmFtZSB8fCBwYXJlbnRUeXBlLm5hbWU7XG5cbiAgICAgIGlmIChwYXJlbnROYW1lKSB7XG4gICAgICAgIGluZm8gPSBcIlxcblxcbkNoZWNrIHRoZSB0b3AtbGV2ZWwgcmVuZGVyIGNhbGwgdXNpbmcgPFwiICsgcGFyZW50TmFtZSArIFwiPi5cIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5mbztcbiAgfVxufVxuLyoqXG4gKiBXYXJuIGlmIHRoZSBlbGVtZW50IGRvZXNuJ3QgaGF2ZSBhbiBleHBsaWNpdCBrZXkgYXNzaWduZWQgdG8gaXQuXG4gKiBUaGlzIGVsZW1lbnQgaXMgaW4gYW4gYXJyYXkuIFRoZSBhcnJheSBjb3VsZCBncm93IGFuZCBzaHJpbmsgb3IgYmVcbiAqIHJlb3JkZXJlZC4gQWxsIGNoaWxkcmVuIHRoYXQgaGF2ZW4ndCBhbHJlYWR5IGJlZW4gdmFsaWRhdGVkIGFyZSByZXF1aXJlZCB0b1xuICogaGF2ZSBhIFwia2V5XCIgcHJvcGVydHkgYXNzaWduZWQgdG8gaXQuIEVycm9yIHN0YXR1c2VzIGFyZSBjYWNoZWQgc28gYSB3YXJuaW5nXG4gKiB3aWxsIG9ubHkgYmUgc2hvd24gb25jZS5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwYXJhbSB7UmVhY3RFbGVtZW50fSBlbGVtZW50IEVsZW1lbnQgdGhhdCByZXF1aXJlcyBhIGtleS5cbiAqIEBwYXJhbSB7Kn0gcGFyZW50VHlwZSBlbGVtZW50J3MgcGFyZW50J3MgdHlwZS5cbiAqL1xuXG5cbmZ1bmN0aW9uIHZhbGlkYXRlRXhwbGljaXRLZXkoZWxlbWVudCwgcGFyZW50VHlwZSkge1xuICB7XG4gICAgaWYgKCFlbGVtZW50Ll9zdG9yZSB8fCBlbGVtZW50Ll9zdG9yZS52YWxpZGF0ZWQgfHwgZWxlbWVudC5rZXkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVsZW1lbnQuX3N0b3JlLnZhbGlkYXRlZCA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRDb21wb25lbnRFcnJvckluZm8gPSBnZXRDdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvKHBhcmVudFR5cGUpO1xuXG4gICAgaWYgKG93bmVySGFzS2V5VXNlV2FybmluZ1tjdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG93bmVySGFzS2V5VXNlV2FybmluZ1tjdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvXSA9IHRydWU7IC8vIFVzdWFsbHkgdGhlIGN1cnJlbnQgb3duZXIgaXMgdGhlIG9mZmVuZGVyLCBidXQgaWYgaXQgYWNjZXB0cyBjaGlsZHJlbiBhcyBhXG4gICAgLy8gcHJvcGVydHksIGl0IG1heSBiZSB0aGUgY3JlYXRvciBvZiB0aGUgY2hpbGQgdGhhdCdzIHJlc3BvbnNpYmxlIGZvclxuICAgIC8vIGFzc2lnbmluZyBpdCBhIGtleS5cblxuICAgIHZhciBjaGlsZE93bmVyID0gJyc7XG5cbiAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50Ll9vd25lciAmJiBlbGVtZW50Ll9vd25lciAhPT0gUmVhY3RDdXJyZW50T3duZXIkMS5jdXJyZW50KSB7XG4gICAgICAvLyBHaXZlIHRoZSBjb21wb25lbnQgdGhhdCBvcmlnaW5hbGx5IGNyZWF0ZWQgdGhpcyBjaGlsZC5cbiAgICAgIGNoaWxkT3duZXIgPSBcIiBJdCB3YXMgcGFzc2VkIGEgY2hpbGQgZnJvbSBcIiArIGdldENvbXBvbmVudE5hbWVGcm9tVHlwZShlbGVtZW50Ll9vd25lci50eXBlKSArIFwiLlwiO1xuICAgIH1cblxuICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50JDEoZWxlbWVudCk7XG5cbiAgICBlcnJvcignRWFjaCBjaGlsZCBpbiBhIGxpc3Qgc2hvdWxkIGhhdmUgYSB1bmlxdWUgXCJrZXlcIiBwcm9wLicgKyAnJXMlcyBTZWUgaHR0cHM6Ly9yZWFjdGpzLm9yZy9saW5rL3dhcm5pbmcta2V5cyBmb3IgbW9yZSBpbmZvcm1hdGlvbi4nLCBjdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvLCBjaGlsZE93bmVyKTtcblxuICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50JDEobnVsbCk7XG4gIH1cbn1cbi8qKlxuICogRW5zdXJlIHRoYXQgZXZlcnkgZWxlbWVudCBlaXRoZXIgaXMgcGFzc2VkIGluIGEgc3RhdGljIGxvY2F0aW9uLCBpbiBhblxuICogYXJyYXkgd2l0aCBhbiBleHBsaWNpdCBrZXlzIHByb3BlcnR5IGRlZmluZWQsIG9yIGluIGFuIG9iamVjdCBsaXRlcmFsXG4gKiB3aXRoIHZhbGlkIGtleSBwcm9wZXJ0eS5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwYXJhbSB7UmVhY3ROb2RlfSBub2RlIFN0YXRpY2FsbHkgcGFzc2VkIGNoaWxkIG9mIGFueSB0eXBlLlxuICogQHBhcmFtIHsqfSBwYXJlbnRUeXBlIG5vZGUncyBwYXJlbnQncyB0eXBlLlxuICovXG5cblxuZnVuY3Rpb24gdmFsaWRhdGVDaGlsZEtleXMobm9kZSwgcGFyZW50VHlwZSkge1xuICB7XG4gICAgaWYgKHR5cGVvZiBub2RlICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChpc0FycmF5KG5vZGUpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gbm9kZVtpXTtcblxuICAgICAgICBpZiAoaXNWYWxpZEVsZW1lbnQoY2hpbGQpKSB7XG4gICAgICAgICAgdmFsaWRhdGVFeHBsaWNpdEtleShjaGlsZCwgcGFyZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVmFsaWRFbGVtZW50KG5vZGUpKSB7XG4gICAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBhc3NlZCBpbiBhIHZhbGlkIGxvY2F0aW9uLlxuICAgICAgaWYgKG5vZGUuX3N0b3JlKSB7XG4gICAgICAgIG5vZGUuX3N0b3JlLnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChub2RlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4obm9kZSk7XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmF0b3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBFbnRyeSBpdGVyYXRvcnMgdXNlZCB0byBwcm92aWRlIGltcGxpY2l0IGtleXMsXG4gICAgICAgIC8vIGJ1dCBub3cgd2UgcHJpbnQgYSBzZXBhcmF0ZSB3YXJuaW5nIGZvciB0aGVtIGxhdGVyLlxuICAgICAgICBpZiAoaXRlcmF0b3JGbiAhPT0gbm9kZS5lbnRyaWVzKSB7XG4gICAgICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmF0b3JGbi5jYWxsKG5vZGUpO1xuICAgICAgICAgIHZhciBzdGVwO1xuXG4gICAgICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICAgICAgaWYgKGlzVmFsaWRFbGVtZW50KHN0ZXAudmFsdWUpKSB7XG4gICAgICAgICAgICAgIHZhbGlkYXRlRXhwbGljaXRLZXkoc3RlcC52YWx1ZSwgcGFyZW50VHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4vKipcbiAqIEdpdmVuIGFuIGVsZW1lbnQsIHZhbGlkYXRlIHRoYXQgaXRzIHByb3BzIGZvbGxvdyB0aGUgcHJvcFR5cGVzIGRlZmluaXRpb24sXG4gKiBwcm92aWRlZCBieSB0aGUgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge1JlYWN0RWxlbWVudH0gZWxlbWVudFxuICovXG5cblxuZnVuY3Rpb24gdmFsaWRhdGVQcm9wVHlwZXMoZWxlbWVudCkge1xuICB7XG4gICAgdmFyIHR5cGUgPSBlbGVtZW50LnR5cGU7XG5cbiAgICBpZiAodHlwZSA9PT0gbnVsbCB8fCB0eXBlID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHByb3BUeXBlcztcblxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcHJvcFR5cGVzID0gdHlwZS5wcm9wVHlwZXM7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgKHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0ZPUldBUkRfUkVGX1RZUEUgfHwgLy8gTm90ZTogTWVtbyBvbmx5IGNoZWNrcyBvdXRlciBwcm9wcyBoZXJlLlxuICAgIC8vIElubmVyIHByb3BzIGFyZSBjaGVja2VkIGluIHRoZSByZWNvbmNpbGVyLlxuICAgIHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX01FTU9fVFlQRSkpIHtcbiAgICAgIHByb3BUeXBlcyA9IHR5cGUucHJvcFR5cGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHByb3BUeXBlcykge1xuICAgICAgLy8gSW50ZW50aW9uYWxseSBpbnNpZGUgdG8gYXZvaWQgdHJpZ2dlcmluZyBsYXp5IGluaXRpYWxpemVyczpcbiAgICAgIHZhciBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKHR5cGUpO1xuICAgICAgY2hlY2tQcm9wVHlwZXMocHJvcFR5cGVzLCBlbGVtZW50LnByb3BzLCAncHJvcCcsIG5hbWUsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSBpZiAodHlwZS5Qcm9wVHlwZXMgIT09IHVuZGVmaW5lZCAmJiAhcHJvcFR5cGVzTWlzc3BlbGxXYXJuaW5nU2hvd24pIHtcbiAgICAgIHByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duID0gdHJ1ZTsgLy8gSW50ZW50aW9uYWxseSBpbnNpZGUgdG8gYXZvaWQgdHJpZ2dlcmluZyBsYXp5IGluaXRpYWxpemVyczpcblxuICAgICAgdmFyIF9uYW1lID0gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKHR5cGUpO1xuXG4gICAgICBlcnJvcignQ29tcG9uZW50ICVzIGRlY2xhcmVkIGBQcm9wVHlwZXNgIGluc3RlYWQgb2YgYHByb3BUeXBlc2AuIERpZCB5b3UgbWlzc3BlbGwgdGhlIHByb3BlcnR5IGFzc2lnbm1lbnQ/JywgX25hbWUgfHwgJ1Vua25vd24nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHR5cGUuZ2V0RGVmYXVsdFByb3BzID09PSAnZnVuY3Rpb24nICYmICF0eXBlLmdldERlZmF1bHRQcm9wcy5pc1JlYWN0Q2xhc3NBcHByb3ZlZCkge1xuICAgICAgZXJyb3IoJ2dldERlZmF1bHRQcm9wcyBpcyBvbmx5IHVzZWQgb24gY2xhc3NpYyBSZWFjdC5jcmVhdGVDbGFzcyAnICsgJ2RlZmluaXRpb25zLiBVc2UgYSBzdGF0aWMgcHJvcGVydHkgbmFtZWQgYGRlZmF1bHRQcm9wc2AgaW5zdGVhZC4nKTtcbiAgICB9XG4gIH1cbn1cbi8qKlxuICogR2l2ZW4gYSBmcmFnbWVudCwgdmFsaWRhdGUgdGhhdCBpdCBjYW4gb25seSBiZSBwcm92aWRlZCB3aXRoIGZyYWdtZW50IHByb3BzXG4gKiBAcGFyYW0ge1JlYWN0RWxlbWVudH0gZnJhZ21lbnRcbiAqL1xuXG5cbmZ1bmN0aW9uIHZhbGlkYXRlRnJhZ21lbnRQcm9wcyhmcmFnbWVudCkge1xuICB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmcmFnbWVudC5wcm9wcyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuXG4gICAgICBpZiAoa2V5ICE9PSAnY2hpbGRyZW4nICYmIGtleSAhPT0gJ2tleScpIHtcbiAgICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQkMShmcmFnbWVudCk7XG5cbiAgICAgICAgZXJyb3IoJ0ludmFsaWQgcHJvcCBgJXNgIHN1cHBsaWVkIHRvIGBSZWFjdC5GcmFnbWVudGAuICcgKyAnUmVhY3QuRnJhZ21lbnQgY2FuIG9ubHkgaGF2ZSBga2V5YCBhbmQgYGNoaWxkcmVuYCBwcm9wcy4nLCBrZXkpO1xuXG4gICAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50JDEobnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmcmFnbWVudC5yZWYgIT09IG51bGwpIHtcbiAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50JDEoZnJhZ21lbnQpO1xuXG4gICAgICBlcnJvcignSW52YWxpZCBhdHRyaWJ1dGUgYHJlZmAgc3VwcGxpZWQgdG8gYFJlYWN0LkZyYWdtZW50YC4nKTtcblxuICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQkMShudWxsKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIGRpZFdhcm5BYm91dEtleVNwcmVhZCA9IHt9O1xuZnVuY3Rpb24ganN4V2l0aFZhbGlkYXRpb24odHlwZSwgcHJvcHMsIGtleSwgaXNTdGF0aWNDaGlsZHJlbiwgc291cmNlLCBzZWxmKSB7XG4gIHtcbiAgICB2YXIgdmFsaWRUeXBlID0gaXNWYWxpZEVsZW1lbnRUeXBlKHR5cGUpOyAvLyBXZSB3YXJuIGluIHRoaXMgY2FzZSBidXQgZG9uJ3QgdGhyb3cuIFdlIGV4cGVjdCB0aGUgZWxlbWVudCBjcmVhdGlvbiB0b1xuICAgIC8vIHN1Y2NlZWQgYW5kIHRoZXJlIHdpbGwgbGlrZWx5IGJlIGVycm9ycyBpbiByZW5kZXIuXG5cbiAgICBpZiAoIXZhbGlkVHlwZSkge1xuICAgICAgdmFyIGluZm8gPSAnJztcblxuICAgICAgaWYgKHR5cGUgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAhPT0gbnVsbCAmJiBPYmplY3Qua2V5cyh0eXBlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaW5mbyArPSAnIFlvdSBsaWtlbHkgZm9yZ290IHRvIGV4cG9ydCB5b3VyIGNvbXBvbmVudCBmcm9tIHRoZSBmaWxlICcgKyBcIml0J3MgZGVmaW5lZCBpbiwgb3IgeW91IG1pZ2h0IGhhdmUgbWl4ZWQgdXAgZGVmYXVsdCBhbmQgbmFtZWQgaW1wb3J0cy5cIjtcbiAgICAgIH1cblxuICAgICAgdmFyIHNvdXJjZUluZm8gPSBnZXRTb3VyY2VJbmZvRXJyb3JBZGRlbmR1bShzb3VyY2UpO1xuXG4gICAgICBpZiAoc291cmNlSW5mbykge1xuICAgICAgICBpbmZvICs9IHNvdXJjZUluZm87XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmZvICs9IGdldERlY2xhcmF0aW9uRXJyb3JBZGRlbmR1bSgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHlwZVN0cmluZztcblxuICAgICAgaWYgKHR5cGUgPT09IG51bGwpIHtcbiAgICAgICAgdHlwZVN0cmluZyA9ICdudWxsJztcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh0eXBlKSkge1xuICAgICAgICB0eXBlU3RyaW5nID0gJ2FycmF5JztcbiAgICAgIH0gZWxzZSBpZiAodHlwZSAhPT0gdW5kZWZpbmVkICYmIHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0VMRU1FTlRfVFlQRSkge1xuICAgICAgICB0eXBlU3RyaW5nID0gXCI8XCIgKyAoZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKHR5cGUudHlwZSkgfHwgJ1Vua25vd24nKSArIFwiIC8+XCI7XG4gICAgICAgIGluZm8gPSAnIERpZCB5b3UgYWNjaWRlbnRhbGx5IGV4cG9ydCBhIEpTWCBsaXRlcmFsIGluc3RlYWQgb2YgYSBjb21wb25lbnQ/JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGVTdHJpbmcgPSB0eXBlb2YgdHlwZTtcbiAgICAgIH1cblxuICAgICAgZXJyb3IoJ1JlYWN0LmpzeDogdHlwZSBpcyBpbnZhbGlkIC0tIGV4cGVjdGVkIGEgc3RyaW5nIChmb3IgJyArICdidWlsdC1pbiBjb21wb25lbnRzKSBvciBhIGNsYXNzL2Z1bmN0aW9uIChmb3IgY29tcG9zaXRlICcgKyAnY29tcG9uZW50cykgYnV0IGdvdDogJXMuJXMnLCB0eXBlU3RyaW5nLCBpbmZvKTtcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudCA9IGpzeERFVih0eXBlLCBwcm9wcywga2V5LCBzb3VyY2UsIHNlbGYpOyAvLyBUaGUgcmVzdWx0IGNhbiBiZSBudWxsaXNoIGlmIGEgbW9jayBvciBhIGN1c3RvbSBmdW5jdGlvbiBpcyB1c2VkLlxuICAgIC8vIFRPRE86IERyb3AgdGhpcyB3aGVuIHRoZXNlIGFyZSBubyBsb25nZXIgYWxsb3dlZCBhcyB0aGUgdHlwZSBhcmd1bWVudC5cblxuICAgIGlmIChlbGVtZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH0gLy8gU2tpcCBrZXkgd2FybmluZyBpZiB0aGUgdHlwZSBpc24ndCB2YWxpZCBzaW5jZSBvdXIga2V5IHZhbGlkYXRpb24gbG9naWNcbiAgICAvLyBkb2Vzbid0IGV4cGVjdCBhIG5vbi1zdHJpbmcvZnVuY3Rpb24gdHlwZSBhbmQgY2FuIHRocm93IGNvbmZ1c2luZyBlcnJvcnMuXG4gICAgLy8gV2UgZG9uJ3Qgd2FudCBleGNlcHRpb24gYmVoYXZpb3IgdG8gZGlmZmVyIGJldHdlZW4gZGV2IGFuZCBwcm9kLlxuICAgIC8vIChSZW5kZXJpbmcgd2lsbCB0aHJvdyB3aXRoIGEgaGVscGZ1bCBtZXNzYWdlIGFuZCBhcyBzb29uIGFzIHRoZSB0eXBlIGlzXG4gICAgLy8gZml4ZWQsIHRoZSBrZXkgd2FybmluZ3Mgd2lsbCBhcHBlYXIuKVxuXG5cbiAgICBpZiAodmFsaWRUeXBlKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBwcm9wcy5jaGlsZHJlbjtcblxuICAgICAgaWYgKGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzU3RhdGljQ2hpbGRyZW4pIHtcbiAgICAgICAgICBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFsaWRhdGVDaGlsZEtleXMoY2hpbGRyZW5baV0sIHR5cGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgICAgICAgICAgICBPYmplY3QuZnJlZXplKGNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IoJ1JlYWN0LmpzeDogU3RhdGljIGNoaWxkcmVuIHNob3VsZCBhbHdheXMgYmUgYW4gYXJyYXkuICcgKyAnWW91IGFyZSBsaWtlbHkgZXhwbGljaXRseSBjYWxsaW5nIFJlYWN0LmpzeHMgb3IgUmVhY3QuanN4REVWLiAnICsgJ1VzZSB0aGUgQmFiZWwgdHJhbnNmb3JtIGluc3RlYWQuJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbGlkYXRlQ2hpbGRLZXlzKGNoaWxkcmVuLCB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BzLCAna2V5JykpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudE5hbWUgPSBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUodHlwZSk7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocHJvcHMpLmZpbHRlcihmdW5jdGlvbiAoaykge1xuICAgICAgICAgIHJldHVybiBrICE9PSAna2V5JztcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBiZWZvcmVFeGFtcGxlID0ga2V5cy5sZW5ndGggPiAwID8gJ3trZXk6IHNvbWVLZXksICcgKyBrZXlzLmpvaW4oJzogLi4uLCAnKSArICc6IC4uLn0nIDogJ3trZXk6IHNvbWVLZXl9JztcblxuICAgICAgICBpZiAoIWRpZFdhcm5BYm91dEtleVNwcmVhZFtjb21wb25lbnROYW1lICsgYmVmb3JlRXhhbXBsZV0pIHtcbiAgICAgICAgICB2YXIgYWZ0ZXJFeGFtcGxlID0ga2V5cy5sZW5ndGggPiAwID8gJ3snICsga2V5cy5qb2luKCc6IC4uLiwgJykgKyAnOiAuLi59JyA6ICd7fSc7XG5cbiAgICAgICAgICBlcnJvcignQSBwcm9wcyBvYmplY3QgY29udGFpbmluZyBhIFwia2V5XCIgcHJvcCBpcyBiZWluZyBzcHJlYWQgaW50byBKU1g6XFxuJyArICcgIGxldCBwcm9wcyA9ICVzO1xcbicgKyAnICA8JXMgey4uLnByb3BzfSAvPlxcbicgKyAnUmVhY3Qga2V5cyBtdXN0IGJlIHBhc3NlZCBkaXJlY3RseSB0byBKU1ggd2l0aG91dCB1c2luZyBzcHJlYWQ6XFxuJyArICcgIGxldCBwcm9wcyA9ICVzO1xcbicgKyAnICA8JXMga2V5PXtzb21lS2V5fSB7Li4ucHJvcHN9IC8+JywgYmVmb3JlRXhhbXBsZSwgY29tcG9uZW50TmFtZSwgYWZ0ZXJFeGFtcGxlLCBjb21wb25lbnROYW1lKTtcblxuICAgICAgICAgIGRpZFdhcm5BYm91dEtleVNwcmVhZFtjb21wb25lbnROYW1lICsgYmVmb3JlRXhhbXBsZV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09IFJFQUNUX0ZSQUdNRU5UX1RZUEUpIHtcbiAgICAgIHZhbGlkYXRlRnJhZ21lbnRQcm9wcyhlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsaWRhdGVQcm9wVHlwZXMoZWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cbn0gLy8gVGhlc2UgdHdvIGZ1bmN0aW9ucyBleGlzdCB0byBzdGlsbCBnZXQgY2hpbGQgd2FybmluZ3MgaW4gZGV2XG4vLyBldmVuIHdpdGggdGhlIHByb2QgdHJhbnNmb3JtLiBUaGlzIG1lYW5zIHRoYXQganN4REVWIGlzIHB1cmVseVxuLy8gb3B0LWluIGJlaGF2aW9yIGZvciBiZXR0ZXIgbWVzc2FnZXMgYnV0IHRoYXQgd2Ugd29uJ3Qgc3RvcFxuLy8gZ2l2aW5nIHlvdSB3YXJuaW5ncyBpZiB5b3UgdXNlIHByb2R1Y3Rpb24gYXBpcy5cblxuZnVuY3Rpb24ganN4V2l0aFZhbGlkYXRpb25TdGF0aWModHlwZSwgcHJvcHMsIGtleSkge1xuICB7XG4gICAgcmV0dXJuIGpzeFdpdGhWYWxpZGF0aW9uKHR5cGUsIHByb3BzLCBrZXksIHRydWUpO1xuICB9XG59XG5mdW5jdGlvbiBqc3hXaXRoVmFsaWRhdGlvbkR5bmFtaWModHlwZSwgcHJvcHMsIGtleSkge1xuICB7XG4gICAgcmV0dXJuIGpzeFdpdGhWYWxpZGF0aW9uKHR5cGUsIHByb3BzLCBrZXksIGZhbHNlKTtcbiAgfVxufVxuXG52YXIganN4ID0gIGpzeFdpdGhWYWxpZGF0aW9uRHluYW1pYyA7IC8vIHdlIG1heSB3YW50IHRvIHNwZWNpYWwgY2FzZSBqc3hzIGludGVybmFsbHkgdG8gdGFrZSBhZHZhbnRhZ2Ugb2Ygc3RhdGljIGNoaWxkcmVuLlxuLy8gZm9yIG5vdyB3ZSBjYW4gc2hpcCBpZGVudGljYWwgcHJvZCBmdW5jdGlvbnNcblxudmFyIGpzeHMgPSAganN4V2l0aFZhbGlkYXRpb25TdGF0aWMgO1xuXG5leHBvcnRzLkZyYWdtZW50ID0gUkVBQ1RfRlJBR01FTlRfVFlQRTtcbmV4cG9ydHMuanN4ID0ganN4O1xuZXhwb3J0cy5qc3hzID0ganN4cztcbiAgfSkoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlSWQgfSBmcm9tICdyZWFjdCc7XG5cbnR5cGUgRmFpbHVyZUltYWdlUHJvcHMgPSB7XG4gIHN0Mz86IHN0cmluZztcbiAgc3QxNT86IHN0cmluZztcbiAgc3QxMT86IHN0cmluZztcbiAgc3QxPzogc3RyaW5nO1xuICBzdDE0Pzogc3RyaW5nO1xuICBzdDEyPzogc3RyaW5nO1xuICBzdDI/OiBzdHJpbmc7XG4gIHN0MjM/OiBzdHJpbmc7XG4gIHN0MjI/OiBzdHJpbmc7XG4gIHN0MjE/OiBzdHJpbmc7XG4gIHN0MjA/OiBzdHJpbmc7XG4gIHN0OD86IHN0cmluZztcbiAgc3QxOT86IHN0cmluZztcbiAgc3Q0Pzogc3RyaW5nO1xuICBzdDEzPzogc3RyaW5nO1xuICBzdHlsZT86IENTU1Byb3BlcnRpZXM7XG59O1xuXG5leHBvcnQgY29uc3QgRmFpbHVyZUltYWdlID0gKHtcbiAgc3QzID0gJyMwMzBDMUEnLFxuICBzdDE1ID0gJyMwMzBEMTknLFxuICBzdDExID0gJyMwQjE4MkInLFxuICBzdDEgPSAnIzE1MjczRicsXG4gIHN0MTQgPSAnIzFBMzI0QycsXG4gIHN0MTIgPSAnIzM4NEE2NicsXG4gIHN0MiA9ICcjRTNDRUM4JyxcbiAgc3QyMyA9ICcjRTRDOEJBJyxcbiAgc3QyMiA9ICcjRTZCNzkzJyxcbiAgc3QyMSA9ICcjRUE5QjU3JyxcbiAgc3QyMCA9ICcjRUQ4QTMwJyxcbiAgc3Q4ID0gJyNFRjQ4NDgnLFxuICBzdDE5ID0gJyNGRjUwNTAnLFxuICBzdDQgPSAnI0ZGQ0Q1MicsXG4gIHN0MTMgPSAnI0ZGRkZGRicsXG4gIC4uLnByb3BzXG59OiBGYWlsdXJlSW1hZ2VQcm9wcykgPT4ge1xuICBjb25zdCBhID0gdXNlSWQoKTtcbiAgY29uc3QgYiA9IHVzZUlkKCk7XG4gIGNvbnN0IGMgPSB1c2VJZCgpO1xuICBjb25zdCBlID0gdXNlSWQoKTtcblxuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD0nMCAwIDEzNjYgNzY4JyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSd4TWlkWU1pZCBzbGljZScgey4uLnByb3BzfT5cbiAgICAgIDxsaW5lYXJHcmFkaWVudFxuICAgICAgICBpZD17YX1cbiAgICAgICAgeDE9ezEwNDd9XG4gICAgICAgIHgyPXsxMDQ3fVxuICAgICAgICB5MT17MjEzLjQzfVxuICAgICAgICB5Mj17Mjg3LjAzfVxuICAgICAgICBncmFkaWVudFVuaXRzPSd1c2VyU3BhY2VPblVzZSdcbiAgICAgID5cbiAgICAgICAgPHN0b3Agc3RvcENvbG9yPXtzdDN9IG9mZnNldD17MH0gLz5cbiAgICAgICAgPHN0b3Agc3RvcENvbG9yPXtzdDEyfSBvZmZzZXQ9ezF9IC8+XG4gICAgICA8L2xpbmVhckdyYWRpZW50PlxuICAgICAgPGxpbmVhckdyYWRpZW50XG4gICAgICAgIGlkPXtifVxuICAgICAgICB4MT17MTAyLjk2fVxuICAgICAgICB4Mj17MTExLjd9XG4gICAgICAgIHkxPXs0Ny4xNjV9XG4gICAgICAgIHkyPXsyMTcuMDd9XG4gICAgICAgIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJ1xuICAgICAgPlxuICAgICAgICA8c3RvcCBzdG9wQ29sb3I9e3N0M30gb2Zmc2V0PXswfSAvPlxuICAgICAgICA8c3RvcCBzdG9wQ29sb3I9e3N0MTF9IG9mZnNldD17MX0gLz5cbiAgICAgIDwvbGluZWFyR3JhZGllbnQ+XG4gICAgICA8Y2xpcFBhdGggaWQ9e2N9PlxuICAgICAgICA8Y2lyY2xlIG9wYWNpdHk9ezAuM30gY3g9ezU1My40OX0gY3k9ezU0NC41fSByPXsxNDYuNDR9IC8+XG4gICAgICA8L2NsaXBQYXRoPlxuICAgICAgPGxpbmVhckdyYWRpZW50XG4gICAgICAgIGlkPXtlfVxuICAgICAgICB4MT17NTEwLjQ4fVxuICAgICAgICB4Mj17Mjk1Ljc3fVxuICAgICAgICB5MT17LTU5LjEyNH1cbiAgICAgICAgeTI9ey0yNzMuODN9XG4gICAgICAgIGdyYWRpZW50VHJhbnNmb3JtPSdtYXRyaXgoLjk4NjIgLS4xNjU1IC4xNjU1IC45ODYyIDEzOC45NyA3NDMuNjkpJ1xuICAgICAgICBncmFkaWVudFVuaXRzPSd1c2VyU3BhY2VPblVzZSdcbiAgICAgID5cbiAgICAgICAgPHN0b3Agc3RvcENvbG9yPXtzdDIwfSBvZmZzZXQ9ezB9IC8+XG4gICAgICAgIDxzdG9wIHN0b3BDb2xvcj17c3QyMX0gc3RvcE9wYWNpdHk9ezAuNzg0OH0gb2Zmc2V0PXswLjIxNTJ9IC8+XG4gICAgICAgIDxzdG9wIHN0b3BDb2xvcj17c3QyMn0gc3RvcE9wYWNpdHk9ezAuNDE0OH0gb2Zmc2V0PXswLjU4NTJ9IC8+XG4gICAgICAgIDxzdG9wIHN0b3BDb2xvcj17c3QyM30gc3RvcE9wYWNpdHk9ezAuMTQyN30gb2Zmc2V0PXswLjg1NzN9IC8+XG4gICAgICAgIDxzdG9wIHN0b3BDb2xvcj17c3QyfSBzdG9wT3BhY2l0eT17MH0gb2Zmc2V0PXsxfSAvPlxuICAgICAgPC9saW5lYXJHcmFkaWVudD5cbiAgICAgIDxnPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTAxMC4yIDUzMC44OGwxLjE1IDIuNzQtNTkuMzQgOC45OXMtMy45NS0yLjk5LTUuNjctNC42Ny0yLjMtMy4xNi0yLjMtMy4xNmMwLjYyIDAuODkgNy40MyAyLjkyIDguMzUgMi43MiAwLjkzLTAuMiAwLjQ0LTAuNDMtMS4xOC0xLjA5cy0xLjMtMS4wNC0xLjMtMS4wNGMyLjUxLTAuNzcgOS45MSAxLjM5IDkuOTEgMS4zOSAwLjA2LTAuNjUtNC41Mi0yLjUxLTQuMTItMi41OSAwLjQtMC4wNyAxLjY3IDAuMzEgMS43OSAwLjE2cy0wLjMzLTAuNzctMC4zMy0wLjc3YzEuNzMtMC40NCA3LjQxIDIuNTQgNy40MSAyLjU0IDAuMTUtMC41NS0zLjgxLTIuNzYtMy4wNy0zLjA3czMuOTMgMS40NiAzLjkyIDAuOTljLTAuMDEtMC40OC0xLjk0LTEuODctMS0xLjc5IDAuOTUgMC4wOCAzLjcyIDIuNTYgNC4wMSAyLjFzLTEuNS0yLjU0LTEuNS0yLjU0IDIuOTEgMS4zMiAzLjA0IDEuNSAzLjA0IDAuNTkgMy4xIDAuMThjMC4wNy0wLjQxLTEuMzEtMC45NC0xLjU0LTEuMDNzLTIuNzYtMC41MS0wLjkyLTAuODEgOC44NyAyLjEyIDguOTQgMS45NC0xLjc1LTEuNTItMi0yLjEzYy0wLjI2LTAuNjEtMC40NS0xLjA2LTAuNDUtMS4wNiAwLjg2IDAuNTUgNS42NyAzLjE4IDUuNjcgMy4xOHMtMi40My0zLjQzLTEuODgtMi41NiA1LjIzIDIuMTkgNS4yMyAyLjE5Yy0xLjQ2LTAuODUtMy44Ni0zLjUtMy44Ni0zLjUgMi4wNiAxLjQyIDkuMjggMi42OCA5LjI4IDIuNjgtMC4yOC0wLjg5LTIuNTktMS41Ny0yLjU5LTEuNTcgMS42My0xLjc5IDYuNDkgMC44NCA2LjQ5IDAuODQgMC4zLTAuNTktMC42Mi0xLjQ4LTAuNjItMS40OCAwLjg5LTAuMjggMi4wOCAwLjU5IDIuMDggMC41OS0wLjQ5LTEuMTctMi43NC0yLjE0LTIuNzQtMi4xNCA0LjEzLTEuOTMgOS4yNCAzLjQzIDkuMjQgMy40My0xLjI5LTEuMS0yLjU3LTQuMTQtMi41Ny00LjE0IDAuNzcgMC45NiA1IDIuMjkgNSAyLjI5IDEuMjUtMC4wNyAzLjYgMC41IDMuNiAwLjUnXG4gICAgICAgIC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezE0NC44MX0gY3k9ezQ4Ny45M30gcng9ezEuMX0gcnk9ezEuMDh9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezMyMi4zMn0gY3k9ezQ2OC45M30gcng9ezEuMX0gcnk9ezEuMDh9IC8+XG4gICAgICAgIDxyZWN0IGZpbGw9e3N0M30geD17LTAuNDV9IHk9ezAuMDl9IHdpZHRoPXsxMzY2LjF9IGhlaWdodD17NzY4LjJ9IC8+XG4gICAgICAgIDxjaXJjbGUgZmlsbD17c3Q0fSBjeD17NTUzLjQ5fSBjeT17NTQ0LjV9IHI9ezE0Ni40NH0gLz5cbiAgICAgICAgPGNpcmNsZSBmaWxsPXtgdXJsKCMke2V9KWB9IGN4PXs1NTMuNDl9IGN5PXs1NDQuNX0gcj17MTQ2LjQ0fSAvPlxuICAgICAgICA8ZyBvcGFjaXR5PXswLjN9PlxuICAgICAgICAgIDxnIGNsaXBQYXRoPXtgdXJsKCMke2N9KWB9PlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA0MDljMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNDE1LjM0YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDQyMS42OWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA0MjguMDNjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNDM0LjM3YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDQ0MC43MWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA0NDcuMDVjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNDUzLjM5YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDQ1OS43M2MxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA0NjYuMDdjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNDcyLjQyYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDQ3OC43NmMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA0ODUuMWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA0OTEuNDRjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNDk3Ljc4YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDUwNC4xMmMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA1MTAuNDZjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNTE2LjgxYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDUyMy4xNWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA1MjkuNDljMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNTM1LjgzYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDU0Mi4xN2MxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA1NDguNTFjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNTU0Ljg1YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDU2MS4yYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDU2Ny41NGMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA1NzMuODhjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNTgwLjIyYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDU4Ni41NmMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA1OTIuOWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA1OTkuMjRjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNjA1LjU5YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDYxMS45M2MxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA2MTguMjdjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNjI0LjYxYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDYzMC45NWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA2MzcuMjljMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNjQzLjYzYzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDY0OS45OGMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA2NTYuMzJjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNjYyLjY2YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDY2OWMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA2NzUuMzRjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICAgIHN0cm9rZT17c3Q4fVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17NX1cbiAgICAgICAgICAgICAgc3Ryb2tlTWl0ZXJsaW1pdD0nMTAnXG4gICAgICAgICAgICAgIGQ9J20zNzAuNzIgNjgxLjY4YzExLjk0LTAuNDIgMTEuODEtNC4xNCAyMy43NC00LjU2IDExLjk0LTAuNDIgMTIuMDcgMy4yOSAyNC4wMSAyLjg2IDExLjk0LTAuNDIgMTIuMDUgMi44MiAyMy45OSAyLjRzMTEuODQtMy4zMyAyMy43Ny0zLjc1YzExLjk0LTAuNDIgMTIgMS40MiAyMy45NCAxczExLjc4LTQuODkgMjMuNzItNS4zMSAxMi4wNiAyLjk0IDIzLjk5IDIuNTJjMTEuOTQtMC40MiAxMS44Ni0yLjc2IDIzLjc5LTMuMTggMTEuOTQtMC40MiAxMS45Mi0xLjA2IDIzLjg1LTEuNDkgMTEuOTQtMC40MiAxMi4xMSA0LjI5IDI0LjA1IDMuODdzMTEuOTUtMC4xMiAyMy44OS0wLjU0IDExLjgzLTMuNDQgMjMuNzctMy44N2MxMS45NC0wLjQyIDExLjg2LTIuNTkgMjMuOC0zLjAxczExLjk2IDAuMDUgMjMuOS0wLjM3IDEyLjA2IDIuOTcgMjQgMi41NSdcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgICBzdHJva2U9e3N0OH1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgICAgIHN0cm9rZU1pdGVybGltaXQ9JzEwJ1xuICAgICAgICAgICAgICBkPSdtMzcwLjcyIDY4OC4wMmMxMS45NC0wLjQyIDExLjgxLTQuMTQgMjMuNzQtNC41NiAxMS45NC0wLjQyIDEyLjA3IDMuMjkgMjQuMDEgMi44NiAxMS45NC0wLjQyIDEyLjA1IDIuODIgMjMuOTkgMi40czExLjg0LTMuMzMgMjMuNzctMy43NWMxMS45NC0wLjQyIDEyIDEuNDIgMjMuOTQgMXMxMS43OC00Ljg5IDIzLjcyLTUuMzEgMTIuMDYgMi45NCAyMy45OSAyLjUyYzExLjk0LTAuNDIgMTEuODYtMi43NiAyMy43OS0zLjE4IDExLjk0LTAuNDIgMTEuOTItMS4wNiAyMy44NS0xLjQ5IDExLjk0LTAuNDIgMTIuMTEgNC4yOSAyNC4wNSAzLjg3czExLjk1LTAuMTIgMjMuODktMC41NCAxMS44My0zLjQ0IDIzLjc3LTMuODdjMTEuOTQtMC40MiAxMS44Ni0yLjU5IDIzLjgtMy4wMXMxMS45NiAwLjA1IDIzLjktMC4zNyAxMi4wNiAyLjk3IDI0IDIuNTUnXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZmlsbD0nbm9uZSdcbiAgICAgICAgICAgICAgc3Ryb2tlPXtzdDh9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs1fVxuICAgICAgICAgICAgICBzdHJva2VNaXRlcmxpbWl0PScxMCdcbiAgICAgICAgICAgICAgZD0nbTM3MC43MiA2OTQuMzdjMTEuOTQtMC40MiAxMS44MS00LjE0IDIzLjc0LTQuNTYgMTEuOTQtMC40MiAxMi4wNyAzLjI5IDI0LjAxIDIuODYgMTEuOTQtMC40MiAxMi4wNSAyLjgyIDIzLjk5IDIuNHMxMS44NC0zLjMzIDIzLjc3LTMuNzVjMTEuOTQtMC40MiAxMiAxLjQyIDIzLjk0IDFzMTEuNzgtNC44OSAyMy43Mi01LjMxIDEyLjA2IDIuOTQgMjMuOTkgMi41MmMxMS45NC0wLjQyIDExLjg2LTIuNzYgMjMuNzktMy4xOCAxMS45NC0wLjQyIDExLjkyLTEuMDYgMjMuODUtMS40OSAxMS45NC0wLjQyIDEyLjExIDQuMjkgMjQuMDUgMy44N3MxMS45NS0wLjEyIDIzLjg5LTAuNTQgMTEuODMtMy40NCAyMy43Ny0zLjg3YzExLjk0LTAuNDIgMTEuODYtMi41OSAyMy44LTMuMDFzMTEuOTYgMC4wNSAyMy45LTAuMzcgMTIuMDYgMi45NyAyNCAyLjU1J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2c+XG4gICAgICAgIDwvZz5cbiAgICAgICAgPGVsbGlwc2VcbiAgICAgICAgICBvcGFjaXR5PXswLjR9XG4gICAgICAgICAgZmlsbD17c3QyfVxuICAgICAgICAgIGN4PXsyODMuNn1cbiAgICAgICAgICBjeT17MjM3LjczfVxuICAgICAgICAgIHJ4PXswLjR9XG4gICAgICAgICAgcnk9ezAuNH1cbiAgICAgICAgLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17Mzg5Ljc2fSBjeT17MjAwLjI5fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXszNDkuMzF9IGN5PXsyNzUuM30gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MjU2LjM4fSBjeT17MTQ3LjY3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MjYyLjAyfSBjeT17MjgxLjExfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NDMyLjYzfSBjeT17MTc3LjU0fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs0NTUuNH0gY3k9ezI2Ny40N30gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTI1LjExfSBjeT17MTkzLjg2fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NzMuNDV9IGN5PXsyNDYuNDd9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXstMC4yNX0gY3k9ezE1NS44NX0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezY5LjM1fSBjeT17MTg4LjYzfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MzA3Ljg4fSBjeT17MTUzLjR9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXszNi43NX0gY3k9ezIyNS43fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17OTk1LjY1fSBjeT17NDAwLjA1fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZVxuICAgICAgICAgIG9wYWNpdHk9ezAuNH1cbiAgICAgICAgICBmaWxsPXtzdDJ9XG4gICAgICAgICAgY3g9ezExMDEuOH1cbiAgICAgICAgICBjeT17MzYyLjZ9XG4gICAgICAgICAgcng9ezAuNH1cbiAgICAgICAgICByeT17MC40fVxuICAgICAgICAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMDYxLjR9IGN5PXs0MzcuNjJ9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezk2OC40M30gY3k9ezMwOS45OX0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezk3NC4wN30gY3k9ezQ0My40Mn0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezExNDQuN30gY3k9ezMzOS44NX0gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTE2Ny40fSBjeT17NDI5Ljc5fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs4MzcuMTZ9IGN5PXszNTYuMTh9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs3ODUuNX0gY3k9ezQwOC43OH0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezcxMS44fSBjeT17MzE4LjE3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NzgxLjR9IGN5PXszNTAuOTR9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMDE5Ljl9IGN5PXszMTUuNzF9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZVxuICAgICAgICAgIG9wYWNpdHk9ezAuMn1cbiAgICAgICAgICBmaWxsPXtzdDJ9XG4gICAgICAgICAgY3g9ezc0OC44fVxuICAgICAgICAgIGN5PXszODguMDF9XG4gICAgICAgICAgcng9ezAuNDF9XG4gICAgICAgICAgcnk9ezAuNH1cbiAgICAgICAgLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTAzNC4yfSBjeT17ODEuODN9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezkyOC4wMX0gY3k9ezExOS4yOH0gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17OTY4LjQ2fSBjeT17NDQuMjZ9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezEwNjEuNH0gY3k9ezE3MS44OX0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlXG4gICAgICAgICAgb3BhY2l0eT17MC4yfVxuICAgICAgICAgIGZpbGw9e3N0Mn1cbiAgICAgICAgICBjeD17MTA1NS44fVxuICAgICAgICAgIGN5PXszOC40NX1cbiAgICAgICAgICByeD17MC40MX1cbiAgICAgICAgICByeT17MC40fVxuICAgICAgICAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs4ODUuMTR9IGN5PXsxNDIuMDJ9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlXG4gICAgICAgICAgb3BhY2l0eT17MC4yfVxuICAgICAgICAgIGZpbGw9e3N0Mn1cbiAgICAgICAgICBjeD17ODYyLjM3fVxuICAgICAgICAgIGN5PXs1Mi4wOX1cbiAgICAgICAgICByeD17MC40fVxuICAgICAgICAgIHJ5PXswLjR9XG4gICAgICAgIC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezExOTIuN30gY3k9ezEyNS43fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTI0NC4zfSBjeT17NzMuMDl9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMzE4fSBjeT17MTYzLjcxfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTI0OC40fSBjeT17MTMwLjk0fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTAwOS45fSBjeT17MTY2LjE3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTI4MX0gY3k9ezkzLjg3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTkwLjU5fSBjeT17MzQ4LjcyfSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZVxuICAgICAgICAgIG9wYWNpdHk9ezAuMn1cbiAgICAgICAgICBmaWxsPXtzdDJ9XG4gICAgICAgICAgY3g9ezg0LjQ0fVxuICAgICAgICAgIGN5PXszODYuMTd9XG4gICAgICAgICAgcng9ezAuNH1cbiAgICAgICAgICByeT17MC40fVxuICAgICAgICAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMjQuODh9IGN5PXszMTEuMTV9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezIxNy44MX0gY3k9ezQzOC43OH0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezIxMi4xN30gY3k9ezMwNS4zNX0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezQxLjU3fSBjeT17NDA4LjkyfSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxOC43OX0gY3k9ezMxOC45OH0gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MzQ5LjA4fSBjeT17MzkyLjU5fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NDAwLjc0fSBjeT17MzM5Ljk5fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NDc0LjQ0fSBjeT17NDMwLjZ9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs0MDQuODR9IGN5PXszOTcuODN9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxNjYuMzF9IGN5PXs0MzMuMDZ9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs0MzcuNDR9IGN5PXszNjAuNzZ9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsyMjYuMDN9IGN5PXsxMDguMDR9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlXG4gICAgICAgICAgb3BhY2l0eT17MC40fVxuICAgICAgICAgIGZpbGw9e3N0Mn1cbiAgICAgICAgICBjeD17MTE5Ljg4fVxuICAgICAgICAgIGN5PXsxNDUuNDl9XG4gICAgICAgICAgcng9ezAuNH1cbiAgICAgICAgICByeT17MC40fVxuICAgICAgICAvPlxuICAgICAgICA8ZWxsaXBzZVxuICAgICAgICAgIG9wYWNpdHk9ezAuNH1cbiAgICAgICAgICBmaWxsPXtzdDJ9XG4gICAgICAgICAgY3g9ezE2MC4zMn1cbiAgICAgICAgICBjeT17NzAuNDd9XG4gICAgICAgICAgcng9ezAuNH1cbiAgICAgICAgICByeT17MC40fVxuICAgICAgICAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsyNTMuMjV9IGN5PXsxOTguMX0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezI0Ny42MX0gY3k9ezY0LjY3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NzcuMDF9IGN5PXsxNjguMjR9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezU0LjI0fSBjeT17NzguM30gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17Mzg0LjUyfSBjeT17MTUxLjkxfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17NDM2LjE5fSBjeT17OTkuMzF9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs1MDkuODh9IGN5PXsxODkuOTJ9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs0NDAuMjl9IGN5PXsxNTcuMTV9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsyMDEuNzZ9IGN5PXsxOTIuMzh9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs0NzIuODl9IGN5PXsxMjAuMDh9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs5NjQuM30gY3k9ezMzMS44Nn0gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17ODU4LjE1fSBjeT17MzY5LjN9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezg5OC41OX0gY3k9ezI5NC4yOX0gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17OTkxLjUyfSBjeT17NDIxLjkyfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17OTg1Ljg4fSBjeT17Mjg4LjQ4fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17ODE1LjI4fSBjeT17MzkyLjA1fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZVxuICAgICAgICAgIG9wYWNpdHk9ezAuMn1cbiAgICAgICAgICBmaWxsPXtzdDJ9XG4gICAgICAgICAgY3g9ezc5Mi41MX1cbiAgICAgICAgICBjeT17MzAyLjEyfVxuICAgICAgICAgIHJ4PXswLjR9XG4gICAgICAgICAgcnk9ezAuNH1cbiAgICAgICAgLz5cbiAgICAgICAgPGVsbGlwc2VcbiAgICAgICAgICBvcGFjaXR5PXswLjR9XG4gICAgICAgICAgZmlsbD17c3QyfVxuICAgICAgICAgIGN4PXsxMTIyLjh9XG4gICAgICAgICAgY3k9ezM3NS43M31cbiAgICAgICAgICByeD17MC40MX1cbiAgICAgICAgICByeT17MC40fVxuICAgICAgICAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMjQ4LjJ9IGN5PXs0MTMuNzR9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMTc4LjZ9IGN5PXszODAuOTZ9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXs5NDAuMDN9IGN5PXs0MTYuMn0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezg5MS4zNH0gY3k9ezM0My44OX0gcng9ezAuNDF9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezEyODAuM30gY3k9ezI2MS44MX0gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTI3NC4xfSBjeT17MzU5LjE1fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMzQ2fSBjeT17Mjk5LjM4fSByeD17MC40fSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMjUzLjF9IGN5PXsxNzEuNzV9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMjg3Ljh9IGN5PXszMDkuOTl9IHJ4PXswLjQxfSByeT17MC40fSAvPlxuICAgICAgICA8ZWxsaXBzZSBmaWxsPXtzdDJ9IGN4PXsxMzE3fSBjeT17MzM2LjR9IHJ4PXswLjR9IHJ5PXswLjR9IC8+XG4gICAgICAgIDxlbGxpcHNlIGZpbGw9e3N0Mn0gY3g9ezEzMzkuN30gY3k9ezQyNi4zM30gcng9ezAuNH0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTEyMS44fSBjeT17MjE3Ljk0fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTA3MC4yfSBjeT17MjcwLjU1fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17OTk2LjQ2fSBjeT17MTc5LjkzfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTA4Ny4zfSBjeT17MjMyLjgxfSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTMwNC42fSBjeT17MTc3LjQ3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPGVsbGlwc2UgZmlsbD17c3QyfSBjeD17MTAzMy40fSBjeT17MjQ5Ljc3fSByeD17MC40MX0gcnk9ezAuNH0gLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDExfVxuICAgICAgICAgIGQ9J20xNjUuNDIgNDc3LjQ2bDQwLjUzLTIwLjc0YzEuODctMC45NiA0LjE1LTAuNDkgNS40OSAxLjEzbDAuNiAwLjcyYzIuNjUgMy4yIDcuMjMgNC4wMSAxMC44MyAxLjkybDkuMTMtNS4zYzEuOTMtMS4xMiA0LjExLTEuNzEgNi4zNC0xLjcxaDQuMmMzLjQgMCA2Ljc0LTAuOCA5Ljc4LTIuMzJsNjMuMTktMzEuODJjMy41Ny0xLjggNy44MS0xLjcxIDExLjMgMC4yNCA1LjEgMi44NSAxMS4yNyAzLjA1IDE2LjU0IDAuNTRsMTguMjItOC42NmMyLjQxLTEuMTUgNS4yMS0xLjEzIDcuNjEgMC4wNWwzNy42IDE4LjQyYzIuNTEgMS4yMyA0Ljk1IDIuNTkgNy4zMSA0LjA4bDg1LjY3IDU0LjFjNC4yMiAyLjY3IDkuMTIgNC4wOCAxNC4xMSA0LjA4aDMuNDVjMy43NSAwIDcuNDctMC44IDEwLjg5LTIuMzVsNDAuNTctMTguMzRjMi0wLjkgNC4zLTAuODEgNi4yMSAwLjI2bDMxLjQ5IDE3LjU0YzIuNzUgMS41MyA1Ljg1IDIuMzQgOSAyLjM0aDQyLjE1YzIuOTEgMCA1Ljc2IDAuOCA4LjI2IDIuM2wxNy41MyAxMC41OWMzLjE5IDEuOTMgNi45NiAyLjY2IDEwLjY0IDIuMDdsNi45Mi0xLjEyYzMuODYtMC42MiA3LjgxLTAuMzUgMTEuNTUgMC43OSAyLjYzIDAuOCA1LjQ3IDAuNTQgNy45Mi0wLjcxbDc5LjMxLTQwLjgxYzIuODYtMS40NyA2LjIzLTEuNTQgOS4xNS0wLjE4bDEwNy43NSA1MC4xOGMzLjUyIDEuNjQgNy41NSAxLjggMTEuMTkgMC40M2wyMC44Ny03LjgzYzIuNjItMC45OCA1LjUyLTAuOTUgOC4xMiAwLjFsMTUuNCA2LjIzYzUuOTIgMi40IDEyLjI2IDMuNjMgMTguNjUgMy42M2g0Ljc4YzYuMjYgMCAxMi40Ni0xLjE4IDE4LjI4LTMuNDhsMjIuNzUtOC45OWMzLjUzLTEuMzkgNy40OC0xLjI2IDEwLjkxIDAuMzZsNi4yNSAyLjk2IDEzLjU3IDAuNzlzOC40MyAwLjk1IDIwLjQyIDAuODFjOC4zMy0wLjEgMTYuNjQtMS4wMyAyNC43OC0yLjc3bDEwMC4yNS0yMS40YzEyLjMtMi42MyAyNS4xNC0wLjc5IDM2LjIxIDUuMThsNzQuOTcgNDAuNCA0MS42NS0zLjg1LTAuNzYgMTA1LjY2LTEwNDEuNS01Mi43Mi0zMjMuNzYtNy4wOC0wLjEtMzIuMjggMTY1Ljg2LTYzLjQ0eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTMxOC41NCA0MTguMTNsOC44NSA3LjE5YzAuODYgMC43IDIuMDUgMC44NiAzLjA3IDAuNDFsNi42Mi0zLjc1cy0zLjU2LTAuNi04LjYtMS41N2MtMS41OC0wLjMxLTIuODQtMS45Ni00LjMtMi4yOC0yLjI2LTAuNDktNC41NCAwLjM4LTUuNjQgMHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J201MTUuNjQgNTA3LjRjLTI5LjExLTUuODYtNDQuMzctMTIuMTctNTEuMTktMTUuNjMtMS4xNi0wLjU5LTAuNy0yLjM1IDAuNi0yLjI5IDIuOTIgMC4xMiA1LjE0IDAuMDggNi43NC0wLjAxIDAuODgtMC4wNSAxLjEyLTEuMjQgMC4zMi0xLjYzLTMxLjk2LTE1LjQtMTA2LjQ1LTc3LjIzLTEwNi40NS03Ny4yMyAxNS4zOCAzLjIgMjYuMzggMTEuMzcgMjYuMzggMTEuMzcgMjIuMDUgMTIuMDMgMzYgMjAuMTggNjQuMDIgMzYuMjYgMCAwIDU4LjQ0IDM5LjgzIDYyLjY3IDQyLjIyIDIuNSAxLjQxIDEyLjMxIDUuNzcgMTkuOTIgOS4xIDEuMjUgMC41NSAwLjY2IDIuNDItMC42OCAyLjE2bC0yMi4zMy00LjMyeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTY1Ny42MiA0OTEuNjRsMTguMzcgMjEuMmMyLjY0IDMuMDUgNi45NCA0LjA1IDEwLjY2IDIuNDlsMjQuMTEtMTAuMTRzLTMuNzYtMC40Mi04LjY2IDAuMTRjLTUuMTUgMC41OS0xMS41MiAyLjE1LTE0LjMxIDEuMjQtNS40NS0xLjc2LTIwLjMyLTExLjg1LTIyLjYtMTMuMDItMy43Mi0xLjkxLTcuNTctMS45MS03LjU3LTEuOTF6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMjA3LjQ5IDQ1Ni4yNnMtOC40NSA4LjU4LTIuMDEgOC45MiAxNC44MS0zLjcxIDE0LjgxLTMuNzEtNC42MSAwLjE0LTguMjYtMi45YzAuMDEgMC0xLjk1LTIuNjgtNC41NC0yLjMxeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xMDk2LjQgNDU1LjA1YzAtMC40OS0xLjMtNC4zNy0xLjMtNC4zN3MtMS40Ni0zLjQtMS40Ni01LjY3LTEuMy02LjMyLTEuMy02Ljk2YzAtMC4yMS00LjEtMTAuMTQtNi4xNS0xMi4zMS0xLjc2LTEuODUtNC44OC0zLjEyLTcuMjQtMy44Ni0wLjA2LTAuMDUtMC4xLTAuMDktMC4xLTAuMDkgMy0yLjI4IDQuNzctNC41NSA0LjUzLTkuMzgtMC4xMS0yLjItMS4xLTUuNTgtMy4yNi03Ljk1LTEuNzktMS45NS00LjQ4LTMuNS04LjEyLTQuMTQtOC4wNC0xLjQxLTExLjk1IDMuNzgtMTMuMzEgOS4xN3MxLjAxIDkuMjEgMS4wMSA5LjIxYy0wLjQ4IDAtMC44IDAuNTctMC45OSAxLjA2LTAuNTgtMS4yMS0xLjIxLTIuNjYtMS4zMS0zLjQzLTAuMTktMS40OC0xLjk4LTMuMzctMi4wMS00Ljc4LTAuMDQtMS40MS0xLjI1LTIuMDktMS40OC0yLjY2cy0wLjgtMi45My0wLjc5LTMuNjEtMC44OC0xLjg2LTAuODgtMy43Ni0wLjQyLTIuNTEtMC40Mi0zLjg4LTAuMjMtMS45LTAuMjMtMi41NS0wLjY4LTEuODktMC42OC0yLjM0bC0wLjA4LTIuMjgtMC4zMS0xLjY1LTAuNTgtMC45M2MwLjMyLTAuNDggMC43My0xLjAzIDAuODUtMS4yMiAwLjIyLTAuMzMgMC45OS0yLjAxIDAuOTktMi4xMiAwLTAuMDggMC4yMy0xLjAzIDAuMzUtMS41IDAuMDQtMC4xNyAwLjA1LTAuMzUgMC4wNC0wLjUzLTAuMDctMC42NS0wLjI1LTIuMjgtMC4yNS0yLjQzIDAtMC4wOS0wLjEtMC41Ny0wLjMtMS4xLTAuMDctMC4xOC0wLjE1LTAuMzctMC4yNC0wLjU1LTAuMjItMC40NS0wLjUyLTAuODUtMC44Ny0wLjk3LTAuOTEtMC4zLTEuMTMgMC4zOS0xLjEzIDAuMzlsLTAuOC0wLjE3aC0wLjk5cy0wLjgzIDAuNDctMS4yNyAwLjQ3LTEuODcgMC43Mi0xLjkgMC44NWMtMC4wMyAwLjE0LTEuODIgMC45Ni0xLjgyIDAuOTZzLTAuNTggMC40MS0wLjU4IDAuNWMwIDAuMDgtMC40MSAwLjk0LTAuNDEgMS4xNnMwLjU1IDEuOTMgMC42MyAyLjIzIDAuODMgMi44OSAwLjgzIDIuODkgMC4wMyAwLjA2IDAuMDcgMC4xNWMtMC4wMyAwLjI3LTAuMDcgMC41NS0wLjEzIDAuODQtMC4wNCAwLjIxIDAuMjcgMC40OSAwLjQ4IDAuNzUtMC4wNiAwLjI1LTAuMTIgMC41Mi0wLjEyIDAuNjEgMCAwLjE3LTAuMTEgMS41My0wLjExIDEuNTNoMC4xNmMtMC4yIDAuNzMtMC40NiAxLjI0LTAuNTIgMS40OS0wLjI1IDEtMC40NSA5Ljc3LTAuNjEgMTAuNzUtMC4xNiAwLjk3IDEuMTMgNC43IDEuMTMgNS4xOHMxLjMgNC4zNyAxLjMgNC4zNyAxLjQ2IDMuNCAxLjQ2IDUuNjcgMS4zIDYuMzIgMS4zIDYuOTZjMCAwLjY1IDMuMzMgOS4wNiA2LjQxIDEyLjI5IDAuMjYgMS42NiAwLjQ4IDIuOTQgMC40OCAzLjA4IDAgMC4zMyAyLjA1IDQuNjggMi4wNSA1LjE4IDAgMC40OSAxLjE1IDYuMTYgMS4xNSA3LjA3IDAgMC45LTEuMjMgMi43OS0xLjIzIDYuMzMgMCAzLjUzIDAuMDggMy4zNyAwLjA4IDYuODJzLTEuMzEgNi4zMy0xLjMxIDguMDVjMCAxLjczLTAuMTYgMTEuMDktMC4xNiAxMS4wOWwwLjU4IDEuODF2My44NnMtMC40OSAzLjUzLTAuNDkgNC40NGMwIDAuOS0wLjkgMy42MS0xLjA2IDYuMTZzMS4wNiAyLjA1IDEuMDYgNC42OCAwLjgyIDMuMiAwLjgyIDUuNjdjMCAyLjQ2LTAuMzMgMS44OS0wLjMzIDIuNzlzLTAuNzQgMy41My0wLjc0IDUuODMgMC40OSAzLjg2IDAuNDkgNC42IDAuMzMgMS40OCAwLjMzIDIuMjIgMS4xNSAxLjczIDEuNCAxLjgxIDAuNTggMS43MyAwLjU4IDEuNzMtMi4yMi0xLjA3LTMuMzcgMi4zOCAyLjMgNS45MiAyLjMgNS45MmM2LjE2LTAuMzMgMTAuMTktMi4zOCAxMC4xOS0yLjM4bC0wLjMzLTMuMjlzLTAuODItMy4wNC0xLjEyLTMuNjFjLTAuMy0wLjU4IDAuMzktMi43MSAwLjEtMy4yOS0wLjI4LTAuNTggMC4xMi0yLjE0IDAuMDQtMi43MS0wLjA4LTAuNTggMC0zLjg2IDAtMy44NnMwLjktMi40NiAwLjktMy45NCAwLjgyLTQuNjggMC45LTUuMzQgMC44Mi00LjUyIDAuOTEtNS4yNiAxLjA2LTUuMzQgMS4wNi02LjQxLTAuMjUtNC44NS0wLjMzLTUuNjctMC4wOC0xLjk3IDAtMy45NCAxLjA3LTguMzggMS4wNy04LjM4djUuNDJzMC45OSAzLjYyIDAuOTkgNi4xNmMwIDIuNTUgMi40NiAzLjg2IDIuNjMgNS4xOCAwLjE2IDEuMzEgMC45IDIuODggMC45OSA0LjQ0IDAuMDggMS41NiAwLjkgMi4zIDAuOSAzLjA0czEuNDggMi4zOCAxLjQ4IDMuNDUgMC42NiAzLjI5IDAuNjYgNS40MmMwIDIuMTQgMC4zMyAyLjQ2IDAuMzMgNC45M3MwLjgyIDIuNDYgMC45IDMuNTMtMC40MSAyLjM4LTAuNDEgMi42MyAwLjQ5IDcuMzkgMS4yMyA4LjM4IDMuOTQgMC41OCA1LjkyIDBjMS45Ny0wLjU4IDEuODktNC4wMyAxLjg5LTQuNiAwLTAuNTgtMC40MS00LjY4LTAuNy02LjY2LTAuMjktMS45NyAwLjg2LTEwLjkzIDAuODYtMTAuOTNzMC4xNi0zLjEyIDAuMTYtMy42MS0wLjQxLTMuMzctMC40MS02LjMzLTAuNDktNi40MS0wLjYyLTcuMzFjLTAuMTItMC45LTAuMjEtMi43MSAwLTUuNzVzLTAuMjktMi4zLTAuNTMtNi42NWMtMC4yNS00LjM1LTEuMjQtMTMuNjYtMS4yNC0xMy42NnMtMC4zNC0xLjEtMC4zOC0yLjQ3LTAuODctMS44Mi0wLjg3LTIuMDljMC0wLjEyLTAuMTItMC43Mi0wLjI2LTEuNDdsMS41Ni0wLjAyYzAuNDYtMC4wMSAwLjgzLTAuMzggMC44My0wLjg0di02Ljk3YzAuMDUgMC4wNyAwLjEgMC4xNCAwLjEyIDAuMjEgMC4yMyAwLjU3IDAuOCAyLjkzIDAuNzkgMy42MXMwLjg4IDEuODYgMC44OCAzLjc2IDAuNDIgMi41MSAwLjQyIDMuODggMC4yMyAxLjkgMC4yMyAyLjU1LTAuMjMgMi4wMS0wLjIzIDIuNDd2My4yN2MwIDAuODQgMC40NiAzLjUgMC4zOCA0LjM3czEuMzcgMS4xOCAxLjUyIDAuMjcgMS4yOS0yLjAxIDEuMjktMi4wMSAwLjQ5IDAuNjggMC41MyAxLjQxYzAuMDQgMC43Mi0xLjI1IDIuNTgtMS40MSAzLjU3LTAuMTUgMC45OSAwLjI3IDEuMjUgMC4yNyAxLjI1IDEuMjkgMC40MiAyLjU4LTAuMzQgMi41OC0wLjM0LTAuMTUgMC45NSAwLjg3IDAuNzIgMC44NyAwLjcyIDAuNjgtMC4zNCAxLjI1LTEuODIgMS4yNS0xLjgyIDAuNDkgMC4xNSAwLjg4LTAuMiAwLjg4LTAuMiAxLjE2LTIuMDggMC41LTguOTkgMC43NS05Ljk4IDAuMTItMC41IDAuMjQtMi45NCAwLjM0LTUuMzhzMC4xOS00Ljg4IDAuMjctNS4zNmMwLjE0LTAuOTktMS4xNS00LjcxLTEuMTUtNS4yeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBmaWxsPXtzdDEzfVxuICAgICAgICAgIHBvaW50cz0nMTA4Mi44IDQzMC44NCAxMDYzLjEgNDMwLjM4IDEwNjYuNiA0MzIuODkgMTA4Ni41IDQzMy4xMydcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE0fVxuICAgICAgICAgIGQ9J20xMDQ5LjYgMzc4Ljc3czAuMTUtMC45IDAuNi0wLjkgMC45IDAuMTQgMS41NiAxLjU2YzAgMC0wLjQ3LTIuMDEtMS40OC0ycy0xLjA1IDAuNzgtMS4wNSAwLjc4IDAuNDMgMC4yNiAwLjM3IDAuNTZ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNDc5LjY4IDYwMC40NXMtMjIuMjUtMS4zLTMxLjQ2LTIuNjhjLTAuMy0wLjA0LTAuNDcgMC4zMi0wLjI1IDAuNTMgMC43MyAwLjY3IDEuOTggMS42NyAzLjQ1IDIuMjYgMCAwLTEwLjQ1LTEtMTguODUtMy4yNy0wLjYtMC4xNi0wLjk0IDAuNjYtMC40IDAuOTcgMy43MSAyLjEyIDkuNTQgNS4xNCAxNC45NSA2LjcybDMyLjU2LTQuNTN6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNDQ2LjU1IDYwNC44czYuOTggMS44MSAxMS4yNSAxLjQxYzAgMC04LjEzIDEuMDctMTYuMTMtMC44bDQuODgtMC42MXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xNTUgNjE3LjA2cy0yMS41MS01LjgzLTMwLjI1LTkuMDZjLTAuMjgtMC4xLTAuNTMgMC4yMi0wLjM1IDAuNDYgMC41NyAwLjggMS41OSAyLjA0IDIuOTEgMi45MSAwIDAtNy44OC0yLjQ1LTE1LjA3LTUuNzUtMC45OC0wLjQ1LTEuODEgMC44NS0wLjk4IDEuNTUgMy4wNyAyLjU3IDcuMDQgNS41NyAxMC45NCA3LjY1bDMyLjggMi4yNHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMjEuNjggNjE0LjUyczYuNDYgMy4yIDEwLjcyIDMuNjhjMCAwLTguMTgtMC42Mi0xNS42My00LjA5bDQuOTEgMC40MXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xOTQuMDggNjE4LjM1bC0xMi4wNy0wLjMxcy00LjM5LTIuNDQtOC42NC0yLjg3Yy0wLjE0LTAuMDEtMC4xOCAwLjE4LTAuMDUgMC4yMyAwLjg4IDAuMzIgMi4wNyAwLjg2IDEuOTYgMS40M2wtOC45OS0wLjZjLTAuOC0wLjA1LTEuNTktMC4xNy0yLjM2LTAuMzQtMi42Ny0wLjYtOS4wMy0yLjAzLTkuNjktMi4zMi0wLjg0LTAuMzYgMS44MyAxLjMgMy42NyAxLjg2IDAgMC00Ljg1LTAuNDItOS42Ny0zLjcgMCAwIDAuNTkgMS4zMyAyLjEgMi40NiAwLjc5IDAuNTkgMS40OSAxLjMgMi4xMSAyLjA3bDAuODYgMS4wNSAzOS4xOSAyLjE0IDEuNTgtMS4xeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTM1NC4zNCA2MTQuNDhzLTIuMjYtMC4xLTYuODkgMC42OS0yMC42IDEuMi0yNS40Ny0wLjU2YzAgMCAwLjI1IDEuMjkgMS4zMiAxLjkgMCAwLTE3LjY0IDAuNzQtMjMuMiAwLjY4cy05LjUgMC4xOC0xMi4yNi0xLjI0YzAgMCAxLjEyIDEuMzggMi4xIDEuNzMgMC42MSAwLjIyLTEuNTItMC4zMy0zLjcyLTEuMTQtMS4zMi0wLjQ4LTIuNjYtMS4wNi0zLjQ1LTEuNjEgMCAwIDIuMzkgMi44OSA0LjM3IDMuNDFsLTYuOTMgMC4xNC04LjQ4LTMuODFzLTEuNjEtNi4zNC00LjE1LTUuNjFjLTIuNTMgMC43MyAyLjExIDQuNDUgMi4xMSA0LjQ1cy01LjUtMi41My04LjMyLTIuOTFjMCAwLTAuNC00LjMyLTIuNDUtNC40OHMxLjA4IDMuOTUgMS4wOCAzLjk1bC0zLjAyLTAuMzEtMC4wNiAwLjYxIDQuMyAxLjI1cy0wLjg2IDEuMTktMi4xOSAxLjdjLTEuMzMgMC41IDAuMDMgMi42NiAxLjgxIDIgMS43OS0wLjY2IDEuNzYtMy4zMiAxLjc2LTMuMzJzNS41OSAxLjIxIDcuMjMgMi41YzAgMC0wLjQ3IDEuMjMtMS43MSAxLjMtMC44IDAuMDUtMC40MyAwLjk0IDAuNDkgMS4xOCAwLjk4IDAuMjYgMS45NS0wLjQ2IDIuMDgtMS40NmwwLjA5LTAuNzMgNi4yNCA0LjAzIDEwLjk1IDIuOTggNjEuMDUtMS41OCA1LjMyLTUuNzR6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNzI1LjkzIDU2Ny40N3MtMi4yOC0wLjU1LTMuNTUtMC41Yy0wLjA0IDAtMC4wNyAwLTAuMS0wLjAxLTAuMzYtMC4xMi0yLjYtMC44NS0zLjk4LTEuNTgtMC4yOC0wLjE1LTAuNTggMC4xNS0wLjQ0IDAuNDMgMC40OSAwLjk4IDEuMjcgMi4zNSAyLjA1IDMuMDIgMCAwLTQuNTItNC43NS04LjUtMy43LTAuMjggMC4wNy0wLjMyIDAuNDYtMC4wNyAwLjYgMC4zIDAuMTYgMC42NiAwLjM4IDEuMDEgMC42MyAwLjI4IDAuMjEgMC4wNyAwLjY0LTAuMjcgMC41N2gtMC4wMmMtMC4yOC0wLjA1LTAuNDkgMC4yNy0wLjMyIDAuNSAwLjA3IDAuMSAwLjEzIDAuMjEgMC4xOCAwLjMzIDAuMTIgMC4yOC0wLjE4IDAuNTUtMC40NSAwLjQyLTEuMTItMC41My0zLjktMS43LTUuNDQtMC45OS0wLjI2IDAuMTItMC4yNSAwLjUgMC4wMiAwLjYgMC4zNiAwLjE0IDAuODQgMC4zNCAxLjI0IDAuNTggMC4zMSAwLjE5IDAuMTMgMC42Ny0wLjIzIDAuNi0xLjU2LTAuMzEtNC42Mi0wLjk2LTYuNy0xLjczLTAuMzMtMC4xMi0wLjU5IDAuMjktMC4zNCAwLjUzIDAuMzYgMC4zNiAwLjc3IDAuNzUgMS4xOCAxLjExIDAuMjcgMC4yMyAwLjAyIDAuNjYtMC4zMiAwLjU1LTEuMzktMC40Ni0zLjE1LTEuMTMtMy40OC0xLjY1czAuNDEgMC41IDEuMDYgMS40MWMwLjIgMC4yOC0wLjEyIDAuNjQtMC40MiAwLjQ3LTEuMDctMC41OS0yLjU5LTEuNDMtMy41OC0yLTAuMjctMC4xNi0wLjU4IDAuMTItMC40NiAwLjQxbDAuMDYgMC4xNWMwLjI2IDAuNjEgMi4wOCAxLjk2IDIgMi4xM3MtNy4wOS0yLjI0LTguOTQtMS45NGMtMS44NCAwLjMgMC42OSAwLjcyIDAuOTIgMC44MXMxLjYxIDAuNjIgMS41NCAxLjAzLTIuOTggMC4wMS0zLjEtMC4xOGMtMC4wNy0wLjEtMS0wLjU1LTEuODEtMC45NC0wLjMtMC4xNC0wLjYgMC4yMS0wLjQgMC40OSAwLjQyIDAuNTkgMC44MiAxLjI1IDAuNjcgMS40OC0wLjI5IDAuNDYtMy4wNi0yLjAyLTQuMDEtMi4xczAuOTkgMS4zMSAxIDEuNzktMy4xOS0xLjMtMy45Mi0wLjk5Yy0wLjM5IDAuMTcgMC41NyAwLjg4IDEuNTIgMS42IDAuMzEgMC4yMyAwLjAyIDAuNzItMC4zMyAwLjU2LTEuNTUtMC43MS0zLjY4LTEuNTktNC45NS0xLjY2LTAuMjUtMC4wMS0wLjQyIDAuMjQtMC4zMSAwLjQ3IDAuMDcgMC4xNSAwLjEyIDAuMjkgMC4wNiAwLjM1LTAuMTMgMC4xNS0xLjM5LTAuMjMtMS43OS0wLjE2LTAuMjYgMC4wNSAxLjYgMC44NiAyLjkgMS41OSAwLjMzIDAuMTkgMC4xMyAwLjY5LTAuMjQgMC42LTIuMTMtMC41NC02LjA3LTEuNDMtOC4wNi0xLjA5LTAuMjggMC4wNS0wLjM2IDAuNC0wLjE0IDAuNTggMC4xOSAwLjE1IDAuNTIgMC4zNCAxLjA1IDAuNTUgMS42MiAwLjY2IDIuMSAwLjg5IDEuMTggMS4wOS0wLjc0IDAuMTYtNS4yNS0xLjExLTcuMzQtMi4wNy0wLjI5LTAuMTQtMC41OSAwLjItMC40MSAwLjQ3IDAuMzYgMC41NiAwLjkxIDEuMjggMS42OSAyLjA1IDEuNTUgMS41MSA0LjkyIDQuMSA1LjU2IDQuNTkgMC4wNyAwLjA1IDAuMTYgMC4wNyAwLjI0IDAuMDZsNTguOC04LjkxYzAuMjEtMC4wMyAwLjMzLTAuMjUgMC4yNS0wLjQ1bC0wLjk5LTIuMzUnXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxM31cbiAgICAgICAgICBkPSdtMTA4MS4xIDUwNC45MmMtMC40NS0xLjIzLTEuMzgtMi4yLTIuMTYtMy4yNXMtMS40My0yLjMzLTEuMTktMy42MWMwLjE3LTAuOSAwLjc4LTEuNyAwLjgzLTIuNjIgMC4wOS0yLTIuNDUtMy4zMi0yLjUzLTUuMzItMC4wNS0xLjMxIDEtMi42MSAwLjUzLTMuODMtMC4wNi0wLjE1LTAuMTQtMC4yOS0wLjE0LTAuNDUtMC4wMy0wLjU0IDAuNjYtMC43NSAxLjE4LTAuOSAwLjg1LTAuMjUgMS42NC0wLjgzIDEuOTctMS42NSAwLjMzLTAuODMgMC4yLTEuODUtMC45LTIuMTItMi4wOC0wLjA4LTQuMTYtMC4xNi02LjI1LTAuMjQtMC42NC0wLjAyLTEuMTgtMC4xNC0xLjc2LTAuMi0wLjM1LTAuMDMtMC43Mi0wLjI0LTAuODkgMC4wNmwwLjA4IDQuMzFjMC4wOCAwLjI4LTAuMTUgMC44Mi0wLjA4IDEuMTEgMC4yOSAxLjEyIDAuMzggMS45NCAwLjczIDMuMTUgMC4xOCAxLjA0IDAuMzMgMi4xOSAwLjMzIDMuMTggMCAyLjU1IDIuNDYgMy44NiAyLjYzIDUuMTggMC4xNiAxLjMxIDAuOSAyLjg4IDAuOTkgNC40NCAwLjA4IDEuNTYgMC45IDIuMyAwLjkgMy4wNHMxLjQ4IDIuMzggMS40OCAzLjQ1IDAuNjYgMy4yOSAwLjY2IDUuNDJjMCAyLjE0IDAuMzMgMi40NiAwLjMzIDQuOTMgMCAxLjM2IDAuMjUgMS45NiAwLjQ5IDIuNDIgMS4zMy0wLjY1IDIuMjEtMi4yNCAyLjQ0LTMuNzggMC4yOS0xLjkyLTAuMTEtMy44NyAwLjAzLTUuOCAwLjE3LTIuMzMgMS4xLTQuNzMgMC4zLTYuOTJ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTR9XG4gICAgICAgICAgZD0nbTEwNjkuOCA0ODMuMDdjMC4wMi0wLjE0IDAuMDQtMC4yNyAwLjA2LTAuNC0wLjAyIDAuMTMtMC4wNSAwLjI2LTAuMDYgMC40eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEzfVxuICAgICAgICAgIGQ9J20xMDU5LjUgNDU2LjkxYy0wLjQ2LTMuNDkgMC4yLTcuMDMgMC4wNS0xMC41NS0wLjA2LTEuMzItMC4yNy0yLjY3LTAuNjctMy45NSAwLjA4LTAuMTkgMC4xNC0wLjM5IDAuMTYtMC42MSAwLjA5LTAuOC0wLjI2LTEuNTctMC42LTIuMjlsLTQuMTctOC44MmMtMi41OS01LjQ5LTUuMjQtMTEuMjQtNS4wMy0xNy4zIDAuMDYtMS42NSAwLjI2LTMuNTItMC44Ni00Ljc0LTAuOTctMS4wNy0yLjkyLTEuNzMtMi42My0zLjE1IDAuMS0wLjUgMC40OC0wLjg4IDAuNzEtMS4zNCAxLjEtMi4xNi0xLjUyLTQuNDEtMS43MS02LjgyLTAuMi0yLjU5IDIuNDQtNS4xNSAxLjI5LTcuNDhsLTAuNTEtMC4zNGMwLjQxIDAgMC44Mi0wLjAxIDEuMjQtMC4wMyAwLjItMC4wMSAwLjI0LTAuMjkgMC4wNS0wLjM2LTAuNTgtMC4yMS0xLjE3LTAuNDItMS43NS0wLjYyLTAuMzUtMC4xMi0wLjcyLTAuMjctMC45LTAuNi0wLjI2LTAuNDggMC4wNi0xLjA1IDAuMjItMS41NyAwLjE2LTAuNTEgMC4xNy0xLjA2IDAuMDQtMS41Ny0wLjItMC43Ni0wLjczLTEuNDYtMC42Ni0yLjI0IDAuMDMtMC4zMyAwLjE2LTAuNjQgMC4zLTAuOTQgMC40My0wLjk4IDAuOTgtMi4wNyAyLTIuNCAwLjI2LTAuMDkgMC41NS0wLjEyIDAuNzYtMC4yOSAwLjIyLTAuMTcgMC4zLTAuNTUgMC4wNy0wLjctMC4wOS0wLjA2LTAuMjItMC4wNy0wLjMzLTAuMDYtMC42NCAwLjAyLTEuMjUgMC4zMS0xLjgzIDAuNTlsLTAuMDYgMC4wM2MtMC4yIDAuMTEtMC4zNCAwLjIxLTAuMzUgMC4yNS0wLjAzIDAuMTQtMS44MiAwLjk2LTEuODIgMC45NnMtMC41OCAwLjQxLTAuNTggMC41YzAgMC4wOC0wLjQxIDAuOTQtMC40MSAxLjE2czAuNTUgMS45MyAwLjYzIDIuMjMgMC44MyAyLjg5IDAuODMgMi44OSAwLjAzIDAuMDYgMC4wNyAwLjE1Yy0wLjAzIDAuMjctMC4wNyAwLjU1LTAuMTMgMC44NC0wLjA0IDAuMjEgMC4yNyAwLjQ5IDAuNDggMC43NS0wLjA2IDAuMjUtMC4xMiAwLjUyLTAuMTIgMC42MXYwLjA4YzAuMDkgMC4wNyAwLjE4IDAuMTMgMC4yNyAwLjItMC4xMyAxLjM0LTAuNjUgMi4zLTAuNzQgMi42Ni0wLjI1IDEtMC40NSA5Ljc3LTAuNjEgMTAuNzUtMC4xNiAwLjk3IDEuMTMgNC43IDEuMTMgNS4xOHMxLjMgNC4zNyAxLjMgNC4zNyAxLjQ2IDMuNCAxLjQ2IDUuNjcgMS4zIDYuMzIgMS4zIDYuOTZjMCAwLjY1IDMuMzMgOS4wNiA2LjQxIDEyLjI5IDAuMjYgMS42NiAwLjQ4IDIuOTQgMC40OCAzLjA4IDAgMC4yMiAwLjg5IDIuMTkgMS41IDMuNjRoMC4wMWMwLjM0IDAuODIgMC42MiAxLjUxIDAuNjIgMS42OSAwIDAuNDkgMS4xNSA2LjE2IDEuMTUgNy4wNyAwIDAuOS0xLjIzIDIuNzktMS4yMyA2LjMzIDAgMy41MyAwLjA4IDMuMzcgMC4wOCA2Ljgycy0xLjMxIDYuMzMtMS4zMSA4LjA1YzAgMS43My0wLjE2IDExLjA5LTAuMTYgMTEuMDlsMC41OCAxLjgxdjMuODZzLTAuNDkgMy41My0wLjQ5IDQuNDRjMCAwLjktMC45IDMuNjEtMS4wNiA2LjE2LTAuMTUgMi41NSAxLjA2IDIuMDUgMS4wNiA0LjY4czAuODIgMy4yIDAuODIgNS42N2MwIDIuNDYtMC4zMyAxLjg5LTAuMzMgMi43OXMtMC43NCAzLjUzLTAuNzQgNS44M2MwIDAuMzcgMC4wMSAwLjczIDAuMDQgMS4wNiAwLjkyIDAuMzYgMS44NiAzLjg1IDIuNzQgMy40MyAxLjc5LTAuODUgMi40MS02LjYyIDIuMjMtOC41OS0wLjI2LTIuOTQtMS41My01Ljc2LTEuNDUtOC43IDAuMDgtMy4wNCAxLjU4LTUuOSAxLjY3LTguOTQgMC4xLTMuMDQtMS4yMS01Ljk4LTEuMjctOS4wMi0wLjA1LTIuNyAwLjktNS4zNiAwLjY4LTguMDUtMC4xNy0yLjEzLTEuMDctNC4xNy0xLjA1LTYuMyAwLjAyLTMuMjMgMi4xLTYuMTIgMi40NC05LjM0IDAuMzEtMy4wMS0wLjkxLTUuOTMtMS4zMS04LjkxeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDN9XG4gICAgICAgICAgZD0nbTUyNi40NCA2NDkuNDJzLTMuMDEtMS41OS00LjgxLTEuOTdjLTAuMDUtMC4wMS0wLjA5LTAuMDMtMC4xNC0wLjA1LTAuNDctMC4yOS0zLjM1LTIuMTEtNS4wMi0zLjY0LTAuMzQtMC4zMS0wLjg3IDAtMC43OCAwLjQ1IDAuMzQgMS41NSAwLjkzIDMuNzQgMS43OSA0Ljk1IDAgMC00LjY0LTguMjYtMTAuNjItOC4yMS0wLjQyIDAtMC42MiAwLjUzLTAuMzEgMC44MSAwLjM2IDAuMzQgMC44IDAuNzcgMS4xOSAxLjI1IDAuMzIgMC4zOS0wLjEzIDAuOTItMC41OSAwLjctMC4wMSAwLTAuMDItMC4wMS0wLjAzLTAuMDEtMC4zOC0wLjE4LTAuNzggMC4yLTAuNjQgMC41OSAwLjA2IDAuMTcgMC4xMSAwLjM1IDAuMTQgMC41MiAwLjA3IDAuNDMtMC40NSAwLjcxLTAuNzkgMC40My0xLjM4LTEuMTUtNC44Ny0zLjc3LTcuMy0zLjMzLTAuNDEgMC4wNy0wLjUzIDAuNjEtMC4xOSAwLjg1IDAuNDYgMC4zMiAxLjA1IDAuNzcgMS41MyAxLjI2IDAuMzcgMC4zOC0wLjA2IDAuOTgtMC41NCAwLjc2LTIuMDktMC45OS02LjE1LTIuOTktOC43OS00LjgxLTAuNDItMC4yOS0wLjk0IDAuMTktMC42OCAwLjYzIDAuMzggMC42MyAwLjgxIDEuMzIgMS4yNSAxLjk3IDAuMjkgMC40Mi0wLjIxIDAuOTQtMC42NCAwLjY2LTEuNzktMS4xNS00LjAyLTIuNzEtNC4yOS0zLjU0LTAuMjctMC44NCAwLjQgMC44NSAwLjk4IDIuMzUgMC4xOCAwLjQ3LTAuNCAwLjg1LTAuNzYgMC41MS0xLjI5LTEuMjEtMy4xMy0yLjkzLTQuMzEtNC4wNy0wLjMyLTAuMzEtMC44Ni0wLjA0LTAuOCAwLjQxbDAuMDMgMC4yM2MwLjE0IDAuOTUgMi4yMSAzLjQ4IDIuMDUgMy43cy05LjE2LTUuNjctMTEuODYtNS45MSAwLjcxIDEuMjUgMSAxLjQ3YzAuMjkgMC4yMSAyLjAzIDEuNDQgMS43OSAxLjk5cy00LjE5LTEuMDUtNC4zLTEuMzZjLTAuMDYtMC4xNy0xLjItMS4xMy0yLjItMS45Ni0wLjM4LTAuMzEtMC45MiAwLjA4LTAuNzQgMC41NCAwLjM4IDAuOTcgMC43IDIuMDQgMC40MSAyLjMxLTAuNTcgMC41NC0zLjU4LTMuOTItNC44OC00LjM3czAuOTEgMi4xOSAwLjc1IDIuODYtNC4wMi0yLjk1LTUuMTYtMi43OGMtMC42MSAwLjA5IDAuNDggMS40NCAxLjU2IDIuNzggMC4zNSAwLjQ0LTAuMjMgMS4wMS0wLjY3IDAuNjYtMS45Mi0xLjU1LTQuNi0zLjUzLTYuMzYtNC4wOS0wLjM0LTAuMTEtMC42OCAwLjE5LTAuNjEgMC41NCAwLjA1IDAuMjMgMC4wNiAwLjQ0LTAuMDQgMC41MS0wLjI0IDAuMTYtMS44OC0wLjgyLTIuNDctMC44Ni0wLjM5LTAuMDMgMS45MyAxLjc3IDMuNSAzLjI3IDAuNCAwLjM4LTAuMDcgMS4wMi0wLjU1IDAuNzUtMi44LTEuNTItOC4wMi00LjE2LTEwLjkzLTQuNC0wLjQtMC4wMy0wLjY1IDAuNDQtMC40IDAuNzYgMC4yMiAwLjI4IDAuNjEgMC42NiAxLjI3IDEuMTUgMi4wNCAxLjUgMi42NCAyIDEuMjcgMS45NC0xLjEtMC4wNC02Ljk4LTMuNDItOS41Ni01LjUyLTAuMzYtMC4zLTAuODkgMC4wNy0wLjc1IDAuNTEgMC4zMSAwLjkyIDAuODEgMi4xMiAxLjYzIDMuNDcgMS42MyAyLjY3IDUuNDMgNy40OCA2LjE2IDguNCAwLjA4IDAuMSAwLjE5IDAuMTYgMC4zMiAwLjE3bDg1LjkgOC41NWMwLjMxIDAuMDMgMC41Ni0wLjIzIDAuNTItMC41NGwtMC41NC0zLjY0J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aCBmaWxsPXtzdDE1fSBkPSdtMTMyOC4zIDg3OC42OScgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE1fVxuICAgICAgICAgIGQ9J20xMDU4LjMgNDEzLjgycy0yLjctMTAuNzEgOC41Ny0xMy43OGgyLjA3bC0wLjU2IDYuMzMtNS4xMSA3LjQ1aC00Ljk3eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEzfVxuICAgICAgICAgIGQ9J20xMDgwLjEgNDA0LjE0Yy0xLjc5LTEuOTUtNC40OC0zLjUtOC4xMi00LjE0LTMuNC0wLjYtNi4wNi0wLjAxLTguMTEgMS4yNyAwLjc3LTAuMzQgMS42My0wLjYyIDIuNi0wLjgxbC0wLjEzIDQuNDJjLTAuMDEgMC4yNC0wLjA3IDAuNDctMC4xOSAwLjY4bC0zLjM0IDYuMDRjLTAuMTYgMC4zLTAuNDIgMC41My0wLjc0IDAuNjZsLTMuNzcgMS41NmMwLjEyIDEuMTkgMC4zOCAyLjIgMC42NSAyLjk1IDAuNTIgMC45MSAxLjE3IDEuNzQgMS45OCAyLjQxIDMuMTEgMi41OSA3LjYxIDIuNDEgMTEuNjQgMi4xLTIuMy0wLjI2LTQuNTYtMC44NC02LjctMS43MS0wLjUzLTAuMjEtMS4xNC0wLjYxLTEuMDUtMS4xNyAwLjEyLTAuNzcgMS4zNi0wLjc2IDEuNzctMS40MiAwLjI3LTAuNDMgMC4xLTAuOTkgMC4xLTEuNDkgMC4wMS0xLjQzIDEuNDMtMi40NiAyLjgxLTIuNzkgMS4zOS0wLjMzIDIuODYtMC4xOSA0LjI0LTAuNTRzMi43Ny0xLjQ1IDIuNy0yLjg3Yy0wLjAzLTAuNjQtMC4zNS0xLjIzLTAuNDktMS44NnMtMC4wMi0xLjQxIDAuNTUtMS43YzAuMzEtMC4xNiAwLjY5LTAuMTMgMS4wNC0wLjEgMS4zIDAuMTMgMi42IDAuMjUgMy45MSAwLjM4LTAuMzctMC42Ny0wLjgzLTEuMy0xLjM1LTEuODd6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTN9XG4gICAgICAgICAgZD0nbTEwOTAuNiA0NjcuOThjLTAuMTQtMC41NC0wLjM1LTEuMDYtMC40NS0xLjYxLTAuMS0wLjYxLTAuMDQtMS4yNCAwLjAxLTEuODYgMC4xNS0xLjU5IDAuMjktMy4xOCAwLjQ0LTQuNzggMC4xLTEuMTMgMC4xOS0yLjM1LTAuMzUtMy4zNC0wLjQxLTAuNzQtMS4xNC0xLjMzLTEuNTUtMi4wNC0wLjQ2LTAuNzktMS4xMy0xLjQzLTEuOTQtMS44N2wtMC4xMi0wLjA3Yy0wLjM3IDAuNTQtMC41NiAxLjE2LTAuNjMgMS44IDAuMjMgMC41NyAwLjggMi45MyAwLjc5IDMuNjFzMC44OCAxLjg2IDAuODggMy43NiAwLjQyIDIuNTEgMC40MiAzLjg4IDAuMjMgMS45IDAuMjMgMi41NS0wLjIzIDIuMDEtMC4yMyAyLjQ3djMuMjdjMCAwLjg0IDAuNDYgMy41IDAuMzggNC4zNy0wLjA2IDAuNjggMC43OSAxLjAxIDEuMjUgMC43IDAuMTEtMC40NSAwLjA3LTEuMDEgMC4wMy0xLjQ4LTAuMjUtMy4xNCAxLjYxLTYuMjkgMC44NC05LjM2eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE1fVxuICAgICAgICAgIGQ9J20xMDY0LjYgNDYxLjgzczEzLjA4IDguNDIgMjAuNTEgOC40OWMwIDAgMC4xLTQuNjEtMS43Ny04LjQ5aC0xOC43NHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxNX1cbiAgICAgICAgICBkPSdtMTA4OC41IDQ1My4zNmMwLjM4LTAuODggMC4yOC0xLjg5IDAuMTgtMi44NC0wLjIyLTIuMDctMC4zMi05LjQtMC41NS0xMS40NyAwIDAtMC4yMS0yLjgzLTEuMDMtNC42OC0wLjM0LTEtMC42NC0xLjIzLTAuNjQtMS4yM2wtMC43NCAyMC44OCAwLjY3IDMuMTktMC4zNCA1LjY3djEuNzhjMC42My0xLjM0IDEuMjctMi42NyAxLjktNC4wMSAwLjI3LTAuNTYgMC41NC0xLjE1IDAuNS0xLjc3LTAuMDYtMC44NC0wLjY4LTEuNTYtMC45Ni0yLjM0IDAuMDUtMC41OCAwLjEtMS4xNSAwLjE1LTEuNzEgMC4yNS0wLjUgMC42My0wLjk2IDAuODYtMS40N3onXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxM31cbiAgICAgICAgICBkPSdtMTA2Ni45IDQwMC4wNHMtNC4xNSAwLTcuNjEgNS42YzAgMCAzLjgxLTQuOTIgNy42MS00Ljk2J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTV9XG4gICAgICAgICAgZD0nbTEwNzAuMiA0MjMuNzlzNy41NyAyLjU0IDE1Ljk3IDEuOTVjMCAwLTEuNzEtMi44LTcuMzQtMy45NSAwLjAxIDAtMS42IDEuOTEtOC42MyAyeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEzfVxuICAgICAgICAgIGQ9J20xMDkxLjIgNDc2LjM4czEuNDcgMC44NiAxLjQzIDEuNzYtMS4wMyAxLjg5LTEuMDMgMi4zMWMwIDAuNDMtMS4zOSAxLjQ2LTAuNjMgMi4yNSAwIDAtMS4xNC0wLjAyLTAuNTMtMS43NXMxLjI1LTIuMTcgMS4zLTMuMTZjLTAuMDEtMC4wMS0wLjIyLTEuMjYtMC41NC0xLjQxeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEwNDguMSAzODEuMzRoLTAuMzhjLTAuNjcgMC0xLjIxLTAuNTQtMS4yMS0xLjIxdi04LjA3aDIuOHY4LjA3YzAgMC42Ny0wLjU0IDEuMjEtMS4yMSAxLjIxeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEwNDkuNiAzNzQuMDZoLTMuMzRjLTAuMDkgMC0wLjE2LTAuMDctMC4xNi0wLjE2di04LjcyYzEuMi0wLjI5IDIuNDYtMC4yOSAzLjY2IDB2OC43MmMwIDAuMDktMC4wNyAwLjE2LTAuMTYgMC4xNnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxM31cbiAgICAgICAgICBkPSdtMTA0OS43IDM2Ny43N3MtMi42OCAxLjIxLTMuNjYgMy40MnYtNi4wMXMyLjA1LTAuNDcgMy42NiAwdjIuNTl6J1xuICAgICAgICAvPlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIGZpbGw9e3N0MTV9XG4gICAgICAgICAgcG9pbnRzPScxMDQ2LjIgMzc0LjA2IDEwNDkuMyAzNzYuNTMgMTA0OS4zIDM3NC4wNidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE1fVxuICAgICAgICAgIGQ9J20xMDQ2LjQgNDIwLjc1czIuMzctNC43OSAxMC42NC01LjM0bC0wLjAxLTAuMDZjLTAuMS0wLjU5LTAuMzktMS4xMy0wLjg0LTEuNTQgMCAwLTYuOTQgMC41Mi0xMC4xIDUuMjdsMC4zMSAxLjY3eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xMDQ2LjUgNDIwLjcxYzAuMTQtMC4yNSAxLTEuNzMgMy4xMS0zLjA2LTAuMDktMC41My0wLjE2LTEuMDYtMC4yMS0xLjU5LTEuMTkgMC43My0yLjMyIDEuNjktMy4xOCAyLjk1IDAuMDYgMC41NCAwLjE2IDEuMTIgMC4yOCAxLjd6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTV9XG4gICAgICAgICAgZD0nbTEwNDYuMSA0MTcuNzNzMS4zMi00LjcgOS42LTUuMjR2LTAuMDJjMC4wNy0wLjU2LTAuMDUtMS4xMy0wLjM0LTEuNjEgMCAwLTYuNCAwLjQ2LTkuNTcgNS4ybDAuMzEgMS42N3onXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxMn1cbiAgICAgICAgICBkPSdtMTA0Ni4xIDQxNy43M2MwLjE0LTAuMjUgMS4xMS0yLjE5IDMuMjMtMy41My0wLjA5LTAuNTMtMC4xMi0wLjg0IDAuMDEtMS40MS0xLjE5IDAuNzMtMi41OSAxLjg2LTMuNDUgMy4xMiAwLjA2IDAuNTQgMC4xIDEuMjQgMC4yMSAxLjgyeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE1fVxuICAgICAgICAgIGQ9J20xMDg2LjUgNDM5LjA2czEuMTkgMC4yNyA1Ljg0LTEuMDJsMC4yOSAxLjQxcy0yLjE0IDAuOTUtNi4zOSAxLjAzJ1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTV9XG4gICAgICAgICAgZD0nbTEwODYuNSA0NDIuMTJzMS4wNyAwLjM1IDYuNS0wLjk0bDAuMzEgMS40NnMtMi4xNCAwLjgzLTcuMTEgMC45MidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDExfVxuICAgICAgICAgIGQ9J20xMDU1LjUgNTA5LjJzNC40IDIuNCAxMS42NSAxLjI0bC0wLjM2IDEuNzhzLTUuNDMgMS4xNi0xMS4wMy0xLjE1bC0wLjI2LTEuODd6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTJ9XG4gICAgICAgICAgZD0nbTEwNTguNiA1MTAuMjdjLTEuNzMtMC4zOS0yLjgtMC44OS0zLjA3LTEuMDMgMC4xNCAwLjU1IDAuMjYgMS4xMiAwLjMgMS44OSAxLjA4IDAuNDQgMi4xNSAwLjc0IDMuMTcgMC45Ni0wLjE1LTAuNjEtMC4yOS0xLjIxLTAuNC0xLjgyeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDExfVxuICAgICAgICAgIGQ9J20xMDU1LjMgNTEzLjI1czQuNCAyLjQgMTEuNjUgMS4yNGwtMC4zNiAxLjc4cy01LjQzIDEuMTYtMTEuMDMtMS4xNWwtMC4yNi0xLjg3eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xMDU5LjYgNTE0LjU0Yy0xLjc3LTAuNDgtMy43LTAuOTgtMy45Ny0xLjExIDAuMTQgMC41NS0wLjE3IDAuODItMC4yMiAxLjcxIDEuMDggMC40NCAyLjIyIDAuODEgNC40NCAxLjE4LTAuMTUtMC42LTAuMTQtMS4xNy0wLjI1LTEuNzh6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTF9XG4gICAgICAgICAgZD0nbTEwNzcuMSA1MTAuNjdzNS41NCAxLjIzIDEwLjQ3LTAuMmwwLjA0IDAuMTJjMC4xNiAwLjUzIDAuMDkgMS4xLTAuMTkgMS41OCAwIDAtMy4zNCAxLjE5LTEwLjA4IDBsLTAuMjQtMS41eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE0fVxuICAgICAgICAgIGQ9J20xMTA5LjIgNDcxLjc0YzAuMDItMC4xNCAwLjA0LTAuMjcgMC4wNi0wLjQtMC4wMyAwLjEzLTAuMDUgMC4yNi0wLjA2IDAuNHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxMn1cbiAgICAgICAgICBkPSdtMTA3Ny4zIDUxMi4xN2MxLjI1IDAuMjIgMi4zOCAwLjM2IDMuMzkgMC40MyAwLTAuMjYgMC4wMS0wLjUxIDAuMDMtMC43NyAwLjAyLTAuMjQgMC4wNC0wLjQ3IDAuMDctMC43MS0xLjk4LTAuMS0zLjQ1LTAuMzktMy43My0wLjQ1IDAuMDkgMC40NyAwLjE3IDAuOTggMC4yNCAxLjV6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTF9XG4gICAgICAgICAgZD0nbTEwNzcuMSA1MTMuOTdzNS41NCAxLjIzIDEwLjQ3LTAuMmwwLjA0IDAuMTJjMC4xNiAwLjUzIDAuMDkgMS4xLTAuMTkgMS41OCAwIDAtMy4zNCAxLjE5LTEwLjA4IDBsLTAuMjQtMS41eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xMDc3LjYgNTE1LjVjMS4yNSAwLjIyIDIuMjggMC4zMyAzLjMgMC40IDAtMC4yNi0wLjEyLTAuNTItMC4xLTAuNzcgMC4wMi0wLjI0IDAuMDItMC40NyAwLjA1LTAuNzEtMi4xMy0wLjE3LTMuMDQtMC4zMi0zLjMyLTAuMzgtMC4wMiAwLjU0IDAgMC45NCAwLjA3IDEuNDZ6J1xuICAgICAgICAvPlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIGZpbGw9e3N0M31cbiAgICAgICAgICBwb2ludHM9Jy0wLjM0IDU3My4xOCAtMC4zNCA4ODMuMTEgMTM2NS42IDg4My4xMSAxMzY1LjcgNTI3LjI5J1xuICAgICAgICAvPlxuICAgICAgICA8ZyBvcGFjaXR5PXswLjJ9PlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgICBkPSdtMTU2LjA5IDQzNi40NGMxMi42NiA1OS4zOCAxMi4wMSA5My4wMyAxMi4wMSA5My4wM3MtODYuMzktMTA3LjM4LTgyLjYzLTE5My42NGMwIDAgNTcuOTYgNDEuMjMgNzAuNjIgMTAwLjYxeidcbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J203NDYuMTkgNTU4LjYxYzAuMDQgMC4wNyAwLjExIDAuMTQgMC4yIDAuMjItMC4yNi0wLjM2LTAuMzktMC41MS0wLjItMC4yMnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J204MDQuNzMgNTUwLjQ3YzAuMDQgMC4wNyAwLjExIDAuMTQgMC4yIDAuMjItMC4yNi0wLjM2LTAuMzgtMC41MS0wLjItMC4yMnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J204NjguMTIgNTQ1LjcxYzAuMDQgMC4wNiAwLjEgMC4xMyAwLjE4IDAuMTktMC4yNC0wLjMxLTAuMzUtMC40NS0wLjE4LTAuMTl6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNTA1Ljg4IDU5Mi4zMmMwLjA0IDAuMDcgMC4xMSAwLjE0IDAuMiAwLjIxLTAuMjYtMC4zNS0wLjM5LTAuNS0wLjItMC4yMXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J201NDAuNDEgNTg1YzAuMDUgMC4wOCAwLjEyIDAuMTUgMC4yMiAwLjI0LTAuMjktMC4zOS0wLjQyLTAuNTYtMC4yMi0wLjI0eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTYwNC4zMSA1NzYuMTJjMC4wNSAwLjA4IDAuMTIgMC4xNSAwLjIyIDAuMjQtMC4yOS0wLjM5LTAuNDItMC41Ni0wLjIyLTAuMjR6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNDY2LjEgNjA0LjM3YzAuMDYgMC4wNSAwLjE1IDAuMSAwLjI1IDAuMTQtMC4zNS0wLjI1LTAuNTItMC4zNS0wLjI1LTAuMTR6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNjc0LjI5IDU2Ny4yNGMwLjA1IDAuMDggMC4xMiAwLjE1IDAuMjIgMC4yNC0wLjI5LTAuNC0wLjQzLTAuNTctMC4yMi0wLjI0eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEwMzAuNCA1MjMuNTljMC4wNCAwLjA2IDAuMSAwLjEzIDAuMTggMC4yLTAuMjMtMC4zMy0wLjM0LTAuNDctMC4xOC0wLjJ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtOTY3LjMyIDUzMC4yOGMwLjA1IDAuMDkgMC4xMyAwLjE4IDAuMjQgMC4yNy0wLjMxLTAuNDQtMC40Ni0wLjY0LTAuMjQtMC4yN3onXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMDk3IDUxNy4wN2MwLjA0IDAuMDYgMC4xIDAuMTMgMC4xOCAwLjItMC4yNC0wLjMzLTAuMzUtMC40Ny0wLjE4LTAuMnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMTUwLjEgNTEwLjM5YzAuMDQgMC4wNiAwLjEgMC4xMyAwLjE4IDAuMi0wLjIzLTAuMzItMC4zNC0wLjQ3LTAuMTgtMC4yeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEyMDguMSA1MDMuNzhjMC4wNCAwLjA2IDAuMSAwLjEzIDAuMTggMC4yLTAuMjMtMC4zMi0wLjM0LTAuNDctMC4xOC0wLjJ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTI0Ni40IDQ5Ni44NmMwLjA0IDAuMDYgMC4xIDAuMTMgMC4xOCAwLjItMC4yMy0wLjMzLTAuMzQtMC40Ny0wLjE4LTAuMnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMjk5LjQgNDkwLjE5YzAuMDQgMC4wNiAwLjEgMC4xMyAwLjE4IDAuMi0wLjI0LTAuMzMtMC4zNS0wLjQ3LTAuMTgtMC4yeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD17YFxuXHRcdFx0XHRtMTM2NS43XG5cdFx0XHRcdDQ4Ni43MnYtMC45aC0wLjAxbDAuMDEtMy44NnMtMC45Mi0wLjI2LTIuMjUtMC4yYy0wLjA0XG5cdFx0XHRcdDAtMC4wN1xuXHRcdFx0XHQwLTAuMTEtMC4wMS0wLjM4LTAuMTEtMi43MS0wLjgzLTQuMTMtMS41Ny0wLjI5LTAuMTUtMC42MlxuXHRcdFx0XHQwLjE1LTAuNDhcblx0XHRcdFx0MC40NFxuXHRcdFx0XHQwLjQyXG5cdFx0XHRcdDAuODVcblx0XHRcdFx0MS4wNFxuXHRcdFx0XHQxLjk4XG5cdFx0XHRcdDEuNzJcblx0XHRcdFx0Mi43MS0xLjEyLTEuMDUtNC45My00LjI2LTguNDctMy4zNC0wLjNcblx0XHRcdFx0MC4wOC0wLjM2XG5cdFx0XHRcdDAuNDctMC4wOVxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4zMVxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQxLjA0XG5cdFx0XHRcdDAuNjNcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC42NC0wLjNcblx0XHRcdFx0MC41OGgtMC4wMmMtMC4zLTAuMDUtMC41MlxuXHRcdFx0XHQwLjI3LTAuMzZcblx0XHRcdFx0MC41MVxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4yOC0wLjIxXG5cdFx0XHRcdDAuNTYtMC40OVxuXHRcdFx0XHQwLjQzLTEuMTYtMC41My00LjA0LTEuNjktNS42OS0wLjk2LTAuMjhcblx0XHRcdFx0MC4xMi0wLjI4XG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjM4XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC44N1xuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDEuMjhcblx0XHRcdFx0MC41OFxuXHRcdFx0XHQwLjMyXG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MC4xMVxuXHRcdFx0XHQwLjY3LTAuMjZcblx0XHRcdFx0MC42MS0xLjYzLTAuMy00LjgyLTAuOTMtNi45OC0xLjY5LTAuMzQtMC4xMi0wLjYzXG5cdFx0XHRcdDAuMjktMC4zOFxuXHRcdFx0XHQwLjU0XG5cdFx0XHRcdDAuMzdcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjc4XG5cdFx0XHRcdDAuNzVcblx0XHRcdFx0MS4yXG5cdFx0XHRcdDEuMTFcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDBcblx0XHRcdFx0MC42Ny0wLjM1XG5cdFx0XHRcdDAuNTYtMS4yNy0wLjQtMi44My0wLjk2LTMuNDEtMS40NFxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjc3XG5cdFx0XHRcdDAuODhcblx0XHRcdFx0MS4yMlxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC4yOC0wLjE1XG5cdFx0XHRcdDAuNjUtMC40NlxuXHRcdFx0XHQwLjQ4LTEuMS0wLjU5LTIuNjgtMS40Mi0zLjY5LTEuOTktMC4yOC0wLjE1LTAuNjJcblx0XHRcdFx0MC4xMy0wLjVcblx0XHRcdFx0MC40MmwwLjA2XG5cdFx0XHRcdDAuMTVjMC4yNVxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDIuMTFcblx0XHRcdFx0MS45NlxuXHRcdFx0XHQyLjAzXG5cdFx0XHRcdDIuMTMtMC4wOFxuXHRcdFx0XHQwLjE4LTcuMzgtMi4yMS05LjMzLTEuODktMS45NVxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuN1xuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDAuOTRcblx0XHRcdFx0MC44MXMxLjY3XG5cdFx0XHRcdDAuNjFcblx0XHRcdFx0MS41OFxuXHRcdFx0XHQxLjAzYy0wLjA4XG5cdFx0XHRcdDAuNDItMy4xM1xuXHRcdFx0XHQwLjAzLTMuMjUtMC4xNi0wLjA3LTAuMS0xLjAzLTAuNTUtMS44Ny0wLjkzLTAuMzEtMC4xNC0wLjY0XG5cdFx0XHRcdDAuMjItMC40NFxuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjgyXG5cdFx0XHRcdDEuMjVcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQxLjQ5LTAuMzJcblx0XHRcdFx0MC40Ni0zLjE1LTIuMDItNC4xNC0yLjA5czAuOTlcblx0XHRcdFx0MS4zMlxuXHRcdFx0XHQwLjk4XG5cdFx0XHRcdDEuOC0zLjMxLTEuMjgtNC4wOS0wLjk2Yy0wLjQyXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjg5XG5cdFx0XHRcdDEuNTRcblx0XHRcdFx0MS42XG5cdFx0XHRcdDAuMzJcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNzItMC4zN1xuXHRcdFx0XHQwLjU2LTEuNi0wLjcxLTMuODEtMS41Ny01LjE0LTEuNjMtMC4yNi0wLjAxLTAuNDVcblx0XHRcdFx0MC4yNS0wLjM1XG5cdFx0XHRcdDAuNDdcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuMzUtMC4xNFxuXHRcdFx0XHQwLjE1LTEuNDYtMC4yMi0xLjg4LTAuMTQtMC4yN1xuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDEuNTNcblx0XHRcdFx0MC44XG5cdFx0XHRcdDIuODdcblx0XHRcdFx0MS41Mi0wLjI3XG5cdFx0XHRcdDAuMDgtMC4zMlxuXHRcdFx0XHQwLjQ1LTAuMDdcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4wNy0wLjA2XG5cdFx0XHRcdDAuMDItMC4xMlxuXHRcdFx0XHQwLjAzLTAuMlxuXHRcdFx0XHQwLjAxLTIuMjItMC41My02LjMzLTEuMzktOC40My0xLjA0LTAuMjlcblx0XHRcdFx0MC4wNS0wLjM5XG5cdFx0XHRcdDAuNDEtMC4xN1xuXHRcdFx0XHQwLjU4XG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQxLjA4XG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MS42OFxuXHRcdFx0XHQwLjY1XG5cdFx0XHRcdDIuMThcblx0XHRcdFx0MC44OFxuXHRcdFx0XHQxLjJcblx0XHRcdFx0MS4wOS0wLjc4XG5cdFx0XHRcdDAuMTctNS40OC0xLjA3LTcuNjQtMi4wMy0wLjMtMC4xMy0wLjYyXG5cdFx0XHRcdDAuMjEtMC40NVxuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjkxXG5cdFx0XHRcdDEuMjlcblx0XHRcdFx0MS43XG5cdFx0XHRcdDIuMDVcblx0XHRcdFx0MC41MlxuXHRcdFx0XHQwLjVcblx0XHRcdFx0MS4yNFxuXHRcdFx0XHQxLjExXG5cdFx0XHRcdDJcblx0XHRcdFx0MS43My0xLjE2LTAuNDEtMi41LTAuOTUtMy4wMi0xLjRcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MC43OFxuXHRcdFx0XHQwLjg2XG5cdFx0XHRcdDEuMjJcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDAuMjgtMC4xM1xuXHRcdFx0XHQwLjY0LTAuNDNcblx0XHRcdFx0MC40Ny0xLjA2LTAuNi0yLjU3LTEuNDctMy41NS0yLjA0LTAuMjctMC4xNi0wLjU4XG5cdFx0XHRcdDAuMTEtMC40N1xuXHRcdFx0XHQwLjRsMC4wNlxuXHRcdFx0XHQwLjE1YzAuMjVcblx0XHRcdFx0MC42MVxuXHRcdFx0XHQyLjA1XG5cdFx0XHRcdDEuOThcblx0XHRcdFx0MS45OFxuXHRcdFx0XHQyLjE2LTAuMDdcblx0XHRcdFx0MC4xNy03LjA3LTIuMzMtOC45MS0yLjA2LTEuODVcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjY4XG5cdFx0XHRcdDAuNzNcblx0XHRcdFx0MC45MVxuXHRcdFx0XHQwLjgyXG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDEuNlxuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDEuNTNcblx0XHRcdFx0MS4wNXMtMi45OC0wLjAzLTMuMS0wLjIyYy0wLjA3LTAuMS0wLjk5LTAuNTctMS44LTAuOTYtMC4zLTAuMTUtMC42XG5cdFx0XHRcdDAuMi0wLjQxXG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MC40MlxuXHRcdFx0XHQwLjU5XG5cdFx0XHRcdDAuODFcblx0XHRcdFx0MS4yNlxuXHRcdFx0XHQwLjY2XG5cdFx0XHRcdDEuNDktMC4yOVxuXHRcdFx0XHQwLjQ1LTMuMDQtMi4wNi0zLjk4LTIuMTUtMC45NS0wLjA5XG5cdFx0XHRcdDAuOTdcblx0XHRcdFx0MS4zM1xuXHRcdFx0XHQwLjk3XG5cdFx0XHRcdDEuOFxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNDgtMy4xNy0xLjM0LTMuOTEtMS4wNC0wLjRcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjU2XG5cdFx0XHRcdDAuODlcblx0XHRcdFx0MS41XG5cdFx0XHRcdDEuNjJcblx0XHRcdFx0MC4zMVxuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC43Mi0wLjM0XG5cdFx0XHRcdDAuNTUtMS41NC0wLjczLTMuNjYtMS42My00LjkzLTEuNzItMC4yNS0wLjAyLTAuNDNcblx0XHRcdFx0MC4yNC0wLjMyXG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuMzUtMC4xM1xuXHRcdFx0XHQwLjE1LTEuMzktMC4yNS0xLjc5LTAuMTgtMC4yNlxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDEuNThcblx0XHRcdFx0MC44OFxuXHRcdFx0XHQyLjg4XG5cdFx0XHRcdDEuNjNcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC42OS0wLjI1XG5cdFx0XHRcdDAuNi0yLjEzLTAuNTctNi4wNS0xLjUtOC4wNC0xLjE5LTAuMjhcblx0XHRcdFx0MC4wNC0wLjM2XG5cdFx0XHRcdDAuNC0wLjE1XG5cdFx0XHRcdDAuNTdcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuNTFcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQxLjA0XG5cdFx0XHRcdDAuNTZcblx0XHRcdFx0MS40N1xuXHRcdFx0XHQwLjYyXG5cdFx0XHRcdDEuOTlcblx0XHRcdFx0MC44N1xuXHRcdFx0XHQxLjM4XG5cdFx0XHRcdDEuMDUtMC43MS0wLjI0LTIuNTMtMC45LTMuNzEtMS41NS0wLjI4LTAuMTUtMC41OVxuXHRcdFx0XHQwLjE0LTAuNDVcblx0XHRcdFx0MC40M1xuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MC4xMVxuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC4zMy0xLjMtMC40MS0yLjY0LTAuODktMy41My0xLjMyLTAuMjMtMC4xMS0wLjQ2XG5cdFx0XHRcdDAuMDctMC40NlxuXHRcdFx0XHQwLjI5LTAuODYtMC4yMi0xLjc1LTAuMjgtMi42Mi0wLjA2LTAuMjhcblx0XHRcdFx0MC4wNy0wLjMzXG5cdFx0XHRcdDAuNDYtMC4wOFxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQwLjM5XG5cdFx0XHRcdDFcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjI4XG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjY0LTAuMjhcblx0XHRcdFx0MC41N2gtMC4wMmMtMC4yOC0wLjA2LTAuNDlcblx0XHRcdFx0MC4yNi0wLjMzXG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4yOC0wLjE5XG5cdFx0XHRcdDAuNTUtMC40NlxuXHRcdFx0XHQwLjQyLTEuMTItMC41NS0zLjg4LTEuNzUtNS40My0xLjA2LTAuMjZcblx0XHRcdFx0MC4xMi0wLjI2XG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQwLjM1XG5cdFx0XHRcdDEuMjNcblx0XHRcdFx0MC42XG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC42Ny0wLjI0XG5cdFx0XHRcdDAuNi0xLjU2LTAuMzMtNC42MS0xLjAyLTYuNjctMS44Mi0wLjMzLTAuMTMtMC42XG5cdFx0XHRcdDAuMjgtMC4zNVxuXHRcdFx0XHQwLjUzXG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjc2XG5cdFx0XHRcdDAuNzZcblx0XHRcdFx0MS4xNlxuXHRcdFx0XHQxLjEyXG5cdFx0XHRcdDAuMjZcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNjYtMC4zMlxuXHRcdFx0XHQwLjU1LTEuMjEtMC40Mi0yLjcxLTEuMDEtMy4yOC0xLjQ5XG5cdFx0XHRcdDAuMjJcblx0XHRcdFx0MC4zMVxuXHRcdFx0XHQwLjU1XG5cdFx0XHRcdDAuNzhcblx0XHRcdFx0MC44NlxuXHRcdFx0XHQxLjIyXG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjI4LTAuMTNcblx0XHRcdFx0MC42NC0wLjQzXG5cdFx0XHRcdDAuNDctMS4wNi0wLjYtMi41Ny0xLjQ3LTMuNTUtMi4wNC0wLjI3LTAuMTYtMC41OFxuXHRcdFx0XHQwLjExLTAuNDdcblx0XHRcdFx0MC40bDAuMDZcblx0XHRcdFx0MC4xNWMwLjI1XG5cdFx0XHRcdDAuNjFcblx0XHRcdFx0Mi4wNVxuXHRcdFx0XHQxLjk4XG5cdFx0XHRcdDEuOThcblx0XHRcdFx0Mi4xNi0wLjA3XG5cdFx0XHRcdDAuMTctNy4wNy0yLjMzLTguOTEtMi4wNi0xLjg1XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC42OFxuXHRcdFx0XHQwLjczXG5cdFx0XHRcdDAuOTFcblx0XHRcdFx0MC44MlxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQxLjZcblx0XHRcdFx0MC42NFxuXHRcdFx0XHQxLjUzXG5cdFx0XHRcdDEuMDVzLTIuOTgtMC4wMy0zLjEtMC4yMmMtMC4wNy0wLjEtMC45OS0wLjU3LTEuOC0wLjk2LTAuMy0wLjE1LTAuNlxuXHRcdFx0XHQwLjItMC40MVxuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjgxXG5cdFx0XHRcdDEuMjZcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQxLjQ5LTAuMjlcblx0XHRcdFx0MC40NS0zLjA0LTIuMDYtMy45OC0yLjE1LTAuOTUtMC4wOVxuXHRcdFx0XHQwLjk3XG5cdFx0XHRcdDEuMzNcblx0XHRcdFx0MC45N1xuXHRcdFx0XHQxLjhcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjQ4LTMuMTctMS4zNC0zLjkxLTEuMDQtMC40XG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjg5XG5cdFx0XHRcdDEuNVxuXHRcdFx0XHQxLjYyXG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNzItMC4zNFxuXHRcdFx0XHQwLjU1LTEuNTQtMC43My0zLjY2LTEuNjMtNC45My0xLjcyLTAuMjUtMC4wMi0wLjQzXG5cdFx0XHRcdDAuMjQtMC4zMlxuXHRcdFx0XHQwLjQ2XG5cdFx0XHRcdDAuMDdcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjExXG5cdFx0XHRcdDAuMjlcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjM1LTAuMTNcblx0XHRcdFx0MC4xNS0xLjM5LTAuMjUtMS43OS0wLjE4LTAuMjRcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQxLjMyXG5cdFx0XHRcdDAuNzZcblx0XHRcdFx0Mi41OVxuXHRcdFx0XHQxLjQ2LTAuNTMtMC4wNC0xLjA2LTAuMDEtMS41OFxuXHRcdFx0XHQwLjEyLTAuMTFcblx0XHRcdFx0MC4wMy0wLjE4XG5cdFx0XHRcdDAuMS0wLjIxXG5cdFx0XHRcdDAuMTgtMi4xLTAuNDktNC43LTAuOTYtNi4yLTAuNzMtMC4yOFxuXHRcdFx0XHQwLjA0LTAuMzZcblx0XHRcdFx0MC40LTAuMTVcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC41MVxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDEuMDRcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQxLjYxXG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0Mi4wOVxuXHRcdFx0XHQwLjkyXG5cdFx0XHRcdDEuMTdcblx0XHRcdFx0MS4xLTAuNzRcblx0XHRcdFx0MC4xNS01LjIzLTEuMTctNy4zMS0yLjE3LTAuMjktMC4xNC0wLjU5XG5cdFx0XHRcdDAuMTktMC40MlxuXHRcdFx0XHQwLjQ3XG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjg5XG5cdFx0XHRcdDEuM1xuXHRcdFx0XHQxLjY2XG5cdFx0XHRcdDIuMDdsMC4yNFxuXHRcdFx0XHQwLjI0Yy0wLjMyLTAuMTEtMC42Mi0wLjIxLTAuOS0wLjMyLTAuMzMtMC4xMy0wLjZcblx0XHRcdFx0MC4yOC0wLjM1XG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuNzZcblx0XHRcdFx0MC43NlxuXHRcdFx0XHQxLjE2XG5cdFx0XHRcdDEuMTJcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuMDItMC40NFxuXHRcdFx0XHQwLjA2LTAuODhcblx0XHRcdFx0MC4xMS0xLjMzXG5cdFx0XHRcdDAuMTctMC45NS0wLjM2LTEuODctMC43Ny0yLjI5LTEuMTNcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MC43OFxuXHRcdFx0XHQwLjg2XG5cdFx0XHRcdDEuMjJcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjAzXG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuMDgtMC4zMVxuXHRcdFx0XHQwLjA0LTAuNjJcblx0XHRcdFx0MC4wOC0wLjk0XG5cdFx0XHRcdDAuMTItMS4wMS0wLjU3LTIuMjQtMS4yOC0zLjA4LTEuNzgtMC4yNy0wLjE2LTAuNThcblx0XHRcdFx0MC4xMS0wLjQ3XG5cdFx0XHRcdDAuNGwwLjA2XG5cdFx0XHRcdDAuMTVjMC4xNVxuXHRcdFx0XHQwLjM3XG5cdFx0XHRcdDAuODRcblx0XHRcdFx0MVxuXHRcdFx0XHQxLjM3XG5cdFx0XHRcdDEuNDktMC40M1xuXHRcdFx0XHQwLjA1LTAuODZcblx0XHRcdFx0MC4xMS0xLjNcblx0XHRcdFx0MC4xNi0yLjIzLTAuNjctNS43Ny0xLjczLTcuMDEtMS41NS0xLjg1XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC42OFxuXHRcdFx0XHQwLjczXG5cdFx0XHRcdDAuOTFcblx0XHRcdFx0MC44MnMxLjZcblx0XHRcdFx0MC42NFxuXHRcdFx0XHQxLjUzXG5cdFx0XHRcdDEuMDUtMi45OC0wLjAzLTMuMS0wLjIyYy0wLjA3LTAuMS0wLjk5LTAuNTctMS44LTAuOTYtMC4zLTAuMTUtMC42XG5cdFx0XHRcdDAuMi0wLjQxXG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MC40MlxuXHRcdFx0XHQwLjU5XG5cdFx0XHRcdDAuODFcblx0XHRcdFx0MS4yNlxuXHRcdFx0XHQwLjY2XG5cdFx0XHRcdDEuNDktMC4wMlxuXHRcdFx0XHQwLjAzLTAuMDRcblx0XHRcdFx0MC4wNC0wLjA4XG5cdFx0XHRcdDAuMDVoLTAuMDJjLTAuNTdcblx0XHRcdFx0MC4wNy0zLjAxLTIuMTItMy44OS0yLjItMC45NS0wLjA5XG5cdFx0XHRcdDAuOTdcblx0XHRcdFx0MS4zM1xuXHRcdFx0XHQwLjk3XG5cdFx0XHRcdDEuOFxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNDgtMy4xNy0xLjM0LTMuOTEtMS4wNC0wLjRcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjU2XG5cdFx0XHRcdDAuODlcblx0XHRcdFx0MS41XG5cdFx0XHRcdDEuNjJcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjAzXG5cdFx0XHRcdDAuNDktMC4xM1xuXHRcdFx0XHQwLjAyLTAuMjdcblx0XHRcdFx0MC4wMy0wLjRcblx0XHRcdFx0MC4wNS0xLjU0LTAuNzMtMy42NC0xLjYyLTQuOS0xLjcxLTAuMjUtMC4wMi0wLjQzXG5cdFx0XHRcdDAuMjQtMC4zMlxuXHRcdFx0XHQwLjQ2XG5cdFx0XHRcdDAuMDdcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjExXG5cdFx0XHRcdDAuMjlcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjM1LTAuMTFcblx0XHRcdFx0MC4xMi0wLjk3LTAuMTItMS41LTAuMThcblx0XHRcdFx0MC44NS0xLjYzXG5cdFx0XHRcdDEuODItMy4yXG5cdFx0XHRcdDIuODUtNC43MVxuXHRcdFx0XHQzLTQuMzhcblx0XHRcdFx0Ni41My04LjQxXG5cdFx0XHRcdDkuMjMtMTIuOThcblx0XHRcdFx0MC4zNC0wLjU3XG5cdFx0XHRcdDAuNS0xLjU0LTAuMTQtMS42OC04LjAzXG5cdFx0XHRcdDUuNzMtMTYuNjZcblx0XHRcdFx0MTIuMzYtMTguNzNcblx0XHRcdFx0MjEuOTktMC4wMi0wLjAxLTAuMDQtMC4wMS0wLjA3LTAuMDItMS4zNS03Ljc2XG5cdFx0XHRcdDAuOTEtMTUuNzVcblx0XHRcdFx0NC4zNC0yMi44NVxuXHRcdFx0XHQzLjQ1LTcuMTVcblx0XHRcdFx0OC4wNi0xMy42OFxuXHRcdFx0XHQxMS43NS0yMC43Mi0xMy4wNFxuXHRcdFx0XHQ4LjAyLTIwLjk3XG5cdFx0XHRcdDIzLjQzLTIwLjU5XG5cdFx0XHRcdDM4LjY2LTAuOTItMy42LTIuODMtNy4wOC00Ljc0LTEwLjMxLTMuMTUtNS4zMy02LjQ2LTEwLjY1LTEwLjgyLTE1LjA1LTQuMzctNC4zOS05LjkyLTcuODUtMTYuMDctOC42NlxuXHRcdFx0XHQ0Ljg4XG5cdFx0XHRcdDIuNTZcblx0XHRcdFx0OS4zNFxuXHRcdFx0XHQ1LjkzXG5cdFx0XHRcdDEzLjEzXG5cdFx0XHRcdDkuOTNcblx0XHRcdFx0Ni43OFxuXHRcdFx0XHQ3LjE3XG5cdFx0XHRcdDExLjI0XG5cdFx0XHRcdDE2LjFcblx0XHRcdFx0MTUuMTZcblx0XHRcdFx0MjUuMjItNS4wMy0zLjkxLTEwLjItNy42Ni0xNS40OC0xMS4yM1xuXHRcdFx0XHQzLjM5XG5cdFx0XHRcdDUuNDhcblx0XHRcdFx0Ny4yNVxuXHRcdFx0XHQxMC42N1xuXHRcdFx0XHQxMS41MlxuXHRcdFx0XHQxNS41LTAuMTZcblx0XHRcdFx0MC4wOC0wLjI0XG5cdFx0XHRcdDAuMy0wLjEzXG5cdFx0XHRcdDAuNDdcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQwLjFcblx0XHRcdFx0MC4xM1xuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuMThcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuMTNcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjI2LTAuMDdcblx0XHRcdFx0MC4zNS0wLjE0XG5cdFx0XHRcdDAuMDItMC4yOFxuXHRcdFx0XHQwLjAzLTAuNDFcblx0XHRcdFx0MC4wNS0xLjEzLTAuNTUtMy44Ni0xLjczLTUuNC0xLjA1LTAuMjZcblx0XHRcdFx0MC4xMi0wLjI2XG5cdFx0XHRcdDAuNDlcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuODNcblx0XHRcdFx0MC4zNVxuXHRcdFx0XHQxLjIzXG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuMDlcblx0XHRcdFx0MC4xN1xuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC4zNi0wLjMyXG5cdFx0XHRcdDAuMDQtMC42M1xuXHRcdFx0XHQwLjA4LTAuOTVcblx0XHRcdFx0MC4xMi0xLjY1LTAuMzYtNC4yNy0wLjk4LTYuMS0xLjY5LTAuMzMtMC4xMy0wLjZcblx0XHRcdFx0MC4yOC0wLjM1XG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuNzZcblx0XHRcdFx0MC43NlxuXHRcdFx0XHQxLjE2XG5cdFx0XHRcdDEuMTJcblx0XHRcdFx0MC4yNlxuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC42Ni0wLjMyXG5cdFx0XHRcdDAuNTUtMS4yMS0wLjQyLTIuNzEtMS4wMS0zLjI4LTEuNDlcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MC43OFxuXHRcdFx0XHQwLjg2XG5cdFx0XHRcdDEuMjJcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDAuMjgtMC4xM1xuXHRcdFx0XHQwLjY0LTAuNDNcblx0XHRcdFx0MC40Ny0xLjA2LTAuNi0yLjU3LTEuNDctMy41NS0yLjA0LTAuMjctMC4xNi0wLjU4XG5cdFx0XHRcdDAuMTEtMC40N1xuXHRcdFx0XHQwLjRsMC4wNlxuXHRcdFx0XHQwLjE1YzAuMjNcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQxLjc4XG5cdFx0XHRcdDEuNzhcblx0XHRcdFx0MS45NlxuXHRcdFx0XHQyLjA5bC0wLjI0XG5cdFx0XHRcdDAuMDNjLTEuMjgtMC4zMS03LjAxLTIuMjctOC42Ni0yLjAzLTEuODVcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjY4XG5cdFx0XHRcdDAuNzNcblx0XHRcdFx0MC45MVxuXHRcdFx0XHQwLjgyXG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDEuNlxuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDEuNTNcblx0XHRcdFx0MS4wNXMtMi45OC0wLjAzLTMuMS0wLjIyYy0wLjA3LTAuMS0wLjk5LTAuNTctMS44LTAuOTYtMC4zLTAuMTUtMC42XG5cdFx0XHRcdDAuMi0wLjQxXG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MC40MlxuXHRcdFx0XHQwLjU5XG5cdFx0XHRcdDAuODFcblx0XHRcdFx0MS4yNlxuXHRcdFx0XHQwLjY2XG5cdFx0XHRcdDEuNDktMC4yOVxuXHRcdFx0XHQwLjQ1LTMuMDQtMi4wNi0zLjk4LTIuMTUtMC45NS0wLjA5XG5cdFx0XHRcdDAuOTdcblx0XHRcdFx0MS4zM1xuXHRcdFx0XHQwLjk3XG5cdFx0XHRcdDEuOFxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNDgtMy4xNy0xLjM0LTMuOTEtMS4wNC0wLjRcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjU2XG5cdFx0XHRcdDAuODlcblx0XHRcdFx0MS41XG5cdFx0XHRcdDEuNjJcblx0XHRcdFx0MC4zMVxuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC43Mi0wLjM0XG5cdFx0XHRcdDAuNTUtMS41NC0wLjczLTMuNjYtMS42My00LjkzLTEuNzItMC4yNS0wLjAyLTAuNDNcblx0XHRcdFx0MC4yNC0wLjMyXG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuMzUtMC4xM1xuXHRcdFx0XHQwLjE1LTEuMzktMC4yNS0xLjc5LTAuMTgtMC4yNlxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDEuNThcblx0XHRcdFx0MC44OFxuXHRcdFx0XHQyLjg4XG5cdFx0XHRcdDEuNjNcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC42OS0wLjI1XG5cdFx0XHRcdDAuNi0yLjEzLTAuNTctNi4wNS0xLjUtOC4wNC0xLjE5LTAuMjhcblx0XHRcdFx0MC4wNC0wLjM2XG5cdFx0XHRcdDAuNC0wLjE1XG5cdFx0XHRcdDAuNTdcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuNTFcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQxLjA0XG5cdFx0XHRcdDAuNTdcblx0XHRcdFx0MC45OFxuXHRcdFx0XHQwLjQxXG5cdFx0XHRcdDEuNTRcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQxLjYyXG5cdFx0XHRcdDAuODQtMC4yMVxuXHRcdFx0XHQwLjAzLTAuNDFcblx0XHRcdFx0MC4wNS0wLjYyXG5cdFx0XHRcdDAuMDgtMC44NS0wLjMtMi4zMi0wLjg2LTMuMzMtMS40Mi0wLjI4LTAuMTUtMC41OVxuXHRcdFx0XHQwLjE0LTAuNDVcblx0XHRcdFx0MC40M1xuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MC4xMVxuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC4zMy0xLjMtMC40MS0yLjY0LTAuODktMy41My0xLjMyLTAuMjMtMC4xMS0wLjQ2XG5cdFx0XHRcdDAuMDctMC40NlxuXHRcdFx0XHQwLjI5LTAuODYtMC4yMi0xLjc1LTAuMjgtMi42Mi0wLjA2LTAuMjhcblx0XHRcdFx0MC4wNy0wLjMzXG5cdFx0XHRcdDAuNDYtMC4wOFxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQwLjM5XG5cdFx0XHRcdDFcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjI4XG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjY0LTAuMjhcblx0XHRcdFx0MC41N2gtMC4wMmMtMC4yOC0wLjA2LTAuNDlcblx0XHRcdFx0MC4yNi0wLjMzXG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuMDZcblx0XHRcdFx0MC4xNFxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuMjctMC4wOFxuXHRcdFx0XHQwLjM2LTAuMTNcblx0XHRcdFx0MC4wMi0wLjI3XG5cdFx0XHRcdDAuMDMtMC40XG5cdFx0XHRcdDAuMDUtMS4xMy0wLjU1LTMuODctMS43NC01LjQxLTEuMDUtMC4yNlxuXHRcdFx0XHQwLjEyLTAuMjZcblx0XHRcdFx0MC40OVxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQwLjM1XG5cdFx0XHRcdDEuMjNcblx0XHRcdFx0MC42XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC4wOVxuXHRcdFx0XHQwLjE3XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4xNFxuXHRcdFx0XHQwLjM2LTAuMzFcblx0XHRcdFx0MC4wNC0wLjYyXG5cdFx0XHRcdDAuMDgtMC45MlxuXHRcdFx0XHQwLjEyLTEuNjUtMC4zNi00LjI4LTAuOTgtNi4xMi0xLjctMC4zMy0wLjEzLTAuNlxuXHRcdFx0XHQwLjI4LTAuMzVcblx0XHRcdFx0MC41M1xuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC43NlxuXHRcdFx0XHQwLjc2XG5cdFx0XHRcdDEuMTZcblx0XHRcdFx0MS4xMlxuXHRcdFx0XHQwLjI2XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjY2LTAuMzJcblx0XHRcdFx0MC41NS0xLjIxLTAuNDItMi43MS0xLjAxLTMuMjgtMS40OVxuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC41NVxuXHRcdFx0XHQwLjc4XG5cdFx0XHRcdDAuODZcblx0XHRcdFx0MS4yMlxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC4yOC0wLjEzXG5cdFx0XHRcdDAuNjQtMC40M1xuXHRcdFx0XHQwLjQ3LTEuMDYtMC42LTIuNTctMS40Ny0zLjU1LTIuMDQtMC4yNy0wLjE2LTAuNThcblx0XHRcdFx0MC4xMS0wLjQ3XG5cdFx0XHRcdDAuNGwwLjA2XG5cdFx0XHRcdDAuMTVjMC4yM1xuXHRcdFx0XHQwLjU3XG5cdFx0XHRcdDEuODJcblx0XHRcdFx0MS44MVxuXHRcdFx0XHQxLjk3XG5cdFx0XHRcdDIuMTEtMC4wN1xuXHRcdFx0XHQwLjAxLTAuMTRcblx0XHRcdFx0MC4wMi0wLjIxXG5cdFx0XHRcdDAuMDMtMS4yLTAuMjgtNy4wMy0yLjI4LTguNjktMi4wMy0xLjg1XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC42OFxuXHRcdFx0XHQwLjczXG5cdFx0XHRcdDAuOTFcblx0XHRcdFx0MC44MlxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQxLjZcblx0XHRcdFx0MC42NFxuXHRcdFx0XHQxLjUzXG5cdFx0XHRcdDEuMDVzLTIuOTgtMC4wMy0zLjEtMC4yMmMtMC4wNy0wLjEtMC45OS0wLjU3LTEuOC0wLjk2LTAuMy0wLjE1LTAuNlxuXHRcdFx0XHQwLjItMC40MVxuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjgxXG5cdFx0XHRcdDEuMjZcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQxLjQ5LTAuMjlcblx0XHRcdFx0MC40NS0zLjA0LTIuMDYtMy45OC0yLjE1LTAuOTUtMC4wOVxuXHRcdFx0XHQwLjk3XG5cdFx0XHRcdDEuMzNcblx0XHRcdFx0MC45N1xuXHRcdFx0XHQxLjhcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjQ4LTMuMTctMS4zNC0zLjkxLTEuMDQtMC40XG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjg5XG5cdFx0XHRcdDEuNVxuXHRcdFx0XHQxLjYyXG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNzItMC4zNFxuXHRcdFx0XHQwLjU1LTEuNTQtMC43My0zLjY2LTEuNjMtNC45My0xLjcyLTAuMjUtMC4wMi0wLjQzXG5cdFx0XHRcdDAuMjQtMC4zMlxuXHRcdFx0XHQwLjQ2XG5cdFx0XHRcdDAuMDdcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjExXG5cdFx0XHRcdDAuMjlcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjM1LTAuMTNcblx0XHRcdFx0MC4xNS0xLjM5LTAuMjUtMS43OS0wLjE4LTAuMjZcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQxLjU4XG5cdFx0XHRcdDAuODhcblx0XHRcdFx0Mi44OFxuXHRcdFx0XHQxLjYzXG5cdFx0XHRcdDAuMzNcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuNjktMC4yNVxuXHRcdFx0XHQwLjYtMi4xMy0wLjU3LTYuMDUtMS41LTguMDQtMS4xOS0wLjI4XG5cdFx0XHRcdDAuMDQtMC4zNlxuXHRcdFx0XHQwLjQtMC4xNVxuXHRcdFx0XHQwLjU3XG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjUxXG5cdFx0XHRcdDAuMzRcblx0XHRcdFx0MS4wNFxuXHRcdFx0XHQwLjU2XG5cdFx0XHRcdDEuMDNcblx0XHRcdFx0MC40NFxuXHRcdFx0XHQxLjZcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQxLjYzXG5cdFx0XHRcdDAuODYtMC40NFxuXHRcdFx0XHQwLjA2LTAuODdcblx0XHRcdFx0MC4xMS0xLjMxXG5cdFx0XHRcdDAuMTctMS42LTAuMjktNC44LTEuMy02LjQ2LTIuMS0wLjI5LTAuMTQtMC41OVxuXHRcdFx0XHQwLjE5LTAuNDJcblx0XHRcdFx0MC40N1xuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuNTdcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQxLjNcblx0XHRcdFx0MS42NlxuXHRcdFx0XHQyLjA3bDAuMlxuXHRcdFx0XHQwLjJjLTAuOTVcblx0XHRcdFx0MC4xMi0xLjg5XG5cdFx0XHRcdDAuMjQtMi44NFxuXHRcdFx0XHQwLjM2bC0wLjExLTAuMjctMC43Ni0wLjIxcy0yLjI4LTAuNTgtMy41NC0wLjU0Yy0wLjA0XG5cdFx0XHRcdDAtMC4wN1xuXHRcdFx0XHQwLTAuMS0wLjAxLTAuMzYtMC4xMi0yLjU5LTAuODgtMy45Ni0xLjY0LTAuMjgtMC4xNS0wLjU5XG5cdFx0XHRcdDAuMTQtMC40NVxuXHRcdFx0XHQwLjQzXG5cdFx0XHRcdDAuNDFcblx0XHRcdFx0MC44NVxuXHRcdFx0XHQxLjAzXG5cdFx0XHRcdDEuOTlcblx0XHRcdFx0MS42OVxuXHRcdFx0XHQyLjcyLTEuMDktMS4wNi00Ljc4LTQuMzItOC4xMy0zLjQ4LTAuMjhcblx0XHRcdFx0MC4wNy0wLjMzXG5cdFx0XHRcdDAuNDYtMC4wOFxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQwLjM5XG5cdFx0XHRcdDFcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjI4XG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjY0LTAuMjhcblx0XHRcdFx0MC41N2gtMC4wMmMtMC4yOC0wLjA2LTAuNDlcblx0XHRcdFx0MC4yNi0wLjMzXG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4yOC0wLjE5XG5cdFx0XHRcdDAuNTUtMC40NlxuXHRcdFx0XHQwLjQyLTEuMTItMC41NS0zLjg4LTEuNzUtNS40My0xLjA2LTAuMjZcblx0XHRcdFx0MC4xMi0wLjI2XG5cdFx0XHRcdDAuNDlcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuODNcblx0XHRcdFx0MC4zNVxuXHRcdFx0XHQxLjIzXG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuNjctMC4yNFxuXHRcdFx0XHQwLjYtMS41Ni0wLjMzLTQuNjEtMS4wMi02LjY3LTEuODItMC4zMy0wLjEzLTAuNlxuXHRcdFx0XHQwLjI4LTAuMzVcblx0XHRcdFx0MC41M1xuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC43NlxuXHRcdFx0XHQwLjc2XG5cdFx0XHRcdDEuMTZcblx0XHRcdFx0MS4xMlxuXHRcdFx0XHQwLjI2XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjY2LTAuMzJcblx0XHRcdFx0MC41NS0xLjIxLTAuNDItMi43MS0xLjAxLTMuMjgtMS40OVxuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC41NVxuXHRcdFx0XHQwLjc4XG5cdFx0XHRcdDAuODZcblx0XHRcdFx0MS4yMlxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC4yOC0wLjEzXG5cdFx0XHRcdDAuNjQtMC40M1xuXHRcdFx0XHQwLjQ3LTEuMDYtMC42LTIuNTctMS40Ny0zLjU1LTIuMDQtMC4yNy0wLjE2LTAuNThcblx0XHRcdFx0MC4xMS0wLjQ3XG5cdFx0XHRcdDAuNGwwLjA2XG5cdFx0XHRcdDAuMTVjMC4yNVxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDIuMDVcblx0XHRcdFx0MS45OFxuXHRcdFx0XHQxLjk4XG5cdFx0XHRcdDIuMTYtMC4wN1xuXHRcdFx0XHQwLjE3LTcuMDctMi4zMy04LjkxLTIuMDYtMS44NVxuXHRcdFx0XHQwLjI3XG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MC43M1xuXHRcdFx0XHQwLjkxXG5cdFx0XHRcdDAuODJcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjFcblx0XHRcdFx0MS42XG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MS41M1xuXHRcdFx0XHQxLjA1cy0yLjk4LTAuMDMtMy4xLTAuMjJjLTAuMDctMC4xLTAuOTktMC41Ny0xLjgtMC45Ni0wLjMtMC4xNS0wLjZcblx0XHRcdFx0MC4yLTAuNDFcblx0XHRcdFx0MC40OFxuXHRcdFx0XHQwLjQyXG5cdFx0XHRcdDAuNTlcblx0XHRcdFx0MC44MVxuXHRcdFx0XHQxLjI2XG5cdFx0XHRcdDAuNjZcblx0XHRcdFx0MS40OS0wLjI5XG5cdFx0XHRcdDAuNDUtMy4wNC0yLjA2LTMuOTgtMi4xNS0wLjk1LTAuMDlcblx0XHRcdFx0MC45N1xuXHRcdFx0XHQxLjMzXG5cdFx0XHRcdDAuOTdcblx0XHRcdFx0MS44XG5cdFx0XHRcdDBcblx0XHRcdFx0MC40OC0zLjE3LTEuMzQtMy45MS0xLjA0LTAuNFxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuNTZcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQxLjVcblx0XHRcdFx0MS42MlxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjcyLTAuMzRcblx0XHRcdFx0MC41NS0xLjU0LTAuNzMtMy42Ni0xLjYzLTQuOTMtMS43Mi0wLjI1LTAuMDItMC40M1xuXHRcdFx0XHQwLjI0LTAuMzJcblx0XHRcdFx0MC40NlxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC4xMVxuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuMDZcblx0XHRcdFx0MC4zNS0wLjEzXG5cdFx0XHRcdDAuMTUtMS4zOS0wLjI1LTEuNzktMC4xOC0wLjI2XG5cdFx0XHRcdDAuMDRcblx0XHRcdFx0MS41OFxuXHRcdFx0XHQwLjg4XG5cdFx0XHRcdDIuODhcblx0XHRcdFx0MS42M1xuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQwLjY5LTAuMjVcblx0XHRcdFx0MC42LTIuMTMtMC41Ny02LjA1LTEuNS04LjA0LTEuMTktMC4yOFxuXHRcdFx0XHQwLjA0LTAuMzZcblx0XHRcdFx0MC40LTAuMTVcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC41MVxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDEuMDRcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQxLjYxXG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0Mi4wOVxuXHRcdFx0XHQwLjkyXG5cdFx0XHRcdDEuMTdcblx0XHRcdFx0MS4xLTAuNzRcblx0XHRcdFx0MC4xNS01LjIzLTEuMTctNy4zMS0yLjE3LTAuMjktMC4xNC0wLjU5XG5cdFx0XHRcdDAuMTktMC40MlxuXHRcdFx0XHQwLjQ3XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjAzLTAuMzQtMC4xMy0wLjY2XG5cdFx0XHRcdDAuMjMtMC40OVxuXHRcdFx0XHQwLjU5XG5cdFx0XHRcdDAuNTRcblx0XHRcdFx0MS4xMlxuXHRcdFx0XHQxLjMzXG5cdFx0XHRcdDIuNjFcblx0XHRcdFx0Mi4xN1xuXHRcdFx0XHQzLjYzaC0wLjAyYy0xLjU1LTEuNTctNi4yNy01Ljg4LTEwLjQ1LTQuODctMC4zNlxuXHRcdFx0XHQwLjA5LTAuNDFcblx0XHRcdFx0MC42LTAuMDhcblx0XHRcdFx0MC44XG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQwLjg2XG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MS4zXG5cdFx0XHRcdDAuOTFcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjg3LTAuMzRcblx0XHRcdFx0MC43Ni0wLjAxXG5cdFx0XHRcdDAtMC4wMlxuXHRcdFx0XHQwLTAuMDMtMC4wMS0wLjM2LTAuMDktMC42MlxuXHRcdFx0XHQwLjM0LTAuNDFcblx0XHRcdFx0MC42N1xuXHRcdFx0XHQwLjA5XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC40NVxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMzgtMC4yMlxuXHRcdFx0XHQwLjc0LTAuNTdcblx0XHRcdFx0MC41NS0xLjQ1LTAuNzgtNS4wNC0yLjUtNy4wMS0xLjYyLTAuMzNcblx0XHRcdFx0MC4xNS0wLjMxXG5cdFx0XHRcdDAuNjZcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQwLjgxXG5cdFx0XHRcdDAuNDdcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDEuMDhcblx0XHRcdFx0MC41XG5cdFx0XHRcdDEuNlxuXHRcdFx0XHQwLjg1XG5cdFx0XHRcdDAuNFxuXHRcdFx0XHQwLjI3XG5cdFx0XHRcdDAuMThcblx0XHRcdFx0MC45MS0wLjI4XG5cdFx0XHRcdDAuOC0yLjAxLTAuNDktNS45NS0xLjUzLTguNjMtMi42OC0wLjQyLTAuMTgtMC43NVxuXHRcdFx0XHQwLjM2LTAuNDNcblx0XHRcdFx0MC43MVxuXHRcdFx0XHQwLjQ3XG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQxXG5cdFx0XHRcdDEuMDVcblx0XHRcdFx0MS41M1xuXHRcdFx0XHQxLjU2XG5cdFx0XHRcdDAuMzVcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuOS0wLjRcblx0XHRcdFx0MC43My0xLjU3LTAuNjEtMy41Mi0xLjQ1LTQuMjYtMi4xM1xuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0MC43M1xuXHRcdFx0XHQxLjA3XG5cdFx0XHRcdDEuMTVcblx0XHRcdFx0MS42OFxuXHRcdFx0XHQwLjI2XG5cdFx0XHRcdDAuMzktMC4xNFxuXHRcdFx0XHQwLjg2LTAuNTNcblx0XHRcdFx0MC42Mi0xLjM4LTAuODUtMy4zNS0yLjA3LTQuNjMtMi44OC0wLjM1LTAuMjItMC43NVxuXHRcdFx0XHQwLjE0LTAuNTlcblx0XHRcdFx0MC41M2wwLjA4XG5cdFx0XHRcdDAuMjFjMC4zNFxuXHRcdFx0XHQwLjg0XG5cdFx0XHRcdDIuN1xuXHRcdFx0XHQyLjc1XG5cdFx0XHRcdDIuNjFcblx0XHRcdFx0Mi45OHMtOS4xNS0zLjM5LTExLjUxLTMuMDhcblx0XHRcdFx0MC45XG5cdFx0XHRcdDEuMDFcblx0XHRcdFx0MS4xOVxuXHRcdFx0XHQxLjE1YzAuM1xuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDIuMDdcblx0XHRcdFx0MC45MlxuXHRcdFx0XHQyXG5cdFx0XHRcdDEuNDctMC4wOFxuXHRcdFx0XHQwLjU1LTMuODItMC4xNC0zLjk5LTAuNC0wLjA5LTAuMTQtMS4yOS0wLjgtMi4zNC0xLjM2LTAuMzktMC4yMS0wLjc2XG5cdFx0XHRcdDAuMjYtMC41MVxuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MC44MlxuXHRcdFx0XHQxLjA4XG5cdFx0XHRcdDEuNzNcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQyLjA0LTAuMzZcblx0XHRcdFx0MC42LTMuOTctMi44OS01LjE5LTMuMDQtMS4yMi0wLjE2XG5cdFx0XHRcdDEuMjlcblx0XHRcdFx0MS44MlxuXHRcdFx0XHQxLjMxXG5cdFx0XHRcdDIuNDdcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjY0LTQuMTItMS45MS01LjA2LTEuNTMtMC41XG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC43NFxuXHRcdFx0XHQxLjIyXG5cdFx0XHRcdDEuOThcblx0XHRcdFx0Mi4yNFxuXHRcdFx0XHQwLjQxXG5cdFx0XHRcdDAuMzNcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQwLjk3LTAuNDJcblx0XHRcdFx0MC43My0yLTEuMDQtNC43NS0yLjMzLTYuMzgtMi40OS0wLjMyLTAuMDMtMC41NFxuXHRcdFx0XHQwLjMxLTAuMzlcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQwLjA5XG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MC4wOVxuXHRcdFx0XHQwLjQ3LTAuMTZcblx0XHRcdFx0MC4yLTEuNzktMC4zOC0yLjMxLTAuMy0wLjM0XG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0Mi4wNlxuXHRcdFx0XHQxLjI0XG5cdFx0XHRcdDMuNzVcblx0XHRcdFx0Mi4zXG5cdFx0XHRcdDAuNDNcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuOTQtMC4zXG5cdFx0XHRcdDAuOC0yLjc1LTAuODQtNy44Mi0yLjI0LTEwLjM3LTEuODgtMC4zNVxuXHRcdFx0XHQwLjA1LTAuNDVcblx0XHRcdFx0MC41My0wLjE3XG5cdFx0XHRcdDAuNzdcblx0XHRcdFx0MC4yNVxuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuNjdcblx0XHRcdFx0MC40OFxuXHRcdFx0XHQxLjM1XG5cdFx0XHRcdDAuOFxuXHRcdFx0XHQyLjFcblx0XHRcdFx0MC45N1xuXHRcdFx0XHQyLjcyXG5cdFx0XHRcdDEuMzFcblx0XHRcdFx0MS41M1xuXHRcdFx0XHQxLjUzLTAuMDhcblx0XHRcdFx0MC4wMi0wLjJcblx0XHRcdFx0MC4wMS0wLjM1XG5cdFx0XHRcdDAtMC40Ni0wLjE5LTAuODUtMC4zOS0xLjE0LTAuNTlcblx0XHRcdFx0MFxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjQzXG5cdFx0XHRcdDAuNDctMi4wNS0wLjQ0LTYuMjMtMS45Mi04LjQtMy4wNS0wLjM4LTAuMi0wLjc1XG5cdFx0XHRcdDAuMjQtMC41MlxuXHRcdFx0XHQwLjYyXG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MC43OFxuXHRcdFx0XHQxLjE5XG5cdFx0XHRcdDEuNzhcblx0XHRcdFx0Mi4yXG5cdFx0XHRcdDIuODVcblx0XHRcdFx0MC43OVxuXHRcdFx0XHQwLjgzXG5cdFx0XHRcdDEuOTNcblx0XHRcdFx0MS44OVxuXHRcdFx0XHQzLjA5XG5cdFx0XHRcdDIuOTItMS42NC0wLjQyLTYuODktMi4xMS04LjQ1LTEuODYtMS44NFxuXHRcdFx0XHQwLjNcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDAuOTJcblx0XHRcdFx0MC44MXMxLjYxXG5cdFx0XHRcdDAuNjJcblx0XHRcdFx0MS41NFxuXHRcdFx0XHQxLjAzLTIuOThcblx0XHRcdFx0MC4wMS0zLjEtMC4xOGMtMC4xMy0wLjE5LTMuMDQtMS41LTMuMDQtMS41czEuNzlcblx0XHRcdFx0Mi4wOFxuXHRcdFx0XHQxLjVcblx0XHRcdFx0Mi41NC0zLjA2LTIuMDItNC4wMS0yLjFcblx0XHRcdFx0MC45OVxuXHRcdFx0XHQxLjMxXG5cdFx0XHRcdDFcblx0XHRcdFx0MS43OS0zLjE5LTEuMy0zLjkyLTAuOTljLTAuNjFcblx0XHRcdFx0MC4yNlxuXHRcdFx0XHQyLjAyXG5cdFx0XHRcdDEuODNcblx0XHRcdFx0Mi44NFxuXHRcdFx0XHQyLjY3LTAuMTVcblx0XHRcdFx0MC4wMi0wLjNcblx0XHRcdFx0MC4wNC0wLjQ1XG5cdFx0XHRcdDAuMDYtMS41Ni0wLjc3LTUuMzctMi41NC02LjczLTIuMTlcblx0XHRcdFx0MFxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuNzdzLTEuMzktMC4yMy0xLjc5LTAuMTZjLTAuMzNcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQyLjcxXG5cdFx0XHRcdDEuMzNcblx0XHRcdFx0My43N1xuXHRcdFx0XHQyLjE0LTAuMjlcblx0XHRcdFx0MC4wNC0wLjU4XG5cdFx0XHRcdDAuMDctMC44NlxuXHRcdFx0XHQwLjExLTIuMjEtMC41Ny02LjgyLTEuNjQtOC42OS0xLjA2XG5cdFx0XHRcdDBcblx0XHRcdFx0MC0wLjMyXG5cdFx0XHRcdDAuMzhcblx0XHRcdFx0MS4zXG5cdFx0XHRcdDEuMDRcblx0XHRcdFx0MC45XG5cdFx0XHRcdDAuMzdcblx0XHRcdFx0MS40NVxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MS42XG5cdFx0XHRcdDAuNzctMC41MlxuXHRcdFx0XHQwLjA3LTEuMDRcblx0XHRcdFx0MC4xMy0xLjU2XG5cdFx0XHRcdDAuMi0yLjIzLTAuNDQtNi43MS0xLjg5LTcuMjEtMi42XG5cdFx0XHRcdDBcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDEuMjRcblx0XHRcdFx0MS44OFxuXHRcdFx0XHQyLjc0LTAuNC0wLjEzLTIuNi0wLjg1LTMuOTYtMS41OC0wLjI4LTAuMTUtMC41OFxuXHRcdFx0XHQwLjE1LTAuNDRcblx0XHRcdFx0MC40M1xuXHRcdFx0XHQwLjMyXG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MC43NlxuXHRcdFx0XHQxLjQ0XG5cdFx0XHRcdDEuMjRcblx0XHRcdFx0Mi4xLTAuMDVcblx0XHRcdFx0MC4wMS0wLjExXG5cdFx0XHRcdDAuMDEtMC4xNlxuXHRcdFx0XHQwLjAyLTEuNTQtMS4zMi00LjY4LTMuNTYtNy41NC0yLjgtMC4yOFxuXHRcdFx0XHQwLjA3LTAuMzJcblx0XHRcdFx0MC40Ni0wLjA3XG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjNcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjY2XG5cdFx0XHRcdDAuMzhcblx0XHRcdFx0MS4wMVxuXHRcdFx0XHQwLjYzXG5cdFx0XHRcdDAuMjhcblx0XHRcdFx0MC4yMVxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuNjQtMC4yN1xuXHRcdFx0XHQwLjU3aC0wLjAyYy0wLjI4LTAuMDUtMC40OVxuXHRcdFx0XHQwLjI3LTAuMzJcblx0XHRcdFx0MC41XG5cdFx0XHRcdDAuMDdcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuMTNcblx0XHRcdFx0MC4yMVxuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuMzNcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQwLjI4LTAuMThcblx0XHRcdFx0MC41NS0wLjQ1XG5cdFx0XHRcdDAuNDItMS4xMi0wLjUzLTMuOS0xLjctNS40NC0wLjk5LTAuMjZcblx0XHRcdFx0MC4xMi0wLjI1XG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuNlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC44NFxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDEuMjRcblx0XHRcdFx0MC41OFxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MC4xM1xuXHRcdFx0XHQwLjY3LTAuMjNcblx0XHRcdFx0MC42LTEuNTYtMC4zMS00LjYyLTAuOTYtNi43LTEuNzMtMC4zMy0wLjEyLTAuNTlcblx0XHRcdFx0MC4yOS0wLjM0XG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuNzdcblx0XHRcdFx0MC43NVxuXHRcdFx0XHQxLjE4XG5cdFx0XHRcdDEuMTFcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC42Ni0wLjMyXG5cdFx0XHRcdDAuNTUtMS4yMi0wLjQxLTIuNzItMC45Ny0zLjI5LTEuNDVcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjNcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjc3XG5cdFx0XHRcdDAuODhcblx0XHRcdFx0MS4yMVxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC4yOC0wLjEyXG5cdFx0XHRcdDAuNjQtMC40MlxuXHRcdFx0XHQwLjQ3LTEuMDctMC41OS0yLjU5LTEuNDMtMy41OC0yLTAuMjctMC4xNS0wLjU4XG5cdFx0XHRcdDAuMTItMC40NlxuXHRcdFx0XHQwLjQxbDAuMDZcblx0XHRcdFx0MC4xNWMwLjI2XG5cdFx0XHRcdDAuNjFcblx0XHRcdFx0Mi4wOFxuXHRcdFx0XHQxLjk2XG5cdFx0XHRcdDJcblx0XHRcdFx0Mi4xMy0wLjA3XG5cdFx0XHRcdDAuMTctNy4wOS0yLjI0LTguOTQtMS45NC0xLjg0XG5cdFx0XHRcdDAuM1xuXHRcdFx0XHQwLjY5XG5cdFx0XHRcdDAuNzJcblx0XHRcdFx0MC45MlxuXHRcdFx0XHQwLjgxczEuNjFcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQxLjU0XG5cdFx0XHRcdDEuMDMtMi45OFxuXHRcdFx0XHQwLjAxLTMuMS0wLjE4Yy0wLjA3LTAuMS0xLTAuNTUtMS44MS0wLjk0LTAuMy0wLjE0LTAuNlxuXHRcdFx0XHQwLjIxLTAuNFxuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjgyXG5cdFx0XHRcdDEuMjVcblx0XHRcdFx0MC42N1xuXHRcdFx0XHQxLjQ4LTAuMjlcblx0XHRcdFx0MC40Ni0zLjA2LTIuMDItNC4wMS0yLjFzMC45OVxuXHRcdFx0XHQxLjMxXG5cdFx0XHRcdDFcblx0XHRcdFx0MS43OS0zLjE5LTEuMy0zLjkyLTAuOTljLTAuMzlcblx0XHRcdFx0MC4xN1xuXHRcdFx0XHQwLjU3XG5cdFx0XHRcdDAuODhcblx0XHRcdFx0MS41MlxuXHRcdFx0XHQxLjZcblx0XHRcdFx0MC4zMVxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC43Mi0wLjMzXG5cdFx0XHRcdDAuNTYtMS41NS0wLjcxLTMuNjgtMS41OS00Ljk1LTEuNjYtMC4yNS0wLjAxLTAuNDJcblx0XHRcdFx0MC4yNC0wLjMxXG5cdFx0XHRcdDAuNDdcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuMzUtMC4xM1xuXHRcdFx0XHQwLjE1LTEuMzktMC4yMy0xLjc5LTAuMTYtMC4yNlxuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDEuNlxuXHRcdFx0XHQwLjg2XG5cdFx0XHRcdDIuOVxuXHRcdFx0XHQxLjU5XG5cdFx0XHRcdDAuMzNcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuNjktMC4yNFxuXHRcdFx0XHQwLjYtMi4xMy0wLjU0LTYuMDctMS40My04LjA2LTEuMDktMC4yOFxuXHRcdFx0XHQwLjA1LTAuMzZcblx0XHRcdFx0MC40LTAuMTRcblx0XHRcdFx0MC41OFxuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC41MlxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDEuMDVcblx0XHRcdFx0MC41NVxuXHRcdFx0XHQxLjYyXG5cdFx0XHRcdDAuNjZcblx0XHRcdFx0Mi4xXG5cdFx0XHRcdDAuODlcblx0XHRcdFx0MS4xOFxuXHRcdFx0XHQxLjA5LTAuMjVcblx0XHRcdFx0MC4wNS0wLjkyLTAuMDUtMS43OS0wLjI2bC0wLjY4LTEuNjEtMC44NS0wLjIzcy0yLjUzLTAuNjEtMy45Mi0wLjU1Yy0wLjA0XG5cdFx0XHRcdDAtMC4wN1xuXHRcdFx0XHQwLTAuMTEtMC4wMS0wLjQtMC4xMy0yLjg4LTAuOTQtNC40LTEuNzUtMC4zMS0wLjE2LTAuNjVcblx0XHRcdFx0MC4xNi0wLjQ5XG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MC40N1xuXHRcdFx0XHQwLjkzXG5cdFx0XHRcdDEuMTZcblx0XHRcdFx0Mi4xN1xuXHRcdFx0XHQxLjg5XG5cdFx0XHRcdDIuOTctMS4yMy0xLjE3LTUuMzQtNC43LTkuMDMtMy43My0wLjMxXG5cdFx0XHRcdDAuMDgtMC4zNlxuXHRcdFx0XHQwLjUxLTAuMDhcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuMThcblx0XHRcdFx0MC43M1xuXHRcdFx0XHQwLjQyXG5cdFx0XHRcdDEuMTFcblx0XHRcdFx0MC43XG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuNzEtMC4zXG5cdFx0XHRcdDAuNjNoLTAuMDJjLTAuMzEtMC4wNi0wLjU0XG5cdFx0XHRcdDAuMjktMC4zNlxuXHRcdFx0XHQwLjU2XG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC4xMVxuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC4xNFxuXHRcdFx0XHQwLjMxLTAuMlxuXHRcdFx0XHQwLjYxLTAuNVxuXHRcdFx0XHQwLjQ3LTEuMjQtMC41OS00LjMxLTEuODgtNi4wMi0xLjEtMC4yOVxuXHRcdFx0XHQwLjEzLTAuMjhcblx0XHRcdFx0MC41NVxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuNjZcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC45M1xuXHRcdFx0XHQwLjM3XG5cdFx0XHRcdDEuMzdcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDAuMjFcblx0XHRcdFx0MC4xNFxuXHRcdFx0XHQwLjc0LTAuMjVcblx0XHRcdFx0MC42Ni0xLjczLTAuMzQtNS4xMS0xLjA2LTcuNDEtMS45MS0wLjM2LTAuMTQtMC42NVxuXHRcdFx0XHQwLjMyLTAuMzhcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuODVcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQxLjNcblx0XHRcdFx0MS4yM1xuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuMjZcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjczLTAuMzVcblx0XHRcdFx0MC42MS0xLjM1LTAuNDUtMy4wMS0xLjA4LTMuNjQtMS42XG5cdFx0XHRcdDAuMjVcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQwLjYyXG5cdFx0XHRcdDAuODVcblx0XHRcdFx0MC45N1xuXHRcdFx0XHQxLjM0XG5cdFx0XHRcdDAuMjJcblx0XHRcdFx0MC4zMS0wLjEzXG5cdFx0XHRcdDAuNzEtMC40N1xuXHRcdFx0XHQwLjUyLTEuMTgtMC42NS0yLjg3LTEuNTgtMy45Ni0yLjIxLTAuMy0wLjE3LTAuNjRcblx0XHRcdFx0MC4xMy0wLjUxXG5cdFx0XHRcdDAuNDVsMC4wN1xuXHRcdFx0XHQwLjE3YzAuMjlcblx0XHRcdFx0MC42OFxuXHRcdFx0XHQyLjNcblx0XHRcdFx0Mi4xN1xuXHRcdFx0XHQyLjIyXG5cdFx0XHRcdDIuMzZzLTcuODUtMi40OC05Ljg5LTIuMTVcblx0XHRcdFx0MC43NlxuXHRcdFx0XHQwLjc5XG5cdFx0XHRcdDEuMDJcblx0XHRcdFx0MC45YzAuMjZcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDEuNzhcblx0XHRcdFx0MC42OFxuXHRcdFx0XHQxLjdcblx0XHRcdFx0MS4xNC0wLjA3XG5cdFx0XHRcdDAuNDYtMy4yOVxuXHRcdFx0XHQwLjAxLTMuNDMtMC4yLTAuMDgtMC4xMS0xLjEtMC42MS0yLTEuMDQtMC4zNC0wLjE2LTAuNjZcblx0XHRcdFx0MC4yNC0wLjQ0XG5cdFx0XHRcdDAuNTRcblx0XHRcdFx0MC40N1xuXHRcdFx0XHQwLjY1XG5cdFx0XHRcdDAuOTFcblx0XHRcdFx0MS4zOFxuXHRcdFx0XHQwLjc1XG5cdFx0XHRcdDEuNjQtMC4zMlxuXHRcdFx0XHQwLjUxLTMuMzktMi4yNC00LjQ0LTIuMzNzMS4wOVxuXHRcdFx0XHQxLjQ1XG5cdFx0XHRcdDEuMVxuXHRcdFx0XHQxLjk4LTMuNTMtMS40My00LjM0LTEuMDljLTAuNDRcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjYzXG5cdFx0XHRcdDAuOThcblx0XHRcdFx0MS42OFxuXHRcdFx0XHQxLjc3XG5cdFx0XHRcdDAuMzVcblx0XHRcdFx0MC4yNlxuXHRcdFx0XHQwLjAzXG5cdFx0XHRcdDAuNzktMC4zN1xuXHRcdFx0XHQwLjYxLTEuNzEtMC43OS00LjA3LTEuNzYtNS40Ny0xLjg0LTAuMjgtMC4wMi0wLjQ3XG5cdFx0XHRcdDAuMjctMC4zNVxuXHRcdFx0XHQwLjUyXG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuMzJcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQwLjM4LTAuMTRcblx0XHRcdFx0MC4xNy0xLjU0LTAuMjUtMS45OS0wLjE3LTAuMjlcblx0XHRcdFx0MC4wNVxuXHRcdFx0XHQxLjc3XG5cdFx0XHRcdDAuOTVcblx0XHRcdFx0My4yMVxuXHRcdFx0XHQxLjc2XG5cdFx0XHRcdDAuMzdcblx0XHRcdFx0MC4yMVxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuNzctMC4yN1xuXHRcdFx0XHQwLjY2LTIuMzYtMC42LTYuNzEtMS41OC04LjkxLTEuMjEtMC4zXG5cdFx0XHRcdDAuMDUtMC40XG5cdFx0XHRcdDAuNDUtMC4xNVxuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDAuMjJcblx0XHRcdFx0MC4xN1xuXHRcdFx0XHQwLjU3XG5cdFx0XHRcdDAuMzdcblx0XHRcdFx0MS4xNlxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDEuNjNcblx0XHRcdFx0MC42NlxuXHRcdFx0XHQyLjIyXG5cdFx0XHRcdDAuOTNcblx0XHRcdFx0MS41NFxuXHRcdFx0XHQxLjE0LTAuNzktMC4yNi0yLjgxLTAuOTYtNC4xMy0xLjY2LTAuMzEtMC4xNi0wLjY1XG5cdFx0XHRcdDAuMTYtMC40OVxuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuMDZcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjM3LTEuNDQtMC40My0yLjkzLTAuOTUtMy45Mi0xLjQxLTAuMjYtMC4xMi0wLjUxXG5cdFx0XHRcdDAuMDktMC41MVxuXHRcdFx0XHQwLjMzLTAuOTYtMC4yMy0xLjk0LTAuMjgtMi45LTAuMDMtMC4zMVxuXHRcdFx0XHQwLjA4LTAuMzZcblx0XHRcdFx0MC41MS0wLjA4XG5cdFx0XHRcdDAuNjZcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuNzNcblx0XHRcdFx0MC40MlxuXHRcdFx0XHQxLjExXG5cdFx0XHRcdDAuN1xuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjcxLTAuM1xuXHRcdFx0XHQwLjYzaC0wLjAyYy0wLjMxLTAuMDYtMC41NFxuXHRcdFx0XHQwLjI5LTAuMzZcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC4zMS0wLjJcblx0XHRcdFx0MC42MS0wLjVcblx0XHRcdFx0MC40Ny0xLjI0LTAuNTktNC4zMS0xLjg4LTYuMDItMS4xLTAuMjlcblx0XHRcdFx0MC4xMy0wLjI4XG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjY2XG5cdFx0XHRcdDAuNFxuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuOTNcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQxLjM3XG5cdFx0XHRcdDAuNjVcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC43NC0wLjI1XG5cdFx0XHRcdDAuNjYtMS43My0wLjM0LTUuMTEtMS4wNi03LjQxLTEuOTEtMC4zNi0wLjE0LTAuNjVcblx0XHRcdFx0MC4zMi0wLjM4XG5cdFx0XHRcdDAuNTlcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuNFxuXHRcdFx0XHQwLjg1XG5cdFx0XHRcdDAuODNcblx0XHRcdFx0MS4zXG5cdFx0XHRcdDEuMjNcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjI2XG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC43My0wLjM1XG5cdFx0XHRcdDAuNjEtMS4zNS0wLjQ1LTMuMDEtMS4wOC0zLjY0LTEuNlxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDAuMzRcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQwLjg1XG5cdFx0XHRcdDAuOTdcblx0XHRcdFx0MS4zNFxuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuMzEtMC4xM1xuXHRcdFx0XHQwLjcxLTAuNDdcblx0XHRcdFx0MC41Mi0xLjE4LTAuNjUtMi44Ny0xLjU4LTMuOTYtMi4yMS0wLjMtMC4xNy0wLjY0XG5cdFx0XHRcdDAuMTMtMC41MVxuXHRcdFx0XHQwLjQ1bDAuMDdcblx0XHRcdFx0MC4xN2MwLjI5XG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0Mi4zXG5cdFx0XHRcdDIuMTdcblx0XHRcdFx0Mi4yMlxuXHRcdFx0XHQyLjM2cy03Ljg1LTIuNDgtOS44OS0yLjE1XG5cdFx0XHRcdDAuNzZcblx0XHRcdFx0MC43OVxuXHRcdFx0XHQxLjAyXG5cdFx0XHRcdDAuOWMwLjI2XG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQxLjc4XG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MS43XG5cdFx0XHRcdDEuMTRzLTMuMjlcblx0XHRcdFx0MC4wMS0zLjQzLTAuMmMtMC4wOC0wLjExLTEuMS0wLjYxLTItMS4wNC0wLjM0LTAuMTYtMC42NlxuXHRcdFx0XHQwLjI0LTAuNDRcblx0XHRcdFx0MC41NFxuXHRcdFx0XHQwLjQ3XG5cdFx0XHRcdDAuNjVcblx0XHRcdFx0MC45MVxuXHRcdFx0XHQxLjM4XG5cdFx0XHRcdDAuNzVcblx0XHRcdFx0MS42NC0wLjMyXG5cdFx0XHRcdDAuNTEtMy4zOS0yLjI0LTQuNDQtMi4zM3MxLjA5XG5cdFx0XHRcdDEuNDVcblx0XHRcdFx0MS4xXG5cdFx0XHRcdDEuOTgtMy41My0xLjQzLTQuMzQtMS4wOWMtMC40NFxuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuNjNcblx0XHRcdFx0MC45OFxuXHRcdFx0XHQxLjY4XG5cdFx0XHRcdDEuNzdcblx0XHRcdFx0MC4zNVxuXHRcdFx0XHQwLjI2XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC43OS0wLjM3XG5cdFx0XHRcdDAuNjEtMS43MS0wLjc5LTQuMDctMS43Ni01LjQ3LTEuODQtMC4yOC0wLjAyLTAuNDdcblx0XHRcdFx0MC4yNy0wLjM1XG5cdFx0XHRcdDAuNTJcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMTNcblx0XHRcdFx0MC4zMlxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMzgtMC4xNFxuXHRcdFx0XHQwLjE3LTEuNTQtMC4yNS0xLjk5LTAuMTctMC4yOVxuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDEuNzdcblx0XHRcdFx0MC45NVxuXHRcdFx0XHQzLjIxXG5cdFx0XHRcdDEuNzZcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC43Ny0wLjI3XG5cdFx0XHRcdDAuNjYtMi4zNi0wLjYtNi43MS0xLjU4LTguOTEtMS4yMS0wLjNcblx0XHRcdFx0MC4wNS0wLjRcblx0XHRcdFx0MC40NS0wLjE1XG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MC4yMVxuXHRcdFx0XHQwLjE3XG5cdFx0XHRcdDAuNTdcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQxLjE2XG5cdFx0XHRcdDAuNjFcblx0XHRcdFx0MS44XG5cdFx0XHRcdDAuNzNcblx0XHRcdFx0Mi4zM1xuXHRcdFx0XHQwLjk4XG5cdFx0XHRcdDEuM1xuXHRcdFx0XHQxLjItMC44MlxuXHRcdFx0XHQwLjE4LTUuOC0xLjIyLTguMTEtMi4yOS0wLjMyLTAuMTUtMC42NVxuXHRcdFx0XHQwLjIyLTAuNDVcblx0XHRcdFx0MC41MlxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQxXG5cdFx0XHRcdDEuNDJcblx0XHRcdFx0MS44N1xuXHRcdFx0XHQyLjI2XG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDAuMzJcblx0XHRcdFx0MC41M1xuXHRcdFx0XHQwLjUtMC43MS0wLjE2LTIuNzgtMC42LTQuMDQtMC41NS0wLjA0XG5cdFx0XHRcdDAtMC4wOFxuXHRcdFx0XHQwLTAuMTItMC4wMi0wLjQ0LTAuMTQtMy4xNC0xLjAyLTQuODEtMS45MS0wLjM0LTAuMTgtMC43XG5cdFx0XHRcdDAuMTgtMC41M1xuXHRcdFx0XHQwLjUyXG5cdFx0XHRcdDAuNTFcblx0XHRcdFx0MS4wMVxuXHRcdFx0XHQxLjI3XG5cdFx0XHRcdDIuMzdcblx0XHRcdFx0Mi4wN1xuXHRcdFx0XHQzLjI1LTEuMzUtMS4yOC01LjgzLTUuMTMtOS44Ni00LjA3LTAuMzRcblx0XHRcdFx0MC4wOS0wLjM5XG5cdFx0XHRcdDAuNTUtMC4wOFxuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDAuOFxuXHRcdFx0XHQwLjQ2XG5cdFx0XHRcdDEuMjJcblx0XHRcdFx0MC43N1xuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDAuMjVcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjc3LTAuMzNcblx0XHRcdFx0MC42OS0wLjAxXG5cdFx0XHRcdDAtMC4wMlxuXHRcdFx0XHQwLTAuMDMtMC4wMS0wLjM0LTAuMDYtMC41OVxuXHRcdFx0XHQwLjMyLTAuMzlcblx0XHRcdFx0MC42MVxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjI2XG5cdFx0XHRcdDAuMjJcblx0XHRcdFx0MC4zOVxuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMzMtMC4yMlxuXHRcdFx0XHQwLjY3LTAuNTVcblx0XHRcdFx0MC41MS0xLjM2LTAuNjUtNC43MS0yLjA2LTYuNTctMS4yLTAuMzJcblx0XHRcdFx0MC4xNS0wLjNcblx0XHRcdFx0MC42XG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC43MlxuXHRcdFx0XHQwLjQ0XG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MS4wMVxuXHRcdFx0XHQwLjQxXG5cdFx0XHRcdDEuNDlcblx0XHRcdFx0MC43XG5cdFx0XHRcdDAuMzhcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuODEtMC4yOFxuXHRcdFx0XHQwLjcyLTEuODktMC4zNy01LjU4LTEuMTUtOC4wOC0yLjA5LTAuNC0wLjE1LTAuNzFcblx0XHRcdFx0MC4zNS0wLjQxXG5cdFx0XHRcdDAuNjVcblx0XHRcdFx0MC40NFxuXHRcdFx0XHQwLjQzXG5cdFx0XHRcdDAuOTNcblx0XHRcdFx0MC45XG5cdFx0XHRcdDEuNDJcblx0XHRcdFx0MS4zNFxuXHRcdFx0XHQwLjMyXG5cdFx0XHRcdDAuMjhcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjgtMC4zOFxuXHRcdFx0XHQwLjY3LTEuNDctMC40OS0zLjI5LTEuMTctMy45OC0xLjc1XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQwLjY4XG5cdFx0XHRcdDAuOTNcblx0XHRcdFx0MS4wNlxuXHRcdFx0XHQxLjQ2XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC4zNC0wLjE0XG5cdFx0XHRcdDAuNzctMC41MVxuXHRcdFx0XHQwLjU3LTEuMjktMC43MS0zLjEzLTEuNzMtNC4zMi0yLjQxLTAuMzMtMC4xOS0wLjdcblx0XHRcdFx0MC4xNS0wLjU2XG5cdFx0XHRcdDAuNDlsMC4wOFxuXHRcdFx0XHQwLjE4YzAuMzFcblx0XHRcdFx0MC43NFxuXHRcdFx0XHQyLjUxXG5cdFx0XHRcdDIuMzZcblx0XHRcdFx0Mi40MlxuXHRcdFx0XHQyLjU3cy04LjU3LTIuNzEtMTAuNzktMi4zNWMtMi4yM1xuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuODNcblx0XHRcdFx0MC44N1xuXHRcdFx0XHQxLjExXG5cdFx0XHRcdDAuOThzMS45NFxuXHRcdFx0XHQwLjc1XG5cdFx0XHRcdDEuODZcblx0XHRcdFx0MS4yNS0zLjU5XG5cdFx0XHRcdDAuMDEtMy43NS0wLjIyYy0wLjA4LTAuMTItMS4yLTAuNjctMi4xOC0xLjEzLTAuMzctMC4xNy0wLjcyXG5cdFx0XHRcdDAuMjYtMC40OFxuXHRcdFx0XHQwLjU5XG5cdFx0XHRcdDAuNTFcblx0XHRcdFx0MC43MVxuXHRcdFx0XHQwLjk5XG5cdFx0XHRcdDEuNTFcblx0XHRcdFx0MC44MVxuXHRcdFx0XHQxLjc5LTAuMzVcblx0XHRcdFx0MC41NS0zLjctMi40NC00Ljg0LTIuNTRzMS4xOVxuXHRcdFx0XHQxLjU5XG5cdFx0XHRcdDEuMlxuXHRcdFx0XHQyLjE2YzAuMDFcblx0XHRcdFx0MC41OC0zLjg1LTEuNTYtNC43NC0xLjE5LTAuNDhcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDAuNjlcblx0XHRcdFx0MS4wN1xuXHRcdFx0XHQxLjgzXG5cdFx0XHRcdDEuOTNcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQwLjI4XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC44Ny0wLjRcblx0XHRcdFx0MC42Ny0xLjg3LTAuODYtNC40NC0xLjkyLTUuOTgtMi0wLjMtMC4wMi0wLjUxXG5cdFx0XHRcdDAuMjktMC4zOFxuXHRcdFx0XHQwLjU2XG5cdFx0XHRcdDAuMDlcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuMzVcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjQyLTAuMTZcblx0XHRcdFx0MC4xOC0xLjY4LTAuMjgtMi4xNy0wLjE5LTAuMzJcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQxLjkzXG5cdFx0XHRcdDEuMDNcblx0XHRcdFx0My41XG5cdFx0XHRcdDEuOTJcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjg0LTAuMjlcblx0XHRcdFx0MC43Mi0yLjU3LTAuNjYtNy4zMy0xLjcyLTkuNzMtMS4zMi0wLjMzXG5cdFx0XHRcdDAuMDYtMC40M1xuXHRcdFx0XHQwLjQ5LTAuMTdcblx0XHRcdFx0MC43XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjYyXG5cdFx0XHRcdDAuNDFcblx0XHRcdFx0MS4yNlxuXHRcdFx0XHQwLjY3XG5cdFx0XHRcdDEuOTZcblx0XHRcdFx0MC44XG5cdFx0XHRcdDIuNTRcblx0XHRcdFx0MS4wN1xuXHRcdFx0XHQxLjQyXG5cdFx0XHRcdDEuMzEtMC44OVxuXHRcdFx0XHQwLjE5LTYuMzQtMS4zMy04Ljg2LTIuNS0wLjM1LTAuMTYtMC43MVxuXHRcdFx0XHQwLjI0LTAuNDlcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC43Ni0wLjUzLTAuMjItMS4wNi0wLjQ2LTEuNS0wLjctMC4zNC0wLjE4LTAuN1xuXHRcdFx0XHQwLjE4LTAuNTNcblx0XHRcdFx0MC41MlxuXHRcdFx0XHQwLjUxXG5cdFx0XHRcdDEuMDFcblx0XHRcdFx0MS4yN1xuXHRcdFx0XHQyLjM3XG5cdFx0XHRcdDIuMDdcblx0XHRcdFx0My4yNS0xLjM1LTEuMjgtNS44My01LjEzLTkuODYtNC4wNy0wLjM0XG5cdFx0XHRcdDAuMDktMC4zOVxuXHRcdFx0XHQwLjU1LTAuMDhcblx0XHRcdFx0MC43MlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjhcblx0XHRcdFx0MC40NlxuXHRcdFx0XHQxLjIyXG5cdFx0XHRcdDAuNzdcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC43Ny0wLjMzXG5cdFx0XHRcdDAuNjloLTAuMDNjLTAuMzQtMC4wNi0wLjU5XG5cdFx0XHRcdDAuMzItMC4zOVxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMjZcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjM5XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC4zMy0wLjIyXG5cdFx0XHRcdDAuNjctMC41NVxuXHRcdFx0XHQwLjUxLTEuMzYtMC42NS00LjcxLTIuMDYtNi41Ny0xLjItMC4zMlxuXHRcdFx0XHQwLjE1LTAuM1xuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDAuNDRcblx0XHRcdFx0MC4xN1xuXHRcdFx0XHQxLjAxXG5cdFx0XHRcdDAuNDFcblx0XHRcdFx0MS40OVxuXHRcdFx0XHQwLjdcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC44MS0wLjI4XG5cdFx0XHRcdDAuNzItMS44OS0wLjM3LTUuNTgtMS4xNS04LjA4LTIuMDktMC40LTAuMTUtMC43MVxuXHRcdFx0XHQwLjM1LTAuNDFcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjQ0XG5cdFx0XHRcdDAuNDNcblx0XHRcdFx0MC45M1xuXHRcdFx0XHQwLjlcblx0XHRcdFx0MS40MlxuXHRcdFx0XHQxLjM0XG5cdFx0XHRcdDAuMzJcblx0XHRcdFx0MC4yOFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuOC0wLjM4XG5cdFx0XHRcdDAuNjctMS40Ny0wLjQ5LTMuMjktMS4xNy0zLjk4LTEuNzVcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjM3XG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MC45M1xuXHRcdFx0XHQxLjA2XG5cdFx0XHRcdDEuNDZcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQwLjM0LTAuMTRcblx0XHRcdFx0MC43Ny0wLjUxXG5cdFx0XHRcdDAuNTctMS4yOS0wLjcxLTMuMTMtMS43My00LjMyLTIuNDEtMC4zMy0wLjE5LTAuN1xuXHRcdFx0XHQwLjE1LTAuNTZcblx0XHRcdFx0MC40OWwwLjA4XG5cdFx0XHRcdDAuMThjMC4zMVxuXHRcdFx0XHQwLjc0XG5cdFx0XHRcdDIuNTFcblx0XHRcdFx0Mi4zNlxuXHRcdFx0XHQyLjQyXG5cdFx0XHRcdDIuNTdzLTguNTctMi43MS0xMC43OS0yLjM1Yy0yLjIzXG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQwLjg3XG5cdFx0XHRcdDEuMTFcblx0XHRcdFx0MC45OHMxLjk0XG5cdFx0XHRcdDAuNzVcblx0XHRcdFx0MS44NlxuXHRcdFx0XHQxLjI1LTMuNTlcblx0XHRcdFx0MC4wMS0zLjc1LTAuMjJjLTAuMDgtMC4xMi0xLjItMC42Ny0yLjE4LTEuMTMtMC4zNy0wLjE3LTAuNzJcblx0XHRcdFx0MC4yNi0wLjQ4XG5cdFx0XHRcdDAuNTlcblx0XHRcdFx0MC41MVxuXHRcdFx0XHQwLjcxXG5cdFx0XHRcdDAuOTlcblx0XHRcdFx0MS41MVxuXHRcdFx0XHQwLjgxXG5cdFx0XHRcdDEuNzktMC4zNVxuXHRcdFx0XHQwLjU1LTMuNy0yLjQ0LTQuODQtMi41NHMxLjE5XG5cdFx0XHRcdDEuNTlcblx0XHRcdFx0MS4yXG5cdFx0XHRcdDIuMTZjMC4wMVxuXHRcdFx0XHQwLjU4LTMuODUtMS41Ni00Ljc0LTEuMTktMC40OFxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQxLjA3XG5cdFx0XHRcdDEuODNcblx0XHRcdFx0MS45M1xuXHRcdFx0XHQwLjM4XG5cdFx0XHRcdDAuMjhcblx0XHRcdFx0MC4wM1xuXHRcdFx0XHQwLjg3LTAuNFxuXHRcdFx0XHQwLjY3LTEuODctMC44Ni00LjQ0LTEuOTItNS45OC0yLTAuMy0wLjAyLTAuNTFcblx0XHRcdFx0MC4yOS0wLjM4XG5cdFx0XHRcdDAuNTZcblx0XHRcdFx0MC4wOVxuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC4zNVxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuNDItMC4xNlxuXHRcdFx0XHQwLjE4LTEuNjgtMC4yOC0yLjE3LTAuMTktMC4zMlxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDEuOTNcblx0XHRcdFx0MS4wM1xuXHRcdFx0XHQzLjVcblx0XHRcdFx0MS45MlxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuODQtMC4yOVxuXHRcdFx0XHQwLjcyLTIuNTgtMC42Ni03LjMzLTEuNzItOS43My0xLjMyLTAuMzNcblx0XHRcdFx0MC4wNi0wLjQzXG5cdFx0XHRcdDAuNDktMC4xN1xuXHRcdFx0XHQwLjY5XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjYyXG5cdFx0XHRcdDAuNDFcblx0XHRcdFx0MS4yNlxuXHRcdFx0XHQwLjY3XG5cdFx0XHRcdDEuNzhcblx0XHRcdFx0MC43MlxuXHRcdFx0XHQyLjQyXG5cdFx0XHRcdDEuMDJcblx0XHRcdFx0MS42OFxuXHRcdFx0XHQxLjI1LTAuODYtMC4yOC0zLjA3LTEuMDUtNC41MS0xLjgxLTAuMzQtMC4xOC0wLjdcblx0XHRcdFx0MC4xOC0wLjUzXG5cdFx0XHRcdDAuNTJcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuMTNcblx0XHRcdFx0MC4yNlxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC40LTEuNTctMC40Ny0zLjItMS4wNC00LjI4LTEuNTQtMC4yOC0wLjEzLTAuNTVcblx0XHRcdFx0MC4xLTAuNTVcblx0XHRcdFx0MC4zNi0xLjA0LTAuMjUtMi4xMi0wLjMxLTMuMTYtMC4wMy0wLjM0XG5cdFx0XHRcdDAuMDktMC4zOVxuXHRcdFx0XHQwLjU1LTAuMDhcblx0XHRcdFx0MC43MlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQwLjhcblx0XHRcdFx0MC40NlxuXHRcdFx0XHQxLjIyXG5cdFx0XHRcdDAuNzdcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDAuMDlcblx0XHRcdFx0MC43Ny0wLjMzXG5cdFx0XHRcdDAuNjloLTAuMDNjLTAuMzQtMC4wNi0wLjU5XG5cdFx0XHRcdDAuMzItMC4zOVxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMjZcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjM5XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC4zMy0wLjIyXG5cdFx0XHRcdDAuNjctMC41NVxuXHRcdFx0XHQwLjUxLTEuMzYtMC42NS00LjcxLTIuMDYtNi41Ny0xLjItMC4zMlxuXHRcdFx0XHQwLjE1LTAuM1xuXHRcdFx0XHQwLjZcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDAuNDRcblx0XHRcdFx0MC4xN1xuXHRcdFx0XHQxLjAxXG5cdFx0XHRcdDAuNDFcblx0XHRcdFx0MS40OVxuXHRcdFx0XHQwLjdcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQwLjIzXG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC44MS0wLjI4XG5cdFx0XHRcdDAuNzItMS44OS0wLjM3LTUuNTgtMS4xNS04LjA4LTIuMDktMC40LTAuMTUtMC43MVxuXHRcdFx0XHQwLjM1LTAuNDFcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjQ0XG5cdFx0XHRcdDAuNDNcblx0XHRcdFx0MC45M1xuXHRcdFx0XHQwLjlcblx0XHRcdFx0MS40MlxuXHRcdFx0XHQxLjM0XG5cdFx0XHRcdDAuMzJcblx0XHRcdFx0MC4yOFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuOC0wLjM4XG5cdFx0XHRcdDAuNjctMS40Ny0wLjQ5LTMuMjktMS4xNy0zLjk4LTEuNzVcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjM3XG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MC45M1xuXHRcdFx0XHQxLjA2XG5cdFx0XHRcdDEuNDZcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQwLjM0LTAuMTRcblx0XHRcdFx0MC43Ny0wLjUxXG5cdFx0XHRcdDAuNTctMS4yOS0wLjcxLTMuMTMtMS43My00LjMyLTIuNDEtMC4zMy0wLjE5LTAuN1xuXHRcdFx0XHQwLjE1LTAuNTZcblx0XHRcdFx0MC40OWwwLjA4XG5cdFx0XHRcdDAuMThjMC4zMVxuXHRcdFx0XHQwLjc0XG5cdFx0XHRcdDIuNTFcblx0XHRcdFx0Mi4zNlxuXHRcdFx0XHQyLjQyXG5cdFx0XHRcdDIuNTdzLTguNTctMi43MS0xMC43OS0yLjM1Yy0yLjIzXG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQwLjg3XG5cdFx0XHRcdDEuMTFcblx0XHRcdFx0MC45OHMxLjk0XG5cdFx0XHRcdDAuNzVcblx0XHRcdFx0MS44NlxuXHRcdFx0XHQxLjI1LTMuNTlcblx0XHRcdFx0MC4wMS0zLjc1LTAuMjJjLTAuMDgtMC4xMi0xLjItMC42Ny0yLjE4LTEuMTMtMC4zNy0wLjE3LTAuNzJcblx0XHRcdFx0MC4yNi0wLjQ4XG5cdFx0XHRcdDAuNTlcblx0XHRcdFx0MC41MVxuXHRcdFx0XHQwLjcxXG5cdFx0XHRcdDAuOTlcblx0XHRcdFx0MS41MVxuXHRcdFx0XHQwLjgxXG5cdFx0XHRcdDEuNzktMC4zNVxuXHRcdFx0XHQwLjU1LTMuNy0yLjQ0LTQuODQtMi41NHMxLjE5XG5cdFx0XHRcdDEuNTlcblx0XHRcdFx0MS4yXG5cdFx0XHRcdDIuMTZjMC4wMVxuXHRcdFx0XHQwLjU4LTMuODUtMS41Ni00Ljc0LTEuMTktMC40OFxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQxLjA3XG5cdFx0XHRcdDEuODNcblx0XHRcdFx0MS45M1xuXHRcdFx0XHQwLjM4XG5cdFx0XHRcdDAuMjhcblx0XHRcdFx0MC4wM1xuXHRcdFx0XHQwLjg3LTAuNFxuXHRcdFx0XHQwLjY3LTEuODctMC44Ni00LjQ0LTEuOTItNS45OC0yLTAuMy0wLjAyLTAuNTFcblx0XHRcdFx0MC4yOS0wLjM4XG5cdFx0XHRcdDAuNTZcblx0XHRcdFx0MC4wOVxuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuMTRcblx0XHRcdFx0MC4zNVxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuNDItMC4xNlxuXHRcdFx0XHQwLjE4LTEuNjgtMC4yOC0yLjE3LTAuMTktMC4zMlxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDEuOTNcblx0XHRcdFx0MS4wM1xuXHRcdFx0XHQzLjVcblx0XHRcdFx0MS45MlxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjE1XG5cdFx0XHRcdDAuODQtMC4yOVxuXHRcdFx0XHQwLjcyLTIuNTctMC42Ni03LjMzLTEuNzItOS43My0xLjMyLTAuMzNcblx0XHRcdFx0MC4wNi0wLjQzXG5cdFx0XHRcdDAuNDktMC4xN1xuXHRcdFx0XHQwLjdcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuNjJcblx0XHRcdFx0MC40MVxuXHRcdFx0XHQxLjI2XG5cdFx0XHRcdDAuNjdcblx0XHRcdFx0MS42OFxuXHRcdFx0XHQwLjY4XG5cdFx0XHRcdDIuMzRcblx0XHRcdFx0MC45OFxuXHRcdFx0XHQxLjhcblx0XHRcdFx0MS4yMS0wLjEyLTAuMDctMC4yMi0wLjE0LTAuMy0wLjIxXG5cdFx0XHRcdDAuMDZcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjI1LTAuMDdcblx0XHRcdFx0MC4wMi0wLjE2XG5cdFx0XHRcdDAuMDQtMC4yNlxuXHRcdFx0XHQwLjA3LTAuMzlcblx0XHRcdFx0MC4wOC0xLjY2LTAuMTYtMy4xNy0wLjU2LTAuMDYtMC4wMy0wLjEyLTAuMDctMC4xNy0wLjEtMC4xLTAuMDYtMC4yLTAuMDYtMC4yOC0wLjAzLTEuODQtMC41MS0zLjkzLTEuMjEtNS4yNC0xLjgyLTAuMzUtMC4xNi0wLjcxXG5cdFx0XHRcdDAuMjQtMC40OVxuXHRcdFx0XHQwLjU3XG5cdFx0XHRcdDAuNDRcblx0XHRcdFx0MC42OFxuXHRcdFx0XHQxLjFcblx0XHRcdFx0MS41NVxuXHRcdFx0XHQyLjA0XG5cdFx0XHRcdDIuNDdcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjJcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuMy0xLjc5LTAuNDUtMy41Mi0wLjgxLTQuMzMtMC42Ny0yLjAxXG5cdFx0XHRcdDAuMzNcblx0XHRcdFx0MC43NVxuXHRcdFx0XHQwLjc4XG5cdFx0XHRcdDFcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQwLjA5XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC4zMlxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuNThcblx0XHRcdFx0MC4yNGwtMC43NFxuXHRcdFx0XHQwLjA1cy0xLjA1XG5cdFx0XHRcdDAuMDktMi4xNFxuXHRcdFx0XHQwLjI5Yy0wLjM4LTAuMi0wLjktMC40NC0xLjM4LTAuNjctMC4zMy0wLjE2LTAuNjVcblx0XHRcdFx0MC4yMy0wLjQ0XG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC4zM1xuXHRcdFx0XHQwLjMzXG5cdFx0XHRcdDAuNDktMC4wN1xuXHRcdFx0XHQwLjAyLTAuMTVcblx0XHRcdFx0MC4wNS0wLjIyXG5cdFx0XHRcdDAuMDctMC4wNFxuXHRcdFx0XHQwLjAxLTAuMDdcblx0XHRcdFx0MC4wMi0wLjExXG5cdFx0XHRcdDAuMDItMC4xN1xuXHRcdFx0XHQwLTAuNjlcblx0XHRcdFx0MC4wMS0xLjM2LTAuMDEtMC44OC0wLjU5LTEuOC0xLjIxLTIuMjktMS4yNS0wLjY4LTAuMDZcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjU4XG5cdFx0XHRcdDAuNTVcblx0XHRcdFx0MS4xOC0wLjU1LTAuMDQtMS4wOS0wLjA5LTEuNTYtMC4xNy0wLjE5LTAuMDMtMC4zNFxuXHRcdFx0XHQwLjA5LTAuMzlcblx0XHRcdFx0MC4yNC0wLjc2LTAuMjgtMS40OS0wLjQ5LTEuOC0wLjM2LTAuNDNcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjYyXG5cdFx0XHRcdDAuOTdcblx0XHRcdFx0MS42NlxuXHRcdFx0XHQxLjc0XG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuMTItMC44Ni0wLjI0LTEuODItMC40NC0yLjc5LTAuNS0xLjE0LTAuNDMtMi4yNy0wLjc4LTMuMDctMC44Mi0wLjI3LTAuMDItMC40NlxuXHRcdFx0XHQwLjI3LTAuMzRcblx0XHRcdFx0MC41MVxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuMTZcblx0XHRcdFx0MC4xM1xuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuMDdcblx0XHRcdFx0MC4zOC0wLjE0XG5cdFx0XHRcdDAuMTYtMS41Mi0wLjI1LTEuOTYtMC4xNy0wLjE4XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjRcblx0XHRcdFx0MS41MVxuXHRcdFx0XHQwLjg3LTAuMDdcblx0XHRcdFx0MC4wNC0wLjEzXG5cdFx0XHRcdDAuMDgtMC4yXG5cdFx0XHRcdDAuMTItMC4yNlxuXHRcdFx0XHQwLjE3LTAuMThcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuODJcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQxLjI2XG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjA3XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC4yOFxuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuNDUtMi4zMy0wLjU5LTYuNjItMS41Ni04Ljc5LTEuMTktMC4zXG5cdFx0XHRcdDAuMDUtMC4zOVxuXHRcdFx0XHQwLjQ0LTAuMTVcblx0XHRcdFx0MC42M1xuXHRcdFx0XHQwLjIxXG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC41NlxuXHRcdFx0XHQwLjM3XG5cdFx0XHRcdDEuMTRcblx0XHRcdFx0MC42XG5cdFx0XHRcdDEuNzdcblx0XHRcdFx0MC43MlxuXHRcdFx0XHQyLjNcblx0XHRcdFx0MC45N1xuXHRcdFx0XHQxLjI5XG5cdFx0XHRcdDEuMTktMC44MVxuXHRcdFx0XHQwLjE3LTUuNzMtMS4yMS04LjAxLTIuMjYtMC4zMi0wLjE1LTAuNjRcblx0XHRcdFx0MC4yMi0wLjQ1XG5cdFx0XHRcdDAuNTFcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuNjFcblx0XHRcdFx0MC45OVxuXHRcdFx0XHQxLjRcblx0XHRcdFx0MS44NFxuXHRcdFx0XHQyLjIzXG5cdFx0XHRcdDAuODJcblx0XHRcdFx0MC44XG5cdFx0XHRcdDIuMTFcblx0XHRcdFx0MS44OFxuXHRcdFx0XHQzLjMxXG5cdFx0XHRcdDIuODQtMC44N1xuXHRcdFx0XHQwLjA1LTEuNzNcblx0XHRcdFx0MC4wNy0yLjVcblx0XHRcdFx0MC4wNC0wLjM4LTAuMDEtMC41MVxuXHRcdFx0XHQwLjUtMC4xN1xuXHRcdFx0XHQwLjY3XG5cdFx0XHRcdDAuNDlcblx0XHRcdFx0MC4yNFxuXHRcdFx0XHQxLjA1XG5cdFx0XHRcdDAuNTFcblx0XHRcdFx0MS41OVxuXHRcdFx0XHQwLjc0XG5cdFx0XHRcdDAuMzVcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDAuNjgtMC4xNFxuXHRcdFx0XHQwLjY4LTEuNFxuXHRcdFx0XHQwLTMuMTUtMC4wNi0zLjktMC4zNlxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MC44NFxuXHRcdFx0XHQwLjZcblx0XHRcdFx0MS4zMlxuXHRcdFx0XHQwLjk1XG5cdFx0XHRcdDAuM1xuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuMVxuXHRcdFx0XHQwLjctMC4yN1xuXHRcdFx0XHQwLjYzLTEuMzEtMC4yNC0zLjE3LTAuNTgtNC4zOC0wLjgzLTAuMzMtMC4wNy0wLjU2XG5cdFx0XHRcdDAuMzMtMC4zNFxuXHRcdFx0XHQwLjU4bDAuMTJcblx0XHRcdFx0MC4xM2MwLjQ3XG5cdFx0XHRcdDAuNTRcblx0XHRcdFx0Mi44MVxuXHRcdFx0XHQxLjNcblx0XHRcdFx0Mi44XG5cdFx0XHRcdDEuNTEtMC4wMVxuXHRcdFx0XHQwLjItOC4xXG5cdFx0XHRcdDAuMTQtOS45MVxuXHRcdFx0XHQxLjA4czAuOTZcblx0XHRcdFx0MC41XG5cdFx0XHRcdDEuMjNcblx0XHRcdFx0MC41MlxuXHRcdFx0XHQxLjg3XG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MS45NFxuXHRcdFx0XHQwLjUzLTMuMDhcblx0XHRcdFx0MS4wMy0zLjI3XG5cdFx0XHRcdDAuODljLTAuMTEtMC4wOC0xLjIyLTAuMjMtMi4xOS0wLjM0LTAuMzYtMC4wNC0wLjU1XG5cdFx0XHRcdDAuNDMtMC4yNVxuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MC40NlxuXHRcdFx0XHQxLjI3XG5cdFx0XHRcdDFcblx0XHRcdFx0MS4yXG5cdFx0XHRcdDEuMy0wLjE0XG5cdFx0XHRcdDAuNTctMy44NS0xLjAzLTQuODYtMC43OC0xLjAxXG5cdFx0XHRcdDAuMjRcblx0XHRcdFx0MS40N1xuXHRcdFx0XHQxLjAxXG5cdFx0XHRcdDEuNjRcblx0XHRcdFx0MS41cy0zLjc0LTAuMjQtNC4zOVxuXHRcdFx0XHQwLjM0Yy0wLjM1XG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDIuMTFcblx0XHRcdFx0MS4xMlxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MC4xM1xuXHRcdFx0XHQwLjI3XG5cdFx0XHRcdDAuNzMtMC4xNlxuXHRcdFx0XHQwLjY5LTEuODQtMC4yLTQuMzUtMC4zNy01LjY4XG5cdFx0XHRcdDAtMC4yNlxuXHRcdFx0XHQwLjA3LTAuMzZcblx0XHRcdFx0MC40LTAuMTdcblx0XHRcdFx0MC41OVxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDAuMThcblx0XHRcdFx0MC4zNC0wLjA4XG5cdFx0XHRcdDAuMi0xLjUyXG5cdFx0XHRcdDAuMjUtMS45MVxuXHRcdFx0XHQwLjQ2LTAuMjVcblx0XHRcdFx0MC4xNFxuXHRcdFx0XHQxLjk0XG5cdFx0XHRcdDAuMzNcblx0XHRcdFx0My41NFxuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDAuNDFcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjM3XG5cdFx0XHRcdDAuNjctMC4wNVxuXHRcdFx0XHQwLjctMi4zOVxuXHRcdFx0XHQwLjE3LTYuNzZcblx0XHRcdFx0MC42Mi04Ljdcblx0XHRcdFx0MS42Ni0wLjI3XG5cdFx0XHRcdDAuMTQtMC4yM1xuXHRcdFx0XHQwLjU0XG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC42NFxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDAuMDlcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjE3XG5cdFx0XHRcdDEuMjdcblx0XHRcdFx0MC4yMVxuXHRcdFx0XHQxLjlcblx0XHRcdFx0MC4xMlxuXHRcdFx0XHQyLjQ4XG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MS41OVxuXHRcdFx0XHQwLjcxLTAuNzFcblx0XHRcdFx0MC40Mi01Ljhcblx0XHRcdFx0MC42Ny04LjI5XG5cdFx0XHRcdDAuMzktMC4zNS0wLjA0LTAuNTRcblx0XHRcdFx0MC40MS0wLjI2XG5cdFx0XHRcdDAuNjNcblx0XHRcdFx0MC41N1xuXHRcdFx0XHQwLjQ1XG5cdFx0XHRcdDEuMzhcblx0XHRcdFx0MS4wMVxuXHRcdFx0XHQyLjQ0XG5cdFx0XHRcdDEuNTNcblx0XHRcdFx0MC44MlxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MS45N1xuXHRcdFx0XHQwLjg2XG5cdFx0XHRcdDMuMTJcblx0XHRcdFx0MS4zLTAuNDRcblx0XHRcdFx0MC41OC0wLjhcblx0XHRcdFx0MS4xNS0xLjA1XG5cdFx0XHRcdDEuNzJcblx0XHRcdFx0MS4xOVxuXHRcdFx0XHQxLjM0XG5cdFx0XHRcdDIuMzNcblx0XHRcdFx0Mi42NFxuXHRcdFx0XHQyLjY3XG5cdFx0XHRcdDIuMzJcblx0XHRcdFx0MC4zMi0wLjMtMC4wMy0xLjQ4LTAuNDUtMi41NS0wLjItMC41XG5cdFx0XHRcdDAuNC0wLjkzXG5cdFx0XHRcdDAuODEtMC41OVxuXHRcdFx0XHQxLjFcblx0XHRcdFx0MC45MVxuXHRcdFx0XHQyLjM2XG5cdFx0XHRcdDEuOTdcblx0XHRcdFx0Mi40M1xuXHRcdFx0XHQyLjE1XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQ0LjQ3XG5cdFx0XHRcdDIuMTFcblx0XHRcdFx0NC43M1xuXHRcdFx0XHQxLjVcblx0XHRcdFx0MC4yNy0wLjYxLTEuNjUtMS45Ni0xLjk3LTIuMi0wLjE5LTAuMTQtMS41Ni0wLjc2LTIuMDYtMS4ybDAuODMtMC40MmMwLjA0XG5cdFx0XHRcdDBcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQyLjk4XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MTIuODlcblx0XHRcdFx0Ni43NVxuXHRcdFx0XHQxMy4wN1xuXHRcdFx0XHQ2LjUxcy0yLjEtMy4wMy0yLjI2LTQuMDhsLTAuMDQtMC4yNmMtMC4wNy0wLjQ5XG5cdFx0XHRcdDAuNTItMC43OVxuXHRcdFx0XHQwLjg4LTAuNDVcblx0XHRcdFx0MS4zXG5cdFx0XHRcdDEuMjZcblx0XHRcdFx0My4zMlxuXHRcdFx0XHQzLjE2XG5cdFx0XHRcdDQuNzRcblx0XHRcdFx0NC40OVxuXHRcdFx0XHQwLjRcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQxLjA0LTAuMDVcblx0XHRcdFx0MC44NC0wLjU3LTAuMzEtMC44LTAuNjUtMS42NS0wLjg3LTIuMjFcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQwLjk2XG5cdFx0XHRcdDIuOFxuXHRcdFx0XHQyLjQzXG5cdFx0XHRcdDQuNTNcblx0XHRcdFx0My41M1xuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuMzFcblx0XHRcdFx0MS4wMy0wLjI2XG5cdFx0XHRcdDAuNzEtMC43My0wLjQ5LTAuNzItMC45Ny0xLjQ4LTEuMzgtMi4xNy0wLjI5LTAuNDhcblx0XHRcdFx0MC4yOC0xLjAxXG5cdFx0XHRcdDAuNzQtMC42OVxuXHRcdFx0XHQyLjlcblx0XHRcdFx0Mi4wMVxuXHRcdFx0XHQ3LjM4XG5cdFx0XHRcdDQuMjFcblx0XHRcdFx0OS42OFxuXHRcdFx0XHQ1LjNcblx0XHRcdFx0MC41M1xuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDEtMC40MlxuXHRcdFx0XHQwLjU5LTAuODMtMC41Mi0wLjU0LTEuMTctMS4wMy0xLjY4LTEuMzktMC4zOC0wLjI2LTAuMjUtMC44NVxuXHRcdFx0XHQwLjIxLTAuOTNcblx0XHRcdFx0Mi42OC0wLjQ4XG5cdFx0XHRcdDYuNTFcblx0XHRcdFx0Mi40MVxuXHRcdFx0XHQ4LjA0XG5cdFx0XHRcdDMuNjdcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDAuOTVcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjg3LTAuNDctMC4wMy0wLjItMC4wOS0wLjM5LTAuMTYtMC41OC0wLjE2LTAuNDNcblx0XHRcdFx0MC4yOS0wLjg0XG5cdFx0XHRcdDAuNy0wLjY1XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wM1xuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDEtMC4zNVxuXHRcdFx0XHQwLjY1LTAuNzctMC40My0wLjUzLTAuOTEtMS0xLjMxLTEuMzctMC4zNC0wLjMxLTAuMTItMC44OVxuXHRcdFx0XHQwLjM0LTAuODlcblx0XHRcdFx0NS41Mi0wLjA1XG5cdFx0XHRcdDEwXG5cdFx0XHRcdDYuMzRcblx0XHRcdFx0MTEuMzFcblx0XHRcdFx0OC40MS0wLjc0LTEuMzgtMS4yNi0zLjM2LTEuNTgtNC44Mi0wLjExLTAuNDlcblx0XHRcdFx0MC40OC0wLjgzXG5cdFx0XHRcdDAuODYtMC40OVxuXHRcdFx0XHQxLjg0XG5cdFx0XHRcdDEuNjhcblx0XHRcdFx0NS4wMlxuXHRcdFx0XHQzLjY5XG5cdFx0XHRcdDUuNTRcblx0XHRcdFx0NC4wMVxuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuODdcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQxLjk5XG5cdFx0XHRcdDAuNjJcblx0XHRcdFx0Mi45N1xuXHRcdFx0XHQxLjA1LTAuMDMtMC4wNy0wLjA1LTAuMTUtMC4wNy0wLjIxLTAuMTYtMC40OVxuXHRcdFx0XHQwLjQyLTAuODlcblx0XHRcdFx0MC44Mi0wLjU2XG5cdFx0XHRcdDAuOThcblx0XHRcdFx0MC44XG5cdFx0XHRcdDIuMzlcblx0XHRcdFx0MS43NlxuXHRcdFx0XHQzLjg3XG5cdFx0XHRcdDIuNjlsMy42NC05LjA2YzEuNTItMy43OFxuXHRcdFx0XHQ1LjE4LTYuMjZcblx0XHRcdFx0OS4yNi02LjI2aDguNDRsMTIuODlcblx0XHRcdFx0NS43XG5cdFx0XHRcdDEuOTZcblx0XHRcdFx0Ni45aDguNDlsOS4xOVxuXHRcdFx0XHQ1Ljdcblx0XHRcdFx0MS41MVxuXHRcdFx0XHQzLjYyYzAuODVcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQxLjg2XG5cdFx0XHRcdDEuMzNcblx0XHRcdFx0Mi43NlxuXHRcdFx0XHQxLjlcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuNzUtMC4yMS0wLjc2LTEuMDUtMS40NS0yLjA3LTEuOTYtMi45LTAuOTEtMS40OC0xLjQ2LTIuODEtMS44LTMuODItMC4xNi0wLjQ5XG5cdFx0XHRcdDAuNDItMC44OVxuXHRcdFx0XHQwLjgyLTAuNTZcblx0XHRcdFx0Mi44NVxuXHRcdFx0XHQyLjMyXG5cdFx0XHRcdDkuMzNcblx0XHRcdFx0Ni4wNFxuXHRcdFx0XHQxMC41NFxuXHRcdFx0XHQ2LjA5XG5cdFx0XHRcdDAuMTdcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjNcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjQyXG5cdFx0XHRcdDBcblx0XHRcdFx0MC4wMy0wLjAxXG5cdFx0XHRcdDAuMDYtMC4wM1xuXHRcdFx0XHQwLjEtMC4wM1xuXHRcdFx0XHQwLjA1LTAuMDFcblx0XHRcdFx0MC4xMS0wLjAxXG5cdFx0XHRcdDAuMTYtMC4wMlxuXHRcdFx0XHQwLjQ3LTAuMTgtMC4zMS0wLjc5LTIuMDctMi4wOS0wLjczLTAuNTQtMS4xNi0wLjk1LTEuNC0xLjI2LTAuMjctMC4zNVxuXHRcdFx0XHQwLTAuODdcblx0XHRcdFx0MC40NC0wLjgzXG5cdFx0XHRcdDMuMjFcblx0XHRcdFx0MC4yNlxuXHRcdFx0XHQ4Ljk2XG5cdFx0XHRcdDMuMTdcblx0XHRcdFx0MTIuMDVcblx0XHRcdFx0NC44NVxuXHRcdFx0XHQwLjE3XG5cdFx0XHRcdDAuMDlcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQwLjA4XG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MC4wMi0wLjI5LTAuMzEtMC41Ny0wLjU5LTAuODMtMC44My0wLjI3LTAuMjUtMC4xOC0wLjY1XG5cdFx0XHRcdDAuMDktMC44Mi0xLjU5LTEuNDMtMy4zNC0yLjgyLTIuOTktMi43OVxuXHRcdFx0XHQwLjY1XG5cdFx0XHRcdDAuMDRcblx0XHRcdFx0Mi40NlxuXHRcdFx0XHQxLjEzXG5cdFx0XHRcdDIuNzJcblx0XHRcdFx0MC45NVxuXHRcdFx0XHQwLjExLTAuMDdcblx0XHRcdFx0MC4wOS0wLjMxXG5cdFx0XHRcdDAuMDQtMC41Ni0wLjA4LTAuMzlcblx0XHRcdFx0MC4yOS0wLjcyXG5cdFx0XHRcdDAuNjctMC42XG5cdFx0XHRcdDEuOTRcblx0XHRcdFx0MC42MVxuXHRcdFx0XHQ0Ljg5XG5cdFx0XHRcdDIuOFxuXHRcdFx0XHQ3LjAxXG5cdFx0XHRcdDQuNTFcblx0XHRcdFx0MC40OFxuXHRcdFx0XHQwLjM5XG5cdFx0XHRcdDEuMTMtMC4yNFxuXHRcdFx0XHQwLjc0LTAuNzMtMS4xOS0xLjQ3LTIuMzktMi45Ni0xLjcyLTMuMDZcblx0XHRcdFx0MS4yNi0wLjE5XG5cdFx0XHRcdDUuNTFcblx0XHRcdFx0My44XG5cdFx0XHRcdDUuNjhcblx0XHRcdFx0My4wNlxuXHRcdFx0XHQwLjE4LTAuNzQtMi4yNi0zLjY1LTAuODMtMy4xNXM0Ljc1XG5cdFx0XHRcdDUuNDFcblx0XHRcdFx0NS4zN1xuXHRcdFx0XHQ0LjgyYzAuMzItMC4zLTAuMDMtMS40OC0wLjQ1LTIuNTUtMC4yLTAuNVxuXHRcdFx0XHQwLjQtMC45M1xuXHRcdFx0XHQwLjgxLTAuNTlcblx0XHRcdFx0MS4xXG5cdFx0XHRcdDAuOTFcblx0XHRcdFx0Mi4zNlxuXHRcdFx0XHQxLjk3XG5cdFx0XHRcdDIuNDNcblx0XHRcdFx0Mi4xNVxuXHRcdFx0XHQwLjEyXG5cdFx0XHRcdDAuMzRcblx0XHRcdFx0NC40N1xuXHRcdFx0XHQyLjExXG5cdFx0XHRcdDQuNzNcblx0XHRcdFx0MS41XG5cdFx0XHRcdDAuMjctMC42MS0xLjY1LTEuOTYtMS45Ny0yLjJzLTQuMDgtMS44OC0xLjEtMS42MVxuXHRcdFx0XHQxMi44OVxuXHRcdFx0XHQ2Ljc1XG5cdFx0XHRcdDEzLjA3XG5cdFx0XHRcdDYuNTEtMi4xLTMuMDMtMi4yNi00LjA4bC0wLjA0LTAuMjZjLTAuMDctMC40OVxuXHRcdFx0XHQwLjUyLTAuNzlcblx0XHRcdFx0MC44OC0wLjQ1XG5cdFx0XHRcdDEuM1xuXHRcdFx0XHQxLjI2XG5cdFx0XHRcdDMuMzJcblx0XHRcdFx0My4xNlxuXHRcdFx0XHQ0Ljc0XG5cdFx0XHRcdDQuNDlcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuMzhcblx0XHRcdFx0MS4wNC0wLjA1XG5cdFx0XHRcdDAuODQtMC41Ni0wLjIzLTAuNTgtMC40Ni0xLjE5LTAuNjYtMS42OWwtNi4wMi01LjI5LTcuMDYtMTEuNzItMC43NVxuXHRcdFx0XHQxLjEzYy0xLjAzXG5cdFx0XHRcdDEuNTYtMy4yM1xuXHRcdFx0XHQxLjk2LTQuNjNcblx0XHRcdFx0MC43NC0xLjMyLTEuMTUtMS4yLTIuOTJcblx0XHRcdFx0MC4xNi0yLjM1XG5cdFx0XHRcdDIuMTFcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQzLjg4LTAuNzdcblx0XHRcdFx0My44OC0wLjc3LTEuNjYtMy40OC05LjkzLTEwLjAxLTkuOTMtMTAuMDFzLTIuMTJcblx0XHRcdFx0NC40Mi01LjYxXG5cdFx0XHRcdDQuMDZjLTMuNDktMC4zNy0zLjk5LTUuMDMtMS4zOC00Ljc5czUtMS4wM1xuXHRcdFx0XHQ1LTEuMDNsLTYuMTEtNS41NVxuXHRcdFx0XHQwLjYtMC45NlxuXHRcdFx0XHQ0Ljc1XG5cdFx0XHRcdDIuOTZzLTEuODUtOS4zM1xuXHRcdFx0XHQxLjQyLTcuNDFjMy4yN1xuXHRcdFx0XHQxLjkzXG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0OS40XG5cdFx0XHRcdDAuNDJcblx0XHRcdFx0OS40XG5cdFx0XHRcdDQuMzVcblx0XHRcdFx0Mi45MlxuXHRcdFx0XHQxMS40MVxuXHRcdFx0XHQxMS41NlxuXHRcdFx0XHQxMS40MVxuXHRcdFx0XHQxMS41NnMtNC42Ny05LjkyXG5cdFx0XHRcdDAuMTItOS4wN1xuXHRcdFx0XHQyLjMxXG5cdFx0XHRcdDEyLjY2XG5cdFx0XHRcdDIuMzFcblx0XHRcdFx0MTIuNjZsMTAuOTRcblx0XHRcdFx0MTMuMTlcblx0XHRcdFx0MTEuNThcblx0XHRcdFx0NS4zOWMtMi44Ni0yLjQ3LTQuNDctOS4xOS00LjQ3LTkuMTlcblx0XHRcdFx0MC44N1xuXHRcdFx0XHQxLjU2XG5cdFx0XHRcdDIuNjJcblx0XHRcdFx0My42XG5cdFx0XHRcdDQuNDFcblx0XHRcdFx0NS40N1xuXHRcdFx0XHQxLjEyXG5cdFx0XHRcdDEuMTdcblx0XHRcdFx0Mi4yNFxuXHRcdFx0XHQyLjI2XG5cdFx0XHRcdDMuMThcblx0XHRcdFx0My4xNFxuXHRcdFx0XHQwLjM0XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQwLjFcblx0XHRcdFx0MS4wNFxuXHRcdFx0XHQwLjItMC42OC0xLjQyLTEuMDUtMy0xLjA1LTNcblx0XHRcdFx0MS43OFxuXHRcdFx0XHQyLjM4XG5cdFx0XHRcdDQuNDVcblx0XHRcdFx0NC4yOFxuXHRcdFx0XHQ3Ljg3XG5cdFx0XHRcdDYuMjFcblx0XHRcdFx0MC4wMS0wLjA2XG5cdFx0XHRcdDAuMDEtMC4xMVxuXHRcdFx0XHQwLTAuMTgtMC4wMy0wLjItMC4wOS0wLjM5LTAuMTYtMC41OC0wLjE2LTAuNDNcblx0XHRcdFx0MC4yOS0wLjg0XG5cdFx0XHRcdDAuNy0wLjY1XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wM1xuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuNVxuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDEtMC4zNVxuXHRcdFx0XHQwLjY1LTAuNzctMC40My0wLjUzLTAuOTEtMS0xLjMxLTEuMzctMC4zNC0wLjMxLTAuMTItMC44OVxuXHRcdFx0XHQwLjM1LTAuODlcblx0XHRcdFx0NS41Mi0wLjA1XG5cdFx0XHRcdDEwXG5cdFx0XHRcdDYuMzRcblx0XHRcdFx0MTEuMzFcblx0XHRcdFx0OC40MS0wLjc0LTEuMzgtMS4yNi0zLjM2LTEuNTgtNC44Mi0wLjExLTAuNDlcblx0XHRcdFx0MC40OC0wLjgzXG5cdFx0XHRcdDAuODYtMC40OVxuXHRcdFx0XHQxLjg0XG5cdFx0XHRcdDEuNjhcblx0XHRcdFx0NS4wMlxuXHRcdFx0XHQzLjY5XG5cdFx0XHRcdDUuNTRcblx0XHRcdFx0NC4wMVxuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC4xNVxuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuOTlcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQxLjU0XG5cdFx0XHRcdDAuNDctMC41OC0wLjgtMS4xMS0xLjU4LTEuNDktMi4yLTAuNjgtMS4xMS0xLjEtMi4xMS0xLjM1LTIuODctMC4xMi0wLjM3XG5cdFx0XHRcdDAuMzItMC42N1xuXHRcdFx0XHQwLjYyLTAuNDJcblx0XHRcdFx0Mi4xNFxuXHRcdFx0XHQxLjc0XG5cdFx0XHRcdDcuMDFcblx0XHRcdFx0NC41NFxuXHRcdFx0XHQ3LjkyXG5cdFx0XHRcdDQuNTdcblx0XHRcdFx0MS4xNFxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuNjUtMC4zNi0xLjA1LTEuNjEtMC41NS0wLjQxLTAuODctMC43Mi0xLjA1LTAuOTUtMC4yLTAuMjZcblx0XHRcdFx0MC0wLjY1XG5cdFx0XHRcdDAuMzMtMC42M1xuXHRcdFx0XHQyLjQyXG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQ2Ljc0XG5cdFx0XHRcdDIuMzhcblx0XHRcdFx0OS4wNlxuXHRcdFx0XHQzLjY1XG5cdFx0XHRcdDAuNFxuXHRcdFx0XHQwLjIyXG5cdFx0XHRcdDAuNzktMC4zMVxuXHRcdFx0XHQwLjQ2LTAuNjItMS4zLTEuMjQtMy4yMi0yLjczLTIuOS0yLjcxXG5cdFx0XHRcdDAuNDlcblx0XHRcdFx0MC4wM1xuXHRcdFx0XHQxLjg1XG5cdFx0XHRcdDAuODVcblx0XHRcdFx0Mi4wNFxuXHRcdFx0XHQwLjcxXG5cdFx0XHRcdDAuMDgtMC4wNlxuXHRcdFx0XHQwLjA3LTAuMjNcblx0XHRcdFx0MC4wMy0wLjQyLTAuMDYtMC4yOVxuXHRcdFx0XHQwLjIyLTAuNTRcblx0XHRcdFx0MC41LTAuNDVcblx0XHRcdFx0MS40NlxuXHRcdFx0XHQwLjQ2XG5cdFx0XHRcdDMuNjhcblx0XHRcdFx0Mi4xMVxuXHRcdFx0XHQ1LjI3XG5cdFx0XHRcdDMuMzlcblx0XHRcdFx0MC4zNlxuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuODUtMC4xOFxuXHRcdFx0XHQwLjU1LTAuNTUtMC44OS0xLjExLTEuOC0yLjIyLTEuMjktMi4zXG5cdFx0XHRcdDAuOTUtMC4xNFxuXHRcdFx0XHQ0LjE0XG5cdFx0XHRcdDIuODZcblx0XHRcdFx0NC4yN1xuXHRcdFx0XHQyLjNzLTEuNy0yLjc0LTAuNjItMi4zN1xuXHRcdFx0XHQzLjU3XG5cdFx0XHRcdDQuMDdcblx0XHRcdFx0NC4wNFxuXHRcdFx0XHQzLjYyYzAuMjQtMC4yMy0wLjAyLTEuMTEtMC4zNC0xLjkyLTAuMTUtMC4zN1xuXHRcdFx0XHQwLjMtMC43XG5cdFx0XHRcdDAuNjEtMC40NFxuXHRcdFx0XHQwLjgzXG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MS43N1xuXHRcdFx0XHQxLjQ4XG5cdFx0XHRcdDEuODJcblx0XHRcdFx0MS42MlxuXHRcdFx0XHQwLjA5XG5cdFx0XHRcdDAuMjVcblx0XHRcdFx0My4zNlxuXHRcdFx0XHQxLjU4XG5cdFx0XHRcdDMuNTZcblx0XHRcdFx0MS4xM1xuXHRcdFx0XHQwLjItMC40Ni0xLjI0LTEuNDctMS40OC0xLjY1cy0zLjA2LTEuNDEtMC44My0xLjIxYzIuMjRcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDkuNjlcblx0XHRcdFx0NS4wOFxuXHRcdFx0XHQ5LjgzXG5cdFx0XHRcdDQuOVxuXHRcdFx0XHQwLjEzLTAuMTgtMS41OC0yLjI4LTEuNy0zLjA2bC0wLjAzLTAuMTljLTAuMDYtMC4zN1xuXHRcdFx0XHQwLjM5LTAuNlxuXHRcdFx0XHQwLjY2LTAuMzRcblx0XHRcdFx0MC45OFxuXHRcdFx0XHQwLjk0XG5cdFx0XHRcdDIuNVxuXHRcdFx0XHQyLjM3XG5cdFx0XHRcdDMuNTdcblx0XHRcdFx0My4zN1xuXHRcdFx0XHQwLjNcblx0XHRcdFx0MC4yOFxuXHRcdFx0XHQwLjc4LTAuMDRcblx0XHRcdFx0MC42My0wLjQyLTAuMjMtMC42LTAuNDktMS4yNC0wLjY2LTEuNjZcblx0XHRcdFx0MC41MlxuXHRcdFx0XHQwLjcyXG5cdFx0XHRcdDIuMVxuXHRcdFx0XHQxLjgyXG5cdFx0XHRcdDMuNFxuXHRcdFx0XHQyLjY1XG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjc3LTAuMlxuXHRcdFx0XHQwLjUzLTAuNTUtMC4zNy0wLjU0LTAuNzMtMS4xMS0xLjA0LTEuNjMtMC4yMi0wLjM2XG5cdFx0XHRcdDAuMjEtMC43NlxuXHRcdFx0XHQwLjU2LTAuNTJcblx0XHRcdFx0Mi4xOFxuXHRcdFx0XHQxLjUxXG5cdFx0XHRcdDUuNTVcblx0XHRcdFx0My4xN1xuXHRcdFx0XHQ3LjI4XG5cdFx0XHRcdDMuOThcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuMTlcblx0XHRcdFx0MC43NS0wLjMxXG5cdFx0XHRcdDAuNDUtMC42My0wLjM5LTAuNC0wLjg4LTAuNzgtMS4yNi0xLjA0LTAuMjgtMC4yLTAuMTgtMC42NFxuXHRcdFx0XHQwLjE2LTAuN1xuXHRcdFx0XHQyLjAxLTAuMzZcblx0XHRcdFx0NC45XG5cdFx0XHRcdDEuODFcblx0XHRcdFx0Ni4wNFxuXHRcdFx0XHQyLjc2XG5cdFx0XHRcdDAuMjhcblx0XHRcdFx0MC4yM1xuXHRcdFx0XHQwLjcxXG5cdFx0XHRcdDBcblx0XHRcdFx0MC42NS0wLjM2LTAuMDItMC4xNS0wLjA3LTAuMy0wLjEyLTAuNDMtMC4xMi0wLjMyXG5cdFx0XHRcdDAuMjItMC42M1xuXHRcdFx0XHQwLjUzLTAuNDlcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuNzUtMC4yNlxuXHRcdFx0XHQwLjQ5LTAuNTgtMC4zMi0wLjQtMC42OC0wLjc1LTAuOTgtMS4wMy0wLjI1LTAuMjQtMC4wOS0wLjY3XG5cdFx0XHRcdDAuMjYtMC42N1xuXHRcdFx0XHQzLjA2LTAuMDNcblx0XHRcdFx0NS43XG5cdFx0XHRcdDIuNThcblx0XHRcdFx0Ny4yN1xuXHRcdFx0XHQ0LjU4XG5cdFx0XHRcdDAuMjJcblx0XHRcdFx0MC4xNFxuXHRcdFx0XHQwLjQ1XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC42N1xuXHRcdFx0XHQwLjQtMC4yNy0wLjc4LTAuNDgtMS42LTAuNjItMi4yOC0wLjA4LTAuMzdcblx0XHRcdFx0MC4zNi0wLjYyXG5cdFx0XHRcdDAuNjQtMC4zN1xuXHRcdFx0XHQwLjVcblx0XHRcdFx0MC40NlxuXHRcdFx0XHQxLjE0XG5cdFx0XHRcdDAuOTVcblx0XHRcdFx0MS43N1xuXHRcdFx0XHQxLjRcblx0XHRcdFx0MC4wNy0wLjA2XG5cdFx0XHRcdDAuMTctMC4xXG5cdFx0XHRcdDAuMjgtMC4xXG5cdFx0XHRcdDIuNDJcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDYuNzRcblx0XHRcdFx0Mi4zOFxuXHRcdFx0XHQ5LjA2XG5cdFx0XHRcdDMuNjVcblx0XHRcdFx0MC40XG5cdFx0XHRcdDAuMjJcblx0XHRcdFx0MC43OS0wLjMxXG5cdFx0XHRcdDAuNDYtMC42Mi0xLjMtMS4yNC0zLjIyLTIuNzMtMi45LTIuNzFcblx0XHRcdFx0MC40OVxuXHRcdFx0XHQwLjAzXG5cdFx0XHRcdDEuODVcblx0XHRcdFx0MC44NVxuXHRcdFx0XHQyLjA0XG5cdFx0XHRcdDAuNzFcblx0XHRcdFx0MC4wOC0wLjA2XG5cdFx0XHRcdDAuMDctMC4yM1xuXHRcdFx0XHQwLjAzLTAuNDItMC4wNi0wLjI5XG5cdFx0XHRcdDAuMjItMC41NFxuXHRcdFx0XHQwLjUtMC40NVxuXHRcdFx0XHQxLjQ2XG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0My42OFxuXHRcdFx0XHQyLjFcblx0XHRcdFx0NS4yN1xuXHRcdFx0XHQzLjM5XG5cdFx0XHRcdDAuMzZcblx0XHRcdFx0MC4yOVxuXHRcdFx0XHQwLjg1LTAuMThcblx0XHRcdFx0MC41NS0wLjU0LTAuODktMS4xMS0xLjgtMi4yMi0xLjI5LTIuM1xuXHRcdFx0XHQwLjk1LTAuMTRcblx0XHRcdFx0NC4xNFxuXHRcdFx0XHQyLjg2XG5cdFx0XHRcdDQuMjdcblx0XHRcdFx0Mi4zcy0xLjctMi43NC0wLjYyLTIuMzdcblx0XHRcdFx0My41N1xuXHRcdFx0XHQ0LjA3XG5cdFx0XHRcdDQuMDRcblx0XHRcdFx0My42MmMwLjI0LTAuMjMtMC4wMi0xLjExLTAuMzQtMS45Mi0wLjE1LTAuMzdcblx0XHRcdFx0MC4zLTAuN1xuXHRcdFx0XHQwLjYxLTAuNDRcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQwLjY4XG5cdFx0XHRcdDEuNzdcblx0XHRcdFx0MS40OFxuXHRcdFx0XHQxLjgyXG5cdFx0XHRcdDEuNjJcblx0XHRcdFx0MC4wOVxuXHRcdFx0XHQwLjI1XG5cdFx0XHRcdDMuMzZcblx0XHRcdFx0MS41OFxuXHRcdFx0XHQzLjU2XG5cdFx0XHRcdDEuMTNcblx0XHRcdFx0MC4yLTAuNDYtMS4yNC0xLjQ3LTEuNDgtMS42NXMtMy4wNi0xLjQxLTAuODMtMS4yMWMyLjI0XG5cdFx0XHRcdDAuMlxuXHRcdFx0XHQ5LjY5XG5cdFx0XHRcdDUuMDhcblx0XHRcdFx0OS44M1xuXHRcdFx0XHQ0Ljlcblx0XHRcdFx0MC4xMy0wLjE4LTEuNTgtMi4yOC0xLjctMy4wNmwtMC4wMy0wLjE5Yy0wLjA2LTAuMzdcblx0XHRcdFx0MC4zOS0wLjZcblx0XHRcdFx0MC42Ni0wLjM0XG5cdFx0XHRcdDAuOThcblx0XHRcdFx0MC45NFxuXHRcdFx0XHQyLjVcblx0XHRcdFx0Mi4zN1xuXHRcdFx0XHQzLjU3XG5cdFx0XHRcdDMuMzdcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDAuMjhcblx0XHRcdFx0MC43OC0wLjA0XG5cdFx0XHRcdDAuNjMtMC40Mi0wLjIzLTAuNi0wLjQ5LTEuMjQtMC42Ni0xLjY2XG5cdFx0XHRcdDAuNTJcblx0XHRcdFx0MC43MlxuXHRcdFx0XHQyLjFcblx0XHRcdFx0MS44MlxuXHRcdFx0XHQzLjRcblx0XHRcdFx0Mi42NlxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC43Ny0wLjJcblx0XHRcdFx0MC41My0wLjU1LTAuMzctMC41NC0wLjczLTEuMTEtMS4wNC0xLjYzLTAuMjItMC4zNlxuXHRcdFx0XHQwLjIxLTAuNzZcblx0XHRcdFx0MC41Ni0wLjUyXG5cdFx0XHRcdDIuMThcblx0XHRcdFx0MS41MVxuXHRcdFx0XHQ1LjU1XG5cdFx0XHRcdDMuMTdcblx0XHRcdFx0Ny4yOFxuXHRcdFx0XHQzLjk4XG5cdFx0XHRcdDAuNFxuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuNzUtMC4zMVxuXHRcdFx0XHQwLjQ1LTAuNjMtMC4zOS0wLjQtMC44OC0wLjc4LTEuMjYtMS4wNC0wLjI4LTAuMi0wLjE5LTAuNjRcblx0XHRcdFx0MC4xNi0wLjdcblx0XHRcdFx0Mi4wMS0wLjM2XG5cdFx0XHRcdDQuOVxuXHRcdFx0XHQxLjgxXG5cdFx0XHRcdDYuMDRcblx0XHRcdFx0Mi43NlxuXHRcdFx0XHQwLjI4XG5cdFx0XHRcdDAuMjNcblx0XHRcdFx0MC43MVxuXHRcdFx0XHQwXG5cdFx0XHRcdDAuNjUtMC4zNi0wLjAyLTAuMTUtMC4wNy0wLjMtMC4xMi0wLjQzLTAuMTItMC4zMlxuXHRcdFx0XHQwLjIyLTAuNjNcblx0XHRcdFx0MC41My0wLjQ5XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuMzhcblx0XHRcdFx0MC4xOFxuXHRcdFx0XHQwLjc1LTAuMjZcblx0XHRcdFx0MC40OC0wLjU4LTAuMzItMC4zOS0wLjY4LTAuNzUtMC45OC0xLjAzLTAuMjUtMC4yNC0wLjA5LTAuNjdcblx0XHRcdFx0MC4yNi0wLjY3XG5cdFx0XHRcdDQuMTYtMC4wNFxuXHRcdFx0XHQ3LjU0XG5cdFx0XHRcdDQuNzlcblx0XHRcdFx0OC41MVxuXHRcdFx0XHQ2LjMzLTAuNTYtMS4wNC0wLjk2LTIuNTMtMS4yLTMuNjMtMC4wOC0wLjM3XG5cdFx0XHRcdDAuMzYtMC42MlxuXHRcdFx0XHQwLjY0LTAuMzdcblx0XHRcdFx0MFxuXHRcdFx0XHQwXG5cdFx0XHRcdDQuNzdcblx0XHRcdFx0Ni41NlxuXHRcdFx0XHQ3Ljdcblx0XHRcdFx0OS40NVxuXHRcdFx0XHQwLjc0XG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MS4yMlxuXHRcdFx0XHQwLjc4XG5cdFx0XHRcdDEuNDJcblx0XHRcdFx0MS4xN1xuXHRcdFx0XHQwLjc0XG5cdFx0XHRcdDEuNDQtMi4zNFxuXHRcdFx0XHQyLjg2LTEwLjAyXG5cdFx0XHRcdDQuMjctMjMuMjdcblx0XHRcdFx0NC4yNi0xOC4zNVxuXHRcdFx0XHQxMC40M1xuXHRcdFx0XHQwLjc0XG5cdFx0XHRcdDE2LjgtMC4wOC0wLjEtMC4wOS0wLjE2XG5cdFx0XHRcdDAtMC4xNVxuXHRcdFx0XHQwLjUzXG5cdFx0XHRcdDAuMDRcblx0XHRcdFx0MS42NVxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDIuNDlcblx0XHRcdFx0MC45NlxuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDAuMDlcblx0XHRcdFx0MC41OFxuXHRcdFx0XHQwLjE4XG5cdFx0XHRcdDAuODhcblx0XHRcdFx0MC4yN1xuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDBcblx0XHRcdFx0MC4wOS0wLjAxXG5cdFx0XHRcdDAuMTEtMC4wMlxuXHRcdFx0XHQwLjE0LTAuMDlcblx0XHRcdFx0MC4xMi0wLjRcblx0XHRcdFx0MC4wNS0wLjcyLTAuMTEtMC41XG5cdFx0XHRcdDAuMzctMC45MlxuXHRcdFx0XHQwLjg2LTAuNzZcblx0XHRcdFx0MS42OVxuXHRcdFx0XHQwLjUzXG5cdFx0XHRcdDMuOThcblx0XHRcdFx0MlxuXHRcdFx0XHQ2LjEzXG5cdFx0XHRcdDMuNThcblx0XHRcdFx0MS4xNFxuXHRcdFx0XHQwLjMxXG5cdFx0XHRcdDIuMzFcblx0XHRcdFx0MC42MlxuXHRcdFx0XHQzLjUxXG5cdFx0XHRcdDAuOTQtMS40My0xLjc3LTIuNzUtMy40Ny0xLjk0LTMuNTlcblx0XHRcdFx0MS42MS0wLjI0XG5cdFx0XHRcdDcuMDRcblx0XHRcdFx0NC44NlxuXHRcdFx0XHQ3LjI3XG5cdFx0XHRcdDMuOTJzLTIuODktNC42Ni0xLjA2LTQuMDNjMS44M1xuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDYuMDdcblx0XHRcdFx0Ni45MlxuXHRcdFx0XHQ2Ljg3XG5cdFx0XHRcdDYuMTZcblx0XHRcdFx0MC40MS0wLjM5LTAuMDQtMS44OS0wLjU4LTMuMjYtMC4yNS0wLjY0XG5cdFx0XHRcdDAuNTEtMS4xOVxuXHRcdFx0XHQxLjA0LTAuNzVcblx0XHRcdFx0MS40MVxuXHRcdFx0XHQxLjE2XG5cdFx0XHRcdDMuMDJcblx0XHRcdFx0Mi41MlxuXHRcdFx0XHQzLjFcblx0XHRcdFx0Mi43NlxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuNDNcblx0XHRcdFx0NS43MVxuXHRcdFx0XHQyLjY5XG5cdFx0XHRcdDYuMDVcblx0XHRcdFx0MS45MlxuXHRcdFx0XHQwLjM0LTAuNzgtMi4xMS0yLjUtMi41My0yLjgxLTAuNDEtMC4zLTUuMjEtMi40MS0xLjQxLTIuMDZcblx0XHRcdFx0My44XG5cdFx0XHRcdDAuMzRcblx0XHRcdFx0MTYuNDlcblx0XHRcdFx0OC42NFxuXHRcdFx0XHQxNi43MlxuXHRcdFx0XHQ4LjMzcy0yLjY4LTMuODgtMi44OC01LjIxbC0wLjA1LTAuMzNjLTAuMDktMC42M1xuXHRcdFx0XHQwLjY3LTEuMDJcblx0XHRcdFx0MS4xMi0wLjU3XG5cdFx0XHRcdDEuNjZcblx0XHRcdFx0MS42MVxuXHRcdFx0XHQ0LjI1XG5cdFx0XHRcdDQuMDNcblx0XHRcdFx0Ni4wN1xuXHRcdFx0XHQ1Ljc0XG5cdFx0XHRcdDAuNTJcblx0XHRcdFx0MC40OFxuXHRcdFx0XHQxLjMzLTAuMDdcblx0XHRcdFx0MS4wNy0wLjcyLTAuNC0xLjAzLTAuODMtMi4xMi0xLjEyLTIuODNcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQxLjIzXG5cdFx0XHRcdDMuNThcblx0XHRcdFx0My4xXG5cdFx0XHRcdDUuNzlcblx0XHRcdFx0NC41MlxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MS4zMS0wLjMzXG5cdFx0XHRcdDAuOTEtMC45My0wLjYzLTAuOTItMS4yMy0xLjg5LTEuNzctMi43OC0wLjM3LTAuNjFcblx0XHRcdFx0MC4zNi0xLjI5XG5cdFx0XHRcdDAuOTUtMC44OFxuXHRcdFx0XHQzLjcxXG5cdFx0XHRcdDIuNTdcblx0XHRcdFx0OS40NFxuXHRcdFx0XHQ1LjM5XG5cdFx0XHRcdDEyLjM4XG5cdFx0XHRcdDYuNzhcblx0XHRcdFx0MC42N1xuXHRcdFx0XHQwLjMyXG5cdFx0XHRcdDEuMjgtMC41M1xuXHRcdFx0XHQwLjc2LTEuMDctMC42Ny0wLjY5LTEuNS0xLjMyLTIuMTUtMS43Ny0wLjQ4LTAuMzQtMC4zMS0xLjA5XG5cdFx0XHRcdDAuMjctMS4xOVxuXHRcdFx0XHQzLjQyLTAuNjJcblx0XHRcdFx0OC4zM1xuXHRcdFx0XHQzLjA4XG5cdFx0XHRcdDEwLjI4XG5cdFx0XHRcdDQuN1xuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MS4yMVxuXHRcdFx0XHQwXG5cdFx0XHRcdDEuMTEtMC42MS0wLjA0LTAuMjUtMC4xMi0wLjUtMC4yLTAuNzQtMC4yLTAuNTVcblx0XHRcdFx0MC4zNy0xLjA4XG5cdFx0XHRcdDAuOS0wLjgzXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAzXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDEuMjctMC40NFxuXHRcdFx0XHQwLjgzLTAuOTktMC41NS0wLjY3LTEuMTYtMS4yOC0xLjY3LTEuNzYtMC40My0wLjQtMC4xNS0xLjE0XG5cdFx0XHRcdDAuNDQtMS4xNFxuXHRcdFx0XHQ3LjA2LTAuMDZcblx0XHRcdFx0MTIuNzlcblx0XHRcdFx0OC4xXG5cdFx0XHRcdDE0LjQ2XG5cdFx0XHRcdDEwLjc1LTAuOTQtMS43Ni0xLjYxLTQuMjktMi4wMi02LjE2LTAuMTQtMC42M1xuXHRcdFx0XHQwLjYyLTEuMDZcblx0XHRcdFx0MS4xLTAuNjNcblx0XHRcdFx0Mi4zNVxuXHRcdFx0XHQyLjE1XG5cdFx0XHRcdDYuNDJcblx0XHRcdFx0NC43MlxuXHRcdFx0XHQ3LjA4XG5cdFx0XHRcdDUuMTNcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuMTJcblx0XHRcdFx0MC4wNlxuXHRcdFx0XHQwLjE5XG5cdFx0XHRcdDAuMDhcblx0XHRcdFx0MC42NFxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDEuNFxuXHRcdFx0XHQwLjM4XG5cdFx0XHRcdDIuMTZcblx0XHRcdFx0MC42Ny0xLjE1LTEuNTgtMi4yMy0zLjE0LTIuOTktNC4zNy0xLjE2LTEuOS0xLjg3LTMuNTktMi4zLTQuODgtMC4yMS0wLjYyXG5cdFx0XHRcdDAuNTQtMS4xNFxuXHRcdFx0XHQxLjA1LTAuNzJcblx0XHRcdFx0My42NFxuXHRcdFx0XHQyLjk2XG5cdFx0XHRcdDExLjkzXG5cdFx0XHRcdDcuNzJcblx0XHRcdFx0MTMuNDdcblx0XHRcdFx0Ny43OFxuXHRcdFx0XHQxLjkzXG5cdFx0XHRcdDAuMDdcblx0XHRcdFx0MS4xLTAuNjItMS43OC0yLjc0LTAuOTQtMC42OS0xLjQ4LTEuMjItMS43OS0xLjYxLTAuMzUtMC40NVxuXHRcdFx0XHQwLTEuMTFcblx0XHRcdFx0MC41Ny0xLjA2XG5cdFx0XHRcdDQuMTFcblx0XHRcdFx0MC4zNFxuXHRcdFx0XHQxMS40NlxuXHRcdFx0XHQ0LjA2XG5cdFx0XHRcdDE1LjRcblx0XHRcdFx0Ni4yXG5cdFx0XHRcdDAuNjhcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQxLjM0LTAuNTJcblx0XHRcdFx0MC43OC0xLjA2LTIuMjEtMi4xMS01LjQ4LTQuNjQtNC45NC00LjZcblx0XHRcdFx0MC44M1xuXHRcdFx0XHQwLjA2XG5cdFx0XHRcdDMuMTRcblx0XHRcdFx0MS40NFxuXHRcdFx0XHQzLjQ4XG5cdFx0XHRcdDEuMjFcblx0XHRcdFx0MC4xNC0wLjA5XG5cdFx0XHRcdDAuMTItMC40XG5cdFx0XHRcdDAuMDUtMC43Mi0wLjExLTAuNVxuXHRcdFx0XHQwLjM3LTAuOTJcblx0XHRcdFx0MC44Ni0wLjc2XG5cdFx0XHRcdDIuNDhcblx0XHRcdFx0MC43OFxuXHRcdFx0XHQ2LjI2XG5cdFx0XHRcdDMuNThcblx0XHRcdFx0OC45NlxuXHRcdFx0XHQ1Ljc2XG5cdFx0XHRcdDAuNjJcblx0XHRcdFx0MC41XG5cdFx0XHRcdDEuNDQtMC4zMVxuXHRcdFx0XHQwLjk0LTAuOTMtMS41Mi0xLjg4LTMuMDYtMy43OC0yLjE5LTMuOTFcblx0XHRcdFx0MS42MS0wLjI0XG5cdFx0XHRcdDcuMDRcblx0XHRcdFx0NC44NlxuXHRcdFx0XHQ3LjI3XG5cdFx0XHRcdDMuOTJcblx0XHRcdFx0MC4yMi0wLjk0LTIuODktNC42Ni0xLjA2LTQuMDNcblx0XHRcdFx0MS44M1xuXHRcdFx0XHQwLjY0XG5cdFx0XHRcdDYuMDdcblx0XHRcdFx0Ni45MlxuXHRcdFx0XHQ2Ljg3XG5cdFx0XHRcdDYuMTZcblx0XHRcdFx0MC40MS0wLjM5LTAuMDQtMS44OS0wLjU4LTMuMjYtMC4yNS0wLjY0XG5cdFx0XHRcdDAuNTEtMS4xOVxuXHRcdFx0XHQxLjA0LTAuNzVcblx0XHRcdFx0MS40MVxuXHRcdFx0XHQxLjE2XG5cdFx0XHRcdDMuMDJcblx0XHRcdFx0Mi41MlxuXHRcdFx0XHQzLjFcblx0XHRcdFx0Mi43NlxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuNDNcblx0XHRcdFx0NS43MVxuXHRcdFx0XHQyLjY5XG5cdFx0XHRcdDYuMDVcblx0XHRcdFx0MS45MlxuXHRcdFx0XHQwLjM0LTAuNzgtMi4xMS0yLjUtMi41My0yLjgxLTAuNDEtMC4zLTUuMjEtMi40MS0xLjQxLTIuMDZcblx0XHRcdFx0My44XG5cdFx0XHRcdDAuMzRcblx0XHRcdFx0MTYuNDlcblx0XHRcdFx0OC42NFxuXHRcdFx0XHQxNi43MlxuXHRcdFx0XHQ4LjMzcy0yLjY4LTMuODgtMi44OC01LjIxbC0wLjA1LTAuMzNjLTAuMDktMC42M1xuXHRcdFx0XHQwLjY3LTEuMDJcblx0XHRcdFx0MS4xMi0wLjU3XG5cdFx0XHRcdDEuNjZcblx0XHRcdFx0MS42MVxuXHRcdFx0XHQ0LjI1XG5cdFx0XHRcdDQuMDNcblx0XHRcdFx0Ni4wN1xuXHRcdFx0XHQ1Ljc0XG5cdFx0XHRcdDAuNTJcblx0XHRcdFx0MC40OFxuXHRcdFx0XHQxLjMzLTAuMDdcblx0XHRcdFx0MS4wNy0wLjcyLTAuNC0xLjAzLTAuODMtMi4xMi0xLjEyLTIuODNcblx0XHRcdFx0MC44OVxuXHRcdFx0XHQxLjIzXG5cdFx0XHRcdDMuNThcblx0XHRcdFx0My4xXG5cdFx0XHRcdDUuNzlcblx0XHRcdFx0NC41MlxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MS4zMS0wLjMzXG5cdFx0XHRcdDAuOTEtMC45My0wLjYzLTAuOTItMS4yMy0xLjg5LTEuNzctMi43OC0wLjM3LTAuNjFcblx0XHRcdFx0MC4zNi0xLjI5XG5cdFx0XHRcdDAuOTUtMC44OFxuXHRcdFx0XHQzLjcxXG5cdFx0XHRcdDIuNTdcblx0XHRcdFx0OS40NFxuXHRcdFx0XHQ1LjM5XG5cdFx0XHRcdDEyLjM4XG5cdFx0XHRcdDYuNzhcblx0XHRcdFx0MC42N1xuXHRcdFx0XHQwLjMyXG5cdFx0XHRcdDEuMjgtMC41M1xuXHRcdFx0XHQwLjc2LTEuMDctMC42Ny0wLjY4LTEuNS0xLjMyLTIuMTUtMS43Ny0wLjQ4LTAuMzQtMC4zMS0xLjA5XG5cdFx0XHRcdDAuMjctMS4xOVxuXHRcdFx0XHQzLjQyLTAuNjJcblx0XHRcdFx0OC4zM1xuXHRcdFx0XHQzLjA4XG5cdFx0XHRcdDEwLjI4XG5cdFx0XHRcdDQuN1xuXHRcdFx0XHQwLjQ4XG5cdFx0XHRcdDAuMzlcblx0XHRcdFx0MS4yMVxuXHRcdFx0XHQwXG5cdFx0XHRcdDEuMTEtMC42MS0wLjA0LTAuMjUtMC4xMi0wLjUtMC4yLTAuNzQtMC4yLTAuNTVcblx0XHRcdFx0MC4zNy0xLjA4XG5cdFx0XHRcdDAuOS0wLjgzXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAzXG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wNFxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuNjRcblx0XHRcdFx0MC4zXG5cdFx0XHRcdDEuMjctMC40NFxuXHRcdFx0XHQwLjgzLTAuOTktMC41NS0wLjY3LTEuMTYtMS4yOC0xLjY3LTEuNzYtMC40My0wLjQtMC4xNS0xLjE0XG5cdFx0XHRcdDAuNDQtMS4xNFxuXHRcdFx0XHQ2LjQ1LTAuMDVcblx0XHRcdFx0MTEuNzlcblx0XHRcdFx0Ni43NVxuXHRcdFx0XHQxMy45M1xuXHRcdFx0XHQ5Ljk0XG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MFxuXHRcdFx0XHQwLjFcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjE0XG5cdFx0XHRcdDAuMDEtMC43NC0xLjY3LTEuMjktMy43Ny0xLjY0LTUuMzctMC4xNC0wLjYzXG5cdFx0XHRcdDAuNjItMS4wNlxuXHRcdFx0XHQxLjEtMC42M1xuXHRcdFx0XHQyLjM1XG5cdFx0XHRcdDIuMTVcblx0XHRcdFx0Ni40MlxuXHRcdFx0XHQ0LjcyXG5cdFx0XHRcdDcuMDhcblx0XHRcdFx0NS4xM1xuXHRcdFx0XHQwLjA1XG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC4xXG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC4xNlxuXHRcdFx0XHQwLjA3LTguMTYtOS4xNS0xMy44MS0yMC41Ny0xNS44Ni0zMi42NlxuXHRcdFx0XHQxMS43NVxuXHRcdFx0XHQ4LjkyXG5cdFx0XHRcdDIxLjlcblx0XHRcdFx0MTkuOTRcblx0XHRcdFx0MjkuODJcblx0XHRcdFx0MzIuMzgtMi41Ny0xMC44MS0zLjU0LTIyLjAxLTIuODctMzMuMTFcblx0XHRcdFx0MC4yOS00LjczXG5cdFx0XHRcdDEuMDctOS44NlxuXHRcdFx0XHQ0LjUtMTMuMTJcblx0XHRcdFx0MTAuNTlcblx0XHRcdFx0MTMuNjRcblx0XHRcdFx0MTAuODFcblx0XHRcdFx0MzIuMzlcblx0XHRcdFx0MTAuNTdcblx0XHRcdFx0NDkuNjZcblx0XHRcdFx0OC4wOS0yLjlcblx0XHRcdFx0MTYuNDQtNS4wN1xuXHRcdFx0XHQyNC45Mi02LjQ3LTIuNlxuXHRcdFx0XHQzLjk5LTUuNzJcblx0XHRcdFx0Ny42My05LjI2XG5cdFx0XHRcdDEwLjgyXG5cdFx0XHRcdDU5Ljdcblx0XHRcdFx0MTEuMjFcblx0XHRcdFx0OTUuNzdcblx0XHRcdFx0MjkuODlcblx0XHRcdFx0NzQuNzJcblx0XHRcdFx0MzYuNDYtNy42MVxuXHRcdFx0XHQyLjM3LTguNjNcblx0XHRcdFx0Ni44OS0yLjg1XG5cdFx0XHRcdDEyLjMxLTAuNDgtMS4zLTEuNDgtMy41My0xLjQzLTQuNDRsMC4wMi0wLjMyYzAuMDQtMC42XG5cdFx0XHRcdDAuODItMC44MVxuXHRcdFx0XHQxLjE1LTAuMzFcblx0XHRcdFx0MS4yM1xuXHRcdFx0XHQxLjgyXG5cdFx0XHRcdDMuMTZcblx0XHRcdFx0NC41OFxuXHRcdFx0XHQ0LjUyXG5cdFx0XHRcdDYuNTJcblx0XHRcdFx0MC4zOFxuXHRcdFx0XHQwLjU1XG5cdFx0XHRcdDEuMjVcblx0XHRcdFx0MC4yXG5cdFx0XHRcdDEuMTQtMC40Ni0wLjE3LTEuMDMtMC4zNS0yLjEzLTAuNDgtMi44NS0wLjA4LTAuMTgtMC4xMy0wLjM1LTAuMTUtMC40OS0wLjA2LTAuNjFcblx0XHRcdFx0MC4wMS0wLjI3XG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC40OVxuXHRcdFx0XHQwLjU4XG5cdFx0XHRcdDEuMzJcblx0XHRcdFx0Mi43MlxuXHRcdFx0XHQzLjU4XG5cdFx0XHRcdDQuNDlcblx0XHRcdFx0NS4zM1xuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDAuNDhcblx0XHRcdFx0MS4yOS0wLjA1XG5cdFx0XHRcdDEuMDMtMC42OS0wLjQtMC45OC0wLjc4LTItMS4xLTIuOTMtMC4yMi0wLjY0XG5cdFx0XHRcdDAuNTktMS4xM1xuXHRcdFx0XHQxLjA2LTAuNjNcblx0XHRcdFx0Mi45NVxuXHRcdFx0XHQzLjEyXG5cdFx0XHRcdDcuNzJcblx0XHRcdFx0Ni44NlxuXHRcdFx0XHQxMC4xOFxuXHRcdFx0XHQ4LjczXG5cdFx0XHRcdDAuNTZcblx0XHRcdFx0MC40M1xuXHRcdFx0XHQxLjI5LTAuMjVcblx0XHRcdFx0MC45MS0wLjg0LTAuNDgtMC43Ny0xLjE0LTEuNTItMS42NS0yLjA3LTAuMzgtMC40MS0wLjA4LTEuMDdcblx0XHRcdFx0MC40OC0xLjA2XG5cdFx0XHRcdDMuM1xuXHRcdFx0XHQwLjA5XG5cdFx0XHRcdDcuMTRcblx0XHRcdFx0NC41XG5cdFx0XHRcdDguNjNcblx0XHRcdFx0Ni4zOFxuXHRcdFx0XHQwLjM2XG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0MS4xM1xuXHRcdFx0XHQwLjI0XG5cdFx0XHRcdDEuMTUtMC4zNVxuXHRcdFx0XHQwLjAxLTAuMjQtMC4wMS0wLjQ5LTAuMDQtMC43Mi0wLjA4LTAuNTVcblx0XHRcdFx0MC41NS0wLjkzXG5cdFx0XHRcdDEtMC42XG5cdFx0XHRcdDAuMDFcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC4wM1xuXHRcdFx0XHQwLjAyXG5cdFx0XHRcdDAuNTNcblx0XHRcdFx0MC40MVxuXHRcdFx0XHQxLjI3LTAuMTZcblx0XHRcdFx0MC45Ni0wLjc2LTAuMzgtMC43My0wLjgzLTEuNDItMS4yMS0xLjk2LTAuMzItMC40NlxuXHRcdFx0XHQwLjA4LTEuMDlcblx0XHRcdFx0MC42My0wLjk4XG5cdFx0XHRcdDYuNTdcblx0XHRcdFx0MS4zM1xuXHRcdFx0XHQxMC4zXG5cdFx0XHRcdDEwLjA0XG5cdFx0XHRcdDExLjMzXG5cdFx0XHRcdDEyLjgyLTAuNTMtMS44Mi0wLjY2LTQuMzEtMC42Ny02LjEyXG5cdFx0XHRcdDAtMC42MVxuXHRcdFx0XHQwLjc4LTAuODdcblx0XHRcdFx0MS4xNC0wLjM3XG5cdFx0XHRcdDEuNzdcblx0XHRcdFx0Mi40NlxuXHRcdFx0XHQ1LjA1XG5cdFx0XHRcdDUuNjRcblx0XHRcdFx0NS41OFxuXHRcdFx0XHQ2LjE1XG5cdFx0XHRcdDAuMDVcblx0XHRcdFx0MC4wNVxuXHRcdFx0XHQwLjFcblx0XHRcdFx0MC4wOFxuXHRcdFx0XHQwLjE2XG5cdFx0XHRcdDAuMTFcblx0XHRcdFx0MS41N1xuXHRcdFx0XHQwLjY5XG5cdFx0XHRcdDMuNzRcblx0XHRcdFx0Mi4zMVxuXHRcdFx0XHQ0LjkyXG5cdFx0XHRcdDMuMjMtMC45MS0xLjI3LTEuNzQtMi40OS0yLjM1LTMuNDgtMS4xLTEuOC0xLjc4LTMuNDEtMi4xOS00LjY0LTAuMi0wLjU5XG5cdFx0XHRcdDAuNTEtMS4wOFxuXHRcdFx0XHQxLTAuNjhcblx0XHRcdFx0My40NlxuXHRcdFx0XHQyLjgxXG5cdFx0XHRcdDExLjMzXG5cdFx0XHRcdDcuMzNcblx0XHRcdFx0MTIuOFxuXHRcdFx0XHQ3LjM5XG5cdFx0XHRcdDEuODRcblx0XHRcdFx0MC4wN1xuXHRcdFx0XHQxLjA0LTAuNTktMS42OS0yLjYtMC44OS0wLjY2LTEuNDEtMS4xNi0xLjctMS41My0wLjMzLTAuNDNcblx0XHRcdFx0MC0xLjA2XG5cdFx0XHRcdDAuNTQtMS4wMVxuXHRcdFx0XHQzLjlcblx0XHRcdFx0MC4zMlxuXHRcdFx0XHQxMC44OFxuXHRcdFx0XHQzLjg1XG5cdFx0XHRcdDE0LjYzXG5cdFx0XHRcdDUuODlcblx0XHRcdFx0MC42NVxuXHRcdFx0XHQwLjM1XG5cdFx0XHRcdDEuMjctMC41XG5cdFx0XHRcdDAuNzQtMS4wMS0yLjEtMi01LjIxLTQuNDEtNC42OS00LjM3XG5cdFx0XHRcdDAuNzlcblx0XHRcdFx0MC4wNVxuXHRcdFx0XHQyLjk5XG5cdFx0XHRcdDEuMzdcblx0XHRcdFx0My4zXG5cdFx0XHRcdDEuMTVcblx0XHRcdFx0MC4xMy0wLjA5XG5cdFx0XHRcdDAuMTEtMC4zOFxuXHRcdFx0XHQwLjA1LTAuNjgtMC4xLTAuNDdcblx0XHRcdFx0MC4zNS0wLjg3XG5cdFx0XHRcdDAuODItMC43M1xuXHRcdFx0XHQyLjM1XG5cdFx0XHRcdDAuNzRcblx0XHRcdFx0NS45NFxuXHRcdFx0XHQzLjRcblx0XHRcdFx0OC41MVxuXHRcdFx0XHQ1LjQ3XG5cdFx0XHRcdDAuNTlcblx0XHRcdFx0MC40OFxuXHRcdFx0XHQxLjM3LTAuMjlcblx0XHRcdFx0MC44OS0wLjg4LTEuNDQtMS43OS0yLjkxLTMuNTktMi4wOC0zLjcyXG5cdFx0XHRcdDEuNTMtMC4yM1xuXHRcdFx0XHQ2LjY5XG5cdFx0XHRcdDQuNjJcblx0XHRcdFx0Ni45XG5cdFx0XHRcdDMuNzJzLTIuNzUtNC40My0xLjAxLTMuODNcblx0XHRcdFx0NS43N1xuXHRcdFx0XHQ2LjU3XG5cdFx0XHRcdDYuNTNcblx0XHRcdFx0NS44NWMwLjM5LTAuMzctMC4wNC0xLjgtMC41NS0zLjEtMC4yNC0wLjZcblx0XHRcdFx0MC40OS0xLjEzXG5cdFx0XHRcdDAuOTktMC43MlxuXHRcdFx0XHQxLjM0XG5cdFx0XHRcdDEuMVxuXHRcdFx0XHQyLjg3XG5cdFx0XHRcdDIuMzlcblx0XHRcdFx0Mi45NVxuXHRcdFx0XHQyLjYyXG5cdFx0XHRcdDAuMTVcblx0XHRcdFx0MC40MVxuXHRcdFx0XHQ1LjQzXG5cdFx0XHRcdDIuNTZcblx0XHRcdFx0NS43NVxuXHRcdFx0XHQxLjgycy0yLjAxLTIuMzgtMi40LTIuNjctNC45NS0yLjI5LTEuMzQtMS45NmMzLjYxXG5cdFx0XHRcdDAuMzJcblx0XHRcdFx0MTUuNjZcblx0XHRcdFx0OC4yXG5cdFx0XHRcdDE1Ljg4XG5cdFx0XHRcdDcuOTFzLTIuNTUtMy42OC0yLjc0LTQuOTVsLTAuMDUtMC4zMWMtMC4wOS0wLjZcblx0XHRcdFx0MC42My0wLjk2XG5cdFx0XHRcdDEuMDctMC41NVxuXHRcdFx0XHQxLjU4XG5cdFx0XHRcdDEuNTNcblx0XHRcdFx0NC4wM1xuXHRcdFx0XHQzLjgzXG5cdFx0XHRcdDUuNzZcblx0XHRcdFx0NS40NVxuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDAuNDZcblx0XHRcdFx0MS4yNi0wLjA2XG5cdFx0XHRcdDEuMDItMC42OS0wLjM4LTAuOTctMC43OS0yLjAxLTEuMDYtMi42OS0wLjEyLTAuMTYtMC4yLTAuMzItMC4yNS0wLjQ1LTAuMTktMC41OC0wLjA0LTAuMjZcblx0XHRcdFx0MC4yNVxuXHRcdFx0XHQwLjQ1XG5cdFx0XHRcdDAuODRcblx0XHRcdFx0MS4xN1xuXHRcdFx0XHQzLjRcblx0XHRcdFx0Mi45NVxuXHRcdFx0XHQ1LjVcblx0XHRcdFx0NC4yOVxuXHRcdFx0XHQwLjU4XG5cdFx0XHRcdDAuMzdcblx0XHRcdFx0MS4yNS0wLjMyXG5cdFx0XHRcdDAuODYtMC44OC0wLjYtMC44Ny0xLjE3LTEuOC0xLjY4LTIuNjQtMC4zNS0wLjU4XG5cdFx0XHRcdDAuMzQtMS4yMlxuXHRcdFx0XHQwLjktMC44NFxuXHRcdFx0XHQzLjUzXG5cdFx0XHRcdDIuNDRcblx0XHRcdFx0OC45N1xuXHRcdFx0XHQ1LjEyXG5cdFx0XHRcdDExLjc2XG5cdFx0XHRcdDYuNDRcblx0XHRcdFx0MC42NFxuXHRcdFx0XHQwLjNcblx0XHRcdFx0MS4yMS0wLjUxXG5cdFx0XHRcdDAuNzItMS4wMS0wLjYzLTAuNjUtMS40My0xLjI1LTIuMDQtMS42OC0wLjQ2LTAuMzItMC4zLTEuMDNcblx0XHRcdFx0MC4yNS0xLjEzXG5cdFx0XHRcdDMuMjUtMC41OVxuXHRcdFx0XHQ3LjkxXG5cdFx0XHRcdDIuOTNcblx0XHRcdFx0OS43NlxuXHRcdFx0XHQ0LjQ2XG5cdFx0XHRcdDAuNDVcblx0XHRcdFx0MC4zN1xuXHRcdFx0XHQxLjE1XG5cdFx0XHRcdDBcblx0XHRcdFx0MS4wNi0wLjU4LTAuMDQtMC4yNC0wLjExLTAuNDgtMC4xOS0wLjctMC4xOS0wLjUyXG5cdFx0XHRcdDAuMzUtMS4wM1xuXHRcdFx0XHQwLjg2LTAuNzlcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjAxXG5cdFx0XHRcdDAuMDNcblx0XHRcdFx0MC4wMVxuXHRcdFx0XHQwLjA0XG5cdFx0XHRcdDAuMDJcblx0XHRcdFx0MC42MVxuXHRcdFx0XHQwLjI5XG5cdFx0XHRcdDEuMjEtMC40MlxuXHRcdFx0XHQwLjc4LTAuOTQtMC41Mi0wLjY0LTEuMS0xLjIyLTEuNTktMS42Ny0wLjQxLTAuMzgtMC4xNC0xLjA4XG5cdFx0XHRcdDAuNDItMS4wOVxuXHRcdFx0XHQ2LjctMC4wNlxuXHRcdFx0XHQxMi4xNVxuXHRcdFx0XHQ3Ljdcblx0XHRcdFx0MTMuNzRcblx0XHRcdFx0MTAuMjEtMC43NS0xLjQtMS4zMi0zLjMyLTEuNzEtNC45NS0wLjMxLTAuNDItMC42LTAuODMtMC44NS0xLjItMS4xOS0xLjc0LTEuOTQtMy4zMi0yLjQxLTQuNTMtMC4yMy0wLjU4XG5cdFx0XHRcdDAuNDYtMS4xXG5cdFx0XHRcdDAuOTYtMC43M1xuXHRcdFx0XHQzLjZcblx0XHRcdFx0Mi42NFxuXHRcdFx0XHQxMS42OFxuXHRcdFx0XHQ2Ljc3XG5cdFx0XHRcdDEzLjE1XG5cdFx0XHRcdDYuNzZcblx0XHRcdFx0MS44NC0wLjAyXG5cdFx0XHRcdDEuMDEtMC42NC0xLjgyLTIuNTEtMC45Mi0wLjYxLTEuNDYtMS4wOS0xLjc3LTEuNDUtMC4zNS0wLjQxLTAuMDUtMS4wNVxuXHRcdFx0XHQwLjQ5LTEuMDRcblx0XHRcdFx0My45MVxuXHRcdFx0XHQwLjEzXG5cdFx0XHRcdDExLjA2XG5cdFx0XHRcdDMuMzJcblx0XHRcdFx0MTQuOVxuXHRcdFx0XHQ1LjE3XG5cdFx0XHRcdDAuNjZcblx0XHRcdFx0MC4zMlxuXHRcdFx0XHQxLjI1LTAuNTZcblx0XHRcdFx0MC42OS0xLjA0LTIuMi0xLjktNS40Mi00LjE1LTQuOS00LjE0XG5cdFx0XHRcdDAuNzlcblx0XHRcdFx0MC4wMlxuXHRcdFx0XHQzLjA1XG5cdFx0XHRcdDEuMjJcblx0XHRcdFx0My4zNVxuXHRcdFx0XHQwLjk5XG5cdFx0XHRcdDAuMTItMC4xXG5cdFx0XHRcdDAuMDktMC4zOFxuXHRcdFx0XHQwLjAxLTAuNjgtMC4xMi0wLjQ3XG5cdFx0XHRcdDAuMzEtMC44OVxuXHRcdFx0XHQwLjc4LTAuNzZcblx0XHRcdFx0Mi4zOVxuXHRcdFx0XHQwLjYzXG5cdFx0XHRcdDYuMVxuXHRcdFx0XHQzLjExXG5cdFx0XHRcdDguNzdcblx0XHRcdFx0NS4wNVxuXHRcdFx0XHQwLjYxXG5cdFx0XHRcdDAuNDVcblx0XHRcdFx0MS4zNS0wLjM2XG5cdFx0XHRcdDAuODUtMC45Mi0xLjUzLTEuNzItMy4wOC0zLjQ1LTIuMjYtMy42MVxuXHRcdFx0XHQxLjUyLTAuM1xuXHRcdFx0XHQ2LjkxXG5cdFx0XHRcdDQuMjlcblx0XHRcdFx0Ny4wOFxuXHRcdFx0XHQzLjM4cy0yLjk2LTQuMjktMS4xOS0zLjc3XG5cdFx0XHRcdDYuMDhcblx0XHRcdFx0Ni4yOFxuXHRcdFx0XHQ2LjgxXG5cdFx0XHRcdDUuNTNjMC4zNy0wLjM5LTAuMTMtMS43OS0wLjctMy4wNy0wLjI3LTAuNTlcblx0XHRcdFx0MC40My0xLjE1XG5cdFx0XHRcdDAuOTUtMC43NlxuXHRcdFx0XHQxLjM5XG5cdFx0XHRcdDEuMDRcblx0XHRcdFx0Mi45OFxuXHRcdFx0XHQyLjI1XG5cdFx0XHRcdDMuMDdcblx0XHRcdFx0Mi40N1xuXHRcdFx0XHQwLjE3XG5cdFx0XHRcdDAuNFxuXHRcdFx0XHQ1LjU0XG5cdFx0XHRcdDIuMjlcblx0XHRcdFx0NS44M1xuXHRcdFx0XHQxLjU0cy0yLjEyLTIuMjgtMi41My0yLjU1Yy0wLjQtMC4yNy01LjA2LTIuMDQtMS40My0xLjg5czE2LjA0XG5cdFx0XHRcdDcuNDNcblx0XHRcdFx0MTYuMjVcblx0XHRcdFx0Ny4xM2MwLjItMC4zLTIuNzMtMy41NS0yLjk4LTQuODFsLTAuMDYtMC4zMWMtMC4xMi0wLjU5XG5cdFx0XHRcdDAuNTgtMC45OVxuXHRcdFx0XHQxLjA0LTAuNlxuXHRcdFx0XHQxLjY1XG5cdFx0XHRcdDEuNDVcblx0XHRcdFx0NC4yMlxuXHRcdFx0XHQzLjYzXG5cdFx0XHRcdDYuMDJcblx0XHRcdFx0NS4xNlxuXHRcdFx0XHQwLjUxXG5cdFx0XHRcdDAuNDNcblx0XHRcdFx0MS4yNi0wLjEyXG5cdFx0XHRcdDAuOTktMC43NC0wLjQzLTAuOTYtMC44OC0xLjk3LTEuMTktMi42My0wLjEzLTAuMTYtMC4yMi0wLjMxLTAuMjctMC40NC0wLjIyLTAuNTctMC4wNi0wLjI2XG5cdFx0XHRcdDAuMjdcblx0XHRcdFx0MC40NFxuXHRcdFx0XHQwLjlcblx0XHRcdFx0MS4xM1xuXHRcdFx0XHQzLjU0XG5cdFx0XHRcdDIuNzhcblx0XHRcdFx0NS43XG5cdFx0XHRcdDQuMDJcblx0XHRcdFx0MC42XG5cdFx0XHRcdDAuMzRcblx0XHRcdFx0MS4yMy0wLjM4XG5cdFx0XHRcdDAuODItMC45Mi0wLjY0LTAuODQtMS4yNi0xLjc0LTEuOC0yLjU1LTAuMzgtMC41NlxuXHRcdFx0XHQwLjI4LTEuMjRcblx0XHRcdFx0MC44Ni0wLjg4XG5cdFx0XHRcdDIuMjhcblx0XHRcdFx0MS40MlxuXHRcdFx0XHQ1LjMyXG5cdFx0XHRcdDIuOVxuXHRcdFx0XHQ3Ljk3XG5cdFx0XHRcdDQuMDlsMC40NS0zMzAuMThoMC4wMmMwLTAuMDEtMC4wMS0wLjAxLTAuMDJcblx0XHRcdFx0MHptLTY1NC41MVxuXHRcdFx0XHQ4Mi4zNGMtMC4yMVxuXHRcdFx0XHQwLjAzLTAuNDNcblx0XHRcdFx0MC4wNi0wLjY0XG5cdFx0XHRcdDAuMDhsLTAuMzktMC45M2MwLjM0XG5cdFx0XHRcdDAuMjlcblx0XHRcdFx0MC42OVxuXHRcdFx0XHQwLjU3XG5cdFx0XHRcdDEuMDNcblx0XHRcdFx0MC44NXptLTIxMy44M1xuXHRcdFx0XHQyNS45NmMtMC4wMVxuXHRcdFx0XHQwLjA0LTAuMDRcblx0XHRcdFx0MC4wOC0wLjFcblx0XHRcdFx0MC4xMWwtMC43Ny0wLjg4YzAuNDVcblx0XHRcdFx0MC4yMlxuXHRcdFx0XHQwLjkxXG5cdFx0XHRcdDAuNTJcblx0XHRcdFx0MC44N1xuXHRcdFx0XHQwLjc3em00ODAuMDFcblx0XHRcdFx0MTI5LjIzYy0wLjE0LTAuNDQtMC4wMy0wLjJcblx0XHRcdFx0MC4xOVxuXHRcdFx0XHQwLjM0LTAuMDktMC4xMi0wLjE2LTAuMjQtMC4xOS0wLjM0em0yMDguMzQtMjE2LjAyYy0wLjZcblx0XHRcdFx0MC4wNy0xLjE5XG5cdFx0XHRcdDAuMTUtMS43OVxuXHRcdFx0XHQwLjIyLTAuNDctMC4xMS0wLjk2LTAuMjItMS40Ny0wLjMzXG5cdFx0XHRcdDAuMi0wLjQ0XG5cdFx0XHRcdDAuNDEtMC44N1xuXHRcdFx0XHQwLjYzLTEuM1xuXHRcdFx0XHQwLjQ5XG5cdFx0XHRcdDAuM1xuXHRcdFx0XHQxLjY5XG5cdFx0XHRcdDAuODdcblx0XHRcdFx0Mi42M1xuXHRcdFx0XHQxLjQxelxuXHRcdFx0YH1cbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEzMzcuMiA0ODIuNzhjMC4wNCAwLjA2IDAuMSAwLjEzIDAuMTggMC4yLTAuMjMtMC4zMy0wLjM1LTAuNDctMC4xOC0wLjJ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTMwMC4yIDgyMy44OGwwLjAyIDAuMTNjNS42NCAwLjI5IDExLjQxIDAuNTQgMTcuMzIgMC43NGwtMTcuMzQtMC44N3onXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J00tMC4zNCw2MDAuNmMtMC4wMy0wLjAxLTAuMDctMC4wMS0wLjEtMC4wMnYyNS40bDAuMSwyNTcuMTJWNjAwLjZ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNjYzLjggNjYyLjUxdjAuMDJjMC41OSAwLjA1IDEuMTkgMC4xMSAxLjc4IDAuMTZsLTEuNzgtMC4xOHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIHBvaW50cz0nMTM2NS42IDg4MS45NyAxMzY1LjYgODI3LjE4IDEzNjUuNSA4MjcuMTgnXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17YHVybCgjJHtifSlgfVxuICAgICAgICAgIGQ9J204Ni4xNCAzMzUuODlzNTcuOTYgNDEuMjMgNzAuNjIgMTAwLjYxYzMuMzYgMTUuNzcgNS43OSAyOS43MiA3LjUzIDQxLjcxbDEuNzktMC42OSA0MC41My0yMC43NGMwLjQ5LTAuMjUgMS4wMS0wLjQgMS41NC0wLjQ2bDAuMzYtMC4wM2gwLjI0YzAuMSAwIDAuMjEgMC4wMSAwLjMxIDAuMDJoMC4wM2MxLjE0IDAuMTEgMi4yMyAwLjY2IDMuMDEgMS42bDAuMzIgMC4zOWMwLjE3IDAuMiAwLjI3IDAuMzMgMC4yNyAwLjMzIDMuNDggMi45MSA3Ljg0IDIuOTEgOC4yMyAyLjkgMC44OS0wLjE4IDEuNzctMC41IDIuNi0wLjk4bDIuNTMtMS40N2MtMC44Ny0xLjItMS43NS0yLjQtMi42NS0zLjYtMTkuMjEtMjUuNTQtMjUuOTUtNTguNjUtNDMuNTktODUuMy0yMS4zMi0zMi4yMS01My45OC01Ny45Ny02NS4yNC05NC45Mi0xMS41NS0zNy45IDIuMTYtNzkuMTctNC4zNC0xMTguMjYtOC41MS01MS4yNC00Ni43LTEwNC41Ni01Ni4wMS0xNTUuNjZoLTU0LjY3Yy0wLjgyIDEwNy42OSAzMi42IDE1Ny40NyAzOC41NyAyMzIuNyAzLjQ3IDQzLjc2LTQuODYgODkuMDIgOC4xIDEzMC45NyA3LjkxIDI1LjYzIDIzLjMyIDQ4LjI2IDMzLjQ3IDczLjA5IDguNiAyMS4wMiAxMy4zMiA0My4zIDE3LjkyIDY1LjYxbDQxLjkyLTE2LjAzYy0yNC42OC0zOS4xOC01NS42Ny05OS4zOS01My4zOS0xNTEuNzl6J1xuICAgICAgICAvPlxuICAgICAgICA8ZyBvcGFjaXR5PXswLjJ9PlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBmaWxsPXtzdDExfVxuICAgICAgICAgICAgZD0nbTIxMi43MSA0NTguNjNsLTAuMjctMC4zM2MtMC41Mi0wLjU5LTEuNzYtMS43OS0zLjMzLTEuOTloLTAuMDNjLTAuMS0wLjAxLTAuMjEtMC4wMi0wLjMxLTAuMDJoLTAuMjRjLTAuMTIgMC0wLjI0IDAuMDEtMC4zNiAwLjAzIDAgMC04LjQ1IDguNTgtMi4wMSA4LjkyczE0LjgxLTMuNzEgMTQuODEtMy43MS0wLjAxIDAtMC4wMyAwYy0zIDAuNi02LjE4LTAuNDQtOC4yMy0yLjl6J1xuICAgICAgICAgIC8+XG4gICAgICAgIDwvZz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDN9XG4gICAgICAgICAgZD0nbTEwNTYuNSA1MjAuMTJjMC4xMSAwLjMxIDAuMjUgMC42NSAwLjQyIDEuMDIgMS4wMiAwLjk2IDIuMDQgMS44OSAyLjkzIDIuNjkgMC4xLTAuMTQgMC4yOS0wLjIgMC40NS0wLjA5IDEuNjQgMS4xNyAzLjc5IDQuNTkgNC45IDYuNDkgMC4xOSAwLjMzIDAuNjkgMC4xMiAwLjU5LTAuMjUtMC40LTEuNDUtMS4xMy0zLjM0LTAuOTEtMy4xOCAwLjMzIDAuMjMgMC45NiAxLjQgMS4xNSAxLjM4IDAuMDgtMC4wMSAwLjE1LTAuMTQgMC4yLTAuMjkgMC4wOC0wLjI0IDAuMzktMC4yOSAwLjU1LTAuMTEgMC44NCAwLjk1IDEuNzIgMy4wOCAyLjMxIDQuNjggMC4xMyAwLjM3IDAuNjggMC4yMyAwLjYzLTAuMTYtMC4xNi0xLjE4LTAuMzMtMi4zNyAwLjA2LTIuMiAwLjc0IDAuMyAxLjczIDMuODIgMi4wNiAzLjQ4cy0wLjA0LTIuNyAwLjU3LTEuOTcgMC44IDQuNDUgMS4zMyA0LjMzYzAuMjctMC4wNiAwLjQ2LTAuODEgMC41OC0xLjUyIDAuMDYtMC4zMyAwLjUxLTAuMzcgMC42My0wLjA2IDAuMyAwLjg0IDAuNjMgMS44MiAwLjYxIDEuOTQtMC4wNCAwLjIyIDEuNzIgMi41NyAyLjA2IDIuMzNzLTAuMjYtMS41OS0wLjM1LTEuODJjLTAuMS0wLjIzLTEuNTgtMi4zMi0wLjA3LTEuMjMgMS41MSAxLjEgNC43NCA3Ljc5IDQuOTIgNy43MSAwLjE3LTAuMDctMC4xNS0yLjMxIDAuMS0yLjkybDAuMDYtMC4xNWMwLjEyLTAuMjkgMC41My0wLjI2IDAuNjEgMC4wNCAwLjI5IDEuMSAwLjc3IDIuNzcgMS4xIDMuOTUgMC4wOSAwLjMzIDAuNTcgMC4zMSAwLjYzLTAuMDQgMC4wOS0wLjUzIDAuMTktMS4xIDAuMjQtMS40OC0wLjAxLTAuMS0wLjAxLTAuMTkgMC4wMS0wLjI3IDAuMDctMC4zMSAwLjA1LTAuMTMtMC4wMSAwLjI3IDAuMDYgMC43NCAwLjcyIDIuMjEgMS4yOSAzLjM2IDAuMTYgMC4zMiAwLjY0IDAuMTkgMC42MS0wLjE2LTAuMDMtMC41NS0wLjA0LTEuMTEtMC4wNC0xLjYyIDAtMC4zNSAwLjQ4LTAuNDUgMC42Mi0wLjEzIDAuOTEgMi4wMiAyLjYgNC42NSAzLjQ5IDUuOTcgMC4yIDAuMyAwLjY3IDAuMSAwLjU5LTAuMjYtMC4xMS0wLjQ2LTAuMy0wLjkzLTAuNDYtMS4yOS0wLjEyLTAuMjYgMC4xNC0wLjU0IDAuNDEtMC40NCAxLjU5IDAuNiAyLjcyIDMuMzkgMy4xMyA0LjU2IDAuMSAwLjI5IDAuNTEgMC4zIDAuNjIgMC4wMiAwLjA1LTAuMTIgMC4wOC0wLjI0IDAuMS0wLjM2IDAuMDYtMC4yOCAwLjQzLTAuMzYgMC41OS0wLjEyIDAgMC4wMSAwLjAxIDAuMDEgMC4wMSAwLjAyIDAuMTkgMC4yOSAwLjY1IDAuMTMgMC42LTAuMjEtMC4wNi0wLjQyLTAuMTYtMC44My0wLjI2LTEuMTYtMC4wOC0wLjI4IDAuMjItMC41MiAwLjQ3LTAuMzcgMi4xNyAxLjI3IDIuOTQgNC4yMiAzLjIyIDYuMzIgMC4xMyAwLjA5IDAuMjcgMC4xOCAwLjQgMC4yNiAwLjEzLTAuNTQgMC4zLTEuMDggMC40NS0xLjUyIDAuMS0wLjMgMC41My0wLjI5IDAuNjIgMC4wMSAwLjA0IDAuMTMgMC4wOCAwLjI2IDAuMTMgMC40IDAuMDggMC4wMiAwLjE1IDAuMDYgMC4yMSAwLjE1IDAuNjEgMS4wMSAxLjcgMi40NSAyLjcyIDMuNjUgMC44MSAwLjUyIDEuNjIgMS4wNCAyLjQyIDEuNTUtMC4xNS0wLjI1LTAuMzUtMC41NS0wLjYtMC45Mi0wLjMyLTAuNDgtMC40OC0wLjgxLTAuNTYtMS4wNC0wLjA5LTAuMjcgMC4xOC0wLjUxIDAuNDQtMC40IDEuODMgMC44NCA0LjYgMy43OCA2LjA2IDUuNDIgMC4yNSAwLjI4IDAuNy0wLjAyIDAuNTQtMC4zNi0wLjY3LTEuMzQtMS43NS0zLjA2LTEuNTEtMi45NSAwLjM3IDAuMTYgMS4yMSAxLjE5IDEuNCAxLjE0IDAuMDgtMC4wMiAwLjEyLTAuMTYgMC4xNC0wLjMyIDAuMDMtMC4yNSAwLjMyLTAuMzYgMC41Mi0wLjIxIDEuMDEgMC43NyAyLjI4IDIuNjkgMy4xNiA0LjE1IDAuMiAwLjMzIDAuNzEgMC4xIDAuNTktMC4yNy0wLjM5LTEuMTItMC43OC0yLjI2LTAuMzYtMi4xNyAwLjc4IDAuMTYgMi40MyAzLjQyIDIuNjkgMy4wMnMtMC41Ni0yLjY0IDAuMTgtMi4wNCAxLjY0IDQuMjEgMi4xNCAzLjk5YzAuMjUtMC4xMSAwLjI5LTAuODggMC4yNy0xLjYxLTAuMDEtMC4zNCAwLjQzLTAuNDcgMC42LTAuMTggMC40NiAwLjc3IDAuOTcgMS42NiAwLjk3IDEuNzkgMCAwLjIzIDIuMTggMi4xOSAyLjQ3IDEuODlzLTAuNTYtMS41MS0wLjctMS43Mi0yLTEuOTgtMC4zLTEuMTljMS42OSAwLjc5IDYuMTUgNi43MyA2LjMxIDYuNjNzLTAuNTktMi4yNC0wLjQ2LTIuODlsMC4wMy0wLjE2YzAuMDYtMC4zMSAwLjQ3LTAuMzYgMC42MS0wLjA4IDAuNSAxLjAyIDEuMjggMi41NyAxLjg0IDMuNjYgMC4xNiAwLjMxIDAuNjIgMC4xOSAwLjYxLTAuMTYtMC4wMS0wLjU0LTAuMDMtMS4xMi0wLjA0LTEuNS0wLjAzLTAuMS0wLjA0LTAuMTktMC4wNC0wLjI2IDAuMDEtMC4zMiAwLjAyLTAuMTQgMC4wNCAwLjI2IDAuMiAwLjcyIDEuMTMgMi4wMyAxLjkxIDMuMDUgMC4yMiAwLjI4IDAuNjYgMC4wNiAwLjU3LTAuMjgtMC4xNC0wLjUzLTAuMjUtMS4wOC0wLjM1LTEuNTgtMC4wNy0wLjM0IDAuMzgtMC41NCAwLjU4LTAuMjUgMS4yOCAxLjggMy40NSA0LjA2IDQuNTcgNS4xOSAwLjI2IDAuMjYgMC42OC0wLjA0IDAuNTMtMC4zNy0wLjE5LTAuNDMtMC40Ny0wLjg2LTAuNy0xLjE4LTAuMTctMC4yNCAwLjA0LTAuNTYgMC4zMi0wLjUxIDEuNjggMC4yOCAzLjMyIDIuODEgMy45NSAzLjg4IDAuMTUgMC4yNiAwLjU2IDAuMiAwLjYxLTAuMSAwLjAyLTAuMTIgMC4wMy0wLjI1IDAuMDMtMC4zNyAwLTAuMjkgMC4zNS0wLjQ0IDAuNTUtMC4yNGwwLjAyIDAuMDJjMC4yNCAwLjI1IDAuNjYgMC4wMSAwLjU0LTAuMzItMC4xNC0wLjQtMC4zMi0wLjc5LTAuNDgtMS4wOS0wLjEzLTAuMjYgMC4xMi0wLjU1IDAuMzktMC40NiAwLjUyIDAuMTggMC45OCAwLjQ1IDEuNCAwLjc5IDAuMTItMC4wMSAwLjI0IDAuMDMgMC4zMSAwLjE1IDAuMDUgMC4wOSAwLjExIDAuMTkgMC4xOCAwLjI4IDAuNjIgMC42MSAxLjEyIDEuMzYgMS41MyAyLjEzIDAuNDcgMC42MSAwLjk3IDEuMjEgMS40NCAxLjczIDAuMDMtMC4zMiAwLjA2LTAuNjIgMC4xLTAuOSAwLjA0LTAuMzEgMC40Ni0wLjM5IDAuNjEtMC4xMSAwLjMyIDAuNiAwLjc3IDEuMyAxLjIgMS45Mi0wLjE0LTAuMjItMC4zMS0wLjQ4LTAuNTEtMC43OC0wLjMyLTAuNDgtMC40OC0wLjgxLTAuNTYtMS4wNC0wLjA5LTAuMjcgMC4xOC0wLjUxIDAuNDQtMC40IDEuODMgMC44NCA0LjYgMy43OCA2LjA2IDUuNDIgMC4yNSAwLjI4IDAuNy0wLjAyIDAuNTQtMC4zNi0wLjY3LTEuMzQtMS43NS0zLjA2LTEuNTEtMi45NSAwLjM3IDAuMTYgMS4yMSAxLjE5IDEuNCAxLjE0IDAuMDgtMC4wMiAwLjEyLTAuMTYgMC4xNC0wLjMyIDAuMDMtMC4yNSAwLjMyLTAuMzYgMC41Mi0wLjIxIDEuMDEgMC43NyAyLjI4IDIuNjkgMy4xNiA0LjE1IDAuMiAwLjMzIDAuNzEgMC4xIDAuNTktMC4yNy0wLjM5LTEuMTItMC43OC0yLjI2LTAuMzYtMi4xNyAwLjc4IDAuMTYgMi40MyAzLjQyIDIuNjkgMy4wMnMtMC41Ni0yLjY0IDAuMTgtMi4wNCAxLjY0IDQuMjEgMi4xNCAzLjk5YzAuMjUtMC4xMSAwLjI5LTAuODggMC4yNy0xLjYxLTAuMDEtMC4zNCAwLjQzLTAuNDcgMC42LTAuMTggMC40NiAwLjc3IDAuOTcgMS42NiAwLjk3IDEuNzkgMCAwLjIzIDIuMTggMi4xOSAyLjQ3IDEuODlzLTAuNTYtMS41MS0wLjctMS43Mi0yLTEuOTgtMC4zLTEuMTljMC42NSAwLjMgMy4wMyAyLjQ4IDUuNjMgNC45NS0wLjEyLTAuMTQtMC4yNS0wLjI3LTAuMzctMC40MWwwLjc1IDAuNTZjMC4xNyAwLjEzIDAuNDEgMC4wNiAwLjUtMC4xM2wwLjA2LTAuMTVjLTAuNDUtMC41Ny0wLjczLTAuOTctMC43MS0xLjA3bDAuMDMtMC4xNmMwLjA2LTAuMzEgMC40Ny0wLjM2IDAuNjEtMC4wOCAwLjA0IDAuMDcgMC4wOCAwLjE1IDAuMTEgMC4yM2wwLjI2IDAuMzcgMC42Mi0xLjQ5LTAuMzktMC42OXMtMS4yMS0yLjAyLTIuMTMtMi44OGMtMC4wMy0wLjAyLTAuMDUtMC4wNS0wLjA2LTAuMDgtMC4xNy0wLjM0LTEuMjItMi40NS0xLjY2LTMuOTUtMC4wOS0wLjMtMC41Mi0wLjMxLTAuNjItMC4wMS0wLjMxIDAuODktMC42NyAyLjE0LTAuNzIgMy4xMi0wLjAzLTEuNTItMC4zNS02LjQzLTMuMzItOC4yLTAuMjUtMC4xNS0wLjU1IDAuMDktMC40NyAwLjM3IDAuMDkgMC4zMyAwLjE5IDAuNzQgMC4yNSAxLjE2IDAuMDUgMC4zNC0wLjQxIDAuNS0wLjYgMC4yMSAwLTAuMDEtMC4wMS0wLjAxLTAuMDEtMC4wMi0wLjA0LTAuMDYtMC4wOS0wLjA5LTAuMTQtMC4xMi0wLjIyLTAuMjctMC40NC0wLjUyLTAuNjQtMC43MS0wLjAzLTAuMDItMC4wNS0wLjA1LTAuMDYtMC4wOC0wLjE3LTAuMzQtMS4yMi0yLjQ1LTEuNjYtMy45NS0wLjA5LTAuMy0wLjUyLTAuMzEtMC42Mi0wLjAxLTAuMTQgMC40LTAuMjggMC44Ni0wLjQxIDEuMzQtMC4xNS0wLjE1LTAuMzItMC4yNy0wLjQ4LTAuMzgtMC4zLTIuMDctMS4wOC00LjgyLTMuMTUtNi4wNC0wLjI1LTAuMTUtMC41NSAwLjA5LTAuNDcgMC4zNyAwLjA5IDAuMzMgMC4xOSAwLjc0IDAuMjUgMS4xNiAwLjA1IDAuMzQtMC40MSAwLjUtMC42IDAuMjEgMC0wLjAxLTAuMDEtMC4wMS0wLjAxLTAuMDItMC4xMy0wLjItMC40LTAuMTgtMC41My0wLjAxLTAuMTktMC4xNi0wLjUzLTAuMDUtMC41MyAwLjI1djAuNDRjLTAuMTEtMC4wMi0wLjIxLTAuMDktMC4yNS0wLjIyLTAuNDEtMS4xOC0xLjUyLTMuOTctMy4xMS00LjU4LTAuMjctMC4xLTAuNTMgMC4xNy0wLjQxIDAuNDMgMC4xNiAwLjM1IDAuMzUgMC44MyAwLjQ1IDEuMjkgMC4wMiAwLjEgMCAwLjE5LTAuMDUgMC4yNi0wLjE3LTAuNi0wLjMyLTEuMTktMC40NS0xLjY2LTAuMDgtMC4zLTAuNDktMC4zMy0wLjYxLTAuMDRsLTAuMDYgMC4xNWMtMC4wNSAwLjEyLTAuMDggMC4yOS0wLjA5IDAuNS0wLjktMS40MS0yLjA4LTMuMzYtMi43OC00Ljk0LTAuMTQtMC4zMi0wLjYyLTAuMjItMC42MiAwLjEzIDAgMC40NSAwIDAuOTQgMC4wMiAxLjQyLTAuNTctMC44OS0xLjExLTEuNjItMS41My0xLjkzLTAuMDQtMC4wMy0wLjA3LTAuMDUtMC4xLTAuMDctMC4xNC0wLjQtMC4yMy0wLjc1LTAuMjUtMS4wMS0wLjAzIDAuMjEtMC4wOCAwLjQ5LTAuMTMgMC43OS0wLjI2LTAuMS0wLjIyIDAuMTItMC4wNyAwLjQzLTAuMDIgMC4wOS0wLjAzIDAuMTctMC4wNSAwLjI2LTAuMDYgMC4zNC0wLjU0IDAuMzctMC42MyAwLjAzLTAuMzMtMS4xOC0wLjc5LTIuODUtMS4wOC0zLjk1LTAuMDgtMC4zLTAuNDktMC4zMy0wLjYxLTAuMDRsLTAuMDYgMC4xNWMtMC4yNiAwLjYxIDAuMDYgMi44NS0wLjEyIDIuOTItMC4wNiAwLjAzLTAuNTItMC44My0xLjE1LTEuOTgtMC4xNC0wLjY3LTAuMjktMS4yNy0wLjUtMS41Mi0wLjE4LTAuMjEtMC4yNy0wLjE2LTAuMzIgMC4wMi0xLTEuNzktMi4xNi0zLjcxLTIuOTEtNC4yNi0xLjUtMS4xMS0wLjAzIDAuOTkgMC4wNiAxLjIzIDAuMDcgMC4xNyAwLjQyIDAuOTkgMC40NSAxLjQ4LTAuMDkgMC4wMi0wLjEzIDAuMTUtMC4xNSAwLjM1LTAuNDIgMC4wNy0yLjA1LTIuMTMtMi0yLjM1IDAuMDItMC4xMi0wLjMtMS4xLTAuNi0xLjk1LTAuMTEtMC4zMi0wLjU3LTAuMjgtMC42MyAwLjA1LTAuMTIgMC43MS0wLjMxIDEuNDYtMC41OSAxLjUyLTAuMDUgMC4wMS0wLjA5LTAuMDEtMC4xMy0wLjA1LTAuMDItMC4wMy0wLjA1LTAuMDctMC4wNy0wLjEtMC4zOC0wLjctMC41OS0zLjU1LTEuMTEtNC4xOC0wLjYxLTAuNzMtMC4yNSAxLjYyLTAuNTggMS45NnMtMS4zMS0zLjE4LTIuMDUtMy40OWMtMC4zOS0wLjE2LTAuMjQgMC45OC0wLjA5IDIuMTMtMC4zMi0wLjcyLTAuNjUtMS41NS0wLjg2LTIuMjQtMC4wOS0wLjMtMC41Mi0wLjMxLTAuNjItMC4wMWwtMC4wNiAwLjE4Yy0wLjQzLTAuOTctMC45LTEuODYtMS4zNy0yLjM5LTAuMDktMC4xLTAuMjMtMC4xMy0wLjM0LTAuMS0wLjQ5LTEuMTMtMS4yMS0yLjE1LTIuMjctMi43Ny0wLjI1LTAuMTUtMC41NSAwLjA5LTAuNDcgMC4zNyAwLjA5IDAuMzMgMC4xOSAwLjc0IDAuMjUgMS4xNiAwLjA1IDAuMzQtMC40MSAwLjUtMC42IDAuMjEgMC0wLjAxLTAuMDEtMC4wMS0wLjAxLTAuMDItMC4xMi0wLjE4LTAuMzUtMC4xOC0wLjQ4LTAuMDYtMC44Mi0xLjE1LTEuNjktMi4yMS0yLjQ2LTIuOC0wLjQzLTAuNTgtMC45Mi0xLjA2LTEuNDctMS4yNy0wLjI3LTAuMS0wLjUzIDAuMTctMC40MSAwLjQzIDAuMTIgMC4yOCAwLjI2IDAuNjMgMC4zNyAwLjk5LTAuMzItMC4yNi0wLjY0LTAuNTMtMC45NS0wLjc5LTAuNTctMS4xLTEuMDktMi4yNC0xLjM5LTMuMDgtMC4xMS0wLjMtMC41NS0wLjI4LTAuNjIgMC4wNC0wLjAyIDAuMDgtMC4wNCAwLjE3LTAuMDYgMC4yNi0wLjM1LTAuNjQtMC42OC0xLjI4LTAuOTQtMS44Ni0wLjE0LTAuMzItMC42Mi0wLjIyLTAuNjIgMC4xMyAwIDAuNDkgMCAxLjAzIDAuMDMgMS41Ni0wLjM4LTAuMzEtMC43Ni0wLjYyLTEuMTQtMC45Mi0wLjM4LTAuODYtMC43LTEuNzItMC43NC0yLjIzLTAuMDYgMC4zNy0wLjE1IDAuOTItMC4yNCAxLjQ0LTAuMjgtMC4yMi0wLjU2LTAuNDUtMC44NC0wLjY3LTAuMy0xLjA3LTAuNjQtMi4zMy0wLjg4LTMuMjEtMC4wOC0wLjMtMC40OS0wLjMzLTAuNjEtMC4wNGwtMC4wNiAwLjE1Yy0wLjE0IDAuMzMtMC4xMSAxLjE0LTAuMDggMS44Mi0wLjQxLTAuMzItMC44MS0wLjYzLTEuMjItMC45NS0xLjExLTIuMDUtMi43NC00Ljk5LTMuNjktNS42OS0xLjUtMS4xMS0wLjAzIDAuOTkgMC4wNiAxLjIzIDAuMSAwLjIzIDAuNjggMS41OCAwLjM0IDEuODItMC4wNiAwLjA0LTAuMTcgMC0wLjMxLTAuMS0wLjAxLTAuMDEtMC4wMi0wLjAxLTAuMDMtMC4wMi0wLjYyLTAuNDctMS43NS0yLjA0LTEuNzEtMi4yMiAwLjAyLTAuMTItMC4zLTEuMS0wLjYtMS45NS0wLjExLTAuMzItMC41Ny0wLjI4LTAuNjMgMC4wNS0wLjEyIDAuNzEtMC4zMSAxLjQ1LTAuNTggMS41Mi0wLjA3LTAuMDUtMC4xMy0wLjEtMC4yLTAuMTQtMC4zOS0wLjY5LTAuNTktMy41NS0xLjExLTQuMTktMC42MS0wLjczLTAuMjUgMS42Mi0wLjU4IDEuOTZzLTEuMzEtMy4xOC0yLjA1LTMuNDljLTAuNC0wLjE2LTAuMjMgMS4wMy0wLjA4IDIuMiAwLjA1IDAuMzktMC41IDAuNTItMC42MyAwLjE1LTAuNTgtMS42LTEuNDUtMy43NC0yLjI4LTQuNjktMC4xNi0wLjE5LTAuNDctMC4xMy0wLjU1IDAuMS0wLjA1IDAuMTUtMC4xMiAwLjI4LTAuMiAwLjI5LTAuMiAwLjAxLTAuODEtMS4xNS0xLjE1LTEuMzktMC4yMi0wLjE1IDAuNTEgMS43NCAwLjkgMy4xOSAwLjA1IDAuMi0wLjA3IDAuMzUtMC4yMyAwLjQtMC4xNS0wLjEtMC4zLTAuMTktMC40NS0wLjI5LTEuMTMtMS45My0zLjE5LTUuMjItNC43OC02LjM3LTAuMjMtMC4xNi0wLjU0IDAuMDMtMC41MSAwLjMgMC4wMyAwLjI0IDAuMTIgMC42IDAuMzQgMS4xMyAwLjU2IDEuMzYgMC43NyAxLjkzIDAuMzYgMS43N2wtMS44Ny0zLjA2Yy0wLjE2LTAuMDktMC4zMi0wLjE4LTAuNDctMC4yNy0wLjY1LTEuMjMtMS4yOC0yLjU2LTEuNjItMy41Mi0wLjExLTAuMy0wLjU1LTAuMjgtMC42MiAwLjA0LTAuMTUgMC42NS0wLjI4IDEuNTUtMC4yOCAyLjY0IDAgMC4xOCAwIDAuMzYgMC4wMSAwLjU2LTAuNTctMC40MS0xLjEyLTAuODItMS41Ni0xLjE0LTAuMjUtMC4xOS0wLjU5IDAuMDUtMC41MSAwLjM1bDAuMDUgMC4xNmMwLjE4IDAuNjQgMS44MyAyLjE5IDEuNzQgMi4zNi0wLjA5IDAuMTYtNi43OC0zLjA3LTguNjQtMy0xLjg3IDAuMDggMC42IDAuOCAwLjgyIDAuOTJzMS41MiAwLjgxIDEuNDEgMS4yMS0yLjk1LTAuMzUtMy4wNi0wLjU1Yy0wLjA2LTAuMTEtMC45Mi0wLjY3LTEuNjgtMS4xNS0wLjI4LTAuMTgtMC42MiAwLjE0LTAuNDYgMC40MyAwLjM1IDAuNjMgMC42NyAxLjM0IDAuNDkgMS41NS0wLjM0IDAuNDItMi44LTIuMzctMy43My0yLjU3LTAuOTMtMC4xOSAwLjgyIDEuNDIgMC43NyAxLjktMC4wNSAwLjQ3LTMuMDEtMS42Ny0zLjc4LTEuNDUtMC40MSAwLjEyIDAuNDYgMC45NSAxLjMyIDEuNzcgMC4yOCAwLjI3LTAuMDYgMC43Mi0wLjQgMC41MS0xLjQ1LTAuODktMy40Ni0yLjAyLTQuNzItMi4yNC0wLjI1LTAuMDQtMC40NSAwLjE5LTAuMzcgMC40MyAwLjA1IDAuMTUgMC4wOCAwLjMgMC4wMiAwLjM1LTAuMTUgMC4xMy0xLjM2LTAuMzktMS43Ni0wLjM3LTAuMjcgMC4wMiAxLjQ4IDEuMDQgMi42OSAxLjkzIDAuMzEgMC4yMyAwLjA0IDAuNy0wLjMxIDAuNTctMi4wNS0wLjgtNS44Ni0yLjE0LTcuODctMi4wNC0wLjI4IDAuMDEtMC40IDAuMzYtMC4yMSAwLjU1IDAuMTcgMC4xNyAwLjQ3IDAuNCAwLjk3IDAuNjcgMS41MyAwLjg1IDEuOTggMS4xMyAxLjA0IDEuMjItMC42IDAuMDUtMy40My0xLjA2LTUuNTUtMi4xMi0wLjM1IDAuMzItMC40MSAwLjY0LTAuMSAwLjkzIDAuMDctMC4yOSAwLjUxLTAuMzIgMC42Mi0wLjAxeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE1fVxuICAgICAgICAgIGQ9J20xMDYwLjIgNTI2Ljc5YzAuNzYgMC40OSAwLjYzIDAuMDUgMC4wMy0xLjM5bC0wLjk4IDAuMTRjMC40IDAuNjUgMC43NSAxLjEyIDAuOTUgMS4yNXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J200Ny4wMyA3MTEuNDVjMC4xMi0wLjEyIDAuMi0wLjIzIDAuMjYtMC4zNCAwLjIyLTAuNDUgMC4wNi0wLjIxLTAuMjYgMC4zNHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xNDMuMjUgNzE2Ljg1Yy0zLjE1IDEuODgtMTAuMDcgNC42My0xMS4yNyA0LjUtMS41LTAuMTYtMC43Ny0wLjYgMS42OS0xLjkyIDAuOC0wLjQzIDEuMjgtMC43NyAxLjU2LTEuMDUgMC4zMi0wLjMxIDAuMTMtMC44Ni0wLjMyLTAuODktMy4yLTAuMi05LjI5IDEuODUtMTIuNTggMy4wNi0wLjU3IDAuMjEtMC45Ny0wLjU2LTAuNDgtMC45MSAxLjk1LTEuMzggNC43NS0yLjk3IDQuMzMtMy4wMS0wLjY1LTAuMDUtMi41OSAwLjc2LTIuODIgMC41NC0wLjA5LTAuMDktMC4wNS0wLjMyIDAuMDQtMC41NiAwLjE0LTAuMzctMC4xOC0wLjc1LTAuNTctMC42OS0yIDAuMzMtNS4yMyAyLjA3LTcuNTYgMy40NS0wLjUzIDAuMzItMS4wNy0wLjQtMC42Mi0wLjgyIDEuMzktMS4yOSAyLjc5LTIuNTggMi4xNC0yLjc4LTEuMjEtMC4zNy01Ljk4IDIuOTctNi4wNSAyLjIxLTAuMDYtMC43NiAyLjc2LTMuMjggMS4yOC0zLTEuNDkgMC4yOS01LjQ3IDQuNjctNiA0LTAuMjctMC4zNSAwLjI1LTEuNDYgMC44Mi0yLjQ2IDAuMjctMC40Ni0wLjI2LTAuOTgtMC43Mi0wLjctMS4yMiAwLjc0LTIuNjEgMS42MS0yLjcxIDEuNzgtMC4wNyAwLjE0LTAuOTkgMC40My0yLjAxIDAuNjcgMC42NS0wLjY5IDEuMjUtMS4zNiAxLjcyLTEuOTIgMS4xMS0xLjM0IDEuODUtMi41NyAyLjMzLTMuNTIgMC4yMy0wLjQ2LTAuMjktMC45NC0wLjczLTAuNjgtMy4xNSAxLjg4LTEwLjA3IDQuNjMtMTEuMjcgNC41LTEuNS0wLjE2LTAuNzctMC42IDEuNjktMS45MiAwLjgtMC40MyAxLjI4LTAuNzcgMS41Ni0xLjA1IDAuMzItMC4zMSAwLjEzLTAuODYtMC4zMi0wLjg5LTMuMi0wLjItOS4yOSAxLjg1LTEyLjU4IDMuMDYtMC41NyAwLjIxLTAuOTctMC41Ni0wLjQ4LTAuOTEgMS45NS0xLjM4IDQuNzUtMi45NyA0LjMzLTMuMDEtMC42NS0wLjA1LTIuNTkgMC43Ni0yLjgyIDAuNTQtMC4wOS0wLjA5LTAuMDUtMC4zMiAwLjA0LTAuNTYgMC4xNC0wLjM3LTAuMTgtMC43NS0wLjU3LTAuNjktMiAwLjMzLTUuMjMgMi4wNy03LjU2IDMuNDUtMC41MyAwLjMyLTEuMDctMC40LTAuNjItMC44MiAxLjM5LTEuMjkgMi43OS0yLjU4IDIuMTQtMi43OC0xLjIxLTAuMzctNS45OCAyLjk3LTYuMDUgMi4yMS0wLjA2LTAuNzYgMi43Ni0zLjI4IDEuMjgtMy0xLjQ5IDAuMjktNS40NyA0LjY3LTYgNC0wLjI3LTAuMzUgMC4yNS0xLjQ2IDAuODItMi40NiAwLjI3LTAuNDYtMC4yNi0wLjk4LTAuNzItMC43LTEuMjIgMC43NC0yLjYxIDEuNjEtMi43MSAxLjc4LTAuMSAwLjE5LTEuODQgMC42OS0zLjIyIDAuOS0wLjMzIDAuMDEtMC42NSAwLjA0LTAuOTggMC4wOS0wLjM5IDAuMDEtMC42NS0wLjA1LTAuNjktMC4xOS0wLjE3LTAuNjQgMS45Mi0xLjcgMi4yNy0xLjg5czQuMjktMS4yNyAxLjMyLTEuNDQtMTMuNjkgNC44My0xMy44MyA0LjU2Yy0wLjE0LTAuMjYgMi41MS0yLjcgMi44Mi0zLjcxbDAuMDgtMC4yNWMwLjE0LTAuNDctMC40LTAuODYtMC44LTAuNTctMS40NiAxLjA2LTMuNzMgMi42NC01LjMzIDMuNzYtMC40NSAwLjMxLTEuMDItMC4yLTAuNzQtMC42OCAwLjQzLTAuNzUgMC44OC0xLjU1IDEuMTktMi4wNy0wLjgyIDAuODUtMy4xMSAyLTQuOTggMi44NC0wLjUxIDAuMjMtMC45Ny0wLjQxLTAuNTktMC44MiAwLjU5LTAuNjQgMS4xNy0xLjMzIDEuNjgtMS45NSAwLjM1LTAuNDMtMC4xMy0xLjA0LTAuNjMtMC43OS0zLjE1IDEuNTctNy44OSAzLjExLTEwLjMxIDMuODUtMC41NiAwLjE3LTAuOTItMC41Ni0wLjQ2LTAuOTEgMC41OS0wLjQ2IDEuMzEtMC44NSAxLjg2LTEuMTMgMC40MS0wLjIxIDAuMzctMC44MS0wLjA3LTAuOTUtMi41Ni0wLjg3LTYuNzcgMS40NC04LjQ1IDIuNDgtMC40MSAwLjI1LTAuOTMtMC4xNC0wLjc5LTAuNiAwLjA2LTAuMTkgMC4xNS0wLjM4IDAuMjQtMC41NSAwLjIyLTAuNC0wLjE2LTAuODgtMC42LTAuNzUtMC4wMSAwLTAuMDIgMC4wMS0wLjAzIDAuMDEtMC41MyAwLjE2LTAuOTMtMC40OS0wLjUyLTAuODYgMC41LTAuNDYgMS4wNC0wLjg2IDEuNDktMS4xNyAwLjM4LTAuMjYgMC4yNS0wLjg2LTAuMjEtMC45NC01LjQzLTAuODQtMTAuNzggNC44My0xMi4zNyA2LjY5IDAuOTMtMS4yNiAxLjc0LTMuMTQgMi4yNi00LjU0IDAuMTgtMC40Ny0wLjM2LTAuODktMC43Ny0wLjYxLTIuMDYgMS40LTUuNDkgMi45My02LjA0IDMuMTctMC4wNSAwLjAyLTAuMSAwLjAzLTAuMTYgMC4wNC0yLjAxIDAuMTMtNS41MyAxLjM4LTUuNTMgMS4zOGwtMi4zOCAwLjg5IDAuMDEgMS4xMmgtMC4wMWwtMC4xIDU3Ljg3YzAuNTEtMC4zMi0wLjA4LTEuNzggMS43Ny0zLjQ1IDAuMzctMC4zNCAwLjk2IDAuMDEgMC44NSAwLjUtMC4yIDAuODgtMC40OCAxLjk2LTAuODMgMi45N2gwLjVjMi4wNC0yLjY4IDUuNzQtNi41NiAxMC4wNC02LjQ5IDAuNDYgMC4wMSAwLjY4IDAuNTkgMC4zNCAwLjktMC40IDAuMzctMC44OCAwLjg0LTEuMzEgMS4zNi0wLjM1IDAuNDMgMC4xNCAxLjAxIDAuNjQgMC43OCAwLjAxIDAgMC4wMi0wLjAxIDAuMDMtMC4wMSAwLjQyLTAuMTkgMC44NSAwLjIzIDAuNyAwLjY2LTAuMDcgMC4xOC0wLjEzIDAuMzgtMC4xNiAwLjU4LTAuMDggMC40NyAwLjQ5IDAuNzkgMC44NiAwLjQ4IDEuNTMtMS4yNiA1LjM3LTQuMTIgOC4wMy0zLjYyIDAuNDUgMC4wOSAwLjU4IDAuNjcgMC4yIDAuOTMtMC41MSAwLjM1LTEuMTYgMC44NC0xLjY5IDEuMzgtMC40MSAwLjQxIDAuMDYgMS4wOCAwLjU4IDAuODQgMi4zLTEuMDcgNi43OC0zLjI1IDkuNjgtNS4yNCAwLjQ2LTAuMzIgMS4wMiAwLjIyIDAuNzMgMC43LTAuNDIgMC42OS0wLjkgMS40NS0xLjM5IDIuMTYtMC4zMiAwLjQ2IDAuMjIgMS4wMyAwLjcgMC43MyAxLjczLTEuMSAzLjg0LTIuNTUgNC41NC0zLjUgMC4yNC0wLjU5IDAuMzYtMC44NSAwLjIxLTAuMzctMC4wNCAwLjExLTAuMTEgMC4yNC0wLjIxIDAuMzctMC4yMyAwLjU2LTAuNTcgMS40MS0wLjg5IDIuMjEtMC4yIDAuNTEgMC40MyAwLjk1IDAuODMgMC41NyAxLjQzLTEuMzIgMy40Ni0zLjIxIDQuNzYtNC40NiAwLjM2LTAuMzQgMC45NS0wLjAzIDAuODcgMC40NmwtMC4wNCAwLjI2Yy0wLjE2IDEuMDQtMi40NiAzLjgyLTIuMjggNC4wNnMxMC4xMS02LjE4IDEzLjA3LTYuNDMtMC43OSAxLjM3LTEuMTEgMS42MWMtMC4zMiAwLjIzLTIuMjUgMS41Ny0xLjk5IDIuMThzNC42LTEuMTMgNC43My0xLjQ3YzAuMDctMC4xOSAxLjMzLTEuMjQgMi40My0yLjE0IDAuNDItMC4zNCAxIDAuMSAwLjgxIDAuNi0wLjQzIDEuMDctMC43OSAyLjI0LTAuNDcgMi41NSAwLjYyIDAuNiAzLjk2LTQuMyA1LjM5LTQuNzhzLTEuMDIgMi40MS0wLjg1IDMuMTUgNC40My0zLjIyIDUuNjgtMy4wM2MwLjY3IDAuMTEtMC41NCAxLjU4LTEuNzQgMy4wNS0wLjM5IDAuNDggMC4yNCAxLjEyIDAuNzMgMC43MyAyLjEyLTEuNjkgNS4wOC0zLjg2IDcuMDEtNC40NiAwLjM4LTAuMTIgMC43NSAwLjIxIDAuNjYgMC42LTAuMDYgMC4yNS0wLjA3IDAuNDkgMC4wMyAwLjU2IDAuMjYgMC4xOCAyLjA3LTAuODkgMi43MS0wLjkzIDAuNDItMC4wMy0yLjE0IDEuOTMtMy44OCAzLjU3LTAuMTggMC4xNy0wLjIgMC4zOC0wLjEzIDAuNTYgNC40Ni0xLjY0IDcuNTctNC4yIDYuNDEtNi43cy02LjA3LTQuMjYtOS44MS02LjIxYy0zLjQxLTEuNzgtNS45MS00LjQzLTMuNTgtNi40IDAuMjMtMC4xOSAwLjUtMC4zOCAwLjgyLTAuNTUgMC4wNC0wLjAyIDAuMDktMC4wNSAwLjEzLTAuMDcgMS42Ny0xLjA4IDUuMTEtMy4yIDYuNTgtMy41IDAuMDYtMC4wMSAwLjEtMC4wMyAwLjE1LTAuMDYgMC41MS0wLjMyIDMuNy0yLjMxIDUuNTUtMy45NyAwLjM3LTAuMzQgMC45NiAwLjAxIDAuODUgMC41LTAuMjkgMS4zLTAuNzUgMy0xLjM3IDQuMzIgMC4wMy0wLjAxIDAuMDYtMC4wMSAwLjA5LTAuMDIgMS42NC0yLjQzIDUuOS03LjkxIDExLTcuODMgMC40NiAwLjAxIDAuNjggMC41OSAwLjM0IDAuOS0wLjQgMC4zNy0wLjg4IDAuODQtMS4zMSAxLjM2LTAuMzUgMC40MyAwLjE0IDEuMDEgMC42NCAwLjc4IDAuMDEgMCAwLjAyLTAuMDEgMC4wMy0wLjAxIDAuNDItMC4xOSAwLjg1IDAuMjMgMC43IDAuNjYtMC4wNyAwLjE4LTAuMTMgMC4zOC0wLjE2IDAuNTgtMC4wOCAwLjQ3IDAuNDkgMC43OSAwLjg2IDAuNDggMS41My0xLjI2IDUuMzctNC4xMiA4LjAzLTMuNjIgMC40NSAwLjA5IDAuNTggMC42NyAwLjIgMC45My0wLjUxIDAuMzUtMS4xNiAwLjg0LTEuNjkgMS4zOC0wLjM1IDAuMzUtMC4wNiAwLjg4IDAuMzUgMC44OSAwLjA2LTAuMDEgMC4xMy0wLjAyIDAuMTktMC4wNCAwLjAxLTAuMDEgMC4wMy0wLjAxIDAuMDQtMC4wMiAyLjMtMS4wNyA2Ljc4LTMuMjUgOS42OC01LjI0IDAuNDYtMC4zMiAxLjAyIDAuMjIgMC43MyAwLjctMC40MiAwLjY5LTAuOSAxLjQ1LTEuMzkgMi4xNi0wLjE4IDAuMjUtMC4wOSAwLjU0IDAuMSAwLjcgMC4zMS0wLjA2IDAuNjItMC4xMSAwLjkzLTAuMTcgMS42Ni0xLjA3IDMuNTYtMi40IDQuMjEtMy4zIDAuMjQtMC41OSAwLjM2LTAuODUgMC4yMS0wLjM3LTAuMDQgMC4xMS0wLjExIDAuMjQtMC4yMSAwLjM3LTAuMjMgMC41Ni0wLjU3IDEuNDEtMC44OSAyLjIxLTAuMDcgMC4xNy0wLjA0IDAuMzQgMC4wNCAwLjQ3IDAuMzgtMC4wNyAwLjc1LTAuMTQgMS4xMy0wLjIxIDEuNC0xLjI5IDMuMjItMi45OSA0LjQyLTQuMTQgMC4zNi0wLjM0IDAuOTUtMC4wMyAwLjg3IDAuNDZsLTAuMDQgMC4yNmMtMC4xIDAuNjEtMC45MSAxLjgtMS41NCAyLjc0IDAuMjktMC4wNSAwLjU5LTAuMTEgMC44OC0wLjE2IDAuNTctMC4xIDEuMTQtMC4yMSAxLjctMC4zMiAzLjIyLTEuODUgNy44Ny00LjQ3IDkuNzQtNC42MiAyLjk2LTAuMjUtMC43OSAxLjM3LTEuMTEgMS42MS0wLjIzIDAuMTctMS4yOCAwLjktMS43NyAxLjUzIDEuOTEtMC41IDMuNy0xLjA4IDUuMjUtMS43OSAwLjIzLTAuMSAwLjQ0LTAuMjEgMC42Ni0wLjMyIDAuMzMtMC4yOCAwLjY5LTAuNTcgMS4wMy0wLjg1IDAuMTYtMC4xMyAwLjM1LTAuMTQgMC41MS0wLjA4IDAuNzktMC41NyAxLjQtMS4xOSAxLjc4LTEuODIgMC4zLTAuMzYgMC42MS0wLjc4IDAuOTUtMS4yOSAwLjcxLTEuMDcgNS44NC01LjUzIDguMDQtOC4xOSAxLjExLTEuMzQgMS44NS0yLjU3IDIuMzMtMy41MiAwLjI4LTAuMzktMC4yMy0wLjg3LTAuNjgtMC42MXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMDEuNTkgNjI0Ljc2bDEwLjE3LTAuNzRjMC40OS0wLjA0IDAuNTItMC43MyAwLjA0LTAuODItMi4xOS0wLjM4LTUuNzYtMC42LTEwLjM2IDAuNTEtMC42NCAwLjE3LTAuNSAxLjEgMC4xNSAxLjA1eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEyMS4yMiA2MjUuOTdoLTExLjIxYy0wLjY3IDAtMC43NiAwLjk3LTAuMTEgMS4wOSAyLjQ2IDAuNDYgNi4yNCAwLjY1IDExLjM4LTAuNDkgMC4zNi0wLjA3IDAuMzEtMC42LTAuMDYtMC42eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTI5OC42NiA4MDcuNDFoLTIyLjlzMC42Ni00LjIgMTEuNjEtNC4yIDExLjI5IDQuMiAxMS4yOSA0LjJ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMjU4LjA3IDgzMS40MmgtMjIuOXMwLjY2LTQuMiAxMS42MS00LjIgMTEuMjkgNC4yIDExLjI5IDQuMnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20zODkuNjcgNjE2LjAxaC0xMS40NXMwLjMzLTIuMSA1LjgtMi4xIDUuNjUgMi4xIDUuNjUgMi4xeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTQwMy4wNSA2MjAuODZoLTExLjQ1czAuMzMtMi4xIDUuOC0yLjEgNS42NSAyLjEgNS42NSAyLjF6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTQ4Ljg3IDY4Mi40OGgtMTEuN3MwLjM0LTIuMTUgNS45My0yLjE1IDUuNzcgMi4xNSA1Ljc3IDIuMTV6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTY3LjQ0IDY4NC42M2gtMTEuN3MwLjM0LTIuMTUgNS45My0yLjE1YzUuNiAwIDUuNzcgMi4xNSA1Ljc3IDIuMTV6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTkwLjQ0IDY3OC43aC0xMS43czAuMzQtMi4xNSA1LjkzLTIuMTVjNS42IDAuMDEgNS43NyAyLjE1IDUuNzcgMi4xNXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xODAuMTEgNjc0Ljc0aC0xMS43czAuMzQtMi4xNSA1LjkzLTIuMTUgNS43NyAyLjE1IDUuNzcgMi4xNXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20zOTkuOTMgNjA2LjhoLTkuNDNzMC4yNy0xLjc3IDQuNzgtMS43NyA0LjY1IDEuNzcgNC42NSAxLjc3eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTQxNC45IDYwOC41N2gtOS40M3MwLjI3LTEuNzcgNC43OC0xLjc3IDQuNjUgMS43NyA0LjY1IDEuNzd6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNDMzLjQ0IDYwMy42OGgtOS40M3MwLjI3LTEuNzcgNC43OC0xLjc3IDQuNjUgMS43NyA0LjY1IDEuNzd6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNDI1LjExIDYwMC40MWgtOS40M3MwLjI3LTEuNzcgNC43OC0xLjc3IDQuNjUgMS43NyA0LjY1IDEuNzd6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtNzk5Ljc1IDQ2NC43NHMtNTguNjggNTIuNTMtMTEzLjEgNTAuNTlsMjQuMTEtMTAuMTRzNi4zMiAyLjEgMTMuMS0xLjM5bDc1Ljg5LTM5LjA2eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTkyMC43NyA1MTUuMzhsMTQuMTEgNC40OGMyLjE0IDAuNjggNC40OSAwLjEyIDYuMDktMS40NWwxMi4wMy0xMS43N2MwLjAxIDAtMjQuMTEgOS44NS0zMi4yMyA4Ljc0eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTIyNS40IDQ1OS4wMnMtOC4wMyA1LjE2LTEzLjM1LTAuNDZjMCAwLTEuNzQtNS43NC0xMi44MSAxLjU5bC0zNC45NCAxOC4wNWM0LjI3IDE5Ljg3IDMuOCA1MS4yNiAzLjggNTEuMjZsLTI4LjA4LTQyLjI5LTQzLjA4IDE2LjQ4czEwLjk1IDYyLjcgMjAuMzEgNzIuNjNsMTYyLjcgMy4wNGMtMC4wMS0wLjAxLTE3LjMxLTc4Ljc4LTU0LjU1LTEyMC4zeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xNzQuNTMgNjMwLjg5YzAuOTYtMC4yOSAxLjk2LTAuMyAyLjkxLTAuNDItMS44My0zLjA2LTQuMDctNi41LTYuNzYtMTAuMTYgMTAuNTcgNC4wMSAyNS44IDguMSA0NS42MSA5LjI3IDEuNzEgMS40NyAzLjQyIDIuOTIgNS4xMyA0LjM1IDAuNDkgMC4xIDAuOTIgMC4yIDEuMjcgMC4zMiAxLjg0IDAuNiAzLjc2IDAuOSA1LjY5IDAuODYgMy40NS0wLjA4IDUuMDMtMC40MSAxMC43Ni0wLjI3IDguNTUgMC4yMSAxNy4wOCAxLjE0IDI1LjYzIDEuMDIgOC4wNi0wLjExIDE2LjI1LTEuMjEgMjMuNTctNC41MyAwLjU2LTAuMjUgMC41OC0xLjA0IDAuMDMtMS4zMmwtMC40Ny0wLjI1Yy0wLjc3LTAuNC0wLjY4LTEuNTMgMC4xMy0xLjgyIDEuMjEtMC40NCAyLjQ3LTAuNzUgMy43NS0wLjkzIDIuMDEtMC4yOSAyLjgxLTIuNzUgMS4zMy00LjE0LTEyLjUxLTExLjc0LTI2LjQxLTIzLjY1LTQxLjctMzUuMTktNS4xMi0xOC45NC0xMi44My0zMi45My0xOS41Mi00Mi40MSAxNS4xNSA2Ljk3IDI2Ljg1IDguOTUgMjYuODUgOC45NXMtMTguMTctNDYuNzktNjcuNTgtNjQuMjhjLTQuMSAzLjE2LTcuNDUgNy4xNC05LjgzIDExLjY4IDcuNjEgMTIuNDMgMTcuMDggMjIuMDIgMjYuNzUgMjkuNCA2LjI2IDEzLjQ1IDQuNDMgMjMuNDMgMi4yOSAyOC44OC0xMS45OC03LjIxLTI0LjYxLTE0LjA1LTM3Ljg3LTIwLjM1LTguOTEgNS41OS0xNS43OCAxMy43Ni0xOS42OSAyMy4zOSA4LjY5IDExLjMxIDE3Ljc4IDIxLjkyIDI3LjExIDMxLjg4LTUuODYgMi41Ni0xNy4wNiA1LjM5LTMzLjI0IDAuNzUtOC40NS02LjU0LTE4LjUxLTEyLjQ2LTMwLjM3LTE2LjdsLTAuMTkgMC4xNWMtMy45NCAzLjAyLTcuMTUgNi44NC05LjQzIDExLjJsLTAuMTEgMC4yMWMxMi44NSAyMC44MiAzMC44NyAzMy43MyA0Ni4yOSA0MS41NSA4LjE4IDEuMjkgMTMuNzggMS4yOSAyMS42Ni0xLjA5eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTMwMS43NCA2MjUuNWMwLjkzIDEuMjcgMC42NiAzLjI4LTcuNzkgNC44MS0wLjExIDAuMDItMC4wOSAwLjE4IDAuMDIgMC4xOCA0LjYxLTAuMzMgMTYuNzMtMS41OCA4LjE2LTUuNDQtMC4yOS0wLjEzLTAuNTggMC4yLTAuMzkgMC40NXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20yMDIuMDYgNjM0LjI3YzEwLjUyIDMuNTcgNDIuOTQgMTEuOTUgOTcuMDkgMy4xOCAwLjM3LTAuMDYgMC40OSAwLjQ4IDAuMTIgMC41Ny0xNi41NSA0LjA5LTYzLjMgMTMuMjctOTcuMzktMy4zMS0wLjI3LTAuMTMtMC4xMS0wLjU0IDAuMTgtMC40NHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20yMDguMzkgNjQyLjM0YzcuOTQgMi45OCAyOS43OSA5LjA1IDY2LjI4IDMuNzQgMC4zLTAuMDQgMC4zOCAwLjM5IDAuMDkgMC40Ni0xMy4xOCAyLjk3LTQ3LjU2IDkuMDEtNjYuNzYtMy40My0wLjQzLTAuMjgtMC4wOS0wLjk1IDAuMzktMC43N3onXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMzkuODYgNjM2LjMxczQ4LjU5IDMuMTEgNDUuMzUtMy4wM2MwIDAgOS41MyA5LjIzLTQ1LjM1IDMuMDN6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTN9XG4gICAgICAgICAgZD0nbTE4OC42MSA0OTIuMDlzNi43NiAxLjM3IDExLjYyIDUuMTEgNy41MiA1LjgyIDExLjQ2IDYuNTJjMy45NCAwLjY5IDkuMzQgNC4xNiAxMS43IDguMDRzNS41NSA4LjgzIDguODcgMTAuMDMgNi43OSA0LjQ2IDcuNzYgNy42OCAwLjQyIDUuMDMgNC41OCA4LjQ5YzQuMTYgMy40NyA3LjYzIDUuODIgNy43NiA4LjA0czYuMzggOC4yMSA2LjM4IDguMjEtOS4xLTI0LjctMzQuNS00NS41YzAgMC0xNi45My0xMy44NS0zMy4wOS0xOC43OGwtMi41NCAyLjE2eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEzfVxuICAgICAgICAgIGQ9J20xNzIuNDkgNTM5LjU0czY5LjEgMzEuMjMgMTIwLjYyIDgzLjMyYzAgMCAyLjQyIDMuMjEtMS4zMyA0LjE0cy0xMC41Ni04LjI3LTEyLjk5LTEwLjg4LTcuODQtMy4wOC0xMi4zMS00Ljg1Yy0yLjI3LTAuOS05Ljc5LTguMDktMTMuODQtMTMuMDMtNC4wNC00Ljk0LTE3LjczLTcuOTgtMjEuNzQtMTMuNXMtMy4wMS04LjUyLTkuNTMtOS4wM2MtNi41Mi0wLjUtMTEuNTMtOS4xNS0xNS4yOS0xMS4yOHMtOC4yNy03Ljc3LTE0LjQyLTkuMTUtMTIuMjktMTAuMDMtMTQuNTQtMTAuNTMtNC42My01LjIxLTQuNjMtNS4yMXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxM31cbiAgICAgICAgICBkPSdtMTE2LjMxIDU3OC44NnMzNi4yNyAxMC40OCA2MS4xMyA1MS42MmwtMi45MSAwLjQycy01LjQ0LTIuMTktNS40NC01LjU3LTAuMzUtNC44LTIuNzYtNy4xMS04LjktNC4yNy05LjY1LTYuOTEtNC4yNi01Ljg4LTcuMDItNS43Ni02LjM5LTIuNzctOC4wMi01Ljc4LTIuMzgtNS44OS01Ljc3LTYuNzdjLTMuMzgtMC44OC01LjI2LTQuNzYtNy4xNS01Ljc3LTEuODgtMS0zLjYyLTIuMzgtNy4yLTMuMjYtMy41Ny0wLjktNS4yMS01LjExLTUuMjEtNS4xMXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxMX1cbiAgICAgICAgICBkPSdtMjA4LjA3IDUzMS4wMXMxMi40NCA3LjYxIDIzLjgyIDE0LjI1YzIuOTcgMS43MyA3LjI3IDExLjY3IDcuMjcgMTEuNjdzLTguNTEtNS40NS0xMS4wNy05LjE0Yy0yLjU3LTMuNy01Ljk2LTIuNDYtOS41NS01LjI0LTMuNTktMi43Ny01LjUzLTMuNjktNy41NC0zLjU5bC0yLjkzLTcuOTV6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0M31cbiAgICAgICAgICBkPSdtMTc5LjkxIDU5NC44MXMyMC4zOSAyMi41NSAzNi4zNyAzNC43OGMwIDAtNi4yLTAuMTktMTMuMDEtMS4yNS0yLjA4LTAuMzItMy45LTEuMjgtNS40MS0yLjQ1LTIuOTktMi4zMS01LjAyLTUuNjYtNS44LTkuMzUtMC43Mi0zLjQtMi42MS04LjkxLTcuNDctMTEuNjctNy4zNC00LjE2LTQuNjgtMTAuMDYtNC42OC0xMC4wNnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxMX1cbiAgICAgICAgICBkPSdtMjAwLjIyIDQ5My41cy02Ljk2IDEuNDYtMTQuMjEgMTUuMTJsMS40NSAxLjk0czQuODctMTEuMjUgMTQuOC0xNi4wNmwtMi4wNC0xeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xOTYuOTUgNDk1LjEyYzAuNzEgMC4zNyAxLjQyIDAuNzkgMi4xMSAxLjI1IDEtMC42OSAyLjA3LTEuMzMgMy4yLTEuODhsLTIuMDMtMC45OWMtMC4wMSAwLTEuMjcgMC4yNi0zLjI4IDEuNjJ6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTF9XG4gICAgICAgICAgZD0nbTExMy44NSA2MDAuNzVzMi43MS0xMi4wMSAxNS4xNS0xNi40NmwyLjQ1IDEuMzJzLTkuOTMgMi42OC0xNS45NiAxNy4xNWwtMS42NC0yLjAxeidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xMzEuNjIgNTg1LjYxYy0wLjAzLTAuMDItMC4wNi0wLjAzLTAuMDgtMC4wNWwtMi4zNy0xLjI3Yy0xLjA5IDAuMzktMi4xMSAwLjg0LTMuMDUgMS4zNCAwLjg5IDAuNDcgMS42NSAwLjk1IDIuNDEgMS4zOCAxLjg0LTEuMDYgMy4wNy0xLjQgMy4wOS0xLjR6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MTF9XG4gICAgICAgICAgZD0nbTE2MC45NCA1NzMuMThzNy4yNS0xOC44NSAyNC45Ni0yNy4wMWwtNS41My0yLjg5LTcuODgtMy43NHMtMTQuNzIgOC4yNy0xOS42OSAyMy4zOWw4LjE0IDEwLjI1eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDEyfVxuICAgICAgICAgIGQ9J20xNzcuNCA1NDQuNzNjMC45MyAwLjIxIDIuNTIgMS44IDQuNSAzLjcgMS4zNS0wLjgzIDIuNzctMS42IDQuMjctMi4yOS0zLjY3LTEuOTEtNi43LTMuNDItOC45NC00LjUxbC00LjQ3LTIuMTJzMi4zOCA0LjcyIDQuNjQgNS4yMnonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17YHVybCgjJHthfSlgfVxuICAgICAgICAgIGQ9J20xMDQ3LjcgMzYwLjg5aDAuNjhsMi44Ni00MC41M2MwLjEyLTEuNzQgMC4wMS0zLjQ5LTAuMzEtNS4yMS0wLjM1LTEuODctMC42Mi00Ljg5IDAuMDQtOC41NyAxLjE0LTYuMzEgMS42OS0xOC4wMSAxLjI1LTIxLjk5LTAuMzItMi44OS0wLjg3LTcuOTMtMS4xNC0xMC40NC0wLjExLTEuMDEgMC0yLjAzIDAuMzItMi45OWwwLjY3LTIuMDNjMC4zMi0wLjk4IDAuMzEtMi4wNi0wLjEyLTMuMDEtMC4wMy0wLjA3LTAuMDYtMC4xNC0wLjEtMC4yMS0wLjI3LTAuNTItMC4zNy0xLjExLTAuMzQtMS43bDAuMTktNC4yOGMwLjAyLTAuNDctMC4wMi0wLjkzLTAuMTQtMS4zOGwtMC40Ny0xLjkxYy0wLjE1LTAuNjItMC4xNy0xLjI3LTAuMDYtMS45bDAuNTMtMi44N2MwLjE0LTAuNzYgMC0xLjU1LTAuNC0yLjIxbC0wLjI0LTAuNGMtMC41OC0wLjk4LTAuODItMi4xMi0wLjY3LTMuMjVsMC4xNy0xLjMzYzAuMDctMC41Mi0wLjAzLTEuMDQtMC4yNy0xLjVsLTAuNjUtMS4yMmMtMC41Ny0xLjA4LTAuNzYtMi4zMi0wLjUyLTMuNTJsMC40Ny0yLjRjMC4xMy0wLjY3IDAuMDctMS4zNy0wLjE2LTIuMDFsLTAuMzMtMC44OGMtMC4zMy0wLjg5LTAuNDgtMS44NC0wLjQzLTIuNzlsMC4yMy00LjYxYzAuMDUtMS4wMi0wLjI1LTIuMDItMC44NS0yLjg0LTAuNjQtMC44Ny0wLjc2LTItMC4zNC0yLjk5IDAuMzUtMC44MSAwLjI4LTEuNzQtMC4xOC0yLjQ5bC0wLjU0LTAuODdjLTAuMzYtMC41OC0wLjQtMS4zLTAuMTItMS45MmwwLjY2LTEuNDNjMC4yOS0wLjY0IDAuMjktMS4zNy0wLjAyLTJsLTEuNjQtMy40MS00LjE0LTAuOTggMi4xOSA0Ljc2YzAuMzYgMC43OSAwLjI2IDEuNzItMC4yNyAyLjQxLTAuNDUgMC41OC0wLjU0IDEuMzYtMC4yNSAyLjA0bDEuMDYgMi40NWMwLjI0IDAuNTYgMC4yOSAxLjE4IDAuMTMgMS43N2wtMC4zNyAxLjM3Yy0wLjIzIDAuODctMC4wNyAxLjggMC40NSAyLjUzbDAuMDMgMC4wNGMwLjU4IDAuODEgMC44NiAxLjc5IDAuODEgMi43OWwtMC4xNSAyLjkxYy0wLjA3IDEuMzIgMC4yNSAyLjY0IDAuOSAzLjc5bDAuNDYgMC44MmMwLjM3IDAuNjYgMC4zNiAxLjQ2LTAuMDQgMi4xLTAuNDkgMC44LTAuNjYgMS43Ni0wLjQ1IDIuNjhsMS4xOCA1LjI4YzAuMTYgMC43IDAuMTIgMS40My0wLjEgMi4xMS0wLjE0IDAuNDItMC4xNCAwLjg4IDAgMS4zIDAuNDkgMS41IDEuNjQgNS4wNiAxLjY0IDUuMDZsLTAuMTQgMy43MmMtMC4wMiAwLjQ1IDAuMDkgMC45IDAuMyAxLjMgMC41NiAxLjA0IDAuNjUgMi4yNiAwLjI3IDMuMzdsLTAuMTIgMC4zM2MtMC4xNyAwLjUtMC4yMiAxLjAzLTAuMTUgMS41NWwwLjI1IDEuNzdjMC4wNSAwLjMyIDAuMDUgMC42NSAwLjAxIDAuOTdsLTAuNTcgNC40NGMtMC4xMiAwLjk1LTAuMDUgMS45MSAwLjIgMi44MyAwLjg4IDMuMjIgMi44NyAxMS43NyAyLjAxIDIwLjMybC0xLjc5IDE2LjI5Yy0wLjE1IDEuMzYtMC4wNiAyLjczIDAuMjcgNC4wNmwwLjIzIDAuOTJjMC40OSAyIDAuNjkgNC4wNSAwLjU4IDYuMTFsLTAuMzggNy4yNC0xLjAzIDE5LjY1LTEuMDUgMTIuOTl6J1xuICAgICAgICAvPlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIGZpbGw9e3N0M31cbiAgICAgICAgICBwb2ludHM9JzEwNDUuMyAyMzAuNTUgMTA0NyAyMjYuNDIgMTA0OC42IDIyOS41IDEwNDkuNiAyMTkuNDMgMTA0NC41IDIyMC4yNCdcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDE5fVxuICAgICAgICAgIGQ9J20xMDQzLjYgMTgwLjk3bC0wLjQzIDYuMDZjLTAuMDIgMC4zMy0wLjQ5IDAuMzctMC41NyAwLjA1bC0wLjItMC44NGMtMC4wNi0wLjI2LTAuNDUtMC4yMi0wLjQ1IDAuMDV2NC45NGMwIDAuMjktMC40IDAuMzgtMC41MiAwLjExbC0zLjI5LTcuN2MtMC4xMy0wLjMtMC41OC0wLjE2LTAuNTIgMC4xNmwxLjYgNy45MmMwLjA2IDAuMy0wLjM0IDAuNDUtMC41IDAuMmwtMy40MS01LjU3Yy0wLjE3LTAuMjgtMC41OS0wLjA4LTAuNDkgMC4yM2wyLjAyIDUuODJjMC4xIDAuMjktMC4yOCAwLjUtMC40NyAwLjI2bC01LjEzLTYuNDRjLTAuMi0wLjI1LTAuNTktMC4wMS0wLjQ2IDAuMjhsMi42NiA2LjEyYzAuMTIgMC4yNy0wLjIzIDAuNTEtMC40NCAwLjNsLTUuNjQtNS41NWMtMC4yNC0wLjIzLTAuNjEgMC4wOC0wLjQxIDAuMzVsNC45NCA2Ljc2YzAuMTcgMC4yNC0wLjEgMC41NC0wLjM1IDAuMzlsLTAuNzQtMC40M2MtMC4yOC0wLjE2LTAuNTYgMC4yLTAuMzQgMC40M2wyLjI0IDIuMzdjMC4yMSAwLjIyLTAuMDQgMC41OC0wLjMyIDAuNDRsLTUuNS0yLjYyYy0wLjI5LTAuMTQtMC41NSAwLjI1LTAuMyAwLjQ2bDQuOSA0LjJjMC4yMyAwLjIgMC4wMiAwLjU3LTAuMjcgMC40OGwtNy45NC0yLjVjLTAuMzItMC4xLTAuNTEgMC4zNS0wLjIyIDAuNTFsNS42NiAzLjA4YzAuMjUgMC4xNCAwLjE2IDAuNTItMC4xMyAwLjUyaC04LjAzYy0wLjMyIDAtMC4zOSAwLjQ1LTAuMDkgMC41NGw0Ljk3IDEuNmMwLjMgMC4xIDAuMjMgMC41NC0wLjA5IDAuNTRoLTAuMzhjLTAuMzEgMC0wLjM5IDAuNDQtMC4wOSAwLjU0bDQuOTcgMS43N2MwLjM4IDAuMTMgMC4zMyAwLjY5LTAuMDcgMC43NWwtNS4xMiAwLjc3Yy0wLjQ1IDAuMDctMC40MyAwLjczIDAuMDIgMC43N2w0LjM5IDAuMzljMC4zOSAwLjA0IDAuNDkgMC41NyAwLjEzIDAuNzNsLTYuNzcgMy4xOGMtMC40MSAwLjE5LTAuMjEgMC44MiAwLjI0IDAuNzNsNy4wMi0xLjM3YzAuNC0wLjA4IDAuNjMgMC40NCAwLjMxIDAuNjlsLTIuMzYgMS44MWMtMC4zNSAwLjI3LTAuMDQgMC44MyAwLjM3IDAuNjdsNC45NS0xLjljMC4zNC0wLjEzIDAuNjIgMC4yOCAwLjM5IDAuNTVsLTYuODUgNy44NWMtMC4yNiAwLjMgMC4xIDAuNzMgMC40NCAwLjUybDguNTQtNS4yNmMwLjMtMC4xOSAwLjY1IDAuMTQgMC40OSAwLjQ2bC0zLjA5IDUuODdjLTAuMTkgMC4zNyAwLjMxIDAuNzEgMC41OCAwLjM4bDQuMDItNC44NWMwLjI0LTAuMjggMC42OS0wLjA1IDAuNiAwLjMxbC0xLjE5IDQuNzdjLTAuMSAwLjM5IDAuNDMgMC42MSAwLjY0IDAuMjZsMi4yOC0zLjkxYzAuMTgtMC4zMSAwLjY1LTAuMTggMC42NSAwLjE4bC0wLjEgOS4yOGMwIDAuNCAwLjU2IDAuNDkgMC42OCAwLjExbDIuMy03LjI0YzAuMTEtMC4zNiAwLjY0LTAuMzEgMC42OCAwLjA3bDAuMjQgMi4xOGMwLjA0IDAuMzkgMC41OSAwLjQyIDAuNjggMC4wNGwxLjA3LTQuNTNjMC4wOC0wLjMzIDAuNTQtMC4zNiAwLjY2LTAuMDVsMy41NCA5LjFjMC4xNiAwLjQyIDAuNzkgMC4yNyAwLjc1LTAuMThsLTAuNjUtNi40OGMtMC4wNC0wLjQgMC40Ny0wLjU5IDAuNy0wLjI2bDEuNDEgMS45OGMwLjIyIDAuMzEgMC43IDAuMTUgMC43LTAuMjJ2LTEuMjJjMC0wLjM5IDAuNTEtMC41NCAwLjcyLTAuMjFsMy43OCA1Ljk1YzAuMjUgMC40IDAuODYgMC4wOSAwLjY5LTAuMzVsLTMuMzgtOC43NWMtMC4xMi0wLjMgMC4yNS0wLjU2IDAuNDktMC4zNGwyLjc3IDIuNDljMC4yNiAwLjI0IDAuNjUtMC4wOCAwLjQ3LTAuMzlsLTEuODItMy4wNGMtMC4xNy0wLjI5IDAuMTctMC42IDAuNDQtMC40MWw2Ljk4IDQuOTZjMC4zIDAuMjEgMC42NS0wLjE4IDAuNDEtMC40NWwtNC43Ny01LjU2Yy0wLjIxLTAuMjUgMC4wNi0wLjYxIDAuMzYtMC40OGw3LjM3IDMuMTljMC4zMyAwLjE0IDAuNi0wLjMxIDAuMzEtMC41M2wtNy4xNS01LjQ1Yy0wLjI2LTAuMi0wLjA3LTAuNjEgMC4yNS0wLjU1bDMuNjcgMC43OGMwLjM1IDAuMDcgMC41Mi0wLjQgMC4yMS0wLjU3bC00LjI1LTIuMzdjLTAuMjUtMC4xNC0wLjE0LTAuNTIgMC4xNC0wLjUxbDExLjU3IDAuMzJjMC4zMiAwLjAxIDAuMzktMC40NCAwLjA4LTAuNTNsLTEyLjc1LTMuNjdjLTAuMjctMC4wOC0wLjI2LTAuNDcgMC4wMi0wLjUzbDUuNDQtMS4wNmMwLjMyLTAuMDYgMC4yOC0wLjU0LTAuMDUtMC41NGgtMC4zOWMtMC4zIDAtMC4zOC0wLjQxLTAuMS0wLjUybDQuMjEtMS43NGMwLjUyLTAuMjEgMC4zMy0wLjk5LTAuMjItMC45NWwtNi4yIDAuNDZjLTAuNDkgMC4wNC0wLjcyLTAuNTgtMC4zNC0wLjg4bDUuOTUtNC42MWMwLjQ0LTAuMzQgMC4wNy0xLjAzLTAuNDYtMC44NWwtNC4yMiAxLjQzYy0wLjUgMC4xNy0wLjg4LTAuNDYtMC40OS0wLjgybDAuOTQtMC44OGMwLjI1LTAuMjQtMC4wMy0wLjY0LTAuMzQtMC40OGwtNC4zIDIuMjNjLTAuMjkgMC4xNS0wLjU3LTAuMjEtMC4zNi0wLjQ1bDYuNzUtNy45NmMwLjIyLTAuMjYtMC4xLTAuNjMtMC4zOS0wLjQ0bC04Ljc2IDUuNjdjLTAuMjYgMC4xNy0wLjU3LTAuMTItMC40Mi0wLjM5bDQuNjUtOC40YzAuMTUtMC4yNy0wLjIxLTAuNTQtMC40My0wLjMybC00LjM1IDQuNDRjLTAuMjEgMC4yMS0wLjU2LTAuMDItMC40NC0wLjI5bDMtNy4xMWMwLjEzLTAuMy0wLjI5LTAuNTMtMC40Ny0wLjI1bC01LjM1IDguMTljLTAuNDggMC43NC0xLjYzIDAuMzMtMS41NC0wLjU1bDAuNTctNS42MmMwLjA1LTAuNDctMC42MS0wLjY0LTAuNzktMC4ybC0yLjc3IDYuNzNjLTAuMDggMC4xOC0wLjM1IDAuMTQtMC4zNi0wLjA2bC0wLjE4LTQuOTdjLTAuMDEtMC4yNS0wLjM2LTAuMjgtMC40Mi0wLjA0bC0wLjY0IDIuNzJjLTAuMTEgMC40NS0wLjc2IDAuNDMtMC44NC0wLjAzbC0xLjIyLTcuMjRjLTAuMDQtMC41MS0wLjc1LTAuNDgtMC43OSAwLjAyeidcbiAgICAgICAgLz5cbiAgICAgICAgPGNpcmNsZSBmaWxsPXtzdDN9IGN4PXsxMDQ1Ljl9IGN5PXsyMTIuNn0gcj17Mi4wMn0gLz5cbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBmaWxsPXtzdDN9XG4gICAgICAgICAgcG9pbnRzPScxMDQ3LjIgMjA5LjIgMTA0NC42IDIwOS4yIDEwNDMuOSAxOTUuNzEgMTA0Ny45IDE5NS43MSdcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEyODIuNyA2NTQuMDdjMC4wNCAwLjA3IDAuMTEgMC4xNCAwLjIgMC4yMS0wLjI2LTAuMzUtMC4zOC0wLjUtMC4yLTAuMjF6J1xuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGZpbGw9e3N0MX1cbiAgICAgICAgICBkPSdtMTMxNy4yIDY0Ni43NmMwLjA1IDAuMDggMC4xMiAwLjE1IDAuMjIgMC4yNC0wLjI5LTAuNC0wLjQzLTAuNTctMC4yMi0wLjI0eidcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPXtzdDF9XG4gICAgICAgICAgZD0nbTEyNDIuOSA2NjYuMTJjMC4wNiAwLjA1IDAuMTUgMC4xIDAuMjUgMC4xNC0wLjM1LTAuMjUtMC41Mi0wLjM1LTAuMjUtMC4xNHonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMzczLjggNjYxLjE5YzAuMDQgMC4wNyAwLjExIDAuMTQgMC4yIDAuMjEtMC4yNi0wLjM1LTAuMzgtMC41MS0wLjItMC4yMXonXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbD17c3QxfVxuICAgICAgICAgIGQ9J20xMzM0IDY3My4yNGMwLjA2IDAuMDUgMC4xNSAwLjEgMC4yNSAwLjE0LTAuMzUtMC4yNS0wLjUxLTAuMzYtMC4yNS0wLjE0eidcbiAgICAgICAgLz5cbiAgICAgIDwvZz5cbiAgICA8L3N2Zz5cbiAgKTtcbn07XG4iLCJpbXBvcnQgdHlwZSB7IFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgY29uc3QgdXNlRGlhbG9nID0gKFxuICB2aXNpYmxlOiBib29sZWFuLFxuICBvbkNsb3NlID0gKCk6IHZvaWQgPT4gdW5kZWZpbmVkXG4pOiBSZWY8SFRNTERpYWxvZ0VsZW1lbnQ+ID0+IHtcbiAgY29uc3QgZGlhbG9nUmVmID0gdXNlUmVmPEhUTUxEaWFsb2dFbGVtZW50PihudWxsKTtcbiAgY29uc3Qgb25DbG9zZVJlZiA9IHVzZVJlZjwoKSA9PiB2b2lkPigpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgb25DbG9zZVJlZi5jdXJyZW50ID0gb25DbG9zZTtcbiAgfSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkaWFsb2cgPSBkaWFsb2dSZWYuY3VycmVudDtcbiAgICBjb25zdCBvbkNsb3NlID0gb25DbG9zZVJlZi5jdXJyZW50O1xuXG4gICAgaWYgKCFkaWFsb2cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXZpc2libGUpIHtcbiAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcblxuICAgIGRpYWxvZy5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICBvbkNsb3NlPy4oKTtcbiAgICB9O1xuXG4gICAgZGlhbG9nLm9uY2xpY2sgPSAoeyBjbGllbnRYLCBjbGllbnRZIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0IH0gPSBkaWFsb2cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCBpc0luRGlhbG9nID1cbiAgICAgICAgdG9wIDw9IGNsaWVudFkgJiZcbiAgICAgICAgY2xpZW50WSA8PSB0b3AgKyBoZWlnaHQgJiZcbiAgICAgICAgbGVmdCA8PSBjbGllbnRYICYmXG4gICAgICAgIGNsaWVudFggPD0gbGVmdCArIHdpZHRoO1xuICAgICAgaWYgKCFpc0luRGlhbG9nKSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH07XG4gIH0sIFt2aXNpYmxlXSk7XG5cbiAgcmV0dXJuIGRpYWxvZ1JlZjtcbn07XG4iLCJpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5cbmV4cG9ydCBjb25zdCBXcmFwcGVyID0gc3R5bGVkLmRpYWxvZ2BcbiAgei1pbmRleDogMTAwMDtcbiAgdG9wOiAwO1xuICBib3R0b206IDA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGN1cnNvcjogZGVmYXVsdDtcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gIGJvcmRlcjogMDtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIG1heC1oZWlnaHQ6IDkwdmg7XG5cbiAgJjpub3QoW29wZW5dKSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuYDtcbiIsImltcG9ydCB7IFNjcm9sbGFibGUsIFRpbGUgfSBmcm9tICdAcm9ja2V0LmNoYXQvZnVzZWxhZ2UnO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4vaG9va3MnO1xuaW1wb3J0IHsgV3JhcHBlciB9IGZyb20gJy4vc3R5bGVzJztcblxudHlwZSBEaWFsb2dQcm9wcyA9IHtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG4gIGlzVmlzaWJsZT86IGJvb2xlYW47XG4gIG9uQ2xvc2U/OiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGNvbnN0IERpYWxvZyA9ICh7XG4gIGNoaWxkcmVuLFxuICBpc1Zpc2libGUgPSBmYWxzZSxcbiAgb25DbG9zZSxcbn06IERpYWxvZ1Byb3BzKSA9PiB7XG4gIGNvbnN0IGRpYWxvZ1JlZiA9IHVzZURpYWxvZyhpc1Zpc2libGUsIG9uQ2xvc2UpO1xuXG4gIHJldHVybiAoXG4gICAgPFdyYXBwZXIgcmVmPXtkaWFsb2dSZWZ9PlxuICAgICAgPFNjcm9sbGFibGU+XG4gICAgICAgIDxUaWxlIGVsZXZhdGlvbj0nMicgcGFkZGluZz0neDMyJyBkaXNwbGF5PSdmbGV4JyBmbGV4RGlyZWN0aW9uPSdjb2x1bW4nPlxuICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPC9UaWxlPlxuICAgICAgPC9TY3JvbGxhYmxlPlxuICAgIDwvV3JhcHBlcj5cbiAgKTtcbn07XG4iLCJpbXBvcnQge1xuICBCb3gsXG4gIEJ1dHRvbixcbiAgQ2FsbG91dCxcbiAgTGFiZWwsXG4gIFRhYnMsXG4gIFNjcm9sbGFibGUsXG4gIFBhbGV0dGVTdHlsZVRhZyxcbn0gZnJvbSAnQHJvY2tldC5jaGF0L2Z1c2VsYWdlJztcbmltcG9ydCB0eXBlIHtcbiAgRGVza3RvcENhcHR1cmVyLFxuICBEZXNrdG9wQ2FwdHVyZXJTb3VyY2UsXG4gIFNvdXJjZXNPcHRpb25zLFxufSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdyZWFjdC1pMThuZXh0JztcblxuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnLi4vdWkvY29tcG9uZW50cy9EaWFsb2cnO1xuXG5jb25zdCBkZXNrdG9wQ2FwdHVyZXI6IERlc2t0b3BDYXB0dXJlciA9IHtcbiAgZ2V0U291cmNlczogKG9wdHM6IFNvdXJjZXNPcHRpb25zKSA9PlxuICAgIGlwY1JlbmRlcmVyLmludm9rZSgnZGVza3RvcC1jYXB0dXJlci1nZXQtc291cmNlcycsIFtvcHRzXSksXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuU2hhcmVQaWNrZXIoKSB7XG4gIGNvbnN0IHsgdCB9ID0gdXNlVHJhbnNsYXRpb24oKTtcbiAgY29uc3QgW3Zpc2libGUsIHNldFZpc2libGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc291cmNlcywgc2V0U291cmNlc10gPSB1c2VTdGF0ZTxEZXNrdG9wQ2FwdHVyZXJTb3VyY2VbXT4oW10pO1xuICBjb25zdCBbY3VycmVudFRhYiwgc2V0Q3VycmVudFRhYl0gPSB1c2VTdGF0ZTwnc2NyZWVuJyB8ICd3aW5kb3cnPignc2NyZWVuJyk7XG4gIGNvbnN0IFtzZWxlY3RlZFNvdXJjZUlkLCBzZXRTZWxlY3RlZFNvdXJjZUlkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbXG4gICAgaXNTY3JlZW5SZWNvcmRpbmdQZXJtaXNzaW9uR3JhbnRlZCxcbiAgICBzZXRJc1NjcmVlblJlY29yZGluZ1Blcm1pc3Npb25HcmFudGVkLFxuICBdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGZldGNoU291cmNlcyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc291cmNlcyA9IGF3YWl0IGRlc2t0b3BDYXB0dXJlci5nZXRTb3VyY2VzKHtcbiAgICAgICAgdHlwZXM6IFsnd2luZG93JywgJ3NjcmVlbiddLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbHRlciBvdXQgc291cmNlcyB0aGF0IGFyZSBub3QgY2FwdHVyYWJsZVxuICAgICAgY29uc3QgZmlsdGVyZWRTb3VyY2VzID0gc291cmNlc1xuICAgICAgICAuZmlsdGVyKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAvLyBPbmx5IGNoZWNrIGZvciBiYXNpYyB2YWxpZGl0eSAtIHRodW1ibmFpbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgZG9uZSBieSBJUEMgaGFuZGxlclxuICAgICAgICAgIGlmICghc291cmNlLm5hbWUgfHwgc291cmNlLm5hbWUudHJpbSgpID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSk7XG5cbiAgICAgIHNldFNvdXJjZXMoZmlsdGVyZWRTb3VyY2VzKTtcblxuICAgICAgLy8gSWYgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzb3VyY2UgaXMgbm8gbG9uZ2VyIGF2YWlsYWJsZSwgY2xlYXIgdGhlIHNlbGVjdGlvblxuICAgICAgaWYgKFxuICAgICAgICBzZWxlY3RlZFNvdXJjZUlkICYmXG4gICAgICAgICFmaWx0ZXJlZFNvdXJjZXMuZmluZCgocykgPT4gcy5pZCA9PT0gc2VsZWN0ZWRTb3VyY2VJZClcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAnUHJldmlvdXNseSBzZWxlY3RlZCBzb3VyY2Ugbm8gbG9uZ2VyIGF2YWlsYWJsZSwgY2xlYXJpbmcgc2VsZWN0aW9uJ1xuICAgICAgICApO1xuICAgICAgICBzZXRTZWxlY3RlZFNvdXJjZUlkKG51bGwpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBzY3JlZW4gc2hhcmluZyBzb3VyY2VzOicsIGVycm9yKTtcbiAgICAgIHNldFNvdXJjZXMoW10pO1xuICAgIH1cbiAgfSwgW3NlbGVjdGVkU291cmNlSWRdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrU2NyZWVuUmVjb3JkaW5nUGVybWlzc2lvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGlwY1JlbmRlcmVyLmludm9rZShcbiAgICAgICAgJ3ZpZGVvLWNhbGwtd2luZG93L3NjcmVlbi1yZWNvcmRpbmctaXMtcGVybWlzc2lvbi1ncmFudGVkJ1xuICAgICAgKTtcbiAgICAgIHNldElzU2NyZWVuUmVjb3JkaW5nUGVybWlzc2lvbkdyYW50ZWQocmVzdWx0KTtcbiAgICB9O1xuXG4gICAgY2hlY2tTY3JlZW5SZWNvcmRpbmdQZXJtaXNzaW9uKCkuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gIH0sIFt2aXNpYmxlXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBmZXRjaFNvdXJjZXMoKTtcbiAgfSwgW2ZldGNoU291cmNlc10pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaXBjUmVuZGVyZXIub24oJ3ZpZGVvLWNhbGwtd2luZG93L29wZW4tc2NyZWVuLXBpY2tlcicsICgpID0+IHtcbiAgICAgIHNldFZpc2libGUodHJ1ZSk7XG4gICAgfSk7XG4gIH0sIFt2aXNpYmxlXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXZpc2libGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBmZXRjaFNvdXJjZXMoKTtcbiAgICB9LCAzMDAwKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICB9O1xuICB9LCBbdmlzaWJsZSwgZmV0Y2hTb3VyY2VzXSk7XG5cbiAgY29uc3QgaGFuZGxlU2NyZWVuU2hhcmluZ1NvdXJjZUNsaWNrID0gKGlkOiBzdHJpbmcpID0+ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZFNvdXJjZUlkKGlkKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVTaGFyZSA9ICgpOiB2b2lkID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VJZCkge1xuICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgc2VsZWN0ZWQgc291cmNlIHN0aWxsIGV4aXN0cyBpbiBvdXIgY3VycmVudCBzb3VyY2VzIGxpc3RcbiAgICAgIGNvbnN0IHNlbGVjdGVkU291cmNlID0gc291cmNlcy5maW5kKChzKSA9PiBzLmlkID09PSBzZWxlY3RlZFNvdXJjZUlkKTtcblxuICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTZWxlY3RlZCBzb3VyY2Ugbm8gbG9uZ2VyIGF2YWlsYWJsZTonLCBzZWxlY3RlZFNvdXJjZUlkKTtcbiAgICAgICAgLy8gUmVmcmVzaCBzb3VyY2VzIGFuZCBjbGVhciBzZWxlY3Rpb25cbiAgICAgICAgZmV0Y2hTb3VyY2VzKCk7XG4gICAgICAgIHNldFNlbGVjdGVkU291cmNlSWQobnVsbCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkaXRpb25hbCB2YWxpZGF0aW9uIGJlZm9yZSBzaGFyaW5nXG4gICAgICBpZiAoc2VsZWN0ZWRTb3VyY2UudGh1bWJuYWlsLmlzRW1wdHkoKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICdTZWxlY3RlZCBzb3VyY2UgaGFzIGVtcHR5IHRodW1ibmFpbCwgY2Fubm90IHNoYXJlOicsXG4gICAgICAgICAgc2VsZWN0ZWRTb3VyY2VJZFxuICAgICAgICApO1xuICAgICAgICBzZXRTZWxlY3RlZFNvdXJjZUlkKG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCdTaGFyaW5nIHNjcmVlbiBzb3VyY2U6Jywge1xuICAgICAgICBpZDogc2VsZWN0ZWRTb3VyY2UuaWQsXG4gICAgICAgIG5hbWU6IHNlbGVjdGVkU291cmNlLm5hbWUsXG4gICAgICB9KTtcblxuICAgICAgc2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICBpcGNSZW5kZXJlci5zZW5kKFxuICAgICAgICAndmlkZW8tY2FsbC13aW5kb3cvc2NyZWVuLXNoYXJpbmctc291cmNlLXJlc3BvbmRlZCcsXG4gICAgICAgIHNlbGVjdGVkU291cmNlSWRcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUNsb3NlID0gKCk6IHZvaWQgPT4ge1xuICAgIHNldFZpc2libGUoZmFsc2UpO1xuICAgIGlwY1JlbmRlcmVyLnNlbmQoJ3ZpZGVvLWNhbGwtd2luZG93L3NjcmVlbi1zaGFyaW5nLXNvdXJjZS1yZXNwb25kZWQnLCBudWxsKTtcbiAgfTtcblxuICAvLyBGaWx0ZXIgc291cmNlcyBiYXNlZCBvbiB0aGUgY3VycmVudCB0YWJcbiAgY29uc3QgZmlsdGVyZWRTb3VyY2VzID0gc291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4ge1xuICAgIGlmIChjdXJyZW50VGFiID09PSAnc2NyZWVuJykge1xuICAgICAgcmV0dXJuIHNvdXJjZS5pZC5pbmNsdWRlcygnc2NyZWVuJyk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2UuaWQuaW5jbHVkZXMoJ3dpbmRvdycpO1xuICB9KTtcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8UGFsZXR0ZVN0eWxlVGFnIHRoZW1lPSdkYXJrJyBzZWxlY3Rvcj0nOnJvb3QnIC8+XG4gICAgICA8RGlhbG9nIGlzVmlzaWJsZT17dmlzaWJsZX0gb25DbG9zZT17aGFuZGxlQ2xvc2V9PlxuICAgICAgICA8Qm94XG4gICAgICAgICAgd2lkdGg9JzY4MHB4J1xuICAgICAgICAgIG1hcmdpbj0nYXV0bydcbiAgICAgICAgICBkaXNwbGF5PSdmbGV4J1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb249J2NvbHVtbidcbiAgICAgICAgICBoZWlnaHQ9JzU2MHB4J1xuICAgICAgICAgIGJhY2tncm91bmRDb2xvcj0nc3VyZmFjZSdcbiAgICAgICAgICBjb2xvcj0nZGVmYXVsdCdcbiAgICAgICAgPlxuICAgICAgICAgIDxCb3ggbWFyZ2luQmxvY2tFbmQ9J3gxMic+XG4gICAgICAgICAgICA8Qm94IGZvbnRTY2FsZT0naDEnIG1hcmdpbkJsb2NrRW5kPSd4MTInPlxuICAgICAgICAgICAgICB7dCgnc2NyZWVuU2hhcmluZy50aXRsZScpfVxuICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgIDxUYWJzPlxuICAgICAgICAgICAgICA8VGFicy5JdGVtXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e2N1cnJlbnRUYWIgPT09ICdzY3JlZW4nfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEN1cnJlbnRUYWIoJ3NjcmVlbicpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3QoJ3NjcmVlblNoYXJpbmcuZW50aXJlU2NyZWVuJyl9XG4gICAgICAgICAgICAgIDwvVGFicy5JdGVtPlxuICAgICAgICAgICAgICA8VGFicy5JdGVtXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e2N1cnJlbnRUYWIgPT09ICd3aW5kb3cnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEN1cnJlbnRUYWIoJ3dpbmRvdycpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3QoJ3NjcmVlblNoYXJpbmcuYXBwbGljYXRpb25XaW5kb3cnKX1cbiAgICAgICAgICAgICAgPC9UYWJzLkl0ZW0+XG4gICAgICAgICAgICA8L1RhYnM+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPEJveFxuICAgICAgICAgICAgZGlzcGxheT0nZmxleCdcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb249J2NvbHVtbidcbiAgICAgICAgICAgIG92ZXJmbG93PSdoaWRkZW4nXG4gICAgICAgICAgICBtYXJnaW5CbG9ja1N0YXJ0PSd4MTAnXG4gICAgICAgICAgICBtYXJnaW5CbG9ja0VuZD0neDEwJ1xuICAgICAgICAgICAgZmxleEdyb3c9ezF9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgeyFpc1NjcmVlblJlY29yZGluZ1Blcm1pc3Npb25HcmFudGVkID8gKFxuICAgICAgICAgICAgICA8Q2FsbG91dFxuICAgICAgICAgICAgICAgIHRpdGxlPXt0KCdzY3JlZW5TaGFyaW5nLnBlcm1pc3Npb25EZW5pZWQnKX1cbiAgICAgICAgICAgICAgICB0eXBlPSdkYW5nZXInXG4gICAgICAgICAgICAgICAgbWFyZ2luPSd4MzInXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dCgnc2NyZWVuU2hhcmluZy5wZXJtaXNzaW9uUmVxdWlyZWQnKX1cbiAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICB7dCgnc2NyZWVuU2hhcmluZy5wZXJtaXNzaW9uSW5zdHJ1Y3Rpb25zJyl9XG4gICAgICAgICAgICAgIDwvQ2FsbG91dD5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxTY3JvbGxhYmxlIHZlcnRpY2FsPlxuICAgICAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc9J3g4J1xuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLFxuICAgICAgICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCAyMDhweCknLFxuICAgICAgICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7ZmlsdGVyZWRTb3VyY2VzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk9J2ZsZXgnXG4gICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtcz0nY2VudGVyJ1xuICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50PSdjZW50ZXInXG4gICAgICAgICAgICAgICAgICAgICAgd2lkdGg9JzEwMCUnXG4gICAgICAgICAgICAgICAgICAgICAgcD0neDE2J1xuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGdyaWRDb2x1bW46ICcxIC8gLTEnIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8TGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y3VycmVudFRhYiA9PT0gJ3NjcmVlbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0KCdzY3JlZW5TaGFyaW5nLm5vU2NyZWVuc0ZvdW5kJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0KCdzY3JlZW5TaGFyaW5nLm5vV2luZG93c0ZvdW5kJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9MYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFNvdXJjZXMubWFwKCh7IGlkLCBuYW1lLCB0aHVtYm5haWwgfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17aWR9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD0neDIwOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD0neDE3MCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk9J2ZsZXgnXG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uPSdjb2x1bW4nXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVTY3JlZW5TaGFyaW5nU291cmNlQ2xpY2soaWQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYmc9e3NlbGVjdGVkU291cmNlSWQgPT09IGlkID8gJ3NlbGVjdGVkJyA6ICdsaWdodCd9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcj17c2VsZWN0ZWRTb3VyY2VJZCA9PT0gaWQgPyAnc2VsZWN0ZWQnIDogJ2xpZ2h0J31cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcj17XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU291cmNlSWQgPT09IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnMnB4IHNvbGlkIHZhcigtLXJjeC1jb2xvci1zdHJva2UtaGlnaGxpZ2h0KSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICcxcHggc29saWQgdmFyKC0tcmN4LWNvbG9yLXN0cm9rZS1saWdodCknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM9J3gyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yPSdwb2ludGVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdzY3JlZW4tc2hhcmUtdGh1bWJuYWlsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAndmlzaWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmxleEdyb3c9ezF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk9J2ZsZXgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM9J2ZsZXgtc3RhcnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50PSdmbGV4LXN0YXJ0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdz0naGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodDogJzEyMHB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXM9J2ltZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3RodW1ibmFpbC50b0RhdGFVUkwoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e25hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdEZpdDogJ2NvbnRhaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0UG9zaXRpb246ICd0b3AnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHA9J3g0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogJzAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodDogJzAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDAsIDAsIDAsIDAuNSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tkcm9wRmlsdGVyOiAnYmx1cig0cHgpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17bmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMXB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJy13ZWJraXQtYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdlYmtpdExpbmVDbGFtcDogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdlYmtpdEJveE9yaWVudDogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge25hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvTGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgIDwvU2Nyb2xsYWJsZT5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPEJveFxuICAgICAgICAgICAgZGlzcGxheT0nZmxleCdcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJ1xuICAgICAgICAgICAgbWFyZ2luQmxvY2tTdGFydD0nYXV0bydcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUNsb3NlfT57dCgnc2NyZWVuU2hhcmluZy5jYW5jZWwnKX08L0J1dHRvbj5cbiAgICAgICAgICAgIDxCdXR0b24gcHJpbWFyeSBvbkNsaWNrPXtoYW5kbGVTaGFyZX0gZGlzYWJsZWQ9eyFzZWxlY3RlZFNvdXJjZUlkfT5cbiAgICAgICAgICAgICAge3QoJ3NjcmVlblNoYXJpbmcuc2hhcmUnKX1cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvRGlhbG9nPlxuICAgIDwvPlxuICApO1xufVxuIiwiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBCdXR0b25Hcm91cCxcbiAgTWFyZ2lucyxcbiAgVGhyb2JiZXIsXG59IGZyb20gJ0Byb2NrZXQuY2hhdC9mdXNlbGFnZSc7XG5pbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAncmVhY3QtaTE4bmV4dCc7XG5cbmltcG9ydCB7IGludm9rZVdpdGhSZXRyeSB9IGZyb20gJy4uL2lwYy9yZW5kZXJlcic7XG5pbXBvcnQgeyBGYWlsdXJlSW1hZ2UgfSBmcm9tICcuLi91aS9jb21wb25lbnRzL0ZhaWx1cmVJbWFnZSc7XG5pbXBvcnQgeyBTY3JlZW5TaGFyZVBpY2tlciB9IGZyb20gJy4vc2NyZWVuU2hhcmVQaWNrZXInO1xuXG5jb25zdCBNQVhfUkVDT1ZFUllfQVRURU1QVFMgPSAzO1xuY29uc3QgTE9BRElOR19USU1FT1VUX01TID0gMTUwMDA7XG5jb25zdCBMT0FESU5HX1NIT1dfREVMQVkgPSA1MDA7IC8vIERlbGF5IGJlZm9yZSBzaG93aW5nIGxvYWRpbmcgc3Bpbm5lciB0byBwcmV2ZW50IHF1aWNrIGZsYXNoZXNcbmNvbnN0IEVSUk9SX1NIT1dfREVMQVkgPSA4MDA7IC8vIERlbGF5IGJlZm9yZSBzaG93aW5nIGVycm9yIHRvIHByZXZlbnQgZmxpY2tlciBkdXJpbmcgcmV0cmllc1xuXG5jb25zdCBSRUNPVkVSWV9ERUxBWVMgPSB7XG4gIHdlYnZpZXdSZWxvYWQ6IDEwMDAsXG4gIHVybFJlZnJlc2g6IDIwMDAsXG4gIGZ1bGxSZWluaXRpYWxpemU6IDMwMDAsXG59O1xuXG5jb25zdCBSRUNPVkVSWV9TVFJBVEVHSUVTID0ge1xuICB3ZWJ2aWV3UmVsb2FkOiAnV2VidmlldyByZWxvYWQnLFxuICB1cmxSZWZyZXNoOiAnVVJMIHJlZnJlc2gnLFxuICBmdWxsUmVpbml0aWFsaXplOiAnRnVsbCByZWluaXRpYWxpemUnLFxufSBhcyBjb25zdDtcblxuY29uc3QgVmlkZW9DYWxsV2luZG93ID0gKCkgPT4ge1xuICBjb25zdCB7IHQgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cbiAgY29uc3QgW3ZpZGVvQ2FsbFVybCwgc2V0VmlkZW9DYWxsVXJsXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Nob3VsZEF1dG9PcGVuRGV2dG9vbHMsIHNldFNob3VsZEF1dG9PcGVuRGV2dG9vbHNdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaXNGYWlsZWQsIHNldElzRmFpbGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzUmVsb2FkaW5nLCBzZXRJc1JlbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7IC8vIEtlZXAgZm9yIGludGVybmFsIHN0YXRlIGxvZ2ljXG4gIGNvbnN0IFtzaG93TG9hZGluZywgc2V0U2hvd0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpOyAvLyBEZWxheWVkIGxvYWRpbmcgZGlzcGxheVxuICBjb25zdCBbc2hvd0Vycm9yLCBzZXRTaG93RXJyb3JdID0gdXNlU3RhdGUoZmFsc2UpOyAvLyBEZWxheWVkIGVycm9yIGRpc3BsYXlcbiAgY29uc3QgW2Vycm9yTWVzc2FnZSwgc2V0RXJyb3JNZXNzYWdlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbcmVjb3ZlcnlBdHRlbXB0LCBzZXRSZWNvdmVyeUF0dGVtcHRdID0gdXNlU3RhdGUoMCk7XG5cbiAgY29uc3Qgd2Vidmlld1JlZiA9IHVzZVJlZjxhbnk+KG51bGwpO1xuICBjb25zdCBsb2FkaW5nVGltZW91dFJlZiA9IHVzZVJlZjxOb2RlSlMuVGltZW91dCB8IG51bGw+KG51bGwpO1xuICBjb25zdCByZWNvdmVyeVRpbWVvdXRSZWYgPSB1c2VSZWY8Tm9kZUpTLlRpbWVvdXQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgbG9hZGluZ0Rpc3BsYXlUaW1lb3V0UmVmID0gdXNlUmVmPE5vZGVKUy5UaW1lb3V0IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGVycm9yRGlzcGxheVRpbWVvdXRSZWYgPSB1c2VSZWY8Tm9kZUpTLlRpbWVvdXQgfCBudWxsPihudWxsKTtcblxuICBjb25zdCByZXNldFJlY292ZXJ5U3RhdGUgPSAoKTogdm9pZCA9PiB7XG4gICAgc2V0UmVjb3ZlcnlBdHRlbXB0KDApO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gTGlzdGVuIGZvciBVUkwgcmVjZWl2ZWQgZXZlbnRzIGZyb20gYm9vdHN0cmFwXG4gICAgY29uc3QgaGFuZGxlVXJsUmVjZWl2ZWQgPSBhc3luYyAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBjdXN0b21FdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50O1xuICAgICAgY29uc3QgeyB1cmwsIGF1dG9PcGVuRGV2dG9vbHMgfSA9IGN1c3RvbUV2ZW50LmRldGFpbDtcblxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IFJlY2VpdmVkIFVSTCBldmVudDonLFxuICAgICAgICB1cmwsXG4gICAgICAgICdBdXRvLW9wZW4gZGV2dG9vbHM6JyxcbiAgICAgICAgYXV0b09wZW5EZXZ0b29sc1xuICAgICAgKTtcblxuICAgICAgLy8gUmVzZXQgc3RhdGVzIGZvciBuZXcgVVJMXG4gICAgICBzZXRJc0ZhaWxlZChmYWxzZSk7XG4gICAgICBzZXRJc1JlbG9hZGluZyhmYWxzZSk7XG4gICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICBzZXRFcnJvck1lc3NhZ2UobnVsbCk7XG5cbiAgICAgIHNldFZpZGVvQ2FsbFVybCh1cmwpO1xuICAgICAgc2V0U2hvdWxkQXV0b09wZW5EZXZ0b29scyhhdXRvT3BlbkRldnRvb2xzKTtcblxuICAgICAgLy8gQ29uZmlybSBVUkwgcmVjZWl2ZWRcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGludm9rZVdpdGhSZXRyeSgndmlkZW8tY2FsbC13aW5kb3cvdXJsLXJlY2VpdmVkJywge1xuICAgICAgICAgIG1heEF0dGVtcHRzOiAyLFxuICAgICAgICAgIHJldHJ5RGVsYXk6IDUwMCxcbiAgICAgICAgICBsb2dSZXRyaWVzOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogVVJMIHJlY2VpdmVkIGNvbmZpcm1hdGlvbiBhY2tub3dsZWRnZWQgYnkgbWFpbiBwcm9jZXNzJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogRmFpbGVkIHRvIHNlbmQgVVJMIHJlY2VpdmVkIGNvbmZpcm1hdGlvbjonLFxuICAgICAgICAgIGVycm9yXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lciBmb3IgVVJMIGV2ZW50c1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd2aWRlby1jYWxsLXVybC1yZWNlaXZlZCcsIGhhbmRsZVVybFJlY2VpdmVkKTtcblxuICAgIGNvbnN0IGhhbmRsZU9wZW5VcmwgPSBhc3luYyAoXG4gICAgICBfZXZlbnQ6IGFueSxcbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgYXV0b09wZW5EZXZ0b29sczogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogUmVjZWl2ZWQgbmV3IFVSTCB2aWEgSVBDOicsXG4gICAgICAgIHVybCxcbiAgICAgICAgJ0F1dG8tb3BlbiBkZXZ0b29sczonLFxuICAgICAgICBhdXRvT3BlbkRldnRvb2xzXG4gICAgICApO1xuXG4gICAgICAvLyBSZXNldCBzdGF0ZXMgZm9yIG5ldyBVUkxcbiAgICAgIHNldElzRmFpbGVkKGZhbHNlKTtcbiAgICAgIHNldElzUmVsb2FkaW5nKGZhbHNlKTtcbiAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgIHNldEVycm9yTWVzc2FnZShudWxsKTtcblxuICAgICAgc2V0VmlkZW9DYWxsVXJsKHVybCk7XG4gICAgICBzZXRTaG91bGRBdXRvT3BlbkRldnRvb2xzKGF1dG9PcGVuRGV2dG9vbHMpO1xuXG4gICAgICAvLyBDb25maXJtIFVSTCByZWNlaXZlZFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaW52b2tlV2l0aFJldHJ5KCd2aWRlby1jYWxsLXdpbmRvdy91cmwtcmVjZWl2ZWQnLCB7XG4gICAgICAgICAgbWF4QXR0ZW1wdHM6IDIsXG4gICAgICAgICAgcmV0cnlEZWxheTogNTAwLFxuICAgICAgICAgIGxvZ1JldHJpZXM6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBVUkwgcmVjZWl2ZWQgY29uZmlybWF0aW9uIGFja25vd2xlZGdlZCBieSBtYWluIHByb2Nlc3MnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBGYWlsZWQgdG8gc2VuZCBVUkwgcmVjZWl2ZWQgY29uZmlybWF0aW9uOicsXG4gICAgICAgICAgZXJyb3JcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gS2VlcCBJUEMgbGlzdGVuZXIgZm9yIHBvdGVudGlhbCBmdXR1cmUgZGlyZWN0IGNhbGxzXG4gICAgaXBjUmVuZGVyZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCd2aWRlby1jYWxsLXdpbmRvdy9vcGVuLXVybCcpO1xuICAgIGlwY1JlbmRlcmVyLm9uKCd2aWRlby1jYWxsLXdpbmRvdy9vcGVuLXVybCcsIGhhbmRsZU9wZW5VcmwpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlwY1JlbmRlcmVyLnJlbW92ZUFsbExpc3RlbmVycygndmlkZW8tY2FsbC13aW5kb3cvb3Blbi11cmwnKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd2aWRlby1jYWxsLXVybC1yZWNlaXZlZCcsIGhhbmRsZVVybFJlY2VpdmVkKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB3ZWJ2aWV3ID0gd2Vidmlld1JlZi5jdXJyZW50IGFzIGFueTtcbiAgICBpZiAoIXdlYnZpZXcgfHwgIXZpZGVvQ2FsbFVybCkgcmV0dXJuO1xuXG4gICAgY29uc29sZS5sb2coXG4gICAgICAnVmlkZW9DYWxsV2luZG93OiBTZXR0aW5nIHVwIHdlYnZpZXcgZXZlbnQgaGFuZGxlcnMgZm9yIFVSTDonLFxuICAgICAgdmlkZW9DYWxsVXJsXG4gICAgKTtcblxuICAgIC8vIEF1dG8tcmVjb3ZlcnkgZnVuY3Rpb24gdGhhdCB0cmllcyBkaWZmZXJlbnQgc3RyYXRlZ2llc1xuICAgIGNvbnN0IGF0dGVtcHRBdXRvUmVjb3ZlcnkgPSAoKTogdm9pZCA9PiB7XG4gICAgICBpZiAocmVjb3ZlcnlBdHRlbXB0ID49IE1BWF9SRUNPVkVSWV9BVFRFTVBUUykge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IE1heCByZWNvdmVyeSBhdHRlbXB0cyByZWFjaGVkLCBzaG93aW5nIGVycm9yJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNGYWlsZWQodHJ1ZSk7XG4gICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHNldElzUmVsb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgc2V0RXJyb3JNZXNzYWdlKFxuICAgICAgICAgIHQoXG4gICAgICAgICAgICAndmlkZW9DYWxsLmVycm9yLm1heFJldHJpZXNSZWFjaGVkJyxcbiAgICAgICAgICAgICdGYWlsZWQgdG8gbG9hZCBhZnRlciBtdWx0aXBsZSBhdHRlbXB0cydcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudEF0dGVtcHQgPSByZWNvdmVyeUF0dGVtcHQgKyAxO1xuICAgICAgc2V0UmVjb3ZlcnlBdHRlbXB0KGN1cnJlbnRBdHRlbXB0KTtcblxuICAgICAgY29uc3QgZ2V0UmVjb3ZlcnlDb25maWcgPSAoYXR0ZW1wdDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoYXR0ZW1wdCkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHN0cmF0ZWd5OiBSRUNPVkVSWV9TVFJBVEVHSUVTLndlYnZpZXdSZWxvYWQsXG4gICAgICAgICAgICAgIGRlbGF5OiBSRUNPVkVSWV9ERUxBWVMud2Vidmlld1JlbG9hZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3RyYXRlZ3k6IFJFQ09WRVJZX1NUUkFURUdJRVMudXJsUmVmcmVzaCxcbiAgICAgICAgICAgICAgZGVsYXk6IFJFQ09WRVJZX0RFTEFZUy51cmxSZWZyZXNoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBzdHJhdGVneTogUkVDT1ZFUllfU1RSQVRFR0lFUy5mdWxsUmVpbml0aWFsaXplLFxuICAgICAgICAgICAgICBkZWxheTogUkVDT1ZFUllfREVMQVlTLmZ1bGxSZWluaXRpYWxpemUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgY29uZmlnID0gZ2V0UmVjb3ZlcnlDb25maWcoY3VycmVudEF0dGVtcHQpO1xuICAgICAgaWYgKCFjb25maWcpIHJldHVybjtcblxuICAgICAgc2V0SXNSZWxvYWRpbmcodHJ1ZSk7XG5cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBgVmlkZW9DYWxsV2luZG93OiBBdXRvLXJlY292ZXJ5IGF0dGVtcHQgJHtjdXJyZW50QXR0ZW1wdH0vJHtNQVhfUkVDT1ZFUllfQVRURU1QVFN9IC0gJHtjb25maWcuc3RyYXRlZ3l9YFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZWNvdmVyeVRpbWVvdXRSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCB3ZWJ2aWV3ID0gd2Vidmlld1JlZi5jdXJyZW50O1xuXG4gICAgICAgIHN3aXRjaCAoY3VycmVudEF0dGVtcHQpIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBpZiAod2Vidmlldykge1xuICAgICAgICAgICAgICB3ZWJ2aWV3LnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgaWYgKHdlYnZpZXcgJiYgdmlkZW9DYWxsVXJsKSB7XG4gICAgICAgICAgICAgIHdlYnZpZXcuc3JjID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2Vidmlldy5zcmMgPSB2aWRlb0NhbGxVcmw7XG4gICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY292ZXJ5VGltZW91dFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIH0sIGNvbmZpZy5kZWxheSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNoZWNrRm9yQ2xvc2VQYWdlID0gYXN5bmMgKHVybDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAodXJsLmluY2x1ZGVzKCcvY2xvc2UuaHRtbCcpIHx8IHVybC5pbmNsdWRlcygnL2Nsb3NlMi5odG1sJykpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogQ2xvc2UgcGFnZSBkZXRlY3RlZCwgc2NoZWR1bGluZyB3aW5kb3cgY2xvc2U6JyxcbiAgICAgICAgICB1cmxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBBZGQgZGVsYXkgdG8gcHJldmVudCBjcmFzaCBkdXJpbmcgbmF2aWdhdGlvbiB0byBjbG9zZTIuaHRtbFxuICAgICAgICAvLyBUaGlzIGFsbG93cyB0aGUgd2VidmlldyB0byBjb21wbGV0ZSB0aGUgbmF2aWdhdGlvbiBiZWZvcmUgd2luZG93IGRlc3RydWN0aW9uXG4gICAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBpbnZva2VXaXRoUmV0cnkoJ3ZpZGVvLWNhbGwtd2luZG93L2Nsb3NlLXJlcXVlc3RlZCcsIHtcbiAgICAgICAgICAgICAgbWF4QXR0ZW1wdHM6IDIsXG4gICAgICAgICAgICAgIHJldHJ5RGVsYXk6IDUwMCxcbiAgICAgICAgICAgICAgbG9nUmV0cmllczogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBDbG9zZSByZXF1ZXN0IGNvbmZpcm1lZCBieSBtYWluIHByb2Nlc3MnXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IEZhaWxlZCB0byBzZW5kIGNsb3NlIHJlcXVlc3Q6JyxcbiAgICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAxMDAwKTsgLy8gMSBzZWNvbmQgZGVsYXkgdG8gbGV0IG5hdmlnYXRpb24gY29tcGxldGUgYW5kIHByZXZlbnQgY3Jhc2hcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlTG9hZFN0YXJ0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1ZpZGVvQ2FsbFdpbmRvdzogTG9hZCBzdGFydGVkJyk7XG4gICAgICBzZXRJc0ZhaWxlZChmYWxzZSk7XG4gICAgICBzZXRJc1JlbG9hZGluZyhmYWxzZSk7XG4gICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICBzZXRTaG93RXJyb3IoZmFsc2UpO1xuXG4gICAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBkaXNwbGF5IHRpbWVvdXRzXG4gICAgICBpZiAobG9hZGluZ0Rpc3BsYXlUaW1lb3V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvYWRpbmdEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgICAgbG9hZGluZ0Rpc3BsYXlUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXJyb3JEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChlcnJvckRpc3BsYXlUaW1lb3V0UmVmLmN1cnJlbnQpO1xuICAgICAgICBlcnJvckRpc3BsYXlUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAobG9hZGluZ1RpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobG9hZGluZ1RpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICAgIGxvYWRpbmdUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3ZlcnlUaW1lb3V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHJlY292ZXJ5VGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgICAgcmVjb3ZlcnlUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBEZWxheSBzaG93aW5nIGxvYWRpbmcgc3Bpbm5lciB0byBwcmV2ZW50IHF1aWNrIGZsYXNoZXNcbiAgICAgIGxvYWRpbmdEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgc2hvdyBsb2FkaW5nIGlmIHdlJ3JlIHN0aWxsIGFjdHVhbGx5IGxvYWRpbmcgKG5vdCBmaW5pc2hlZClcbiAgICAgICAgaWYgKGlzTG9hZGluZyAmJiAhaXNGYWlsZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnVmlkZW9DYWxsV2luZG93OiBTaG93aW5nIGxvYWRpbmcgc3Bpbm5lciBhZnRlciBkZWxheScpO1xuICAgICAgICAgIHNldFNob3dMb2FkaW5nKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogU2tpcHBpbmcgbG9hZGluZyBzcGlubmVyIC0gYWxyZWFkeSBmaW5pc2hlZCBsb2FkaW5nJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZGluZ0Rpc3BsYXlUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfSwgTE9BRElOR19TSE9XX0RFTEFZKTtcblxuICAgICAgaW52b2tlV2l0aFJldHJ5KCd2aWRlby1jYWxsLXdpbmRvdy93ZWJ2aWV3LWxvYWRpbmcnLCB7XG4gICAgICAgIG1heEF0dGVtcHRzOiAyLFxuICAgICAgICByZXRyeURlbGF5OiA1MDAsXG4gICAgICAgIGxvZ1JldHJpZXM6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IFdlYnZpZXcgbG9hZGluZyBzdGF0ZSBjb25maXJtZWQgYnkgbWFpbiBwcm9jZXNzJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogRmFpbGVkIHRvIHNlbmQgd2VidmlldyBsb2FkaW5nIHN0YXRlOicsXG4gICAgICAgICAgICBlcnJvclxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICBsb2FkaW5nVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogTG9hZGluZyB0aW1lb3V0IHJlYWNoZWQgLSBzdGFydGluZyBhdXRvLXJlY292ZXJ5J1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZGluZ1RpbWVvdXRSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIGF0dGVtcHRBdXRvUmVjb3ZlcnkoKTtcbiAgICAgIH0sIExPQURJTkdfVElNRU9VVF9NUyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZU5hdmlnYXRlID0gKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdWaWRlb0NhbGxXaW5kb3c6IE5hdmlnYXRpb24gZXZlbnQ6JywgZXZlbnQudXJsKTtcbiAgICAgIGNoZWNrRm9yQ2xvc2VQYWdlKGV2ZW50LnVybCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZURvbVJlYWR5ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1ZpZGVvQ2FsbFdpbmRvdzogV2VidmlldyBET00gcmVhZHknKTtcblxuICAgICAgaWYgKHNob3VsZEF1dG9PcGVuRGV2dG9vbHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1ZpZGVvQ2FsbFdpbmRvdzogQXV0by1vcGVuaW5nIGRldnRvb2xzIGZvciB3ZWJ2aWV3Jyk7XG4gICAgICAgIGludm9rZVdpdGhSZXRyeSgndmlkZW8tY2FsbC13aW5kb3cvb3Blbi13ZWJ2aWV3LWRldi10b29scycsIHtcbiAgICAgICAgICBtYXhBdHRlbXB0czogMixcbiAgICAgICAgICByZXRyeURlbGF5OiA1MDAsXG4gICAgICAgICAgbG9nUmV0cmllczogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdWaWRlb0NhbGxXaW5kb3c6IFN1Y2Nlc3NmdWxseSBhdXRvLW9wZW5lZCBkZXZ0b29scycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdWaWRlb0NhbGxXaW5kb3c6IEZhaWxlZCB0byBhdXRvLW9wZW4gZGV2dG9vbHMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogRXJyb3IgYXV0by1vcGVuaW5nIGRldnRvb2xzOicsXG4gICAgICAgICAgICAgIGVycm9yXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVGaW5pc2hMb2FkID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IFdlYnZpZXcgZmluaXNoZWQgbG9hZGluZyAoYWxsIHJlc291cmNlcyBsb2FkZWQpJ1xuICAgICAgKTtcblxuICAgICAgcmVzZXRSZWNvdmVyeVN0YXRlKCk7XG5cbiAgICAgIC8vIENsZWFyIHBlbmRpbmcgbG9hZGluZyBkaXNwbGF5IHRpbWVvdXQgaWYgaXQgaGFzbid0IGZpcmVkIHlldFxuICAgICAgaWYgKGxvYWRpbmdEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChsb2FkaW5nRGlzcGxheVRpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICAgIGxvYWRpbmdEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gSGlkZSBsb2FkaW5nIGltbWVkaWF0ZWx5IG9uIHN1Y2Nlc3MgdG8gbWFrZSBpdCBmZWVsIHNuYXBweVxuICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgIHNldFNob3dMb2FkaW5nKGZhbHNlKTtcbiAgICAgIHNldElzRmFpbGVkKGZhbHNlKTtcbiAgICAgIHNldFNob3dFcnJvcihmYWxzZSk7XG5cbiAgICAgIGludm9rZVdpdGhSZXRyeSgndmlkZW8tY2FsbC13aW5kb3cvd2Vidmlldy1yZWFkeScsIHtcbiAgICAgICAgbWF4QXR0ZW1wdHM6IDIsXG4gICAgICAgIHJldHJ5RGVsYXk6IDUwMCxcbiAgICAgICAgbG9nUmV0cmllczogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogV2VidmlldyByZWFkeSBzdGF0ZSBjb25maXJtZWQgYnkgbWFpbiBwcm9jZXNzJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogRmFpbGVkIHRvIHNlbmQgd2VidmlldyByZWFkeSBzdGF0ZTonLFxuICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlU3RvcExvYWRpbmcgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnVmlkZW9DYWxsV2luZG93OiBXZWJ2aWV3IHN0b3BwZWQgbG9hZGluZycpO1xuICAgICAgaWYgKCFpc0ZhaWxlZCkge1xuICAgICAgICAvLyBEb24ndCBpbW1lZGlhdGVseSBoaWRlIGxvYWRpbmcgb24gc3RvcC1sb2FkaW5nLCBsZXQgZmluaXNoLWxvYWQgaGFuZGxlIGl0XG4gICAgICAgIC8vIFRoaXMgcHJldmVudHMgZmxpY2tlciB3aGVuIGJvdGggZXZlbnRzIGZpcmUgcXVpY2tseVxuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBXYWl0aW5nIGZvciBmaW5pc2gtbG9hZCB0byBjb21wbGV0ZSB0cmFuc2l0aW9uJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVEaWRGYWlsTG9hZCA9IChldmVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBlcnJvckluZm8gPSB7XG4gICAgICAgIGVycm9yQ29kZTogZXZlbnQuZXJyb3JDb2RlLFxuICAgICAgICBlcnJvckRlc2NyaXB0aW9uOiBldmVudC5lcnJvckRlc2NyaXB0aW9uLFxuICAgICAgICB2YWxpZGF0ZWRVUkw6IGV2ZW50LnZhbGlkYXRlZFVSTCxcbiAgICAgICAgaXNNYWluRnJhbWU6IGV2ZW50LmlzTWFpbkZyYW1lLFxuICAgICAgfTtcblxuICAgICAgY29uc29sZS5lcnJvcignVmlkZW9DYWxsV2luZG93OiBXZWJ2aWV3IGZhaWxlZCB0byBsb2FkOicsIGVycm9ySW5mbyk7XG5cbiAgICAgIGlmIChldmVudC5pc01haW5GcmFtZSkge1xuICAgICAgICBpZiAobG9hZGluZ1RpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChsb2FkaW5nVGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgICAgICBsb2FkaW5nVGltZW91dFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFyIHBlbmRpbmcgbG9hZGluZyBkaXNwbGF5XG4gICAgICAgIGlmIChsb2FkaW5nRGlzcGxheVRpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChsb2FkaW5nRGlzcGxheVRpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICAgICAgbG9hZGluZ0Rpc3BsYXlUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgc2V0U2hvd0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICBzZXRJc1JlbG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHNldElzRmFpbGVkKHRydWUpO1xuICAgICAgICBzZXRFcnJvck1lc3NhZ2UoYCR7ZXZlbnQuZXJyb3JEZXNjcmlwdGlvbn0gKCR7ZXZlbnQuZXJyb3JDb2RlfSlgKTtcblxuICAgICAgICAvLyBEZWxheSBzaG93aW5nIGVycm9yIHRvIHByZXZlbnQgZmxpY2tlciBkdXJpbmcgcXVpY2sgcmV0cnkgYXR0ZW1wdHNcbiAgICAgICAgZXJyb3JEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgLy8gT25seSBzaG93IGVycm9yIGlmIHdlJ3JlIHN0aWxsIGluIGZhaWxlZCBzdGF0ZSAobm90IHJlY292ZXJlZClcbiAgICAgICAgICBpZiAoaXNGYWlsZWQgJiYgIWlzTG9hZGluZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1ZpZGVvQ2FsbFdpbmRvdzogU2hvd2luZyBlcnJvciBzY3JlZW4gYWZ0ZXIgZGVsYXknKTtcbiAgICAgICAgICAgIHNldFNob3dFcnJvcih0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IFNraXBwaW5nIGVycm9yIHNjcmVlbiAtIHN0YXRlIHJlY292ZXJlZCdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yRGlzcGxheVRpbWVvdXRSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH0sIEVSUk9SX1NIT1dfREVMQVkpO1xuXG4gICAgICAgIGlwY1JlbmRlcmVyXG4gICAgICAgICAgLmludm9rZShcbiAgICAgICAgICAgICd2aWRlby1jYWxsLXdpbmRvdy93ZWJ2aWV3LWZhaWxlZCcsXG4gICAgICAgICAgICBgJHtldmVudC5lcnJvckRlc2NyaXB0aW9ufSAoJHtldmVudC5lcnJvckNvZGV9KWBcbiAgICAgICAgICApXG4gICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdD8uc3VjY2VzcyAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBXZWJ2aWV3IGZhaWxlZCBzdGF0ZSBjb25maXJtZWQgYnkgbWFpbiBwcm9jZXNzJ1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghcmVzdWx0Py5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBNYWluIHByb2Nlc3MgZGlkIG5vdCBjb25maXJtIHdlYnZpZXcgZmFpbGVkIHN0YXRlJ1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogRmFpbGVkIHRvIHNlbmQgd2VidmlldyBmYWlsZWQgc3RhdGU6JyxcbiAgICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZUNyYXNoZWQgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdWaWRlb0NhbGxXaW5kb3c6IFdlYnZpZXcgY3Jhc2hlZCcpO1xuXG4gICAgICBpZiAobG9hZGluZ1RpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobG9hZGluZ1RpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICAgIGxvYWRpbmdUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhciBwZW5kaW5nIGxvYWRpbmcgZGlzcGxheVxuICAgICAgaWYgKGxvYWRpbmdEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChsb2FkaW5nRGlzcGxheVRpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICAgIGxvYWRpbmdEaXNwbGF5VGltZW91dFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgIHNldFNob3dMb2FkaW5nKGZhbHNlKTtcbiAgICAgIHNldElzUmVsb2FkaW5nKGZhbHNlKTtcbiAgICAgIHNldElzRmFpbGVkKHRydWUpO1xuICAgICAgc2V0RXJyb3JNZXNzYWdlKHQoJ3ZpZGVvQ2FsbC5lcnJvci5jcmFzaGVkJykpO1xuXG4gICAgICAvLyBTaG93IGVycm9yIGltbWVkaWF0ZWx5IGZvciBjcmFzaGVzIChtb3JlIHNlcmlvdXMgdGhhbiBsb2FkIGZhaWx1cmVzKVxuICAgICAgc2V0U2hvd0Vycm9yKHRydWUpO1xuXG4gICAgICBpbnZva2VXaXRoUmV0cnkoXG4gICAgICAgICd2aWRlby1jYWxsLXdpbmRvdy93ZWJ2aWV3LWZhaWxlZCcsXG4gICAgICAgIHtcbiAgICAgICAgICBtYXhBdHRlbXB0czogMixcbiAgICAgICAgICByZXRyeURlbGF5OiA1MDAsXG4gICAgICAgICAgbG9nUmV0cmllczogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICAgIH0sXG4gICAgICAgICdXZWJ2aWV3IGNyYXNoZWQnXG4gICAgICApXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBXZWJ2aWV3IGNyYXNoZWQgc3RhdGUgY29uZmlybWVkIGJ5IG1haW4gcHJvY2VzcydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IEZhaWxlZCB0byBzZW5kIHdlYnZpZXcgZmFpbGVkIHN0YXRlOicsXG4gICAgICAgICAgICBlcnJvclxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVXZWJ2aWV3QXR0YWNoZWQgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnVmlkZW9DYWxsV2luZG93OiBXZWJ2aWV3IGF0dGFjaGVkJyk7XG5cbiAgICAgIGludm9rZVdpdGhSZXRyeSgndmlkZW8tY2FsbC13aW5kb3cvd2Vidmlldy1jcmVhdGVkJywge1xuICAgICAgICBtYXhBdHRlbXB0czogMixcbiAgICAgICAgcmV0cnlEZWxheTogNTAwLFxuICAgICAgICBsb2dSZXRyaWVzOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAnVmlkZW9DYWxsV2luZG93OiBXZWJ2aWV3IGNyZWF0ZWQgc3RhdGUgY29uZmlybWVkIGJ5IG1haW4gcHJvY2VzcydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IEZhaWxlZCB0byBzZW5kIHdlYnZpZXcgY3JlYXRlZCBzdGF0ZTonLFxuICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgaWYgKHNob3VsZEF1dG9PcGVuRGV2dG9vbHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogQXV0by1vcGVuaW5nIGRldnRvb2xzIGltbWVkaWF0ZWx5IG9uIHdlYnZpZXcgYXR0YWNoJ1xuICAgICAgICApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpbnZva2VXaXRoUmV0cnkoJ3ZpZGVvLWNhbGwtd2luZG93L29wZW4td2Vidmlldy1kZXYtdG9vbHMnLCB7XG4gICAgICAgICAgICBtYXhBdHRlbXB0czogMixcbiAgICAgICAgICAgIHJldHJ5RGVsYXk6IDUwMCxcbiAgICAgICAgICAgIGxvZ1JldHJpZXM6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoc3VjY2VzczogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogU3VjY2Vzc2Z1bGx5IGF1dG8tb3BlbmVkIGRldnRvb2xzIG9uIGF0dGFjaCdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICdWaWRlb0NhbGxXaW5kb3c6IEZhaWxlZCB0byBhdXRvLW9wZW4gZGV2dG9vbHMgb24gYXR0YWNoLCB3aWxsIHJldHJ5IG9uIGRvbS1yZWFkeSdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgJ1ZpZGVvQ2FsbFdpbmRvdzogRXJyb3IgYXV0by1vcGVuaW5nIGRldnRvb2xzIG9uIGF0dGFjaDonLFxuICAgICAgICAgICAgICAgIGVycm9yXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgIHdlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignd2Vidmlldy1hdHRhY2hlZCcsIGhhbmRsZVdlYnZpZXdBdHRhY2hlZCk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkaWQtc3RhcnQtbG9hZGluZycsIGhhbmRsZUxvYWRTdGFydCk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkaWQtbmF2aWdhdGUnLCBoYW5kbGVOYXZpZ2F0ZSk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCBoYW5kbGVEb21SZWFkeSk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkaWQtZmluaXNoLWxvYWQnLCBoYW5kbGVGaW5pc2hMb2FkKTtcbiAgICB3ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2RpZC1mYWlsLWxvYWQnLCBoYW5kbGVEaWRGYWlsTG9hZCk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdjcmFzaGVkJywgaGFuZGxlQ3Jhc2hlZCk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkaWQtc3RvcC1sb2FkaW5nJywgaGFuZGxlU3RvcExvYWRpbmcpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdlYnZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Vidmlldy1hdHRhY2hlZCcsIGhhbmRsZVdlYnZpZXdBdHRhY2hlZCk7XG4gICAgICB3ZWJ2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RpZC1zdGFydC1sb2FkaW5nJywgaGFuZGxlTG9hZFN0YXJ0KTtcbiAgICAgIHdlYnZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGlkLW5hdmlnYXRlJywgaGFuZGxlTmF2aWdhdGUpO1xuICAgICAgd2Vidmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCBoYW5kbGVEb21SZWFkeSk7XG4gICAgICB3ZWJ2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RpZC1maW5pc2gtbG9hZCcsIGhhbmRsZUZpbmlzaExvYWQpO1xuICAgICAgd2Vidmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdkaWQtZmFpbC1sb2FkJywgaGFuZGxlRGlkRmFpbExvYWQpO1xuICAgICAgd2Vidmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdjcmFzaGVkJywgaGFuZGxlQ3Jhc2hlZCk7XG4gICAgICB3ZWJ2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RpZC1zdG9wLWxvYWRpbmcnLCBoYW5kbGVTdG9wTG9hZGluZyk7XG5cbiAgICAgIC8vIENsZWFuIHVwIGFsbCB0aW1lb3V0IHJlZmVyZW5jZXNcbiAgICAgIFtcbiAgICAgICAgbG9hZGluZ1RpbWVvdXRSZWYsXG4gICAgICAgIHJlY292ZXJ5VGltZW91dFJlZixcbiAgICAgICAgbG9hZGluZ0Rpc3BsYXlUaW1lb3V0UmVmLFxuICAgICAgICBlcnJvckRpc3BsYXlUaW1lb3V0UmVmLFxuICAgICAgXS5mb3JFYWNoKChyZWYpID0+IHtcbiAgICAgICAgaWYgKHJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHJlZi5jdXJyZW50KTtcbiAgICAgICAgICByZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH0sIFtcbiAgICB2aWRlb0NhbGxVcmwsXG4gICAgc2hvdWxkQXV0b09wZW5EZXZ0b29scyxcbiAgICBpc0ZhaWxlZCxcbiAgICBpc0xvYWRpbmcsXG4gICAgcmVjb3ZlcnlBdHRlbXB0LFxuICAgIHQsXG4gIF0pO1xuXG4gIGNvbnN0IGhhbmRsZVJlbG9hZCA9ICgpOiB2b2lkID0+IHtcbiAgICBjb25zb2xlLmxvZygnVmlkZW9DYWxsV2luZG93OiBNYW51YWwgcmVsb2FkIHJlcXVlc3RlZCcpO1xuICAgIHNldElzUmVsb2FkaW5nKHRydWUpO1xuICAgIHNldElzRmFpbGVkKGZhbHNlKTtcbiAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3JNZXNzYWdlKG51bGwpO1xuICAgIHJlc2V0UmVjb3ZlcnlTdGF0ZSgpO1xuXG4gICAgaWYgKGxvYWRpbmdUaW1lb3V0UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNsZWFyVGltZW91dChsb2FkaW5nVGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgIGxvYWRpbmdUaW1lb3V0UmVmLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChyZWNvdmVyeVRpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHJlY292ZXJ5VGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgIHJlY292ZXJ5VGltZW91dFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB3ZWJ2aWV3ID0gd2Vidmlld1JlZi5jdXJyZW50IGFzIGFueTtcbiAgICBpZiAod2Vidmlldykge1xuICAgICAgd2Vidmlldy5yZWxvYWQoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRG9uJ3QgcmVuZGVyIHdlYnZpZXcgdW50aWwgd2UgaGF2ZSBhIFVSTFxuICBpZiAoIXZpZGVvQ2FsbFVybCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94PlxuICAgICAgICA8U2NyZWVuU2hhcmVQaWNrZXIgLz5cbiAgICAgICAgPEJveFxuICAgICAgICAgIGRpc3BsYXk9J2ZsZXgnXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ9J2NlbnRlcidcbiAgICAgICAgICBhbGlnbkl0ZW1zPSdjZW50ZXInXG4gICAgICAgICAgaGVpZ2h0PScxMDB2aCdcbiAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjMmYzNDNkJyB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEJveCBmb250U2NhbGU9J2gzJyBjb2xvcj0ncHVyZS13aGl0ZSc+XG4gICAgICAgICAgICB7dCgndmlkZW9DYWxsLmxvYWRpbmcuaW5pdGlhbCcpfVxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQm94PlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3g+XG4gICAgICA8U2NyZWVuU2hhcmVQaWNrZXIgLz5cblxuICAgICAgey8qIExvYWRpbmcgb3ZlcmxheSB3aXRoIGVzY2FwZSBvcHRpb24gKi99XG4gICAgICB7c2hvd0xvYWRpbmcgJiYgIXNob3dFcnJvciAmJiAoXG4gICAgICAgIDxCb3hcbiAgICAgICAgICBkaXNwbGF5PSdmbGV4J1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb249J2NvbHVtbidcbiAgICAgICAgICB3aWR0aD0nMTAwdncnXG4gICAgICAgICAgaGVpZ2h0PScxMDB2aCdcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudD0nY2VudGVyJ1xuICAgICAgICAgIGFsaWduSXRlbXM9J2NlbnRlcidcbiAgICAgICAgICB6SW5kZXg9ezk5OX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzJmMzQzZCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxCb3ggY29sb3I9J3B1cmUtd2hpdGUnPlxuICAgICAgICAgICAgPEJveCBkaXNwbGF5PSdmbGV4JyBmbGV4RGlyZWN0aW9uPSdjb2x1bW4nIGFsaWduSXRlbXM9J2NlbnRlcic+XG4gICAgICAgICAgICAgIDxNYXJnaW5zIGJsb2NrPSd4MTInPlxuICAgICAgICAgICAgICAgIDxUaHJvYmJlciBpbmhlcml0Q29sb3Igc2l6ZT0neDE2JyAvPlxuICAgICAgICAgICAgICA8L01hcmdpbnM+XG4gICAgICAgICAgICAgIDxCb3ggZm9udFNjYWxlPSdoMycgdGV4dEFsaWduPSdjZW50ZXInPlxuICAgICAgICAgICAgICAgIHtpc1JlbG9hZGluZ1xuICAgICAgICAgICAgICAgICAgPyB0KCd2aWRlb0NhbGwubG9hZGluZy5yZWxvYWRpbmcnKVxuICAgICAgICAgICAgICAgICAgOiB0KCd2aWRlb0NhbGwubG9hZGluZy5pbml0aWFsJyl9XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICA8Qm94IGZvbnRTY2FsZT0naDQnIHRleHRBbGlnbj0nY2VudGVyJyBtYnM9J3g4Jz5cbiAgICAgICAgICAgICAgICB7dCgndmlkZW9DYWxsLmxvYWRpbmcuZGVzY3JpcHRpb24nKX1cbiAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuXG4gICAgICB7c2hvd0Vycm9yICYmIChcbiAgICAgICAgPEJveFxuICAgICAgICAgIGRpc3BsYXk9J2ZsZXgnXG4gICAgICAgICAgZmxleERpcmVjdGlvbj0nY29sdW1uJ1xuICAgICAgICAgIHdpZHRoPScxMDB2dydcbiAgICAgICAgICBoZWlnaHQ9JzEwMHZoJ1xuICAgICAgICAgIGp1c3RpZnlDb250ZW50PSdjZW50ZXInXG4gICAgICAgICAgYWxpZ25JdGVtcz0nY2VudGVyJ1xuICAgICAgICAgIHpJbmRleD17MTAwMH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8RmFpbHVyZUltYWdlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgekluZGV4OiAwLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxCb3ggaXM9J3NlY3Rpb24nIGNvbG9yPSdwdXJlLXdoaXRlJyB6SW5kZXg9ezF9PlxuICAgICAgICAgICAgPE1hcmdpbnMgYmxvY2s9J3gxMic+XG4gICAgICAgICAgICAgIDxCb3ggZGlzcGxheT0nZmxleCcgZmxleERpcmVjdGlvbj0nY29sdW1uJyBhbGlnbkl0ZW1zPSdjZW50ZXInPlxuICAgICAgICAgICAgICAgIDxNYXJnaW5zIGJsb2NrPSd4OCcgaW5saW5lPSdhdXRvJz5cbiAgICAgICAgICAgICAgICAgIDxCb3ggZm9udFNjYWxlPSdoMScgdGV4dEFsaWduPSdjZW50ZXInPlxuICAgICAgICAgICAgICAgICAgICB7dCgndmlkZW9DYWxsLmVycm9yLnRpdGxlJyl9XG4gICAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgICAgPEJveCBmb250U2NhbGU9J2gzJyB0ZXh0QWxpZ249J2NlbnRlcic+XG4gICAgICAgICAgICAgICAgICAgIHt0KCd2aWRlb0NhbGwuZXJyb3IuYW5ub3VuY2VtZW50Jyl9XG4gICAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgICAge2Vycm9yTWVzc2FnZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICAgICAgICBmb250U2NhbGU9J2g0J1xuICAgICAgICAgICAgICAgICAgICAgIGNvbG9yPSdwdXJlLXdoaXRlJ1xuICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbj0nY2VudGVyJ1xuICAgICAgICAgICAgICAgICAgICAgIG1icz0neDgnXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7ZXJyb3JNZXNzYWdlfVxuICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9NYXJnaW5zPlxuICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIDwvTWFyZ2lucz5cblxuICAgICAgICAgICAgPEJveCBkaXNwbGF5PSdmbGV4JyBqdXN0aWZ5Q29udGVudD0nY2VudGVyJz5cbiAgICAgICAgICAgICAgPEJ1dHRvbkdyb3VwIGFsaWduPSdjZW50ZXInPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gcHJpbWFyeSBvbkNsaWNrPXtoYW5kbGVSZWxvYWR9PlxuICAgICAgICAgICAgICAgICAge3QoJ3ZpZGVvQ2FsbC5lcnJvci5yZWxvYWQnKX1cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9CdXR0b25Hcm91cD5cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG5cbiAgICAgIDx3ZWJ2aWV3XG4gICAgICAgIHJlZj17d2Vidmlld1JlZn1cbiAgICAgICAgc3JjPXt2aWRlb0NhbGxVcmx9XG4gICAgICAgIHByZWxvYWQ9e3BhdGguam9pbihfX2Rpcm5hbWUsICdwcmVsb2FkJywgJ2luZGV4LmpzJyl9XG4gICAgICAgIHdlYnByZWZlcmVuY2VzPSdub2RlSW50ZWdyYXRpb24sbmF0aXZlV2luZG93T3Blbj10cnVlJ1xuICAgICAgICBhbGxvd3BvcHVwcz17J3RydWUnIGFzIGFueX1cbiAgICAgICAgcGFydGl0aW9uPSdwZXJzaXN0OmppdHNpLXNlc3Npb24nXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICBkaXNwbGF5OiBzaG93RXJyb3IgfHwgc2hvd0xvYWRpbmcgPyAnbm9uZScgOiAnZmxleCcsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvQm94PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVmlkZW9DYWxsV2luZG93O1xuIiwiaW1wb3J0IGkxOG5leHQgZnJvbSAnaTE4bmV4dCc7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG5pbXBvcnQgeyBJMThuZXh0UHJvdmlkZXIsIGluaXRSZWFjdEkxOG5leHQgfSBmcm9tICdyZWFjdC1pMThuZXh0JztcblxuaW1wb3J0IHsgaW50ZXJwb2xhdGlvbiwgZmFsbGJhY2tMbmcgfSBmcm9tICcuLi9pMThuL2NvbW1vbic7XG5pbXBvcnQgcmVzb3VyY2VzIGZyb20gJy4uL2kxOG4vcmVzb3VyY2VzJztcbmltcG9ydCB7IGludm9rZVdpdGhSZXRyeSB9IGZyb20gJy4uL2lwYy9yZW5kZXJlcic7XG5pbXBvcnQgdHlwZSB7IElSZXRyeU9wdGlvbnMgfSBmcm9tICcuLi9pcGMvcmVuZGVyZXInO1xuaW1wb3J0IFZpZGVvQ2FsbFdpbmRvdyBmcm9tICcuL3ZpZGVvQ2FsbFdpbmRvdyc7XG5cbmxldCBpbml0QXR0ZW1wdHMgPSAwO1xuY29uc3QgTUFYX0lOSVRfQVRURU1QVFMgPSAxMDtcblxubGV0IGlzV2luZG93RGVzdHJveWluZyA9IGZhbHNlO1xubGV0IHJlYWN0Um9vdDogYW55ID0gbnVsbDtcblxuY29uc3Qgc2V0dXBJMThuID0gYXN5bmMgKCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGxuZyA9IGZhbGxiYWNrTG5nO1xuXG4gICAgYXdhaXQgaTE4bmV4dC51c2UoaW5pdFJlYWN0STE4bmV4dCkuaW5pdCh7XG4gICAgICBsbmcsXG4gICAgICBmYWxsYmFja0xuZyxcbiAgICAgIHJlc291cmNlczoge1xuICAgICAgICBbZmFsbGJhY2tMbmddOiB7XG4gICAgICAgICAgdHJhbnNsYXRpb246IGF3YWl0IHJlc291cmNlc1tmYWxsYmFja0xuZ10oKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpbnRlcnBvbGF0aW9uLFxuICAgICAgaW5pdEltbWVkaWF0ZTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgY29uc29sZS5sb2coJ1ZpZGVvIGNhbGwgd2luZG93IGkxOG4gaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIGkxOG4gZm9yIHZpZGVvIGNhbGwgd2luZG93OicsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuY29uc3Qgc2hvd0ZhbGxiYWNrVUkgPSAoKSA9PiB7XG4gIGNvbnN0IGZhbGxiYWNrQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGZhbGxiYWNrQ29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYmFja2dyb3VuZDogIzJmMzQzZDtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAgZm9udC1mYW1pbHk6ICdJbnRlcicsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBBcmlhbCwgc2Fucy1zZXJpZjtcbiAgICB6LWluZGV4OiA5OTk5O1xuICBgO1xuXG4gIGZhbGxiYWNrQ29udGFpbmVyLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiPlxuICAgICAgPGgyIHN0eWxlPVwiY29sb3I6ICNmZmY7IG1hcmdpbjogMDtcIj5WaWRlbyBDYWxsIFVuYXZhaWxhYmxlPC9oMj5cbiAgICAgIDxwIHN0eWxlPVwiY29sb3I6ICNjY2M7IG1hcmdpbjogMTBweCAwO1wiPlVuYWJsZSB0byBpbml0aWFsaXplIHZpZGVvIGNhbGwgd2luZG93PC9wPlxuICAgICAgPHAgc3R5bGU9XCJjb2xvcjogIzk5OTsgbWFyZ2luOiAxMHB4IDA7IGZvbnQtc2l6ZTogMTRweDtcIj5SZXRyeWluZyBhdXRvbWF0aWNhbGx5IGluIDMgc2Vjb25kcy4uLjwvcD5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZhbGxiYWNrQ29udGFpbmVyKTtcblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgJ1ZpZGVvIGNhbGwgd2luZG93OiBTaG93aW5nIGZhbGxiYWNrIFVJIGFmdGVyIGZhaWxlZCBpbml0aWFsaXphdGlvbiwgd2lsbCBhdXRvLXJlbG9hZCBpbiAzIHNlY29uZHMnXG4gICAgKTtcbiAgfVxuXG4gIC8vIEF1dG8tcmVsb2FkIGFmdGVyIDMgc2Vjb25kc1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnVmlkZW8gY2FsbCB3aW5kb3c6IEF1dG8tcmVsb2FkaW5nIGFmdGVyIGZhbGxiYWNrIFVJIHRpbWVvdXQnXG4gICAgICApO1xuICAgIH1cbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0sIDMwMDApO1xufTtcblxuY29uc3QgdHJpZ2dlclVSTEV2ZW50ID0gKHVybDogc3RyaW5nLCBhdXRvT3BlbkRldnRvb2xzOiBib29sZWFuKTogdm9pZCA9PiB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCd2aWRlby1jYWxsLXVybC1yZWNlaXZlZCcsIHtcbiAgICBkZXRhaWw6IHsgdXJsLCBhdXRvT3BlbkRldnRvb2xzIH0sXG4gIH0pO1xuICB3aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XG59O1xuXG5jb25zdCBzdGFydCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGlzV2luZG93RGVzdHJveWluZykge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgJ1ZpZGVvIGNhbGwgd2luZG93OiBTa2lwcGluZyBpbml0aWFsaXphdGlvbiAtIHdpbmRvdyBpcyBiZWluZyBkZXN0cm95ZWQnXG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpbml0QXR0ZW1wdHMrKztcblxuICBpZiAoaW5pdEF0dGVtcHRzID4gMSB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYFZpZGVvIGNhbGwgd2luZG93IGluaXRpYWxpemF0aW9uIGF0dGVtcHQgJHtpbml0QXR0ZW1wdHN9LyR7TUFYX0lOSVRfQVRURU1QVFN9YFxuICAgICk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFdhaXQgZm9yIERPTSBpZiBub3QgcmVhZHlcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1ZpZGVvIGNhbGwgd2luZG93OiBET00gbm90IHJlYWR5LCB3YWl0aW5nLi4uJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAnVmlkZW8gY2FsbCB3aW5kb3c6IERPTSByZWFkeSwgY29udGludWluZyBpbml0aWFsaXphdGlvbidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0YXJ0KCkudGhlbihyZXNvbHZlKS5jYXRjaChyZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplIFJlYWN0IGFwcFxuICAgIGF3YWl0IHNldHVwSTE4bigpO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKTtcbiAgICBpZiAoIXJvb3RFbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jvb3QgZWxlbWVudCBub3QgZm91bmQnKTtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdWaWRlbyBjYWxsIHdpbmRvdzogQ3JlYXRpbmcgUmVhY3Qgcm9vdCBhbmQgcmVuZGVyaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdXAgZXhpc3Rpbmcgcm9vdCBpZiBpdCBleGlzdHNcbiAgICBpZiAocmVhY3RSb290KSB7XG4gICAgICByZWFjdFJvb3QudW5tb3VudCgpO1xuICAgICAgcmVhY3RSb290ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBDbGVhciB0aGUgcm9vdCBlbGVtZW50IHRvIGF2b2lkIFJlYWN0IHdhcm5pbmdzXG4gICAgcm9vdEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG5cbiAgICByZWFjdFJvb3QgPSBjcmVhdGVSb290KHJvb3RFbGVtZW50KTtcbiAgICByZWFjdFJvb3QucmVuZGVyKFxuICAgICAgPEkxOG5leHRQcm92aWRlciBpMThuPXtpMThuZXh0fT5cbiAgICAgICAgPFZpZGVvQ2FsbFdpbmRvdyAvPlxuICAgICAgPC9JMThuZXh0UHJvdmlkZXI+XG4gICAgKTtcblxuICAgIC8vIElQQyBIYW5kc2hha2Ugd2l0aCByZXRyeVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgY29uc29sZS5sb2coJ1ZpZGVvIGNhbGwgd2luZG93OiBUZXN0aW5nIElQQyBoYW5kc2hha2UuLi4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kc2hha2VSZXRyeU9wdGlvbnM6IElSZXRyeU9wdGlvbnMgPSB7XG4gICAgICBtYXhBdHRlbXB0czogMyxcbiAgICAgIHJldHJ5RGVsYXk6IDEwMDAsXG4gICAgICBsb2dSZXRyaWVzOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICB9O1xuXG4gICAgYXdhaXQgaW52b2tlV2l0aFJldHJ5KCd2aWRlby1jYWxsLXdpbmRvdy9oYW5kc2hha2UnLCBoYW5kc2hha2VSZXRyeU9wdGlvbnMpO1xuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICBjb25zb2xlLmxvZygnVmlkZW8gY2FsbCB3aW5kb3c6IElQQyBoYW5kc2hha2Ugc3VjY2Vzc2Z1bCcpO1xuICAgIH1cblxuICAgIC8vIFNpZ25hbCByZW5kZXJlciByZWFkeVxuICAgIGNvbnNvbGUubG9nKCdWaWRlbyBjYWxsIHdpbmRvdzogU2lnbmFsaW5nIHJlbmRlcmVyIHJlYWR5IHN0YXRlJyk7XG4gICAgYXdhaXQgaW52b2tlV2l0aFJldHJ5KFxuICAgICAgJ3ZpZGVvLWNhbGwtd2luZG93L3JlbmRlcmVyLXJlYWR5JyxcbiAgICAgIGhhbmRzaGFrZVJldHJ5T3B0aW9uc1xuICAgICk7XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdWaWRlbyBjYWxsIHdpbmRvdzogUmVuZGVyZXIgcmVhZHksIHJlcXVlc3RpbmcgVVJMJyk7XG4gICAgfVxuXG4gICAgLy8gUmVxdWVzdCBVUkwgd2l0aCBjdXN0b20gcmV0cnkgbG9naWNcbiAgICBjb25zdCB1cmxSZXRyeU9wdGlvbnM6IElSZXRyeU9wdGlvbnMgPSB7XG4gICAgICBtYXhBdHRlbXB0czogNSwgLy8gSW5jcmVhc2VkIGZyb20gM1xuICAgICAgcmV0cnlEZWxheTogMjAwMCwgLy8gSW5jcmVhc2VkIGZyb20gMTAwMG1zXG4gICAgICBsb2dSZXRyaWVzOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICAgIHNob3VsZFJldHJ5OiAoZXJyb3IsIGF0dGVtcHQpID0+IHtcbiAgICAgICAgLy8gUmV0cnkgb24gSVBDIGVycm9ycyBvciBpZiByZXN1bHQgaW5kaWNhdGVzIG5vIFVSTCB5ZXRcbiAgICAgICAgY29uc3QgaXNJUENFcnJvciA9IGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ0lQQyBjYWxsIGZhaWxlZCcpO1xuICAgICAgICBjb25zdCBpc05vVVJMWWV0ID0gZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnc3VjY2VzczogZmFsc2UnKTtcblxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGBWaWRlbyBjYWxsIHdpbmRvdzogVVJMIHJlcXVlc3QgYXR0ZW1wdCAke2F0dGVtcHR9IGZhaWxlZDpgLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgaXNJUENFcnJvcixcbiAgICAgICAgICAgICAgaXNOb1VSTFlldCxcbiAgICAgICAgICAgICAgd2lsbFJldHJ5OiBpc0lQQ0Vycm9yIHx8IGlzTm9VUkxZZXQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc0lQQ0Vycm9yIHx8IGlzTm9VUkxZZXQ7XG4gICAgICB9LFxuICAgIH07XG5cbiAgICBsZXQgdXJsUmVxdWVzdFJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgdXJsUmVxdWVzdFJlc3VsdCA9IGF3YWl0IGludm9rZVdpdGhSZXRyeShcbiAgICAgICAgJ3ZpZGVvLWNhbGwtd2luZG93L3JlcXVlc3QtdXJsJyxcbiAgICAgICAgdXJsUmV0cnlPcHRpb25zXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnVmlkZW8gY2FsbCB3aW5kb3c6IEZhaWxlZCB0byBnZXQgVVJMIGFmdGVyIGFsbCByZXRyaWVzOicsXG4gICAgICAgIGVycm9yXG4gICAgICApO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZ2V0IHZpZGVvIGNhbGwgVVJMOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdWaWRlbyBjYWxsIHdpbmRvdzogVVJMIHJlY2VpdmVkOicsIHVybFJlcXVlc3RSZXN1bHQpO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXIgVVJMIGV2ZW50IGZvciBWaWRlb0NhbGxXaW5kb3cgY29tcG9uZW50XG4gICAgaWYgKHVybFJlcXVlc3RSZXN1bHQudXJsKSB7XG4gICAgICB0cmlnZ2VyVVJMRXZlbnQodXJsUmVxdWVzdFJlc3VsdC51cmwsIHVybFJlcXVlc3RSZXN1bHQuYXV0b09wZW5EZXZ0b29scyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gVVJMIHJlY2VpdmVkIGZyb20gbWFpbiBwcm9jZXNzJyk7XG4gICAgfVxuXG4gICAgaWYgKGluaXRBdHRlbXB0cyA9PT0gMSAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgY29uc29sZS5sb2coJ1ZpZGVvIGNhbGwgd2luZG93OiBTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQnKTtcbiAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICBjb25zb2xlLmxvZygnVmlkZW8gY2FsbCB3aW5kb3c6IFN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQnKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIGBWaWRlbyBjYWxsIHdpbmRvdyBpbml0aWFsaXphdGlvbiBmYWlsZWQgKGF0dGVtcHQgJHtpbml0QXR0ZW1wdHN9KTpgLFxuICAgICAgZXJyb3JcbiAgICApO1xuXG4gICAgaWYgKGluaXRBdHRlbXB0cyA8IE1BWF9JTklUX0FUVEVNUFRTICYmICFpc1dpbmRvd0Rlc3Ryb3lpbmcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdWaWRlbyBjYWxsIHdpbmRvdzogUmV0cnlpbmcgaW5pdGlhbGl6YXRpb24gaW4gMSBzZWNvbmQuLi4nKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIWlzV2luZG93RGVzdHJveWluZykge1xuICAgICAgICAgIHN0YXJ0KCkuY2F0Y2goKHJldHJ5RXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1ZpZGVvIGNhbGwgd2luZG93IHJldHJ5IGFsc28gZmFpbGVkOicsIHJldHJ5RXJyb3IpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LCAxMDAwKTtcbiAgICB9IGVsc2UgaWYgKCFpc1dpbmRvd0Rlc3Ryb3lpbmcpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICdWaWRlbyBjYWxsIHdpbmRvdzogTWF4IGluaXRpYWxpemF0aW9uIGF0dGVtcHRzIHJlYWNoZWQsIHNob3dpbmcgZmFsbGJhY2sgVUknXG4gICAgICApO1xuICAgICAgc2hvd0ZhbGxiYWNrVUkoKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEdsb2JhbCBlcnJvciBoYW5kbGVyc1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoJ1ZpZGVvIGNhbGwgd2luZG93IGdsb2JhbCBlcnJvcjonLCBldmVudC5lcnJvcik7XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudCkgPT4ge1xuICBjb25zb2xlLmVycm9yKCdWaWRlbyBjYWxsIHdpbmRvdyB1bmhhbmRsZWQgcmVqZWN0aW9uOicsIGV2ZW50LnJlYXNvbik7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuLy8gV2luZG93IGxpZmVjeWNsZSBtYW5hZ2VtZW50XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgKCkgPT4ge1xuICBpc1dpbmRvd0Rlc3Ryb3lpbmcgPSB0cnVlO1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBjb25zb2xlLmxvZygnVmlkZW8gY2FsbCB3aW5kb3c6IFdpbmRvdyB1bmxvYWRpbmcsIHN0b3BwaW5nIHJldHJpZXMnKTtcbiAgfVxuXG4gIC8vIENsZWFuIHVwIFJlYWN0IHJvb3RcbiAgaWYgKHJlYWN0Um9vdCkge1xuICAgIHJlYWN0Um9vdC51bm1vdW50KCk7XG4gICAgcmVhY3RSb290ID0gbnVsbDtcbiAgfVxufSk7XG5cbi8vIFN0YXJ0IGluaXRpYWxpemF0aW9uXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgY29uc29sZS5sb2coJ1ZpZGVvIGNhbGwgd2luZG93OiBTdGFydGluZyBpbml0aWFsaXphdGlvbi4uLicpO1xufVxuXG5zdGFydCgpLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zb2xlLmVycm9yKCdWaWRlbyBjYWxsIHdpbmRvdzogRmF0YWwgaW5pdGlhbGl6YXRpb24gZXJyb3I6JywgZXJyb3IpO1xuICBzaG93RmFsbGJhY2tVSSgpO1xufSk7XG4iXSwibmFtZXMiOlsibSIsInJlcXVpcmUiLCJpIiwiX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQiLCJleHBvcnRzIiwiYyIsIm8iLCJ1c2luZ0NsaWVudEVudHJ5UG9pbnQiLCJjcmVhdGVSb290IiwiZmFsbGJhY2tMbmciLCJieXRlVW5pdHMiLCJmb3JtYXRCeXRlcyIsImJ5dGVzIiwib3JkZXIiLCJNYXRoIiwibWluIiwiZmxvb3IiLCJsb2ciLCJsZW5ndGgiLCJ1bml0IiwiZm9ybWF0dGVyIiwiSW50bCIsIk51bWJlckZvcm1hdCIsInVuZGVmaW5lZCIsIm5vdGF0aW9uIiwic3R5bGUiLCJtYXhpbXVtRnJhY3Rpb25EaWdpdHMiLCJmb3JtYXQiLCJwb3ciLCJmb3JtYXRCeXRlU3BlZWQiLCJieXRlc1BlclNlY29uZCIsImZvcm1hdFBlcmNlbnRhZ2UiLCJyYXRpbyIsImZvcm1hdER1cmF0aW9uIiwiZHVyYXRpb24iLCJSZWxhdGl2ZVRpbWVGb3JtYXQiLCJudW1lcmljIiwiaW50ZXJwb2xhdGlvbiIsInZhbHVlIiwibG5nIiwiRGF0ZSIsIk51bWJlciIsImlzTmFOIiwiZ2V0VGltZSIsIkRhdGVUaW1lRm9ybWF0IiwiU3RyaW5nIiwiZGUtREUiLCJlbiIsImVzIiwiZmkiLCJmciIsImh1IiwiaXQtSVQiLCJqYSIsInBsIiwicHQtQlIiLCJydSIsInRyLVRSIiwidWstVUEiLCJ6aC1DTiIsInpoLVRXIiwiaW52b2tlV2l0aFJldHJ5IiwiY2hhbm5lbCIsInJldHJ5T3B0aW9ucyIsImFyZ3MiLCJtYXhBdHRlbXB0cyIsInJldHJ5RGVsYXkiLCJsb2dSZXRyaWVzIiwic2hvdWxkUmV0cnkiLCJhdHRlbXB0SW52b2tlIiwiYXR0ZW1wdCIsInJlc3VsdCIsImlwY1JlbmRlcmVyIiwiaW52b2tlIiwic3VjY2VzcyIsIkVycm9yIiwiZXJyb3IiLCJpc0xhc3RBdHRlbXB0IiwiY29uc29sZSIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIlJlYWN0IiwiUkVBQ1RfRUxFTUVOVF9UWVBFIiwiU3ltYm9sIiwiZm9yIiwiUkVBQ1RfUE9SVEFMX1RZUEUiLCJSRUFDVF9GUkFHTUVOVF9UWVBFIiwiUkVBQ1RfU1RSSUNUX01PREVfVFlQRSIsIlJFQUNUX1BST0ZJTEVSX1RZUEUiLCJSRUFDVF9QUk9WSURFUl9UWVBFIiwiUkVBQ1RfQ09OVEVYVF9UWVBFIiwiUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRSIsIlJFQUNUX1NVU1BFTlNFX1RZUEUiLCJSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEUiLCJSRUFDVF9NRU1PX1RZUEUiLCJSRUFDVF9MQVpZX1RZUEUiLCJSRUFDVF9PRkZTQ1JFRU5fVFlQRSIsIk1BWUJFX0lURVJBVE9SX1NZTUJPTCIsIml0ZXJhdG9yIiwiRkFVWF9JVEVSQVRPUl9TWU1CT0wiLCJnZXRJdGVyYXRvckZuIiwibWF5YmVJdGVyYWJsZSIsIm1heWJlSXRlcmF0b3IiLCJSZWFjdFNoYXJlZEludGVybmFscyIsIl9sZW4yIiwiYXJndW1lbnRzIiwiQXJyYXkiLCJfa2V5MiIsInByaW50V2FybmluZyIsImxldmVsIiwiUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSIsInN0YWNrIiwiZ2V0U3RhY2tBZGRlbmR1bSIsImNvbmNhdCIsImFyZ3NXaXRoRm9ybWF0IiwibWFwIiwiaXRlbSIsInVuc2hpZnQiLCJGdW5jdGlvbiIsInByb3RvdHlwZSIsImFwcGx5IiwiY2FsbCIsImVuYWJsZVNjb3BlQVBJIiwiZW5hYmxlQ2FjaGVFbGVtZW50IiwiZW5hYmxlVHJhbnNpdGlvblRyYWNpbmciLCJlbmFibGVMZWdhY3lIaWRkZW4iLCJlbmFibGVEZWJ1Z1RyYWNpbmciLCJSRUFDVF9NT0RVTEVfUkVGRVJFTkNFIiwiaXNWYWxpZEVsZW1lbnRUeXBlIiwidHlwZSIsIiQkdHlwZW9mIiwiZ2V0TW9kdWxlSWQiLCJnZXRXcmFwcGVkTmFtZSIsIm91dGVyVHlwZSIsImlubmVyVHlwZSIsIndyYXBwZXJOYW1lIiwiZGlzcGxheU5hbWUiLCJmdW5jdGlvbk5hbWUiLCJuYW1lIiwiZ2V0Q29udGV4dE5hbWUiLCJnZXRDb21wb25lbnROYW1lRnJvbVR5cGUiLCJ0YWciLCJjb250ZXh0IiwicHJvdmlkZXIiLCJfY29udGV4dCIsInJlbmRlciIsIm91dGVyTmFtZSIsImxhenlDb21wb25lbnQiLCJwYXlsb2FkIiwiX3BheWxvYWQiLCJpbml0IiwiX2luaXQiLCJ4IiwiYXNzaWduIiwiT2JqZWN0IiwiZGlzYWJsZWREZXB0aCIsInByZXZMb2ciLCJwcmV2SW5mbyIsInByZXZXYXJuIiwicHJldkVycm9yIiwicHJldkdyb3VwIiwicHJldkdyb3VwQ29sbGFwc2VkIiwicHJldkdyb3VwRW5kIiwiZGlzYWJsZWRMb2ciLCJfX3JlYWN0RGlzYWJsZWRMb2ciLCJkaXNhYmxlTG9ncyIsImluZm8iLCJ3YXJuIiwiZ3JvdXAiLCJncm91cENvbGxhcHNlZCIsImdyb3VwRW5kIiwicHJvcHMiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJkZWZpbmVQcm9wZXJ0aWVzIiwicmVlbmFibGVMb2dzIiwiUmVhY3RDdXJyZW50RGlzcGF0Y2hlciIsInByZWZpeCIsImRlc2NyaWJlQnVpbHRJbkNvbXBvbmVudEZyYW1lIiwic291cmNlIiwib3duZXJGbiIsIm1hdGNoIiwidHJpbSIsInJlZW50cnkiLCJjb21wb25lbnRGcmFtZUNhY2hlIiwiUG9zc2libHlXZWFrTWFwIiwiV2Vha01hcCIsIk1hcCIsImRlc2NyaWJlTmF0aXZlQ29tcG9uZW50RnJhbWUiLCJmbiIsImNvbnN0cnVjdCIsImZyYW1lIiwiZ2V0IiwiY29udHJvbCIsInByZXZpb3VzUHJlcGFyZVN0YWNrVHJhY2UiLCJwcmVwYXJlU3RhY2tUcmFjZSIsInByZXZpb3VzRGlzcGF0Y2hlciIsImN1cnJlbnQiLCJGYWtlIiwiZGVmaW5lUHJvcGVydHkiLCJzZXQiLCJSZWZsZWN0Iiwic2FtcGxlIiwic2FtcGxlTGluZXMiLCJzcGxpdCIsImNvbnRyb2xMaW5lcyIsInMiLCJfZnJhbWUiLCJyZXBsYWNlIiwiaW5jbHVkZXMiLCJzeW50aGV0aWNGcmFtZSIsImRlc2NyaWJlRnVuY3Rpb25Db21wb25lbnRGcmFtZSIsInNob3VsZENvbnN0cnVjdCIsIkNvbXBvbmVudCIsImlzUmVhY3RDb21wb25lbnQiLCJkZXNjcmliZVVua25vd25FbGVtZW50VHlwZUZyYW1lSW5ERVYiLCJoYXNPd25Qcm9wZXJ0eSIsImxvZ2dlZFR5cGVGYWlsdXJlcyIsInNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50IiwiZWxlbWVudCIsIm93bmVyIiwiX293bmVyIiwiX3NvdXJjZSIsInNldEV4dHJhU3RhY2tGcmFtZSIsImNoZWNrUHJvcFR5cGVzIiwidHlwZVNwZWNzIiwidmFsdWVzIiwibG9jYXRpb24iLCJjb21wb25lbnROYW1lIiwiaGFzIiwiYmluZCIsInR5cGVTcGVjTmFtZSIsImVycm9yJDEiLCJlcnIiLCJleCIsIm1lc3NhZ2UiLCJpc0FycmF5SW1wbCIsImlzQXJyYXkiLCJhIiwidHlwZU5hbWUiLCJoYXNUb1N0cmluZ1RhZyIsInRvU3RyaW5nVGFnIiwiY29uc3RydWN0b3IiLCJ3aWxsQ29lcmNpb25UaHJvdyIsInRlc3RTdHJpbmdDb2VyY2lvbiIsImUiLCJjaGVja0tleVN0cmluZ0NvZXJjaW9uIiwiUmVhY3RDdXJyZW50T3duZXIiLCJSRVNFUlZFRF9QUk9QUyIsImtleSIsInJlZiIsIl9fc2VsZiIsIl9fc291cmNlIiwic3BlY2lhbFByb3BLZXlXYXJuaW5nU2hvd24iLCJzcGVjaWFsUHJvcFJlZldhcm5pbmdTaG93biIsImRpZFdhcm5BYm91dFN0cmluZ1JlZnMiLCJoYXNWYWxpZFJlZiIsImNvbmZpZyIsImdldHRlciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImlzUmVhY3RXYXJuaW5nIiwiaGFzVmFsaWRLZXkiLCJ3YXJuSWZTdHJpbmdSZWZDYW5ub3RCZUF1dG9Db252ZXJ0ZWQiLCJzZWxmIiwic3RhdGVOb2RlIiwiZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIiLCJ3YXJuQWJvdXRBY2Nlc3NpbmdLZXkiLCJkZWZpbmVSZWZQcm9wV2FybmluZ0dldHRlciIsIndhcm5BYm91dEFjY2Vzc2luZ1JlZiIsIlJlYWN0RWxlbWVudCIsIl9zdG9yZSIsImZyZWV6ZSIsImpzeERFViIsIm1heWJlS2V5IiwicHJvcE5hbWUiLCJkZWZhdWx0UHJvcHMiLCJSZWFjdEN1cnJlbnRPd25lciQxIiwiUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSQxIiwic2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQkMSIsInByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duIiwiaXNWYWxpZEVsZW1lbnQiLCJvYmplY3QiLCJnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0iLCJnZXRTb3VyY2VJbmZvRXJyb3JBZGRlbmR1bSIsImZpbGVOYW1lIiwibGluZU51bWJlciIsIm93bmVySGFzS2V5VXNlV2FybmluZyIsImdldEN1cnJlbnRDb21wb25lbnRFcnJvckluZm8iLCJwYXJlbnRUeXBlIiwicGFyZW50TmFtZSIsInZhbGlkYXRlRXhwbGljaXRLZXkiLCJ2YWxpZGF0ZWQiLCJjdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvIiwiY2hpbGRPd25lciIsInZhbGlkYXRlQ2hpbGRLZXlzIiwibm9kZSIsImNoaWxkIiwiaXRlcmF0b3JGbiIsImVudHJpZXMiLCJzdGVwIiwibmV4dCIsImRvbmUiLCJ2YWxpZGF0ZVByb3BUeXBlcyIsInByb3BUeXBlcyIsIlByb3BUeXBlcyIsIl9uYW1lIiwiZ2V0RGVmYXVsdFByb3BzIiwiaXNSZWFjdENsYXNzQXBwcm92ZWQiLCJ2YWxpZGF0ZUZyYWdtZW50UHJvcHMiLCJmcmFnbWVudCIsImtleXMiLCJkaWRXYXJuQWJvdXRLZXlTcHJlYWQiLCJqc3hXaXRoVmFsaWRhdGlvbiIsImlzU3RhdGljQ2hpbGRyZW4iLCJ2YWxpZFR5cGUiLCJzb3VyY2VJbmZvIiwidHlwZVN0cmluZyIsImNoaWxkcmVuIiwiZmlsdGVyIiwiayIsImJlZm9yZUV4YW1wbGUiLCJqb2luIiwiYWZ0ZXJFeGFtcGxlIiwianN4V2l0aFZhbGlkYXRpb25TdGF0aWMiLCJqc3hXaXRoVmFsaWRhdGlvbkR5bmFtaWMiLCJqc3giLCJqc3hzIiwibW9kdWxlIiwiRmFpbHVyZUltYWdlIiwic3QzIiwic3QxNSIsInN0MTEiLCJzdDEiLCJzdDE0Iiwic3QxMiIsInN0MiIsInN0MjMiLCJzdDIyIiwic3QyMSIsInN0MjAiLCJzdDgiLCJzdDE5Iiwic3Q0Iiwic3QxMyIsInVzZUlkIiwiYiIsIl9qc3hzIiwidmlld0JveCIsInByZXNlcnZlQXNwZWN0UmF0aW8iLCJpZCIsIngxIiwieDIiLCJ5MSIsInkyIiwiZ3JhZGllbnRVbml0cyIsIl9qc3giLCJzdG9wQ29sb3IiLCJvZmZzZXQiLCJvcGFjaXR5IiwiY3giLCJjeSIsInIiLCJncmFkaWVudFRyYW5zZm9ybSIsInN0b3BPcGFjaXR5IiwiZmlsbCIsImQiLCJyeCIsInJ5IiwieSIsIndpZHRoIiwiaGVpZ2h0IiwiY2xpcFBhdGgiLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsInN0cm9rZU1pdGVybGltaXQiLCJwb2ludHMiLCJ1c2VEaWFsb2ciLCJ2aXNpYmxlIiwib25DbG9zZSIsImRpYWxvZ1JlZiIsInVzZVJlZiIsIm9uQ2xvc2VSZWYiLCJ1c2VFZmZlY3QiLCJkaWFsb2ciLCJjbG9zZSIsInNob3dNb2RhbCIsIm9uY2xvc2UiLCJvbmNsaWNrIiwiY2xpZW50WCIsImNsaWVudFkiLCJsZWZ0IiwidG9wIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaXNJbkRpYWxvZyIsIldyYXBwZXIiLCJzdHlsZWQiLCJEaWFsb2ciLCJpc1Zpc2libGUiLCJTY3JvbGxhYmxlIiwiVGlsZSIsImVsZXZhdGlvbiIsInBhZGRpbmciLCJkaXNwbGF5IiwiZmxleERpcmVjdGlvbiIsImRlc2t0b3BDYXB0dXJlciIsImdldFNvdXJjZXMiLCJvcHRzIiwiU2NyZWVuU2hhcmVQaWNrZXIiLCJ0IiwidXNlVHJhbnNsYXRpb24iLCJzZXRWaXNpYmxlIiwidXNlU3RhdGUiLCJzb3VyY2VzIiwic2V0U291cmNlcyIsImN1cnJlbnRUYWIiLCJzZXRDdXJyZW50VGFiIiwic2VsZWN0ZWRTb3VyY2VJZCIsInNldFNlbGVjdGVkU291cmNlSWQiLCJpc1NjcmVlblJlY29yZGluZ1Blcm1pc3Npb25HcmFudGVkIiwic2V0SXNTY3JlZW5SZWNvcmRpbmdQZXJtaXNzaW9uR3JhbnRlZCIsImZldGNoU291cmNlcyIsInVzZUNhbGxiYWNrIiwidHlwZXMiLCJmaWx0ZXJlZFNvdXJjZXMiLCJzb3J0IiwibG9jYWxlQ29tcGFyZSIsImZpbmQiLCJjaGVja1NjcmVlblJlY29yZGluZ1Blcm1pc3Npb24iLCJjYXRjaCIsIm9uIiwidGltZXIiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJoYW5kbGVTY3JlZW5TaGFyaW5nU291cmNlQ2xpY2siLCJoYW5kbGVTaGFyZSIsInNlbGVjdGVkU291cmNlIiwidGh1bWJuYWlsIiwiaXNFbXB0eSIsInNlbmQiLCJoYW5kbGVDbG9zZSIsIl9GcmFnbWVudCIsIlBhbGV0dGVTdHlsZVRhZyIsInRoZW1lIiwic2VsZWN0b3IiLCJCb3giLCJtYXJnaW4iLCJiYWNrZ3JvdW5kQ29sb3IiLCJjb2xvciIsIm1hcmdpbkJsb2NrRW5kIiwiZm9udFNjYWxlIiwiVGFicyIsIkl0ZW0iLCJzZWxlY3RlZCIsIm9uQ2xpY2siLCJvdmVyZmxvdyIsIm1hcmdpbkJsb2NrU3RhcnQiLCJmbGV4R3JvdyIsIkNhbGxvdXQiLCJ0aXRsZSIsInZlcnRpY2FsIiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsImdhcCIsImp1c3RpZnlDb250ZW50IiwiYWxpZ25JdGVtcyIsInAiLCJncmlkQ29sdW1uIiwiTGFiZWwiLCJiZyIsImJvcmRlciIsImJvcmRlclJhZGl1cyIsImN1cnNvciIsImNsYXNzTmFtZSIsInBvc2l0aW9uIiwibWluSGVpZ2h0IiwiaXMiLCJzcmMiLCJ0b0RhdGFVUkwiLCJhbHQiLCJvYmplY3RGaXQiLCJvYmplY3RQb3NpdGlvbiIsImJvdHRvbSIsInJpZ2h0IiwiYmFja2dyb3VuZCIsImJhY2tkcm9wRmlsdGVyIiwiekluZGV4IiwiZm9udFNpemUiLCJsaW5lSGVpZ2h0IiwidGV4dEFsaWduIiwid29yZEJyZWFrIiwiV2Via2l0TGluZUNsYW1wIiwiV2Via2l0Qm94T3JpZW50IiwidGV4dE92ZXJmbG93IiwiQnV0dG9uIiwicHJpbWFyeSIsImRpc2FibGVkIiwiTUFYX1JFQ09WRVJZX0FUVEVNUFRTIiwiTE9BRElOR19USU1FT1VUX01TIiwiTE9BRElOR19TSE9XX0RFTEFZIiwiRVJST1JfU0hPV19ERUxBWSIsIlJFQ09WRVJZX0RFTEFZUyIsIndlYnZpZXdSZWxvYWQiLCJ1cmxSZWZyZXNoIiwiZnVsbFJlaW5pdGlhbGl6ZSIsIlJFQ09WRVJZX1NUUkFURUdJRVMiLCJWaWRlb0NhbGxXaW5kb3ciLCJ2aWRlb0NhbGxVcmwiLCJzZXRWaWRlb0NhbGxVcmwiLCJzaG91bGRBdXRvT3BlbkRldnRvb2xzIiwic2V0U2hvdWxkQXV0b09wZW5EZXZ0b29scyIsImlzRmFpbGVkIiwic2V0SXNGYWlsZWQiLCJpc1JlbG9hZGluZyIsInNldElzUmVsb2FkaW5nIiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwic2hvd0xvYWRpbmciLCJzZXRTaG93TG9hZGluZyIsInNob3dFcnJvciIsInNldFNob3dFcnJvciIsImVycm9yTWVzc2FnZSIsInNldEVycm9yTWVzc2FnZSIsInJlY292ZXJ5QXR0ZW1wdCIsInNldFJlY292ZXJ5QXR0ZW1wdCIsIndlYnZpZXdSZWYiLCJsb2FkaW5nVGltZW91dFJlZiIsInJlY292ZXJ5VGltZW91dFJlZiIsImxvYWRpbmdEaXNwbGF5VGltZW91dFJlZiIsImVycm9yRGlzcGxheVRpbWVvdXRSZWYiLCJyZXNldFJlY292ZXJ5U3RhdGUiLCJoYW5kbGVVcmxSZWNlaXZlZCIsImV2ZW50IiwiY3VzdG9tRXZlbnQiLCJ1cmwiLCJhdXRvT3BlbkRldnRvb2xzIiwiZGV0YWlsIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImhhbmRsZU9wZW5VcmwiLCJfZXZlbnQiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwid2VidmlldyIsImF0dGVtcHRBdXRvUmVjb3ZlcnkiLCJjdXJyZW50QXR0ZW1wdCIsImdldFJlY292ZXJ5Q29uZmlnIiwic3RyYXRlZ3kiLCJkZWxheSIsInJlbG9hZCIsImNoZWNrRm9yQ2xvc2VQYWdlIiwiaGFuZGxlTG9hZFN0YXJ0IiwiY2xlYXJUaW1lb3V0IiwidGhlbiIsImhhbmRsZU5hdmlnYXRlIiwiaGFuZGxlRG9tUmVhZHkiLCJoYW5kbGVGaW5pc2hMb2FkIiwiaGFuZGxlU3RvcExvYWRpbmciLCJoYW5kbGVEaWRGYWlsTG9hZCIsImVycm9ySW5mbyIsImVycm9yQ29kZSIsImVycm9yRGVzY3JpcHRpb24iLCJ2YWxpZGF0ZWRVUkwiLCJpc01haW5GcmFtZSIsImhhbmRsZUNyYXNoZWQiLCJoYW5kbGVXZWJ2aWV3QXR0YWNoZWQiLCJmb3JFYWNoIiwiaGFuZGxlUmVsb2FkIiwiTWFyZ2lucyIsImJsb2NrIiwiVGhyb2JiZXIiLCJpbmhlcml0Q29sb3IiLCJzaXplIiwibWJzIiwiaW5saW5lIiwiQnV0dG9uR3JvdXAiLCJhbGlnbiIsInByZWxvYWQiLCJwYXRoIiwiX19kaXJuYW1lIiwid2VicHJlZmVyZW5jZXMiLCJhbGxvd3BvcHVwcyIsInBhcnRpdGlvbiIsImluaXRBdHRlbXB0cyIsIk1BWF9JTklUX0FUVEVNUFRTIiwiaXNXaW5kb3dEZXN0cm95aW5nIiwicmVhY3RSb290Iiwic2V0dXBJMThuIiwiaTE4bmV4dCIsInVzZSIsImluaXRSZWFjdEkxOG5leHQiLCJyZXNvdXJjZXMiLCJ0cmFuc2xhdGlvbiIsImluaXRJbW1lZGlhdGUiLCJzaG93RmFsbGJhY2tVSSIsImZhbGxiYWNrQ29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY3NzVGV4dCIsImlubmVySFRNTCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInRyaWdnZXJVUkxFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsInN0YXJ0IiwicmVhZHlTdGF0ZSIsInJvb3RFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJ1bm1vdW50IiwiSTE4bmV4dFByb3ZpZGVyIiwiaTE4biIsImhhbmRzaGFrZVJldHJ5T3B0aW9ucyIsInVybFJldHJ5T3B0aW9ucyIsImlzSVBDRXJyb3IiLCJpc05vVVJMWWV0Iiwid2lsbFJldHJ5IiwidXJsUmVxdWVzdFJlc3VsdCIsInJldHJ5RXJyb3IiLCJy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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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
