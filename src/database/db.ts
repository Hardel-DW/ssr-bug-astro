import { purchase, migrationLog, migrationNamespace } from "@/database/schema";
import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { Log } from "@/lib/minecraft/core/engine/migrations/types";
import { randomUUID } from "node:crypto";

export const database_url = import.meta.env.DATABASE_URL;
const sql = neon(database_url);

export const db = drizzle(sql);

export const checkPurchase = async (userId: string, productId: string) => {
    const result = await db
        .select()
        .from(purchase)
        .where(and(eq(purchase.userId, userId), eq(purchase.productId, productId)));

    return result.length > 0;
};

export const saveMigrationLog = async (log: Log) => {
    const migrationLogId = randomUUID();

    try {
        let date: Date;
        if (typeof log.date === "string") {
            const [day, month, year] = log.date.split("/");
            date = new Date(`${year}-${month}-${day}`);
        } else if (typeof log.date === "object" && log.date !== null && "getTime" in log.date) {
            date = log.date;
        } else {
            date = new Date(log.date);
        }

        if (!Number.isFinite(date.getTime())) {
            throw new Error(`Invalid date value: ${log.date}`);
        }

        // Insertion du log principal
        await db.insert(migrationLog).values({
            id: migrationLogId,
            datapackId: log.id,
            date: date,
            version: log.version,
            isModded: log.isModded,
            isMinified: log.isMinified,
            name: log.datapack.name,
            description: log.datapack.description,
            logs: log.logs
        });

        const namespaceValues = log.datapack.namespaces.map((namespace) => ({
            id: randomUUID(),
            migrationId: migrationLogId,
            namespace
        }));

        await db.insert(migrationNamespace).values(namespaceValues);

        return log.id;
    } catch (error) {
        console.error("Detailed error in saveMigrationLog:", {
            error,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            originalDate: log.date
        });

        // En cas d'erreur, on essaie de nettoyer les données partiellement insérées
        try {
            await db.delete(migrationNamespace).where(eq(migrationNamespace.migrationId, migrationLogId));
            await db.delete(migrationLog).where(eq(migrationLog.id, migrationLogId));
        } catch (cleanupError) {
            console.error("Failed to cleanup after error:", cleanupError);
        }

        throw new Error(`Failed to save migration log: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
