import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

export default defineConfig({
  dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  schema: './src/db/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://star:@localhost:5432/n_admin',
  },
  tablesFilter: ['!_*'],
  verbose: true,
  strict: false
})
