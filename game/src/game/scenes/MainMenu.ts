import Phaser from "phaser";
import { UserService } from "../services/UserService";

export default class MainMenu extends Phaser.Scene {
    private logo!: Phaser.GameObjects.Image;
    private startButton!: Phaser.GameObjects.Text;
    private leaderboardButton!: Phaser.GameObjects.Text;
    private usernameButton!: Phaser.GameObjects.Text;
    private skipText!: Phaser.GameObjects.Text;
    private introPlaying = true;
    private beetles: Phaser.GameObjects.Sprite[] = [];
    private usernameDialog?: Phaser.GameObjects.Container;

    private beetleData = [
        {
            key: "leafbug",
            anim: "leafbug_walk",
            scale: 1,
            y: 320,
            frameRate: 10,
            frames: { start: 40, end: 47 },
            flipX: true,
        },
        {
            key: "firebug",
            anim: "firebug_walk",
            scale: 1,
            y: 320,
            frameRate: 10,
            frames: { start: 55, end: 62 },
            flipX: true,
        },
        {
            key: "firewasp",
            anim: "firewasp_walk",
            scale: 1,
            y: 320,
            frameRate: 10,
            frames: { start: 60, end: 67 },
            flipX: true,
        },
    ];

    constructor() {
        super({ key: "MainMenu" });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add
            .image(width / 2, height / 2, "background")
            .setDisplaySize(width, height)
            .setDepth(0);

        // Animations
        this.beetleData.forEach((data) => {
            if (!this.anims.exists(data.anim)) {
                this.anims.create({
                    key: data.anim,
                    frames: this.anims.generateFrameNumbers(
                        data.key,
                        data.frames,
                    ),
                    frameRate: data.frameRate,
                    repeat: -1,
                });
            }
        });

        // UI (hidden initially)
        this.startButton = this.add
            .text(width / 2, height / 2 + 80, "Start Game", {
                fontSize: "40px",
                color: "#fff",
                backgroundColor: "#222",
                padding: { left: 24, right: 24, top: 12, bottom: 12 },
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.startGame());

        this.skipText = this.add
            .text(width / 2, height - 60, "Click or key: Skip intro", {
                fontSize: "20px",
                color: "#fff",
                backgroundColor: "#222",
                padding: { left: 12, right: 12, top: 6, bottom: 6 },
            })
            .setOrigin(0.5)
            .setAlpha(0.7);

        // Create beetles (positions set in intro)
        this.beetles = this.beetleData.map((data) => {
            const b = this.add.sprite(0, data.y, data.key);
            b.setScale(data.scale);
            b.setDepth(2);
            b.play(data.anim);
            if (data.flipX) b.setFlipX(true);
            return b;
        });

        // Logo
        this.logo = this.add
            .image(0, this.beetleData[0].y, "logo")
            .setScale(0.2)
            .setDepth(1);

        this.playIntro();

        // Skip
        this.input.once("pointerdown", this.skipIntro, this);
        this.input.keyboard!.once("keydown", this.skipIntro, this);

        this.scale.on("resize", this.resize, this);
    }

    playIntro() {
        const { width } = this.scale;

        const spacing = 80; // etwas mehr Abstand
        const duration = 1800;
        const beetleDelay = 120; // individueller Delay für leichten Versatz

        const groupSize = this.beetles.length + 1;
        const groupWidth = spacing * (groupSize - 1);

        const groupStartX = width + 100;
        const logoTargetX = width / 2;
        const groupTargetX = logoTargetX - groupWidth;

        // Start positions (tight formation)
        this.beetles.forEach((b, i) => {
            b.x = groupStartX + i * spacing;
        });
        this.logo.x = groupStartX + groupWidth;

        // Move group: Käfer mit individuellem Delay und Ease
        this.beetles.forEach((b, i) => {
            this.tweens.add({
                targets: b,
                x: groupTargetX + i * spacing,
                duration,
                delay: i * beetleDelay,
                ease: "Sine.easeInOut",
            });
        });

        // Logo fährt synchron mit der Gruppe ein (Delay wie letzter Käfer)
        this.tweens.add({
            targets: this.logo,
            x: logoTargetX,
            duration,
            delay: (this.beetles.length - 1) * beetleDelay,
            ease: "Sine.easeInOut",
            onComplete: () => this.releaseBeetles(),
        });
    }

    releaseBeetles() {
        const spacing = 70;

        this.beetles.forEach((b, i) => {
            this.tweens.add({
                targets: b,
                x: -200 + i * spacing,
                duration: 800,
                ease: "Sine.easeIn",
                onComplete: () => {
                    if (i === this.beetles.length - 1) {
                        // Logo smooth morphen (groß & an finale Menü-Position)
                        const { width, height } = this.scale;
                        this.tweens.add({
                            targets: this.logo,
                            x: width / 2,
                            y: height / 2 - 100,
                            scale: 0.5,
                            duration: 700,
                            ease: "Sine.easeInOut",
                            onComplete: () => {
                                this.introPlaying = false;
                                this.showMenu();
                            },
                        });
                    }
                },
            });
        });
    }

    skipIntro() {
        this.tweens.killAll();

        const { width, height } = this.scale;
        const spacing = 70;

        this.logo.setPosition(width / 2, height / 2 - 100).setScale(0.5);

        this.beetles.forEach((b, i) => {
            b.x = -200 - i * spacing;
        });

        this.introPlaying = false;
        this.showMenu();
    }

    showMenu() {
        const { width, height } = this.scale;

        this.logo.setPosition(width / 2, height / 2 - 100).setScale(0.5);

        // Start-Button bouncig einblenden
        this.startButton
            .setPosition(width / 2, height / 2 + 80)
            .setAlpha(0)
            .setScale(0.1)
            .setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: this.startButton,
            alpha: 1,
            scale: 1,
            duration: 600,
            ease: "Bounce.easeOut",
        });

