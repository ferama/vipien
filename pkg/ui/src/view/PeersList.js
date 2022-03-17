import React, { Fragment } from 'react';
import { http } from '../lib/Axios'
import { PageHeader, Table } from 'antd';
import { CreateForm } from '../components/CreateForm';
import { Button, Divider, Row, Col } from 'antd';
import {
    Link
  } from "react-router-dom";
import {
    DeleteOutlined,
  } from '@ant-design/icons';

export class PeersList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            peers: [],
            showForm: false
        }
    }
    async componentDidMount() {
        await this.updateState()
    }

    updateState = async () => {
        let data
        try {
            data = await http.get("peers")
        } catch {
            return
        }
        if (data.data === null) return

        const peers = []
        let i = 0
        for (let n of data.data.peers) {
            let p = {}
            p["key"] = ++i
            p["name"] = n
            peers.push(p)
        }
        this.setState({
            "peers": peers
        })
    }

    onNewClick = () => {
        const showForm = !this.state.showForm
        this.setState({
            showForm: showForm
        })
    }

    onFormFinish = async (values) => {
        await http.post('peers', values)
        this.setState({
            showForm: false
        })
        await this.updateState()
    }

    onDelete = async (r) => {
        await http.delete(`peers/${r.name}`)
        await this.updateState()
    }

    render () {
        const columns = [
            {
                title: 'Peers',
                dataIndex: 'name',
                key: '1',
                render: item => {
                    const path = `/peers/${item}`
                    return (<Link to={path}>{item}</Link>)
                }
            },
            {
                title: 'Action',
                key: '2',
                render: (_, record) =>  (
                    <React.Fragment>
                        <Button onClick={ (e) => this.onDelete(record)} >
                        <DeleteOutlined /> 
                        </Button>
                    </React.Fragment>
                ),
            }
        ]
        return (
            <Fragment>
                <Row>
                    <Col flex="auto">
                        <PageHeader title="Peers" />
                    </Col>    
                    <Col flex="100px">
                        <Button type="primary" onClick={this.onNewClick}>New Peer</Button>
                    </Col>    
                </Row>
                {this.state.showForm?(
                    <React.Fragment>
                        <CreateForm showForward={true} onFinish={this.onFormFinish}/>
                        <Divider />
                    </React.Fragment>
                ): ""}
                <Table 
                    columns={columns} 
                    dataSource={this.state.peers} />
            </Fragment>
        )
    }
} 