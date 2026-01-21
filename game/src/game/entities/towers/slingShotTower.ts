import { Enemy } from "../enemy";
import { Game as GameScene } from "../../scenes/Game";
import {
    TOWER_CONFIGS,
    TowerConfig,
    TowerType,
} from "../../../config/towerConfig";
import { Tower } from "../tower";

export class SlingShotTower extends Tower {
    protected turret: Phaser.GameObjects.Sprite;
    protected config: TowerConfig;
    constructor(scene: GameScene, x: number, y: number, isPreview: boolean) {
        const config = TOWER_CONFIGS[TowerType.Slingshot];
        console.log(config)
        super(scene, x, y, config, isPreview);
        this.config = config;
        scene.add.existing(this);

        const towerBase = scene.add.sprite(0, 0, "tower3", 0);
        towerBase.setInteractive();
        towerBase.on("pointerdown", () => {
            scene.selectedTower?.hideRange();
            scene.selectedTower = this;
            this.showRange();
        });
        this.turret = scene.add.sprite(0, -16, "tower3turret1", 0);
        this.rangeCircle = scene.add.circle(
            0, // x relativ zum Tower
            32, // y relativ zum Tower (offset to account for tower visual position)
            this.range, // Radius
            0x00ff00, // Farbe (grün)
            0.25, // Alpha (transparent)
        );
        this.rangeCircle.setVisible(false).setDepth(9999); // Always render on top, independent of y position
        this.createAnimations();
        this.add([towerBase, this.turret]);
        this.updateDepth();
    }

    protected createAnimations(): void {
        const anims = this.scene.anims;
        if (!anims.exists(`tower3turret1-shoot`)) {
            anims.create({
                key: `tower3turret1-shoot`,
                frames: anims.generateFrameNumbers("tower3turret1", {
                    start: 0,
                    end: 7,
                }),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: 0,
            });
        }
        if (!anims.exists(`tower3projectile1-fly`)) {
            anims.create({
                key: `tower3projectile1-fly`,
                frames: anims.generateFrameNumbers("tower3projectile1", {
                    start: 0,
                    end: 5,
                }),
                frameRate: 12,
                repeat: -1,
            });
        }
        if (!anims.exists(`tower3projectile1-impact`)) {
            anims.create({
                key: `tower3projectile1-impact`,
                frames: anims.generateFrameNumbers("tower3projectile1impact", {
                    start: 0,
                    end: 5,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }
    }

    update(
        time: number,
        _delta: number,
        enemies: Phaser.GameObjects.Group,
    ): void {
        this.updateDepth();
        const target = this.getTarget(enemies);
        if (!target) return;

        this.turret.rotation =
            Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) + 90;
        if (!this.canShoot(time)) return;
        this.shoot(target);
        this.lastFired = time;
    }

    protected shoot(target: Enemy): void {
        this.turret.play(`tower3turret1-shoot`, true);
        const handler = (
            anim: Phaser.Animations.Animation,
            frame: Phaser.Animations.AnimationFrame,
        ) => {
            if (anim.key !== "tower3turret1-shoot") return;

            if (frame.index === 6 && target) {
                this.spawnProjectile(target);
                this.turret.off(
                    Phaser.Animations.Events.ANIMATION_UPDATE,
                    handler,
                );
            }
        };
        this.turret.on(Phaser.Animations.Events.ANIMATION_UPDATE, handler);

        // Reset to first frame after animation completes
        this.turret.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.turret.setFrame(0);
        });
    }

    protected spawnProjectile(target: Enemy): void {
        // Calculate muzzle position based on turret rotation
        // Offset is typically at the end of the barrel
        const muzzleDistance = 16; // Distance from tower center to muzzle
        const muzzleX =
            this.x + Math.cos(this.turret.rotation) * muzzleDistance;
        const muzzleY =
            this.y + Math.sin(this.turret.rotation) * muzzleDistance;

        const projectile = this.scene.add
            .sprite(muzzleX, muzzleY, "tower3projectile1", 0)
            .setDepth(1);
        projectile.play("tower3projectile1-fly");

        this.scene.tweens.add({
            targets: projectile,
            x: target.x,
            y: target.y,
            duration: 300,
            onComplete: () => {
                projectile.destroy();
                const impact = this.scene.add
                    .sprite(target.x, target.y, "tower3projectile1impact", 0)
                    .setDepth(1);
                impact.play("tower3projectile1-impact");
                if (target) {
                    target.takeDamage(this.damage);
                }
                impact.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    impact.destroy();
                });
            },
        });
    }
}

