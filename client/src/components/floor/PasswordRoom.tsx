// import { Vector3 } from "@react-three/fiber";
import { RealRoom } from "@app/lib";
import { useMemo } from "react";

const hallwayTiles = [
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
];

type Props = {
  room: RealRoom;
};
export default function Room({ room }: Props) {
  const { id, x, z, width, height } = room;
  const hallwayWalls = useMemo(
    () =>
      hallwayTiles.flatMap((row, colIndex) =>
        row.map((wall, rowIndex) => ({
          wall,
          position: [rowIndex, 0, colIndex] as const,
        }))
      ),
    []
  );
  return (
    <>
      <group position={[x, 0, z]}>
        {/* Walls */}
        <group
          position={[
            Math.floor(width / 2) -
              Math.floor(hallwayTiles[0].length / 2) +
              0.5,
            0,
            height - hallwayTiles.length + 0.5,
          ]}
        >
          {/* <WallBody>
            {hallwayWalls.map(
              ({ wall, position }) =>
                wall && <Wall key={`${position}`} position={position} />
            )}
          </WallBody> */}
        </group>
        <mesh
          position={[width / 2, 0.1, height / 2]}
          rotation={[Math.PI / -2, 0, 0]}
        >
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color={"blue"} />
        </mesh>
      </group>
      {/* {torches.map(({ id, x, z }) => (
        <Torch key={id} position={[x, 0, z]} />
      ))} */}
    </>
  );
}
