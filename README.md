# Webpack Mixin

Reusable webpack config for developing traditional sites/themes (Drupal, etc). Includes things commonly needed, and is setup for proxying your local dev server (MAMP, etc) through Webpack's dev server. So you can take advantage of Hot Module Replacement, live reload, in browser build errors, etc. Usage instructions and webpack/babel setup below.

The goal of this package is to create an easily reusable and updatable default webpack configuration, reduce config complexity and allow project configuration to be focused more on it's specific needs. Load this module as your base configuration and then merge in project requirements (entry/output, loaders, plugins, etc).

## Provides

- Default webpack configuration  
- Includes configured webpack-merge to merge your local configuration with mixin
- Babel Transpiling / preset-env           
- SASS (scss), css is extracted      
- LESS support, css is extracted        
- Images directory is copied, images can still be required without duplicates
- Image compression             
- Dev server setup to proxy local server (ie. MAMP)             
- Webpack Bundle Analyzer 
- Vue SFC setup
- Not a SPA setup

## Project Structure

Defaults to look for "src/main.js" as the entry point for your bundle, below is an example folder structure:

- `src/` (processed assets)
  - `js/` (example)
  - `scss/` (example)
  - `less/` (example)
  - `images/` (copied to output directory)
  - `static/` (copied to output directory)
  - `main.js` (entry point)
- `dist/` (bundled assets)

**Images and static folders:*** are copied to the output directory. Incase they are needed outside of webpack (site template, etc). Images can still be required/imported normally within webpack. All other folders are just an example, folder structure is up to you.*

## Mixin Options

Options object can be passed in the third argument to the mixin.

```js
  const config = mixin(env, argv, {
    // Your options here
  });
```

Note relative paths are used so that things can stay relative for the dev server output. Paths are converted to absolute as needed.

- `relativeEntryDir` : {String} Relative path to entry directory
- `relativeOutputDir` : {String} Relative path to output directory
- `baseDir` : {String} Directory to to prepend to all relative paths (ie. __dirname of your script)
- `imageminJpegQuality` : {Number} Quality 0-100. See [imagemin-mozjpeg](https://www.npmjs.com/package/imagemin-mozjpeg) for more
- `imageminJpegProgressive` : {Boolean} Progressive images or not
- `imageminPngQuality` : {String} PNG quality range ie '70-85'. See [imagemin-webpack-plugin](https://www.npmjs.com/package/imagemin-webpack-plugin) for more
- `sassAdditionalData` : {String|Function} Additional data to pass to sass (vars, enviroment), see [sass-loader](https://www.npmjs.com/package/sass-loader) for more
- `lessAdditionalData` : {String|Function} Additional data to pass to less (vars, enviroment), see [less-loader](https://www.npmjs.com/package/less-loader) for more

**Note:** If your needs are very specific, it may be easier to copy the mixin/config into your project as a starting point and then modify it to your own needs. Main config is in `index.js (exports.mixin)`.

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
      devServer: {
        proxy: {
          '*': {
            target: "http://MY_MAMP_SITE_URL:8889/"
          }
        }  
      }
    });
  };
```

Then you will want to add [NPM scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts) to your projects `package.json` to run webpack-cli in the different modes. Below is an example of the scripts to add:

```json
  {
    "scripts": {
      "serve": "webpack serve --mode development --progress --stats minimal",
      "build": "webpack build --mode production --progress --stats minimal",
      "analyze": "webpack build --mode production --progress --stats minimal --env analyze",
      "watch": "webpack watch --mode production --stats minimal",
      "build-verbose": "webpack build --mode production --stats verbose"
    }
  }
```

**Webpack Bundle Analyzer:** Triggered internally when you pass the env flag "analyze" to the webpack command. It will start a server and launch a browser window to view the visualization. See [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) for more information.

## Configure Babel & Browserlist

This is optional but to take advantage of transpiling, polyfills for old browsers and autoprefixer for CSS properties you need to tell these plugins what your needs are. I recommend using a separate config files versus embedding these settings in your `package.json`. It makes it more portable and also clearer for other developers. The mixin does not install core-js, so that you can install what you need and link it in your Babel configuration. Basic steps below, just examples:

1. [Install core-js](https://www.npmjs.com/package/core-js) and [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime), these will work with Babel to provide Javascript polyfills for older browsers based on what you use in your project. Note you need to make sure and configure babel to work with version of core-js you installed. You also need to choose how babel handles adding the polyfills (see 'useBuiltIns') in example below for quick explanation. 
2. [Configure Babel](https://babeljs.io/docs/en/configuration) -  Add a `babel.config.js` file to your project, example below, make sure to specify your core-js version
3. [Configure Browserlist](https://github.com/browserslist/browserslist) - This is used by Autoprefixer and Babel to understand what browsers you support. The plugins will then add the necessary transpiling and vendor prefixes as needed. Add a `.browserslistrc` file to your project. Example below

**Example `babel.config.js` Configuration**
```js
 module.exports = {
   presets: [
     [
       "@babel/preset-env", { 
          // 'usage' means look at what I used and add polyfills for browsers I target
          // 'entry' You import core-js/stable and regenerator-runtime/runtime at start of your code
          //  and babel will choose the correct versions of those complete polyfill library
          //  based on your target browsers (results in possible inclusion of polyfills that aren't needed)
         useBuiltIns: "usage", 
         corejs: "3.18"
       }
     ]
   ],
   assumptions: {
     privateFieldsAsProperties: true,
     setPublicClassFields: true
   },
   plugins: [
     ["@babel/plugin-proposal-class-properties"],
     ["@babel/plugin-proposal-private-methods"],
     ["@babel/plugin-proposal-private-property-in-object"]
   ]
 };
```

**Example `.browserslistrc` Configuration** 
```txt
  last 2 versions
  > 0.2%, not dead
  ie >= 11
```
