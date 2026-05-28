"use client";

import { useEffect, useRef } from "react";

import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ARScene() {

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (!containerRef.current) return;

        let mindarThree: any;

        const start = async () => {

            // =========================
            // DYNAMIC IMPORT (browser-only)
            // =========================

            const { MindARThree } = await import(
                "mind-ar/dist/mindar-image-three.prod.js"
            );

            // =========================
            // MINDAR SETUP
            // =========================

            mindarThree = new MindARThree({
                container: containerRef.current,
                imageTargetSrc: "/targets/vesak.mind",
                filterMinCF: 0.0001,
                filterBeta: 0.001,
                missTolerance: 10,
                warmupTolerance: 5,
            });

            const {
                renderer,
                scene,
                camera,
            } = mindarThree;

            // =========================
            // LIGHTS
            // =========================

            const hemiLight = new THREE.HemisphereLight(
                0xffffff,
                0xbbbbff,
                1
            );

            scene.add(hemiLight);

            const pointLight = new THREE.PointLight(
                0xffffff,
                2,
                10
            );

            pointLight.position.set(0, 1, 0);

            scene.add(pointLight);

            // =========================
            // COLOR CHANGING LIGHTS
            // =========================

            const festiveColors = [
                new THREE.Color("#ff0000"),
                new THREE.Color("#ffff00"),
                new THREE.Color("#00ff00"),
                new THREE.Color("#0000ff"),
            ];

            let colorIndex = 0;
            let nextColorIndex = 1;
            let lerpT = 0;

            // =========================
            // ANCHOR
            // =========================

            const anchor = mindarThree.addAnchor(0);

            // Create an upright container group.
            // In MindAR, the target image coordinate system is flat on the X-Y plane with Z pointing out.
            // If the QR target is placed flat on the ground:
            // - The target's Z-axis points straight UP.
            // - The target's Y-axis points forward along the ground.
            // Standard 3D models (like GLTF) have Y as their vertical "up" axis.
            // To align the model's Y-axis (up) with the target's Z-axis (physical up),
            // we rotate the container by 90 degrees (Math.PI / 2) around the local X-axis.
            const modelContainer = new THREE.Group();
            modelContainer.rotation.x = Math.PI / 2;
            anchor.group.add(modelContainer);

            // =========================
            // LOAD GLB MODEL
            // =========================

            const loader = new GLTFLoader();

            loader.load(
                "/models/VLSSL.glb",
                (gltf: any) => {

                    const model = gltf.scene;

                    // Make the model 3x bigger (original was 0.4, 3 * 0.4 = 1.2)
                    model.scale.set(1.2, 1.2, 1.2);

                    // Compute the bounding box of the model to center it and align its base with Y = 0
                    const box = new THREE.Box3().setFromObject(model);
                    const center = new THREE.Vector3();
                    box.getCenter(center);

                    // Adjust the position of the model so that its bottom-center sits at the origin (0, 0, 0)
                    model.position.x = -center.x;
                    model.position.z = -center.z;
                    model.position.y = -box.min.y;

                    // Add the model to the upright container
                    modelContainer.add(model);

                    // =========================
                    // FIND SUB LANTERNS
                    // =========================

                    const subLanterns: THREE.Object3D[] = [];

                    model.traverse((obj: THREE.Object3D) => {

                        const name = obj.name.toLowerCase();

                        if (name.startsWith("sublantern")) {
                            subLanterns.push(obj);
                        }

                    });

                    // =========================
                    // RENDER LOOP
                    // =========================

                    renderer.setAnimationLoop(() => {

                        // Rotate whole model around its local Y-axis (which is vertical)
                        model.rotation.y += 0.005;

                        // Rotate sub lanterns
                        subLanterns.forEach((lantern: THREE.Object3D, index: number) => {

                            lantern.rotation.y +=
                                index % 2 === 0
                                    ? 0.02
                                    : -0.02;

                        });

                        // =========================
                        // COLOR LIGHT ANIMATION
                        // =========================

                        lerpT += 0.01;

                        if (lerpT >= 1) {

                            lerpT = 0;

                            colorIndex = nextColorIndex;

                            nextColorIndex =
                                (nextColorIndex + 1) %
                                festiveColors.length;
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

            // =========================
            // START AR
            // =========================

            await mindarThree.start();

        };

        start();

        return () => {

            if (mindarThree) {
                mindarThree.stop();
            }

        };

    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100vw",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
            }}
        />
    );
}