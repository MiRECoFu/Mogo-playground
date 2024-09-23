import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Card } from 'antd';
// BoneSphere component to display a sphere at the bone's position
interface BoneSphereProps {
  bone: THREE.Bone;
  onClick: (bone: THREE.Bone) => void;
}

const BoneSphere: React.FC<BoneSphereProps> = ({ bone, onClick, isSelected }) => {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  // Update bone position each frame
  useFrame(() => {
    const bonePosition = new THREE.Vector3();
    bone.getWorldPosition(bonePosition);
    setPosition([bonePosition.x, bonePosition.y, bonePosition.z]);
  });

  return (
    <mesh position={position} onClick={() => onClick(bone)}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? '#ffcc00' : '#a6c1ee'} // 选中时高亮颜色
        transparent={true}
        opacity={isSelected ? 1 : 0.7} // 半透明效果
        emissive={isSelected ? '#ffcc00' : '#000000'} // 发光效果
        emissiveIntensity={isSelected ? 1 : 0} // 选中时发光强度
        depthTest={false}
      />
    </mesh>
  );
};

const ModelEdit: React.FC = () => {
  const fbx = useLoader(FBXLoader, 'https://mogo-bvh.oss-cn-beijing.aliyuncs.com/Kachujin%20G%20Rosales.fbx'); // Model path
  const [bones, setBones] = useState<THREE.Bone[]>([]);
  const [selectedBone, setSelectedBone] = useState<THREE.Bone | null>(null);

  // Load model and extract bones
  useEffect(() => {
    if (fbx) {
      fbx.scale.set(0.01, 0.01, 0.01);
      const skinnedMesh = fbx.getObjectByProperty('type', 'SkinnedMesh') as THREE.SkinnedMesh;
      if (skinnedMesh && skinnedMesh.skeleton) {
        skinnedMesh.raycast = () => {};
        setBones(skinnedMesh.skeleton.bones); // Extract bone list
      }
    }
  }, [fbx]);

  // React.useEffect(() => {
  //   bones && bones.forEach(bone => {
  //     bone.renderOrder = 1; // 提高骨骼渲染顺序
  //   });
  // }, [bones])

  // Handle bone click to display bone info
  const handleBoneClick = (bone: THREE.Bone) => {
    if (bone === selectedBone) {
      setSelectedBone(null)
      return
    }
    setSelectedBone(bone);
  };

  return (
    <group>
    <primitive object={fbx} position={[0, -1, 0]} />
    {bones.map((bone, index) => (
      <BoneSphere key={index} bone={bone} onClick={handleBoneClick} isSelected={selectedBone === bone} />
    ))}
   {selectedBone && (
        <Html
        position={[0, 0, 0]}
          transform={false}  // 取消 3D 坐标的影响
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            width: '300px',
          }}
        >
          <Card title="Bone Info" bordered={false}>
            <p><strong>Name:</strong> {selectedBone.name}</p>
          </Card>
        </Html>
      )}
    {/* {selectedBone && (
      <Text
        position={[
          selectedBone.position.x,
          selectedBone.position.y + 0.1, // Slightly above the bone
          selectedBone.position.z
        ]}
        fontSize={0.05}
        color="white"
      >
        Bone: {selectedBone.name}
      </Text>
    )} */}
  </group>
  );
};

export default ModelEdit