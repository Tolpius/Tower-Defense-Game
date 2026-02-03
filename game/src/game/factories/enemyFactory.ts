import { Enemy } from "../entities/enemy";
import { Leafbug } from "../entities/enemies/leafbug";
import { Scorpion } from "../entities/enemies/scorpion";
import { EnemyModifiers, EnemyType } from "../../config/enemyConfig";
import { Firebug } from "../entities/enemies/firebug";
import { Magmacrab } from "../entities/enemies/magmacrab";
import { Clampbeetle } from "../entities/enemies/clampbeetle";
import { Flyinglocust } from "../entities/enemies/flyinglocust";
import { Voidbutterfly } from "../entities/enemies/voidbutterfly";
import { Firewasp } from "../entities/enemies/firewasp";
import { PathArrow } from "../entities/enemies/pathArrow";

export class EnemyFactory {
    static create(
        scene: Phaser.Scene,
        path: Phaser.Curves.Path,
        type: EnemyType,
        modifiers?: EnemyModifiers,
    ): Enemy {
        let enemy: Enemy;

        switch (type.toLowerCase()) {
            case "leafbug":
                enemy = new Leafbug(scene, path);
                break;
            case "scorpion":
                enemy = new Scorpion(scene, path);
                break;
            case "firebug":
                enemy = new Firebug(scene, path);
                break;
            case "magmacrab":
                enemy = new Magmacrab(scene, path);
                break;
            case "clampbeetle":
                enemy = new Clampbeetle(scene, path);
                break;
            case "flyinglocust":
                enemy = new Flyinglocust(scene, path);
                break;
            case "voidbutterfly":
                enemy = new Voidbutterfly(scene, path);
                break;
            case "firewasp":
                enemy = new Firewasp(scene, path);
                break;
            case "patharrow":
                enemy = new PathArrow(scene, path);
                break;
            default:
                console.warn(
                    `Unknown enemy type: ${type}, using Leafbug as fallback`,
                );
                enemy = new Leafbug(scene, path);
        }

        // Modifiers anwenden (für Infinite Wave Modus)
        if (modifiers) {
            enemy.applyModifiers(modifiers);
        }

        return enemy;
    }
}

