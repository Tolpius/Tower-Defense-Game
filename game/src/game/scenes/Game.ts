import { Scene } from "phaser";
import { Enemy } from "../entities/enemy";
import { Tower } from "../entities/tower";
import {
    setupPointerDownHandler,
    setupPointerMoveHandler,
    setupTowerSelectedHandler,
} from "../scripts/events/gameEvents";
import handleMapInit from "../scripts/maps/mapInit";
import { Types } from "phaser";
import { MapData, WorldsData } from "../../config/WorldInterfaces";
import { WaveManager } from "../scripts/waves/WaveManager";
import { loadWaterSprites } from "../scripts/preloader/waterSprites";
import { markAsCheater } from "../scripts/cheats/CheaterState";

export class Game extends Scene {
    public enemies!: Phaser.GameObjects.Group;
    public towers!: Phaser.GameObjects.Group;
    public layerHighground!: Phaser.Tilemaps.TilemapLayer;
    private _money: number;
    private _health: number;
    private _kills = 0;
    public selectedTower?: Tower;
    public buildingTowerSelected: string | null;
    public buildingTowerSelectedCost: number;
    public buildPreview: Phaser.GameObjects.Image;
    public buildMode: boolean;
    public towerPlacementClick: Phaser.Input.Pointer;
    public layerBuildable: Phaser.Tilemaps.TilemapLayer;
    public waypoints: Types.Math.Vector2Like[];
    public path: Phaser.Curves.Path;
    private _buildRangeIndicator: Phaser.GameObjects.Graphics | null = null;
    public worlds: WorldsData;
    public waveManager!: WaveManager;
    private levelCompleted = false;
    private worldId!: number;
    private mapId!: number;
    public mapConfig!: MapData;

    public waterLayer!: Phaser.Tilemaps.TilemapLayer;
    public waterSpriteKey = "water";

