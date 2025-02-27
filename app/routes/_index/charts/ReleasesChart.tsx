import {BarChart, CompositeChart} from "@mantine/charts"
import {formatNumber} from "util/format"
import BaseChart from "./BaseChart"
import {useQuery} from "@tanstack/react-query"
import {Center, Loader} from "@mantine/core"

export default function ReleasesChart() {
  const {data, isLoading} = useQuery({
    queryKey: ["gameReleases"],
    queryFn: async () => await (await fetch("/api/game-releases")).json(),
  })

  if (isLoading) {
    return (
      <Center mih={"inherit"}>
        <Loader />
      </Center>
    )
  }
  return (
    <BaseChart
      metricLabel="Análises Recebidas (Média)"
      series={[
        {name: "A", data},
        // {name: "B", data},
        // {name: "C", data},
      ]}
    />
  )
}
