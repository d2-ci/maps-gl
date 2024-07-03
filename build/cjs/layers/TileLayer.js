"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Layer = _interopRequireDefault(require("./Layer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class TileLayer extends _Layer.default {
  constructor(options) {
    super(options);
    this.createSource();
    this.createLayer();
  }
  createSource() {
    const {
      url,
      layers,
      format = 'image/png',
      attribution = ''
    } = this.options;
    let tiles;
    if (layers) {
      // WMS
      tiles = [`${url}?bbox={bbox-epsg-3857}&format=${format}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=${layers}`];
    } else if (url.includes('{s}')) {
      tiles = ['a', 'b', 'c'].map(letter => url.replace('{s}', letter));
    } else {
      tiles = [url];
    }
    this.setSource(this.getId(), {
      type: 'raster',
      tiles,
      tileSize: 256,
      attribution
    });
  }
  createLayer() {
    const id = this.getId();
    this.addLayer({
      id: `${id}-raster`,
      type: 'raster',
      source: id
    });
  }
}
var _default = exports.default = TileLayer;