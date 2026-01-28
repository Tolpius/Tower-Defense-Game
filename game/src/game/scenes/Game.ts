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

export class Game extends Scene {
    public enemies!: Phaser.GameObjects.Group;
    public towers!: Phaser.GameObjects.Group;
    public layerHighground!: Phaser.Tilemaps.TilemapLayer;
    private _money: number;
    private _health: number;
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
    private mapConfig!: MapData;

    public waterLayer!: Phaser.Tilemaps.TilemapLayer;

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
            this.scene.start("GameOver");
        }
    }
    get buildRangeIndicator() {
        return this._buildRangeIndicator;
    }

    set buildRangeIndicator(value) {
        this._buildRangeIndicator = value;
    }

    init(data: { worldId: number; mapId: number }) {
        this.worldId = data.worldId;
        this.mapId = data.mapId;

        this.worlds = this.cache.json.get("worlds");
        console.log(this.worlds);
        if (!this.worlds) {
            throw new Error("Failed to load World data:" + this.worlds);
        }
        const world = this.worlds.worlds.find((w) => w.id == this.worldId);
        if (!world) throw new Error("World not found");
        const map = world?.maps.find((m) => m.id == this.mapId);
        if (!map) throw new Error("Map not found");

        this.mapConfig = map;
    }

    create() {
        this.events.once("shutdown", () => {
            this.cleanup();
        });
        //Variable Init
        this.money = this.mapConfig.startingMoney;
        this.health = this.mapConfig.startingHealth;

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
        this.waveManager.startWave();

        //UI Init
        this.scene.launch("UI");
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

        console.log("Level completed! Waiting 4 seconds...");
        this.time.delayedCall(4000, () => {
            this.scene.stop("UI");
            this.scene.stop("Game");
            this.scene.start("GameWon", {
                worldId: this.worldId,
                mapId: this.mapId,
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
}

