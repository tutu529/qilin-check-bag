import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Button, Typography, Card, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import NavigationControls from "../components/NavigationControls";
import ImageInfoDataItem from "../components/ImageInfoDataItem";
import ImageInfoViewer from "../components/ImageInfoViewer";

// 数据字段映射
const keyToChinese = {
  flowNo: "流水号",
  voyage: "总运单号",
  billNo: "分运单号",
  pos: "扫描位置",
  order: "审图指令",
  sorder: "海关布控",
  createDate: "过机时间",
  otherInfo01: "申报重量",
  otherInfo07: "申报价值",
  otherInfo06: "申报数量",
  otherInfo08: "申报企业",
  otherInfo05: "主要物品",
};

// 导航控制组件

const ImageDetailPage1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // 合并状态管理
  const [state, setState] = useState({
    // 图片相关状态
    image: {
      url: "",
      zoomLevel: 1,
      position: { x: 0, y: 0 },
      rotation: 0, // 添加旋转角度状态
      isDragging: false,
      startPos: { x: 0, y: 0 },
      isLoading: false,
    },
    // 数据相关状态
    data: {
      info: {},
      list: [],
      pageNum: 1,
      pageSize: 10,
      index: 0,
      totalImages: 0,
    },
    // 搜索参数
    searchParams: {},
  });

  // 解析URL参数
  const parseSearchParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const parsedParams = {};

    for (let [key, value] of params.entries()) {
      parsedParams[key] = value;
    }
    return parsedParams;
  }, [location.search]);

  // 组件初始化时加载数据
  useEffect(() => {
    const params = parseSearchParams();
    // 更新搜索参数状态
    setState(prev => ({ ...prev, searchParams: params }));
    // 加载图片数据
    // loadImageData();
  }, [location.search, parseSearchParams]);

  // 缩放处理
  const handleZoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        zoomLevel: Math.min(prev.image.zoomLevel + 0.1, 3),
      },
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        zoomLevel: Math.max(prev.image.zoomLevel - 0.1, 0.5),
      },
    }));
  }, []);

  // 顺时针旋转处理
  const handleRotateRight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        rotation: prev.image.rotation + 90,
      },
    }));
  }, []);

  // 拖动处理
  const handleMouseDown = useCallback((e) => {
    setState((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        isDragging: true,
        startPos: {
          x: e.clientX - prev.image.position.x,
          y: e.clientY - prev.image.position.y,
        },
      },
    }));
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!state.image.isDragging) return;

      const newX = e.clientX - state.image.startPos.x;
      const newY = e.clientY - state.image.startPos.y;

      // 使用事件目标的容器作为参考
      const container = e.currentTarget;
      if (container) {
        const containerRect = container.getBoundingClientRect();

        // 使用容器实际尺寸计算
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // 估算图片实际尺寸（基于容器的百分比）
        const imgWidth = containerWidth * 0.8 * state.image.zoomLevel;
        const imgHeight = containerHeight * 0.8 * state.image.zoomLevel;

        const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
        const maxY = Math.max(0, (imgHeight - containerHeight) / 2);

        setState((prev) => ({
          ...prev,
          image: {
            ...prev.image,
            position: {
              x: Math.max(-maxX, Math.min(newX, maxX)),
              y: Math.max(-maxY, Math.min(newY, maxY)),
            },
          },
        }));
      }
    },
    [state.image.isDragging, state.image.startPos, state.image.zoomLevel]
  );

  const handleMouseUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        isDragging: false,
      },
    }));
  }, []);

  const handleWheel = useCallback(
    (e) => {
      // e.preventDefault();
      console.log('handleWheel called', { deltaY: e.deltaY, currentZoom: state.image.zoomLevel });

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoomLevel = Math.max(
        0.1,
        Math.min(5, state.image.zoomLevel + delta)
      );

      setState((prev) => ({
        ...prev,
        image: {
          ...prev.image,
          zoomLevel: newZoomLevel,
        },
      }));
    },
    [state.image.zoomLevel]
  );

  // 上一张图片
  const handlePrev = useCallback(() => {
    console.log('handlePrev called', { currentIndex: state.data.index });
    // 实现上一张图片逻辑
  }, [state.data.index]);

  // 下一张图片
  const handleNext = useCallback(() => {
    console.log('handleNext called', { currentIndex: state.data.index });
    // 实现下一张图片逻辑
  }, [state.data.index]);

  // 导出图片
  const handleExportImage = useCallback(() => {
    console.log('handleExportImage called', { imageUrl: state.image.url });
    messageApi.success('图片导出成功');
  }, [state.image.url, messageApi]);

  // 加载图片数据
  const loadImageData = useCallback(async () => {
    console.log('loadImageData called', { searchParams: state.searchParams });
    try {
      setState(prev => ({ ...prev, image: { ...prev.image, isLoading: true } }));
      // 模拟API请求
      // 实际项目中应替换为真实的API调用
      const mockData = {
        info: {
          flowNo: 'MOCK123456',
          voyage: 'VYG7890',
          billNo: 'BL456789',
          pos: 'A1',
          order: '正常',
          sorder: '无',
          createDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          otherInfo01: '100kg',
          otherInfo07: '5000USD',
          otherInfo06: '50箱',
          otherInfo08: '示例企业',
          otherInfo05: '电子产品'
        },
        list: [],
        pageNum: 1,
        pageSize: 10,
        index: 0,
        totalImages: 1
      };
      
      setState(prev => ({
        ...prev,
        data: mockData,
        image: {
          ...prev.image,
          isLoading: false,
          url: 'https://via.placeholder.com/800x600?text=Image+Detail'
        }
      }));
      
      messageApi.success('图片数据加载成功');
    } catch (error) {
      console.error('Failed to load image data:', error);
      messageApi.error('图片数据加载失败');
      setState(prev => ({ ...prev, image: { ...prev.image, isLoading: false } }));
    }
  }, [state.searchParams, messageApi]);
  
  // 查验按钮处理函数
  const handleCheck = useCallback(() => {
    console.log('handleCheck called', { billNo: state.data.info.billNo });
    messageApi.warning('已标记为查验');
  }, [state.data.info.billNo, messageApi]);
  
  // 放行按钮处理函数
  const handleRelease = useCallback(() => {
    console.log('handleRelease called', { billNo: state.data.info.billNo });
    messageApi.success('已标记为放行');
  }, [state.data.info.billNo, messageApi]);

  // 格式化数据项
  const formattedDataItems = useMemo(() => {
    const items = [];
    const { info } = state.data;
    
    console.log('formattedDataItems called', { info });
    
    for (const [key, label] of Object.entries(keyToChinese)) {
      if (info[key]) {
        items.push({
          key,
          label,
          value: info[key]
        });
      }
    }
    return items;
  }, [state.data.info]);

  return (
    <>
      {contextHolder}
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
                imageUrl={state.image.url}
                zoomLevel={state.image.zoomLevel}
                position={state.image.position}
                rotation={state.image.rotation}
                isLoading={state.image.isLoading}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                isDragging={state.image.isDragging}
              />

              <NavigationControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onPrev={handlePrev}
                onNext={handleNext}
                onExport={handleExportImage}
                onRotateRight={handleRotateRight}
                onCheck={handleCheck}
                onRelease={handleRelease}
                currentIndex={state.data.index}
                totalCount={state.data.totalImages}
                billNo={state.data.info.billNo}
                pageNum={state.searchParams.pageNum}
                pageSize={state.searchParams.pageSize}
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(ImageDetailPage1);
