"use client";

import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    Color3,
    Color4,
    MeshBuilder,
    SceneLoader,
} from "@babylonjs/core";

import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";

function SplashScreen({ onEnter }: { onEnter: () => void }) {
    const [phase, setPhase] = useState<"title" | "subtitle" | "instruction" | "ready">("title");

    useEffect(() => {
        const t1 = setTimeout(() => setPhase("subtitle"), 1800);
        const t2 = setTimeout(() => setPhase("instruction"), 3400);
        const t3 = setTimeout(() => setPhase("ready"), 5000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <div
            onClick={phase === "ready" ? onEnter : undefined}
            style={{
                position: "fixed", inset: 0, zIndex: 100,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: "radial-gradient(ellipse at 60% 30%, #3a1a00 0%, #1a0800 40%, #0a0008 100%)",
                overflow: "hidden", cursor: phase === "ready" ? "pointer" : "default", userSelect: "none",
            }}
        >
            <Particles />
            <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "1px solid rgba(255,180,50,0.12)", boxShadow: "0 0 60px 10px rgba(255,140,20,0.08)", animation: "ringPulse 4s ease-in-out infinite" }} />
            <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(255,180,50,0.06)", animation: "ringPulse 4s ease-in-out infinite 0.8s" }} />
            <div style={{ fontSize: 72, marginBottom: 24, animation: "lanternFloat 3s ease-in-out infinite", filter: "drop-shadow(0 0 24px rgba(255,160,30,0.7))" }}>🏮</div>
            <div style={{ fontFamily: "'Cinzel Decorative','Palatino Linotype',serif", fontSize: "clamp(32px,8vw,52px)", fontWeight: 700, letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.2, background: "linear-gradient(135deg,#ffe0a0 0%,#ffb830 40%,#ff8c00 70%,#ffcf6a 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 30px rgba(255,160,40,0.4))", padding: "0 16px" }}>Happy Vesak</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", opacity: phase === "subtitle" || phase === "instruction" || phase === "ready" ? 1 : 0, transition: "opacity 1s ease 0.2s" }}>
                <div style={{ width: 48, height: 1, background: "linear-gradient(to right,transparent,rgba(255,180,60,0.6))" }} />
                <div style={{ fontSize: 14, color: "rgba(255,200,80,0.7)", letterSpacing: "0.3em" }}>✦</div>
                <div style={{ width: 48, height: 1, background: "linear-gradient(to left,transparent,rgba(255,180,60,0.6))" }} />
            </div>
            <div style={{ fontFamily: "'IM Fell English','Georgia',serif", fontSize: "clamp(13px,3.5vw,17px)", color: "rgba(255,210,130,0.75)", letterSpacing: "0.25em", textTransform: "uppercase", textAlign: "center", padding: "0 24px", opacity: phase === "subtitle" || phase === "instruction" || phase === "ready" ? 1 : 0, transform: phase === "subtitle" || phase === "instruction" || phase === "ready" ? "translateY(0)" : "translateY(12px)", transition: "opacity 1s ease,transform 1s ease" }}>Wesak Poya · Virtual Lantern</div>
            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: phase === "instruction" || phase === "ready" ? 1 : 0, transform: phase === "instruction" || phase === "ready" ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.9s ease,transform 0.9s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,160,30,0.08)", border: "1px solid rgba(255,160,30,0.2)", borderRadius: 40, padding: "10px 22px" }}>
                    <span style={{ fontSize: 20 }}>📷</span>
                    <span style={{ fontFamily: "'Jost','Trebuchet MS',sans-serif", fontSize: 13, color: "rgba(255,210,130,0.8)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Point camera at a flat surface</span>
                </div>
            </div>
            <div style={{ marginTop: 32, opacity: phase === "ready" ? 1 : 0, transform: phase === "ready" ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.8s ease,transform 0.8s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "'Jost','Trebuchet MS',sans-serif", fontSize: "clamp(15px,4vw,18px)", color: "rgba(255,220,140,0.95)", letterSpacing: "0.2em", textTransform: "uppercase", animation: "tapPulse 2s ease-in-out infinite" }}>Tap to begin</div>
                <div style={{ fontSize: 22, animation: "tapBounce 1.8s ease-in-out infinite", opacity: 0.7 }}>☞</div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "70%", height: 120, background: "radial-gradient(ellipse at 50% 100%,rgba(255,120,20,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=IM+Fell+English&family=Jost:wght@300;400&display=swap');
                @keyframes lanternFloat { 0%,100%{transform:translateY(0px) rotate(-3deg)}50%{transform:translateY(-12px) rotate(3deg)} }
                @keyframes ringPulse { 0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.04)} }
                @keyframes tapPulse { 0%,100%{opacity:0.6}50%{opacity:1} }
                @keyframes tapBounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(6px)} }
                @keyframes particleRise { 0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:1}90%{opacity:0.6}100%{transform:translateY(-100vh) translateX(var(--drift));opacity:0} }
            `}</style>
        </div>
    );
}

function Particles() {
    const particles = Array.from({ length: 22 }, (_, i) => ({
        id: i, left: `${Math.random() * 100}%`, size: Math.random() * 4 + 2,
        duration: Math.random() * 8 + 6, delay: Math.random() * 8,
        drift: `${(Math.random() - 0.5) * 80}px`, opacity: Math.random() * 0.5 + 0.2,
    }));
    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {particles.map((p) => (
                <div key={p.id} style={{ position: "absolute", bottom: "-10px", left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: `rgba(255,${150 + Math.random() * 80},30,${p.opacity})`, boxShadow: `0 0 ${p.size * 2}px rgba(255,160,40,0.6)`, animation: `particleRise ${p.duration}s ease-in infinite ${p.delay}s`, ["--drift" as any]: p.drift }} />
            ))}
        </div>
    );
}

function FadeOverlay({ visible }: { visible: boolean }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "#000", opacity: visible ? 1 : 0, pointerEvents: "none", transition: "opacity 0.8s ease" }} />
    );
}

// Individual spin speed for each sub-lantern (local Y axis, Blender pivot corrected).
// Positive = counter-clockwise, negative = clockwise when viewed from above.
const SUB_LANTERN_SPEEDS: Record<string, number> = {
    sublantern1: 0.018,   // top ring — slow forward
    sublantern2: -0.022,   // top ring — slow reverse
    sublantern3: 0.030,   // top ring — fast forward
    sublantern4: -0.016,   // top ring — slow reverse
    sublantern5: 0.025,   // bottom ring — medium forward
    sublantern6: -0.028,   // bottom ring — fast reverse
    sublantern7: 0.020,   // bottom ring — medium forward
    sublantern8: -0.014,   // bottom ring — slow reverse
};

export default function ARScene() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [showSplash, setShowSplash] = useState(true);
    const [fading, setFading] = useState(false);
    const engineStarted = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const xrRef = useRef<BABYLON.WebXRDefaultExperience | null>(null);

    useEffect(() => {
        if (showSplash || engineStarted.current) return;
        engineStarted.current = true;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // ENGINE
        const engine = new Engine(canvas, true);
        engine.setHardwareScalingLevel(window.devicePixelRatio > 1 ? 1 / window.devicePixelRatio : 1);

        // SCENE
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 0);

        // CAMERA
        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // AMBIENT LIGHT
        const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
        ambientLight.intensity = 0.8;

        // =========================
        // COLOUR CYCLING POINT LIGHT
        // =========================
        const colorLight = new BABYLON.PointLight("colorLight", new Vector3(0, 1, 0), scene);
        colorLight.intensity = 2.5;
        colorLight.range = 8;

        const festiveColors: Color3[] = [
            new Color3(1.0, 0.15, 0.15),
            new Color3(1.0, 0.75, 0.05),
            new Color3(0.1, 0.9, 0.25),
            new Color3(0.15, 0.45, 1.0),
            new Color3(0.9, 0.15, 0.9),
        ];

        let colorIndex = 0;
        let nextColorIndex = 1;
        let colorLerpT = 0;
        const COLOR_CHANGE_SPEED = 0.008;

        // GUI
        const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const placedText = new GUI.TextBlock();
        placedText.text = "🏮 Lantern placed!";
        placedText.color = "rgba(255,220,140,0.9)";
        placedText.fontSize = 20;
        placedText.fontFamily = "Georgia, serif";
        placedText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        placedText.paddingBottom = "32px";
        placedText.isVisible = false;
        gui.addControl(placedText);

        // VARIABLES
        let rootMesh: BABYLON.TransformNode | null = null;
        let marker: BABYLON.Mesh | null = null;
        let modelPlaced = false;

        // Map of sub-lantern node name → mesh
        const subLanternMeshes: Map<string, BABYLON.AbstractMesh> = new Map();

        // Exact node names from the GLB (as exported from Blender)
        const SUB_LANTERN_NAMES = [
            "sublantern1", "sublantern2", "sublantern3", "sublantern4",
            "sublantern5", "sublantern6", "sublantern7", "sublantern8",
        ];

        // =========================
        // LOAD MODEL
        // =========================
        const loadModel = () => {
            SceneLoader.ImportMesh("", "/models/", "VLSSL.glb", scene, (meshes) => {
                console.log("MODEL LOADED:", meshes.map(m => m.name));

                const parent = new BABYLON.TransformNode("modelParent", scene);
                parent.rotationQuaternion = null;

                meshes.forEach((mesh) => {
                    mesh.parent = parent;

                    const name = mesh.name.toLowerCase();
                    if (SUB_LANTERN_NAMES.includes(name)) {
                        // Pivot is now correctly set in Blender — null the quaternion
                        // so Euler rotation.y spins the mesh around its own origin
                        mesh.rotationQuaternion = null;
                        subLanternMeshes.set(name, mesh);
                        console.log("✅ Sub-lantern ready:", mesh.name);
                    }
                });

                rootMesh = parent;
                rootMesh.scaling = new Vector3(0.5, 0.5, 0.5);
                rootMesh.position = new Vector3(0, 0, 2);

                colorLight.position = rootMesh.position.clone();
                colorLight.position.y += 0.5;

                console.log("Sub-lanterns found:", subLanternMeshes.size);
            });
        };

        // =========================
        // XR SETUP
        // =========================
        const setupXR = async () => {
            try {
                console.log("👉 XR STARTING...");

                const xr = await scene.createDefaultXRExperienceAsync({
                    uiOptions: { sessionMode: "immersive-ar" },
                    optionalFeatures: true,
                    disableDefaultUI: true,
                });

                xrRef.current = xr;
                console.log("✅ XR READY");

                const fm = xr.baseExperience.featuresManager;
                const hitTest = fm.enableFeature(BABYLON.WebXRHitTest, "latest");
                console.log("✅ HIT TEST ENABLED");

                loadModel();

                marker = MeshBuilder.CreateSphere("marker", { diameter: 0.1 }, scene);
                marker.isVisible = false;

                hitTest.onHitTestResultObservable.add((results: any) => {
                    if (results.length && rootMesh && marker && !modelPlaced) {
                        const hit = results[0];
                        marker.isVisible = true;
                        marker.position.copyFrom(hit.position);

                        rootMesh.position = marker.position.clone();
                        rootMesh.position.y += 0.3;

                        colorLight.position = rootMesh.position.clone();
                        colorLight.position.y += 0.5;

                        modelPlaced = true;

                        placedText.isVisible = true;
                        setTimeout(() => { placedText.isVisible = false; }, 3000);

                        console.log("MODEL PLACED");
                    }
                });

            } catch (err) {
                console.error("❌ XR FAILED TO START:", err);
            }
        };

        setupXR();

        // =========================
        // RENDER LOOP
        // =========================
        engine.runRenderLoop(() => {

            // Slowly rotate the entire model assembly on its Y axis
            if (rootMesh) {
                rootMesh.rotation.y += 0.005;
            }

            // Each sub-lantern spins around its own corrected Blender origin
            subLanternMeshes.forEach((mesh, name) => {
                mesh.rotation.y += SUB_LANTERN_SPEEDS[name];
            });

            // COLOUR LIGHT ANIMATION
            colorLerpT += COLOR_CHANGE_SPEED;

            if (colorLerpT >= 1) {
                colorLerpT = 0;
                colorIndex = nextColorIndex;
                nextColorIndex = (nextColorIndex + 1) % festiveColors.length;
            }

            colorLight.diffuse = Color3.Lerp(
                festiveColors[colorIndex],
                festiveColors[nextColorIndex],
                colorLerpT
            );

            colorLight.intensity = 2.0 + Math.sin(colorLerpT * Math.PI) * 1.2;

            scene.render();
        });

        // RESIZE
        const resize = () => engine.resize();
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            engine.dispose();

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };

    }, [showSplash]);

    // =========================
    // HANDLE ENTER
    // =========================
    const handleEnter = async () => {

        if (!audioRef.current) {
            audioRef.current = new Audio("/audio/vesakSong.mp3");
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            audioRef.current.onerror = (e) => console.error("Audio error:", e);
        }
        audioRef.current.play()
            .then(() => console.log("✅ Audio playing"))
            .catch((err) => console.warn("⚠️ Audio play failed:", err));

        setFading(true);
        setTimeout(() => {
            setShowSplash(false);
            setTimeout(async () => {
                setFading(false);
                setTimeout(async () => {
                    try {
                        if (xrRef.current) {
                            await xrRef.current.baseExperience.enterXRAsync(
                                "immersive-ar",
                                "local-floor"
                            );
                            console.log("✅ AR ENTERED DIRECTLY");
                        }
                    } catch (err) {
                        console.warn("⚠️ Direct AR entry failed:", err);
                    }
                }, 300);
            }, 900);
        }, 400);
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0, opacity: showSplash ? 0 : 1, transition: "opacity 0.6s ease" }}
            />
            <FadeOverlay visible={fading} />
            {showSplash && <SplashScreen onEnter={handleEnter} />}
        </>
    );
}