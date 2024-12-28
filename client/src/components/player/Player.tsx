import { useFrame, Vector3 } from "@react-three/fiber";
import PlayerRender from "./PlayerRender";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { Vector3 as ThreeVector3 } from "three";
import { atom, useAtomValue } from "jotai";

const moveSpeedAtom = atom(2);
// const positionAtom = atom<Vector3>([0, 0, 0]);
// const bodyRef = atom<RapierRigidBody>(null!);

type PlayerProps = {
  initialPosition?: Vector3;
};

export default function Player({ initialPosition }: PlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null!);
  const [, getInput] = useKeyboardControls();
  const moveSpeed = useAtomValue(moveSpeedAtom);
  useFrame(() => {
    const { moveUp, moveDown, moveLeft, moveRight } = getInput();
    const x = moveLeft ? -1 : moveRight ? 1 : 0;
    const z = moveUp ? -1 : moveDown ? 1 : 0;
    const movement = new ThreeVector3(x, 0, z)
      .normalize()
      .multiplyScalar(moveSpeed);
    bodyRef.current.setLinvel(movement, true);
  });
  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      position={initialPosition}
      type="dynamic"
      enabledRotations={[false, false, false]}
    >
      <PlayerRender />
      <CapsuleCollider args={[0.2, 0.3]} position={[0, 0.5, 0]} />
    </RigidBody>
  );
}
