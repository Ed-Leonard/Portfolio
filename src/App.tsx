/// <reference types="vite-plugin-svgr/client" />
import { Canvas } from '@react-three/fiber'
import { useState, useEffect } from "react"
import { Showcase, Controls } from "./3D"

import GitHubIcon from './github.svg?react'
import LinkedInIcon from './linkedin.svg?react'

function About({ onProjectsClick, onLinksClick }: { onProjectsClick: () => void, onLinksClick: () => void }) {
	return (
		<div id="about" className='bg-[#3c3836] p-5 rounded-lg space-y-2 text-center border'>
			<h1 className='text-2xl font-bold'>
				Ed Leonard
			</h1>
			<p className='text-gray-200/80'>2nd year Software Engineering student studying at the University of Canterbury</p>
			<ul className='inline-flex space-x-8 justify-center w-full'>
				<li> <button onClick={onProjectsClick} >Projects</button> </li>
				<li> <button onClick={onLinksClick} >Links</button> </li>
			</ul>
		</div>
	)
}

function Links() {
	const iconStyle = 'w-12 h-12 flex-no-shrink fill-[#24292f] hover:fill-white/80 transition duration 150'

	return (
		<div className='relative bg-[#3c3836] p-4 pb-3 rounded-lg border'>
			<ul className='inline-flex space-x-2 justify-center w-full'>
				<li> <a href='https://github.com/Ed-Leonard'> <GitHubIcon className={iconStyle} /> </a> </li>
				<li> <a href='https://www.linkedin.com/in/ed-leonard-902266375/' > <LinkedInIcon className={iconStyle} /> </a> </li>
			</ul>
		</div>
	)
}

function ProjectOverlay({
	selectedProject,
	onClose,
}: {
	selectedProject: number;
	onClose: () => void;
}) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const t = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(t);
	}, []);

	const images = ['justtrampit.png', 'racinggame.png', 'portfolio.png'];
	const projectInfo = [
		{ title: "JustTrampIt", desc: "A tramp planning app built with JavaFX with a team of 5 people for a second year Software Engineering project course.", link: "https://github.com/Ed-Leonard/JustTrampIt" },
		{ title: "Racing Game", desc: "A very basic 2D game built with JavaFX with a partner completed as an introduction to Java.", link: "https://github.com/Ed-Leonard/SENG201-Game" },
		{ title: "Portfolio", desc: "Inception... Built with React, Typescript, Tailwind, and React Three Fiber to create the interactive 3D scene. Because it's fun.", link: "https://github.com/Ed-Leonard/Portfolio" },
	];

	function handleClose() {
		setVisible(false);
		setTimeout(onClose, 500);
	}

	return (
		<div
			className={`
        flex flex-col absolute rounded-lg inset-0 items-center justify-center bg-[#3c3836]
        z-10 px-8 space-y-8
        transform transition-all duration-500 ease-out origin-center
        ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}
		>
			<div className="flex flex-row justify-between space-x-4 py-4">
				<img
					src={images[selectedProject]}
					alt={projectInfo[selectedProject].desc}
					width="400"
					className="rounded-lg"
				/>
				<div className="flex flex-col items-center justify-center">
					<h2 className="text-2xl font-bold mb-2">
						{projectInfo[selectedProject]?.title ?? "Unknown"}
					</h2>
					<p className="text-gray-300 mb-6 max-w-sm text-center">
						{projectInfo[selectedProject]?.desc ?? ""}
					</p>
				</div>
			</div>
			<a
				href={projectInfo[selectedProject].link}
				className="text-blue-400 hover:text-blue-300 hover:underline"
			>
				{projectInfo[selectedProject].link}
			</a>
			<button
				className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md"
				onClick={handleClose}
			>
				Close
			</button>
		</div>
	);
}

export function App() {
	const [projects, showProjects] = useState(true)
	const [links, showLinks] = useState(true)
	const [selectedProject, setSelectedProject] = useState<number | null>(null)

	return (
		<div className='min-h-screen justify-center flex flex-col bg-[#282828] transition-all overflow-hidden p-4'>
			<div className="flex flex-col items-center space-y-4 justify-center bg-[#282828] text-white transition-all duration-75">
				<About
					onProjectsClick={() => showProjects(!projects)}
					onLinksClick={() => showLinks(!links)}
				/>
				{projects &&
					<div id="projects" className="relative h-140 w-full md:w-2/3 bg-[#3c3836] rounded-lg border">
						<p className='absolute border rounded-lg max-w-64 m-4 p-2 animate-[pulse_2s_ease-in-out_5]' >Click and drag to interact with the 3D environment. Use your scroll wheel to zoom.</p>
						<button className='absolute top-2 right-2 z-20 bg-white/10 pb-0.5 rounded-full w-7 h-7 hover:bg-white/80 hover:text-[#282828]' onClick={() => showProjects(false)}>x</button>
						<Canvas gl={{ antialias: true }} camera={{ position: [0, 50, 50] }} >
							<ambientLight color="white" position={[2, 0, 10]} intensity={0.1} />
							<Controls />
							<Showcase onSelect={setSelectedProject} />
						</Canvas>
						{selectedProject != null && (
							<ProjectOverlay selectedProject={selectedProject} onClose={() => setSelectedProject(null)} />
						)}
					</div >
				}
				{links && <Links />}
			</div >
		</div >
	)
}

export default App
