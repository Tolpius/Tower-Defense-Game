import { Game } from "../../scenes/Game";
import { TOWER_CONFIGS, TowerType } from "../../../config/towerConfig";
import { TowerFactory } from "../../factories/towerFactory";
const configs = TOWER_CONFIGS;
let config = configs[TowerType.Slingshot];

export function handleTowerBuild(scene: Game, pointer: Phaser.Input.Pointer) {
    const tile = scene.layerBuildable?.getTileAtWorldXY(
        pointer.worldX,
        pointer.worldY,
        false,
    );

    if (tile && tile.index !== 0) {
        const towerX = tile.getCenterX();
        const towerY = tile.getCenterY() - config.levels[0].offsetY!;
        const originalTileIndex = tile.index;

        const tower = TowerFactory.create(config.id, scene, towerX, towerY);
        tower.originalTileIndex = originalTileIndex;
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
            gameObjects: Phaser.GameObjects.GameObject[],
        ) => {
            // Right-click: always deselect and suppress context menu
            if (pointer.button === 2) {
                scene.selectedTower?.hideUi();
                scene.selectedTower = undefined;
                if (scene.buildRangeIndicator)
                    scene.buildRangeIndicator.setVisible(false);
                scene.buildMode = false;
                scene.buildingTowerSelected = null;
                scene.layerBuildable && scene.layerBuildable.setVisible(false);
                scene.buildPreview?.setVisible(false);
                return;
            }

            // Left-click (button 0) logic
            //1️⃣ Ignore clicks on GameObjects while not in Build Mode
            if (gameObjects.length > 0 && scene.buildMode === false) {
                return;
            }
            //2️⃣ Build Mode check - build selected Tower

            if (scene.buildMode) {
                handleTowerBuild(scene, pointer);
            }

            // 3️⃣ Click on nothing in particular or while in Build Mode - Deselect Tower
            scene.selectedTower?.hideUi();
            scene.selectedTower = undefined;
            if (scene.buildRangeIndicator)
                scene.buildRangeIndicator.setVisible(false);
        },
    );
}

export function setupTowerSelectedHandler(scene: Game) {
    scene.events.on("tower-selected", (towerId: TowerType) => {
        if (scene.buildingTowerSelected === towerId) {
            //Build Mode AUS
            scene.buildingTowerSelected = null;
            scene.layerBuildable && scene.layerBuildable.setVisible(false);
            scene.buildMode = false;
            scene.buildPreview?.setVisible(false);
            return;
        }
        //Deselect currently selected tower
        scene.selectedTower?.hideUi();
        scene.selectedTower = undefined;

        //BUILD MODE AN
        config = configs[towerId];
        scene.buildingTowerSelected = towerId;
        scene.layerBuildable?.setVisible(true);
        scene.buildingTowerSelectedCost = config.levels[0].cost;
        scene.buildMode = true;
        scene.buildPreview?.destroy();
        scene.buildPreview = scene.add
            .image(0, 0, `${config.spriteBase}base`)
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
            pointer.worldY,
        );

        if (!tile || tile.index === 0) {
            scene.buildPreview.setVisible(false);
            if (scene.buildRangeIndicator)
                scene.buildRangeIndicator.setVisible(false);
            return;
        }

        scene.buildPreview.setVisible(true);
        const previewY = tile.getCenterY() - config.levels[0].offsetY!;
        scene.buildPreview.setPosition(tile.getCenterX(), previewY);
        const baseY = previewY + (config.levels[0].offsetY ?? 32);
        scene.buildPreview.setDepth(Math.floor(baseY) + 100);

        // Range-Kreis anzeigen
        if (!scene.buildRangeIndicator) {
            scene.buildRangeIndicator = scene.add.graphics();
            scene.buildRangeIndicator.setDepth(9999);
        }
        scene.buildRangeIndicator.clear();
        scene.buildRangeIndicator.fillStyle(0x00ff00, 0.25);
        // Default-Range wie im Tower
        let range = config.levels[0].range;
        if (
            scene.layerHighground &&
            scene.layerHighground.getTileAtWorldXY(
                tile.getCenterX(),
                tile.getCenterY() - 32,
                false,
            ) !== null
        ) {
            range = range * config.levels[0].highgroundRangeMultiplier;
        }
        scene.buildRangeIndicator.fillCircle(
            tile.getCenterX(),
            tile.getCenterY(),
            range,
        );
        scene.buildRangeIndicator.setVisible(true);
    });
}
