import { Scene } from "phaser";
import { UserService } from "../services/UserService";
import { LeaderboardService } from "../services/LeaderboardService";

export class GameOver extends Scene {
    private worldId!: number;
    private mapId!: number;
    private wave!: number;
    private kills!: number;
    private isInfiniteMode!: boolean;
    private scoreSubmitted = false;

    constructor() {
        super({ key: "GameOver" });
    }
    init(data: {
        worldId: number;
        mapId: number;
        wave?: number;
        kills?: number;
        isInfiniteMode?: boolean;
    }) {
        this.worldId = data.worldId;
        this.mapId = data.mapId;
        this.wave = data.wave ?? 1;
        this.kills = data.kills ?? 0;
        this.isInfiniteMode = data.isInfiniteMode ?? false;
        this.scoreSubmitted = false;
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.add
            .text(width / 2, height / 2 - 100, "Game Over", {
                fontSize: "48px",
                color: "#fff",
            })
            .setOrigin(0.5);

        // Score display
        const score = LeaderboardService.calculateScore(this.wave, this.kills);
        this.add
            .text(
                width / 2,
                height / 2 - 50,
                `Wave: ${this.wave}  |  Kills: ${this.kills}  |  Score: ${score}`,
                {
                    fontSize: "20px",
                    color: "#ffd700",
                },
            )
            .setOrigin(0.5);

        // Submit score if user is logged in
        this.submitScore(score);

        this.add
            .text(width / 2, height / 2, "Restart", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#B22222",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.scene.stop("GameOver");
                this.scene.start("Game", {
                    worldId: this.worldId,
                    mapId: this.mapId,
                });
                this.scene.launch("UI");
            });

        this.add
            .text(width / 2, height / 2 + 60, "Back to Main Menu", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#222",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.scene.stop("GameOver");
                this.scene.start("MainMenu");
            });
    }

    private async submitScore(score: number) {
        if (this.scoreSubmitted) return;
        if (!UserService.canSubmitScore()) return;

        this.scoreSubmitted = true;
        const success = await LeaderboardService.submitScore({
            username: UserService.username!,
            world_id: this.worldId,
            map_id: this.mapId,
            is_infinite: this.isInfiniteMode,
            wave: this.wave,
            kills: this.kills,
            score,
        });

        if (success) {
            console.log("Score submitted successfully!");
        }
    }
}

