import {z} from "zod"

const filtersSchema = z.object({
  metric: z.string().optional(),

  minDate: z.string().optional(),
  maxDate: z.string().optional(),
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

  minFollowers: z.coerce.number().optional(),
  maxFollowers: z.coerce.number().optional(),

  minTotalReviews: z.coerce.number().optional(),
  maxTotalReviews: z.coerce.number().optional(),

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

export const getFiltersFromRequest = (request: Request) => {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)

  return filtersSchema.parse(params)
}
