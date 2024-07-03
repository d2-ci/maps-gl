"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _VectorStyle = _interopRequireDefault(require("./VectorStyle"));
var _TileLayer = _interopRequireDefault(require("./TileLayer"));
var _Choropleth = _interopRequireDefault(require("./Choropleth"));
var _Boundary = _interopRequireDefault(require("./Boundary"));
var _Markers = _interopRequireDefault(require("./Markers"));
var _Events = _interopRequireDefault(require("./Events"));
var _ClientCluster = _interopRequireDefault(require("./ClientCluster"));
var _DonutCluster = _interopRequireDefault(require("./DonutCluster"));
var _ServerCluster = _interopRequireDefault(require("./ServerCluster"));
var _EarthEngine = _interopRequireDefault(require("./EarthEngine"));
var _BingLayer = _interopRequireDefault(require("./BingLayer"));
var _GeoJson = _interopRequireDefault(require("./GeoJson"));
var _LayerGroup = _interopRequireDefault(require("./LayerGroup"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  vectorStyle: _VectorStyle.default,
  //basemap /externalLayer
  tileLayer: _TileLayer.default,
  // basemap / external layer
  wmsLayer: _TileLayer.default,
  // external layer
  choropleth: _Choropleth.default,
  // thematic layer
  boundary: _Boundary.default,
  // boundary layer
  markers: _Markers.default,
  // facility layer
  events: _Events.default,
  // event layer
  clientCluster: _ClientCluster.default,
  // event layer
  donutCluster: _DonutCluster.default,
  // event layer
  serverCluster: _ServerCluster.default,
  // event layer
  earthEngine: _EarthEngine.default,
  // google earth engine layer
  bingLayer: _BingLayer.default,
  // bing layer basemap
  geoJson: _GeoJson.default,
  // tracked entity layer
  group: _LayerGroup.default // tracked entity layer
};
exports.default = _default;