import React, { useEffect, useState } from 'react';
import { notification, Progress, Button, Modal } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  version?: string;
}

const UpdateNotification: React.FC = () => {
  const [downloadProgress, setDownloadProgress] = useState<UpdateProgress | null>(null);

  useEffect(() => {
    if ((window as any).electronAPI) {
      // Listen for update status
      (window as any).electronAPI.onUpdateStatus((status: UpdateStatus) => {
        handleUpdateNotification(status);
      });

      // Listen for download progress
      (window as any).electronAPI.onUpdateProgress((progress: UpdateProgress) => {
        setDownloadProgress(progress);
      });
    }
  }, []);

  const handleUpdateNotification = (status: UpdateStatus) => {
    switch (status.status) {
      case 'checking':
        notification.info({
          message: 'Checking for Updates',
          description: status.message,
          icon: <SyncOutlined spin />,
          duration: 3,
        });
        break;

      case 'available':
        notification.success({
          message: 'Update Available',
          description: (
            <div>
              <p>{status.message}</p>
              <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                The update will be downloaded automatically in the background.
              </p>
            </div>
          ),
          icon: <DownloadOutlined />,
          duration: 0,
          btn: (
            <Button type="primary" size="small" onClick={() => notification.destroy()}>
              OK
            </Button>
          ),
        });
        break;

      case 'not-available':
        notification.success({
          message: 'Up to Date',
          description: status.message,
          icon: <CheckCircleOutlined />,
          duration: 4,
        });
        break;

      case 'downloaded':
        Modal.confirm({
          title: 'Update Downloaded',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          content: (
            <div>
              <p>A new version has been downloaded and is ready to install.</p>
              <p style={{ marginTop: 8, fontWeight: 500 }}>
                Would you like to restart the application now to apply the update?
              </p>
            </div>
          ),
          okText: 'Restart Now',
          cancelText: 'Later',
          onOk: async () => {
            if ((window as any).electronAPI) {
              await (window as any).electronAPI.installUpdate();
            }
          },
        });
        break;

      case 'error':
        notification.error({
          message: 'Update Error',
          description: status.message,
          icon: <ExclamationCircleOutlined />,
          duration: 6,
        });
        break;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Show download progress notification
  useEffect(() => {
    if (downloadProgress && downloadProgress.percent > 0) {
      notification.open({
        key: 'download-progress',
        message: 'Downloading Update',
        description: (
          <div>
            <Progress 
              percent={Math.round(downloadProgress.percent)} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)}
              {' - '}
              {formatBytes(downloadProgress.bytesPerSecond)}/s
            </div>
          </div>
        ),
        icon: <DownloadOutlined />,
        duration: 0,
      });
    }

    // Close notification when download is complete
    if (downloadProgress && downloadProgress.percent >= 100) {
      setTimeout(() => {
        notification.destroy('download-progress');
      }, 2000);
    }
  }, [downloadProgress]);

  // Don't render anything visible - this component just handles notifications
  // But we can optionally provide a manual check button for settings/about page
  return null;
};

export default UpdateNotification;

// Export a button component that can be used in settings/about page
export const CheckUpdateButton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const [checking, setChecking] = useState(false);

  const handleCheckUpdates = async () => {
    setChecking(true);
    
    if ((window as any).electronAPI) {
      notification.info({
        message: 'Checking for Updates',
        description: 'Please wait while we check for updates...',
        icon: <SyncOutlined spin />,
        duration: 2,
      });
      
      await (window as any).electronAPI.checkForUpdates();
    } else {
      notification.info({
        message: 'Not Available',
        description: 'Update checking is only available in the desktop app.',
        duration: 3,
      });
    }
    
    setTimeout(() => setChecking(false), 2000);
  };

  return (
    <Button
      type="primary"
      icon={<SyncOutlined spin={checking} />}
      onClick={handleCheckUpdates}
      loading={checking}
      style={style}
    >
      Check for Updates
    </Button>
  );
};

