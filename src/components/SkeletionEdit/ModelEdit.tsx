import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonHelper } from 'three';

const ModelEdit = () => {
  const fbx = useLoader(FBXLoader, 'https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Kachujin%20G%20Rosales.fbx');  // 模型路径
  const skeletonRef = useRef();
  const controlsRef = useRef();
  const meshRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [skeletonHelper, setSkeletonHelper] = React.useState<THREE.SkeletonHelper>()
  const { camera, scene, gl } = useThree();
  const [selectedBone, setSelectedBone] = React.useState<THREE.Object3D | null>(null);
  // 骨架可视化
  

  React.useEffect(() => {
    if (fbx) {
        fbx.scale.set(0.01, 0.01, 0.01); 
        const skinnedMesh = fbx.getObjectByProperty('type', 'SkinnedMesh');
        if (skinnedMesh) {
          const _skeletonHelper = new THREE.SkeletonHelper(fbx);
          _skeletonHelper.visible = true;
          setSkeletonHelper(_skeletonHelper)
          skinnedMesh.parent.add(_skeletonHelper);

        }
        
        
    }
  }, [fbx])
  // Handle mouse click events
  const handleMouseClick = (event) => {
    if (!skeletonHelper) return
    // Convert mouse coordinates to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
    raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();

    const intersects = raycaster.intersectObjects(scene.children, true);

    // Debug: Print intersects
    console.log(intersects);

    // Find intersection with bones in the skeletonHelper
    const boneIntersects = intersects.filter(intersect => {
      return intersect.object && intersect.object.parent && intersect.object.parent instanceof SkeletonHelper;
    });

    if (boneIntersects.length > 0) {
      const bone = intersects[0].object;
      console.log(bone, 'bbone')
      setSelectedBone(bone);
    } else {
      setSelectedBone(null);
    }
  };

  React.useEffect(() => {
    window.addEventListener('click', handleMouseClick);
    return () => {
      window.removeEventListener('click', handleMouseClick);
    };
  }, [skeletonHelper, raycaster, mouse]);
  // 实时更新
//   useFrame(() => {
//     if (skeletonRef.current) {
//       skeletonRef.current.update();
//     }
//   });

  return (
    <group>
      <primitive object={fbx} ref={meshRef} />
      {skeletonHelper && <primitive ref={skeletonRef} object={skeletonHelper} />}
      {/* 使用 TransformControls 让用户可以拖动骨骼节点 */}
      {skeletonHelper && <TransformControls ref={controlsRef} object={skeletonHelper} />}
      
    </group>
  );
};

export default ModelEdit