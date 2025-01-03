import type { FileLog } from "@/lib/minecraft/core/engine/migrations/types";
import { pgTable, text, timestamp, varchar, boolean, integer, json } from "drizzle-orm/pg-core";

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

export const purchase = pgTable("purchase", {
    id: text("id").notNull().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => userTable.id),
    productId: text("productId").notNull()
});

export const migrationLog = pgTable("migration_log", {
    id: text("id").primaryKey(),
    datapackId: text("datapack_id").notNull(),
    date: timestamp("date", {
        withTimezone: true,
        mode: "date"
    }).notNull(),
    version: integer("version").notNull(),
    isModded: boolean("is_modded").notNull(),
    isMinified: boolean("is_minified").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    logs: json("logs").$type<FileLog[]>().notNull()
});

export const migrationNamespace = pgTable("migration_namespace", {
    id: text("id").primaryKey(),
    migrationId: text("migration_id")
        .notNull()
        .references(() => migrationLog.id),
    namespace: text("namespace").notNull()
});

export const product = pgTable("product", {
    id: text("id").primaryKey(),
    name: text("name").notNull().default(""),
    productId: text("product_id").notNull().default(""),
    uploadId: text("upload_id").notNull().default(""),
    priceId: text("price_id").notNull().default(""),
    filename: text("filename").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date"
    }).notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});

export type Product = typeof product.$inferSelect;
