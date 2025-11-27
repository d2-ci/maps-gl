"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkerCache = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const DB_NAME = 'dhis2-maps-app-db';
const STORE_NAME = 'ee-worker-cache';
const DEFAULT_TTL_MS = 1000 * 60 * 60;
const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const getFromDB = async key => {
  const db = await openDB();
  return new Promise(resolve => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
};
const setToDB = async (key, value) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(value, key);
  return tx.complete;
};
class WorkerCache {
  constructor() {
    let ttl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_TTL_MS;
    _defineProperty(this, "_generateKey", (methodName, params) => `${methodName}:${JSON.stringify(params)}`);
    _defineProperty(this, "get", async (methodName, params) => {
      const key = this._generateKey(methodName, params);
      if (this._cache.has(key)) {
        const cached = this._cache.get(key);
        if (Date.now() - cached.timestamp < this._ttl) {
          return cached.data;
        }
        this._cache.delete(key);
      }
      const cachedDB = await getFromDB(key);
      if (cachedDB && Date.now() - cachedDB.timestamp < this._ttl) {
        this._cache.set(key, cachedDB);
        return cachedDB.data;
      }
      return null;
    });
    _defineProperty(this, "set", async (methodName, params, data) => {
      const key = this._generateKey(methodName, params);
      const entry = {
        data,
        timestamp: Date.now()
      };
      this._cache.set(key, entry);
      await setToDB(key, entry);
    });
    _defineProperty(this, "wrap", async (methodName, params, fn) => {
      const cached = await this.get(methodName, params);
      if (cached !== null) {
        return cached;
      }
      const result = await fn();
      await this.set(methodName, params, result);
      return result;
    });
    this._cache = new Map();
    this._ttl = ttl;
  }
}
exports.WorkerCache = WorkerCache;
_defineProperty(WorkerCache, "flushExpired", function () {
  let ttl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_TTL_MS;
  ;
  (async () => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let cursor = await store.openCursor();
    while (cursor) {
      const {
        timestamp
      } = cursor.value;
      if (Date.now() - timestamp > ttl) {
        await store.delete(cursor.key);
      }
      cursor = await cursor.continue();
    }
  })();
});