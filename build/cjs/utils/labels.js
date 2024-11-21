"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labelSource = exports.labelLayer = exports.getLabelPosition = void 0;
var _area = _interopRequireDefault(require("@turf/area"));
var _polylabel = _interopRequireDefault(require("polylabel"));
var _geometry = require("./geometry");
var _style = _interopRequireDefault(require("./style"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Default fonts
const fonts = {
  'normal-normal': 'Open Sans Regular',
  'normal-bold': 'Open Sans Bold',
  'italic-normal': 'Open Sans Italic',
  'italic-bold': 'Open Sans Bold Italic'
};

// Returns offset in ems
const getOffsetEms = function (type) {
  let radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  let fontSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 11;
  return type === 'Point' ? radius / parseInt(fontSize, 10) + 0.4 : 0;
};
const labelSource = (features, _ref, isBoundary) => {
  let {
    fontSize
  } = _ref;
  return {
    type: 'geojson',
    data: (0, _geometry.featureCollection)(features.map(_ref2 => {
      let {
        geometry,
        properties
      } = _ref2;
      return {
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
          value: properties.value ?? 'No Data'
        }
      };
    }))
  };
};
exports.labelSource = labelSource;
const labelLayer = _ref3 => {
  let {
    id,
    label,
    fontSize,
    fontStyle,
    fontWeight,
    color,
    opacity
  } = _ref3;
  const font = `${fontStyle || 'normal'}-${fontWeight || 'normal'}`;
  const size = fontSize ? parseInt(fontSize, 10) : 12;
  return {
    type: 'symbol',
    id: `${id}-label`,
    source: `${id}-label`,
    layout: {
      'text-field': label || '{name}',
      'text-font': [fonts[font]],
      'text-size': size,
      'text-anchor': ['get', 'anchor'],
      'text-offset': ['get', 'offset']
    },
    paint: {
      'text-color': color ? color : ['get', 'color'],
      'text-opacity': opacity ?? _style.default.opacity
    }
  };
};
exports.labelLayer = labelLayer;
const getLabelPosition = _ref4 => {
  let {
    type,
    coordinates
  } = _ref4;
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