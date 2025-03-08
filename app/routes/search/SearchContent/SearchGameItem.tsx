import type {GameSearchData} from "~/routes/api.search"
import classes from "./SearchContent.module.css"
import {Badge, Divider, Group, Mark, Stack, Text, Tooltip} from "@mantine/core"
import CapsuleImage from "~/common-components/CapsuleImage"
import {formatNumber, formatPrice, formatReleaseDate} from "util/format"
import {useMemo, type JSX} from "react"

const TAGS_LIMIT = 4

type SearchGameItemProps = {
  gameData: GameSearchData
}

export default function SearchGameItem({gameData}: SearchGameItemProps) {
  const priceLabel =
    gameData.released && !!gameData.price
      ? formatPrice(gameData.price)
      : "Gratuito"
  const releaseDateLabel =
    gameData.released && !!gameData.releaseDate
      ? formatReleaseDate(gameData.releaseDate)
      : "Não Lançado"
  const reviewsLabel = gameData.released
    ? `${formatNumber(gameData.totalReviews ?? 0)} (${
        Math.round((gameData.positivePercentage ?? 0) * 10000) / 100
      }%)`
    : ""
  const followersLabel = `${formatNumber(gameData.followers ?? 0)}`

  const developersLabel =
    gameData.developers && gameData.developers.length > 0
      ? `${gameData.developers.join(", ")}`
      : null
  const publishersLabel =
    gameData.publishers && gameData.publishers.length > 0
      ? `${gameData.publishers.join(", ")}`
      : null

  const genreBadges = useMemo(() => {
    if (!gameData.genres || gameData.genres.length === 0) {
      return []
    }

    return gameData.genres.map((genre) => (
      <Badge
        key={genre}
        variant="outline"
        color="var(--custom-green-bright)"
        size="xs"
        radius="xs"
        style={{cursor: "pointer"}}
      >
        {genre}
      </Badge>
    ))
  }, [gameData.genres])

  const tagBadges = useMemo(() => {
    if (!gameData.tags || gameData.tags.length === 0) {
      return []
    }

    const shownTags = gameData.tags.slice(0, TAGS_LIMIT)
    const others = gameData.tags.slice(TAGS_LIMIT)

    const elements: JSX.Element[] = []

    elements.push(
      ...shownTags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          color="#fff"
          size="xs"
          radius="xs"
          style={{cursor: "pointer"}}
        >
          {tag}
        </Badge>
      ))
    )

    if (others.length > 0) {
      elements.push(
        <Tooltip label={others.join(", ")} key={"others"}>
          <Badge
            variant="outline"
            color="#fff"
            size="xs"
            radius="xs"
            style={{cursor: "help"}}
          >
            +{others.length}
          </Badge>
        </Tooltip>
      )
    }

    return elements
  }, [gameData.tags])

  return (
    <Stack
      component="a"
      //@ts-ignore
      href={`https://store.steampowered.com/app/${gameData.appId}`}
      target="_blank"
      className={classes.searchItem}
    >
      <Group className={classes.itemMainGroup}>
        <CapsuleImage appId={gameData.appId} className={classes.gameCapsule} />
        <Stack className={classes.itemTextStack}>
          <Text className={classes.gameTitle} tt={"none"}>
            {gameData.name}
          </Text>
          <Text className={classes.gameDescription} tt={"none"}>
            {gameData.shortDescription}
          </Text>
        </Stack>
      </Group>
      <Stack gap={0}>
        <Group>
          {!!developersLabel && (
            <Text className={classes.itemSmallLabel}>
              <Text className={classes.itemSmallLabelFaded} span>
                Desenvolvedor:
              </Text>{" "}
              {developersLabel}
            </Text>
          )}
          {!!publishersLabel && (
            <Text className={classes.itemSmallLabel}>
              {" "}
              <Text className={classes.itemSmallLabelFaded} span>
                Distribuidora:
              </Text>{" "}
              {publishersLabel}
            </Text>
          )}
        </Group>
        <Group>
          {!!gameData.released && (
            <>
              <Text className={classes.itemSmallLabel} fw={700}>
                {priceLabel}
              </Text>
            </>
          )}
          <Text className={classes.itemSmallLabel}>{releaseDateLabel}</Text>

          {!!reviewsLabel && (
            <>
              <Text className={classes.itemSmallLabel}>
                {reviewsLabel}
                <Text span className={classes.itemSmallLabelFaded}>
                  {" "}
                  Análises
                </Text>
              </Text>
            </>
          )}
          <Text className={classes.itemSmallLabel}>
            {followersLabel}
            <Text span className={classes.itemSmallLabelFaded}>
              {" "}
              Seguidores
            </Text>
          </Text>
        </Group>
        <Group justify="space-between">
          <Group gap={4}>{genreBadges}</Group>
          <Group gap={4}>{tagBadges}</Group>
        </Group>
      </Stack>
    </Stack>
  )
}
