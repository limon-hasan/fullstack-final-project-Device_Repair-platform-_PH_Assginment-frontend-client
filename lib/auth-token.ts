"use client"

import { authClient } from "@/lib/auth-client"

export async function getAuthHeaders(
    extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
    const sessionResult = await authClient.getSession()
    const token = sessionResult?.data?.session?.token

    return {
        ...extraHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}