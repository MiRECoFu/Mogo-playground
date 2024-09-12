

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useAnimations, useBVH } from "@react-three/drei";
import * as THREE from "three";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader";
import { SkeletonHelper } from "three";
const bvh = require('/Users/fudongjie/text2motion/Mogo-playground/src/assets/run-on-trendmill.bvh')
// import '../../../mock/singlefoot-stand.bvh'
// const bvh = require('../../../mock/singlefoot-stand.bvh')

const BVHAnimation = () => {
  const skeletonRef = useRef();
  const [skeletonHelper, setSkeletonHelper] = useState(null);
  const [mixer, setMixer] = useState(null);
  const [sk, setSk] = useState(null)


  React.useEffect(() => {
    const loader = new BVHLoader();
    loader.load(bvh,  (result) => {
      const { skeleton, clip } = result;

      // Create a SkeletonHelper to visualize the skeleton
      const skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
      console.log(skeleton.bones, 'bones')
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
      
      if (skeletonRef.current) {
        console.log('add skeleton helper', skeletonHelper)
        skeletonRef.current.add(skeletonHelper);
      } else {
        console.error('skeletonRef.current is not defined');
      }

      // Create an AnimationMixer for animating the skeleton
      const newMixer = new THREE.AnimationMixer(skeleton.bones[0]);
      newMixer.clipAction(clip).play();
      setMixer(newMixer);
    });

    return () => {
      if (mixer) {
        mixer.stopAllAction();
      }
    };
  }, []);

  useFrame((state, delta) => {
    // console.log(delta, 'delta')
    if (mixer) mixer.update(delta);
  });
  return <group ref={skeletonRef}>
    {sk && <primitive object={sk} />}
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

export default BVHAnimation