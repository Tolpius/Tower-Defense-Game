import { Scene } from "phaser";
import { Enemy } from "../entities/enemy";
import { Tower } from "../entities/tower";
import handleTowerBuild from "../scripts/TowerBuild";
export class Game extends Scene {
    enemies!: Phaser.GameObjects.Group;
    towers!: Phaser.GameObjects.Group;
    layerHighground!: Phaser.Tilemaps.TilemapLayer;
    private _money = 200;
    private health = 100;
    private enemiesToSpawn = 10;
    private enemiesSpawned = 0;
    public selectedTower?: Tower;
    public buildingTowerSelected: string | null = null;
    public buildingTowerSelectedCost: number | null = null;
    public buildPreview: Phaser.GameObjects.Image | null = null;
    public buildMode = false;
    public towerPlacementClick: Phaser.Input.Events.PointerDownEvent | null =
        null;
    public layerBuildable: Phaser.Tilemaps.TilemapLayer | null = null;
    constructor() {
        super("Game");
    }
    get money() {
        return this._money;
    }
    set money(value: number) {
        this._money = value;
        this.registry.set("money", this._money);
        this.events.emit("money-changed", this._money);
        console.log("Money updated:", this._money);
    }

    cleanup() {
        this.events.off("money-changed");
        this.events.off("health-changed");
        this.events.off("tower-selected");
    }

    create() {
        this.events.once("shutdown", () => {
            this.cleanup();
        });
        //Variable Init
        this.money = 200;
        this.health = 100;

        this.registry.set("money", this._money);
        this.registry.set("health", this.health);

        this.buildPreview = null;
        this.towerPlacementClick = null;
        this.buildingTowerSelected = null;
        this.buildingTowerSelectedCost = null;
        this.buildMode = false;

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
        this.layerBuildable = null;
        if (tilesetSolidGreen) {
            this.layerBuildable = map.createLayer(
                "Buildable",
                tilesetSolidGreen,
                0,
                0
            );
            this.layerHighground = map.createLayer(
                "Highground",
                tilesetSolidGreen,
                0,
                0
            );
            this.layerHighground?.setVisible(false);
            // Disable visibility of buildable layer initially
            this.layerBuildable && this.layerBuildable.setVisible(false);

            // Setup click handler for buildable tiles12
            this.input.on(
                "pointerdown",
                (
                    pointer: Phaser.Input.Pointer,
                    gameObjects: Phaser.GameObjects.GameObject[]
                ) => {
                    //1️⃣ Ignore clicks on GameObjects thile not in Build Mode
                    if (gameObjects.length > 0 && this.buildMode === false) {
                        return;
                    }
                    //2️⃣ Build Mode check - build selected Tower

                    if (this.buildMode) {
                        handleTowerBuild(this, pointer);
                    }

                    // 3️⃣ Click on nothing in particular or while in Build Mode - Deselect Tower
                    this.selectedTower?.hideRange();
                    this.selectedTower = undefined;
                }
            );
        }

        this.events.on("tower-selected", (towerId: string, cost: number) => {
            console.log("Game scene received tower-selected:", towerId, cost);
            if (this.buildingTowerSelected === towerId) {
                //Build Mode AUS
                this.buildingTowerSelected = null;
                this.layerBuildable && this.layerBuildable.setVisible(false);
                this.buildMode = false;
                this.buildingTowerSelectedCost = null;
                this.buildPreview?.setVisible(false);
                return;
            }
            //Deselect currently selected tower
            this.selectedTower?.hideRange();
            this.selectedTower = undefined;
            //BUILD MODE AN
            this.buildingTowerSelected = towerId;
            this.layerBuildable?.setVisible(true);
            this.buildingTowerSelectedCost = cost;
            this.buildMode = true;
            this.buildPreview?.destroy();
            this.buildPreview = this.add
                .image(0, 0, towerId)
                .setAlpha(0.5)
                .setDepth(2);
        });

        //Build Preview Event Listener
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (!this.buildMode || !this.layerBuildable || !this.buildPreview)
                return;

            const tile = this.layerBuildable.getTileAtWorldXY(
                pointer.worldX,
                pointer.worldY
            );

            if (!tile || tile.index === 0) {
                this.buildPreview.setVisible(false);
                return;
            }

            this.buildPreview.setVisible(true);
            this.buildPreview.setPosition(
                tile.getCenterX(),
                tile.getCenterY() - 32
            );
        });

        //Waypoints Init
        const layerWaypoints = map.getObjectLayer("Waypoints");
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

            if (!enemy.isAlive && enemy.isWorthMoney) {
                this.setMoney(this._money + enemy.moneyOnDeath);
                enemy.isWorthMoney = false;
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
        this._money = value;
        this.registry.set("money", this._money);
        this.events.emit("money-changed", this._money);
        console.log("Money updated:", this._money);
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
            (this.enemies.getChildren() as Enemy[]).filter(
                (e: Enemy) => e.isAlive
            ).length === 0;

        if (allEnemiesSpawned && noEnemiesLeft) {
            this.scene.stop("UI");
            this.scene.stop("Game");
            this.scene.start("GameWon");
        }
    }
}

