# Webpack Mixin

Reusable webpack config for developing traditional websites (Drupal, Static, etc). Includes things commonly needed for theme building, is setup for proxy your local dev server (MAMP, etc) through Webpack's dev server. So you can take advantage of Hot Module Replacement, live reload, in browser build errors, etc.

The goal of this package is to create an easily reusable and updatable shared webpack configuration. In order to reduce configuration complexity and allow project configuration to focus only on it's specific needs. Use the mixin as your defaults/preset and then merge in your specific project requirements (entry/output, loaders, plugins, etc).

If you encounter bugs or have a feature request, feel free to open an issue on [github](https://github.com/Jscherbe/webpack-mixin/issues)

**Note:** *This is not for Single Page Applications (SPA)*

## Table of Contents

- [Webpack Mixin](#webpack-mixin)
  - [Table of Contents](#table-of-contents)
  - [Highlights](#highlights)
  - [Usage](#usage)
  - [Folder Structure](#folder-structure)
  - [Options](#options)
  - [Configuring Babel & Browserlist](#configuring-babel--browserlist)
  - [Vue Setup](#vue-setup)
  - [Change Log](#change-log)

## Highlights

- Default webpack configuration 
- Babel Transpiling / preset-env     
- CSS extracted      
- SASS & LESS support    
- Vue SFC (Single file components)
- Image compression (configured for lossy)          
- Webpack Dev server, configured to proxy your local server (ie. MAMP)             
- Webpack Bundle Analyzer 
- Includes configured webpack-merge to merge your local configuration
- Images directory is copied to output for use outside of webpack (no hashes)

## Usage

In your `webpackconfig.js` file.

```js
  const { mixin, merge } = require("@ulu/webpack-mixin.js");

  module.exports = (env, argv) => {
    // Use the mixin to create a configutation object
    const config = mixin(env, argv, {
      relativeEntryDir: "theme/src/"
    });

    // Merge in your custom settings (just an example)
    return merge(config, {
      devServer: {
        watchFiles: ["./templates/**/*.twig"],
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

## Folder Structure

By default "src/main.js" is used as the entry point for the bundle. Images and static folders are copied to the output directory. Incase they are needed outside of webpack (site template, etc). Images can still be required/imported normally within webpack. All other folders are just an example, folder structure is up to you. Aliases have been provided as  shortcuts for common folders. Example folder strucutre below:

- `src/` (unbundled assets)
  - `main.js` (entry point)
  - `js/`  
  - `scss/` (alias: `@Scss`)
  - `less/` (alias: `@Less`)
  - `images/` (copied to output directory, alias: `@Images`)
  - `static/` (copied to output directory)
- `dist/` (bundled assets)

*In addition to the aliases above, there is `@NodeModules` that points to the projects `./node_modules` directory.*

## Options

Options object can be passed in the third argument to the mixin. Note relative paths are used so that things can stay relative for the dev server output. Paths are converted to absolute internally when needed.

```js
  const config = mixin(env, argv, {});
```

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `relativeEntryDir` | String | `"src/"` | Relative path to entry directory |
| `relativeOutputDir` | String | `"dist/"` | Relative path to output directory |
| `baseDir` | String | process.cwd() | Directory to prepend to all relative paths (ie. __dirname of your script) |
| `sassAdditionalData` | String/Function | `""` | Additional data to pass to Sass (vars, mixins, etc), Useful for passing dynamic/enviroment variables. See [sass-loader](https://www.npmjs.com/package/sass-loader) for more |
| `lessAdditionalData` | String/Function | `""` | Additional data to pass to Less (vars, mixins, etc), Useful for passing dynamic/enviroment variables. See [less-loader](https://www.npmjs.com/package/less-loader) for more |
| `imageMinimizerOptions` | Object | true | Options to pass to the image minimizer plugin, these are not merged so if you pass options it should be a complete configuration for the plugin. Note you need to install specific imagemin plugins separately. See [image-minimizer-webpack-plugin](https://www.npmjs.com/package/image-minimizer-webpack-plugin) for more. The defaults include plugins for (jpeg, png, gif, svg) and (jpg, png) are lossy quality 75%. |
| `imageMinimizerProductionOnly` | Boolean | true | Passing false will run the image optimization plugin during development mode (will slowdown build time) |
| `transpiledExclude` | Array | `[/node_modules/]` | Transpiler excludes (regex/string/path) (see > webpack module conditions to learn more /syntax) |
| `transpiledExcludeNot` | Array | `[]` | Which of the excluded modules should be included (since we don't transpile node_modules use this to include the one's that need transpiling (regex/string/path) (see > webpack module conditions to learn more /syntax) |

**Note:** If your needs are very specific, it may be easier to copy the mixin/config into your project as a starting point and then modify it to your own needs. Main config is in `index.js (exports.mixin)`.

## Configuring Babel & Browserlist

This is optional but to take advantage of transpiling, polyfills for old browsers and autoprefixer for CSS properties you need to tell these plugins what your needs are. I recommend using a separate config files versus embedding these settings in your `package.json`. It makes it more portable and also clearer for other developers. The mixin does not install core-js, so that you can install what you need and link it in your Babel configuration. Basic steps below to setting up babel and brow, just examples:

1. [Install core-js](https://www.npmjs.com/package/core-js) and [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime), these will work with Babel to provide Javascript polyfills for older browsers based on what you use in your project. Note you need to make sure and configure babel to work with version of core-js you installed. You also need to choose how babel handles adding the polyfills (see 'useBuiltIns') in example below for quick explanation. 
2. [Configure Babel](https://babeljs.io/docs/en/configuration) -  Add a `babel.config.js` file to your project, example below, make sure to specify your core-js version
3. [Configure Browserlist](https://github.com/browserslist/browserslist) - This is used by Autoprefixer and Babel to understand what browsers you support. The plugins will then add the necessary transpiling and vendor prefixes as needed. Add a `.browserslistrc` file to your project. Example below

**Note:** All node_modules are excluded from transpiling by default you can use the mixin's `options.transpiledExcludeNot` to add the modules you know need to be transpiled. Or if you would like to transpile everything, set `options.transpiledExclude` to an empty array. 

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

## Vue Setup

The mixin **does not** provide Vue, it only provides the configuration for the `vue-loader`. You will need to install Vue and their template compiler. The template compiler is used by the vue-loader but is not included because it needs to match the **exact version** of the Vue installed in your project.

```
npm install --save vue vue-template-compiler 
```

Vue Setup

## Change Log
- **1.0.13** 
  - Fix incorrect use of vue-style-loader, currently all styles are extracted 
  - Add '@Less' webpack resolve alias to point to "./src/less" 
  - Remove dependency `vue-template-compiler`, this needs to be installed by the user and should match the version of Vue they are using
  - Update readme (vue setup instructions, aliases for directories)
- **1.0.12** 
  - Update dependencies (minor releases)
  - Update `image-minimizer-webpack-plugin` (major release) and all `imagemin` related plugins. **Note: The options API for this plugin has changed from the previous version.** If you made changes to image minification options using the mixin's `options.imageMinimizerOptions`, you will need to adapt it to the new options structure (change key "minimizerOptions" to "minimizer", nest `minimizerOptions.plugins` to `minimizer.options.plugins`, set `minimzer.implementation` to the preferred plugin (imagemin/squoosh) see their [docs](https://www.npmjs.com/package/image-minimizer-webpack-plugin)).
  - Make sure vue-loader implementation is up-to-date. Add a rule to **not** exclude  `.vue.js` files from Babel transpilation (even if within `node_modules/`). As vue-loader will extract script portion from SFC and add .js to it (see vue loader [migration guide](https://vue-loader.vuejs.org/migrating.html#importing-sfcs-from-dependencies)). Add `vue-style-loader` before `css-loader`.
- **1.0.11** 
  - Fix typo in readme
- **1.0.10** 
  - Add options for `transpiledExclude` and `transpiledExcludeNot` so that user can easily add specific node modules that need transpiling while still ignoring the node_modules directory completely. Also `transpiledExclude` allows pass empty array if they want to transpile everything.
- **1.0.9** 
  - Readme tweaks (options to table for clarity)
- **1.0.8** 
  - Update NPM dependencies (`postcss`, `webpack`) and remove unused `html-webpack-plugin` dependency
  - Replace outdated `imagemin-webpack-plugin` with `image-minimizer-webpack-plugin`
  - Remove specific options for imagemin `imageminJpegQuality`, `imageminJpegProgressive`, `imageminPngQuality` and allow user to pass full configuration to new image minimizer plugin using option `imageMinimizerOptions`
  - Update Readme to account for new settings and changes
- **1.0.7** 
  - Fix incomplete JSDOC comments for options and example
- **1.0.6**
  - Update NPM dependencies to their latest (ie. Webpack, loaders, babel)


