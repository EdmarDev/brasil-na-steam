import {DateTime} from "luxon"

const numberFormatter = new Intl.NumberFormat("pt-BR")

export const formatNumber = numberFormatter.format

export const formatReleaseDate = (releaseDate: string) => {
  const splitDate = releaseDate.split("-")
  const luxonDate = DateTime.fromObject({
    year: parseInt(splitDate[0]),
    month: parseInt(splitDate[1]),
    day: parseInt(splitDate[2]),
  })

  return luxonDate.toLocaleString(DateTime.DATE_MED, {locale: "pt-BR"})
}

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
})

export const formatPrice = (price: number) => {
  return priceFormatter.format(price / 100)
}
