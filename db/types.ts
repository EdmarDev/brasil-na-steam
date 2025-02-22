import type {InferSelectModel} from "drizzle-orm"
import type {company, game, genre, language, tag} from "./schema"

export type Company = InferSelectModel<typeof company>
export type Game = InferSelectModel<typeof game>
export type Tag = InferSelectModel<typeof tag>
export type Genre = InferSelectModel<typeof genre>
export type Language = InferSelectModel<typeof language>

export type GameWithRelations = Game & {
  tags?: Tag[]
  followers?: number
  totalReviews?: number
  positivePercentage?: number
  genres?: Genre[]
  languages?: Language[]
  developers?: Company[]
  publishers?: Company[]
}
