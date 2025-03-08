import {Group, Stack, Text} from "@mantine/core"
import classes from "./GameList.module.css"
import {useEffect, useState} from "react"
import CapsuleImage from "~/common-components/CapsuleImage"

type GameListItemProps = {
  title: string
  description: string
  appId: number
}
export default function GameListItem({
  title,
  description,
  appId,
}: GameListItemProps) {
  return (
    <Group
      className={classes.listItem}
      component="a"
      //@ts-ignore
      href={`https://store.steampowered.com/app/${appId}`}
      target="_blank"
    >
      <CapsuleImage appId={appId} className={classes.gameCapsule} />
      <Stack className={classes.itemTextStack}>
        <Text className={classes.itemTitle} tt={"none"}>
          {title}
        </Text>
        <Text className={classes.itemDescription} tt={"none"}>
          {description}
        </Text>
      </Stack>
    </Group>
  )
}
