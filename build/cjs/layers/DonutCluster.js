"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lodash = _interopRequireDefault(require("lodash.throttle"));
var _Cluster = _interopRequireDefault(require("./Cluster"));
var _DonutMarker = _interopRequireDefault(require("./DonutMarker"));
var _geometry = require("../utils/geometry");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class DonutCluster extends _Cluster.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "clusters", {});
    _defineProperty(this, "clustersOnScreen", {});
    _defineProperty(this, "onSourceData", evt => {
      if (evt.sourceId === this.getId() && this.getSourceFeatures().length) {
        this.updateClusters();
      }
    });
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
    // Sort cluster features after legend colors before spiderfy
    _defineProperty(this, "sortClusterFeatures", features => {
      const colors = this.options.groups.map(g => g.color);
      return features.sort((f1, f2) => {
        const a = colors.indexOf(f1.properties.color);
        const b = colors.indexOf(f2.properties.color);
        return (a > b) - (a < b);
      });
    });
    // TODO: Is throttle needed?
    _defineProperty(this, "updateClusters", (0, _lodash.default)(() => {
      const {
        groups,
        opacity
      } = this.options;
      const newClusters = {};
      const features = this.getSourceFeatures();

      // For every cluster on the screen, create an donut marker
      for (let i = 0; i < features.length; i++) {
        const {
          geometry,
          properties
        } = features[i];
        const {
          coordinates
        } = geometry;
        const {
          cluster: isCluster,
          cluster_id
        } = properties;
        if (!isCluster) {
          continue;
        }
        let cluster = this.clusters[cluster_id];
        if (!cluster) {
          const segments = groups.map(group => _objectSpread(_objectSpread({}, group), {}, {
            count: properties[group.color]
          }));
          cluster = new _DonutMarker.default(segments, {
            opacity
          });
          cluster.setLngLat(coordinates);
          cluster.on('click', () => {
            this.zoomToCluster(cluster_id, coordinates);
          });
          this.clusters[cluster_id] = cluster;
        }
        newClusters[cluster_id] = cluster;

        // Add it to the map if it's not there already
        if (!this.clustersOnScreen[cluster_id]) {
          cluster.addTo(this.getMapGL());
        }
      }

      // For every cluster we've added previously, remove those that are no longer visible
      for (const id in this.clustersOnScreen) {
        if (!newClusters[id]) {
          this.clustersOnScreen[id].remove();
        }
      }
      this.clustersOnScreen = newClusters;
      if (this._hasPolygons) {
        this.updatePolygons();
      }
    }, 100));
  }
  createSource() {
    super.createSource({
      cluster: true,
      clusterProperties: this.options.groups.reduce((obj, _ref) => {
        let {
          color
        } = _ref;
        obj[color] = ['+', ['case', ['==', ['get', 'color'], color], 1, 0]];
        return obj;
      }, {}),
      data: (0, _geometry.featureCollection)(this.getFeatures())
    });
  }
  onAdd() {
    super.onAdd();
    const mapgl = this.getMapGL();
    mapgl.on('sourcedata', this.onSourceData);
    mapgl.on('move', this.updateClusters);
    mapgl.on('moveend', this.updateClusters);
    this.updateClusters();
  }
  onRemove() {
    super.onRemove();
    const mapgl = this.getMapGL();
    if (mapgl) {
      mapgl.off('sourcedata', this.onSourceData);
      mapgl.off('move', this.updateClusters);
      mapgl.off('moveend', this.updateClusters);
    }
    for (const id in this.clustersOnScreen) {
      this.clustersOnScreen[id].remove();
    }
    this.clustersOnScreen = {};
    this.clusters = {};
  }
  setOpacity(opacity) {
    super.setOpacity(opacity);
    if (this.isOnMap()) {
      for (const id in this.clusters) {
        this.clusters[id].setOpacity(opacity);
      }
    }
  }
  setClusterOpacity(clusterId, isExpanded) {
    if (clusterId) {
      const cluster = this.clusters[clusterId];
      const {
        opacity
      } = this.options;
      if (cluster) {
        cluster.setOpacity(isExpanded ? opacity < 0.1 ? opacity : 0.1 : opacity);
      }
    }
  }
  setVisibility(isVisible) {
    super.setVisibility(isVisible);
    if (this.isOnMap()) {
      for (const id in this.clusters) {
        this.clusters[id].setVisibility(isVisible);
      }
    }
  }
}
var _default = DonutCluster;
exports.default = _default;