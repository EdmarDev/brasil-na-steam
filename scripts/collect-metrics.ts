import {drizzleDb} from "db"
import {setTimeout} from "timers/promises"
import {fileURLToPath} from "url"
import {fetchWithRetry} from "./utils"
import {game, gameFollowers, gameReviews} from "db/schema"
import {sql} from "drizzle-orm"
import {load} from "cheerio"
import {logger} from "util/logger"

const WAIT_TIME = 500

const scrapeFollowersUrl = async (
  searchText: string,
  appId: number,
  sessionId: string
) => {
  let url, res, responseText, data, html
  try {
    await setTimeout(WAIT_TIME)
    url = `https://steamcommunity.com/search/SearchCommunityAjax?text=${searchText}&filter=groups&sessionid=${sessionId}&page=1`
    res = await fetchWithRetry(url, {
      headers: {
        cookie: `sessionid=${sessionId}`,
      },
    })
    responseText = await res.text()
    data = JSON.parse(responseText)
    html = data.html
    const $ = load(html)

    const followersText = $(".searchPersonaInfo")
      .filter((_, div) => {
        return (
          $(div).find(`a[href="https://steamcommunity.com/app/${appId}"]`)
            .length > 0
        )
      })
      .find('span[style="color: whitesmoke"]')
      .text()
    return parseInt(followersText.replaceAll(`,`, ""))
  } catch (e: any) {
    logger.info({
      url,
      ok: res?.ok,
      status: res?.status,
      statusText: res?.statusText,
    })
    throw e
  }
}

const getFollowers = async (
  appId: number,
  communityName: string,
  sessionId: string
) => {
  let followers = await scrapeFollowersUrl(`${appId}`, appId, sessionId)

  if (isNaN(followers)) {
    // Retry with only name
    followers = await scrapeFollowersUrl(communityName, appId, sessionId)
  }

  if (isNaN(followers)) {
    // Retry with id + name
    followers = await scrapeFollowersUrl(
      `${appId} ${communityName}`,
      appId,
      sessionId
    )
  }

  if (isNaN(followers)) {
    return
  }

  await drizzleDb.insert(gameFollowers).values({
    gameAppId: appId,
    followers,
    timestamp: sql`CURRENT_TIMESTAMP`,
  })
}

const getReviews = async (appId: number) => {
  const url = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`
  await setTimeout(WAIT_TIME)
  const res = await fetchWithRetry(url)
  const data = await res.json()

  if (!data || data.success !== 1) return

  const totalReviews = data.query_summary?.total_reviews
  const positive = data.query_summary?.total_positive
  const positivePercentage = totalReviews > 0 ? positive / totalReviews : 0

  await drizzleDb.insert(gameReviews).values({
    gameAppId: appId,
    totalReviews,
    positivePercentage,
    timestamp: sql`CURRENT_TIMESTAMP`,
  })
}

async function getSessionId() {
  const response = await fetch("https://steamcommunity.com")

  const rawCookies = response.headers.getSetCookie()
  const sessionCookie = rawCookies.find((cookie) =>
    cookie.startsWith("sessionid=")
  )

  if (!sessionCookie) return

  const sessionId = sessionCookie.split(";")[0].split("=")[1]
  return sessionId
}

;(async () => {
  if (fileURLToPath(import.meta.url) !== process.argv[1]) {
    return
  }

  const sessionId = await getSessionId()
  if (!sessionId) {
    console.error("Erro ao obter sessionid!")
    process.exit(1)
  }

  const gamesToUpdate = await drizzleDb.query.game.findMany({
    columns: {
      appId: true,
      released: true,
      communityName: true,
      name: true,
    },
  })

  for (let i = 0; i < gamesToUpdate.length; i++) {
    const currentGame = gamesToUpdate[i]
    const appId = currentGame.appId
    console.log(
      `Buscando dados com AppId = ${appId} [${i + 1} de ${
        gamesToUpdate.length
      }]`
    )

    const gameName =
      !!currentGame.communityName && currentGame.communityName !== ""
        ? currentGame.communityName
        : currentGame.name ?? ""

    try {
      await getFollowers(appId, gameName, sessionId)
      if (currentGame.released) await getReviews(appId)
    } catch (e) {
      console.error(`Erro: Falha ao coletar dados com o id ${appId}`)
      console.error(e)
    }
  }

  console.log("Coleta concluída!")
  process.exit(0)
})()
