import '@testing-library/jest-dom';

// Polyfill scrollIntoView if missing in jsdom
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
