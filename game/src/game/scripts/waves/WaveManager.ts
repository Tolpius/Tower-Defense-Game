import { Game } from "../../scenes/Game";
import { WaveData, WaveEnemySpawnData } from "../../../config/WorldInterfaces";
import { EnemyFactory } from "../../factories/enemyFactory";
import {
    ENEMY_CONFIG,
    EnemyModifiers,
    EnemyType,
} from "../../../config/enemyConfig";
import { INFINITE_WAVE_CONFIG } from "../../../config/infiniteWaveConfig";

/** Erweitertes Spawn-Interface für Infinite Waves */
interface InfiniteSpawnData extends WaveEnemySpawnData {
    modifiers?: EnemyModifiers;
}

export class WaveManager {
    private scene: Game;
    private waves: WaveData[];
    private currentWaveIndex = 0;
    private enemiesSpawnedInWave = 0;
    private spawningFinished = false;
    private active = false;

    // Infinite Wave Modus
    private _infiniteMode = false;
    private infiniteWaveNumber = 0;

    constructor(scene: Game, waves: WaveData[]) {
        this.scene = scene;
        this.waves = waves;
    }

    /** Aktiviert den Infinite Wave Modus */
    enableInfiniteMode(): void {
        this._infiniteMode = true;
        this.infiniteWaveNumber = 0;
        console.log("🔄 Infinite Wave Modus aktiviert!");
    }

    get isInfiniteMode(): boolean {
        return this._infiniteMode;
    }

    startWave() {
        if (this.active) return;

        this.active = true;
        this.spawningFinished = false;
        this.enemiesSpawnedInWave = 0;

        // Im Infinite-Modus: Wave dynamisch generieren
        if (this._infiniteMode) {
            this.infiniteWaveNumber++;
            const wave = this.generateInfiniteWave(this.infiniteWaveNumber);
            this.spawnInfiniteWave(wave);
            return;
        }

        // Normaler Modus: Vordefinierte Wave
        const wave = this.waves[this.currentWaveIndex];
        if (!wave) {
            return;
        }

        let delay = 0;

        wave.spawns.forEach((spawn, index) => {
            if (index === 0 && wave.id === 1) {
                this.scene.time.delayedCall(spawn.delay, () => {
                    const enemy = EnemyFactory.create(
                        this.scene,
                        this.scene.path,
                        EnemyType.PathArrow,
                    );
                    enemy.start();
                    this.scene.enemies.add(enemy);
                });
                delay += ENEMY_CONFIG[EnemyType.PathArrow].duration;
                return;
            }
            delay += spawn.delay;

            this.scene.time.delayedCall(delay, () => {
                const enemy = EnemyFactory.create(
                    this.scene,
                    this.scene.path,
                    spawn.enemyType,
                );
                enemy.start();
                this.scene.enemies.add(enemy);
                this.enemiesSpawnedInWave++;
            });
        });

        // Spawning abgeschlossen
        this.scene.time.delayedCall(delay + 50, () => {
            this.active = false;
            this.spawningFinished = true;
        });
    }

    /** Spawnt eine Infinite Wave mit Modifiers */
    private spawnInfiniteWave(spawns: InfiniteSpawnData[]): void {
        let delay = 0;

        spawns.forEach((spawn) => {
            delay += spawn.delay;

            this.scene.time.delayedCall(delay, () => {
                const enemy = EnemyFactory.create(
                    this.scene,
                    this.scene.path,
                    spawn.enemyType,
                    spawn.modifiers,
                );
                enemy.start();
                this.scene.enemies.add(enemy);
                this.enemiesSpawnedInWave++;
            });
        });

        // Spawning abgeschlossen
        this.scene.time.delayedCall(delay + 50, () => {
            this.active = false;
            this.spawningFinished = true;
        });
    }

    /** Generiert eine dynamische Infinite Wave */
    private generateInfiniteWave(waveNumber: number): InfiniteSpawnData[] {
        const cfg = INFINITE_WAVE_CONFIG;
        const scaling = cfg.scaling;
        const spawns: InfiniteSpawnData[] = [];

        // Berechne Skalierung
        const hpMult = Math.min(
            1 + waveNumber * scaling.hpPerWave,
            scaling.hpMax,
        );
        const speedMult = Math.min(
            1 + waveNumber * scaling.speedPerWave,
            scaling.speedMax,
        );

        // Ist es eine Boss-Wave?
        const isBossWave = waveNumber % cfg.bossWaves.interval === 0;

        // Berechne Anzahl Gegner
        let enemyCount = Math.min(
            Math.floor(
                scaling.baseEnemyCount + waveNumber * scaling.enemiesPerWave,
            ),
            scaling.enemiesMax,
        );

        // Boss-Wave: Weniger Gegner, aber ein Boss
        if (isBossWave) {
            enemyCount = Math.max(3, Math.floor(enemyCount * 0.5));
        }

        // Berechne Spawn-Delay
        const spawnDelay = Math.max(
            scaling.baseSpawnDelay - waveNumber * scaling.delayReductionPerWave,
            scaling.delayMin,
        );

        // Sammle verfügbare Gegner mit Gewichtung
        const weightedEnemies = this.calculateWeightedEnemies(waveNumber);

        // Generiere Spawns
        for (let i = 0; i < enemyCount; i++) {
            const isBoss = isBossWave && i === 0; // Erster Gegner ist der Boss
            const enemyType = isBoss
                ? this.pickBossType(waveNumber)
                : this.pickWeightedEnemy(weightedEnemies);

            const modifiers: EnemyModifiers = {
                hpMultiplier: isBoss
                    ? hpMult * cfg.bossWaves.bossHpMultiplier
                    : hpMult,
                speedMultiplier: isBoss
                    ? speedMult * cfg.bossWaves.bossSpeedMultiplier
                    : speedMult,
                scaleMultiplier: isBoss ? cfg.bossWaves.bossScaleMultiplier : 1,
                goldMultiplier: isBoss ? cfg.bossWaves.bossHpMultiplier : 1, // Mehr Gold für Boss
            };

            spawns.push({
                enemyType,
                delay: i === 0 ? 0 : spawnDelay,
                modifiers,
            });
        }

        console.log(
            `🌊 Infinite Wave ${waveNumber}:`,
            `${enemyCount} Gegner,`,
            `HP: ${hpMult.toFixed(2)}x,`,
            `Speed: ${speedMult.toFixed(2)}x`,
            isBossWave ? "🔥 BOSS WAVE!" : "",
        );

        return spawns;
    }

