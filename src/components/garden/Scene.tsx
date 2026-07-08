import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import type { PerspectiveCamera as PerspectiveCameraT } from "three";
import { useGarden } from "@/lib/garden/store";
import { Ground } from "./Ground";
import { Sun } from "./Sun";
import { Planter } from "./Planter";
import { Plant } from "./Plant";
import { Structure } from "./Structure";
import { PlacementPreview } from "./PlacementPreview";
import { ResizeHandles } from "./ResizeHandles";

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
        <ResizeHandles />
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
