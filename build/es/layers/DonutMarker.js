function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Marker } from 'maplibre-gl';

// Creates a donut marker component
class DonutMarker extends Marker {
  constructor(segments, options = {}) {
    const element = donutChart(segments);
    super({
      element
    });
    _defineProperty(this, "onClick", evt => {
      evt.stopPropagation();
      this.fire('click');
    });
    this.setOpacity(options.opacity);
    element.addEventListener('click', this.onClick);
  }
  setOpacity(opacity) {
    if (typeof opacity === 'number') {
      this.getElement().style.opacity = opacity;
    }
  }
  setVisibility(isVisible) {
    this.getElement().style.display = isVisible ? 'block' : 'none';
  }
}

// Returns a SVG donut chart
export const donutChart = segments => {
  const total = segments.reduce((total, s) => total + s.count, 0);
  const fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
  const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
  const r0 = Math.round(r * 0.6);
  const w = r * 2;
  let offset = 0;
  let html = `<svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font:${fontSize}px sans-serif;cursor:pointer;filter:drop-shadow(0 0 2px #777);">`;
  segments.forEach(segment => {
    html += donutSegment(offset / total, (offset + segment.count) / total, r, r0, segment.color);
    offset += segment.count;
  });
  html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />`;
  html += `<text dominant-baseline="central" transform="translate(${r}, ${r})">${total}</text></svg>`;
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.firstChild;
};

// Returns a SVG donut chart segment
export const donutSegment = (start, end, r, r0, color) => {
  if (end - start === 1) {
    end -= 0.00001;
  }
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  const x0 = Math.cos(a0);
  const y0 = Math.sin(a0);
  const x1 = Math.cos(a1);
  const y1 = Math.sin(a1);
  const largeArc = end - start > 0.5 ? 1 : 0;
  return ['<path d="M', r + r0 * x0, r + r0 * y0, 'L', r + r * x0, r + r * y0, 'A', r, r, 0, largeArc, 1, r + r * x1, r + r * y1, 'L', r + r0 * x1, r + r0 * y1, 'A', r0, r0, 0, largeArc, 0, r + r0 * x0, r + r0 * y0, '" fill="' + color + '" />'].join(' ');
};
export default DonutMarker;