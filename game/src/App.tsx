import { useEffect, useRef, useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import SpriteSheetFavicon from "./SpriteSheetFavicon";
import WaveBuilder from "./WaveBuilder";
import { AuthUser, AuthResponse, authStorage, fetchMe } from "./auth";
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
    const [activeSceneKey, setActiveSceneKey] = useState<string | null>(null);
    const [showLoginOverlay, setShowLoginOverlay] = useState(false);

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

        EventBus.on("auth-login-request", handleLoginRequest);
        EventBus.on("auth-logout-request", handleLogoutRequest);

        return () => {
            EventBus.off("auth-login-request", handleLoginRequest);
            EventBus.off("auth-logout-request", handleLogoutRequest);
        };
    }, []);

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
            <PhaserGame
                ref={phaserRef}
                currentActiveScene={(scene) => setActiveSceneKey(scene.scene.key)}
            />
        </div>
    );
}

export default App;
