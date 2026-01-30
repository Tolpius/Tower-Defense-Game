export enum TowerType {
    Slingshot = "slingshot",
    Catapult = "catapult",
    Crystal = "crystal",
}

export interface TowerConfig {
    id: TowerType;
    name: string;
    cost: number;
    refundMultiplier: number;

    range: number;
    impactRange?: number;
    highgroundRangeMultiplier: number;
    fireRate: number;
    damage: number;
    maxTargets?: number;

    baseSprite: string;
    weaponSprite?: string;
    projectileSprite?: string;
    impactSprite?: string;

    offsetY?: number;

    description?: string;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
    [TowerType.Slingshot]: {
        id: TowerType.Slingshot,
        name: "Slingshot Tower",
        cost: 30,
        refundMultiplier: 0.5,
        range: 150,
        highgroundRangeMultiplier: 1.5,
        fireRate: 1200,
        damage: 50,
        baseSprite: "slingshot1base",
        weaponSprite: "slingshot1weapon",
        projectileSprite: "slingshot1projectile",
        impactSprite: "slingshot1impact",
        offsetY: 32,
        description: "Medium single-target damage",
    },

    [TowerType.Catapult]: {
        id: TowerType.Catapult,
        name: "Catapult Tower",
        cost: 100,
        refundMultiplier: 0.5,
        range: 160,
        impactRange: 30,
        highgroundRangeMultiplier: 1.5,
        fireRate: 500,
        damage: 45,
        baseSprite: "catapult1base",
        weaponSprite: "catapult1weapon",
        projectileSprite: "catapult1projectile",
        impactSprite: "catapult1impact",
        offsetY: 32,
        description: "Slow but heavy splash damage",
    },

    [TowerType.Crystal]: {
        id: TowerType.Crystal,
        name: "Crystal Tower",
        cost: 80,
        refundMultiplier: 0.5,
        range: 150,
        impactRange: 50,
        highgroundRangeMultiplier: 1.5,
        fireRate: 1500,
        damage: 75,
        maxTargets: 2,
        baseSprite: "crystal1base",
        weaponSprite: "crystal1weapon",
        projectileSprite: "crystal1projectile",
        impactSprite: "crystal1impact",
        offsetY: 64,
        description: "Zaps an enemy... ouch!",
    },
};

