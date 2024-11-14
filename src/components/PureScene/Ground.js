import * as THREE from "three"
import { MeshReflectorMaterial } from "@react-three/drei"
import { CuboidCollider, RigidBody } from "@react-three/rapier"
// import grass from "./assets/grass.jpg"

export function Ground(props) {
//   const texture = useTexture(grass)
//   texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return (
    <RigidBody {...props} type="fixed" colliders={false}>
      <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, 1000]} />
        <MeshReflectorMaterial
            blur={[300, 30]}
            resolution={1024}
            mixBlur={1}
            mixStrength={180}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#ccc"
            metalness={0.8}
          />
      </mesh>
      <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
    </RigidBody>
  )
}
