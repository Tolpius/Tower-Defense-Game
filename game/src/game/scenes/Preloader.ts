import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, "background");

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");
        //WORLD GENERATION
        this.load.image("logo", "logo.png");
        this.load.image("enemy", "star.png");
        this.load.image("td-map-lvl1", "/map/TD-map-lvl1.png");
        this.load.tilemapTiledJSON("mapOne", "/map/TD-map-lvl1.json");

        this.load.image("solidGreen", "/Solid_green.png");
        this.load.image("grass", "/tilesets/GrassTileset.png");
        this.load.image("water", "/tilesets/AnimatedWaterTiles.png");

        //TOWER GENERATION
        this.load.spritesheet("tower3", "/towers/Tower03.png", {
            frameWidth: 64,
            frameHeight: 128,
        });
        this.load.spritesheet(
            "tower3turret1",
            "/towers/Tower03-Level_01-Turret.png",
            {
                frameWidth: 96,
                frameHeight: 96,
            }
        );
        this.load.spritesheet(
            "tower3projectile1",
            "/towers/Tower03-Level_01-Projectile.png",
            {
                frameWidth: 10,
                frameHeight: 10,
            }
        );
        this.load.spritesheet(
            "tower3projectile1impact",
            "/towers/Tower03-Level01-Projectile-Impact.png",
            {
                frameWidth: 64,
                frameHeight: 64,
            }
        );

        //ENEMY GENERATION
        this.load.spritesheet("scorpion", "/enemies/scorpion/Scorpion.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.spritesheet("leafbug", "/enemies/leafbug/Leafbug.png", {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        const mapData = this.cache.tilemap.get("mapOne");
        this.scene.start("Game");
    }
}

