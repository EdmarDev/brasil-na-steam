import {fileURLToPath} from "url"
import {fetchWithRetry, monthMap} from "./utils"
import {setTimeout} from "timers/promises"
import {drizzleDb} from "db"
import {
  company,
  game,
  gameDeveloper,
  gameGenre,
  gameLanguage,
  gamePublisher,
  gameTag,
  genre,
  language,
  tag,
} from "db/schema"
import {and, eq, inArray, sql, type InferSelectModel} from "drizzle-orm"
import {DateTime} from "luxon"
import type {Tag} from "db/types"
import {load} from "cheerio"
import {logger} from "util/logger"

const DETAILS_WAIT_TIME = 1000
const TAGS_WAIT_TIME = 200
const DAYS_BEFORE_UPDATE = 7

const tryInsertGenre = async (genreId: number, name: string) => {
  await drizzleDb
    .insert(genre)
    .values({id: genreId, name})
    .onConflictDoNothing()
}

const tryInsertTag = async (tagId: number, name: string) => {
  await drizzleDb.insert(tag).values({id: tagId, name}).onConflictDoNothing()
}

const findOrInsertLanguage = async (languageName: string) => {
  const found = await drizzleDb.query.language.findFirst({
    columns: {
      id: true,
    },
    where: (language, {eq}) => eq(language.name, languageName),
  })

  if (!!found) return found.id

  const inserted = await drizzleDb
    .insert(language)
    .values({
      name: languageName,
    })
    .returning({id: language.id})

  return inserted[0].id
}

const findOrInsertCompany = async (steamName: string) => {
  const found = await drizzleDb.query.company.findFirst({
    columns: {
      id: true,
    },
    where: (company, {eq}) => eq(company.steamName, steamName),
  })

  if (!!found) return found.id

  const inserted = await drizzleDb
    .insert(company)
    .values({
      steamName,
    })
    .returning({id: company.id})

  return inserted[0].id
}

const extractLanguages = (languageString: string) => {
  const cleanedText = languageString.replace(
    /<[^>]+>|idiomas com suporte total de áudio|\*/g,
    ""
  )

  return cleanedText.split(",").map((text) => text.trim())
}

const formatDate = (rawDate: string) => {
  const splitDate = rawDate.split("/")

  if (splitDate.length !== 3) return null

  const luxonDate = DateTime.fromObject({
    day: parseInt(splitDate[0]),
    month: monthMap[splitDate[1]],
    year: parseInt(splitDate[2]),
  })

  return luxonDate.toFormat("yyyy-MM-dd")
}

const getCommunityName = async (appId: number) => {
  const url = `https://steamcommunity.com/app/${appId}`
  const res = await fetchWithRetry(url, {
    headers: {
      cookie: `wants_mature_content_apps=${appId}`,
    },
  })

  const html = await res.text()
  const $ = load(html)

  return $(".apphub_AppName").text()
}

