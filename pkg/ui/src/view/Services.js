import React from 'react'
import { http } from '../lib/Axios'
import { Table, PageHeader } from 'antd';
import { Row, Col } from 'antd';

export class Services extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            servicices: [],
        }
    }

    async componentDidMount() {
        await this.getAll()
    }

    getAll = async () => {
        let data
        const namespace = this.props.match.params.namespace
        try {
            data = await http.get(`k8s/ns/${namespace}/svc`)
        } catch {
            return
        }
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
            let httpUrls = []
            for (let port of s.ports) {
                if (port.isHttp) {
                    httpUrls.push(`http://${s.name}.${namespace}.svc.cluster.local:${port.port}`)
                }
            }
            s["httpUrls"] = httpUrls
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
            {
                title: 'Ports',
                dataIndex: 'ports',
                key: '2',
                render: (_, record) => {
                    let ports = ""
                    for (let p of record.ports) {
                        ports += `${p.port}/${p.protocol} `
                    }
                    return ports
                }
            },
            {
                title: 'Urls',
                dataIndex: 'httpUrls',
                key: '3',
                render: (_, record) => {
                    return record.httpUrls.map( url => 
                        <div><a rel="noreferrer" target="_blank" href={url}>{url}</a></div>
                    )
                }
            }
        ]
        const title = `${this.props.match.params.namespace} / services`
        return (
            <React.Fragment>
                <Row>
                    <Col flex="auto">
                        <PageHeader title={title} />
                    </Col>    
                </Row>
                <Table columns={columns} dataSource={this.state.services} />
            </React.Fragment>
        )
    }
} 