export interface EnemyStats {
    maxHp: number;
    duration: number; // Zeit in ms, um den Pfad zu durchlaufen
    moneyOnDeath: number;
    damageToBase: number;
    sideAnimationLeft: boolean; //Defines wether the side animation sprite is looking left or right
}

export const ENEMY_CONFIG: Record<string, EnemyStats> = {
    scorpion: {
        maxHp: 100,
        duration: 40000,
        moneyOnDeath: 10,
        damageToBase: 10,
        sideAnimationLeft: true,
    },
    leafbug: {
        maxHp: 50,
        duration: 50000,
        moneyOnDeath: 5,
        damageToBase: 5,
        sideAnimationLeft: false
    },
};
