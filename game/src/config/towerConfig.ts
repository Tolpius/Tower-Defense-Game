export enum TowerType {
    Slingshot = "slingshot",
    Catapult = "catapult",
    Crystal = "crystal",
}

export interface TowerConfig {
    id: TowerType;
    name: string;
    cost: number;

    range: number;
    fireRate: number;
    damage: number;

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
        range: 150,
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
        range: 160,
        fireRate: 500,
        damage: 120,
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
        range: 180,
        fireRate: 1500,
        damage: 10,
        baseSprite: "crystal1base",
        weaponSprite: "crystal1weapon",
        projectileSprite: "crystal1projectile",
        impactSprite: "crystal1impact",
        offsetY: 64,
        description: "Zaps an enemy... ouch!",
    },
};

