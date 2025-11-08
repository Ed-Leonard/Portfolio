/// <reference types="vite-plugin-svgr/client" />
import { Canvas } from '@react-three/fiber'
import { useState } from "react"
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
				<li>
					<a href='https://github.com/Ed-Leonard'>
						<GitHubIcon className={iconStyle} />
					</a>
				</li>

				<li>
					<a href='https://www.linkedin.com/in/ed-leonard-902266375/' >
						<LinkedInIcon className={iconStyle} />
					</a>
				</li>
			</ul>
		</div>
	)
}

export function App() {
	const [projects, showProjects] = useState(true)
	const [links, showLinks] = useState(true)

	return (
		<div className='min-h-screen justify-center flex flex-col bg-[#282828] transition-all'>
			<div className="flex flex-col items-center space-y-4 justify-center bg-[#282828] text-white transition-all duration-75">
				<About
					onProjectsClick={() => showProjects(!projects)}
					onLinksClick={() => showLinks(!links)}
				/>
				{projects &&
					<div id="projects" className="relative h-150 bg-[#3c3836] w-3/4 rounded-lg">
						<p className='absolute border rounded-lg max-w-64 m-4 p-2 animate-pulse-short' >Click and drag to interact with the 3D environment. Use your scroll wheel to zoom.</p>
						<button className='absolute top-2 right-2 z-10 bg-white/10 rounded-full w-6 h-6 hover:bg-white/20' onClick={() => showProjects(false)}>x</button>
						<Canvas gl={{ antialias: true }}>
							<ambientLight color="white" position={[2, 0, 10]} intensity={0.1} />
							<Controls />
							<Showcase />
						</Canvas>
					</div >
				}
				{links && <Links />}
			</div >
		</div >
	)
}

export default App
