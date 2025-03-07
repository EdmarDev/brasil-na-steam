export type ChartMetric = {
  name: string
  aggregationMethod: "Average" | "Median"
  queryName: "latestReviews" | "latestFollowers"
  fieldName: string
  dataTransform?: (value: number) => number
}

export const chartMetrics: ChartMetric[] = [
  {
    name: "Análises Recebidas (Média)",
    aggregationMethod: "Average",
    queryName: "latestReviews",
    fieldName: "totalReviews",
    dataTransform: (value) => Math.round(value),
  },
  {
    name: "Análises Recebidas (Mediana)",
    aggregationMethod: "Median",
    queryName: "latestReviews",
    fieldName: "totalReviews",
    dataTransform: (value) => Math.round(value),
  },

  {
    name: "Seguidores (Média)",
    aggregationMethod: "Average",
    queryName: "latestFollowers",
    fieldName: "followers",
    dataTransform: (value) => Math.round(value),
  },
  {
    name: "Seguidores (Mediana)",
    aggregationMethod: "Median",
    queryName: "latestFollowers",
    fieldName: "followers",
    dataTransform: (value) => Math.round(value),
  },

  {
    name: "Percentual de Análises Positivas (Média)",
    aggregationMethod: "Average",
    queryName: "latestReviews",
    fieldName: "positivePercentage",
    dataTransform: (value) => value * 100,
  },
  {
    name: "Percentual de Análises Positivas (Mediana)",
    aggregationMethod: "Median",
    queryName: "latestReviews",
    fieldName: "positivePercentage",
    dataTransform: (value) => value * 100,
  },
]

export const getMetricFromName = (metricName: string) =>
  chartMetrics.find((metric) => metric.name === metricName) ?? chartMetrics[0]
