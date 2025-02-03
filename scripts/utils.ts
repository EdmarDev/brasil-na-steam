import {readFileSync} from "fs"
import {setTimeout} from "timers/promises"

const MAX_RATE_LIMIT_RETRIES = 5

export const getDataFromArgs = (scriptPath: string) => {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error("Erro: Nenhum argumento fornecido.")
    console.error(`Use: "npx tsx ${scriptPath} <arg1> <arg2> ..."`)
    console.error(
      `Ou: "npx tsx ${scriptPath} --file /path/to/file.json" para carregar dados de uma array em formato JSON.`
    )
    process.exit(1)
  }

  if (args[0] === "--file") {
    if (args.length === 1) {
      console.error(
        `Erro: Informe o caminho de um arquivo JSON contendo um array.`
      )
      process.exit(1)
    }
    try {
      const filePath = args[1]
      const fileContent = readFileSync(filePath, "utf-8")
      const data = JSON.parse(fileContent)

      if (!Array.isArray(data)) {
        console.error(`Erro: O arquivo JSON deve conter uma array.`)
        process.exit(1)
      }

      return data
    } catch (error) {
      console.error(`Erro ao ler o arquivo: ${(error as Error).message}`)
      process.exit(1)
    }
  } else {
    return args
  }
}

export const fetchWithRetry = async (
  url: string,
  requestInit?: RequestInit,
  waitTime = 1000 * 60
) => {
  let retries = 0
  let res = await fetch(url, requestInit)

  while (res.status === 429 && retries < MAX_RATE_LIMIT_RETRIES) {
    retries++
    console.log("Rate Limit atingido!")
    await setTimeout(waitTime)
    res = await fetch(url, requestInit)
  }

  return res
}

export const monthMap: Record<string, number> = {
  "jan.": 1,
  "fev.": 2,
  "mar.": 3,
  "abr.": 4,
  "mai.": 5,
  "jun.": 6,
  "jul.": 7,
  "ago.": 8,
  "set.": 9,
  "out.": 10,
  "nov.": 11,
  "dez.": 12,
}
