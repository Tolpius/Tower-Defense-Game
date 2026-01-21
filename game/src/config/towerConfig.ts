export enum TowerType {
    Slingshot = "slingshot",
    Catapult = "catapult",
    Ice = "ice",
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
        description: "Slow but heavy splash damage",
    },

    [TowerType.Ice]: {
        id: TowerType.Ice,
        name: "Ice Tower",
        cost: 80,
        range: 180,
        fireRate: 1500,
        damage: 10,
        baseSprite: "iceTowerBase",
        weaponSprite: "iceTowerweapon",
        projectileSprite: "iceShard",
        description: "Slows enemies",
    },
};
