"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.poleOfInaccessibility = exports.loadEarthEngineWorker = exports.layerTypes = exports.default = exports.createEarthEngineWorkerUrl = exports.controlTypes = void 0;
var _controlTypes = _interopRequireDefault(require("./controls/controlTypes.js"));
var _index = require("./earthengine/index.js");
var _layerTypes = _interopRequireDefault(require("./layers/layerTypes.js"));
var _Map = _interopRequireDefault(require("./Map.js"));
var _labels = require("./utils/labels.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 *  Wrapper around MapLibre GL JS for DHIS2 Maps
 */

const layerTypes = exports.layerTypes = Object.keys(_layerTypes.default);
const controlTypes = exports.controlTypes = Object.keys(_controlTypes.default);
const createEarthEngineWorkerUrl = exports.createEarthEngineWorkerUrl = _index.createWorkerUrl;
const loadEarthEngineWorker = exports.loadEarthEngineWorker = _index.getEarthEngineWorker;
const poleOfInaccessibility = exports.poleOfInaccessibility = _labels.getLabelPosition;
var _default = exports.default = _Map.default;