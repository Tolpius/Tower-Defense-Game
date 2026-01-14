import { Game } from "../scenes/Game";
import { Tower } from "../entities/tower";
import { TOWER_CONFIGS, TowerType } from "../../config/TowerConfig";
export default function handleTowerBuild(
    scene: Game,
    pointer: Phaser.Input.Pointer
) {
    const config = TOWER_CONFIGS[TowerType.Arrow];
    const tile = scene.layerBuildable?.getTileAtWorldXY(
        pointer.worldX,
        pointer.worldY,
        false
    );

    if (tile && tile.index !== 0) {
        const towerX = tile.getCenterX();
        const towerY = tile.getCenterY() - 32;

        const tower = new Tower(scene, towerX, towerY, config);
        scene.towers.add(tower);
        scene.layerBuildable?.removeTileAt(tile.x, tile.y);

        scene.money = scene.money - (scene.buildingTowerSelectedCost || 50);

        // Build Mode beenden
        scene.buildMode = false;
        scene.buildingTowerSelected = null;
        scene.buildingTowerSelectedCost = null;
        scene.layerBuildable?.setVisible(false);
        scene.buildPreview?.destroy();
        scene.buildPreview = null;
    }
}

