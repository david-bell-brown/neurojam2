import { useAtom } from "jotai";
import {
  cAtomHealth,
  cAtomPlayerMachine,
  cAtomPosition,
  sendProxyAtom,
} from "../../utils/atoms";
import { focusAtom } from "jotai-optics";
import { useCallback, useMemo } from "react";
// import { useFrame } from "@react-three/fiber";
import {
  CollisionPayload,
  CuboidCollider,
  RigidBody,
} from "@react-three/rapier";

export default function Enemy({ id }: { id: string }) {
  const [positionAtom, healthAtom] = useMemo(() => {
    const position = focusAtom(cAtomPosition, optic => optic.prop(id));
    const health = focusAtom(cAtomHealth, optic => optic.prop(id));
    return [position, health];
  }, [id]);

  const [position, _setPosition] = useAtom(positionAtom);
  const [health, _setHealth] = useAtom(healthAtom);
  const [otherMachines] = useAtom(cAtomPlayerMachine);
  const [, sendProxy] = useAtom(sendProxyAtom);

  // useFrame(state => {
  //   setPosition([
  //     Math.sin(state.clock.getElapsedTime()) * 5,
  //     position[1],
  //     position[2],
  //   ]);
  // });

  const onIntersectionEnter = useCallback(
    ({ other }: CollisionPayload) => {
      if (!other.rigidBodyObject) {
        return;
      }
      console.log("Collision", other.rigidBodyObject.name);
      if (otherMachines[other.rigidBodyObject.name]) {
        const machine = otherMachines[other.rigidBodyObject.name];
        sendProxy([machine, { type: "hurt" }]);
      }
    },
    [otherMachines, sendProxy]
  );

  return (
    <RigidBody type="kinematicPosition" position={position} colliders={false}>
      <CuboidCollider
        args={[0.5, 0.5, 0.5]}
        position={[0, 0.5, 0]}
        sensor
        onIntersectionEnter={onIntersectionEnter}
      />
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={health > 0 ? "green" : "red"} />
      </mesh>
    </RigidBody>
  );
}
