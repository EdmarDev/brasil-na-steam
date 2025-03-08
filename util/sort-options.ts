export const sortOptions = [
  "Data de Lançamento",
  "Nome",
  "Preço",
  "Seguidores",
  "Análises Recebidas",
  "Percentual de Análises Positivas",
] as const

export type SortOption = (typeof sortOptions)[number]

export const sortDirectionOptions = ["Crescente", "Decrescente"] as const

export type SortDirectionOption = (typeof sortDirectionOptions)[number]
