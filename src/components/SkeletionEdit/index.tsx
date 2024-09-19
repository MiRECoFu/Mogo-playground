import { AccumulativeShadows, Environment, OrbitControls, RandomizedLight } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import ModelEdit from "./ModelEdit";
import { useState, useTransition } from "react";
import { useControls } from 'leva'

// function Env() {
//     const [preset, setPreset] = useState('sunset')
//     // You can use the "inTransition" boolean to react to the loading in-between state,
//     // For instance by showing a message
//     const [inTransition, startTransition] = useTransition()
//     const { blur } = useControls({
//       blur: { value: 0.65, min: 0, max: 1 },
//       preset: {
//         value: preset,
//         options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
//         // If onChange is present the value will not be reactive, see https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md#onchange
//         // Instead we transition the preset value, which will prevents the suspense bound from triggering its fallback
//         // That way we can hang onto the current environment until the new one has finished loading ...
//         onChange: (value) => startTransition(() => setPreset(value))
//       }
//     })
//     return <Environment preset={preset} background blur={blur} />
//   }

const SkeletonEdit = () => {
    return (
      <Canvas shadows camera={{ position: [0, 3, 5], fov: 50 }}>
        <ambientLight />
        <hemisphereLight intensity={0.5} groundColor="black" />
        <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
        <OrbitControls />
        {/* <group>
        <AccumulativeShadows temporal frames={200} color="purple" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
        </AccumulativeShadows>
        </group> */}
        
        
        {/* <Model /> */}
        <ModelEdit />
        {/* <Env /> */}
      </Canvas>
    );
  };
  
  export default SkeletonEdit;