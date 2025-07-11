"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _comlink = require("comlink");
let resolvedWorker;
const url = new URL('../earthengine/ee_worker.js', import.meta.url);
console.log("🚀 ~ url:", url);

// Return same worker if already authenticated
const getEarthEngineWorker = getAuthToken => new Promise((resolve, reject) => {
  if (resolvedWorker) {
    resolve(resolvedWorker);
  } else {
    // Service Worker not supported in Safari
    const EarthEngineWorker = (0, _comlink.wrap)(typeof SharedWorker !== 'undefined' ? new SharedWorker(url, {
      type: 'module'
    }).port : new Worker(url, {
      type: 'module'
    }));
    EarthEngineWorker.setAuthToken((0, _comlink.proxy)(getAuthToken)).then(() => {
      resolvedWorker = EarthEngineWorker;
      resolve(EarthEngineWorker);
    }).catch(reject);
  }
});
var _default = exports.default = getEarthEngineWorker;