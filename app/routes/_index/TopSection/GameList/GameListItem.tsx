import {Group, Image as MantineImage, Stack, Text} from "@mantine/core"
import classes from "./GameList.module.css"
import {useEffect, useState} from "react"

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
  const capsuleUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`
  const fallbackUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  const [imageSrc, setImageSrc] = useState(capsuleUrl)

  useEffect(() => {
    const img = new Image()
    img.src = capsuleUrl
    img.onload = () => setImageSrc(capsuleUrl)
    img.onerror = () => setImageSrc(fallbackUrl)
  }, [appId]) // Run effect when appId changes

  return (
    <Group
      className={classes.listItem}
      component="a"
      //@ts-ignore
      href={`https://store.steampowered.com/app/${appId}`}
      target="_blank"
    >
      <MantineImage
        className={classes.gameCapsule}
        src={imageSrc}
        alt="Game Image"
      />
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
