import { useLoader, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from "three";
import { useMemo, useState, useRef } from "react";
import { TextureLoader } from 'three';
import { useSpring, a, animated } from '@react-spring/three';


const images = ['justtrampit.png', 'racinggame.png', 'portfolio.png']

const RADIUS = 25

interface PlaneMeshProps {
	i: number;
	x: number;
	y: number;
	z: number;
	quaternion: THREE.Quaternion;
	onClick: (index: number) => void;
}

export function PlaneMesh({ i, x, y, z, quaternion, onClick }: PlaneMeshProps) {
	const texture = useLoader(TextureLoader, i < images.length ? images[i] : images[0]);
	const [hovered, setHovered] = useState(false);
	const [clicked, setClicked] = useState(false);
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
				const px = ((xi / segmentsX) - 0.5) * fixedWidth;
				const py = ((yi / segmentsY) - 0.5) * imageHeight;
				const r2 = px * px + py * py;
				const zVal = r2 >= RADIUS * RADIUS ? 0 : -Math.sqrt(RADIUS * RADIUS - r2) + RADIUS;
				positions.push(zVal);
			}
		}
		return positions;
	}, [fixedWidth, imageHeight]);

	const { hoverFactor } = useSpring({
		hoverFactor: hovered ? 0 : 1,
		config: { tension: 200, friction: 25 }
	});

	const { scale } = useSpring({
		scale: hovered ? [-1.4, 1.4, 1.4] : [-1, 1, 1],
		config: { tension: 200, friction: 20 }
	});

	const geometry = useMemo(() => new THREE.PlaneGeometry(fixedWidth, imageHeight, 20, 20), [fixedWidth, imageHeight]);

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

	const handlePointerOver = () => !clicked && setHovered(true);
	const handlePointerOut = () => !clicked && setHovered(false);
	const handleClick = () => {
		onClick(i);
	};

	document.body.style.cursor = hovered ? 'pointer' : 'auto';

	return (
		<a.group
			position={[x, y, z]}
			quaternion={quaternion}
			onPointerOver={handlePointerOver}
			onPointerOut={handlePointerOut}
			onClick={handleClick}
			scale={scale as any}
		>
			<mesh ref={meshRef} geometry={geometry} position={[0, -((totalHeight - imageHeight) / 2), 0]}>
				<meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
			</mesh>
		</a.group>
	);
}
export const Showcase = ({ onSelect }: { onSelect: (index: number | null) => void }) => {
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
						new THREE.Vector3(0, 1, 0)
					)
				);
				if (i < images.length) {
					return <PlaneMesh key={i} i={i} x={x} y={y} z={z} quaternion={quaternion} onClick={() => onSelect(i)} />;
				}
			})}
		</>
	);
};

export const Controls = () => {
	return (<OrbitControls
		makeDefault
		target={[0, 0, 0]}
		enablePan={false}
		enableZoom={true}
		enableRotate={true}
		minDistance={35}
		maxDistance={60}
	/>)

}
