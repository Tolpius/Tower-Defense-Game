import { Enemy } from "../entities/enemy";
import { Leafbug } from "../entities/enemies/leafbug";
import { Scorpion } from "../entities/enemies/scorpion";
import { EnemyType } from "../../config/enemyConfig";

export class EnemyFactory {
    static create(
        scene: Phaser.Scene,
        path: Phaser.Curves.Path,
        type: EnemyType
    ): Enemy {
        switch (type.toLowerCase()) {
            case "leafbug":
                return new Leafbug(scene, path);
            case "scorpion":
                return new Scorpion(scene, path);
            default:
                console.warn(`Unknown enemy type: ${type}, using Leafbug as fallback`);
                return new Leafbug(scene, path);
        }
    }
}