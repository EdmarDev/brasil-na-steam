import {
  Group,
  NumberInput,
  RangeSlider,
  Space,
  Stack,
  Text,
} from "@mantine/core"
import classes from "./SideSection.module.css"
import {useFiltersStore} from "~/filters-store"
import {useMemo} from "react"

export default function FilterReviews() {
  const minTotalReviews = useFiltersStore((state) => state.minTotalReviews)
  const setMinTotalReviews = useFiltersStore(
    (state) => state.setMinTotalReviews
  )
  const maxTotalReviews = useFiltersStore((state) => state.maxTotalReviews)
  const setMaxTotalReviews = useFiltersStore(
    (state) => state.setMaxTotalReviews
  )

  const minPositiveReviewsRaw = useFiltersStore(
    (state) => state.minPositiveReviews
  )
  const setMinPositiveReviews = useFiltersStore(
    (state) => state.setMinPositiveReviews
  )
  const maxPositiveReviewsRaw = useFiltersStore(
    (state) => state.maxPositiveReviews
  )
  const setMaxPositiveReviews = useFiltersStore(
    (state) => state.setMaxPositiveReviews
  )

  const minPositiveReviews = useMemo(
    () => (minPositiveReviewsRaw ? minPositiveReviewsRaw * 100 : undefined),
    [minPositiveReviewsRaw]
  )
  const maxPositiveReviews = useMemo(
    () => (maxPositiveReviewsRaw ? maxPositiveReviewsRaw * 100 : undefined),
    [maxPositiveReviewsRaw]
  )

  return (
    <Stack gap={0}>
      <Text className={classes.filterNameLabel}>Análises</Text>
      <Text className={classes.filterMediumLabel}>Quantidade</Text>
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
            max={maxTotalReviews}
            value={minTotalReviews ?? ""}
            onChange={(value) =>
              setMinTotalReviews(
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
            min={minTotalReviews}
            value={maxTotalReviews ?? ""}
            onChange={(value) =>
              setMaxTotalReviews(
                isNaN(parseFloat(`${value}`)) ? null : parseFloat(`${value}`)
              )
            }
          />
        </Group>
      </Group>
      <Space h={8} />
      <Text className={classes.filterMediumLabel}>Percentual Positivo</Text>
      <RangeSlider
        label={(value) => `${value}%`}
        color="var(--custom-yellow)"
        classNames={{
          track: classes.sliderBackground,
          thumb: classes.sliderThumb,
        }}
        size={"sm"}
        value={[minPositiveReviews ?? 0, maxPositiveReviews ?? 100]}
        onChange={(value) => {
          setMinPositiveReviews(value[0] / 100)
          setMaxPositiveReviews(value[1] / 100)
        }}
      />
    </Stack>
  )
}
