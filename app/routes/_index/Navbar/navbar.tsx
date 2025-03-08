import {Box, Group, Text, TextInput} from "@mantine/core"
import classes from "./Navbar.module.css"
import {IconSearch} from "@tabler/icons-react"
import {useFiltersStore} from "~/filters-store"
import {useState} from "react"
import {useLocation, useNavigate} from "react-router"

const ICON_SIZE = 14

export default function Navbar() {
  const setSarchString = useFiltersStore((state) => state.setSearchString)
  const [value, setValue] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = () => {
    setSarchString(value)
    if (location.pathname !== "/search") navigate("/search")
  }

  return (
    <Group className={classes.bar}>
      <Text className={classes.text} component="a" href="/">
        Brasil Na Steam
      </Text>
      <TextInput
        size="xs"
        variant="unstyled"
        classNames={{input: classes.search, section: classes.searchSection}}
        placeholder="Buscar"
        rightSection={
          <IconSearch
            size={ICON_SIZE}
            className={classes.searchIcon}
            onClick={handleSubmit}
          />
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSubmit()
          }
        }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Group>
  )
}
