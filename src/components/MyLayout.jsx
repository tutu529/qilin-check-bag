import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { Button, Layout, Dropdown, Space, Divider } from 'antd';
import logo from '../assets/logo.jpg';
const { Header, Content } = Layout;
import 'antd/dist/reset.css';
import { Footer } from 'antd/es/layout/layout';

//下拉菜单的menu数据
const items = [
  {
    key: 'help',
    label: '帮助',
  },
  {
    key: 'about',
    label: '关于',
  },
];

const MyLayout = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  
  // 监听全屏状态变化
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  //全屏部分
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleMenuClick = (e) => {
    // Handle the menu item click here
    console.log('Clicked menu item:', e.key);
    if (e.key === 'help') {
      navigate('/help');
    }
  };

  return (
    <Layout
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Layout>
        <Header
          style={{
            padding: 0,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <span
            className="titleDiv"
            style={{ fontSize: 17, fontWeight: 600, marginLeft: 20 }}
          >
            同屏比对系统
          </span>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Button
              type="text"
              icon={
                isFullscreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={toggleFullscreen}
              style={{
                fontSize: '16px',
                marginLeft: 16,
                width: 45,
                height: 45,
              }}
            />
            <Dropdown menu={{ items, onClick: handleMenuClick }}>
              <img
                src={logo}
                style={{
                  width: '30px',
                  borderRadius: '50%',
                  margin: '0 30px 0 0',
                  cursor: 'pointer',
                }}
              />
            </Dropdown>
          </div>
        </Header>
        <Content
          ref={contentRef}
          style={{
            margin: 0,
            padding: '12px 16px',
            minHeight: 280,
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            background: '#F5F5F5',
            color: 'rgba(0, 0, 0, 0.65)',
            padding: '10px 60px',
            height: 'auto',
          }}
        >
          <div style={{ paddingBottom: '6px' }}>
            {/* @xxxxxxxxxxx公司 */}
          </div>
          <Space
            size="large"
            split={
              <Divider
                type="vertical"
                style={{ borderColor: 'rgba(0, 0, 0, 0.65)' }}
              />
            }
          >
            {/* <div>联系电话：400-123-4567</div>
            <div>地址：贵州省贵阳市观山湖区</div> */}
          </Space>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MyLayout;