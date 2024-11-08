
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import BVHAnimation from "../BVHAnimation";
import { Instances, Computers } from '../Computers/Computers'
import { Button, Input, InputNumber, ConfigProvider, Space, message, Checkbox } from "antd";
// import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';
import styles from './style.less';
import axios from "axios";
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing'
import { Physics, useCompoundBody, usePlane } from "@react-three/cannon";
import { Lamp } from "../Lamp";
import { Cursor, useDragConstraint } from "../helpers/Drag";
import { Block } from '../helpers/Block'
import { enhancePrompt } from "@/constant/LLM";
const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

function Floor(props) {
  const [ref] = usePlane(() => ({ type: 'Static', ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
       blur={[300, 30]}
       resolution={1024}
       mixBlur={1}
       mixStrength={180}
       roughness={1}
       depthScale={1.2}
       minDepthThreshold={0.4}
       maxDepthThreshold={1.4}
       color="#202020"
       metalness={0.8}
      />
    </mesh>
  )
}
export function Chair(props) {
  const scaleFactor = 0.1; // 缩放因子

  const [ref] = useCompoundBody(() => ({
    mass: 24,
    linearDamping: 0.95,
    angularDamping: 0.95,
    shapes: [
      { type: 'Box', mass: 10, position: [0, 0, 0].map(p => p * scaleFactor), args: [3.1, 3.1, 0.5].map(a => a * scaleFactor) },
      { type: 'Box', mass: 10, position: [0, -1.75, 1.25].map(p => p * scaleFactor), args: [3.1, 0.5, 3.1].map(a => a * scaleFactor) },
      { type: 'Box', mass: 1, position: [5 + -6.25, -3.5, 0].map(p => p * scaleFactor), args: [0.5, 3, 0.5].map(a => a * scaleFactor) },
      { type: 'Box', mass: 1, position: [5 + -3.75, -3.5, 0].map(p => p * scaleFactor), args: [0.5, 3, 0.5].map(a => a * scaleFactor) },
      { type: 'Box', mass: 1, position: [5 + -6.25, -3.5, 2.5].map(p => p * scaleFactor), args: [0.5, 3, 0.5].map(a => a * scaleFactor) },
      { type: 'Box', mass: 1, position: [5 + -3.75, -3.5, 2.5].map(p => p * scaleFactor), args: [0.5, 3, 0.5].map(a => a * scaleFactor) }
    ],
    ...props
  }));

  const bind = useDragConstraint(ref);

  return (
    <group ref={ref} {...bind}>
      <Block position={[0, 0, 0].map(p => p * scaleFactor)} scale={[3.1, 3.1, 0.5].map(s => s * scaleFactor)} />
      <Block position={[0, -1.75, 1.25].map(p => p * scaleFactor)} scale={[3.1, 0.5, 3.1].map(s => s * scaleFactor)} />
      <Block position={[5 + -6.25, -3.5, 0].map(p => p * scaleFactor)} scale={[0.5, 3, 0.5].map(s => s * scaleFactor)} />
      <Block position={[5 + -3.75, -3.5, 0].map(p => p * scaleFactor)} scale={[0.5, 3, 0.5].map(s => s * scaleFactor)} />
      <Block position={[5 + -6.25, -3.5, 2.5].map(p => p * scaleFactor)} scale={[0.5, 3, 0.5].map(s => s * scaleFactor)} />
      <Block position={[5 + -3.75, -3.5, 2.5].map(p => p * scaleFactor)} scale={[0.5, 3, 0.5].map(s => s * scaleFactor)} />
    </group>
  );
}

const Scene = () => {
    const [prompt, setPrompt] = useState<string>('')
    const [length, setLength] = useState<number>(196)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [motionUrl, setMotionUrl] = useState<string>('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/run-on-trendmill.bvh')
    const [fbxModel, setFbxModel] = useState<any>()
    const [fbxModel2, setFbxModel2] = useState<any>()
    const [fbxModel3, setFbxModel3] = useState<any>()

    const [useLLM, setUseLLM] = useState<boolean>(true)

    const [enhancedP, setEnhancedP] = useState<string>('')

     // 加载 Mixamo FBX 模型
    useEffect(() => {
      const loader = new FBXLoader();
      loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character%20%282%29.fbx', (fbx) => {
        fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
        fbx.position.set(1, 0, 0); // 横向平移20单位

        setFbxModel(fbx);
      });
      loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Maw%20J%20Laygo.fbx', (fbx2) => {
        fbx2.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
        fbx2.position.set(-1, 0, 0); // 横向平移20单位

        setFbxModel2(fbx2);
      });
      loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Maria%20WProp%20J%20J%20Ong.fbx', (fbx3) => {
        fbx3.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
        fbx3.position.set(-2, 0, 0); // 横向平移20单位

        setFbxModel3(fbx3);
      });
    }, []);
    const genMotions = async () => {
      setDisabled(true)
      setEnhancedP('')
      let finalP = prompt
      if (useLLM) {
        const apiKey = 'e5329e49d5d39274649923e8849b7e6c.fKUBmYEH7kQGfkJM'; // 替换为你的 API Key
        const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

        const data = {
            model: "glm-4-plus",
            messages: [
              {
                "role": "system",
                "content": enhancePrompt
              },
              {
                  "role": "user",
                  "content": prompt
      
              }
            ]
        };

        const res = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        })
        console.log(res.data.choices[0].message.content)
        finalP = res.data.choices[0].message.content
        setEnhancedP(finalP)

      }
      
      try {
        const response = await axios.post('https://u213403-8cf6-b1722316.westb.seetacloud.com:8443/generate_motion', {
          prompt: finalP,
          length
      }, {
        timeout: 300000
      });
      setDisabled(false)
      console.log(response)
      setMotionUrl(response.data.oss_url)
      } catch (error) {
        setDisabled(false)
        message.error('出错了，请重试')
      }
      
    }
    return (
      <>
        <div  className={styles.actionsWrapper}>
          <div className={styles.actions}>
            <Input size="large" value={prompt} onChange={(e) => {
              setPrompt(e.target.value)
            }} />
            <InputNumber size="large" min={1} max={260} value={length} onChange={(e) => {
              setLength(e || 1)
            }} />
            <ConfigProvider button={{
          className: styles.linearGradientButton,
        }}>
            <Button type="primary" size="large" loading={disabled} onClick={genMotions}>Mogo!</Button>
            </ConfigProvider>
            
          </div>
          <Checkbox checked={useLLM} style={{
            fontWeight: 'normal',
          }} onChange={(v) => {
            setUseLLM(v.target.checked)
          }}>Use LLM to enhance performance</Checkbox>
          {useLLM && enhancedP && <p className={styles.enhancedP}>After Enhanced: {enhancedP}</p>}
        </div>
        
        <Canvas camera={{ position: [0, 5, 5] }}>
        
          {/* 黑色背景 */}
          <color attach="background" args={["#000000"]} />
    
          {/* 光源 */}
          <ambientLight />
          <hemisphereLight intensity={0.7} groundColor="black" />
          <pointLight position={[-2, 1, 0]} color="red" intensity={1.5} />
          <pointLight position={[2, 1, 0]} color="blue" intensity={1.5} />
          <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
          {/* <gridHelper args={[20, 20, 'red', 'gray']} /> */}
          {/* Main scene */}
      <group position={[-0, -1, 0]}>
        {/* Auto-instanced sketchfab model */}
        <Instances>
          <Computers scale={1.5} position={[0, 0, -10]} />
        </Instances>
        {/* Auto-instanced sketchfab model */}
        
        {/* Plane reflections + distance blur */}
        <mesh receiveShadow position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 30]}
            resolution={1024}
            mixBlur={1}
            mixStrength={180}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#202020"
            metalness={0.8}
          />
        </mesh>
        {/* Bunny and a light give it more realism */}
        {/* <Bun scale={0.4} position={[0, 0.3, 0.5]} rotation={[0, -Math.PI * 0.85, 0]} /> */}
        <pointLight distance={1.5} intensity={3} position={[-0.15, 0.7, 0]} color="orange" />
      </group>
        {/* <Physics>
        <Cursor />
        <Floor position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <Chair position={[0, 2, 2.52]} scale={[0.01, 0.01, 0.01]}/>
        <Chair position={[1, 2, 2.52]} scale={[0.01, 0.01, 0.01]}/>
        <Chair position={[-1.2, 2, 2.52]} rotation={[0, Math.PI / 4, 0]} scale={[0.01, 0.01, 0.01]}/>

        <Chair position={[4, 2, 3.52]} rotation={[-Math.PI / 1.5, 0, 0]} scale={[0.01, 0.01, 0.01]}/>
        
        </Physics> */}
          {/* BVH 动画 */}
          <BVHAnimation url={motionUrl} fbx={fbxModel} fbx2={fbxModel2} fbx3={fbxModel3} />
          {/* <Floor position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} /> */}
          {/* <sphereGeometry args={[1, 32]} /> */}
          {/* 控制器 */}
          <OrbitControls />
          <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={2} />
        <DepthOfField target={[0, 0, 13]} focalLength={0.3} bokehScale={15} height={700} />
      </EffectComposer>
        </Canvas>
      </>
      
    );
  };
  
  export default Scene