import React, { useState, useEffect } from 'react';
import { Badge, Button, Tooltip, Progress, notification } from 'antd';
import { 
  DownloadOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

interface UpdateStatusProps {
  className?: string;
}

interface UpdateInfo {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  version?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  bytesPerSecond?: number;
}

const UpdateStatus: React.FC<UpdateStatusProps> = ({ className = '' }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check if we're in Electron environment
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const { electronAPI } = window as any;

      // Listen for update status events
      electronAPI.onUpdateStatus((event: any, data: UpdateInfo) => {
        setUpdateInfo(data);
        
        // Show notifications for important updates
        if (data.status === 'available') {
          notification.info({
            message: 'Update Available',
            description: `Version ${data.version} is ready to download.`,
            duration: 5,
            placement: 'topRight',
          });
        } else if (data.status === 'downloaded') {
          notification.success({
            message: 'Update Ready',
            description: 'Update downloaded and ready to install. Restart the app to apply.',
            duration: 0, // Don't auto-close
            placement: 'topRight',
          });
        } else if (data.status === 'error') {
          notification.error({
            message: 'Update Error',
            description: data.message,
            duration: 5,
            placement: 'topRight',
          });
        }
      });

      // Listen for download progress
      electronAPI.onUpdateProgress((event: any, data: any) => {
        setUpdateInfo(prev => ({
          ...prev,
          status: 'downloading',
          percent: data.percent,
          transferred: data.transferred,
          total: data.total,
          bytesPerSecond: data.bytesPerSecond,
          message: `Downloading update... ${Math.round(data.percent)}%`
        }));
      });

      // Cleanup listeners on unmount
      return () => {
        electronAPI.removeAllListeners('update-status');
        electronAPI.removeAllListeners('update-progress');
      };
    }
  }, []);

  const handleCheckForUpdates = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      setIsChecking(true);
      try {
        const result = await (window as any).electronAPI.checkForUpdates();
        if (!result.success) {
          notification.warning({
            message: 'Update Check',
            description: result.message || 'Unable to check for updates',
            duration: 3,
            placement: 'topRight',
          });
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      } finally {
        setIsChecking(false);
      }
    }
  };

  const handleDownloadUpdate = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        await (window as any).electronAPI.downloadUpdate();
      } catch (error) {
        console.error('Error downloading update:', error);
      }
    }
  };

  const handleInstallUpdate = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.installUpdate();
    }
  };

  const getStatusIcon = () => {
    if (!updateInfo) return <InfoCircleOutlined />;
    
    switch (updateInfo.status) {
      case 'checking':
        return <SyncOutlined spin />;
      case 'available':
        return <DownloadOutlined />;
      case 'downloading':
        return <SyncOutlined spin />;
      case 'downloaded':
        return <CheckCircleOutlined />;
      case 'error':
        return <ExclamationCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getStatusColor = () => {
    if (!updateInfo) return 'default';
    
    switch (updateInfo.status) {
      case 'checking':
      case 'downloading':
        return 'processing';
      case 'available':
        return 'warning';
      case 'downloaded':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    if (!updateInfo) return 'Check Updates';
    return updateInfo.message;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Don't render in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div className={`update-status ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {updateInfo?.status === 'downloading' && updateInfo.percent !== undefined && (
        <div style={{ minWidth: '120px' }}>
          <Progress 
            percent={Math.round(updateInfo.percent)} 
            size="small" 
            status="active"
            format={() => `${Math.round(updateInfo.percent || 0)}%`}
          />
          {updateInfo.bytesPerSecond && (
            <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
              {formatBytes(updateInfo.bytesPerSecond)}/s
            </div>
          )}
        </div>
      )}
      
      <Tooltip title={getStatusText()}>
        <Badge 
          status={getStatusColor() as any} 
          text={
            <Button
              type="text"
              size="small"
              icon={getStatusIcon()}
              loading={isChecking || updateInfo?.status === 'checking' || updateInfo?.status === 'downloading'}
              onClick={handleCheckForUpdates}
              style={{ 
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                height: 'auto'
              }}
            >
              {updateInfo?.status === 'downloading' ? 'Downloading...' : 
               updateInfo?.status === 'available' ? 'Update Available' :
               updateInfo?.status === 'downloaded' ? 'Install Update' :
               'Updates'}
            </Button>
          }
        />
      </Tooltip>

      {updateInfo?.status === 'available' && (
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleDownloadUpdate}
          style={{ marginLeft: '4px' }}
        >
          Download
        </Button>
      )}

      {updateInfo?.status === 'downloaded' && (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={handleInstallUpdate}
          style={{ marginLeft: '4px' }}
        >
          Install Now
        </Button>
      )}
    </div>
  );
};

export default UpdateStatus;
