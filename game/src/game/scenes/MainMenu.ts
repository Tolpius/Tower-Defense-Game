import Phaser from "phaser";
import { EventBus } from "../EventBus";

export default class MainMenu extends Phaser.Scene {
    private logo!: Phaser.GameObjects.Image;
    private startButton!: Phaser.GameObjects.Text;
    private loginButton!: Phaser.GameObjects.Text;
    private logoutButton!: Phaser.GameObjects.Text;
    private authNameText!: Phaser.GameObjects.Text;
    private authNicknameText!: Phaser.GameObjects.Text;
    private authAvatar!: Phaser.GameObjects.Image;
    private authAvatarMask!: Phaser.Display.Masks.GeometryMask;
    private authAvatarBg!: Phaser.GameObjects.Rectangle;
    private skipText!: Phaser.GameObjects.Text;
    private introPlaying = true;
    private beetles: Phaser.GameObjects.Sprite[] = [];
    private isLoggedIn = false;
    private currentUserId: string | null = null;

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

        this.loginButton = this.add
            .text(width / 2, height / 2 + 150, "Login", {
                fontSize: "28px",
                color: "#fff",
                backgroundColor: "#444",
                padding: { left: 18, right: 18, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(3)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                EventBus.emit("auth-login-request");
            });

        this.logoutButton = this.add
            .text(width / 2, height / 2 + 150, "Logout", {
                fontSize: "28px",
                color: "#fff",
                backgroundColor: "#444",
                padding: { left: 18, right: 18, top: 8, bottom: 8 },
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(3)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                EventBus.emit("auth-logout-request");
            });

        const authMargin = 20;
        const avatarSize = 48;
        const avatarX = width - authMargin - avatarSize;
        const avatarY = authMargin;

        if (!this.textures.exists("avatar-placeholder")) {
            const placeholder = this.make.graphics({ x: 0, y: 0, add: false });
            placeholder.fillStyle(0xffffff);
            placeholder.fillRect(0, 0, 1, 1);
            placeholder.generateTexture("avatar-placeholder", 1, 1);
            placeholder.destroy();
        }

        this.authAvatarBg = this.add
            .rectangle(
                avatarX + avatarSize / 2,
                avatarY + avatarSize / 2,
                avatarSize,
                avatarSize,
                0x333333,
                0.8,
            )
            .setDepth(4)
            .setVisible(false);

        this.authAvatar = this.add
            .image(avatarX, avatarY, "avatar-placeholder")
            .setOrigin(0, 0)
            .setDisplaySize(avatarSize, avatarSize)
            .setDepth(4)
            .setVisible(false);

        const maskShape = this.make.graphics({ x: avatarX, y: avatarY, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillCircle(avatarSize / 2, avatarSize / 2, avatarSize / 2);
        this.authAvatarMask = maskShape.createGeometryMask();
        this.authAvatar.setMask(this.authAvatarMask);

        this.authNameText = this.add
            .text(avatarX - 12, avatarY, "", {
                fontSize: "20px",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: { left: 8, right: 8, top: 4, bottom: 4 },
            })
            .setOrigin(1, 0)
            .setDepth(4)
            .setVisible(false);

        this.authNicknameText = this.add
            .text(avatarX - 12, avatarY + 28, "Nickname: TBD", {
                fontSize: "16px",
                color: "#ddd",
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: { left: 8, right: 8, top: 2, bottom: 2 },
            })
            .setOrigin(1, 0)
            .setDepth(4)
            .setVisible(false);

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

        EventBus.on("auth-state", (user: { name?: string; email?: string } | null) => {
            this.isLoggedIn = !!user;
            if (user && "id" in user) {
                this.currentUserId = (user as { id?: string }).id ?? null;
            } else {
                this.currentUserId = null;
            }
            const label = user?.name || user?.email ? user.name ?? user.email : "";
            this.authNameText.setText(label ?? "");
            this.updateAuthButtons();

            if (this.isLoggedIn && user) {
                this.authAvatarBg.setVisible(true);
                this.authNameText.setVisible(true);
                this.authNicknameText.setVisible(true);

                const picture = (user as { picture?: string }).picture;
                if (picture && this.currentUserId) {
                    const key = `avatar-${this.currentUserId}`;
                    if (this.textures.exists(key)) {
                        this.authAvatar.setTexture(key).setVisible(true);
                    } else {
                        this.load.setCORS("anonymous");
                        this.load.image(key, picture);
                        this.load.once(`filecomplete-image-${key}`, () => {
                            this.authAvatar.setTexture(key).setVisible(true);
                        });
                        this.load.start();
                    }
                } else {
                    this.authAvatar.setTexture("avatar-placeholder").setVisible(true);
                }
            } else {
                this.authAvatarBg.setVisible(false);
                this.authAvatar.setVisible(false);
                this.authNameText.setVisible(false);
                this.authNicknameText.setVisible(false);
            }
        });
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

        this.loginButton.setPosition(width / 2, height / 2 + 150).setAlpha(1);
        this.logoutButton.setPosition(width / 2, height / 2 + 150).setAlpha(1);
        this.updateAuthButtons();

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
            this.loginButton.setPosition(width / 2, height / 2 + 150);
            this.logoutButton.setPosition(width / 2, height / 2 + 150);
            const authMargin = 20;
            const avatarSize = 48;
            const avatarX = width - authMargin - avatarSize;
            const avatarY = authMargin;
            this.authAvatar.setPosition(avatarX, avatarY);
            this.authAvatarBg.setPosition(avatarX + avatarSize / 2, avatarY + avatarSize / 2);
            this.authNameText.setPosition(avatarX - 12, avatarY);
            this.authNicknameText.setPosition(avatarX - 12, avatarY + 28);
        }

        this.skipText.setPosition(width / 2, height - 60);
    }

    private updateAuthButtons() {
        if (this.isLoggedIn) {
            this.loginButton.setVisible(false).disableInteractive();
            this.logoutButton.setVisible(true).setInteractive({ useHandCursor: true });
        } else {
            this.logoutButton.setVisible(false).disableInteractive();
            this.loginButton.setVisible(true).setInteractive({ useHandCursor: true });
        }
    }
}
