import { useState } from "react";
import { EnemyType } from "./config/enemyConfig";

interface Spawn {
    enemyType: string;
    delay: number;
}

interface Wave {
    id: number;
    spawns: Spawn[];
}

const ENEMIES = Object.values(EnemyType);

const ENEMY_COLORS: Record<string, string> = {
    [EnemyType.Scorpion]: "#8B4513",
    [EnemyType.Leafbug]: "#228B22",
    [EnemyType.Firebug]: "#FF4500",
    [EnemyType.Magmacrab]: "#DC143C",
    [EnemyType.Clampbeetle]: "#4169E1",
    [EnemyType.Flyinglocust]: "#9ACD32",
    [EnemyType.Voidbutterfly]: "#9932CC",
};

function WaveBuilder() {
    const [waves, setWaves] = useState<Wave[]>([{ id: 1, spawns: [] }]);
    const [activeWaveIndex, setActiveWaveIndex] = useState(0);
    const [defaultDelay, setDefaultDelay] = useState(500);
    const [jsonOutput, setJsonOutput] = useState("");

    const activeWave = waves[activeWaveIndex];

    const addEnemy = (enemyType: string) => {
        const newSpawn: Spawn = {
            enemyType,
            delay: activeWave.spawns.length === 0 ? 0 : defaultDelay,
        };

        setWaves((prev) =>
            prev.map((wave, idx) =>
                idx === activeWaveIndex
                    ? { ...wave, spawns: [...wave.spawns, newSpawn] }
                    : wave,
            ),
        );
    };

    const removeEnemy = (spawnIndex: number) => {
        setWaves((prev) =>
            prev.map((wave, idx) =>
                idx === activeWaveIndex
                    ? {
                          ...wave,
                          spawns: wave.spawns.filter(
                              (_, i) => i !== spawnIndex,
                          ),
                      }
                    : wave,
            ),
        );
    };

    const updateDelay = (spawnIndex: number, newDelay: number) => {
        setWaves((prev) =>
            prev.map((wave, idx) =>
                idx === activeWaveIndex
                    ? {
                          ...wave,
                          spawns: wave.spawns.map((spawn, i) =>
                              i === spawnIndex
                                  ? { ...spawn, delay: newDelay }
                                  : spawn,
                          ),
                      }
                    : wave,
            ),
        );
    };

    const addWave = () => {
        const newId = waves.length + 1;
        setWaves((prev) => [...prev, { id: newId, spawns: [] }]);
        setActiveWaveIndex(waves.length);
    };

    const removeWave = (waveIndex: number) => {
        if (waves.length <= 1) return;

        setWaves((prev) => {
            const newWaves = prev.filter((_, idx) => idx !== waveIndex);
            // Reindex wave IDs
            return newWaves.map((wave, idx) => ({ ...wave, id: idx + 1 }));
        });

        if (activeWaveIndex >= waves.length - 1) {
            setActiveWaveIndex(Math.max(0, waves.length - 2));
        } else if (waveIndex < activeWaveIndex) {
            setActiveWaveIndex(activeWaveIndex - 1);
        }
    };

    const clearWave = () => {
        setWaves((prev) =>
            prev.map((wave, idx) =>
                idx === activeWaveIndex ? { ...wave, spawns: [] } : wave,
            ),
        );
    };

    const generateJson = () => {
        const output = waves.map((wave) => ({
            id: wave.id,
            spawns: wave.spawns,
        }));
        setJsonOutput(JSON.stringify(output, null, 4));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonOutput);
    };

    return (
        <div className="wave-builder">
            <header className="wave-builder-header">
                <a href="/" className="back-link">
                    ← Back to Game
                </a>
                <h1>Wave Builder</h1>
            </header>

            <div className="wave-builder-content">
                {/* Enemy Buttons */}
                <section className="enemy-section">
                    <h2>Enemies</h2>
                    <div className="enemy-buttons">
                        {ENEMIES.map((enemy) => (
                            <button
                                key={enemy}
                                className="enemy-button"
                                style={{
                                    backgroundColor:
                                        ENEMY_COLORS[enemy] || "#666",
                                }}
                                onClick={() => addEnemy(enemy)}
                            >
                                {enemy}
                            </button>
                        ))}
                    </div>
                    <div className="delay-setting">
                        <label>
                            Default Delay (ms):
                            <input
                                type="number"
                                value={defaultDelay}
                                onChange={(e) =>
                                    setDefaultDelay(Number(e.target.value))
                                }
                                min={0}
                                step={50}
                            />
                        </label>
                    </div>
                </section>

                {/* Wave Tabs */}
                <section className="waves-section">
                    <h2>Waves</h2>
                    <div className="wave-tabs">
                        {waves.map((wave, idx) => (
                            <div
                                key={wave.id}
                                className={`wave-tab ${idx === activeWaveIndex ? "active" : ""}`}
                            >
                                <button
                                    className="wave-tab-btn"
                                    onClick={() => setActiveWaveIndex(idx)}
                                >
                                    Wave {wave.id} ({wave.spawns.length})
                                </button>
                                {waves.length > 1 && (
                                    <button
                                        className="wave-tab-remove"
                                        onClick={() => removeWave(idx)}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="add-wave-btn" onClick={addWave}>
                            + Add Wave
                        </button>
                    </div>
                </section>

                {/* Current Wave Spawns */}
                <section className="spawns-section">
                    <div className="spawns-header">
                        <h2>Wave {activeWave.id} Spawns</h2>
                        <button className="clear-btn" onClick={clearWave}>
                            Clear Wave
                        </button>
                    </div>
                    <div className="spawns-list">
                        {activeWave.spawns.length === 0 ? (
                            <p className="empty-message">
                                Click an enemy button above to add spawns
                            </p>
                        ) : (
                            activeWave.spawns.map((spawn, idx) => (
                                <div key={idx} className="spawn-item">
                                    <span className="spawn-index">
                                        {idx + 1}.
                                    </span>
                                    <span
                                        className="spawn-enemy"
                                        style={{
                                            backgroundColor:
                                                ENEMY_COLORS[spawn.enemyType] ||
                                                "#666",
                                        }}
                                    >
                                        {spawn.enemyType}
                                    </span>
                                    <label className="spawn-delay">
                                        Delay:
                                        <input
                                            type="number"
                                            value={spawn.delay}
                                            onChange={(e) =>
                                                updateDelay(
                                                    idx,
                                                    Number(e.target.value),
                                                )
                                            }
                                            min={0}
                                            step={50}
                                        />
                                        ms
                                    </label>
                                    <button
                                        className="remove-spawn-btn"
                                        onClick={() => removeEnemy(idx)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Export Section */}
                <section className="export-section">
                    <button className="generate-btn" onClick={generateJson}>
                        Generate JSON
                    </button>
                    {jsonOutput && (
                        <div className="json-output">
                            <div className="json-header">
                                <h3>Output (paste into waves array)</h3>
                                <button
                                    className="copy-btn"
                                    onClick={copyToClipboard}
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                            <pre>{jsonOutput}</pre>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default WaveBuilder;

