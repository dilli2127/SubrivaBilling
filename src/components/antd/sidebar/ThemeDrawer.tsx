import React from 'react';
import { Drawer, Button } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';

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
}) => (
  <Drawer
    title={
      <div>
        <div style={{ fontWeight: 600, fontSize: 18 }}>Sidebar Colors</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
          Customize your theme with these options.
        </div>
      </div>
    }
    placement="right"
    onClose={onClose}
    open={open}
    width={420}
    bodyStyle={{ padding: 24 }}
  >
    <div style={{ overflowY: 'auto' }}>
      {themeGroups.map(group => (
        <div key={group.title} style={{ marginBottom: 24 }}>
          <div
            style={{ fontWeight: 700, fontSize: 15, margin: '12px 0 8px 0' }}
          >
            {group.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 ,justifyContent:"center"}}>
            {themePresets
              .filter(preset => group.keys.includes(preset.key))
              .map(preset => (
                <ThemePreview
                  key={preset.key}
                  preset={preset}
                  selected={theme === preset.key}
                  onClick={() => {
                    setTheme(preset.key);
                    onClose();
                  }}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  </Drawer>
);

export default ThemeDrawer;
