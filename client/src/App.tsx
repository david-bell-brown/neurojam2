import { Canvas, Vector3 } from "@react-three/fiber";
import "./App.css";
import { Stage } from "./components/stage/Stage";
import {
  Grid,
  KeyboardControls,
  KeyboardControlsEntry,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense, useCallback, useEffect } from "react";
import Player from "./components/player/Player";
import { useAtomValue } from "jotai";
import { cAtomType } from "./utils/atoms";
import Enemy from "./components/enemy/Enemy";
import { useEnemyEntity } from "./components/enemy/entitySchema";
import { usePlayerEntity } from "./components/player/entitySchema";
import { useSpawnerEntity } from "./components/spawnerTile/entitySchema";
import SpawnerTile from "./components/spawnerTile/SpawnerTile";

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

const TypeRenderMap = {
  player: Player,
  enemy: Enemy,
  spawner: SpawnerTile,
};

function App() {
  const entities = useAtomValue(cAtomType);
  const { createEntity: createPlayer, destroyEntity: _destroyPlayer } =
    usePlayerEntity();
  const { createEntity: createEnemyEntity, destroyEntity: destroyEnemyEntity } =
    useEnemyEntity();
  const {
    createEntity: createSpawnerEntity,
    destroyEntity: destroySpawnerEntity,
  } = useSpawnerEntity();

  const spawnerCallback = useCallback(
    (spawnerId: string, pos: Vector3) => {
      createPlayer(pos, spawnerId);
    },
    [createPlayer]
  );

  useEffect(() => {
    const id1 = createEnemyEntity([-1, 0, 1], 5);
    const spawnerId = createSpawnerEntity([0, 0, -2], spawnerCallback, true);
    return () => {
      destroyEnemyEntity(id1);
      destroySpawnerEntity(spawnerId);
    };
  }, [
    createEnemyEntity,
    createSpawnerEntity,
    destroyEnemyEntity,
    destroySpawnerEntity,
    spawnerCallback,
  ]);

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
              {Object.entries(entities).map(([id, type]) => {
                if (!TypeRenderMap[type]) {
                  return null;
                }
                const Component =
                  TypeRenderMap[type as keyof typeof TypeRenderMap];
                return <Component key={id} id={id} />;
              })}
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
