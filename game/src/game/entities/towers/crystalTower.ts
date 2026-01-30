import { Enemy } from "../enemy";
import { Game, Game as GameScene } from "../../scenes/Game";
import { TOWER_CONFIGS, TowerType } from "../../../config/towerConfig";
import { Tower } from "../tower";

export class CrystalTower extends Tower {
    protected weapon: Phaser.GameObjects.Sprite;
    constructor(
        scene: GameScene,
        x: number,
        y: number,
        level: number,
        isPreview: boolean,
    ) {
        const config = TOWER_CONFIGS[TowerType.Crystal];
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
        this.weapon.play(`${this.spriteWeapon}-idle`);
        this.add([towerBase, this.weapon]);
        this.updateDepth();
    }

    protected createAnimations(): void {
        const anims = this.scene.anims;

        if (!anims.exists(`${this.spriteWeapon}-idle`)) {
            anims.create({
                key: `${this.spriteWeapon}-idle`,
                frames: anims.generateFrameNumbers(
                    this.spriteWeapon,
                    this.config.animationFrames?.idle,
                ),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: -1,
            });
        }

        if (!anims.exists(`${this.spriteWeapon}-shoot`)) {
            anims.create({
                key: `${this.spriteWeapon}-shoot`,
                frames: anims.generateFrameNumbers(
                    this.spriteWeapon,
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
                    this.spriteProjectile,
                    this.config.animationFrames?.projectile,
                ),
                frameRate: 12,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.spriteImpact}`)) {
            anims.create({
                key: `${this.spriteImpact}`,
                frames: anims.generateFrameNumbers(
                    this.spriteImpact,
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
        if (!this.canShoot(time)) return;
        if (target.hp <= this.damage) target.isGoingToDie = true;
        this.shoot(target);
        this.lastFired = time;
    }

    protected shoot(target: Enemy): void {
        // Remove any existing animation handlers to prevent multiple projectiles
        this.weapon.off(Phaser.Animations.Events.ANIMATION_UPDATE);
        let ignoreList: Enemy[] = [];

        this.weapon.play(`${this.spriteWeapon}-shoot`, true);

        // Spawn cloud above the target
        const cloud = this.scene.add
            .sprite(target.x, target.y - 48, this.spriteProjectile)
            .setDepth(Math.floor(target.y - 48) + 75);
        cloud.play(`${this.spriteProjectile}-fly`);

        // When cloud animation finishes, spawn the impact projectile
        cloud.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            cloud.destroy();
            this.lightningShot({ x: cloud.x, y: cloud.y }, ignoreList, target);
        });

        // Reset weapon to idle after shoot animation completes
        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.weapon.play(`${this.spriteWeapon}-idle`);
        });
    }

    private lightningShot(
        origin: { x: number; y: number },
        ignoreList: Enemy[],
        target: Enemy | undefined = undefined,
    ): void {
        //If there is no target provided, get a new one
        if (!target) {
            target = this.getTarget(
                (this.scene as Game).enemies,
                this.config.impactRange,
                origin,
                ignoreList,
                false,
            );
        }
        // if there are no valid targets or max targets reached, return
        if (!target || ignoreList.length >= this.config.maxTargets!) {
            return;
        }
        ignoreList.push(target);
        const targetX = target.x;
        const targetY = target.y;

        // Calculate angle from cloud to target - 45 degrees offset
        const angle =
            Phaser.Math.Angle.Between(origin.x, origin.y, targetX, targetY) -
            Math.PI / 4;

        // Spawn impact at cloud position
        const impact = this.scene.add
            .sprite(origin.x, origin.y, this.spriteImpact)
            .setDepth(Math.floor(origin.y) + 75)
            .setRotation(angle);
        impact.play(`${this.spriteImpact}`);

        // Fly impact down to target
        this.scene.tweens.add({
            targets: impact,
            x: targetX,
            y: targetY,
            duration: 150,
            onUpdate: () => {
                impact.setDepth(Math.floor(impact.y) + 75);
            },
            onComplete: () => {
                if (target && target.isAlive) {
                    target.takeDamage(this.damage);
                }
                impact.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    impact.destroy();
                });
                // If animation already finished during tween, destroy now
                if (!impact.anims.isPlaying) {
                    impact.destroy();
                }
                this.lightningShot(target, ignoreList);
            },
        });
    }

    // Not used for CrystalTower - projectile logic is handled in shoot()
    protected spawnProjectile(_target: Enemy): void {
        // Crystal tower handles projectile spawning directly in shoot()
    }
}
