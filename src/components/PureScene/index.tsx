
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AccumulativeShadows, CameraControls, MeshReflectorMaterial, OrbitControls, RandomizedLight, KeyboardControls,Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import BVHAnimation from "../BVHAnimation";
import { Instances, Computers } from '../Computers/Computers'
import { Button, Input, InputNumber, ConfigProvider, Space, message, Checkbox } from "antd";
// import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';
import styles from './style.less';
import './style.less';
import axios from "axios";
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing'
import { useCompoundBody, usePlane } from "@react-three/cannon";
import { Lamp } from "../Lamp";
import { Cursor, useDragConstraint } from "../helpers/Drag";
import { Block } from '../helpers/Block'
import { enhancePrompt, expressionPrompt, virtualGFMotionPrompt, virtualGirlFriendPrompt } from "@/constant/LLM";
import BVHAnimationSingle, { IExpression } from "../BVHAnimationSingle";
import { Level, Sudo, Camera, Cactus, Box } from './Scene'
import { Physics } from "@react-three/rapier"
import { Ground } from "./Ground"
import { Player } from "./Player"
// import { Cube, Cubes } from "./Cube"

// import TrumpModel from '@/assets/trump/lowpoly-trump-free-character/source/trump_lp_anim_iddle01.fbx'
// import trumpTexture from '@/assets/trump/lowpoly-trump-free-character/textures/tumpLPcolors.png'
const apiKey = 'e5329e49d5d39274649923e8849b7e6c.fKUBmYEH7kQGfkJM'; // 替换为你的 API Key
const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

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


interface IChat {
  character: string,
  content: string
}

