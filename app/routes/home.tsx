import type {Route} from "./+types/home"
import {Welcome} from "../welcome/welcome"
import {dbTest} from "db"

export function meta({}: Route.MetaArgs) {
  return [
    {title: "New React Router App"},
    {name: "description", content: "Welcome to React Router!"},
  ]
}

export async function loader({params}: Route.LoaderArgs) {
  const product = await dbTest()
  return product
}

export default function Home() {
  return <Welcome />
}
