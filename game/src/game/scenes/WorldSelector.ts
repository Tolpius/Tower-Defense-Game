import Phaser from "phaser";
import { WorldsData, WorldData } from "../../config/WorldInterfaces";

export default class WorldSelector extends Phaser.Scene {
    private worlds: WorldData[] = [];
    private worldButtons: Phaser.GameObjects.Rectangle[] = [];

    constructor() {
        super({ key: "WorldSelector" });
    }

    create() {
        const { width, height } = this.scale;

        // Load worlds data
        const worldsData: WorldsData = this.cache.json.get("worlds");
        this.worlds = worldsData.worlds;

        // Background
        this.add
            .image(width / 2, height / 2, "background")
            .setDisplaySize(width, height)
            .setDepth(0);

        // Title
        this.add
            .text(width / 2, 60, "Select World", {
                fontSize: "48px",
                color: "#fff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Create world buttons in a grid
        this.createWorldGrid();

        // Back to Main Menu button
        this.add
            .text(width / 2, height - 50, "← Back to Menu", {
                fontSize: "24px",
                color: "#fff",
                backgroundColor: "#444",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", function (this: Phaser.GameObjects.Text) {
                this.setStyle({ backgroundColor: "#666" });
            })
            .on("pointerout", function (this: Phaser.GameObjects.Text) {
                this.setStyle({ backgroundColor: "#444" });
            })
            .on("pointerdown", () => {
                this.scene.start("MainMenu");
            });
    }

    private createWorldGrid() {
        const { width } = this.scale;

        // Grid settings
        const columns = 3;
        const buttonWidth = 200;
        const buttonHeight = 100;
        const paddingX = 40;
        const paddingY = 30;

        // Calculate starting position to center the grid
        const totalGridWidth = columns * buttonWidth + (columns - 1) * paddingX;
        const startX = (width - totalGridWidth) / 2 + buttonWidth / 2;
        const startY = 160;

        this.worlds.forEach((world, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            const x = startX + col * (buttonWidth + paddingX);
            const y = startY + row * (buttonHeight + paddingY);

            const button = this.add
                .rectangle(x, y, buttonWidth, buttonHeight, 0x2a6e2a, 1)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", function (this: Phaser.GameObjects.Rectangle) {
                    this.setFillStyle(0x3a8e3a, 1);
                })
                .on("pointerout", function (this: Phaser.GameObjects.Rectangle) {
                    this.setFillStyle(0x2a6e2a, 1);
                })
                .on("pointerdown", () => {
                    this.selectWorld(world);
                });

            this.add
                .text(x, y, world.name, {
                    fontSize: "22px",
                    color: "#fff",
                    align: "center",
                    wordWrap: {
                        width: buttonWidth - 24,
                        useAdvancedWrap: true,
                    },
                })
                .setOrigin(0.5);

            this.worldButtons.push(button);
        });
    }

    private selectWorld(world: WorldData) {
        this.scene.start("MapSelector", { world });
    }
}
