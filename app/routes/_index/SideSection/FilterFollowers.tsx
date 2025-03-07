import {Group, NumberInput, Stack, Text} from "@mantine/core"
import classes from "./SideSection.module.css"
import {useFiltersStore} from "~/filters-store"

export default function FilterFollowers() {
  const minFollowers = useFiltersStore((state) => state.minFollowers)
  const setMinFollowers = useFiltersStore((state) => state.setMinFollowers)
  const maxFollowers = useFiltersStore((state) => state.maxFollowers)
  const setMaxFollowers = useFiltersStore((state) => state.setMaxFollowers)

  return (
    <Stack gap={0}>
      <Text className={classes.filterNameLabel}>Seguidores</Text>
      <Group gap={8}>
        <Group align="end" flex={1} wrap="nowrap" gap={8}>
          <Text className={classes.filterSmallLabel}>De</Text>
          <NumberInput
            hideControls
            variant=""
            classNames={{
              input: classes.filterInput,
              section: classes.inputSection,
            }}
            allowNegative={false}
            allowDecimal={false}
            thousandSeparator="."
            decimalSeparator=","
            max={maxFollowers}
            value={minFollowers ?? ""}
            onChange={(value) =>
              setMinFollowers(
                isNaN(parseFloat(`${value}`)) ? null : parseFloat(`${value}`)
              )
            }
          />
        </Group>
        <Group align="end" flex={1} wrap="nowrap" gap={8}>
          <Text className={classes.filterSmallLabel}>Até</Text>
          <NumberInput
            hideControls
            variant=""
            classNames={{
              input: classes.filterInput,
              section: classes.inputSection,
            }}
            allowNegative={false}
            allowDecimal={false}
            thousandSeparator="."
            decimalSeparator=","
            min={minFollowers}
            value={maxFollowers ?? ""}
            onChange={(value) =>
              setMaxFollowers(
                isNaN(parseFloat(`${value}`)) ? null : parseFloat(`${value}`)
              )
            }
          />
        </Group>
      </Group>
    </Stack>
  )
}
