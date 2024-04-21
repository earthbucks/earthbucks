import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/clear-schema.ts",
  driver: "mysql2",
  dbCredentials: {
    uri: process.env.DATABASE_URL || "",
  },
} satisfies Config;
