import { EnemyType } from "./enemyConfig";

/**
 * Konfiguration für den Infinite Wave Modus
 * Alle Skalierungswerte können hier angepasst werden
 */

export interface EnemyTierEntry {
    type: EnemyType;
    /** Basis-Gewichtung innerhalb des Tiers (optional, default = 1) */
    weight?: number;
}

export interface EnemyTier {
    /** Ab welcher Infinite-Wave wird dieser Tier freigeschaltet */
    minWave: number;
    /** Gegner in diesem Tier */
    enemies: EnemyTierEntry[];
    /** Basis-Gewichtung für den gesamten Tier */
    baseWeight: number;
}

export interface InfiniteWaveConfig {
    /** Ab welcher Wave startet der Infinite-Modus (nach den vordefinierten Waves) */
    startAfterWave: number;

    scaling: {
        /** HP-Multiplikator pro Wave: 1.0 + (waveNumber * hpPerWave) */
        hpPerWave: number;
        /** Maximaler HP-Multiplikator */
        hpMax: number;

        /** Speed-Multiplikator pro Wave (höher = schneller) */
        speedPerWave: number;
        /** Maximaler Speed-Multiplikator */
        speedMax: number;

        /** Basis-Anzahl Gegner pro Wave */
        baseEnemyCount: number;
        /** Zusätzliche Gegner pro Wave */
        enemiesPerWave: number;
        /** Maximum Gegner pro Wave */
        enemiesMax: number;

        /** Basis-Delay zwischen Spawns in ms */
        baseSpawnDelay: number;
        /** Delay-Reduktion pro Wave in ms */
        delayReductionPerWave: number;
        /** Minimales Spawn-Delay in ms */
        delayMin: number;
    };

    /** Gegner-Tiers mit Ramp-Up und Decay */
    enemyTiers: EnemyTier[];

    tierWeighting: {
        /** Über wie viele Waves wird ein neuer Tier auf volles Gewicht gebracht */
        rampUpWaves: number;
        /** Start-Gewicht für neue Tiers (0.0 - 1.0) */
        startWeight: number;

        /** Gewichts-Reduktion pro neuem freigeschalteten Tier (0.0 - 1.0) */
        decayPerTier: number;
        /** Minimales Gewicht für alte Tiers (0.0 - 1.0) */
        minWeight: number;
    };

    bossWaves: {
        /** Alle X Waves kommt eine Boss-Wave */
        interval: number;
        /** HP-Multiplikator für Bosse */
        bossHpMultiplier: number;
        /** Speed-Multiplikator für Bosse (< 1 = langsamer) */
        bossSpeedMultiplier: number;
        /** Größen-Multiplikator für Bosse */
        bossScaleMultiplier: number;
        /** Bevorzugte Boss-Typen (werden zufällig aus dieser Liste gewählt) */
        preferredBossTypes: EnemyType[];
    };

    rewards: {
        /** Basis-Gold-Belohnung pro Infinite Wave */
        baseGold: number;
        /** Zusätzliches Gold pro Wave */
        goldPerWave: number;
        /** Gold-Multiplikator für Boss-Waves */
        bossGoldMultiplier: number;
    };
}

export const INFINITE_WAVE_CONFIG: InfiniteWaveConfig = {
    // Infinite-Modus startet nach der letzten vordefinierten Wave
    startAfterWave: 0, // Wird dynamisch gesetzt basierend auf Map-Waves

    scaling: {
        hpPerWave: 0.08, // +8% HP pro Wave
        hpMax: 5.0, // Maximal 5x HP

        speedPerWave: 0.03, // +3% schneller pro Wave
        speedMax: 2.0, // Maximal 2x so schnell

        baseEnemyCount: 8, // Start mit 8 Gegnern
        enemiesPerWave: 2, // +2 Gegner pro Wave
        enemiesMax: 50, // Maximum 50 Gegner

        baseSpawnDelay: 1200, // 1.2s zwischen Spawns
        delayReductionPerWave: 30, // -30ms pro Wave
        delayMin: 400, // Minimum 400ms
    },

    enemyTiers: [
        {
            minWave: 1,
            baseWeight: 10,
            enemies: [
                { type: EnemyType.Leafbug, weight: 5 },
                { type: EnemyType.Scorpion, weight: 3 },
            ],
        },
        {
            minWave: 5,
            baseWeight: 10,
            enemies: [
                { type: EnemyType.Firebug, weight: 3 },
                { type: EnemyType.Clampbeetle, weight: 2 },
            ],
        },
        {
            minWave: 10,
            baseWeight: 10,
            enemies: [
                { type: EnemyType.Flyinglocust, weight: 2 },
                { type: EnemyType.Voidbutterfly, weight: 2 },
            ],
        },
        {
            minWave: 15,
            baseWeight: 10,
            enemies: [
                { type: EnemyType.Magmacrab, weight: 1 },
                { type: EnemyType.Firewasp, weight: 1 },
            ],
        },
    ],

    tierWeighting: {
        rampUpWaves: 5, // Über 5 Waves auf volles Gewicht
        startWeight: 0.2, // Startet bei 20%

        decayPerTier: 0.4, // -40% pro neuem Tier
        minWeight: 0.1, // Nie unter 10%
    },

    bossWaves: {
        interval: 5, // Alle 5 Waves
        bossHpMultiplier: 3.0, // 3x HP
        bossSpeedMultiplier: 0.7, // 30% langsamer
        bossScaleMultiplier: 1.5, // 50% größer
        preferredBossTypes: [
            EnemyType.Magmacrab,
            EnemyType.Scorpion,
            EnemyType.Firebug,
        ],
    },

    rewards: {
        baseGold: 50, // 50 Gold Basis
        goldPerWave: 10, // +10 Gold pro Wave
        bossGoldMultiplier: 2.0, // Doppelt für Boss-Waves
    },
};

