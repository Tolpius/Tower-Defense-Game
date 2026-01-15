import Phaser from "phaser";

export default class MainMenu extends Phaser.Scene {
    private logo!: Phaser.GameObjects.Image;
    private startButton!: Phaser.GameObjects.Text;
    private introPlaying: boolean = true;
    private skipText!: Phaser.GameObjects.Text;
    private beetles: Phaser.GameObjects.Sprite[] = [];
    // Konfigurierbare Daten für jeden Käfer
    private beetleData = [
        {
            key: "leafbug",
            anim: "leafbug_walk",
            scale: 1,
            y: 320,
            frameRate: 10,
            frames: { start: 40, end: 47 }, // Beispiel, anpassen!
            flipX: true,
        },
        {
            key: "firebug",
            anim: "firebug_walk",
            scale: 1,
            y: 320,
            frameRate: 10,
            frames: { start: 55, end: 62 }, // Beispiel, anpassen!
            flipX: true,
        },
        {
            key: "firewasp",
            anim: "firewasp_walk",
            scale: 1,
            y: 320,
            frameRate: 10,
            frames: { start: 60, end: 67 }, // Beispiel, anpassen!
            flipX: true,
        },
    ];

    constructor() {
        super({ key: "MainMenu" });
    }

    create() {
        const { width, height } = this.scale;

        // Hintergrundbild einfügen (background.png, muss im Preloader geladen sein)
        // Hintergrundbild auf volle Scene-Größe skalieren
        this.add
            .image(width / 2, height / 2, "background")
            .setOrigin(0.5)
            .setDisplaySize(width, height)
            .setDepth(0);

        // Animations-Setups für alle Käfer (nur einmalig! Frames anpassen!)
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

        // Logo initial unsichtbar und klein, Startposition am rechten Rand
        const beetleSpacing = 70;

        this.logo = this.add
            .image(
                width + 100 + this.beetleData.length * beetleSpacing,
                this.beetleData[2].y,
                "logo"
            )
            .setAlpha(1)
            .setScale(0.2)
            .setDepth(1);

        // Start-Button und Skip-Text initial erzeugen, aber ausblenden
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

        // Käfer initialisieren (außerhalb des Screens rechts)

        this.beetles = [];
        this.beetleData.forEach((data, i) => {
            const beetle = this.add.sprite(
                width + 100 + i * beetleSpacing,
                data.y,
                data.key
            );
            beetle.setScale(data.scale);
            beetle.setAlpha(1);
            beetle.setDepth(2);
            beetle.play(data.anim);
            if (data.flipX) beetle.setFlipX(true);
            this.beetles.push(beetle);
        });

        // Intro-Animation starten
        this.playBeetleIntro();

        // Skip-Mechanismus
        this.input.once("pointerdown", () => this.skipIntro());
        this.input.keyboard!.once("keydown", () => this.skipIntro());

        // Responsivität
        this.scale.on("resize", this.resize, this);
    }

    playBeetleIntro() {
        const { width } = this.scale;
        const beetleSpacing = 70;
        const beetleSpeed = 1800;
        const beetleDelay = 300;
        const logoTargetX = width / 2;
        // Die Käfer laufen bis leicht links der Mitte
        const beetleStopX = logoTargetX - beetleSpacing;

        // Animation: Käfer laufen nacheinander los
        this.beetles.forEach((beetle, i) => {
            this.tweens.add({
                targets: beetle,
                x: beetleStopX + i * beetleSpacing,
                duration: beetleSpeed,
                delay: i * beetleDelay,
                ease: "Sine.easeInOut",
                onUpdate: () => {
                    // Logo folgt dem letzten Käfer, bleibt aber exakt in der Mitte stehen
                    if (i === this.beetles.length - 1) {
                        // Logo folgt, bleibt aber exakt mittig stehen
                        const logoFollowX = Math.min(
                            beetle.x + beetleSpacing,
                            logoTargetX
                        );
                        this.logo.x = logoFollowX;
                    }
                },
                onComplete: () => {
                    // Wenn letzter Käfer am Ziel ist, läuft das Logo ggf. noch den letzten Schritt in die Mitte
                    if (i === this.beetles.length - 1) {
                        this.logo.x = logoTargetX;
                        // Käfer laufen direkt weiter nach links raus
                        this.beetles.forEach((b, j) => {
                            this.tweens.add({
                                targets: b,
                                x: -100 - j * beetleSpacing,
                                duration: 800,
                                delay: j * 100,
                                onComplete: () => {
                                    if (j === this.beetles.length - 1) {
                                        this.introPlaying = false;
                                        this.showMenu();
                                    }
                                },
                            });
                        });
                    }
                },
            });
        });
    }

    startGame() {
        this.scene.start("Game");
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;
        this.logo.setPosition(width / 2, height / 2 - 100);
        if (this.startButton)
            this.startButton.setPosition(width / 2, height / 2 + 80);
        if (this.skipText) this.skipText.setPosition(width / 2, height - 60);
        // Optional: Käfer neu positionieren (nur falls nötig)
    }

    skipIntro() {
        // Animation sofort beenden, alle Tweens stoppen
        this.tweens.killAll();
        // Logo und Käfer direkt an Zielposition setzen
        const { width } = this.scale;
        const beetleSpacing = 70;
        const logoTargetX = width / 2;
        // Logo in die Mitte
        this.logo.x = logoTargetX;
        // Käfer ausblenden oder nach links raus setzen
        this.beetles.forEach((b, j) => {
            b.x = -100 - j * beetleSpacing;
        });
        this.introPlaying = false;
        this.showMenu();
    }

    showMenu() {
        // Logo groß und mittig
        const { width, height } = this.scale;
        this.logo.setPosition(width / 2, height / 2 - 100);
        this.logo.setScale(0.5);
        // Start-Button einblenden
        this.startButton.setAlpha(1);
        this.startButton.setInteractive({ useHandCursor: true });
        // Skip-Text ausblenden, falls noch sichtbar
        if (this.skipText) this.skipText.setVisible(false);
    }
}

