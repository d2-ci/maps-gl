"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.poleOfInaccessibility = exports.loadEarthEngineWorker = exports.layerTypes = exports.default = exports.controlTypes = void 0;
var _Map = _interopRequireDefault(require("./Map"));
var _layerTypes = _interopRequireDefault(require("./layers/layerTypes"));
var _controlTypes = _interopRequireDefault(require("./controls/controlTypes"));
var _earthengine = _interopRequireDefault(require("./earthengine"));
var _labels = require("./utils/labels");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 *  Wrapper around MapLibre GL JS for DHIS2 Maps
 */

const layerTypes = exports.layerTypes = Object.keys(_layerTypes.default);
const controlTypes = exports.controlTypes = Object.keys(_controlTypes.default);
const loadEarthEngineWorker = exports.loadEarthEngineWorker = _earthengine.default;
const poleOfInaccessibility = exports.poleOfInaccessibility = _labels.getLabelPosition;
var _default = exports.default = _Map.default;