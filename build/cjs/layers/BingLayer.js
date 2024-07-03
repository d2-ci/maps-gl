"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fetchJsonp = _interopRequireDefault(require("fetch-jsonp"));
var _Layer = _interopRequireDefault(require("./Layer"));
var _geo = require("../utils/geo");
require("./BingLayer.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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