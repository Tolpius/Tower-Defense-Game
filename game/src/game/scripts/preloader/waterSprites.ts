import { Game } from "../../scenes/Game";

export function loadWaterSprites(scene: Game) {
    const waterConfig = scene.cache.json.get("waterSpritesConfig");
    const anims = scene.anims;

    anims.create({
        key: "water-allTogether",
        frames: waterConfig.allTogether.map((frame: number) => ({
            key: "water",
            frame: frame,
        })),
        frameRate: 10,
        repeat: -1,
    });

    const animatedTiles: Phaser.GameObjects.Sprite[] = [];

    scene.waterLayer.forEachTile((tile) => {
        if (tile.index === 470) {
            const worldX = tile.getCenterX();
            const worldY = tile.getCenterY();

            // Tile entfernen
            tile.index = -1;

            const sprite = scene.add.sprite(worldX, worldY, "water");
            sprite.setOrigin(0.5);
            sprite.setDepth(scene.waterLayer.depth ?? 20);

            // Start animation at random frame
            const randomFrame = Phaser.Math.Between(
                0,
                waterConfig.allTogether.length - 1,
            );
            sprite.play({
                key: "water-allTogether",
                startFrame: randomFrame,
            });

            animatedTiles.push(sprite);
        }
    });
}