    /** Berechnet die Gewichtung aller Gegner basierend auf der aktuellen Wave */
    private calculateWeightedEnemies(
        waveNumber: number,
    ): { type: EnemyType; weight: number }[] {
        const cfg = INFINITE_WAVE_CONFIG;
        const tiers = cfg.enemyTiers;
        const weighting = cfg.tierWeighting;
        const result: { type: EnemyType; weight: number }[] = [];

        tiers.forEach((tier, tierIndex) => {
            const wavesSinceUnlock = waveNumber - tier.minWave;

            // Tier noch nicht freigeschaltet
            if (wavesSinceUnlock < 0) return;

            // Ramp-Up: Neue Gegner starten schwach
            const rampUpProgress = Math.min(
                1,
                wavesSinceUnlock / weighting.rampUpWaves,
            );
            const rampUpFactor =
                weighting.startWeight +
                (1 - weighting.startWeight) * rampUpProgress;

            // Decay: Alte Gegner werden seltener
            const newerUnlockedTiers = tiers.filter(
                (t, i) => i > tierIndex && waveNumber >= t.minWave,
            ).length;
            const decayFactor = Math.max(
                weighting.minWeight,
                1 - newerUnlockedTiers * weighting.decayPerTier,
            );

            // Tier-Gewicht berechnen
            const tierWeight = tier.baseWeight * rampUpFactor * decayFactor;

            // Gegner aus dem Tier hinzufügen
            tier.enemies.forEach((enemy) => {
                const enemyWeight = (enemy.weight ?? 1) * tierWeight;
                result.push({
                    type: enemy.type,
                    weight: enemyWeight,
                });
            });
        });

        return result;
    }

    /** Wählt einen zufälligen Gegner basierend auf Gewichtung */
    private pickWeightedEnemy(
        enemies: { type: EnemyType; weight: number }[],
    ): EnemyType {
        const totalWeight = enemies.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;

        for (const enemy of enemies) {
            random -= enemy.weight;
            if (random <= 0) return enemy.type;
        }

        return enemies[0]?.type ?? EnemyType.Leafbug;
    }

    /** Wählt einen Boss-Typ aus der bevorzugten Liste */
    private pickBossType(waveNumber: number): EnemyType {
        const cfg = INFINITE_WAVE_CONFIG;
        const preferred = cfg.bossWaves.preferredBossTypes;

        // Filtere nach freigeschalteten Typen
        const available = preferred.filter((type) => {
            const tier = cfg.enemyTiers.find((t) =>
                t.enemies.some((e) => e.type === type),
            );
            return tier && waveNumber >= tier.minWave;
        });

        if (available.length === 0) {
            // Fallback: Zufälligen freigeschalteten Gegner wählen
            const weightedEnemies = this.calculateWeightedEnemies(waveNumber);
            return this.pickWeightedEnemy(weightedEnemies);
        }

        return available[Math.floor(Math.random() * available.length)];
    }

    /** Wird von Game.update() genutzt */
    isCurrentWaveFinished(): boolean {
        if (!this.spawningFinished) return false;

        const aliveEnemies = (this.scene.enemies.getChildren() as any[]).filter(
            (e) => e.isAlive,
        ).length;

        return aliveEnemies === 0;
    }

    hasMoreWaves(): boolean {
        // Infinite Mode hat immer mehr Waves
        if (this._infiniteMode) return true;
        return this.currentWaveIndex < this.waves.length - 1;
    }

    advanceWave() {
        if (!this._infiniteMode) {
            this.currentWaveIndex++;
        }
        this.spawningFinished = false;
    }

    get currentWave() {
        if (this._infiniteMode) {
            return this.infiniteWaveNumber;
        }
        return this.currentWaveIndex + 1;
    }

    get maxWaves(): number {
        // Im Infinite Mode: Zeige "∞" im UI
        return this._infiniteMode ? Infinity : this.waves.length;
    }

    /** Anzahl der vordefinierten Waves */
    get predefinedWaveCount(): number {
        return this.waves.length;
    }

    /** Aktuelle Infinite Wave Nummer (0 wenn nicht im Infinite Mode) */
    get currentInfiniteWave(): number {
        return this.infiniteWaveNumber;
    }
}

