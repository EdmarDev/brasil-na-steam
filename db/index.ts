import "dotenv/config"
import {drizzle} from "drizzle-orm/node-postgres"
import {eq} from "drizzle-orm"
import * as schema from "./schema"

export const drizzleDb = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
})
