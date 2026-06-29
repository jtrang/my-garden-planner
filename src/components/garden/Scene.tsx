import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import type { Object3D, PerspectiveCamera as PerspectiveCameraT } from "three";
import { useGarden } from "@/lib/garden/store";
import { Ground } from "./Ground";
import { Sun } from "./Sun";
import { Planter } from "./Planter";
import { Plant } from "./Plant";

export function Scene() {
  const planters = useGarden((s) => s.planters);
  const plants = useGarden((s) => s.plants);
  const cameraView = useGarden((s) => s.cameraView);

  return (
    <Canvas
      shadows
      camera={{ position: [6, 6, 8], fov: 45 }}
      gl={{ antialias: true }}
      style={{ background: "#f5efe0" }}
    >
      <Suspense fallback={null}>
        <CameraRig view={cameraView} />
        <Sun />
        <Ground />
        {planters.map((p) => (
          <Planter key={p.id} planter={p} />
        ))}
        {plants.map((p) => (
          <Plant key={p.id} plant={p} />
        ))}
        <SelectionTransformer />
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Suspense>
    </Canvas>
  );
}

function CameraRig({ view }: { view: string }) {
  const { camera, controls } = useThree() as { camera: PerspectiveCameraT; controls: { target: { set: (x: number, y: number, z: number) => void }; update: () => void } | null };
  useEffect(() => {
    if (!camera) return;
    if (view === "top") camera.position.set(0, 14, 0.001);
    else if (view === "front") camera.position.set(0, 3, 12);
    else camera.position.set(6, 6, 8);
    camera.lookAt(0, 0, 0);
    if (controls && "target" in controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [view, camera, controls]);
  return null;
}

function SelectionTransformer() {
  const selectedId = useGarden((s) => s.selectedId);
  const planters = useGarden((s) => s.planters);
  const plants = useGarden((s) => s.plants);
  const updatePlanter = useGarden((s) => s.updatePlanter);
  const updatePlant = useGarden((s) => s.updatePlant);
  const mode = useGarden((s) => s.transformMode);
  const { scene } = useThree();
  const targetRef = useRef<Object3D | null>(null);

  // find the threejs object by traversing
  useEffect(() => {
    if (!selectedId) {
      targetRef.current = null;
      return;
    }
    // we tag by setting userData via name; simpler: search by position match
    // Instead, use a known group name pattern not set. So we search for any selected ring by scanning userData IDs we'd set.
  }, [selectedId, planters, plants, scene]);

  if (!selectedId) return null;
  const selectedPlanter = planters.find((p) => p.id === selectedId);
  const selectedPlant = plants.find((p) => p.id === selectedId);
  if (!selectedPlanter && !selectedPlant) return null;

  const pos = (selectedPlanter ?? selectedPlant)!.position;
  const rotY = (selectedPlanter ?? selectedPlant)!.rotationY;

  return (
    <TransformControls
      mode={mode}
      showY={mode === "rotate"}
      showX={mode === "translate"}
      showZ={mode === "translate"}
      position={pos}
      rotation={[0, rotY, 0]}
      onObjectChange={(e) => {
        const obj = e?.target?.object as Object3D | undefined;
        if (!obj) return;
        const newPos: [number, number, number] = [obj.position.x, obj.position.y, obj.position.z];
        const newRot = obj.rotation.y;
        if (selectedPlanter) {
          updatePlanter(selectedPlanter.id, { position: [newPos[0], 0, newPos[2]], rotationY: newRot });
        } else if (selectedPlant) {
          updatePlant(selectedPlant.id, { position: newPos, rotationY: newRot });
        }
      }}
    >
      <mesh visible={false}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial />
      </mesh>
    </TransformControls>
  );
}
