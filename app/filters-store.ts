import {DateTime} from "luxon"
import {chartMetrics, type ChartMetric} from "./metrics"
import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import {useMemo} from "react"

type FiltersState = {
  metric: ChartMetric

  minDate: string | null
  maxDate?: string
  includeUnreleased: boolean

  minPrice?: number
  maxPrice?: number
  includeFree: boolean

  minFollowers?: number
  maxFollowers?: number

  minTotalReviews?: number
  maxTotalReviews?: number

  minPositiveReviews?: number
  maxPositiveReviews?: number

  genres?: string[]
  tags?: string[]
}

type FiltersActions = {
  setMetric: (metric: ChartMetric) => void

  setMinDate: (value: string | null) => void
  setMaxDate: (value: string | null) => void
  setIncludeUnreleased: (value: boolean) => void

  setMinPrice: (value: number | null) => void
  setMaxPrice: (value: number | null) => void

  setIncludeFree: (value: boolean) => void

  setMinFollowers: (value: number | null) => void
  setMaxFollowers: (value: number | null) => void

  setMinTotalReviews: (value: number | null) => void
  setMaxTotalReviews: (value: number | null) => void

  setMinPositiveReviews: (value: number | null) => void
  setMaxPositiveReviews: (value: number | null) => void

  setGenres: (value: string[]) => void
  setTags: (value: string[]) => void
}

export const useFiltersStore = create<FiltersState & FiltersActions>()(
  persist(
    (set) => ({
      metric: chartMetrics[0],
      minDate: DateTime.fromObject({year: 2015, day: 1, month: 1}).toISO()!,
      includeUnreleased: true,
      includeFree: true,

      setMetric: (metric) => set({metric}),
      setMinDate: (minDate) => set({minDate: minDate || null}),
      setMaxDate: (maxDate) => set({maxDate: maxDate || undefined}),
      setIncludeUnreleased: (includeUnreleased) => set({includeUnreleased}),
      setMinPrice: (minPrice) => set({minPrice: minPrice ?? undefined}),
      setMaxPrice: (maxPrice) => set({maxPrice: maxPrice ?? undefined}),
      setIncludeFree: (includeFree) => set({includeFree}),
      setMinFollowers: (minFollowers) =>
        set({minFollowers: minFollowers ?? undefined}),
      setMaxFollowers: (maxFollowers) =>
        set({maxFollowers: maxFollowers ?? undefined}),
      setMinTotalReviews: (minTotalReviews) =>
        set({minTotalReviews: minTotalReviews ?? undefined}),
      setMaxTotalReviews: (maxTotalReviews) =>
        set({maxTotalReviews: maxTotalReviews ?? undefined}),
      setMinPositiveReviews: (minPositiveReviews) =>
        set({minPositiveReviews: minPositiveReviews ?? undefined}),
      setMaxPositiveReviews: (maxPositiveReviews) =>
        set({maxPositiveReviews: maxPositiveReviews ?? undefined}),
      setGenres: (genres) => set({genres}),
      setTags: (tags) => set({tags}),
    }),
    {
      name: "filters-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const useFiltersParams = () => {
  const filters = useFiltersStore()

  return useMemo(() => {
    const params = new URLSearchParams()

    if (filters.metric) {
      params.set("metric", filters.metric.name)
    }
    if (filters.minDate) params.set("minDate", filters.minDate)
    if (filters.maxDate) params.set("maxDate", filters.maxDate)
    if (!filters.includeUnreleased) params.set("includeUnreleased", "0")
    if (filters.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice))
    if (filters.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice))
    if (!filters.includeFree) params.set("includeFree", "0")
    if (filters.minFollowers !== undefined)
      params.set("minFollowers", String(filters.minFollowers))
    if (filters.maxFollowers !== undefined)
      params.set("maxFollowers", String(filters.maxFollowers))
    if (filters.minTotalReviews !== undefined)
      params.set("minTotalReviews", String(filters.minTotalReviews))
    if (filters.maxTotalReviews !== undefined)
      params.set("maxTotalReviews", String(filters.maxTotalReviews))
    if (filters.minPositiveReviews !== undefined)
      params.set("minPositiveReviews", String(filters.minPositiveReviews))
    if (filters.maxPositiveReviews !== undefined)
      params.set("maxPositiveReviews", String(filters.maxPositiveReviews))
    if (filters.genres && filters.genres.length > 0)
      params.set("genres", filters.genres.join(","))
    if (filters.tags && filters.tags.length > 0)
      params.set("tags", filters.tags.join(","))

    return params.toString()
  }, [filters])
}
