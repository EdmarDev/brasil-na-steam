import {Box, Stack, Text} from "@mantine/core"
import classes from "./ChartContainer.module.css"
import type {PropsWithChildren} from "react"

type ChartSectionProps = PropsWithChildren & {
  title: string
}

export default function ChartContainer({title, children}: ChartSectionProps) {
  return (
    <Stack>
      <Text className={classes.title}>{title}</Text>
      <Box className={classes.chartBackground}>{children}</Box>
    </Stack>
  )
}
