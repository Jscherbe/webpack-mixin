const process                 = require("process");
const path                    = require("path");
const BundleAnalyzerPlugin    = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin    = require("mini-css-extract-plugin");
const CopyPlugin              = require("copy-webpack-plugin");
const ImageMinimizerPlugin    = require("image-minimizer-webpack-plugin");
const WebpackMessages         = require("webpack-messages");
const chalk                   = require("chalk");
const VueLoaderPlugin         = require("vue-loader/lib/plugin");
const { merge }               = require("webpack-merge");

const globOptions             = { ignore: ["**/README*", "**/.gitignore"] };
const objectWhen              = (cond, obj) => cond ? obj : {};
const pluginWhen              = (cond, Plugin, opts = {}) => cond ? [ new Plugin(opts) ] : [];

/**
 * Uses webpack-merge
 * - This way we can modify/configure for future use
 * @param configs See webpack-merge
 * @example
 *   const { mixin, merge } = require("@ulu/webpack-mixin");
 *   const overrides = { devtool: false };
 *   module.exports = (env, argv) => merge(mixin(env, argv), overrides);
 */
exports.merge = (...configs) => {
  return merge(...configs);
};

/**
 * Webpack Base Mixin
 * @param {Object} env Enviroment object passed to webpack.config.js when using as a function
 * @param {Object} argv Webpack arguments (ie. mode, etc)
 * @param {Object} opts Options for this mixin
 * @param {String} opts.relativeEntryDir Relative path to entry folder
 * @param {String} opts.relativeOutputDir Relative path to output folder
 * @param {String} opts.baseDir Base directory for all paths (ie. usually __dirname, defaults to cwd())
 * @param {String} opts.sassAdditionalData Pass additional data to be prepend all sass files (see sass-loader)
 * @param {String} opts.lessAdditionalData Pass additional data to be prepend all less files (see less-loader)
 * @param {Number} opts.imageminJpegQuality Imagemin quality setting (see readme for more info)
 * @param {Boolean} opts.imageminJpegProgressive Should JPEG's output as progressive mode
 * @param {String} opts.imageminPngQuality Imagemin PNG quality (see readme for more info)
 * @example
 *   // webpack.config.js
 *   const { mixin, merge } = require("@ulu/webpack-mixin");
 *   
 *   module.exports = (env, argv) => {
 *   
 *     const config = mixin(env, argv, { 
 *       relativeEntryDir: "example-theme/src/" 
 *     });
 * 
 *     return merge(config, {
 *       devServer: {
 *        proxy: {
 *         '*': { 
 *           target: "http://MY_MAMP_SITE_URL:8889/" 
 *         }
 *       }
 *     });
 *   };
 */
