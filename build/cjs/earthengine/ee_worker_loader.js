"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _comlink = require("comlink");
var _ee_worker = _interopRequireDefault(require("./ee_worker.js?worker&url"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let resolvedWorker;

// Return same worker if already authenticated
const getEarthEngineWorker = getAuthToken => new Promise((resolve, reject) => {
  if (resolvedWorker) {
    resolve(resolvedWorker);
  } else {
    // Service Worker not supported in Safari
    const EarthEngineWorker = (0, _comlink.wrap)(typeof SharedWorker !== 'undefined' ? new SharedWorker(_ee_worker.default, {
      type: 'module'
    }).port : new Worker(_ee_worker.default, {
      type: 'module'
    }));
    EarthEngineWorker.setAuthToken((0, _comlink.proxy)(getAuthToken)).then(() => {
      resolvedWorker = EarthEngineWorker;
      resolve(EarthEngineWorker);
    }).catch(reject);
  }
});
var _default = exports.default = getEarthEngineWorker;