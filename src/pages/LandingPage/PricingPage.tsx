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
  
  // Discount configuration - Change this value to adjust discount percentage
  const DISCOUNT_PERCENTAGE = 20; // Change to 0, 10, 20, 30, etc.
  
  // Function to calculate discounted price
  const calculateDiscountedPrice = (originalPrice: number): number => {
    if (DISCOUNT_PERCENTAGE <= 0) return originalPrice;
    return Math.floor(originalPrice * (1 - DISCOUNT_PERCENTAGE / 100));
  };

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

  // Original pricing data
  const originalPricingData = {
    starter: { monthly: 249, annual: 2499 },
    professional: { monthly: 699, annual: 6999 },
    business: { monthly: 999, annual: 9999 }
  };

  const pricingPlans = [
    {
      name: "Free",
      icon: <RocketOutlined />,
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Perfect for trying out Subriva Billing",
      features: [
        "Up to 100 invoices/month",
        "1 user account",
        "Basic reporting",
        "Email support",
        "Mobile app access"
      ],
      popular: false,
      color: "#1890ff",
      buttonText: "Start Free"
    },
    {
      name: "Starter",
      icon: <StarOutlined />,
      monthlyPrice: calculateDiscountedPrice(originalPricingData.starter.monthly),
      annualPrice: calculateDiscountedPrice(originalPricingData.starter.annual),
      originalMonthlyPrice: originalPricingData.starter.monthly,
      originalAnnualPrice: originalPricingData.starter.annual,
      description: "For freelancers and small shops",
      features: [
        "Up to 500 invoices/month",
        "1 user account",
        "Custom templates",
        "Mobile app access",
        "Payment tracking & tax calculations"
      ],
      popular: false,
      color: "#faad14",
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      icon: <CrownOutlined />,
      monthlyPrice: calculateDiscountedPrice(originalPricingData.professional.monthly),
      annualPrice: calculateDiscountedPrice(originalPricingData.professional.annual),
      originalMonthlyPrice: originalPricingData.professional.monthly,
      originalAnnualPrice: originalPricingData.professional.annual,
      description: "Ideal for growing businesses",
      features: [
        "Unlimited invoices",
        "Up to 3 user accounts",
        "Inventory management",
        "Advanced analytics & reports",
        "Automated reminders",
        "Customer portal",
        "Priority email & chat support"
      ],
      popular: true,
      color: "#52c41a",
      buttonText: "Most Popular"
    },
    {
      name: "Business",
      icon: <GoldOutlined />,
      monthlyPrice: calculateDiscountedPrice(originalPricingData.business.monthly),
      annualPrice: calculateDiscountedPrice(originalPricingData.business.annual),
      originalMonthlyPrice: originalPricingData.business.monthly,
      originalAnnualPrice: originalPricingData.business.annual,
      description: "For established businesses with teams",
      features: [
        "All Professional features",
        "Up to 5 user accounts",
        "Multi-location support",
        "Advanced team collaboration",
        "Custom workflows",
        "API access & integrations",
        "Enhanced security features",
        "Priority support"
      ],
      popular: false,
      color: "#722ed1",
      buttonText: "Choose Business"
    },
    {
      name: "Enterprise",
      icon: <CheckCircleOutlined />,
      monthlyPrice: null,
      annualPrice: null,
      description: "For large organizations requiring advanced solutions",
      features: [
        "Unlimited users & accounts",
        "Custom integrations & development",
        "White-label solution",
        "Advanced security & compliance",
        "Dedicated support manager",
        "SLA guarantee",
        "On-premise deployment options",
        "24/7 phone support"
      ],
      popular: false,
      color: "#eb2f96",
      buttonText: "Contact Sales"
    }
  ];
  
  

  // Original add-on pricing data
  const originalAddonData = {
    additionalUsers: 199,
    advancedAnalytics: 299,
    prioritySupport: 499,
    whiteLabel: 999
  };

  const addOns = [
    {
      name: "Additional Users",
      price: `₹${calculateDiscountedPrice(originalAddonData.additionalUsers)}/month per user`,
      originalPrice: `₹${originalAddonData.additionalUsers}/month per user`,
      description: "Add more team members beyond your plan limit"
    },
    {
      name: "Advanced Analytics",
      price: `₹${calculateDiscountedPrice(originalAddonData.advancedAnalytics)}/month`,
      originalPrice: `₹${originalAddonData.advancedAnalytics}/month`,
      description: "Unlock deeper insights with advanced reporting & dashboards"
    },
    {
      name: "Custom Integrations",
      price: "Contact us",
      originalPrice: "Contact us",
      description: "Connect Subriva Billing with your existing business tools"
    },
    {
      name: "Priority Phone Support",
      price: `₹${calculateDiscountedPrice(originalAddonData.prioritySupport)}/month`,
      originalPrice: `₹${originalAddonData.prioritySupport}/month`,
      description: "Get faster resolutions with priority 24/7 phone support"
    },
    {
      name: "White-label Branding",
      price: `₹${calculateDiscountedPrice(originalAddonData.whiteLabel)}/month`,
      originalPrice: `₹${originalAddonData.whiteLabel}/month`,
      description: "Use your own brand, logo, and custom domain"
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
                      {plan.monthlyPrice !== null ? (
                        <>
                          {plan.originalMonthlyPrice && (
                            <div className={styles.originalPriceContainer}>
                              <Text className={styles.originalPrice}>
                                ₹{isAnnual ? plan.originalAnnualPrice : plan.originalMonthlyPrice}
                                {isAnnual ? '/year' : '/month'}
                              </Text>
                              <Badge count={`${DISCOUNT_PERCENTAGE}% OFF`} style={{ backgroundColor: '#ff4d4f', marginLeft: '8px' }} />
                            </div>
                          )}
                          <div className={styles.priceContainer}>
                            <span className={styles.currency}>₹</span>
                            <span className={styles.price}>
                              {isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                            </span>
                            <span className={styles.period}>/month</span>
                          </div>
                          {isAnnual && (
                            <Text className={styles.annualSavings}>
                              ₹{plan.annualPrice} billed annually (Save ₹{(plan.monthlyPrice * 12) - plan.annualPrice})
                            </Text>
                          )}
                        </>
                      ) : (
                        <div className={styles.customPrice}>
                          <Text className={styles.customPriceText}>Custom Pricing</Text>
                          <Text className={styles.customPriceSubtext}>Contact us for details</Text>
                        </div>
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
                      onClick={() => {
                        if (plan.buttonText === "Start Free" || plan.buttonText === "Get Started" || plan.buttonText === "Most Popular" || plan.buttonText === "Choose Business" || plan.buttonText === "Choose Growth") {
                          navigate('/tenant-signup');
                        } else if (plan.buttonText === "Contact Sales") {
                          // Handle contact sales
                          window.open('mailto:sales@probilldesk.com?subject=Enterprise Plan Inquiry');
                        }
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
                    {addon.originalPrice !== addon.price ? (
                      <div className={styles.addonPricing}>
                        <Text className={styles.originalAddonPrice}>{addon.originalPrice}</Text>
                        <Text className={styles.addonPrice}>{addon.price}</Text>
                        <Badge count={`${DISCOUNT_PERCENTAGE}% OFF`} style={{ backgroundColor: '#ff4d4f', marginLeft: '8px' }} />
                      </div>
                    ) : (
                      <Text className={styles.addonPrice}>{addon.price}</Text>
                    )}
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
              onClick={() => navigate('/tenant-signup')}
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
