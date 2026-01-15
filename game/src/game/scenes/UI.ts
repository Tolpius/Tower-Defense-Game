import { Scene } from "phaser";
import { TowerButton } from "../ui/towerButton";

export class UI extends Scene {
    moneyText!: Phaser.GameObjects.Text;
    healthText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "UI", active: false });
    }

    cleanup() {
        const gameScene = this.scene.get("Game");
        gameScene.events.off("money-changed", this.onMoneyChanged, this);
        gameScene.events.off("health-changed", this.onHealthChanged, this);
        this.events.off("tower-selected");
    }

    create() {
        this.events.once("shutdown", () => {
            this.cleanup();
        });

        this.moneyText = this.add.text(
            16,
            16,
            `Gold: ${this.registry.get("money")}`
        );
        this.healthText = this.add.text(
            16,
            36,
            `HP: ${this.registry.get("health")}`
        );
        const gameScene = this.scene.get("Game");
        const towerButtons = [
            { id: "tower3", icon: "tower3", cost: 30 },
            { id: "cannon", icon: "tower_cannon", cost: 100 },
            { id: "ice", icon: "tower_ice", cost: 75 },
        ];

        towerButtons.forEach((t, i) => {
            new TowerButton(this, 50, 120 + i * 72, t.icon, t.id);
        });

        this.events.on("tower-selected", (id: string, cost: number) => {
            gameScene.events.emit("tower-selected", id, cost);
        });
        let paused = false;
        const pauseButton = this.add
            .text(700, 16, "⏸", {
                fontSize: "20px",
            })
            .setInteractive()
            .on("pointerdown", () => {
                paused = !paused;
                if (paused) {
                    this.scene.pause("Game");
                    pauseButton.setText("▶");
                } else {
                    this.scene.resume("Game");
                    pauseButton.setText("⏸");
                }
            });

        gameScene.events.on("money-changed", this.onMoneyChanged, this);
        gameScene.events.on("health-changed", this.onHealthChanged, this);

    }

    onMoneyChanged(money: number) {
        this.moneyText.setText(`Gold: ${money}`);
    }

    onHealthChanged(hp: number) {
        this.healthText.setText(`HP: ${hp}`);
    }
}

