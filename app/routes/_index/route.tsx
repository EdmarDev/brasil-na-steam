import {Box, Paper, RangeSlider, Text} from "@mantine/core"
import type {Route} from "./+types/route"
import Navbar from "./Navbar/Navbar"
import classes from "./Home.module.css"
import TopSection from "./TopSection/TopSection"
import type {TopGames} from "../api.top-games"

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
      <Box h={2500} />
    </div>
  )
}
