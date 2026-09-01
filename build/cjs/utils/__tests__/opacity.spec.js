"use strict";

var _opacity = require("../opacity.js");
const createMapGL = (layerIds = []) => ({
  getStyle: jest.fn(() => ({
    layers: layerIds.map(id => ({
      id
    }))
  })),
  setPaintProperty: jest.fn()
});
describe('opacity', () => {
  it('scales a raster sub-layer', () => {
    const mapgl = createMapGL(['layer1-raster']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-raster', 'raster-opacity', 0.5);
  });
  it('scales a point sub-layer across both circle paint properties', () => {
    const mapgl = createMapGL(['layer1-point']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-point', 'circle-opacity', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-point', 'circle-stroke-opacity', 0.5);
  });
  it('scales a polygon sub-layer', () => {
    const mapgl = createMapGL(['layer1-polygon']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-polygon', 'fill-opacity', 0.5);
  });
  it('scales a line sub-layer', () => {
    const mapgl = createMapGL(['layer1-line']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-line', 'line-opacity', 0.5);
  });
  it('scales an outline sub-layer', () => {
    const mapgl = createMapGL(['layer1-outline']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-outline', 'line-opacity', 0.5);
  });
  it('scales a label sub-layer', () => {
    const mapgl = createMapGL(['layer1-label']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-label', 'text-opacity', 0.5);
  });
  it('scales a symbol sub-layer across both icon and text paint properties', () => {
    const mapgl = createMapGL(['layer1-symbol']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-symbol', 'icon-opacity', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-symbol', 'text-opacity', 0.5);
  });
  it('scales a cluster sub-layer across both circle paint properties', () => {
    const mapgl = createMapGL(['layer1-cluster']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-cluster', 'circle-opacity', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-cluster', 'circle-stroke-opacity', 0.5);
  });
  it('scales a count sub-layer', () => {
    const mapgl = createMapGL(['layer1-count']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-count', 'text-opacity', 0.5);
  });
  it('dampens a buffer sub-layer to 20% of the requested opacity', () => {
    const mapgl = createMapGL(['layer1-buffer']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 1);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-buffer', 'fill-opacity', 0.2);
  });
  it('leaves a buffer-outline sub-layer at full opacity, unlike its buffer fill', () => {
    const mapgl = createMapGL(['layer1-buffer-outline']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 1);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-buffer-outline', 'line-opacity', 1);
  });
  it('only touches layers whose id has the given prefix', () => {
    const mapgl = createMapGL(['layer1-line', 'layer2-line']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).toHaveBeenCalledTimes(1);
    expect(mapgl.setPaintProperty).toHaveBeenCalledWith('layer1-line', 'line-opacity', 0.5);
  });
  it('ignores sub-layers with an unrecognised suffix', () => {
    const mapgl = createMapGL(['layer1-unknown']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.setPaintProperty).not.toHaveBeenCalled();
  });
  it('caches the matching sub-layer ids instead of re-reading the style every call', () => {
    const mapgl = createMapGL(['layer1-line']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 1);
    expect(mapgl.getStyle).toHaveBeenCalledTimes(1);
  });
  it('re-reads the style for that id again once its cache is cleared', () => {
    const mapgl = createMapGL(['layer1-line']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    (0, _opacity.clearLayerOpacityCache)(mapgl, 'layer1');
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    expect(mapgl.getStyle).toHaveBeenCalledTimes(2);
  });
  it('clearing one id does not evict another cached id for the same mapgl', () => {
    const mapgl = createMapGL(['layer1-line', 'layer2-line']);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer1', 0.5);
    (0, _opacity.setLayersOpacity)(mapgl, 'layer2', 0.5);
    (0, _opacity.clearLayerOpacityCache)(mapgl, 'layer1');
    mapgl.getStyle.mockClear();
    (0, _opacity.setLayersOpacity)(mapgl, 'layer2', 0.5);
    expect(mapgl.getStyle).not.toHaveBeenCalled();
  });
  it('does not throw when clearing an id that was never cached', () => {
    const mapgl = createMapGL();
    expect(() => (0, _opacity.clearLayerOpacityCache)(mapgl, 'layer1')).not.toThrow();
  });
});