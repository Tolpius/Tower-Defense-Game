import { Enemy } from "./enemy";
import { Game as GameScene } from "../scenes/Game";
import {
    TowerConfig,
    TowerInstanceConfig,
    TOWER_CONFIGS,
} from "../../config/towerConfig";

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
    protected isActive: boolean = true;
    // UI Elements
    protected targetPriorityButton!: Phaser.GameObjects.Container;
    protected targetPriorityText!: Phaser.GameObjects.Text;
    protected sellButton!: Phaser.GameObjects.Container;
    protected sellText!: Phaser.GameObjects.Text;
    protected upgradeButton!: Phaser.GameObjects.Container;
    protected upgradeText!: Phaser.GameObjects.Text;

    protected spriteBase: string;
    protected spriteWeapon: string;
    protected spriteProjectile: string;
    protected spriteImpact: string;

    protected isUpgradeable: boolean;

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

        // Cheat: Infinite Range
        if (scene.infiniteRange) {
            this._range = 9999;
        }

        // Create targeting priority button (only for non-preview towers)
        if (!isPreview) {
            this.createTargetPriorityButton(scene);
            this.createSellButton(scene);
            this.createUpgradeButton(scene);
        }

        // Determine if tower is upgradeable
        this.isUpgradeable = level < config.levels.length;
        // Sprite keys
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

    /**
     * Calculate total cost invested in this tower (base cost + all upgrade costs)
     */
    private getTotalCost(): number {
        const towerConfig = TOWER_CONFIGS[this.config.id];
        let totalCost = 0;
        for (let i = 0; i < this.level; i++) {
            totalCost += towerConfig.levels[i].cost;
        }
        return totalCost;
    }

    private getSpriteKey(
        part: "base" | "weapon" | "projectile" | "impact",
    ): string {
        if (part === "base") {
            return `${this.config.spriteBase}${part}`;
        }
        return `${this.config.id}${this.config.level}${part}`;
    }

    /**
     * Berechnet den UI-Offset basierend auf der Tower-Position relativ zur Scene-Mitte
     */
    private getUiOffset(scene: GameScene): {
        x: number;
        y: number;
        baseY: number;
    } {
        const centerX = scene.scale.width / 2;
        const centerY = scene.scale.height / 2;

        // Wenn Tower rechts von der Mitte -> Buttons links, sonst rechts
        const offsetX = this.x > centerX ? -50 : 50;
        // Abstand zwischen Buttons (positiv = unten, negativ = oben)
        const offsetY = this.y > centerY ? -35 : 35;
        // Basis-Offset für alle Buttons gemeinsam (weiter unten wenn Tower in oberer Hälfte)
        const baseY = this.y > centerY ? 0 : 50;

        return { x: offsetX, y: offsetY, baseY };
    }

    private createTargetPriorityButton(scene: GameScene) {
        const offset = this.getUiOffset(scene);
        // Container for the button, positioned relative to tower based on screen position
        this.targetPriorityButton = scene.add.container(
            this.x + offset.x,
            this.y + offset.baseY,
        );
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
        const offset = this.getUiOffset(scene);
        // Container for the sell button, positioned relative to tower
        this.sellButton = scene.add.container(
            this.x + offset.x,
            this.y + offset.baseY + offset.y,
        );
        this.sellButton.setDepth(10000);
        this.sellButton.setVisible(false);

        const refundAmount = Math.floor(
            this.getTotalCost() * (this.config.refundMultiplier ?? 0.5),
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

    private createUpgradeButton(scene: GameScene) {
        const offset = this.getUiOffset(scene);
        // Container for the upgrade button, positioned relative to tower
        this.upgradeButton = scene.add.container(
            this.x + offset.x,
            this.y + offset.baseY + offset.y * 2,
        );
        this.upgradeButton.setDepth(10000);
        this.upgradeButton.setVisible(false);

        const nextLevelConfig =
            TOWER_CONFIGS[this.config.id].levels[this.level];
        const upgradeCost = nextLevelConfig?.cost ?? 0;

        // Frame background (green-ish for upgrade)
        const frame = scene.add.graphics();
        frame.lineStyle(2, 0x66ff66, 1);
        frame.fillStyle(0x000000, 0.7);
        frame.fillRoundedRect(-40, -14, 80, 28, 6);
        frame.strokeRoundedRect(-40, -14, 80, 28, 6);

        // Text
        this.upgradeText = scene.add.text(0, 0, `Upgrade (${upgradeCost})`, {
            fontSize: "11px",
            color: "#66ff66",
        });
        this.upgradeText.setOrigin(0.5, 0.5);

        // Hit area for clicking
        const hitArea = scene.add.rectangle(0, 0, 80, 28, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on("pointerdown", () => {
            this.upgrade();
        });

        this.upgradeButton.add([frame, this.upgradeText, hitArea]);
    }

    private upgrade() {
        const scene = this.scene as GameScene;
        const nextLevelConfig =
            TOWER_CONFIGS[this.config.id].levels[this.level];
        const upgradeCost = nextLevelConfig?.cost ?? 0;

        // Check if player has enough money
        if (scene.money < upgradeCost) {
            return;
        }

        // Deduct upgrade cost
        scene.money -= upgradeCost;

        // Store tower properties before destroying
        const towerType = this.config.id;
        const towerX = this.x;
        const towerY = this.y;
        const newLevel = this.level + 1;
        const originalTileIndex = this.originalTileIndex;
        const currentTargetPriority = this.targetPriority;

        // Destroy old tower without refund
        this.sell(false);

        // Use dynamic import to avoid circular dependency
        import("../factories/towerFactory").then(({ TowerFactory }) => {
            // Create new tower with higher level
            const newTower = TowerFactory.create(
                towerType,
                scene,
                towerX,
                towerY,
                newLevel,
                false,
            );
            newTower.originalTileIndex = originalTileIndex;
            newTower.setTargetPriority(currentTargetPriority);
            scene.towers.add(newTower);

            // Select the new tower
            scene.selectedTower = newTower;
            newTower.showUi();
        });
    }

    private sell(refundMoney = true) {
        // Mark tower as inactive immediately to prevent any new actions
        this.isActive = false;

        const scene = this.scene as GameScene;
        const refundAmount = Math.floor(
            this.getTotalCost() * (this.config.refundMultiplier ?? 0.5),
        );

        // Refund money
        if (refundMoney) {
            scene.money += refundAmount;
        }

        // Restore buildable tile
        if (scene.layerBuildable && refundMoney) {
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

        // Clean up any active animations and event listeners before destruction
        this.cleanupBeforeDestroy();

        // Remove from towers group
        scene.towers.remove(this, true, true);

        // Destroy UI elements
        this.targetPriorityButton?.destroy();
        this.sellButton?.destroy();
        this.upgradeButton?.destroy();
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
        if (this.upgradeButton && this.isUpgradeable) {
            this.upgradeButton.setVisible(true);
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
        if (this.upgradeButton) {
            this.upgradeButton.setVisible(false);
        }
    }

    protected updateDepth() {
        // Set depth based on Y position for proper rendering order
        // Higher Y position = higher depth (rendered in front)
        const baseY = this.y + (this.config.offsetY ?? 32);
        this.depth = Math.floor(baseY) + 100;
    }

    protected canShoot(time: number): boolean {
        return (
            this.isActive &&
            !this.isPreview &&
            time > this.lastFired + this.fireRate
        );
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

    /**
     * Override this method in subclasses to clean up animation listeners
     * and any other resources before the tower is destroyed.
     */
    protected abstract cleanupBeforeDestroy(): void;
    // Base implementation - subclasses should override

    protected abstract shoot(target: Enemy): void;

    protected abstract spawnProjectile(target: Enemy): void;
}

