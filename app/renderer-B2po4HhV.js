'use strict';

var rootWindow = require('./rootWindow-TFGD_YwU.js');
require('react');
require('react-dom');
require('redux');
require('electron');
require('i18next');
require('react-i18next');
require('react-redux');
require('@rocket.chat/fuselage');
require('@rocket.chat/fuselage-hooks');
require('rimraf');
require('fs');
require('path');
require('reselect');
require('detect-browsers');
require('@emotion/styled');
require('react-hook-form');
require('react-keyed-flatten-children');
require('@emotion/react');
require('@rocket.chat/fuselage-polyfills');
require('@rocket.chat/css-in-js');
require('node:fs/promises');
require('node:url');
require('axios');
require('jsonwebtoken');
require('moment');
require('semver');

const iconCache = new Map();
const inferContentTypeFromImageData = data => {
  const header = Array.from(new Uint8Array(data.slice(0, 3))).map(byte => byte.toString(16)).join('');
  switch (header) {
    case '89504e':
      return 'image/png';
    case '474946':
      return 'image/gif';
    case 'ffd8ff':
      return 'image/jpeg';
    default:
      return null;
  }
};
const fetchIcon = async urlHref => {
  const cache = iconCache.get(urlHref);
  if (cache) {
    return cache;
  }
  const response = await fetch(urlHref);
  const arrayBuffer = await response.arrayBuffer();
  const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const contentType = inferContentTypeFromImageData(arrayBuffer) || response.headers.get('content-type');
  const dataUri = `data:${contentType};base64,${base64String}`;
  iconCache.set(urlHref, dataUri);
  return dataUri;
};
var renderer = () => {
  rootWindow.handle('notifications/fetch-icon', fetchIcon);
};

exports.default = renderer;
//# sourceMappingURL=renderer-B2po4HhV.js.map
