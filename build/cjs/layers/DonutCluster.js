"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lodash = _interopRequireDefault(require("lodash.throttle"));
var _geometry = require("../utils/geometry.js");
var _Cluster = _interopRequireDefault(require("./Cluster.js"));
var _DonutMarker = _interopRequireDefault(require("./DonutMarker.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const segmentRow = (segment, total, formatCount) => {
  const pct = Math.round(segment.count / total * 100);
  const count = formatCount ? formatCount(segment.count) : segment.count;
  return `<div style="display:flex;align-items:center;gap:6px;padding:1px 0">` + `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${segment.color};flex-shrink:0"></span>` + `<span>${pct}% (${count})</span>` + `</div>`;
};
class DonutCluster extends _Cluster.default {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "clusters", {});
    _defineProperty(this, "clustersOnScreen", {});
    _defineProperty(this, "_showTooltipTimer", null);
    _defineProperty(this, "_hideTooltipTimer", null);
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
        opacity,
        sortSegments,
        formatCount
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
          const segments = groups.map((group, i) => _objectSpread(_objectSpread({}, group), {}, {
            count: properties[`g${group.colorGroup ?? i}`] || 0
          }));
          cluster = new _DonutMarker.default(segments, {
            opacity,
            label: properties.point_count_abbreviated
          });
          cluster.setLngLat(coordinates);
          cluster.on('click', () => {
            this.zoomToCluster(cluster_id, coordinates);
          });
          const total = properties.point_count;
          const map = this._map;
          const ac = new AbortController();
          const {
            signal
          } = ac;
          cluster.getElement().addEventListener('mouseover', () => {
            clearTimeout(this._hideTooltipTimer);
            clearTimeout(this._showTooltipTimer);
            this._showTooltipTimer = setTimeout(() => {
              const filtered = segments.filter(s => s.count > 0);
              const visible = sortSegments ? sortSegments(filtered) : filtered;
              const rows = visible.map(s => segmentRow(s, total, formatCount)).join('');
              const html = `<div>${rows}</div>`;
              map.showLabel(html, cluster.getLngLat(), {
                isHTML: true
              });
            }, 150);
          }, {
            signal
          });
          cluster.getElement().addEventListener('mouseleave', () => {
            clearTimeout(this._showTooltipTimer);
            this._hideTooltipTimer = setTimeout(() => map.hideLabel(), 150);
          }, {
            signal
          });
          cluster._listenerAc = ac;
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
          this.clusters[id]?._listenerAc?.abort();
          this.clustersOnScreen[id].remove();
          delete this.clusters[id];
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
      clusterProperties: this.options.groups.reduce((obj, group, i) => {
        const cg = group.colorGroup ?? i;
        if (process.env.NODE_ENV !== 'production' && obj[`g${cg}`]) {
          console.warn(`DonutCluster: duplicate colorGroup key g${cg}`);
        }
        obj[`g${cg}`] = ['+', ['case', ['==', ['get', 'colorGroup'], cg], 1, 0]];
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
    clearTimeout(this._showTooltipTimer);
    clearTimeout(this._hideTooltipTimer);
    super.onRemove();
    const mapgl = this.getMapGL();
    if (mapgl) {
      mapgl.off('sourcedata', this.onSourceData);
      mapgl.off('move', this.updateClusters);
      mapgl.off('moveend', this.updateClusters);
    }
    for (const id in this.clustersOnScreen) {
      this.clusters[id]?._listenerAc?.abort();
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
var _default = exports.default = DonutCluster;