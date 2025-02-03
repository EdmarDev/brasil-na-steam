import {relations} from "drizzle-orm"
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

export const company = pgTable(
  "company",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    steamName: text().unique().notNull(),
    isBrazilian: boolean(),
  },
  (t) => [
    uniqueIndex("company_name_index").on(t.steamName),
    index("company_is_brasilian_index").on(t.isBrazilian),
  ]
)

export const companyRelations = relations(company, ({many}) => ({
  published: many(gamePublisher, {relationName: "publisher"}),
  developed: many(gameDeveloper, {relationName: "developer"}),
}))

export const game = pgTable(
  "game",
  {
    appId: integer().primaryKey(),
    lastUpdate: timestamp({withTimezone: true, mode: "string"}),
    name: text(),
    released: boolean(),
    releaseDate: date(),
    price: integer(),
    shortDescription: text(),
    detailedDescription: text(),
    communityName: text(),
  },
  (t) => [
    index("game_last_update_index").on(t.lastUpdate),
    index("game_release_date_index").on(t.releaseDate),
    index("game_price_index").on(t.price),
  ]
)

export const gameRelations = relations(game, ({many}) => ({
  followers: many(gameFollowers),
  reviews: many(gameReviews),
  publishers: many(gamePublisher, {relationName: "publisher"}),
  developers: many(gameDeveloper, {relationName: "developer"}),
  gameToGenres: many(gameGenre),
  gameToTags: many(gameTag),
  gameToLanguages: many(gameLanguage),
}))

export const genre = pgTable("genre", {
  id: integer().primaryKey(),
  name: text().unique().notNull(),
})

export const genreRelations = relations(genre, ({many}) => ({
  genreToGames: many(gameGenre),
}))

export const tag = pgTable("tag", {
  id: integer().primaryKey(),
  name: text().unique().notNull(),
})

export const tagRelations = relations(tag, ({many}) => ({
  tagToGames: many(gameTag),
}))

export const language = pgTable("language", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().unique().notNull(),
})

export const languageRelations = relations(language, ({many}) => ({
  languageToGames: many(gameLanguage),
}))

export const gameFollowers = pgTable(
  "game_followers",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    followers: integer().notNull(),
    timestamp: timestamp({withTimezone: true, mode: "string"}).notNull(),
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
  },
  (t) => [
    index("follower_game_index").on(t.gameAppId),
    index("follower_timestamp_index").on(t.timestamp),
  ]
)

export const gameFollowersRelations = relations(gameFollowers, ({one}) => ({
  game: one(game, {
    fields: [gameFollowers.gameAppId],
    references: [game.appId],
  }),
}))

export const gameReviews = pgTable(
  "game_reviews",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    totalReviews: integer().notNull(),
    positivePercentage: real().notNull(),
    timestamp: timestamp({withTimezone: true, mode: "string"}).notNull(),
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
  },
  (t) => [
    index("review_game_index").on(t.gameAppId),
    index("review_timestamp_index").on(t.timestamp),
  ]
)

export const gameReviewsRelations = relations(gameReviews, ({one}) => ({
  game: one(game, {fields: [gameReviews.gameAppId], references: [game.appId]}),
}))

export const gamePublisher = pgTable(
  "game_publisher",
  {
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
    companyId: integer()
      .notNull()
      .references(() => company.id),
  },
  (t) => [primaryKey({columns: [t.companyId, t.gameAppId]})]
)

export const gamePublisherRelations = relations(gamePublisher, ({one}) => ({
  game: one(game, {
    fields: [gamePublisher.gameAppId],
    references: [game.appId],
  }),
  company: one(company, {
    fields: [gamePublisher.companyId],
    references: [company.id],
  }),
}))

export const gameDeveloper = pgTable(
  "game_developer",
  {
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
    companyId: integer()
      .notNull()
      .references(() => company.id),
  },
  (t) => [primaryKey({columns: [t.companyId, t.gameAppId]})]
)

export const gameDeveloperRelations = relations(gameDeveloper, ({one}) => ({
  game: one(game, {
    fields: [gameDeveloper.gameAppId],
    references: [game.appId],
  }),
  company: one(company, {
    fields: [gameDeveloper.companyId],
    references: [company.id],
  }),
}))

export const gameGenre = pgTable(
  "game_genre",
  {
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
    genreId: integer()
      .notNull()
      .references(() => genre.id),
  },
  (t) => [primaryKey({columns: [t.genreId, t.gameAppId]})]
)

export const gameGenreRelations = relations(gameGenre, ({one}) => ({
  game: one(game, {
    fields: [gameGenre.gameAppId],
    references: [game.appId],
  }),
  genre: one(genre, {
    fields: [gameGenre.genreId],
    references: [genre.id],
  }),
}))

export const gameTag = pgTable(
  "game_tag",
  {
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
    tagId: integer()
      .notNull()
      .references(() => tag.id),
  },
  (t) => [primaryKey({columns: [t.tagId, t.gameAppId]})]
)

export const gameTagRelations = relations(gameTag, ({one}) => ({
  game: one(game, {
    fields: [gameTag.gameAppId],
    references: [game.appId],
  }),
  tag: one(tag, {
    fields: [gameTag.tagId],
    references: [tag.id],
  }),
}))

export const gameLanguage = pgTable(
  "game_language",
  {
    gameAppId: integer()
      .notNull()
      .references(() => game.appId),
    languageId: integer()
      .notNull()
      .references(() => language.id),
  },
  (t) => [primaryKey({columns: [t.languageId, t.gameAppId]})]
)

export const gameLanguageRelations = relations(gameLanguage, ({one}) => ({
  game: one(game, {
    fields: [gameLanguage.gameAppId],
    references: [game.appId],
  }),
  language: one(language, {
    fields: [gameLanguage.languageId],
    references: [language.id],
  }),
}))
