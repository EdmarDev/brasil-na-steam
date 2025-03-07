import {Divider, Group, NumberInput, Stack, Text} from "@mantine/core"
import classes from "./SideSection.module.css"
import FilterDates from "./FilterDates"
import FilterPrices from "./FilterPrices"
import FilterFollowers from "./FilterFollowers"
import FilterReviews from "./FilterReviews"
import FilterGenres from "./FilterGenres"
import FilterTags from "./FilterTags"

export default function FiltersPanel() {
  return (
    <Stack className={classes.panel}>
      <Text className={classes.filtersTitle}>Filtros</Text>
      <Divider variant="dashed" opacity={0.5} />
      <FilterDates />
      <FilterPrices />
      <FilterFollowers />
      <FilterReviews />
      <FilterGenres />
      <FilterTags />
      <Divider variant="dashed" opacity={0.5} />
    </Stack>
  )
}
