import { useMemo } from "react";
import * as THREE from "three";
import { useGarden, type Structure as StructureT } from "@/lib/garden/store";
import { useGroundDrag } from "./useGroundDrag";
import { structureOverlaps } from "@/lib/garden/collision";

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
  // Threshold: opaque when bayer < 64 * 0.15  → ~15% coverage (faint shadow)
  const threshold = 64 * 0.15;
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
  const structures = useGarden((s) => s.structures);
  const isSelected = selectedId === structure.id;
  const isRoof = structure.variant === "roof";

  // Roofs derive their transform from the wall they're attached to.
  let position = structure.position;
  let rotationY = structure.rotationY;
  let length = structure.length;
  if (isRoof && structure.attachedToId) {
    const wall = structures.find((s) => s.id === structure.attachedToId);
    if (!wall) return null;
    const side = structure.attachedSide ?? 1;
    const cos = Math.cos(wall.rotationY);
    const sin = Math.sin(wall.rotationY);
    const rlz = (wall.thickness / 2 + structure.thickness / 2) * side;
    position = [
      wall.position[0] + -rlz * sin,
      wall.height,
      wall.position[2] + rlz * cos,
    ];
    rotationY = wall.rotationY;
    length = wall.length;
  }

  const drag = useGroundDrag(
    () => structure.position,
    (x, z) => {
      const state = useGarden.getState();
      if (
        structureOverlaps(
          { length: structure.length, thickness: structure.thickness, x, z },
          state.planters,
          state.structures,
          structure.id,
        )
      ) {
        return; // refuse move that would overlap
      }
      updateStructure(structure.id, { position: [x, 0, z] });
    },
  );

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerDown={(e) => {
        if (pending) return;
        select(structure.id);
        if (!isRoof) drag.onPointerDown(e);
      }}
      onPointerMove={isRoof ? undefined : drag.onPointerMove}
      onPointerUp={isRoof ? undefined : drag.onPointerUp}
      onPointerCancel={isRoof ? undefined : drag.onPointerCancel}
    >
      {structure.variant === "wall" && <WallMesh structure={structure} />}
      {structure.variant === "fenceWood" && <WoodFence structure={structure} />}
      {structure.variant === "fenceGlass" && <GlassFence structure={structure} />}
      {isRoof && (
        <RoofMesh length={length} depth={structure.thickness} slab={structure.height} />
      )}
      {isSelected && (
        <SelectionOutline
          length={length}
          thickness={isRoof ? structure.thickness : structure.thickness}
          yOffset={isRoof ? structure.height + 0.01 : 0}
        />
      )}
    </group>
  );
}


function WallMesh({ structure }: { structure: StructureT }) {
  const { length: L, height: H, thickness: T } = structure;
  return (
    <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[L, H, T]} />
      <meshStandardMaterial color="#cfc4ac" roughness={0.95} />
    </mesh>
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
  const panelW = usable - 0.02;
  const panelH = H - railT * 2 - 0.02;

  // Depth material that only writes to the shadow map on ~35% of texels,
  // producing a soft partial shadow (~65% light transmission).
  const shadowDepthMaterial = useMemo(() => {
    const alphaMap = makeDitherAlphaTexture();
    // Repeat once per pixel-ish density across the panel
    alphaMap.repeat.set(Math.max(1, panelW * 40), Math.max(1, panelH * 40));
    const m = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaMap,
      alphaTest: 0.5,
    });
    return m;
  }, [panelW, panelH]);

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
      {/* glass panel — casts a dithered partial shadow via customDepthMaterial */}
      <mesh
        position={[0, railT + panelH / 2 + 0.01, 0]}
        castShadow
        receiveShadow
        customDepthMaterial={shadowDepthMaterial}
      >
        <boxGeometry args={[panelW, panelH, 0.012]} />
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

function RoofMesh({
  length,
  depth,
  slab,
}: {
  length: number;
  depth: number;
  slab: number;
}) {
  return (
    <mesh position={[0, slab / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, slab, depth]} />
      <meshStandardMaterial color="#cfc4ac" roughness={0.95} />
    </mesh>
  );
}

function SelectionOutline({
  length,
  thickness,
  yOffset = 0,
}: {
  length: number;
  thickness: number;
  yOffset?: number;
}) {
  const t = 0.03;
  const w = length + 0.08;
  const d = thickness + 0.16;
  const col = "#3a8fd9";
  return (
    <group position={[0, 0.01 + yOffset, 0]}>
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

