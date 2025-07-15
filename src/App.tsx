import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import Points from './components/stars';
import * as THREE from "three";
import { useMemo, useState, useRef, useEffect } from "react";
import { TextureLoader } from 'three';
import { useSpring, a, animated, easings } from '@react-spring/three';


const descriptions = ['A simple racing game written in Java using JavaFX']

const BEND = 1.9;


function Foreground({ onClick }: { onClick: () => void }) {
	return (
		<div id='fadeInDiv' className='absolute z-10 flex h-full w-full text-white transition-discrete duration-5500 items-center justify-center'>
			<div className=' grid grid-cols-1 grid-rows-2 items-center justify-items-center text-center opacity-100'>
				<h1 className='mb-10 text-2xl transition-discrete duration-1000 ease-in-out text-shadow-[-2px_-2px_8px_rgb(255_255_255_/_0.75)]'>
					I'm Ed Leonard, a 2nd year Software Engineering student studying at the University of Canterbury. The majority of my experience is in front end devlopment using React. Check out my projects here or have a look at my links.
				</h1>
				<ul>
					My Links
					<li>
						<a href='https://github.com/Ed-Leonard' target="_blank">
							Github
						</a>
					</li>
					<li>
						<a href='https://www.linkedin.com/in/ed-leonard-902266375/'>
							LinkedIn
						</a>
					</li>
					<li>

					</li>
				</ul>
				<button onClick={onClick} className='text-5xl mt-10 w-30 opacity-100 animate-pulse border-2 border-white/50 rounded-2xl bg-slate-500/20 p-2 duration-500 ease-in-out hover:w-35 hover:animate-none hover:p-3 text-shadow-lg text-shadow-white/50'>
					Projects
				</button>
			</div>
		</div>
	)
}

function PlaneMesh({ i, x, y, z, quaternion, cameraRef }: { i: number; x: number; y: number; z: number; quaternion: THREE.Quaternion; cameraRef: any; }) {
	const texture = useLoader(TextureLoader, `/img2_.png`);


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

	const frameRef = useRef<THREE.PlaneGeometry>(null);

	const imageRef = useRef<THREE.PlaneGeometry>(null);

	const cameraRotate = clicked ? cameraRef.current.enableRotate(false) : cameraRef.current.enableRotate(true);

	const frameGeometry = useMemo(() => {
		const geo = new THREE.PlaneGeometry(fixedWidth, totalHeight, 20, 20);
		const pos = geo.attributes.position;
		for (let i = 0; i < pos.count; i++) {

			const x = pos.getX(i);
			const y = pos.getY(i);
			const z = (Math.abs(BEND * Math.cos(x / (fixedWidth / Math.PI) + Math.PI)) + Math.abs((totalHeight / imageHeight) * Math.cos(y / (totalHeight / Math.PI) + Math.PI))) - 0.15;

			pos.setXYZ(i, x, y - 0.21, z);
		}
		return geo;
	}, [fixedWidth, totalHeight, imageHeight]);

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

	const framePosition = new THREE.Vector3(0, 0, clicked ? -0.21 : 0.01);

	document.body.style.cursor = hovered || clicked ? 'pointer' : 'auto';

	useEffect(() => {
		console.log(cameraRef)

	}, [cameraRef]);

	return (
		<a.group position={clicked ? [x, y, z + 1] : [x, y, z]} quaternion={quaternion} scale={scale} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={pointerClicked}>
			{/* Text in header space */}
			<Text
				fontSize={0.5}
				position={[0, totalHeight / 2 - headerPadding / 2, 0]}
				anchorX="center"
				anchorY="middle"
				color="black"
			>
				{descriptions[i]}
			</Text>

			{/* Frame */}
			<animated.mesh ref={frameRef} geometry={frameGeometry} position={framePosition} rotation={[Math.PI + 0.025, 0, 0]} >
				<animated.meshBasicMaterial
					color={'white'}
					transparent
					opacity={clicked ? 1 : opacity}
				/>
			</animated.mesh>


			{/* Image with fade-in */}
			<mesh ref={imageRef} position={[0, -((totalHeight - imageHeight) / 2), 0]} geometry={imageGeometry}>
				<animated.meshBasicMaterial
					map={memoTexture}
					transparent
					side={THREE.BackSide}
					opacity={opacity}
				/>
			</mesh>
		</a.group>
	);
}

const Showcase = (cameraRef: any) => {
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

				return <PlaneMesh key={i} i={i} x={x} y={y} z={z} quaternion={quaternion} cameraRef={cameraRef} />;
			})}
		</>
	);
};

const Controls = ({ cameraRef }) => {

	return (<OrbitControls
		makeDefault
		ref={cameraRef}
		target={[0, 0, 0]}
		enablePan={false}
		enableZoom={false}
		enableRotate={true}
		minDistance={45}
		maxDistance={45}
	/>)

}

export function App() {
	const [show, setShow] = useState(false);
	const cameraRef = useRef<any>(null);

	return (
		<>
			{!show && <Foreground onClick={() => setShow(true)} />}
			<Canvas style={{ background: 'black' }} className='z-0' gl={{ antialias: true }}>
				<ambientLight color="white" position={[2, 0, 10]} intensity={0.1} />
				<Points />
				<Controls cameraRef={cameraRef} />
				{show && <Showcase cameraRef={cameraRef} />}
			</Canvas>
		</>
	)
}

export default App
