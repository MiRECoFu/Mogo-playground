import { useBox } from "@react-three/cannon";
import * as React from 'react'

const FBXModelWithPhysics = ({ fbx }: any) => {
    // 使用物理系统中的盒子体积
    const [ref, api] = useBox(() => ({
        mass: 30, // 设置一定的质量以保留碰撞体积
        position: [0, 0, 0], // 模型初始位置
        args: [2, 2, 2], // 包围盒大小
        type: "Kinematic", // 使物体不受重力影响，但参与碰撞
      }));
    
      // 将FBX模型绑定到物理盒子上
      React.useEffect(() => {
        if (fbx) {
          // 订阅位置和旋转变化
          api.position.subscribe((p) => {
            fbx.position.set(p[0], p[1], p[2]);
          });
          api.rotation.subscribe((r) => {
            fbx.rotation.set(r[0], r[1], r[2]);
          });
        }
      }, [fbx, api]);
    
    return (
      <mesh ref={ref}>
        <primitive object={fbx} />
      </mesh>
    );
  };

  export default FBXModelWithPhysics