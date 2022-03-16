import React from 'react'
import { http } from '../lib/Axios'
import { Table, PageHeader } from 'antd';
import { Row, Col, Button } from 'antd';
import {
    DeleteOutlined,
  } from '@ant-design/icons';

export class Services extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            servicices: [],
        }
        this.intervalHandler = null
    }

    async componentDidMount() {
        await this.getAll()
        this.intervalHandler = setInterval(this.getAll, 5000)
    }
    componentWillUnmount() {
        clearInterval(this.intervalHandler)
    }

    getAll = async () => {
        let data
        const namespace = this.props.match.params.namespace
        try {
            data = await http.get(`k8s/ns/${namespace}/svc`)
        } catch {
            return
        }
        console.log(data.data)
        if (data.data === null) {
            this.setState({
                services: []
            })
            return
        }
        
        const svcs = []
        let i = 0
        for (let s of data.data.services) {
            s["key"] = ++i
            svcs.push(s)
        }

        this.setState({
            services: svcs
        })
    }

    render () {
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: '1',
            },
            // {
            //     title: 'Action',
            //     key: '7',
            //     render: (_, record) =>  (
            //         <React.Fragment>
            //             {record.IsStoppable?(
            //                 <Button onClick={ (e) => this.onDelete(record.Id)} >
            //                 <DeleteOutlined /> 
            //                 </Button>
            //             ):""}
            //         </React.Fragment>
            //     ),
            // }
        ]
        return (
            <React.Fragment>
                <Row>
                    <Col flex="auto">
                        <PageHeader title="Services" />
                    </Col>    
                </Row>
                <Table columns={columns} dataSource={this.state.services} />
            </React.Fragment>
        )
    }
} 