import { Preloader } from "../../scenes/Preloader";

export default function loadWorldAssets(preloader: Preloader) {
    //WORLD GENERATION
    preloader.load.image("logo", "logo_path-of-bugs.png");
    preloader.load.image("background", "/assets/background.png");
    preloader.load.image("enemy", "star.png");
    preloader.load.image("td-map-lvl1", "/map/TD-map-lvl1.png");
    preloader.load.image("map-preview-1", "/map/TD-map-lvl1.png");
    preloader.load.image("map-preview-2", "/map/TD-map-lvl2.png");
    preloader.load.image("map-preview-3", "/map/TD-map-lvl3.png");
    preloader.load.image("map-preview-4", "/map/TD-map-lvl4.png");
    preloader.load.image("map-preview-5", "/map/TD-map-lvl5.png");
    preloader.load.image("map-preview-6", "/map/TD-map-lvl6.png");
    preloader.load.tilemapTiledJSON("mapOne", "/map/TD-map-lvl1.json");
    preloader.load.image("solidGreen", "/Solid_green.png");
    preloader.load.image("grass", "/tilesets/GrassTileset.png");
    preloader.load.json(
        "waterSpritesConfig",
        "/tilesets/AnimatedWaterTiles.json",
    );
    preloader.load.spritesheet("water", "/tilesets/AnimatedWaterTiles.png", {
        frameWidth: 64,
        frameHeight: 64,
    });
}
