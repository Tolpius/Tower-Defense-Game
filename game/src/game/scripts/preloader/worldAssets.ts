import { Preloader } from "../../scenes/Preloader";

export default function loadWorldAssets(preloader: Preloader) {
    //WORLD GENERATION
    preloader.load.image("logo", "logo_path-of-bugs.png");
    preloader.load.image("background", "/assets/background.png");
    preloader.load.image("enemy", "star.png");
    preloader.load.image("td-map-lvl1", "/map/TD-map-lvl1.png");
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

