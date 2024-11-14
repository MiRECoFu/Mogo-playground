import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier"
import * as React from 'react'

// const SPEED = 5
// const direction = new THREE.Vector3()
// const frontVector = new THREE.Vector3()
// const sideVector = new THREE.Vector3()
// const rotation = new THREE.Vector3()

export function Player({ lerp = THREE.MathUtils.lerp }) {
  const [SPEED] = React.useState(5)
  const [direction] = React.useState(new THREE.Vector3())
  const [frontVector] = React.useState(new THREE.Vector3())
  const [sideVector] = React.useState(new THREE.Vector3())

  const ref = useRef()
  const rapier = useRapier()
  const [, get] = useKeyboardControls()
  useFrame((state) => {
    const { forward, backward, left, right, jump } = get()
    const velocity = ref.current.linvel()
    // update camera
    const position = ref.current.translation();
    
    if (Array.isArray(position)) {
      
      state.camera.position.set(...position);
    } else {
      // console.log(position.x, position.y, position.z)
      state.camera.position.set(position.x, position.y, position.z);
    }

    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    // direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(state.camera.rotation)
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED);

    const cameraQuaternion = new THREE.Quaternion();
    state.camera.getWorldQuaternion(cameraQuaternion);
    direction.applyQuaternion(cameraQuaternion);
        ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)
    // jumping
    const world = rapier.world
    const ray = world.castRay(new RAPIER.Ray(ref.current.translation(), { x: 0, y: -1.2, z: 0 }))
    const grounded = ray && ray.collider && Math.abs(ray.toi) <= 3
    if (jump) ref.current.setLinvel({ x: 0, y: 7.5, z: 0 }, true)
  })
  return (
    <>
      <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[0, 10, 2]} enabledRotations={[false, false, false]}>
        <CapsuleCollider args={[0.75, 0.5]} />
      </RigidBody>
    </>
  )
}
