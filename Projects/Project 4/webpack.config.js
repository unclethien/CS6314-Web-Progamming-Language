const path = require("path");

module.exports = {
  entry: {
    gettingStarted: "./gettingStarted.jsx",
    problem2: "./problem2.jsx",
    problem4: "./problem4.jsx",
    problem5: "./problem5.jsx",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  output: {
    path: path.resolve(__dirname, "compiled"),
    publicPath: "/",
    filename: "[name].bundle.js",
  },
  mode: "development",
};
