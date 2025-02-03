import {drizzleDb} from "db"
import {game} from "db/schema"
import {fileURLToPath} from "url"
import {getDataFromArgs} from "./utils"
;(async () => {
  if (fileURLToPath(import.meta.url) !== process.argv[1]) {
    return
  }

  const argAppIds = getDataFromArgs("scripts/insert-game-ids.ts")
  const validAppIds = argAppIds
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)

  if (validAppIds.length === 0) {
    console.log("Erro: nenhum appId válido fornecido.")
  }

  console.log(`Inserindo ${validAppIds.length} appIds...`)

  const result = await drizzleDb
    .insert(game)
    .values(
      validAppIds.map((n) => ({
        appId: n,
      }))
    )
    .onConflictDoNothing()
    .returning()

  console.log(`${result.length} novos jogos identificados!`)

  process.exit(0)
})()
