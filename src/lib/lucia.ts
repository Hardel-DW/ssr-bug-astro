import { db } from "../database/db.ts";
import { sessionTable, userTable } from "../database/schema.ts";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Google } from "arctic";
import { Lucia } from "lucia";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);
export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: import.meta.env.PROD
        }
    },
    getUserAttributes: (attributes) => {
        return {
            firstName: attributes.firstName,
            lastName: attributes.lastName,
            email: attributes.email,
            googleId: attributes.googleId,
            picture: attributes.picture
        };
    }
});

const site = import.meta.env.SITE;
const redirect = `${site}auth/google/callback`;
const googleid = process.env.GOOGLE_CLIENT_ID ?? import.meta.env.GOOGLE_CLIENT_ID;
const googlesecret = process.env.GOOGLE_CLIENT_SECRET ?? import.meta.env.GOOGLE_CLIENT_SECRET;
export const google = new Google(googleid, googlesecret, redirect);

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            firstName: string;
            lastName: string;
            email: string;
            googleId: number;
            picture: string;
        };
    }
}

export const generateAuthUrl = (path: string) => {
    const url = new URL(`${site}auth/google`);
    url.searchParams.set("redirect", path);

    return url.toString();
};

export const generateLogoutUrl = (path: string) => {
    const url = new URL(`${site}api/logout`);
    url.searchParams.set("redirect", path);

    return url.toString();
};
