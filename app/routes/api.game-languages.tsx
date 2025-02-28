import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {gameLanguage, gameReviews, language} from "db/schema"
import {
  and,
  avg,
  count,
  desc,
  eq,
  getTableColumns,
  isNull,
  notInArray,
  or,
  sql,
} from "drizzle-orm"
import {genreNames} from "util/genre-names"

const MAX_LANGUAGES = 12

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
      category: language.name,
      gameCount: count(),
      metric: avg(latestReviews.totalReviews),
    })
    .from(gameLanguage)
    .leftJoin(
      latestReviews,
      eq(latestReviews.gameAppId, gameLanguage.gameAppId)
    )
    .leftJoin(language, eq(gameLanguage.languageId, language.id))
    .where(and(or(eq(latestReviews.rn, "1"), isNull(latestReviews.rn))))
    .groupBy(language.name)
    .orderBy(desc(count()))
    .limit(MAX_LANGUAGES)

  return data.map((values) => ({
    ...values,
    metric: Math.round(parseFloat(values.metric ?? "0")),
  }))
}

export async function loader({request}: LoaderFunctionArgs) {
  const data = await getGames()
  return Response.json(data)
}
