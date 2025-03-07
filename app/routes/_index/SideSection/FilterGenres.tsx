import {MultiSelect, Stack, Text} from "@mantine/core"
import classes from "./SideSection.module.css"
import {genreNames} from "util/genre-names"
import {useFiltersStore} from "~/filters-store"

export default function FilterGenres() {
  const genres = useFiltersStore((state) => state.genres)
  const setGenres = useFiltersStore((state) => state.setGenres)

  return (
    <Stack gap={0}>
      <Text className={classes.filterNameLabel}>Gêneros</Text>
      <MultiSelect
        classNames={{
          input: classes.multiSelectInput,
          section: classes.inputSection,
          dropdown: classes.inputDropdown,
          option: classes.inputDropdownOption,
          inputField: classes.multiSelectInputField,
          pill: classes.multiSelectPill,
        }}
        data={genreNames}
        placeholder="Adicionar filtro"
        variant=""
        searchable
        rightSection={<span />}
        value={genres}
        onChange={setGenres}
      />
    </Stack>
  )
}
