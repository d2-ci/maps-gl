"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _centerOfMass = _interopRequireDefault(require("@turf/center-of-mass"));
var _filters = require("../utils/filters.js");
var _geometry = require("../utils/geometry.js");
var _labels = require("../utils/labels.js");
var _layers = require("../utils/layers.js");
var _style = require("../utils/style.js");
var _Layer = _interopRequireDefault(require("./Layer.js"));
var _Spider = _interopRequireDefault(require("./Spider.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Cluster extends _Layer.default {
  constructor(options) {
    super(options);
    _defineProperty(this, "zoomToCluster", async (clusterId, center) => {
      if (this.isMaxZoom()) {
        this.spiderfy(clusterId, center);
      } else {
        const mapgl = this.getMapGL();
        const source = mapgl.getSource(this.getId());
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          if (zoom > mapgl.getZoom()) {
            mapgl.flyTo({
              center,
              zoom: zoom + 1
            });
          } else {
            this.spiderfy(clusterId, center);
          }
        } catch (err) {
          console.warn('Cluster zoom failed', err);
        }
      }
    });
    _defineProperty(this, "unspiderfy", () => {
      if (this.spider) {
        this.spider.unspiderfy();
        const mapgl = this.getMapGL();
        if (mapgl) {
          mapgl.off('zoom', this.unspiderfy);
        }
      }
    });
    // Returns all features in a cluster
    _defineProperty(this, "getClusterFeatures", async clusterId => {
      const mapgl = this.getMapGL();
      const source = mapgl.getSource(this.getId());
      if (!source) {
        return [];
      }
      try {
        const features = await source.getClusterLeaves(clusterId, Infinity, 0);
        return this.sortClusterFeatures(features);
      } catch (err) {
        console.error('Error fetching cluster leaves:', err);
        return [];
      }
    });
    // Overrided in DonutCluster
    _defineProperty(this, "sortClusterFeatures", features => features);
    _defineProperty(this, "updatePolygons", () => {
      // Returns polygons visible on the map (within the map view and not clustered)
      const polygons = this.getSourceFeatures().filter(f => f.properties.isPolygon);
      let polygonIds = [];
      if (polygons.length) {
        // Using set as features might be returned multipe times due to tiling
        polygonIds = [...new Set(polygons.map(f => f.id))].sort();
      }

      // Only update source if there is a change
      if (polygonIds.length !== this._polygonsOnMap.length || polygonIds.some((id, index) => id !== this._polygonsOnMap[index])) {
        this._polygonsOnMap = polygonIds;
        const features = polygonIds.map(id => this._polygons[id]);
        const source = this.getMapGL().getSource(`${this.getId()}-polygons`);
        source.setData((0, _geometry.featureCollection)(features));
      }
    });
    _defineProperty(this, "onSpiderClose", clusterId => {
      this.setClusterOpacity(clusterId);
    });
    this.createSource();
    this.createLayers();
  }
  setFeatures(data = []) {
    super.setFeatures(data); // Assigns id to each feature

    this._hasPolygons = data.some(f => f.geometry.type === 'Polygon');
    if (this._hasPolygons) {
      this._polygons = {};
      this._polygonsOnMap = [];

      // Translate from polygon to point before clustering
      this._features = this._features.map(f => {
        if (f.geometry.type === 'Polygon') {
          this._polygons[f.id] = f;
          return _objectSpread(_objectSpread({}, f), {}, {
            geometry: (0, _centerOfMass.default)(f).geometry,
            properties: _objectSpread(_objectSpread({}, f.properties), {}, {
              isPolygon: true
            })
          });
        }
        return f;
      });
    }
  }
  createSource(props) {
    const id = this.getId();
    this.setSource(id, _objectSpread({
      type: 'geojson',
      // One above MAP_MAX_ZOOM so clusters still exist at map ceiling and can be spiderfied
      clusterMaxZoom: _layers.MAP_MAX_ZOOM + 1,
      clusterRadius: 50
    }, props));
    this.setSource(`${id}-polygons`, {
      type: 'geojson',
      data: (0, _geometry.featureCollection)()
    });
  }
  createLayers() {
    const id = this.getId();
    const {
      fillColor: color,
      strokeColor = _style.eventStrokeColor,
      radius
    } = this.options;
    const isInteractive = true;

    // Non-clustered points
    this.addLayer((0, _layers.pointLayer)({
      id,
      color,
      strokeColor,
      radius,
      filter: _filters.isClusterPoint
    }), {
      isInteractive
    });
    this.addLabelLayer();

    // Non-clustered polygons
    this.addLayer((0, _layers.polygonLayer)({
      id,
      color,
      source: `${id}-polygons`
    }), {
      isInteractive
    });
    this.addLayer((0, _layers.outlineLayer)({
      id,
      color: strokeColor,
      source: `${id}-polygons`
    }));
  }

  // Shared by Cluster and ServerCluster (label layer reads from `id`,
  // whichever way that source's cluster/leaf split is produced)
  addLabelLayer() {
    const id = this.getId();
    const {
      label,
      labelStyle,
      radius
    } = this.options;
    if (label) {
      this.addLayer((0, _labels.pointLabelLayer)(_objectSpread(_objectSpread({}, labelStyle), {}, {
        id,
        label,
        radius
      })));
    }
  }
  setOpacity(opacity) {
    super.setOpacity(opacity);
    if (this.spider) {
      this.setClusterOpacity(this.spider.getId(), true);
      this.spider.setOpacity(opacity);
    }
  }
  async spiderfy(clusterId, lnglat) {
    if (this.spider && !this.spider.isExpanded(clusterId)) {
      this.spider.unspiderfy();
      const features = await this.getClusterFeatures(clusterId);
      this.spider.spiderfy(clusterId, lnglat, features);
      this.setClusterOpacity(clusterId, true);
      this.getMapGL().on('zoom', this.unspiderfy);
    }
  }
  setClusterOpacity(clusterId, isExpanded) {
    if (clusterId) {
      const {
        opacity
      } = this.options;
      this.getMapGL().setPaintProperty(`${this.getId()}-cluster`, 'circle-opacity', isExpanded && opacity >= 0.1 ? ['case', ['==', ['get', 'cluster_id'], clusterId], 0.1, opacity] : opacity);
    }
  }
  // Returns source features
  getSourceFeatures() {
    return this.getMapGL().querySourceFeatures(this.getId());
  }
  onAdd() {
    const mapgl = this.getMapGL();
    const {
      radius,
      fillColor,
      opacity
    } = this.options;
    const {
      hoverLabel,
      label,
      labelStyle
    } = this.options;
    this.spider = new _Spider.default(mapgl, {
      onClick: this.onClick,
      radius,
      fillColor,
      opacity,
      onClose: this.onSpiderClose,
      hoverLabel,
      showLabel: hoverLabel ? (content, lngLat) => this._map.showLabel(content, lngLat) : undefined,
      hideLabel: hoverLabel ? () => this._map.hideLabel() : undefined,
      label,
      labelStyle
    });
    this.setOpacity(this.options.opacity);
  }
  onRemove() {
    this.unspiderfy();
    this.spider = null;
  }
}
var _default = exports.default = Cluster;