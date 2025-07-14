import React, { useState } from 'react';
import { Drawer, Button, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import BillTemplateSelector from './BillTemplateSelector';
import { BillingTemplateKey } from './templates/registry';

const FloatingTemplateSelector: React.FC<{
  selected: BillingTemplateKey;
  onSelect: (key: BillingTemplateKey) => void;
}> = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Change Invoice Template">
        <Button
          type="primary"
          shape="circle"
          icon={<SettingOutlined />}
          size="large"
          style={{
            position: 'fixed',
            bottom: 5,
            right: 5,
            zIndex: 1100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      <Drawer
        title="Choose Invoice Template"
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={420}
      >
        <BillTemplateSelector selected={selected} onSelect={onSelect} />
      </Drawer>
    </>
  );
};

export default FloatingTemplateSelector; 