import * as THREE from 'three'
import { useState } from 'react'
import { useGLTF, SpotLight } from '@react-three/drei'
import { useCompoundBody, useSphere, useCylinder, useDistanceConstraint, usePointToPointConstraint } from '@react-three/cannon'
import { useDragConstraint } from '../helpers/Drag'
// import { Block } from '../helpers/Block'

export function Lamp(props) {
    const [target] = useState(() => new THREE.Object3D())
    const [fixed] = useSphere(() => ({ collisionFilterGroup: 0, type: 'Static', args: [0.2], ...props }))
    const [lamp] = useCylinder(() => ({ mass: 1, args: [0.5, 1.5, 2, 16], angularDamping: 0.95, linearDamping: 0.95, material: { friction: 0.9 }, ...props }))
    const bind = useDragConstraint(lamp)
    useDistanceConstraint(fixed, lamp, { distance: 2, pivotA: [0, 0, 0], pivotB: [0, 2, 0] })
    usePointToPointConstraint(fixed, lamp, { pivotA: [0, 0, 0], pivotB: [0, 2, 0] })
    return (
      <mesh ref={lamp} {...bind}>
        <cylinderGeometry args={[0.5, 1.5, 2, 32]} />
        <meshStandardMaterial />
        <SpotLight
          castShadow
          target={target}
          penumbra={0.2}
          radiusTop={0.4}
          radiusBottom={40}
          distance={80}
          angle={0.45}
          attenuation={20}
          anglePower={5}
          intensity={0.5}
          opacity={0.2}
        />
        <primitive object={target} position={[0, -1, 0]} />
      </mesh>
    )
  }