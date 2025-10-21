import React from 'react';
import {
  Form,
  Button,
  Switch,
  Select,
  Row,
  Col,
} from 'antd';
import {
  PrinterOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { PrinterTabProps } from './types';

const { Option } = Select;

const PrinterTab: React.FC<PrinterTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
  onTestPrinter,
}) => {
  return (
    <Form form={form} layout="vertical" className={styles.settingsForm}>
      <div className={styles.sectionTitle}>
        <PrinterOutlined />
        Thermal Printer Configuration
      </div>

      <div className={styles.warningBox}>
        ⚠️ Make sure your thermal printer is connected before testing
      </div>

      <Form.Item
        label="Enable Thermal Printer"
        name="thermal_printer_enabled"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Printer Port"
            name="printer_port"
          >
            <Select>
              <Option value="COM1">COM1</Option>
              <Option value="COM2">COM2</Option>
              <Option value="COM3">COM3</Option>
              <Option value="USB">USB</Option>
              <Option value="Bluetooth">Bluetooth</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Baud Rate"
            name="printer_baud_rate"
          >
            <Select>
              <Option value={9600}>9600</Option>
              <Option value={19200}>19200</Option>
              <Option value={38400}>38400</Option>
              <Option value={115200}>115200</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Paper Width (mm)"
            name="paper_width"
          >
            <Select>
              <Option value={58}>58mm (2 inch)</Option>
              <Option value={80}>80mm (3 inch)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Auto Print After Bill"
        name="auto_print"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Button
        type="dashed"
        icon={<PrinterOutlined />}
        onClick={onTestPrinter}
        className={styles.printerTestButton}
      >
        Test Printer
      </Button>

      <div className={styles.formActions}>
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Printer Settings
        </Button>
      </div>
    </Form>
  );
};

export default PrinterTab;
