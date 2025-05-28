import React from "react";
import { Card, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

// Function to generate random pastel gradient colors
const generateRandomPastelGradient = (): string => {
  const colors = [
    "#FF6F61", // Darker Coral
    "#FFB74D", // Darker Yellow
    "#B2FF59", // Darker Light Green
    "#64B5F6", // Darker Light Blue
    "#BA68C8", // Darker Purple
    "#FF8A65", // Darker Salmon
  ];
  const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
  const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(45deg, ${randomColor1}, ${randomColor2})`;
};

// Your audit types with descriptions
interface AuditType {
  title: string;
  description: number;
}

const auditTypes: AuditType[] = [
  {
    title: "Total E-Invites",
    description:0,
  },
  {
    title: "Today Clients",
    description:0,
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      {/* Heading */}
      <Title
        level={2}
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontWeight: "700",
          fontSize: "28px",
        }}
      >
        DashBoard
      </Title>

      <Row gutter={[16, 16]}>
        {auditTypes.map((audit, index) => (
          <Col span={8} key={index}>
            <Card
              bordered={false}
              style={{
                background: generateRandomPastelGradient(),
                color: "#FFFFFF",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                padding: "20px",
                cursor: "pointer",
              }}
              // onClick={() => handleCardClick(audit.title)}
            >
              {/* Centered title with increased size */}
              <Title
                level={3}
                style={{
                  textAlign: "center",
                  fontSize: "24px",
                  margin: "0",
                  fontWeight: "bold",
                }}
              >
                {audit.title}
              </Title>
              <br />
              <p
                style={{
                  fontSize: "18px",
                  margin: "0",
                  textAlign: "center",
                  flex: "1",
                  fontWeight: "bold",
                }}
              >
                {audit.description}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomePage;
