import axios from "axios";
import { message } from "antd";

// 获取当前访问的host
const currentHost = window.location.hostname;

// 设置基础API地址
const LOCAL_IPS = ["192.168.1.7", "192.168.1.11","localhost"]; //开发ip
const BASE_URL = LOCAL_IPS.includes(currentHost)
  ? "http://localhost:8081"
  : "http://192.168.26.100:8081";

// 创建axios实例
const service = axios.create({
  baseURL: BASE_URL, // 根据你的环境变量配置
  // timeout: 5000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // 从本地存储获取token
    if (token) {
      config.headers["token"] = `${token}`;
      config.headers["qilin-user-id"] = `${userId}`; // 添加token到请求头
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      message.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message || "Error"));
    }
    return res;
  },
  (error) => {
    message.error(error.message || "请求失败");
    return Promise.reject(error);
  }
);

export default service;
