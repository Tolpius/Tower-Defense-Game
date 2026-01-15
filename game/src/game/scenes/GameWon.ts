import { Scene } from "phaser";

export class GameWon extends Scene {
    constructor() {
        super({ key: "GameWon" });
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        this.add
            .text(width / 2, height / 2 - 60, "Du hast gewonnen!", {
                fontSize: "48px",
                color: "#fff",
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, height / 2 + 10, "Zurück ins Main Menu", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#222",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.scene.stop("GameWon");
                this.scene.start("MainMenu");
                this;
            });
    }
}
