function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import centerOfMass from '@turf/center-of-mass';
import Layer from './Layer';
import Spider from './Spider';
import { pointLayer, polygonLayer, outlineLayer } from '../utils/layers';
import { isClusterPoint } from '../utils/filters';
import { featureCollection } from '../utils/geometry';
import { eventStrokeColor } from '../utils/style';
class Cluster extends Layer {
  constructor(options) {
    super(options);
    _defineProperty(this, "zoomToCluster", (clusterId, center) => {
      if (this.isMaxZoom()) {
        this.spiderfy(clusterId, center);
      } else {
        const mapgl = this.getMapGL();
        const source = mapgl.getSource(this.getId());
        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error) return;
          mapgl.easeTo({
            center,
            zoom: zoom + 1
          });
        });
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
    _defineProperty(this, "getClusterFeatures", clusterId => new Promise((resolve, reject) => {
      const mapgl = this.getMapGL();
      const source = mapgl.getSource(this.getId());
      source.getClusterLeaves(clusterId, null, null, (error, features) => error ? reject(error) : resolve(this.sortClusterFeatures(features)));
    }));
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
        source.setData(featureCollection(features));
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
            geometry: centerOfMass(f).geometry,
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
      clusterMaxZoom: 19,
      clusterRadius: 50
    }, props));
    this.setSource(`${id}-polygons`, {
      type: 'geojson',
      data: featureCollection()
    });
  }
  createLayers() {
    const id = this.getId();
    const {
      fillColor: color,
      strokeColor = eventStrokeColor,
      radius
    } = this.options;
    const isInteractive = true;

    // Non-clustered points
    this.addLayer(pointLayer({
      id,
      color,
      strokeColor,
      radius,
      filter: isClusterPoint
    }), {
      isInteractive
    });

    // Non-clustered polygons
    this.addLayer(polygonLayer({
      id,
      color,
      source: `${id}-polygons`
    }), {
      isInteractive
    });
    this.addLayer(outlineLayer({
      id,
      color: strokeColor,
      source: `${id}-polygons`
    }));
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
    this.spider = new Spider(mapgl, {
      onClick: this.onClick,
      radius,
      fillColor,
      opacity,
      onClose: this.onSpiderClose
    });
    this.setOpacity(this.options.opacity);
  }
  onRemove() {
    this.unspiderfy();
    this.spider = null;
  }
}
export default Cluster;