import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {gameGenre, gameReviews, genre} from "db/schema"
import {
  and,
  asc,
  avg,
  count,
  eq,
  getTableColumns,
  inArray,
  sql,
} from "drizzle-orm"

const allowedGenres = [
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
      category: genre.name,
      gameCount: count(),
      metric: avg(latestReviews.totalReviews),
    })
    .from(latestReviews)
    .innerJoin(gameGenre, eq(latestReviews.gameAppId, gameGenre.gameAppId))
    .leftJoin(genre, eq(gameGenre.genreId, genre.id))
    .where(and(eq(latestReviews.rn, "1"), inArray(genre.name, allowedGenres)))
    .groupBy(genre.name)
    .orderBy(asc(genre.name))

  return data.map((values) => ({
    ...values,
    metric: Math.round(parseFloat(values.metric ?? "0")),
  }))
}

export async function loader({request}: LoaderFunctionArgs) {
  const data = await getGames()
  return Response.json(data)
}
