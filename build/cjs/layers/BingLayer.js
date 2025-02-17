"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fetchJsonp = _interopRequireDefault(require("fetch-jsonp"));
var _geo = require("../utils/geo");
var _Layer = _interopRequireDefault(require("./Layer"));
require("./BingLayer.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// https://docs.microsoft.com/en-us/bingmaps/rest-services/directly-accessing-the-bing-maps-tiles
class BingLayer extends _Layer.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "createLayer", () => {
      const id = this.getId();
      this.addLayer({
        id: `${id}-raster`,
        type: 'raster',
        source: id
      });
    });
    _defineProperty(this, "onMetaDataLoad", metaData => {
      if (metaData.statusCode !== 200) {
        throw new Error('Bing Imagery Metadata error: \n' + JSON.stringify(metaData, null, '  '));
      }
      return metaData.resourceSets[0].resources[0];
    });
    _defineProperty(this, "updateAttribution", () => {
      const source = this.getMapGL().getSource(this.getId());
      if (source) {
        source.attribution = this.getAttribution();
        this.getMap()._updateAttributions();
      }
    });
  }
  async createSource() {
    const {
      imageUrl,
      imageUrlSubdomains,
      imageryProviders
    } = await this.loadMetaData();
    this._imageryProviders = imageryProviders;
    this.setSource(this.getId(), {
      type: 'raster',
      tiles: imageUrlSubdomains.map(subdomain => imageUrl.replace('{subdomain}', subdomain) //  + '&dpi=d2&device=mobile' // TODO
      ),
      tileSize: 256 // default is 512
    });
  }
  async addTo(map) {
    this._isLoading = true;
    await this.createSource();
    this.createLayer();
    await super.addTo(map);
    this._isLoading = false;

    // Make sure overlays are on top
    map.orderOverlays();
    this.getMapGL().on('moveend', this.updateAttribution);
    this.updateAttribution();
    this.addBingMapsLogo();
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
        container.classList.remove('dhis2-map-bing');
      }
    }
  }
  async loadMetaData() {
    const {
      apiKey,
      style = 'Road'
    } = this.options;

    // https://docs.microsoft.com/en-us/bingmaps/rest-services/common-parameters-and-types/supported-culture-codes
    const culture = 'en-GB';

    // https://docs.microsoft.com/en-us/bingmaps/rest-services/imagery/get-imagery-metadata
    const metaDataUrl = `https://dev.virtualearth.net/REST/V1/Imagery/Metadata/${style}?output=json&include=ImageryProviders&culture=${culture}&key=${apiKey}&uriScheme=https`;
    return (0, _fetchJsonp.default)(metaDataUrl, {
      jsonpCallback: 'jsonp'
    }).then(response => response.json()).then(this.onMetaDataLoad);
  }
  addBingMapsLogo() {
    const container = this.getMap().getContainer();
    const div = document.createElement('div');
    div.className = 'dhis2-map-bing-logo';
    container.appendChild(div);
    container.classList.add('dhis2-map-bing');
    this._brandLogoImg = div;
  }
  getAttribution() {
    const mapgl = this.getMapGL();
    const [lngLat1, lngLat2] = mapgl.getBounds().toArray();
    const mapBbox = [...lngLat1.reverse(), ...lngLat2.reverse()];
    const mapZoom = mapgl.getZoom() < 1 ? 1 : mapgl.getZoom();

    // TODO: boxIntersect or bboxOverlaps?
    const providers = this._imageryProviders.filter(_ref => {
      let {
        coverageAreas
      } = _ref;
      return coverageAreas.some(_ref2 => {
        let {
          bbox,
          zoomMin,
          zoomMax
        } = _ref2;
        return (0, _geo.bboxIntersect)(bbox, mapBbox) && mapZoom >= zoomMin && mapZoom <= zoomMax;
      });
    });
    return providers.map(p => p.attribution).join(', ');
  }
}
var _default = exports.default = BingLayer;