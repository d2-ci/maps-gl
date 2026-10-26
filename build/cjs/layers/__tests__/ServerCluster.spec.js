"use strict";

var _filters = require("../../utils/filters.js");
var _ServerCluster = _interopRequireDefault(require("../ServerCluster.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const findLabelLayer = cluster => cluster.getLayers().find(layer => layer.id === `${cluster.getId()}-label`);
describe('ServerCluster', () => {
  it('Should not add a label layer when label is not set', () => {
    const cluster = new _ServerCluster.default({});
    expect(findLabelLayer(cluster)).toBeUndefined();
  });
  it('Should inherit addLabelLayer from Cluster', () => {
    const cluster = new _ServerCluster.default({
      label: '{name}'
    });
    const layer = findLabelLayer(cluster);
    expect(layer).toBeDefined();
    expect(layer.source).toBe(cluster.getId());
    expect(layer.filter).toEqual(_filters.isClusterPoint);
  });
  it('Should apply labelStyle to the label layer', () => {
    const cluster = new _ServerCluster.default({
      label: '{name}',
      labelStyle: {
        fontSize: 14,
        color: '#fff'
      }
    });
    const layer = findLabelLayer(cluster);
    expect(layer.layout['text-size']).toBe(14);
    expect(layer.paint['text-color']).toBe('#fff');
  });
});