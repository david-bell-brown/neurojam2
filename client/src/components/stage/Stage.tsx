export function Stage() {
  return (
    <group>
      <mesh position={[0, 10, -25]} receiveShadow castShadow>
        <planeGeometry args={[50, 20]} />
        <meshLambertMaterial color="#eeeeee" />
      </mesh>
      <mesh rotation={[Math.PI / -2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#eeeeee" />
      </mesh>
      <pointLight
        castShadow
        intensity={500}
        position={[0, 20, 0]}
        color={"#FCE5CE"}
        shadow-mapSize={1024}
      />
      {/* <directionalLight
        castShadow
        position={[0, 25, 2]}
        intensity={1.5}
        shadow-mapSize={1024}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-25, 25, -25, 25, 0.1, 500]}
        />
      </directionalLight> */}
    </group>
  );
}
