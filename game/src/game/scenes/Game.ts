import { EventBus } from "../EventBus";
import { Scene } from "phaser";
export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.gameText = this.add
            .text(
                512,
                384,
                "Make something fun!\nand share it with us:\nsupport@phaser.io",
                {
                    fontFamily: "Arial Black",
                    fontSize: 38,
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 8,
                    align: "center",
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        const map = this.make.tilemap({
            key: "mapOne",
        });
        console.log("map loaded: ", map);
        const tilesetGrass = map.addTilesetImage("GrassTileset", "grass");
        const tilesetWater = map.addTilesetImage(
            "AnimatedWaterTileset",
            "water"
        );



        const layerBackground = map.createLayer(
            "Terrain_Background",
            tilesetGrass,
            0,
            0
        );
        const layerPath = map.createLayer("Terrain_Path", tilesetGrass, 0, 0);
        const layerWater = map.createLayer("Terrain_Water", tilesetWater, 0, 0);
        const layerCliffs = map.createLayer(
            "Terrain_Cliffs",
            tilesetGrass,
            0,
            0
        );
        const layerProps = map.createLayer("Props", tilesetGrass, 0, 0);
        const layerDetails = map.createLayer("Details", tilesetGrass, 0, 0);

        /*const grassTileset = map.addTilesetImage(
            "GrassTileset", // exakt wie in Tiled
            "grass" // Key aus preload()
        );

        const waterTileset = map.addTilesetImage(
            "Animated water tiles",
            "water"
        );*/
        console.log(map);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

