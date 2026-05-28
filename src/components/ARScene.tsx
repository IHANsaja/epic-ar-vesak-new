"use client";

import { useEffect, useRef } from "react";

import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

export default function ARScene() {

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (!containerRef.current) return;

        let mindarThree: any;

        const start = async () => {

            // =========================
            // MINDAR SETUP
            // =========================

            mindarThree = new MindARThree({
                container: containerRef.current,
                imageTargetSrc: "/targets/vesak.mind",
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

            // =========================
            // LOAD GLB MODEL
            // =========================

            const loader = new GLTFLoader();

            loader.load(
                "/models/VLSSL.glb",
                (gltf) => {

                    const model = gltf.scene;

                    model.scale.set(0.4, 0.4, 0.4);

                    model.position.set(0, 0, 0);

                    anchor.group.add(model);

                    // =========================
                    // FIND SUB LANTERNS
                    // =========================

                    const subLanterns: THREE.Object3D[] = [];

                    model.traverse((obj) => {

                        const name = obj.name.toLowerCase();

                        if (name.startsWith("sublantern")) {
                            subLanterns.push(obj);
                        }

                    });

                    // =========================
                    // RENDER LOOP
                    // =========================

                    renderer.setAnimationLoop(() => {

                        // Rotate whole model
                        model.rotation.y += 0.005;

                        // Rotate sub lanterns
                        subLanterns.forEach((lantern, index) => {

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