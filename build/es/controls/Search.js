function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Popup } from 'maplibre-gl';
import Typeahead from 'suggestions';
import './Search.css';

// Inspired by https://github.com/lemmingapex/mapbox-gl-generic-geocoder/
// TODO: Replace suggestions dependency

const defaultOptions = {
  maxZoom: 15,
  limit: 5
};
class SearchControl {
  constructor(options) {
    // Clear search list when input field is changing
    _defineProperty(this, "_onKeyDown", evt => setTimeout(() => {
      const {
        selected
      } = this._typeahead;
      if (selected && this._inputEl.value !== selected.name) {
        this._inputEl.addEventListener('keydown', this._onKeyDown);
        this._typeahead.selected = null;
        this._typeahead.clear();
        this._popup.remove();
      }
    }, 100));
    _defineProperty(this, "_onChange", () => {
      const {
        value
      } = this._inputEl;
      const {
        selected
      } = this._typeahead;
      const {
        maxZoom
      } = this.options;
      if (value) {
        if (!selected) {
          this._geocode(value);
        } else {
          const {
            bounds,
            lng,
            lat,
            name
          } = selected;
          this._map.fitBounds(bounds, {
            maxZoom
          });
          this._popup.setLngLat([lng, lat]).setText(name);
          if (!this._popup.isOpen()) {
            this._popup.addTo(this._map);
          }
          this._inputEl.addEventListener('keydown', this._onKeyDown);
        }
      }
    });
    _defineProperty(this, "_clear", evt => {
      if (evt) {
        evt.preventDefault();
      }
      this._inputEl.value = '';
      this._typeahead.selected = null;
      this._typeahead.clear();
      this._popup.remove();
      this._onChange();
      this._inputEl.focus();
      this._clearEl.style.display = 'none';
    });
    _defineProperty(this, "_showSuggestions", () => {
      const {
        list,
        selected
      } = this._typeahead;
      if (selected) {
        list.draw();
      }
    });
    _defineProperty(this, "_toggleSearchControl", () => {
      this._container.classList.toggle('dhis2-map-ctrl-search-collapsed');
    });
    _defineProperty(this, "_collapseSearchControl", () => {
      this._toggleSearchControl();
      this._container.addEventListener('click', this._expandSearchControl);
    });
    _defineProperty(this, "_expandSearchControl", () => {
      this._toggleSearchControl();
      this._container.removeEventListener('click', this._expandSearchControl);
      this._map.once('click', this._collapseSearchControl);
      this._inputEl.focus();
    });
    this.options = _objectSpread(_objectSpread({}, defaultOptions), options);
    this._popup = new Popup({
      closeOnClick: false
    });
    this._collapsed = true;
  }
  geocodeRequest(query, mapBounds, options) {
    const params = {
      format: 'json',
      q: query,
      limit: options.limit
    };
    const urlParams = new URLSearchParams(Object.entries(params));
    return fetch(`https://nominatim.openstreetmap.org/search?${urlParams}`).then(response => response.ok ? response.json() : []).then(json => json.map(result => {
      const {
        display_name: name,
        lon: lng,
        lat,
        boundingbox
      } = result;
      const [y1, y2, x1, x2] = boundingbox;
      const bounds = [[x1, y1], [x2, y2]];
      return {
        name,
        lat,
        lng,
        bounds
      };
    }));
  }
  onAdd(map) {
    this._map = map;
    const label = map._getUIString('SearchControl.SearchForPlace');
    const el = this._container = document.createElement('div');
    el.className = 'maplibregl-ctrl dhis2-map-ctrl-search';
    const icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';
    icon.title = label;
    icon.setAttribute('aria-label', label);
    this._inputEl = document.createElement('input');
    this._inputEl.type = 'text';
    this._inputEl.placeholder = label;
    this._inputEl.addEventListener('change', this._onChange);
    this._inputEl.addEventListener('click', this._showSuggestions);
    const actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');
    this._clearEl = document.createElement('button');
    this._clearEl.className = 'geocoder-icon geocoder-icon-close';
    this._clearEl.setAttribute('aria-label', 'Clear');
    this._clearEl.addEventListener('click', this._clear);
    this._loadingEl = document.createElement('span');
    this._loadingEl.className = 'geocoder-icon geocoder-icon-loading';
    actions.appendChild(this._clearEl);
    actions.appendChild(this._loadingEl);
    el.appendChild(icon);
    el.appendChild(this._inputEl);
    el.appendChild(actions);
    this._typeahead = new Typeahead(this._inputEl, [], {
      filter: false,
      limit: this.options.limit
    });
    this._typeahead.getItemValue = item => item.name;
    this._collapseSearchControl();
    return el;
  }
  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = null;
    return this;
  }
  _geocode(searchInput) {
    this._loadingEl.style.display = 'block';
    this.geocodeRequest(searchInput, this._map.getBounds(), this.options).then(results => {
      let items = results;
      this._loadingEl.style.display = 'none';
      if (items.length) {
        items = results.slice(0, this.options.limit);
        this._clearEl.style.display = 'block';
      } else {
        this._clearEl.style.display = 'none';
        this._typeahead.selected = null;
      }
      this._typeahead.update(results);

      // Select search item direcly if only one
      if (items.length === 1) {
        this._typeahead.value(items[0]);
      }
    }).catch(() => this._loadingEl.style.display = 'none');
  }
}
export default SearchControl;