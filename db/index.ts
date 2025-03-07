import {drizzle} from "drizzle-orm/node-postgres"
import {eq} from "drizzle-orm"
import * as schema from "./schema"
import "dotenv/config"

export const drizzleDb = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
})
