import Phaser from "phaser";
import { WorldData, MapData } from "../../config/WorldInterfaces";

export default class MapSelector extends Phaser.Scene {
    private world!: WorldData;
    private mapButtons: Phaser.GameObjects.Text[] = [];
    private previewImage?: Phaser.GameObjects.Image;
    private previewFrame?: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: "MapSelector" });
    }

    init(data: { world: WorldData }) {
        this.world = data.world;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add
            .image(width / 2, height / 2, "background")
            .setDisplaySize(width, height)
            .setDepth(0);

        // Title with world name
        this.add
            .text(width / 2, 60, `${this.world.name} - Select Map`, {
                fontSize: "40px",
                color: "#fff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Create map buttons in a grid
        this.createMapGrid();

        // Preview image (shown on hover)
        this.createPreviewImage();

        // Back to World Selector button
        this.add
            .text(width / 2, height - 50, "← Back to Worlds", {
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
                this.scene.start("WorldSelector");
            });
    }

    private createMapGrid() {
        const { width } = this.scale;

        // Grid settings
        const columns = 3;
        const buttonWidth = 180;
        const buttonHeight = 100;
        const paddingX = 30;
        const paddingY = 25;

        // Calculate starting position to center the grid
        const totalGridWidth = columns * buttonWidth + (columns - 1) * paddingX;
        const startX = (width - totalGridWidth) / 2 + buttonWidth / 2;
        const startY = 140;

        this.mapButtons = [];

        this.world.maps.forEach((map, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            const x = startX + col * (buttonWidth + paddingX);
            const y = startY + row * (buttonHeight + paddingY);

            // Map info text
            const mapInfo = `${map.name}\n🌊 ${map.waves.length} Waves`;

            const button = this.add
                .text(x, y, mapInfo, {
                    fontSize: "16px",
                    color: "#fff",
                    backgroundColor: "#2a4a6e",
                    padding: { left: 12, right: 12, top: 12, bottom: 12 },
                    fixedWidth: buttonWidth,
                    align: "center",
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", function (this: Phaser.GameObjects.Text) {
                    this.setStyle({ backgroundColor: "#3a6a9e" });
                })
                .on("pointerout", function (this: Phaser.GameObjects.Text) {
                    this.setStyle({ backgroundColor: "#2a4a6e" });
                })
                .on("pointerover", () => {
                    this.showPreview(map.id);
                })
                .on("pointerout", () => {
                    this.hidePreview();
                })
                .on("pointerdown", () => {
                    this.selectMap(map);
                });

            this.mapButtons.push(button);
        });
    }

    private selectMap(map: MapData) {
        // Start the game with the selected world and map
        this.scene.start("Game", {
            worldId: this.world.id,
            mapId: map.id,
        });
    }

    private createPreviewImage() {
        const { width, height } = this.scale;
        const previewWidth = 320;
        const previewHeight = 180;
        const columns = 3;
        const buttonWidth = 180;
        const buttonHeight = 100;
        const paddingY = 25;
        const startY = 140;
        const rows = Math.ceil(this.world.maps.length / columns);
        const lastRowY = startY + (rows - 1) * (buttonHeight + paddingY);
        const desiredY = lastRowY + buttonHeight / 2 + 40 + previewHeight / 2;
        const maxY = height - 90 - previewHeight / 2;
        const previewY = Math.min(desiredY, maxY);

        this.previewFrame = this.add
            .rectangle(width / 2, previewY, previewWidth + 8, previewHeight + 8)
            .setStrokeStyle(2, 0x2a4a6e, 1)
            .setVisible(false);

        this.previewImage = this.add
            .image(width / 2, previewY, "map-preview-1")
            .setDisplaySize(previewWidth, previewHeight)
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(2);
    }

    private showPreview(mapId: number) {
        if (!this.previewImage) return;
        const key = `map-preview-${mapId}`;
        if (!this.textures.exists(key)) {
            this.previewImage.setVisible(false);
            this.previewFrame?.setVisible(false);
            return;
        }
        this.previewImage.setTexture(key);
        this.previewImage.setVisible(true);
        this.previewFrame?.setVisible(true);
    }

    private hidePreview() {
        if (!this.previewImage) return;
        this.previewImage.setVisible(false);
        this.previewFrame?.setVisible(false);
    }

}
