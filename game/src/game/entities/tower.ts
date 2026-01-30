import { Enemy } from "./enemy";
import { Game as GameScene } from "../scenes/Game";
import { TowerConfig, TowerInstanceConfig } from "../../config/towerConfig";

export enum TargetPriority {
    First = "first",
    Strongest = "strongest",
}

export abstract class Tower extends Phaser.GameObjects.Container {
    protected config: TowerInstanceConfig;
    protected level: number;
    protected _range: number;
    protected _fireRate: number;
    protected _damage: number;
    protected lastFired = 0;
    protected rangeCircle!: Phaser.GameObjects.Arc;
    protected isPreview: boolean;
    protected targetPriority: TargetPriority = TargetPriority.First;
    // UI Elements
    protected targetPriorityButton!: Phaser.GameObjects.Container;
    protected targetPriorityText!: Phaser.GameObjects.Text;
    protected sellButton!: Phaser.GameObjects.Container;
    protected sellText!: Phaser.GameObjects.Text;

    protected spriteBase: string;
    protected spriteWeapon: string;
    protected spriteProjectile: string;
    protected spriteImpact: string;

    // Original tile index for restoring after sell
    public originalTileIndex: number = 1;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        config: TowerConfig,
        level: number,
        isPreview: boolean,
    ) {
        super(scene, x, y);
        this.config = this.getTowerInstanceConfig(config, level);
        this.level = level;
        this._range = this.config.range;
        this._fireRate = this.config.fireRate;
        this._damage = this.config.damage;
        this.isPreview = isPreview;
        if (
            scene.layerHighground.getTileAtWorldXY(
                x,
                y + (this.config.offsetY ?? 32),
                false,
            )
        ) {
            this.range *= this.config.highgroundRangeMultiplier ?? 1.5;
        }

        // Create targeting priority button (only for non-preview towers)
        if (!isPreview) {
            this.createTargetPriorityButton(scene);
            this.createSellButton(scene);
        }
        this.spriteBase = this.getSpriteKey("base");
        this.spriteWeapon = this.getSpriteKey("weapon");
        this.spriteProjectile = this.getSpriteKey("projectile");
        this.spriteImpact = this.getSpriteKey("impact");
    }

    private getTowerInstanceConfig(
        config: TowerConfig,
        level: number,
    ): TowerInstanceConfig {
        const levelIndex = Math.max(
            0,
            Math.min(level - 1, config.levels.length - 1),
        );
        return {
            ...config.levels[levelIndex],
            id: config.id,
            name: config.name,
            spriteBase: config.spriteBase,
            level,
        };
    }

    private getSpriteKey(
        part: "base" | "weapon" | "projectile" | "impact",
    ): string {
        if (part === "base") {
            return `${this.config.spriteBase}${part}`;
        }
        return `${this.config.id}${this.config.level}${part}`;
    }

    private createTargetPriorityButton(scene: GameScene) {
        // Container for the button, positioned to the right of the tower
        this.targetPriorityButton = scene.add.container(this.x + 50, this.y);
        this.targetPriorityButton.setDepth(10000);
        this.targetPriorityButton.setVisible(false);

        // Frame background
        const frame = scene.add.graphics();
        frame.lineStyle(2, 0xffffff, 1);
        frame.fillStyle(0x000000, 0.7);
        frame.fillRoundedRect(-40, -14, 80, 28, 6);
        frame.strokeRoundedRect(-40, -14, 80, 28, 6);

        // Text
        this.targetPriorityText = scene.add.text(0, 0, "First", {
            fontSize: "12px",
            color: "#ffffff",
        });
        this.targetPriorityText.setOrigin(0.5, 0.5);

        // Hit area for clicking
        const hitArea = scene.add.rectangle(0, 0, 80, 28, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on("pointerdown", () => {
            this.toggleTargetPriority();
        });

        this.targetPriorityButton.add([
            frame,
            this.targetPriorityText,
            hitArea,
        ]);
    }

    private toggleTargetPriority() {
        const newPriority =
            this.targetPriority === TargetPriority.First
                ? TargetPriority.Strongest
                : TargetPriority.First;
        this.setTargetPriority(newPriority);
        this.updateTargetPriorityText();
    }

    private updateTargetPriorityText() {
        if (!this.targetPriorityText) return;
        const label =
            this.targetPriority === TargetPriority.First
                ? "First"
                : "Strongest";
        this.targetPriorityText.setText(label);
    }

    private createSellButton(scene: GameScene) {
        // Container for the sell button, positioned below the target priority button
        this.sellButton = scene.add.container(this.x + 50, this.y + 35);
        this.sellButton.setDepth(10000);
        this.sellButton.setVisible(false);

        const refundAmount = Math.floor(
            this.config.cost * (this.config.refundMultiplier ?? 0.5),
        );

        // Frame background (red-ish for sell)
        const frame = scene.add.graphics();
        frame.lineStyle(2, 0xff6666, 1);
        frame.fillStyle(0x000000, 0.7);
        frame.fillRoundedRect(-40, -14, 80, 28, 6);
        frame.strokeRoundedRect(-40, -14, 80, 28, 6);

        // Text
        this.sellText = scene.add.text(0, 0, `Sell (${refundAmount})`, {
            fontSize: "11px",
            color: "#ff6666",
        });
        this.sellText.setOrigin(0.5, 0.5);

        // Hit area for clicking
        const hitArea = scene.add.rectangle(0, 0, 80, 28, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on("pointerdown", () => {
            this.sell();
        });

        this.sellButton.add([frame, this.sellText, hitArea]);
    }

    private sell() {
        const scene = this.scene as GameScene;
        const refundAmount = Math.floor(
            this.config.cost * (this.config.refundMultiplier ?? 0.5),
        );

        // Refund money
        scene.money += refundAmount;

        // Restore buildable tile
        if (scene.layerBuildable) {
            const tileX = scene.layerBuildable.worldToTileX(this.x);
            const tileY = scene.layerBuildable.worldToTileY(
                this.y + (this.config.offsetY ?? 32),
            );
            if (tileX !== null && tileY !== null) {
                scene.layerBuildable.putTileAt(
                    this.originalTileIndex,
                    tileX,
                    tileY,
                );
            }
        }

        // Hide UI
        this.hideUi();

        // Remove from towers group
        scene.towers.remove(this, true, true);

        // Destroy UI elements
        this.targetPriorityButton?.destroy();
        this.sellButton?.destroy();
        this.rangeCircle?.destroy();

        // Deselect tower
        scene.selectedTower = undefined;

        // Destroy the tower
        this.destroy();
    }

    get range() {
        return this._range;
    }

    set range(value: number) {
        this._range = value;
    }

    get fireRate() {
        return this._fireRate;
    }

    get damage() {
        return this._damage;
    }

    showUi() {
        this.rangeCircle.setPosition(
            this.x,
            this.y + (this.config.offsetY ?? 32),
        );
        this.rangeCircle.setVisible(true);

        if (this.targetPriorityButton) {
            this.targetPriorityButton.setVisible(true);
        }
        if (this.sellButton) {
            this.sellButton.setVisible(true);
        }
    }

    hideUi() {
        this.rangeCircle.setVisible(false);

        if (this.targetPriorityButton) {
            this.targetPriorityButton.setVisible(false);
        }
        if (this.sellButton) {
            this.sellButton.setVisible(false);
        }
    }

    protected updateDepth() {
        // Set depth based on Y position for proper rendering order
        // Higher Y position = higher depth (rendered in front)
        const baseY = this.y + (this.config.offsetY ?? 32);
        this.depth = Math.floor(baseY) + 100;
    }

    protected canShoot(time: number): boolean {
        return !this.isPreview && time > this.lastFired + this.fireRate;
    }

    protected abstract createAnimations(): void;

    abstract update(
        time: number,
        delta: number,
        enemies: Phaser.GameObjects.Group,
    ): void;

    protected getTargets(
        enemies: Phaser.GameObjects.Group,
        radius?: number,
        position?: Phaser.Types.Math.Vector2Like,
        forTowerShot = true,
    ): Enemy[] {
        const searchRadius = radius ?? this.range;
        return enemies
            .getChildren()
            .filter((gameObject: Phaser.GameObjects.GameObject) => {
                const e = gameObject as Enemy;
                return (
                    Phaser.Math.Distance.Between(
                        position?.x ?? this.x,
                        position?.y ??
                            this.y +
                                (forTowerShot
                                    ? (this.config.offsetY ?? 32)
                                    : 0),
                        e.x,
                        e.y,
                    ) <= searchRadius && e.isAlive
                );
            }) as Enemy[];
    }

    protected getTarget(
        enemies: Phaser.GameObjects.Group,
        radius?: number,
        position?: Phaser.Types.Math.Vector2Like,
        ignoreList: Enemy[] = [],
        forTowerShot = true,
    ): Enemy | undefined {
        const targets = this.getTargets(
            enemies,
            radius,
            position,
            forTowerShot,
        ).filter((e) => !e.isGoingToDie && !ignoreList.includes(e));
        if (targets.length === 0) return undefined;

        switch (this.targetPriority) {
            case TargetPriority.Strongest:
                // Get the enemy with the highest health
                return targets.reduce((strongest, current) =>
                    current.hp > strongest.hp ? current : strongest,
                );
            case TargetPriority.First:
            default:
                // Get the enemy furthest along the path (highest progress)
                return targets.reduce((first, current) => {
                    return current.pathProgress > first.pathProgress
                        ? current
                        : first;
                });
        }
    }

    setTargetPriority(priority: TargetPriority): void {
        this.targetPriority = priority;
    }

    getTargetPriority(): TargetPriority {
        return this.targetPriority;
    }

    protected abstract shoot(target: Enemy): void;

    protected abstract spawnProjectile(target: Enemy): void;
}
