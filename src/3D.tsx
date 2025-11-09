import { useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from "three";
import { useMemo, useState, useRef } from "react";
import { TextureLoader } from 'three';
import { useSpring, a, animated, easings } from '@react-spring/three';


enum Projects {
	JUSTTRAMPIT = 0,
	RACINGGAME,
}

const images = ['/justtrampit.png']

const BEND = 1.9;

function PlaneMesh({ i, x, y, z, quaternion }: { i: number; x: number; y: number; z: number; quaternion: THREE.Quaternion; }) {
	const texture = useLoader(TextureLoader, images[0]);

	const memoTexture = useMemo(() => {
		return texture
	}, [texture]);

	const [hovered, hover] = useState(false)
	const [clicked, click] = useState(false)
	const pointerOver = () => (!clicked && hover(true), pointerOver)
	const pointerOut = () => hover(false)
	const pointerClicked = () => (clicked ? (click(false), hover(false)) : (click(true), hover(false)))
	const { scale } = useSpring<{ scale: [number, number, number] }>({
		scale: hovered ? [-1.2, 1.2, 1.2] : clicked ? [-2, 2, 2] : [-1, 1, 1],
		config: { tension: 300, friction: 20 },
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
			const z = -(Math.abs(BEND * Math.cos(x / (fixedWidth / Math.PI) + Math.PI)) + Math.abs(Math.cos(y / (imageHeight / Math.PI) + Math.PI)));

			pos.setXYZ(i, x, y, z);
		}
		return geo;
	}, [fixedWidth, imageHeight]);

	// Animate image opacity
	const { opacity } = useSpring({
		opacity: clicked ? 0 : 1,
		from: { opacity: clicked ? 1 : 0 },
		config: {
			duration: 2500,
			easing: easings.easeInOutCubic
		},
	});

	document.body.style.cursor = hovered || clicked ? 'pointer' : 'auto';

	return (
		<a.group position={clicked ? [x, y, z + 1] : [x, y, z]} quaternion={quaternion} scale={scale} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={pointerClicked}>
			<mesh ref={imageRef} position={[0, -((totalHeight - imageHeight) / 2), 0]} geometry={imageGeometry}>
				<animated.meshBasicMaterial
					{...({
						map: memoTexture,
						transparent: true,
						side: THREE.BackSide,
						opacity,
					} as any)}
				/>
			</mesh>
		</a.group>
	);
}

export const Showcase = () => {
	const count = 4;
	const radius = 25

	const pointPositions = useMemo(() => {
		const geometry = new THREE.SphereGeometry(radius, count, count);
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

				return <PlaneMesh key={i} i={i} x={x} y={y} z={z} quaternion={quaternion} />;
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
		minDistance={40}
		maxDistance={60}
	/>)

}
