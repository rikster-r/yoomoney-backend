module.exports = {
  apps: [
    {
      name: 'backend',           // Your pm2 app name
      script: './dist/index.js', // Path to your built entry file
      env: {
        SHOP_ID: '1069175',
        SECRET_KEY: 'live_nUuM_cbvcoCxjPcdBSP3olvoETXwzYNun-ARRazyjnA'
      }
    }
  ]
};
