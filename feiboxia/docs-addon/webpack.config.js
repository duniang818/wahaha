const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  docsAddonWebpackPlugin,
} = require("@lark-opdev/block-docs-addon-webpack-utils");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  if (isProd) process.env.NODE_ENV = "production";
  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "bundle.[contenthash:8].js" : "bundle.js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
      }),
      // 生产构建时写入 project.config.json / index.json，供 opdev upload 使用
      new docsAddonWebpackPlugin({ open: false }),
    ],
    devServer: {
      port: 8080,
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  };
};
