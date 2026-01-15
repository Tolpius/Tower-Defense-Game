import { WaveData } from "../config/WorldInterfaces";
import { EnemyType } from "../config/enemyConfig";

export const WAVE_1: WaveData = {
    id: 1,
    spawns: [
        { enemyType: EnemyType.Scorpion, delay: 0 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
        { enemyType: EnemyType.Scorpion, delay: 1500 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
        { enemyType: EnemyType.Scorpion, delay: 1500 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
        { enemyType: EnemyType.Leafbug, delay: 1000 },
    ],
};
