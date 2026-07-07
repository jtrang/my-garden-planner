import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import type { Mesh, PerspectiveCamera as PerspectiveCameraT } from "three";
import { useGarden } from "@/lib/garden/store";
import { Ground } from "./Ground";
import { Sun } from "./Sun";
import { Planter } from "./Planter";
import { Plant } from "./Plant";
import { Structure } from "./Structure";
import { PlacementPreview } from "./PlacementPreview";

export function Scene() {
  const planters = useGarden((s) => s.planters);
  const plants = useGarden((s) => s.plants);
  const structures = useGarden((s) => s.structures);
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
        {structures.map((st) => (
          <Structure key={st.id} structure={st} />
        ))}
        <SelectionTransformer />
        <PlacementPreview />
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Suspense>
    </Canvas>
  );
}

function CameraRig({ view }: { view: string }) {
  const { camera, controls } = useThree() as unknown as {
    camera: PerspectiveCameraT;
    controls: { target: { set: (x: number, y: number, z: number) => void }; update: () => void } | null;
  };
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
  const structures = useGarden((s) => s.structures);
  const updatePlanter = useGarden((s) => s.updatePlanter);
  const updatePlant = useGarden((s) => s.updatePlant);
  const updateStructure = useGarden((s) => s.updateStructure);
  const mode = useGarden((s) => s.transformMode);
  const proxyRef = useRef<Mesh>(null);

  const selectedPlanter = planters.find((p) => p.id === selectedId);
  const selectedPlant = plants.find((p) => p.id === selectedId);
  const selectedStructure = structures.find((s) => s.id === selectedId);
  const target = selectedPlanter ?? selectedPlant ?? selectedStructure;

  // sync proxy to current selection position
  useEffect(() => {
    if (!proxyRef.current || !target) return;
    proxyRef.current.position.set(target.position[0], target.position[1], target.position[2]);
    proxyRef.current.rotation.set(0, target.rotationY, 0);
  }, [target]);

  if (!target) return null;

  const handleChange = () => {
    const obj = proxyRef.current;
    if (!obj) return;
    if (selectedPlanter) {
      updatePlanter(selectedPlanter.id, {
        position: [obj.position.x, 0, obj.position.z],
        rotationY: obj.rotation.y,
      });
    } else if (selectedPlant) {
      updatePlant(selectedPlant.id, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotationY: obj.rotation.y,
      });
    } else if (selectedStructure) {
      updateStructure(selectedStructure.id, {
        position: [obj.position.x, 0, obj.position.z],
        rotationY: obj.rotation.y,
      });
    }
  };

  return (
    <TransformControls
      mode={mode}
      object={proxyRef as unknown as React.RefObject<Mesh>}
      showY={mode === "rotate"}
      showX={mode === "translate"}
      showZ={mode === "translate"}
      onObjectChange={handleChange}
    >
      <mesh ref={proxyRef} visible={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial />
      </mesh>
    </TransformControls>
  );
}
