import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const database_url = import.meta.env.DATABASE_URL;
const sql = neon(database_url);

export const db = drizzle(sql);
