"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
var _core = require("../utils/core.js");
var _spiderifier = _interopRequireDefault(require("../utils/spiderifier.js"));
var _style = require("../utils/style.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const labelTextStyle = ({
  color,
  fontSize,
  fontWeight,
  fontStyle
} = {}) => ({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  paddingTop: '2px',
  color: color || _style.labelColor,
  fontSize: fontSize || `${_style.labelFontSize}px`,
  fontWeight: fontWeight || _style.labelFontWeight,
  fontStyle: fontStyle || _style.labelFontStyle,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
});
const Spider = function (map, options) {
  const initializeLeg = leg => {
    const {
      feature,
      elements,
      param
    } = leg;
    const {
      radius,
      fillColor,
      opacity,
      hoverLabel,
      showLabel,
      hideLabel,
      label,
      labelStyle
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
    if (label) {
      const el = document.createElement('div');
      el.textContent = (0, _core.setTemplate)(label, feature.properties);
      Object.assign(el.style, labelTextStyle(labelStyle));
      marker.style.position = 'relative';
      marker.appendChild(el);
    }
    if (hoverLabel && showLabel) {
      const content = (0, _core.setTemplate)(hoverLabel, feature.properties);
      marker.addEventListener('mouseover', evt => {
        const rect = map.getContainer().getBoundingClientRect();
        const lngLat = map.unproject({
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        });
        showLabel(content, lngLat);
      });
      marker.addEventListener('mouseleave', () => hideLabel && hideLabel());
    }
  };
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
  const spider = (0, _spiderifier.default)(map, {
    animate: true,
    animationSpeed: 200,
    customPin: true,
    initializeLeg: initializeLeg,
    onClick: onClick
  });
  let spiderId;
  const setOpacity = opacity => {
    if (spiderId) {
      spider.each(leg => leg.elements.container.style.opacity = opacity);
    }
  };
  const spiderfy = (clusterId, lnglat, features) => {
    if (clusterId !== spiderId) {
      spider.spiderfy(lnglat, features);
      spiderId = clusterId;

      // Remove before re-adding to guarantee at most one listener exists,
      // even if spiderfy is called multiple times without unspiderfy in between
      map.off('click', unspiderfy);
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
  return {
    spiderfy,
    unspiderfy,
    setOpacity,
    isExpanded,
    getId
  };
};
var _default = exports.default = Spider;