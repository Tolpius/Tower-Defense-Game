import { Tower } from "../entities/tower";
import { TowerType } from "../../config/towerConfig";
import { Game } from "../scenes/Game";
import { SlingShotTower } from "../entities/towers/slingshotTower";
import { CatapultTower } from "../entities/towers/catapultTower";

export class TowerFactory {
    static create(
        towerType: TowerType,
        scene: Game,
        x: number,
        y: number,
        isPreview = false
    ): Tower {
        switch (towerType.toLowerCase()) {
            case "slingshot":
                return new SlingShotTower(scene, x, y, isPreview);
            case "catapult":
                return new CatapultTower(scene, x, y, isPreview);
            default:
                console.warn(
                    `Unknown tower type: ${towerType}, using SlingShotTower as fallback`,
                );
                return new SlingShotTower(scene, x, y, isPreview);
        }
    }
}

