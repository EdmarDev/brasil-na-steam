import BaseChart from "./BaseChart"
import {useQuery} from "@tanstack/react-query"
import {Center, Loader} from "@mantine/core"

export default function LanguagesChart() {
  const {data, isLoading} = useQuery({
    queryKey: ["gameLanguages"],
    queryFn: async () => await (await fetch("/api/game-languages")).json(),
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
      offsetTicks
      series={[
        {name: "A", data},
        // {name: "B", data},
        // {name: "C", data},
      ]}
    />
  )
}
