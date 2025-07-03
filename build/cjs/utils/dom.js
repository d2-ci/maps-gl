"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElement = void 0;
const createElement = (element, className, text, appendTo) => {
  const el = document.createElement(element);
  if (className) {
    el.className = className;
  }
  if (text) {
    el.innerText = text;
  }
  if (appendTo) {
    appendTo.appendChild(el);
  }
  return el;
};
exports.createElement = createElement;