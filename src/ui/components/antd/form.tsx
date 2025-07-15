import { Form, Button, Typography, Row, Col } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const AntdForm = (props:any) => {
  const {
    FormValue,
    onSubmit,
    onCancel,
    formItems,
    onChildCancel,
    formColumns,
    splitLabelAndField,
    nested,
    nestedInputs,
    wrapperCol,
    labelCol,
    initialValues,
    loading,
    form,
    onValuesChange,
  } = props;
  const columns = formColumns || 1;
  
  const handleCancel = () => {
    // Support both old and new cancel handlers
    if (onCancel) {
      onCancel();
    } else if (onChildCancel) {
      onChildCancel(false);
    }
    form?.resetFields();
  };
  
  const onFinish = (values:any) => {
    // Support both old FormValue and new onSubmit
    if (onSubmit) {
      onSubmit(values);
    } else if (FormValue) {
      FormValue(values);
    }
    form?.resetFields();
  };
  
  useEffect(() => {
    if (initialValues) {
      form?.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);
  
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "600px 600px",
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        onValuesChange={onValuesChange}
      >
        <Row gutter={[16, 16]}>
          {formItems?.map((item:any, index:number) => (
            <Col span={24 / columns} key={index}>
              {splitLabelAndField ? (
                <div>
                  <Typography.Text strong>
                    {item.label}{" "}
                    {item.rules?.some((rule:any) => rule.required) && (
                      <Typography.Text type="danger">*</Typography.Text>
                    )}
                  </Typography.Text>
                  <Form.Item
                    name={item.name}
                    rules={item.rules}
                    style={{ marginTop: "8px" }}
                  >
                    {item.component}
                  </Form.Item>
                </div>
              ) : (
                <Form.Item
                  label={<Typography.Text strong>{item.label}</Typography.Text>}
                  name={item.name}
                  rules={item.rules}
                  labelCol={{ span: labelCol }}
                  wrapperCol={{ span: wrapperCol }}
                >
                  {item.component}
                </Form.Item>
              )}
            </Col>
          ))}

          {nested && (
            <Form.List name="nestedItems">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Row gutter={[16, 16]} align="middle" key={key}>
                      {nestedInputs.map((input:any, idx:number) => (
                        <Col key={idx}>
                          <Form.Item
                            {...restField}
                            name={[name, input.name]}
                            fieldKey={[fieldKey, input.name]}
                            rules={[
                              {
                                required: true,
                                message: `Missing ${input.label}`,
                              },
                            ]}
                            label={input.label}
                          >
                            {input.component}
                          </Form.Item>
                        </Col>
                      ))}
                      <Col>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Row justify="center">
                    <Col>
                      <Button
                        type="primary"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      >
                        Add More Field
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </Form.List>
          )}
        </Row>

        <Row justify="end" gutter={[16, 16]} style={{padding: "16px"}}>
          <Col>
            <Button onClick={handleCancel}>Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AntdForm;
