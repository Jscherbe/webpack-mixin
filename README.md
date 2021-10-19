# Webpack Mixin

Reusable webpack config for developing traditional sites/themes. Includes things commonly needed, and is setup for proxying the Webpack dev server

- Includes configured webpack merge
- Babel Transpiling / preset-env           
- SASS (scss), css is extracted             
- Images directory copy and images can be required             
- Image compression             
- Dev server setup to proxy local server (ie. MAMP)             
- Webpack Analyze Utility           
- Default webpack configuration             
- Vue SFC setup
- Not SPA setup

## Usage

In your `webpackconfig.js` file.

```js
  const { mixin, merge } = require("@ulu/webpack-mixin.js");

  module.exports = (env, argv) => {
    // Use the mixin to create a configutation object
    const config = mixin(env, argv, {
      relativeEntryDir: "theme/src/"
    });

    // Merge the base with your custom settings
    return merge(config, {
      performance: {
        maxEntrypointSize: 300000,
        maxAssetSize: 300000
      },
    });
  };
```

## Structure

The base assumes the following folder structure. Note this can be changed by reconfiguring paths for entry/output/plugins. Might be easier to just copy the config and change it at that point.

- `src/` (processed assets)
  - `js/`
  - `scss/`
  - `images/`
  -` static/` (copied to output)
  - `main.js` (entry point)
- `dist/` (bundled assets)

## Options

Options can be passed in the third argument to the mixin.

```js
  const config = mixin(env, argv, {
    // Your options here
  });
```

Note relative paths are used so that things can stay relative for dev server. Paths are converted to absolute inside mixin when needed.

- `relativeEntryDir` : {String} Relative path to entry directory
- `relativeOutputDir` : {String} Relative path to output directory
- `baseDir` : {String} Directory to to prepend to all relative paths (ie. __dirname of your script)
- `sassAdditionalData` : {String|Function} Additional data to pass to sass (vars, enviroment), see sass-loader docs for more info
- `imageminJpegQuality` : {Number} Quality 0-100
- `imageminJpegProgressive` : {Boolean} Progressive images or not
- `imageminPngQuality` : {String} PNG quality range ie '70-85'