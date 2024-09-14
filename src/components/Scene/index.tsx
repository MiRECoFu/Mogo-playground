
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import BVHAnimation from "../BVHAnimation";
import { Button, Input, InputNumber, ConfigProvider, Space, message } from "antd";
// import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';
import styles from './style.less';
import axios from "axios";
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
const Scene = () => {
    const [prompt, setPrompt] = useState<string>('')
    const [length, setLength] = useState<number>(196)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [motionUrl, setMotionUrl] = useState<string>('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/run-on-trendmill.bvh')
    const [fbxModel, setFbxModel] = useState<any>()
    const [glbModel, setGlbModel] = useState<any>()

     // 加载 Mixamo FBX 模型
    useEffect(() => {
      const loader = new FBXLoader();
      loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character%20%282%29.fbx', (fbx) => {
        fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
        fbx.position.set(1, 0, 0); // 横向平移20单位
        console.log(fbx)
        setFbxModel(fbx);
      });
    }, []);
    const genMotions = async () => {
      setDisabled(true)
      try {
        const response = await axios.post('https://u213403-ac50-f8fb3f5b.westc.gpuhub.com:8443/generate_motion', {
          prompt,
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
        <Canvas camera={{ position: [0, 5, 5] }}>
        
          {/* 黑色背景 */}
          <color attach="background" args={["#000000"]} />
    
          {/* 光源 */}
          <ambientLight />
        <spotLight position={[10, 10, 10]} />
        <rectAreaLight width={5} height={5} color="white" intensity={1} position={[5, 5, 5]} />
          <gridHelper args={[20, 20, 'red', 'gray']} />
          {/* BVH 动画 */}
          <BVHAnimation url={motionUrl} fbx={fbxModel} />
          {/* <sphereGeometry args={[1, 32]} /> */}
          {/* 控制器 */}
          <OrbitControls />
        </Canvas>
      </>
      
    );
  };
  
  export default Scene