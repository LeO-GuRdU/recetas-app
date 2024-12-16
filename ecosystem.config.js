const glob = require('glob');
const path = require('path');

module.exports = {
  apps: glob.sync('./packages/*/ecosystem.config.js').map((p) => require(path.resolve(p))),
};