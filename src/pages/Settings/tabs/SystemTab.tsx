import React, { useEffect, useState } from 'react';
import {
  Form,
  Button,
  Switch,
  Input,
  Space,
  Divider,
  Radio,
  Alert,
  message,
} from 'antd';
import {
  CloudOutlined,
  LaptopOutlined,
  SaveOutlined,
  ReloadOutlined,
  ApiOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';
import {
  getApiModeConfig,
  setApiModeConfig,
  ApiMode,
  isOfflineModeSupported,
} from '../../../helpers/apiModeHelper';
import { isElectron } from '../../../helpers/environment';

const SystemTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  const [apiMode, setApiMode] = useState<ApiMode>('online');
  const [needsReload, setNeedsReload] = useState(false);
  const isElectronApp = isElectron();
  const offlineModeSupported = isOfflineModeSupported();

  // Load current configuration on mount
  useEffect(() => {
    const config = getApiModeConfig();
    
    // For web, force online mode
    if (!isElectronApp) {
      form.setFieldsValue({
        api_mode: 'online',
        online_url: config.onlineUrl,
        offline_url: config.offlineUrl,
      });
      setApiMode('online');
      // Force save online mode for web
      if (config.mode !== 'online') {
        setApiModeConfig({ mode: 'online' });
      }
    } else {
      // For Electron, use saved configuration
      form.setFieldsValue({
        api_mode: config.mode,
        online_url: config.onlineUrl,
        offline_url: config.offlineUrl,
      });
      setApiMode(config.mode);
    }
  }, [form, isElectronApp]);

  const handleModeChange = (e: any) => {
    const newMode = e.target.value as ApiMode;
    setApiMode(newMode);
    setNeedsReload(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Prevent offline mode in web apps
      if (!isElectronApp && values.api_mode === 'offline') {
        message.error('Offline mode is only available in the Electron desktop app.');
        return;
      }
      
      // Get current config
      const defaultConfig = getApiModeConfig();
      
      // Save configuration
      setApiModeConfig({
        mode: values.api_mode,
        onlineUrl: defaultConfig.onlineUrl, // Always use default
        // Only update offline URL if in offline mode, otherwise preserve existing
        offlineUrl: values.api_mode === 'offline' 
          ? values.offline_url 
          : defaultConfig.offlineUrl,
      });

      message.success({
        content: 'System settings saved successfully!',
        duration: 3,
      });

      // Show reload prompt if mode changed
      if (needsReload) {
        message.warning({
          content: 'Please reload the application for changes to take effect.',
          duration: 5,
        });
      }

      setNeedsReload(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please fill in all required fields correctly.');
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleReset = () => {
    const config = getApiModeConfig();
    form.setFieldsValue({
      api_mode: config.mode,
      online_url: config.onlineUrl,
      offline_url: config.offlineUrl,
    });
    setApiMode(config.mode);
    setNeedsReload(false);
  };

  // If web version, show simplified read-only view
  if (!isElectronApp) {
    return (
      <div className={styles.settingsForm}>
        <div className={styles.sectionTitle}>
          <ApiOutlined />
          API Configuration
        </div>

        <div className={styles.infoBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudOutlined style={{ color: '#1890ff', fontSize: 16 }} />
            <span><strong>Mode:</strong> Online (Default)</span>
          </div>
        </div>

        <Alert
          message="Need Offline Installation?"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                If you need an offline installation or want to use a local server, please contact Subriva Billing customer care.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Download Desktop App:</strong> The desktop application supports offline mode and local server configuration.
              </p>
            </div>
          }
          type="warning"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div className={styles.warningBox}>
          <strong>📞 Contact Information:</strong>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>For offline installation support, contact <strong>Subriva Billing Customer Care</strong></li>
            <li>Desktop application download and setup assistance available</li>
            <li>Custom API configuration available in desktop version only</li>
          </ul>
        </div>
      </div>
    );
  }

  // Desktop app - full configuration available
  return (
    <Form form={form} layout="vertical" className={styles.settingsForm}>
      <div className={styles.sectionTitle}>
        <ApiOutlined />
        API Configuration
      </div>

      <div className={styles.infoBox}>
        Configure the API endpoint mode. Switch between online (remote server) and offline (local development) modes.
      </div>

      {needsReload && (
        <Alert
          message="Reload Required"
          description="You have changed the API mode. Please save and reload the application for changes to take effect."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          onClose={() => setNeedsReload(false)}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={handleReload}>
              Reload Now
            </Button>
          }
        />
      )}

      <Form.Item
        label="API Mode"
        name="api_mode"
        required
        extra="Select whether to use online (remote) or offline (local) API"
        rules={[
          { required: true, message: 'Please select an API mode' },
        ]}
      >
        <Radio.Group onChange={handleModeChange} buttonStyle="solid">
          <Radio.Button value="online">
            <CloudOutlined /> Online
          </Radio.Button>
          <Radio.Button value="offline">
            <LaptopOutlined /> Offline
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      {apiMode === 'online' ? (
        <>
          <Divider />
          
          <Alert
            message="You are in Online Mode"
            description="Connected to default hosted server. All data will sync to online."
            type="info"
            icon={<CloudOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Alert
            message="Please Verify Data"
            description="All data will sync to online server. Please verify your data before proceeding."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />
        </>
      ) : (
        <>
          <Divider>Offline Configuration</Divider>

          <Form.Item
            label="Offline API URL"
            name="offline_url"
            extra="Local development API endpoint (editable for offline mode)"
            rules={[
              { 
                required: apiMode === 'offline', 
                message: 'Please enter offline API URL' 
              },
            ]}
          >
            <Input
              prefix={<LaptopOutlined />}
              placeholder="http://localhost:8247"
            />
          </Form.Item>
        </>
      )}

      <Divider />

      {apiMode === 'offline' && (
        <div className={styles.warningBox}>
          <strong>⚠️ Important:</strong>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>Make sure your local server is running before switching to offline mode</li>
            <li>The application needs to reload after changing the API mode</li>
          </ul>
        </div>
      )}

      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div className={styles.currentModeInfo}>
          <strong>Current Mode:</strong>{' '}
          {apiMode === 'online' ? (
            <>
              <CloudOutlined style={{ color: '#1890ff' }} /> Online
            </>
          ) : (
            <>
              <LaptopOutlined style={{ color: '#52c41a' }} /> Offline
            </>
          )}
        </div>

        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            Save Settings
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
          {needsReload && (
            <Button type="dashed" icon={<ReloadOutlined />} onClick={handleReload}>
              Reload Application
            </Button>
          )}
        </Space>
      </Space>
    </Form>
  );
};

export default SystemTab;

