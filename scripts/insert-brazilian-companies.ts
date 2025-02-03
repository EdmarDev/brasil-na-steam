import {fileURLToPath} from "url"
import {getDataFromArgs} from "./utils"
import {drizzleDb} from "db"
import {company} from "db/schema"
;(async () => {
  if (fileURLToPath(import.meta.url) !== process.argv[1]) {
    return
  }

  const names = getDataFromArgs("scripts/insert-brazilian-companies.ts")

  if (names.length === 0) {
    console.log("Erro: nenhum nome de empresa válido fornecido.")
  }

  console.log(`Inserindo ${names.length} empresas...`)

  const result = await drizzleDb
    .insert(company)
    .values(
      names.map((name) => ({
        steamName: name,
        isBrazilian: true,
      }))
    )
    .onConflictDoNothing({target: company.steamName})
    .returning()

  console.log(`${result.length} novas empresas identificadas!`)

  process.exit(0)
})()
