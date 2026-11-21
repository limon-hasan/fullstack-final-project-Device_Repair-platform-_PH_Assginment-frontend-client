import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const uri = process.env.BETTER_AUTH_DB_URI as string;

if (!uri) {
    throw new Error("Missing BETTER_AUTH_DB_URI in .env.local");
}

const globalForMongo = globalThis as unknown as {
    fixmateMongoClient?: MongoClient;
};

const client = globalForMongo.fixmateMongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
    globalForMongo.fixmateMongoClient = client;
}

const db = client.db("fixmatedb");

const trustedOrigins = Array.from(
    new Set(
        [
            "http://localhost:3000",
            process.env.BETTER_AUTH_URL,
            process.env.NEXT_PUBLIC_APP_URL,
            ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
                ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
                    .map((origin) => origin.trim())
                    .filter(Boolean)
                : []),
        ].filter((origin): origin is string => Boolean(origin))
    )
);

const hasGoogleCredentials = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins,
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
    },
    ...(hasGoogleCredentials
        ? {
            socialProviders: {
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID as string,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                },
            },
        }
        : {}),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "customer",
                input: true,
            },
            phone: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            area: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            bio: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const rawRole =
                        typeof user.role === "string"
                            ? user.role.toLowerCase().trim()
                            : "customer";
                    // Strictly block 'admin' or any invalid role during self sign-up
                    const safeRole =
                        rawRole === "technician" ? "technician" : "customer";

                    return {
                        data: {
                            ...user,
                            role: safeRole,
                            phone: typeof user.phone === "string" ? user.phone : "",
                            area: typeof user.area === "string" ? user.area : "",
                            bio: typeof user.bio === "string" ? user.bio : "",
                        },
                    };
                },
            },
        },
    },
});