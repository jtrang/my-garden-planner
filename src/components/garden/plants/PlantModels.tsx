import { useMemo } from "react";
import { PLANT_CATALOG, type PlantSpecies } from "@/lib/garden/plants-catalog";

interface Props {
  species: PlantSpecies;
  seed?: string;
}

/** Tiny deterministic PRNG (mulberry32) seeded from a string. */
function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEAF_GREENS = ["#5f8248", "#6f9354", "#7ba05f", "#547542", "#8bb06a"];
const BARK = "#5b4126";
const BARK_LIGHT = "#7a5638";

export function PlantModel({ species, seed = species }: Props) {
  switch (species) {
    case "tomato":
      return <Tomato seed={seed} />;
    case "basil":
      return <Basil seed={seed} />;
    case "bushBeans":
      return <BushBeans seed={seed} />;
    case "strawberry":
      return <Strawberry seed={seed} />;
    case "pepper":
      return <Pepper seed={seed} />;
    case "romaine":
      return <Romaine seed={seed} />;
    default:
      return null;
  }
}

/* ---------- Tomato: staked bush with fruit clusters ---------- */
function Tomato({ seed }: { seed: string }) {
  const s = PLANT_CATALOG.tomato;
  const bits = useMemo(() => {
    const rng = makeRng(seed);
    const clusters = Array.from({ length: 14 }).map(() => ({
      angle: rng() * Math.PI * 2,
      radius: (0.3 + rng() * 0.7) * s.footprintRadius,
      height: 0.15 + rng() * (s.height - 0.2),
      size: 0.09 + rng() * 0.06,
      tone: LEAF_GREENS[Math.floor(rng() * LEAF_GREENS.length)],
    }));
    const fruits = Array.from({ length: 7 }).map(() => ({
      angle: rng() * Math.PI * 2,
      radius: 0.35 * s.footprintRadius + rng() * 0.35 * s.footprintRadius,
      height: 0.25 + rng() * (s.height - 0.35),
      size: 0.028 + rng() * 0.014,
    }));
    return { clusters, fruits };
  }, [seed, s]);

  return (
    <group>
      {/* stake */}
      <mesh position={[0, s.height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.012, s.height, 6]} />
        <meshStandardMaterial color={BARK_LIGHT} roughness={0.9} />
      </mesh>
      {/* base soil mound of foliage */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[s.footprintRadius * 0.9, 12, 10]} />
        <meshStandardMaterial color={LEAF_GREENS[0]} roughness={0.95} />
      </mesh>
      {bits.clusters.map((c, i) => (
        <mesh
          key={i}
          position={[Math.cos(c.angle) * c.radius, c.height, Math.sin(c.angle) * c.radius]}
          scale={[1, 0.75, 1]}
          castShadow
        >
          <sphereGeometry args={[c.size + 0.1, 10, 8]} />
          <meshStandardMaterial color={c.tone} roughness={0.9} />
        </mesh>
      ))}
      {bits.fruits.map((f, i) => (
        <group
          key={i}
          position={[Math.cos(f.angle) * f.radius, f.height, Math.sin(f.angle) * f.radius]}
        >
          <mesh castShadow>
            <sphereGeometry args={[f.size, 12, 10]} />
            <meshStandardMaterial color={s.accent} roughness={0.55} />
          </mesh>
          {/* calyx */}
          <mesh position={[0, f.size * 0.7, 0]} scale={[1, 0.4, 1]} castShadow>
            <sphereGeometry args={[f.size * 0.6, 8, 6]} />
            <meshStandardMaterial color="#4a6b34" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Basil: layered rounded leaves ---------- */
function Basil({ seed }: { seed: string }) {
  const s = PLANT_CATALOG.basil;
  const leaves = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: 22 }).map((_, i) => {
      const level = Math.floor(i / 6);
      const angle = (i * 2.399) + rng() * 0.3;
      const r = s.footprintRadius * (0.35 + level * 0.18) * (0.8 + rng() * 0.4);
      const y = 0.08 + level * 0.11 + rng() * 0.04;
      const tilt = 0.3 + rng() * 0.4;
      return { angle, r, y, tilt, tone: LEAF_GREENS[(level + 1) % LEAF_GREENS.length] };
    });
  }, [seed, s]);

  return (
    <group>
      {/* central stem */}
      <mesh position={[0, s.height * 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.012, s.height * 0.8, 6]} />
        <meshStandardMaterial color="#557a3c" roughness={0.9} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          position={[Math.cos(l.angle) * l.r, l.y, Math.sin(l.angle) * l.r]}
          rotation={[l.tilt * Math.cos(l.angle), -l.angle, l.tilt * Math.sin(l.angle)]}
          castShadow
        >
          <sphereGeometry args={[0.055, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={l.tone} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Bush beans: compact bush with drooping pods ---------- */
function BushBeans({ seed }: { seed: string }) {
  const s = PLANT_CATALOG.bushBeans;
  const leaves = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: 16 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: s.footprintRadius * (0.25 + rng() * 0.7),
      y: s.height * (0.25 + rng() * 0.55),
      size: 0.07 + rng() * 0.04,
      tilt: 0.2 + rng() * 0.4,
      tone: LEAF_GREENS[Math.floor(rng() * LEAF_GREENS.length)],
    }));
  }, [seed, s]);
  const pods = useMemo(() => {
    const rng = makeRng(seed + "p");
    return Array.from({ length: 8 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: s.footprintRadius * (0.3 + rng() * 0.55),
      y: s.height * (0.25 + rng() * 0.35),
      len: 0.08 + rng() * 0.04,
      tilt: (rng() - 0.5) * 0.5,
    }));
  }, [seed, s]);

  return (
    <group>
      {/* base foliage mound */}
      <mesh position={[0, s.height * 0.28, 0]} scale={[1, 0.7, 1]} castShadow>
        <sphereGeometry args={[s.footprintRadius * 0.85, 12, 10]} />
        <meshStandardMaterial color={s.foliage} roughness={0.95} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          position={[Math.cos(l.a) * l.r, l.y, Math.sin(l.a) * l.r]}
          rotation={[l.tilt * Math.cos(l.a), -l.a, l.tilt * Math.sin(l.a)]}
          scale={[1.3, 0.5, 1]}
          castShadow
        >
          <sphereGeometry args={[l.size, 10, 8]} />
          <meshStandardMaterial color={l.tone} roughness={0.9} />
        </mesh>
      ))}
      {pods.map((p, i) => (
        <group
          key={i}
          position={[Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r]}
          rotation={[p.tilt, p.a, Math.PI / 2.3]}
        >
          <mesh position={[0, -p.len / 2, 0]} scale={[0.35, 1, 0.35]} castShadow>
            <sphereGeometry args={[p.len / 1.6, 10, 8]} />
            <meshStandardMaterial color={s.accent} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}


/* ---------- Strawberry: trifoliate leaves with berries ---------- */
function Strawberry({ seed }: { seed: string }) {
  const s = PLANT_CATALOG.strawberry;
  const groups = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: 7 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: rng() * s.footprintRadius * 0.85,
      tone: LEAF_GREENS[Math.floor(rng() * 3)],
    }));
  }, [seed, s]);
  const berries = useMemo(() => {
    const rng = makeRng(seed + "b");
    return Array.from({ length: 4 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: s.footprintRadius * (0.3 + rng() * 0.55),
      size: 0.024 + rng() * 0.012,
    }));
  }, [seed, s]);

  return (
    <group>
      {groups.map((g, i) => {
        const x = Math.cos(g.a) * g.r;
        const z = Math.sin(g.a) * g.r;
        return (
          <group key={i} position={[x, 0.05, z]} rotation={[0, g.a, 0]}>
            {[0, 1, 2].map((li) => {
              const la = (li - 1) * 0.9;
              return (
                <mesh
                  key={li}
                  position={[Math.cos(la) * 0.05, 0.06, Math.sin(la) * 0.05]}
                  rotation={[0.3, la, 0]}
                  scale={[1, 0.35, 1.3]}
                  castShadow
                >
                  <sphereGeometry args={[0.05, 10, 8]} />
                  <meshStandardMaterial color={g.tone} roughness={0.85} />
                </mesh>
              );
            })}
          </group>
        );
      })}
      {berries.map((b, i) => (
        <group
          key={i}
          position={[Math.cos(b.a) * b.r, 0.03, Math.sin(b.a) * b.r]}
        >
          <mesh castShadow scale={[1, 1.1, 1]}>
            <sphereGeometry args={[b.size, 10, 10]} />
            <meshStandardMaterial color={s.accent} roughness={0.55} />
          </mesh>
          <mesh position={[0, b.size * 0.9, 0]} scale={[1, 0.3, 1]}>
            <sphereGeometry args={[b.size * 0.7, 8, 6]} />
            <meshStandardMaterial color="#4a6b34" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Pepper: bushy with hanging fruit ---------- */
function Pepper({ seed }: { seed: string }) {
  const s = PLANT_CATALOG.pepper;
  const bits = useMemo(() => {
    const rng = makeRng(seed);
    const foliage = Array.from({ length: 12 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: s.footprintRadius * (0.35 + rng() * 0.6),
      y: s.height * (0.3 + rng() * 0.55),
      size: 0.09 + rng() * 0.05,
      tone: LEAF_GREENS[Math.floor(rng() * LEAF_GREENS.length)],
    }));
    const peppers = Array.from({ length: 5 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: s.footprintRadius * (0.3 + rng() * 0.5),
      y: s.height * (0.3 + rng() * 0.3),
    }));
    return { foliage, peppers };
  }, [seed, s]);

  return (
    <group>
      {/* main stem */}
      <mesh position={[0, s.height * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.02, s.height * 0.7, 6]} />
        <meshStandardMaterial color="#7a5a34" roughness={0.9} />
      </mesh>
      {bits.foliage.map((f, i) => (
        <mesh
          key={i}
          position={[Math.cos(f.a) * f.r, f.y, Math.sin(f.a) * f.r]}
          scale={[1.1, 0.7, 1.1]}
          castShadow
        >
          <sphereGeometry args={[f.size, 10, 8]} />
          <meshStandardMaterial color={f.tone} roughness={0.9} />
        </mesh>
      ))}
      {bits.peppers.map((p, i) => (
        <group
          key={i}
          position={[Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r]}
        >
          {/* hanging pepper: cone pointing down */}
          <mesh position={[0, -0.06, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.028, 0.11, 10]} />
            <meshStandardMaterial color={s.accent} roughness={0.5} />
          </mesh>
          {/* stem cap */}
          <mesh position={[0, -0.005, 0]} scale={[1, 0.4, 1]}>
            <sphereGeometry args={[0.026, 8, 6]} />
            <meshStandardMaterial color="#4a6b34" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Fruit tree: tapered trunk, layered canopy, fruit ---------- */
function FruitTree({ seed }: { seed: string }) {
  const s = PLANT_CATALOG.fruitTree;
  const trunkH = s.height * 0.42;

  const canopy = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: 9 }).map(() => ({
      a: rng() * Math.PI * 2,
      r: s.footprintRadius * (0.15 + rng() * 0.55),
      y: rng() * s.footprintRadius * 0.9,
      size: s.footprintRadius * (0.55 + rng() * 0.28),
      tone: LEAF_GREENS[Math.floor(rng() * LEAF_GREENS.length)],
    }));
  }, [seed, s]);
  const fruits = useMemo(() => {
    const rng = makeRng(seed + "f");
    return Array.from({ length: 12 }).map(() => {
      const a = rng() * Math.PI * 2;
      const r = s.footprintRadius * (0.35 + rng() * 0.55);
      const y = trunkH + s.footprintRadius * (0.3 + rng() * 0.9);
      return { a, r, y };
    });
  }, [seed, s, trunkH]);

  return (
    <group>
      {/* trunk (tapered) */}
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.09, trunkH, 10]} />
        <meshStandardMaterial color={BARK} roughness={0.95} />
      </mesh>
      {/* root flare */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.06, 10]} />
        <meshStandardMaterial color={BARK} roughness={0.95} />
      </mesh>
      {/* few visible branches poking through canopy */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.15, trunkH + 0.1, Math.sin(a) * 0.15]}
            rotation={[0, -a, 0.9]}
            castShadow
          >
            <cylinderGeometry args={[0.02, 0.03, 0.5, 6]} />
            <meshStandardMaterial color={BARK_LIGHT} roughness={0.95} />
          </mesh>
        );
      })}
      {/* layered canopy */}
      {canopy.map((c, i) => (
        <mesh
          key={i}
          position={[Math.cos(c.a) * c.r, trunkH + s.footprintRadius * 0.6 + c.y, Math.sin(c.a) * c.r]}
          castShadow
        >
          <sphereGeometry args={[c.size, 14, 12]} />
          <meshStandardMaterial color={c.tone} roughness={0.95} />
        </mesh>
      ))}
      {fruits.map((f, i) => (
        <mesh
          key={i}
          position={[Math.cos(f.a) * f.r, f.y, Math.sin(f.a) * f.r]}
          castShadow
        >
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={s.accent} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}
