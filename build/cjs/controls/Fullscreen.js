"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
// Extended to include map name and legend in fullscreen for dashboard maps
class Fullscreen extends _maplibreGl.FullscreenControl {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(options);
    this.options = options;
  }
  addTo(map) {
    this._eventMap = map;
    this._map = map.getMapGL();
    this._map.addControl(this);
  }
  onAdd(map) {
    const {
      isSplitView
    } = this.options;

    // Default fullscreen container
    this._container = map.getContainer().parentNode.parentNode;
    if (isSplitView) {
      this._container = this._container.parentNode;
    }
    return super.onAdd(map);
  }
  _onClickFullscreen() {
    this._eventMap.fire('fullscreenchange', {
      isFullscreen: !this._isFullscreen()
    });
    super._onClickFullscreen();
  }
  _changeIcon() {
    this._map.resize();
    super._changeIcon();
  }
}
var _default = exports.default = Fullscreen;