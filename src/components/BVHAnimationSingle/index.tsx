

import React, { useRef, useEffect, useState, Dispatch, SetStateAction, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useAnimations, useBVH } from "@react-three/drei";
import * as THREE from "three";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader";
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { SkeletonHelper } from "three";
import { useLoader } from '@react-three/fiber'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// const bvh = require('/Users/fudongjie/text2motion/Mogo-playground/src/assets/run-on-trendmill.bvh')
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Viewer } from '../BVHAnimationCapture/features/vrmViewer/viewer';
// import AvatarSample_A from '@/assets/trump/trump.vrm';
import AvatarSample_A from '@/components/BVHAnimationCapture/AvatarSample_B.vrm'
import { useAnimationFrame } from '@/utils/useAnimationFrame';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { convertBVHToVRMAnimation } from "../BVHAnimationCapture/lib/bvh-converter/convertBVHToVRMAnimation";
import { loadVRMAnimation } from "../BVHAnimationCapture/lib/VRMAnimation/loadVRMAnimation";
import { Model } from "../BVHAnimationCapture/features/vrmViewer/Model";
import { VRMLoader } from "three-stdlib";
import { createVRMAnimationClip } from "@pixiv/three-vrm-animation";
let blinkTimer = 0; // 计时器初始化为0
const blinkInterval = 2; // 每隔2秒眨一次眼，可以调整间隔时间

interface FileBlob {
    blob: Blob;
    name: string;
  }

export interface IExpression {
  expressionName: string
  weight: number
}
// 定义旋转限制的度数到弧度的转换
const degToRad = THREE.MathUtils.degToRad;

// 定义关节名称和旋转限制的范围
type RotationLimits = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

