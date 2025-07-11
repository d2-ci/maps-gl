"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createWorkerUrl", {
  enumerable: true,
  get: function () {
    return _ee_worker_create.default;
  }
});
Object.defineProperty(exports, "getEarthEngineWorker", {
  enumerable: true,
  get: function () {
    return _ee_worker_loader.default;
  }
});
var _ee_worker_create = _interopRequireDefault(require("./ee_worker_create.js"));
var _ee_worker_loader = _interopRequireDefault(require("./ee_worker_loader.js"));
require("./ee_worker.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }