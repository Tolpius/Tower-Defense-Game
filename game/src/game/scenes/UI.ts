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
            `Wave: ${currentWave}/${maxWaves === Infinity ? "∞" : maxWaves}`,
            { fontSize: "16px", color: "#ffffff" },
        );

        const towerButtons = [
            { id: "slingshot" },
            { id: "crystal" },
            { id: "catapult" },
        ];

        towerButtons.forEach((t, i) => {
            new TowerButton(this, 50, 150 + i * 72, t.id);
        });

        this.events.on("tower-selected", (id: string) => {
            gameScene.events.emit("tower-selected", id);
        });

        // Pause Button Frame
        this.createFrame(690, 10, 36, 28);
        const pauseButton = this.add
            .text(700, 14, "⏸", {
                fontSize: "18px",
                color: "#ffffff",
            })
            .setInteractive()
            .on("pointerdown", () => {
                this.showPauseMenu();
            });

        gameScene.events.on("money-changed", this.onMoneyChanged, this);
        gameScene.events.on("health-changed", this.onHealthChanged, this);
        gameScene.events.on("wave-changed", this.onWaveChanged, this);
    }

    private pauseMenuElements: Phaser.GameObjects.GameObject[] = [];

    private showPauseMenu() {
        // Spiel pausieren
        this.scene.pause("Game");

        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Hintergrund-Overlay
        const overlay = this.add
            .rectangle(centerX, centerY, width, height, 0x000000, 0.7)
            .setInteractive(); // Blockiert Klicks dahinter

        // Pause-Text
        const pauseText = this.add
            .text(centerX, centerY - 80, "⏸ Paused", {
                fontSize: "48px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Resume Button
        const resumeButton = this.add
            .text(centerX, centerY, "▶ Resume", {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#228B22",
                padding: { left: 24, right: 24, top: 12, bottom: 12 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", function (this: Phaser.GameObjects.Text) {
                this.setStyle({ backgroundColor: "#2aab2a" });
            })
            .on("pointerout", function (this: Phaser.GameObjects.Text) {
                this.setStyle({ backgroundColor: "#228B22" });
            })
            .on("pointerdown", () => {
                this.hidePauseMenu();
            });

        // Main Menu Button
        const menuButton = this.add
            .text(centerX, centerY + 70, "🏠 Main Menu", {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#B22222",
                padding: { left: 24, right: 24, top: 12, bottom: 12 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", function (this: Phaser.GameObjects.Text) {
                this.setStyle({ backgroundColor: "#d42a2a" });
            })
            .on("pointerout", function (this: Phaser.GameObjects.Text) {
                this.setStyle({ backgroundColor: "#B22222" });
            })
            .on("pointerdown", () => {
                this.hidePauseMenu();
                this.scene.stop("Game");
                this.scene.stop("UI");
                this.scene.start("MainMenu");
            });

        // Elemente speichern für späteres Entfernen
        this.pauseMenuElements = [overlay, pauseText, resumeButton, menuButton];
    }

    private hidePauseMenu() {
        // Pause-Menü-Elemente entfernen
        this.pauseMenuElements.forEach((el) => el.destroy());
        this.pauseMenuElements = [];

        // Spiel fortsetzen
        this.scene.resume("Game");
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
        this.waveText.setText(
            `Wave: ${currentWave}/${maxWaves === Infinity ? "∞" : maxWaves}`,
        );
    }
}

