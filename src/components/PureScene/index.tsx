
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AccumulativeShadows, CameraControls, MeshReflectorMaterial, OrbitControls, RandomizedLight, useAnimations } from "@react-three/drei";
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
import BVHAnimationSingle from "../BVHAnimationSingle";
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



// 
const Scene = () => {
    const [prompt, setPrompt] = useState<string>('')
    const [length, setLength] = useState<number>(196)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [motionUrl, setMotionUrl] = useState<string>('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/run-on-trendmill.bvh')
    const [fbxModel, setFbxModel] = useState<any>()
    const [fbxModel2, setFbxModel2] = useState<any>()
    const [fbxModel3, setFbxModel3] = useState<any>()
    const [inputVis, setInputVis] = useState<boolean>(true)
    const modelRef = useRef()
    const [useLLM, setUseLLM] = useState<boolean>(true)

    const [enhancedP, setEnhancedP] = useState<string>('')
    const cameraControlsRef = useRef()

     // 加载 Mixamo FBX 模型
    useEffect(() => {
      const loader = new FBXLoader();
      loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character%20%282%29.fbx', (fbx) => {
        fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
        fbx.position.set(1, 0, 0); // 横向平移20单位

        setFbxModel(fbx);
      });
    //   loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Maw%20J%20Laygo.fbx', (fbx2) => {
    //     fbx2.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
    //     fbx2.position.set(-1, 0, 0); // 横向平移20单位

    //     setFbxModel2(fbx2);
    //   });
    //   loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Maria%20WProp%20J%20J%20Ong.fbx', (fbx3) => {
    //     fbx3.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
    //     fbx3.position.set(-2, 0, 0); // 横向平移20单位

    //     setFbxModel3(fbx3);
    //   });
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
        const response = await axios.post('https://u213403-ac50-f8fb3f5b.westc.gpuhub.com:8443/generate_motion', {
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
         { inputVis && <div className={styles.actions}>
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
            
          </div>}
          <Checkbox checked={useLLM} style={{
            fontWeight: 'normal',
          }} onChange={(v) => {
            setUseLLM(v.target.checked)
          }}>Use LLM to enhance performance
            <Button onClick={(e) => {
              e.stopPropagation()
              setInputVis(!inputVis)
            }} type='link'>控制输入框是否隐藏</Button>
          </Checkbox>
          {useLLM && enhancedP && <p className={styles.enhancedP}>After Enhanced: {enhancedP}</p>}
        </div>
        
        <Canvas camera={{ position: [0, 2, 6] }}>
        
          {/* 黑色背景 */}
          <color attach="background" args={["#ffffff"]} />
    
          {/* 光源 */}
          <ambientLight intensity={2.5} />
          <directionalLight position={[-10, 10, 5]} intensity={3} shadow-mapSize={[256, 256]} shadow-bias={-0.0001} castShadow>

          </directionalLight>
          {/* <hemisphereLight intensity={3} groundColor="white" /> */}
          {/* {/* <pointLight position={[-2, 1, 0]} color="red" intensity={1.5} /> */}
          {/* <pointLight position={[2, 1, 0]} color="blue" intensity={1.5} /> */}
          {/* <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} /> */}
          {/* <gridHelper args={[20, 20, 'red', 'gray']} /> */}
          {/* Main scene */}
          <AccumulativeShadows temporal frames={Infinity} alphaTest={1} blend={200} limit={1500} scale={25} position={[0, -0.05, 0]}>
            <RandomizedLight amount={1} mapSize={512} radius={5} ambient={0.5} position={[-10, 10, 5]} size={10} bias={0.001} />
          </AccumulativeShadows>
          
          {/* BVH 动画 */}
          <BVHAnimationSingle url={motionUrl} fbx={fbxModel} cameraControlsRef={cameraControlsRef}/>
          {/* <Floor position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} /> */}
          {/* <sphereGeometry args={[1, 32]} /> */}
          {/* 控制器 */}
          <OrbitControls enableDamping={true} dampingFactor={0.25}/>
          {fbxModel && <CameraControls ref={cameraControlsRef} />}

          {/* <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={2} />
        <DepthOfField target={[0, 0, 13]} focalLength={0.3} bokehScale={15} height={700} />
      </EffectComposer> */}
        </Canvas>
      </>
      
    );
  };
  
  export default Scene