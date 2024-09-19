import SkeletonEdit from "@/components/SkeletionEdit";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const SkeletonEditPage = () => {
    return (
      <div style={{
        height: '100vh'
      }}>
        <SkeletonEdit />
      </div>
    );
  };
  
  export default SkeletonEditPage;