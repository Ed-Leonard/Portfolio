import { useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from "three";
import { useMemo, useState, useRef } from "react";
import { TextureLoader } from 'three';
import { useSpring, a, animated } from '@react-spring/three';


const images = ['justtrampit.png', 'racinggame.png', 'portfolio.png']

const RADIUS = 25

function PlaneMesh({ i, x, y, z, quaternion, onClick }: { i: number; x: number; y: number; z: number; quaternion: THREE.Quaternion; onClick: (index: number) => void }) {
	const texture = useLoader(TextureLoader, i < images.length ? images[i] : images[0]);

	const memoTexture = useMemo(() => {
		return texture
	}, [texture]);

	const [hovered, hover] = useState(false)
	const pointerOver = () => (hover(true), pointerOver)
	const pointerOut = () => hover(false)
	const pointerClicked = () => {
		onClick(i)
	}

	const { scale } = useSpring<{ scale: [number, number, number] }>({
		scale: hovered ? [-1.2, 1.2, 1.2] : [-1, 1, 1],
		config: { tension: 200, friction: 20 },
	})


	const aspect = texture.image.width / texture.image.height;
	let fixedWidth = 20;
	let imageHeight = 15;

	if (aspect >= 1) {
		imageHeight = fixedWidth / aspect;
	} else {
		fixedWidth = imageHeight * aspect;
	}

	const headerPadding = 1;
	const totalHeight = imageHeight + headerPadding;


	const imageRef = useRef<THREE.PlaneGeometry>(null);

	const imageGeometry = useMemo(() => {
		const geo = new THREE.PlaneGeometry(fixedWidth, imageHeight, 20, 20);
		const pos = geo.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const y = pos.getY(i);

			const r2 = x * x + y * y;
			let z;
			if (r2 >= RADIUS * RADIUS) {
				z = 0;
			} else {
				z = -Math.sqrt(RADIUS * RADIUS - r2) + RADIUS;
			}

			pos.setXYZ(i, x, y, z);
		}
		return geo;
	}, [fixedWidth, imageHeight]);

	document.body.style.cursor = hovered ? 'pointer' : 'auto';

	return (
		<a.group position={[x, y, z]} quaternion={quaternion} scale={scale} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={pointerClicked}>
			<mesh ref={imageRef} position={[0, -((totalHeight - imageHeight) / 2), 0]} geometry={imageGeometry}>
				<animated.meshBasicMaterial
					{...({
						map: memoTexture,
						transparent: true,
						side: THREE.DoubleSide,
					} as any)}
				/>
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
