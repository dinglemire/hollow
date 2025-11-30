const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // Import the new tool
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "docs"),
        filename: "bundle.js",
        clean: true // We can keep this true now!
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
            "process": require.resolve("process/browser"),
        }
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "./src/index.html" }),
        // This block copies your images safely
        new CopyPlugin({
            patterns: [
                { from: "src/icons", to: "icons" }, 
            ],
        }),
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process",
        }),
    ],
    target: "web",
};
