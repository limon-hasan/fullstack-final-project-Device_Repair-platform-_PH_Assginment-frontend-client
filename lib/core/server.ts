"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const getSession = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    return session
}

export const getToken = async () => {
    const session = await getSession()
    if (!session || !session.session?.token) {
        redirect("/unauthorized")
    }
    return session.session.token
}

export const authFetch = async (api: string, init?: RequestInit) => {
    const token = await getToken()
    const res = await fetch(api, {
        ...init,
        cache: "no-store",
        headers: {
            ...(init?.headers || {}),
            authorization: `Bearer ${token}`,
        },
    })

    if (res.status === 401 || res.status === 403) {
        redirect("/unauthorized")
    }

    return res
}

export const protectedMutation = async (
    api: string,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    data?: unknown
) => {
    const token = await getToken()
    const res = await fetch(api, {
        method,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
        body: data !== undefined ? JSON.stringify(data) : undefined,
    })

    if (res.status === 401 || res.status === 403) {
        redirect("/unauthorized")
    }

    return res
}

export const requireRole = async (role: string) => {
    const session = await getSession()
    const userRole = String(
        (session?.user as { role?: string } | undefined)?.role || ""
    ).toLowerCase()

    if (!session || userRole !== role.toLowerCase()) {
        redirect("/unauthorized")
    }

    return session
}