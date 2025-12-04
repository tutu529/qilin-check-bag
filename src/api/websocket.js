// api/websocket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.messageHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // 服务器地址
    this.serverUrl = "http://192.168.26.100:8081/ws";
  }

  /**
   * 初始化连接
   */
  init(onConnectCallback = null, onErrorCallback = null) {
    if (this.client && this.isConnected) {
      console.log("WebSocket已经连接");
      if (onConnectCallback) onConnectCallback();
      return;
    }

    console.log("初始化WebSocket连接");

    // 创建SockJS连接
    const sock = new SockJS(this.serverUrl);
    
    this.client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000, // 5秒重连
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log("WebSocket连接成功");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // 订阅新图片通知主题
        this.subscribeToNewImageTopic();
        
        if (onConnectCallback) {
          onConnectCallback();
        }
        
        // 通知所有处理器连接成功
        this.notifyHandlers({
          type: "system",
          message: "connected",
          timestamp: new Date().toISOString()
        });
      },
      
      onStompError: (frame) => {
        console.error("WebSocket错误:", frame);
        this.isConnected = false;
        
        if (onErrorCallback) {
          onErrorCallback(frame);
        }
      },
      
      onDisconnect: () => {
        console.log("WebSocket连接断开");
        this.isConnected = false;
      },
      
      onWebSocketError: (error) => {
        console.error("WebSocket连接错误:", error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("达到最大重连次数，停止重连");
          this.client.deactivate();
        }
      }
    });

    // 激活客户端
    this.client.activate();
  }

  /**
   * 订阅新图片主题
   */
  subscribeToNewImageTopic() {
    if (!this.client || !this.isConnected) {
      console.warn("WebSocket未连接，无法订阅");
      return;
    }

    console.log("订阅新图片通知主题");
    
    this.client.subscribe('/topic/new-image', (message) => {
      console.log("收到新图片通知:", message.body);
      
      this.notifyHandlers({
        type: "new_image",
        data: message.body,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 注册消息处理器
   */
  addMessageHandler(handler) {
    if (typeof handler !== "function") {
      console.error("消息处理器必须是一个函数");
      return () => {};
    }

    this.messageHandlers.add(handler);
    console.log("注册消息处理器，当前数量:", this.messageHandlers.size);

    // 返回取消注册的函数
    return () => {
      this.messageHandlers.delete(handler);
      console.log("取消注册消息处理器，剩余数量:", this.messageHandlers.size);
    };
  }

  /**
   * 通知所有处理器
   */
  notifyHandlers(message) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error("消息处理器执行出错:", error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.client) {
      console.log("断开WebSocket连接");
      this.messageHandlers.clear();
      
      try {
        this.client.deactivate();
      } catch (error) {
        console.error("断开连接时出错:", error);
      }
      
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 创建单例实例
const websocketService = new WebSocketService();

export default websocketService;