module.exports = {
  apps: [
    {
      name: 'backend', // Your pm2 app name
      script: './dist/index.js', // Path to your built entry file
      env: {
        SHOP_ID: '1069175',
        SECRET_KEY: 'live_nUuM_cbvcoCxjPcdBSP3olvoETXwzYNun-ARRazyjnA',
        SUPABASE_URL: 'https://vknoghvegdvufxkdhyxn.supabase.co',
        SUPABASE_KEY:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbm9naHZlZ2R2dWZ4a2RoeXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDc5MjIsImV4cCI6MjA2NDI4MzkyMn0.qFqaBlChESUIVsc1pCOuQcem62JRge-73GlNH0IaL4Q',
      },
    },
  ],
};
