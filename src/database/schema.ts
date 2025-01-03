import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    picture: text("picture"),
    email: text("email").notNull(),
    provider: text("provider").notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull()
});

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});
