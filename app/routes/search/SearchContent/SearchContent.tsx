import {keepPreviousData, useQuery} from "@tanstack/react-query"
import classes from "./SearchContent.module.css"
import {useFiltersParams} from "~/filters-store"
import {useDebouncedValue} from "@mantine/hooks"
import type {GameSearchData} from "~/routes/api.search"
import {
  Box,
  Center,
  Loader,
  LoadingOverlay,
  Pagination,
  Stack,
  Text,
} from "@mantine/core"
import {useEffect, useMemo, useState} from "react"
import SearchGameItem from "./SearchGameItem"

const PER_PAGE = 30

export default function SearchContent() {
  const filterParams = useFiltersParams(true)
  const [debouncedParams] = useDebouncedValue(filterParams, 500)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => setCurrentPage(1), [debouncedParams])

  const {
    data: queryResponse,
    isLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["gameSearch", debouncedParams, currentPage],
    queryFn: async (): Promise<{
      data: GameSearchData[]
      totalCount: number
    }> => {
      const res = await fetch(
        `/api/search?page=${
          currentPage - 1
        }&perPage=${PER_PAGE}&${debouncedParams}`
      )
      if (res.ok) {
        return await res.json()
      }

      console.error(await res.text())
      return {
        data: [],
        totalCount: 0,
      }
    },
    placeholderData: keepPreviousData,
  })

  const maxPages =
    !!queryResponse && queryResponse.totalCount > 0
      ? Math.ceil(queryResponse.totalCount / PER_PAGE)
      : 0

  const items = useMemo(() => {
    if (!queryResponse || queryResponse.data.length === 0) return []

    return queryResponse.data.map((gameData) => (
      <SearchGameItem key={gameData.appId} gameData={gameData} />
    ))
  }, [queryResponse])

  if (isLoading) {
    return (
      <Center mih={"inherit"}>
        <Loader />
      </Center>
    )
  }

  return (
    <Box pos={"relative"}>
      <LoadingOverlay
        visible={isPlaceholderData}
        zIndex={1000}
        overlayProps={{radius: "xs", opacity: 0.1}}
        loaderProps={{
          color: "var(--custom-yellow)",
          type: "bars",
          p: 0,
          size: "lg",
        }}
      />
      <Stack>
        {items}
        {queryResponse?.data.length === 0 && (
          <Center>
            <Text c={"var(--custom-yellow)"}>Sem Dados</Text>
          </Center>
        )}
        {maxPages > 0 && (
          <Pagination
            disabled={isPlaceholderData}
            classNames={{
              root: classes.paginationRoot,
              dots: classes.paginationDots,
              control: classes.paginationControl,
            }}
            siblings={2}
            total={maxPages}
            value={currentPage}
            onChange={setCurrentPage}
          />
        )}
      </Stack>
    </Box>
  )
}
