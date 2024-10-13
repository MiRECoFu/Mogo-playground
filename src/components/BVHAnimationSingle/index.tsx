

import React, { useRef, useEffect, useState } from "react";
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
const BVHAnimationSingle = ({ url, fbx }: {url: string, fbx: any}) => {
  const skeletonRef = useRef();
  const [skeletonHelper, setSkeletonHelper] = useState(null);
  const [mixer, setMixer] = useState(null);
  const [modelMixer, setModelMixer] = useState(null);
  // const [modelMixer2, setModelMixer2] = useState(null)
  // const [modelMixer3, setModelMixer3] = useState(null)
  const [sk, setSk] = useState(null)
  const [modelSk, setModelSk] = useState(null)

  // const fbx = useLoader(FBXLoader, 'https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character.fbx')
  // console.log(fbx)
  React.useEffect(() => {
    const loader = new BVHLoader();
    // const fbxLoader = new FBXLoader();
    // fbxLoader.load('https://mogo-bvh.oss-cn-beijing.aliyuncs.com/character.fbx', (fbx) => {
    //     // fbx.scale.set(0.01, 0.01, 0.01); // 根据需要缩放模型
    //     console.log(fbx)
    //     setMixamoModel(fbx);
    //   });
    loader.load(url,  (result) => {
      const { skeleton, clip } = result;
      

      // Create a SkeletonHelper to visualize the skeleton
      const skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
      setSk(skeleton.bones[0])
      skeletonHelper.skeleton = skeleton;
      skeletonHelper.visible = true; // Ensure helper is visible
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
    // console.log(delta, 'delta')
    if (mixer) mixer.update(delta);
    if (modelMixer) modelMixer.update(delta)
    if (fbx && sk) {
      fbx.position.set(sk.position.x + 1, sk.position.y - 0.8, sk.position.z)
    }
  });
  return <group >
    {fbx && <primitive object={fbx} />}
    {sk && <primitive object={sk} />}
    {modelSk && <primitive object={modelSk} />}
  {skeletonHelper && (
    <primitive object={skeletonHelper} />
  )}
</group>

  // return skeleton ? (
  //   <group position={[0, 0, 0]} ref={skeletonRef}>
  //     {/* <mesh ref={skeletonRef} geometry={skeletonRef.current} material={new THREE.MeshBasicMaterial()} /> */}
  //     <primitive object={skeleton} />
  //   </group>
    
  // ) : null;
};

export default BVHAnimationSingle