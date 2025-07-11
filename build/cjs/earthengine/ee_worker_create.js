"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createWorkerUrl;
function createWorkerUrl() {
  return new URL('./ee_worker.js', import.meta.url);
}