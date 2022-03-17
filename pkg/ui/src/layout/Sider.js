import React from 'react';
import PropTypes from 'prop-types';

import { Layout, Menu } from 'antd';
import {
  HomeOutlined
} from '@ant-design/icons';

import {
    withRouter,
    Link
  } from "react-router-dom";
import { Routes } from '../Routes';

const { Header, Content, Sider } = Layout;

class SiderLayout extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    this.setState({ collapsed })
  };

  render() {
    const { collapsed } = this.state
    const { location } = this.props

    const logoStyle = {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
      paddingLeft: 20
    }

    let pathComponents = location.pathname.split("/")
    let selectedMenu = location.pathname
    if (pathComponents.length > 1) {
      selectedMenu = "/" + pathComponents[1]
    }

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <Header className="site-layout-background" style={{ padding: 0 }}>
            <div style={logoStyle}>Vipien</div>
          </Header>
          <Menu theme="dark" 
                  defaultSelectedKeys={['/']}
                  selectedKeys={[selectedMenu]}
                  mode="inline">
            <Menu.Item key="/" icon={<HomeOutlined />}>
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="/namespaces" icon={<HomeOutlined />}>
              <Link to="/namespaces">Namespaces</Link>
            </Menu.Item>
            <Menu.Item key="/peers" icon={<HomeOutlined />}>
              <Link to="/peers">Peers</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }} />
          <Content style={{ margin: '0 16px' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <Routes />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export const SiderLayoutWithRouter = withRouter(SiderLayout)
