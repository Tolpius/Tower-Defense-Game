import { Scene } from "phaser";
import { Enemy } from "../entities/enemy";
export class Game extends Scene {
    constructor() {
        super("Game");
    }
    create() {
        const map = this.make.tilemap({
            key: "mapOne",
        });
        const tilesetGrass = map.addTilesetImage("GrassTileset", "grass");
        const tilesetWater = map.addTilesetImage("AnimatedWaterTiles", "water");

        if (tilesetGrass) {
            const layerBackground = map.createLayer(
                "Terrain_Background",
                tilesetGrass,
                0,
                0
            );
            const layerPath = map.createLayer(
                "Terrain_Path",
                tilesetGrass,
                0,
                0
            );
            const layerCliffs = map.createLayer(
                "Terrain_Cliffs",
                tilesetGrass,
                0,
                0
            );
            const layerProps = map.createLayer("Props", tilesetGrass, 0, 0);
            const layerDetails = map.createLayer("Details", tilesetGrass, 0, 0);
        }
        if (tilesetWater) {
            const layerWater = map.createLayer(
                "Terrain_Water",
                tilesetWater,
                0,
                0
            );
        }
        
        const layerWaypoints = map.getObjectLayer("Waypoints");
        console.log(layerWaypoints);
        this.waypoints = layerWaypoints.objects[0].polyline;
        const startPoint = this.waypoints[1];

        this.path = new Phaser.Curves.Path(startPoint.x, startPoint.y);

        this.waypoints.forEach((point, index) => {
            if (index === 0) return;
            this.path.lineTo(point.x, point.y);
        });

        this.time.addEvent({
            delay: 1000,
            repeat: 9,
            callback: () => {
                const enemy = new Enemy(this, this.path);
                enemy.start();
            },
        });

        this.add.image(224, 128, "tower3");
    }

    update() {}
}

