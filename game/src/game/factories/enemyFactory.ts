import { Enemy } from "../entities/enemy";
import { Leafbug } from "../entities/enemies/leafbug";
import { Scorpion } from "../entities/enemies/scorpion";
import { EnemyType } from "../../config/enemyConfig";
import { Firebug } from "../entities/enemies/firebug";
import { Magmacrab } from "../entities/enemies/magmacrab";
import { Clampbeetle } from "../entities/enemies/clampbeetle";
import { Flyinglocust } from "../entities/enemies/flyinglocust";
import { Voidbutterfly } from "../entities/enemies/voidbutterfly";
import { Firewasp } from "../entities/enemies/firewasp";

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
            case "firebug":
                return new Firebug(scene, path);
            case "magmacrab":
                return new Magmacrab(scene, path);
            case "clampbeetle":
                return new Clampbeetle(scene, path);
            case "flyinglocust":
                return new Flyinglocust(scene, path);
            case "voidbutterfly":
                return new Voidbutterfly(scene, path);
            case "firewasp":
                return new Firewasp(scene, path);
            default:
                console.warn(
                    `Unknown enemy type: ${type}, using Leafbug as fallback`
                );
                return new Leafbug(scene, path);
        }
    }
}

