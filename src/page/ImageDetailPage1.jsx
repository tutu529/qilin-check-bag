import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Card } from "antd";
import ImageInfoViewer from "../components/ImageInfoViewer";
import NavigationControls from "../components/NavigationControls";
import { imageJudge, judge } from "../api/imageAPI";
import websocketService from "../api/websocket";
import ImageInfoDataItem from "../components/ImageInfoDataItem";
import moment from "moment";

// 数据字段映射
const keyToChinese = {
  mainCargoCode: "清单号",
  subCargoCode: "分运单号",
  businessId: "业务单号",
  imgJudgment: "审图指令",
  preJudgment: "海关布控",
  createdTime: "过机时间",
  materialWeight: "申报重量",
  materialValue: "申报价值",
  materialCount: "申报数量",
  materialBaseName: "主要物品",
};

// 审阅结果映射
const JUDGE_VALUES = {
  RELEASE: 1, // 放行
  CHECK: 2, // 查验
};

// 模式枚举
const MODES = {
  HTTP: "http",
  WEBSOCKET: "websocket",
};

// 倒计时时间常量（秒）
const COUNTDOWN_TIME = 5;

const ImageDetailPage1 = () => {
  // ref 引用
  const handleWebSocketDataRef = useRef();
  const isProcessingRef = useRef(false); // 防止重复请求
  const isInCountdownRef = useRef(false); // 是否在倒计时中（关键状态）
  const pendingWebSocketMessageRef = useRef(false); // 是否有待处理的WebSocket消息
  
  // 分离状态
  const [imageData, setImageData] = useState({
    url: "",
    zoomLevel: 1,
    position: { x: 0, y: 0 },
    rotation: 0,
    isDragging: false,
    startPos: { x: 0, y: 0 },
    isLoading: false,
  });

  const [pageData, setPageData] = useState({
    info: {},
    list: [],
    pageNum: 1,
    pageSize: 10,
    index: 0,
    totalImages: 0,
  });

  // 今日查验和放行统计
  const [todayStats, setTodayStats] = useState({
    failCount: 0, // 今日查验个数
    passCount: 0, // 今日放行个数
  });

  // 倒计时状态
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [mode, setMode] = useState(MODES.HTTP);
  const countdownTimerRef = useRef(null);
  
  // 存储当前图片ID
  const currentScrollGraphIdRef = useRef("");
  const currentBusinessIdRef = useRef("");
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [lastNotification, setLastNotification] = useState(null);
  
  // 检查数据是否有效
  const isValidData = useCallback((data) => {
    return (
      data &&
      data.scrollGraphId &&
      data.scrollGraphId !== "" &&
      data.scrollGraphId !== null &&
      data.imageBase64
    );
  }, []);

  // 清除倒计时
  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    isInCountdownRef.current = false;
    setCountdown(0);
  }, []);

  // 开始倒计时
  const startCountdown = useCallback(() => {
    console.log("开始倒计时，标记为倒计时中");
    
    // 清除已有的倒计时
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    // 关键：标记为倒计时中（有图在审阅）
    isInCountdownRef.current = true;
    setCountdown(COUNTDOWN_TIME);
    setMode(MODES.HTTP);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          console.log("倒计时结束，自动放行");
          
          // 清除倒计时标记
          isInCountdownRef.current = false;
          clearCountdown();
          
          const scrollGraphId = currentScrollGraphIdRef.current;
          const scanBarcode = currentBusinessIdRef.current;
          
          if (scrollGraphId && !isProcessingRef.current) {
            isProcessingRef.current = true;
            
            judge({
              scrollGraphId,
              judge: JUDGE_VALUES.RELEASE,
              scanBarcode,
            })
              .then((res) => {
                if (res.code === 200 && res.data) {
                  setTodayStats({
                    failCount: res.data.failCount || 0,
                    passCount: res.data.passCount || 0,
                  });
                }
              })
              .catch(console.error)
              .finally(() => {
                isProcessingRef.current = false;
                // 检查是否有待处理的WebSocket消息
                if (pendingWebSocketMessageRef.current) {
                  console.log("有未处理的WebSocket消息，立即获取新图片");
                  pendingWebSocketMessageRef.current = false;
                  fetchImageData();
                } else {
                  // 正常获取新图片
                  setTimeout(() => {
                    fetchImageData();
                  }, 100);
                }
              });
          } else {
            setTimeout(() => {
              fetchImageData();
            }, 100);
          }
          
          return COUNTDOWN_TIME;
        }
        return prevCount - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  // 获取图片数据
  const fetchImageData = useCallback(async () => {
    if (isProcessingRef.current) {
      console.log("正在处理中，跳过请求");
      return;
    }

    console.log("发起imageJudge请求获取新图片");
    setImageData((prev) => ({ ...prev, isLoading: true }));
    isProcessingRef.current = true;

    try {
      const res = await imageJudge();
      console.log("imageJudge响应:", res);

      if (res.code === 200 && res.data) {
        const newData = res.data;
        const isValid = isValidData(newData);

        currentScrollGraphIdRef.current = newData?.scrollGraphId || "";
        currentBusinessIdRef.current = newData?.businessId || "";
        
        if (isValid) {
          setImageData((prev) => ({
          ...prev,
          url: newData?.imageBase64 || "",
          isLoading: false,
        }));

        setPageData((prev) => ({
          ...prev,
          info: newData || {},
          totalImages: newData?.totalImages || 0,
        }));
          console.log("获取到有效图片，开始倒计时");
          startCountdown();
        } else {
          console.log("没有获取到有效图片，切换到WebSocket监听模式");
          setMode(MODES.WEBSOCKET);
          clearCountdown();
          setImageData((prev) => ({ ...prev, isLoading: false }));
          
          // 如果没有图片，但有待处理的WebSocket消息，立即重试
          if (pendingWebSocketMessageRef.current) {
            console.log("有待处理的WebSocket消息，立即重试获取图片");
            pendingWebSocketMessageRef.current = false;
            setTimeout(() => {
              fetchImageData();
            }, 500);
          }
        }
      } else {
        console.log("没有可用的新图片，切换到WebSocket监听模式");
        setMode(MODES.WEBSOCKET);
        clearCountdown();
        setImageData((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("imageJudge请求失败:", error);
      setMode(MODES.WEBSOCKET);
      clearCountdown();
      setImageData((prev) => ({ ...prev, isLoading: false }));
    } finally {
      isProcessingRef.current = false;
    }
  }, [isValidData, startCountdown, clearCountdown]);

  // 处理judge请求（用户点击查验/放行）
  const handleJudgeRequest = useCallback((judgeValue) => {
    if (isProcessingRef.current) {
      console.log("正在处理中，跳过请求");
      return;
    }

    console.log("用户操作：", judgeValue === JUDGE_VALUES.CHECK ? "查验" : "放行");
    
    // 清除倒计时标记
    isInCountdownRef.current = false;
    clearCountdown();
    
    const scrollGraphId = currentScrollGraphIdRef.current;
    const scanBarcode = currentBusinessIdRef.current;

    if (!scrollGraphId) {
      console.log("scrollGraphId为空，无法发送judge请求");
      fetchImageData();
      return;
    }

    console.log("发送judge请求:", { judgeValue, scrollGraphId, scanBarcode });

    isProcessingRef.current = true;

    judge({
      scrollGraphId,
      judge: judgeValue,
      scanBarcode,
    })
      .then((res) => {
        if (res.code === 200) {
          console.log("judge请求成功");
          if (res.data) {
            setTodayStats({
              failCount: res.data.failCount || 0,
              passCount: res.data.passCount || 0,
            });
          }
        }
      })
      .catch((error) => {
        console.error("judge请求失败:", error);
      })
      .finally(() => {
        isProcessingRef.current = false;
        
        // 检查是否有待处理的WebSocket消息
        if (pendingWebSocketMessageRef.current) {
          console.log("有未处理的WebSocket消息，立即获取新图片");
          pendingWebSocketMessageRef.current = false;
          fetchImageData();
        } else {
          // 正常获取新图片
          setTimeout(() => {
            fetchImageData();
          }, 100);
        }
      });
  }, [clearCountdown, fetchImageData]);

  // WebSocket消息处理 - 关键修改
  const handleWebSocketData = useCallback((data) => {
    console.log("处理WebSocket数据:", data);

    if (data && data.type === "new_image") {
      console.log("收到新图片通知");
      console.log("当前客户端状态：", {
        正在处理中: isProcessingRef.current,
        倒计时中: isInCountdownRef.current,
        当前图片ID: currentScrollGraphIdRef.current,
        有图片: !!imageData.url
      });

      // 关键逻辑：只有在以下情况才获取新图片
      // 1. 当前没有在审图中（没有倒计时）
      // 2. 当前没有正在处理的请求
      
      if (isProcessingRef.current) {
        // 场景1：正在处理请求，标记有待处理消息
        console.log("正在处理请求，标记有待处理的WebSocket消息");
        pendingWebSocketMessageRef.current = true;
      } else if (isInCountdownRef.current) {
        // 场景2：在倒计时中（有图正在审阅）→ 忽略WebSocket消息
        console.log("在倒计时中（有图片正在审阅），忽略WebSocket通知");
        // 什么都不做，继续审阅当前图片
      } else {
        // 场景3：空闲状态（没有在审图中）→ 立即获取新图片
        console.log("空闲状态，开始获取新图片");
        // 添加随机延迟，避免多个空闲客户端同时请求
        const delay = Math.random() * 300; // 0-300ms随机延迟
        console.log(`延迟${delay.toFixed(0)}ms后获取`);
        
        setTimeout(() => {
          if (!isProcessingRef.current && !isInCountdownRef.current) {
            fetchImageData();
          } else {
            console.log("延迟期间状态发生变化，标记待处理");
            pendingWebSocketMessageRef.current = true;
          }
        }, delay);
      }
    }
  }, [fetchImageData]);

  // 保持 ref 最新
  useEffect(() => {
    handleWebSocketDataRef.current = handleWebSocketData;
  }, [handleWebSocketData]);

  // 初始化WebSocket
  useEffect(() => {
    // 初始加载数据
    fetchImageData();

    // 初始化WebSocket连接
    console.log("初始化WebSocket连接...");

    websocketService.init(
      () => {
        console.log("WebSocket连接成功回调");
        setWsStatus("connected");
      },
      (error) => {
        console.error("WebSocket连接失败:", error);
        setWsStatus("error");
      }
    );

    // 注册消息处理器
    const removeHandler = websocketService.addMessageHandler((message) => {
      console.log("收到WebSocket消息:", message);
      setLastNotification({
        time: new Date().toLocaleTimeString(),
        type: message.type,
        data: message.data,
      });

      // 使用 ref 中的最新函数
      if (handleWebSocketDataRef.current) {
        handleWebSocketDataRef.current(message);
      }
    });

    return () => {
      clearCountdown();
      removeHandler();
    };
  }, [fetchImageData, clearCountdown]);

  // 倒计时模式切换监听
  useEffect(() => {
    console.log("模式切换:", mode, "倒计时中:", isInCountdownRef.current);

    if (mode === MODES.HTTP && isInCountdownRef.current) {
      // HTTP模式且倒计时中：确保倒计时运行
      if (!countdownTimerRef.current) {
        console.log("切换到HTTP模式且倒计时中，启动倒计时");
        // 这里不应该直接调用startCountdown，因为它会重置倒计时
        // 而是应该检查是否已经有倒计时在运行
      }
    } else if (mode === MODES.WEBSOCKET) {
      // WebSocket模式：清除倒计时
      console.log("切换到WebSocket模式，清除倒计时");
      clearCountdown();
    }
  }, [mode, clearCountdown]);


  // 格式化数据项
  const formattedDataItems = useMemo(() => {
    const judgmentMap = {
      1: "放行",
      2: "查验",
      3: "审核通过待放行",
    };

    const imgJudgmentMap = {
      1: "放行",
      2: "查验",
    };

    return Object.entries(keyToChinese).map(([key, label]) => {
      let value = pageData.info[key];

      if (key === "createdTime" && value) {
        value = moment(value).format("YYYY-MM-DD HH:mm:ss");
      }

      if (key === "preJudgment") {
        value = judgmentMap[value] || value;
      }

      if (key === "imgJudgment") {
        value = imgJudgmentMap[value] || value;
      }

      return { key, label, value };
    });
  }, [pageData.info]);

  // 空处理函数
  const emptyHandler = () => {};

  return (
    <>
      <Card
        className="export-card-container"
        style={{
          backgroundColor: "#FFFFFF",
          height: "100%",
          width: "100%",
        }}
        size="small"
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>图片详情</span>
            {mode === MODES.HTTP && (
              <div
                style={{
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                倒计时: {countdown}s
              </div>
            )}
          </div>
        }
      >
        <div
          style={{
            height: "100",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 主内容区 - 左右布局 */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* 左侧数据列表 (20%) */}
            <div
              style={{
                width: "20%",
                overflow: "auto",
                borderRight: "1px solid #e8e8e8",
                padding: 16,
              }}
            >
              {formattedDataItems.map(({ key, label, value }) => (
                <ImageInfoDataItem key={key} label={label} value={value} />
              ))}
            </div>

            {/* 右侧区域 (80%) */}
            <div
              style={{
                width: "80%",
                height: "82vh",
                display: "flex",
                flexDirection: "column",
                userSelect: "none",
              }}
            >
              <ImageInfoViewer
                imageUrl={imageData.url}
                zoomLevel={imageData.zoomLevel}
                position={imageData.position}
                rotation={imageData.rotation}
                isLoading={imageData.isLoading}
                onMouseDown={emptyHandler}
                onMouseMove={emptyHandler}
                onMouseUp={emptyHandler}
                onWheel={emptyHandler}
                isDragging={imageData.isDragging}
              />

              <NavigationControls
                onZoomIn={emptyHandler}
                onZoomOut={emptyHandler}
                onPrev={emptyHandler}
                onNext={emptyHandler}
                onExport={emptyHandler}
                onRotateRight={emptyHandler}
                onCheck={() => handleJudgeRequest(JUDGE_VALUES.CHECK)}
                onRelease={() => handleJudgeRequest(JUDGE_VALUES.RELEASE)}
                currentIndex={pageData.index}
                totalCount={pageData.totalImages}
                billNo={pageData.info.billNo}
                pageNum={pageData.pageNum}
                pageSize={pageData.pageSize}
                todayStats={todayStats}
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(ImageDetailPage1);