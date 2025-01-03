import { defineMiddleware } from "astro:middleware";
import type { AstroCookieSetOptions } from "astro";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./lib/lucia";

/**
 * These pages are pre-rendered and cause warnings when the middleware is applied to them.
 */
export const onRequest = defineMiddleware(async (context, next) => {
    if (context.isPrerendered) {
        return next();
    }

    // Autoriser les webhooks Stripe
    if (context.url.pathname.startsWith("/api/payment")) {
        return next();
    }

    if (context.request.method !== "GET") {
        const originHeader = context.request.headers.get("Origin");
        const hostHeader = context.request.headers.get("Host");
        if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
            return new Response(null, {
                status: 403
            });
        }
    }

    const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        context.locals.user = null;
        context.locals.session = null;
        return next();
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes as AstroCookieSetOptions);
    }

    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes as AstroCookieSetOptions);
    }

    context.locals.session = session;
    context.locals.user = user;
    return next();
});
