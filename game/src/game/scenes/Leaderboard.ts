import Phaser from "phaser";
import {
    LeaderboardService,
    LeaderboardEntry,
} from "../services/LeaderboardService";
import { UserService } from "../services/UserService";
import { WorldsData, WorldData, MapData } from "../../config/WorldInterfaces";

interface WorldOption {
    id: number;
    name: string;
    maps: { id: number; name: string }[];
}

export class Leaderboard extends Phaser.Scene {
    private entries: LeaderboardEntry[] = [];
    private filterInfinite: boolean | undefined = undefined;
    private filterWorldId: number | undefined = undefined;
    private filterMapId: number | undefined = undefined;
    private isLoading = false;
    private worldOptions: WorldOption[] = [];
    private currentWorldIndex = 0; // 0 = All Worlds
    private currentMapIndex = 0; // 0 = All Maps

    constructor() {
        super({ key: "Leaderboard" });
    }

    create() {
        const { width, height } = this.scale;

        // Load worlds data for filters
        this.loadWorldOptions();

        // Background overlay
        this.add
            .rectangle(width / 2, height / 2, width, height, 0x000000, 0.9)
            .setDepth(0);

        // Title
        this.add
            .text(width / 2, 40, "🏆 Leaderboard", {
                fontSize: "36px",
                color: "#ffd700",
            })
            .setOrigin(0.5);

        // Back button
        this.add
            .text(60, 40, "← Back", {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#333333",
                padding: { left: 12, right: 12, top: 6, bottom: 6 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.scene.start("MainMenu"));

        // Mode filter buttons (row 1)
        this.createFilterButtons(width);

        // World and Map filters (row 2)
        this.createWorldMapFilter(width);

        // Loading text
        this.add
            .text(width / 2, height / 2, "Loading...", {
                fontSize: "24px",
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setName("loadingText");

        // Load leaderboard
        this.loadLeaderboard();
    }

    private loadWorldOptions() {
        const worldsData: WorldsData = this.cache.json.get("worlds");
        this.worldOptions = [];

        worldsData.worlds.forEach((world: WorldData) => {
            this.worldOptions.push({
                id: world.id,
                name: world.name,
                maps: world.maps.map((map: MapData, index: number) => ({
                    id: map.id,
                    name: `M${index + 1}: ${map.name}`,
                })),
            });
        });
    }

    private createFilterButtons(width: number) {
        const buttonY = 90;
        const buttonStyle = {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        };
        const activeStyle = {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#2a6e2a",
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        };

        // All scores button (no filter)
        this.add
            .text(
                width / 2 - 150,
                buttonY,
                "All Scores",
                this.filterInfinite === undefined ? activeStyle : buttonStyle,
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setName("filterBtn_all")
            .on("pointerdown", () => {
                this.filterInfinite = undefined;
                this.updateFilterButtons();
                this.loadLeaderboard();
            });

        // Normal mode button
        this.add
            .text(
                width / 2,
                buttonY,
                "Normal Mode",
                this.filterInfinite === false ? activeStyle : buttonStyle,
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setName("filterBtn_normal")
            .on("pointerdown", () => {
                this.filterInfinite = false;
                this.updateFilterButtons();
                this.loadLeaderboard();
            });

        // Infinite mode button
        this.add
            .text(
                width / 2 + 150,
                buttonY,
                "Infinite Mode",
                this.filterInfinite === true ? activeStyle : buttonStyle,
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setName("filterBtn_infinite")
            .on("pointerdown", () => {
                this.filterInfinite = true;
                this.updateFilterButtons();
                this.loadLeaderboard();
            });
    }

    private updateFilterButtons() {
        const buttonStyle = {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        };
        const activeStyle = {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#2a6e2a",
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        };

        const allBtn = this.children.getByName(
            "filterBtn_all",
        ) as Phaser.GameObjects.Text;
        const normalBtn = this.children.getByName(
            "filterBtn_normal",
        ) as Phaser.GameObjects.Text;
        const infiniteBtn = this.children.getByName(
            "filterBtn_infinite",
        ) as Phaser.GameObjects.Text;

        if (allBtn)
            allBtn.setStyle(
                this.filterInfinite === undefined ? activeStyle : buttonStyle,
            );
        if (normalBtn)
            normalBtn.setStyle(
                this.filterInfinite === false ? activeStyle : buttonStyle,
            );
        if (infiniteBtn)
            infiniteBtn.setStyle(
                this.filterInfinite === true ? activeStyle : buttonStyle,
            );
    }

    private createWorldMapFilter(width: number) {
        const filterY = 130;
        const buttonStyle = {
            fontSize: "14px",
            color: "#ffffff",
            backgroundColor: "#555555",
            padding: { left: 8, right: 8, top: 4, bottom: 4 },
        };

        // World selector (left side)
        this.add
            .text(width / 2 - 280, filterY, "◀", buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.currentWorldIndex =
                    (this.currentWorldIndex -
                        1 +
                        this.worldOptions.length +
                        1) %
                    (this.worldOptions.length + 1);
                this.currentMapIndex = 0; // Reset map to "All" when world changes
                this.updateWorldMapFilter();
                this.loadLeaderboard();
            });

        this.add
            .text(width / 2 - 180, filterY, "All Worlds", {
                fontSize: "14px",
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setName("worldFilterLabel");

        this.add
            .text(width / 2 - 80, filterY, "▶", buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.currentWorldIndex =
                    (this.currentWorldIndex + 1) %
                    (this.worldOptions.length + 1);
                this.currentMapIndex = 0; // Reset map to "All" when world changes
                this.updateWorldMapFilter();
                this.loadLeaderboard();
            });

        // Map selector (right side)
        this.add
            .text(width / 2 + 80, filterY, "◀", buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setName("mapPrevBtn")
            .on("pointerdown", () => {
                const mapCount = this.getAvailableMaps().length;
                this.currentMapIndex =
                    (this.currentMapIndex - 1 + mapCount + 1) % (mapCount + 1);
                this.updateWorldMapFilter();
                this.loadLeaderboard();
            });

        this.add
            .text(width / 2 + 180, filterY, "All Maps", {
                fontSize: "14px",
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setName("mapFilterLabel");

        this.add
            .text(width / 2 + 280, filterY, "▶", buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setName("mapNextBtn")
            .on("pointerdown", () => {
                const mapCount = this.getAvailableMaps().length;
                this.currentMapIndex =
                    (this.currentMapIndex + 1) % (mapCount + 1);
                this.updateWorldMapFilter();
                this.loadLeaderboard();
            });

        // Reset button
        this.add
            .text(width - 100, filterY, "Reset All", {
                fontSize: "12px",
                color: "#ffffff",
                backgroundColor: "#663333",
                padding: { left: 8, right: 8, top: 4, bottom: 4 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.currentWorldIndex = 0;
                this.currentMapIndex = 0;
                this.updateWorldMapFilter();
                this.loadLeaderboard();
            });
    }

    private getAvailableMaps(): { id: number; name: string }[] {
        if (this.currentWorldIndex === 0) {
            // All worlds selected - return empty (no specific map selection available)
            return [];
        }
        const world = this.worldOptions[this.currentWorldIndex - 1];
        return world?.maps || [];
    }

    private updateWorldMapFilter() {
        const worldLabel = this.children.getByName(
            "worldFilterLabel",
        ) as Phaser.GameObjects.Text;
        const mapLabel = this.children.getByName(
            "mapFilterLabel",
        ) as Phaser.GameObjects.Text;
        const mapPrevBtn = this.children.getByName(
            "mapPrevBtn",
        ) as Phaser.GameObjects.Text;
        const mapNextBtn = this.children.getByName(
            "mapNextBtn",
        ) as Phaser.GameObjects.Text;

        // Update world label
        if (worldLabel) {
            if (this.currentWorldIndex === 0) {
                worldLabel.setText("All Worlds");
                this.filterWorldId = undefined;
            } else {
                const world = this.worldOptions[this.currentWorldIndex - 1];
                worldLabel.setText(`W${world.id}: ${world.name}`);
                this.filterWorldId = world.id;
            }
        }

        // Update map label and visibility
        const availableMaps = this.getAvailableMaps();
        const mapsDisabled = availableMaps.length === 0;

        if (mapLabel) {
            if (mapsDisabled) {
                mapLabel.setText("All Maps");
                mapLabel.setAlpha(0.5);
                this.filterMapId = undefined;
            } else if (this.currentMapIndex === 0) {
                mapLabel.setText("All Maps");
                mapLabel.setAlpha(1);
                this.filterMapId = undefined;
            } else {
                const map = availableMaps[this.currentMapIndex - 1];
                mapLabel.setText(map.name);
                mapLabel.setAlpha(1);
                this.filterMapId = map.id;
            }
        }

        // Disable/enable map buttons
        if (mapPrevBtn) mapPrevBtn.setAlpha(mapsDisabled ? 0.3 : 1);
        if (mapNextBtn) mapNextBtn.setAlpha(mapsDisabled ? 0.3 : 1);
    }

    private async loadLeaderboard() {
        if (this.isLoading) return;
        this.isLoading = true;

        // Clear previous entries - collect first, then destroy to avoid iteration issues
        const toDestroy: Phaser.GameObjects.GameObject[] = [];
        this.children.each((child) => {
            if (
                child.name?.startsWith("entry_") ||
                child.name === "noEntries"
            ) {
                toDestroy.push(child);
            }
        });
        toDestroy.forEach((child) => child.destroy());

        const loadingText = this.children.getByName(
            "loadingText",
        ) as Phaser.GameObjects.Text;
        if (loadingText) loadingText.setVisible(true);

        this.entries = await LeaderboardService.getLeaderboard({
            worldId: this.filterWorldId,
            mapId: this.filterMapId,
            isInfinite: this.filterInfinite,
            limit: 20,
        });

        if (loadingText) loadingText.setVisible(false);
        this.isLoading = false;

        this.displayEntries();
    }

    private displayEntries() {
        const { width, height } = this.scale;
        const startY = 170;
        const rowHeight = 28;
        const currentUser = UserService.username;

        if (this.entries.length === 0) {
            this.add
                .text(width / 2, height / 2, "No scores yet!", {
                    fontSize: "24px",
                    color: "#888888",
                })
                .setOrigin(0.5)
                .setName("noEntries");
            return;
        }

        // Header
        this.add
            .text(80, startY, "Rank", {
                fontSize: "14px",
                color: "#888888",
            })
            .setName("entry_header_rank");
        this.add
            .text(150, startY, "Player", {
                fontSize: "14px",
                color: "#888888",
            })
            .setName("entry_header_player");
        this.add
            .text(400, startY, "Wave", {
                fontSize: "14px",
                color: "#888888",
            })
            .setName("entry_header_wave");
        this.add
            .text(500, startY, "Kills", {
                fontSize: "14px",
                color: "#888888",
            })
            .setName("entry_header_kills");
        this.add
            .text(600, startY, "Score", {
                fontSize: "14px",
                color: "#888888",
            })
            .setName("entry_header_score");
        this.add
            .text(750, startY, "Map", {
                fontSize: "14px",
                color: "#888888",
            })
            .setName("entry_header_map");

        // Entries
        this.entries.forEach((entry, index) => {
            const y = startY + (index + 1) * rowHeight;
            const isCurrentUser = entry.username === currentUser;
            const color = isCurrentUser ? "#00ff00" : "#ffffff";

            // Rank medal
            let rankText = `${index + 1}`;
            if (index === 0) rankText = "🥇";
            else if (index === 1) rankText = "🥈";
            else if (index === 2) rankText = "🥉";

            this.add
                .text(80, y, rankText, { fontSize: "16px", color })
                .setName(`entry_${index}_rank`);
            this.add
                .text(150, y, entry.username, { fontSize: "16px", color })
                .setName(`entry_${index}_player`);
            this.add
                .text(400, y, entry.wave.toString(), {
                    fontSize: "16px",
                    color,
                })
                .setName(`entry_${index}_wave`);
            this.add
                .text(500, y, entry.kills.toString(), {
                    fontSize: "16px",
                    color,
                })
                .setName(`entry_${index}_kills`);
            this.add
                .text(600, y, entry.score.toString(), {
                    fontSize: "16px",
                    color,
                })
                .setName(`entry_${index}_score`);
            this.add
                .text(
                    750,
                    y,
                    entry.is_infinite
                        ? `W${entry.world_id}-M${entry.map_id} ♾️`
                        : `W${entry.world_id}-M${entry.map_id}`,
                    {
                        fontSize: "16px",
                        color,
                    },
                )
                .setName(`entry_${index}_map`);
        });
    }
}

