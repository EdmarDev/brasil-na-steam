import {Select, Stack, Text} from "@mantine/core"
import classes from "./SideSection.module.css"
import {useMemo} from "react"
import {chartMetrics} from "~/metrics"
import {useFiltersStore} from "~/filters-store"

export default function MetricSelector() {
  const options = useMemo(() => chartMetrics.map((metric) => metric.name), [])
  const currentMetric = useFiltersStore((state) => state.metric)
  const setCurrentMetric = useFiltersStore((state) => state.setMetric)

  return (
    <Stack className={classes.panel}>
      <Text className={classes.metricLabel}>Parâmetro de Comparação</Text>
      <Select
        classNames={{
          input: classes.metricInput,
          dropdown: classes.metricDropdown,
          option: classes.inputDropdownOption,
          section: classes.inputSection,
        }}
        variant="filled"
        data={options}
        allowDeselect={false}
        value={currentMetric.name}
        onChange={(value) => {
          const newMetric = chartMetrics.find((metric) => metric.name === value)
          if (newMetric) setCurrentMetric(newMetric)
        }}
      />
    </Stack>
  )
}
