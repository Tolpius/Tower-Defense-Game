import { useEffect, useRef, useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import SpriteSheetFavicon from "./SpriteSheetFavicon";
import WaveBuilder from "./WaveBuilder";

type AuthUser = {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
};

type AuthResponse = {
    access_token: string;
    user: AuthUser;
};

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

    const authApiUrl = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:3000";
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

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

            localStorage.setItem("auth_token", data.access_token);
            setAuthUser(data.user);
        } catch (error) {
            setAuthError("Auth failed");
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
            <div
                style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    background: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    padding: "12px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                }}
            >
                {authUser ? (
                    <div>
                        <div style={{ fontWeight: 600 }}>{authUser.name ?? "Player"}</div>
                        <div style={{ opacity: 0.8 }}>{authUser.email ?? "Logged in"}</div>
                    </div>
                ) : (
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setAuthError("Google login failed")}
                    />
                )}
                {authError ? (
                    <div style={{ color: "#ffb3b3", marginTop: 8 }}>{authError}</div>
                ) : null}
            </div>
            <PhaserGame ref={phaserRef} />
        </div>
    );
}

export default App;
