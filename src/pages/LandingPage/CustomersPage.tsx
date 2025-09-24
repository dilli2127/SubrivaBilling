import React, { useEffect } from 'react';
import { Button, Typography, Card, Row, Col, Space, Avatar, Rate, Badge, Statistic } from 'antd';
import { 
  StarOutlined,
  UserOutlined,
  TrophyOutlined,
  HeartOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './CustomersPage.module.css';

const { Title, Paragraph, Text } = Typography;

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();

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

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechStart Inc.",
      role: "CEO",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
      text: "Subriva Billing transformed our invoicing process. We've saved 10+ hours per week and our clients love the professional invoices.",
      industry: "Technology",
      companySize: "10-50 employees",
      featured: true
    },
    {
      name: "Michael Chen",
      company: "Retail Plus",
      role: "Operations Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      rating: 5,
      text: "The analytics dashboard gives us insights we never had before. Our revenue tracking is now crystal clear.",
      industry: "Retail",
      companySize: "50-200 employees",
      featured: false
    },
    {
      name: "Emily Rodriguez",
      company: "Service Solutions",
      role: "Finance Director",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      rating: 5,
      text: "The multi-user feature is fantastic. Our team can collaborate seamlessly while maintaining security.",
      industry: "Services",
      companySize: "20-100 employees",
      featured: true
    },
    {
      name: "David Kim",
      company: "Creative Agency",
      role: "Founder",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      rating: 5,
      text: "Beautiful invoice templates that match our brand. Our clients are impressed with the professional look.",
      industry: "Creative",
      companySize: "5-20 employees",
      featured: false
    },
    {
      name: "Lisa Thompson",
      company: "HealthCare Plus",
      role: "Administrator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      rating: 5,
      text: "The mobile app is a game-changer. I can manage invoices and payments on the go.",
      industry: "Healthcare",
      companySize: "100+ employees",
      featured: true
    },
    {
      name: "James Wilson",
      company: "Construction Co.",
      role: "Project Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      rating: 5,
      text: "Perfect for our construction business. Easy to track project costs and generate client invoices.",
      industry: "Construction",
      companySize: "50-200 employees",
      featured: false
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers", icon: <UserOutlined /> },
    { number: "4.9/5", label: "Average Rating", icon: <StarOutlined /> },
    { number: "99.9%", label: "Uptime", icon: <TrophyOutlined /> },
    { number: "24/7", label: "Support", icon: <HeartOutlined /> }
  ];

  const industries = [
    { name: "Technology", count: "2,500+", color: "#1890ff" },
    { name: "Retail", count: "1,800+", color: "#52c41a" },
    { name: "Services", count: "2,200+", color: "#722ed1" },
    { name: "Healthcare", count: "1,500+", color: "#fa541c" },
    { name: "Construction", count: "1,200+", color: "#13c2c2" },
    { name: "Creative", count: "800+", color: "#eb2f96" }
  ];

  const benefits = [
    {
      icon: <CheckCircleOutlined />,
      title: "Increased Efficiency",
      description: "Save 10+ hours per week on billing tasks"
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Professional Image",
      description: "Impress clients with beautiful invoices"
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Better Cash Flow",
      description: "Faster payments with automated reminders"
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Easy Integration",
      description: "Works with your existing business tools"
    }
  ];

  return (
    <div className={styles.customersPage}>

      {/* Main Content */}
      <div className={styles.customersContent}>
        {/* Header */}
        <div className={styles.customersHeader}>
          <Title level={1} className={styles.pageTitle}>What Our Customers Say</Title>
          <Paragraph className={styles.pageSubtitle}>
            Join thousands of satisfied businesses using Subriva Billing to grow their success
          </Paragraph>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <Row gutter={[24, 24]} className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className={styles.statCard} hoverable>
                  <div className={styles.statContent}>
                    <div className={styles.statIcon}>
                      {stat.icon}
                    </div>
                    <Statistic
                      title={stat.label}
                      value={stat.number}
                      valueStyle={{ color: '#1890ff', fontSize: '2rem', fontWeight: 700 }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Featured Testimonials */}
        <div className={styles.featuredTestimonials}>
          <Title level={2} className={styles.sectionTitle}>Featured Customer Stories</Title>
          <Row gutter={[24, 24]} className={styles.testimonialsGrid}>
            {testimonials.filter(t => t.featured).map((testimonial, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card className={`${styles.testimonialCard} ${styles.featured}`} hoverable>
                  <div className={styles.testimonialContent}>
                    <div className={styles.testimonialHeader}>
                      <Avatar 
                        size={64} 
                        src={testimonial.avatar}
                        className={styles.testimonialAvatar}
                      />
                      <div className={styles.testimonialInfo}>
                        <Title level={5} className={styles.testimonialName}>{testimonial.name}</Title>
                        <Text className={styles.testimonialRole}>{testimonial.role}</Text>
                        <Text className={styles.testimonialCompany}>{testimonial.company}</Text>
                        <div className={styles.testimonialMeta}>
                          <Badge color="blue" text={testimonial.industry} />
                          <Text className={styles.companySize}>{testimonial.companySize}</Text>
                        </div>
                      </div>
                    </div>
                    <Rate 
                      disabled 
                      defaultValue={testimonial.rating} 
                      className={styles.testimonialRating}
                    />
                    <Paragraph className={styles.testimonialText}>
                      "{testimonial.text}"
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* All Testimonials */}
        <div className={styles.allTestimonials}>
          <Title level={2} className={styles.sectionTitle}>More Customer Reviews</Title>
          <Row gutter={[24, 24]} className={styles.testimonialsGrid}>
            {testimonials.filter(t => !t.featured).map((testimonial, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card className={styles.testimonialCard} hoverable>
                  <div className={styles.testimonialContent}>
                    <div className={styles.testimonialHeader}>
                      <Avatar 
                        size={48} 
                        src={testimonial.avatar}
                        className={styles.testimonialAvatar}
                      />
                      <div className={styles.testimonialInfo}>
                        <Title level={5} className={styles.testimonialName}>{testimonial.name}</Title>
                        <Text className={styles.testimonialRole}>{testimonial.role}</Text>
                        <Text className={styles.testimonialCompany}>{testimonial.company}</Text>
                      </div>
                    </div>
                    <Rate 
                      disabled 
                      defaultValue={testimonial.rating} 
                      className={styles.testimonialRating}
                    />
                    <Paragraph className={styles.testimonialText}>
                      "{testimonial.text}"
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Industries Section */}
        <div className={styles.industriesSection}>
          <Title level={2} className={styles.sectionTitle}>Trusted by Businesses Across Industries</Title>
          <Row gutter={[16, 16]} className={styles.industriesGrid}>
            {industries.map((industry, index) => (
              <Col xs={12} sm={8} lg={4} key={index}>
                <Card className={styles.industryCard} hoverable>
                  <div className={styles.industryContent}>
                    <div 
                      className={styles.industryColor} 
                      style={{ backgroundColor: industry.color }}
                    />
                    <Text className={styles.industryName}>{industry.name}</Text>
                    <Text className={styles.industryCount}>{industry.count}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Benefits Section */}
        <div className={styles.benefitsSection}>
          <Title level={2} className={styles.sectionTitle}>Why Customers Choose Us</Title>
          <Row gutter={[24, 24]} className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className={styles.benefitCard} hoverable>
                  <div className={styles.benefitContent}>
                    <div className={styles.benefitIcon}>
                      {benefit.icon}
                    </div>
                    <Title level={5} className={styles.benefitTitle}>{benefit.title}</Title>
                    <Paragraph className={styles.benefitDescription}>{benefit.description}</Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA Section */}
        <div className={styles.customersCta}>
          <Title level={2} className={styles.ctaTitle}>Ready to Join Our Happy Customers?</Title>
          <Paragraph className={styles.ctaSubtitle}>
            Start your free trial today and experience the difference
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

export default CustomersPage;
