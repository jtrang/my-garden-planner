import { useGarden } from "@/lib/garden/store";
import { Grid } from "@react-three/drei";

export function Ground() {
  const { width, depth } = useGarden((s) => s.garden);
  const select = useGarden((s) => s.select);
  const max = Math.max(width, depth) * 1.5;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.stopPropagation();
            select(null);
          }
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#d9d2bf" />
      </mesh>
      {/* surrounding ground hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[max * 2, max * 2]} />
        <meshStandardMaterial color="#ece5d2" />
      </mesh>
      <Grid
        args={[max * 2, max * 2]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#b8ad92"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#7a6f55"
        fadeDistance={max * 2}
        fadeStrength={1}
        infiniteGrid={false}
        position={[0, 0.001, 0]}
      />
    </group>
  );
}
