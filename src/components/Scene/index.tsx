
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import BVHAnimation from "../BVHAnimation";
const Scene = () => {
    return (
      <Canvas camera={{ position: [0, 5, 5] }}>
        {/* 黑色背景 */}
        <color attach="background" args={["#000000"]} />
  
        {/* 光源 */}
        <ambientLight />
      <spotLight position={[10, 10, 10]} />
        <gridHelper args={[10, 10, 'red', 'gray']} />
        {/* BVH 动画 */}
        <BVHAnimation />
        {/* <sphereGeometry args={[1, 32]} /> */}
        {/* 控制器 */}
        <OrbitControls />
      </Canvas>
    );
  };
  
  export default Scene