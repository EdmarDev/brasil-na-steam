import {drizzleDb} from "db"
import {game, gameFollowers, gameReviews} from "db/schema"
import {and, desc, eq, getTableColumns, gte, ne, sql} from "drizzle-orm"
import {DateTime} from "luxon"
import type {LoaderFunctionArgs} from "react-router"

const LIST_SIZE = 5
const POPULAR_MONTHS_LIMIT = 6

const getRecent = async (limit: number) => {
  const games = await drizzleDb.query.game.findMany({
    where: (game, {eq}) => eq(game.released, true),
    orderBy: (game, {desc}) => [desc(game.releaseDate)],
    limit,
  })
  return games
}

const getUpcoming = async (limit: number) => {
  const latestFollowers = drizzleDb.$with("latestFollowers").as(
    drizzleDb
      .select({
        ...getTableColumns(gameFollowers),
        rn: sql<string>`ROW_NUMBER() OVER (PARTITION BY ${gameFollowers.gameAppId} ORDER BY ${gameFollowers.timestamp} DESC)`.as(
          "rn"
        ),
      })
      .from(gameFollowers)
  )
  const games = await drizzleDb
    .with(latestFollowers)
    .select({followers: latestFollowers.followers, ...getTableColumns(game)})
    .from(latestFollowers)
    .innerJoin(game, eq(latestFollowers.gameAppId, game.appId))
    .where(and(eq(latestFollowers.rn, "1"), ne(game.released, true)))
    .orderBy(desc(latestFollowers.followers))
    .limit(limit)
  return games
}

const getPopular = async (limit: number) => {
  const latestReviews = drizzleDb.$with("latestReviews").as(
    drizzleDb
      .select({
        ...getTableColumns(gameReviews),
        rn: sql<string>`ROW_NUMBER() OVER (PARTITION BY ${gameReviews.gameAppId} ORDER BY ${gameReviews.timestamp} DESC)`.as(
          "rn"
        ),
      })
      .from(gameReviews)
  )

  const popularDateThreshold = DateTime.now()
    .minus({months: POPULAR_MONTHS_LIMIT})
    .toFormat("yyyy-MM-dd")

  const games = await drizzleDb
    .with(latestReviews)
    .select({
      totalReviews: latestReviews.totalReviews,
      ...getTableColumns(game),
    })
    .from(latestReviews)
    .innerJoin(game, eq(latestReviews.gameAppId, game.appId))
    .where(
      and(
        eq(latestReviews.rn, "1"),
        gte(game.releaseDate, popularDateThreshold),
        eq(game.released, true)
      )
    )
    .orderBy(desc(latestReviews.totalReviews))
    .limit(limit)

  return games
}

export type TopGames = {
  popular: Awaited<ReturnType<typeof getPopular>>
  recent: Awaited<ReturnType<typeof getRecent>>
  upcoming: Awaited<ReturnType<typeof getUpcoming>>
}

export async function loader({request}: LoaderFunctionArgs) {
  const popular = await getPopular(LIST_SIZE)
  const recent = await getRecent(LIST_SIZE)
  const upcoming = await getUpcoming(LIST_SIZE)
  return Response.json({popular, recent, upcoming})
}
