function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import throttle from 'lodash.throttle';
import { featureCollection } from '../utils/geometry';
import Cluster from './Cluster';
import DonutMarker from './DonutMarker';
class DonutCluster extends Cluster {
  constructor(...args) {
    super(...args);
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
    _defineProperty(this, "updateClusters", throttle(() => {
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
          cluster = new DonutMarker(segments, {
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
      clusterProperties: this.options.groups.reduce((obj, {
        color
      }) => {
        obj[color] = ['+', ['case', ['==', ['get', 'color'], color], 1, 0]];
        return obj;
      }, {}),
      data: featureCollection(this.getFeatures())
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
export default DonutCluster;