// 定义所有关节的旋转限制
const rotationLimits: Record<string, RotationLimits> = {
  neck: { minX: -30, maxX: 30, minY: -60, maxY: 60, minZ: -20, maxZ: 20 },
  shoulderL: { minX: -90, maxX: 90, minY: -90, maxY: 90, minZ: -90, maxZ: 90 },
  shoulderR: { minX: -60, maxX: 60, minY: -20, maxY: 20, minZ: -90, maxZ: 90 },
  elbowL: { minX: -150, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
  elbowR: { minX: -150, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
  wristL: { minX: -60, maxX: 60, minY: -30, maxY: 30, minZ: 0, maxZ: 0 },
  wristR: { minX: -60, maxX: 60, minY: -30, maxY: 30, minZ: 0, maxZ: 0 },
  hip: { minX: -30, maxX: 60, minY: -45, maxY: 45, minZ: -20, maxZ: 20 },
  kneeL: { minX: 0, maxX: 150, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
  kneeR: { minX: 0, maxX: 150, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
  ankleL: { minX: -30, maxX: 45, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
  ankleR: { minX: -30, maxX: 45, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
};

// 定义骨骼对象的类型
type Bone = THREE.Object3D | null;

// 旋转限制函数，应用到每个关节
function clampRotation(bone: Bone, limits: RotationLimits): void {
  if (bone) {
    bone.rotation.x = THREE.MathUtils.clamp(bone.rotation.x, degToRad(limits.minX), degToRad(limits.maxX));
    bone.rotation.y = THREE.MathUtils.clamp(bone.rotation.y, degToRad(limits.minY), degToRad(limits.maxY));
    bone.rotation.z = THREE.MathUtils.clamp(bone.rotation.z, degToRad(limits.minZ), degToRad(limits.maxZ));
  }
}

const BVHAnimationCapture = ({ url, fbx, expressions }: {url: string, fbx: any, expressions: IExpression[]}) => {
  const skeletonRef = useRef();
  const [model] = useState<Model>(new Model());
  const [skeletonHelper, setSkeletonHelper] = useState(null);
  const [mixer, setMixer] = useState(null);
  const [modelMixer, setModelMixer] = useState(null);
  const [vrmMixer, setVrmMixer] = useState(null)
  // const [modelMixer2, setModelMixer2] = useState(null)
  // const [modelMixer3, setModelMixer3] = useState(null)
  const [sk, setSk] = useState(null)
  const [modelSk, setModelSk] = useState(null)
  const [blobURL, setBlobURL] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [nowConvert, setNowConvert] = useState(false);
  const [completed, setCompleted] = useState(false);
  const vrmaBlob = useRef<FileBlob | null>(null);
  const bvhLoader = new BVHLoader();
  const [vrm, setVrm] = useState<VRM>()
  const modelRef = useRef();
  const [smile, setSmile] = useState(1);
  const setFaceExpression = (vrm: any, expressionName: string, weight: number) => {
    if (vrm && vrm.expressionManager) {
      const expression = vrm.expressionManager._expressionMap[expressionName];
      if (expression) {
        expression.weight = weight;
        vrm.expressionManager.update(); // 更新表情状态
      }
    }
  };


  useEffect(() => {
    expressions.forEach((exp) => {
      setFaceExpression(vrm, exp.expressionName, exp.weight);
    })
    
  }, [expressions, vrm]);

  const initializeState = () => {
    setError('');
    setNowConvert(false);
    setCompleted(false);
    vrmaBlob.current = null;
    setBlobURL(null);
  };

  const changeExtension = (fileName: string, newExtension: string) => {
    const parts = fileName.split('.');
    parts[parts.length - 1] = newExtension;
    return parts.join('.');
  };

  const convertWrapper = async (name: string, bvh: any) => {
    setNowConvert(true);
    let isPropertyConverted = true;
    try {
      // if (!file.name.toLowerCase().endsWith('.bvh')) {
      //   throw new Error('Uploaded file is not a BVH file.');
      // }
      // const fileText = await file.text();

      // const bvh = bvhLoader.parse(fileText);
      const vrmaBuffer = await convertBVHToVRMAnimation(bvh, {
        scale: location.hash.includes('NO_SCALING') ? 1.0 : 0.01
      });

      const vrmaDict: FileBlob = { blob: new Blob([vrmaBuffer]), name: name };
      setBlobURL(URL.createObjectURL(vrmaDict.blob));
      console.log(vrmaDict)
      vrmaBlob.current = vrmaDict;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        isPropertyConverted = false;
      }
    }
    setNowConvert(false);
    if (isPropertyConverted) {
      setCompleted(true);
    }
  };

  
  // const fbx = useLoader(FBXLoader, 'https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character.fbx')
  // console.log(fbx)
  React.useEffect(() => {
    initializeState()
    const loader = new BVHLoader();
    
   
    loader.load(url,  async (result) => {
      const { skeleton, clip } = result;
      // const boneSet = new Set<THREE.Object3D>(skeleton.bones);
      // console.log('bvh skeleton.bones', JSON.stringify(skeleton.bones))
      convertWrapper('output.bvh', result)

      const skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
      setSk(skeleton.bones[0])
      skeletonHelper.skeleton = skeleton;
      skeletonHelper.visible = true; // Ensure helper is visible
      skeletonHelper.scale.set(0.01, 0.01, 0.01); 

      setSkeletonHelper(skeletonHelper);

       // Create a basic mesh to visualize the bones
       const geometry = new THREE.BoxGeometry(1, 1, 1);
       const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
       const mesh = new THREE.Mesh(geometry, material);
      
      if (fbx) {
        // console.log(fbx)
        // const targetSkin = fbx.children[0]
        let modelSkeleton = new THREE.SkeletonHelper( fbx );
				modelSkeleton.visible = false;
        // modelSkeleton.skeleton = skeleton
        // console.log(targetSkin, 'targetSkin')
        // SkeletonUtils.retarget(modelSkeleton, skeletonHelper, {});
        setModelSk(modelSkeleton)
        const fps = 1 / clip.tracks[0].times[1] || 1;
        clip.duration += 1 / fps;
        const retargetOptions = {

					// preservePosition: false,
					// preserveHipPosition: false,

					// specify the name of the target's hip bone.
					Hips: 'mixamorigHips',
                    fps: fps,
					// Map of target's bone names to source's bone names
					names: {

						mixamorigHips: 'Hips',

						mixamorigSpine: 'Spine',
						mixamorigSpine1: 'Spine1',
						mixamorigSpine2: 'Spine2',
						mixamorigNeck: 'Neck',
						mixamorigHead: 'Head',
						// mixamorigHeadTop_End: 'mixamorigHeadTop_End',

						mixamorigLeftShoulder: 'LeftShoulder',
						mixamorigRightShoulder: 'RightShoulder',
						mixamorigLeftArm: 'LeftArm',
						mixamorigRightArm: 'RightArm',
						mixamorigLeftForeArm: 'LeftForeArm',
						mixamorigRightForeArm: 'RightForeArm',
						mixamorigLeftHand: 'LeftHand',
						mixamorigRightHand: 'RightHand',

						mixamorigLeftUpLeg: 'LeftUpLeg',
						mixamorigRightUpLeg: 'RightUpLeg',
						mixamorigLeftLeg: 'LeftLeg',
						mixamorigRightLeg: 'RightLeg',
						mixamorigLeftFoot: 'LeftFoot',
						mixamorigRightFoot: 'RightFoot',
						// mixamorigLeftToeBase: 'LeftToeBase',
						// mixamorigRightToeBase: 'RightToeBase',
						// mixamorigLeftToe_End: 'LeftToe',
						// mixamorigRightToe_End: 'RightToe',

					}

				};
        
      }
    });

    

    // return () => {
    //   if (mixer) {
    //     mixer.stopAllAction();
    //     setSk(null)
    //     setSkeletonHelper(null)
    //     setModelSk(null)
    //     modelMixer?.stopAllAction()
    //     // console.log(skeletonHelper.position)
    //     // fbx.position.set(sk.position)
    //   }
    // };
  }, [url, fbx]);

  useEffect(() => {
    (async () => {
      // await viewer.loadVrm(AvatarSample_A);
      
      const loader = new GLTFLoader();
      const helperRoot = new THREE.Group();
      loader.register((parser) => new VRMLoaderPlugin(parser, { helperRoot: helperRoot }));
      loader.load(
        AvatarSample_A,
        async (vrm) => {
          if (modelRef.current) {
            modelRef.current.clear()
            // console.log(vrm, 'vvrrmm')
            if (blobURL) {
              const VRMAnimation = await loadVRMAnimation(blobURL);
              setVrm(vrm.userData.vrm)
              const clip = createVRMAnimationClip(VRMAnimation!, vrm.userData.vrm);

              vrm.userData.vrm.scene.name = 'VRMRoot';

              modelRef.current.add(vrm.scene);
              VRMUtils.rotateVRM0(vrm.userData.vrm);
              const vrmMixer = new THREE.AnimationMixer(vrm.userData.vrm.scene)
              vrmMixer.clipAction(clip).play()
              setVrmMixer(vrmMixer)
            }
            
          }
        },
        undefined,
        (error) => {
          console.error('Error loading VRM model:', error);
        }
      );
    })();
  }, [blobURL]);



  useFrame((state, delta) => {
    if (vrmMixer) {
      // console.log('vrm update')
      vrmMixer.update(delta)
      
    }
    if (vrm) {
      // vrm.scene.rotation.y = Math.P; // 使模型面朝前
      
      blinkTimer += delta;

      // 当计时器超过设定的眨眼间隔时触发眨眼
      if (blinkTimer >= blinkInterval) {
          setFaceExpression(vrm, 'blink', 1.0); // 设置眨眼的权重为1.0表示完全闭眼
          blinkTimer = 0; // 重置计时器
      } else if (blinkTimer >= 0.1) {
          setFaceExpression(vrm, 'blink', 0); // 轻微延迟后打开眼睛，模拟眨眼的动作
      }
          // 获取并限制各个关节的旋转
      // const { neck, leftShoulder, rightShoulder, leftUpperArm, rightUpperArm, leftLowerArm, rightLowerArm, leftHand, rightHand, leftUpperLeg, rightUpperLeg, leftLowerLeg, rightLowerLeg, leftFoot, rightFoot } = vrm.humanoid.humanBones;

      // clampRotation(neck!.node, rotationLimits.neck);
      // clampRotation(leftShoulder!.node, rotationLimits.shoulderL);
      // clampRotation(rightShoulder!.node, rotationLimits.shoulderR);
      // clampRotation(leftUpperArm!.node, rotationLimits.elbowL);
      // clampRotation(rightUpperArm!.node, rotationLimits.elbowR);
      // clampRotation(leftLowerArm!.node, rotationLimits.wristL);
      // clampRotation(rightLowerArm!.node, rotationLimits.wristR);
      // clampRotation(leftUpperLeg!.node, rotationLimits.hip);
      // clampRotation(rightUpperLeg!.node, rotationLimits.hip);
      // clampRotation(leftLowerLeg!.node, rotationLimits.kneeL);
      // clampRotation(rightLowerLeg!.node, rotationLimits.kneeR);
      // clampRotation(leftFoot!.node, rotationLimits.ankleL);
      // clampRotation(rightFoot!.node, rotationLimits.ankleR);
      vrm.update(delta)
    }
    // console.log(delta, 'delta')
    // if (mixer) mixer.update(delta);
    // if (modelMixer) modelMixer.update(delta)
    // if (fbx && sk) {
    //     // console.log(sk.position)
    // //   fbx.position.set(sk.position.x + 1, sk.position.y - 0.8, sk.position.z)

    // }
    
  });
  return <group position={[0, -1, 0]}>
    {/* {fbx && <primitive object={fbx} />} */}
    {sk && <primitive object={sk} />}
    {/* {modelSk && <primitive object={modelSk} />} */}
  {skeletonHelper && (
    <primitive object={skeletonHelper} />
  )}
 {/* {model.vrm && <primitive object={model.vrm?.scene} />} */}
 <group ref={modelRef} />
 {/* {vrm && <primitive object={vrm} />} */}
</group>

};

export default BVHAnimationCapture