import { Scene } from "phaser";
import { Enemy } from "../entities/enemy";
import { Tower } from "../entities/tower";
export class Game extends Scene {
    enemies!: Phaser.GameObjects.Group;
    towers!: Phaser.GameObjects.Group;
    private money = 0;
    private health = 100;
    private enemiesToSpawn = 10;
    private enemiesSpawned = 0;
    constructor() {
        super("Game");
    }



    create() {
        //Variable Init
        this.money = 0;
        this.health = 100;

        this.enemiesSpawned = 0;
        this.enemiesToSpawn = 10;

        //Enemy Group und Tower Group init
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: false,
        });

        this.towers = this.add.group({
            classType: Tower,
            runChildUpdate: false,
        });

        //Map Init
        const map = this.make.tilemap({
            key: "mapOne",
        });
        const tilesetGrass = map.addTilesetImage("GrassTileset", "grass");
        const tilesetWater = map.addTilesetImage("AnimatedWaterTiles", "water");
        const tilesetSolidGreen = map.addTilesetImage(
            "solid_green",
            "solidGreen"
        );
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
        //Buildable Layer Init
        if (tilesetSolidGreen) {
            const layerBuildable = map.createLayer(
                "Buildable",
                tilesetSolidGreen,
                0,
                0
            );
            // Enable input for buildable layer
            layerBuildable && layerBuildable.setInteractive();

            // Setup click handler for buildable tiles
            this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (!layerBuildable?.active) return;

                const tile = layerBuildable.getTileAtWorldXY(
                    pointer.worldX,
                    pointer.worldY
                );

                if (tile && tile.index !== 0) {
                    // Place tower at tile position
                    const towerX = tile.getCenterX();
                    const towerY = tile.getCenterY() - 32;

                    const tower = new Tower(this, towerX, towerY);
                    this.towers.add(tower);

                    // Remove the buildable tile
                    layerBuildable.removeTileAt(tile.x, tile.y);
                }
            });
        }
        //Waypoints Init
        const layerWaypoints = map.getObjectLayer("Waypoints");
        console.log(layerWaypoints);
        this.waypoints = layerWaypoints.objects[0].polyline;
        const startPoint = this.waypoints[1];

        this.path = new Phaser.Curves.Path(startPoint.x, startPoint.y);

        this.waypoints.forEach((point, index) => {
            if (index === 0) return;
            this.path.lineTo(point.x, point.y);
        });
        //Enemy Spawn Init
        this.time.addEvent({
            delay: 1000,
            repeat: this.enemiesToSpawn - 1,
            callback: () => {
                const enemy = new Enemy(this, this.path, "leafbug");
                enemy.start();
                this.enemies.add(enemy);
                this.enemiesSpawned++;
            },
        });
        this.scene.launch("UI");
    }

    update() {
        (this.enemies.getChildren() as Enemy[]).forEach((enemy: Enemy) => {
            if (!enemy.active) return;

            enemy.update();

            if (!enemy.isAlive) {
                this.setMoney(this.money + enemy.moneyOnDeath);
            }

            if (enemy.hasReachedEnd() && enemy.isAlive) {
                this.onBaseHealthChanged(enemy.damageToBase);
                enemy.onDeath();
            }
        });

        this.checkWinCondition();

        (this.towers.getChildren() as Tower[]).forEach((tower: Tower) => {
            tower.update(this.time.now, this.game.loop.delta, this.enemies);
        });
        this.checkWinCondition();
    }

    setMoney(value: number) {
        this.money = value;
        this.events.emit("money-changed", this.money);
    }

    setHealth(value: number) {
        this.health = value;
        this.events.emit("health-changed", this.health);

        if (this.health <= 0) {
            // Stoppe Game und UI, starte GameOver-Screen
            this.scene.stop("UI");
            this.scene.stop("Game");
            this.scene.start("GameOver");
        }
    }

    onBaseHealthChanged(damage: number) {
        this.setHealth(this.health - damage);
    }

    checkWinCondition() {
        const allEnemiesSpawned = this.enemiesSpawned >= this.enemiesToSpawn;

        const noEnemiesLeft =
            (this.enemies.getChildren() as Enemy[]).filter((e: Enemy) => e.isAlive)
                .length === 0;

        if (allEnemiesSpawned && noEnemiesLeft) {
            this.scene.stop("UI");
            this.scene.stop("Game");
            this.scene.start("GameWon");
        }
    }
}

