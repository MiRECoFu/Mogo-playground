import React from "react";
import { Button } from "antd";

interface IProps {
    url: string
}

const DownloadButton: React.FC<IProps> = ({ url }) => {
  const handleDownload = () => {
    // 创建一个临时的 <a> 元素
    const link = document.createElement("a");
    link.href = url;
    link.download = "file.bvh"; // 设置下载的文件名
    link.target = "_blank"; // 在新标签页中打开
    document.body.appendChild(link); // 将链接添加到 DOM
    link.click(); // 模拟点击
    document.body.removeChild(link); // 下载完成后移除链接
  };

  return (
    <Button onClick={handleDownload}>
      Download BVH
    </Button>
  );
};

export default DownloadButton;
