import { Scene } from "phaser";
import { Enemy } from "../entities/enemy";
import { Tower } from "../entities/tower";
export class Game extends Scene {
    enemies: Enemy[] = [];
    towers: Tower[] = [];
    private money = 0;
    private health = 100;
    constructor() {
        super("Game");
    }

    private cleanup() {
        // Cleanup all enemies and their tweens
        this.enemies.forEach((enemy) => {
            enemy.stopFollow();
            enemy.healthBar.destroy();
            enemy.destroy();
        });
        this.enemies = [];

        // Cleanup all towers
        this.towers.forEach((tower) => {
            tower.destroy();
        });
        this.towers = [];

        // Reset game state
        this.money = 0;
        this.health = 100;
    }
    create() {
        this.events.once("shutdown", () => {
            this.cleanup();
        });
        this.events.once("sleep", () => {
            this.cleanup();
        });

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

        const tower = new Tower(this, 200, 300);
        this.towers.push(tower);

        this.time.addEvent({
            delay: 1000,
            repeat: 9,
            callback: () => {
                const enemy = new Enemy(this, this.path, "leafbug");
                enemy.start();
                this.enemies.push(enemy);
            },
        });
        this.scene.launch("UI");
    }

    update() {
        this.enemies = this.enemies.filter((enemy) => {
            enemy.update();
            if (enemy.isDead()) {
                this.setMoney(this.money + enemy.moneyOnDeath);
            }
            if (enemy.hasReachedEnd() && !enemy.isDead()) {
                this.onBaseHealthChanged(enemy.damageToBase);
                enemy.onDeath();
            }
            return !(enemy.isDead() || enemy.hasReachedEnd());
        });
        this.towers.forEach((tower) => {
            tower.update(this.time.now, this.game.loop.delta, this.enemies);
        });
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
}

