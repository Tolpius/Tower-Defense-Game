import { Scene } from "phaser";

export class GameOver extends Scene {
    constructor() {
        super({ key: "GameOver" });
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.add
            .text(width / 2, height / 2 - 60, "Game Over", {
                fontSize: "48px",
                color: "#fff",
            })
            .setOrigin(0.5);

        const restartBtn = this.add
            .text(width / 2, height / 2 + 10, "Restart", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#222",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.scene.stop("GameOver");
                this.scene.start("Game");
                this.scene.launch("UI");
            });
    }
}

