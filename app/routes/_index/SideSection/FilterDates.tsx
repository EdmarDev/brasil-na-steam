import {Checkbox, Group, NumberInput, Stack, Text} from "@mantine/core"
import {DateInput} from "@mantine/dates"
import classes from "./SideSection.module.css"
import {DateTime} from "luxon"
import {useFiltersStore} from "~/filters-store"
import {useMemo} from "react"

const MIN_DATE = "2003-09-12T00:00:00Z" // Steam Launch

export default function FilterDates() {
  const minDateStr = useFiltersStore((state) => state.minDate)
  const setMinDate = useFiltersStore((state) => state.setMinDate)
  const maxDateStr = useFiltersStore((state) => state.maxDate)
  const setMaxDate = useFiltersStore((state) => state.setMaxDate)
  const includeUnreleased = useFiltersStore((state) => state.includeUnreleased)
  const setIncludeUnreleased = useFiltersStore(
    (state) => state.setIncludeUnreleased
  )

  const minDate = useMemo(
    () => (minDateStr ? DateTime.fromISO(minDateStr).toJSDate() : null),
    [minDateStr]
  )

  const maxDate = useMemo(
    () => (maxDateStr ? DateTime.fromISO(maxDateStr).toJSDate() : null),
    [maxDateStr]
  )

  return (
    <Stack gap={0}>
      <Text className={classes.filterNameLabel}>Data de Lançamento</Text>
      <Stack gap={8}>
        <Group gap={8}>
          <Group align="end" flex={1} wrap="nowrap" gap={8}>
            <Text className={classes.filterSmallLabel}>De</Text>
            <DateInput
              variant=""
              classNames={{
                input: classes.dateInput,
                section: classes.inputSection,
              }}
              valueFormat="DD/MM/YYYY"
              minDate={DateTime.fromISO(MIN_DATE).toJSDate()}
              maxDate={maxDate ?? new Date()}
              clearable
              value={minDate}
              onChange={(value) =>
                !!value
                  ? setMinDate(DateTime.fromJSDate(value).toISO())
                  : setMinDate(null)
              }
            />
          </Group>
          <Group align="end" flex={1} wrap="nowrap" gap={8}>
            <Text className={classes.filterSmallLabel}>Até</Text>
            <DateInput
              variant=""
              classNames={{
                input: classes.dateInput,
                section: classes.inputSection,
              }}
              valueFormat="DD/MM/YYYY"
              minDate={minDate ?? DateTime.fromISO(MIN_DATE).toJSDate()}
              maxDate={new Date()}
              clearable
              value={maxDate}
              onChange={(value) =>
                !!value
                  ? setMaxDate(DateTime.fromJSDate(value).toISO())
                  : setMaxDate(null)
              }
            />
          </Group>
        </Group>
        <Checkbox
          variant="outline"
          color="var(--custom-yellow)"
          label="Não Lançados"
          radius={0}
          size={"15px"}
          classNames={{
            input: classes.checkbox,
            label: classes.checkboxLabel,
          }}
          checked={includeUnreleased}
          onChange={(event) =>
            setIncludeUnreleased(event.currentTarget.checked)
          }
          disabled={!!maxDate}
        />
      </Stack>
    </Stack>
  )
}
