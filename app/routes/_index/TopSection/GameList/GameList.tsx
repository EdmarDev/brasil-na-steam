import {Stack, Text} from "@mantine/core"
import classes from "./GameList.module.css"
import GameListItem from "./GameListItem"
import {useLoaderData} from "react-router"
import {useMemo} from "react"
import type {GameWithRelations} from "db/types"

type GameListProps = {
  title: string
  games: GameWithRelations[]
  getDescriptionText: (game: GameWithRelations) => string
}

export default function GameList({
  title,
  games,
  getDescriptionText,
}: GameListProps) {
  const items = useMemo(
    () =>
      games.map((game) => (
        <GameListItem
          key={game.appId}
          title={game.name ?? ""}
          description={getDescriptionText(game)}
          appId={game.appId}
        />
      )),
    [games.map((g) => g.appId)]
  )

  return (
    <Stack className={classes.container}>
      <Text className={classes.title}>{title}</Text>
      {items}
      <Text className={classes.seeMore} tt="none" component="a" href="/search">
        Ver Mais
      </Text>
    </Stack>
  )
}
