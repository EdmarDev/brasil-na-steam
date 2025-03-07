import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"
import type {Route} from "./+types/root"
import stylesheet from "./app.css?url"
import {
  ColorSchemeScript,
  MantineProvider,
  Text,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import "@mantine/core/styles.css"
import "@mantine/charts/styles.css"
import "@mantine/dates/styles.css"
import {DatesProvider} from "@mantine/dates"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import "dayjs/locale/pt-br"

dayjs.extend(customParseFormat)

export const links: Route.LinksFunction = () => [
  {rel: "preconnect", href: "https://fonts.googleapis.com"},
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {rel: "stylesheet", href: stylesheet},
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap",
  },
]

const theme = createTheme({
  components: {
    Text: Text.extend({
      defaultProps: {
        inherit: true,
        ff: `"Amiko", "Arial", sans-serif`,
        tt: "uppercase",
      },
    }),
  },
})

const queryClient = new QueryClient()

export function Layout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <DatesProvider settings={{consistentWeeks: true, locale: "pt-br"}}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme}>{children}</MantineProvider>
          </QueryClientProvider>
        </DatesProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
