import {Box, Paper, RangeSlider, Stack, Text} from "@mantine/core"
import type {Route} from "./+types/route"
import Navbar from "./Navbar/Navbar"
import classes from "./Home.module.css"
import TopSection from "./TopSection/TopSection"
import type {TopGames} from "../api.top-games"
import ChartContainer from "./ChartContainer/ChartContainer"
import ReleasesChart from "./charts/ReleasesChart"
import GenreChart from "./charts/GenreChart"
import PricesChart from "./charts/PricesChart"
import TagsChart from "./charts/TagsChart"
import LanguagesChart from "./charts/LanguagesChart"

export function meta({}: Route.MetaArgs) {
  return [{title: "Brasil Na Steam"}]
}

export async function loader({params, request}: Route.LoaderArgs) {
  const url = new URL("/api/top-games", request.url)
  const topGames: TopGames = await (await fetch(url.toString())).json()
  return {topGames}
}

export default function Home() {
  return (
    <div className={classes.container}>
      <Navbar />
      <TopSection />
      <Stack className={classes.chartsContainer}>
        <ChartContainer title="Lançamentos por ano">
          <ReleasesChart />
        </ChartContainer>
        <ChartContainer title="Comparação de gêneros">
          <GenreChart />
        </ChartContainer>
        <ChartContainer title="Principais Tags">
          <TagsChart />
        </ChartContainer>
        <ChartContainer title="Distribuição de preços">
          <PricesChart />
        </ChartContainer>
        <ChartContainer title="Idiomas suportados">
          <LanguagesChart />
        </ChartContainer>
      </Stack>
    </div>
  )
}
