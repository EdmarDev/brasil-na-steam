import {Box, Paper, RangeSlider, Text} from "@mantine/core"
import type {Route} from "./+types/route"
import Navbar from "./Navbar/navbar"
import classes from "./Home.module.css"

export function meta({}: Route.MetaArgs) {
  return [{title: "Brasil Na Steam"}]
}

export async function loader({params}: Route.LoaderArgs) {
  return {}
}

export default function Home() {
  return (
    <div className={classes.container}>
      <Navbar />
      <Box h={2500} />
    </div>
  )
}
