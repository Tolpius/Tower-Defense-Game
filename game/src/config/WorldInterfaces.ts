import { EnemyType } from "./enemyConfig";

export interface WaveEnemySpawnData {
    enemyType: EnemyType;
    delay: number;
}

export interface WaveData {
    id: number;
    spawns: WaveEnemySpawnData[];
    reward?: number;
}

export interface MapData {
    id: number;
    name: string;
    startingMoney: number;
    startingHealth: number;
    waves: WaveData[];
}

export interface WorldData {
    id: number;
    name: string;
    maps: MapData[];
}

export interface WorldsData {
    worlds: WorldData[];
}
