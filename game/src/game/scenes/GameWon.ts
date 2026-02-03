import { Scene } from "phaser";
import { WorldsData } from "../../config/WorldInterfaces";

export class GameWon extends Scene {
    private worldId!: number;
    private mapId!: number;
    private worlds!: WorldsData;
    private hasNextLevel: boolean = false;
    private canContinueToInfinite: boolean = false;

    constructor() {
        super({ key: "GameWon" });
    }

    init(data: {
        worldId: number;
        mapId: number;
        canContinueToInfinite?: boolean;
    }) {
        this.worldId = data.worldId;
        this.mapId = data.mapId;
        this.canContinueToInfinite = data.canContinueToInfinite ?? false;
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        // Load worlds data
        this.worlds = this.cache.json.get("worlds");
        this.hasNextLevel = this.checkNextLevel();

        this.add
            .text(width / 2, height / 2 - 80, "You won!", {
                fontSize: "48px",
                color: "#fff",
            })
            .setOrigin(0.5);

        // Button-Positionen berechnen
        let buttonY = height / 2 - 20;
        const buttonSpacing = 60;

        // Next Level Button (only if next level exists)
        if (this.hasNextLevel) {
            this.add
                .text(width / 2, buttonY, "Next Level", {
                    fontSize: "32px",
                    color: "#fff",
                    backgroundColor: "#228B22",
                    padding: { left: 16, right: 16, top: 8, bottom: 8 },
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    this.scene.stop("GameWon");
                    const nextLevel = this.getNextLevel();
                    this.scene.start("Game", {
                        worldId: nextLevel.worldId,
                        mapId: nextLevel.mapId,
                    });
                    this.scene.launch("UI");
                });
            buttonY += buttonSpacing;
        }

        // Continue to Endless Mode Button
        if (this.canContinueToInfinite) {
            this.add
                .text(width / 2, buttonY, "♾️ Endless Mode", {
                    fontSize: "32px",
                    color: "#fff",
                    backgroundColor: "#8B008B",
                    padding: { left: 16, right: 16, top: 8, bottom: 8 },
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    this.scene.stop("GameWon");
                    this.scene.start("Game", {
                        worldId: this.worldId,
                        mapId: this.mapId,
                        startInfiniteMode: true,
                    });
                    this.scene.launch("UI");
                });
            buttonY += buttonSpacing;
        }

        // Restart Level Button
        this.add
            .text(width / 2, buttonY, "Restart Level", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#B22222",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.scene.stop("GameWon");
                this.scene.start("Game", {
                    worldId: this.worldId,
                    mapId: this.mapId,
                });
                this.scene.launch("UI");
            });
        buttonY += buttonSpacing;

        // Main Menu Button
        this.add
            .text(width / 2, buttonY, "Back to Main Menu", {
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
            });
    }

    private checkNextLevel(): boolean {
        const currentWorld = this.worlds.worlds.find(
            (w) => w.id === this.worldId,
        );
        if (!currentWorld) return false;

        // Check if there's a next map in the current world
        const nextMapInWorld = currentWorld.maps.find(
            (m) => m.id === this.mapId + 1,
        );
        if (nextMapInWorld) return true;

        // Check if there's a next world with at least one map
        const nextWorld = this.worlds.worlds.find(
            (w) => w.id === this.worldId + 1,
        );
        if (nextWorld && nextWorld.maps.length > 0) return true;

        return false;
    }

    private getNextLevel(): { worldId: number; mapId: number } {
        const currentWorld = this.worlds.worlds.find(
            (w) => w.id === this.worldId,
        );

        if (currentWorld) {
            // Check if there's a next map in the current world
            const nextMapInWorld = currentWorld.maps.find(
                (m) => m.id === this.mapId + 1,
            );
            if (nextMapInWorld) {
                return { worldId: this.worldId, mapId: this.mapId + 1 };
            }
        }

        // Move to next world, first map
        const nextWorld = this.worlds.worlds.find(
            (w) => w.id === this.worldId + 1,
        );
        if (nextWorld && nextWorld.maps.length > 0) {
            return { worldId: nextWorld.id, mapId: nextWorld.maps[0].id };
        }

        // Fallback (should not happen if checkNextLevel is correct)
        return { worldId: this.worldId, mapId: this.mapId };
    }
}

