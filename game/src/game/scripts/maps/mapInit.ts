import { Types } from "phaser";
import { Game } from "../../scenes/Game";

export default function handleMapInit(scene: Game) {
    // Map 1 specific initialization code can go here
    const map = scene.make.tilemap({
        key: "mapOne",
    });
    const tilesetGrass = map.addTilesetImage("GrassTileset", "grass");
    if (!tilesetGrass) {
        throw new Error("GrassTileset konnte nicht geladen werden");
    }

    const tilesetWater = map.addTilesetImage("AnimatedWaterTiles", "water");
    if (!tilesetWater) {
        throw new Error("Water Tileset konnte nicht geladen werden");
    }

    const tilesetSolidGreen = map.addTilesetImage("solid_green", "solidGreen");
    if (!tilesetSolidGreen) {
        throw new Error("SolidGreen Tileset konnte nicht geladen werden");
    }

    map.createLayer("Terrain_Background", tilesetGrass, 0, 0);
    map.createLayer("Terrain_Path", tilesetGrass, 0, 0);
    map.createLayer("Terrain_Cliffs", tilesetGrass, 0, 0);
    map.createLayer("Props", tilesetGrass, 0, 0);
    map.createLayer("Details", tilesetGrass, 0, 0);

    scene.waterLayer = map.createLayer("Terrain_Water", tilesetWater, 0, 0) as Phaser.Tilemaps.TilemapLayer;

    //Buildable Layer Init

    scene.layerBuildable = map.createLayer(
        "Buildable",
        tilesetSolidGreen,
        0,
        0
    ) as Phaser.Tilemaps.TilemapLayer;
    scene.layerHighground = map.createLayer(
        "Highground",
        tilesetSolidGreen,
        0,
        0
    ) as Phaser.Tilemaps.TilemapLayer;
    scene.layerHighground?.setVisible(false);
    // Disable visibility of buildable layer initially
    scene.layerBuildable && scene.layerBuildable.setVisible(false);

    const layerWaypoints = map.getObjectLayer("Waypoints");
    if (!layerWaypoints) {
        throw new Error("Waypoints layer not found in the map");
    }

    scene.waypoints = layerWaypoints.objects[0].polyline as Types.Math.Vector2Like[];
    const startPoint = scene.waypoints[1];

    scene.path = new Phaser.Curves.Path(startPoint.x, startPoint.y);

    scene.waypoints.forEach((point, index) => {
        if (index === 0) return;
        scene.path.lineTo(point.x, point.y);
    });
}

