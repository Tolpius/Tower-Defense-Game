import { Scene } from "phaser";
import { Enemy } from "../entities/enemy";
import { Tower } from "../entities/tower";
import {
    setupPointerDownHandler,
    setupPointerMoveHandler,
    setupTowerSelectedHandler,
} from "../scripts/events/gameEvents";
import handleMap1Init from "../scripts/maps/map1";
import { GAME_CONFIG } from "../../config/gameConfig";
import { Types } from "phaser";
import { Leafbug } from "../entities/enemies/leafbug";
import { Scorpion } from "../entities/enemies/scorpion";
import { EnemyFactory } from "../factories/enemyFactory";
import { WAVE_1 } from "../../waves/wave1";

export class Game extends Scene {
    public enemies!: Phaser.GameObjects.Group;
    public towers!: Phaser.GameObjects.Group;
    public layerHighground!: Phaser.Tilemaps.TilemapLayer;
    private _money: number;
    private _health: number;
    private enemiesToSpawn: number;
    private enemiesSpawned = 0;
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
        this.money = GAME_CONFIG.startingMoney;
        this.health = GAME_CONFIG.startingHealth;

        this.registry.set("money", this.money);
        this.registry.set("health", this.health);

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

        //Map and Waypoint Init
        handleMap1Init(this);

        // Setup click handler for buildable tiles12
        setupPointerDownHandler(this);

        // Setup UI Event listener for building Tower selected
        setupTowerSelectedHandler(this);

        //Setup Build Preview Event Listener
        setupPointerMoveHandler(this);

        //Enemy Spawn Init
        this.spawnWave(WAVE_1);

        //UI Init
        this.scene.launch("UI");
    }

    spawnWave(wave: typeof WAVE_1) {
        let currentDelay = 0;

        wave.forEach((spawn) => {
            currentDelay += spawn.delay;

            this.time.delayedCall(currentDelay, () => {
                const enemy = EnemyFactory.create(
                    this,
                    this.path,
                    spawn.enemyType
                );
                enemy.start();
                this.enemies.add(enemy);
                this.enemiesSpawned++;
            });
        });
    }
    update() {
        (this.enemies.getChildren() as Enemy[]).forEach((enemy: Enemy) => {
            if (!enemy.active) return;

            enemy.update();

            if (!enemy.isAlive && enemy.isWorthMoney) {
                this.money = this.money + enemy.moneyOnDeath;
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

    onBaseHealthChanged(damage: number) {
        this.health = this.health - damage;
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

