import { useFrame } from "@react-three/fiber";
import PlayerRender from "./PlayerSprite";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { Vector3 as ThreeVector3 } from "three";
import { useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import {
  cAtomDirection,
  cAtomHealth,
  cAtomPlayerMachine,
  cAtomPosition,
  Direction,
  cAtomMoveSpeed,
  cAtomNearestSpawner,
} from "../../utils/atoms";
import useRespawnBehaviour from "./useRespawnBehaviour";

type PlayerProps = {
  id: string;
};

export default function Player({ id }: PlayerProps) {
  const [
    positionAtom,
    healthAtom,
    directionAtom,
    machineAtomAtom,
    moveSpeedAtom,
    nearestSpawnerAtom,
  ] = useMemo(
    () => [
      focusAtom(cAtomPosition, optic => optic.prop(id)),
      focusAtom(cAtomHealth, optic => optic.prop(id)),
      focusAtom(cAtomDirection, optic => optic.prop(id)),
      focusAtom(cAtomPlayerMachine, optic => optic.prop(id)),
      focusAtom(cAtomMoveSpeed, optic => optic.prop(id)),
      focusAtom(cAtomNearestSpawner, optic => optic.prop(id)),
    ],
    [id]
  );

  const [position, _setPosition] = useAtom(positionAtom);
  const [health, _setHealth] = useAtom(healthAtom);
  const [direction, setDirection] = useAtom(directionAtom);
  const [machineAtom] = useAtom(machineAtomAtom);
  const [state, _send] = useAtom(machineAtom);

  const bodyRef = useRef<RapierRigidBody>(null!);
  const [, getInput] = useKeyboardControls();
  const moveSpeed = useAtomValue(moveSpeedAtom);

  useRespawnBehaviour(machineAtom, nearestSpawnerAtom, bodyRef);

  useEffect(() => {
    console.log("player machine: ", state.value);
  }, [state]);

  useFrame(() => {
    if (!(state.matches("idle") || state.matches("walking"))) {
      return;
    }
    if (!bodyRef.current) {
      return;
    }
    const { moveUp, moveDown, moveLeft, moveRight } = getInput();
    const x = moveLeft ? -1 : moveRight ? 1 : 0;
    const z = moveUp ? -1 : moveDown ? 1 : 0;
    const movement = new ThreeVector3(x, 0, z)
      .normalize()
      .multiplyScalar(moveSpeed);
    bodyRef.current.setLinvel(movement, true);
    let direction = Direction.DOWN;
    if (moveLeft) {
      direction = Direction.LEFT;
    } else if (moveRight) {
      direction = Direction.RIGHT;
    }
    if (moveUp) {
      direction = Direction.UP;
    } else if (moveDown) {
      direction = Direction.DOWN;
    }
    setDirection(direction);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      position={position}
      type="dynamic"
      enabledRotations={[false, false, false]}
      name={id}
    >
      <Suspense fallback={null}>
        <PlayerRender direction={direction} state={state.value} />
      </Suspense>
      <CapsuleCollider args={[0.2, 0.3]} position={[0, 0.5, 0]} />
      <group position={[0, 1, 0]}>
        {Array.from({ length: health }).map((_, h) => (
          <mesh key={h} position={[0, h / 5, 0]}>
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshStandardMaterial color={"red"} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}
