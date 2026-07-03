"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pointLabelLayer = exports.labelSource = exports.labelLayer = exports.getLabelPosition = void 0;
var _area = _interopRequireDefault(require("@turf/area"));
var _polylabel = _interopRequireDefault(require("polylabel"));
var _expressions = require("./expressions.js");
var _filters = require("./filters.js");
var _geometry = require("./geometry.js");
var _style = require("./style.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Default fonts
const fonts = {
  'normal-normal': 'Open Sans Regular',
  'normal-bold': 'Open Sans Bold',
  'italic-normal': 'Open Sans Italic',
  'italic-bold': 'Open Sans Bold Italic'
};

// Returns font and size for a label layer
const getFontConfig = (fontStyle, fontWeight, fontSize) => ({
  font: fonts[`${fontStyle || 'normal'}-${fontWeight || 'normal'}`],
  size: fontSize ? parseInt(fontSize, 10) : 12
});

// Returns offset in ems
const getOffsetEms = (type, radius = 5, fontSize = 11) => type === 'Point' ? radius / parseInt(fontSize, 10) + 0.4 : 0;

// Compiles a "{name}: {value}" style template into a MapLibre text-field
// expression, substituting labelNoData for a missing {value} token —
// mirrors the token syntax/semantics of Layer#onMouseMove's hover label
const templateExpr = (template, labelNoData = '') => {
  const regex = /\{ *([\w_-]+) *\}/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while (match = regex.exec(template)) {
    if (match.index > lastIndex) {
      parts.push(template.slice(lastIndex, match.index));
    }
    const key = match[1];
    parts.push(['case', ['has', key], ['get', key], key === 'value' ? labelNoData : '']);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < template.length) {
    parts.push(template.slice(lastIndex));
  }
  return parts.length === 1 ? parts[0] : ['concat', ...parts];
};
const labelSource = (features, {
  fontSize,
  labelNoData = ''
}, isBoundary) => ({
  type: 'geojson',
  data: (0, _geometry.featureCollection)(features.map(({
    geometry,
    properties
  }) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: getLabelPosition(geometry)
    },
    properties: {
      name: properties.name,
      anchor: geometry.type === 'Point' ? 'top' : 'center',
      offset: [0, getOffsetEms(geometry.type, properties.radius, fontSize)],
      color: isBoundary ? properties.color : '#333',
      value: properties.value ?? labelNoData
    }
  })))
});
exports.labelSource = labelSource;
const labelLayer = ({
  id,
  label,
  fontSize,
  fontStyle,
  fontWeight,
  color,
  opacity
}) => {
  const {
    font,
    size
  } = getFontConfig(fontStyle, fontWeight, fontSize);
  return {
    type: 'symbol',
    id: `${id}-label`,
    source: `${id}-label`,
    layout: {
      'text-field': label || '{name}',
      'text-font': [font],
      'text-size': size,
      'text-anchor': ['get', 'anchor'],
      'text-offset': ['get', 'offset']
    },
    paint: {
      'text-color': color ? color : ['get', 'color'],
      'text-opacity': opacity ?? _style.textOpacity
    }
  };
};

// Label layer reading directly off a (potentially clustered) point source,
// so it stays in sync with which points are currently clustered vs leaves
exports.labelLayer = labelLayer;
const pointLabelLayer = ({
  id,
  label,
  fontSize,
  fontStyle,
  fontWeight,
  color,
  opacity,
  filter,
  radius,
  labelNoData
}) => {
  const {
    font,
    size
  } = getFontConfig(fontStyle, fontWeight, fontSize);
  const offset = (radius || _style.circleRadius) / size + 0.4;
  return {
    type: 'symbol',
    id: `${id}-label`,
    source: id,
    filter: filter || _filters.isClusterPoint,
    layout: {
      'text-field': templateExpr(label || '{name}', labelNoData),
      'text-font': [font],
      'text-size': size,
      'text-anchor': 'top',
      'text-offset': [0, offset]
    },
    paint: {
      'text-color': color ? color : (0, _expressions.colorExpr)('#333'),
      'text-opacity': opacity ?? _style.textOpacity
    }
  };
};
exports.pointLabelLayer = pointLabelLayer;
const getLabelPosition = ({
  type,
  coordinates
}) => {
  if (type === 'Point') {
    return coordinates;
  }
  let polygon = coordinates;
  if (type === 'MultiPolygon') {
    const areas = coordinates.map(coords => (0, _area.default)({
      type: 'Polygon',
      coordinates: coords
    }));
    const maxIndex = areas.indexOf(Math.max.apply(null, areas));
    polygon = coordinates[maxIndex];
  }
  return (0, _polylabel.default)(polygon, 0.1);
};
exports.getLabelPosition = getLabelPosition;