exports.mixin = (env, argv, opts) => {

  const defaults = {
    relativeEntryDir: "src/", 
    relativeOutputDir: "dist/",
    baseDir: process.cwd(),
    sassAdditionalData: "",
    lessAdditionalData: "",
    imageMinimizerProductionOnly: true,
    imageMinimizerOptions: {
      minimizerOptions : {
        plugins: [
          ["svgo"],
          ["mozjpeg",  { quality: 75, progressive: true }],
          ["gifsicle", { interlaced: false }],
          ["pngquant", { quality: [0.75, 0.85] }]
        ]
      }
    }
  };
  const { analyze } = env;
  const dev = argv.mode === "development";
  const options = Object.assign({}, defaults, opts);
  const { relativeEntryDir, relativeOutputDir, baseDir } = options;
  const useImageMinimizer = options.imageMinimizerProductionOnly ? !dev : true;

  return {
    // No source maps in production
    ...objectWhen(!dev,       { devtool: false }),
    context:                  path.resolve(baseDir, relativeEntryDir),
    entry:                    path.resolve(baseDir, `${ relativeEntryDir }main.js`),
    output:  {
      path:                   path.resolve(baseDir, relativeOutputDir),
      filename:               "[name].js",
      publicPath:             relativeOutputDir,
      assetModuleFilename:    'assets/[name][ext][query]'
    },
    performance: {
      maxEntrypointSize:      400000,
      maxAssetSize:           1000000
    },
    optimization: {
      ...objectWhen(analyze,  { concatenateModules: false })
    },
    resolve: {
      alias: {
        '@NodeModules' :      path.join(baseDir, "node_modules"),
        '@Scss' :             path.join(baseDir, relativeEntryDir, "/scss/"),
        '@Images' :           path.join(baseDir, relativeEntryDir, "/images/")
      }
    },
    devServer: {
      open:       true,
      port:       8080,
      hot:        true,
      liveReload: true,
      static:     false,
      // Proxy dev server setup (ie. drupal/mamp)
      proxy: {
        '*': {
          target:        "http://EXAMPLE_NOT_CONFIGURED:8889/",
          changeOrigin:  true,
          secure:        false
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          include: /@ulu/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                [
                  // No modules, use webpack (tree shaking), user can configure locally (core-js, etc)
                  "@babel/preset-env", { 
                    modules: false
                  }
                ]
              ]
            }
          }
        },
        { 
          test: /\.vue$/, 
          use: 'vue-loader'
        },
        addPreprocessLoader(/\.scss$/i, {
          loader: "sass-loader",
          options: {
            sourceMap: true,
            additionalData: options.sassAdditionalData,
            sassOptions: {
              includePaths: [
                path.resolve(baseDir, `${ relativeEntryDir }scss/`)
              ]
            }
          },
        }),
        addPreprocessLoader(/\.less$/i, {
          loader: "less-loader",
          options: {
            sourceMap: true,
            additionalData: options.lessAdditionalData,
            lessOptions: {
              paths: [
                path.resolve(baseDir, `${ relativeEntryDir }less/`)
              ]
            }
          },
        }),
        {
          test: /\.jpe?g$|\.gif$|\.png$|\.PNG$|\.svg$/,
          type: 'asset/resource',
          exclude: /font/,
          generator: {
            filename: 'images/[name][ext][query]'
          }
        },
        {
          test: /\.woff(2)?$|\.ttf$|\.eot$|\.svg$/,
          type: 'asset/resource',
          exclude: /image/,
          generator: {
            filename: 'fonts/[name][ext][query]'
          }
        },
        {
          test: /\.ya?ml$/,
          type: 'json', // Required by Webpack v4
          use: 'yaml-loader'
        }
      ],
    },
    plugins: [
      ...pluginWhen(analyze, BundleAnalyzerPlugin),
      new WebpackMessages({ 
        name: 'client', 
        logger(message) {
          const label = chalk.bold.blue(`Webpack (${ dev ? 'development' : 'production' })`);
          return console.log(`\n${ label }: ${ message } `);
        }
      }),
      new MiniCssExtractPlugin(),
      new CopyPlugin({
        patterns: [
          { 
            from: "images/**/*", 
            noErrorOnMissing: true,
            globOptions
          },
          { 
            from: "static/**/*", 
            noErrorOnMissing: true,
            globOptions
          }
        ]
      }),
      // Make this conditional and not during dev
      ...pluginWhen(useImageMinimizer, ImageMinimizerPlugin, options.imageMinimizerOptions),
      new VueLoaderPlugin()
    ]
  }; 
};

/**
 * Internal function to keep the loader chain for CSS the same between preprocessors
 * - Ensure that they all output the same 
 * - Ensure that any CSS is run through other post process loaders (ie. autoprefixer)
 */
function addPreprocessLoader(test, loaderRules) {
  return {
    test,
    use: [
      { loader: MiniCssExtractPlugin.loader },
      {
        loader: "css-loader",
        options: { sourceMap: true },
      },
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            plugins: [[ "autoprefixer", {} ]]
          }
        }
      },
      loaderRules
    ]
  };
}