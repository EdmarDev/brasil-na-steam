import type {LoaderFunctionArgs} from "react-router"
import {drizzleDb} from "db"
import {
  game,
  gameGenre,
  gameLanguage,
  gameReviews,
  gameTag,
  genre,
  language,
  tag,
} from "db/schema"
import {
  and,
  avg,
  count,
  desc,
  eq,
  getTableColumns,
  isNull,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm"
import {getFiltersFromRequest, type ParsedFilters} from "~/validation"
import {chartMetrics, getMetricFromName} from "~/metrics"
import {
  filtersRequireFollowers,
  filtersRequireGames,
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

const MAX_LANGUAGES = 12

const getGames = async (filters: ParsedFilters) => {
  // const latestReviews = drizzleDb.$with("latestReviews").as(
  //   drizzleDb
  //     .select({
  //       ...getTableColumns(gameReviews),
  //       rn: sql<string>`ROW_NUMBER() OVER (PARTITION BY ${gameReviews.gameAppId} ORDER BY ${gameReviews.timestamp} DESC)`.as(
  //         "rn"
  //       ),
  //     })
  //     .from(gameReviews)
  // )

  // const data = await drizzleDb
  //   .with(latestReviews)
  //   .select({
  //     category: language.name,
  //     gameCount: count(),
  //     metric: avg(latestReviews.totalReviews),
  //   })
  //   .from(gameLanguage)
  //   .leftJoin(
  //     latestReviews,
  //     eq(latestReviews.gameAppId, gameLanguage.gameAppId)
  //   )
  //   .leftJoin(language, eq(gameLanguage.languageId, language.id))
  //   .where(and(or(eq(latestReviews.rn, "1"), isNull(latestReviews.rn))))
  //   .groupBy(language.name)
  //   .orderBy(desc(count()))
  //   .limit(MAX_LANGUAGES)

  // return data.map((values) => ({
  //   ...values,
  //   metric: Math.round(parseFloat(values.metric ?? "0")),
  // }))

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
      category: language.name,
      gameCount: count(),
      metric:
        metric.aggregationMethod === "Median"
          ? sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${getMetricField(
              metric
            )})`
          : avg(getMetricField(metric)),
    })
    .from(gameLanguage)
    .groupBy(language.name)
    .leftJoin(language, eq(gameLanguage.languageId, language.id))
    .orderBy(desc(count()))
    .limit(MAX_LANGUAGES)
    .$dynamic()

  const metricConditions: (SQLWrapper | undefined)[] = []
  if (includeReviews || true) {
    query = query.leftJoin(
      latestReviews,
      eq(latestReviews.gameAppId, gameLanguage.gameAppId)
    )
    metricConditions.push(
      or(eq(latestReviews.rrn, "1"), isNull(latestReviews.rrn))
    )
  }
  if (includeFollowers || true) {
    query = query.leftJoin(
      latestFollowers,
      eq(latestFollowers.gameAppId, gameLanguage.gameAppId)
    )
    metricConditions.push(
      or(eq(latestFollowers.frn, "1"), isNull(latestFollowers.frn))
    )
  }

  if (filtersRequireGames(filters)) {
    query = query.leftJoin(game, eq(game.appId, gameLanguage.gameAppId))
  }

  if (filtersRequireGenres(filters)) {
    query = query
      .leftJoin(gameGenre, eq(gameLanguage.gameAppId, gameGenre.gameAppId))
      .leftJoin(genre, eq(gameGenre.genreId, genre.id))
  }

  if (filtersRequireTags(filters)) {
    query = query
      .leftJoin(gameTag, eq(gameLanguage.gameAppId, gameTag.gameAppId))
      .leftJoin(tag, eq(gameTag.tagId, tag.id))
  }

  query = query.where(
    and(...getSQLConditionsFromFilters(filters), ...metricConditions)
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
