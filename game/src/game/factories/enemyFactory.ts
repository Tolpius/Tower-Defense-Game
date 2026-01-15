import { Enemy } from "../entities/enemy";
import { Leafbug } from "../entities/enemies/leafbug";
import { Scorpion } from "../entities/enemies/scorpion";

export class EnemyFactory {
    static create(
        scene: Phaser.Scene,
        path: Phaser.Curves.Path,
        enemyType: string
    ): Enemy {
        switch (enemyType.toLowerCase()) {
            case "leafbug":
                return new Leafbug(scene, path);
            case "scorpion":
                return new Scorpion(scene, path);
            default:
                console.warn(`Unknown enemy type: ${enemyType}, using Leafbug as fallback`);
                return new Leafbug(scene, path);
        }
    }
}