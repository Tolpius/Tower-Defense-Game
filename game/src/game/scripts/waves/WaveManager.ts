import { Game } from "../../scenes/Game";
import { WaveData } from "../../../config/WorldInterfaces";
import { EnemyFactory } from "../../factories/enemyFactory";

export class WaveManager {
    private scene: Game;
    private waves: WaveData[];
    private currentWaveIndex = 0;
    private enemiesSpawnedInWave = 0;
    private spawningFinished = false;
    private active = false;

    constructor(scene: Game, waves: WaveData[]) {
        this.scene = scene;
        this.waves = waves;
    }

    startWave() {
        if (this.active) return;

        const wave = this.waves[this.currentWaveIndex];
        if (!wave) {
            console.log("All waves finished");
            return;
        }

        this.active = true;
        this.spawningFinished = false;
        this.enemiesSpawnedInWave = 0;

        let delay = 0;

        wave.spawns.forEach((spawn) => {
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

    /** Wird von Game.update() genutzt */
    isCurrentWaveFinished(): boolean {
        if (!this.spawningFinished) return false;

        const aliveEnemies = (this.scene.enemies.getChildren() as any[]).filter(
            (e) => e.isAlive,
        ).length;

        return aliveEnemies === 0;
    }

    hasMoreWaves(): boolean {
        return this.currentWaveIndex < this.waves.length - 1;
    }

    advanceWave() {
        this.currentWaveIndex++;
        this.spawningFinished = false;
    }

    get currentWave() {
        return this.currentWaveIndex + 1;
    }

    get maxWaves(): number {
        return this.waves.length + 1;
    }
}

