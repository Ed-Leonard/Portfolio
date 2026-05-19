import { useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState, useRef } from "react";
import { TextureLoader } from "three";
import { useSpring, a, SpringValue } from "@react-spring/three";

const images = ["justtrampit.png", "racinggame.png", "portfolio.png"];

const RADIUS = 25;

interface PlaneMeshProps {
  i: number;
  x: number;
  y: number;
  z: number;
  quaternion: THREE.Quaternion;
  onClick: (index: number) => void;
  opacity: SpringValue<number>;
}

export function PlaneMesh({
  i,
  x,
  y,
  z,
  quaternion,
  onClick,
  opacity,
}: PlaneMeshProps) {
  const texture = useLoader(
    TextureLoader,
    i < images.length ? images[i] : images[0],
  );
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  let fixedWidth = 20;
  let imageHeight = 15;
  const aspect = texture.image.width / texture.image.height;
  if (aspect >= 1) {
    imageHeight = fixedWidth / aspect;
  } else {
    fixedWidth = imageHeight * aspect;
  }

  const headerPadding = 1;
  const totalHeight = imageHeight + headerPadding;

  const baseZPositions = useMemo(() => {
    const positions: number[] = [];
    const segmentsX = 20;
    const segmentsY = 20;

    for (let yi = 0; yi <= segmentsY; yi++) {
      for (let xi = 0; xi <= segmentsX; xi++) {
        const px = (xi / segmentsX - 0.5) * fixedWidth;
        const py = (yi / segmentsY - 0.5) * imageHeight;
        const r2 = px * px + py * py;
        const zVal =
          r2 >= RADIUS * RADIUS ? 0 : -Math.sqrt(RADIUS * RADIUS - r2) + RADIUS;
        positions.push(zVal);
      }
    }
    return positions;
  }, [fixedWidth, imageHeight]);

  const { hoverFactor } = useSpring({
    hoverFactor: hovered ? 0 : 1,
    config: { tension: 200, friction: 25 },
  });

  const { scale } = useSpring({
    scale: hovered ? [-1.4, 1.4, 1.4] : [-1, 1, 1],
    config: { tension: 200, friction: 20 },
  });

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(fixedWidth, imageHeight, 20, 20),
    [fixedWidth, imageHeight],
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    const factor = hoverFactor.get();

    for (let i = 0; i < pos.count; i++) {
      const baseZ = baseZPositions[i];
      const zVal = baseZ * factor;
      pos.setZ(i, zVal);
    }
    pos.needsUpdate = true;
  });

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);
  const handleClick = () => {
    onClick(i);
  };

  document.body.style.cursor = hovered ? "pointer" : "auto";

  return (
    <a.group
      position={[x, y, z]}
      quaternion={quaternion}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      scale={scale as any}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, -((totalHeight - imageHeight) / 2), 0]}
      >
        <a.meshBasicMaterial
          map={texture as any}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </a.group>
  );
}
export const Showcase = ({
  onSelect,
  visible,
}: {
  onSelect: (index: number | null) => void;
  visible: boolean;
}) => {
  const { opacity } = useSpring({
    opacity: visible ? 1 : 0,
    config: { duration: 300 },
  });

  const count = 4;

  const pointPositions = useMemo(() => {
    const geometry = new THREE.SphereGeometry(RADIUS, count, count);
    const posAttr = geometry.attributes.position;
    const positions: [number, number, number][] = [];

    const seen = new Set<string>();

    for (let i = 0; i < posAttr.count; i++) {
      const x = parseFloat(posAttr.getX(i).toFixed(3));
      const y = parseFloat(posAttr.getY(i).toFixed(3));
      const z = parseFloat(posAttr.getZ(i).toFixed(3));

      const key = `${x},${y},${z}`;

      if (!seen.has(key)) {
        seen.add(key);
        positions.push([x, y, z]);
      }
    }

    return positions;
  }, [count]);

  return (
    <>
      {pointPositions.map(([x, y, z], i) => {
        const position = new THREE.Vector3(x, y, z);

        const quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            new THREE.Vector3(0, 0, 0),
            position,
            new THREE.Vector3(0, 1, 0),
          ),
        );
        if (i < images.length) {
          return (
            <PlaneMesh
              key={i}
              i={i}
              x={x}
              y={y}
              z={z}
              quaternion={quaternion}
              onClick={() => onSelect(i)}
              opacity={opacity}
            />
          );
        }
      })}
    </>
  );
};

function createStarTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy) / (size / 2);
      const alpha = Math.max(0, 1 - dist) ** 2;

      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.floor(alpha * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function Stars({ count = 300 }) {
  const meshRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createStarTexture(), []);

  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 300;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 100;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    return arr;
  });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.02;
    meshRef.current.rotation.x += delta * 0.005;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        map={texture}
        transparent
        opacity={0.9}
        depthWrite={false}
        depthTest={false}
        sizeAttenuation
      />
    </points>
  );
}

export const Controls = () => {
  return (
    <OrbitControls
      makeDefault
      target={[0, 0, 0]}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={35}
      maxDistance={60}
    />
  );
};
