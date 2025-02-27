export type ChartValues = {
  category: number | string
  gameCount: number
  metric: number
}

export type ChartSeries = {
  name: string
  data: ChartValues[]
}
