import {Box, Text} from "@mantine/core"
import type {TooltipProps} from "recharts"
import classes from "./Charts.module.css"
import type {ChartSeries} from "./types"
import {getSeriesGameCountName, getSeriesMetricName} from "./util"

type ChartTooltipProps = TooltipProps<number, string> & {
  hoveredSeries?: ChartSeries
  metricLabel: string
}

export default function ChartTooltip({
  hoveredSeries,
  metricLabel,
  active,
  payload,
}: ChartTooltipProps) {
  if (!active || !hoveredSeries || !payload) return null
  const countPayload = payload.find(
    (element) => element.dataKey === getSeriesGameCountName(hoveredSeries)
  )
  const metricPayload = payload.find(
    (elemet) => elemet.dataKey === getSeriesMetricName(hoveredSeries)
  )
  if (countPayload) {
    const gameCountText = "Jogos"
    const metricText = `${metricPayload?.value ?? 0} ${metricLabel}`
    return (
      <Box className={classes.customTooltip}>
        <Text>
          <Text span className={classes.tooltipNumber}>
            {countPayload.value}
          </Text>{" "}
          {gameCountText}
        </Text>
        <Text className={classes.metricText}>
          <Text span className={classes.tooltipNumber}>
            {metricPayload?.value ?? 0}
          </Text>{" "}
          {metricLabel}
        </Text>
      </Box>
    )
  }

  return null
}
