import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {gameTag, gameReviews, tag} from "db/schema"
import {
  and,
  avg,
  count,
  desc,
  eq,
  getTableColumns,
  notInArray,
  sql,
} from "drizzle-orm"
import {genreNames} from "util/genre-names"

const MAX_TAGS = 12

const genres = [
  "Casual",
  "Ação",
  "Aventura",
  "Estratégia",
  "RPG",
  "Simulação",
  "Corrida",
  "Esportes",
  "Multijogador Massivo",
]

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
      category: tag.name,
      gameCount: count(),
      metric: avg(latestReviews.totalReviews),
    })
    .from(latestReviews)
    .innerJoin(gameTag, eq(latestReviews.gameAppId, gameTag.gameAppId))
    .leftJoin(tag, eq(gameTag.tagId, tag.id))
    .where(and(eq(latestReviews.rn, "1"), notInArray(tag.name, genreNames)))
    .groupBy(tag.name)
    .orderBy(desc(count()))
    .limit(MAX_TAGS)

  return data.map((values) => ({
    ...values,
    metric: Math.round(parseFloat(values.metric ?? "0")),
  }))
}

export async function loader({request}: LoaderFunctionArgs) {
  const data = await getGames()
  return Response.json(data)
}
