import {drizzleDb} from "db"
import {
  company,
  game,
  gameDeveloper,
  gameGenre,
  gameLanguage,
  gamePublisher,
  gameTag,
  genre,
  language,
  tag,
} from "db/schema"
import {
  aliasedTable,
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  isNull,
  or,
  sql,
  type AnyColumn,
} from "drizzle-orm"
import type {LoaderFunctionArgs} from "react-router"
import {latestFollowers, latestReviews} from "util/metric-queries"
import {getSQLConditionsFromFilters} from "util/query-filters"
import type {SortOption} from "util/sort-options"
import {
  getFiltersFromRequest,
  getSearchParamsFromRequest,
  type ParsedSearchParams,
} from "~/validation"

export type GameSearchData = {
  appId: number
  name?: string | null
  price?: number | null
  releaseDate?: string | null
  released?: boolean | null
  shortDescription?: string | null
  followers?: number | null
  totalReviews?: number | null
  positivePercentage?: number | null
  languages?: string[]
  genres?: string[]
  tags?: string[]
  developers?: string[]
  publishers?: string[]
}

const sortOptionToColumn: {[key in SortOption]: AnyColumn} = {
  "Análises Recebidas": latestReviews.totalReviews,
  "Data de Lançamento": game.releaseDate,
  Nome: game.name,
  "Percentual de Análises Positivas": latestReviews.positivePercentage,
  Preço: game.price,
  Seguidores: latestFollowers.followers,
}

const getSortFromParams = (params: ParsedSearchParams) => {
  const sortFunc = params.sortDirection === "Crescente" ? asc : desc

  return sortFunc(sortOptionToColumn[params.sortBy])
}

const getGames = async (
  params: ParsedSearchParams
): Promise<[GameSearchData[], number]> => {
  const dev = aliasedTable(company, "dev")
  const pub = aliasedTable(company, "pub")

  const queryResult = await drizzleDb
    .with(latestFollowers, latestReviews)
    .select({
      appId: game.appId,
      name: game.name,
      price: game.price,
      releaseDate: game.releaseDate,
      released: game.released,
      shortDescription: game.shortDescription,
      followers: latestFollowers.followers,
      totalReviews: latestReviews.totalReviews,
      positivePercentage: latestReviews.positivePercentage,
      totalCount: sql<number>`COUNT(*) OVER()`.as("totalCount"),
      languages: sql<string[]>`ARRAY_AGG(DISTINCT ${language.name})`.as(
        "languages"
      ),
      genres: sql<string[]>`ARRAY_AGG(DISTINCT ${genre.name})`.as("genres"),
      tags: sql<string[]>`ARRAY_AGG(DISTINCT ${tag.name})`.as("tags"),
      developers: sql<string[]>`ARRAY_AGG(DISTINCT ${dev.steamName})`.as(
        "developers"
      ),
      publishers: sql<string[]>`ARRAY_AGG(DISTINCT ${pub.steamName})`.as(
        "publishers"
      ),
    })
    .from(game)
    .leftJoin(latestReviews, eq(latestReviews.gameAppId, game.appId))
    .leftJoin(latestFollowers, eq(latestFollowers.gameAppId, game.appId))
    .leftJoin(gameLanguage, eq(gameLanguage.gameAppId, game.appId))
    .leftJoin(language, eq(language.id, gameLanguage.languageId))
    .leftJoin(gameGenre, eq(gameGenre.gameAppId, game.appId))
    .leftJoin(genre, eq(genre.id, gameGenre.genreId))
    .leftJoin(gameTag, eq(gameTag.gameAppId, game.appId))
    .leftJoin(tag, eq(tag.id, gameTag.tagId))
    .leftJoin(gameDeveloper, eq(gameDeveloper.gameAppId, game.appId))
    .leftJoin(dev, eq(gameDeveloper.companyId, dev.id))
    .leftJoin(gamePublisher, eq(gamePublisher.gameAppId, game.appId))
    .leftJoin(pub, eq(pub.id, gamePublisher.companyId))
    .where(
      and(
        or(eq(latestReviews.rrn, "1"), isNull(latestReviews.rrn)),
        or(eq(latestFollowers.frn, "1"), isNull(latestFollowers.frn)),
        ...getSQLConditionsFromFilters(params)
      )
    )
    .groupBy(
      game.appId,
      latestFollowers.followers,
      latestReviews.totalReviews,
      latestReviews.positivePercentage
    )
    .orderBy(getSortFromParams(params))
    .limit(params.perPage)
    .offset(params.page * params.perPage)

  const totalCount = queryResult.length > 0 ? queryResult[0].totalCount : 0
  const games = queryResult.map((result) => {
    const {totalCount, ...rest} = result
    return rest
  })

  return [games, totalCount]
}

export async function loader({request}: LoaderFunctionArgs) {
  let params: ParsedSearchParams

  try {
    params = getSearchParamsFromRequest(request)
  } catch (error) {
    return new Response(JSON.stringify({error}), {
      status: 400,
      headers: {"Content-Type": "application/json"},
    })
  }

  const [games, totalCount] = await getGames(params)
  return Response.json({data: games, totalCount})
}
