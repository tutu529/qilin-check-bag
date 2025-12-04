import React from 'react';
import { Button } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  RedoOutlined,
  QuestionCircleOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';

const NavigationControls = React.memo(
  ({ 
    onZoomIn,
    onZoomOut,
    onPrev,
    onNext,
    onExport,
    onRotateRight,
    onCheck,
    onRelease,
    currentIndex,
    totalCount,
    billNo = '',
    pageNum = 1,
    pageSize = 10,
    todayStats = { failCount: 0, passCount: 0 }
  }) => (
    <>
      {totalCount > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #e8e8e8',
              fontSize: '14px',
              color: '#666',
            }}
          >
            图片 {(pageNum - 1) * pageSize + currentIndex + 1} / {totalCount} -
            {billNo || '未知运单'}
          </div>
        )}
      <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            padding: 16,
          }}
      >
        {/* <Button icon={<ZoomOutOutlined />} onClick={onZoomOut}>
          缩小
        </Button>
        <Button icon={<ZoomInOutlined />} onClick={onZoomIn}>
          放大
        </Button>
        <Button icon={<RedoOutlined />} onClick={onRotateRight}>
          顺时针旋转
        </Button> */}
        <Button type="default" danger icon={<QuestionCircleOutlined />} onClick={onCheck}>
          查验
        </Button>
         <Button 
          type="text"
          icon={<CheckSquareOutlined />} 
          onClick={onRelease}
          style={{
            color: '#52c41a',       // 文字绿色
            border: '1px solid #52c41a', // 边框绿色
            backgroundColor: 'transparent' // 背景透明
          }}
        >
          放行
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          padding: '16px',
          backgroundColor: '#fff',
          // borderTop: '1px solid #e8e8e8',
          // boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: 500
          }}>今日查验个数：</span>
          <span style={{
            fontSize: '16px',
            color: '#ff4d4f',
            fontWeight: 'bold',
            minWidth: '40px',
            textAlign: 'center',
            padding: '4px 8px',
            backgroundColor: '#fff1f0',
            borderRadius: '4px',
            border: '1px solid #ffccc7'
          }}>{todayStats.failCount}</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: 500
          }}>今日放行个数：</span>
          <span style={{
            fontSize: '16px',
            color: '#52c41a',
            fontWeight: 'bold',
            minWidth: '40px',
            textAlign: 'center',
            padding: '4px 8px',
            backgroundColor: '#f6ffed',
            borderRadius: '4px',
            border: '1px solid #b7eb8f'
          }}>{todayStats.passCount}</span>
        </div>
      </div>
    </>
  )
);

export default NavigationControls;