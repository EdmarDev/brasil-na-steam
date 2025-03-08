import {sortDirectionOptions, sortOptions} from "util/sort-options"
import {z} from "zod"

const filtersSchema = z.object({
  metric: z.string().optional(),

  minDate: z.string().datetime({offset: true}).optional(),
  maxDate: z.string().datetime({offset: true}).optional(),
  includeUnreleased: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  includeFree: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  minFollowers: z.coerce.number().int().nonnegative().optional(),
  maxFollowers: z.coerce.number().int().nonnegative().optional(),

  minTotalReviews: z.coerce.number().int().nonnegative().optional(),
  maxTotalReviews: z.coerce.number().int().nonnegative().optional(),

  minPositiveReviews: z.coerce.number().optional(),
  maxPositiveReviews: z.coerce.number().optional(),

  genres: z
    .string()
    .transform((val) => val.split(","))
    .optional(),
  tags: z
    .string()
    .transform((val) => val.split(","))
    .optional(),
})

export type ParsedFilters = z.infer<typeof filtersSchema>

const searchSchema = filtersSchema.extend({
  searchString: z.string().optional(),
  sortBy: z.enum(sortOptions).default(sortOptions[0]),
  sortDirection: z.enum(sortDirectionOptions).default(sortDirectionOptions[0]),
  page: z.coerce.number().int().nonnegative().default(0),
  perPage: z.coerce.number().int().nonnegative().default(30),
})

export type ParsedSearchParams = z.infer<typeof searchSchema>

export const getFiltersFromRequest = (request: Request) => {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)

  return filtersSchema.parse(params)
}

export const getSearchParamsFromRequest = (request: Request) => {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)

  return searchSchema.parse(params)
}
