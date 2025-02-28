import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {game, gameReviews} from "db/schema"
import {
  and,
  asc,
  avg,
  count,
  eq,
  getTableColumns,
  isNull,
  or,
  sql,
} from "drizzle-orm"
import {formatPrice} from "util/format"

const priceThresholds = [0, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000]

const bucketToCategory = (bucket: number | null) => {
  if (bucket === null) {
    return "Gratuito"
  }

  if (bucket >= priceThresholds.length) {
    return `Acima de ${formatPrice(
      priceThresholds[priceThresholds.length - 1]
    )}`
  }

  return `Até ${formatPrice(priceThresholds[bucket])}`
}

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
      category: sql<number | null>`width_bucket(${game.price}, array[${sql.raw(
        priceThresholds.join(", ")
      )}])`.as("bucket"),
      gameCount: count(),
      metric: avg(latestReviews.totalReviews),
    })
    .from(game)
    .leftJoin(latestReviews, eq(latestReviews.gameAppId, game.appId))
    .where(
      and(
        or(eq(latestReviews.rn, "1"), isNull(latestReviews.rn)),
        eq(game.released, true)
      )
    )
    .groupBy(sql`bucket`)
    .orderBy(asc(sql`bucket`))

  const formattedData = data.map((values) => ({
    category: bucketToCategory(values.category),
    gameCount: values.gameCount,
    metric: Math.round(parseFloat(values.metric ?? "0")),
  }))

  return [
    formattedData[formattedData.length - 1],
    ...formattedData.slice(0, -1),
  ] // Make free games first in the array
}

export async function loader({request}: LoaderFunctionArgs) {
  const data = await getGames()
  return Response.json(data)
}
