import { Vector3 } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";
import { ReactNode } from "react";
import { cAtomBoolmap, cAtomPosition } from "../../utils/atoms";
import { useAtomValue } from "jotai";

function WallBody({
  children,
  position,
}: {
  children: ReactNode;
  position?: Vector3;
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      {children}
    </RigidBody>
  );
}

export default function Walls({ id }: { id: string }) {
  const [positionAtom, boolmapAtom] = useMemo(
    () => [
      focusAtom(cAtomPosition, optic => optic.prop(id)),
      focusAtom(cAtomBoolmap, optic => optic.prop(id)),
    ],
    [id]
  );
  const position = useAtomValue(positionAtom);
  const boolmap = useAtomValue(boolmapAtom);

  const walls = useMemo(
    () =>
      boolmap.flatMap((row, colIndex) =>
        row.map((wall, rowIndex) => ({
          wall,
          position: [rowIndex + 0.5, 0, colIndex + 0.5] as const,
        }))
      ),
    [boolmap]
  );
  return (
    <WallBody position={position}>
      {walls.map(
        ({ wall, position }) =>
          wall && (
            <group key={`${position}`} position={position}>
              <CuboidCollider args={[0.5, 0.5, 0.5]} position={[0, 0.5, 0]} />
              <mesh position={[0, 0.5, 0]} castShadow scale={[1, 1, 1]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            </group>
          )
      )}
    </WallBody>
  );
}
