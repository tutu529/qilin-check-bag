import React, { useState, useRef, useEffect } from 'react';
import { Spin, Typography } from 'antd';
const { Text } = Typography;

// 图片查看器组件
const ImageInfoViewer = React.memo(
  ({ 
    imageUrl,
    zoomLevel,
    position,
    rotation = 0,
    isLoading,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    isDragging,
  }) => {
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    // const [countdown, setCountdown] = useState(6); // 六秒倒计时
    // const [isCounting, setIsCounting] = useState(false);
    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const countdownTimerRef = useRef(null);

    useEffect(() => {
      if (!imageUrl) {
        return;
      }

      const img = new Image();
      imgRef.current = img;
      setIsImgLoaded(false);
      // setIsCounting(false);
      // setCountdown(6);
      
      // if (countdownTimerRef.current) {
      //   clearInterval(countdownTimerRef.current);
      // }

      img.onload = () => {
        if (img === imgRef.current) {
          setIsImgLoaded(true);
        }
      };

      img.onerror = () => {
        if (img === imgRef.current) {
          setIsImgLoaded(false);
        }
      };

      img.src = imageUrl;

      return () => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
        // if (countdownTimerRef.current) {
        //   clearInterval(countdownTimerRef.current);
        // }
      };
    }, [imageUrl]);

    // 清理倒计时定时器
    useEffect(() => {
      return () => {
        // if (countdownTimerRef.current) {
        //   clearInterval(countdownTimerRef.current);
        // }
      };
    }, []);

    // // 开始倒计时函数
    // const startCountdown = () => {
    //   setIsCounting(true);
    //   setCountdown(6);
      
    //   if (countdownTimerRef.current) {
    //     clearInterval(countdownTimerRef.current);
    //   }
      
    //   countdownTimerRef.current = setInterval(() => {
    //     setCountdown((prevCount) => {
    //       if (prevCount <= 1) {
    //         clearInterval(countdownTimerRef.current);
    //         setIsCounting(false);
    //         return 0;
    //       }
    //       return prevCount - 1;
    //     });
    //   }, 1000);
    // };

    const handleMouseMove = (e) => {
      e.preventDefault();
      if (onMouseMove) {
        onMouseMove(e);
      }
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      if (onMouseDown) {
        onMouseDown(e);
      }
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      if (onMouseUp) {
        onMouseUp(e);
      }
    };

    const handleWheel = (e) => {
      // 移除e.preventDefault()调用，避免在passive事件监听器中调用preventDefault
      if (onWheel) {
        onWheel(e);
      }
    };

    return (
      <div
        ref={containerRef}
        style={{
          height: '80%',
          flex: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
          borderBottom: '1px solid #e8e8e8',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {!imageUrl ? (
          <Text type="secondary" style={{ fontSize: '18px', fontWeight: 'bold' }}>无图片</Text>
        ) : isLoading || !isImgLoaded ? (
          <Spin size="large" />
        ) : (
          <>
            <img
              src={imageUrl}
              alt="图片详情"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                maxWidth: '80%',
                maxHeight: '80%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </>
        )}
      </div>
    );
  }
);

export default ImageInfoViewer;