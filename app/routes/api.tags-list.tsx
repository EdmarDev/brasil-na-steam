import {drizzleDb} from "db"
import type {LoaderFunctionArgs} from "react-router"

export async function loader({request}: LoaderFunctionArgs) {
  const tags = (
    await drizzleDb.query.tag.findMany({
      columns: {
        name: true,
      },
      orderBy: (tag, {asc}) => asc(tag.name),
    })
  ).map((tagsList) => tagsList.name)

  return Response.json(tags)
}