const getAppDetails = async (
  appId: number,
  firstUpdate: boolean,
  currentLanguages: string[]
) => {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=brazilian`

  await setTimeout(DETAILS_WAIT_TIME)
  let res
  try {
    res = await fetchWithRetry(url)

    const data = (await res.json())[appId.toString()]?.data

    const gameName: string = data.name
    const detailedDescription: string = data.detailed_description
    const shortDescription: string = data.short_description
    const comingSoon: boolean = !!data.release_date?.coming_soon
    const rawReleaseDate: string = data.release_date?.date ?? ""
    const price: number = data.price_overview?.initial
    let communityName: string | undefined = undefined

    const releaseDate = formatDate(rawReleaseDate)

    if (firstUpdate) {
      const publishers: string[] = data.publishers
      const developers: string[] = data.developers

      if (publishers?.length > 0) {
        const publisherIds = await Promise.all(
          publishers.map(
            async (publisher) => await findOrInsertCompany(publisher)
          )
        )
        await drizzleDb
          .insert(gamePublisher)
          .values(
            publisherIds.map((companyId) => ({gameAppId: appId, companyId}))
          )
          .onConflictDoNothing()
      }

      if (developers?.length > 0) {
        const developerIds = await Promise.all(
          developers.map(
            async (developer) => await findOrInsertCompany(developer)
          )
        )

        await drizzleDb
          .insert(gameDeveloper)
          .values(
            developerIds.map((companyId) => ({gameAppId: appId, companyId}))
          )
          .onConflictDoNothing()
      }

      const genres: {id: string; description: string}[] = data.genres
      if (genres?.length > 0) {
        await Promise.all(
          genres.map(
            async (genre) =>
              await tryInsertGenre(parseInt(genre.id), genre.description)
          )
        )
        await drizzleDb
          .insert(gameGenre)
          .values(
            genres.map((g) => ({gameAppId: appId, genreId: parseInt(g.id)}))
          )
          .onConflictDoNothing()
      }

      communityName = await getCommunityName(appId)
    }

    await drizzleDb
      .update(game)
      .set({
        name: gameName,
        detailedDescription,
        shortDescription,
        released: !comingSoon,
        communityName,
        lastUpdate: sql`CURRENT_TIMESTAMP`,
        ...(!!releaseDate ? {releaseDate} : {}),
        ...(!!price ? {price} : {}),
      })
      .where(eq(game.appId, appId))

    const languages: string[] = extractLanguages(data.supported_languages ?? "")
    const newLanguages = languages.filter((l) => !currentLanguages.includes(l))

    if (newLanguages.length > 0) {
      const languageIds = await Promise.all(
        newLanguages.map(
          async (newLanguage) => await findOrInsertLanguage(newLanguage)
        )
      )
      await drizzleDb
        .insert(gameLanguage)
        .values(
          languageIds.map((languageId) => ({gameAppId: appId, languageId}))
        )
        .onConflictDoNothing()
    }
  } catch (e: any) {
    console.error(`Erro: Falha ao obter dados. AppId: ${appId}`)
    logger.info({
      url,
      ok: res?.ok,
      status: res?.status,
      statusText: res?.statusText,
    })
  }
}

const getTags = async (appId: number, currentTags: Tag[]) => {
  const url = `https://store.steampowered.com/app/${appId}?l=brazilian`

  await setTimeout(TAGS_WAIT_TIME)
  const res = await fetchWithRetry(url, {
    headers: {
      cookie: "birthtime=946684800; mature_content=1",
    },
  })
  const html = await res.text()
  const matches = html.match(/InitAppTagModal\(\s*\d+,\s*(\[\{.*?\}\])/s)

  if (!matches) return

  const tagsArray: {tagid: number; name: string; count: number}[] = JSON.parse(
    matches[1]
  )
  const topTags = tagsArray.sort((a, b) => b.count - a.count).slice(0, 10)

  const tagsToAdd = topTags.filter(
    (t) => !currentTags.some((tt) => tt.name === t.name)
  )
  const tagsToRemove = currentTags.filter(
    (t) => !topTags.some((tt) => tt.name === t.name)
  )

  if (tagsToAdd.length > 0) {
    await Promise.all(
      tagsToAdd.map(async (t) => await tryInsertTag(t.tagid, t.name))
    )
    await drizzleDb
      .insert(gameTag)
      .values(tagsToAdd.map((t) => ({tagId: t.tagid, gameAppId: appId})))
      .onConflictDoNothing()
  }

  if (tagsToRemove.length > 0) {
    await drizzleDb.delete(gameTag).where(
      and(
        inArray(
          gameTag.tagId,
          tagsToRemove.map((ttr) => ttr.id)
        ),
        eq(gameTag.gameAppId, appId)
      )
    )
  }
}

;(async () => {
  if (fileURLToPath(import.meta.url) !== process.argv[1]) {
    return
  }

  const lastUpdateThreshold = DateTime.now()
    .minus({days: DAYS_BEFORE_UPDATE})
    .toFormat("yyyy-MM-dd HH:mm:ss")

  const gamesToUpdate = await drizzleDb.query.game.findMany({
    columns: {
      appId: true,
      lastUpdate: true,
    },
    with: {
      gameToLanguages: {
        columns: {},
        with: {
          language: true,
        },
      },
      gameToTags: {
        columns: {},
        with: {
          tag: true,
        },
      },
    },
    where: (game, {isNull, lt, eq, or}) =>
      or(
        isNull(game.lastUpdate),
        lt(game.lastUpdate, lastUpdateThreshold),
        eq(game.released, false)
      ),
  })

  for (let i = 0; i < gamesToUpdate.length; i++) {
    const currentGame = gamesToUpdate[i]
    const appId = currentGame.appId
    console.log(
      `Buscando dados com AppId = ${appId} [${i + 1} de ${
        gamesToUpdate.length
      }]`
    )

    await getAppDetails(
      appId,
      !currentGame.lastUpdate,
      currentGame.gameToLanguages.map((gtl) => gtl.language.name)
    )
    await getTags(
      appId,
      currentGame.gameToTags.map((gtt) => gtt.tag)
    )
  }

  console.log("Coleta concluída!")
  process.exit(0)
})()
