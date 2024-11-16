import PureScene from "@/components/PureScene";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ConfigProvider, theme } from "antd";

const SingleScene = () => {
    return (
        <ConfigProvider
        theme={{
          // 1. 单独使用暗色算法
        //   algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#f8a8cc'
          }
    
          // 2. 组合使用暗色算法与紧凑算法
          // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        }}
        >
          <div style={{ height: "100%" }}>
            <PureScene />
          </div>
        </ConfigProvider>
    );
  };
  
  export default SingleScene;