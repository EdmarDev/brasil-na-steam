import {drizzleDb} from "db"
import {game, gameReviews} from "db/schema"
import {and, asc, avg, count, eq, getTableColumns, sql} from "drizzle-orm"
import type {LoaderFunctionArgs} from "react-router"

const getGames = async () => {
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

  const data = await drizzleDb
    .with(latestReviews)
    .select({
      category: sql<string>`date_part('year', ${game.releaseDate})`.as("year"),
      gameCount: count(),
      metric: avg(latestReviews.totalReviews),
    })
    .from(latestReviews)
    .innerJoin(game, eq(latestReviews.gameAppId, game.appId))
    .where(and(eq(latestReviews.rn, "1"), eq(game.released, true)))
    .groupBy(sql`year`)
    .having(sql`date_part('year', ${game.releaseDate}) >= 2015`) //TODO: remove this when filters are implemented
    .orderBy(asc(sql`year`))

  return data.map((values) => ({
    ...values,
    metric: Math.round(parseFloat(values.metric ?? "0")),
  }))
}

export async function loader({request}: LoaderFunctionArgs) {
  const data = await getGames()
  return Response.json(data)
}
