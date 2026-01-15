import Phaser from "phaser";

export default class MainMenu extends Phaser.Scene {
    private logo!: Phaser.GameObjects.Image;
    private startButton!: Phaser.GameObjects.Text;
    private settingsButton!: Phaser.GameObjects.Text;
    private skipText!: Phaser.GameObjects.Text;
    private introPlaying = true;
    private beetles: Phaser.GameObjects.Sprite[] = [];

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
                        data.frames
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

        // Settings-Button (noch nicht klickbar)
        this.settingsButton = this.add
            .text(width / 2, height / 2 + 140, "Settings", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#222",
                padding: { left: 20, right: 20, top: 10, bottom: 10 },
            })
            .setOrigin(0.5)
            .setAlpha(0);

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

        // Settings-Button fade-in
        this.settingsButton
            .setPosition(width / 2, height / 2 + 150)
            .setAlpha(0)
            .setScale(1);
        this.tweens.add({
            targets: this.settingsButton,
            alpha: 1,
            duration: 500,
            delay: 400,
            ease: "Sine.easeOut",
        });

        this.skipText.setVisible(false);
    }

    startGame() {
        this.scene.start("Game");
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        if (!this.introPlaying) {
            this.logo.setPosition(width / 2, height / 2 - 100);
            this.startButton.setPosition(width / 2, height / 2 + 80);
            this.settingsButton.setPosition(width / 2, height / 2 + 140);
        }

        this.skipText.setPosition(width / 2, height - 60);
    }
}

