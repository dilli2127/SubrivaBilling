import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  message,
  Divider,
  Avatar,
  Tag
} from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  GlobalOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ContactUsPage.module.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  inquiryType: string;
}

const ContactUsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedInquiryType, setSelectedInquiryType] = useState<string>('');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const navItems = ['back', 'contact-form', 'submit-btn', 'features', 'pricing', 'customers', 'login'];
        const currentFocus = document.activeElement?.getAttribute('data-nav');
        const currentIndex = navItems.indexOf(currentFocus || 'back');
        const nextIndex = (currentIndex + 1) % navItems.length;
        const nextElement = document.querySelector(`[data-nav="${navItems[nextIndex]}"]`);
        if (nextElement) {
          (nextElement as HTMLElement).focus();
        }
      }
      if (e.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.getAttribute('data-nav') === 'submit-btn') {
          handleSubmit();
        }
      }
      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Thank you for your message! We\'ll get back to you within 24 hours.');
      form.resetFields();
      setSelectedInquiryType('');
    } catch (error) {
      message.error('Please fill in all required fields.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined className={styles.contactIcon} />,
      title: 'Phone',
      details: ['+91 9677894094', '+91 9843497528'],
      color: '#1890ff'
    },
    {
      icon: <MailOutlined className={styles.contactIcon} />,
      title: 'Email',
      details: ['support@subrivabilling.com', 'sales@subrivabilling.com','subrivabilling@gmail.com'],
      color: '#52c41a'
    },
    {
      icon: <EnvironmentOutlined className={styles.contactIcon} />,
      title: 'Address',
      details: ['C.G.N Knadigai,V.K.R Puram (Post) Thiruvallur -630 205,Tamil Nadu,India'],
      color: '#fa541c'
    },
    {
      icon: <ClockCircleOutlined className={styles.contactIcon} />,
      title: 'Business Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM', 'Sunday: Closed'],
      color: '#722ed1'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: <MessageOutlined /> },
    { value: 'support', label: 'Technical Support', icon: <CustomerServiceOutlined /> },
    { value: 'sales', label: 'Sales & Pricing', icon: <GlobalOutlined /> },
    { value: 'partnership', label: 'Partnership', icon: <StarOutlined /> }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'ABC Pharmaceuticals',
      content: 'Excellent support team! They helped us set up our billing system in just 2 days.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      company: 'XYZ Medical Store',
      content: 'The customer service is outstanding. Quick responses and helpful solutions.',
      rating: 5
    }
  ];

  return (
    <div className={styles.contactPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <Title level={1} className={styles.pageTitle}>
            Get in Touch
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            We're here to help you with your billing needs. Reach out to us anytime!
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <Row gutter={[48, 48]}>
          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card className={styles.contactFormCard}>
              <div className={styles.formHeader}>
                <Title level={3} className={styles.formTitle}>
                  Send us a Message
                </Title>
                <Paragraph className={styles.formSubtitle}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </Paragraph>
              </div>

              <Form
                form={form}
                layout="vertical"
                className={styles.contactForm}
                data-nav="contact-form"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please enter your name!' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Enter your full name"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter your email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                        placeholder="Enter your email address"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please enter your phone number!' }]}
                    >
                      <Input 
                        prefix={<PhoneOutlined />} 
                        placeholder="Enter your phone number"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="company"
                      label="Company Name"
                    >
                      <Input 
                        prefix={<GlobalOutlined />} 
                        placeholder="Enter your company name"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="inquiryType"
                  label="Inquiry Type"
                  rules={[{ required: true, message: 'Please select inquiry type!' }]}
                >
                  <div className={styles.inquiryTypes}>
                    {inquiryTypes.map((type) => (
                      <Tag.CheckableTag
                        key={type.value}
                        className={styles.inquiryTag}
                        checked={selectedInquiryType === type.value}
                        onChange={(checked) => {
                          if (checked) {
                            setSelectedInquiryType(type.value);
                            form.setFieldsValue({ inquiryType: type.value });
                          } else {
                            setSelectedInquiryType('');
                            form.setFieldsValue({ inquiryType: '' });
                          }
                        }}
                      >
                        <Space>
                          {type.icon}
                          {type.label}
                        </Space>
                      </Tag.CheckableTag>
                    ))}
                  </div>
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please enter subject!' }]}
                >
                  <Input 
                    placeholder="What's this about?"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[{ required: true, message: 'Please enter your message!' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    icon={<SendOutlined />}
                    data-nav="submit-btn"
                    tabIndex={0}
                  >
                    Send Message
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} lg={10}>
            <div className={styles.contactInfoSection}>
              <Title level={3} className={styles.infoTitle}>
                Contact Information
              </Title>
              <Paragraph className={styles.infoSubtitle}>
                Multiple ways to reach us for your convenience
              </Paragraph>

              <div className={styles.contactInfoGrid}>
                {contactInfo.map((info, index) => (
                  <Card key={index} className={styles.contactInfoCard} hoverable>
                    <div className={styles.infoCardContent}>
                      <div className={styles.infoIcon} style={{ color: info.color }}>
                        {info.icon}
                      </div>
                      <div className={styles.infoDetails}>
                        <Title level={5} className={styles.infoCardTitle}>
                          {info.title}
                        </Title>
                        {info.details.map((detail, detailIndex) => (
                          <Text key={detailIndex} className={styles.infoDetail}>
                            {detail}
                          </Text>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Testimonials */}
              <div className={styles.testimonialsSection}>
                <Title level={4} className={styles.testimonialsTitle}>
                  What Our Customers Say
                </Title>
                <div className={styles.testimonials}>
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className={styles.testimonialCard}>
                      <div className={styles.testimonialContent}>
                        <div className={styles.testimonialRating}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <StarOutlined key={i} className={styles.starIcon} />
                          ))}
                        </div>
                        <Paragraph className={styles.testimonialText}>
                          "{testimonial.content}"
                        </Paragraph>
                        <div className={styles.testimonialAuthor}>
                          <Avatar size="small" icon={<UserOutlined />} />
                          <div className={styles.authorInfo}>
                            <Text strong>{testimonial.name}</Text>
                            <Text type="secondary" className={styles.authorCompany}>
                              {testimonial.company}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <Title level={2} className={styles.faqTitle}>
            Frequently Asked Questions
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className={styles.faqCard}>
                <Title level={4}>How quickly do you respond to inquiries?</Title>
                <Paragraph>
                  We typically respond to all inquiries within 24 hours during business days. 
                  For urgent matters, please call us directly.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.faqCard}>
                <Title level={4}>Do you offer phone support?</Title>
                <Paragraph>
                  Yes! We provide phone support during business hours. 
                  You can reach us at +91 98765 43210 for immediate assistance.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.faqCard}>
                <Title level={4}>Can I schedule a demo?</Title>
                <Paragraph>
                  Absolutely! Contact our sales team to schedule a personalized demo 
                  of our billing system tailored to your business needs.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.faqCard}>
                <Title level={4}>What's included in technical support?</Title>
                <Paragraph>
                  Our technical support includes system setup, training, troubleshooting, 
                  and ongoing maintenance assistance for your billing system.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
