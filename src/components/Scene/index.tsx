
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
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
    const [motionUrl, setMotionUrl] = useState<string>()
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
          <gridHelper args={[10, 10, 'red', 'gray']} />
          {/* BVH 动画 */}
          {motionUrl && <BVHAnimation url={motionUrl} />}
          {/* <sphereGeometry args={[1, 32]} /> */}
          {/* 控制器 */}
          <OrbitControls />
        </Canvas>
      </>
      
    );
  };
  
  export default Scene