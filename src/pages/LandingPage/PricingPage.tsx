import React, { useEffect } from 'react';
import { Button, Typography, Card, Row, Col, Space, Switch, Badge } from 'antd';
import { 
  CheckCircleOutlined,
  StarOutlined,
  CrownOutlined,
  RocketOutlined,
  GoldOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './pricingPage.module.css';

const { Title, Paragraph, Text } = Typography;

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = React.useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const navItems = ['back', 'features', 'pricing', 'customers', 'login'];
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
        if (activeElement) {
          activeElement.click();
        }
      }
      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const pricingPlans = [
    {
      name: "Starter",
      icon: <RocketOutlined />,
      monthlyPrice: 29,
      annualPrice: 290,
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 100 invoices/month",
        "Basic reporting & analytics",
        "Email support",
        "Mobile app access",
        "1 user account",
        "Basic templates",
        "Payment tracking",
        "Tax calculations"
      ],
      popular: false,
      color: "#1890ff",
      buttonText: "Start Free Trial"
    },
    {
      name: "Professional",
      icon: <CrownOutlined />,
      monthlyPrice: 79,
      annualPrice: 790,
      description: "Ideal for growing businesses",
      features: [
        "Unlimited invoices",
        "Advanced analytics & reports",
        "Priority support",
        "API access",
        "Up to 5 user accounts",
        "Custom branding",
        "Advanced templates",
        "Automated reminders",
        "Multi-currency support",
        "Inventory management",
        "Customer portal",
        "Advanced tax handling"
      ],
      popular: true,
      color: "#52c41a",
      buttonText: "Most Popular"
    },
    {
      name: "Enterprise",
      icon: <GoldOutlined />,
      monthlyPrice: 199,
      annualPrice: 1990,
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Dedicated support manager",
        "Custom integrations",
        "Advanced security features",
        "Unlimited users",
        "White-label solution",
        "Custom development",
        "SLA guarantee",
        "Advanced reporting",
        "Multi-location support",
        "Custom workflows",
        "24/7 phone support"
      ],
      popular: false,
      color: "#722ed1",
      buttonText: "Contact Sales"
    }
  ];

  const addOns = [
    {
      name: "Additional Users",
      price: "$10/month per user",
      description: "Add more team members to your account"
    },
    {
      name: "Advanced Analytics",
      price: "$25/month",
      description: "Get deeper insights with advanced reporting tools"
    },
    {
      name: "Custom Integrations",
      price: "Contact us",
      description: "Integrate with your existing business tools"
    }
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial for all plans. No credit card required."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
    }
  ];

  return (
    <div className={styles.pricingPage}>

      {/* Main Content */}
      <div className={styles.pricingContent}>
        {/* Header */}
        <div className={styles.pricingHeader}>
          <Title level={1} className={styles.pageTitle}>Simple Pricing</Title>
          <Paragraph className={styles.pageSubtitle}>
            Choose the perfect plan for your business needs. All plans include our core features.
          </Paragraph>
          
          {/* Billing Toggle */}
          <div className={styles.billingToggle}>
            <Text className={!isAnnual ? styles.active : ''}>Monthly</Text>
            <Switch 
              checked={isAnnual} 
              onChange={setIsAnnual}
              className={styles.toggleSwitch}
            />
            <Text className={isAnnual ? styles.active : ''}>
              Annual <Badge count="Save 20%" style={{ backgroundColor: '#52c41a' }} />
            </Text>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={styles.pricingCards}>
          <Row gutter={[24, 24]} justify="center" className={styles.pricingGrid}>
            {pricingPlans.map((plan, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
                  hoverable
                >
                  {plan.popular && (
                    <div className={styles.popularBadge}>
                      <StarOutlined /> Most Popular
                    </div>
                  )}
                  <div className={styles.pricingContentCard}>
                    <div className={styles.planHeader}>
                      <div className={styles.planIcon}>
                        {plan.icon}
                      </div>
                      <Title level={3} className={styles.planName}>{plan.name}</Title>
                      <Paragraph className={styles.planDescription}>{plan.description}</Paragraph>
                    </div>
                    
                    <div className={styles.planPricing}>
                      <div className={styles.priceContainer}>
                        <span className={styles.currency}>$</span>
                        <span className={styles.price}>
                          {isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                        </span>
                        <span className={styles.period}>/month</span>
                      </div>
                      {isAnnual && (
                        <Text className={styles.annualSavings}>
                          ${plan.annualPrice} billed annually (Save ${(plan.monthlyPrice * 12) - plan.annualPrice})
                        </Text>
                      )}
                    </div>

                    <ul className={styles.planFeatures}>
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={styles.featureItem}>
                          <CheckCircleOutlined className={styles.checkIcon} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      type={plan.popular ? 'primary' : 'default'}
                      size="large"
                      block
                      className={styles.planButton}
                      style={{ 
                        background: plan.popular ? `linear-gradient(135deg, ${plan.color}, #1890ff)` : undefined,
                        borderColor: plan.color
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Add-ons Section */}
        <div className={styles.addonsSection}>
          <Title level={2} className={styles.sectionTitle}>Add-ons & Extras</Title>
          <Row gutter={[24, 24]} className={styles.addonsGrid}>
            {addOns.map((addon, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card className={styles.addonCard} hoverable>
                  <div className={styles.addonContent}>
                    <Title level={4} className={styles.addonName}>{addon.name}</Title>
                    <Text className={styles.addonPrice}>{addon.price}</Text>
                    <Paragraph className={styles.addonDescription}>{addon.description}</Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <Title level={2} className={styles.sectionTitle}>Frequently Asked Questions</Title>
          <Row gutter={[24, 24]} className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card className={styles.faqCard}>
                  <div className={styles.faqContent}>
                    <Title level={4} className={styles.faqQuestion}>{faq.question}</Title>
                    <Paragraph className={styles.faqAnswer}>{faq.answer}</Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA Section */}
        <div className={styles.pricingCta}>
          <Title level={2} className={styles.ctaTitle}>Ready to Get Started?</Title>
          <Paragraph className={styles.ctaSubtitle}>
            Join thousands of businesses already using Subriva Billing
          </Paragraph>
          <Space size="large" className={styles.ctaActions}>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/login')}
              className={styles.ctaButton}
              tabIndex={0}
            >
              Start Free Trial
            </Button>
            <Button 
              size="large" 
              className={styles.contactButton}
              tabIndex={0}
            >
              <PhoneOutlined /> Contact Sales
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
