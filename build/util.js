const path = require('path');

const root = function(...args) {
  return path.join(__dirname, '..', ...args);
};

module.exports = {
  root
};
