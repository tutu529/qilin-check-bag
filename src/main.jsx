import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HashRouter as Router } from 'react-router-dom';
// import websocketService from './api/websocket';

// // 初始化WebSocket连接
// websocketService.connect().catch(error => {
//   console.error('初始化WebSocket连接失败:', error);
//   // 连接失败时，可以设置重试机制
//   setTimeout(() => {
//     websocketService.connect().catch(err => {
//       console.error('重试WebSocket连接失败:', err);
//     });
//   }, 5000);
// });

createRoot(document.getElementById("root")).render(
  <Router>
    <App />
  </Router>
);
