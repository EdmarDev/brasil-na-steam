import "dotenv/config"
import {drizzle} from "drizzle-orm/node-postgres"
import {eq} from "drizzle-orm"
import {company} from "./schema"

const db = drizzle(process.env.DATABASE_URL!, {casing: "snake_case"})

export async function dbTest() {
  const testCompany: typeof company.$inferInsert = {
    steamName: "Test Cmpany",
    isBrazilian: true,
  }

  try {
    await db.insert(company).values(testCompany)
    console.log("New company created!")
  } catch {
    console.log("Failed to add company. Check duplicated name")
  }
  const users = await db.select().from(company)
  console.log("Getting all companies from the database: ", users)
}

dbTest()
