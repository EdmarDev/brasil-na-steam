import {Loader, MultiSelect, Stack, Text} from "@mantine/core"
import classes from "./SideSection.module.css"
import {useQuery} from "@tanstack/react-query"
import {useFiltersStore} from "~/filters-store"

export default function FilterTags() {
  const {isLoading, data} = useQuery({
    queryKey: ["tagsList"],
    queryFn: async () => await (await fetch("/api/tags-list")).json(),
  })

  const tags = useFiltersStore((state) => state.tags)
  const setTags = useFiltersStore((state) => state.setTags)

  return (
    <Stack gap={0}>
      <Text className={classes.filterNameLabel}>Tags</Text>
      <MultiSelect
        classNames={{
          input: classes.multiSelectInput,
          section: classes.inputSection,
          dropdown: classes.inputDropdown,
          option: classes.inputDropdownOption,
          inputField: classes.multiSelectInputField,
          pill: classes.multiSelectPill,
        }}
        data={data}
        placeholder="Adicionar filtro"
        variant=""
        searchable
        rightSection={<span />}
        leftSection={isLoading ? <Loader size={"xs"} /> : undefined}
        value={tags}
        onChange={setTags}
      />
    </Stack>
  )
}
