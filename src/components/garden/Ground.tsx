import { useMemo } from "react";
import * as THREE from "three";
import { Grid } from "@react-three/drei";
import { useGarden, type GroundSkin } from "@/lib/garden/store";

function makeSkinTexture(skin: GroundSkin): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  if (skin === "wood") {
    // wood deck: horizontal planks
    const plankH = 32;
    for (let y = 0; y < size; y += plankH) {
      const shade = 90 + Math.random() * 30;
      ctx.fillStyle = `rgb(${shade + 40}, ${shade}, ${shade - 30})`;
      ctx.fillRect(0, y, size, plankH);
      // grain
      ctx.strokeStyle = `rgba(60,40,20,${0.12 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const gy = y + Math.random() * plankH;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(size / 3, gy + (Math.random() - 0.5) * 4, (2 * size) / 3, gy + (Math.random() - 0.5) * 4, size, gy);
        ctx.stroke();
      }
      // seam
      ctx.strokeStyle = "rgba(30,15,5,0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  } else if (skin === "concrete") {
    ctx.fillStyle = "#bcbab5";
    ctx.fillRect(0, 0, size, size);
    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 30;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);
    // occasional dark specks
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(50,45,40,${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // grass
    ctx.fillStyle = "#4f7a34";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 2 + Math.random() * 3;
      const g = 90 + Math.floor(Math.random() * 60);
      ctx.strokeStyle = `rgb(${30 + Math.random() * 30}, ${g}, ${30 + Math.random() * 30})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y - len);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Ground() {
  const { width, depth } = useGarden((s) => s.garden);
  const groundStyle = useGarden((s) => s.groundStyle);
  const select = useGarden((s) => s.select);
  const max = Math.max(width, depth) * 1.5;

  const skinTexture = useMemo(() => {
    if (groundStyle.type !== "skin") return null;
    const tex = makeSkinTexture(groundStyle.skin);
    // ~1 tile per meter
    tex.repeat.set(Math.max(1, width), Math.max(1, depth));
    return tex;
  }, [groundStyle, width, depth]);

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.stopPropagation();
            select(null);
          }
        }}
      >
        <planeGeometry args={[width, depth]} />
        {groundStyle.type === "color" ? (
          <meshStandardMaterial color={groundStyle.color} roughness={0.95} />
        ) : (
          <meshStandardMaterial
            map={skinTexture ?? undefined}
            roughness={groundStyle.skin === "concrete" ? 0.85 : 0.95}
          />
        )}
      </mesh>
      {/* surrounding neutral floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
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
