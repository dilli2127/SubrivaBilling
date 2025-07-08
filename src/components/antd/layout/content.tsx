import { Layout } from 'antd';
import React from 'react'
import { Outlet } from 'react-router-dom';
const Content = ({ children }: any) => {
    const { Content: AntdContent } = Layout;

    return (
        <AntdContent
        >
            <Outlet />
        </AntdContent>
    )
}

export default Content
