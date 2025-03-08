import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {gameTag, gameReviews, tag, game, gameGenre, genre} from "db/schema"
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
  type SQLWrapper,
} from "drizzle-orm"
import {genreNames} from "util/genre-names"
import {getFiltersFromRequest, type ParsedFilters} from "~/validation"
import {chartMetrics, getMetricFromName} from "~/metrics"
import {
  filtersRequireFollowers,
  filtersRequireGames,
  filtersRequireGenres,
  filtersRequireReviews,
  getSQLConditionsFromFilters,
} from "util/query-filters"
import {
  getMetricField,
  latestFollowers,
  latestReviews,
} from "util/metric-queries"

const MAX_TAGS = 12

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
      category: tag.name,
      gameCount: count(),
      metric:
        metric.aggregationMethod === "Median"
          ? sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${getMetricField(
              metric
            )})`
          : avg(getMetricField(metric)),
    })
    .from(gameTag)
    .groupBy(tag.name)
    .leftJoin(tag, eq(gameTag.tagId, tag.id))
    .orderBy(desc(count()))
    .limit(MAX_TAGS)
    .$dynamic()

  const metricConditions: (SQLWrapper | undefined)[] = []
  if (includeReviews || true) {
    query = query.leftJoin(
      latestReviews,
      eq(latestReviews.gameAppId, gameTag.gameAppId)
    )
    metricConditions.push(
      or(eq(latestReviews.rrn, "1"), isNull(latestReviews.rrn))
    )
  }
  if (includeFollowers || true) {
    query = query.leftJoin(
      latestFollowers,
      eq(latestFollowers.gameAppId, gameTag.gameAppId)
    )
    metricConditions.push(
      or(eq(latestFollowers.frn, "1"), isNull(latestFollowers.frn))
    )
  }

  if (filtersRequireGames(filters)) {
    query = query.leftJoin(game, eq(game.appId, gameTag.gameAppId))
  }

  if (filtersRequireGenres(filters)) {
    query = query
      .leftJoin(gameGenre, eq(gameTag.gameAppId, gameGenre.gameAppId))
      .leftJoin(genre, eq(gameGenre.genreId, genre.id))
  }

  query = query.where(
    and(
      notInArray(tag.name, genreNames),
      ...getSQLConditionsFromFilters(filters),
      ...metricConditions
    )
  )

  const data = await query
  if (data.length === 0) {
    return []
  }

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
