import { RigidBody } from "@react-three/rapier";
import { Wall, WallBody } from "../wall/Wall";

const tiles = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 1, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 2, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 2, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export function Stage() {
  return (
    <group>
      <ambientLight intensity={0.1} />

      <RigidBody type="fixed">
        <mesh rotation={[Math.PI / -2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshLambertMaterial color="#eeeeee" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <WallBody>
        {tiles.map((row, colIndex) =>
          row.map(
            (tile, rowIndex) =>
              tile === 1 && (
                <Wall
                  key={`${rowIndex}-${colIndex}`}
                  position={[rowIndex - 5, 0, colIndex - 5]}
                  height={1.5}
                />
              )
          )
        )}
      </WallBody>
      {/* Torches */}
      {tiles.map((row, colIndex) =>
        row.map(
          (tile, rowIndex) =>
            tile === 2 && (
              <group
                key={`${rowIndex}-${colIndex}`}
                position={[rowIndex - 5, 0, colIndex - 5]}
              >
                <mesh position={[0, 0.25, 0]}>
                  <boxGeometry args={[0.1, 0.5, 0.1]} />
                  <meshStandardMaterial color="orange" />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                  <sphereGeometry args={[0.1, 4, 4]} />
                  <meshStandardMaterial
                    color="orange"
                    emissive="orange"
                    emissiveIntensity={2}
                  />
                </mesh>
                <pointLight
                  castShadow
                  intensity={2}
                  position={[0, 0.5, 0]}
                  color={"#FCE5CE"}
                  shadow-mapSize={512}
                  shadow-camera-near={0.1}
                />
              </group>
            )
        )
      )}
    </group>
  );
}
