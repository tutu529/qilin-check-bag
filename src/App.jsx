import "./App.css";
import React, { useEffect } from "react";
import MyLayout from "./components/MyLayout";
import ImageDetailPage1 from "./page/ImageDetailPage1";
import { Navigate, Route, Routes } from "react-router-dom";
// import websocketService from './api/websocket';

function App() {
  // 处理组件卸载时断开WebSocket连接
  useEffect(() => {
    return () => {
      // websocketService.disconnect();
    };
  }, []);

  return (
      <MyLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/image-detail1" replace />} />
          <Route path="/image-detail1" element={<ImageDetailPage1 />} />
        </Routes>
      </MyLayout>
  );
}

export default App;
