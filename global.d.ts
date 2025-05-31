declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SHOP_ID: string;
      SECRET_KEY: string;
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
    }
  }
}
export {};
