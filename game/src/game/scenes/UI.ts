import { Scene } from "phaser";
import { TowerButton } from "../ui/towerButton";
import { Game } from "./Game";

export class UI extends Scene {
    moneyText!: Phaser.GameObjects.Text;
    healthText!: Phaser.GameObjects.Text;
    waveText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "UI", active: false });
    }

    cleanup() {
        const gameScene = this.scene.get("Game");
        gameScene.events.off("money-changed", this.onMoneyChanged, this);
        gameScene.events.off("health-changed", this.onHealthChanged, this);
        gameScene.events.off("wave-changed", this.onWaveChanged, this);
        this.events.off("tower-selected");
    }

    private createFrame(
        x: number,
        y: number,
        width: number,
        height: number,
    ): Phaser.GameObjects.Graphics {
        const frame = this.add.graphics();
        frame.lineStyle(2, 0xffffff, 1);
        frame.fillStyle(0x000000, 0.5);
        frame.fillRoundedRect(x, y, width, height, 6);
        frame.strokeRoundedRect(x, y, width, height, 6);
        return frame;
    }

    create() {
        this.events.once("shutdown", () => {
            this.cleanup();
        });

        const gameScene = this.scene.get("Game") as Game;

        // HP Frame und Text
        this.createFrame(10, 10, 100, 28);
        this.healthText = this.add.text(
            16,
            14,
            `HP: ${this.registry.get("health")}`,
            { fontSize: "16px", color: "#ffffff" },
        );

        // Gold Frame und Text
        this.createFrame(10, 44, 100, 28);
        this.moneyText = this.add.text(
            16,
            48,
            `Gold: ${this.registry.get("money")}`,
            { fontSize: "16px", color: "#ffffff" },
        );

        // Wave Frame und Text
        this.createFrame(10, 78, 120, 28);
        const currentWave = gameScene.waveManager?.currentWave ?? 1;
        const maxWaves = gameScene.waveManager?.maxWaves ?? 1;
        this.waveText = this.add.text(
            16,
            82,
            `Wave: ${currentWave}/${maxWaves}`,
            { fontSize: "16px", color: "#ffffff" },
        );

        const towerButtons = [
            { id: "slingshot"},
            { id: "crystal"},
            { id: "catapult"},
        ];

        towerButtons.forEach((t, i) => {
            new TowerButton(this, 50, 150 + i * 72, t.id);
        });

        this.events.on("tower-selected", (id: string) => {
            gameScene.events.emit("tower-selected", id);
        });

        // Pause Button Frame
        this.createFrame(690, 10, 36, 28);
        let paused = false;
        const pauseButton = this.add
            .text(700, 14, "⏸", {
                fontSize: "18px",
                color: "#ffffff",
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

        // Speed Button Frame
        this.createFrame(730, 10, 36, 28);
        let speedMultiplier = 1;
        const speedButton = this.add
            .text(740, 14, "1x", {
                fontSize: "14px",
                color: "#ffffff",
            })
            .setInteractive()
            .on("pointerdown", () => {
                speedMultiplier = speedMultiplier === 1 ? 2 : 1;
                gameScene.time.timeScale = speedMultiplier;
                gameScene.tweens.timeScale = speedMultiplier;
                speedButton.setText(speedMultiplier === 1 ? "1x" : "2x");
            });

        gameScene.events.on("money-changed", this.onMoneyChanged, this);
        gameScene.events.on("health-changed", this.onHealthChanged, this);
        gameScene.events.on("wave-changed", this.onWaveChanged, this);
    }

    onMoneyChanged(money: number) {
        this.moneyText.setText(`Gold: ${money}`);
    }

    onHealthChanged(hp: number) {
        this.healthText.setText(`HP: ${hp}`);
    }

    onWaveChanged() {
        const gameScene = this.scene.get("Game") as Game;
        const currentWave = gameScene.waveManager?.currentWave ?? 1;
        const maxWaves = gameScene.waveManager?.maxWaves ?? 1;
        this.waveText.setText(`Wave: ${currentWave}/${maxWaves}`);
    }
}