    // Cheat System 📈
    private cheatBuffer: string = "";
    public buildAnywhere: boolean = false;
    public enemyScale: number = 1;
    public easyMode: boolean = false;
    public infiniteRange: boolean = false;

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
    }

    get health() {
        return this._health;
    }

    set health(value: number) {
        this._health = value;
        this.events.emit("health-changed", this._health);

        if (this._health <= 0) {
            // Stoppe Game und UI, starte GameOver-Screen
            this.scene.stop("UI");
            this.scene.stop("Game");
            this.scene.start("GameOver", {
                worldId: this.worldId,
                mapId: this.mapId,
                wave: this.waveManager?.currentWave ?? 1,
                kills: this._kills,
                isInfiniteMode: this.waveManager?.isInfiniteMode ?? false,
            });
        }
    }

    get kills() {
        return this._kills;
    }

    addKill() {
        this._kills += 1;
        this.events.emit("kills-changed", this._kills);
    }
    get buildRangeIndicator() {
        return this._buildRangeIndicator;
    }

    set buildRangeIndicator(value) {
        this._buildRangeIndicator = value;
    }

    // Flag für Start im Infinite-Modus
    private startInInfiniteMode = false;

    init(data: {
        worldId: number;
        mapId: number;
        startInfiniteMode?: boolean;
    }) {
        this.worldId = data.worldId;
        this.mapId = data.mapId;
        this.startInInfiniteMode = data.startInfiniteMode ?? false;

        this.worlds = this.cache.json.get("worlds");
        if (!this.worlds) {
            throw new Error("Failed to load World data:" + this.worlds);
        }
        const world = this.worlds.worlds.find((w) => w.id == this.worldId);
        if (!world) throw new Error("World not found");
        const map = world?.maps.find((m) => m.id == this.mapId);
        if (!map) throw new Error("Map not found");

        this.mapConfig = map;
    }

    preload() {
        // Load map JSON if not already loaded
        const mapKey = `map-${this.mapConfig.id}`;
        if (!this.cache.tilemap.has(mapKey)) {
            this.load.tilemapTiledJSON(
                mapKey,
                `assets/map/TD-map-lvl${this.mapConfig.id}.json`,
            );
        }
    }

    create() {
        this.events.once("shutdown", () => {
            this.cleanup();
        });
        //Variable Init
        this.money = this.mapConfig.startingMoney;
        this.health = this.mapConfig.startingHealth;
        this._kills = 0;

        this.registry.set("money", this.money);
        this.registry.set("health", this.health);

        this.buildMode = false;

        this.levelCompleted = false;
        //Enemy Group und Tower Group init
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: false,
        });

        this.towers = this.add.group({
            classType: Tower,
            runChildUpdate: false,
        });

        //Map and Waypoint Init
        handleMapInit(this);

        //Water Spritesheet Animation Init
        loadWaterSprites(this);

        // Setup click handler for buildable tiles12
        setupPointerDownHandler(this);

        // Setup UI Event listener for building Tower selected
        setupTowerSelectedHandler(this);

        //Setup Build Preview Event Listener
        setupPointerMoveHandler(this);

        //Enemy Spawn Init
        this.waveManager = new WaveManager(this, this.mapConfig.waves);

        // Starte im Infinite-Modus wenn von GameWon kommend
        if (this.startInInfiniteMode) {
            this.waveManager.enableInfiniteMode();
        }

        this.waveManager.startWave();

        //UI Init
        this.scene.launch("UI");

        // Cheat System 📈
        this.setupCheatCodes();
    }

    private setupCheatCodes() {
        const cheats: Record<string, () => void> = {
            stonks: () => {
                this.money += 1000;
                console.log("📈 STONKS! +1000 Gold!");
            },
            maquak: () => {
                this.buildAnywhere = true;
                console.log("🐵 MAQUAK! Baue überall!");
            },
            bighead: () => {
                this.enemyScale = 2;
                this.applyEnemyScale();
                console.log("🎈 BIGHEAD! Riesige Gegner!");
            },
            ants: () => {
                this.enemyScale = 0.3;
                this.applyEnemyScale();
                console.log("🐜 ANTS! Winzige Gegner!");
            },
            nuke: () => {
                const enemies = this.enemies.getChildren() as Enemy[];
                const count = enemies.length;
                enemies.forEach((enemy) => enemy.onDeath());
                console.log(`💥 NUKE! ${count} Gegner pulverisiert!`);
            },
            gottagofast: () => {
                this.time.timeScale = 3;
                this.tweens.timeScale = 3;
                this.physics.world.timeScale = 1 / 3;
                console.log("🏃 GOTTAGOFAST! 3x Speed!");
            },
            slowmo: () => {
                this.time.timeScale = 0.25;
                this.tweens.timeScale = 0.25;
                this.physics.world.timeScale = 4;
                console.log("🕶️ SLOWMO! Matrix Mode!");
            },
            isthiseasymode: () => {
                this.easyMode = true;
                (this.enemies.getChildren() as Enemy[]).forEach((enemy) => {
                    enemy.hp = 1;
                    enemy.maxHp = 1;
                });
                console.log("👶 ISTHISEASYMODE! Alle Gegner haben 1 HP!");
            },
            snipergang: () => {
                this.infiniteRange = true;
                (this.towers.getChildren() as Tower[]).forEach((tower) => {
                    tower.range = 9999;
                });
                console.log("🔫 SNIPERGANG! Infinite Range!");
            },
        };

        this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            this.cheatBuffer += event.key.toLowerCase();
            this.cheatBuffer = this.cheatBuffer.slice(-15); // Letzte 15 Zeichen behalten

            for (const [code, action] of Object.entries(cheats)) {
                if (this.cheatBuffer.endsWith(code)) {
                    action();
                    this.cheatBuffer = "";
                    // Globaler Cheater-Status setzen
                    markAsCheater();
                    // CheaterOverlay neu starten für Wackel-Animation
                    if (this.scene.isActive("CheaterOverlay")) {
                        this.scene.stop("CheaterOverlay");
                    }
                    this.scene.launch("CheaterOverlay");
                    this.scene.bringToTop("CheaterOverlay");
                }
            }
        });
    }

    update(time: number, delta: number) {
        // Enemies
        (this.enemies.getChildren() as Enemy[]).forEach((enemy) => {
            if (!enemy.active) return;

            enemy.update();

            if (enemy.hasReachedBase && enemy.isAlive) {
                enemy.isWorthMoney = false;
                this.onBaseHealthChanged(enemy.damageToBase);
                enemy.onDeath();
            }
        });

        // Towers
        (this.towers.getChildren() as Tower[]).forEach((tower) => {
            tower.update(time, delta, this.enemies);
        });

        // Wave-Progress
        this.checkWaveProgress();
    }

    checkWaveProgress() {
        if (!this.waveManager.isCurrentWaveFinished()) return;

        if (this.waveManager.hasMoreWaves()) {
            this.waveManager.advanceWave();
            this.waveManager.startWave();
            this.events.emit("wave-changed");
        } else {
            this.onLevelCompleted();
        }
    }

    onLevelCompleted() {
        if (this.levelCompleted) return;
        this.levelCompleted = true;

        // Im Infinite-Modus: Game Over (da man nur verlieren kann)
        if (this.waveManager.isInfiniteMode) {
            console.log("Infinite Mode beendet!");
            this.time.delayedCall(2000, () => {
                this.scene.stop("UI");
                this.scene.stop("Game");
                this.scene.start("GameOver", {
                    worldId: this.worldId,
                    mapId: this.mapId,
                    infiniteWave: this.waveManager.currentInfiniteWave,
                    wave: this.waveManager.currentInfiniteWave,
                    kills: this._kills,
                    isInfiniteMode: true,
                });
            });
            return;
        }

        console.log("Level completed! Waiting 4 seconds...");
        this.time.delayedCall(4000, () => {
            this.scene.stop("UI");
            this.scene.stop("Game");
            this.scene.start("GameWon", {
                worldId: this.worldId,
                mapId: this.mapId,
                canContinueToInfinite: true,
                wave: this.waveManager?.currentWave ?? 1,
                kills: this._kills,
                isInfiniteMode: false,
            });
        });
    }

    onBaseHealthChanged(damage: number) {
        this.health = this.health - damage;
    }

    cleanup() {
        this.events.off("money-changed");
        this.events.off("health-changed");
        this.events.off("tower-selected");
    }

    /** Wendet die aktuelle enemyScale auf alle existierenden Gegner an */
    private applyEnemyScale() {
        (this.enemies.getChildren() as Phaser.GameObjects.Sprite[]).forEach(
            (enemy) => {
                enemy.setScale(this.enemyScale);
            },
        );
    }
}
