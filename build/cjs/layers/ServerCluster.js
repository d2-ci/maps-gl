"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sphericalmercator = _interopRequireDefault(require("@mapbox/sphericalmercator"));
var _centroid = _interopRequireDefault(require("@turf/centroid"));
var _Cluster = _interopRequireDefault(require("./Cluster"));
var _layers = require("../utils/layers");
var _filters = require("../utils/filters");
var _geometry = require("../utils/geometry");
var _style = require("../utils/style");
var _geo = require("../utils/geo");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class ServerCluster extends _Cluster.default {
  constructor(options) {
    super(_objectSpread({
      tileSize: 512,
      clusterSize: 110,
      maxSpiderSize: 500,
      debug: true
    }, options));
    _defineProperty(this, "currentTiles", []);
    _defineProperty(this, "currentClusters", []);
    _defineProperty(this, "currentClusterIds", '');
    _defineProperty(this, "currentZoom", 0);
    _defineProperty(this, "tileClusters", {});
    _defineProperty(this, "cluserCount", 0);
    // Meters per pixel
    _defineProperty(this, "getResolution", zoom => Math.PI * _geo.earthRadius * 2 / this.options.tileSize / Math.pow(2, zoom));
    // Replace clusters within the same tile bounds
    _defineProperty(this, "updateClusters", tiles => {
      const clusters = tiles.reduce((newClusters, tileId) => {
        const [z, x, y] = tileId.split('/');
        const isOutsideBounds = this.isOutsideBounds(this.getTileBounds(x, y, z));
        return [...newClusters.filter(isOutsideBounds), ...this.tileClusters[tileId]];
      }, this.currentClusters);
      const clusterIds = this.getClusterIds(clusters);
      if (this.currentClusterIds !== clusterIds) {
        const source = this.getMapGL().getSource(this.getId());
        source.setData((0, _geometry.featureCollection)(clusters));
        this.currentClusterIds = clusterIds;
        this.currentClusters = clusters;
      }
    });
    _defineProperty(this, "onClick", evt => {
      const {
        geometry,
        properties
      } = evt.feature;
      const {
        cluster,
        bounds,
        id,
        cluster_id
      } = properties;
      if (cluster) {
        if (id) {
          this.spiderfy(cluster_id, geometry.coordinates);
        } else {
          this.zoomToBounds(bounds);
        }
      } else {
        this.fire('click', evt);
      }
    });
    // Load clusters when new tiles are requested
    _defineProperty(this, "onSourceData", evt => {
      if (evt.sourceId === this.getId() && evt.tile) {
        const tileId = this.getTileId(evt.tile);
        if (!this.tileClusters[tileId]) {
          this.tileClusters[tileId] = 'pending';
          this._isLoading = true;
          this.options.load(this.getTileParams(tileId), this.onTileLoad);
        }
      }
    });
    _defineProperty(this, "onMoveEnd", async () => {
      const tiles = await this.getVisibleTiles();
      if (tiles.join('-') !== this.currentTiles.join('-')) {
        this.currentTiles = tiles;
        const cachedTiles = tiles.filter(id => Array.isArray(this.tileClusters[id]));
        if (cachedTiles.length) {
          this.updateClusters(cachedTiles);
        }
      }
    });
    // Keep tile clusters in memory and update map if needed
    _defineProperty(this, "onTileLoad", async (tileId, clusters) => {
      this.tileClusters[tileId] = clusters;

      // Check if tile is still visible after loading
      const visibleTiles = await this.getVisibleTiles();
      if (visibleTiles.includes(tileId)) {
        this.updateClusters([tileId]);
      }
      this._isLoading = false;
    });
    _defineProperty(this, "getBounds", () => this.options.bounds);
    // Returns true if all tiles aligns with the zoom level
    _defineProperty(this, "areTilesUpdated", () => {
      const mapgl = this._map.getMapGL();
      const zoom = Math.floor(mapgl.getZoom());
      return this.getSourceCacheTiles().every(_ref => {
        let {
          tileID
        } = _ref;
        return tileID.canonical.z === zoom;
      });
    });
    _defineProperty(this, "getSourceCacheTiles", () => {
      const mapgl = this._map.getMapGL();
      const sourceCache = mapgl.style.sourceCaches[this.getId()];
      return sourceCache ? Object.values(sourceCache._tiles) : [];
    });
    // Called by parent class
    _defineProperty(this, "getClusterFeatures", clusterId => {
      const cluster = this.currentClusters.find(c => c.id === clusterId);
      if (cluster) {
        return cluster.properties.id.split(',').slice(0, this.options.maxSpiderSize).map(id => ({
          type: 'Feature',
          id,
          geometry: cluster.geometry,
          properties: {
            id
          }
        }));
      }
    });
    // Returms true if geometry is outside bounds
    _defineProperty(this, "isOutsideBounds", bounds => _ref2 => {
      let {
        geometry
      } = _ref2;
      const {
        coordinates
      } = geometry.type === 'Point' ? geometry : (0, _centroid.default)(geometry).geometry;
      const [lng, lat] = coordinates;
      return lng <= bounds[0] || lng >= bounds[2] || lat <= bounds[1] || lat >= bounds[3];
    });
    _defineProperty(this, "getVisibleTiles", async () => {
      while (!this.areTilesUpdated()) {
        await new Promise(r => setTimeout(r, 100));
      }
      return this.getSourceCacheTiles().map(this.getTileId).sort();
    });
    // Returns sorted array of cluster ids
    _defineProperty(this, "getClusterIds", clusters => clusters.map(c => c.id).sort((a, b) => a - b).join());
    const merc = new _sphericalmercator.default({
      size: this.options.tileSize
    });
    this.getTileBounds = (x, y, z) => merc.bbox(x, y, z);
  }
  createSource() {
    super.createSource({
      data: (0, _geometry.featureCollection)()
    });
  }
  createLayers() {
    const id = this.getId();
    const {
      fillColor: color,
      strokeColor = _style.eventStrokeColor,
      countColor = _style.clusterCountColor,
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

    // Non-clustered polygons
    this.addLayer((0, _layers.polygonLayer)({
      id,
      color
    }), {
      isInteractive
    });
    this.addLayer((0, _layers.outlineLayer)({
      id,
      color: strokeColor
    }));

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
  getTileId(tile) {
    const {
      x,
      y,
      z
    } = tile.tileID.canonical;
    return `${z}/${x}/${y}`;
  }
  getTileParams(tileId) {
    const [z, x, y] = tileId.split('/');
    const {
      clusterSize
    } = this.options;
    const mapgl = this._map.getMapGL();
    return {
      tileId: tileId,
      bbox: this.getTileBounds(x, y, z).join(','),
      clusterSize: Math.round(this.getResolution(z) * clusterSize),
      includeClusterPoints: Number(z) === mapgl.getMaxZoom()
    };
  }
  onAdd() {
    super.onAdd();
    const mapgl = this._map.getMapGL();
    mapgl.on('sourcedata', this.onSourceData);
    mapgl.on('moveend', this.onMoveEnd);
  }
  onRemove() {
    super.onRemove();
    const mapgl = this._map.getMapGL();
    if (mapgl) {
      mapgl.off('sourcedata', this.onSourceData);
      mapgl.off('moveend', this.onMoveEnd);
    }
  }
  zoomToBounds(bounds) {
    if (bounds) {
      let zoomBounds;
      if (Array.isArray(bounds)) {
        zoomBounds = bounds;
      } else if (typeof bounds === 'string') {
        // https://github.com/mapbox/mapbox-gl-js/issues/2434
        try {
          zoomBounds = JSON.parse(bounds);
        } catch (evt) {
          return;
        }
      }
      if (zoomBounds) {
        this._map.getMapGL().fitBounds(zoomBounds, {
          padding: 40
        });
      }
    }
  }
}
var _default = ServerCluster;
exports.default = _default;