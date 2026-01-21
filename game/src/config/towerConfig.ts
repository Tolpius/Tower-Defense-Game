export enum TowerType {
    Slingshot = "slingshot",
    Cannon = "cannon",
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
    turretSprite?: string;
    projectileSprite?: string;

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
        baseSprite: "tower3",
        turretSprite: "tower3turret1",
        projectileSprite: "tower3projectile1",
        description: "Medium single-target damage",
    },

    [TowerType.Cannon]: {
        id: TowerType.Cannon,
        name: "Cannon Tower",
        cost: 100,
        range: 160,
        fireRate: 2000,
        damage: 120,
        baseSprite: "cannonBase",
        turretSprite: "cannonTurret",
        projectileSprite: "cannonBall",
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
        turretSprite: "iceTowerTurret",
        projectileSprite: "iceShard",
        description: "Slows enemies",
    },
};