const { defineConfig } = require('@vue/cli-service');

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
