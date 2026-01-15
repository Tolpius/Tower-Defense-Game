export interface WaveEnemySpawn {
    enemyType: string;
    delay: number; // Verzögerung in ms bis zum nächsten Spawn
}

export const WAVE_1: WaveEnemySpawn[] = [
    { enemyType: "scorpion", delay: 0 },
    { enemyType: "leafbug", delay: 1000 },
    { enemyType: "leafbug", delay: 1000 },
    { enemyType: "leafbug", delay: 1000 },
    { enemyType: "scorpion", delay: 1500 },
    { enemyType: "leafbug", delay: 1000 },
    { enemyType: "leafbug", delay: 1000 },
    { enemyType: "scorpion", delay: 1500 },
    { enemyType: "leafbug", delay: 1000 },
    { enemyType: "scorpion", delay: 1000 },
];