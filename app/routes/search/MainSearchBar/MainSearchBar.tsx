import {Button, Group, Select, Stack, Text, TextInput} from "@mantine/core"
import classes from "./MainSearchBar.module.css"
import {IconSearch} from "@tabler/icons-react"
import {useFiltersStore} from "~/filters-store"
import {sortDirectionOptions, sortOptions} from "util/sort-options"
import {useState} from "react"

const ICON_SIZE = 16

export default function MainSearchBar() {
  const searchString = useFiltersStore((state) => state.searchString)
  const setSearchString = useFiltersStore((state) => state.setSearchString)
  const sortBy = useFiltersStore((state) => state.sortBy)
  const setSortBy = useFiltersStore((state) => state.setSortBy)
  const sortDirection = useFiltersStore((state) => state.sortDirection)
  const setSortDirection = useFiltersStore((state) => state.setSortDirection)

  const [searchValue, setSearchValue] = useState(searchString ?? "")

  const handleSubmit = () => {
    setSearchString(searchValue)
  }

  return (
    <Stack className={classes.container}>
      <Group>
        <TextInput
          size="md"
          variant="unstyled"
          classNames={{input: classes.search, root: classes.searchRoot}}
          placeholder="Buscar por título do jogo"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit()
            }
          }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button
          size="md"
          variant="unstyled"
          className={classes.searchButton}
          onClick={handleSubmit}
        >
          Buscar
        </Button>
      </Group>
      <Group>
        <Text className={classes.sortLabel}>Ordenar Por</Text>
        <Select
          w={256}
          size="xs"
          classNames={{
            input: classes.selectInput,
            dropdown: classes.selectDropdown,
            option: classes.selectDropdownOption,
            section: classes.inputSection,
          }}
          variant="filled"
          data={sortOptions}
          allowDeselect={false}
          value={sortBy}
          onChange={(value) => setSortBy(value as any)}
        />
        <Select
          maw={128}
          size="xs"
          classNames={{
            input: classes.selectInput,
            dropdown: classes.selectDropdown,
            option: classes.selectDropdownOption,
            section: classes.inputSection,
          }}
          variant="filled"
          data={sortDirectionOptions}
          allowDeselect={false}
          value={sortDirection}
          onChange={(value) => setSortDirection(value as any)}
        />
      </Group>
    </Stack>
  )
}
