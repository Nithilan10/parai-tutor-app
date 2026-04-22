"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PARAI_HERO_GLB_PATH } from "@/lib/paraiHeroGlbPath";

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

/** Wireframe parai-style frame when no GLB (flat drum + rim, not a globe). */
function buildFallbackDrumGroup() {
  const group = new THREE.Group();

  const outerFrame = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.07, 12, 80),
    new THREE.MeshBasicMaterial({
      color: 0xdc2626,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    })
  );
  outerFrame.rotation.x = Math.PI / 2;
  group.add(outerFrame);

  const head = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 64),
    new THREE.MeshBasicMaterial({
      color: 0x881337,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    })
  );
  head.rotation.x = -Math.PI / 2;
  group.add(head);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.035, 10, 48),
    new THREE.MeshBasicMaterial({
      color: 0xfecaca,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.06;
  group.add(innerRing);

  return { group, meshes: [outerFrame, head, innerRing] };
}

/**
 * Full-viewport layered backdrop: CSS aurora + transparent Three.js scene.
 * Hidden on the marketing home for guests so the red/white landing is full-bleed.
 */
export default function FuturisticBackdrop() {
  const pathname = usePathname();
  const { status } = useSession();
  const mountRef = useRef(null);

  const hideForMarketingHome = pathname === "/" && status === "unauthenticated";

  useEffect(() => {
    if (hideForMarketingHome) return;

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const root = new THREE.Group();
    scene.add(root);

    const light = new THREE.DirectionalLight(0xffffff, 0.35);
    light.position.set(4, 6, 8);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffe4e6, 0.22));

    mount.appendChild(renderer.domElement);

    let frame = 0;
    let rootGroup = null;
    let disposed = false;
    /** @type {'none' | 'glb' | 'fallback'} */
    let modelKind = "none";

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    onResize();

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const t = performance.now() * 0.00012;
      if (rootGroup) {
        rootGroup.rotation.y = t * 0.9;
        rootGroup.rotation.x = Math.sin(t * 0.4) * 0.08;
        if (modelKind !== "glb") {
          rootGroup.position.y = Math.sin(t * 0.5) * 0.12;
        }
      }
      renderer.render(scene, camera);
    };

    (async () => {
      const loader = new GLTFLoader();
      try {
        const gltf = await loader.loadAsync(PARAI_HERO_GLB_PATH);
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
        model.rotation.x = Math.PI / 2;
        const spin = new THREE.Group();
        spin.add(model);
        rootGroup = spin;
        root.add(spin);
        modelKind = "glb";
      } catch {
        if (disposed) return;
        const { group } = buildFallbackDrumGroup();
        rootGroup = group;
        root.add(rootGroup);
        modelKind = "fallback";
      }
      animate();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      if (rootGroup) {
        root.remove(rootGroup);
        if (modelKind === "glb") disposeObject3D(rootGroup);
        else if (modelKind === "fallback") {
          rootGroup.traverse((child) => {
            if (child.isMesh) {
              child.geometry?.dispose();
              child.material?.dispose?.();
            }
          });
        }
      }
      if (scene.environment) {
        scene.environment.dispose();
        scene.environment = null;
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [hideForMarketingHome]);

  if (hideForMarketingHome) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -30%, rgba(220, 38, 38, 0.16), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 20%, rgba(251, 113, 133, 0.1), transparent 50%),
            radial-gradient(ellipse 60% 45% at 0% 80%, rgba(255, 255, 255, 0.06), transparent 45%),
            #0a0505
          `,
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% -20%, rgba(220, 38, 38, 0.1), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 30%, rgba(254, 202, 202, 0.12), transparent 50%),
            #fff5f5
          `,
        }}
      />
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div ref={mountRef} className="absolute inset-0 opacity-70 dark:opacity-55" />
    </div>
  );
}
