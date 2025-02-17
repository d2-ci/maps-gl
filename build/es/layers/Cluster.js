function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import centerOfMass from '@turf/center-of-mass';
import { isClusterPoint } from '../utils/filters';
import { featureCollection } from '../utils/geometry';
import { pointLayer, polygonLayer, outlineLayer } from '../utils/layers';
import { eventStrokeColor } from '../utils/style';
import Layer from './Layer';
import Spider from './Spider';
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
          if (error) {
            return;
          }
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