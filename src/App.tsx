/// <reference types="vite-plugin-svgr/client" />
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Showcase, Controls, Stars } from "./3D";
import { motion, AnimatePresence } from "framer-motion";

import GitHubIcon from "./assets/github.svg?react";
import LinkedInIcon from "./assets/linkedin.svg?react";

const images = ["justtrampit.png", "racinggame.png", "portfolio.png"];
const projectInfo = [
  {
    title: "JustTrampIt",
    desc: "A tramp planning app built with JavaFX on a team of 5 for a second year Software Engineering project course.",
    link: "https://github.com/Ed-Leonard/JustTrampIt",
  },
  {
    title: "Racing Game",
    desc: "A very basic 2D game built with JavaFX and a partner completed as an introduction to Java at University.",
    link: "https://github.com/Ed-Leonard/SENG201-Game",
  },
  {
    title: "Portfolio",
    desc: "Inception... Built with React, Typescript, Tailwind, and React Three Fiber to create the interactive 3D scene.",
    link: "https://github.com/Ed-Leonard/Portfolio",
  },
];

function About({
  onProjectsClick,
  onLinksClick,
}: {
  onProjectsClick: () => void;
  onLinksClick: () => void;
}) {
  return (
    <div
      id="about"
      className="bg-[#3c3836] p-4 rounded-lg space-y-2 text-center border m-4"
    >
      <h1 className="text-2xl font-bold">Ed Leonard</h1>
      <p className="text-gray-200/80">
        2nd year Software Engineering student studying at the University of
        Canterbury
      </p>
      <ul className="inline-flex space-x-2 justify-center w-full">
        <li>
          <button
            className="animate-[pulse_2s_ease-in-out_5] hover:bg-white/20 p-2 rounded-sm"
            onClick={onProjectsClick}
          >
            Projects
          </button>
        </li>
        <li>
          <button
            className="hover:bg-white/20 p-2 rounded-sm"
            onClick={onLinksClick}
          >
            Links
          </button>
        </li>
      </ul>
    </div>
  );
}

function Links() {
  const iconStyle =
    "w-12 h-12 flex-no-shrink fill-[#24292f] hover:fill-white/80 transition duration-150";

  return (
    <div className="relative bg-[#3c3836] p-4 pb-3 rounded-lg border m-4">
      <ul className="inline-flex space-x-2 justify-center w-full">
        <li>
          <a href="https://github.com/Ed-Leonard">
            <GitHubIcon className={iconStyle} />
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/ed-leonard-902266375/">
            <LinkedInIcon className={iconStyle} />
          </a>
        </li>
      </ul>
    </div>
  );
}

function ProjectOverlay({
  selectedProject,
  onClose,
}: {
  selectedProject: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 rounded-lg z-10 overflow-y-auto"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <div className="min-h-full flex flex-col items-center justify-center bg-transparent p-6 gap-6">
        <div className="flex flex-row flex-wrap items-center justify-center gap-6 w-full">
          <img
            src={images[selectedProject]}
            alt={projectInfo[selectedProject].desc}
            className="rounded-lg border w-72 shrink-0 object-contain"
          />
          <div className="flex flex-col items-center justify-center text-center min-w-0">
            <h2 className="text-2xl font-bold mb-2">
              {projectInfo[selectedProject]?.title ?? "Unknown"}
            </h2>
            <p className="text-gray-300 mb-4 max-w-sm">
              {projectInfo[selectedProject]?.desc ?? ""}
            </p>
            <a
              href={projectInfo[selectedProject].link}
              className="text-blue-400 hover:text-blue-300 hover:underline break-all"
            >
              {projectInfo[selectedProject].link}
            </a>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-white/10 hover:bg-white/80 hover:text-[#282828] rounded-lg border transition-all"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

export function App() {
  const [showProjects, setShowProjects] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  return (
    <div className="min-h-screen justify-center flex flex-col bg-[#282828] transition-all overflow-hidden p-4">
      <motion.div className="flex flex-col items-center justify-center bg-[#282828] text-white transition-all h-auto">
        <About
          onProjectsClick={() => setShowProjects(!showProjects)}
          onLinksClick={() => setShowLinks(!showLinks)}
        />
        <AnimatePresence initial={false}>
          {showProjects && (
            <motion.div
              key="projects-content"
              id="projects"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 500 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full md:w-2/3 bg-[#3c3836] rounded-lg border overflow-visible"
            >
              <p
                className="absolute border rounded-lg max-w-64 m-4 p-2"
                style={{ animation: "hint 8s ease-in-out forwards" }}
              >
                Click and drag to interact with the 3D environment. Use your
                scroll wheel to zoom.
              </p>
              <button
                className="absolute top-4 right-4 z-20 bg-white/10 pb-0.5 rounded-full w-7 h-7 hover:bg-white/80 hover:text-[#282828] border transition-all"
                onClick={() => setShowProjects(false)}
              >
                x
              </button>
              <Canvas
                gl={{ antialias: true }}
                camera={{ position: [0, 50, 50] }}
              >
                <ambientLight
                  color="white"
                  position={[2, 0, 10]}
                  intensity={0.1}
                />
                <Stars />
                <Controls />
                <Showcase
                  onSelect={setSelectedProject}
                  visible={selectedProject == null}
                />
              </Canvas>
              <AnimatePresence>
                {selectedProject != null && (
                  <ProjectOverlay
                    selectedProject={selectedProject}
                    onClose={() => setSelectedProject(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {showLinks && (
            <motion.div
              key="links-content"
              id="links"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Links />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
