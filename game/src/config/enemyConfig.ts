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
    Firewasp = "firewasp",
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
        moneyOnDeath: 1,
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
        maxHp: 200,
        duration: 47000,
        moneyOnDeath: 5,
        damageToBase: 5,
        sideAnimationLeft: true,
    },
    [EnemyType.Clampbeetle]: {
        maxHp: 150,
        duration: 42000,
        moneyOnDeath: 5,
        damageToBase: 5,
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
        maxHp: 60,
        duration: 45000,
        moneyOnDeath: 2,
        damageToBase: 5,
        sideAnimationLeft: false,
    },
    [EnemyType.Firewasp]: {
        maxHp: 130,
        duration: 27000,
        moneyOnDeath: 4,
        damageToBase: 5,
        sideAnimationLeft: false,
    },
};

