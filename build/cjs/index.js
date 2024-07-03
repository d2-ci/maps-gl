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
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 *  Wrapper around MapLibre GL JS for DHIS2 Maps
 */

const layerTypes = Object.keys(_layerTypes.default);
exports.layerTypes = layerTypes;
const controlTypes = Object.keys(_controlTypes.default);
exports.controlTypes = controlTypes;
const loadEarthEngineWorker = _earthengine.default;
exports.loadEarthEngineWorker = loadEarthEngineWorker;
const poleOfInaccessibility = _labels.getLabelPosition;
exports.poleOfInaccessibility = poleOfInaccessibility;
var _default = _Map.default;
exports.default = _default;