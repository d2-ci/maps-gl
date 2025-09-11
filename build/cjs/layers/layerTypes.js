"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AzureLayer = _interopRequireDefault(require("./AzureLayer.js"));
var _BingLayer = _interopRequireDefault(require("./BingLayer.js"));
var _Boundary = _interopRequireDefault(require("./Boundary.js"));
var _Choropleth = _interopRequireDefault(require("./Choropleth.js"));
var _ClientCluster = _interopRequireDefault(require("./ClientCluster.js"));
var _DonutCluster = _interopRequireDefault(require("./DonutCluster.js"));
var _EarthEngine = _interopRequireDefault(require("./EarthEngine.js"));
var _Events = _interopRequireDefault(require("./Events.js"));
var _GeoJson = _interopRequireDefault(require("./GeoJson.js"));
var _Heat = _interopRequireDefault(require("./Heat.js"));
var _LayerGroup = _interopRequireDefault(require("./LayerGroup.js"));
var _Markers = _interopRequireDefault(require("./Markers.js"));
var _ServerCluster = _interopRequireDefault(require("./ServerCluster.js"));
var _TileLayer = _interopRequireDefault(require("./TileLayer.js"));
var _VectorStyle = _interopRequireDefault(require("./VectorStyle.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports.default = {
  azureLayer: _AzureLayer.default,
  // azure layer basemap
  bingLayer: _BingLayer.default,
  // bing layer basemap
  boundary: _Boundary.default,
  // boundary layer
  choropleth: _Choropleth.default,
  // thematic layer
  clientCluster: _ClientCluster.default,
  // event layer
  donutCluster: _DonutCluster.default,
  // event layer
  earthEngine: _EarthEngine.default,
  // google earth engine layer
  events: _Events.default,
  // event layer
  geoJson: _GeoJson.default,
  // tracked entity layer
  group: _LayerGroup.default,
  // tracked entity layer
  heat: _Heat.default,
  // event layer
  markers: _Markers.default,
  // facility layer
  serverCluster: _ServerCluster.default,
  // event layer
  tileLayer: _TileLayer.default,
  // basemap / external layer
  vectorStyle: _VectorStyle.default,
  // basemap / externalLayer
  wmsLayer: _TileLayer.default // external layer
};