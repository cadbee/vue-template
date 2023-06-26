const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.gql$/,
          use: { loader: require.resolve('graphql-tag/loader')},
        },
      ],
    },
  },
});
