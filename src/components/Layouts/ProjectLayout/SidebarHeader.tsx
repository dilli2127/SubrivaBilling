import styled from "@emotion/styled";
import React, { useEffect } from "react";
import { Typography } from "../../../components/Sidebar/Typography";
import { useNavigate } from "react-router-dom";
import { useDynamicSelector } from "../../../services/redux";

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  navigatePath?: string;
  ProjectTitle: string;
}

// Styled components for Sidebar Header
const StyledSidebarHeader = styled.div`
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #f7f9fc;
  border-bottom: 1px solid #e0e0e0;

  > div {
    width: 100%;
    overflow: hidden;
    text-align: center;
  }
`;

const BackContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #0073e6;
  background-color: #e6f7ff;
  border-radius: 8px;
  margin: 10px;

  &:hover {
    background-color: #d0ebff;
    color: #005bb5;
  }
`;

const BackArrow = styled.span`
  margin-right: 8px;
  font-size: 20px;
`;

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  ProjectTitle,
  navigatePath = "/projects-dashboard",
  ...rest
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(navigatePath);
  };

  return (
    <>
      {/* Back Button */}
      <BackContainer onClick={handleClick}>
        <BackArrow>&#8592;</BackArrow>
        Back To Projects
      </BackContainer>

      {/* Sidebar Header */}
      <StyledSidebarHeader {...rest}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          // onClick={handleClick}
        >
          <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
            {ProjectTitle || "Project Name"}
          </Typography>
        </div>
      </StyledSidebarHeader>
    </>
  );
};
