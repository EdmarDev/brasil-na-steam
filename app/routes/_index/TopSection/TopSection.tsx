import {Group} from "@mantine/core"
import classes from "./TopSection.module.css"
import GameList from "./GameList/GameList"
import {useLoaderData} from "react-router"
import type {TopGames} from "~/routes/api.top-games"
import {formatNumber, formatReleaseDate} from "util/format"

export default function TopSection() {
  const topGames: TopGames = useLoaderData()?.topGames

  return (
    <Group className={classes.container} justify="center">
      <GameList
        title="Jogos Populares"
        games={topGames.popular}
        getDescriptionText={(game) =>
          game.totalReviews ? `${formatNumber(game.totalReviews)} Análises` : ""
        }
      />
      <GameList
        title="Últimos Lançamentos"
        games={topGames.recent}
        getDescriptionText={(game) =>
          game.releaseDate ? formatReleaseDate(game.releaseDate) : ""
        }
      />
      <GameList
        title="Mais Aguardados"
        games={topGames.upcoming}
        getDescriptionText={(game) =>
          game.followers ? `${formatNumber(game.followers)} Seguidores` : "-"
        }
      />
    </Group>
  )
}
