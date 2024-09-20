import { AccumulativeShadows, ArcballControls, Environment, GizmoHelper, GizmoViewport, Html, Lightformer, OrbitControls, RandomizedLight } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import ModelEdit from "./ModelEdit";
import { useState, useTransition } from "react";
import { useControls } from 'leva'
import { Fullscreen, Root } from "@react-three/uikit";
import { Defaults } from "@react-three/uikit-apfel";
import { Container, Text } from '@react-three/uikit'
import { Card } from "@react-three/uikit-apfel"
import { Button } from "@react-three/uikit-apfel"

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
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 30 }}>
        {/* <Html>
          <div style={{
            position: 'fixed',
            backgroundColor: '#303134',
            width: 380,
            height: 'calc(100vh - 120px)',
            left: 24,
            top: 80,
            zIndex: 111
          }}>

          </div>
        </Html> */}
        {/* <Root backgroundColor="red">
          <Card borderRadius={32} padding={32} gap={8} flexDirection="column">
      <Text fontSize={32}>Hello World!</Text>
      <Text fontSize={24} opacity={0.7}>
        This is the apfel kit.
      </Text>
    </Card>
        </Root> */}
        <ambientLight intensity={1.2} />
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
              <Lightformer key={i} form="circle" intensity={4} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[4, 1, 1]} />
            ))}
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
          </group>
        </Environment>
        <hemisphereLight intensity={2} groundColor="black" />
        <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
        {/* <OrbitControls />
         */}
        {/* <group>
        <AccumulativeShadows temporal frames={200} color="purple" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
        </AccumulativeShadows>
        </group> */}
        
        
        {/* <Model /> */}
        <ModelEdit />
        <GizmoHelper alignment="bottom-right" margin={[80, 120]} renderPriority={1}>
        <GizmoViewport axisColors={["hotpink", "aquamarine", "#3498DB"]} labelColor="black" />
      </GizmoHelper>
        <ArcballControls enableZoom={true} enablePan={false} makeDefault />
        {/* <Env /> */}
      </Canvas>
    );
  };
  
  export default SkeletonEdit;