import {drizzleDb} from "db"
import {gameFollowers, gameReviews} from "db/schema"
import {getTableColumns, sql} from "drizzle-orm"
import type {ChartMetric} from "~/metrics"

export const latestReviews = drizzleDb.$with("latestReviews").as(
  drizzleDb
    .select({
      ...getTableColumns(gameReviews),
      rrn: sql<string>`ROW_NUMBER() OVER (PARTITION BY ${gameReviews.gameAppId} ORDER BY ${gameReviews.timestamp} DESC)`.as(
        "rrn"
      ),
    })
    .from(gameReviews)
)

export const latestFollowers = drizzleDb.$with("latestFollowers").as(
  drizzleDb
    .select({
      ...getTableColumns(gameFollowers),
      frn: sql<string>`ROW_NUMBER() OVER (PARTITION BY ${gameFollowers.gameAppId} ORDER BY ${gameFollowers.timestamp} DESC)`.as(
        "frn"
      ),
    })
    .from(gameFollowers)
)

const metricQueries = {
  latestFollowers,
  latestReviews,
}

export const getMetricQuery = (metric: ChartMetric) =>
  metricQueries[metric.queryName]

export const getMetricField = (metric: ChartMetric) =>
  (getMetricQuery(metric) as any)[metric.fieldName]
