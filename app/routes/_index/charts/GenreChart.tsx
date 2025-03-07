import BaseChart from "./BaseChart"
import {useQuery} from "@tanstack/react-query"
import {Center, Loader, Text} from "@mantine/core"
import {useFiltersParams, useFiltersStore} from "~/filters-store"
import {useDebouncedValue} from "@mantine/hooks"

export default function GenreChart() {
  const filterParams = useFiltersParams()
  const [debouncedParams] = useDebouncedValue(filterParams, 500)
  const metric = useFiltersStore((state) => state.metric)

  const {data, isLoading} = useQuery({
    queryKey: ["gameGenres", debouncedParams],
    queryFn: async () => {
      const res = await fetch(`/api/game-genres?${debouncedParams}`)
      if (res.ok) {
        return await res.json()
      }
      return []
    },
  })

  if (isLoading) {
    return (
      <Center mih={"inherit"}>
        <Loader />
      </Center>
    )
  }

  if (data?.length === 0) {
    return (
      <Center mih={"inherit"}>
        <Text c={"var(--custom-yellow)"}>Sem Dados</Text>
      </Center>
    )
  }

  return (
    <BaseChart
      metricLabel={metric.name}
      offsetTicks
      series={[
        {name: "A", data},
        // {name: "B", data},
        // {name: "C", data},
      ]}
    />
  )
}
