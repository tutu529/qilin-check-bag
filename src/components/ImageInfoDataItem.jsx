import React from 'react';
import { Row, Col, Divider, Typography } from 'antd';
const { Text } = Typography;

// 优化的数据项组件
const ImageInfoDataItem = React.memo(({ label, value }) => (
  <div style={{ marginBottom: 8 }}>
    <Row gutter={8}>
      <Col span={10} style={{ textAlign: 'right' }}>
        <strong>{label}:</strong>
      </Col>
      <Col span={14} style={{ textAlign: 'left', wordBreak: 'break-word' }}>
        <Text>{value || '-'}</Text>
      </Col>
    </Row>
    <Divider style={{ margin: '8px 0' }} />
  </div>
));

export default ImageInfoDataItem;