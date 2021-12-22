// This is just the test of the mixin

const { mixin, merge } = require("./index.js");
const chalk = require("chalk");
const util = require('util');

module.exports = (env, argv) => {
  const base = mixin(env, argv, {
    relativeEntryDir: "test/src/",
    transpiledExcludeNot: [
      /some-module/
    ]
  });

  const site = {
    // Local site config
  };

  const config = merge(base, site);

  if (env.debugConfigMerge) {
    debug("Merged", config);
  }
  
  return config;
};


function debug(label, value) {
  console.log(chalk.yellow(label + " Config:"));
  console.log(util.inspect(value, {showHidden: false, depth: null, colors: true}))
}
