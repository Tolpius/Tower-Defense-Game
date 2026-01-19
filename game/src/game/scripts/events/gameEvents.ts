import { Game } from "../../scenes/Game";
import { Tower } from "../../entities/tower";
import { TOWER_CONFIGS, TowerType } from "../../../config/towerConfig";
const config = TOWER_CONFIGS[TowerType.Arrow];

export function handleTowerBuild(scene: Game, pointer: Phaser.Input.Pointer) {
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

        scene.money = scene.money - (scene.buildingTowerSelectedCost || 30);

        // Build Mode beenden
        scene.buildingTowerSelected = null;
        scene.buildMode = false;
        scene.layerBuildable?.setVisible(false);
        scene.buildPreview?.destroy();
    }
}

export function setupPointerDownHandler(scene: Game) {
    scene.input.on(
        "pointerdown",
        (
            pointer: Phaser.Input.Pointer,
            gameObjects: Phaser.GameObjects.GameObject[]
        ) => {
            //1️⃣ Ignore clicks on GameObjects while not in Build Mode
            if (gameObjects.length > 0 && scene.buildMode === false) {
                return;
            }
            //2️⃣ Build Mode check - build selected Tower

            if (scene.buildMode) {
                handleTowerBuild(scene, pointer);
            }

            // 3️⃣ Click on nothing in particular or while in Build Mode - Deselect Tower
            scene.selectedTower?.hideRange();
            scene.selectedTower = undefined;
            if (scene.buildRangeIndicator)
                scene.buildRangeIndicator.setVisible(false);
        }
    );
}

export function setupTowerSelectedHandler(scene: Game) {
    scene.events.on("tower-selected", (towerId: string, cost: number) => {
        if (scene.buildingTowerSelected === towerId) {
            //Build Mode AUS
            scene.buildingTowerSelected = null;
            scene.layerBuildable && scene.layerBuildable.setVisible(false);
            scene.buildMode = false;
            scene.buildPreview?.setVisible(false);
            return;
        }
        //Deselect currently selected tower
        scene.selectedTower?.hideRange();
        scene.selectedTower = undefined;

        //BUILD MODE AN
        scene.buildingTowerSelected = towerId;
        scene.layerBuildable?.setVisible(true);
        scene.buildingTowerSelectedCost = cost;
        scene.buildMode = true;
        scene.buildPreview?.destroy();
        scene.buildPreview = scene.add
            .image(0, 0, towerId)
            .setAlpha(0.5)
            .setDepth(2);
    });
}

export function setupPointerMoveHandler(scene: any) {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (!scene.buildMode || !scene.layerBuildable || !scene.buildPreview)
            return;

        const tile = scene.layerBuildable.getTileAtWorldXY(
            pointer.worldX,
            pointer.worldY
        );

        if (!tile || tile.index === 0) {
            scene.buildPreview.setVisible(false);
            if (scene.buildRangeIndicator)
                scene.buildRangeIndicator.setVisible(false);
            return;
        }

        scene.buildPreview.setVisible(true);
        const previewY = tile.getCenterY() - 32;
        scene.buildPreview.setPosition(tile.getCenterX(), previewY);
        scene.buildPreview.setDepth(Math.floor(previewY));

        // Range-Kreis anzeigen
        if (!scene.buildRangeIndicator) {
            scene.buildRangeIndicator = scene.add.graphics();
            scene.buildRangeIndicator.setDepth(10);
        }
        scene.buildRangeIndicator.clear();
        scene.buildRangeIndicator.fillStyle(0x00ff00, 0.25);
        // Default-Range wie im Tower
        let range = config.range;
        if (
            scene.layerHighground &&
            scene.layerHighground.getTileAtWorldXY(
                tile.getCenterX(),
                tile.getCenterY() - 32,
                false
            ) !== null
        ) {
            range = range * 1.5;
        }
        scene.buildRangeIndicator.fillCircle(
            tile.getCenterX(),
            tile.getCenterY() - 32,
            range
        );
        scene.buildRangeIndicator.setVisible(true);
    });
}

