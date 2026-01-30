export enum TowerType {
    Slingshot = "slingshot",
    Catapult = "catapult",
    Crystal = "crystal",
}

export interface FrameRange {
    start: number;
    end: number;
}

export interface AnimationFrames {
    idle?: FrameRange;
    shoot?: FrameRange;
    projectile?: FrameRange;
    impact?: FrameRange;
}

export interface TowerLevelConfig {
    cost: number;
    range: number;
    impactRange?: number;
    highgroundRangeMultiplier: number;
    fireRate: number;
    damage: number;
    maxTargets?: number;
    offsetY?: number;
    refundMultiplier: number;
    description?: string;
    animationFrames?: AnimationFrames;
}

export interface TowerConfig {
    id: TowerType;
    name: string;
    spriteBase: string;
    levels: TowerLevelConfig[];
}

export interface TowerInstanceConfig extends TowerLevelConfig {
    id: TowerType;
    name: string;
    spriteBase: string;
    level: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
    [TowerType.Slingshot]: {
        id: TowerType.Slingshot,
        name: "Slingshot Tower",
        spriteBase: "slingshot",
        levels: [
            {
                cost: 30,
                range: 150,
                highgroundRangeMultiplier: 1.5,
                fireRate: 1200,
                damage: 50,
                offsetY: 32,
                refundMultiplier: 0.5,
                description: "Medium single-target damage",
                animationFrames: {
                    shoot: { start: 0, end: 7 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 5 },
                },
            },
            {
                cost: 50,
                range: 160,
                highgroundRangeMultiplier: 1.5,
                fireRate: 1100,
                damage: 65,
                offsetY: 32,
                refundMultiplier: 0.5,
                description: "Medium single-target damage",
                animationFrames: {
                    shoot: { start: 0, end: 7 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 5 },
                },
            },
            {
                cost: 80,
                range: 170,
                highgroundRangeMultiplier: 1.5,
                fireRate: 1000,
                damage: 85,
                offsetY: 32,
                refundMultiplier: 0.5,
                description: "Medium single-target damage",
                animationFrames: {
                    shoot: { start: 0, end: 7 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 5 },
                },
            },
        ],
    },

    [TowerType.Catapult]: {
        id: TowerType.Catapult,
        name: "Catapult Tower",
        spriteBase: "catapult",
        levels: [
            {
                cost: 100,
                range: 160,
                impactRange: 30,
                highgroundRangeMultiplier: 1.5,
                fireRate: 500,
                damage: 45,
                offsetY: 32,
                refundMultiplier: 0.5,
                description: "Slow but heavy splash damage",
                animationFrames: {
                    shoot: { start: 0, end: 16 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 8 },
                },
            },
            {
                cost: 150,
                range: 170,
                impactRange: 40,
                highgroundRangeMultiplier: 1.5,
                fireRate: 480,
                damage: 60,
                offsetY: 32,
                refundMultiplier: 0.5,
                description: "Slow but heavy splash damage",
                animationFrames: {
                    shoot: { start: 0, end: 16 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 8 },
                },
            },
            {
                cost: 220,
                range: 180,
                impactRange: 50,
                highgroundRangeMultiplier: 1.5,
                fireRate: 450,
                damage: 80,
                offsetY: 32,
                refundMultiplier: 0.5,
                description: "Slow but heavy splash damage",
                animationFrames: {
                    shoot: { start: 0, end: 16 },
                    projectile: { start: 0, end: 7 },
                    impact: { start: 0, end: 8 },
                },
            },
        ],
    },

    [TowerType.Crystal]: {
        id: TowerType.Crystal,
        name: "Crystal Tower",
        spriteBase: "crystal",
        levels: [
            {
                cost: 80,
                range: 150,
                impactRange: 100,
                highgroundRangeMultiplier: 1.5,
                fireRate: 1500,
                damage: 75,
                maxTargets: 2,
                offsetY: 64,
                refundMultiplier: 0.5,
                description: "Zaps an enemy... ouch!",
                animationFrames: {
                    idle: { start: 0, end: 9 },
                    shoot: { start: 16, end: 31 },
                    projectile: { start: 0, end: 4 },
                    impact: { start: 0, end: 4 },
                },
            },
            {
                cost: 120,
                range: 160,
                impactRange: 110,
                highgroundRangeMultiplier: 1.5,
                fireRate: 1400,
                damage: 95,
                maxTargets: 3,
                offsetY: 64,
                refundMultiplier: 0.5,
                description: "Zaps an enemy... ouch!",
                animationFrames: {
                    idle: { start: 0, end: 9 },
                    shoot: { start: 16, end: 31 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 5 },
                },
            },
            {
                cost: 180,
                range: 170,
                impactRange: 120,
                highgroundRangeMultiplier: 1.5,
                fireRate: 1300,
                damage: 120,
                maxTargets: 4,
                offsetY: 64,
                refundMultiplier: 0.5,
                description: "Zaps an enemy... ouch!",
                animationFrames: {
                    idle: { start: 0, end: 0 },
                    shoot: { start: 0, end: 7 },
                    projectile: { start: 0, end: 5 },
                    impact: { start: 0, end: 5 },
                },
            },
        ],
    },
};

