const path                    = require('path');
const BundleAnalyzerPlugin    = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin    = require("mini-css-extract-plugin");
const CopyPlugin              = require("copy-webpack-plugin");
const ImageminPlugin          = require('imagemin-webpack-plugin').default;
const WebpackMessages         = require('webpack-messages');
const chalk                   = require("chalk");
const imageminMozjpeg         = require('imagemin-mozjpeg');
const VueLoaderPlugin         = require('vue-loader/lib/plugin');
const { merge }               = require("webpack-merge");

const globOptions             = { ignore: ["**/README*", "**/.gitignore"] };
const objectWhen              = (cond, obj) => cond ? obj : {};
const pluginWhen              = (cond, Plugin, opts = {}) => cond ? [ new Plugin(opts) ] : [];

/**
 * Copy of webpack-merge
 * - This way we can change settings on merge plugin if needed
 */
exports.merge = (...configs) => {
  return merge(...configs);
};
/**
 * Webpack Base Mixin
 * @param {Object} env Enviroment object passed to webpack.config.js when using a function
 * @param {Object} argv Webpack arguments (ie. mode, etc)
 * @param {Object} opts Options for the mixin
 * @param {String} opts.relativeEntryDir Relative path to entry folder
 * @param {String} opts.relativeOutputDir Relative path to output folder
 * @param {String} opts.baseDir Base directory for all paths (ie. usually __dirname, defaults to cwd())
 */
exports.mixin = (env, argv, opts) => {

  const defaults = {
    relativeEntryDir: "src/", 
    relativeOutputDir: "dist/",
    baseDir: process.cwd(),
    sassAdditionalData: "",
    imageminJpegQuality: 75,
    imageminJpegProgressive: true,
    imageminPngQuality: "75-85",
  };
  const { analyze } = env;
  const dev = argv.mode === "development";
  const options = Object.assign({}, defaults, opts);
  const { relativeEntryDir, relativeOutputDir, baseDir } = options;

  return {
    // No source maps in production
    ...objectWhen(!dev, {     
      devtool:                false 
    }),
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
      ...objectWhen(analyze, { concatenateModules: false })
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
        {
          test: /\.scss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "autoprefixer", {},
                    ],
                  ],
                },
              },
            },
            {
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
            }
          ],
        },
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
      new ImageminPlugin({
        disable: dev,
        test: /\.(jpe?g|png|gif|svg)$/i,
        pngquant: {
          quality: options.imageminPngQuality
        },
        plugins: [
          imageminMozjpeg({
            quality: options.imageminJpegQuality,
            progressive: options.imageminJpegProgressive
          })
        ]
      }),
      new VueLoaderPlugin()
    ]
  }; 
};

