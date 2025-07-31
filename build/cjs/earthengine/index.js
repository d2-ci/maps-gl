"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ee_worker_loader = _interopRequireDefault(require("./ee_worker_loader.js"));
require("./ee_worker.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Ensure Vite can resolve this file when this package is symlinked via `yarn link` into another project
var _default = exports.default = _ee_worker_loader.default;