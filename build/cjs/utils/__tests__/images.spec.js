"use strict";

var _images = require("../images.js");
describe('transformRequest', () => {
  it('adds credentials to image requests', () => {
    const url = 'https://example.com/icon.png';
    expect((0, _images.transformRequest)(url, 'Image')).toEqual({
      url,
      credentials: 'include'
    });
  });
  it('does not touch other resource types', () => {
    expect((0, _images.transformRequest)('https://example.com/tile.pbf', 'Tile')).toBeNull();
  });
});
describe('composeTransformRequest', () => {
  it('returns the first non-null result, trying functions in order', () => {
    const first = jest.fn(() => null);
    const second = jest.fn(() => ({
      url: 'https://example.com/b'
    }));
    const third = jest.fn(() => ({
      url: 'https://example.com/c'
    }));
    const combined = (0, _images.composeTransformRequest)(first, second, third);
    expect(combined('https://example.com/a', 'Glyphs')).toEqual({
      url: 'https://example.com/b'
    });
    expect(first).toHaveBeenCalledWith('https://example.com/a', 'Glyphs');
    expect(second).toHaveBeenCalledWith('https://example.com/a', 'Glyphs');
    expect(third).not.toHaveBeenCalled();
  });
  it('returns null when every function returns null', () => {
    const combined = (0, _images.composeTransformRequest)(() => null, () => null);
    expect(combined('https://example.com/a', 'Tile')).toBeNull();
  });
  it('skips undefined/missing functions without throwing', () => {
    const combined = (0, _images.composeTransformRequest)(undefined, () => ({
      url: 'https://example.com/b'
    }));
    expect(() => combined('https://example.com/a', 'Glyphs')).not.toThrow();
    expect(combined('https://example.com/a', 'Glyphs')).toEqual({
      url: 'https://example.com/b'
    });
  });
  it('composes the library image transformRequest with an app-supplied one', () => {
    const appTransformRequest = (url, resourceType) => resourceType === 'Glyphs' ? {
      url: 'https://example.com/glyph'
    } : null;
    const combined = (0, _images.composeTransformRequest)(_images.transformRequest, appTransformRequest);
    expect(combined('https://example.com/icon.png', 'Image')).toEqual({
      url: 'https://example.com/icon.png',
      credentials: 'include'
    });
    expect(combined('https://example.com/font.pbf', 'Glyphs')).toEqual({
      url: 'https://example.com/glyph'
    });
  });
});