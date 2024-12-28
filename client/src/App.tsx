import { Canvas } from "@react-three/fiber";
import "./App.css";
import { Stage } from "./components/stage/Stage";
import {
  Grid,
  KeyboardControls,
  KeyboardControlsEntry,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import Player from "./components/player/Player";

enum Controls {
  moveUp = "moveUp",
  moveDown = "moveDown",
  moveLeft = "moveLeft",
  moveRight = "moveRight",
}

const controlMap: KeyboardControlsEntry<Controls>[] = [
  { name: Controls.moveUp, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.moveDown, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.moveLeft, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.moveRight, keys: ["ArrowRight", "KeyD"] },
];

function App() {
  return (
    <KeyboardControls map={controlMap}>
      <div id="canvas-container">
        <Canvas
          camera={{
            fov: 30,
            near: 0.1,
            far: 1000,
            position: [0, 15, 15],
          }}
          shadows
        >
          <OrbitControls />
          <Suspense>
            <Physics debug>
              <Stage />
              <Player initialPosition={[0, 0, 0]} />
              <Grid
                cellSize={1}
                cellThickness={1}
                cellColor={"#6f6f6f"}
                sectionSize={10}
                position={[0, 0.05, 0]}
                infiniteGrid
              />
            </Physics>
          </Suspense>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default App;
