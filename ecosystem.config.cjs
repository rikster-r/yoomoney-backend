// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'backend',
    script: './dist/index.js',
    env: {
      SHOP_ID: "1069175",
      SECRET_KEY: "live_nUuM_cbvcoCxjPcdBSP3olvoETXwzYNun-ARRazyjnA",
    }
  }]
};
