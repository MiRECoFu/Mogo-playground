

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
import { Viewer } from './features/vrmViewer/viewer';
import AvatarSample_A from './AvatarSample_A.vrm';
import { useAnimationFrame } from '@/utils/useAnimationFrame';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { convertBVHToVRMAnimation } from "./lib/bvh-converter/convertBVHToVRMAnimation";
import { loadVRMAnimation } from "./lib/VRMAnimation/loadVRMAnimation";
import { Model } from "./features/vrmViewer/Model";
import { VRMLoader } from "three-stdlib";
import { createVRMAnimationClip } from "@pixiv/three-vrm-animation";
interface FileBlob {
    blob: Blob;
    name: string;
  }
const BVHAnimationCapture = ({ url, fbx }: {url: string, fbx: any}) => {
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

  const convertWrapper = async (file: File) => {
    setNowConvert(true);
    let isPropertyConverted = true;
    try {
      if (!file.name.toLowerCase().endsWith('.bvh')) {
        throw new Error('Uploaded file is not a BVH file.');
      }
      const fileText = await file.text();

      const bvh = bvhLoader.parse(fileText);
      const vrmaBuffer = await convertBVHToVRMAnimation(bvh, {
        scale: location.hash.includes('NO_SCALING') ? 1.0 : 0.01
      });

      const vrmaDict: FileBlob = { blob: new Blob([vrmaBuffer]), name: file.name };
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



  const fetchAndConvertBVH = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch BVH file from URL.');
      }
  
      // 将响应内容读取为 Blob
      const bvhBlob = await response.blob();
      
      // 将 Blob 转换为 File 对象（提供必要的文件名和 MIME 类型）
      const bvhFile = new File([bvhBlob], 'downloaded.bvh', { type: 'application/octet-stream' });
  
      // 调用 convertWrapper 函数并传递文件
      await convertWrapper(bvhFile);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // const fbx = useLoader(FBXLoader, 'https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character.fbx')
  // console.log(fbx)
  React.useEffect(() => {
    initializeState()
    const loader = new BVHLoader();
    
    // const fbxLoader = new FBXLoader();
    // fbxLoader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character.fbx', (fbx) => {
    //     // fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
    //     console.log(fbx)
    //     setMixamoModel(fbx);
    //   });
    if (url) {
      fetchAndConvertBVH(url)
    }
   
    loader.load(url,  async (result) => {
      console.log(result)
      const { skeleton, clip } = result;
      // const boneSet = new Set<THREE.Object3D>(skeleton.bones);
      // console.log(skeleton.bones, clip)
      // let rootBone
      // for (const bone of skeleton.bones) {
      //   if (bone.parent == null || !boneSet.has(bone.parent)) {
      //     console.log(bone)
      //     // return bone;
      //     rootBone = bone
      //   }
      // }
      // rootBone.updateWorldMatrix(false, true);
      // Create a SkeletonHelper to visualize the skeleton
      const skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
      setSk(skeleton.bones[0])
      skeletonHelper.skeleton = skeleton;
      skeletonHelper.visible = true; // Ensure helper is visible
      skeletonHelper.scale.set(0.01, 0.01, 0.01); 
      // skeletonHelper.material = new THREE.LineBasicMaterial({
      //   // color: 0xff0000, // Change color to red or any color you prefer
      //   linewidth: 10 // Set line width (note: linewidth is ignored by some WebGL implementations)
      // });
      setSkeletonHelper(skeletonHelper);

       // Create a basic mesh to visualize the bones
       const geometry = new THREE.BoxGeometry(1, 1, 1);
       const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
       const mesh = new THREE.Mesh(geometry, material);
      //  if (skeletonRef.current) {
      //   skeletonRef.current.add(mesh);
      // }
      
      // const loader = new GLTFLoader();
      // const helperRoot = new THREE.Group();
      // loader.register((parser) => new VRMLoaderPlugin(parser, { helperRoot: helperRoot }));
      // const gltf = await loader.loadAsync(AvatarSample_A);
      // console.log(gltf)
      // let _vrm = gltf.userData.vrm
      // _vrm.scene.name = 'VRMRoot';
      // VRMUtils.rotateVRM0(_vrm);
      // const vrmMixer = new THREE.AnimationMixer(_vrm.scene);
      
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
        

        // const options = {
        //   fps: fps,
        // };
        if (!fbx.skeleton) {
          fbx.traverse((child) => {
            if (child.skeleton) {
              fbx.skeleton = child.skeleton;
            }
          });
        }

        SkeletonUtils.retarget(fbx, skeletonHelper, retargetOptions);
        const modelClip = SkeletonUtils.retargetClip(fbx, skeletonHelper, clip, retargetOptions);
        // console.log('modelClip', fbx.skeleton, modelClip, clip)
        const newModelMixer = new THREE.AnimationMixer(fbx);
        newModelMixer.clipAction(modelClip).play();
        setModelMixer(newModelMixer);
      }

      // SkeletonUtils.retargetClip(fbx, skeletonHelper, clip, {});
      // console.log('after retarget', fbx)
      // Create an AnimationMixer for animating the skeleton
      const newMixer = new THREE.AnimationMixer(skeleton.bones[0]);
      newMixer.clipAction(clip).play();
      setMixer(newMixer);
    });

    

    return () => {
      if (mixer) {
        mixer.stopAllAction();
        setSk(null)
        setSkeletonHelper(null)
        setModelSk(null)
        modelMixer?.stopAllAction()
        // console.log(skeletonHelper.position)
        // fbx.position.set(sk.position)
      }
    };
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
            
            
            if (blobURL) {
              const VRMAnimation = await loadVRMAnimation(blobURL);
              console.log(vrm.userData.vrm)
              setVrm(vrm.userData.vrm)
              const clip = createVRMAnimationClip(VRMAnimation!, vrm.userData.vrm);
              console.log(clip)
              vrm.userData.vrm.scene.name = 'VRMRoot';
              modelRef.current.add(vrm.scene);
              // VRMUtils.rotateVRM0(vrm.userData.vrm);
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



  // useEffect(() => {
  //   if (mixamoModel && skeletonHelper) {
  //     console.log('mixamoModel', mixamoModel)
  //     // 克隆 Mixamo 模型
  //     const targetModel = SkeletonUtils.clone(mixamoModel);

  //     // 使用 SkeletonUtils 进行重定向
  //     SkeletonUtils.retarget(targetModel, skeletonHelper);

  //     // 添加重定向后的模型到场景
  //     setMixamoModel(targetModel);
  //   }
  // }, [mixamoModel, skeletonHelper]);

  // React.useEffect(() => {
  //   const loader = new FBXLoader();
  //   loader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character.fbx', (fbx) => {
  //     // fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
  //     console.log(fbx)
  //     setMixamoModel(fbx);
  //   });
  // }, []);

  useFrame((state, delta) => {
    if (vrmMixer) {
      // console.log('vrm update')
      vrmMixer.update(delta)
      
    }
    if (vrm) {
      // vrm.scene.rotation.y = Math.P; // 使模型面朝前
      vrm.update(delta)
    }
    // console.log(delta, 'delta')
    if (mixer) mixer.update(delta);
    if (modelMixer) modelMixer.update(delta)
    if (fbx && sk) {
        // console.log(sk.position)
    //   fbx.position.set(sk.position.x + 1, sk.position.y - 0.8, sk.position.z)

    }
    
  });
  return <group position={[0, -1, 0]}>
    {/* {fbx && <primitive object={fbx} />} */}
    {sk && <primitive object={sk} />}
    {/* {modelSk && <primitive object={modelSk} />} */}
  {/* {skeletonHelper && (
    <primitive object={skeletonHelper} />
  )} */}
 {/* {model.vrm && <primitive object={model.vrm?.scene} />} */}
 <group ref={modelRef} />
 {/* {vrm && <primitive object={vrm} />} */}
</group>

  // return skeleton ? (
  //   <group position={[0, 0, 0]} ref={skeletonRef}>
  //     {/* <mesh ref={skeletonRef} geometry={skeletonRef.current} material={new THREE.MeshBasicMaterial()} /> */}
  //     <primitive object={skeleton} />
  //   </group>
    
  // ) : null;
};

export default BVHAnimationCapture