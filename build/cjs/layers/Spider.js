"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
var _spiderifier = _interopRequireDefault(require("../utils/spiderifier"));
var _style = require("../utils/style");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Spider = function (map, options) {
  let spider;
  let spiderId;
  const initializeLeg = leg => {
    const {
      feature,
      elements,
      param
    } = leg;
    const {
      radius,
      fillColor,
      opacity
    } = options;
    const color = feature.properties.color || fillColor;
    const marker = document.createElement('div');
    const {
      angle
    } = param;
    const deltaX = Math.cos(angle) * radius;
    const deltaY = Math.sin(angle) * radius;
    marker.setAttribute('style', `
            width: ${radius * 2}px;
            height: ${radius * 2}px;
            margin-left: -${radius}px;
            margin-top: -${radius}px;
            background-color: ${color};
            border: ${_style.strokeWidth}px solid ${_style.eventStrokeColor};
            border-radius: 50%;
            transform: translate(${deltaX}px, ${deltaY}px);`);
    elements.container.style.opacity = opacity;
    elements.pin.appendChild(marker);
  };
  const setOpacity = opacity => {
    if (spiderId) {
      spider.each(leg => leg.elements.container.style.opacity = opacity);
    }
  };
  const spiderfy = (clusterId, lnglat, features) => {
    if (clusterId !== spiderId) {
      spider.spiderfy(lnglat, features);
      spiderId = clusterId;
      map.on('click', unspiderfy);
    }
  };
  const unspiderfy = () => {
    if (spiderId) {
      spider.unspiderfy();
      if (options.onClose) {
        options.onClose(spiderId);
      }
      spiderId = null;
      map.off('click', unspiderfy);
    }
  };
  const isExpanded = clusterId => clusterId === spiderId;
  const getId = () => spiderId;
  const onClick = (evt, leg) => {
    evt.stopPropagation();
    const {
      feature,
      marker,
      param
    } = leg;
    const {
      angle,
      legLength
    } = param;
    const length = legLength + options.radius;
    const offset = new _maplibreGl.Point(length * Math.cos(angle), length * Math.sin(angle));
    const point = map.project(marker.getLngLat()).add(offset);
    const {
      lng,
      lat
    } = map.unproject(point);
    options.onClick({
      type: 'click',
      coordinates: [lng, lat],
      position: [evt.x, evt.pageY || evt.y],
      feature: feature
    });
  };
  spider = (0, _spiderifier.default)(map, {
    animate: true,
    animationSpeed: 200,
    customPin: true,
    initializeLeg: initializeLeg,
    onClick: onClick
  });
  return {
    spiderfy,
    unspiderfy,
    setOpacity,
    isExpanded,
    getId
  };
};
var _default = Spider;
exports.default = _default;