// 
const Scene = () => {
    const [prompt, setPrompt] = useState<string>('')
    const [length, setLength] = useState<number>(196)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [motionUrl, setMotionUrl] = useState<string>('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/6mlW/output.bvh')
    const [fbxModel, setFbxModel] = useState<any>()
    const [fbxModel2, setFbxModel2] = useState<any>()
    const [fbxModel3, setFbxModel3] = useState<any>()
    const [inputVis, setInputVis] = useState<boolean>(true)
    const modelRef = useRef()
    const [useLLM, setUseLLM] = useState<boolean>(true)
    const [editEnhancePrompt, setEditEnhancedPrompt] = useState<string>(enhancePrompt)
    const [enhancedP, setEnhancedP] = useState<string>('')
    const cameraControlsRef = useRef()
    const [expressionList, setExpressionList] = useState<IExpression[]>([])
    const [chatList, setChatList] = useState<IChat[]>([{
      character: 'girl',
      content: '小弟弟，你来找我干什么~'
    }])

    const [userMsgInput, setUserMsgInput] = useState<string>('')

     // 加载 Mixamo FBX 模型
    useEffect(() => {
 
    }, []);
    const genMotions = async () => {
      setDisabled(true)
      setEnhancedP('')
      let finalP = prompt
    
      if (useLLM) {
        
        

        const data = {
            model: "glm-4-plus",
            messages: [
              {
                "role": "system",
                "content": editEnhancePrompt
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
      const data = {
        model: "glm-4-plus",
        messages: [
          {
            "role": "system",
            "content": expressionPrompt
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
    const finalE = res.data.choices[0].message.content
    const jsonStr = finalE.split('```json')[1].split('```')[0]
    try {
      console.log(jsonStr)
      const exp = JSON.parse(jsonStr)
      setExpressionList(exp)
    } catch (error) {
      console.error(error)
    }
    // setEnhancedP(finalP)
      
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

    const handleSendMsg = async () => {
      setDisabled(true)
      const userInput = userMsgInput
      setChatList([...chatList, {
        character: 'boy',
        content: userMsgInput
      }])
      setUserMsgInput('')
      const chatData = {
        model: "glm-4-plus",
        messages: [
          {
            "role": "system",
            "content": `${virtualGirlFriendPrompt}, 你们现在有历史对话${chatList.map((chat) => chat.character + ':' + chat.content + '\n')}`
          },
          {
              "role": "user",
              "content": userInput
  
          }
        ]
      };

    const res = await axios.post(url, chatData, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        }
    })
    const girlRes = res.data.choices[0].message.content
    console.log(girlRes)
   
    const genMotionData = {
      model: "glm-4-plus",
      messages: [
        {
          "role": "system",
          "content": `${virtualGFMotionPrompt}`
        },
        {
            "role": "user",
            "content": `boy: ${userInput}\n girl: ${girlRes}`

        }
      ]
    };
    const motionPromptRes = await axios.post(url, genMotionData, {
      headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
      }
    })
    const motionPrompt = motionPromptRes.data.choices[0].message.content
    try {
      const response = await axios.post('https://u213403-8cf6-b1722316.westb.seetacloud.com:8443/generate_motion', {
        prompt: motionPrompt,
        length, 
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
    const data = {
      model: "glm-4-plus",
      messages: [
        {
          "role": "system",
          "content": expressionPrompt
        },
        {
            "role": "user",
            "content": motionPrompt

        }
      ]
  };
    const expression = await axios.post(url, data, {
      headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
      }
  })
  console.log(expression.data.choices[0].message.content)
  const finalE = expression.data.choices[0].message.content
  const jsonStr = finalE.split('```json')[1].split('```')[0]
  try {
    console.log(jsonStr)
    const exp = JSON.parse(jsonStr)
    setExpressionList(exp)
  } catch (error) {
    console.error(error)
  }
    setChatList([
      ...chatList,
      {
        character: 'boy',
        content: userInput
      },
      {
        character: 'girl',
        content: girlRes
      }
    ])
  }
    return (
      <>
        <div  className={styles.actionsWrapper}>
         { inputVis && <div className={styles.actions}>
            {/* <Input.TextArea style={{flex: 1}} rows={5} value={editEnhancePrompt} onChange={(e) => {
              setEditEnhancedPrompt(e.target.value)
            }} /> */}
            <Input style={{width: '80%'}} size="large" value={prompt} onChange={(e) => {
              setPrompt(e.target.value)
            }} />
            <InputNumber style={{width: '65px'}} size="large" min={1} max={260} value={length} onChange={(e) => {
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

        <div className={styles.chat}>
            <div className={styles.chatHis}>
              {
                chatList.map((msg) => {
                  if (msg.character === 'girl') {
                    return (
                      <div key={msg.content} className='message message-girl'>
                        {msg.content}
                      </div>
                    )
                  } else {
                    return (
                      <div key={msg.content} className={'message message-boy'}>
                        {msg.content}
                      </div>
                    )
                  }
                })
              }
            </div>
            <div className={styles.chatInput}>
                <Input.TextArea
                  value={userMsgInput}
                  onChange={(e) => {
                    setUserMsgInput(e.target.value)
                  }}
                  disabled={disabled}
                  onPressEnter={() => {
                    handleSendMsg()
                  }}
                />
            </div>
        </div>
        <KeyboardControls
          map={[
            { name: "forward", keys: ["ArrowUp", "w", "W"] },
            { name: "backward", keys: ["ArrowDown", "s", "S"] },
            { name: "left", keys: ["ArrowLeft", "a", "A"] },
            { name: "right", keys: ["ArrowRight", "d", "D"] },
            { name: "jump", keys: ["Space"] },
        ]}>
            <Canvas camera={{ position: [0, 0.4, 1.5] }}>
            
              {/* 黑色背景 */}
              <color attach="background" args={["#f5f5f5"]} />
        
              {/* 光源 */}
              <Sky sunPosition={[100, 20, 100]} />
              <ambientLight intensity={1} />
              <directionalLight position={[-10, 10, 5]} intensity={0.5} shadow-mapSize={[256, 256]} shadow-bias={-0.0001} castShadow>

              </directionalLight>
              <hemisphereLight intensity={1} groundColor="white" />
              <group scale={2} position={[0, -1.25, -1]}>
              <Level />
              <Sudo />
              <Camera />
              <Cactus />
              <Box position={[-0.8, 1.4, 0.4]} rotation={[0, 10, 0]} scale={0.15} />
            </group>
              {/* {/* <pointLight position={[-2, 1, 0]} color="red" intensity={1.5} /> */}
              {/* <pointLight position={[2, 1, 0]} color="blue" intensity={1.5} /> */}
              {/* <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} /> */}
              {/* <gridHelper args={[20, 20, 'red', 'gray']} /> */}
              {/* Main scene */}
              {/* <AccumulativeShadows temporal frames={Infinity} alphaTest={1} blend={200} limit={1500} scale={25} position={[0, -0.05, 0]}>
                <RandomizedLight amount={1} mapSize={512} radius={5} ambient={0.5} position={[-10, 10, 5]} size={10} bias={0.001} />
              </AccumulativeShadows>
              */}
              {/* BVH 动画 */}
              <BVHAnimationSingle url={motionUrl} fbx={fbxModel} expressions={expressionList} />
              <Physics gravity={[0, -30, 0]}>
                <Ground position={[0, -1.2, 0]} />
                <Player />
                
              </Physics>
              {/* <OrbitControls /> */}
              <PointerLockControls />
              {fbxModel && <CameraControls ref={cameraControlsRef} />}
            </Canvas>
        </KeyboardControls>
      </>
      
    );
  };
  
  export default Scene