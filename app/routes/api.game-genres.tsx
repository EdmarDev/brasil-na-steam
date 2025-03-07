import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {game, gameGenre, gameTag, genre, tag} from "db/schema"
import {
  and,
  asc,
  avg,
  count,
  eq,
  getTableColumns,
  inArray,
  isNull,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm"
import {genreNames} from "util/genre-names"
import {getFiltersFromRequest, type ParsedFilters} from "~/validation"
import {chartMetrics, getMetricFromName} from "~/metrics"
import {
  filtersRequireFollowers,
  filtersRequireGames,
  filtersRequireReviews,
  filtersRequireTags,
  getSQLConditionsFromFilters,
} from "util/query-filters"
import {
  getMetricField,
  latestFollowers,
  latestReviews,
} from "util/metric-queries"

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
      category: genre.name,
      gameCount: count(),
      metric:
        metric.aggregationMethod === "Median"
          ? sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${getMetricField(
              metric
            )})`
          : avg(getMetricField(metric)),
    })
    .from(gameGenre)
    .groupBy(genre.name)
    .leftJoin(genre, eq(gameGenre.genreId, genre.id))
    .orderBy(asc(genre.name))
    .$dynamic()

  const metricConditions: (SQLWrapper | undefined)[] = []
  if (includeReviews || true) {
    query = query.leftJoin(
      latestReviews,
      eq(latestReviews.gameAppId, gameGenre.gameAppId)
    )
    metricConditions.push(
      or(eq(latestReviews.rrn, "1"), isNull(latestReviews.rrn))
    )
  }
  if (includeFollowers || true) {
    query = query.leftJoin(
      latestFollowers,
      eq(latestFollowers.gameAppId, gameGenre.gameAppId)
    )
    metricConditions.push(
      or(eq(latestFollowers.frn, "1"), isNull(latestFollowers.frn))
    )
  }

  if (filtersRequireGames(filters)) {
    query = query.leftJoin(game, eq(game.appId, gameGenre.gameAppId))
  }
  if (filtersRequireTags(filters)) {
    query = query
      .leftJoin(gameTag, eq(gameGenre.gameAppId, gameTag.gameAppId))
      .leftJoin(tag, eq(gameTag.tagId, tag.id))
  }

  query = query.where(
    and(
      inArray(genre.name, genreNames),
      ...getSQLConditionsFromFilters(filters),
      ...metricConditions
    )
  )

  const data = await query
  if (metric.dataTransform !== undefined) {
    const transform = metric.dataTransform
    return data.map((values) => ({
      ...values,
      metric: transform(parseFloat(`${values.metric ?? 0}`)),
    }))
  }
  return data
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
