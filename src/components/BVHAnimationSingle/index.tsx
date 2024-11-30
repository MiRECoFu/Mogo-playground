

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
// import AvatarSample_A from '@/components/BVHAnimationCapture/AvatarSample_B.vrm'
import AvatarSample_A from '@/components/BVHAnimationCapture/jinx.vrm'
import { useAnimationFrame } from '@/utils/useAnimationFrame';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { convertBVHToVRMAnimation } from "../BVHAnimationCapture/lib/bvh-converter/convertBVHToVRMAnimation";
import { loadVRMAnimation } from "../BVHAnimationCapture/lib/VRMAnimation/loadVRMAnimation";
import { Model } from "../BVHAnimationCapture/features/vrmViewer/Model";
import { VRMLoader } from "three-stdlib";
import { VRMLookAtQuaternionProxy, createVRMAnimationClip } from "@pixiv/three-vrm-animation";
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
      console.log('bvh skeleton.bones', skeleton.bones)
      convertWrapper('output.bvh', result)
      skeleton.bones[0].traverse((object: THREE.Object3D) => {
        if (object.type == 'Bone') {
          (object as THREE.Bone).rotation.order = 'ZYX';
        }
      });

      const skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
      // setSk(skeleton.bones[0])
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

        
      }
    });

    


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
              console.log(vrm.userData.vrm)
              const humanoidBones = vrm.userData.vrm.humanoid.humanBones

              Object.values(humanoidBones).forEach((bone) => {
                bone.node.rotation.order = 'ZYX'; // 根据你的需要设置旋转顺序
              });
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
    
    if (vrm) {
      vrm.update(delta)
      const lookAt = vrm.lookAt;
      // lookAt?.lookAt(state.camera.position)
      lookAt?.update(delta)
      const humanoidBones = vrm.humanoid.humanBones;
      const headBone = vrm.humanoid.getRawBoneNode("head");
      const neckBone = vrm.humanoid.getRawBoneNode("neck");
      // console.log('nneckBone',neckBone)
      const smoothFactor = 0.1; // 平滑系数，值越小越平滑
      const rotationThreshold = Math.PI / 4; // 限制跳跃阈值

      // 平滑处理头部骨骼
      if (headBone) {
        const currentQuaternion = headBone.quaternion.clone();
        const targetQuaternion = currentQuaternion.clone();

        // 限制旋转范围
        const euler = new THREE.Euler().setFromQuaternion(currentQuaternion);
        euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 6, Math.PI / 6); // 限制俯仰
        euler.y = THREE.MathUtils.clamp(euler.y, -Math.PI / 4, Math.PI / 4); // 限制水平
        euler.z = THREE.MathUtils.clamp(euler.z, -Math.PI / 8, Math.PI / 8); // 限制侧倾

        targetQuaternion.setFromEuler(euler);

        // 检测旋转跳跃并插值
        if (currentQuaternion.angleTo(targetQuaternion) > rotationThreshold) {
          headBone.quaternion.slerp(targetQuaternion, smoothFactor);
        } else {
          headBone.quaternion.copy(targetQuaternion);
        }
      }

      // 平滑处理脖子骨骼
      if (neckBone) {
        const currentQuaternion = neckBone.quaternion.clone();
        const targetQuaternion = currentQuaternion.clone();

        // 限制旋转范围
        const euler = new THREE.Euler().setFromQuaternion(currentQuaternion);
        euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 6, Math.PI / 6); // 限制俯仰
        euler.y = THREE.MathUtils.clamp(euler.y, -Math.PI / 6, Math.PI / 6); // 限制水平
        euler.z = THREE.MathUtils.clamp(euler.z, -Math.PI / 4, Math.PI / 4); // 限制侧倾
        // euler.order = 'ZYX'
        targetQuaternion.setFromEuler(euler);

        // 检测旋转跳跃并插值
        if (currentQuaternion.angleTo(targetQuaternion) > rotationThreshold) {
          neckBone.quaternion.slerp(targetQuaternion, smoothFactor);
        } else {
          neckBone.quaternion.copy(targetQuaternion);
        }
      }
      Object.keys(humanoidBones).forEach((key) => {
        const bone = humanoidBones[key]
        // console.log(bone.node.name, key, '')
        if (key === 'leftShoulder') {
          bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 6, Math.PI / 6);
          bone.node.rotation.y = THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
          bone.node.rotation.z = THREE.MathUtils.clamp(bone.node.rotation.z, -Math.PI / 4, Math.PI / 9);
        }
        // if (key === 'leftUpperArm') {
        //   // bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 6, Math.PI / 6);
        //   // bone.node.rotation.y += THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
        //   bone.node.rotation.z += Math.PI / 9
        // }
        // if (key === 'leftForerArm') {
        //   // bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 6, Math.PI / 6);
        //   // bone.node.rotation.y += THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
        //   bone.node.rotation.z += Math.PI / 9
        // }

        if (key === 'rightShoulder') {
          bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 6, Math.PI / 6);
          bone.node.rotation.y = THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
          bone.node.rotation.z = THREE.MathUtils.clamp(bone.node.rotation.z, -Math.PI / 9, Math.PI / 4);
        }
        // if (key === 'rightUpperArm') {
        //   // bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 6, Math.PI / 6);
        //   // bone.node.rotation.y += THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
        //   bone.node.rotation.z -= Math.PI / 9
        // }
        // if (key === 'rightForerArm') {
        //   // bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 6, Math.PI / 6);
        //   // bone.node.rotation.y += THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
        //   bone.node.rotation.z -= Math.PI / 9
        // }
      // if (bone && key !== 'head' && key !== 'neck') {
        // 添加旋转角度限制 (以肩膀为例，可根据实际需求调整)
        // bone.node.rotation.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 4, Math.PI / 4);
        // bone.node.rotation.y = THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 6, Math.PI / 6);
        // bone.node.rotation.z = THREE.MathUtils.clamp(bone.node.rotation.z, -Math.PI / 6, Math.PI / 6);

        // 平滑骨骼旋转
        const bodySmoothFactor = 0.1; // 平滑系数，越小越平滑
        // bone.node.rotation.x += (bone.node.rotation.x - bone.node.rotation.x) * bodySmoothFactor;
        // bone.node.rotation.y += (bone.node.rotation.y - bone.node.rotation.y) * bodySmoothFactor;
        // bone.node.rotation.z += (bone.node.rotation.z - bone.node.rotation.z) * bodySmoothFactor;
        const currentQuaternion = bone.node.quaternion.clone();
        const targetQuaternion = currentQuaternion.clone();
        const euler = new THREE.Euler().setFromQuaternion(currentQuaternion);
        // euler.order = 'ZYX'
        // euler.x = THREE.MathUtils.clamp(bone.node.rotation.x, -Math.PI / 2, Math.PI / 2);
        // euler.y = THREE.MathUtils.clamp(bone.node.rotation.y, -Math.PI / 2, Math.PI / 2);
        // euler.z = THREE.MathUtils.clamp(bone.node.rotation.z, -Math.PI / 2, Math.PI / 2);
        targetQuaternion.setFromEuler(euler)
        bone.node.quaternion.slerp(targetQuaternion, bodySmoothFactor);
      // }
    });
      
      blinkTimer += delta;

      // 当计时器超过设定的眨眼间隔时触发眨眼
      if (blinkTimer >= blinkInterval) {
          setFaceExpression(vrm, 'blink', 1.0); // 设置眨眼的权重为1.0表示完全闭眼
          blinkTimer = 0; // 重置计时器
      } else if (blinkTimer >= 0.1) {
          setFaceExpression(vrm, 'blink', 0); // 轻微延迟后打开眼睛，模拟眨眼的动作
      }

     
    }

    if (vrmMixer) {
      // console.log('vrm update')
      vrmMixer.update(delta)
      
    }
  });
  return <group position={[0, -1.5, 0]}>
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