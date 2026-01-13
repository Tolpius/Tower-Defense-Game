import { Scene } from "phaser";

export class UI extends Scene {
    moneyText!: Phaser.GameObjects.Text;
    healthText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "UI", active: false });
    }

    create() {
        const gameScene = this.scene.get("Game");
        this.moneyText = this.add.text(16, 16, "Gold: 0", {
            fontSize: "16px",
            color: "#ffffff",
        });

        this.healthText = this.add.text(16, 36, "HP: 100", {
            fontSize: "16px",
            color: "#ffffff",
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

        this.events.once("shutdown", () => {
            gameScene.events.off("money-changed", this.onMoneyChanged, this);
            gameScene.events.off("health-changed", this.onHealthChanged, this);
        });
    }

    onMoneyChanged(money: number) {
        this.moneyText.setText(`Gold: ${money}`);
    }

    onHealthChanged(hp: number) {
        this.healthText.setText(`HP: ${hp}`);
    }
}

