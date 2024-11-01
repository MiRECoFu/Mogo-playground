import MoCap from '@/components/MoCap';
import PureScene from '@/components/PureScene';
import { ConfigProvider } from 'antd';
import * as React from 'react'

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
          <div style={{ height: "calc(100vh - 0px)" }}>
          {/* <PureScene /> */}
          <MoCap />
        </div>
        </ConfigProvider>
    );
  };
  
  export default SingleScene;