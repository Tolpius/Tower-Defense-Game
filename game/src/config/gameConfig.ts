export interface GameConfig {
    // Startwerte
    startingMoney: number;
    startingHealth: number;

    // Gegner-Spawn
    enemiesToSpawn: number;
    enemySpawnDelay: number; // ms zwischen Spawns

    // Build/Placement
    buildPreviewAlpha: number;
    highgroundRangeMultiplier: number;
}

export const GAME_CONFIG: GameConfig = {
    startingMoney: 200,
    startingHealth: 100,

    enemiesToSpawn: 10,
    enemySpawnDelay: 1000, // ms zwischen Spawns

    buildPreviewAlpha: 0.5,
    highgroundRangeMultiplier: 1.5,
};

