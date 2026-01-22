import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import SpriteSheetFavicon from "./SpriteSheetFavicon";
import WaveBuilder from "./WaveBuilder";

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
        <div id="app">
            <PhaserGame ref={phaserRef} />
        </div>
    );
}

export default App;
