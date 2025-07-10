import React from 'react';
import { Drawer, Button, message, Radio, Divider, Typography } from 'antd';
import { BgColorsOutlined, DeleteOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ThemePreset {
  key: string;
  label: string;
  variables: Record<string, string>;
  previewColor: string;
}

interface ThemeDrawerProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (key: string) => void;
  themePresets: ThemePreset[];
  sidebarBg: string;
  setSidebarBg: (bg: string) => void;
  sidebarPosition: string;
  setSidebarPosition: (pos: string) => void;
}

const themeGroups = [
  {
    title: 'Classic',
    keys: ['classic', 'violet', 'dark', 'sunset'],
  },
  {
    title: 'Modern',
    keys: ['aqua', 'peach', 'sky', 'rose'],
  },
];

// Predefined sidebar background images
const sidebarBgOptions = [
  { key: 'bg1', url:"https://ant-cra.cremawork.com/assets/images/sidebar/thumb/5.png" },
  // { key: 'bg2', url: require('../../../assets/sidebar-bg2.jpg') },
  // { key: 'bg3', url: require('../../../assets/sidebar-bg3.jpg') },
];

const ThemePreview = ({ preset, selected, onClick }: any) => (
  <div
    onClick={onClick}
    style={{
      border: selected ? '2px solid #4e54c8' : '1px solid #ccc',
      borderRadius: 12,
      padding: 10,
      margin: 6,
      width: 110,
      cursor: 'pointer',
      background: '#fff',
      boxShadow: selected ? '0 0 8px #4e54c8' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s, border 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}
  >
    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
      {preset.label}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ color: '#888', fontWeight: 500 }}>Menu–1</div>
      <div style={{ color: '#888', fontWeight: 500 }}>Menu–2</div>
      <div
        style={{
          background: preset.previewColor,
          color: '#fff',
          borderRadius: 8,
          padding: '2px 8px',
          fontWeight: 600,
          width: 'fit-content',
        }}
      >
        Selected Menu
      </div>
      <div style={{ color: '#888', fontWeight: 500 }}>Menu–4</div>
    </div>
  </div>
);

const ThemeDrawer: React.FC<ThemeDrawerProps> = ({
  open,
  onClose,
  theme,
  setTheme,
  themePresets,
  sidebarBg,
  setSidebarBg,
  sidebarPosition,
  setSidebarPosition,
}) => {
  const handleRemoveBg = () => {
    setSidebarBg('');
    localStorage.removeItem('sidebarBg');
    message.success('Sidebar background removed!');
  };

  return (
    <Drawer
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>Sidebar Settings</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Customize your theme with these options.
          </Text>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={440}
      bodyStyle={{ padding: 0, background: 'transparent' }}
    >
      <div style={{ padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', margin: 16 }}>
        <Title level={5} style={{ marginBottom: 12 }}>Sidebar Position</Title>
        <Radio.Group
          value={sidebarPosition}
          onChange={e => {
            setSidebarPosition(e.target.value);
            localStorage.setItem('sidebarPosition', e.target.value);
          }}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="left">Left</Radio.Button>
          <Radio.Button value="right">Right</Radio.Button>
          <Radio.Button value="top">Top</Radio.Button>
        </Radio.Group>
      </div>
      <Divider style={{ margin: '24px 0' }} />
      <div style={{ padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', margin: 16 }}>
        <Title level={5} style={{ marginBottom: 12 }}>Sidebar Backgrounds</Title>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {sidebarBgOptions.map(opt => (
            <div
              key={opt.key}
              style={{
                position: 'relative',
                borderRadius: 10,
                boxShadow: sidebarBg === opt.url ? '0 0 0 2px #4e54c8' : '0 1px 4px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => {
                setSidebarBg(opt.url);
                localStorage.setItem('sidebarBg', opt.url);
                message.success('Sidebar background updated!');
              }}
            >
              <img
                src={opt.url}
                alt="sidebar-bg"
                style={{
                  width: 56,
                  height: 56,
                  objectFit: 'cover',
                  borderRadius: 10,
                  filter: sidebarBg === opt.url ? 'brightness(0.95)' : 'none',
                }}
              />
              {sidebarBg === opt.url && (
                <CheckCircleFilled style={{
                  color: '#4e54c8',
                  fontSize: 22,
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                }} />
              )}
            </div>
          ))}
          {sidebarBg && (
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleRemoveBg}
              style={{ marginLeft: 8, height: 48 }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <Divider style={{ margin: '24px 0' }} />
      <div style={{ padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', margin: 16 }}>
        <Title level={5} style={{ marginBottom: 12 }}>Sidebar Colors</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {themeGroups.map(group => (
            <div key={group.title} style={{ marginBottom: 0 }}>
              <Text strong style={{ fontSize: 15, margin: '12px 0 8px 0', display: 'block' }}>
                {group.title}
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {themePresets
                  .filter(preset => group.keys.includes(preset.key))
                  .map(preset => (
                    <div
                      key={preset.key}
                      style={{
                        position: 'relative',
                        borderRadius: 12,
                        boxShadow: theme === preset.key ? '0 0 0 2px #4e54c8' : '0 1px 4px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        background: '#fff',
                        margin: 2,
                      }}
                      onClick={() => {
                        setTheme(preset.key);
                        onClose();
                      }}
                    >
                      <ThemePreview
                        preset={preset}
                        selected={theme === preset.key}
                        onClick={() => {
                          setTheme(preset.key);
                          onClose();
                        }}
                      />
                      {theme === preset.key && (
                        <CheckCircleFilled style={{
                          color: '#4e54c8',
                          fontSize: 22,
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: '#fff',
                          borderRadius: '50%',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                        }} />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default ThemeDrawer;
