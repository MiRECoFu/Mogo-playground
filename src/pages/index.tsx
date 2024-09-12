import Scene from '@/components/Scene';
import styles from './index.less';
import { ConfigProvider, theme } from 'antd';

export default function IndexPage() {
  return (
    <ConfigProvider
    theme={{
      // 1. 单独使用暗色算法
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#f8a8cc'
      }

      // 2. 组合使用暗色算法与紧凑算法
      // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    }}
    >
      <div style={{ height: "100vh" }}>
      <Scene />
    </div>
    </ConfigProvider>
    
  );
}
