import { useEffect, useRef, useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import SpriteSheetFavicon from "./SpriteSheetFavicon";
import WaveBuilder from "./WaveBuilder";
import {
    AuthApiError,
    AuthUser,
    AuthResponse,
    authStorage,
    fetchMe,
    updateNickname,
} from "./auth";
import { EventBus } from "./game/EventBus";

function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    useEffect(() => {
        let faviconAnimator: SpriteSheetFavicon | null = null;
        faviconAnimator = new SpriteSheetFavicon(
            {
                src: "/favicon.png",
                frameCount: 8,
                frameWidth: 32,
                interval: 100,
            },
            () => {
                faviconAnimator?.start();
            },
        );

        return () => faviconAnimator?.stop();
    }, []);

    const authApiUrl = import.meta.env.VITE_AUTH_API_URL ?? window.location.origin;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [nicknameError, setNicknameError] = useState<string | null>(null);
    const [nicknameValue, setNicknameValue] = useState("");
    const [isNicknameSaving, setIsNicknameSaving] = useState(false);
    const [activeSceneKey, setActiveSceneKey] = useState<string | null>(null);
    const [showLoginOverlay, setShowLoginOverlay] = useState(false);
    const [showNicknameOverlay, setShowNicknameOverlay] = useState(false);

    useEffect(() => {
        const token = authStorage.get();
        if (!token) {
            return;
        }
        fetchMe(authApiUrl, token)
            .then((data) => setAuthUser(data.user))
            .catch(() => authStorage.clear());
    }, [authApiUrl]);

    useEffect(() => {
        const handleLoginRequest = () => {
            setShowLoginOverlay(true);
        };
        const handleLogoutRequest = () => {
            handleLogout();
        };
        const handleNicknameEditRequest = () => {
            if (!authUser) {
                return;
            }
            setNicknameError(null);
            setNicknameValue(authUser.nickname ?? "");
            setShowNicknameOverlay(true);
        };
        const handleAuthStateRequest = () => {
            EventBus.emit("auth-state", authUser);
        };

        EventBus.on("auth-login-request", handleLoginRequest);
        EventBus.on("auth-logout-request", handleLogoutRequest);
        EventBus.on("auth-nickname-edit-request", handleNicknameEditRequest);
        EventBus.on("auth-request-state", handleAuthStateRequest);

        return () => {
            EventBus.off("auth-login-request", handleLoginRequest);
            EventBus.off("auth-logout-request", handleLogoutRequest);
            EventBus.off("auth-nickname-edit-request", handleNicknameEditRequest);
            EventBus.off("auth-request-state", handleAuthStateRequest);
        };
    }, [authUser]);

    useEffect(() => {
        EventBus.emit("auth-state", authUser);
    }, [authUser]);

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        try {
            setAuthError(null);
            if (!response.credential) {
                setAuthError("Google login failed: missing credential");
                return;
            }

            const res = await fetch(`${authApiUrl}/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ credential: response.credential }),
            });

            const data = (await res.json()) as AuthResponse;
            if (!res.ok) {
                setAuthError(data?.access_token ? "Auth failed" : "Auth failed");
                return;
            }

            authStorage.set(data.access_token);
            setAuthUser(data.user);
            setShowLoginOverlay(false);
        } catch (error) {
            setAuthError("Auth failed");
        }
    };

    const handleLogout = () => {
        authStorage.clear();
        setAuthUser(null);
        setShowNicknameOverlay(false);
        setNicknameError(null);
    };

    const mapNicknameError = (error: unknown): string => {
        if (error instanceof AuthApiError) {
            if (error.status === 409 || error.message === "Nickname is already taken") {
                return "Dieser Nickname ist bereits vergeben.";
            }
            if (
                error.status === 400 &&
                error.message === "Nickname must contain only letters and numbers"
            ) {
                return "Nickname darf nur Buchstaben und Zahlen enthalten.";
            }
            if (
                error.status === 400 &&
                (error.message === "Nickname must not be empty" ||
                    error.message === "Nickname must be a string")
            ) {
                return "Bitte einen Nickname eingeben.";
            }
            if (error.status === 401) {
                return "Session abgelaufen. Bitte erneut einloggen.";
            }
        }
        return "Nickname konnte nicht gespeichert werden.";
    };

    const handleNicknameSave = async () => {
        try {
            const token = authStorage.get();
            if (!token) {
                setNicknameError("Session abgelaufen. Bitte erneut einloggen.");
                return;
            }

            setIsNicknameSaving(true);
            setNicknameError(null);

            const data = await updateNickname(authApiUrl, token, nicknameValue);
            setAuthUser(data.user);
            setShowNicknameOverlay(false);
        } catch (error) {
            setNicknameError(mapNicknameError(error));
        } finally {
            setIsNicknameSaving(false);
        }
    };

    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    // Simple routing
    if (currentPath === "/wavebuilder") {
        return <WaveBuilder />;
    }

    return (
        <div id="app" style={{ position: "relative" }}>
            {showLoginOverlay ? (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                        background: "rgba(0, 0, 0, 0.6)",
                        color: "#fff",
                        padding: "12px 14px",
                        borderRadius: 8,
                        fontSize: 14,
                    }}
                >
                    {googleClientId ? (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setAuthError("Google login failed")}
                        />
                    ) : (
                        <div style={{ marginBottom: 8 }}>
                            Missing `VITE_GOOGLE_CLIENT_ID` in build env.
                        </div>
                    )}
                    {authError ? (
                        <div style={{ color: "#ffb3b3", marginTop: 8 }}>{authError}</div>
                    ) : null}
                    <button
                        onClick={() => setShowLoginOverlay(false)}
                        style={{
                            marginTop: 8,
                            background: "transparent",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.4)",
                            borderRadius: 6,
                            padding: "6px 10px",
                            cursor: "pointer",
                            width: "100%",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            ) : null}
            {showNicknameOverlay ? (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "#fff",
                        padding: "12px 14px",
                        borderRadius: 8,
                        fontSize: 14,
                        minWidth: 280,
                    }}
                >
                    <div style={{ marginBottom: 8 }}>Nickname bearbeiten</div>
                    <input
                        value={nicknameValue}
                        onChange={(event) => setNicknameValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                void handleNicknameSave();
                            }
                        }}
                        autoFocus
                        maxLength={24}
                        style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid rgba(255,255,255,0.4)",
                            background: "rgba(0,0,0,0.3)",
                            color: "#fff",
                            boxSizing: "border-box",
                        }}
                    />
                    {nicknameError ? (
                        <div style={{ color: "#ffb3b3", marginTop: 8 }}>{nicknameError}</div>
                    ) : null}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button
                            onClick={() => {
                                setShowNicknameOverlay(false);
                                setNicknameError(null);
                            }}
                            disabled={isNicknameSaving}
                            style={{
                                flex: 1,
                                background: "transparent",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.4)",
                                borderRadius: 6,
                                padding: "6px 10px",
                                cursor: "pointer",
                            }}
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={() => void handleNicknameSave()}
                            disabled={isNicknameSaving}
                            style={{
                                flex: 1,
                                background: "#3d8b3d",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "6px 10px",
                                cursor: "pointer",
                            }}
                        >
                            {isNicknameSaving ? "Speichert..." : "Speichern"}
                        </button>
                    </div>
                </div>
            ) : null}
            <PhaserGame
                ref={phaserRef}
                currentActiveScene={(scene) => setActiveSceneKey(scene.scene.key)}
            />
        </div>
    );
}

export default App;
