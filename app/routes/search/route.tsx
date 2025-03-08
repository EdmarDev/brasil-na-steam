import {Grid, Stack} from "@mantine/core"
import classes from "../_index/Home.module.css"
import Navbar from "../_index/Navbar/Navbar"
import FiltersPanel from "../_index/SideSection/FiltersPanel"
import MainSearchBar from "./MainSearchBar/MainSearchBar"
import SearchContent from "./SearchContent/SearchContent"

export function meta() {
  return [{title: "Brasil Na Steam"}]
}

export default function Search() {
  return (
    <div className={classes.container}>
      <Navbar />
      <Grid gutter={0} className={classes.grid}>
        <Grid.Col span={3}>
          <Stack className={classes.sideSection}>
            <FiltersPanel />
          </Stack>
        </Grid.Col>
        <Grid.Col span={6}>
          <Stack>
            <MainSearchBar />
            <SearchContent />
          </Stack>
        </Grid.Col>
        <Grid.Col span={3}></Grid.Col>
      </Grid>
    </div>
  )
}
