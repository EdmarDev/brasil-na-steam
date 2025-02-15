import {Box, Text} from "@mantine/core"
import classes from "./Navbar.module.css"

export default function Navbar() {
  return (
    <Box className={classes.bar}>
      <Text className={classes.text} component="a" href="/">
        Brasil Na Steam
      </Text>
    </Box>
  )
}
