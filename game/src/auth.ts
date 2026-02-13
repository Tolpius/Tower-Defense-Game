export type AuthUser = {
    id: string;
    googleSub: string;
    email: string;
    nickname: string;
    name?: string;
    picture?: string;
};

export type AuthResponse = {
    access_token: string;
    user: AuthUser;
};

export type MeResponse = {
    user: AuthUser | null;
};

export type UpdateNicknameResponse = {
    user: AuthUser;
};

export type InfiniteModesSyncResponse = {
    completedMaps: string[];
};

export class AuthApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

const AUTH_TOKEN_KEY = "auth_token";

export const authStorage = {
    get(): string | null {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },
    set(token: string) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    },
    clear() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },
};

export async function fetchMe(authApiUrl: string, token: string): Promise<MeResponse> {
    const res = await fetch(`${authApiUrl}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Unauthorized");
    }

    return (await res.json()) as MeResponse;
}

export async function updateNickname(
    authApiUrl: string,
    token: string,
    nickname: string,
): Promise<UpdateNicknameResponse> {
    const res = await fetch(`${authApiUrl}/auth/nickname`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
    });

    const payload = (await res.json().catch(() => null)) as
        | { message?: string | string[] }
        | { user?: AuthUser }
        | null;

    if (!res.ok) {
        const rawMessage = Array.isArray(payload?.message)
            ? payload?.message[0]
            : payload?.message;
        throw new AuthApiError(
            res.status,
            typeof rawMessage === "string" ? rawMessage : "Request failed",
        );
    }

    if (!payload || typeof payload !== "object" || !("user" in payload) || !payload.user) {
        throw new AuthApiError(res.status, "Invalid response from server");
    }

    return { user: payload.user };
}

export async function syncInfiniteModes(
    authApiUrl: string,
    token: string,
    completedMaps: string[],
): Promise<InfiniteModesSyncResponse> {
    const res = await fetch(`${authApiUrl}/auth/infinite-modes/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedMaps }),
    });

    const payload = (await res.json().catch(() => null)) as
        | { message?: string | string[] }
        | { completedMaps?: string[] }
        | null;

    if (!res.ok) {
        const rawMessage = Array.isArray(payload?.message)
            ? payload?.message[0]
            : payload?.message;
        throw new AuthApiError(
            res.status,
            typeof rawMessage === "string" ? rawMessage : "Request failed",
        );
    }

    if (
        !payload ||
        typeof payload !== "object" ||
        !("completedMaps" in payload) ||
        !Array.isArray(payload.completedMaps)
    ) {
        throw new AuthApiError(res.status, "Invalid response from server");
    }

    return { completedMaps: payload.completedMaps };
}
