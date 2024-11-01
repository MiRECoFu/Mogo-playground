import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AccumulativeShadows, CameraControls, MeshReflectorMaterial, OrbitControls, RandomizedLight, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import BVHAnimation from "../BVHAnimation";
import { Instances, Computers } from '../Computers/Computers'
import { Button, Input, InputNumber, ConfigProvider, Space, message, Checkbox, Upload, UploadProps } from "antd";
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
import { div } from "three/webgpu";
import BVHAnimationSingle from "../BVHAnimationSingle";
import BVHAnimationCapture from "../BVHAnimationCapture";

const MoCap: React.FC = () => {
    const [rawVideoUrl, setRawVideoUrl] = useState<string>()
    const [bvhUrl, setBvhUrl] = useState<string>()
    const [mocapUrl, setMocalUrl] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [fbxModel, setFbxModel] = useState<any>()
    useEffect(() => {
        const loader = new FBXLoader();
        loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Kachujin%20G%20Rosales.fbx', (fbx) => {
          // fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
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
    const uploadProps: UploadProps = {
        name: 'file',
        action: 'http://121.196.206.169:6006/upload',  // Flask 上传接口地址

        async onChange(info) {
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully, begin convert motions`);
            setLoading(true)
            console.log('Uploaded file path:', info.file.response.video_url);
            setRawVideoUrl(info.file.response.video_url)
            try {
                const response = await axios.post('http://121.196.206.169:6006/mo_cap', {
                    video_url: info.file.response.video_url,
                  static_cam: true
              }, {
                timeout: 300000
              });
            //   setDisabled(false)
              console.log(response)
              setBvhUrl(response.data.bvh_path)
              setMocalUrl(response.data.video_path)
              setLoading(false)
              } catch (error) {
                message.error('出错了，请重试')
              }
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
      };

    return (
        <div className={styles.layout}>
            <div className={styles.video}>
            <div style={{
                height: '20vh',
                color: '#fff'
            }}>
            <Upload.Dragger {...uploadProps}>
            {/* <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p> */}
            <p style={{color: '#fff'}}>Click or drag file to this area to upload</p>
            </Upload.Dragger>
            </div>
            {
                loading
                &&
                <div style={{
                    width: '100%',
                    color: '#fff',
                    paddingTop: '20px'
                }}>
                    loading...
                </div>
            }
            {mocapUrl &&
            <video style={{
                width: '100%'
            }} src={mocapUrl} autoPlay
            controls></video>
            }
            </div>
            <div className={styles.canvas}>
            <Canvas camera={{ position: [0, 120, -510] }}>
        
                {/* 黑色背景 */}
                <color attach="background" args={["#000000"]} />
        
                {/* 光源 */}
                <ambientLight />
                <hemisphereLight intensity={0.7} groundColor="black" />
                <pointLight position={[-2, 1, 0]} color="red" intensity={1.5} />
                <pointLight position={[2, 1, 0]} color="blue" intensity={1.5} />
                <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
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
                {bvhUrl && <BVHAnimationCapture url={bvhUrl} fbx={fbxModel} />}
                {/* <Floor position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} /> */}
                {/* <sphereGeometry args={[1, 32]} /> */}
                {/* 控制器 */}
                <OrbitControls />
                {/* {fbxModel && <CameraControls ref={cameraControlsRef} />} */}

                {/* <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={2} />
            <DepthOfField target={[0, 0, 13]} focalLength={0.3} bokehScale={15} height={700} />
            </EffectComposer> */}
            </Canvas>
            </div>
        </div>
    )
}

export default MoCap