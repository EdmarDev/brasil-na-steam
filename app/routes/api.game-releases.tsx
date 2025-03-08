import {drizzleDb} from "db"
import {game, gameGenre, gameTag, genre, tag} from "db/schema"
import {
  and,
  asc,
  avg,
  count,
  eq,
  isNull,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm"
import type {LoaderFunctionArgs} from "react-router"
import {
  getMetricField,
  latestFollowers,
  latestReviews,
} from "util/metric-queries"
import {
  filtersRequireFollowers,
  filtersRequireGenres,
  filtersRequireReviews,
  filtersRequireTags,
  getSQLConditionsFromFilters,
} from "util/query-filters"
import {chartMetrics, getMetricFromName} from "~/metrics"
import {getFiltersFromRequest, type ParsedFilters} from "~/validation"

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
      category: sql<string>`date_part('year', ${game.releaseDate})`.as("year"),
      gameCount: count(),
      metric:
        metric.aggregationMethod === "Median"
          ? sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${getMetricField(
              metric
            )})`
          : avg(getMetricField(metric)),
    })
    .from(game)
    .groupBy(sql`year`)
    .orderBy(asc(sql`year`))
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
