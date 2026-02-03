import { isCheater } from "../scripts/cheats/CheaterState";

const STORAGE_KEY = "td_username";

export interface UserData {
    username: string | null;
    isGuest: boolean;
}

class UserServiceClass {
    private _username: string | null = null;
    private _isGuest: boolean = true;

    constructor() {
        this.load();
    }

    private load(): void {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this._username = stored;
            this._isGuest = false;
        } else {
            this._username = null;
            this._isGuest = true;
        }
    }

    get username(): string | null {
        return this._username;
    }

    get isGuest(): boolean {
        return this._isGuest;
    }

    get displayName(): string {
        return this._isGuest ? "Guest" : (this._username ?? "Guest");
    }

    setUsername(username: string): void {
        if (username.trim().length === 0) {
            return;
        }
        this._username = username.trim();
        this._isGuest = false;
        localStorage.setItem(STORAGE_KEY, this._username);
    }

    setGuest(): void {
        this._username = null;
        this._isGuest = true;
        localStorage.removeItem(STORAGE_KEY);
    }

    canSubmitScore(): boolean {
        return !this._isGuest && this._username !== null && !isCheater();
    }
}

// Singleton export
export const UserService = new UserServiceClass();

