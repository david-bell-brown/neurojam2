import { Vector3 } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { ReactNode } from "react";

export function WallBody({ children }: { children: ReactNode }) {
  return (
    <RigidBody type="fixed" colliders={false}>
      {children}
    </RigidBody>
  );
}

type WallProps = {
  position?: Vector3;
  height?: number;
};

export function Wall({ position, height = 1 }: WallProps) {
  return (
    <group position={position}>
      <CuboidCollider
        args={[0.5, height / 2, 0.5]}
        position={[0, height / 2, 0]}
      />
      <mesh position={[0, height / 2, 0]} castShadow scale={[1, height, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
    </group>
  );
}
