import { useMemo } from "react";
import * as THREE from "three";
import { useGarden, type Structure as StructureT } from "@/lib/garden/store";
import { useGroundDrag } from "./useGroundDrag";

// Dithered alpha texture: ~35% of pixels opaque, ~65% transparent.
// Used as an alphaMap on a customDepthMaterial so the glass panel casts
// only a partial shadow (letting ~65% of light through).
function makeDitherAlphaTexture() {
  const size = 8;
  const data = new Uint8Array(size * size * 4);
  // 8x8 Bayer matrix (values 0..63)
  const bayer = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ];
  // Threshold: opaque when bayer < 64 * 0.35  → ~35% coverage
  const threshold = 64 * 0.35;
  for (let i = 0; i < bayer.length; i++) {
    const opaque = bayer[i] < threshold ? 255 : 0;
    data[i * 4 + 0] = 255;
    data[i * 4 + 1] = 255;
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = opaque;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

interface Props {
  structure: StructureT;
}

export function Structure({ structure }: Props) {
  const select = useGarden((s) => s.select);
  const selectedId = useGarden((s) => s.selectedId);
  const updateStructure = useGarden((s) => s.updateStructure);
  const pending = useGarden((s) => s.pending);
  const isSelected = selectedId === structure.id;

  const drag = useGroundDrag(
    () => structure.position,
    (x, z) => updateStructure(structure.id, { position: [x, 0, z] }),
  );

  return (
    <group
      position={structure.position}
      rotation={[0, structure.rotationY, 0]}
      onPointerDown={(e) => {
        if (pending) return;
        select(structure.id);
        drag.onPointerDown(e);
      }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
    >
      {structure.variant === "wall" && <WallMesh structure={structure} />}
      {structure.variant === "fenceWood" && <WoodFence structure={structure} />}
      {structure.variant === "fenceGlass" && <GlassFence structure={structure} />}
      {isSelected && <SelectionOutline structure={structure} />}
    </group>
  );
}

function WallMesh({ structure }: { structure: StructureT }) {
  const { length: L, height: H, thickness: T } = structure;
  return (
    <group>
      {/* main wall */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, H, T]} />
        <meshStandardMaterial color="#cfc4ac" roughness={0.95} />
      </mesh>
      {/* cap */}
      <mesh position={[0, H + 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[L + 0.04, 0.04, T + 0.04]} />
        <meshStandardMaterial color="#b3a785" roughness={0.9} />
      </mesh>
    </group>
  );
}

function WoodFence({ structure }: { structure: StructureT }) {
  const { length: L, height: H, thickness: T } = structure;
  const postW = 0.08;
  const postCount = Math.max(2, Math.round(L / 1.2) + 1);
  const rails = [H * 0.25, H * 0.75];
  const pickets = Math.max(2, Math.floor(L / 0.11));
  const pw = 0.06;
  const inset = postW / 2 + 0.01;
  const usable = L - postW;
  return (
    <group>
      {/* posts */}
      {Array.from({ length: postCount }).map((_, i) => {
        const x = -L / 2 + (i / (postCount - 1)) * L;
        return (
          <mesh key={`p-${i}`} position={[x, H / 2 + 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[postW, H + 0.04, postW]} />
            <meshStandardMaterial color="#5a3a1e" roughness={0.9} />
          </mesh>
        );
      })}
      {/* rails */}
      {rails.map((y, i) => (
        <mesh key={`r-${i}`} position={[0, y, 0]} castShadow>
          <boxGeometry args={[usable, 0.05, T + 0.02]} />
          <meshStandardMaterial color="#7a4e28" roughness={0.9} />
        </mesh>
      ))}
      {/* pickets */}
      {Array.from({ length: pickets }).map((_, i) => {
        const spacing = usable / pickets;
        const x = -L / 2 + inset + spacing * (i + 0.5);
        return (
          <mesh key={`k-${i}`} position={[x, H / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[pw, H * 0.95, 0.015]} />
            <meshStandardMaterial color="#8a5a34" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function GlassFence({ structure }: { structure: StructureT }) {
  const { length: L, height: H, thickness: T } = structure;
  const postW = 0.05;
  const postCount = Math.max(2, Math.round(L / 1.2) + 1);
  const railT = 0.04;
  const usable = L - postW;
  return (
    <group>
      {/* metal posts */}
      {Array.from({ length: postCount }).map((_, i) => {
        const x = -L / 2 + (i / (postCount - 1)) * L;
        return (
          <mesh key={`gp-${i}`} position={[x, H / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[postW / 2, postW / 2, H, 12]} />
            <meshStandardMaterial color="#8a8f96" roughness={0.35} metalness={0.85} />
          </mesh>
        );
      })}
      {/* top & bottom rails */}
      {[H - railT / 2, railT / 2].map((y, i) => (
        <mesh key={`gr-${i}`} position={[0, y, 0]} castShadow>
          <boxGeometry args={[usable, railT, T + 0.02]} />
          <meshStandardMaterial color="#8a8f96" roughness={0.35} metalness={0.85} />
        </mesh>
      ))}
      {/* glass panel */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[usable - 0.02, H - railT * 2 - 0.02, 0.012]} />
        <meshPhysicalMaterial
          color="#c8dbe4"
          roughness={0.05}
          metalness={0}
          transmission={0.85}
          thickness={0.02}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}

function SelectionOutline({ structure }: { structure: StructureT }) {
  const t = 0.03;
  const w = structure.length + 0.08;
  const d = structure.thickness + 0.16;
  const col = "#3a8fd9";
  const y = 0.01;
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0, -d / 2]}>
        <boxGeometry args={[w, t, t]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[0, 0, d / 2]}>
        <boxGeometry args={[w, t, t]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[-w / 2, 0, 0]}>
        <boxGeometry args={[t, t, d]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[w / 2, 0, 0]}>
        <boxGeometry args={[t, t, d]} />
        <meshBasicMaterial color={col} />
      </mesh>
    </group>
  );
}
