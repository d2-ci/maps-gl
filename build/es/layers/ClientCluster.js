function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { featureCollection } from '../utils/geometry';
import { clusterLayer, clusterCountLayer } from '../utils/layers';
import { eventStrokeColor, clusterCountColor } from '../utils/style';
import Cluster from './Cluster';
class ClientCluster extends Cluster {
  constructor(...args) {
    super(...args);
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
      data: featureCollection(this.getFeatures())
    });
  }
  createLayers() {
    const id = this.getId();
    const {
      fillColor: color,
      strokeColor = eventStrokeColor,
      countColor = clusterCountColor
    } = this.options;
    const isInteractive = true;
    super.createLayers();

    // Clusters
    this.addLayer(clusterLayer({
      id,
      color,
      strokeColor
    }), {
      isInteractive
    });
    this.addLayer(clusterCountLayer({
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
export default ClientCluster;