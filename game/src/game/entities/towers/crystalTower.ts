import { Enemy } from "../enemy";
import { Game as GameScene } from "../../scenes/Game";
import {
    TOWER_CONFIGS,
    TowerConfig,
    TowerType,
} from "../../../config/towerConfig";
import { Tower } from "../tower";

export class CrystalTower extends Tower {
    protected weapon: Phaser.GameObjects.Sprite;
    protected config: TowerConfig;
    constructor(scene: GameScene, x: number, y: number, isPreview: boolean) {
        const config = TOWER_CONFIGS[TowerType.Crystal];
        console.log(config);
        super(scene, x, y, config, isPreview);
        this.config = config;
        scene.add.existing(this);
        const towerBase = scene.add.sprite(0, 0, this.config.baseSprite, 0);
        towerBase.setInteractive();
        towerBase.on("pointerdown", () => {
            scene.selectedTower?.hideUi();
            scene.selectedTower = this;
            this.showUi();
        });
        this.weapon = scene.add.sprite(0, -16, this.config.weaponSprite!, 0);
        this.rangeCircle = scene.add.circle(
            0, // x relativ zum Tower
            32, // y relativ zum Tower (offset to account for tower visual position)
            this.range, // Radius
            0x00ff00, // Farbe (grün)
            0.25, // Alpha (transparent)
        );
        this.rangeCircle.setVisible(false).setDepth(9999); // Always render on top, independent of y position
        this.createAnimations();
        this.weapon.play(`${this.config.weaponSprite}-idle`);
        this.add([towerBase, this.weapon]);
        this.updateDepth();
    }

    protected createAnimations(): void {
        const anims = this.scene.anims;

        if (!anims.exists(`${this.config.weaponSprite}-idle`)) {
            anims.create({
                key: `${this.config.weaponSprite}-idle`,
                frames: anims.generateFrameNumbers(this.config.weaponSprite!, {
                    start: 0,
                    end: 9,
                }),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: -1,
            });
        }

        if (!anims.exists(`${this.config.weaponSprite}-shoot`)) {
            anims.create({
                key: `${this.config.weaponSprite}-shoot`,
                frames: anims.generateFrameNumbers(this.config.weaponSprite!, {
                    start: 16,
                    end: 31,
                }),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.config.projectileSprite}-fly`)) {
            anims.create({
                key: `${this.config.projectileSprite}-fly`,
                frames: anims.generateFrameNumbers(
                    this.config.projectileSprite!,
                    {
                        start: 0,
                        end: 4,
                    },
                ),
                frameRate: 12,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.config.impactSprite}`)) {
            anims.create({
                key: `${this.config.impactSprite}`,
                frames: anims.generateFrameNumbers(this.config.impactSprite!, {
                    start: 0,
                    end: 4,
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
        if (!this.canShoot(time)) return;
        if (target.hp <= this.damage) target.isGoingToDie = true;
        this.shoot(target);
        this.lastFired = time;
    }

    protected shoot(target: Enemy): void {
        // Remove any existing animation handlers to prevent multiple projectiles
        this.weapon.off(Phaser.Animations.Events.ANIMATION_UPDATE);

        this.weapon.play(`${this.config.weaponSprite}-shoot`, true);

        // Spawn cloud above the target
        const cloud = this.scene.add
            .sprite(target.x, target.y - 48, this.config.projectileSprite!)
            .setDepth(1);
        cloud.play(`${this.config.projectileSprite}-fly`);

        // When cloud animation finishes, spawn the impact projectile
        cloud.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            // Store target position at moment of firing
            const targetX = target.x;
            const targetY = target.y;

            // Calculate angle from cloud to target - 45 degrees offset
            const angle =
                Phaser.Math.Angle.Between(cloud.x, cloud.y, targetX, targetY) -
                Math.PI / 4;

            // Spawn impact at cloud position
            const impact = this.scene.add
                .sprite(cloud.x, cloud.y, this.config.impactSprite!)
                .setDepth(1)
                .setRotation(angle);
            impact.play(`${this.config.impactSprite}`);

            cloud.destroy();

            // Fly impact down to target
            this.scene.tweens.add({
                targets: impact,
                x: targetX,
                y: targetY,
                duration: 150,
                onComplete: () => {
                    if (target && target.isAlive) {
                        target.takeDamage(this.damage);
                    }
                    impact.once(
                        Phaser.Animations.Events.ANIMATION_COMPLETE,
                        () => {
                            impact.destroy();
                        },
                    );
                    // If animation already finished during tween, destroy now
                    if (!impact.anims.isPlaying) {
                        impact.destroy();
                    }
                },
            });
        });

        // Reset weapon to idle after shoot animation completes
        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.weapon.play(`${this.config.weaponSprite}-idle`);
        });
    }

    // Not used for CrystalTower - projectile logic is handled in shoot()
    protected spawnProjectile(_target: Enemy): void {
        // Crystal tower handles projectile spawning directly in shoot()
    }
}

