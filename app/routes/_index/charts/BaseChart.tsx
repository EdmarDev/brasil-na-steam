import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {formatNumber} from "util/format"
import classes from "./Charts.module.css"
import ChartTooltip from "./ChartTooltip"
import {useRef} from "react"
import type {ChartSeries} from "./types"
import {
  getBarColor,
  getDxForLabel,
  getSeriesGameCountName,
  getSeriesMetricName,
} from "./util"

const FONT_SIZE = 12

type BaseChartProps = {
  metricLabel: string
  series: ChartSeries[]
}

const SmallBar = (props: any) => {
  const {fill, x, y, width, height} = props
  const smallWidth = Math.max(2, width * 0.15)
  return (
    <Rectangle
      x={x + width / 2 - smallWidth / 2}
      y={y}
      width={smallWidth}
      height={height}
      fill={fill}
      opacity={0.85}
    />
  )
}

const formatData = (series: ChartSeries[]) => {
  if (series.length === 0) return []

  const allCategories: (number | string)[] = []
  series.forEach((chartSeries) =>
    chartSeries.data.forEach((values) => {
      if (!allCategories.some((category) => category === values.category))
        allCategories.push(values.category)
    })
  )

  return allCategories.map((category) => {
    const data: {[key: string]: number | string} = {}
    data.category = category

    series.forEach((chartSeries) => {
      const categoryData = chartSeries.data.find(
        (values) => values.category === category
      )
      if (categoryData) {
        data[getSeriesGameCountName(chartSeries)] = categoryData.gameCount
        data[getSeriesMetricName(chartSeries)] = categoryData.metric
      }
    })

    return data
  })
}

export default function BaseChart({series, metricLabel}: BaseChartProps) {
  const data = formatData(series)

  const hoveredSeries = useRef<ChartSeries[]>([])

  const bars = series
    .map((chartSeries, i) => [
      <Bar
        key={getSeriesGameCountName(chartSeries)}
        dataKey={getSeriesGameCountName(chartSeries)}
        fill={getBarColor(i)}
        onMouseEnter={() => hoveredSeries.current.unshift(chartSeries)}
        onMouseLeave={() =>
          (hoveredSeries.current = hoveredSeries.current.filter(
            (series) => series.name !== chartSeries.name
          ))
        }
      />,
      <Bar
        key={getSeriesMetricName(chartSeries)}
        dataKey={getSeriesMetricName(chartSeries)}
        fill="var(--chart-metric)"
        yAxisId={"right"}
        xAxisId={"metric"}
        shape={SmallBar}
        onMouseEnter={() => hoveredSeries.current.unshift(chartSeries)}
        onMouseLeave={() =>
          (hoveredSeries.current = hoveredSeries.current.filter(
            (series) => series.name !== chartSeries.name
          ))
        }
      />,
    ])
    .flat()

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        width={5000}
        height={300}
        data={data}
        margin={{top: 24, left: 10}}
      >
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          fontSize={FONT_SIZE}
        />
        <XAxis
          xAxisId={"metric"}
          dataKey="category"
          tickLine={false}
          axisLine={false}
          hide
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          label={{
            value: "Quant. de Jogos",
            angle: 0,
            position: "top",
            offset: 12,
            fontSize: FONT_SIZE,
            dx: 20,
          }}
          tickFormatter={formatNumber}
          fontSize={FONT_SIZE}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          label={{
            value: metricLabel,
            angle: 0,
            position: "top",
            textAnchor: "left",
            fontSize: FONT_SIZE,
            offset: 12,
            dx: getDxForLabel(metricLabel),
          }}
          fontSize={FONT_SIZE}
          fill="var(--chart-metric)"
          className={classes.metricAxis}
        />
        <defs>
          <linearGradient id="cursor-gradient" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#ffffff66" />
            <stop offset="100%" stopColor="#ffffff33" />
          </linearGradient>
        </defs>
        <Tooltip
          cursor={{
            fill: "url(#cursor-gradient)",
            fillOpacity: 0.25,
          }}
          content={({active, payload}) => (
            <ChartTooltip
              active={active}
              metricLabel={metricLabel}
              payload={payload as any}
              hoveredSeries={hoveredSeries.current[0]}
            />
          )}
          isAnimationActive={false}
        />
        {bars}
      </BarChart>
    </ResponsiveContainer>
  )
}
