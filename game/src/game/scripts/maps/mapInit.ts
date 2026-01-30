import { Types } from "phaser";
import { Game } from "../../scenes/Game";

export default function handleMapInit(scene: Game) {
    // Map key corresponds to what was loaded in Game.preload()
    const mapKey = `map-${scene.mapConfig.id}`;

    const map = scene.make.tilemap({
        key: mapKey,
    });
    const addTileset = (
        options: { name: string; key: string }[],
        label: string,
    ) => {
        for (const option of options) {
            const tileset = map.addTilesetImage(option.name, option.key);
            if (tileset) {
                return { tileset, key: option.key };
            }
        }
        throw new Error(`${label} Tileset konnte nicht geladen werden`);
    };

    const grassResult = addTileset(
        [
            { name: "GrassTileset", key: "grass" },
            { name: "GrassTilesetAutumn", key: "grassAutumn" },
        ],
        "Grass",
    );

    const waterResult = addTileset(
        [
            { name: "AnimatedWaterTiles", key: "water" },
            { name: "AnimatedWaterAutumn", key: "waterAutumn" },
        ],
        "Water",
    );

    const solidGreenResult = addTileset(
        [
            { name: "solid_green", key: "solidGreen" },
            { name: "Solid_green", key: "solidGreen" },
        ],
        "SolidGreen",
    );
    scene.waterSpriteKey = waterResult.key;

    const terrainTilesets = [grassResult.tileset, waterResult.tileset];

    const layerBackground = map.createLayer(
        "Terrain_Background",
        terrainTilesets,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;
    const layerPath = map.createLayer(
        "Terrain_Path",
        terrainTilesets,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;
    const layerCliffs = map.createLayer(
        "Terrain_Cliffs",
        terrainTilesets,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;
    const layerProps = map.createLayer(
        "Props",
        terrainTilesets,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;
    const layerDetails = map.createLayer(
        "Details",
        terrainTilesets,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;

    scene.waterLayer = map.createLayer(
        "Terrain_Water",
        waterResult.tileset,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;

    //Buildable Layer Init

    scene.layerBuildable = map.createLayer(
        "Buildable",
        solidGreenResult.tileset,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;
    scene.layerHighground = map.createLayer(
        "Highground",
        solidGreenResult.tileset,
        0,
        0,
    ) as Phaser.Tilemaps.TilemapLayer;
    scene.layerHighground?.setVisible(false);
    // Disable visibility of buildable layer initially
    scene.layerBuildable && scene.layerBuildable.setVisible(false);

    const depthDefaults: Record<string, number> = {
        Terrain_Background: 0,
        Terrain_Path: 10,
        Terrain_Water: 20,
        Terrain_Cliffs: 30,
        Props: 100,
        Details: 200,
        Buildable: 1000,
        Highground: 1100,
    };

    const applyDepth = (
        layer: Phaser.Tilemaps.TilemapLayer,
        name: string,
    ) => {
        const props = layer.layer?.properties as { name: string; value: number }[];
        const depthProp = props?.find((p) => p.name === "depth");
        layer.setDepth(depthProp?.value ?? depthDefaults[name] ?? 0);
    };

    applyDepth(layerBackground, "Terrain_Background");
    applyDepth(layerPath, "Terrain_Path");
    applyDepth(scene.waterLayer, "Terrain_Water");
    applyDepth(layerCliffs, "Terrain_Cliffs");
    applyDepth(layerProps, "Props");
    applyDepth(layerDetails, "Details");
    applyDepth(scene.layerBuildable, "Buildable");
    applyDepth(scene.layerHighground, "Highground");

    const layerWaypoints = map.getObjectLayer("Waypoints");
    if (!layerWaypoints) {
        throw new Error("Waypoints layer not found in the map");
    }

    scene.waypoints = layerWaypoints.objects[0]
        .polyline as Types.Math.Vector2Like[];
    const startPoint = scene.waypoints[1];

    scene.path = new Phaser.Curves.Path(startPoint.x, startPoint.y);

    scene.waypoints.forEach((point, index) => {
        if (index === 0) return;
        scene.path.lineTo(point.x, point.y);
    });
}
