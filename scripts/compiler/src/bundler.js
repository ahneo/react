"use strict";

const rollup = require("@trueadm/rollup").rollup;
const commonjs = require("@trueadm/rollup-plugin-commonjs");
const alias = require("rollup-plugin-alias");
const flow = require("rollup-plugin-flow");
const babel = require("rollup-plugin-babel");

function createBundle(result) {
  const entryFilePath = result.entryFilePath;
  const destinationBundlePath = result.destinationBundlePath;
  const hasteMap = result.hasteMap;
  const babelPlugins = [
    require("../node_modules/babel-plugin-syntax-flow"),
    require("../node_modules/babel-plugin-syntax-jsx"),
    require("./plugins/babel-plugin-fbt"),
    require("../node_modules/babel-plugin-flow-react-proptypes"),
    require("../node_modules/babel-plugin-transform-class-properties"),
    require("../node_modules/babel-plugin-syntax-object-rest-spread"),
    [require("../node_modules/babel-plugin-transform-object-rest-spread"), { useBuiltIns: true }]
  ];
  const config = {
    entry: entryFilePath,
    plugins: [
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        runtimeHelpers: false,
        externalHelpers: false,
        plugins: babelPlugins
      }),
      flow(),
      commonjs({
        noWrap: true,
      })
    ]
  };
  if (hasteMap !== null) {
    config.plugins.unshift(alias(hasteMap));
  } else {
    config.onwarn = function() {};
    babelPlugins.push(require('../node_modules/babel-plugin-transform-react-remove-prop-types').default);
  }

  return rollup(config)
    .then(rollupResult => {
      return rollupResult.write({
        dest: destinationBundlePath,
        format: "cjs",
        interop: false
      });
    })
    .then(() => Promise.resolve(destinationBundlePath));
}

module.exports = {
  createBundle: createBundle
};
