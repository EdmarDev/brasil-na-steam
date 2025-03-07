import {Checkbox, Group, NumberInput, Stack, Text} from "@mantine/core"
import classes from "./SideSection.module.css"
import {useFiltersStore} from "~/filters-store"
import {useMemo} from "react"

export default function FilterPrices() {
  const minPriceRaw = useFiltersStore((state) => state.minPrice)
  const setMinPrice = useFiltersStore((state) => state.setMinPrice)
  const maxPriceRaw = useFiltersStore((state) => state.maxPrice)
  const setMaxPrice = useFiltersStore((state) => state.setMaxPrice)
  const includeFree = useFiltersStore((state) => state.includeFree)
  const setIncludeFree = useFiltersStore((state) => state.setIncludeFree)

  const minPrice = useMemo(
    () => (minPriceRaw ? minPriceRaw / 100 : ""),
    [minPriceRaw]
  )
  const maxPrice = useMemo(
    () => (maxPriceRaw ? maxPriceRaw / 100 : ""),
    [maxPriceRaw]
  )

  return (
    <Stack gap={0}>
      <Text className={classes.filterNameLabel}>Preço</Text>
      <Stack gap={8}>
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
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              decimalSeparator=","
              thousandSeparator="."
              max={maxPrice === "" ? undefined : maxPrice}
              value={minPrice}
              onChange={(value) =>
                setMinPrice(
                  isNaN(parseFloat(`${value}`))
                    ? null
                    : Math.floor(parseFloat(`${value}`) * 100)
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
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              decimalSeparator=","
              thousandSeparator="."
              min={minPrice === "" ? 0 : minPrice}
              value={maxPrice}
              onChange={(value) =>
                setMaxPrice(
                  isNaN(parseFloat(`${value}`))
                    ? null
                    : Math.floor(parseFloat(`${value}`) * 100)
                )
              }
            />
          </Group>
        </Group>
        <Checkbox
          variant="outline"
          color="var(--custom-yellow)"
          label="Jogos Gratuitos"
          radius={0}
          size={"15px"}
          classNames={{
            input: classes.checkbox,
            label: classes.checkboxLabel,
          }}
          checked={includeFree}
          onChange={(event) => setIncludeFree(event.currentTarget.checked)}
          disabled={!!minPrice}
        />
      </Stack>
    </Stack>
  )
}
