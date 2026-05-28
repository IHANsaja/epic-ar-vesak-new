"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const PRESET_WISHES = [
    {
        id: "peace",
        label: "🕊️ Peace & Harmony",
        text: "May the serene light of Vesak fill your heart and home with eternal peace, harmony, and happiness."
    },
    {
        id: "wisdom",
        label: "🪔 Wisdom & Light",
        text: "Wishing you the sacred blessings of Buddha: a path of truth, wisdom, and inner light to guide your journey."
    },
    {
        id: "compassion",
        label: "🌸 Compassion & Joy",
        text: "May Gautama Buddha bless your life with boundless compassion, deep joy, and mindful well-being."
    }
];

export default function ARScene() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [started, setStarted] = useState(false);
    const [userName, setUserName] = useState("");
    const [selectedWishId, setSelectedWishId] = useState("peace");
    const [wishText, setWishText] = useState(PRESET_WISHES[0].text);
    const [sparks, setSparks] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

    useEffect(() => {
        const generatedSparks = Array.from({ length: 22 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 7}s`,
            duration: `${6 + Math.random() * 6}s`,
            size: `${4 + Math.random() * 6}px`,
        }));
        setSparks(generatedSparks);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement
            );
            if (!isFullscreen && started) {
                setStarted(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, [started]);

    const handleStart = async () => {
        try {
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                await docEl.requestFullscreen();
            } else if ((docEl as any).webkitRequestFullscreen) {
                await (docEl as any).webkitRequestFullscreen();
            } else if ((docEl as any).mozRequestFullScreen) {
                await (docEl as any).mozRequestFullScreen();
            } else if ((docEl as any).msRequestFullscreen) {
                await (docEl as any).msRequestFullscreen();
            }
        } catch (err) {
            console.warn("Fullscreen request skipped or blocked:", err);
        }
        setStarted(true);
    };

    const handleExit = async () => {
        try {
            if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                } else if ((document as any).mozCancelFullScreen) {
                    await (document as any).mozCancelFullScreen();
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen();
                }
            }
        } catch (err) {
            console.warn("Exit fullscreen failed:", err);
        }
        setStarted(false);
    };

    // =========================
    // MindAR + Three.js AR SCENE
    // =========================
    useEffect(() => {
        if (!started || !containerRef.current) return;

        let mindarThree: any;

        const start = async () => {
            const { MindARThree } = await import(
                "mind-ar/dist/mindar-image-three.prod.js"
            );

            mindarThree = new MindARThree({
                container: containerRef.current,
                imageTargetSrc: "/targets/vesak.mind",
                filterMinCF: 0.0001,
                filterBeta: 0.001,
                missTolerance: 10,
                warmupTolerance: 5,
            });

            const { renderer, scene, camera } = mindarThree;

            // LIGHTS
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2);
            scene.add(hemiLight);

            const pointLight = new THREE.PointLight(0xffffff, 2.5, 12);
            pointLight.position.set(0, 1.5, 0);
            scene.add(pointLight);

            // COLOUR CYCLE
            const festiveColors = [
                new THREE.Color("#ff3333"),
                new THREE.Color("#ffaa00"),
                new THREE.Color("#00ff66"),
                new THREE.Color("#3366ff"),
            ];

            let colorIndex = 0;
            let nextColorIndex = 1;
            let lerpT = 0;

            // ANCHOR
            const anchor = mindarThree.addAnchor(0);

            // Model container — rotated so model stands upright on marker
            const modelContainer = new THREE.Group();
            modelContainer.rotation.x = Math.PI / 2;
            anchor.group.add(modelContainer);

            // =========================
            // LOCK MODEL ON FIRST DETECTION
            // =========================
            let modelLocked = false;

            anchor.onTargetFound = () => {
                // Only lock once — ignore all subsequent detections
                if (modelLocked) return;

                // Decompose the anchor's current world matrix to get
                // exact position + rotation in 3D world space
                const worldPos = new THREE.Vector3();
                const worldQuat = new THREE.Quaternion();
                const worldScale = new THREE.Vector3();

                anchor.group.matrixWorld.decompose(worldPos, worldQuat, worldScale);

                // Detach modelContainer from the anchor group
                anchor.group.remove(modelContainer);

                // Place it directly in the scene at the locked world position
                modelContainer.position.copy(worldPos);
                modelContainer.quaternion.copy(worldQuat);
                scene.add(modelContainer);

                modelLocked = true;
                console.log("✅ Model locked at world position:", worldPos);
            };

            // LOAD MODEL
            const loader = new GLTFLoader();
            loader.load(
                "/models/VLSSL.glb",
                (gltf: any) => {
                    const model = gltf.scene;

                    model.scale.set(1.2, 1.2, 1.2);

                    // Auto-align model base flush with marker ground plane
                    const box = new THREE.Box3().setFromObject(model);
                    const center = new THREE.Vector3();
                    box.getCenter(center);

                    model.position.x = -center.x;
                    model.position.z = -center.z;
                    model.position.y = -box.min.y;

                    modelContainer.add(model);

                    // Collect sub-lanterns
                    const subLanterns: THREE.Object3D[] = [];
                    model.traverse((obj: THREE.Object3D) => {
                        if (obj.name.toLowerCase().startsWith("sublantern")) {
                            subLanterns.push(obj);
                        }
                    });

                    console.log("SUB LANTERNS:", subLanterns.length);

                    // RENDER LOOP
                    renderer.setAnimationLoop(() => {
                        // Whole model rotates together
                        model.rotation.y += 0.005;

                        // Sub-lanterns spin on own Y axis only
                        subLanterns.forEach((lantern: THREE.Object3D) => {
                            lantern.rotation.y += 0.020;
                        });

                        // Colour light cycle
                        lerpT += 0.008;
                        if (lerpT >= 1) {
                            lerpT = 0;
                            colorIndex = nextColorIndex;
                            nextColorIndex = (nextColorIndex + 1) % festiveColors.length;
                        }

                        pointLight.color.lerpColors(
                            festiveColors[colorIndex],
                            festiveColors[nextColorIndex],
                            lerpT
                        );

                        renderer.render(scene, camera);
                    });
                }
            );

            await mindarThree.start();
        };

        start();

        return () => {
            if (mindarThree) {
                mindarThree.stop();
            }
        };
    }, [started]);

    // =========================
    // AR VIEW SCREEN
    // =========================
    if (started) {
        return (
            <div
                ref={containerRef}
                className="ar-container"
                style={{
                    width: "100vw",
                    height: "100vh",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 9999,
                    backgroundColor: "#000000",
                }}
            >
                <style>{`
                    .ar-container video,
                    .ar-container canvas {
                        max-width: none !important;
                        max-height: none !important;
                    }

                    .ar-btn-back {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        z-index: 10000;
                        padding: 12px 20px;
                        font-family: 'Outfit', sans-serif;
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                        background: rgba(10, 5, 20, 0.6);
                        backdrop-filter: blur(8px);
                        border: 1px solid rgba(212, 175, 55, 0.3);
                        border-radius: 30px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                    }

                    .ar-btn-back:hover {
                        background: rgba(212, 175, 55, 0.2);
                        border-color: #d4af37;
                        transform: translateY(-2px);
                    }

                    .ar-wishing-overlay {
                        position: absolute;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 10000;
                        width: 90%;
                        max-width: 420px;
                        background: rgba(10, 5, 20, 0.7);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                        border: 1px solid rgba(212, 175, 55, 0.35);
                        border-radius: 20px;
                        padding: 16px 20px;
                        display: flex;
                        gap: 15px;
                        align-items: center;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
                        animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        font-family: 'Outfit', sans-serif;
                    }

                    .ar-overlay-icon {
                        font-size: 28px;
                        filter: drop-shadow(0 2px 8px rgba(212,175,55,0.6));
                        animation: floatIcon 3s ease-in-out infinite;
                    }

                    .ar-overlay-content { flex: 1; }

                    .ar-overlay-title {
                        font-size: 16px;
                        font-weight: 700;
                        color: #f3e5ab;
                        margin: 0 0 4px 0;
                        letter-spacing: 0.5px;
                    }

                    .ar-overlay-text {
                        font-size: 13px;
                        color: #e0e0e0;
                        margin: 0;
                        line-height: 1.4;
                        font-style: italic;
                        font-weight: 300;
                    }

                    @keyframes slideUp {
                        from { transform: translate(-50%, 40px); opacity: 0; }
                        to { transform: translate(-50%, 0); opacity: 1; }
                    }

                    @keyframes floatIcon {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                `}</style>

                <button className="ar-btn-back" onClick={handleExit}>
                    <span>← Exit AR</span>
                </button>

                <div className="ar-wishing-overlay">
                    <div className="ar-overlay-icon">🪔</div>
                    <div className="ar-overlay-content">
                        <h3 className="ar-overlay-title">
                            Happy Vesak{userName ? `, ${userName}` : ""}! ✨
                        </h3>
                        <p className="ar-overlay-text">" {wishText} "</p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================
    // WELCOME / WISHING SCREEN
    // =========================
    return (
        <div className="vesak-intro-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Cinzel:wght@600;700;800&display=swap');

                .vesak-intro-container {
                    width: 100vw;
                    height: 100vh;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background: radial-gradient(circle at center, #1b0f32 0%, #060211 100%);
                    color: #ffffff;
                    font-family: 'Outfit', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    z-index: 999;
                }

                .vesak-sparks-bg {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: 1;
                }

                .vesak-spark {
                    position: absolute;
                    bottom: -20px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(254,204,40,0.85) 0%, rgba(212,175,55,0) 70%);
                    box-shadow: 0 0 10px rgba(254,204,40,0.6);
                    opacity: 0;
                    animation: floatUp 8s ease-in-out infinite;
                }

                @keyframes floatUp {
                    0% { transform: translateY(0) translateX(0) scale(0.6); opacity: 0; }
                    10% { opacity: 0.75; }
                    90% { opacity: 0.75; }
                    100% { transform: translateY(-115vh) translateX(60px) scale(0.3); opacity: 0; }
                }

                .vesak-card {
                    width: 90%;
                    max-width: 460px;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(212, 175, 55, 0.25);
                    border-radius: 28px;
                    padding: 30px 24px;
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.65), 0 0 30px rgba(212,175,55,0.05) inset;
                    text-align: center;
                    z-index: 2;
                    animation: cardFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow-y: auto;
                    max-height: 95vh;
                }

                @keyframes cardFadeIn {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .vesak-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    filter: drop-shadow(0 0 15px rgba(254,204,40,0.7));
                    animation: pulseLight 2s infinite ease-in-out;
                }

                @keyframes pulseLight {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(254,204,40,0.5)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(254,204,40,0.85)); }
                }

                .vesak-title {
                    font-family: 'Cinzel', serif;
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #d4af37;
                    text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
                    margin: 0 0 10px 0;
                }

                .vesak-subtitle {
                    font-size: 13px;
                    font-weight: 300;
                    line-height: 1.5;
                    color: #d8d8d8;
                    margin: 0 0 24px 0;
                }

                .vesak-input-group {
                    text-align: left;
                    margin-bottom: 20px;
                }

                .vesak-label {
                    display: block;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    color: #d4af37;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                .vesak-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 14px;
                    color: #ffffff;
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }

                .vesak-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.09);
                    border-color: #d4af37;
                    box-shadow: 0 0 10px rgba(212,175,55,0.25);
                }

                .vesak-wish-selector {
                    text-align: left;
                    margin-bottom: 26px;
                }

                .vesak-preset-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .vesak-tab {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 10px 4px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 11px;
                    font-weight: 500;
                    color: #b0b0b0;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.3s ease;
                }

                .vesak-tab-text {
                    font-size: 9px;
                    opacity: 0.8;
                }

                .vesak-tab.active {
                    background: rgba(212, 175, 55, 0.12);
                    border-color: rgba(212, 175, 55, 0.8);
                    color: #f3e5ab;
                }

                .vesak-textarea {
                    width: 100%;
                    height: 70px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 13px;
                    color: #eaeaea;
                    line-height: 1.4;
                    resize: none;
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }

                .vesak-textarea:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #d4af37;
                    box-shadow: 0 0 10px rgba(212,175,55,0.25);
                }

                .vesak-btn-start {
                    width: 100%;
                    background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa7c11 100%);
                    border: none;
                    border-radius: 14px;
                    padding: 15px 24px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 16px;
                    font-weight: 700;
                    color: #0b0518;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(212,175,55,0.4);
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                }

                .vesak-btn-start::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: all 0.6s ease;
                }

                .vesak-btn-start:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(212,175,55,0.55);
                }

                .vesak-btn-start:hover::before { left: 100%; }

                .vesak-btn-start:active {
                    transform: translateY(1px);
                    box-shadow: 0 2px 10px rgba(212,175,55,0.4);
                }
            `}</style>

            <div className="vesak-sparks-bg">
                {sparks.map((spark) => (
                    <div
                        key={spark.id}
                        className="vesak-spark"
                        style={{
                            left: spark.left,
                            animationDelay: spark.delay,
                            animationDuration: spark.duration,
                            width: spark.size,
                            height: spark.size,
                        }}
                    />
                ))}
            </div>

            <div className="vesak-card">
                <div className="vesak-icon">🪔</div>
                <h1 className="vesak-title">VESAK AR LANTERN</h1>
                <p className="vesak-subtitle">
                    Illuminate your physical environment in sacred light. Enter a name to compose a blessing and launch the experience.
                </p>

                <div className="vesak-input-group">
                    <label className="vesak-label">Who is this blessing for?</label>
                    <input
                        type="text"
                        className="vesak-input"
                        placeholder="Enter name (e.g., Mother, My Family, Friend)"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </div>

                <div className="vesak-wish-selector">
                    <label className="vesak-label">Select a Vesak Blessing</label>
                    <div className="vesak-preset-tabs">
                        {PRESET_WISHES.map((preset) => (
                            <button
                                key={preset.id}
                                className={`vesak-tab ${selectedWishId === preset.id ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedWishId(preset.id);
                                    setWishText(preset.text);
                                }}
                            >
                                <span>{preset.label.split(" ")[0]}</span>
                                <span className="vesak-tab-text">
                                    {preset.label.split(" ").slice(1).join(" ")}
                                </span>
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="vesak-textarea"
                        value={wishText}
                        onChange={(e) => {
                            setSelectedWishId("custom");
                            setWishText(e.target.value);
                        }}
                        placeholder="Write a custom Vesak blessing..."
                    />
                </div>

                <button className="vesak-btn-start" onClick={handleStart}>
                    <span>✨ Start AR Experience</span>
                </button>
            </div>
        </div>
    );
}