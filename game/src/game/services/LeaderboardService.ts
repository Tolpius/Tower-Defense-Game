import { authStorage } from "../../auth";
import { isCheater } from "../scripts/cheats/CheaterState";

export interface LeaderboardEntry {
    id: string;
    nickname: string;
    worldId: number;
    mapId: number;
    isInfinite: boolean;
    wave: number;
    kills: number;
    score: number;
    createdAt: string;
}

export interface SubmitScoreData {
    worldId: number;
    mapId: number;
    isInfinite: boolean;
    wave: number;
    kills: number;
    score?: number;
}

const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL ?? window.location.origin;

class LeaderboardServiceClass {
    async getLeaderboard(
        options: {
            worldId?: number;
            mapId?: number;
            isInfinite?: boolean;
            limit?: number;
        } = {},
    ): Promise<LeaderboardEntry[]> {
        try {
            const { worldId, mapId, isInfinite, limit = 20 } = options;
            const params = new URLSearchParams();
            if (worldId !== undefined) {
                params.append("worldId", worldId.toString());
            }
            if (mapId !== undefined) {
                params.append("mapId", mapId.toString());
            }
            if (isInfinite !== undefined) {
                params.append("isInfinite", isInfinite.toString());
            }
            params.append("limit", limit.toString());

            const response = await fetch(
                `${API_BASE_URL}/leaderboard?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const payload = (await response.json()) as { entries?: LeaderboardEntry[] };
            return payload.entries ?? [];
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
            return [];
        }
    }

    async submitScore(data: SubmitScoreData): Promise<boolean> {
        const token = authStorage.get();
        if (!token || isCheater()) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/leaderboard`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error("Failed to submit score:", error);
            return false;
        }
    }

    calculateScore(wave: number, kills: number): number {
        return wave * 1000 + kills * 10;
    }
}

export const LeaderboardService = new LeaderboardServiceClass();
