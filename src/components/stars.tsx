import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const Points = () => {
	const count = 5000;

	// This reference gives us direct access to our points
	const points = useRef<THREE.Points>(null!);

	// Generate our positions attributes array
	const particlesPosition = useMemo(() => {
		const positions = new Float32Array(count * 3);
		const distance = 100;

		for (let i = 0; i < count; i++) {
			const theta = THREE.MathUtils.randFloatSpread(360);
			const phi = THREE.MathUtils.randFloatSpread(360);

			const x = distance * Math.sin(theta) * Math.cos(phi)
			const y = distance * Math.sin(theta) * Math.sin(phi);
			const z = distance * Math.cos(theta);

			positions.set([x, y, z], i * 3);
		}


		return positions;
	}, [count]);

	useFrame((state) => {
		const { clock } = state;

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;


			points.current.geometry.attributes.position.array[i3] += Math.sin(clock.elapsedTime + Math.random() * 5) * 0.01;
			points.current.geometry.attributes.position.array[i3 + 1] += Math.cos(clock.elapsedTime + Math.random() * 5) * 0.01;
			points.current.geometry.attributes.position.array[i3 + 2] += Math.sin(clock.elapsedTime + Math.random() * 5) * 0.01;
		}

		points.current.geometry.attributes.position.needsUpdate = true;
	});

	return (
		<points ref={points}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={particlesPosition.length / 3}
					array={particlesPosition}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial size={0.012} color="white" sizeAttenuation depthWrite={false} />
		</points>
	);
};


export default Points;
