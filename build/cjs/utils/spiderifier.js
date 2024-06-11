"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _maplibreGl = require("maplibre-gl");
require("./spiderifier.css");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*
 * This file is based on https://github.com/bewithjonam/maplibregl-spiderifier (MIT License)
 * It was adapted to support maplibre-gl
 *
 * MIT License
 *
 * Copyright (c) 2016 manoj kumar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */ // Utility
const util = {
  each: (array, iterator) => {
    if (!array || !array.length) {
      return [];
    }
    for (let i = 0; i < array.length; i++) {
      iterator(array[i], i);
    }
  },
  eachTimes: (count, iterator) => {
    if (!count) {
      return [];
    }
    for (let i = 0; i < count; i++) {
      iterator(i);
    }
  },
  map: (array, iterator) => {
    const result = [];
    util.each(array, (item, i) => result.push(iterator(item, i)));
    return result;
  },
  mapTimes: (count, iterator) => {
    const result = [];
    util.eachTimes(count, i => result.push(iterator(i)));
    return result;
  }
};
const spiderifier = (map, userOptions) => {
  const options = _objectSpread({
    animate: false,
    // to animate the spiral
    animationSpeed: 0,
    // animation speed in milliseconds
    customPin: false,
    // If false, sets a default icon for pins in spider legs.
    initializeLeg: () => {},
    onClick: () => {},
    // --- <SPIDER TUNING Params>
    // circleSpiralSwitchover: show spiral instead of circle from this marker count upwards
    // 0 -> always spiral; Infinity -> always circle
    circleSpiralSwitchover: 9,
    circleFootSeparation: 25,
    // related to circumference of circle
    spiralFootSeparation: 28,
    // related to size of spiral (experiment!)
    spiralLengthStart: 15,
    // ditto
    spiralLengthFactor: 4
  }, userOptions);
  const twoPi = Math.PI * 2;
  let previousSpiderLegs = [];

  // Private:
  const unspiderfy = () => {
    util.each(previousSpiderLegs.reverse(), (spiderLeg, index) => {
      if (options.animate) {
        spiderLeg.elements.container.style['transitionDelay'] = options.animationSpeed / 1000 / previousSpiderLegs.length * index + 's';
        spiderLeg.elements.container.className += ' exit';
        setTimeout(() => spiderLeg.marker.remove(), options.animationSpeed + 100); //Wait for 100ms more before clearing the DOM
      } else {
        spiderLeg.marker.remove();
      }
    });
    previousSpiderLegs = [];
  };
  const spiderfy = (latLng, features) => {
    const spiderLegParams = generateSpiderLegParams(features.length);
    unspiderfy();
    const spiderLegs = util.map(features, (feature, index) => {
      const param = spiderLegParams[index];
      const elements = createMarkerElements(param, feature);
      const marker = new _maplibreGl.Marker(elements.container).setLngLat(latLng);
      const spiderLeg = {
        feature,
        elements,
        marker,
        param
      };
      options.initializeLeg(spiderLeg);
      elements.container.onclick = e => options.onClick(e, spiderLeg);
      return spiderLeg;
    });
    util.each(spiderLegs.reverse(), spiderLeg => spiderLeg.marker.addTo(map));
    if (options.animate) {
      setTimeout(() => {
        util.each(spiderLegs.reverse(), (spiderLeg, index) => {
          spiderLeg.elements.container.className = (spiderLeg.elements.container.className || '').replace('initial', '');
          spiderLeg.elements.container.style['transitionDelay'] = options.animationSpeed / 1000 / spiderLegs.length * index + 's';
        });
      });
    }
    previousSpiderLegs = spiderLegs;
  };
  const generateSpiderLegParams = count => {
    if (count >= options.circleSpiralSwitchover) {
      return generateSpiralParams(count);
    } else {
      return generateCircleParams(count);
    }
  };
  const generateSpiralParams = count => {
    let legLength = options.spiralLengthStart;
    let angle = 0;
    return util.mapTimes(count, index => {
      angle = angle + (options.spiralFootSeparation / legLength + index * 0.0005);
      const pt = {
        x: legLength * Math.cos(angle),
        y: legLength * Math.sin(angle),
        angle: angle,
        legLength: legLength,
        index: index
      };
      legLength = legLength + twoPi * options.spiralLengthFactor / angle;
      return pt;
    });
  };
  const generateCircleParams = count => {
    const circumference = options.circleFootSeparation * (2 + count);
    const legLength = circumference / twoPi; // = radius from circumference
    const angleStep = twoPi / count;
    return util.mapTimes(count, index => {
      const angle = index * angleStep;
      const x = legLength * Math.cos(angle);
      const y = legLength * Math.sin(angle);
      return {
        x,
        y,
        angle,
        legLength,
        index
      };
    });
  };
  const createMarkerElements = spiderLegParam => {
    const containerElem = document.createElement('div');
    const pinElem = document.createElement('div');
    const lineElem = document.createElement('div');
    containerElem.className = 'spider-leg-container' + (options.animate ? ' animate initial ' : ' ');
    lineElem.className = 'spider-leg-line';
    pinElem.className = 'spider-leg-pin' + (options.customPin ? '' : ' default-spider-pin');
    containerElem.appendChild(lineElem);
    containerElem.appendChild(pinElem);
    containerElem.style['margin-left'] = spiderLegParam.x + 'px';
    containerElem.style['margin-top'] = spiderLegParam.y + 'px';
    lineElem.style.height = spiderLegParam.legLength + 'px';
    lineElem.style.transform = 'rotate(' + (spiderLegParam.angle - Math.PI / 2) + 'rad)';
    return {
      container: containerElem,
      line: lineElem,
      pin: pinElem
    };
  };

  // Public
  return {
    spiderfy,
    unspiderfy,
    each: callback => util.each(previousSpiderLegs, callback)
  };
};
var _default = spiderifier;
exports.default = _default;