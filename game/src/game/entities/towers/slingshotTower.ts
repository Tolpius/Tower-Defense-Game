import { Enemy } from "../enemy";
import { Game as GameScene } from "../../scenes/Game";
import { TOWER_CONFIGS, TowerType } from "../../../config/towerConfig";
import { Tower } from "../tower";

export class SlingShotTower extends Tower {
    protected weapon: Phaser.GameObjects.Sprite;
    constructor(
        scene: GameScene,
        x: number,
        y: number,
        level: number,
        isPreview: boolean,
    ) {
        const config = TOWER_CONFIGS[TowerType.Slingshot];
        super(scene, x, y, config, level, isPreview);
        scene.add.existing(this);

        const towerBase = scene.add.sprite(
            0,
            0,
            this.spriteBase,
            this.level - 1,
        );
        towerBase.setInteractive();
        towerBase.on("pointerdown", () => {
            scene.selectedTower?.hideUi();
            scene.selectedTower = this;
            this.showUi();
        });
        this.weapon = scene.add.sprite(0, -16, this.spriteWeapon, 0);
        this.rangeCircle = scene.add.circle(
            0, // x relativ zum Tower
            32, // y relativ zum Tower (offset to account for tower visual position)
            this.range, // Radius
            0x00ff00, // Farbe (grün)
            0.25, // Alpha (transparent)
        );
        this.rangeCircle.setVisible(false).setDepth(9999); // Always render on top, independent of y position
        this.createAnimations();
        this.add([towerBase, this.weapon]);
        this.updateDepth();
    }

    protected createAnimations(): void {
        const anims = this.scene.anims;
        if (!anims.exists(`${this.spriteWeapon}-shoot`)) {
            anims.create({
                key: `${this.spriteWeapon}-shoot`,
                frames: anims.generateFrameNumbers(
                    this.spriteWeapon!,
                    this.config.animationFrames?.shoot,
                ),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.spriteProjectile}-fly`)) {
            anims.create({
                key: `${this.spriteProjectile}-fly`,
                frames: anims.generateFrameNumbers(
                    this.spriteProjectile!,
                    this.config.animationFrames?.projectile,
                ),
                frameRate: 12,
                repeat: -1,
            });
        }
        if (!anims.exists(`${this.spriteImpact}`)) {
            anims.create({
                key: `${this.spriteImpact}`,
                frames: anims.generateFrameNumbers(
                    this.spriteImpact!,
                    this.config.animationFrames?.impact,
                ),
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

        this.weapon.rotation =
            Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) + 90;
        if (!this.canShoot(time)) return;
        if (target.hp <= this.damage) target.isGoingToDie = true;
        this.shoot(target);
        this.lastFired = time;
    }

    protected shoot(target: Enemy): void {
        this.weapon.play(`${this.spriteWeapon}-shoot`, true);
        const handler = (
            anim: Phaser.Animations.Animation,
            frame: Phaser.Animations.AnimationFrame,
        ) => {
            if (anim.key !== `${this.spriteWeapon}-shoot`) return;

            if (frame.index === 6 && target) {
                this.spawnProjectile(target);
                this.weapon.off(
                    Phaser.Animations.Events.ANIMATION_UPDATE,
                    handler,
                );
            }
        };
        this.weapon.on(Phaser.Animations.Events.ANIMATION_UPDATE, handler);

        // Reset to first frame after animation completes
        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.weapon.setFrame(0);
        });
    }

    protected spawnProjectile(target: Enemy): void {
        // Calculate muzzle position based on weapon rotation
        // Offset is typically at the end of the barrel
        const muzzleDistance = 16; // Distance from tower center to muzzle
        const muzzleX =
            this.x + Math.cos(this.weapon.rotation) * muzzleDistance;
        const muzzleY =
            this.y + Math.sin(this.weapon.rotation) * muzzleDistance;

        const projectile = this.scene.add
            .sprite(muzzleX, muzzleY, this.spriteProjectile!, 0)
            .setDepth(Math.floor(muzzleY) + 75);
        projectile.play(`${this.spriteProjectile}-fly`);

        this.scene.tweens.add({
            targets: projectile,
            x: target.x,
            y: target.y,
            duration: 300,
            onUpdate: () => {
                projectile.setDepth(Math.floor(projectile.y) + 75);
            },
            onComplete: () => {
                projectile.destroy();
                const impact = this.scene.add
                    .sprite(target.x, target.y, this.spriteImpact!, 0)
                    .setDepth(Math.floor(target.y) + 75);
                impact.play(`${this.spriteImpact}`);
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
