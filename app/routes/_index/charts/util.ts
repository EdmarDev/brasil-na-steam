import type {ChartSeries} from "./types"

export const getSeriesGameCountName = (series: ChartSeries) =>
  `gameCount${series.name}`

export const getSeriesMetricName = (series: ChartSeries) =>
  `metric${series.name}`

export const getBarColor = (index: number) =>
  ["var(--chart-green)", "var(--chart-yellow)", "var(--chart-blue)"][index % 3]

export const getDxForLabel = (labelText: string, fontSize = 12) => {
  const approxCharacterSize = fontSize * 0.64
  return -(labelText.length * approxCharacterSize) / 3
}