        // Leaderboard Button
        this.leaderboardButton = this.add
            .text(width / 2, height / 2 + 140, "🏆 Leaderboard", {
                fontSize: "24px",
                color: "#ffd700",
                backgroundColor: "#222",
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.scene.start("Leaderboard"));

        this.tweens.add({
            targets: this.leaderboardButton,
            alpha: 1,
            duration: 400,
            delay: 200,
        });

        // Username Button (top right)
        this.usernameButton = this.add
            .text(width - 20, 20, `👤 ${UserService.displayName}`, {
                fontSize: "16px",
                color: UserService.isGuest ? "#888888" : "#00ff00",
                backgroundColor: "#222",
                padding: { left: 10, right: 10, top: 5, bottom: 5 },
            })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.showUsernameDialog());

        this.skipText.setVisible(false);
    }

    startGame() {
        this.scene.start("WorldSelector");
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        if (!this.introPlaying) {
            this.logo.setPosition(width / 2, height / 2 - 100);
            this.startButton.setPosition(width / 2, height / 2 + 80);
            this.leaderboardButton?.setPosition(width / 2, height / 2 + 140);
            this.usernameButton?.setPosition(width - 20, 20);
        }

        this.skipText.setPosition(width / 2, height - 60);
    }

    private showUsernameDialog() {
        if (this.usernameDialog) return;

        const { width, height } = this.scale;

        this.usernameDialog = this.add.container(width / 2, height / 2);
        this.usernameDialog.setDepth(1000);

        // Background overlay
        const overlay = this.add
            .rectangle(0, 0, width, height, 0x000000, 0.8)
            .setInteractive();
        overlay.on("pointerdown", () => this.closeUsernameDialog());

        // Dialog box
        const dialogBg = this.add
            .rectangle(0, 0, 400, 250, 0x222222, 1)
            .setStrokeStyle(2, 0xffffff);

        // Title
        const title = this.add
            .text(0, -90, "Set Username", {
                fontSize: "24px",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        // Current username display
        const currentLabel = this.add
            .text(0, -50, `Current: ${UserService.displayName}`, {
                fontSize: "16px",
                color: "#888888",
            })
            .setOrigin(0.5);

        // Input instruction
        const instruction = this.add
            .text(0, -15, "Enter new username:", {
                fontSize: "14px",
                color: "#aaaaaa",
            })
            .setOrigin(0.5);

        // Input field background
        const inputBg = this.add
            .rectangle(0, 20, 300, 40, 0x333333, 1)
            .setStrokeStyle(1, 0x666666);

        // Input text (simulated - we'll use DOM input)
        const inputText = this.add
            .text(0, 20, UserService.username || "", {
                fontSize: "18px",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        // Create DOM input element
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 20;
        input.value = UserService.username || "";
        input.placeholder = "Enter username...";
        input.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -20px);
            width: 280px;
            height: 36px;
            font-size: 18px;
            text-align: center;
            background: #333;
            color: #fff;
            border: 1px solid #666;
            border-radius: 4px;
            outline: none;
        `;
        document.getElementById("game-container")?.appendChild(input);
        input.focus();

        // Hide the simulated input text
        inputText.setVisible(false);

        // Save button
        const saveButton = this.add
            .text(-70, 80, "Save", {
                fontSize: "18px",
                color: "#00ff00",
                backgroundColor: "#333",
                padding: { left: 20, right: 20, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                const newUsername = input.value.trim();
                if (newUsername.length > 0) {
                    UserService.setUsername(newUsername);
                    this.updateUsernameButton();
                }
                input.remove();
                this.closeUsernameDialog();
            });

        // Guest button
        const guestButton = this.add
            .text(70, 80, "Guest", {
                fontSize: "18px",
                color: "#888888",
                backgroundColor: "#333",
                padding: { left: 20, right: 20, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                UserService.setGuest();
                this.updateUsernameButton();
                input.remove();
                this.closeUsernameDialog();
            });

        // Store input reference for cleanup
        this.usernameDialog.setData("input", input);

        this.usernameDialog.add([
            overlay,
            dialogBg,
            title,
            currentLabel,
            instruction,
            inputBg,
            inputText,
            saveButton,
            guestButton,
        ]);
    }

    private closeUsernameDialog() {
        if (this.usernameDialog) {
            const input = this.usernameDialog.getData(
                "input",
            ) as HTMLInputElement;
            input?.remove();
            this.usernameDialog.destroy();
            this.usernameDialog = undefined;
        }
    }

    private updateUsernameButton() {
        if (this.usernameButton) {
            this.usernameButton.setText(`👤 ${UserService.displayName}`);
            this.usernameButton.setColor(
                UserService.isGuest ? "#888888" : "#00ff00",
            );
        }
    }
}

