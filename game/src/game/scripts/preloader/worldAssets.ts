import { Preloader } from "../../scenes/Preloader";

export default function loadWorldAssets(preloader: Preloader) {
    //WORLD GENERATION
    preloader.load.image("logo", "logo_path-of-bugs.png");
    preloader.load.image("background", "/assets/background.png");
    preloader.load.image("td-map-lvl1", "/map/TD-map-lvl1.png");
    preloader.load.image("grassAutumn", "/tilesets/GrassTilesetAutumn.png");
    preloader.load.image("grassWinter", "/tilesets/GrassTilesetWinter.png");
    preloader.load.image("map-preview-1", "/map/TD-map-lvl1.png");
    preloader.load.image("map-preview-2", "/map/TD-map-lvl2.png");
    preloader.load.image("map-preview-3", "/map/TD-map-lvl3.png");
    preloader.load.image("map-preview-4", "/map/TD-map-lvl4.png");
    preloader.load.image("map-preview-5", "/map/TD-map-lvl5.png");
    preloader.load.image("map-preview-6", "/map/TD-map-lvl6.png");
    preloader.load.image("map-preview-7", "/map/TD-map-lvl7.png");
    preloader.load.image("map-preview-8", "/map/TD-map-lvl8.png");
    preloader.load.image("map-preview-9", "/map/TD-map-lvl9.png");
    preloader.load.image("map-preview-10", "/map/TD-map-lvl10.png");
    preloader.load.image("map-preview-11", "/map/TD-map-lvl11.png");
    preloader.load.image("map-preview-12", "/map/TD-map-lvl12.png");
    preloader.load.image("map-preview-13", "/map/TD-map-lvl13.png");
    preloader.load.image("map-preview-14", "/map/TD-map-lvl14.png");
    preloader.load.image("map-preview-15", "/map/TD-map-lvl15.png");
    preloader.load.image("map-preview-16", "/map/TD-map-lvl16.png");
    preloader.load.image("map-preview-17", "/map/TD-map-lvl17.png");
    preloader.load.image("map-preview-18", "/map/TD-map-lvl18.png");
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
    preloader.load.spritesheet(
        "waterAutumn",
        "/tilesets/AnimatedWaterAutumn.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    preloader.load.spritesheet(
        "waterWinter",
        "/tilesets/AnimatedWaterWinter.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
}
