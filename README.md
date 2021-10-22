# Webpack Mixin

Reusable webpack config for developing traditional sites/themes. Includes things commonly needed, and is setup for proxying the Webpack dev server. 

The goal of this package is to create a reusable/updatable configuration so that each project can reduce config complexity and focus more on it's specific needs. Also to avoid having to make updates across many configuration files that are basically all the same (loader rules, plugins, etc).

## Provides

- Default webpack configuration  
- Includes configured webpack-merge to merge your local configuration with mixin
- Babel Transpiling / preset-env           
- SASS (scss), css is extracted      
- LESS support, css is extracted        
- Images directory copy and images can be required             
- Image compression             
- Dev server setup to proxy local server (ie. MAMP)             
- Webpack Analyze Vizualizer                 
- Vue SFC setup
- Not a SPA setup

## Project Structure

The base assumes the following folder structure. 

- `src/` (processed assets)
  - `js/`
  - `scss/`
  - `less/`
  - `images/`
  -` static/` (copied to output)
  - `main.js` (entry point)
- `dist/` (bundled assets)

## Mixin Options

Options can be passed in the third argument to the mixin.

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

1. [Install core-js](https://www.npmjs.com/package/core-js), this will work with Babel to provide Javascript polyfills for older browsers based on what you use in your project.
2. [Configure Babel](https://babeljs.io/docs/en/configuration) -  Add a `babel.config.js` file to your project, example below, make sure to specify your core-js version
3. [Configure Browserlist](https://github.com/browserslist/browserslist) - This is used by Autoprefixer and Babel to understand what browsers you support. The plugins will then add the necessary transpiling and vendor prefixes as needed. Add a `.browserslistrc` file to your project. Example below

**Example `babel.config.js` Configuration**
```js
 module.exports = {
   presets: [
     [
       "@babel/preset-env", { 
         useBuiltIns: "entry",
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
