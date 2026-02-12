export type AuthUser = {
    id: string;
    googleSub: string;
    email: string;
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
