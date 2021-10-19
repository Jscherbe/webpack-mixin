// This is just the test of the mixin

const { mixin, merge } = require("./index.js");

module.exports = (env, argv) => {
  const base = mixin(env, argv, {
    relativeEntryDir: "test/src/"
  });

  return merge(base, {
    // Local config
  });
}