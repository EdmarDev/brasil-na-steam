import type {InferSelectModel} from "drizzle-orm"
import type {company, game, tag} from "./schema"

export type Company = InferSelectModel<typeof company>
export type Game = InferSelectModel<typeof game>
export type Tag = InferSelectModel<typeof tag>
