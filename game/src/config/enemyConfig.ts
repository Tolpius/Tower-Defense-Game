export interface EnemyStats {
    maxHp: number;
    duration: number; // Zeit in ms, um den Pfad zu durchlaufen
    moneyOnDeath: number;
    damageToBase: number;
    sideAnimationLeft: boolean; //Defines wether the side animation sprite is looking left or right
}

export enum EnemyType {
    Scorpion = "scorpion",
    Leafbug = "leafbug",
    Firebug = "firebug",
    Magmacrab = "magmacrab",
    Clampbeetle = "clampbeetle",
    Flyinglocust = "flyinglocust",
    Voidbutterfly = "voidbutterfly",
}
export const ENEMY_CONFIG: Record<EnemyType, EnemyStats> = {
    [EnemyType.Scorpion]: {
        maxHp: 100,
        duration: 30000,
        moneyOnDeath: 10,
        damageToBase: 10,
        sideAnimationLeft: true,
    },
    [EnemyType.Leafbug]: {
        maxHp: 50,
        duration: 50000,
        moneyOnDeath: 5,
        damageToBase: 5,
        sideAnimationLeft: false,
    },
    [EnemyType.Firebug]: {
        maxHp: 50,
        duration: 50000,
        moneyOnDeath: 5,
        damageToBase: 5,
        sideAnimationLeft: false,
    },
        [EnemyType.Magmacrab]: {
        maxHp: 50,
        duration: 25000,
        moneyOnDeath: 5,
        damageToBase: 5,
        sideAnimationLeft: true,
    },
    [EnemyType.Clampbeetle]: {
        maxHp: 150,
        duration: 40000,
        moneyOnDeath: 15,
        damageToBase: 15,
        sideAnimationLeft: true,
    },
    [EnemyType.Flyinglocust]: {
        maxHp: 80,
        duration: 35000,
        moneyOnDeath: 8,
        damageToBase: 8,
        sideAnimationLeft: false,
    },
    [EnemyType.Voidbutterfly]: {
        maxHp: 120,
        duration: 45000,
        moneyOnDeath: 12,
        damageToBase: 12,
        sideAnimationLeft: false,
    },
};

