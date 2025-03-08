import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {game, gameGenre, gameReviews, gameTag, genre, tag} from "db/schema"
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
  type SQLWrapper,
} from "drizzle-orm"
import {formatPrice} from "util/format"
import {getFiltersFromRequest, type ParsedFilters} from "~/validation"
import {chartMetrics, getMetricFromName} from "~/metrics"
import {
  filtersRequireFollowers,
  filtersRequireGenres,
  filtersRequireReviews,
  filtersRequireTags,
  getSQLConditionsFromFilters,
} from "util/query-filters"
import {
  getMetricField,
  latestFollowers,
  latestReviews,
} from "util/metric-queries"

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

const getGames = async (filters: ParsedFilters) => {
  const metric = filters.metric
    ? getMetricFromName(filters.metric)
    : chartMetrics[0]

  const withQueries = []

  const includeReviews = filtersRequireReviews(filters)
  const includeFollowers = filtersRequireFollowers(filters)

  if (includeReviews || true) withQueries.push(latestReviews)

  if (includeFollowers || true) withQueries.push(latestFollowers)

  let query = drizzleDb
    .with(...withQueries)
    .select({
      category: sql<number | null>`width_bucket(${game.price}, array[${sql.raw(
        priceThresholds.join(", ")
      )}])`.as("bucket"),
      gameCount: count(),
      metric:
        metric.aggregationMethod === "Median"
          ? sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${getMetricField(
              metric
            )})`
          : avg(getMetricField(metric)),
    })
    .from(game)
    .groupBy(sql`bucket`)
    .orderBy(asc(sql`bucket`))
    .$dynamic()

  const metricConditions: (SQLWrapper | undefined)[] = []
  if (includeReviews || true) {
    query = query.leftJoin(
      latestReviews,
      eq(latestReviews.gameAppId, game.appId)
    )
    metricConditions.push(
      or(eq(latestReviews.rrn, "1"), isNull(latestReviews.rrn))
    )
  }
  if (includeFollowers || true) {
    query = query.leftJoin(
      latestFollowers,
      eq(latestFollowers.gameAppId, game.appId)
    )
    metricConditions.push(
      or(eq(latestFollowers.frn, "1"), isNull(latestFollowers.frn))
    )
  }

  if (filtersRequireGenres(filters)) {
    query = query
      .leftJoin(gameGenre, eq(game.appId, gameGenre.gameAppId))
      .leftJoin(genre, eq(gameGenre.genreId, genre.id))
  }

  if (filtersRequireTags(filters)) {
    query = query
      .leftJoin(gameTag, eq(game.appId, gameTag.gameAppId))
      .leftJoin(tag, eq(gameTag.tagId, tag.id))
  }

  query = query.where(
    and(
      eq(game.released, true),
      ...getSQLConditionsFromFilters(filters),
      ...metricConditions
    )
  )

  const data = await query
  if (data.length === 0) {
    return []
  }
  const formattedData = data.map((values) => ({
    category: bucketToCategory(values.category),
    gameCount: values.gameCount,
    metric: metric.dataTransform
      ? metric.dataTransform(parseFloat(`${values.metric ?? 0}`))
      : values.metric,
  }))

  if (formattedData[formattedData.length - 1].category === "Gratuito") {
    return [
      formattedData[formattedData.length - 1],
      ...formattedData.slice(0, -1),
    ] // Make free games first in the array
  }

  return formattedData
}

export async function loader({request}: LoaderFunctionArgs) {
  let filters: ParsedFilters

  try {
    filters = getFiltersFromRequest(request)
  } catch (error) {
    return new Response(JSON.stringify({error}), {
      status: 400,
      headers: {"Content-Type": "application/json"},
    })
  }

  const data = await getGames(filters)
  return Response.json(data)
}
