import {useEffect, useState} from "react"
import {Image as MantineImage} from "@mantine/core"

type CapsuleImageProps = {
  appId: number
  className?: string
}

export default function CapsuleImage({appId, className}: CapsuleImageProps) {
  const capsuleUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`
  const fallbackUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  const [imageSrc, setImageSrc] = useState(capsuleUrl)

  useEffect(() => {
    const img = new Image()
    img.src = capsuleUrl
    img.onload = () => setImageSrc(capsuleUrl)
    img.onerror = () => setImageSrc(fallbackUrl)
  }, [appId]) // Run effect when appId changes

  return <MantineImage className={className} src={imageSrc} alt="Game Image" />
}
