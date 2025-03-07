import {game, genre, tag} from "db/schema"
import {eq, gte, inArray, isNotNull, lte, type SQLWrapper} from "drizzle-orm"
import {DateTime} from "luxon"
import type {ParsedFilters} from "~/validation"
import {getMetricQuery, latestFollowers, latestReviews} from "./metric-queries"
import {chartMetrics, getMetricFromName} from "~/metrics"

export const getSQLConditionsFromFilters = (filters: ParsedFilters) => {
  const conditions: (SQLWrapper | undefined)[] = []

  if (!!filters.minDate) {
    const formattedDate = DateTime.fromISO(filters.minDate).toFormat(
      "yyyy-MM-dd"
    )
    conditions.push(gte(game.releaseDate, formattedDate))
  }

  if (!!filters.maxDate) {
    const formattedDate = DateTime.fromISO(filters.maxDate).toFormat(
      "yyyy-MM-dd"
    )
    conditions.push(lte(game.releaseDate, formattedDate))
  }

  if (filters.includeUnreleased === false) {
    conditions.push(eq(game.released, true))
  }

  if (!!filters.minPrice) {
    conditions.push(gte(game.price, filters.minPrice))
  }
  if (!!filters.maxPrice) {
    conditions.push(lte(game.price, filters.maxPrice))
  }

  if (filters.includeFree === false) {
    conditions.push(isNotNull(game.price))
  }

  if (!!filters.minFollowers) {
    conditions.push(gte(latestFollowers.followers, filters.minFollowers))
  }

  if (!!filters.maxFollowers) {
    conditions.push(lte(latestFollowers.followers, filters.maxFollowers))
  }

  if (!!filters.minTotalReviews) {
    conditions.push(gte(latestReviews.totalReviews, filters.minTotalReviews))
  }

  if (!!filters.maxTotalReviews) {
    conditions.push(lte(latestReviews.totalReviews, filters.maxTotalReviews))
  }

  if (!!filters.minPositiveReviews) {
    conditions.push(
      gte(latestReviews.positivePercentage, filters.minPositiveReviews)
    )
  }

  if (!!filters.maxPositiveReviews) {
    conditions.push(
      lte(latestReviews.positivePercentage, filters.maxPositiveReviews)
    )
  }

  if (!!filters.genres && filters.genres.length > 0) {
    conditions.push(inArray(genre.name, filters.genres))
  }

  if (!!filters.tags && filters.tags.length > 0) {
    conditions.push(inArray(tag.name, filters.tags))
  }

  return conditions
}

export const filtersRequireFollowers = (filters: ParsedFilters) => {
  const metric = filters.metric
    ? getMetricFromName(filters.metric)
    : chartMetrics[0]

  return (
    !!filters.minFollowers ||
    !!filters.maxFollowers ||
    metric.queryName === "latestFollowers"
  )
}

export const filtersRequireReviews = (filters: ParsedFilters) => {
  const metric = filters.metric
    ? getMetricFromName(filters.metric)
    : chartMetrics[0]

  return (
    !!filters.minPositiveReviews ||
    !!filters.minTotalReviews ||
    !!filters.maxPositiveReviews ||
    !!filters.maxTotalReviews ||
    metric.queryName === "latestReviews"
  )
}

export const filtersRequireGenres = (filters: ParsedFilters) => !!filters.genres

export const filtersRequireTags = (filters: ParsedFilters) => !!filters.tags

export const filtersRequireGames = (filters: ParsedFilters) =>
  !!filters.minDate ||
  !!filters.maxDate ||
  !filters.includeUnreleased ||
  !!filters.minPrice ||
  !!filters.maxPrice ||
  !filters.includeFree

export const getWithQueriesFromFilters = (filters: ParsedFilters) => {
  const metric = filters.metric
    ? getMetricFromName(filters.metric)
    : chartMetrics[0]
  const withQueries = [getMetricQuery(metric)]

  if (filtersRequireReviews(filters) && metric.queryName !== "latestReviews")
    withQueries.push(latestReviews)

  if (
    filtersRequireFollowers(filters) &&
    metric.queryName !== "latestFollowers"
  )
    withQueries.push(latestFollowers)

  return withQueries
}
