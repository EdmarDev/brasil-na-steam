import BaseChart from "./BaseChart"
import {useQuery} from "@tanstack/react-query"
import {Center, Loader} from "@mantine/core"

export default function GenreChart() {
  const {data, isLoading} = useQuery({
    queryKey: ["gameGenres"],
    queryFn: async () => await (await fetch("/api/game-genres")).json(),
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
