"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PARAI_HERO_GLB_PATH } from "@/lib/paraiHeroGlbPath";

/** Pitch the authored mesh so the drum head normal (typically +Y) faces the viewer (+Z). */
const TILT_HEAD_TO_SCREEN_X = Math.PI / 2;

function disposeObject3D(obj) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose();
      const mats = child.material;
      if (Array.isArray(mats)) mats.forEach((m) => m.dispose?.());
      else mats?.dispose?.();
    }
  });
}

/**
 * Landing hero: only the Parai GLB from `public/models/Parai.glb` (or NEXT_PUBLIC_HERO_GLB_URL).
 * Uses image-based lighting so brown / leather PBR materials read correctly.
 */
export default function ParaiScene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let gltfRoot = null;
    let raf = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.42));
    const key = new THREE.DirectionalLight(0xfff5f0, 0.95);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe4e4, 0.35);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    mount.appendChild(renderer.domElement);

    const resize = () => {
      const w = mount.clientWidth || 320;
      const h = Math.max(mount.clientHeight || 360, 280);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = performance.now() * 0.001;
      if (gltfRoot) gltfRoot.rotation.y = t * 0.35;
      renderer.render(scene, camera);
    };
    loop();

    (async () => {
      try {
        const gltf = await new GLTFLoader().loadAsync(PARAI_HERO_GLB_PATH);
        if (disposed) {
          disposeObject3D(gltf.scene);
          return;
        }
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        if (!box.isEmpty()) {
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z, 0.001);
          model.scale.setScalar(3.2 / maxDim);
        }
        model.rotation.x = TILT_HEAD_TO_SCREEN_X;
        const spin = new THREE.Group();
        spin.add(model);
        gltfRoot = spin;
        scene.add(spin);
      } catch (e) {
        console.warn("[ParaiScene3D] GLB load failed:", PARAI_HERO_GLB_PATH, e);
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (gltfRoot) {
        if (gltfRoot.parent) gltfRoot.parent.remove(gltfRoot);
        disposeObject3D(gltfRoot);
        gltfRoot = null;
      }
      if (scene.environment) {
        scene.environment.dispose();
        scene.environment = null;
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="rw-hero-3d" aria-hidden />;
}
