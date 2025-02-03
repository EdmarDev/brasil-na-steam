import {drizzleDb} from "db"
import {company, game} from "db/schema"
import {setTimeout} from "timers/promises"
import {fileURLToPath} from "url"
import {fetchWithRetry} from "./utils"

const WAIT_TIME = 100
const RATE_LIMIT_TIME = 1000 * 60

const findGames = async (
  commpanyName: string,
  role: "developer" | "publisher",
  page = 0
) => {
  const url = `https://store.steampowered.com/search/results/?sort_by=_ASC&${role}=${commpanyName}&count=100&json=1&category1=998${
    page > 0 ? `&start=${100 * page}` : ""
  }`

  await setTimeout(WAIT_TIME)

  const res = await fetchWithRetry(url)

  const data = await res.json()

  if (!data) return

  const items = data.items as any[]
  if (items.length === 0) return

  const appIds = items
    .map((item) => {
      const logoUrl = item.logo
      const match = logoUrl.match(/\/apps\/(\d+)\//)

      if (match) {
        return Number(match[1])
      }
      return -1
    })
    .filter((appId) => appId > 0)

  const inserted = await drizzleDb
    .insert(game)
    .values(
      appIds.map((n) => ({
        appId: n,
      }))
    )
    .onConflictDoNothing()
    .returning()

  if (inserted.length > 0)
    console.log(`${inserted.length} novos jogos identificados!`)

  if (items.length === 100) {
    await findGames(commpanyName, role, page + 1)
  }
}

;(async () => {
  if (fileURLToPath(import.meta.url) !== process.argv[1]) {
    return
  }

  const brazilianCompanies = (
    await drizzleDb.query.company.findMany({
      columns: {
        steamName: true,
      },
      where: (company, {eq}) => eq(company.isBrazilian, true),
    })
  ).map((result) => result.steamName)

  for (let i = 0; i < brazilianCompanies.length; i++) {
    const companyName = brazilianCompanies[i]
    console.log(
      `Buscando jogos de ${companyName} [${i + 1} de ${
        brazilianCompanies.length
      }]`
    )

    await findGames(companyName, "developer")
    await findGames(companyName, "publisher")
  }

  console.log("Busca concluída!")
  process.exit(0)
})()
