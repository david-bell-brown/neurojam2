import { Canvas } from "@react-three/fiber";
import "./App.css";
import { Stage } from "./components/stage/Stage";
import { OrbitControls } from "@react-three/drei";
import { trpc } from "./utils/trpc";
import { useAtom } from "jotai";

const randomAtom = trpc.post.randomNumber.atomWithSubscription();

function App() {
  const [random] = useAtom(randomAtom);
  return (
    <div id="canvas-container">
      <Canvas
        camera={{
          fov: 60,
          near: 0.1,
          far: 1000,
          position: [0, 10, 40],
        }}
        shadows
      >
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <Stage />
        <mesh position={[20, 5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshLambertMaterial color="red" />
        </mesh>
        <mesh
          position={[random.randomNumber * 10, 1, random.randomNumber * 10]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshLambertMaterial color="red" />
        </mesh>
      </Canvas>
    </div>
  );
}

export default App;
