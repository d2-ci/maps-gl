function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import Layer from './Layer.js';
import './AzureLayer.css';

// https://learn.microsoft.com/en-us/rest/api/maps/render/get-map-tile
class AzureLayer extends Layer {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "createLayer", () => {
      const id = this.getId();
      const {
        style
      } = this.options;
      style.forEach(tilesetId => {
        this.addLayer({
          id: `${id}-${tilesetId}-raster`,
          type: 'raster',
          source: `${id}-${tilesetId}`
        });
      });
    });
    _defineProperty(this, "getAttribution", async () => {
      const {
        apiKey,
        style
      } = this.options;
      const mapgl = this.getMapGL();
      const [sw, ne] = mapgl.getBounds().toArray(); // [[sw_lng, sw_lat], [ne_lng, ne_lat]]
      const mapBbox = [sw[0], sw[1], ne[0], ne[1]];
      const mapZoom = Math.floor(mapgl.getZoom());

      // https://learn.microsoft.com/en-us/azure/azure-maps/how-to-show-attribution
      const promises = style.map(tilesetId => {
        const urlAttributions = `https://atlas.microsoft.com/map/attribution?subscription-key=${apiKey}&api-version=2024-04-01&tilesetId=${tilesetId}&zoom=${mapZoom}&bounds=${mapBbox.join(',')}`;
        return fetch(urlAttributions).then(response => response.json());
      });
      const results = await Promise.all(promises);
      const attributions = [...new Set(results.flatMap(r => r?.copyrights || []))];
      return attributions.join(', ') || '';
    });
    _defineProperty(this, "updateAttribution", async () => {
      const id = this.getId();
      const {
        style
      } = this.options;
      const source = this.getMapGL().getSource(`${id}-${style[0]}`);
      if (source) {
        source.attribution = await this.getAttribution();
        this.getMap()._updateAttributions();
      }
    });
  }
  createSource() {
    const {
      apiKey,
      style
    } = this.options;
    style.forEach(tilesetId => {
      this.setSource(`${this.getId()}-${tilesetId}`, {
        type: 'raster',
        tiles: [`https://atlas.microsoft.com/map/tile?api-version=2.1&tilesetId=${tilesetId}&zoom={z}&x={x}&y={y}&subscription-key=${apiKey}`],
        tileSize: 256
      });
    });
  }
  async addTo(map) {
    this._isLoading = true;
    this.createSource();
    this.createLayer();
    await super.addTo(map);
    this._isLoading = false;

    // Make sure overlays are on top
    map.orderOverlays();
    this.getMapGL().on('moveend', this.updateAttribution);
    this.updateAttribution();
    this.addAzureMapsLogo();
    if (this.options.opacity !== undefined) {
      this.setOpacity(this.options.opacity);
    }
  }
  onRemove() {
    const mapgl = this.getMapGL();
    if (mapgl) {
      mapgl.off('moveend', this.updateAttribution);
      if (this._brandLogoImg) {
        const container = mapgl.getContainer();
        container.removeChild(this._brandLogoImg);
        container.classList.remove('dhis2-map-azure');
      }
    }
  }
  addAzureMapsLogo() {
    const container = this.getMap().getContainer();
    const div = document.createElement('div');
    div.className = 'dhis2-map-azure-logo';
    container.appendChild(div);
    container.classList.add('dhis2-map-azure');
    this._brandLogoImg = div;
  }
}
export default AzureLayer;