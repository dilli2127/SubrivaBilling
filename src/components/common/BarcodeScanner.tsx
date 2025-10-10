import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Input, message, Space, Typography, Card, Switch, Divider } from 'antd';
import { 
  BarcodeOutlined, 
  CameraOutlined, 
  ScanOutlined, 
  EditOutlined,
  CloseOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeResult } from 'html5-qrcode';
import './BarcodeScanner.css';

const { Title, Text } = Typography;

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  description?: string;
}

interface ScannerConfig {
  fps: number;
  qrbox?: { width: number; height: number };
  aspectRatio?: number;
  supportedFormats?: Html5QrcodeSupportedFormats[];
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = "Scan Barcode",
  description = "Use camera or enter barcode manually"
}) => {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Scanner configuration
  const config: ScannerConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    supportedFormats: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.CODABAR,
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.DATA_MATRIX,
      Html5QrcodeSupportedFormats.AZTEC,
      Html5QrcodeSupportedFormats.PDF_417,
      Html5QrcodeSupportedFormats.MAXICODE
    ]
  };

  // Start camera scanning
  const startScanning = useCallback(() => {
    if (!scannerRef.current || scanner) return;

    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "barcode-scanner",
        config,
        false
      );

      html5QrcodeScanner.render(
        (decodedText: string, decodedResult: Html5QrcodeResult) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage: string) => {
          // Handle scan errors silently (camera still active)
          console.log('Scan error:', errorMessage);
        }
      );

      setScanner(html5QrcodeScanner);
      setScanning(true);
      setCameraError(null);
      message.success('Camera started successfully');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Failed to access camera. Please check permissions.');
      message.error('Camera access failed');
    }
  }, [config, scanner]);

  // Stop camera scanning
  const stopScanning = useCallback(() => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
      setScanning(false);
      message.info('Camera stopped');
    }
  }, [scanner]);

  // Handle successful scan
  const handleScanSuccess = useCallback((barcode: string) => {
    if (barcode && barcode.trim()) {
      onScan(barcode.trim());
      stopScanning();
      onClose();
      message.success(`Barcode scanned: ${barcode}`);
    }
  }, [onScan, stopScanning, onClose]);

  // Handle manual input submission
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanSuccess(manualInput.trim());
      setManualInput('');
    } else {
      message.warning('Please enter a barcode');
    }
  };

  // Handle keyboard input (for USB barcode scanners)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  // Handle Enter key globally for USB scanner input
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // If modal is open and user is typing (not in input field), capture it
      if (visible && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        const char = e.key;
        // If it's a printable character, add to manual input
        if (char.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          setManualInput(prev => prev + char);
        }
        // If Enter is pressed, submit the input
        if (e.key === 'Enter') {
          setTimeout(() => {
            if (manualInput.trim()) {
              handleScanSuccess(manualInput.trim());
              setManualInput('');
            }
          }, 100);
        }
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleGlobalKeyPress);
      return () => document.removeEventListener('keydown', handleGlobalKeyPress);
    }
  }, [visible, manualInput, handleScanSuccess]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  // Start/stop camera when useCamera changes
  useEffect(() => {
    if (visible && useCamera && !scanner) {
      startScanning();
    } else if (!useCamera && scanner) {
      stopScanning();
    }
  }, [visible, useCamera, scanner, startScanning, stopScanning]);

  return (
    <Modal
      title={
        <div className="barcode-scanner-header">
          <BarcodeOutlined />
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      className="barcode-scanner-modal"
      footer={[
        <Button key="close" onClick={onClose}>
          <CloseOutlined />
          Close
        </Button>
      ]}
    >
      <div className="barcode-scanner-content">
        <Text className="barcode-scanner-description">
          {description}
        </Text>

        <Divider />

        {/* Camera Toggle */}
        <div className="camera-toggle">
          <Space align="center">
            <Switch
              checked={useCamera}
              onChange={setUseCamera}
              checkedChildren={<CameraOutlined />}
              unCheckedChildren={<EditOutlined />}
            />
            <Text>
              {useCamera ? 'Camera Mode' : 'Keyboard Mode'}
            </Text>
          </Space>
        </div>

        {/* Camera Scanner */}
        {useCamera && (
          <Card className="scanner-card">
            <div className="scanner-header">
              <Space>
                <ScanOutlined />
                <Text strong>Camera Scanner</Text>
              </Space>
              <Space>
                {scanning ? (
                  <Button 
                    type="primary" 
                    danger 
                    icon={<StopOutlined />}
                    onClick={stopScanning}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />}
                    onClick={startScanning}
                  >
                    Start
                  </Button>
                )}
              </Space>
            </div>

            <div className="scanner-container">
              <div 
                id="barcode-scanner" 
                ref={scannerRef}
                className="scanner-viewport"
              />
              
              {cameraError && (
                <div className="camera-error">
                  <Text type="danger">{cameraError}</Text>
                  <Button 
                    type="link" 
                    onClick={() => {
                      setCameraError(null);
                      startScanning();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Manual Input */}
        <Card className="manual-input-card">
          <div className="manual-input-header">
            <Space>
              <EditOutlined />
              <Text strong>Manual Input</Text>
            </Space>
            <Text type="secondary">
              Type or scan with USB barcode scanner
            </Text>
          </div>

          <div className="manual-input-container">
            <Input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter barcode manually or scan with USB scanner..."
              size="large"
              className="barcode-input"
              autoFocus
            />
            <Button 
              type="primary" 
              size="large"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="submit-button"
            >
              <BarcodeOutlined />
              Submit
            </Button>
          </div>

          {!useCamera && (
            <div className="usb-scanner-hint">
              <Text type="secondary">
                💡 Tip: USB barcode scanners work automatically in this mode. 
                Just scan any barcode and it will be captured here.
              </Text>
            </div>
          )}
        </Card>

        {/* Supported Formats */}
        <div className="supported-formats">
          <Text strong>Supported Formats:</Text>
          <div className="format-tags">
            <span>EAN-13</span>
            <span>EAN-8</span>
            <span>UPC-A</span>
            <span>UPC-E</span>
            <span>Code 128</span>
            <span>Code 39</span>
            <span>QR Code</span>
            <span>Data Matrix</span>
            <span>And more...</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScanner;
