export interface LeaderboardEntry {
    id: number;
    username: string;
    world_id: number;
    map_id: number;
    is_infinite: boolean;
    wave: number;
    kills: number;
    score: number;
    created_at: string;
}

export interface SubmitScoreData {
    username: string;
    world_id: number;
    map_id: number;
    is_infinite: boolean;
    wave: number;
    kills: number;
    score: number;
}

// API base URL - will be set via environment variable
const API_BASE_URL = import.meta.env.VITE_LEADERBOARD_API_URL || "/api";

class LeaderboardServiceClass {
    /**
     * Get top scores with optional filters
     */
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
                params.append("world_id", worldId.toString());
            }
            if (mapId !== undefined) {
                params.append("map_id", mapId.toString());
            }
            if (isInfinite !== undefined) {
                params.append("is_infinite", isInfinite.toString());
            }
            params.append("limit", limit.toString());

            const response = await fetch(
                `${API_BASE_URL}/scores?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
            return [];
        }
    }

    /**
     * Get scores for a specific user
     */
    async getUserScores(username: string): Promise<LeaderboardEntry[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/scores/user/${encodeURIComponent(username)}`,
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch user scores:", error);
            return [];
        }
    }

    /**
     * Submit a new score
     */
    async submitScore(data: SubmitScoreData): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/scores`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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

    /**
     * Calculate score from wave and kills
     */
    calculateScore(wave: number, kills: number): number {
        // Score formula: wave * 1000 + kills * 10
        return wave * 1000 + kills * 10;
    }
}

// Singleton export
export const LeaderboardService = new LeaderboardServiceClass();

