"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Cluster = _interopRequireDefault(require("./Cluster"));
var _geometry = require("../utils/geometry");
var _layers = require("../utils/layers");
var _style = require("../utils/style");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class ClientCluster extends _Cluster.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "onClick", evt => {
      const {
        feature
      } = evt;
      if (!feature.properties.cluster) {
        // Hack until MapLibre GL JS support string ids
        // https://github.com/mapbox/mapbox-gl-js/issues/2716
        if (typeof feature.id === 'number' && typeof feature.properties.id === 'string') {
          const {
            type,
            properties,
            geometry
          } = feature;
          const {
            id
          } = properties;
          evt.feature = {
            type,
            id,
            properties,
            geometry
          };
        }
        this.fire('click', evt);
      } else {
        this.zoomToCluster(feature.properties.cluster_id, feature.geometry.coordinates);
      }
    });
    _defineProperty(this, "onSourceData", evt => {
      if (evt.sourceId === this.getId() && this.getSourceFeatures().length) {
        this.getMapGL().off('sourcedata', this.onSourceData);
        this.updatePolygons();
      }
    });
    // Returns all features in a cluster
    _defineProperty(this, "getClusterFeatures", clusterId => new Promise((resolve, reject) => {
      const mapgl = this.getMapGL();
      const source = mapgl.getSource(this.getId());
      source.getClusterLeaves(clusterId, null, null, (error, features) => error ? reject(error) : resolve(features));
    }));
  }
  createSource() {
    super.createSource({
      cluster: true,
      data: (0, _geometry.featureCollection)(this.getFeatures())
    });
  }
  createLayers() {
    const id = this.getId();
    const {
      fillColor: color,
      strokeColor = _style.eventStrokeColor,
      countColor = _style.clusterCountColor
    } = this.options;
    const isInteractive = true;
    super.createLayers();

    // Clusters
    this.addLayer((0, _layers.clusterLayer)({
      id,
      color,
      strokeColor
    }), {
      isInteractive
    });
    this.addLayer((0, _layers.clusterCountLayer)({
      id,
      color: countColor
    }));
  }
  onAdd() {
    super.onAdd();
    if (this._hasPolygons) {
      const mapgl = this.getMapGL();
      mapgl.on('sourcedata', this.onSourceData);
      mapgl.on('moveend', this.updatePolygons);
      this.updatePolygons();
    }
  }
  onRemove() {
    super.onRemove();
    if (this._hasPolygons) {
      const mapgl = this.getMapGL();
      if (mapgl) {
        mapgl.off('sourcedata', this.onSourceData);
        mapgl.off('moveend', this.updatePolygons);
      }
    }
  }
}
var _default = exports.default = ClientCluster;