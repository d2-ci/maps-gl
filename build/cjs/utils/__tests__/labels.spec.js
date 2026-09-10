"use strict";

var _filters = require("../filters.js");
var _labels = require("../labels.js");
var _style = require("../style.js");
const id = 'abc';
const opacity = 0.5;
const fontSize = 10;
const labelNoData = 'No Data';
const isBoundary = false;
const geometryPoint = {
  type: 'Point',
  coordinates: [0, 0]
};
const features = [{
  // Test a polygon
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
  },
  properties: {
    name: 'Feature1',
    radius: 1,
    value: 1
  }
}, {
  // Test a point with a valid value which is not 0
  geometry: geometryPoint,
  properties: {
    name: 'Feature2',
    radius: 1,
    value: 1
  }
}, {
  // Test a point with a valid value which is 0
  geometry: geometryPoint,
  properties: {
    name: 'Feature3',
    radius: 1,
    value: 0
  }
}, {
  // Test a point with no value
  geometry: geometryPoint,
  properties: {
    name: 'Feature4',
    radius: 1
  }
}];
const generateLabelSourceItem = ({
  coordinates,
  name,
  anchor,
  offset,
  value
}) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    },
    properties: {
      name,
      anchor,
      offset,
      color: _style.labelColor,
      value
    }
  };
};
describe('labels', () => {
  it('Handles different label sources scenario', () => {
    const expected = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
        // Label for a polygon
        generateLabelSourceItem({
          coordinates: [0.5, 0.5],
          name: 'Feature1',
          anchor: 'center',
          offset: [0, 0],
          value: 1
        }),
        // Label for a point with a valid value which is not 0
        generateLabelSourceItem({
          coordinates: [0, 0],
          name: 'Feature2',
          anchor: 'top',
          offset: [0, 0.5],
          value: 1
        }),
        // Label for a point with a valid value which is 0
        generateLabelSourceItem({
          coordinates: [0, 0],
          name: 'Feature3',
          anchor: 'top',
          offset: [0, 0.5],
          value: 0
        }),
        // Label for a point with no value
        generateLabelSourceItem({
          coordinates: [0, 0],
          name: 'Feature4',
          anchor: 'top',
          offset: [0, 0.5],
          value: 'No Data'
        })]
      }
    };
    const received = (0, _labels.labelSource)(features, {
      fontSize,
      labelNoData
    }, isBoundary);
    expect(JSON.stringify(received, null, 2)).toEqual(JSON.stringify(expected, null, 2));
  });
  it('Should set opacity for for label layer', () => {
    expect((0, _labels.labelLayer)({
      id,
      opacity
    }).paint['text-opacity']).toBe(opacity);
  });
  it('Should set default opacity for label layer', () => {
    expect((0, _labels.labelLayer)({
      id
    }).paint['text-opacity']).toBe(_style.textOpacity);
  });
  it('Should read from the point source with the cluster filter', () => {
    const layer = (0, _labels.labelClusterLayer)({
      id
    });
    expect(layer.source).toBe(id);
    expect(layer.filter).toEqual(_filters.isClusterPoint);
  });
  it('Should use a custom filter instead of the cluster default', () => {
    const filter = ['==', ['get', 'foo'], 'bar'];
    expect((0, _labels.labelClusterLayer)({
      id,
      filter
    }).filter).toEqual(filter);
  });
  it('Should default text-field to a {name} expression', () => {
    const layer = (0, _labels.labelClusterLayer)({
      id
    });
    expect(layer.layout['text-field']).toEqual(['case', ['has', 'name'], ['get', 'name'], '']);
  });
  it('Should fall back to labelNoData for a missing {value} token', () => {
    const layer = (0, _labels.labelClusterLayer)({
      id,
      label: '{name}: {value}',
      labelNoData
    });
    expect(layer.layout['text-field']).toEqual(['concat', ['case', ['has', 'name'], ['get', 'name'], ''], ': ', ['case', ['has', 'value'], ['get', 'value'], labelNoData]]);
  });
  it('Should default text-offset from circleRadius and labelFontSize', () => {
    const layer = (0, _labels.labelClusterLayer)({
      id
    });
    expect(layer.layout['text-offset']).toEqual([0, _style.circleRadius / _style.labelFontSize + 0.4]);
  });
  it('Should compute text-offset from a custom radius and fontSize', () => {
    const layer = (0, _labels.labelClusterLayer)({
      id,
      radius: 10,
      fontSize: 20
    });
    expect(layer.layout['text-offset']).toEqual([0, 10 / 20 + 0.4]);
  });
  it('Should always anchor text to top', () => {
    expect((0, _labels.labelClusterLayer)({
      id
    }).layout['text-anchor']).toBe('top');
  });
  it('Should default text-color to a labelColor expression', () => {
    const layer = (0, _labels.labelClusterLayer)({
      id
    });
    expect(layer.paint['text-color']).toEqual(['case', ['has', 'color'], ['get', 'color'], _style.labelColor]);
  });
  it('Should use a custom color instead of the default expression', () => {
    const color = '#ff0000';
    expect((0, _labels.labelClusterLayer)({
      id,
      color
    }).paint['text-color']).toBe(color);
  });
  it('Should set opacity for label cluster layer', () => {
    expect((0, _labels.labelClusterLayer)({
      id,
      opacity
    }).paint['text-opacity']).toBe(opacity);
  });
  it('Should set default opacity for label cluster layer', () => {
    expect((0, _labels.labelClusterLayer)({
      id
    }).paint['text-opacity']).toBe(_style.textOpacity);
  });
});